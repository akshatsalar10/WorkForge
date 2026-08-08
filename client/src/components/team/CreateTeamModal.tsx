import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTeamMutation } from '../../services/teamApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Users, X, AlertCircle } from 'lucide-react';

const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name cannot exceed 50 characters'),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional()
});

type CreateTeamValues = z.infer<typeof createTeamSchema>;

export interface CreateTeamModalProps {
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  orgId,
  isOpen,
  onClose
}) => {
  const [createTeam, { isLoading }] = useCreateTeamMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema)
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateTeamValues) => {
    setErrorMsg(null);
    try {
      await createTeam({ orgId, ...data }).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to create team.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Functional Team</h3>
              <p className="text-xs text-slate-400">Engineering, Design, Marketing, QA...</p>
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
            label="Team Name"
            placeholder="Engineering, Design, Frontend..."
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Description (Optional)"
            placeholder="Core product engineering and architecture team"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
