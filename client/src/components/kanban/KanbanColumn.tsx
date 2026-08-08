import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../types/task';
import { KanbanCard } from './KanbanCard';
import { Badge } from '../common/Badge';

export interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onCardClick: (taskId: string) => void;
  accentColor: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onCardClick,
  accentColor
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const taskIds = tasks.map((t) => t.id || t._id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-80 shrink-0 bg-slate-900/60 rounded-2xl border ${
        isOver ? 'border-brand-500 bg-slate-900/90 shadow-xl shadow-brand-500/10' : 'border-slate-800/80'
      } p-4 max-h-[80vh] transition-colors duration-150`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full ${accentColor}`} />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">{title}</h3>
        </div>
        <Badge variant="neutral" className="text-slate-400">
          {tasks.length}
        </Badge>
      </div>

      {/* Cards List Container */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[150px]">
          {tasks.length === 0 ? (
            <div className="h-full flex items-center justify-center p-6 text-center text-slate-600 text-xs border-2 border-dashed border-slate-800/60 rounded-xl">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard key={task.id || task._id} task={task} onCardClick={onCardClick} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};
