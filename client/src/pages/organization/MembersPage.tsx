import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import {
  useGetMembersQuery,
  useGetOrganizationDetailsQuery,
  useChangeMemberRoleMutation,
  useRemoveMemberMutation
} from '../../services/organizationApi';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { InviteMemberModal } from '../../components/organization/InviteMemberModal';
import { Users, UserPlus, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { OrgRole } from '../../types/organization';

export const MembersPage: React.FC = () => {
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const { data: orgData } = useGetOrganizationDetailsQuery(activeOrgId || '', {
    skip: !activeOrgId
  });
  const { data: membersData, isLoading, refetch } = useGetMembersQuery(activeOrgId || '', {
    skip: !activeOrgId
  });

  const [changeRole] = useChangeMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!activeOrgId) return null;
  if (isLoading) return <LoadingSpinner label="Loading workspace members..." />;
  if (!membersData) return <ErrorState title="Members unavailable" onRetry={refetch} />;

  const members = membersData.data.members;
  const userRole = orgData?.data?.role || 'MEMBER';
  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER';

  const handleRoleChange = async (memberId: string, role: OrgRole) => {
    try {
      await changeRole({ orgId: activeOrgId, memberId, role }).unwrap();
      setMsg('Member role updated.');
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update role');
    }
  };

  const handleRemove = async (memberId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from this organization?`)) return;
    try {
      await removeMember({ orgId: activeOrgId, memberId }).unwrap();
      setMsg('Member removed from workspace.');
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert(err.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization Members</h1>
          <p className="text-sm text-slate-400">View and manage team access privileges and roles.</p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setInviteModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Invite Member
          </Button>
        )}
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* Members Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Member</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined Date</th>
                {isAdmin && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {members.map((m) => {
                const memberUser = m.userId;
                const memberId = m.id || m._id;
                const isSelf = memberUser.id === currentUserId || memberUser._id === currentUserId;
                const isOwner = m.role === 'OWNER';

                return (
                  <tr key={memberId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-700 font-bold text-white flex items-center justify-center uppercase">
                        {memberUser.avatarUrl ? (
                          <img src={memberUser.avatarUrl} alt={memberUser.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          memberUser.name?.slice(0, 2) || 'M'
                        )}
                      </div>
                      <span className="font-semibold text-white">
                        {memberUser.name} {isSelf && <span className="text-[10px] text-brand-400 font-normal">(You)</span>}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{memberUser.email}</td>
                    <td className="p-4">
                      {isAdmin && !isOwner && !isSelf ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(memberId, e.target.value as OrgRole)}
                          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 outline-none text-xs font-semibold"
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <Badge variant={m.role === 'OWNER' ? 'brand' : m.role === 'ADMIN' ? 'purple' : 'neutral'}>
                          {m.role}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{new Date(m.joinedAt).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        {!isOwner && !isSelf && (
                          <button
                            onClick={() => handleRemove(memberId, memberUser.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <InviteMemberModal
        orgId={activeOrgId}
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
};
