import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../types/task';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useUpdateTaskStatusMutation } from '../../services/taskApi';

export interface KanbanBoardProps {
  orgId: string;
  projectId?: string;
  initialTasks: Task[];
  onCardClick: (taskId: string) => void;
}

const COLUMNS: { status: TaskStatus; title: string; accentColor: string }[] = [
  { status: 'TODO', title: 'To Do', accentColor: 'bg-slate-500' },
  { status: 'IN_PROGRESS', title: 'In Progress', accentColor: 'bg-brand-500' },
  { status: 'IN_REVIEW', title: 'In Review', accentColor: 'bg-purple-500' },
  { status: 'DONE', title: 'Done', accentColor: 'bg-emerald-500' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  orgId,
  projectId,
  initialTasks,
  onCardClick
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = tasks.find((t) => (t.id || t._id) === taskId);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentTask = tasks.find((t) => (t.id || t._id) === activeId);
    if (!currentTask) return;

    // Determine target column status
    let targetStatus: TaskStatus | null = null;

    if (COLUMNS.some((col) => col.status === overId)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => (t.id || t._id) === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus) return;

    const oldStatus = currentTask.status;
    const isStatusChanged = oldStatus !== targetStatus;

    // Optimistic UI update
    const previousTasksState = [...tasks];

    const updatedTasks = tasks.map((t) => {
      if ((t.id || t._id) === activeId) {
        return { ...t, status: targetStatus! };
      }
      return t;
    });

    setTasks(updatedTasks);

    try {
      await updateTaskStatus({
        orgId,
        projectId: projectId || currentTask.projectId?.id || (currentTask.projectId as any)?._id || 'dummy',
        taskId: activeId,
        status: targetStatus
      }).unwrap();
    } catch (err: any) {
      // Revert optimistic update on server error
      setTasks(previousTasksState);
      alert(err.data?.message || 'Failed to update task status on server. Reverting UI.');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 items-start min-h-[500px]">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              tasks={colTasks}
              accentColor={col.accentColor}
              onCardClick={onCardClick}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <KanbanCard task={activeTask} onCardClick={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
