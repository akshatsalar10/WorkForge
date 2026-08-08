import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Activity, Database, Server, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const HealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/health');
      const json = await res.json();
      setHealthData(json.data);
    } catch (err) {
      setError('Failed to fetch backend health status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Status & Health Monitor</h1>
            <p className="text-sm text-slate-400">Real-time database latency, server uptime, and environment metrics.</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchHealth}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4 text-brand-400" />}
        >
          Refresh Ping
        </Button>
      </div>

      {error && (
        <Card className="border-rose-900 bg-rose-950/20 p-4 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </Card>
      )}

      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Metric */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span className="text-2xl font-extrabold text-white">{healthData.status}</span>
            </div>
            <p className="text-xs text-slate-400">All microservices operational</p>
          </Card>

          {/* Database Metric */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Database Latency</span>
              <Database className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{healthData.database?.latencyMs} ms</p>
            <p className="text-xs text-slate-400">MongoDB: {healthData.database?.name}</p>
          </Card>

          {/* Server Uptime */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Server Uptime</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">{formatUptime(healthData.uptimeSeconds || 0)}</p>
            <p className="text-xs text-slate-400">Environment: {healthData.environment}</p>
          </Card>
        </div>
      )}
    </div>
  );
};
