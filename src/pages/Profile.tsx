import { useMemo, useState, type FormEvent } from 'react';
import { Award, Check, Flag, Footprints, Lock, MapPin, Medal, Mountain, Route, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings, useT, type Lang, type ThemePref, type Units } from '../context/SettingsContext';
import { totals } from '../data/activity';
import { useUserData } from '../context/UserDataContext';
import type { TKey } from '../i18n/en';
import { useFormat } from '../lib/format';
import Card from '../components/ui/Card';
import Segmented from '../components/ui/Segmented';
import { initials } from '../components/layout/AppShell';

export default function Profile() {
  const { user, update } = useAuth();
  const settings = useSettings();
  const t = useT();
  const f = useFormat();

  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', location: user?.location ?? '' });
  const [savedFlash, setSavedFlash] = useState(false);

  const { hikes } = useUserData();
  const all = useMemo(() => totals(hikes), [hikes]);
  const uniqueTrails = useMemo(() => new Set(hikes.map((h) => h.trailId)).size, [hikes]);
  const longest = useMemo(() => Math.max(0, ...hikes.map((h) => h.distance)), [hikes]);

  if (!user) return null;

  const achievements: { title: TKey; desc: TKey; Icon: typeof Award; progress: number }[] = [
    { title: 'ach.first', desc: 'ach.firstD', Icon: Flag, progress: Math.min(1, all.count) },
    { title: 'ach.century', desc: 'ach.centuryD', Icon: Route, progress: all.distance / 100 },
    { title: 'ach.summit', desc: 'ach.summitD', Icon: Mountain, progress: all.gain / 10000 },
    { title: 'ach.explorer', desc: 'ach.explorerD', Icon: MapPin, progress: uniqueTrails / 6 },
    { title: 'ach.long', desc: 'ach.longD', Icon: Medal, progress: longest / 15 },
    { title: 'ach.regular', desc: 'ach.regularD', Icon: Trophy, progress: all.count / 50 },
  ];

  const save = (e: FormEvent) => {
    e.preventDefault();
    update({ name: form.name.trim() || user.name, email: form.email.trim() || user.email, location: form.location.trim() });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  return (
    <div className="stack">
      <section className="card profile-head">
        <span className="avatar xl">{initials(user.name)}</span>
        <div className="profile-id">
          <h1>{user.name}</h1>
          <p className="muted">
            {user.email} · {user.location}
          </p>
          <span className="chip mono">{t('profile.since', { date: f.date(user.joined, { month: 'long', year: 'numeric' }) })}</span>
        </div>
        <div className="profile-totals">
          <small className="mono-label">{t('profile.allTime')}</small>
          <div>
            <span>
              <Route size={16} /> <b>{f.distance(all.distance, 0)}</b>
            </span>
            <span>
              <Mountain size={16} /> <b>{f.elevation(all.gain)}</b>
            </span>
            <span>
              <Footprints size={16} /> <b>{all.count}</b>
            </span>
          </div>
        </div>
      </section>

      <div className="grid">
        <Card className="span-6" title={t('profile.personal')}>
          <form className="form" onSubmit={save}>
            <label className="field">
              <span>{t('profile.name')}</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
            </label>
            <label className="field">
              <span>{t('profile.email')}</span>
              <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            </label>
            <label className="field">
              <span>{t('profile.location')}</span>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </label>
            <button className="btn primary" type="submit">
              {savedFlash ? (
                <>
                  <Check size={16} /> {t('common.saved')}
                </>
              ) : (
                t('common.save')
              )}
            </button>
          </form>
        </Card>

        <Card className="span-6" title={t('profile.prefs')}>
          <div className="prefs">
            <div className="pref">
              <span>{t('profile.language')}</span>
              <Segmented<Lang>
                label={t('profile.language')}
                value={settings.lang}
                onChange={(lang) => settings.set({ lang })}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'ar', label: 'العربية' },
                ]}
              />
            </div>
            <div className="pref">
              <span>{t('profile.theme')}</span>
              <Segmented<ThemePref>
                label={t('profile.theme')}
                value={settings.theme}
                onChange={(theme) => settings.set({ theme })}
                options={[
                  { value: 'light', label: t('theme.light') },
                  { value: 'dark', label: t('theme.dark') },
                  { value: 'system', label: t('theme.system') },
                ]}
              />
            </div>
            <div className="pref">
              <span>{t('profile.units')}</span>
              <Segmented<Units>
                label={t('profile.units')}
                value={settings.units}
                onChange={(units) => settings.set({ units })}
                options={[
                  { value: 'metric', label: t('units.metric') },
                  { value: 'imperial', label: t('units.imperial') },
                ]}
              />
            </div>
            <label className="pref">
              <span>
                {t('profile.goal')} <b className="mono-sm">{settings.goalKm}</b>
              </span>
              <input
                type="range"
                min={100}
                max={1500}
                step={50}
                value={settings.goalKm}
                onChange={(e) => settings.set({ goalKm: Number(e.target.value) })}
              />
            </label>
          </div>
        </Card>

        <Card className="span-12" title={t('profile.badges')}>
          <ul className="badges">
            {achievements.map((a) => {
              const p = Math.min(1, a.progress);
              const done = p >= 1;
              return (
                <li key={a.title} className={`badge${done ? ' done' : ''}`}>
                  <span className="badge-icon">{done ? <a.Icon size={22} /> : <Lock size={18} />}</span>
                  <strong>{t(a.title)}</strong>
                  <small className="muted">{t(a.desc)}</small>
                  <span className="bar">
                    <i style={{ width: `${p * 100}%` }} />
                  </span>
                  <small className="mono-sm">{Math.round(p * 100)}%</small>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
