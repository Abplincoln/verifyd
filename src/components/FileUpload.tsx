import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  onClear,
  disabled = false,
  title = 'Upload document',
  subtitle = 'Drag & drop your file here, or browse from your device',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  };

  const handleClickArea = () => {
    if (!selectedFile && !disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickArea}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-indigo-400 bg-indigo-950/20 shadow-lg shadow-indigo-950/40'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                isDragOver
                  ? 'bg-indigo-600/30 text-indigo-300'
                  : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-300'
              }`}
            >
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-medium text-slate-200">{title}</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300">
                Select from computer
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              PDF, Word, Images, TXT, or any format. File never leaves your browser.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-slate-800 bg-slate-900/70 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center text-indigo-300 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-200 truncate">
                    {selectedFile.name}
                  </h4>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="truncate max-w-[200px]">
                    {selectedFile.type || 'Binary / Document'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClear}
                disabled={disabled}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-400 hover:text-white transition-colors"
                title="Remove and select another file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
