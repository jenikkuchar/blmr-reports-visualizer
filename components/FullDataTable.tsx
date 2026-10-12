import React, { useState, useMemo, useEffect } from 'react';
import { CsvRow } from '../types';
import { Eye, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { formatInt, formatNumericCell, isNumericValue } from '../utils/format';
import { cleanHeader, formatCellValue, getDateStatus } from '../utils/helpers';

interface FullDataTableProps {
  data: CsvRow[];
  onRowSelect: (row: CsvRow) => void;
  externalFilter: { key: string, value: string } | null;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string;
  direction: SortDirection;
}

const FullDataTable: React.FC<FullDataTableProps> = ({ data, onRowSelect, externalFilter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    data.length > 0 && "#2 timestamp" in data[0] 
      ? { key: "#2 timestamp", direction: 'desc' } 
      : null
  );

  const headers = data.length > 0 
    ? Object.keys(data[0]).filter(h => 
        h !== "#3 question" && 
        !h.includes("form_name")
      ) 
    : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage, data]);

  useEffect(() => {
    if (externalFilter) {
      setFilters(prev => ({
        ...prev,
        [externalFilter.key]: externalFilter.value
      }));
      setIsMinimized(false); // Auto-expand when filter is applied
    }
  }, [externalFilter]);

  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilter = (key: string) => {
    handleFilterChange(key, '');
  };

  const getBadgeStyle = (status: 'Dnes' | 'Včera' | 'Nedávno') => {
    switch (status) {
      case 'Dnes':
        return 'text-accent bg-accent-soft';
      case 'Včera':
        return 'text-info bg-info-soft';
      case 'Nedávno':
        return 'text-warning bg-warning-soft';
      default:
        return 'text-fg-muted bg-white/[.07]';
    }
  };

  // Sloupce, kde jsou všechny vyplněné hodnoty čísla → zarovnání vpravo, tabular-nums
  const numericColumns = useMemo(() => {
    const result = new Set<string>();
    headers.forEach(header => {
      const values = data.map(row => row[header]).filter(v => v && v.trim() !== '');
      if (values.length > 0 && values.every(isNumericValue)) result.add(header);
    });
    return result;
  }, [data, headers.join('|')]);

  const processedData = useMemo(() => {
    let result = [...data];

    const activeFilters = Object.entries(filters).filter(([_, value]) => typeof value === 'string' && value.trim() !== '');
    if (activeFilters.length > 0) {
      result = result.filter(row => {
        return activeFilters.every(([key, filterValue]) => {
          const cellValue = String(row[key] || '').toLowerCase();
          return cellValue.includes((filterValue as string).toLowerCase());
        });
      });
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (sortConfig.key.includes('timestamp')) {
          const dateA = new Date(valA || 0).getTime();
          const dateB = new Date(valB || 0).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sortConfig]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = processedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const thClass = 'px-3 py-2.5 text-[11px] font-semibold text-fg-subtle whitespace-nowrap hairline-b';
  const pagerBtn = (disabled: boolean) =>
    `w-7 h-7 grid place-items-center rounded-row hairline transition-colors ${
      disabled ? 'opacity-40 cursor-not-allowed text-fg-muted bg-white/[.07]' : 'text-fg bg-white/[.07] hover:bg-white/[.12]'
    }`;

  return (
    <div className="bg-surface-1 hairline rounded-card p-5 flex flex-col min-h-0">
      <div className="flex flex-wrap justify-between items-center gap-3 pb-3 mb-4 hairline-b">
        <h3 className="text-base font-semibold tracking-[-0.01em]">Kompletní data</h3>
        <div className="flex items-center gap-2">
           {!isMinimized && Object.values(filters).some(f => typeof f === 'string' && f.trim() !== '') && (
             <button 
               onClick={() => setFilters({})}
               className="h-7 px-2.5 rounded-row text-[13px] font-medium text-danger hover:bg-danger-soft transition-colors"
               style={{ boxShadow: '0 0 0 .5px rgba(255,69,58,.4) inset' }}
             >
               Vymazat filtry
             </button>
           )}
           <span className="text-xs font-medium h-[22px] inline-flex items-center px-2 bg-white/[.07] text-fg-muted rounded-md tnum whitespace-nowrap">
             {processedData.length === data.length ? `Celkem ${formatInt(data.length)}` : `Filtr: ${formatInt(processedData.length)} z ${formatInt(data.length)}`}
           </span>
           <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-8 h-8 grid place-items-center text-fg-subtle hover:text-fg hover:bg-white/[.06] rounded-row transition-colors"
            title={isMinimized ? "Maximalizovat" : "Minimalizovat"}
          >
            {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="overflow-x-auto rounded-row hairline-soft">
            <table className="w-full text-[13px] text-left border-collapse">
              <thead>
                <tr>
                  {headers.map((header) => {
                    const isNum = numericColumns.has(header);
                    return (
                    <th 
                      key={header} 
                      className={`${thClass} cursor-pointer hover:text-fg-muted transition-colors select-none group ${isNum ? 'text-right' : ''}`}
                      onClick={() => handleSort(header)}
                    >
                      <div className={`flex items-center gap-1 ${isNum ? 'justify-end' : ''}`}>
                        <span>{cleanHeader(header)}</span>
                        <span className={sortConfig?.key === header ? 'text-accent' : 'text-fg-subtle'}>
                          {sortConfig?.key === header ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-60" />
                          )}
                        </span>
                      </div>
                    </th>
                    );
                  })}
                  <th className={`${thClass} text-right sticky right-0 bg-surface-1 hairline-l z-10`}>Akce</th>
                </tr>
                <tr>
                  {headers.map((header) => (
                    <th key={`filter-${header}`} className="px-2 py-2 hairline-b bg-white/[.02]">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <Search className="h-3 w-3 text-fg-subtle" />
                        </div>
                        <input
                          type="text"
                          placeholder="Filtr..."
                          value={filters[header] || ''}
                          onChange={(e) => handleFilterChange(header, e.target.value)}
                          className="block w-full min-w-[90px] h-7 pl-7 pr-6 text-xs font-normal rounded-row bg-surface-2 hairline text-fg placeholder:text-fg-subtle outline-none focus:shadow-[0_0_0_1px_#0a84ff_inset,0_0_0_3px_rgba(10,132,255,.45)] transition-shadow"
                        />
                        {filters[header] && (
                            <button 
                              onClick={() => clearFilter(header)}
                              className="absolute inset-y-0 right-0 pr-1.5 flex items-center text-fg-subtle hover:text-fg"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 sticky right-0 bg-surface-1 hairline-l hairline-b z-10"></th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, idx) => {
                  const dateStatus = getDateStatus(row["#2 timestamp"]);
                  const isHighlighted = dateStatus !== null;

                  return (
                    <tr 
                      key={startIndex + idx} 
                      onClick={() => onRowSelect(row)}
                      className={`cursor-pointer transition-colors group ${isHighlighted ? 'bg-warning/[.05]' : ''} hover:bg-white/[.03]`}
                    >
                      {headers.map((header) => {
                        const isTimestamp = header === "#2 timestamp";
                        const isAnswer = header === "#4 answer";
                        const isNum = numericColumns.has(header);
                        const isWideColumn = header.includes('extended_answer') || header.includes('extended_question');

                        const cellValue = row[header];
                        
                        let cellClasses = "px-3 py-2 hairline-b text-fg-muted ";
                        
                        if (isTimestamp) {
                            cellClasses += "whitespace-nowrap tnum text-fg";
                        } else if (isNum) {
                            cellClasses += "whitespace-nowrap tnum text-right";
                        } else if (isWideColumn) {
                            cellClasses += "max-w-[300px] truncate";
                        } else {
                            cellClasses += "max-w-[150px] truncate";
                        }

                        return (
                          <td key={`${idx}-${header}`} className={cellClasses} title={cellValue}>
                            <div className={`flex items-center gap-2 ${isNum ? 'justify-end' : ''}`}>
                               {isAnswer ? (
                                  <span className={`inline-flex items-center gap-1.5 h-[22px] px-2 rounded-md text-xs font-medium ${
                                    cellValue === 'Ano' 
                                      ? 'badge-dot text-success bg-success-soft' 
                                      : cellValue === 'Ne' 
                                        ? 'badge-dot text-danger bg-danger-soft'
                                        : ''
                                  }`}>
                                    {formatCellValue(header, cellValue)}
                                  </span>
                               ) : isNum ? (
                                  formatNumericCell(cellValue)
                               ) : (
                                  formatCellValue(header, cellValue)
                               )}

                               {isTimestamp && isHighlighted && dateStatus && (
                                 <span className={`badge-dot inline-flex items-center gap-1.5 h-5 px-1.5 rounded-md text-[11px] font-medium shrink-0 ${getBadgeStyle(dateStatus)}`}>
                                   {dateStatus}
                                 </span>
                               )}
                            </div>
                          </td>
                        );
                      })}
                      
                      <td className="px-3 py-2 text-right sticky right-0 hairline-l hairline-b bg-surface-1 group-hover:bg-[#15151b]">
                        <button className="w-7 h-7 inline-grid place-items-center rounded-row text-fg-subtle group-hover:text-accent transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {currentData.length === 0 && (
                  <tr>
                    <td colSpan={headers.length + 1} className="px-3 py-8 text-center text-fg-subtle">
                      Žádná data neodpovídají filtru
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 sm:gap-0">
            <div className="flex items-center gap-2 text-xs text-fg-muted">
              <span>Zobrazit na stránku:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="h-7 rounded-row px-2 bg-surface-2 hairline text-fg tnum outline-none focus:shadow-[0_0_0_1px_#0a84ff_inset,0_0_0_3px_rgba(10,132,255,.45)]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
               <div className="text-xs text-fg-muted tnum">
                 {processedData.length > 0 ? (
                   <>
                     <span className="font-medium text-fg">{formatInt(startIndex + 1)}</span> - <span className="font-medium text-fg">{formatInt(Math.min(startIndex + itemsPerPage, processedData.length))}</span> z <span className="font-medium text-fg">{formatInt(processedData.length)}</span>
                   </>
                 ) : '0 záznamů'}
               </div>
              
               {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={pagerBtn(currentPage === 1)}
                    aria-label="Předchozí stránka"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="text-xs font-medium text-fg-muted min-w-[60px] text-center tnum">
                    {formatInt(currentPage)} / {formatInt(totalPages)}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={pagerBtn(currentPage === totalPages)}
                    aria-label="Další stránka"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
               )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FullDataTable;
