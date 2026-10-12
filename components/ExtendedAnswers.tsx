import React, { useState } from 'react';
import { ExtendedAnswerStat } from '../types';
import { Filter, ThumbsUp, ThumbsDown, ChevronUp, ChevronDown } from 'lucide-react';
import { formatInt, formatPercent } from '../utils/format';

interface ExtendedAnswersProps {
  title: string;
  data: ExtendedAnswerStat[];
  onAnswerClick: (answer: string) => void;
}

const ExtendedAnswers: React.FC<ExtendedAnswersProps> = ({ title, data, onAnswerClick }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="bg-surface-1 hairline rounded-card p-5">
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 hairline-b">
        <h3 className="text-base font-semibold tracking-[-0.01em]">
          {title}
        </h3>
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-8 h-8 shrink-0 grid place-items-center text-fg-subtle hover:text-fg hover:bg-white/[.06] rounded-row transition-colors"
          title={isMinimized ? "Maximalizovat" : "Minimalizovat"}
        >
          {isMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {!isMinimized && (
        <div>
          {data.length === 0 ? (
            <p className="text-fg-subtle text-sm">Žádné rozšířené odpovědi</p>
          ) : (
            <div className="flex flex-col gap-1">
              {data.map((item, idx) => {
                const isGeneric = item.answer === 'Bez upřesnění';
                const isYes = item.type === 'Ano';

                const itemStyles = isGeneric
                  ? 'border border-dashed border-line-hover text-fg-muted cursor-default'
                  : 'bg-surface-2 hairline-soft text-fg hover:bg-surface-3 cursor-pointer group';

                return (
                  <div 
                    key={idx} 
                    onClick={() => !isGeneric && onAnswerClick(item.answer)}
                    className={`px-3 py-2 rounded-row text-sm transition-colors flex items-center justify-between ${itemStyles}`}
                    title={!isGeneric ? "Klikněte pro zobrazení detailů v tabulce" : ""}
                  >
                    <div className="flex items-center min-w-0 gap-3 mr-4 overflow-hidden">
                      <div className={`shrink-0 ${isYes ? 'text-success' : 'text-danger'}`}>
                         {isYes ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                      </div>
                      <span className="font-medium truncate">
                        {item.answer}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {!isGeneric && (
                           <div className="hidden sm:flex items-center text-accent opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                              <Filter className="w-3 h-3 mr-1" />
                              <span>Filtrovat</span>
                           </div>
                        )}
                        
                        <span className="text-xs text-fg-muted tnum w-14 text-right">
                          {formatPercent(item.percent)}
                        </span>
                        
                        <span className={`text-xs font-semibold tnum min-w-[3rem] text-right ${isYes ? 'text-success' : 'text-danger'}`}>
                          {formatInt(item.count)}x
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
