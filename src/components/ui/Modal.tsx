import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}

/** Accessible modal: focus moves in, Escape and backdrop close it, focus returns on close. */
export default function Modal({ title, closeLabel, onClose, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={panel}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={closeLabel}>
            <X size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body
  );
}
