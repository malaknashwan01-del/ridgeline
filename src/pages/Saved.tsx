import { Link } from 'react-router-dom';
import { BookmarkX, CalendarPlus, Clock, Compass, Mountain, Route, Star } from 'lucide-react';
import { useT } from '../context/SettingsContext';
import { useUserData } from '../context/UserDataContext';
import { trailById } from '../data/trails';
import type { Trail } from '../data/types';
import { difficultyColor, useFormat } from '../lib/format';
import TrailCover from '../components/ui/TrailCover';

export default function Saved() {
  const t = useT();
  const f = useFormat();
  const { saved, toggleSaved } = useUserData();
  const list = saved.map((id) => trailById(id)).filter((tr): tr is Trail => !!tr);

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <h1>{t('saved.title')}</h1>
          <p className="muted">{t('saved.subtitle', { n: list.length })}</p>
        </div>
      </header>

      {list.length === 0 ? (
        <div className="card empty-state">
          <Compass size={40} strokeWidth={1.4} />
          <h1>{t('saved.empty')}</h1>
          <Link className="btn primary" to="/explore">
            {t('saved.cta')}
          </Link>
        </div>
      ) : (
        <ul className="saved-grid">
          {list.map((tr) => (
            <li key={tr.id} className="card saved-card">
              <Link to={`/trails/${tr.id}`} className="saved-cover-link">
                <TrailCover trail={tr} className="saved-cover" />
                <span className="chip light mono saved-diff">
                  <i style={{ background: difficultyColor[tr.difficulty] }} /> {f.difficulty(tr.difficulty)}
                </span>
              </Link>
              <div className="saved-body">
                <div className="trail-row-top">
                  <Link to={`/trails/${tr.id}`}>
                    <strong>{f.trailName(tr)}</strong>
                  </Link>
                  <span className="rating">
                    <Star size={13} fill="currentColor" /> {tr.rating}
                  </span>
                </div>
                <small className="muted">{f.trailRegion(tr)}</small>
                <div className="trail-row-meta">
                  <span>
                    <Route size={14} /> {f.distance(tr.distance)}
                  </span>
                  <span>
                    <Mountain size={14} /> {f.elevation(tr.gain)}
                  </span>
                  <span>
                    <Clock size={14} /> {t('trail.hours', { a: tr.duration[0], b: tr.duration[1] })}
                  </span>
                </div>
                <div className="saved-actions">
                  <Link to={`/planner?trail=${tr.id}`} className="pill-btn">
                    <CalendarPlus size={15} /> {t('saved.plan')}
                  </Link>
                  <button className="icon-btn" onClick={() => toggleSaved(tr.id)} aria-label={t('saved.remove')} title={t('saved.remove')}>
                    <BookmarkX size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
