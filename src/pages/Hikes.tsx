import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Footprints, Mountain, Plus, Route, Search, Timer, Trash2, UserRound } from 'lucide-react';
import { useT } from '../context/SettingsContext';
import { useUserData } from '../context/UserDataContext';
import { monthly, totals } from '../data/activity';
import { trailById, trails } from '../data/trails';
import { useFormat } from '../lib/format';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Segmented from '../components/ui/Segmented';
import TrailCover from '../components/ui/TrailCover';
import ActivityChart from '../components/charts/ActivityChart';

type Period = '30' | '90' | 'year' | 'all';
const PAGE_SIZE = 10;
const DAY = 86_400_000;

function periodStart(p: Period) {
  const now = new Date();
  if (p === '30') return now.getTime() - 30 * DAY;
  if (p === '90') return now.getTime() - 90 * DAY;
  if (p === 'year') return new Date(now.getFullYear(), 0, 1).getTime();
  return 0;
}

function LogHikeModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const f = useFormat();
  const { addHike } = useUserData();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ trailId: trails[0].id, date: today, distance: String(trails[0].distance), gain: String(trails[0].gain), minutes: '150' });
  const [error, setError] = useState(false);

  const pickTrail = (id: string) => {
    const tr = trailById(id)!;
    setForm((s) => ({ ...s, trailId: id, distance: String(tr.distance), gain: String(tr.gain), minutes: String(Math.round(((tr.duration[0] + tr.duration[1]) / 2) * 60)) }));
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const distance = Number(form.distance);
    const gain = Number(form.gain);
    const minutes = Number(form.minutes);
    if (!form.date || !(distance > 0) || !(gain > 0) || !(minutes > 0)) {
      setError(true);
      return;
    }
    addHike({ trailId: form.trailId, date: new Date(`${form.date}T09:00:00`).toISOString(), distance, gain, minutes });
    onClose();
  };

  return (
    <Modal title={t('log.title')} closeLabel={t('log.close')} onClose={onClose}>
      <form className="form" onSubmit={save}>
        <label className="field">
          <span>{t('log.trail')}</span>
          <select className="input" value={form.trailId} onChange={(e) => pickTrail(e.target.value)}>
            {trails.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {f.trailName(tr)}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label className="field">
            <span>{t('log.date')}</span>
            <input type="date" max={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          <label className="field">
            <span>{t('log.distance')}</span>
            <input type="number" inputMode="decimal" step="0.1" min="0" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
          </label>
          <label className="field">
            <span>{t('log.gain')}</span>
            <input type="number" inputMode="numeric" min="0" value={form.gain} onChange={(e) => setForm({ ...form, gain: e.target.value })} />
          </label>
          <label className="field">
            <span>{t('log.duration')}</span>
            <input type="number" inputMode="numeric" min="0" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} />
          </label>
        </div>
        {error && <p className="field-error">{t('log.err')}</p>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            {t('log.cancel')}
          </button>
          <button type="submit" className="btn primary">
            {t('log.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Hikes() {
  const t = useT();
  const f = useFormat();
  const { hikes, isLogged, removeHike } = useUserData();
  const [period, setPeriod] = useState<Period>('year');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [logging, setLogging] = useState(false);

  const filtered = useMemo(() => {
    const from = periodStart(period);
    const needle = q.trim().toLowerCase();
    return hikes.filter((h) => {
      if (new Date(h.date).getTime() < from) return false;
      if (!needle) return true;
      const tr = trailById(h.trailId);
      return !!tr && [tr.name, tr.nameAr, tr.region, tr.regionAr].some((s) => s.toLowerCase().includes(needle));
    });
  }, [hikes, period, q]);

  const sum = useMemo(() => totals(filtered), [filtered]);
  const months = useMemo(() => monthly(filtered, period === '30' ? 2 : period === '90' ? 3 : period === 'year' ? new Date().getMonth() + 1 : 12, f.locale), [filtered, period, f.locale]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const setFilter = (fn: () => void) => {
    fn();
    setPage(0);
  };

  const pace = (min: number, km: number) => {
    const perUnit = min / f.distanceValue(km);
    const m = Math.floor(perUnit);
    const s = Math.round((perUnit - m) * 60);
    return `${m}:${String(s).padStart(2, '0')} /${f.distanceUnit}`;
  };

  const tiles = [
    { Icon: Route, label: t('kpi.distance'), value: f.distance(sum.distance, 0) },
    { Icon: Mountain, label: t('kpi.elevation'), value: f.elevation(sum.gain) },
    { Icon: Footprints, label: t('kpi.hikes'), value: String(sum.count) },
    { Icon: Timer, label: t('kpi.time'), value: f.duration(sum.minutes) },
  ];

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <h1>{t('hikes.title')}</h1>
          <p className="muted">{t('hikes.subtitle', { n: filtered.length })}</p>
        </div>
        <button className="btn primary" onClick={() => setLogging(true)}>
          <Plus size={17} /> {t('hikes.log')}
        </button>
      </header>

      <div className="toolbar">
        <Segmented<Period>
          label={t('hikes.title')}
          value={period}
          onChange={(v) => setFilter(() => setPeriod(v))}
          options={[
            { value: '30', label: t('period.30') },
            { value: '90', label: t('period.90') },
            { value: 'year', label: t('period.year') },
            { value: 'all', label: t('period.all') },
          ]}
        />
        <div className="search-field slim">
          <Search size={16} />
          <input value={q} onChange={(e) => setFilter(() => setQ(e.target.value))} placeholder={t('hikes.search')} aria-label={t('hikes.search')} />
        </div>
      </div>

      <div className="stat-row">
        {tiles.map((s) => (
          <div className="card stat" key={s.label}>
            <span className="icon-square">
              <s.Icon size={18} />
            </span>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Card title={t('hikes.perMonth')}>
        <ActivityChart data={months} />
      </Card>

      <Card title={t('recent.title')} action={<span className="muted small">{t('hikes.page', { a: current + 1, b: pages })}</span>}>
        {rows.length === 0 ? (
          <p className="empty">{t('hikes.empty')}</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('col.date')}</th>
                  <th>{t('col.trail')}</th>
                  <th className="num">{t('col.distance')}</th>
                  <th className="num">{t('col.gain')}</th>
                  <th className="num">{t('col.time')}</th>
                  <th className="num">{t('col.pace')}</th>
                  <th aria-label="actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((h) => {
                  const tr = trailById(h.trailId)!;
                  const mine = isLogged(h.id);
                  return (
                    <tr key={h.id}>
                      <td className="mono-sm">{f.date(h.date, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <Link to={`/trails/${tr.id}`} className="table-trail">
                          <TrailCover trail={tr} className="thumb" />
                          <span>
                            <strong>{f.trailName(tr)}</strong>
                            <small>
                              {mine ? (
                                <span className="mine">
                                  <UserRound size={11} /> {t('hikes.mine')}
                                </span>
                              ) : (
                                f.trailRegion(tr)
                              )}
                            </small>
                          </span>
                        </Link>
                      </td>
                      <td className="num">{f.distance(h.distance)}</td>
                      <td className="num">{f.elevation(h.gain)}</td>
                      <td className="num">{f.duration(h.minutes)}</td>
                      <td className="num mono-sm">{pace(h.minutes, h.distance)}</td>
                      <td className="num">
                        {mine && (
                          <button className="icon-btn sm" onClick={() => removeHike(h.id)} aria-label={t('hikes.delete')} title={t('hikes.delete')}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="pager">
            <button className="pill-btn" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeft size={16} className="flip-rtl" /> {t('hikes.prev')}
            </button>
            <span className="mono-sm">
              {current + 1} / {pages}
            </span>
            <button className="pill-btn" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
              {t('hikes.next')} <ChevronRight size={16} className="flip-rtl" />
            </button>
          </div>
        )}
      </Card>

      {logging && <LogHikeModal onClose={() => setLogging(false)} />}
    </div>
  );
}
