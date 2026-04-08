import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Server, Calendar, ShieldAlert, Cpu, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { apiClient, type Agent, type Scan } from '../api/client';

export function ScanReport() {
  const { agentId } = useParams<{ agentId: string }>();
  const [loading, setLoading] = useState(true);
  const [scan, setScan] = useState<Scan | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'warnings' | 'suggestions' | 'raw'>('warnings');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch agent and latest scan sequentially or in parallel
        const [agentRes, scanRes] = await Promise.all([
          apiClient.get(`/agents`), // we have to filter the agent by id. If there's no single agent endpoint
          apiClient.get(`/agents/${agentId}/scans/latest`).catch(err => {
            if (err.response?.status === 404) return null;
            throw err;
          }),
        ]);
        
        // Find agent from list (assuming no robust GET /agents/:id is specified yet, although standard REST would have it. Feature 5 just says GET /agents)
        const agentMatch = (agentRes as unknown as Agent[]).find(a => a.id === agentId);
        setAgent(agentMatch || null);
        setScan(scanRes as unknown as Scan);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load scan report.');
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
        Processing intelligence...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400">
        <ShieldAlert className="w-12 h-12 mb-4 text-zinc-600" />
        <h2 className="text-xl font-bold text-zinc-300">Agent Not Found</h2>
        <p className="mt-2">The specified agent could not be located in the fleet.</p>
        <Link to="/agents" className="mt-6 text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Fleet
        </Link>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400">
        <ShieldAlert className="w-12 h-12 mb-4 text-zinc-600" />
        <h2 className="text-xl font-bold text-zinc-300">No Scan Data</h2>
        <p className="mt-2">No security scan has been completed for <strong>{agent.hostname}</strong> yet.</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link to="/agents" className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  const warnings = scan.findings?.filter(f => f.severity === 'warning') || [];
  const suggestions = scan.findings?.filter(f => f.severity === 'suggestion') || [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 h-full pb-8">
      {/* Header section */}
      <header className="flex flex-col gap-4">
        <div>
          <Link to="/agents" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 text-sm font-semibold mb-4 w-fit uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-widest text-primary uppercase flex items-center gap-3">
                <Server className="w-8 h-8" />
                {agent.hostname}
              </h1>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-zinc-500" /> {agent.os_info}</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-zinc-500" /> {new Date(scan.created_at).toLocaleString()}</div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${agent.online ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}></span>
                  <span className="capitalize">{agent.online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Hardening Index</span>
              <div className={`text-5xl font-bold font-mono ${getScoreColor(scan.hardening_index)} drop-shadow-[0_0_12px_currentColor]`}>
                {scan.hardening_index}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border text-sm font-semibold tracking-widest mt-4">
        <button 
          onClick={() => setActiveTab('warnings')} 
          className={`px-6 py-3 border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'warnings' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <AlertTriangle className="w-4 h-4" />
          Warnings ({warnings.length})
        </button>
        <button 
          onClick={() => setActiveTab('suggestions')} 
          className={`px-6 py-3 border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'suggestions' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Info className="w-4 h-4" />
          Suggestions ({suggestions.length})
        </button>
        <button 
          onClick={() => setActiveTab('raw')} 
          className={`px-6 py-3 border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'raw' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <ShieldAlert className="w-4 h-4" />
          Raw Output
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-surface border border-border rounded-xl flex flex-col overflow-hidden shadow-lg shadow-black/20">
        
        {/* Warnings Tab */}
        {activeTab === 'warnings' && (
          <div className="overflow-y-auto max-h-[600px]">
            {warnings.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-green-500/50 mb-4" />
                <p>No critical warnings detected. System integrity looks solid.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-widest text-zinc-500 bg-background/30">
                    <th className="font-semibold py-4 px-6 w-32">Test ID</th>
                    <th className="font-semibold py-4 px-6">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm font-mono">
                  {warnings.map(finding => (
                    <tr key={finding.id} className="hover:bg-red-500/5 transition-colors">
                      <td className="py-4 px-6 text-red-400 font-bold whitespace-nowrap">{finding.test_id}</td>
                      <td className="py-4 px-6 text-zinc-300 whitespace-pre-wrap leading-relaxed">{finding.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="overflow-y-auto max-h-[600px]">
             {suggestions.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <p>No optimization suggestions available.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-widest text-zinc-500 bg-background/30">
                    <th className="font-semibold py-4 px-6 w-32">Test ID</th>
                    <th className="font-semibold py-4 px-6">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm font-mono">
                  {suggestions.map(finding => (
                    <tr key={finding.id} className="hover:bg-yellow-500/5 transition-colors">
                      <td className="py-4 px-6 text-yellow-400 font-bold whitespace-nowrap">{finding.test_id}</td>
                      <td className="py-4 px-6 text-zinc-300 whitespace-pre-wrap leading-relaxed">{finding.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Raw Output Tab */}
        {activeTab === 'raw' && (() => {
          let rawDataObj: Record<string, unknown> = {};
          try {
            rawDataObj = typeof scan.raw_data === 'string' ? JSON.parse(scan.raw_data) : scan.raw_data;
          } catch (e) {
            console.error('Failed to parse raw data:', e);
          }
          const entries = Object.entries(rawDataObj || {});

          return (
            <div className="overflow-y-auto max-h-[600px]">
              {entries.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-widest text-zinc-500 bg-background/30">
                      <th className="font-semibold py-4 px-6 w-1/3">Key</th>
                      <th className="font-semibold py-4 px-6">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-sm font-mono">
                    {entries.map(([key, val]) => (
                      <tr key={key} className="hover:bg-primary/5 transition-colors">
                        <td className="py-3 px-6 text-primary/80 font-bold whitespace-nowrap">{key}</td>
                        <td className="py-3 px-6 text-zinc-300 whitespace-pre-wrap leading-relaxed">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-zinc-600 italic">
                  No raw payload data retained...
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}