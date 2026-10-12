import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BrowserDeviceStat } from '../types';
import { Maximize2, X } from 'lucide-react';

interface ChartsSectionProps {
  yesCount: number;
  noCount: number;
  yesPercent: string;
  noPercent: string;
  browserStats: BrowserDeviceStat[];
}

const COLORS_YESNO = ['#22c55e', '#ef4444']; // Green-500, Red-500
const COLORS_BROWSER = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#14b8a6', '#6b7280'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 shadow-lg rounded-lg text-sm z-50 transition-colors">
        <p className="font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
        <p className="text-gray-600 dark:text-gray-300">
          Počet: <span className="font-medium text-gray-900 dark:text-gray-100">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const ChartsSection: React.FC<ChartsSectionProps> = ({ yesCount, noCount, yesPercent, noPercent, browserStats }) => {
  const [expandedChart, setExpandedChart] = useState<'yesno' | 'browser' | null>(null);

  const yesNoData = [
    { name: `Ano (${yesPercent}%)`, value: yesCount },
    { name: `Ne (${noPercent}%)`, value: noCount },
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
              isAnimationActive={false}
            >
              {yesNoData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_YESNO[index % COLORS_YESNO.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
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
              label={({ payload }) => `${payload.key} (${payload.percent}%)`}
              isAnimationActive={false}
            >
              {chartBrowserStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_BROWSER[index % COLORS_BROWSER.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
       );
    }
    return null;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Yes/No Chart */}
        <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[600px] transition-colors relative group hover:shadow-md"
        >
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
             <button 
               onClick={() => setExpandedChart('yesno')}
               className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
             >
                <Maximize2 className="w-5 h-5" />
             </button>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Rozložení odpovědí</h3>
          
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
                      paddingAngle={5}
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

               <div className="flex justify-center space-x-12 mt-2 mb-8">
                  <div className="flex flex-col items-center">
                     <div className="flex items-center space-x-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Ano ({yesPercent}%)</span>
                     </div>
                     <div className="text-2xl font-bold text-gray-900 dark:text-white">{yesCount}</div>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="flex items-center space-x-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Ne ({noPercent}%)</span>
                     </div>
                     <div className="text-2xl font-bold text-gray-900 dark:text-white">{noCount}</div>
                  </div>
               </div>

               {/* Sentiment Scale Visualizer */}
               <div className="w-full px-4 mt-auto pb-8">
                  <div className="relative pt-10">
                    {/* Professional Floating Pin Indicator */}
                    <div 
                      className="absolute top-0 transition-all duration-1000 ease-in-out flex flex-col items-center -translate-x-1/2 z-20"
                      style={{ left: `${yesPercentNum}%` }}
                    >
                      {/* Badge with percent */}
                      <div className="bg-blue-600 dark:bg-blue-500 text-white px-2.5 py-1 rounded-md shadow-lg border border-white/20 flex items-center justify-center">
                        <span className="text-[12px] font-black tracking-tight">{yesPercent}%</span>
                      </div>
                      {/* Triangle Pointer pointing down - tip touches the bar */}
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600 dark:border-t-blue-500"></div>
                    </div>

                    {/* Scale Segments with Dividers */}
                    <div className="flex h-7 w-full rounded-lg overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      <div className="w-[30%] bg-[#b91c1c] border-r border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">0–30 %</div>
                      <div className="w-[25%] bg-[#ef4444] border-r border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">30–55 %</div>
                      <div className="w-[15%] bg-[#f59e0b] border-r border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">55–70 %</div>
                      <div className="w-[15%] bg-[#eab308] border-r border-white/10 flex items-center justify-center text-[10px] font-bold text-black/40">70–85 %</div>
                      <div className="w-[15%] bg-[#22c55e] flex items-center justify-center text-[10px] font-bold text-white/50">85–100 %</div>
                    </div>

                    {/* Scale Labels - Aligned with the widths above */}
                    <div className="flex mt-2 px-0">
                      <div className="w-[30%] flex flex-col items-center px-1">
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter text-center">nevyhovující</span>
                      </div>
                      <div className="w-[25%] flex flex-col items-center px-1">
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter text-center">slabé</span>
                      </div>
                      <div className="w-[15%] flex flex-col items-center px-1">
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter text-center">přijatelné</span>
                      </div>
                      <div className="w-[15%] flex flex-col items-center px-1">
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter text-center">dobré</span>
                      </div>
                      <div className="w-[15%] flex flex-col items-center px-1">
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter text-center">výborné</span>
                      </div>
                    </div>
                  </div>
               </div>
          </div>
        </div>

        {/* Browser/Device Chart */}
        <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[600px] transition-colors relative group"
        >
          <div 
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
             <button 
               onClick={() => setExpandedChart('browser')}
               className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
             >
                <Maximize2 className="w-5 h-5" />
             </button>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Prohlížeč + Zařízení</h3>
          
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-4">
            {/* Chart Container - Left */}
            <div 
                className="h-1/3 md:h-full md:w-1/2 relative min-h-[200px]"
            >
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
                      <Cell key={`cell-${index}`} fill={COLORS_BROWSER[index % COLORS_BROWSER.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* List Container - Right */}
            <div className="flex-1 md:h-full md:w-1/2 overflow-y-auto pr-2 custom-scrollbar border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 md:pl-4 pt-4 md:pt-0">
              <div className="space-y-2">
                {browserStats.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors">
                    <div className="flex items-center min-w-0 mr-2">
                      <span 
                        className="inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0" 
                        style={{ backgroundColor: COLORS_BROWSER[idx % COLORS_BROWSER.length] || '#9ca3af' }}
                      ></span>
                      <span className="text-gray-700 dark:text-gray-300 truncate" title={item.key}>
                        {item.key}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white shrink-0 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-[10px]">
                      {item.count} ({item.percent}%)
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
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
            onClick={() => setExpandedChart(null)}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col p-6 relative border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {expandedChart === 'yesno' ? 'Rozložení odpovědí' : 'Prohlížeč + Zařízení'}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setExpandedChart(null)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                {/* Chart Container */}
                <div className="flex-1 w-full h-full min-h-0 bg-white dark:bg-gray-800 rounded-lg p-4">
                    {renderExpandedContent()}
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default ChartsSection;