import React from 'react';
import { X, Calendar, Globe, Monitor, MessageSquare, Link as LinkIcon, HelpCircle } from 'lucide-react';
import { CsvRow } from '../types';
import { cleanHeader, formatCellValue } from '../utils/helpers';

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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Detail záznamu
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-gray-50/50 dark:bg-gray-900/50">
          
          {/* Section 1: Question & Core Answer */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Otázka</span>
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                {question || 'N/A'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {/* Answer Status */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                   <MessageSquare className="w-3.5 h-3.5" />
                   <span>Odpověď</span>
                </div>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold ${
                    answer === 'Ano' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : answer === 'Ne' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                  {answer || 'N/A'}
                </div>
              </div>
              {/* Timestamp */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Datum a čas</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium tabular-nums">
                  {timestamp || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Prohlížeč</span>
                </div>
                <p className="text-gray-900 dark:text-white text-sm">{browser || 'N/A'}</p>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Zařízení</span>
                </div>
                <p className="text-gray-900 dark:text-white text-sm">{device || 'N/A'}</p>
             </div>
          </div>

          {/* Section 3: Extended Answer (if present) */}
          {extendedAnswer && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
               <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                 <span>Doplňující odpověď</span>
               </div>
               <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic">
                 "{extendedAnswer}"
               </p>
            </div>
          )}

           {/* Section 4: Location/URL */}
           {location && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Stránka (URL)</span>
              </div>
              <a 
                href={location.startsWith('http') ? location : `https://www.datart.cz${location}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all block"
              >
                {formatCellValue('location', location)}
              </a>
            </div>
          )}

          {/* Section 5: Other Fields (Dynamic) */}
          {remainingEntries.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
               <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                 Ostatní data
               </h4>
               <div className="grid grid-cols-1 gap-4">
                 {remainingEntries.map(([key, value]) => (
                   <div key={key} className="flex flex-col sm:flex-row sm:justify-between text-sm">
                     <span className="font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">
                       {cleanHeader(key)}:
                     </span>
                     <span className="text-gray-900 dark:text-gray-200 text-right font-medium break-all sm:pl-4">
                       {value || '-'}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
          >
            Zavřít detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;