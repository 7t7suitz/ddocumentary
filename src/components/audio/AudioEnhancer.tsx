import React, { useState, useRef, useEffect } from 'react';
import { Sliders, AudioWaveform as Waveform, Play, Pause, Download, RotateCcw, Check, X, AlertTriangle, Zap, Volume2, Settings, Loader2 } from 'lucide-react';
import { AudioFile, AudioIssue, AudioEnhancement } from '../../types/audio';
import { 
  applyNoiseReduction, 
  applyEQ, 
  applyCompression, 
  normalizeAudio,
  enhanceAudio
} from '../../utils/audioProcessor';

interface AudioEnhancerProps {
  file: AudioFile;
  onFileUpdate: (file: AudioFile) => void;
}

export const AudioEnhancer: React.FC<AudioEnhancerProps> = ({
  file,
  onFileUpdate
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeIssue, setActiveIssue] = useState<AudioIssue | null>(null);
  const [enhancementSettings, setEnhancementSettings] = useState({
    noiseReduction: 50,
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
    compression: 30,
    normalization: -14
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBeforeAfterMode, setIsBeforeAfterMode] = useState(false);
  const [playingVersion, setPlayingVersion] = useState<'before' | 'after'>('after');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const beforeAudioRef = useRef<HTMLAudioElement>(null);
  const afterAudioRef = useRef<HTMLAudioElement>(null);
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

  useEffect(() => {
    // Handle before/after mode playback
    if (isBeforeAfterMode) {
      const beforeAudio = beforeAudioRef.current;
      const afterAudio = afterAudioRef.current;
      
      if (beforeAudio && afterAudio) {
        if (isPlaying) {
          if (playingVersion === 'before') {
            beforeAudio.play();
            afterAudio.pause();
          } else {
            beforeAudio.pause();
            afterAudio.play();
          }
        } else {
          beforeAudio.pause();
          afterAudio.pause();
        }
      }
    } else {
      // Regular playback
      const audio = audioRef.current;
      if (audio) {
        if (isPlaying) {
          audio.play().catch(error => {
            console.error('Playback failed:', error);
            setIsPlaying(false);
          });
        } else {
          audio.pause();
        }
      }
    }
  }, [isPlaying, isBeforeAfterMode, playingVersion]);

  const applyEnhancements = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate progress updates
    progressInterval.current = window.setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + (1 + Math.random() * 2);
        return Math.min(newProgress, 95);
      });
    }, 300);
    
    try {
      // Get the audio file from the URL
      const response = await fetch(file.url);
      const blob = await response.blob();
      const audioFile = new File([blob], file.name, { type: file.format });
      
      // Apply enhancements
      const enhancements = [];
      
      // Noise reduction
      if (enhancementSettings.noiseReduction > 0) {
        const noiseReduction = await applyNoiseReduction(
          audioFile, 
          enhancementSettings.noiseReduction
        );
        enhancements.push(noiseReduction);
      }
      
      // EQ
      if (enhancementSettings.eqLow !== 0 || enhancementSettings.eqMid !== 0 || enhancementSettings.eqHigh !== 0) {
        const eqBands = [
          { frequency: 100, gain: enhancementSettings.eqLow, q: 0.7 },
          { frequency: 1000, gain: enhancementSettings.eqMid, q: 0.7 },
          { frequency: 5000, gain: enhancementSettings.eqHigh, q: 0.7 }
        ];
        
        const eq = await applyEQ(audioFile, eqBands);
        enhancements.push(eq);
      }
      
      // Compression
      if (enhancementSettings.compression > 0) {
        const compressionAmount = enhancementSettings.compression / 100;
        const compression = await applyCompression(audioFile, {
          threshold: -24 - (compressionAmount * 12),
          ratio: 1 + (compressionAmount * 5),
          attack: 20,
          release: 150,
          makeupGain: compressionAmount * 6
        });
        enhancements.push(compression);
      }
      
      // Normalization
      const normalization = await normalizeAudio(
        audioFile, 
        enhancementSettings.normalization
      );
      enhancements.push(normalization);
      
      // Apply all enhancements to the audio file
      const enhancedAudio = await enhanceAudio(audioFile, enhancements.map(e => ({
        type: e.type,
        parameters: e.parameters
      })));
      
      // Create a URL for the enhanced audio
      const enhancedUrl = URL.createObjectURL(enhancedAudio);
      
      // Update the file with the enhancements
      const updatedFile: AudioFile = {
        ...file,
        url: enhancedUrl,
        enhancements: [...file.enhancements, ...enhancements],
        updatedAt: new Date()
      };
      
      onFileUpdate(updatedFile);
      setProcessingProgress(100);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setIsProcessing(false);
    }
  };

  const resetEnhancements = () => {
    setEnhancementSettings({
      noiseReduction: 50,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      compression: 30,
      normalization: -14
    });
  };

  const fixIssue = async (issue: AudioIssue) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate progress updates
    progressInterval.current = window.setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + (1 + Math.random() * 2);
        return Math.min(newProgress, 95);
      });
    }, 300);
    
    try {
      // Get the audio file from the URL
      const response = await fetch(file.url);
      const blob = await response.blob();
      const audioFile = new File([blob], file.name, { type: file.format });
      
      // Apply appropriate enhancement based on issue type
      let enhancement: AudioEnhancement | null = null;
      
      switch (issue.type) {
        case 'noise':
          enhancement = await applyNoiseReduction(audioFile, 70);
          break;
        case 'clipping':
          enhancement = await applyCompression(audioFile, {
            threshold: -3,
            ratio: 20,
            attack: 0,
            release: 50,
            makeupGain: 0
          });
          break;
        case 'sibilance':
          enhancement = await applyEQ(audioFile, [
            { frequency: 5000, gain: -6, q: 1.5 },
            { frequency: 8000, gain: -4, q: 1.5 }
          ]);
          break;
        case 'plosive':
          enhancement = await applyEQ(audioFile, [
            { frequency: 80, gain: -8, q: 1.5 }
          ]);
          break;
        case 'hum':
          enhancement = await applyEQ(audioFile, [
            { frequency: 50, gain: -24, q: 5 },
            { frequency: 100, gain: -12, q: 5 }
          ]);
          break;
        default:
          // Apply general enhancement
          enhancement = await normalizeAudio(audioFile, -14);
      }
      
      if (enhancement) {
        // Apply the enhancement to the audio file
        const enhancedAudio = await enhanceAudio(audioFile, [{
          type: enhancement.type,
          parameters: enhancement.parameters
        }]);
        
        // Create a URL for the enhanced audio
        const enhancedUrl = URL.createObjectURL(enhancedAudio);
        
        // Update the file with the enhancement
        const updatedFile: AudioFile = {
          ...file,
          url: enhancedUrl,
          enhancements: [...file.enhancements, enhancement],
          analysis: {
            ...file.analysis,
            issues: file.analysis.issues.filter(i => i.id !== issue.id)
          },
          updatedAt: new Date()
        };
        
        onFileUpdate(updatedFile);
      }
      
      setProcessingProgress(100);
    } catch (error) {
      console.error('Issue fix failed:', error);
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setIsProcessing(false);
      setActiveIssue(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIssueColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-blue-500';
      default: return 'text-slate-500';
    }
  };

  const getIssueBgColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'bg-amber-50 dark:bg-amber-900/20';
      case 'low': return 'bg-blue-50 dark:bg-blue-900/20';
      default: return 'bg-slate-50 dark:bg-slate-700';
    }
  };

  const getIssueBorderColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'border-red-200 dark:border-red-800';
      case 'medium': return 'border-amber-200 dark:border-amber-800';
      case 'low': return 'border-blue-200 dark:border-blue-800';
      default: return 'border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src={file.url} className="hidden" />
      
      {isBeforeAfterMode && (
        <>
          <audio ref={beforeAudioRef} src={file.url} className="hidden" />
          <audio ref={afterAudioRef} src={file.url} className="hidden" />
        </>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Audio Enhancement
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Clean and enhance audio quality with AI-powered tools
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsBeforeAfterMode(!isBeforeAfterMode)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg
              ${isBeforeAfterMode
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }
            `}
          >
            <Waveform className="w-4 h-4" />
            <span>Before/After</span>
          </button>
          
          <button
            onClick={applyEnhancements}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{isProcessing ? 'Processing...' : 'Apply Enhancements'}</span>
          </button>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Enhancing Audio
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Processing: {file.name}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {Math.round(processingProgress)}%
              </span>
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Applying audio enhancements and processing filters
            </div>
          </div>
        </div>
      )}

      {/* Before/After Comparison */}
      {isBeforeAfterMode && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Waveform className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Before/After Comparison
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${playingVersion === 'before'
                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-700'
              }
            `}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  Original Audio
                </h4>
                <button
                  onClick={() => {
                    setPlayingVersion('before');
                    setIsPlaying(true);
                  }}
                  className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600"
                >
                  {playingVersion === 'before' && isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className="h-24 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                {file.waveformData && (
                  <div className="absolute inset-0 flex items-center">
                    {file.waveformData.map((value, index) => (
                      <div 
                        key={index}
                        className="w-1 mx-px bg-slate-400 dark:bg-slate-500"
                        style={{ height: `${value * 100}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                <div>Issues: {file.analysis.issues.length}</div>
                <div>Quality: {Math.round(file.analysis.quality.overall * 100)}%</div>
              </div>
            </div>
            
            <div className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${playingVersion === 'after'
                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-700'
              }
            `}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  Enhanced Audio
                </h4>
                <button
                  onClick={() => {
                    setPlayingVersion('after');
                    setIsPlaying(true);
                  }}
                  className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600"
                >
                  {playingVersion === 'after' && isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className="h-24 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
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
              
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                <div>Enhancements: {file.enhancements.length}</div>
                <div>Quality: {Math.round((file.analysis.quality.overall + 0.2) * 100)}%</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                setIsPlaying(false);
                setIsBeforeAfterMode(false);
              }}
              className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg"
            >
              Exit Comparison Mode
            </button>
          </div>
        </div>
      )}

      {/* Audio Issues */}
      {file.analysis.issues.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Detected Audio Issues
            </h3>
          </div>
          
          <div className="space-y-4">
            {file.analysis.issues.map((issue) => (
              <div 
                key={issue.id} 
                className={`
                  p-4 rounded-lg border transition-all duration-200
                  ${activeIssue?.id === issue.id
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20'
                    : `${getIssueBgColor(issue.severity)} ${getIssueBorderColor(issue.severity)}`
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${getIssueColor(issue.severity)}`} />
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                        {issue.type.replace('-', ' ')}
                      </h4>
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${issue.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          issue.severity === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }
                      `}>
                        {issue.severity} severity
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {issue.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(issue.startTime)} - {formatTime(issue.endTime)}</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = issue.startTime;
                            audioRef.current.play();
                            setIsPlaying(true);
                          }
                        }}
                        className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <Play className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {activeIssue?.id === issue.id ? (
                      <>
                        <button
                          onClick={() => setActiveIssue(null)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          <X className="w-4 h-4 text-slate-500" />
                        </button>
                        
                        <button
                          onClick={() => fixIssue(issue)}
                          disabled={isProcessing}
                          className="flex items-center space-x-1 px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Fix Issue</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setActiveIssue(issue)}
                        className="flex items-center space-x-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Fix</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {activeIssue?.id === issue.id && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Recommended Fix:
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {issue.fixRecommendation}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      Click "Fix Issue" to automatically apply the recommended solution
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhancement Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Enhancement Controls
            </h3>
          </div>
          
          <button
            onClick={resetEnhancements}
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Noise Reduction */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Noise Reduction
              </label>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {enhancementSettings.noiseReduction}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={enhancementSettings.noiseReduction}
              onChange={(e) => setEnhancementSettings({
                ...enhancementSettings,
                noiseReduction: parseInt(e.target.value)
              })}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Off</span>
              <span>Gentle</span>
              <span>Aggressive</span>
            </div>
          </div>
          
          {/* EQ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Equalizer
              </label>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Low ({enhancementSettings.eqLow > 0 ? '+' : ''}{enhancementSettings.eqLow} dB)
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={enhancementSettings.eqLow}
                  onChange={(e) => setEnhancementSettings({
                    ...enhancementSettings,
                    eqLow: parseInt(e.target.value)
                  })}
                  className="w-full accent-indigo-500"
                />
              </div>
              
              <div>
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Mid ({enhancementSettings.eqMid > 0 ? '+' : ''}{enhancementSettings.eqMid} dB)
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={enhancementSettings.eqMid}
                  onChange={(e) => setEnhancementSettings({
                    ...enhancementSettings,
                    eqMid: parseInt(e.target.value)
                  })}
                  className="w-full accent-indigo-500"
                />
              </div>
              
              <div>
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                  High ({enhancementSettings.eqHigh > 0 ? '+' : ''}{enhancementSettings.eqHigh} dB)
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={enhancementSettings.eqHigh}
                  onChange={(e) => setEnhancementSettings({
                    ...enhancementSettings,
                    eqHigh: parseInt(e.target.value)
                  })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>
          
          {/* Compression */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Compression
              </label>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {enhancementSettings.compression}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={enhancementSettings.compression}
              onChange={(e) => setEnhancementSettings({
                ...enhancementSettings,
                compression: parseInt(e.target.value)
              })}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Off</span>
              <span>Moderate</span>
              <span>Heavy</span>
            </div>
          </div>
          
          {/* Normalization */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Loudness Normalization
              </label>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {enhancementSettings.normalization} LUFS
              </span>
            </div>
            <input
              type="range"
              min="-24"
              max="-9"
              step="1"
              value={enhancementSettings.normalization}
              onChange={(e) => setEnhancementSettings({
                ...enhancementSettings,
                normalization: parseInt(e.target.value)
              })}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Quieter (-24)</span>
              <span>Standard (-14)</span>
              <span>Louder (-9)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Applied Enhancements */}
      {file.enhancements.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Check className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Applied Enhancements
            </h3>
          </div>
          
          <div className="space-y-3">
            {file.enhancements.map((enhancement, index) => (
              <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <h4 className="font-medium text-green-900 dark:text-green-100 capitalize">
                      {enhancement.type.replace('-', ' ')}
                    </h4>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {new Date(enhancement.appliedAt).toLocaleString()}
                  </div>
                </div>
                
                <p className="text-sm text-green-800 dark:text-green-200">
                  {enhancement.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhancement Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Audio Enhancement Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Use noise reduction to remove background noise and hiss</li>
          <li>• Adjust EQ to enhance voice clarity (boost mids, cut lows)</li>
          <li>• Apply compression to even out volume levels</li>
          <li>• Normalize to standard loudness (-14 LUFS for online content)</li>
          <li>• Use the "Fix Issue" feature for specific audio problems</li>
          <li>• Compare before/after to ensure quality improvements</li>
        </ul>
      </div>
    </div>
  );
};