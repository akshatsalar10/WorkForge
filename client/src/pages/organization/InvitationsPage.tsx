import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import {
  useGetPendingInvitationsQuery,
  useRevokeInvitationMutation
} from '../../services/organizationApi';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { InviteMemberModal } from '../../components/organization/InviteMemberModal';
import { UserPlus, Trash2, Mail, Clock } from 'lucide-react';

export const InvitationsPage: React.FC = () => {
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);
  const { data, isLoading, refetch } = useGetPendingInvitationsQuery(activeOrgId || '', {
    skip: !activeOrgId
  });
  const [revokeInvite] = useRevokeInvitationMutation();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  if (!activeOrgId) return null;
  if (isLoading) return <LoadingSpinner label="Loading pending invitations..." />;
  if (!data) return <ErrorState title="Invitations unavailable" onRetry={refetch} />;

  const invitations = data.data.invitations;

  const handleRevoke = async (invitationId: string, email: string) => {
    if (!window.confirm(`Revoke invitation sent to ${email}?`)) return;
    try {
      await revokeInvite({ orgId: activeOrgId, invitationId }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to revoke invitation');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pending Workspace Invitations</h1>
          <p className="text-sm text-slate-400">Track and manage outgoing user invitations.</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setInviteModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Invite Member
        </Button>
      </div>

      {invitations.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-7 h-7" />}
          title="No pending invitations"
          description="There are currently no active pending invitations for this workspace."
          actionLabel="Send Invitation"
          onAction={() => setInviteModalOpen(true)}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Invited By</th>
                  <th className="p-4">Expires</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {invitations.map((inv) => {
                  const invId = inv.id || inv._id;
                  return (
                    <tr key={invId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-white">{inv.email}</td>
                      <td className="p-4">
                        <Badge variant="brand">{inv.role}</Badge>
                      </td>
                      <td className="p-4 text-slate-400">{inv.invitedBy?.name || 'Admin'}</td>
                      <td className="p-4 text-slate-400 flex items-center gap-1.5 mt-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRevoke(invId, inv.email)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Revoke Invitation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <InviteMemberModal
        orgId={activeOrgId}
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
};
