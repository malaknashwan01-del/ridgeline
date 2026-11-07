import { useSettings } from '../../context/SettingsContext';

/** SVG attributes can't read CSS variables reliably, so charts get concrete colours per theme. */
export function useChartTheme() {
  const { resolvedTheme } = useSettings();
  const dark = resolvedTheme === 'dark';
  return {
    amber: '#F6B733',
    amberSoft: dark ? 'rgba(246,183,51,.22)' : 'rgba(246,183,51,.30)',
    ink: dark ? '#F1ECE3' : '#2E2D2A',
    muted: dark ? '#8f897e' : '#9b968c',
    grid: dark ? 'rgba(255,255,255,.07)' : 'rgba(46,45,42,.08)',
    violet: '#7C6CF2',
    tooltip: {
      background: dark ? '#2c2a26' : '#FFFDF9',
      border: `1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(46,45,42,.08)'}`,
      borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,.12)',
      fontSize: 12,
      color: dark ? '#F1ECE3' : '#2E2D2A',
    },
  };
}

export const axisTick = { fontSize: 11, fontFamily: "'General Sans', 'Alexandria', system-ui, sans-serif" };
