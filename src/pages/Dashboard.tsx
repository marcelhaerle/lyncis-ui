import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { Agent } from '../api/client';
import { Activity, ShieldAlert, ShieldCheck, Users } from 'lucide-react';

interface DashboardStats {
  total_agents: number;
  online_agents: number;
  avg_hardening_index: number;
  critical_warnings: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, agentsRes] = await Promise.all([
          apiClient.get('/dashboard'),
          apiClient.get('/agents')
        ]);
        
        setStats(statsRes as unknown as DashboardStats);
        setAgents(agentsRes as unknown as Agent[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Agents" value={stats?.total_agents || 0} icon={Users} />
            <StatCard title="Online Agents" value={stats?.online_agents || 0} icon={Activity} />
            <StatCard title="Avg Hardening Index" value={stats?.avg_hardening_index || 0} icon={ShieldCheck} />
            <StatCard title="Critical Warnings" value={stats?.critical_warnings || 0} icon={ShieldAlert} alert />
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-wide text-zinc-100 uppercase">
              Agent Posture Overview
            </h2>
            <div className="bg-surface border border-border rounded-xl p-6">
              {agents.length === 0 ? (
                <div className="text-zinc-500 text-sm">No agents available.</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {agents.map((agent) => {
                    const score = agent.latest_hardening_index ?? 0;
                    let colorClass = 'bg-zinc-700';
                    if (agent.latest_hardening_index !== undefined) {
                      if (score < 50) colorClass = 'bg-red-500';
                      else if (score <= 75) colorClass = 'bg-yellow-500';
                      else colorClass = 'bg-emerald-500';
                    }

                    return (
                      <div key={agent.id} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <span className="text-zinc-200 font-medium">{agent.hostname}</span>
                          <span className="text-zinc-400 text-sm font-mono">
                            {agent.latest_hardening_index !== undefined ? `${score}/100` : 'N/A'}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full ${colorClass}`}
                            style={{ width: `${agent.latest_hardening_index !== undefined ? score : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
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
