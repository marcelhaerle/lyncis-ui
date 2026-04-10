import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Server, Activity, AlertOctagon, CheckCircle2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient, type Agent, type ScanHistory as IScanHistory, type ScanDiff } from '../api/client';

export function ScanHistory() {
  const { agentId } = useParams<{ agentId: string }>();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [history, setHistory] = useState<IScanHistory[]>([]);
  const [diff, setDiff] = useState<ScanDiff | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [agentRes, historyRes, diffRes] = await Promise.all([
          apiClient.get('/agents'),
          apiClient.get(`/agents/${agentId}/scans/history`).catch((err) => {
            if (err.response?.status === 404) return [];
            throw err;
          }),
          apiClient.get(`/agents/${agentId}/scans/latest/diff`).catch((err) => {
            if (err.response?.status === 404) return null;
            throw err;
          }),
        ]);

        const agentMatch = (agentRes as unknown as Agent[]).find((a) => a.id === agentId);
        setAgent(agentMatch || null);
        setHistory(historyRes as unknown as IScanHistory[]);
        setDiff(diffRes as unknown as ScanDiff);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load history and trends data.');
      } finally {
        setLoading(false);
      }
    }

    if (agentId) {
      fetchData();
    }
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        <Server className="w-6 h-6 animate-pulse mr-3" />
        Compiling historical records...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400">
        <AlertOctagon className="w-12 h-12 mb-4 text-zinc-600" />
        <h2 className="text-xl font-bold text-zinc-300">Agent Not Found</h2>
        <p className="mt-2">The specified agent could not be located.</p>
        <Link to="/agents" className="mt-6 text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Fleet
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 h-full pb-8">
      <header className="flex flex-col gap-4">
        <div>
          <Link
            to="/agents"
            className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 text-sm font-semibold mb-4 w-fit uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-widest text-primary uppercase flex items-center gap-3">
                <Server className="w-8 h-8" />
                {agent.hostname}
              </h1>
              <p className="text-sm text-zinc-400 mt-2 font-mono">History & Trends</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* Trend Visualization */}
        <div className="bg-surface border border-border p-6 rounded-xl shadow-lg shadow-black/20 flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-wide text-zinc-100 uppercase flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Scan History Trends
          </h2>
          <div className="h-[300px] w-full mt-4">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="created_at"
                    stroke="#52525b"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <YAxis yAxisId="left" stroke="#06b6d4" domain={[0, 100]} tick={{ fill: '#06b6d4', fontSize: 12 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#ef4444"
                    tick={{ fill: '#ef4444', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                    labelFormatter={(label) => new Date(label as string).toLocaleString()}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="hardening_index"
                    name="Hardening Index"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    activeDot={{ r: 6, fill: '#06b6d4', stroke: '#09090b', strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="warning_count"
                    name="Warnings"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500 italic">
                Not enough historical data available.
              </div>
            )}
          </div>
        </div>

        {/* Delta Panel */}
        <div className="bg-surface border border-border rounded-xl shadow-lg shadow-black/20 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border bg-background/30">
            <h2 className="text-xl font-semibold tracking-wide text-zinc-100 uppercase">Changes Since Last Scan</h2>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {!diff || (diff.resolved_issues.length === 0 && diff.new_issues.length === 0) ? (
              <div className="p-12 flex flex-col items-center justify-center text-zinc-500 bg-background/20 rounded-lg border border-border/50">
                <Activity className="w-10 h-10 mb-3 text-zinc-600" />
                <p className="uppercase tracking-widest font-bold text-sm">No state changes detected</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resolved Findings */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolved Warnings ({diff.resolved_issues.length})
                  </h3>
                  <div className="bg-background/40 border border-[#10b981]/20 rounded-lg overflow-hidden">
                    {diff.resolved_issues.length === 0 ? (
                      <div className="p-4 text-sm text-zinc-500 italic">No resolved warnings in this scan.</div>
                    ) : (
                      <ul className="divide-y divide-[#10b981]/10">
                        {diff.resolved_issues.map((issue) => (
                          <li key={issue.id} className="p-4 flex flex-col gap-1 hover:bg-[#10b981]/5 transition-colors">
                            <span className="text-xs font-mono text-[#10b981] font-bold">{issue.test_id}</span>
                            <span className="text-sm text-zinc-400 line-through decoration-zinc-500">
                              {issue.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* New Findings */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#ef4444] flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4" />
                    New Warnings ({diff.new_issues.length})
                  </h3>
                  <div className="bg-background/40 border border-[#ef4444]/20 rounded-lg overflow-hidden">
                    {diff.new_issues.length === 0 ? (
                      <div className="p-4 text-sm text-zinc-500 italic">No new warnings introduced.</div>
                    ) : (
                      <ul className="divide-y divide-[#ef4444]/10">
                        {diff.new_issues.map((issue) => (
                          <li key={issue.id} className="p-4 flex flex-col gap-1 hover:bg-[#ef4444]/5 transition-colors">
                            <span className="text-xs font-mono text-[#ef4444] font-bold">{issue.test_id}</span>
                            <span className="text-sm text-zinc-300">{issue.description}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
