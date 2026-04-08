import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex w-full min-h-screen bg-background text-zinc-100 font-sans antialiased overflow-hidden">
      <Sidebar />
      <main className="flex-1 w-full h-screen overflow-y-auto relative p-8">
        <Outlet />
      </main>
    </div>
  );
}
