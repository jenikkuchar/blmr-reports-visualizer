import React, { useState } from 'react';
import { CsvRow } from '../types';
import { Clock, Eye, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { getDateStatus } from '../utils/helpers';

interface OtherAnswersTableProps {
  title: string;
  data: CsvRow[];
  type?: 'Ano' | 'Ne';
  onRowSelect: (row: CsvRow) => void;
}

const OtherAnswersTable: React.FC<OtherAnswersTableProps> = ({ title, data, type, onRowSelect }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  
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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
      <div className="flex items-center justify-between mb-4 border-b dark:border-gray-700 pb-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
        <div className="flex items-center gap-3">
          {isMinimized && data.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              {data.length} záznamů
            </span>
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
          {data.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 italic text-sm">Žádná data k zobrazení</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Timestamp</th>
                    <th className="px-4 py-3">Odpověď</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => {
                    const dateStatus = getDateStatus(row["#2 timestamp"]);
                    const isHighlighted = dateStatus !== null;
                    
                    let rowStyles = '';
                    
                    if (isHighlighted) {
                        rowStyles = 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 border-l-amber-400 dark:border-l-amber-500';
                    } else if (type === 'Ano') {
                        rowStyles = 'bg-green-50/40 dark:bg-green-900/10 hover:bg-green-100/60 dark:hover:bg-green-900/20 border-l-green-500 dark:border-l-green-600';
                    } else if (type === 'Ne') {
                        rowStyles = 'bg-red-50/40 dark:bg-red-900/10 hover:bg-red-100/60 dark:hover:bg-red-900/20 border-l-red-500 dark:border-l-red-600';
                    } else {
                        rowStyles = 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-transparent';
                    }

                    return (
                      <tr 
                        key={idx} 
                        onClick={() => onRowSelect(row)}
                        className={`
                          border-b dark:border-gray-700 transition-colors group cursor-pointer border-l-4
                          ${rowStyles}
                        `}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap min-w-[200px]">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500" />
                              <span>{row["#2 timestamp"]}</span>
                            </div>
                            {isHighlighted && dateStatus && (
                              <div className="mt-1 flex items-center">
                                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap ${getBadgeStyle(dateStatus)}`}>
                                   <Sparkles className="w-3 h-3 mr-1" />
                                   {dateStatus.toUpperCase()}
                                 </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 break-words">
                          {row["#6 extended_answer"].replace('Jiné: ', '')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onRowSelect(row); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="Zobrazit detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OtherAnswersTable;