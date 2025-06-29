import React, { useState, useRef } from 'react';
import { 
  Upload, Play, Pause, SkipBack, SkipForward, Volume2, 
  Edit3, Save, Download, Users, Clock, Mic, FileText 
} from 'lucide-react';
import { TranscriptionSegment } from '../types/script';
import { processTranscription } from '../utils/scriptGenerator';

interface TranscriptionEditorProps {
  onTranscriptionComplete: (segments: TranscriptionSegment[]) => void;
}

export const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({
  onTranscriptionComplete
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<string[]>(['Speaker 1', 'Speaker 2']);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setIsProcessing(true);
      
      try {
        const transcriptionSegments = await processTranscription(file);
        setSegments(transcriptionSegments);
      } catch (error) {
        console.error('Transcription failed:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const updateSegment = (segmentId: string, updates: Partial<TranscriptionSegment>) => {
    setSegments(prev => prev.map(segment =>
      segment.id === segmentId ? { ...segment, ...updates, edited: true } : segment
    ));
  };

  const addSpeaker = () => {
    const newSpeaker = `Speaker ${speakers.length + 1}`;
    setSpeakers(prev => [...prev, newSpeaker]);
  };

  const playPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportTranscription = () => {
    const transcriptText = segments.map(segment => 
      `[${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}] ${segment.speaker || 'Unknown'}: ${segment.text}`
    ).join('\n\n');

    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCurrentSegment = (): TranscriptionSegment | null => {
    return segments.find(segment => 
      currentTime >= segment.startTime && currentTime <= segment.endTime
    ) || null;
  };

  const currentSegment = getCurrentSegment();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Interview Transcription Editor
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Upload audio files to generate accurate transcriptions with speaker identification, 
          timing information, and collaborative editing capabilities.
        </p>
      </div>

      {/* Upload Section */}
      {!audioFile && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="text-center">
            <Mic className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Upload Audio File
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Upload your interview audio for AI-powered transcription
            </p>
            
            <label className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer mx-auto w-fit">
              <Upload className="w-4 h-4" />
              <span>Choose Audio File</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <div className="mt-4 text-sm text-slate-500 dark:text-slate-500">
              Supports MP3, WAV, M4A, and other common audio formats
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Processing Audio...
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            AI is transcribing your audio and identifying speakers. This may take a few minutes.
          </p>
        </div>
      )}

      {/* Audio Player & Controls */}
      {audioFile && segments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Audio Player
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportTranscription}
                className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => onTranscriptionComplete(segments)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Save className="w-4 h-4" />
                <span>Use Transcription</span>
              </button>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={URL.createObjectURL(audioFile)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => seekTo(Math.max(0, currentTime - 10))}
              className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <button
              onClick={playPause}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => seekTo(currentTime + 10)}
              className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="flex-1 mx-4">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                {formatTime(currentTime)} / {formatTime(audioRef.current?.duration || 0)}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ 
                    width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` 
                  }}
                />
              </div>
            </div>

            <Volume2 className="w-4 h-4 text-slate-400" />
          </div>

          {/* Current Segment Highlight */}
          {currentSegment && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Currently Playing:
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {currentSegment.speaker || 'Unknown Speaker'}
                </span>
              </div>
              <p className="text-blue-800 dark:text-blue-200">
                "{currentSegment.text}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Speaker Management */}
      {segments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Speaker Management
            </h3>
            <button
              onClick={addSpeaker}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Users className="w-4 h-4" />
              <span>Add Speaker</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {speakers.map((speaker, index) => (
              <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => {
                    const newSpeakers = [...speakers];
                    newSpeakers[index] = e.target.value;
                    setSpeakers(newSpeakers);
                  }}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcription Segments */}
      {segments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Transcription ({segments.length} segments)
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Duration: {formatTime(Math.max(...segments.map(s => s.endTime)))}
            </div>
          </div>

          {segments.map((segment) => (
            <div
              key={segment.id}
              className={`
                bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6
                ${currentSegment?.id === segment.id ? 'ring-2 ring-blue-400' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => seekTo(segment.startTime)}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  >
                    <Clock className="w-3 h-3" />
                    <span className="text-sm">
                      {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                    </span>
                  </button>

                  <select
                    value={segment.speaker || ''}
                    onChange={(e) => updateSegment(segment.id, { speaker: e.target.value })}
                    className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="">Select Speaker</option>
                    {speakers.map((speaker) => (
                      <option key={speaker} value={speaker}>
                        {speaker}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-500">
                    <span>Confidence: {Math.round(segment.confidence * 100)}%</span>
                    {segment.edited && (
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                        Edited
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setEditingSegment(editingSegment === segment.id ? null : segment.id)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <Edit3 className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {editingSegment === segment.id ? (
                <textarea
                  value={segment.text}
                  onChange={(e) => updateSegment(segment.id, { text: e.target.value })}
                  onBlur={() => setEditingSegment(null)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  rows={3}
                  autoFocus
                />
              ) : (
                <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                  {segment.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">
          Transcription Tips
        </h3>
        <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
          <li>• Click on time stamps to jump to specific parts of the audio</li>
          <li>• Edit transcription text by clicking the edit button on each segment</li>
          <li>• Assign speakers to segments for better organization</li>
          <li>• Use the confidence scores to identify segments that may need review</li>
          <li>• Export the final transcription for use in your script or documentation</li>
        </ul>
      </div>
    </div>
  );
};