import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Cell
} from 'recharts';
import { CsvRow } from '../types';
import { getTrendData, getRollingTrendData } from '../utils/helpers';
import { TrendingUp, Calendar, LayoutGrid, ChevronUp, ChevronDown, Hash } from 'lucide-react';
import { formatInt, formatPercent } from '../utils/format';
import { useChartTheme } from '../utils/chartTheme';

interface TrendChartProps {
  data: CsvRow[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const [granularity, setGranularity] = useState<'month' | 'week' | 'rolling'>('month');
  const [rollingDirection, setRollingDirection] = useState<'start' | 'end'>('start');
  const [isMinimized, setIsMinimized] = useState(false);
  const chartTheme = useChartTheme();

  const { trendData, average } = useMemo(() => {
    if (granularity === 'rolling') {
      const result = getRollingTrendData(data, 50, rollingDirection === 'end');
      return { trendData: result.data, average: result.average };
    }
    const result = getTrendData(data, granularity);
    return { trendData: result.data, average: result.average };
  }, [data, granularity, rollingDirection]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const showDates = dataPoint.firstDate && dataPoint.lastDate;
      const firstDateStr = showDates ? new Date(dataPoint.firstDate).toLocaleDateString('cs-CZ') : '';
      const lastDateStr = showDates ? new Date(dataPoint.lastDate).toLocaleDateString('cs-CZ') : '';

      return (
        <div className="glass shadow-pop px-3.5 py-3 rounded-row text-[13px]">
          <p className="font-semibold text-fg mb-1.5 pb-1.5 hairline-b">
            {label}
          </p>
          <div className="space-y-1">
            <p className="text-fg-muted flex justify-between gap-4">
              <span>Poměr Ano:</span>
              <span className="font-semibold text-accent tnum">{formatPercent(payload[0].value)}</span>
            </p>
            <p className="text-fg-subtle text-xs flex justify-between gap-4">
              <span>Vzorek:</span>
              <span className="font-medium tnum">{formatInt(dataPoint.total)} odpovědí</span>
            </p>
            {showDates && (
              <p className="text-fg-subtle text-xs mt-2 pt-2 hairline-t">
                Rozsah: <span className="font-medium tnum">{firstDateStr} – {lastDateStr}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const segBtn = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-[5px] rounded-[7px] text-[13px] font-medium transition-colors ${
      active
        ? 'bg-surface-3 text-fg shadow-[0_1px_2px_rgba(0,0,0,.4),inset_0_0_0_.5px_var(--jk-line-2)]'
        : 'text-fg-muted hover:text-fg'
    }`;
  const segWrap = 'flex p-[3px] gap-0.5 rounded-button bg-fill hairline-soft';

  return (
    <div className="bg-surface-1 hairline rounded-card p-5">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${!isMinimized ? 'mb-5' : ''}`}>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h3 className="text-base font-semibold tracking-[-0.01em] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Trend vývoje v čase
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto sm:ml-0 justify-end">
          {!isMinimized && granularity === 'rolling' && (
            <div className={segWrap}>
              <button onClick={() => setRollingDirection('start')} aria-pressed={rollingDirection === 'start'} className={segBtn(rollingDirection === 'start')}>
                Od začátku
              </button>
              <button onClick={() => setRollingDirection('end')} aria-pressed={rollingDirection === 'end'} className={segBtn(rollingDirection === 'end')}>
                Od konce
              </button>
            </div>
          )}

          {!isMinimized && (
            <div className={segWrap}>
              <button onClick={() => setGranularity('month')} aria-pressed={granularity === 'month'} className={segBtn(granularity === 'month')}>
                <Calendar className="w-3.5 h-3.5" />
                Měsíce
              </button>
              <button onClick={() => setGranularity('week')} aria-pressed={granularity === 'week'} className={segBtn(granularity === 'week')}>
                <LayoutGrid className="w-3.5 h-3.5" />
                Týdny
              </button>
              <button
                onClick={() => setGranularity('rolling')}
                aria-pressed={granularity === 'rolling'}
                className={segBtn(granularity === 'rolling')}
                title="Průměr po 50 hodnoceních"
              >
                <Hash className="w-3.5 h-3.5" />
                Po 50
              </button>
            </div>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-8 h-8 grid place-items-center text-fg-subtle hover:text-fg hover:bg-fill rounded-row transition-colors"
            title={isMinimized ? "Maximalizovat" : "Minimalizovat"}
          >
            {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={trendData} margin={{ top: 20, right: 30, left: 45, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={chartTheme.grid} />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: chartTheme.axis }}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: chartTheme.axis }}
                  tickFormatter={(val) => `${val} %`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: chartTheme.accentSoft }} />
                
                <ReferenceLine 
                  y={average} 
                  stroke={chartTheme.axis} 
                  strokeDasharray="4 4"
                  label={{ 
                    position: 'left', 
                    value: `Ø ${formatPercent(average)}`, 
                    fill: chartTheme.text2, 
                    fontSize: 11,
                    fontWeight: 600,
                    offset: 10
                  }} 
                />
                
                <Bar 
                  dataKey="ratio" 
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                >
                  {trendData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.ratio >= average ? '#0a84ff' : chartTheme.text3} 
                      fillOpacity={entry.ratio >= average ? 0.9 : 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-fg-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-accent"></span>
              Nad průměrem
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-fg-subtle opacity-50"></span>
              Pod průměrem
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default TrendChart;
