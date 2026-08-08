import React, { useState } from 'react';
import { useGetMembersQuery } from '../../services/organizationApi';
import {
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useUpdateProjectMemberRoleMutation,
  useRemoveProjectMemberMutation
} from '../../services/projectApi';
import { Project, ProjectRole } from '../../types/project';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { UserPlus, X, Trash2, AlertCircle } from 'lucide-react';

export interface ProjectMembersModalProps {
  orgId: string;
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  orgId,
  project,
  isOpen,
  onClose
}) => {
  const projectId = project.id || project._id;
  const { data: orgMembersData } = useGetMembersQuery(orgId, { skip: !isOpen });
  const { data: projectMembersData, isLoading } = useGetProjectMembersQuery(
    { orgId, projectId },
    { skip: !isOpen }
  );

  const [addMember] = useAddProjectMemberMutation();
  const [updateRole] = useUpdateProjectMemberRoleMutation();
  const [removeMember] = useRemoveProjectMemberMutation();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('MEMBER');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const projectMembers = projectMembersData?.data?.members || [];
  const existingUserIds = new Set(projectMembers.map((m) => m.userId.id || m.userId._id));

  const availableOrgMembers = (orgMembersData?.data?.members || []).filter(
    (m) => !existingUserIds.has(m.userId.id || m.userId._id)
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
        projectId,
        userId: selectedUserId,
        role: selectedRole
      }).unwrap();
      setSelectedUserId('');
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to add member to project.');
    }
  };

  const handleRoleChange = async (userId: string, role: ProjectRole) => {
    try {
      await updateRole({ orgId, projectId, userId, role }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update member role');
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from project ${project.name}?`)) return;
    try {
      await removeMember({ orgId, projectId, userId }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
              {project.key}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Project Members — {project.name}</h3>
              <p className="text-xs text-slate-400">Manage project access roles (MANAGER, MEMBER, VIEWER)</p>
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

        {/* Add Member Bar */}
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Add Organization Member
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-xs px-3 py-2 outline-none"
            >
              <option value="">-- Select Member --</option>
              {availableOrgMembers.map((m) => {
                const uid = m.userId.id || m.userId._id;
                return (
                  <option key={uid} value={uid}>
                    {m.userId.name} ({m.userId.email})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-36 space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Project Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-xs px-3 py-2 outline-none font-semibold"
            >
              <option value="MEMBER">MEMBER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
            Add Member
          </Button>
        </form>

        {/* Members List Table */}
        <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Project Role</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {projectMembers.map((pm) => {
                const uid = pm.userId.id || pm.userId._id;
                return (
                  <tr key={pm.id || pm._id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">{pm.userId.name}</td>
                    <td className="p-3 text-slate-400">{pm.userId.email}</td>
                    <td className="p-3">
                      <select
                        value={pm.role}
                        onChange={(e) => handleRoleChange(uid, e.target.value as ProjectRole)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 outline-none text-xs font-semibold"
                      >
                        <option value="MANAGER">MANAGER</option>
                        <option value="MEMBER">MEMBER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemove(uid, pm.userId.name)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded"
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
      </div>
    </div>
  );
};
