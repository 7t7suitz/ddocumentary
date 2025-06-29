import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Document } from '../types';

interface FileUploadProps {
  onFileUpload: (document: Document) => void;
  isAnalyzing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isAnalyzing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'text/plain' || file.name.endsWith('.txt')
    );
    
    setSelectedFiles(files);
    processFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    processFiles(files);
  }, []);

  const processFiles = useCallback((files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const document: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content,
          uploadedAt: new Date()
        };
        onFileUpload(document);
      };
      reader.readAsText(file);
    });
  }, [onFileUpload]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="space-y-6">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' 
            : 'border-slate-300 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500'
          }
          ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".txt,text/plain"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isAnalyzing}
        />
        
        <div className="space-y-4">
          {isAnalyzing ? (
            <Loader2 className="w-12 h-12 mx-auto text-amber-500 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 mx-auto text-slate-400" />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {isAnalyzing ? 'Analyzing Documents...' : 'Upload Documents for Analysis'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isAnalyzing 
                ? 'AI is processing your documents to extract insights'
                : 'Drag and drop text files here, or click to select files'
              }
            </p>
          </div>
          
          {!isAnalyzing && (
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Supports: .txt files • Multiple files allowed
            </div>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {file.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                  disabled={isAnalyzing}
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};