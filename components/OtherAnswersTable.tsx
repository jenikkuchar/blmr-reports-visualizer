import React, { useState } from 'react';
import { CsvRow } from '../types';
import { Clock, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { getDateStatus } from '../utils/helpers';
import { formatInt } from '../utils/format';

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
        return 'text-accent bg-accent-soft';
      case 'Včera':
        return 'text-info bg-info-soft';
      case 'Nedávno':
        return 'text-warning bg-warning-soft';
      default:
        return 'text-fg-muted bg-fill';
    }
  };

  const markerColor = type === 'Ano' ? 'bg-success' : type === 'Ne' ? 'bg-danger' : 'bg-fg-subtle';

  return (
    <div className="bg-surface-1 hairline rounded-card p-5">
      <div className="flex items-center justify-between gap-3 pb-3 mb-3 hairline-b">
        <h3 className="text-base font-semibold tracking-[-0.01em] flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${markerColor}`}></span>
          {title}
        </h3>
        <div className="flex items-center gap-3">
          {isMinimized && data.length > 0 && (
            <span className="text-xs font-medium h-[22px] inline-flex items-center px-2 bg-fill text-fg-muted rounded-md tnum">
              {formatInt(data.length)} záznamů
            </span>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-8 h-8 grid place-items-center text-fg-subtle hover:text-fg hover:bg-fill rounded-row transition-colors"
            title={isMinimized ? "Maximalizovat" : "Minimalizovat"}
          >
            {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {data.length === 0 ? (
            <p className="text-fg-subtle text-sm">Žádná data k zobrazení</p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-2 py-2.5 text-[11px] font-semibold text-fg-subtle hairline-b whitespace-nowrap">Timestamp</th>
                    <th className="px-2 py-2.5 text-[11px] font-semibold text-fg-subtle hairline-b">Odpověď</th>
                    <th className="px-2 py-2.5 text-[11px] font-semibold text-fg-subtle hairline-b text-right">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => {
                    const dateStatus = getDateStatus(row["#2 timestamp"]);
                    const isHighlighted = dateStatus !== null;

                    return (
                      <tr 
                        key={idx} 
                        onClick={() => onRowSelect(row)}
                        className={`transition-colors group cursor-pointer hover:bg-fill ${isHighlighted ? 'bg-[color-mix(in_srgb,var(--jk-warning)_6%,transparent)]' : ''}`}
                      >
                        <td className="px-2 py-2.5 hairline-b text-fg whitespace-nowrap min-w-[180px] align-top">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-2 text-fg-subtle" />
                              <span className="tnum">{row["#2 timestamp"]}</span>
                            </div>
                            {isHighlighted && dateStatus && (
                              <div className="mt-1.5 flex items-center">
                                 <span className={`badge-dot inline-flex items-center gap-1.5 h-[22px] px-2 rounded-md text-xs font-medium whitespace-nowrap ${getBadgeStyle(dateStatus)}`}>
                                   {dateStatus}
                                 </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2.5 hairline-b text-fg-muted break-words align-top">
                          {row["#6 extended_answer"].replace('Jiné: ', '')}
                        </td>
                        <td className="px-2 py-2.5 hairline-b text-right align-top">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onRowSelect(row); }}
                            className="w-7 h-7 inline-grid place-items-center text-fg-subtle hover:text-accent hover:bg-accent-soft rounded-row transition-colors"
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
