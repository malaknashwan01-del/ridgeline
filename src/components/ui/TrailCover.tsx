import { useMemo } from 'react';
import type { Trail } from '../../data/types';
import { hashString, mulberry32 } from '../../lib/random';
import SmartImg from './SmartImg';

function ridge(seed: number, baseY: number, amp: number, w = 400) {
  const rnd = mulberry32(seed);
  const steps = 9;
  let d = `M0 ${baseY}`;
  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * w;
    const y = baseY - rnd() * amp + amp / 2;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L${w} 260 L0 260 Z`;
}

/** Photo if the trail has one, otherwise a generated layered-ridge illustration in the trail's palette. */
export default function TrailCover({ trail, className = '' }: { trail: Trail; className?: string }) {
  const seed = hashString(trail.id);
  const [c1, c2, c3] = trail.palette;
  const layers = useMemo(() => [ridge(seed, 120, 70), ridge(seed + 1, 160, 60), ridge(seed + 2, 205, 40)], [seed]);
  const gid = `sky-${trail.id}`;

  return (
    <div className={`cover ${className}`}>
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c1} stopOpacity=".35" />
            <stop offset="1" stopColor={c1} stopOpacity=".85" />
          </linearGradient>
        </defs>
        <rect width="400" height="260" fill={`url(#${gid})`} />
        <circle cx={80 + (seed % 240)} cy="70" r="26" fill="#fff" opacity=".55" />
        <path d={layers[0]} fill={c2} opacity=".55" />
        <path d={layers[1]} fill={c2} />
        <path d={layers[2]} fill={c3} />
      </svg>
      {trail.image && <SmartImg sources={trail.image} alt={trail.name} />}
    </div>
  );
}
