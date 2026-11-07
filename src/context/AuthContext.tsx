import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { User } from '../data/types';

const KEY = 'ridgeline.user';

function load(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persist(user: User | null) {
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

interface Ctx {
  user: User | null;
  login: (email: string, name?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  update: (patch: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<Ctx | null>(null);

const nameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ') || 'Hiker';

// Simulated network latency so loading states are visible — swap for a real API later.
const fakeRequest = () => new Promise((r) => setTimeout(r, 650));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(load);

  const save = useCallback((u: User | null) => {
    persist(u);
    setUser(u);
  }, []);

  const login = useCallback(
    async (email: string, name?: string) => {
      await fakeRequest();
      save({ name: name?.trim() || nameFromEmail(email), email, location: 'Interlaken, Switzerland', joined: new Date().toISOString() });
    },
    [save]
  );

  const loginDemo = useCallback(async () => {
    await fakeRequest();
    save({ name: 'Mira Holt', email: 'mira@ridgeline.app', location: 'Interlaken, Switzerland', joined: '2024-04-18T00:00:00.000Z' });
  }, [save]);

  const update = useCallback((patch: Partial<User>) => setUser((u) => {
    if (!u) return u;
    const next = { ...u, ...patch };
    persist(next);
    return next;
  }), []);

  const logout = useCallback(() => save(null), [save]);

  const value = useMemo(() => ({ user, login, loginDemo, update, logout }), [user, login, loginDemo, update, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
