import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, MapPin, Mountain, Navigation, Route, Search, Star, X } from 'lucide-react';
import { useSettings, useT } from '../context/SettingsContext';
import { trails } from '../data/trails';
import type { Difficulty } from '../data/types';
import { difficultyColor, useFormat } from '../lib/format';
import { haversineKm } from '../lib/geo';
import { usePlaceSearch, type Place } from '../lib/geocode';
import TrailCover from '../components/ui/TrailCover';
import ExploreMap from '../components/map/ExploreMap';
import WeatherCard from '../components/weather/WeatherCard';

type Sort = 'rating' | 'distance' | 'gain' | 'nearest';
const DIFFS: ('all' | Difficulty)[] = ['all', 'easy', 'moderate', 'hard'];

export default function Explore() {
  const t = useT();
  const f = useFormat();
  const { lang } = useSettings();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [diff, setDiff] = useState<'all' | Difficulty>('all');
  const [sort, setSort] = useState<Sort>('rating');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const places = usePlaceSearch(place ? '' : q, lang);

  const setQuery = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value);
    else next.delete('q');
    setParams(next, { replace: true });
  };

  const choosePlace = (p: Place) => {
    setPlace(p);
    setSort('nearest');
    setQuery('');
  };

  const clearPlace = () => {
    setPlace(null);
    setSort('rating');
  };

  const distanceTo = (lat: number, lng: number) => (place ? haversineKm([place.lat, place.lng], [lat, lng]) : 0);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return trails
      .filter((tr) => diff === 'all' || tr.difficulty === diff)
      .filter((tr) => !needle || [tr.name, tr.nameAr, tr.region, tr.regionAr].some((s) => s.toLowerCase().includes(needle)))
      .sort((a, b) => {
        if (sort === 'nearest' && place) return distanceTo(a.lat, a.lng) - distanceTo(b.lat, b.lng);
        if (sort === 'distance') return a.distance - b.distance;
        if (sort === 'gain') return a.gain - b.gain;
        return b.rating - a.rating;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, diff, sort, place]);

  const showPlaces = !place && q.trim().length >= 2;

  return (
    <div className="explore">
      <div className="explore-list">
        <header className="page-head compact">
          <div>
            <h1>{t('explore.title')}</h1>
            <p className="muted">{t('explore.subtitle', { n: list.length })}</p>
          </div>
        </header>

        <div className="search-field">
          <Search size={17} />
          <input value={q} onChange={(e) => setQuery(e.target.value)} placeholder={t('explore.search')} aria-label={t('explore.search')} />
          {places.status === 'loading' && <Loader2 size={16} className="spin" />}
          {q && (
            <button className="icon-btn sm" onClick={() => setQuery('')} aria-label="Clear">
              <X size={15} />
            </button>
          )}
        </div>

        {showPlaces && (
          <section className="places" aria-live="polite">
            <h2 className="section-label">{t('explore.places')}</h2>
            {places.status === 'loading' && places.results.length === 0 && <p className="muted small">{t('explore.searching')}</p>}
            {places.status === 'error' && <p className="muted small">{t('explore.placeErr')}</p>}
            {places.status === 'ok' && places.results.length === 0 && <p className="muted small">{t('explore.noPlaces')}</p>}
            {places.results.length > 0 && (
              <ul className="place-list">
                {places.results.map((p) => (
                  <li key={p.id}>
                    <button className="place-row" onClick={() => choosePlace(p)}>
                      <span className="icon-square sm">
                        <MapPin size={16} />
                      </span>
                      <span className="place-text">
                        <strong>{p.name}</strong>
                        <small>{[p.region, p.country].filter(Boolean).join(', ')}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {place && (
          <section className="place-selected">
            <div className="place-selected-head">
              <span className="icon-square">
                <Navigation size={17} />
              </span>
              <span className="place-text">
                <strong>{place.name}</strong>
                <small>{[place.region, place.country].filter(Boolean).join(', ')}</small>
              </span>
              <button className="icon-btn sm" onClick={clearPlace} aria-label={t('explore.clearPlace')} title={t('explore.clearPlace')}>
                <X size={15} />
              </button>
            </div>
            <WeatherCard className="compact" lat={place.lat} lng={place.lng} place={place.name} />
          </section>
        )}

        <div className="filters">
          <div className="chips-row" role="group">
            {DIFFS.map((d) => (
              <button key={d} className={`filter-chip${diff === d ? ' on' : ''}`} onClick={() => setDiff(d)} aria-pressed={diff === d}>
                {d !== 'all' && <i style={{ background: difficultyColor[d] }} />}
                {d === 'all' ? t('filter.all') : t(`diff.${d}`)}
              </button>
            ))}
          </div>
          <label className="select">
            <span className="sr-only">{t('explore.sort')}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {place && <option value="nearest">{t('sort.nearest')}</option>}
              <option value="rating">{t('sort.rating')}</option>
              <option value="distance">{t('sort.distance')}</option>
              <option value="gain">{t('sort.gain')}</option>
            </select>
          </label>
        </div>

        <h2 className="section-label">{place ? t('explore.nearest', { place: place.name }) : t('explore.trails')}</h2>
        <ul className="trail-list">
          {list.map((tr) => (
            <li key={tr.id}>
              <Link
                to={`/trails/${tr.id}`}
                className={`trail-row${activeId === tr.id ? ' active' : ''}`}
                onMouseEnter={() => setActiveId(tr.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(tr.id)}
                onBlur={() => setActiveId(null)}
              >
                <TrailCover trail={tr} className="trail-row-cover" />
                <div className="trail-row-body">
                  <div className="trail-row-top">
                    <strong>{f.trailName(tr)}</strong>
                    <span className="rating">
                      <Star size={13} fill="currentColor" /> {tr.rating}
                    </span>
                  </div>
                  <small className="muted">
                    {f.trailRegion(tr)}
                    {place && <span className="away"> · {t('explore.away', { d: f.distance(distanceTo(tr.lat, tr.lng), 0) })}</span>}
                  </small>
                  <div className="trail-row-meta">
                    <span>
                      <Route size={14} /> {f.distance(tr.distance)}
                    </span>
                    <span>
                      <Mountain size={14} /> {f.elevation(tr.gain)}
                    </span>
                    <span className="diff" style={{ ['--c' as string]: difficultyColor[tr.difficulty] }}>
                      {f.difficulty(tr.difficulty)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {list.length === 0 && !showPlaces && <li className="empty">{t('explore.empty')}</li>}
        </ul>
      </div>

      <div className="card explore-map">
        <ExploreMap trails={list} activeId={activeId} onHover={setActiveId} place={place} />
      </div>
    </div>
  );
}
