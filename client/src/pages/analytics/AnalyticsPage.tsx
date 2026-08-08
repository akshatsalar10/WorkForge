import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useGetAnalyticsSummaryQuery, useGetWorkloadAnalyticsQuery } from '../../services/analyticsApi';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, CheckCircle2, Clock, FolderKanban, Users, TrendingUp } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  TODO: '#64748b',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#a855f7',
  DONE: '#10b981'
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#64748b',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  URGENT: '#ef4444'
};

export const AnalyticsPage: React.FC = () => {
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary
  } = useGetAnalyticsSummaryQuery(activeOrgId || '', { skip: !activeOrgId });

  const { data: workloadData, isLoading: isWorkloadLoading } = useGetWorkloadAnalyticsQuery(
    activeOrgId || '',
    { skip: !activeOrgId }
  );

  if (!activeOrgId) return null;
  if (isSummaryLoading || isWorkloadLoading) return <LoadingSpinner label="Aggregating workspace analytics..." />;
  if (!summaryData) return <ErrorState title="Analytics data unavailable" onRetry={refetchSummary} />;

  const { metrics, statusDistribution, priorityDistribution } = summaryData.data;
  const workload = workloadData?.data?.workload || [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Productivity & Velocity Analytics</h1>
          <p className="text-sm text-slate-400">Real-time team throughput, status distribution, and workload velocity.</p>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Completion Velocity</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{metrics.completionRate}%</p>
          <p className="text-xs text-slate-400">{metrics.completedTasks} of {metrics.totalTasks} tasks finished</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{metrics.totalProjects}</p>
          <p className="text-xs text-slate-400">Active project workspaces</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Open Backlog</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{metrics.openTasks}</p>
          <p className="text-xs text-slate-400">Tasks in progress or review</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Team Capacity</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{metrics.totalMembers}</p>
          <p className="text-xs text-slate-400">Organization members</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Bar Chart */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-400" /> Task Status Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Breakdown Pie Chart */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-400" /> Priority Breakdown
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {priorityDistribution.map((entry) => (
                    <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-300 font-semibold">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Team Workload Leaderboard */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-400" /> Team Workload & Task Distribution
        </h3>

        {workload.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center">No assigned task workload metrics yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Team Member</th>
                  <th className="p-3">Total Assigned</th>
                  <th className="p-3">Completed</th>
                  <th className="p-3">Open Tasks</th>
                  <th className="p-3">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {workload.map((w) => {
                  const rate = w.totalTasks > 0 ? Math.round((w.completedTasks / w.totalTasks) * 100) : 0;
                  return (
                    <tr key={w.userId} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center uppercase">
                            {w.name?.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{w.name}</span>
                            <span className="text-[10px] text-slate-400">{w.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">{w.totalTasks}</td>
                      <td className="p-3 font-semibold text-emerald-400">{w.completedTasks}</td>
                      <td className="p-3 font-semibold text-amber-400">{w.openTasks}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                            <div
                              className="bg-brand-500 h-full transition-all duration-300"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-200">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
