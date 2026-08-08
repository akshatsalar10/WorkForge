import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProjectMutation } from '../../services/projectApi';
import { useGetTeamsQuery } from '../../services/teamApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { FolderKanban, X, AlertCircle } from 'lucide-react';

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100, 'Project name cannot exceed 100 characters'),
  key: z
    .string()
    .max(10, 'Key max 10 chars')
    .optional()
    .transform((val) => (val ? val.toUpperCase() : undefined)),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  teamId: z.string().optional()
});

type CreateProjectValues = z.infer<typeof createProjectSchema>;

export interface CreateProjectModalProps {
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  orgId,
  isOpen,
  onClose
}) => {
  const { data: teamsData } = useGetTeamsQuery(orgId, { skip: !isOpen });
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { priority: 'MEDIUM' }
  });

  if (!isOpen) return null;

  const teams = teamsData?.data?.teams || [];

  const onSubmit = async (data: CreateProjectValues) => {
    setErrorMsg(null);
    try {
      await createProject({ orgId, ...data }).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to create project.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Project</h3>
              <p className="text-xs text-slate-400">Set up a new team project workspace</p>
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
          <Input
            label="Project Name"
            placeholder="Web Portal Redesign, Mobile App v2..."
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Project Key (Optional)"
            placeholder="ENG, WEB, MOB..."
            helperText="Auto-generated if left empty (e.g. WEB)"
            error={errors.key?.message}
            {...register('key')}
          />

          <Input
            label="Description (Optional)"
            placeholder="Overview of goals and scope..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Priority
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/50"
                {...register('priority')}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Assigned Team (Optional)
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/50"
                {...register('teamId')}
              >
                <option value="">-- No Team --</option>
                {teams.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
