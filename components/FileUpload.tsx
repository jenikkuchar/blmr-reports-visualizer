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

  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!/\.(csv|txt)$/i.test(file.name)) {
      alert("Podporovány jsou soubory .csv a .txt");
      return;
    }
    setIsProcessing(true);
    // Use setTimeout to allow UI to update to processing state before heavy parsing begins
    setTimeout(() => {
      parseFile(file);
    }, 100);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    // Allow selecting the same file again
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isProcessing) return;
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // Ignore leaving into a child element of the dropzone
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (isProcessing) return;
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
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
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-panel border border-dashed px-3.5 py-7 sm:px-5 sm:py-10 flex flex-col items-center text-center gap-2.5 transition-colors ${
        isProcessing || isDragOver
          ? 'border-accent bg-accent-soft'
          : 'border-line-hover bg-transparent hover:border-accent hover:bg-accent-soft'
      }`}
    >
      <div className="w-[52px] h-[52px] rounded-full bg-accent-soft text-accent grid place-items-center">
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.8} />
        ) : (
          <Upload className="w-6 h-6" strokeWidth={1.8} />
        )}
      </div>
      <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.01em]">
        {isProcessing ? 'Zpracovávám data...' : 'Načtěte CSV soubor'}
      </h3>
      <p className="text-fg-muted max-w-[46ch]">
        {isProcessing ? 'Prosím čekejte, analyzuji soubor.' : 'Přetáhněte sem CSV soubor, nebo ho vyberte z počítače.'}
      </p>

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
          className="mt-1.5 inline-flex items-center h-9 px-3.5 rounded-button bg-accent-strong hover:bg-accent-strong-hover text-white text-sm font-medium transition-colors"
        >
          Vybrat soubor
        </button>
      )}
      <span className="text-xs text-fg-subtle mt-0.5">Podporované formáty: .csv, .txt · data zůstávají jen v prohlížeči</span>
    </div>
  );
};

export default FileUpload;
