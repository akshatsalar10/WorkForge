import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTaskMutation } from '../../services/taskApi';
import { useGetProjectsQuery } from '../../services/projectApi';
import { useGetMembersQuery } from '../../services/organizationApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CheckSquare, X, AlertCircle } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types/task';

const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Please select a project'),
  title: z.string().min(2, 'Task title must be at least 2 characters').max(200, 'Task title cannot exceed 200 characters'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional()
});

type CreateTaskValues = z.infer<typeof createTaskSchema>;

export interface CreateTaskModalProps {
  orgId: string;
  defaultProjectId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  orgId,
  defaultProjectId,
  isOpen,
  onClose
}) => {
  const { data: projectsData } = useGetProjectsQuery({ orgId }, { skip: !isOpen });
  const { data: membersData } = useGetMembersQuery(orgId, { skip: !isOpen });
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      projectId: defaultProjectId || '',
      status: 'TODO',
      priority: 'MEDIUM'
    }
  });

  if (!isOpen) return null;

  const projects = projectsData?.data || [];
  const members = membersData?.data?.members || [];

  const onSubmit = async (data: CreateTaskValues) => {
    setErrorMsg(null);
    try {
      await createTask({
        orgId,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        assigneeId: data.assigneeId || null,
        dueDate: data.dueDate || null
      }).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to create task.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New Task</h3>
              <p className="text-xs text-slate-400">Auto-assigns human readable key (e.g., ENG-104)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Target Project
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/50"
              {...register('projectId')}
            >
              <option value="">-- Choose Project --</option>
              {projects.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
            {errors.projectId && <p className="text-xs text-rose-400 mt-1">{errors.projectId.message}</p>}
          </div>

          <Input
            label="Task Title"
            placeholder="Implement user authentication API..."
            error={errors.title?.message}
            {...register('title')}
          />

          <Input
            label="Description (Optional)"
            placeholder="Add detailed task specs and criteria..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Status
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 outline-none"
                {...register('status')}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Priority
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 outline-none"
                {...register('priority')}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Assignee
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 outline-none"
                {...register('assigneeId')}
              >
                <option value="">Unassigned</option>
                {members.map((m) => {
                  const uid = m.userId.id || m.userId._id;
                  return (
                    <option key={uid} value={uid}>
                      {m.userId.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <Input
              label="Due Date"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
