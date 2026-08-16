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
  const [activeMobileColumn, setActiveMobileColumn] = useState<TaskStatus | 'ALL'>('ALL');
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

  const displayedColumns = activeMobileColumn === 'ALL'
    ? COLUMNS
    : COLUMNS.filter((col) => col.status === activeMobileColumn);

  return (
    <div className="space-y-4">
      {/* Mobile Column Quick Switcher Tab Bar */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveMobileColumn('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
            activeMobileColumn === 'ALL'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Columns ({tasks.length})
        </button>
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.status).length;
          const isActive = activeMobileColumn === col.status;
          return (
            <button
              key={col.status}
              onClick={() => setActiveMobileColumn(col.status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${col.accentColor}`} />
              <span>{col.title}</span>
              <span className="text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 items-start min-h-[500px] snap-x snap-mandatory scrollbar-thin">
          {displayedColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="snap-center shrink-0 w-[85vw] sm:w-80">
                <KanbanColumn
                  status={col.status}
                  title={col.title}
                  tasks={colTasks}
                  accentColor={col.accentColor}
                  onCardClick={onCardClick}
                />
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <KanbanCard task={activeTask} onCardClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
