import React, { useState, useMemo, useRef } from 'react';
import { CsvRow, DateFilterState } from './types';
import FileUpload from './components/FileUpload';
import StatsCards from './components/StatsCards';
import ChartsSection from './components/ChartsSection';
import TrendChart from './components/TrendChart';
import ExtendedAnswers from './components/ExtendedAnswers';
import OtherAnswersTable from './components/OtherAnswersTable';
import FullDataTable from './components/FullDataTable';
import HeaderDropdown from './components/HeaderDropdown';
import DetailModal from './components/DetailModal';
import { calculateDateRange, processExtendedAnswers, processBrowserStats, filterDataByDate, getAvailableMonths } from './utils/helpers';
import { FilterX } from 'lucide-react';
import { formatInt } from './utils/format';

function App() {
  const [data, setData] = useState<CsvRow[] | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Date Filtering State
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    type: 'all',
    startDate: '',
    endDate: ''
  });

  // State for Modal
  const [selectedRow, setSelectedRow] = useState<CsvRow | null>(null);

  // State for External Filter (triggered by clicking Extended Answers)
  const [externalFilter, setExternalFilter] = useState<{ key: string, value: string } | null>(null);

  // Ref for scrolling
  const fullDataTableRef = useRef<HTMLDivElement>(null);

  const handleDataLoaded = (loadedData: CsvRow[], name: string) => {
    setData(loadedData);
    setFileName(name);
    // Reset date filter when new file is loaded
    setDateFilter({ type: 'all', startDate: '', endDate: '' });
  };

  const handleAnswerClick = (answer: string) => {
    setExternalFilter({ key: '#6 extended_answer', value: answer });
    if (fullDataTableRef.current) {
      fullDataTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRowSelect = (row: CsvRow) => {
    setSelectedRow(row);
  };

  // Extract available months from raw data
  const availableMonths = useMemo(() => {
    if (!data) return [];
    return getAvailableMonths(data);
  }, [data]);

  // Filtered Data based on Date Filter
  const filteredByDateData = useMemo(() => {
    if (!data) return [];
    return filterDataByDate(data, dateFilter);
  }, [data, dateFilter]);

  // Computed Statistics based on Filtered Data
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // We use original data for the period text if "all" is selected, 
    // but filtered data for actual stats
    const question = data[0]["#3 question"] || "N/A";
    const dateStats = calculateDateRange(filteredByDateData.length > 0 ? filteredByDateData : data);
    const totalAnswers = filteredByDateData.length;
    
    if (totalAnswers === 0) {
      return {
        question,
        period: dateFilter.type === 'all' ? dateStats.periodString : 'Žádná data pro vybrané období',
        totalAnswers: 0,
        yesCount: 0,
        noCount: 0,
        yesPercent: '0',
        noPercent: '0',
        combinedExtendedStats: [],
        yesOtherRows: [],
        noOtherRows: [],
        browserStats: []
      };
    }

    const yesCount = filteredByDateData.filter(row => row["#4 answer"] === 'Ano').length;
    const noCount = filteredByDateData.filter(row => row["#4 answer"] === 'Ne').length;
    
    const yesPercent = totalAnswers > 0 ? ((yesCount / totalAnswers) * 100).toFixed(1) : '0';
    const noPercent = totalAnswers > 0 ? ((noCount / totalAnswers) * 100).toFixed(1) : '0';

    const yesExtended = processExtendedAnswers(filteredByDateData, 'Ano');
    const noExtended = processExtendedAnswers(filteredByDateData, 'Ne');
    
    const combinedExtendedStats = [...yesExtended.stats, ...noExtended.stats]
      .sort((a, b) => b.count - a.count);

    const browserStats = processBrowserStats(filteredByDateData);

    return {
      question,
      period: dateStats.periodString,
      totalAnswers,
      yesCount,
      noCount,
      yesPercent,
      noPercent,
      combinedExtendedStats,
      yesOtherRows: yesExtended.others,
      noOtherRows: noExtended.others,
      browserStats
    };
  }, [data, filteredByDateData, dateFilter]);

  const bloomReachLinks = [
    { label: 'Autorizace', href: 'https://bloomreach.hptronic.cz/' },
    { label: 'Report', href: 'https://cdxpapp.hptronic.cz/p/datart-cz/analytics/reports/689ed86a227a8f65f51a212b' }
  ];

  const lookerLinks = [
    { label: 'Obecné', href: 'https://lookerstudio.google.com/u/1/reporting/4425672e-1046-4856-bea4-16fcfd3a7619/page/p_677kilx5td' },
    { label: 'Konverzace', href: 'https://lookerstudio.google.com/u/1/reporting/4425672e-1046-4856-bea4-16fcfd3a7619/page/p_677kilx5td' }
  ];

  return (
    <div className="min-h-screen flex flex-col text-fg">
      <header className="glass hairline-b sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <a
              href="https://www.jan-kuchar.cz"
              aria-label="jan-kuchar.cz"
              className="w-[26px] h-[26px] rounded-[7px] grid place-items-center shrink-0 text-white text-[11px] font-extrabold tracking-[-0.02em]"
              style={{ background: 'linear-gradient(135deg,#0a84ff,#bf5af2 50%,#ff375f)', boxShadow: '0 0 0 .5px rgba(255,255,255,.18) inset' }}
            >
              JK
            </a>
            <span className="text-fg-subtle font-light text-lg" aria-hidden="true">/</span>
            <img src="/favicon.svg" alt="" className="w-[26px] h-[26px] shrink-0" />
            <span className="text-[15px] font-light tracking-[-0.01em] whitespace-nowrap hidden min-[420px]:inline">
              Reports <span className="font-semibold">Visualizer</span>
            </span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <HeaderDropdown label="BloomReach" links={bloomReachLinks} />
            <HeaderDropdown label="Looker Studio" links={lookerLinks} />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-7 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-[32px] sm:leading-tight font-semibold tracking-[-0.02em]">Analýza odpovědí</h1>
            {data ? (
              <p className="text-[13px] text-fg-muted mt-0.5 truncate">
                Soubor: <span className="text-fg font-medium">{fileName}</span>
              </p>
            ) : (
              <p className="text-[13px] text-fg-muted mt-0.5">Vizualizace CSV reportů z BloomReach a Looker Studia.</p>
            )}
          </div>
          {data && (
            <button
              onClick={() => setData(null)}
              className="inline-flex items-center h-7 px-2.5 rounded-row text-[13px] font-medium text-fg bg-white/[.07] hover:bg-white/[.12] hairline transition-colors"
            >
              Nahrát jiný soubor
            </button>
          )}
        </div>

        {!data && (
          <FileUpload onDataLoaded={handleDataLoaded} />
        )}

        {data && stats && (
          <div className="space-y-4">
            <StatsCards 
              question={stats.question} 
              period={stats.period} 
              totalAnswers={stats.totalAnswers} 
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              availableMonths={availableMonths}
            />

            {stats.totalAnswers === 0 ? (
              <div className="rounded-panel border border-dashed border-line-hover bg-white/[.02] px-5 py-10 flex flex-col items-center justify-center text-center gap-2.5">
                <div className="w-[52px] h-[52px] rounded-full bg-accent-soft text-accent grid place-items-center">
                   <FilterX className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.01em]">Žádné záznamy k zobrazení</h3>
                <p className="text-fg-muted max-w-[46ch]">
                  Zkuste změnit období nebo filtry. Pro vybrané nastavení jsme v nahraném souboru nenašli žádná data.
                </p>
                <button 
                  onClick={() => setDateFilter({ type: 'all', startDate: '', endDate: '' })}
                  className="mt-1.5 inline-flex items-center h-9 px-3.5 rounded-button bg-accent-strong hover:bg-accent-strong-hover text-white text-sm font-medium transition-colors"
                >
                  Zobrazit všechna data
                </button>
              </div>
            ) : (
              <>
                <ChartsSection 
                  yesCount={stats.yesCount}
                  noCount={stats.noCount}
                  yesPercent={stats.yesPercent}
                  noPercent={stats.noPercent}
                  browserStats={stats.browserStats}
                />

                <TrendChart data={data} />

                <div className="w-full">
                  <ExtendedAnswers 
                    title="Analýza rozšířených odpovědí (Společný přehled)" 
                    data={stats.combinedExtendedStats} 
                    onAnswerClick={handleAnswerClick}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {(stats.noOtherRows.length > 0) && (
                      <OtherAnswersTable 
                        title='Odpovědi "Jiné" - Ne' 
                        data={stats.noOtherRows} 
                        type="Ne"
                        onRowSelect={handleRowSelect}
                      />
                   )}
                   {(stats.yesOtherRows.length > 0) && (
                      <OtherAnswersTable 
                        title='Odpovědi "Jiné" - Ano' 
                        data={stats.yesOtherRows} 
                        type="Ano"
                        onRowSelect={handleRowSelect}
                      />
                   )}
                </div>

                <div ref={fullDataTableRef} className="scroll-mt-20">
                  <FullDataTable 
                    data={filteredByDateData} 
                    onRowSelect={handleRowSelect}
                    externalFilter={externalFilter}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="hairline-t">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap justify-between gap-3 text-xs text-fg-subtle">
          <span>
            Stav: <span className="text-success">připraveno</span>
            {' · '}
            {data ? <span className="tnum">{formatInt(data.length)} záznamů</span> : 'žádná data'}
          </span>
          <span>AI Statistiky · © 2026 Jan Kuchař</span>
        </div>
      </footer>

      <DetailModal 
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        row={selectedRow}
      />
    </div>
  );
}

export default App;