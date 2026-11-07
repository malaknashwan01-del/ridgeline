import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type TKey } from '../i18n/en';
import { ar } from '../i18n/ar';

export type Lang = 'en' | 'ar';
export type ThemePref = 'light' | 'dark' | 'system';
export type Units = 'metric' | 'imperial';

export interface Settings {
  lang: Lang;
  theme: ThemePref;
  units: Units;
  goalKm: number;
}

const KEY = 'ridgeline.settings';
const defaults: Settings = { lang: 'en', theme: 'system', units: 'metric', goalKm: 500 };

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

interface Ctx extends Settings {
  set: (patch: Partial<Settings>) => void;
  resolvedTheme: 'light' | 'dark';
  dir: 'ltr' | 'rtl';
  locale: string;
}

const SettingsContext = createContext<Ctx | null>(null);

function useSystemDark() {
  const query = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return dark;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);
  const systemDark = useSystemDark();
  const resolvedTheme = settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : settings.theme;
  const dir = settings.lang === 'ar' ? 'rtl' : 'ltr';

  const set = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep in memory */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = settings.lang;
    root.dir = dir;
    root.dataset.theme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#171614' : '#F4F0E9');
  }, [settings.lang, dir, resolvedTheme]);

  const value = useMemo<Ctx>(
    () => ({
      ...settings,
      set,
      resolvedTheme,
      dir,
      // Arabic UI with Latin digits keeps numbers and charts consistent.
      locale: settings.lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB',
    }),
    [settings, set, resolvedTheme, dir]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}

const dictionaries = { en, ar };

export function useT() {
  const { lang } = useSettings();
  return useCallback(
    (key: TKey, vars?: Record<string, string | number>) => {
      let text: string = dictionaries[lang][key] ?? en[key];
      if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
      return text;
    },
    [lang]
  );
}
