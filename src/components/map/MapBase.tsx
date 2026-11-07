import { useEffect, useRef, useState } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Provider {
  url: string;
  attribution: string;
  maxZoom: number;
}

const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/**
 * Free tile servers that need no API key, in order of preference.
 * If one keeps failing, the map switches to the next.
 * Dark mode reuses the same tiles with a CSS filter (see .leaflet-tile-pane in global.css).
 */
const PROVIDERS: Provider[] = [
  { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: OSM_ATTR, maxZoom: 19 },
  { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: `${OSM_ATTR}, <a href="https://opentopomap.org">OpenTopoMap</a>`, maxZoom: 17 },
];

const FAILS_BEFORE_SWITCH = 4;

export function Tiles() {
  const [index, setIndex] = useState(0);
  const fails = useRef(0);
  const p = PROVIDERS[index];

  return (
    <TileLayer
      key={p.url}
      url={p.url}
      attribution={p.attribution}
      maxZoom={p.maxZoom}
      eventHandlers={{
        tileload: () => {
          fails.current = 0;
        },
        tileerror: () => {
          fails.current += 1;
          if (fails.current >= FAILS_BEFORE_SWITCH && index < PROVIDERS.length - 1) {
            fails.current = 0;
            setIndex((i) => i + 1);
          }
        },
      }}
    />
  );
}

export function FitBounds({ bounds, padding = 36 }: { bounds: LatLngBoundsExpression; padding?: number }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [padding, padding] });
  }, [map, bounds, padding]);
  return null;
}

/** Map size changes (sidebar, rotation) need Leaflet to re-measure. */
export function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

export function pinIcon(color: string, active = false, label?: string) {
  const size = active ? 34 : 26;
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<span class="map-pin${active ? ' active' : ''}" style="--c:${color}">${label ?? ''}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}
