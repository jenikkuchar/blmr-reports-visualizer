import { CsvRow, DateRangeStats, ExtendedAnswerStat, BrowserDeviceStat, DateFilterState, AvailableMonth, TrendPoint } from '../types';

export const calculateDateRange = (data: CsvRow[]): DateRangeStats => {
  const timestamps = data
    .map((row) => {
      const ts = row["#2 timestamp"];
      return ts ? new Date(ts) : null;
    })
    .filter((date): date is Date => date !== null && !isNaN(date.getTime()));

  if (timestamps.length === 0) {
    return { periodString: 'N/A', minDate: null, maxDate: null };
  }

  const minDate = new Date(Math.min(...timestamps.map(t => t.getTime())));
  const maxDate = new Date(Math.max(...timestamps.map(t => t.getTime())));

  const diffMs = maxDate.getTime() - minDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;

  // Skloňování měsíců
  let monthText = '';
  if (diffMonths === 1) monthText = '1 měsíc';
  else if (diffMonths >= 2 && diffMonths <= 4) monthText = `${diffMonths} měsíce`;
  else if (diffMonths >= 5) monthText = `${diffMonths} měsíců`;

  // Skloňování dní
  let dayText = '';
  if (remainingDays === 1) dayText = '1 den';
  else if (remainingDays >= 2 && remainingDays <= 4) dayText = `${remainingDays} dny`;
  else if (remainingDays >= 5 || remainingDays === 0) dayText = `${remainingDays} dní`;

  let duration = '';
  if (diffMonths > 0) {
    duration = ` (${monthText}, ${dayText})`;
  } else {
    duration = ` (${dayText})`;
  }

  const formattedMin = minDate.toLocaleDateString('cs-CZ');
  const formattedMax = maxDate.toLocaleDateString('cs-CZ');

  return {
    periodString: `${formattedMin} - ${formattedMax}${duration}`,
    minDate,
    maxDate
  };
};

export const getAvailableMonths = (data: CsvRow[]): AvailableMonth[] => {
  const monthMap = new Map<string, AvailableMonth>();
  const monthNames = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
  ];

  data.forEach(row => {
    const ts = row["#2 timestamp"];
    if (!ts) return;
    const date = new Date(ts);
    if (isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        value: key,
        label: `${monthNames[month]} ${year}`,
        year,
        month
      });
    }
  });

  return Array.from(monthMap.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
};

export const filterDataByDate = (data: CsvRow[], filter: DateFilterState): CsvRow[] => {
  if (filter.type === 'all') return data;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startLimit: Date | null = null;
  let endLimit: Date | null = null;

  switch (filter.type) {
    case 'today':
      startLimit = today;
      endLimit = new Date(today);
      endLimit.setDate(today.getDate() + 1);
      break;
    case 'yesterday':
      startLimit = new Date(today);
      startLimit.setDate(today.getDate() - 1);
      endLimit = today;
      break;
    case 'last7':
      startLimit = new Date(today);
      startLimit.setDate(today.getDate() - 7);
      endLimit = new Date(now);
      break;
    case 'last14':
      startLimit = new Date(today);
      startLimit.setDate(today.getDate() - 14);
      endLimit = new Date(now);
      break;
    case 'last30':
      startLimit = new Date(today);
      startLimit.setDate(today.getDate() - 30);
      endLimit = new Date(now);
      break;
    case 'month':
      if (filter.monthValue) {
        const [y, m] = filter.monthValue.split('-').map(Number);
        startLimit = new Date(y, m - 1, 1);
        endLimit = new Date(y, m, 1);
      }
      break;
    case 'custom':
      if (filter.startDate) startLimit = new Date(filter.startDate);
      if (filter.endDate) {
        endLimit = new Date(filter.endDate);
        endLimit.setHours(23, 59, 59, 999);
      }
      break;
  }

  return data.filter(row => {
    const rowDate = new Date(row["#2 timestamp"]);
    if (isNaN(rowDate.getTime())) return false;
    
    if (startLimit && rowDate < startLimit) return false;
    if (endLimit && rowDate > endLimit) return false;
    return true;
  });
};

export const getTrendData = (data: CsvRow[], type: 'month' | 'week'): { data: TrendPoint[], average: number } => {
  const groups: Record<string, { total: number; yes: number; timestamp: number; minTs: number; maxTs: number }> = {};
  let totalYes = 0;
  let totalAll = 0;

  data.forEach(row => {
    const ts = row["#2 timestamp"];
    if (!ts) return;
    const date = new Date(ts);
    const time = date.getTime();
    if (isNaN(time)) return;

    let key = '';
    
    if (type === 'month') {
      const year = date.getFullYear();
      const month = date.getMonth();
      key = `${year}-${String(month + 1).padStart(2, '0')}`;
    } else {
      // Get ISO Week
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      key = `${d.getUTCFullYear()}-T${String(weekNo).padStart(2, '0')}`;
    }

    if (!groups[key]) {
      groups[key] = { total: 0, yes: 0, timestamp: time, minTs: time, maxTs: time };
    }

    groups[key].total++;
    totalAll++;
    if (row["#4 answer"] === 'Ano') {
      groups[key].yes++;
      totalYes++;
    }
    
    if (time < groups[key].minTs) groups[key].minTs = time;
    if (time > groups[key].maxTs) groups[key].maxTs = time;
  });

  const sortedPoints = Object.entries(groups)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, val]) => ({
      key,
      timestamp: val.timestamp,
      total: val.total,
      yes: val.yes,
      ratio: Number(((val.yes / val.total) * 100).toFixed(1)),
      firstDate: val.minTs,
      lastDate: val.maxTs
    }));

  const formattedPoints: TrendPoint[] = sortedPoints.map(p => {
    const date = new Date(p.timestamp);
    let label = '';
    if (type === 'month') {
      label = new Intl.DateTimeFormat('cs-CZ', { month: 'short', year: '2-digit' }).format(date);
    } else {
      const [year, week] = p.key.split('-');
      label = `${week}/${year.slice(2)}`;
    }
    return {
      label,
      timestamp: p.timestamp,
      total: p.total,
      yes: p.yes,
      ratio: p.ratio,
      firstDate: p.firstDate,
      lastDate: p.lastDate
    };
  });

  const average = totalAll > 0 ? Number(((totalYes / totalAll) * 100).toFixed(1)) : 0;

  return { data: formattedPoints, average };
};

export const getRollingTrendData = (data: CsvRow[], windowSize: number = 50, fromEnd: boolean = false): { data: TrendPoint[], average: number } => {
  // Sort data by timestamp
  let sortedData = [...data]
    .filter(row => row["#2 timestamp"] && !isNaN(new Date(row["#2 timestamp"]).getTime()))
    .sort((a, b) => new Date(a["#2 timestamp"]).getTime() - new Date(b["#2 timestamp"]).getTime());

  if (fromEnd) {
    sortedData.reverse();
  }

  const points: TrendPoint[] = [];
  let totalYesAll = 0;
  let totalAll = sortedData.length;

  for (let i = 0; i < sortedData.length; i += windowSize) {
    const chunk = sortedData.slice(i, i + windowSize);
    const yesCount = chunk.filter(row => row["#4 answer"] === 'Ano').length;
    totalYesAll += yesCount;

    const lastItem = chunk[chunk.length - 1];
    const firstItem = chunk[0];
    const dateFirst = new Date(firstItem["#2 timestamp"]);
    const dateLast = new Date(lastItem["#2 timestamp"]);
    
    // Label showing the range
    let label = '';
    if (fromEnd) {
      const endIdx = totalAll - i;
      const startIdx = Math.max(1, totalAll - i - windowSize + 1);
      label = `${startIdx}-${endIdx}`;
    } else {
      label = `${i + 1}-${i + chunk.length}`;
    }

    points.push({
      label,
      timestamp: dateLast.getTime(),
      total: chunk.length,
      yes: yesCount,
      ratio: Number(((yesCount / chunk.length) * 100).toFixed(1)),
      firstDate: dateFirst.getTime(),
      lastDate: dateLast.getTime()
    });
  }

  if (fromEnd) {
    points.reverse();
  }

  const average = totalAll > 0 ? Number(((totalYesAll / totalAll) * 100).toFixed(1)) : 0;

  return { data: points, average };
};

export const processExtendedAnswers = (data: CsvRow[], answerType: 'Ano' | 'Ne'): { stats: ExtendedAnswerStat[], others: CsvRow[] } => {
  const filteredRows = data.filter(row => row["#4 answer"] === answerType);
  const extendedCounts: Record<string, number> = {};
  const otherRows: CsvRow[] = [];
  const total = data.length;

  const MERGED_LABEL = 'Bez upřesnění';

  filteredRows.forEach(row => {
    const ext = (row["#6 extended_answer"] || '').trim();

    if (ext === '' || ext === 'Jiné' || ext === 'Jiné:') {
      extendedCounts[MERGED_LABEL] = (extendedCounts[MERGED_LABEL] || 0) + 1;
    } else if (ext.startsWith('Jiné:')) {
      const key = 'Jiné'; 
      extendedCounts[key] = (extendedCounts[key] || 0) + 1;
      otherRows.push(row);
    } else {
      extendedCounts[ext] = (extendedCounts[ext] || 0) + 1;
    }
  });

  const stats: ExtendedAnswerStat[] = Object.entries(extendedCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([answer, count]) => ({
      answer,
      count,
      percent: total > 0 ? ((count / total) * 100).toFixed(1) : '0',
      type: answerType
    }));

  otherRows.sort((a, b) => {
    const dateA = new Date(a["#2 timestamp"] || 0);
    const dateB = new Date(b["#2 timestamp"] || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return { stats, others: otherRows };
};

export const processBrowserStats = (data: CsvRow[]): BrowserDeviceStat[] => {
  const counts: Record<string, number> = {};
  const total = data.length;

  data.forEach(row => {
    const key = `${row["#7 browser"]} + ${row["#8 device"]}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      key,
      count,
      percent: total > 0 ? ((count / total) * 100).toFixed(1) : '0'
    }));
};

const COLUMN_MAPPING: Record<string, string> = {
  "#2 timestamp": "Datum a čas",
  "#3 question": "Otázka",
  "#4 answer": "Odpověď",
  "#6 extended_answer": "Doplňující odpověď",
  "#7 browser": "Prohlížeč",
  "#8 device": "Zařízení",
  "form_name": "Název formuláře",
  "extended_question": "Doplňující otázka",
};

export const cleanHeader = (header: string): string => {
  if (COLUMN_MAPPING[header]) return COLUMN_MAPPING[header];
  if (header.toLowerCase().includes('location')) return "Stránka (URL)";
  const stripped = header.replace(/^#\d+\s+/, '');
  if (COLUMN_MAPPING[stripped]) return COLUMN_MAPPING[stripped];
  return stripped;
};

export const formatCellValue = (header: string, value: string): string => {
  if (!value) return '';
  if (header.toLowerCase().includes('location')) {
    return value.replace('https://www.datart.cz', '');
  }
  return value;
};

export const getDateStatus = (timestampStr: string): 'Dnes' | 'Včera' | 'Nedávno' | null => {
  if (!timestampStr) return null;
  const date = new Date(timestampStr);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (inputDate.getTime() === today.getTime()) return 'Dnes';
  if (inputDate.getTime() === yesterday.getTime()) return 'Včera';

  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours <= 72) return 'Nedávno';

  return null;
};