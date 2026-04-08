import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Activity, ShieldAlert, ShieldCheck, Users } from 'lucide-react';

interface DashboardStats {
  total_agents: number;
  online_agents: number;
  avg_hardening_index: number;
  critical_warnings: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await apiClient.get('/dashboard');
        // Type assertion for now since we mapped the response directly
        setStats(response as unknown as DashboardStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-widest text-primary uppercase">
          Command Center
        </h1>
        <p className="text-zinc-400">System overview and threat intelligence.</p>
      </header>

      {loading ? (
        <div className="flex animate-pulse gap-6">
          {[1,2,3,4].map(i => (
             <div key={i} className="flex-1 rounded-xl bg-surface border border-border h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Agents" value={stats?.total_agents || 0} icon={Users} />
          <StatCard title="Online Agents" value={stats?.online_agents || 0} icon={Activity} />
          <StatCard title="Avg Hardening Index" value={stats?.avg_hardening_index || 0} icon={ShieldCheck} />
          <StatCard title="Critical Warnings" value={stats?.critical_warnings || 0} icon={ShieldAlert} alert />
        </div>
      )}
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';

function StatCard({ title, value, icon: Icon, alert = false }: { title: string, value: string | number, icon: LucideIcon, alert?: boolean }) {
  return (
    <div className="flex flex-col bg-surface border border-border p-6 rounded-xl relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-1 ${alert ? 'bg-red-500' : 'bg-primary'}`}></div>
      <div className="flex justify-between">
        <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider">{title}</span>
        <Icon className={`w-5 h-5 ${alert ? 'text-red-500' : 'text-primary'}`} />
      </div>
      <div className="mt-4 text-4xl font-black tracking-tight text-zinc-100">
        {value}
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-primary to-transparent" />
    </div>
  );
}
