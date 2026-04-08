import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { ScanReport } from './pages/ScanReport';
import { Findings } from './pages/Findings';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'bg-surface text-zinc-100 border border-border' }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agents/:agentId/report" element={<ScanReport />} />
          <Route path="findings" element={<Findings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
