import { Asterisk } from 'lucide-react';
import { useT } from '../../context/SettingsContext';

export default function Brand({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <span className="brand">
      <span className="brand-tile">
        <Asterisk size={20} strokeWidth={2.4} />
      </span>
      {!compact && <span className="brand-name">{t('app.name')}</span>}
    </span>
  );
}
