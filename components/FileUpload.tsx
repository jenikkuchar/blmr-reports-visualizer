import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, Loader2 } from 'lucide-react';
import { CsvRow } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: CsvRow[], fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      // Use setTimeout to allow UI to update to processing state before heavy parsing begins
      setTimeout(() => {
        parseFile(file);
      }, 100);
    }
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        // Simple validation to ensure it looks like our expected CSV
        const rawData = results.data as CsvRow[];
        const filteredData = rawData.filter(row => 
           row && Object.keys(row).some(key => row[key] && row[key].toString().trim() !== '')
        );

        if (filteredData.length > 0) {
          onDataLoaded(filteredData, file.name);
        } else {
          alert("Soubor neobsahuje žádná platná data.");
        }
        setIsProcessing(false);
      },
      error: (error: Error) => {
        console.error(error);
        alert("Chyba při načítání souboru.");
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center transition-all hover:shadow-md">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full transition-colors ${isProcessing ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
          {isProcessing ? (
             <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          ) : (
             <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isProcessing ? 'Zpracovávám data...' : 'Načtěte CSV soubor'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isProcessing ? 'Prosím čekejte, analyzuji soubor.' : 'Podporovány jsou soubory .csv a .txt'}
          </p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef}
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="hidden" 
          disabled={isProcessing}
        />
        
        {!isProcessing && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white font-medium text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-colors"
          >
            Vybrat soubor
          </button>
        )}
      </div>
    </div>
  );
};

export default FileUpload;