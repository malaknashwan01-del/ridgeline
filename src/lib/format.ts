import { useMemo } from 'react';
import { useSettings, useT } from '../context/SettingsContext';
import type { Difficulty, Trail } from '../data/types';

const KM_TO_MI = 0.621371;
const M_TO_FT = 3.28084;

/** Unit- and language-aware formatters. */
export function useFormat() {
  const { units, locale, lang } = useSettings();
  const t = useT();

  return useMemo(() => {
    const num = (v: number, digits = 1) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(v);
    const metric = units === 'metric';
    return {
      num,
      locale,
      distanceValue: (km: number) => (metric ? km : km * KM_TO_MI),
      distanceUnit: metric ? t('unit.km') : t('unit.mi'),
      elevationValue: (m: number) => (metric ? m : m * M_TO_FT),
      elevationUnit: metric ? t('unit.m') : t('unit.ft'),
      distance: (km: number, digits = 1) => `${num(metric ? km : km * KM_TO_MI, digits)} ${metric ? t('unit.km') : t('unit.mi')}`,
      elevation: (m: number) => `${num(metric ? m : m * M_TO_FT, 0)} ${metric ? t('unit.m') : t('unit.ft')}`,
      duration: (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes % 60);
        return h ? `${h}${t('unit.h')} ${m}${t('unit.min')}` : `${m}${t('unit.min')}`;
      },
      temp: (c: number) => `${Math.round(metric ? c : c * 1.8 + 32)}°`,
      wind: (kmh: number) => `${Math.round(metric ? kmh : kmh * KM_TO_MI)} ${metric ? t('unit.kmh') : t('unit.mph')}`,
      date: (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
        new Intl.DateTimeFormat(locale, opts).format(new Date(iso)),
      trailName: (tr: Trail) => (lang === 'ar' ? tr.nameAr : tr.name),
      trailRegion: (tr: Trail) => (lang === 'ar' ? tr.regionAr : tr.region),
      difficulty: (d: Difficulty) => t(`diff.${d}`),
    };
  }, [units, locale, lang, t]);
}

export const difficultyColor: Record<Difficulty, string> = {
  easy: '#3F9E7A',
  moderate: '#F59E0B',
  hard: '#7C6CF2',
};
