import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useGetProjectsQuery } from '../../services/projectApi';
import { useGetProjectTasksQuery, useGetOrganizationTasksQuery } from '../../services/taskApi';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { TaskDetailsModal } from '../../components/task/TaskDetailsModal';
import { CreateTaskModal } from '../../components/task/CreateTaskModal';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Kanban, Plus, Search, Filter, FolderKanban } from 'lucide-react';

export const KanbanBoardPage: React.FC = () => {
  const { projectId: routeProjectId } = useParams<{ projectId?: string }>();
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(routeProjectId || '');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { data: projectsData } = useGetProjectsQuery({ orgId: activeOrgId || '' }, { skip: !activeOrgId });

  const effectiveProjectId = routeProjectId || selectedProjectId;

  const {
    data: projectTasksData,
    isLoading: isProjectLoading,
    refetch: refetchProjectTasks
  } = useGetProjectTasksQuery(
    {
      orgId: activeOrgId || '',
      projectId: effectiveProjectId,
      search: search || undefined,
      priority: priorityFilter || undefined
    },
    { skip: !activeOrgId || !effectiveProjectId }
  );

  const {
    data: orgTasksData,
    isLoading: isOrgLoading,
    refetch: refetchOrgTasks
  } = useGetOrganizationTasksQuery(
    {
      orgId: activeOrgId || '',
      search: search || undefined,
      priority: priorityFilter || undefined
    },
    { skip: !activeOrgId || !!effectiveProjectId }
  );

  if (!activeOrgId) return null;

  const isLoading = effectiveProjectId ? isProjectLoading : isOrgLoading;
  const projects = projectsData?.data || [];
  const tasks = (effectiveProjectId ? projectTasksData?.data : orgTasksData?.data) || [];

  const handleCardClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Kanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Kanban Board</h1>
            <p className="text-sm text-slate-400">Visual drag-and-drop workflow status columns</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Task
        </Button>
      </div>

      {/* Control Filters Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search board cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 rounded-lg text-xs pl-9 pr-3 py-2 outline-none"
            />
          </div>

          {!routeProjectId && (
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-slate-400" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 text-slate-200 rounded-lg text-xs px-2.5 py-2 outline-none"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    [{p.key}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
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
      </Card>

      {/* Main Kanban Interactive Board Area */}
      {isLoading ? (
        <LoadingSpinner label="Loading Kanban board columns..." />
      ) : (
        <KanbanBoard
          orgId={activeOrgId}
          projectId={effectiveProjectId}
          initialTasks={tasks}
          onCardClick={handleCardClick}
        />
      )}

      <CreateTaskModal
        orgId={activeOrgId}
        defaultProjectId={effectiveProjectId}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {selectedTaskId && (
        <TaskDetailsModal
          orgId={activeOrgId}
          taskId={selectedTaskId}
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedTaskId(null);
          }}
        />
      )}
    </div>
  );
};
