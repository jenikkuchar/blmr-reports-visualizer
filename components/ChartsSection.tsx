import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BrowserDeviceStat } from '../types';
import { Maximize2, X } from 'lucide-react';
import { formatInt, formatPercent } from '../utils/format';

interface ChartsSectionProps {
  yesCount: number;
  noCount: number;
  yesPercent: string;
  noPercent: string;
  browserStats: BrowserDeviceStat[];
}

// Ano/Ne je stav → success / danger (manuál: sémantické barvy)
const COLORS_YESNO = ['#30d158', '#ff453a'];
// Série grafu v pevném pořadí chart-1 … chart-8; 9. výseč „Ostatní“ je neutrální
const COLORS_BROWSER = ['#0a84ff', '#30d158', '#ff9f0a', '#bf5af2', '#ff375f', '#64d2ff', '#ffd60a', '#ac8e68'];
const COLOR_OTHER = 'rgba(235,235,245,.38)';
const browserColor = (index: number) => COLORS_BROWSER[index] ?? COLOR_OTHER;

const legendStyle = { fontSize: 12, color: 'rgba(235,235,245,.60)' };

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass shadow-pop px-3 py-2 rounded-row text-[13px] z-50">
        <p className="font-semibold text-fg">{payload[0].name}</p>
        <p className="text-fg-muted">
          Počet: <span className="font-medium text-fg tnum">{formatInt(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const ChartsSection: React.FC<ChartsSectionProps> = ({ yesCount, noCount, yesPercent, noPercent, browserStats }) => {
  const [expandedChart, setExpandedChart] = useState<'yesno' | 'browser' | null>(null);

  const yesNoData = [
    { name: `Ano (${formatPercent(yesPercent)})`, value: yesCount },
    { name: `Ne (${formatPercent(noPercent)})`, value: noCount },
  ];

  // Convert yesPercent to number for the arrow indicator
  const yesPercentNum = parseFloat(yesPercent) || 0;

  // Limit browser stats for the chart to keep it readable, but pass full list to the side
  const chartBrowserStats = browserStats.slice(0, 8); 
  const otherCount = browserStats.slice(8).reduce((acc, curr) => acc + curr.count, 0);
  if (otherCount > 0) {
    chartBrowserStats.push({ key: 'Ostatní', count: otherCount, percent: '...' });
  }

  const renderExpandedContent = () => {
    if (expandedChart === 'yesno') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={yesNoData}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius="65%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              label={({name}) => `${name}`}
              labelLine={{ stroke: 'rgba(255,255,255,.22)' }}
              isAnimationActive={false}
            >
              {yesNoData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_YESNO[index % COLORS_YESNO.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={legendStyle} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (expandedChart === 'browser') {
       return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartBrowserStats}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius="65%" // Use percentage to ensure it fits with labels
              paddingAngle={2}
              dataKey="count"
              nameKey="key"
              stroke="none"
              label={({ payload }) => `${payload.key} (${formatPercent(payload.percent)})`}
              labelLine={{ stroke: 'rgba(255,255,255,.22)' }}
              isAnimationActive={false}
            >
              {chartBrowserStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={browserColor(index)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ ...legendStyle, paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
       );
    }
    return null;
  };

  const cardClass = 'bg-surface-1 hairline rounded-card p-5 flex flex-col h-[600px] relative group';
  const expandBtnClass = 'absolute top-3.5 right-3.5 z-10 w-8 h-8 grid place-items-center rounded-row text-fg-muted bg-white/[.07] hover:bg-white/[.12] hover:text-fg hairline opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition';

  // Škála hodnocení: danger → chart-5 → warning → chart-7 → success
  const scale = [
    { width: '30%', color: '#ff453a', range: '0–30 %', label: 'nevyhovující' },
    { width: '25%', color: '#ff375f', range: '30–55 %', label: 'slabé' },
    { width: '15%', color: '#ff9f0a', range: '55–70 %', label: 'přijatelné' },
    { width: '15%', color: '#ffd60a', range: '70–85 %', label: 'dobré' },
    { width: '15%', color: '#30d158', range: '85–100 %', label: 'výborné' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Yes/No Chart */}
        <div className={cardClass}>
          <button onClick={() => setExpandedChart('yesno')} className={expandBtnClass} aria-label="Zvětšit graf">
            <Maximize2 className="w-4 h-4" />
          </button>
          <h3 className="text-base font-semibold tracking-[-0.01em] pb-3 mb-4 hairline-b">Rozložení odpovědí</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="99%" height="100%">
                  <PieChart>
                    <Pie
                      data={yesNoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {yesNoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_YESNO[index % COLORS_YESNO.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

               <div className="flex justify-center gap-12 mt-2 mb-8">
                  <div className="flex flex-col items-center">
                     <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2.5 h-2.5 rounded-[3px] bg-success"></span>
                        <span className="text-xs text-fg-muted tnum">Ano ({formatPercent(yesPercent)})</span>
                     </div>
                     <div className="text-[26px] font-semibold tracking-[-0.02em] tnum">{formatInt(yesCount)}</div>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2.5 h-2.5 rounded-[3px] bg-danger"></span>
                        <span className="text-xs text-fg-muted tnum">Ne ({formatPercent(noPercent)})</span>
                     </div>
                     <div className="text-[26px] font-semibold tracking-[-0.02em] tnum">{formatInt(noCount)}</div>
                  </div>
               </div>

               {/* Sentiment Scale Visualizer */}
               <div className="w-full px-2 sm:px-4 mt-auto pb-6">
                  <div className="relative pt-10">
                    {/* Floating Pin Indicator */}
                    <div 
                      className="absolute top-0 transition-all duration-1000 ease-in-out flex flex-col items-center -translate-x-1/2 z-20"
                      style={{ left: `${yesPercentNum}%` }}
                    >
                      <div className="bg-accent-strong text-white px-2 h-6 rounded-md flex items-center justify-center">
                        <span className="text-xs font-semibold tnum">{formatPercent(yesPercent)}</span>
                      </div>
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-accent-strong"></div>
                    </div>

                    {/* Scale Segments */}
                    <div className="flex h-7 w-full rounded-row overflow-hidden hairline-soft gap-px bg-bg">
                      {scale.map((seg) => (
                        <div
                          key={seg.range}
                          className="flex items-center justify-center text-[10px] font-semibold text-black/60 tnum whitespace-nowrap overflow-hidden"
                          style={{ width: seg.width, background: seg.color }}
                        >
                          <span className="hidden sm:inline">{seg.range}</span>
                        </div>
                      ))}
                    </div>

                    {/* Scale Labels */}
                    <div className="flex mt-2">
                      {scale.map((seg) => (
                        <div key={seg.label} className="flex flex-col items-center px-0.5" style={{ width: seg.width }}>
                          <span className="text-[11px] text-fg-subtle text-center leading-tight">{seg.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
          </div>
        </div>

        {/* Browser/Device Chart */}
        <div className={cardClass}>
          <button onClick={() => setExpandedChart('browser')} className={expandBtnClass} aria-label="Zvětšit graf">
            <Maximize2 className="w-4 h-4" />
          </button>
          <h3 className="text-base font-semibold tracking-[-0.01em] pb-3 mb-4 hairline-b">Prohlížeč + Zařízení</h3>
          
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-4">
            {/* Chart Container - Left */}
            <div className="h-1/3 md:h-full md:w-1/2 relative min-h-[240px]">
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie
                    data={chartBrowserStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="key"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {chartBrowserStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={browserColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* List Container - Right */}
            <div className="flex-1 md:h-full md:w-1/2 overflow-y-auto pr-1 hairline-t md:border-t-0 md:hairline-l md:pl-4 pt-3 md:pt-0">
              <div className="space-y-0.5">
                {browserStats.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-2 text-[13px] px-2 py-1.5 rounded-row hover:bg-surface-3 transition-colors">
                    <div className="flex items-center min-w-0">
                      <span 
                        className="inline-block w-2.5 h-2.5 rounded-[3px] mr-2 shrink-0" 
                        style={{ backgroundColor: browserColor(idx) }}
                      ></span>
                      <span className="text-fg truncate" title={item.key}>
                        {item.key}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-fg-muted tnum text-right">
                      <span className="text-fg font-medium">{formatInt(item.count)}</span> ({formatPercent(item.percent)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {expandedChart && (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setExpandedChart(null)}
        >
            <div 
                className="bg-surface-1 shadow-pop rounded-panel w-full max-w-7xl h-[90vh] flex flex-col p-5 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 mb-4 hairline-b">
                    <h3 className="text-2xl font-semibold tracking-[-0.02em]">
                        {expandedChart === 'yesno' ? 'Rozložení odpovědí' : 'Prohlížeč + Zařízení'}
                    </h3>
                    <button 
                        onClick={() => setExpandedChart(null)}
                        className="w-9 h-9 grid place-items-center rounded-button text-fg-muted bg-white/[.07] hover:bg-white/[.12] hover:text-fg hairline transition-colors"
                        aria-label="Zavřít"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* Chart Container */}
                <div className="flex-1 w-full h-full min-h-0 p-4">
                    {renderExpandedContent()}
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default ChartsSection;
