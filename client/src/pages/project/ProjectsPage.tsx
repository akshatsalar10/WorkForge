import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useGetProjectsQuery, useArchiveProjectMutation } from '../../services/projectApi';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { CreateProjectModal } from '../../components/project/CreateProjectModal';
import { FolderKanban, Plus, Archive, ArrowRight, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProjectStatus, ProjectPriority } from '../../types/project';

export const ProjectsPage: React.FC = () => {
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showArchived, setShowArchived] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading, refetch } = useGetProjectsQuery(
    {
      orgId: activeOrgId || '',
      search: search || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      isArchived: showArchived
    },
    { skip: !activeOrgId }
  );

  const [archiveProject] = useArchiveProjectMutation();

  if (!activeOrgId) return null;
  if (isLoading) return <LoadingSpinner label="Loading projects..." />;
  if (!data) return <ErrorState title="Projects unavailable" onRetry={refetch} />;

  const projects = data.data || [];

  const handleToggleArchive = async (projectId: string, currentArchived: boolean) => {
    try {
      await archiveProject({
        orgId: activeOrgId,
        projectId,
        isArchived: !currentArchived
      }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update project archive state');
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE</Badge>;
      case 'PLANNING':
        return <Badge variant="brand">PLANNING</Badge>;
      case 'ON_HOLD':
        return <Badge variant="warning">ON HOLD</Badge>;
      case 'COMPLETED':
        return <Badge variant="purple">COMPLETED</Badge>;
      case 'ARCHIVED':
        return <Badge variant="neutral">ARCHIVED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: ProjectPriority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="danger">URGENT</Badge>;
      case 'HIGH':
        return <Badge variant="warning">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="brand">MEDIUM</Badge>;
      case 'LOW':
        return <Badge variant="neutral">LOW</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization Projects</h1>
          <p className="text-sm text-slate-400">Manage cross-functional team projects, keys, and statuses.</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Project
        </Button>
      </div>

      {/* Filter & Controls Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by project name or key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 rounded-lg text-xs pl-9 pr-3 py-2 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-slate-200 rounded-lg text-xs px-2.5 py-2 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PLANNING">PLANNING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_HOLD">ON HOLD</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-slate-200 rounded-lg text-xs px-2.5 py-2 outline-none"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            showArchived
              ? 'bg-amber-950/40 border-amber-800 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          {showArchived ? 'Showing Archived Projects' : 'Show Archived'}
        </button>
      </Card>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-7 h-7" />}
          title={showArchived ? 'No archived projects' : 'No active projects found'}
          description="Create a new project workspace to start tracking tasks and project deadlines."
          actionLabel="Create Project"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const projectId = p.id || p._id;
            return (
              <Card key={projectId} hoverable className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-950 border border-brand-800/80 text-brand-400 font-extrabold text-xs tracking-wider">
                      {p.key}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(p.status)}
                      {getPriorityBadge(p.priority)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {p.description || 'No project description provided.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleArchive(projectId, p.isArchived)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/40 rounded-lg transition-colors"
                      title={p.isArchived ? 'Unarchive Project' : 'Archive Project'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/projects/${projectId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300"
                  >
                    Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        orgId={activeOrgId}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};
