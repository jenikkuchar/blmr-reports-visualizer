import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  HelpCircle, 
  Users, 
  ChevronDown, 
  Globe, 
  Clock, 
  History, 
  CalendarDays, 
  CalendarRange, 
  Settings2,
  Check,
  CalendarCheck2
} from 'lucide-react';
import { DateFilterState, DateFilterType, AvailableMonth } from '../types';

interface StatsCardsProps {
  question: string;
  period: string;
  totalAnswers: number;
  dateFilter: DateFilterState;
  onDateFilterChange: (filter: DateFilterState) => void;
  availableMonths: AvailableMonth[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  question, 
  period, 
  totalAnswers, 
  dateFilter, 
  onDateFilterChange,
  availableMonths
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handlePresetChange = (type: DateFilterType, monthValue?: string) => {
    onDateFilterChange({ ...dateFilter, type, monthValue });
    setIsDropdownOpen(false);
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onDateFilterChange({ ...dateFilter, [field]: value, type: 'custom' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const presets: { type: DateFilterType; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: 'Vše', icon: <Globe className="w-4 h-4" /> },
    { type: 'today', label: 'Dnes', icon: <Clock className="w-4 h-4" /> },
    { type: 'yesterday', label: 'Včera', icon: <History className="w-4 h-4" /> },
    { type: 'last7', label: 'Posledních 7 dní', icon: <CalendarRange className="w-4 h-4" /> },
    { type: 'last14', label: 'Posledních 14 dní', icon: <CalendarRange className="w-4 h-4" /> },
    { type: 'last30', label: 'Posledních 30 dní', icon: <CalendarDays className="w-4 h-4" /> },
    { type: 'custom', label: 'Vlastní rozsah', icon: <Settings2 className="w-4 h-4" /> },
  ];

  let activeLabel = presets.find(p => p.type === dateFilter.type)?.label || 'Vše';
  let activeIcon = presets.find(p => p.type === dateFilter.type)?.icon || <Globe className="w-4 h-4" />;

  if (dateFilter.type === 'month' && dateFilter.monthValue) {
    const month = availableMonths.find(m => m.value === dateFilter.monthValue);
    if (month) {
      activeLabel = month.label;
      activeIcon = <CalendarCheck2 className="w-4 h-4" />;
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start space-x-4 transition-colors">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0">
          <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dotaz</p>
          <p className="text-gray-900 dark:text-white font-semibold text-sm leading-relaxed truncate md:whitespace-normal" title={question}>
            {question}
          </p>
        </div>
      </div>

      {/* Period Filter Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors relative">
        <div className="flex items-start space-x-4 mb-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg shrink-0">
            <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0" ref={dropdownRef}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sledované období</p>
            
            {/* Custom Styled Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 transition-all text-left group"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-emerald-600 dark:text-emerald-400 shrink-0">
                    {activeIcon}
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold text-sm truncate">
                    {activeLabel}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full max-h-[350px] overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 py-1 origin-top animate-in fade-in zoom-in duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rozsahy</div>
                  {presets.map((preset) => (
                    <button
                      key={preset.type}
                      onClick={() => handlePresetChange(preset.type)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                        ${dateFilter.type === preset.type 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={dateFilter.type === preset.type ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}>
                          {preset.icon}
                        </span>
                        <span className="font-medium">{preset.label}</span>
                      </div>
                      {dateFilter.type === preset.type && <Check className="w-4 h-4" />}
                    </button>
                  ))}

                  {availableMonths.length > 0 && (
                    <>
                      <div className="px-3 py-1 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-t dark:border-gray-700 pt-2">Konkrétní měsíc</div>
                      {availableMonths.map((month) => (
                        <button
                          key={month.value}
                          onClick={() => handlePresetChange('month', month.value)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                            ${dateFilter.type === 'month' && dateFilter.monthValue === month.value 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={dateFilter.type === 'month' && dateFilter.monthValue === month.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}>
                              <CalendarCheck2 className="w-4 h-4" />
                            </span>
                            <span className="font-medium">{month.label}</span>
                          </div>
                          {dateFilter.type === 'month' && dateFilter.monthValue === month.value && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 italic truncate">{period}</p>
          </div>
        </div>

        {/* Custom Range Inputs */}
        {dateFilter.type === 'custom' && (
          <div className="mt-2 flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200">
            <div className="relative flex-1">
              <input 
                type="date" 
                value={dateFilter.startDate}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="w-full text-[11px] bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <span className="text-gray-400 text-[10px] font-bold">DO</span>
            <div className="relative flex-1">
              <input 
                type="date" 
                value={dateFilter.endDate}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="w-full text-[11px] bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        )}
        
        {/* Active Filter Indication bar at bottom */}
        {dateFilter.type !== 'all' && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
        )}
      </div>

      {/* Total Answers Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start space-x-4 transition-colors">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg shrink-0">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Celkový počet odpovědí</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalAnswers}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;