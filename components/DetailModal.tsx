import React from 'react';
import { X, Calendar, Globe, Monitor, MessageSquare, Link as LinkIcon, HelpCircle } from 'lucide-react';
import { CsvRow } from '../types';
import { cleanHeader, formatCellValue } from '../utils/helpers';
import { formatNumericCell, isNumericValue } from '../utils/format';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: CsvRow | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, row }) => {
  if (!isOpen || !row) return null;

  // Extract known fields for structured layout
  const question = row["#3 question"];
  const timestamp = row["#2 timestamp"];
  const answer = row["#4 answer"];
  const extendedAnswer = row["#6 extended_answer"];
  const browser = row["#7 browser"];
  const device = row["#8 device"];
  
  // Find location key dynamically
  const locationKey = Object.keys(row).find(k => k.toLowerCase().includes('location'));
  const location = locationKey ? row[locationKey] : null;

  // Filter out keys we have already displayed in specific sections to avoid duplication
  const usedKeys = ["#3 question", "#2 timestamp", "#4 answer", "#6 extended_answer", "#7 browser", "#8 device"];
  if (locationKey) usedKeys.push(locationKey);

  const remainingEntries = Object.entries(row).filter(([key]) => !usedKeys.includes(key));

  const labelClass = 'flex items-center gap-1.5 text-[11px] font-semibold text-fg-subtle mb-1.5';
  const blockClass = 'bg-surface-2 hairline-soft rounded-card';

  return (
    <div 
      className="fixed inset-0 bg-black/30 dark:bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-surface-1 shadow-pop rounded-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 hairline-b">
          <h3 className="text-xl font-semibold tracking-[-0.01em]">
            Detail záznamu
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-row text-fg-subtle hover:text-fg hover:bg-fill transition-colors"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          
          {/* Section 1: Question & Core Answer */}
          <div className={`${blockClass} p-4`}>
            <div className="mb-4">
              <div className={labelClass}>
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Otázka</span>
              </div>
              <p className="text-base font-medium leading-relaxed">
                {question || 'N/A'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 hairline-t">
              {/* Answer Status */}
              <div>
                <div className={labelClass}>
                   <MessageSquare className="w-3.5 h-3.5" />
                   <span>Odpověď</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md text-[13px] font-medium ${
                    answer === 'Ano' 
                      ? 'badge-dot text-success bg-success-soft' 
                      : answer === 'Ne' 
                        ? 'badge-dot text-danger bg-danger-soft'
                        : 'text-fg-muted bg-fill'
                  }`}>
                  {answer || 'N/A'}
                </div>
              </div>
              {/* Timestamp */}
              <div>
                <div className={labelClass}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Datum a čas</span>
                </div>
                <p className="font-medium tnum">
                  {timestamp || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <div className={`${blockClass} p-4`}>
                <div className={labelClass}>
                  <Globe className="w-3.5 h-3.5 text-accent" />
                  <span>Prohlížeč</span>
                </div>
                <p className="text-sm">{browser || 'N/A'}</p>
             </div>
             <div className={`${blockClass} p-4`}>
                <div className={labelClass}>
                  <Monitor className="w-3.5 h-3.5 text-accent" />
                  <span>Zařízení</span>
                </div>
                <p className="text-sm">{device || 'N/A'}</p>
             </div>
          </div>

          {/* Section 3: Extended Answer (if present) */}
          {extendedAnswer && (
            <div className={`${blockClass} p-4 relative overflow-hidden`}>
               <div className="absolute top-0 left-0 w-0.5 h-full bg-accent"></div>
               <div className={labelClass}>
                 <span>Doplňující odpověď</span>
               </div>
               <p className="leading-relaxed">
                 "{extendedAnswer}"
               </p>
            </div>
          )}

           {/* Section 4: Location/URL */}
           {location && (
            <div className={`${blockClass} p-4`}>
              <div className={labelClass}>
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Stránka (URL)</span>
              </div>
              <a 
                href={location.startsWith('http') ? location : `https://www.datart.cz${location}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-sm text-accent hover:text-accent-hover break-all block"
              >
                {formatCellValue('location', location)}
              </a>
            </div>
          )}

          {/* Section 5: Other Fields (Dynamic) */}
          {remainingEntries.length > 0 && (
            <div className={`${blockClass} p-4`}>
               <h4 className="text-sm font-semibold pb-2 mb-3 hairline-b">
                 Ostatní data
               </h4>
               <div className="grid grid-cols-1 gap-3">
                 {remainingEntries.map(([key, value]) => (
                   <div key={key} className="flex flex-col sm:flex-row sm:justify-between text-sm">
                     <span className="text-fg-muted mb-1 sm:mb-0">
                       {cleanHeader(key)}:
                     </span>
                     <span className={`text-right font-medium break-all sm:pl-4 ${isNumericValue(String(value ?? "")) ? 'tnum' : ''}`}>
                       {value ? formatNumericCell(String(value)) : '-'}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 hairline-t flex justify-end">
          <button 
            onClick={onClose}
            className="inline-flex items-center h-9 px-3.5 rounded-button bg-fill hover:bg-fill-hover hairline text-fg text-sm font-medium transition-colors"
          >
            Zavřít detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
