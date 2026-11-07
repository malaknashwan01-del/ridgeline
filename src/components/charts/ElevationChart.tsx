import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ElevationPoint } from '../../data/types';
import { useFormat } from '../../lib/format';
import { axisTick, useChartTheme } from './chartTheme';

interface Props {
  profile: ElevationPoint[];
  onHover: (index: number | null) => void;
}

export default function ElevationChart({ profile, onHover }: Props) {
  const c = useChartTheme();
  const f = useFormat();
  const id = useId().replace(/:/g, '');
  const data = profile.map((p) => ({
    d: Math.round(f.distanceValue(p.d) * 100) / 100,
    e: Math.round(f.elevationValue(p.e)),
  }));
  const min = Math.min(...data.map((p) => p.e));
  const max = Math.max(...data.map((p) => p.e));
  const pad = Math.max(20, (max - min) * 0.15);

  return (
    <div className="chart-box tall" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
          onMouseMove={(s: { activeTooltipIndex?: number }) =>
            onHover(typeof s.activeTooltipIndex === 'number' ? s.activeTooltipIndex : null)
          }
          onMouseLeave={() => onHover(null)}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c.amber} stopOpacity={0.55} />
              <stop offset="1" stopColor={c.amber} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis
            dataKey="d"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickLine={false}
            axisLine={false}
            tick={{ ...axisTick, fill: c.muted }}
            tickFormatter={(v: number) => `${f.num(v)} ${f.distanceUnit}`}
          />
          <YAxis
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ ...axisTick, fill: c.muted }}
            tickFormatter={(v: number) => `${f.num(v, 0)}`}
          />
          <Tooltip
            contentStyle={c.tooltip}
            cursor={{ stroke: c.ink, strokeDasharray: '3 3' }}
            labelFormatter={(v: number) => `${f.num(v)} ${f.distanceUnit}`}
            formatter={(v: number) => [`${f.num(v, 0)} ${f.elevationUnit}`, '']}
            separator=""
          />
          <Area
            type="monotone"
            dataKey="e"
            stroke={c.ink}
            strokeWidth={2.4}
            fill={`url(#${id})`}
            activeDot={{ r: 6, fill: c.amber, stroke: '#fff', strokeWidth: 3 }}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
