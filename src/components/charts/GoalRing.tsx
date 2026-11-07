interface Props {
  value: number; // 0..1
  size?: number;
  children?: React.ReactNode;
}

export default function GoalRing({ value, size = 168, children }: Props) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="goal-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FBD06A" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="goal-track" strokeWidth={stroke} />
        <circle
          className="goal-value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#goalGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="goal-center">{children}</div>
    </div>
  );
}
