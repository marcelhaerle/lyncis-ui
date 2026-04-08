import { Link, useLocation } from 'react-router-dom';
import { Home, Server } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Agents', path: '/agents', icon: Server },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col items-start px-2 py-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-3 px-4 mb-8">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          L
        </div>
        <h1 className="text-xl font-bold tracking-wider uppercase text-zinc-100">
          Lyncis
        </h1>
      </div>

      <nav className="w-full flex flex-col gap-1">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 uppercase text-sm tracking-widest font-semibold ${
                isActive 
                ? 'bg-background text-primary border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-background/50'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
