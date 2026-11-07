import { useEffect, useState } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, type LucideIcon } from 'lucide-react';
import type { TKey } from '../i18n/en';

export interface Weather {
  current: { temp: number; code: number; wind: number; humidity: number };
  daily: { date: string; code: number; max: number; min: number }[];
  sunset: string;
}

interface OpenMeteoResponse {
  current: { temperature_2m: number; weather_code: number; wind_speed_10m: number; relative_humidity_2m: number };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; sunset: string[] };
}

const cache = new Map<string, Promise<Weather>>();

/** Live forecast from Open-Meteo (free, no API key). Requests are cached per location. */
export function fetchWeather(lat: number, lng: number): Promise<Weather> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}&longitude=${lng}` +
    '&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunset' +
    '&timezone=auto&forecast_days=6';

  const request = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`Weather request failed (${r.status})`);
      return r.json() as Promise<OpenMeteoResponse>;
    })
    .then((j) => ({
      current: {
        temp: j.current.temperature_2m,
        code: j.current.weather_code,
        wind: j.current.wind_speed_10m,
        humidity: j.current.relative_humidity_2m,
      },
      daily: j.daily.time.map((date, i) => ({
        date,
        code: j.daily.weather_code[i],
        max: j.daily.temperature_2m_max[i],
        min: j.daily.temperature_2m_min[i],
      })),
      sunset: j.daily.sunset[0]?.slice(11, 16) ?? '--:--',
    }));

  request.catch(() => cache.delete(key));
  cache.set(key, request);
  return request;
}

type State = { status: 'loading' } | { status: 'error' } | { status: 'ok'; data: Weather };

export function useWeather(lat: number, lng: number) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    fetchWeather(lat, lng)
      .then((data) => alive && setState({ status: 'ok', data }))
      .catch(() => alive && setState({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [lat, lng, attempt]);

  return { ...state, retry: () => setAttempt((a) => a + 1) };
}

/** WMO weather code → label + icon. */
export function weatherInfo(code: number): { key: TKey; Icon: LucideIcon } {
  if (code === 0) return { key: 'wx.clear', Icon: Sun };
  if (code <= 2) return { key: 'wx.partly', Icon: CloudSun };
  if (code === 3) return { key: 'wx.cloudy', Icon: Cloud };
  if (code <= 48) return { key: 'wx.fog', Icon: CloudFog };
  if (code <= 57) return { key: 'wx.drizzle', Icon: CloudDrizzle };
  if (code <= 67 || (code >= 80 && code <= 82)) return { key: 'wx.rain', Icon: CloudRain };
  if (code <= 77 || code === 85 || code === 86) return { key: 'wx.snow', Icon: CloudSnow };
  return { key: 'wx.storm', Icon: CloudLightning };
}
