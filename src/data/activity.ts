import type { Hike } from './types';
import { trails } from './trails';
import { mulberry32 } from '../lib/random';

const DAY = 86_400_000;

/** A year of believable hiking history, relative to today. */
function generateHikes(now = new Date()): Hike[] {
  const rnd = mulberry32(42);
  const hikes: Hike[] = [];
  const today = new Date(now);
  today.setHours(9, 0, 0, 0);

  for (let day = 1; day < 365; day++) {
    const date = new Date(today.getTime() - day * DAY);
    const m = date.getMonth();
    const inSeason = m >= 5 && m <= 9;
    const chance = day < 35 ? 0.3 : inSeason ? 0.26 : 0.08;
    const forced = day === 2 || day === 6 || day === 11;
    if (!forced && rnd() > chance) continue;

    const trail = trails[Math.floor(rnd() * trails.length)];
    const avgHours = (trail.duration[0] + trail.duration[1]) / 2;
    hikes.push({
      id: `h${day}`,
      trailId: trail.id,
      date: date.toISOString(),
      distance: Math.round(trail.distance * (0.92 + rnd() * 0.16) * 10) / 10,
      gain: Math.round(trail.gain * (0.95 + rnd() * 0.1)),
      minutes: Math.round(avgHours * 60 * (0.88 + rnd() * 0.24)),
    });
  }
  return hikes; // newest first
}

export const hikes = generateHikes();

export interface Totals {
  distance: number;
  gain: number;
  count: number;
  minutes: number;
}

export function totals(list: Hike[]): Totals {
  return list.reduce<Totals>(
    (acc, h) => ({
      distance: acc.distance + h.distance,
      gain: acc.gain + h.gain,
      count: acc.count + 1,
      minutes: acc.minutes + h.minutes,
    }),
    { distance: 0, gain: 0, count: 0, minutes: 0 }
  );
}

const between = (list: Hike[], from: number, to: number) =>
  list.filter((h) => {
    const t = new Date(h.date).getTime();
    return t >= from && t < to;
  });

/** Rolling 30 days vs the 30 days before, plus 10 weekly values for sparklines. */
export function kpis(list: Hike[], now = new Date()) {
  const end = now.getTime();
  const current = totals(between(list, end - 30 * DAY, end));
  const previous = totals(between(list, end - 60 * DAY, end - 30 * DAY));
  const weeks = Array.from({ length: 10 }, (_, i) => {
    const to = end - (9 - i) * 7 * DAY;
    return totals(between(list, to - 7 * DAY, to));
  });
  return { current, previous, weeks };
}

export function monthly(list: Hike[], months: number, locale: string, now = new Date()) {
  const fmt = new Intl.DateTimeFormat(locale, { month: 'short' });
  return Array.from({ length: months }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const t = totals(between(list, start.getTime(), end.getTime()));
    return { label: fmt.format(start), distance: Math.round(t.distance * 10) / 10, gain: t.gain, count: t.count };
  });
}

/** Daily distance for the last `weeks` weeks, aligned so each column is a week. */
export function dailyGrid(list: Hike[], weeks: number, now = new Date()) {
  const byDay = new Map<string, number>();
  list.forEach((h) => {
    const k = h.date.slice(0, 10);
    byDay.set(k, (byDay.get(k) ?? 0) + h.distance);
  });
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  const lastDay = new Date(today.getTime() + (6 - today.getDay()) * DAY); // end of this week (Sat)
  const days = weeks * 7;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(lastDay.getTime() - (days - 1 - i) * DAY);
    const key = d.toISOString().slice(0, 10);
    return { key, value: d > today ? -1 : byDay.get(key) ?? 0 };
  });
}

export function yearToDate(list: Hike[], now = new Date()) {
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  return totals(between(list, start, now.getTime() + 1));
}
