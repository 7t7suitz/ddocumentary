import React, { useCallback, useState } from 'react';
import { Upload, Image, Video, FileText, X, Loader2, Brain, Zap } from 'lucide-react';
import { MediaFile } from '../types/media';
import { analyzeMediaFile } from '../utils/mediaAnalyzer';

interface MediaUploadProps {
  onMediaUpload: (media: MediaFile[]) => void;
  isProcessing: boolean;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({ onMediaUpload, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);

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
      file => file.type.startsWith('image/') || 
              file.type.startsWith('video/') || 
              file.type.startsWith('audio/')
    );
    
    setSelectedFiles(files);
    processFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    processFiles(files);
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    const processedMedia: MediaFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProcessingProgress((i / files.length) * 100);
      
      try {
        const mediaData = await analyzeMediaFile(file);
        processedMedia.push(mediaData as MediaFile);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }
    
    setProcessingProgress(100);
    onMediaUpload(processedMedia);
    
    setTimeout(() => {
      setSelectedFiles([]);
      setProcessingProgress(0);
    }, 1000);
  }, [onMediaUpload]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4 text-purple-500" />;
    return <FileText className="w-4 h-4 text-green-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-slate-300 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <Brain className="w-8 h-8 text-blue-500" />
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          ) : (
            <Upload className="w-12 h-12 mx-auto text-slate-400" />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {isProcessing ? 'Processing Media Files...' : 'Upload Media for AI Analysis'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isProcessing 
                ? 'AI is analyzing your media files and generating intelligent tags'
                : 'Drag and drop images, videos, or audio files here, or click to select'
              }
            </p>
          </div>
          
          {!isProcessing && (
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Supports: Images (JPG, PNG, GIF) • Videos (MP4, MOV, AVI) • Audio (MP3, WAV) • AI analysis included
            </div>
          )}
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Analyzing media files...
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {Math.round(processingProgress)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Extracting metadata • Detecting faces • Generating tags • Analyzing composition • Creating thumbnails
          </div>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && !isProcessing && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {file.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)} • {file.type}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">AI Analysis</h4>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Automatic object detection, scene recognition, and intelligent tagging
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-medium text-purple-900 dark:text-purple-100">Face Detection</h4>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Advanced facial recognition with emotion analysis and person identification
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="font-medium text-green-900 dark:text-green-100">Smart Organization</h4>
          </div>
          <p className="text-sm text-green-800 dark:text-green-200">
            Automatic categorization by date, location, people, and themes
          </p>
        </div>
      </div>
    </div>
  );
};