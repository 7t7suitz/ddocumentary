import React, { useState, useCallback } from 'react';
import { 
  Upload, FileAudio, X, Loader2, 
  Play, Pause, Trash2, BarChart2, 
  Waveform, AlertTriangle, CheckCircle
} from 'lucide-react';
import { AudioFile, ProcessingJob } from '../../types/audio';
import { format } from 'date-fns';

interface AudioUploaderProps {
  files: AudioFile[];
  onFileUpload: (files: File[]) => void;
  onFileSelect: (file: AudioFile) => void;
  onFileDelete: (fileId: string) => void;
  processingJobs: ProcessingJob[];
  selectedFile: AudioFile | null;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  files,
  onFileUpload,
  onFileSelect,
  onFileDelete,
  processingJobs,
  selectedFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});

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
      file => file.type.startsWith('audio/')
    );
    
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      file => file.type.startsWith('audio/')
    );
    
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const togglePlayPause = (fileId: string) => {
    setIsPlaying(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: AudioFile['type']) => {
    switch (type) {
      case 'interview':
        return <FileAudio className="w-5 h-5 text-blue-500" />;
      case 'narration':
        return <FileAudio className="w-5 h-5 text-purple-500" />;
      case 'ambient':
        return <FileAudio className="w-5 h-5 text-green-500" />;
      case 'music':
        return <FileAudio className="w-5 h-5 text-amber-500" />;
      case 'sound-effect':
        return <FileAudio className="w-5 h-5 text-red-500" />;
      default:
        return <FileAudio className="w-5 h-5 text-slate-500" />;
    }
  };

  const getQualityColor = (quality: number): string => {
    if (quality >= 0.8) return 'text-green-500';
    if (quality >= 0.6) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' 
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <Upload className="w-12 h-12 mx-auto text-slate-400" />
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Upload Audio Files
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Drag and drop audio files here, or click to select
            </p>
          </div>
          
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Supports: MP3, WAV, OGG, FLAC, M4A • AI analysis included
          </div>
        </div>
      </div>

      {/* Processing Jobs */}
      {processingJobs.filter(job => job.status === 'processing').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Processing Files
          </h3>
          
          {processingJobs
            .filter(job => job.status === 'processing')
            .map(job => (
              <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {job.parameters.filename}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {job.type === 'analysis' ? 'Analyzing audio' : 
                         job.type === 'transcription' ? 'Transcribing audio' : 
                         job.type === 'enhancement' ? 'Enhancing audio' : 
                         'Processing audio'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {job.progress}%
                  </div>
                </div>
                
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Audio Files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Audio Files ({files.length})
            </h3>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm">
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="duration-asc">Duration (Short-Long)</option>
                <option value="duration-desc">Duration (Long-Short)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {files.map(file => (
              <div 
                key={file.id} 
                className={`
                  bg-white dark:bg-slate-800 rounded-xl border-2 transition-all duration-200
                  ${selectedFile?.id === file.id
                    ? 'border-indigo-400 shadow-lg'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                `}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getFileTypeIcon(file.type)}
                      </div>
                      
                      <div>
                        <h4 
                          className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                          onClick={() => onFileSelect(file)}
                        >
                          {file.name}
                        </h4>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <div className="capitalize">{file.type.replace('-', ' ')}</div>
                          <div>{formatDuration(file.duration)}</div>
                          <div>{formatFileSize(file.size)}</div>
                          <div>{format(file.createdAt, 'MMM d, yyyy')}</div>
                        </div>
                        
                        {file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {file.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePlayPause(file.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        {isPlaying[file.id] ? (
                          <Pause className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        ) : (
                          <Play className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => onFileSelect(file)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <BarChart2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      </button>
                      
                      <button
                        onClick={() => onFileDelete(file.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Waveform Preview */}
                  <div className="mt-3 h-16 bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                    {file.waveformData && (
                      <div className="absolute inset-0 flex items-center">
                        {file.waveformData.map((value, index) => (
                          <div 
                            key={index}
                            className="w-1 mx-px bg-indigo-500 dark:bg-indigo-400"
                            style={{ height: `${value * 100}%` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Audio Analysis Summary */}
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Quality</div>
                      <div className={`text-sm font-medium ${getQualityColor(file.analysis.quality.overall)}`}>
                        {Math.round(file.analysis.quality.overall * 100)}%
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Issues</div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {file.analysis.issues.length} detected
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Loudness</div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {file.analysis.loudness.integrated.toFixed(1)} LUFS
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Transcription</div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {file.transcription ? 'Available' : 'Not available'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Issues Summary */}
                  {file.analysis.issues.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Audio Issues Detected
                        </div>
                      </div>
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        {file.analysis.issues.map(issue => issue.type).join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {/* Enhancements Summary */}
                  {file.enhancements.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">
                          Enhancements Applied
                        </div>
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        {file.enhancements.map(enhancement => enhancement.type.replace('-', ' ')).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && processingJobs.length === 0 && (
        <div className="text-center py-12">
          <Waveform className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Audio Files Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Upload your first audio file to start processing and enhancing
          </p>
          <button
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 mx-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Audio</span>
          </button>
        </div>
      )}

      {/* Features Overview */}
      {files.length === 0 && processingJobs.length === 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Transcription & Subtitles
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Automatically transcribe interviews and generate subtitles with speaker identification.
            </p>
            <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-500">
              <li>• AI-powered speech recognition</li>
              <li>• Multiple export formats (SRT, VTT, TXT)</li>
              <li>• Speaker diarization</li>
              <li>• Interactive editor</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sliders className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Audio Enhancement
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Clean and enhance audio quality with AI-powered tools.
            </p>
            <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-500">
              <li>• Noise reduction</li>
              <li>• EQ optimization</li>
              <li>• Compression & normalization</li>
              <li>• Voice clarity enhancement</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Music className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Music & Sound Effects
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Get intelligent music and sound effect recommendations.
            </p>
            <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-500">
              <li>• Mood-based music suggestions</li>
              <li>• Scene-appropriate sound effects</li>
              <li>• Mixing recommendations</li>
              <li>• Timing & synchronization tools</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};