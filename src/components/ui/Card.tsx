import type { ReactNode } from 'react';

interface Props {
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function Card({ title, action, className = '', children }: Props) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="card-head">
          {title && <h2 className="card-title">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
