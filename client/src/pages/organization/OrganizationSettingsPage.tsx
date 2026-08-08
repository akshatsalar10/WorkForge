import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import {
  useGetOrganizationDetailsQuery,
  useUpdateOrganizationMutation,
  useGetAuditLogsQuery,
  useDeleteOrganizationMutation
} from '../../services/organizationApi';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Settings, Shield, Download, Trash2, AlertTriangle, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OrganizationSettingsPage: React.FC = () => {
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetOrganizationDetailsQuery(activeOrgId || '', {
    skip: !activeOrgId
  });

  const { data: auditLogsData } = useGetAuditLogsQuery(activeOrgId || '', { skip: !activeOrgId });

  const [updateOrg, { isLoading: isUpdating }] = useUpdateOrganizationMutation();
  const [deleteOrg, { isLoading: isDeleting }] = useDeleteOrganizationMutation();

  const [activeTab, setActiveTab] = useState<'general' | 'audit' | 'danger'>('general');
  const [name, setName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState('');

  if (!activeOrgId) return null;
  if (isLoading) return <LoadingSpinner label="Loading organization settings..." />;
  if (!data) return <ErrorState title="Organization settings unavailable" onRetry={refetch} />;

  const org = data.data.organization;
  const logs = auditLogsData?.data?.logs || [];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateOrg({ orgId: activeOrgId, name: name || org.name }).unwrap();
      setSuccessMsg('Organization name updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to update organization.');
    }
  };

  const handleExportData = () => {
    const token = localStorage.getItem('accessToken');
    fetch(`/api/v1/organizations/${activeOrgId}/export`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workforge-export-${org.slug}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert('Failed to export organization data.'));
  };

  const handleDeleteOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmSlug.trim() !== org.slug) {
      setErrorMsg(`Slug mismatch. Please type exactly "${org.slug}" to confirm deletion.`);
      return;
    }

    try {
      await deleteOrg({ orgId: activeOrgId, confirmationSlug: confirmSlug.trim() }).unwrap();
      navigate('/login');
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to delete organization.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization Settings</h1>
          <p className="text-sm text-slate-400">Manage workspace details, security audit logs, and data export.</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportData}
          leftIcon={<Download className="w-4 h-4 text-brand-400" />}
        >
          Export Workspace JSON
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'general' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          General Settings
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'audit' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Security Audit Log ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab('danger')}
          className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'danger' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-rose-400'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" /> Danger Zone
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <Card className="space-y-6 p-6">
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Organization Name"
              defaultValue={org.name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Organization Slug
              </label>
              <input
                type="text"
                disabled
                value={org.slug}
                className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-lg p-2.5 text-sm font-mono cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-500 mt-1">Unique identifier used for workspace URL routes.</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                Save Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: SECURITY AUDIT LOG */}
      {activeTab === 'audit' && (
        <Card className="p-0 overflow-hidden space-y-0">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-400" /> Audit Log Events
            </h3>
            <span className="text-xs text-slate-400 font-mono">500 most recent events</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">No audit events recorded yet.</p>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {logs.map((log) => (
                    <tr key={log.id || log._id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{log.actorId?.name || 'System User'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-brand-400 font-mono text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: DANGER ZONE */}
      {activeTab === 'danger' && (
        <Card className="border-rose-900/60 bg-rose-950/20 p-6 space-y-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-rose-300">Delete Organization Workspace</h3>
              <p className="text-xs text-slate-300 mt-1">
                Permanently deletes this organization and ALL associated projects, tasks, teams, attachments, comments, and member accounts. This action CANNOT be undone.
              </p>
            </div>
          </div>

          <form onSubmit={handleDeleteOrganization} className="space-y-4 pt-4 border-t border-rose-900/40">
            <div>
              <label className="block text-xs font-semibold text-rose-300 uppercase mb-1">
                Type "{org.slug}" to confirm deletion:
              </label>
              <input
                type="text"
                value={confirmSlug}
                onChange={(e) => setConfirmSlug(e.target.value)}
                placeholder={org.slug}
                className="w-full bg-slate-950 border border-rose-900 text-rose-200 rounded-lg p-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="danger" size="sm" isLoading={isDeleting}>
                Permanently Delete Organization
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
