import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Hike, Plan } from '../data/types';
import { hikes as generatedHikes } from '../data/activity';

/** Everything the user creates: logged hikes, plans, saved trails, packing list. Persisted in localStorage. */

const KEYS = {
  logged: 'ridgeline.logged',
  plans: 'ridgeline.plans',
  saved: 'ridgeline.saved',
  checklist: 'ridgeline.checklist',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function usePersisted<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(() => read(key, initial()));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

const isoDay = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const PACKING_ITEMS = ['water', 'layers', 'rain', 'snacks', 'map', 'firstaid', 'sun', 'headlamp'] as const;
export type PackingItem = (typeof PACKING_ITEMS)[number];

interface Ctx {
  hikes: Hike[];
  isLogged: (id: string) => boolean;
  addHike: (h: Omit<Hike, 'id'>) => void;
  removeHike: (id: string) => void;
  plans: Plan[];
  addPlan: (p: Omit<Plan, 'id'>) => void;
  removePlan: (id: string) => void;
  saved: string[];
  isSaved: (trailId: string) => boolean;
  toggleSaved: (trailId: string) => void;
  checklist: Partial<Record<PackingItem, boolean>>;
  toggleItem: (item: PackingItem) => void;
}

const UserDataContext = createContext<Ctx | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [logged, setLogged] = usePersisted<Hike[]>(KEYS.logged, () => []);
  const [plans, setPlans] = usePersisted<Plan[]>(KEYS.plans, () => [
    { id: 'p-demo-1', trailId: 'five-lakes', date: isoDay(4), note: 'Sunrise start with Lena' },
    { id: 'p-demo-2', trailId: 'aletsch-view', date: isoDay(12), note: '' },
  ]);
  const [saved, setSaved] = usePersisted<string[]>(KEYS.saved, () => ['lauberhorn-ridge', 'five-lakes', 'aletsch-view']);
  const [checklist, setChecklist] = usePersisted<Ctx['checklist']>(KEYS.checklist, () => ({ water: true, layers: true }));

  const hikes = useMemo(
    () => [...logged, ...generatedHikes].sort((a, b) => b.date.localeCompare(a.date)),
    [logged]
  );

  const value = useMemo<Ctx>(
    () => ({
      hikes,
      isLogged: (id) => id.startsWith('u'),
      addHike: (h) => setLogged((list) => [{ ...h, id: uid('u') }, ...list]),
      removeHike: (id) => setLogged((list) => list.filter((h) => h.id !== id)),
      plans: [...plans].sort((a, b) => a.date.localeCompare(b.date)),
      addPlan: (p) => setPlans((list) => [...list, { ...p, id: uid('p') }]),
      removePlan: (id) => setPlans((list) => list.filter((p) => p.id !== id)),
      saved,
      isSaved: (id) => saved.includes(id),
      toggleSaved: (id) => setSaved((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])),
      checklist,
      toggleItem: (item) => setChecklist((c) => ({ ...c, [item]: !c[item] })),
    }),
    [hikes, plans, saved, checklist, setLogged, setPlans, setSaved, setChecklist]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used inside UserDataProvider');
  return ctx;
}

/** Whole days from today to an ISO date (YYYY-MM-DD). */
export function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${date}T00:00:00`);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

