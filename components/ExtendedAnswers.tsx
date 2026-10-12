import React, { useState } from 'react';
import { ExtendedAnswerStat } from '../types';
import { Filter, ThumbsUp, ThumbsDown, ChevronUp, ChevronDown } from 'lucide-react';

interface ExtendedAnswersProps {
  title: string;
  data: ExtendedAnswerStat[];
  onAnswerClick: (answer: string) => void;
}

const ExtendedAnswers: React.FC<ExtendedAnswersProps> = ({ title, data, onAnswerClick }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-4 border-b dark:border-gray-700 pb-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          {title}
        </h3>
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={isMinimized ? "Maximalizovat" : "Minimalizovat"}
        >
          {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {!isMinimized && (
        <div className="pr-2">
          {data.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 italic text-sm">Žádné rozšířené odpovědi</p>
          ) : (
            <div className="flex flex-col space-y-2">
              {data.map((item, idx) => {
                const isGeneric = item.answer === 'Bez upřesnění';
                const isYes = item.type === 'Ano';
                
                let itemStyles = '';
                let cursorStyles = '';
                let badgeStyles = '';

                if (isGeneric) {
                   if (isYes) {
                      itemStyles = 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800 border-dashed text-gray-600 dark:text-gray-400';
                      badgeStyles = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
                   } else {
                      itemStyles = 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800 border-dashed text-gray-600 dark:text-gray-400';
                      badgeStyles = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                   }
                   cursorStyles = 'cursor-default';
                } else {
                   if (isYes) {
                      itemStyles = 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600 text-gray-800 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/40 hover:shadow-md';
                      badgeStyles = 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400';
                   } else {
                      itemStyles = 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600 text-gray-800 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-900/40 hover:shadow-md';
                      badgeStyles = 'bg-white dark:bg-gray-800 text-red-700 dark:text-red-400';
                   }
                   cursorStyles = 'cursor-pointer group';
                }

                return (
                  <div 
                    key={idx} 
                    onClick={() => !isGeneric && onAnswerClick(item.answer)}
                    className={`p-2 rounded-lg border-l-4 text-sm transition-all duration-200 flex items-center justify-between ${itemStyles} ${cursorStyles}`}
                    title={!isGeneric ? "Klikněte pro zobrazení detailů v tabulce" : ""}
                  >
                    <div className="flex items-center min-w-0 gap-3 mr-4 overflow-hidden">
                      <div className={`shrink-0 ${isYes ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                         {isYes ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                      </div>
                      <span className={`font-medium truncate ${isGeneric ? 'italic' : ''}`}>
                        {item.answer}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {!isGeneric && (
                           <div className="hidden sm:flex items-center text-current opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                              <Filter className="w-3 h-3 mr-1" />
                              <span>Filtrovat</span>
                           </div>
                        )}
                        
                        <span className="text-xs opacity-75 tabular-nums w-10 text-right">
                          {item.percent}%
                        </span>
                        
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow-sm min-w-[2.5rem] text-center ${badgeStyles}`}>
                          {item.count}x
                        </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtendedAnswers;