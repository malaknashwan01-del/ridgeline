import { useState } from 'react';

interface Props {
  sources: string[];
  alt: string;
  className?: string;
  position?: string;
}

/** Tries each source in order; renders nothing if none load, so the parent background shows. */
export default function SmartImg({ sources, alt, className, position }: Props) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  if (index >= sources.length) return null;
  return (
    <img
      key={sources[index]}
      src={sources[index]}
      alt={alt}
      className={`smart-img${loaded ? ' is-loaded' : ''}${className ? ` ${className}` : ''}`}
      style={position ? { objectPosition: position } : undefined}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => {
        setLoaded(false);
        setIndex((i) => i + 1);
      }}
    />
  );
}
