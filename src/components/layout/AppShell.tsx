import { Suspense, useState, type FormEvent } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bookmark, CalendarDays, Compass, Footprints, Languages, LayoutDashboard, LogOut, Moon, Search, Sun, UserRound } from 'lucide-react';
import Notifications from './Notifications';
import { useAuth } from '../../context/AuthContext';
import { useSettings, useT } from '../../context/SettingsContext';
import Brand from '../ui/Brand';

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export function PageLoader() {
  return (
    <div className="page-loader" aria-busy="true">
      <span className="skeleton" style={{ width: '40%', height: 34 }} />
      <span className="skeleton" style={{ width: '25%', height: 16 }} />
      <div className="loader-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="skeleton" style={{ height: 120 }} />
        ))}
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { lang, set, resolvedTheme } = useSettings();
  const t = useT();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const groups = [
    {
      label: t('nav.gMain'),
      links: [
        { to: '/', label: t('nav.dashboard'), Icon: LayoutDashboard, end: true },
        { to: '/explore', label: t('nav.explore'), Icon: Compass, end: false },
        { to: '/saved', label: t('nav.saved'), Icon: Bookmark, end: false },
      ],
    },
    {
      label: t('nav.gActivity'),
      links: [
        { to: '/hikes', label: t('nav.hikes'), Icon: Footprints, end: false },
        { to: '/planner', label: t('nav.planner'), Icon: CalendarDays, end: false },
      ],
    },
    {
      label: t('nav.gAccount'),
      links: [{ to: '/profile', label: t('nav.profile'), Icon: UserRound, end: false }],
    },
  ];

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-brand" aria-label={t('app.name')}>
          <Brand />
        </NavLink>
        <nav className="nav" aria-label={t('nav.menu')}>
          {groups.map((g) => (
            <div className="nav-group" key={g.label}>
              <span className="nav-group-label">{g.label}</span>
              {g.links.map(({ to, label, Icon, end }) => (
                <NavLink key={to} to={to} end={end} className="nav-link">
                  <Icon size={19} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        {user && (
          <div className="sidebar-user">
            <span className="avatar sm">{initials(user.name)}</span>
            <span className="sidebar-user-text">
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </span>
            <button className="icon-btn" onClick={logout} aria-label={t('nav.logout')} title={t('nav.logout')}>
              <LogOut size={17} />
            </button>
          </div>
        )}
      </aside>

      <div className="main">
        <header className="topbar">
          <NavLink to="/" className="topbar-brand" aria-label={t('app.name')}>
            <Brand compact />
          </NavLink>
          <form className="topbar-search" onSubmit={onSearch} role="search">
            <Search size={17} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('top.search')} aria-label={t('top.search')} />
          </form>
          <button className="pill-btn" onClick={() => set({ lang: lang === 'en' ? 'ar' : 'en' })}>
            <Languages size={16} />
            <span>{t('top.lang')}</span>
          </button>
          <Notifications />
          <button
            className="icon-btn"
            onClick={() => set({ theme: resolvedTheme === 'dark' ? 'light' : 'dark' })}
            aria-label={t('top.theme')}
            title={t('top.theme')}
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user && (
            <NavLink to="/profile" className="avatar" aria-label={t('nav.profile')}>
              {initials(user.name)}
            </NavLink>
          )}
        </header>

        <main className="page">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
