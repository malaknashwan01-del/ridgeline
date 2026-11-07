import { useEffect, useState } from 'react';

export interface Place {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
}

interface OpenMeteoGeo {
  results?: { id: number; name: string; admin1?: string; country?: string; latitude: number; longitude: number }[];
}

interface NominatimItem {
  place_id: number;
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: { country?: string; state?: string; city?: string; county?: string };
}

const cache = new Map<string, Place[]>();

async function openMeteo(q: string, lang: string, signal: AbortSignal): Promise<Place[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=${lang}&format=json`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`geocoding ${r.status}`);
  const j = (await r.json()) as OpenMeteoGeo;
  return (j.results ?? []).map((p) => ({
    id: `om-${p.id}`,
    name: p.name,
    region: p.admin1 ?? '',
    country: p.country ?? '',
    lat: p.latitude,
    lng: p.longitude,
  }));
}

/** OpenStreetMap search — better at non-Latin queries (e.g. Arabic). Used when Open-Meteo finds nothing. */
async function nominatim(q: string, lang: string, signal: AbortSignal): Promise<Place[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&addressdetails=1&limit=6&accept-language=${lang}`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`nominatim ${r.status}`);
  const j = (await r.json()) as NominatimItem[];
  return j.map((p) => ({
    id: `osm-${p.place_id}`,
    name: p.name || p.display_name.split(',')[0],
    region: p.address?.state ?? p.address?.county ?? '',
    country: p.address?.country ?? p.display_name.split(',').slice(-1)[0].trim(),
    lat: Number(p.lat),
    lng: Number(p.lon),
  }));
}

export async function searchPlaces(q: string, lang: string, signal: AbortSignal): Promise<Place[]> {
  const key = `${lang}:${q.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let results: Place[] = [];
  try {
    results = await openMeteo(q, lang, signal);
  } catch (e) {
    if (signal.aborted) throw e;
  }
  if (results.length === 0) results = await nominatim(q, lang, signal);
  cache.set(key, results);
  return results;
}

type State = { status: 'idle' | 'loading' | 'error'; results: Place[] } | { status: 'ok'; results: Place[] };

/** Debounced worldwide place search. */
export function usePlaceSearch(query: string, lang: string) {
  const [state, setState] = useState<State>({ status: 'idle', results: [] });

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setState({ status: 'idle', results: [] });
      return;
    }
    const ctrl = new AbortController();
    setState((s) => ({ status: 'loading', results: s.results }));
    const timer = setTimeout(() => {
      searchPlaces(q, lang, ctrl.signal)
        .then((results) => setState({ status: 'ok', results }))
        .catch(() => !ctrl.signal.aborted && setState({ status: 'error', results: [] }));
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, lang]);

  return state;
}
