import { useMemo } from 'react';
import { CircleMarker, MapContainer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng, Trail } from '../../data/types';
import { useT } from '../../context/SettingsContext';
import { AutoResize, FitBounds, Tiles, pinIcon } from './MapBase';

interface Props {
  trail: Trail;
  hoverPoint: LatLng | null;
}

export default function RouteMap({ trail, hoverPoint }: Props) {
  const t = useT();
  const bounds = useMemo(() => L.latLngBounds(trail.route), [trail.route]);
  const summitIndex = useMemo(() => {
    const peak = trail.profile.reduce((best, p, i, arr) => (p.e > arr[best].e ? i : best), 0);
    return Math.round((peak / (trail.profile.length - 1)) * (trail.route.length - 1));
  }, [trail]);

  return (
    <MapContainer className="map" bounds={bounds} scrollWheelZoom={false}>
      <Tiles />
      <AutoResize />
      <FitBounds bounds={bounds} />
      <Polyline positions={trail.route} pathOptions={{ color: '#ffffff', weight: 8, opacity: 0.85 }} />
      <Polyline positions={trail.route} pathOptions={{ color: '#2E2D2A', weight: 3.5 }} />
      <Marker position={trail.route[0]} icon={pinIcon('#7C6CF2', true)}>
        <Tooltip direction="top" offset={[0, -14]}>{t('trail.start')}</Tooltip>
      </Marker>
      <Marker position={trail.route[summitIndex]} icon={pinIcon('#F59E0B', true)}>
        <Tooltip direction="top" offset={[0, -14]}>
          {t('trail.summit')} · {trail.maxElevation} m
        </Tooltip>
      </Marker>
      {hoverPoint && (
        <CircleMarker
          center={hoverPoint}
          radius={8}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#F6B733', fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  );
}
