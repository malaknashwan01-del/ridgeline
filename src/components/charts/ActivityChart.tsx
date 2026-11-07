import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useT } from '../../context/SettingsContext';
import { useFormat } from '../../lib/format';
import { axisTick, useChartTheme } from './chartTheme';

interface Datum {
  label: string;
  distance: number;
  gain: number;
}

export default function ActivityChart({ data }: { data: Datum[] }) {
  const c = useChartTheme();
  const f = useFormat();
  const t = useT();
  const rows = data.map((d) => ({
    label: d.label,
    distance: Math.round(f.distanceValue(d.distance) * 10) / 10,
    gain: Math.round(f.elevationValue(d.gain)),
  }));

  return (
    <div className="chart-box" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ ...axisTick, fill: c.muted }} />
          <YAxis yAxisId="d" tickLine={false} axisLine={false} tick={{ ...axisTick, fill: c.muted }} width={40} />
          <YAxis yAxisId="g" orientation="right" tickLine={false} axisLine={false} tick={{ ...axisTick, fill: c.muted }} width={48} />
          <Tooltip
            cursor={{ fill: c.amberSoft }}
            contentStyle={c.tooltip}
            formatter={(value: number, name: string) =>
              name === 'distance'
                ? [`${f.num(value)} ${f.distanceUnit}`, t('chart.distance')]
                : [`${f.num(value, 0)} ${f.elevationUnit}`, t('chart.elevation')]
            }
          />
          <Bar yAxisId="d" dataKey="distance" fill={c.amber} radius={[6, 6, 2, 2]} maxBarSize={28} animationDuration={700} />
          <Line yAxisId="g" dataKey="gain" type="monotone" stroke={c.ink} strokeWidth={2.2} dot={false} animationDuration={900} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
