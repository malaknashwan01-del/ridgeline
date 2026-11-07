import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarClock, Leaf, Target, Trophy, type LucideIcon } from 'lucide-react';
import { useSettings, useT } from '../../context/SettingsContext';
import { useUserData } from '../../context/UserDataContext';
import { yearToDate } from '../../data/activity';
import { trailById } from '../../data/trails';
import { useFormat } from '../../lib/format';
import { useWhen } from '../../lib/when';

interface Item {
  id: string;
  Icon: LucideIcon;
  text: string;
  to: string;
}

const READ_KEY = 'ridgeline.notifRead';

export default function Notifications() {
  const t = useT();
  const f = useFormat();
  const when = useWhen();
  const { goalKm } = useSettings();
  const { plans, hikes } = useUserData();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(READ_KEY) ?? '[]');
    } catch {
      return [];
    }
  });
  const ref = useRef<HTMLDivElement>(null);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    const today = new Date().toISOString().slice(0, 10);
    const next = plans.find((p) => p.date >= today);
    const nextTrail = next && trailById(next.trailId);
    if (next && nextTrail) {
      out.push({ id: `plan-${next.id}`, Icon: CalendarClock, text: t('notif.plan', { trail: f.trailName(nextTrail), when: when(next.date) }), to: '/planner' });
    }
    const pct = Math.round((yearToDate(hikes).distance / goalKm) * 100);
    out.push({ id: `goal-${Math.floor(pct / 10)}`, Icon: Target, text: t('notif.goal', { pct }), to: '/' });
    out.push({ id: 'badge-explorer', Icon: Trophy, text: t('notif.badge', { name: t('ach.explorer') }), to: '/profile' });
    const larch = trailById('lauberhorn-ridge');
    if (larch) out.push({ id: 'tip-larch', Icon: Leaf, text: t('notif.tip', { trail: f.trailName(larch) }), to: `/trails/${larch.id}` });
    return out;
  }, [plans, hikes, goalKm, t, f, when]);

  const unread = items.filter((i) => !readIds.includes(i.id)).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const markAll = () => {
    const ids = items.map((i) => i.id);
    setReadIds(ids);
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="notif" ref={ref}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label={t('notif.open')} aria-expanded={open}>
        <Bell size={18} />
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>
      {open && (
        <div className="notif-panel" role="dialog" aria-label={t('notif.title')}>
          <header>
            <strong>{t('notif.title')}</strong>
            {unread > 0 && (
              <button className="link" onClick={markAll}>
                {t('notif.read')}
              </button>
            )}
          </header>
          <ul>
            {items.map((i) => (
              <li key={i.id} className={readIds.includes(i.id) ? '' : 'unread'}>
                <Link to={i.to} onClick={() => setOpen(false)}>
                  <span className="icon-square">
                    <i.Icon size={17} />
                  </span>
                  <span>{i.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
