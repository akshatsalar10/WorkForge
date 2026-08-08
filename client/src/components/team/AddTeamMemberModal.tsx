import React, { useState } from 'react';
import { useGetMembersQuery } from '../../services/organizationApi';
import { useAddTeamMemberMutation } from '../../services/teamApi';
import { Team } from '../../types/team';
import { Button } from '../common/Button';
import { UserPlus, X, AlertCircle } from 'lucide-react';

export interface AddTeamMemberModalProps {
  orgId: string;
  team: Team;
  isOpen: boolean;
  onClose: () => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  orgId,
  team,
  isOpen,
  onClose
}) => {
  const { data: membersData } = useGetMembersQuery(orgId, { skip: !isOpen });
  const [addMember, { isLoading }] = useAddTeamMemberMutation();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const existingMemberIds = new Set((team.members || []).map((m) => m.id || m._id));
  const availableMembers = (membersData?.data?.members || []).filter(
    (m) => !existingMemberIds.has(m.userId.id || m.userId._id)
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg('Please select a member to add.');
      return;
    }

    setErrorMsg(null);
    try {
      await addMember({
        orgId,
        teamId: team.id || team._id,
        userId: selectedUserId
      }).unwrap();
      setSelectedUserId('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to add member to team.');
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
              <h3 className="text-lg font-bold text-white">Add Member to {team.name}</h3>
              <p className="text-xs text-slate-400">Select an existing organization member</p>
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

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Organization Member
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="">-- Choose a member --</option>
              {availableMembers.map((m) => {
                const uid = m.userId.id || m.userId._id;
                return (
                  <option key={uid} value={uid}>
                    {m.userId.name} ({m.userId.email})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Add to Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
