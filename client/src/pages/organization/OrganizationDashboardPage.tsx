import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useGetOrganizationDetailsQuery } from '../../services/organizationApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Building2, Users, Shield, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrganizationDashboardPage: React.FC = () => {
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);
  const { data, error, isLoading, refetch } = useGetOrganizationDetailsQuery(activeOrgId || '', {
    skip: !activeOrgId
  });

  if (!activeOrgId) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <Building2 className="w-12 h-12 text-brand-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Active Workspace Selected</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please select or create an organization from the workspace switcher.
        </p>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner label="Loading organization overview..." />;
  if (error || !data) return <ErrorState title="Organization Unreachable" onRetry={refetch} />;

  const { organization, role, memberCount } = data.data;

  return (
    <div className="space-y-8">
      {/* Org Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-600/30">
            {organization.logoUrl ? (
              <img src={organization.logoUrl} alt={organization.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <Building2 className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{organization.name}</h1>
              <Badge variant={role === 'OWNER' ? 'brand' : role === 'ADMIN' ? 'purple' : 'neutral'}>
                {role}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">workforge.app/orgs/{organization.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/members">
            <Badge variant="neutral" className="px-3 py-1.5 gap-1.5 cursor-pointer hover:border-slate-600">
              <Users className="w-4 h-4 text-brand-400" />
              <span>{memberCount} Members</span>
            </Badge>
          </Link>
        </div>
      </div>

      {/* Metrics & Quick Nav */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member Directory</span>
            <Users className="w-5 h-5 text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{memberCount}</p>
          <Link to="/members" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Manage Members <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Organization Privilege</span>
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{role}</p>
          <span className="text-xs text-slate-400">Server-side RBAC enforced</span>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created Date</span>
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            {new Date(organization.createdAt).toLocaleDateString()}
          </p>
          <Link to="/org-settings" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Organization Settings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
};
