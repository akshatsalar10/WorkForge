import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import {
  useGetProjectDetailsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation
} from '../../services/projectApi';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ProjectMembersModal } from '../../components/project/ProjectMembersModal';
import {
  FolderKanban,
  Users,
  Calendar,
  ArrowLeft,
  Settings,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ProjectStatus, ProjectPriority } from '../../types/project';

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetProjectDetailsQuery(
    { orgId: activeOrgId || '', projectId: projectId || '' },
    { skip: !activeOrgId || !projectId }
  );

  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');
  const [priority, setPriority] = useState<ProjectPriority>('MEDIUM');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!activeOrgId || !projectId) return null;
  if (isLoading) return <LoadingSpinner label="Loading project details..." />;
  if (!data) return <ErrorState title="Project details unavailable" onRetry={refetch} />;

  const { project, memberCount } = data.data;

  const handleStartEdit = () => {
    setName(project.name);
    setDescription(project.description || '');
    setStatus(project.status);
    setPriority(project.priority);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateProject({
        orgId: activeOrgId,
        projectId,
        name,
        description,
        status,
        priority
      }).unwrap();
      setEditing(false);
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete project ${project.name}?`)) return;
    try {
      await deleteProject({ orgId: activeOrgId, projectId }).unwrap();
      navigate('/projects');
    } catch (err: any) {
      alert(err.data?.message || 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {/* Project Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-950 border border-brand-800 flex items-center justify-center text-brand-400 font-extrabold text-xl tracking-wider shadow-lg">
            {project.key}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
              <Badge variant={project.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {project.status}
              </Badge>
              <Badge variant={project.priority === 'URGENT' ? 'danger' : 'brand'}>
                {project.priority}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">{project.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMembersModalOpen(true)}
            leftIcon={<Users className="w-4 h-4 text-brand-400" />}
          >
            {memberCount} Members
          </Button>
          <Button variant="secondary" size="sm" onClick={handleStartEdit} leftIcon={<Settings className="w-4 h-4" />}>
            Edit
          </Button>
        </div>
      </div>

      {/* Edit Form Card */}
      {editing && (
        <Card className="space-y-4 p-6 bg-slate-900/90 border-brand-800/60">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-400" /> Edit Project Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-sm h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-sm"
                >
                  <option value="PLANNING">PLANNING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_HOLD">ON HOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-sm"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Button variant="danger" size="sm" onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />}>
                Delete Project
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Key</span>
          <p className="text-2xl font-extrabold text-brand-400">{project.key}</p>
          <p className="text-xs text-slate-400">Used as prefix for tasks (e.g. {project.key}-101)</p>
        </Card>

        <Card className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Team</span>
          <p className="text-xl font-bold text-white">{project.teamId?.name || 'No Team Assigned'}</p>
          <p className="text-xs text-slate-400">Functional group association</p>
        </Card>

        <Card className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Owner</span>
          <p className="text-xl font-bold text-white">{project.ownerId?.name || 'Admin'}</p>
          <p className="text-xs text-slate-400">{project.ownerId?.email}</p>
        </Card>
      </div>

      <ProjectMembersModal
        orgId={activeOrgId}
        project={project}
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
      />
    </div>
  );
};
