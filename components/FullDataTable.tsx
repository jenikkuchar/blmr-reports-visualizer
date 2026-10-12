import React, { useState, useMemo, useEffect } from 'react';
import { CsvRow } from '../types';
import { Eye, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search, XCircle, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
      case 'Včera':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800';
      case 'Nedávno':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Kompletní data</h3>
        <div className="flex items-center space-x-3">
           {!isMinimized && Object.values(filters).some(f => typeof f === 'string' && f.trim() !== '') && (
             <button 
               onClick={() => setFilters({})}
               className="text-xs text-red-600 dark:text-red-400 hover:underline mr-2"
             >
               Vymazat filtry
             </button>
           )}
           <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
             {processedData.length === data.length ? `Celkem ${data.length}` : `Filtr: ${processedData.length} z ${data.length}`}
           </span>
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
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                <tr>
                  {headers.map((header) => (
                    <th 
                      key={header} 
                      className="px-3 py-3 font-semibold whitespace-nowrap cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors select-none group"
                      onClick={() => handleSort(header)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{cleanHeader(header)}</span>
                        <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                          {sortConfig?.key === header ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-right sticky right-0 bg-gray-100 dark:bg-gray-700 border-l border-gray-200 dark:border-gray-600 z-10 shadow-sm">Akce</th>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                  {headers.map((header) => (
                    <th key={`filter-${header}`} className="px-2 py-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <Search className="h-3 w-3 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Filtr..."
                          value={filters[header] || ''}
                          onChange={(e) => handleFilterChange(header, e.target.value)}
                          className="block w-full pl-7 pr-6 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 font-normal bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                        {filters[header] && (
                            <button 
                              onClick={() => clearFilter(header)}
                              className="absolute inset-y-0 right-0 pr-1 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 sticky right-0 bg-gray-50 dark:bg-gray-750 border-l border-gray-200 dark:border-gray-600 z-10"></th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, idx) => {
                  const dateStatus = getDateStatus(row["#2 timestamp"]);
                  const isHighlighted = dateStatus !== null;
                  
                  const stickyCellClasses = isHighlighted
                    ? 'bg-amber-50 dark:bg-gray-800 group-hover:bg-amber-100 dark:group-hover:bg-gray-700 border-amber-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-gray-700 border-gray-100 dark:border-gray-700';

                  return (
                    <tr 
                      key={startIndex + idx} 
                      onClick={() => onRowSelect(row)}
                      className={`
                        border-b dark:border-gray-700 cursor-pointer transition-colors group
                        ${isHighlighted 
                          ? 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 border-l-4 border-l-amber-400 dark:border-l-amber-500 pl-[calc(0.75rem-4px)]' 
                          : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-l-4 border-l-transparent pl-[calc(0.75rem-4px)]'}
                      `}
                    >
                      {headers.map((header) => {
                        const isTimestamp = header === "#2 timestamp";
                        const isAnswer = header === "#4 answer";
                        const isWideColumn = header.includes('extended_answer') || header.includes('extended_question');

                        const cellValue = row[header];
                        
                        let cellClasses = "px-3 py-2 text-gray-600 dark:text-gray-300 ";
                        
                        if (isTimestamp) {
                            cellClasses += "whitespace-nowrap";
                        } else if (isWideColumn) {
                            cellClasses += "max-w-[300px] truncate";
                        } else {
                            cellClasses += "max-w-[150px] truncate";
                        }

                        return (
                          <td key={`${idx}-${header}`} className={cellClasses} title={cellValue}>
                            <div className="flex items-center gap-2">
                               {isAnswer ? (
                                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                    cellValue === 'Ano' 
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                      : cellValue === 'Ne' 
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        : ''
                                  }`}>
                                    {formatCellValue(header, cellValue)}
                                  </span>
                               ) : (
                                  formatCellValue(header, cellValue)
                               )}

                               {isTimestamp && isHighlighted && dateStatus && (
                                 <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 shadow-sm uppercase ${getBadgeStyle(dateStatus)}`}>
                                   {dateStatus === 'Nedávno' && <Sparkles className="w-2.5 h-2.5 mr-1" />}
                                   {dateStatus}
                                 </span>
                               )}
                            </div>
                          </td>
                        );
                      })}
                      
                      <td className={`px-3 py-2 text-right sticky right-0 border-l ${stickyCellClasses}`}>
                        <button className="text-gray-400 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {currentData.length === 0 && (
                  <tr>
                    <td colSpan={headers.length + 1} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400 italic">
                      Žádná data neodpovídají filtru
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 gap-4 sm:gap-0">
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <span>Zobrazit na stránku:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
               <div className="text-xs text-gray-500 dark:text-gray-400">
                 {processedData.length > 0 ? (
                   <>
                     <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> - <span className="font-medium text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, processedData.length)}</span> z <span className="font-medium text-gray-900 dark:text-white">{processedData.length}</span>
                   </>
                 ) : '0 záznamů'}
               </div>
              
               {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors ${
                      currentPage === 1 
                        ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500'
                    }`}
                    aria-label="Předchozí stránka"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors ${
                      currentPage === totalPages 
                        ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500'
                    }`}
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