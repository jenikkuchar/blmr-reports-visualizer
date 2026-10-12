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

interface TrendChartProps {
  data: CsvRow[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const [granularity, setGranularity] = useState<'month' | 'week' | 'rolling'>('month');
  const [rollingDirection, setRollingDirection] = useState<'start' | 'end'>('start');
  const [isMinimized, setIsMinimized] = useState(false);

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
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl text-sm transition-colors">
          <p className="font-bold text-gray-900 dark:text-white mb-2 border-b dark:border-gray-700 pb-1">
            {label}
          </p>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 flex justify-between gap-4">
              <span>Poměr Ano:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{payload[0].value}%</span>
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-[11px] flex justify-between gap-4">
              <span>Vzorek:</span>
              <span className="font-medium">{dataPoint.total} odpovědí</span>
            </p>
            {showDates && (
              <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                Rozsah: <span className="font-medium">{firstDateStr} – {lastDateStr}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors mb-8">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${!isMinimized ? 'mb-6' : ''}`}>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Trend vývoje v čase
          </h3>
        </div>

        <div className="flex items-center space-x-4 ml-auto sm:ml-0">
          {!isMinimized && granularity === 'rolling' && (
            <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
              <button
                onClick={() => setRollingDirection('start')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  rollingDirection === 'start'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Od začátku
              </button>
              <button
                onClick={() => setRollingDirection('end')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  rollingDirection === 'end'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Od konce
              </button>
            </div>
          )}

          {!isMinimized && (
            <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
              <button
                onClick={() => setGranularity('month')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  granularity === 'month' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Měsíce
              </button>
              <button
                onClick={() => setGranularity('week')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  granularity === 'week' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Týdny
              </button>
              <button
                onClick={() => setGranularity('rolling')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  granularity === 'rolling' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                title="Průměr po 50 hodnoceních"
              >
                <Hash className="w-3.5 h-3.5" />
                Po 50
              </button>
            </div>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                
                <ReferenceLine 
                  y={average} 
                  stroke="#94a3b8" 
                  strokeDasharray="5 5"
                  label={{ 
                    position: 'left', 
                    value: `Ø ${average}%`, 
                    fill: '#94a3b8', 
                    fontSize: 10,
                    fontWeight: 'bold',
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
                      fill={entry.ratio >= average ? '#3b82f6' : '#94a3b8'} 
                      fillOpacity={entry.ratio >= average ? 0.8 : 0.4}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500 opacity-80"></div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nad průměrem</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-400 opacity-40"></div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pod průměrem</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrendChart;