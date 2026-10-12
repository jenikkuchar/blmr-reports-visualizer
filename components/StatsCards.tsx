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
import { formatInt } from '../utils/format';

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

  const itemClass = (active: boolean) =>
    `w-full flex items-center justify-between px-2.5 py-2 rounded-row text-sm transition-colors ${
      active ? 'bg-accent-soft text-accent' : 'text-fg hover:bg-surface-3'
    }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Question Card */}
      <div className="bg-surface-1 hairline rounded-card px-4 py-3.5 min-w-0">
        <p className="flex items-center gap-1.5 text-xs text-fg-muted mb-1">
          <HelpCircle className="w-3.5 h-3.5 text-accent" />
          Dotaz
        </p>
        <p className="text-fg font-semibold text-sm leading-relaxed truncate md:whitespace-normal" title={question}>
          {question}
        </p>
      </div>

      {/* Period Filter Card */}
      <div className="bg-surface-1 hairline rounded-card px-4 py-3.5 flex flex-col relative">
        <div className="min-w-0" ref={dropdownRef}>
          <p className="flex items-center gap-1.5 text-xs text-fg-muted mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            Sledované období
          </p>

          {/* Custom Styled Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              className="w-full h-9 flex items-center justify-between bg-surface-2 hover:bg-surface-3 px-3 rounded-row hairline transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-accent shrink-0">
                  {activeIcon}
                </span>
                <span className="text-fg font-medium text-sm truncate">
                  {activeLabel}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-fg-subtle transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-full max-h-[350px] overflow-y-auto glass shadow-pop rounded-card z-50 p-1 origin-top">
                <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold text-fg-subtle">Rozsahy</div>
                {presets.map((preset) => (
                  <button
                    key={preset.type}
                    onClick={() => handlePresetChange(preset.type)}
                    className={itemClass(dateFilter.type === preset.type)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={dateFilter.type === preset.type ? 'text-accent' : 'text-fg-subtle'}>
                        {preset.icon}
                      </span>
                      <span className="font-medium">{preset.label}</span>
                    </div>
                    {dateFilter.type === preset.type && <Check className="w-4 h-4" />}
                  </button>
                ))}

                {availableMonths.length > 0 && (
                  <>
                    <div className="px-2.5 pt-2.5 pb-1 mt-1 text-[11px] font-semibold text-fg-subtle hairline-t">Konkrétní měsíc</div>
                    {availableMonths.map((month) => {
                      const isActive = dateFilter.type === 'month' && dateFilter.monthValue === month.value;
                      return (
                        <button
                          key={month.value}
                          onClick={() => handlePresetChange('month', month.value)}
                          className={itemClass(isActive)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={isActive ? 'text-accent' : 'text-fg-subtle'}>
                              <CalendarCheck2 className="w-4 h-4" />
                            </span>
                            <span className="font-medium">{month.label}</span>
                          </div>
                          {isActive && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
          
          <p className="text-xs text-fg-subtle mt-1.5 truncate tnum">{period}</p>
        </div>

        {/* Custom Range Inputs */}
        {dateFilter.type === 'custom' && (
          <div className="mt-2 flex items-center gap-2">
            <input 
              type="date" 
              value={dateFilter.startDate}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="flex-1 min-w-0 h-8 text-xs bg-surface-2 hairline rounded-row px-2 text-fg tnum outline-none focus:shadow-[0_0_0_1px_#0a84ff_inset,0_0_0_3px_rgba(10,132,255,.45)] transition-shadow"
            />
            <span className="text-fg-subtle text-xs">do</span>
            <input 
              type="date" 
              value={dateFilter.endDate}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="flex-1 min-w-0 h-8 text-xs bg-surface-2 hairline rounded-row px-2 text-fg tnum outline-none focus:shadow-[0_0_0_1px_#0a84ff_inset,0_0_0_3px_rgba(10,132,255,.45)] transition-shadow"
            />
          </div>
        )}
        
        {/* Active Filter Indication bar at bottom */}
        {dateFilter.type !== 'all' && (
          <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-accent"></div>
        )}
      </div>

      {/* Total Answers Card */}
      <div className="bg-surface-1 hairline rounded-card px-4 py-3.5">
        <p className="flex items-center gap-1.5 text-xs text-fg-muted mb-0.5">
          <Users className="w-3.5 h-3.5 text-accent" />
          Celkový počet odpovědí
        </p>
        <p className="text-[26px] font-semibold tracking-[-0.02em] tnum">{formatInt(totalAnswers)}</p>
      </div>
    </div>
  );
};

export default StatsCards;
