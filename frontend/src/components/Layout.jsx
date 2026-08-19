import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Cpu,
  Share2,
  GitBranch,
  Network,
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/developers', icon: Users, label: 'Developers' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/technologies', icon: Cpu, label: 'Technologies' },
  { to: '/graph', icon: Network, label: 'Graph Explorer' },
  { to: '/collaboration', icon: Share2, label: 'Collaboration' },
];

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-accent" />
            <span className="hidden font-semibold text-gray-100 sm:inline">
              Graph Explorer
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-400 hover:bg-surface-raised hover:text-gray-200'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex-1 md:max-w-xs lg:max-w-md">
            <GlobalSearch />
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-surface-border px-4 py-2 md:hidden">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-accent/10 text-accent' : 'text-gray-400'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
