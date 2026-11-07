import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Footprints, Mountain, Route, Star, Timer, TrendingDown, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings, useT } from '../context/SettingsContext';
import { dailyGrid, kpis, monthly, yearToDate } from '../data/activity';
import { useUserData } from '../context/UserDataContext';
import { trailById, trails } from '../data/trails';
import { useFormat } from '../lib/format';
import Card from '../components/ui/Card';
import Segmented from '../components/ui/Segmented';
import TrailCover from '../components/ui/TrailCover';
import ActivityChart from '../components/charts/ActivityChart';
import Sparkline from '../components/charts/Sparkline';
import Heatmap from '../components/charts/Heatmap';
import GoalRing from '../components/charts/GoalRing';
import WeatherCard from '../components/weather/WeatherCard';

const HEAT_WEEKS = 18;

function Delta({ cur, prev, label }: { cur: number; prev: number; label: string }) {
  const pct = prev ? Math.round(((cur - prev) / prev) * 100) : 0;
  const up = pct >= 0;
  return (
    <span className={`delta ${up ? 'up' : 'down'}`} title={label}>
      {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {up ? '+' : ''}
      {pct}%
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { goalKm } = useSettings();
  const t = useT();
  const f = useFormat();
  const [range, setRange] = useState<'6' | '12'>('12');
  const { hikes } = useUserData();

  const k = useMemo(() => kpis(hikes), [hikes]);
  const months = useMemo(() => monthly(hikes, Number(range), f.locale), [hikes, range, f.locale]);
  const ytd = useMemo(() => yearToDate(hikes), [hikes]);
  const cells = useMemo(() => dailyGrid(hikes, HEAT_WEEKS), [hikes]);
  const featured = trailById('lauberhorn-ridge') ?? trails[0];

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'greet.morning' : hour < 18 ? 'greet.afternoon' : 'greet.evening';
  const firstName = user?.name.split(' ')[0] ?? '';

  const tiles = [
    { label: t('kpi.distance'), Icon: Route, value: f.distance(k.current.distance), cur: k.current.distance, prev: k.previous.distance, spark: k.weeks.map((w) => w.distance) },
    { label: t('kpi.elevation'), Icon: Mountain, value: f.elevation(k.current.gain), cur: k.current.gain, prev: k.previous.gain, spark: k.weeks.map((w) => w.gain) },
    { label: t('kpi.hikes'), Icon: Footprints, value: f.num(k.current.count, 0), cur: k.current.count, prev: k.previous.count, spark: k.weeks.map((w) => w.count) },
    { label: t('kpi.time'), Icon: Timer, value: f.duration(k.current.minutes), cur: k.current.minutes, prev: k.previous.minutes, spark: k.weeks.map((w) => w.minutes) },
  ];

  const progress = ytd.distance / goalKm;

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <h1>{t(greetKey, { name: firstName })}</h1>
          <p className="muted">{t('dash.subtitle')}</p>
        </div>
        <span className="chip mono">{t('kpi.period')}</span>
      </header>

      <div className="kpis">
        {tiles.map((tile) => (
          <section className="card kpi" key={tile.label}>
            <div className="kpi-top">
              <span className="icon-square">
                <tile.Icon size={18} />
              </span>
              <span className="kpi-label">{tile.label}</span>
              <Delta cur={tile.cur} prev={tile.prev} label={t('kpi.vs')} />
            </div>
            <div className="kpi-value">{tile.value}</div>
            <Sparkline values={tile.spark} />
          </section>
        ))}
      </div>

      <div className="grid">
        <Card
          className="span-8"
          title={t('chart.activity')}
          action={
            <div className="card-actions">
              <span className="legend">
                <i style={{ background: '#F6B733' }} /> {t('chart.distance')}
                <i className="line" /> {t('chart.elevation')}
              </span>
              <Segmented
                label={t('chart.activity')}
                value={range}
                onChange={setRange}
                options={[
                  { value: '6', label: t('range.6') },
                  { value: '12', label: t('range.12') },
                ]}
              />
            </div>
          }
        >
          <ActivityChart data={months} />
        </Card>

        <WeatherCard className="span-4" lat={46.6863} lng={7.8632} place={user?.location.split(',')[0] ?? 'Interlaken'} />

        <Card className="span-8" title={t('recent.title')} action={<Link className="link" to="/hikes">{t('common.viewAll')}</Link>}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('col.date')}</th>
                  <th>{t('col.trail')}</th>
                  <th className="num">{t('col.distance')}</th>
                  <th className="num">{t('col.gain')}</th>
                  <th className="num">{t('col.time')}</th>
                </tr>
              </thead>
              <tbody>
                {hikes.slice(0, 6).map((h) => {
                  const tr = trailById(h.trailId)!;
                  return (
                    <tr key={h.id}>
                      <td className="mono-sm">{f.date(h.date)}</td>
                      <td>
                        <Link to={`/trails/${tr.id}`} className="table-trail">
                          <TrailCover trail={tr} className="thumb" />
                          <span>
                            <strong>{f.trailName(tr)}</strong>
                            <small>{f.trailRegion(tr)}</small>
                          </span>
                        </Link>
                      </td>
                      <td className="num">{f.distance(h.distance)}</td>
                      <td className="num">{f.elevation(h.gain)}</td>
                      <td className="num">{f.duration(h.minutes)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="span-4 goal" title={t('goal.title')}>
          <GoalRing value={progress}>
            <strong>{f.num(Math.min(progress, 9.99) * 100, 0)}%</strong>
            <small>{t('goal.of', { goal: f.distance(goalKm, 0) })}</small>
          </GoalRing>
          <p className="goal-caption">
            {progress >= 1 ? t('goal.done') : t('goal.left', { left: f.distance(goalKm - ytd.distance, 0) })}
          </p>
          <div className="mini-stats">
            <span>
              <small>{t('kpi.distance')}</small>
              <b>{f.distance(ytd.distance, 0)}</b>
            </span>
            <span>
              <small>{t('kpi.elevation')}</small>
              <b>{f.elevation(ytd.gain)}</b>
            </span>
            <span>
              <small>{t('kpi.hikes')}</small>
              <b>{ytd.count}</b>
            </span>
          </div>
        </Card>

        <Card className="span-7" title={t('heat.title')} action={<span className="muted small">{t('heat.sub')}</span>}>
          <Heatmap cells={cells} weeks={HEAT_WEEKS} />
        </Card>

        <Link to={`/trails/${featured.id}`} className="card span-5 featured">
          <TrailCover trail={featured} className="featured-cover" />
          <div className="featured-body">
            <span className="chip light mono">{t('feat.title')}</span>
            <h3>{f.trailName(featured)}</h3>
            <p>
              <Star size={14} fill="currentColor" /> {featured.rating} · {f.distance(featured.distance)} · {f.difficulty(featured.difficulty)}
            </p>
            <span className="featured-cta">
              {t('feat.cta')} <ArrowRight size={16} className="flip-rtl" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
