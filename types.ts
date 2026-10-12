export interface CsvRow {
  "#2 timestamp": string;
  "#3 question": string;
  "#4 answer": string;
  "#6 extended_answer": string;
  "#7 browser": string;
  "#8 device": string;
  [key: string]: string; // Allow for other columns just in case
}

export interface ExtendedAnswerStat {
  answer: string;
  count: number;
  percent: string;
  type: 'Ano' | 'Ne';
}

export interface BrowserDeviceStat {
  key: string;
  count: number;
  percent: string;
}

export interface DateRangeStats {
  periodString: string;
  minDate: Date | null;
  maxDate: Date | null;
}

export type DateFilterType = 'all' | 'today' | 'yesterday' | 'last7' | 'last14' | 'last30' | 'custom' | 'month';

export interface DateFilterState {
  type: DateFilterType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  monthValue?: string; // YYYY-MM
}

export interface AvailableMonth {
  value: string; // YYYY-MM
  label: string; // Leden 2025
  year: number;
  month: number;
}

export interface TrendPoint {
  label: string;
  timestamp: number;
  total: number;
  yes: number;
  ratio: number;
  firstDate?: number;
  lastDate?: number;
}