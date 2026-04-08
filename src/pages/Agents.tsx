import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient, type Agent } from '../api/client';
import { HardDrive, Play, Search, ShieldAlert, Loader2 } from 'lucide-react';

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
  }, []);

  const triggerScan = async (agentId: string) => {
    setScanning(agentId);
    try {
      await apiClient.post(`/agents/${agentId}/scan`);
      toast.success('Scan queued successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to queue scan.');
    } finally {
      setScanning(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 h-full">
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
              <th className="font-semibold py-4 px-6">OS Info</th>
              <th className="font-semibold py-4 px-6">Last Seen</th>
              <th className="font-semibold py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">Retrieving intelligence...</td>
              </tr>
            ) : agents.length === 0 ? (
               <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">No agents deployed.</td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-background/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${agent.online ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}></span>
                      <span className="capitalize">{agent.online ? 'Online' : 'Offline'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-zinc-300 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" />
                    {agent.hostname}
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
                      <button 
                        onClick={() => triggerScan(agent.id)}
                        disabled={scanning === agent.id}
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
