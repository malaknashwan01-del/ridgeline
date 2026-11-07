import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useId } from 'react';

export default function Sparkline({ values, color = '#F6B733' }: { values: number[]; color?: string }) {
  const id = useId().replace(/:/g, '');
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div className="sparkline" dir="ltr" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity={0.35} />
              <stop offset="1" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
