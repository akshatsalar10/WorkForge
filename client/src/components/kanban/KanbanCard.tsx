import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskPriority } from '../../types/task';
import { Badge } from '../common/Badge';
import { GripVertical, CheckSquare, Clock } from 'lucide-react';

export interface KanbanCardProps {
  task: Task;
  onCardClick: (taskId: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onCardClick }) => {
  const taskId = task.id || task._id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: taskId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="danger" size="sm">URGENT</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="brand" size="sm">MED</Badge>;
      case 'LOW':
        return <Badge variant="neutral" size="sm">LOW</Badge>;
    }
  };

  const subtasksCount = (task.subtasks || []).length;
  const completedSubtasksCount = (task.subtasks || []).filter((s) => s.isCompleted).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 shadow-md transition-all duration-150 space-y-3 group cursor-pointer"
      onClick={() => onCardClick(taskId)}
    >
      {/* Top Header: Key, Priority, Drag Handle */}
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded bg-brand-950/80 border border-brand-800/60 text-brand-400 font-extrabold text-[11px] tracking-wider">
          {task.taskKey}
        </span>
        <div className="flex items-center gap-2">
          {getPriorityBadge(task.priority)}
          <button
            {...attributes}
            {...listeners}
            className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing p-1 rounded"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-bold text-slate-100 line-clamp-2 group-hover:text-brand-300 transition-colors">
        {task.title}
      </h4>

      {/* Footer Info: Subtasks & Assignee Avatar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {subtasksCount > 0 && (
            <div className="flex items-center gap-1 text-[11px]">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {completedSubtasksCount}/{subtasksCount}
              </span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[11px] text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {task.assigneeId ? (
          <div
            className="w-6 h-6 rounded-full bg-brand-700 text-white font-bold text-[9px] flex items-center justify-center uppercase shrink-0 border border-brand-500/40"
            title={task.assigneeId.name}
          >
            {task.assigneeId.avatarUrl ? (
              <img src={task.assigneeId.avatarUrl} alt={task.assigneeId.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              task.assigneeId.name?.slice(0, 2)
            )}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-slate-700 text-slate-500 text-[10px] flex items-center justify-center">
            ?
          </div>
        )}
      </div>
    </div>
  );
};
