import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Trail } from '../../data/types';
import type { Place } from '../../lib/geocode';
import { difficultyColor, useFormat } from '../../lib/format';
import { AutoResize, FitBounds, Tiles, pinIcon } from './MapBase';

interface Props {
  trails: Trail[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  place?: Place | null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 11, { duration: 1.2 });
  }, [map, lat, lng]);
  return null;
}

export default function ExploreMap({ trails, activeId, onHover, place }: Props) {
  const f = useFormat();
  const bounds = useMemo(
    () => L.latLngBounds((trails.length ? trails : []).map((t) => [t.lat, t.lng] as [number, number])),
    [trails]
  );

  return (
    <MapContainer className="map" center={[46.55, 7.95]} zoom={9} scrollWheelZoom>
      <Tiles />
      <AutoResize />
      {place ? (
        <>
          <FlyTo lat={place.lat} lng={place.lng} />
          <Marker position={[place.lat, place.lng]} icon={pinIcon('#2E2D2A', true)} zIndexOffset={2000}>
            <Popup>
              <div className="map-popup">
                <strong>{place.name}</strong>
                <span>{[place.region, place.country].filter(Boolean).join(', ')}</span>
              </div>
            </Popup>
          </Marker>
        </>
      ) : (
        trails.length > 0 && <FitBounds bounds={bounds} padding={56} />
      )}
      {trails.map((t) => (
        <Marker
          key={t.id}
          position={[t.lat, t.lng]}
          icon={pinIcon(difficultyColor[t.difficulty], t.id === activeId)}
          zIndexOffset={t.id === activeId ? 1000 : 0}
          eventHandlers={{ mouseover: () => onHover(t.id), mouseout: () => onHover(null) }}
        >
          <Popup>
            <div className="map-popup">
              <strong>{f.trailName(t)}</strong>
              <span>
                {f.distance(t.distance)} · {f.elevation(t.gain)} · ★ {t.rating}
              </span>
              <Link to={`/trails/${t.id}`}>→ {f.trailRegion(t)}</Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
