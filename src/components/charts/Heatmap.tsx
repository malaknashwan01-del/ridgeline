import { useT } from '../../context/SettingsContext';
import { useFormat } from '../../lib/format';

interface Cell {
  key: string;
  value: number; // km, -1 = future
}

const level = (v: number) => (v <= 0 ? 0 : v < 5 ? 1 : v < 8 ? 2 : v < 12 ? 3 : 4);

export default function Heatmap({ cells, weeks }: { cells: Cell[]; weeks: number }) {
  const t = useT();
  const f = useFormat();
  return (
    <div>
      <div className="heatmap" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }} role="img" aria-label={t('heat.title')}>
        {cells.map((c) => (
          <span
            key={c.key}
            className={`heat-cell l${c.value < 0 ? 'x' : level(c.value)}`}
            title={c.value >= 0 ? `${f.date(c.key, { day: 'numeric', month: 'short' })} · ${c.value ? f.distance(c.value) : '—'}` : undefined}
          />
        ))}
      </div>
      <div className="heat-legend">
        <span>{t('heat.less')}</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`heat-cell l${l}`} />
        ))}
        <span>{t('heat.more')}</span>
      </div>
    </div>
  );
}
