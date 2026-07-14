import { Link, NavLink, useLocation } from 'react-router-dom';
import { Activity, Leaf, Users, LayoutGrid, User, LogOut } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/nutrition', label: 'Nutrition', icon: Leaf },
  { to: '/fitness', label: 'Fitness', icon: Activity },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
];

function AppShell({ auth, onLogout, children, backendStatus }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-crave-bone text-crave-ink">
      <header className="sticky top-0 z-40 border-b-2 border-crave-ink bg-crave-bone/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link to="/dashboard" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-crave-ink bg-crave-poppy text-crave-bone shadow-hard-sm transition group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-hard">
              <span className="font-display text-lg font-extrabold">C</span>
            </span>
            <div>
              <span className="block font-display text-xl font-extrabold leading-none">CRAVE</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest2 text-crave-ink/60">
                AI nutrition & fitness
              </span>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full border-2 px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest transition ${
                    isActive
                      ? 'border-crave-ink bg-crave-jade text-crave-bone shadow-hard-sm'
                      : 'border-transparent text-crave-ink hover:bg-crave-bone2'
                  }`
                }
              >
                <link.icon className="h-4 w-4" strokeWidth={2.5} />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border-2 border-crave-ink bg-crave-bone2 px-3 py-1.5 sm:flex">
              <span className="h-2 w-2 animate-pulseSoft rounded-full bg-crave-jade" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-crave-ink/80">
                {backendStatus}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-crave-ink bg-crave-bone px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest shadow-hard-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="border-b-2 border-crave-ink bg-crave-bone2">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-crave-ink/70 sm:px-6 lg:px-8">
          <span className="text-crave-poppy">Welcome back,</span>
          <span className="text-crave-ink">{auth?.user?.fullName || auth?.user?.username || 'friend'}</span>
          <span className="text-crave-ink/40">•</span>
          <span>{location.pathname.replace('/', '') || 'dashboard'}</span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}

export default AppShell;
