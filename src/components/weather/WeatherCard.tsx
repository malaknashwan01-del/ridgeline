import { Droplets, RefreshCw, Sunset, Wind } from 'lucide-react';
import { useT } from '../../context/SettingsContext';
import { useFormat } from '../../lib/format';
import { useWeather, weatherInfo } from '../../lib/weather';
import Card from '../ui/Card';

interface Props {
  lat: number;
  lng: number;
  place: string;
  className?: string;
}

export default function WeatherCard({ lat, lng, place, className = '' }: Props) {
  const t = useT();
  const f = useFormat();
  const w = useWeather(lat, lng);

  return (
    <Card
      className={`weather ${className}`}
      title={t('wx.title')}
      action={
        <span className="live-badge">
          <i /> {t('wx.live')}
        </span>
      }
    >
      {w.status === 'loading' && (
        <div className="weather-body" aria-busy="true">
          <span className="skeleton" style={{ width: 120, height: 64 }} />
          <span className="skeleton" style={{ width: '70%', height: 14 }} />
          <span className="skeleton" style={{ height: 72 }} />
        </div>
      )}

      {w.status === 'error' && (
        <div className="weather-error">
          <p>{t('wx.error')}</p>
          <button className="pill-btn" onClick={w.retry}>
            <RefreshCw size={15} /> {t('common.retry')}
          </button>
        </div>
      )}

      {w.status === 'ok' &&
        (() => {
          const { current, daily, sunset } = w.data;
          const now = weatherInfo(current.code);
          return (
            <div className="weather-body">
              <div className="weather-now">
                <div>
                  <div className="weather-temp">{f.temp(current.temp)}</div>
                  <div className="weather-cond">
                    {t(now.key)} · {place}
                  </div>
                </div>
                <now.Icon size={54} strokeWidth={1.4} className="weather-icon" />
              </div>
              <div className="weather-stats">
                <span>
                  <Wind size={15} /> <small>{t('wx.wind')}</small> <b>{f.wind(current.wind)}</b>
                </span>
                <span>
                  <Droplets size={15} /> <small>{t('wx.humidity')}</small> <b>{Math.round(current.humidity)}%</b>
                </span>
                <span>
                  <Sunset size={15} /> <small>{t('wx.sunset')}</small> <b>{sunset}</b>
                </span>
              </div>
              <ul className="forecast">
                {daily.slice(1, 6).map((d) => {
                  const info = weatherInfo(d.code);
                  return (
                    <li key={d.date} title={t(info.key)}>
                      <small>{f.date(d.date, { weekday: 'short' })}</small>
                      <info.Icon size={20} strokeWidth={1.6} />
                      <b>{f.temp(d.max)}</b>
                      <small>{f.temp(d.min)}</small>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}
    </Card>
  );
}
