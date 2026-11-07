import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useT } from '../context/SettingsContext';

export default function NotFound() {
  const t = useT();
  return (
    <div className="card empty-state">
      <Compass size={40} strokeWidth={1.4} />
      <h1>{t('nf.title')}</h1>
      <Link className="btn primary" to="/">
        {t('nf.back')}
      </Link>
    </div>
  );
}
