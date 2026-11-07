interface Props<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}

export default function Segmented<T extends string>({ value, options, onChange, label }: Props<T>) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className="segmented-btn"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
