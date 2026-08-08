import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInviteMemberMutation } from '../../services/organizationApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { UserPlus, X, AlertCircle } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'MEMBER'])
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export interface InviteMemberModalProps {
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  orgId,
  isOpen,
  onClose
}) => {
  const [inviteMember, { isLoading }] = useInviteMemberMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'MEMBER' }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: InviteFormValues) => {
    setErrorMsg(null);
    try {
      await inviteMember({ orgId, ...data }).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to send invitation.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Invite Team Member</h3>
              <p className="text-xs text-slate-400">Grant workspace membership and permissions</p>
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
            label="User Email Address"
            type="email"
            placeholder="colleague@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Organization Role
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/50"
              {...register('role')}
            >
              <option value="MEMBER">MEMBER — Can view & participate in assigned projects</option>
              <option value="ADMIN">ADMIN — Can manage members & create projects</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
