import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarPlus, Clock, Mountain, MountainSnow, MousePointer2, Route, Star } from 'lucide-react';
import { useUserData } from '../context/UserDataContext';
import { useT, useSettings } from '../context/SettingsContext';
import { reviews, trailById } from '../data/trails';
import { media } from '../data/media';
import { difficultyColor, useFormat } from '../lib/format';
import { routeIndexFor } from '../lib/geo';
import Card from '../components/ui/Card';
import TrailCover from '../components/ui/TrailCover';
import SmartImg from '../components/ui/SmartImg';
import RouteMap from '../components/map/RouteMap';
import ElevationChart from '../components/charts/ElevationChart';
import WeatherCard from '../components/weather/WeatherCard';

export default function TrailDetail() {
  const { id } = useParams();
  const trail = trailById(id);
  const t = useT();
  const f = useFormat();
  const { lang } = useSettings();
  const [hover, setHover] = useState<number | null>(null);
  const { isSaved, toggleSaved } = useUserData();

  if (!trail) {
    return (
      <div className="card empty-state">
        <h1>{t('trail.notFound')}</h1>
        <Link className="btn" to="/explore">
          {t('trail.back')}
        </Link>
      </div>
    );
  }

  const saved = isSaved(trail.id);

  const hoverPoint = hover === null ? null : trail.route[routeIndexFor(hover, trail.profile.length, trail.route.length)];
  const stats = [
    { Icon: Route, label: t('trail.distance'), value: f.distance(trail.distance) },
    { Icon: Clock, label: t('trail.duration'), value: t('trail.hours', { a: trail.duration[0], b: trail.duration[1] }) },
    { Icon: Mountain, label: t('trail.gain'), value: f.elevation(trail.gain) },
    { Icon: MountainSnow, label: t('trail.max'), value: f.elevation(trail.maxElevation) },
  ];

  return (
    <div className="stack">
      <section className="trail-hero">
        <TrailCover trail={trail} className="trail-hero-cover" />
        <div className="trail-hero-shade" />
        <div className="trail-hero-top">
          <Link to="/explore" className="glass-btn">
            <ArrowLeft size={16} className="flip-rtl" /> {t('trail.back')}
          </Link>
          <div className="hero-actions">
            <Link to={`/planner?trail=${trail.id}`} className="glass-btn">
              <CalendarPlus size={16} /> {t('trail.plan')}
            </Link>
            <button className={`glass-btn${saved ? ' on' : ''}`} onClick={() => toggleSaved(trail.id)} aria-pressed={saved}>
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} {saved ? t('trail.saved') : t('trail.save')}
            </button>
          </div>
        </div>
        <div className="trail-hero-body">
          <p className="crumb">
            {lang === 'ar' ? 'سويسرا' : 'Switzerland'} / {f.trailRegion(trail)}
          </p>
          <h1>{f.trailName(trail)}</h1>
          <div className="chips-row">
            <span className="chip peach mono">
              <i className="chip-dot">
                <Star size={11} fill="currentColor" />
              </i>
              {trail.rating} ({t('trail.reviews', { n: trail.reviews })})
            </span>
            <span className="chip peach mono">
              <i className="chip-dot" style={{ background: difficultyColor[trail.difficulty] }} />
              {f.difficulty(trail.difficulty)}
            </span>
          </div>
        </div>
      </section>

      <div className="stat-row">
        {stats.map((s) => (
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

      <div className="grid">
        <Card className="span-7 map-card" title={t('trail.route')}>
          <RouteMap trail={trail} hoverPoint={hoverPoint} />
        </Card>
        <WeatherCard className="span-5" lat={trail.lat} lng={trail.lng} place={f.trailRegion(trail)} />

        <Card
          className="span-12"
          title={t('trail.profile')}
          action={
            <span className="muted small hint">
              <MousePointer2 size={14} /> {t('trail.hover')}
            </span>
          }
        >
          <ElevationChart profile={trail.profile} onHover={setHover} />
        </Card>

        <Card className="span-7" title={t('trail.about')}>
          <p className="prose">{trail.description[lang]}</p>
          {trail.id === 'lauberhorn-ridge' && (
            <>
              <h3 className="sub-title">{t('trail.gallery')}</h3>
              <div className="gallery">
                <div className="gallery-item">
                  <SmartImg sources={media.hero} alt={trail.name} />
                </div>
                <div className="gallery-item">
                  <SmartImg sources={media.hiker} alt={trail.name} position="72% 50%" />
                </div>
              </div>
            </>
          )}
        </Card>

        <Card className="span-5" title={t('trail.reviewsTitle')} action={<span className="muted small">{t('trail.reviews', { n: trail.reviews })}</span>}>
          <ul className="reviews">
            {reviews.map((r) => (
              <li key={r.id}>
                <div className="review-head">
                  <span className="avatar sm">{r.author[0]}</span>
                  <strong>{r.author}</strong>
                  <span className="stars" aria-label={`${r.rating}/5`}>
                    {'★'.repeat(r.rating)}
                    <span className="dim">{'★'.repeat(5 - r.rating)}</span>
                  </span>
                  <small className="muted">{f.date(r.date, { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                </div>
                <p>{r.text[lang]}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
