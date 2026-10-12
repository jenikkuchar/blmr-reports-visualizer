import { useEffect, useState } from 'react';

// Barvy grafu, které Recharts zapisuje do SVG atributů (CSS je nepřebarví).
// Čtou se z tokenů --jk-* a obnovují se při události jk-themechange z brand/theme.js.
export interface ChartTheme {
  grid: string;
  axis: string;
  text2: string;
  text3: string;
  line3: string;
  accentSoft: string;
}

const readChartTheme = (): ChartTheme => {
  const style = getComputedStyle(document.documentElement);
  const v = (name: string) => style.getPropertyValue(name).trim();
  return {
    grid: v('--jk-chart-grid'),
    axis: v('--jk-chart-axis'),
    text2: v('--jk-text-2'),
    text3: v('--jk-text-3'),
    line3: v('--jk-line-3'),
    accentSoft: v('--jk-accent-soft'),
  };
};

export const useChartTheme = (): ChartTheme => {
  const [theme, setTheme] = useState<ChartTheme>(readChartTheme);

  useEffect(() => {
    const update = () => setTheme(readChartTheme());
    document.addEventListener('jk-themechange', update);
    return () => document.removeEventListener('jk-themechange', update);
  }, []);

  return theme;
};
