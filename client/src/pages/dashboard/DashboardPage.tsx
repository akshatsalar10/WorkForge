import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Building2, FolderKanban, CheckSquare, Users, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-slate-900 border border-brand-800/40 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="brand" className="mb-1">
            WorkForge Platform v1.0
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Streamline team workflows, manage cross-functional projects, and monitor organizational operations in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Workspace</p>
            <p className="text-base font-bold text-white mt-0.5">Select Organization</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects</p>
            <p className="text-base font-bold text-white mt-0.5">0 Active</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks</p>
            <p className="text-base font-bold text-white mt-0.5">0 Assigned</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Members</p>
            <p className="text-base font-bold text-white mt-0.5">1 Member</p>
          </div>
        </Card>
      </div>

      {/* Module 3 Next Action Prompt */}
      <Card className="p-8 text-center space-y-4 border-dashed border-slate-700">
        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-white">Create or Join an Organization</h3>
          <p className="text-xs text-slate-400">
            To start collaborating on projects and tasks, initialize your organization workspace in Module 3.
          </p>
        </div>
      </Card>
    </div>
  );
};
