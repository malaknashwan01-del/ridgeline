import type { ElevationPoint, LatLng } from '../data/types';
import { mulberry32 } from './random';

const ROUTE_POINTS = 64;
const PROFILE_POINTS = 64;

/** A plausible looping route of roughly `km` length that starts at the trailhead. */
export function generateRoute(lat: number, lng: number, km: number, seed: number): LatLng[] {
  const rnd = mulberry32(seed);
  const radius = km / (2 * Math.PI);
  const p1 = rnd() * Math.PI * 2;
  const p2 = rnd() * Math.PI * 2;
  const a = 0.18 + rnd() * 0.15;
  const b = 0.08 + rnd() * 0.08;
  const rot = rnd() * Math.PI * 2;

  const pts: [number, number][] = [];
  for (let i = 0; i <= ROUTE_POINTS; i++) {
    const th = (i / ROUTE_POINTS) * Math.PI * 2;
    const r = radius * (1 + a * Math.sin(3 * th + p1) + b * Math.sin(5 * th + p2));
    pts.push([r * Math.cos(th + rot), r * Math.sin(th + rot)]);
  }
  const [x0, y0] = pts[0];
  const kmPerDegLng = 111.32 * Math.cos((lat * Math.PI) / 180);
  return pts.map(([x, y]) => [lat + (y - y0) / 110.574, lng + (x - x0) / kmPerDegLng]);
}

/** Elevation profile that climbs to a high point and returns, with a little terrain noise. */
export function generateProfile(base: number, gain: number, km: number, seed: number): ElevationPoint[] {
  const rnd = mulberry32(seed + 7);
  const peak = 0.42 + rnd() * 0.18;
  const phase = rnd() * 6;
  const ease = (t: number) => t * t * (3 - 2 * t);
  return Array.from({ length: PROFILE_POINTS }, (_, i) => {
    const t = i / (PROFILE_POINTS - 1);
    const s = t < peak ? ease(t / peak) : ease((1 - t) / (1 - peak));
    const noise = 0.05 * gain * Math.sin(t * 19 + phase) * Math.sin(t * Math.PI);
    return { d: Math.round(t * km * 100) / 100, e: Math.round(base + gain * s + noise) };
  });
}

/** Map an index on the elevation profile to the matching point on the route. */
export function routeIndexFor(profileIndex: number, profileLength: number, routeLength: number) {
  return Math.round((profileIndex / (profileLength - 1)) * (routeLength - 1));
}

/** Great-circle distance in km. */
export function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
