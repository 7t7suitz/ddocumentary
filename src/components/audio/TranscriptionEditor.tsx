import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Mic, Play, Pause, 
  Download, Edit3, Trash2, Plus, 
  Save, Check, X, User, Clock,
  FileText, Settings, Loader2
} from 'lucide-react';
import { AudioFile, TranscriptionSegment, Speaker } from '../../types/audio';
import { transcribeAudio, generateSubtitles } from '../../utils/audioProcessor';
import { format } from 'date-fns';

interface TranscriptionEditorProps {
  file: AudioFile;
  onFileUpdate: (file: AudioFile) => void;
}

export const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({
  file,
  onFileUpdate
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [segments, setSegments] = useState<TranscriptionSegment[]>(file.transcription?.segments || []);
  const [speakers, setSpeakers] = useState<Speaker[]>(file.transcription?.speakers || []);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('segments');
  const [exportFormat, setExportFormat] = useState<'srt' | 'vtt' | 'txt'>('srt');
  const [exportOptions, setExportOptions] = useState({
    includeSpeakerNames: true,
    maxLineLength: 42,
    maxLinesPerCaption: 2
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', updateTime);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, []);

  const startTranscription = async () => {
    setIsTranscribing(true);
    setTranscriptionProgress(0);
    
    // Simulate progress updates
    progressInterval.current = window.setInterval(() => {
      setTranscriptionProgress(prev => {
        const newProgress = prev + (1 + Math.random() * 2);
        return Math.min(newProgress, 95);
      });
    }, 300);
    
    try {
      // Get the audio file from the URL
      const response = await fetch(file.url);
      const blob = await response.blob();
      const audioFile = new File([blob], file.name, { type: file.format });
      
      // Transcribe the audio
      const result = await transcribeAudio(audioFile, {
        language: 'en',
        speakerDiarization: true,
        punctuation: true
      });
      
      setSegments(result.segments);
      setSpeakers(result.speakers);
      
      // Update the file with the transcription
      const updatedFile: AudioFile = {
        ...file,
        transcription: {
          id: `transcription-${Date.now()}`,
          segments: result.segments,
          speakers: result.speakers,
          language: 'en',
          accuracy: 0.85,
          wordCount: result.segments.reduce((count, segment) => count + segment.text.split(' ').length, 0),
          duration: file.duration,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      onFileUpdate(updatedFile);
      setTranscriptionProgress(100);
    } catch (error) {
      console.error('Transcription failed:', error);
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setIsTranscribing(false);
    }
  };

  const updateSegment = (segmentId: string, text: string) => {
    const updatedSegments = segments.map(segment => 
      segment.id === segmentId ? { ...segment, text, edited: true } : segment
    );
    
    setSegments(updatedSegments);
    
    // Update the file with the new transcription
    if (file.transcription) {
      const updatedFile: AudioFile = {
        ...file,
        transcription: {
          ...file.transcription,
          segments: updatedSegments,
          updatedAt: new Date()
        }
      };
      
      onFileUpdate(updatedFile);
    }
  };

  const updateSpeaker = (speakerId: string, updates: Partial<Speaker>) => {
    const updatedSpeakers = speakers.map(speaker => 
      speaker.id === speakerId ? { ...speaker, ...updates } : speaker
    );
    
    setSpeakers(updatedSpeakers);
    
    // Update the file with the new speakers
    if (file.transcription) {
      const updatedFile: AudioFile = {
        ...file,
        transcription: {
          ...file.transcription,
          speakers: updatedSpeakers,
          updatedAt: new Date()
        }
      };
      
      onFileUpdate(updatedFile);
    }
  };

  const deleteSegment = (segmentId: string) => {
    const updatedSegments = segments.filter(segment => segment.id !== segmentId);
    
    setSegments(updatedSegments);
    
    // Update the file with the new transcription
    if (file.transcription) {
      const updatedFile: AudioFile = {
        ...file,
        transcription: {
          ...file.transcription,
          segments: updatedSegments,
          updatedAt: new Date()
        }
      };
      
      onFileUpdate(updatedFile);
    }
  };

  const addSegment = (afterSegmentId: string) => {
    const segmentIndex = segments.findIndex(s => s.id === afterSegmentId);
    if (segmentIndex === -1) return;
    
    const currentSegment = segments[segmentIndex];
    const nextSegment = segments[segmentIndex + 1];
    
    const midTime = nextSegment 
      ? (currentSegment.endTime + nextSegment.startTime) / 2 
      : currentSegment.endTime + 2;
    
    const newSegment: TranscriptionSegment = {
      id: `segment-${Date.now()}`,
      startTime: currentSegment.endTime,
      endTime: midTime,
      text: '',
      speakerId: currentSegment.speakerId,
      confidence: 1,
      words: [],
      edited: true
    };
    
    const updatedSegments = [
      ...segments.slice(0, segmentIndex + 1),
      newSegment,
      ...segments.slice(segmentIndex + 1)
    ];
    
    setSegments(updatedSegments);
    setEditingSegment(newSegment.id);
    setEditedText('');
    
    // Update the file with the new transcription
    if (file.transcription) {
      const updatedFile: AudioFile = {
        ...file,
        transcription: {
          ...file.transcription,
          segments: updatedSegments,
          updatedAt: new Date()
        }
      };
      
      onFileUpdate(updatedFile);
    }
  };

  const exportTranscription = async () => {
    if (!file.transcription) return;
    
    try {
      let content = '';
      
      if (exportFormat === 'srt' || exportFormat === 'vtt') {
        content = await generateSubtitles(segments, {
          format: exportFormat,
          includeSpeakerNames: exportOptions.includeSpeakerNames,
          maxLineLength: exportOptions.maxLineLength,
          maxLinesPerCaption: exportOptions.maxLinesPerCaption
        });
      } else {
        // Plain text format
        content = segments.map(segment => {
          const speaker = speakers.find(s => s.id === segment.speakerId);
          const speakerName = speaker ? speaker.name : 'Speaker';
          const timeStr = `[${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}]`;
          
          return exportOptions.includeSpeakerNames
            ? `${timeStr} ${speakerName}: ${segment.text}`
            : `${timeStr} ${segment.text}`;
        }).join('\n\n');
      }
      
      // Create and download the file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, '')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const playSegment = (segment: TranscriptionSegment) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = segment.startTime;
    audio.play();
    setIsPlaying(true);
    
    // Stop at the end of the segment
    const stopTime = segment.endTime;
    const checkTime = () => {
      if (audio.currentTime >= stopTime) {
        audio.pause();
        setIsPlaying(false);
        audio.removeEventListener('timeupdate', checkTime);
      }
    };
    
    audio.addEventListener('timeupdate', checkTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (speakerId?: string): string => {
    if (!speakerId) return '#6B7280'; // Default gray
    
    const speaker = speakers.find(s => s.id === speakerId);
    return speaker?.color || '#6B7280';
  };

  const renderSegmentsTab = () => (
    <div className="space-y-4">
      {segments.length > 0 ? (
        <div className="space-y-4">
          {segments.map((segment, index) => (
            <div 
              key={segment.id} 
              className={`
                border rounded-lg overflow-hidden transition-all duration-200
                ${currentTime >= segment.startTime && currentTime <= segment.endTime
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }
              `}
            >
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getSpeakerColor(segment.speakerId) }}
                  />
                  
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {speakers.find(s => s.id === segment.speakerId)?.name || 'Unknown Speaker'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => playSegment(segment)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    <Play className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingSegment(segment.id);
                      setEditedText(segment.text);
                    }}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    <Edit3 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  </button>
                  
                  <button
                    onClick={() => deleteSegment(segment.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-3">
                {editingSegment === segment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      rows={3}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingSegment(null)}
                        className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => {
                          updateSegment(segment.id, editedText);
                          setEditingSegment(null);
                        }}
                        className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700 dark:text-slate-300">
                    {segment.text}
                  </p>
                )}
              </div>
              
              <div className="px-3 pb-3 flex justify-end">
                <button
                  onClick={() => addSegment(segment.id)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Segment After</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No transcription segments available
        </div>
      )}
    </div>
  );

  const renderSpeakersTab = () => (
    <div className="space-y-4">
      {speakers.length > 0 ? (
        <div className="space-y-4">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: speaker.color }}
                    >
                      {speaker.name.charAt(0)}
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        value={speaker.name}
                        onChange={(e) => updateSpeaker(speaker.id, { name: e.target.value })}
                        className="font-medium text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                      />
                      
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {speaker.segments.length} segments • {Math.round(speaker.totalDuration)} seconds
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={speaker.color}
                      onChange={(e) => updateSpeaker(speaker.id, { color: e.target.value })}
                      className="w-8 h-8 rounded-lg border-0 p-0 cursor-pointer"
                    />
                    
                    <select
                      value={speaker.role || ''}
                      onChange={(e) => updateSpeaker(speaker.id, { role: e.target.value })}
                      className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    >
                      <option value="">Select Role</option>
                      <option value="interviewer">Interviewer</option>
                      <option value="subject">Subject</option>
                      <option value="narrator">Narrator</option>
                      <option value="expert">Expert</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <div className="font-medium mb-1">Sample Dialogue:</div>
                  <div className="italic">
                    {segments.find(s => s.speakerId === speaker.id)?.text || 'No dialogue available'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No speakers identified
        </div>
      )}
    </div>
  );

  const renderExportTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Export Options
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Format
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={exportFormat === 'srt'}
                  onChange={() => setExportFormat('srt')}
                  className="text-indigo-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">SRT (Subtitles)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={exportFormat === 'vtt'}
                  onChange={() => setExportFormat('vtt')}
                  className="text-indigo-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">VTT (Web Subtitles)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={exportFormat === 'txt'}
                  onChange={() => setExportFormat('txt')}
                  className="text-indigo-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Plain Text</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeSpeakerNames}
                onChange={(e) => setExportOptions({...exportOptions, includeSpeakerNames: e.target.checked})}
                className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Include Speaker Names</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Max Line Length
              </label>
              <input
                type="number"
                value={exportOptions.maxLineLength}
                onChange={(e) => setExportOptions({...exportOptions, maxLineLength: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                min="10"
                max="100"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Recommended: 42 characters for standard subtitles
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Max Lines Per Caption
              </label>
              <input
                type="number"
                value={exportOptions.maxLinesPerCaption}
                onChange={(e) => setExportOptions({...exportOptions, maxLinesPerCaption: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                min="1"
                max="4"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Recommended: 2 lines for standard subtitles
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={exportTranscription}
              disabled={segments.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export Transcription</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Transcription Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Total Duration
            </div>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatTime(file.duration)}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Word Count
            </div>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {segments.reduce((count, segment) => count + segment.text.split(' ').length, 0)}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Segments
            </div>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {segments.length}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Speakers
            </div>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {speakers.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src={file.url} className="hidden" />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Transcription Editor
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Edit and export transcriptions with speaker identification
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {segments.length > 0 && (
            <button
              onClick={() => setActiveTab('export')}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
          
          {!file.transcription && (
            <button
              onClick={startTranscription}
              disabled={isTranscribing}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isTranscribing ? 'Transcribing...' : 'Start Transcription'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcription Progress */}
      {isTranscribing && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Transcribing Audio
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Processing: {file.name}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {Math.round(transcriptionProgress)}%
              </span>
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${transcriptionProgress}%` }}
              />
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400">
              This may take a few minutes depending on the length of your audio file
            </div>
          </div>
        </div>
      )}

      {/* No Transcription State */}
      {!isTranscribing && segments.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <MessageSquare className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Transcription Available
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Start the transcription process to convert audio to text
          </p>
          <button
            onClick={startTranscription}
            disabled={isTranscribing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 mx-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start Transcription</span>
          </button>
        </div>
      )}

      {/* Transcription Content */}
      {segments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('segments')}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
                  ${activeTab === 'segments'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Segments</span>
              </button>
              
              <button
                onClick={() => setActiveTab('speakers')}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
                  ${activeTab === 'speakers'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                <User className="w-4 h-4" />
                <span>Speakers</span>
              </button>
              
              <button
                onClick={() => setActiveTab('export')}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
                  ${activeTab === 'export'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                <FileText className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'segments' && renderSegmentsTab()}
            {activeTab === 'speakers' && renderSpeakersTab()}
            {activeTab === 'export' && renderExportTab()}
          </div>
        </div>
      )}

      {/* Transcription Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Transcription Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Edit segments by clicking the pencil icon</li>
          <li>• Rename speakers to make transcripts more meaningful</li>
          <li>• Play segments to verify accuracy</li>
          <li>• Add new segments for missed content</li>
          <li>• Export in SRT format for video editing software</li>
          <li>• Export in VTT format for web videos</li>
        </ul>
      </div>
    </div>
  );
};