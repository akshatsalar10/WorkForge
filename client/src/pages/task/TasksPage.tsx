import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useGetOrganizationTasksQuery } from '../../services/taskApi';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { CreateTaskModal } from '../../components/task/CreateTaskModal';
import { TaskDetailsModal } from '../../components/task/TaskDetailsModal';
import { CheckSquare, Plus, Search, Filter, Calendar, User as UserIcon } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types/task';

export const TasksPage: React.FC = () => {
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { data, isLoading, refetch } = useGetOrganizationTasksQuery(
    {
      orgId: activeOrgId || '',
      search: search || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined
    },
    { skip: !activeOrgId }
  );

  if (!activeOrgId) return null;
  if (isLoading) return <LoadingSpinner label="Loading organization tasks..." />;
  if (!data) return <ErrorState title="Tasks unavailable" onRetry={refetch} />;

  const tasks = data.data || [];

  const handleOpenTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailsModalOpen(true);
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return <Badge variant="success">DONE</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="brand">IN PROGRESS</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="purple">IN REVIEW</Badge>;
      case 'TODO':
        return <Badge variant="neutral">TODO</Badge>;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization Tasks</h1>
          <p className="text-sm text-slate-400">Track and manage tasks across all workspace projects.</p>
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

      {/* Controls Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search tasks by title or key (e.g. ENG-104)..."
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
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="IN_REVIEW">IN REVIEW</option>
              <option value="DONE">DONE</option>
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
      </Card>

      {/* Task List Table */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-7 h-7" />}
          title="No tasks found"
          description="Create your first task to start organizing team work items."
          actionLabel="Create Task"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Key</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Assignee</th>
                  <th className="p-4">Subtasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {tasks.map((t) => {
                  const taskId = t.id || t._id;
                  const completedSubtasks = (t.subtasks || []).filter((s) => s.isCompleted).length;
                  const totalSubtasks = (t.subtasks || []).length;

                  return (
                    <tr
                      key={taskId}
                      onClick={() => handleOpenTask(taskId)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-extrabold text-brand-400">{t.taskKey}</td>
                      <td className="p-4 font-semibold text-white max-w-xs truncate">{t.title}</td>
                      <td className="p-4 text-slate-400 font-medium">{t.projectId?.name || 'Project'}</td>
                      <td className="p-4">{getStatusBadge(t.status)}</td>
                      <td className="p-4">{getPriorityBadge(t.priority)}</td>
                      <td className="p-4">
                        {t.assigneeId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-brand-700 text-[9px] font-bold text-white flex items-center justify-center uppercase">
                              {t.assigneeId.avatarUrl ? (
                                <img src={t.assigneeId.avatarUrl} alt={t.assigneeId.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                t.assigneeId.name?.slice(0, 2)
                              )}
                            </div>
                            <span className="text-slate-300 font-medium">{t.assigneeId.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CreateTaskModal
        orgId={activeOrgId}
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
