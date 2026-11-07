import { useT } from '../context/SettingsContext';
import { daysUntil } from '../context/UserDataContext';

/** "today", "tomorrow", "in 4 days", "3 days ago" for a YYYY-MM-DD date. */
export function useWhen() {
  const t = useT();
  return (date: string) => {
    const n = daysUntil(date);
    if (n === 0) return t('plan.today');
    if (n === 1) return t('plan.tomorrow');
    return n > 0 ? t('plan.inDays', { n }) : t('plan.past', { n: -n });
  };
}
