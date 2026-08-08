import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useGetTeamDetailsQuery, useRemoveTeamMemberMutation } from '../../services/teamApi';
import { useGetOrganizationDetailsQuery } from '../../services/organizationApi';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { AddTeamMemberModal } from '../../components/team/AddTeamMemberModal';
import { Users, UserPlus, ArrowLeft, Trash2 } from 'lucide-react';

export const TeamDetailsPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);

  const { data: orgData } = useGetOrganizationDetailsQuery(activeOrgId || '', { skip: !activeOrgId });
  const { data, isLoading, refetch } = useGetTeamDetailsQuery(
    { orgId: activeOrgId || '', teamId: teamId || '' },
    { skip: !activeOrgId || !teamId }
  );

  const [removeTeamMember] = useRemoveTeamMemberMutation();
  const [addModalOpen, setAddModalOpen] = useState(false);

  if (!activeOrgId || !teamId) return null;
  if (isLoading) return <LoadingSpinner label="Loading team members..." />;
  if (!data) return <ErrorState title="Team details unavailable" onRetry={refetch} />;

  const team = data.data.team;
  const role = orgData?.data?.role || 'MEMBER';
  const isAdmin = role === 'ADMIN' || role === 'OWNER';

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!window.confirm(`Remove ${userName} from ${team.name}?`)) return;
    try {
      await removeTeamMember({ orgId: activeOrgId, teamId, userId }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Link to="/teams" className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Teams List
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{team.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{team.description || 'No description'}</p>
          </div>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Member
          </Button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Assigned Team Members</h3>
          <Badge variant="purple">{(team.members || []).length} Members</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Member Name</th>
                <th className="p-4">Email</th>
                {isAdmin && <th className="p-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {(team.members || []).map((m) => {
                const userId = m.id || m._id;
                return (
                  <tr key={userId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 flex items-center gap-3 font-semibold text-white">
                      <div className="w-8 h-8 rounded-full bg-brand-700 font-bold text-white flex items-center justify-center uppercase">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          m.name?.slice(0, 2) || 'T'
                        )}
                      </div>
                      <span>{m.name}</span>
                    </td>
                    <td className="p-4 text-slate-400">{m.email}</td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRemoveMember(userId, m.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remove from Team"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <AddTeamMemberModal
        orgId={activeOrgId}
        team={team}
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
};
