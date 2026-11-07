import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarPlus, Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useT } from '../context/SettingsContext';
import { PACKING_ITEMS, useUserData } from '../context/UserDataContext';
import { useWhen } from '../lib/when';
import { trailById, trails } from '../data/trails';
import { useFormat } from '../lib/format';
import Card from '../components/ui/Card';
import TrailCover from '../components/ui/TrailCover';

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function Planner() {
  const t = useT();
  const f = useFormat();
  const when = useWhen();
  const { plans, addPlan, removePlan, hikes, checklist, toggleItem } = useUserData();
  const [params] = useSearchParams();
  const today = isoOf(new Date());

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [form, setForm] = useState({
    trailId: trailById(params.get('trail') ?? undefined)?.id ?? trails[0].id,
    date: today,
    note: '',
  });

  // Calendar grid: weeks start on Monday, 6 rows.
  const cells = useMemo(() => {
    const offset = (month.getDay() + 6) % 7;
    const start = new Date(month.getFullYear(), month.getMonth(), 1 - offset);
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [month]);

  const plansByDay = useMemo(() => {
    const m = new Map<string, typeof plans>();
    plans.forEach((p) => m.set(p.date, [...(m.get(p.date) ?? []), p]));
    return m;
  }, [plans]);
  const hikedDays = useMemo(() => new Set(hikes.map((h) => isoOf(new Date(h.date)))), [hikes]);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(f.locale, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i))); // 1 Jan 2024 = Monday
  }, [f.locale]);

  const upcoming = plans.filter((p) => p.date >= today);
  const packed = PACKING_ITEMS.filter((i) => checklist[i]).length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    addPlan({ trailId: form.trailId, date: form.date, note: form.note.trim() });
    setForm((s) => ({ ...s, note: '' }));
    const d = new Date(`${form.date}T00:00:00`);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const shiftMonth = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <h1>{t('plan.title')}</h1>
          <p className="muted">{t('plan.subtitle')}</p>
        </div>
      </header>

      <div className="grid">
        <Card
          className="span-8"
          title={f.date(`${isoOf(month)}T00:00:00`, { month: 'long', year: 'numeric' })}
          action={
            <div className="card-actions">
              <span className="legend">
                <i style={{ background: '#F6B733' }} /> {t('plan.legendPlan')}
                <i className="dot" /> {t('plan.legendHike')}
              </span>
              <span className="month-nav">
                <button className="icon-btn sm" onClick={() => shiftMonth(-1)} aria-label={t('plan.prevMonth')}>
                  <ChevronLeft size={17} className="flip-rtl" />
                </button>
                <button className="icon-btn sm" onClick={() => shiftMonth(1)} aria-label={t('plan.nextMonth')}>
                  <ChevronRight size={17} className="flip-rtl" />
                </button>
              </span>
            </div>
          }
        >
          <div className="calendar">
            {weekdays.map((w) => (
              <span key={w} className="cal-head">
                {w}
              </span>
            ))}
            {cells.map((d) => {
              const key = isoOf(d);
              const dayPlans = plansByDay.get(key) ?? [];
              const outside = d.getMonth() !== month.getMonth();
              return (
                <button
                  key={key}
                  className={`cal-day${outside ? ' outside' : ''}${key === today ? ' today' : ''}${form.date === key ? ' picked' : ''}`}
                  onClick={() => setForm((s) => ({ ...s, date: key }))}
                  aria-label={f.date(`${key}T00:00:00`, { day: 'numeric', month: 'long' })}
                >
                  <span className="cal-num">{d.getDate()}</span>
                  {hikedDays.has(key) && <i className="cal-hiked" />}
                  {dayPlans.map((p) => {
                    const tr = trailById(p.trailId);
                    return tr ? (
                      <span key={p.id} className="cal-plan">
                        {f.trailName(tr)}
                      </span>
                    ) : null;
                  })}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="span-4" title={t('plan.new')}>
          <form className="form" onSubmit={submit}>
            <label className="field">
              <span>{t('log.trail')}</span>
              <select className="input" value={form.trailId} onChange={(e) => setForm({ ...form, trailId: e.target.value })}>
                {trails.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {f.trailName(tr)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t('log.date')}</span>
              <input type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </label>
            <label className="field">
              <span>{t('plan.note')}</span>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t('plan.notePh')} />
            </label>
            <button className="btn primary" type="submit">
              <CalendarPlus size={17} /> {t('plan.add')}
            </button>
          </form>
        </Card>

        <Card className="span-8" title={t('plan.upcoming')}>
          {upcoming.length === 0 ? (
            <p className="empty">{t('plan.none')}</p>
          ) : (
            <ul className="plan-list">
              {upcoming.map((p) => {
                const tr = trailById(p.trailId);
                if (!tr) return null;
                return (
                  <li key={p.id} className="plan-item">
                    <div className="plan-date">
                      <b>{new Date(`${p.date}T00:00:00`).getDate()}</b>
                      <small>{f.date(`${p.date}T00:00:00`, { month: 'short' })}</small>
                    </div>
                    <TrailCover trail={tr} className="plan-cover" />
                    <div className="plan-body">
                      <Link to={`/trails/${tr.id}`}>
                        <strong>{f.trailName(tr)}</strong>
                      </Link>
                      <small className="muted">
                        {f.distance(tr.distance)} · {f.elevation(tr.gain)}
                        {p.note && ` · ${p.note}`}
                      </small>
                    </div>
                    <span className="chip when">{when(p.date)}</span>
                    <button className="icon-btn sm" onClick={() => removePlan(p.id)} aria-label={t('plan.remove')} title={t('plan.remove')}>
                      <Trash2 size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="span-4" title={t('plan.checklist')} action={<span className="muted small">{t('plan.packed', { a: packed, b: PACKING_ITEMS.length })}</span>}>
          <span className="bar">
            <i style={{ width: `${(packed / PACKING_ITEMS.length) * 100}%` }} />
          </span>
          <ul className="checklist">
            {PACKING_ITEMS.map((item) => (
              <li key={item}>
                <label className={`check${checklist[item] ? ' on' : ''}`}>
                  <input type="checkbox" checked={!!checklist[item]} onChange={() => toggleItem(item)} />
                  <span className="check-box">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {t(`pack.${item}`)}
                </label>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
