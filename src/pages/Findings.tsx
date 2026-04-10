import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { GlobalFinding } from '../api/client';
import { Search, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export function Findings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('severity') === 'suggestion' ? 'suggestions' : 'warnings';
  const [activeTab, setActiveTab] = useState<'warnings' | 'suggestions'>(initialTab);
  
  const [findings, setFindings] = useState<GlobalFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchFindings() {
      try {
        setLoading(true);
        // Fetch all findings so we can split them into tabs
        const res = await apiClient.get('/findings');
        setFindings(res as unknown as GlobalFinding[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFindings();
  }, []);

  const filteredFindings = findings.filter(f => 
    f.hostname.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const warnings = filteredFindings.filter(f => f.severity === 'warning');
  const suggestions = filteredFindings.filter(f => f.severity === 'suggestion');

  const displayedFindings = activeTab === 'warnings' ? warnings : suggestions;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-widest text-primary uppercase flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          Global Findings
        </h1>
        <p className="text-zinc-400">
          Actionable list of infrastructure warnings and suggestions.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by hostname or description..."
              className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border text-sm font-semibold tracking-widest mt-2">
          <button 
            onClick={() => { setActiveTab('warnings'); setSearchParams({ severity: 'warning' }) }} 
            className={`px-6 py-3 border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'warnings' ? 'border-red-500 text-red-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            Warnings ({warnings.length})
          </button>
          <button 
            onClick={() => { setActiveTab('suggestions'); setSearchParams({ severity: 'suggestion' }) }} 
            className={`px-6 py-3 border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'suggestions' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            <Info className="w-4 h-4" />
            Suggestions ({suggestions.length})
          </button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 overflow-hidden">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-zinc-800 rounded"></div>
              ))}
            </div>
          ) : displayedFindings.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-zinc-500 text-center">
              <ShieldAlert className="w-12 h-12 mb-4 opacity-50 text-zinc-600" />
              <p>No findings match your criteria in this severity.</p>
              <p className="text-sm">Infrastructure is clean or you need to run a scan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider text-xs font-semibold text-zinc-400 border-b border-border">
                  <tr>
                    <th className="pb-3 px-4 font-medium">Hostname</th>
                    <th className="pb-3 px-4 font-medium">Test ID</th>
                    <th className="pb-3 px-4 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedFindings.map((finding) => (
                    <tr key={finding.finding_id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-4 font-medium text-emerald-400 hover:text-emerald-300">
                        <Link to={`/agents/${finding.agent_id}/report`} className="underline underline-offset-4 decoration-emerald-900">
                          {finding.hostname}
                        </Link>
                      </td>
                      <td className="py-4 px-4 font-mono text-zinc-300">{finding.test_id}</td>
                      <td className="py-4 px-4 text-zinc-200 whitespace-normal min-w-[300px]">{finding.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}