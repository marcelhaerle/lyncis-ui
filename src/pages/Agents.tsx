import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient, type Agent } from '../api/client';
import { HardDrive, Play, Search, ShieldAlert, Loader2, Hourglass, Check, History } from 'lucide-react';
import { OnlineStatus } from '../components/agent/OnlineStatus';

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await apiClient.get('/agents');
        setAgents(response as unknown as Agent[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();

    const intervalId = setInterval(fetchAgents, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  const triggerScan = async (agentId: string) => {
    setScanning(agentId);
    try {
      await apiClient.post(`/agents/${agentId}/scan`);
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, activity_status: 'pending' } : a));
      toast.success('Scan queued successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to queue scan.');
    } finally {
      setScanning(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 h-full">
      <header className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-widest text-primary uppercase">
              Fleet Management
            </h1>
            <p className="text-zinc-400">Manage connected agents and initiate security sweeps.</p>
          </div>
          <div className="flex bg-surface border border-border px-3 py-2 rounded gap-2 items-center text-sm w-64 shadow-inner">
            <Search className="w-4 h-4 text-zinc-500" />
            <input type="text" placeholder="Search hostnames..." className="bg-transparent text-zinc-100 outline-none w-full placeholder-zinc-600" />
          </div>
        </div>
      </header>

      <div className="bg-surface border border-border rounded-xl flex-1 flex flex-col overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-widest text-zinc-500 bg-background/30">
              <th className="font-semibold py-4 px-6">Status</th>
              <th className="font-semibold py-4 px-6">Hostname</th>
              <th className="font-semibold py-4 px-6">Activity</th>
              <th className="font-semibold py-4 px-6">OS Info</th>
              <th className="font-semibold py-4 px-6">Last Seen</th>
              <th className="font-semibold py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">Retrieving intelligence...</td>
              </tr>
            ) : agents.length === 0 ? (
               <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">No agents deployed.</td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-background/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <OnlineStatus online={agent.online} />
                      <span className="capitalize">{agent.online ? 'Online' : 'Offline'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-zinc-300">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-primary" />
                      {agent.hostname}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {agent.activity_status === 'scanning' ? (
                      <span className="flex items-center gap-1.5 text-primary text-xs tracking-wider uppercase font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Scanning...
                      </span>
                    ) : agent.activity_status === 'pending' ? (
                      <span className="flex items-center gap-1.5 text-amber-500 text-xs tracking-wider uppercase font-semibold animate-pulse">
                        <Hourglass className="w-3.5 h-3.5" />
                        Queued
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-zinc-500 text-xs tracking-wider uppercase font-semibold">
                        <Check className="w-3.5 h-3.5 opacity-50" />
                        Idle
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-zinc-400">{agent.os_info}</td>
                  <td className="py-4 px-6 text-zinc-500 font-mono text-xs">{new Date(agent.last_seen).toLocaleString()}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 text-xs uppercase font-bold tracking-wider">
                      <Link 
                        to={`/agents/${agent.id}/report`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface border border-border hover:bg-background hover:text-primary transition-colors"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        Report
                      </Link>
                      <Link 
                        to={`/agents/${agent.id}/history`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface border border-border hover:bg-background hover:text-primary transition-colors"
                      >
                        <History className="w-3 h-3" />
                        History
                      </Link>
                      <button 
                        onClick={() => triggerScan(agent.id)}
                        disabled={agent.activity_status !== 'idle' && agent.activity_status !== undefined || scanning === agent.id}
                        title={agent.activity_status !== 'idle' && agent.activity_status !== undefined ? "A scan is already scheduled or in progress for this agent." : undefined}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {scanning === agent.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        {scanning === agent.id ? 'Queuing...' : 'Trigger Scan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
