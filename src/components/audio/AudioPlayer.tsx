import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, Volume1, VolumeX, Maximize2, 
  Bookmark, Clock, Download
} from 'lucide-react';
import { AudioFile, AudioMarker } from '../../types/audio';
import { format } from 'date-fns';

interface AudioPlayerProps {
  file: AudioFile;
  isPlaying: boolean;
  onPlayPause: (isPlaying: boolean) => void;
  onAddMarker?: (time: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  file,
  isPlaying,
  onPlayPause,
  onAddMarker
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(file.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeMarker, setActiveMarker] = useState<AudioMarker | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => onPlayPause(false);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onPlayPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Playback failed:', error);
        onPlayPause(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, onPlayPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    // Find the active marker based on current time
    const marker = file.markers.find(m => 
      Math.abs(m.time - currentTime) < 0.5
    );
    
    setActiveMarker(marker || null);
  }, [currentTime, file.markers]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    if (!progressBar || !audioRef.current) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAddMarker = () => {
    if (onAddMarker) {
      onAddMarker(currentTime);
    }
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, currentTime - 5);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, currentTime + 5);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMarkerColor = (marker: AudioMarker): string => {
    return marker.color || '#3B82F6';
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${isFullscreen ? 'fixed inset-0 z-50 p-6' : ''}`}>
      <audio ref={audioRef} src={file.url} />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">
              {file.name}
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onAddMarker && (
              <button
                onClick={handleAddMarker}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Add Marker"
              >
                <Bookmark className="w-4 h-4 text-indigo-500" />
              </button>
            )}
            
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="w-4 h-4 text-slate-500" />
            </button>
            
            <a
              href={file.url}
              download={file.name}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title="Download"
            >
              <Download className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        </div>
        
        {/* Waveform & Progress */}
        <div className="mb-4">
          <div 
            ref={progressRef}
            className="relative h-16 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
          >
            {/* Waveform */}
            {file.waveformData && (
              <div className="absolute inset-0 flex items-center">
                {file.waveformData.map((value, index) => (
                  <div 
                    key={index}
                    className={`w-1 mx-px ${
                      (index / file.waveformData!.length) * duration <= currentTime
                        ? 'bg-indigo-500 dark:bg-indigo-400'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    style={{ height: `${value * 100}%` }}
                  />
                ))}
              </div>
            )}
            
            {/* Progress Overlay */}
            <div 
              className="absolute top-0 bottom-0 left-0 bg-indigo-500/20 dark:bg-indigo-400/20 pointer-events-none"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            
            {/* Markers */}
            {file.markers.map(marker => (
              <div 
                key={marker.id}
                className="absolute top-0 bottom-0 w-0.5 cursor-pointer z-10 hover:w-1"
                style={{ 
                  left: `${(marker.time / duration) * 100}%`,
                  backgroundColor: getMarkerColor(marker)
                }}
                title={marker.label}
                onClick={(e) => {
                  e.stopPropagation();
                  if (audioRef.current) {
                    audioRef.current.currentTime = marker.time;
                  }
                }}
              />
            ))}
            
            {/* Current Time Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 dark:bg-indigo-400 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Active Marker */}
        {activeMarker && (
          <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getMarkerColor(activeMarker) }}
              />
              <div className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                {activeMarker.label}
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400">
                {formatTime(activeMarker.time)}
              </div>
            </div>
            {activeMarker.notes && (
              <div className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                {activeMarker.notes}
              </div>
            )}
          </div>
        )}
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={skipBackward}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title="Skip Backward 5s"
            >
              <SkipBack className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            
            <button
              onClick={() => onPlayPause(!isPlaying)}
              className="p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={skipForward}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title="Skip Forward 5s"
            >
              <SkipForward className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Volume2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 accent-indigo-500"
            />
          </div>
        </div>
        
        {/* File Info */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <div className="font-medium mb-1">Format</div>
              <div>{file.format}</div>
            </div>
            
            <div>
              <div className="font-medium mb-1">Sample Rate</div>
              <div>{file.sampleRate} Hz</div>
            </div>
            
            <div>
              <div className="font-medium mb-1">Channels</div>
              <div>{file.channels}</div>
            </div>
            
            <div>
              <div className="font-medium mb-1">Created</div>
              <div>{format(file.createdAt, 'MMM d, yyyy')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};