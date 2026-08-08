import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useGetTeamsQuery, useDeleteTeamMutation } from '../../services/teamApi';
import { useGetOrganizationDetailsQuery } from '../../services/organizationApi';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { CreateTeamModal } from '../../components/team/CreateTeamModal';
import { Users, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeamsPage: React.FC = () => {
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);
  const { data: orgData } = useGetOrganizationDetailsQuery(activeOrgId || '', { skip: !activeOrgId });
  const { data: teamsData, isLoading, refetch } = useGetTeamsQuery(activeOrgId || '', { skip: !activeOrgId });
  const [deleteTeam] = useDeleteTeamMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  if (!activeOrgId) return null;
  if (isLoading) return <LoadingSpinner label="Loading organization teams..." />;
  if (!teamsData) return <ErrorState title="Teams unavailable" onRetry={refetch} />;

  const teams = teamsData.data.teams;
  const role = orgData?.data?.role || 'MEMBER';
  const isAdmin = role === 'ADMIN' || role === 'OWNER';

  const handleDelete = async (teamId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete team "${name}"?`)) return;
    try {
      await deleteTeam({ orgId: activeOrgId, teamId }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to delete team');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Functional Teams</h1>
          <p className="text-sm text-slate-400">Organize workspace members into specialized working groups.</p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Team
          </Button>
        )}
      </div>

      {teams.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No teams created yet"
          description="Create functional teams (Engineering, Design, Marketing) to assign to projects."
          actionLabel={isAdmin ? 'Create First Team' : undefined}
          onAction={isAdmin ? () => setCreateModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t) => {
            const teamId = t.id || t._id;
            const memberCount = (t.members || []).length;
            return (
              <Card key={teamId} hoverable className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white tracking-tight">{t.name}</h3>
                    <Badge variant="purple" className="gap-1">
                      <Users className="w-3 h-3" />
                      {memberCount} Members
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {t.description || 'No description provided for this team.'}
                  </p>
                </div>

                {/* Member Avatars Preview */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
                  <div className="flex -space-x-2 overflow-hidden">
                    {(t.members || []).slice(0, 4).map((m, idx) => (
                      <div
                        key={idx}
                        className="w-7 h-7 rounded-full bg-brand-700 border-2 border-slate-900 text-white font-bold text-[10px] flex items-center justify-center uppercase"
                        title={m.name}
                      >
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          m.name?.slice(0, 2) || 'T'
                        )}
                      </div>
                    ))}
                    {memberCount > 4 && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 text-slate-300 font-bold text-[10px] flex items-center justify-center">
                        +{memberCount - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(teamId, t.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <Link
                      to={`/teams/${teamId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300"
                    >
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CreateTeamModal
        orgId={activeOrgId}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};
