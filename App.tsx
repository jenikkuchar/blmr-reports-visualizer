import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { FileText, BarChart2, Moon, Sun, FilterX } from 'lucide-react';

function App() {
  const [data, setData] = useState<CsvRow[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">CSV Analyzer <span className="text-gray-400 dark:text-gray-500 font-normal">| AI Statistiky</span></h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <HeaderDropdown label="BloomReach" links={bloomReachLinks} />
            <HeaderDropdown label="Looker Studio" links={lookerLinks} />
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!data && (
          <div className="max-w-xl mx-auto mt-10">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        )}

        {data && stats && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                <FileText className="w-4 h-4" />
                <span>Soubor: <span className="font-medium text-gray-900 dark:text-white">{fileName}</span></span>
              </div>
              <button 
                onClick={() => setData(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
              >
                Nahrát jiný soubor
              </button>
            </div>

            <StatsCards 
              question={stats.question} 
              period={stats.period} 
              totalAnswers={stats.totalAnswers} 
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              availableMonths={availableMonths}
            />

            {stats.totalAnswers === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                   <FilterX className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Žádné záznamy k zobrazení</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Zkuste změnit období nebo filtry. Pro vybrané nastavení jsme v nahraném souboru nenašli žádná data.
                </p>
                <button 
                  onClick={() => setDateFilter({ type: 'all', startDate: '', endDate: '' })}
                  className="mt-6 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div ref={fullDataTableRef}>
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

      <DetailModal 
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        row={selectedRow}
      />
    </div>
  );
}

export default App;