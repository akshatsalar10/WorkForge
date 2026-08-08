import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOrganizationMutation } from '../../services/organizationApi';
import { useDispatch } from 'react-redux';
import { setActiveOrganization } from '../../store/authSlice';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Building2, X, AlertCircle } from 'lucide-react';

const createOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().optional(),
  logoUrl: z.string().url('Logo URL must be valid').or(z.literal('')).optional()
});

type CreateOrgFormValues = z.infer<typeof createOrgSchema>;

export interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose
}) => {
  const dispatch = useDispatch();
  const [createOrg, { isLoading }] = useCreateOrganizationMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema)
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateOrgFormValues) => {
    setErrorMsg(null);
    try {
      const res = await createOrg(data).unwrap();
      dispatch(setActiveOrganization(res.data.organization.id || res.data.organization._id));
      reset();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to create organization.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Organization</h3>
              <p className="text-xs text-slate-400">Start a new workspace team container</p>
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
            label="Organization Name"
            placeholder="Acme Inc, Stark Corp..."
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="URL Slug (Optional)"
            placeholder="acme-corp"
            helperText="Auto-generated if left empty"
            error={errors.slug?.message}
            {...register('slug')}
          />

          <Input
            label="Logo URL (Optional)"
            placeholder="https://..."
            error={errors.logoUrl?.message}
            {...register('logoUrl')}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Create Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
