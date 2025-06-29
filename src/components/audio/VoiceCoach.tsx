import React, { useState } from 'react';
import { Mic, Play, Pause, Download, Zap, Loader2, Check, AlertTriangle, Volume2, Clock, AudioWaveform as Waveform, Settings } from 'lucide-react';
import { AudioFile, AudioProject, VoiceCoachingTip } from '../../types/audio';
import { generateVoiceCoachingTips } from '../../utils/audioProcessor';

interface VoiceCoachProps {
  file: AudioFile;
  onFileUpdate: (file: AudioFile) => void;
  project: AudioProject;
  onProjectUpdate: (project: AudioProject) => void;
}

export const VoiceCoach: React.FC<VoiceCoachProps> = ({
  file,
  onFileUpdate,
  project,
  onProjectUpdate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTip, setActiveTip] = useState<VoiceCoachingTip | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  
  const generateTips = async () => {
    if (!file.transcription) return;
    
    setIsGenerating(true);
    try {
      const tips = await generateVoiceCoachingTips(file.transcription.segments);
      
      onProjectUpdate({
        ...project,
        voiceCoachingTips: [...project.voiceCoachingTips, ...tips]
      });
    } catch (error) {
      console.error('Failed to generate voice coaching tips:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playExample = (audioUrl?: string) => {
    if (!audioUrl) return;
    
    setIsPlaying(!isPlaying);
    // In a real implementation, this would play the audio example
    // For now, we'll just toggle the play state
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      'pace': '#3B82F6', // blue
      'pitch': '#8B5CF6', // purple
      'articulation': '#10B981', // green
      'breathing': '#14B8A6', // teal
      'emotion': '#EC4899', // pink
      'emphasis': '#F59E0B', // amber
      'other': '#6B7280', // gray
    };
    
    return categoryColors[category] || '#6B7280'; // gray default
  };

  const getCategoryBgColor = (category: string): string => {
    switch (category) {
      case 'pace': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'pitch': return 'bg-purple-50 dark:bg-purple-900/20';
      case 'articulation': return 'bg-green-50 dark:bg-green-900/20';
      case 'breathing': return 'bg-teal-50 dark:bg-teal-900/20';
      case 'emotion': return 'bg-pink-50 dark:bg-pink-900/20';
      case 'emphasis': return 'bg-amber-50 dark:bg-amber-900/20';
      default: return 'bg-slate-50 dark:bg-slate-700';
    }
  };

  const getCategoryBorderColor = (category: string): string => {
    switch (category) {
      case 'pace': return 'border-blue-200 dark:border-blue-800';
      case 'pitch': return 'border-purple-200 dark:border-purple-800';
      case 'articulation': return 'border-green-200 dark:border-green-800';
      case 'breathing': return 'border-teal-200 dark:border-teal-800';
      case 'emotion': return 'border-pink-200 dark:border-pink-800';
      case 'emphasis': return 'border-amber-200 dark:border-amber-800';
      default: return 'border-slate-200 dark:border-slate-700';
    }
  };

  const filteredTips = project.voiceCoachingTips.filter(tip => {
    return filterCategory === 'all' || tip.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Voice Coach
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Professional voice coaching tips for better narration
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={generateTips}
            disabled={isGenerating || !file.transcription}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            <Mic className="w-4 h-4" />
            <span>{isGenerating ? 'Analyzing...' : 'Generate Voice Tips'}</span>
          </button>
        </div>
      </div>

      {/* Voice Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Waveform className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Voice Analysis
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Clarity */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              Voice Clarity
            </h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Signal-to-Noise</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {file.analysis.clarity.signalToNoiseRatio.toFixed(1)} dB
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, file.analysis.clarity.signalToNoiseRatio / 60 * 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Articulation</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(file.analysis.clarity.articulation * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${file.analysis.clarity.articulation * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Rhythm */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              Speech Rhythm
            </h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Tempo</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(file.analysis.rhythm.tempo)} WPM
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      file.analysis.rhythm.tempo < 100 ? 'bg-blue-500' :
                      file.analysis.rhythm.tempo > 160 ? 'bg-red-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, file.analysis.rhythm.tempo / 200 * 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Regularity</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(file.analysis.rhythm.rhythmicRegularity * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${file.analysis.rhythm.rhythmicRegularity * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Quality */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              Voice Quality
            </h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Overall Quality</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(file.analysis.quality.overall * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      file.analysis.quality.overall > 0.8 ? 'bg-green-500' :
                      file.analysis.quality.overall > 0.6 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${file.analysis.quality.overall * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Clarity</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(file.analysis.quality.clarity * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${file.analysis.quality.clarity * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Coaching Tips */}
      {isGenerating ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Analyzing Voice Performance
            </h3>
          </div>
          
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Evaluating speech patterns and generating personalized coaching tips
            </p>
            <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-indigo-500 animate-pulse rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ) : project.voiceCoachingTips.length > 0 ? (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm
                  ${filterCategory === 'all'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }
                `}
              >
                <span>All Categories</span>
              </button>
              
              {['pace', 'pitch', 'articulation', 'breathing', 'emotion', 'emphasis'].map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm
                    ${filterCategory === category
                      ? `${getCategoryBgColor(category)} text-slate-900 dark:text-slate-100`
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <span className="capitalize">{category}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tips List */}
          <div className="space-y-4">
            {filteredTips.map((tip) => (
              <div 
                key={tip.id} 
                className={`
                  p-6 rounded-xl border transition-all duration-200
                  ${activeTip?.id === tip.id
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20'
                    : `${getCategoryBgColor(tip.category)} ${getCategoryBorderColor(tip.category)}`
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getCategoryColor(tip.category) }}
                      />
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {tip.title}
                      </h4>
                      <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full capitalize">
                        {tip.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                      {tip.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setActiveTip(activeTip?.id === tip.id ? null : tip)}
                    className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg"
                  >
                    {activeTip?.id === tip.id ? (
                      <Check className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <Zap className="w-4 h-4 text-indigo-500" />
                    )}
                  </button>
                </div>
                
                {activeTip?.id === tip.id && (
                  <div className="space-y-4">
                    {/* Examples */}
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Examples
                      </h5>
                      <div className="space-y-2">
                        {tip.examples.map((example, index) => (
                          <div key={index} className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm text-slate-700 dark:text-slate-300">
                                {example.text}
                              </div>
                              
                              {example.audioUrl && (
                                <button
                                  onClick={() => playExample(example.audioUrl)}
                                  className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded"
                                >
                                  {isPlaying ? (
                                    <Pause className="w-4 h-4 text-indigo-500" />
                                  ) : (
                                    <Play className="w-4 h-4 text-indigo-500" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Exercises */}
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Practice Exercises
                      </h5>
                      <div className="space-y-2">
                        {tip.exercises.map((exercise, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm text-slate-700 dark:text-slate-300">
                            <div className="w-5 h-5 flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div>{exercise}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {filteredTips.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No voice coaching tips found for this category
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Mic className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Voice Coaching Tips Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Generate voice coaching tips to improve your narration quality
          </p>
          <button
            onClick={generateTips}
            disabled={!file.transcription}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 mx-auto"
          >
            <Mic className="w-4 h-4" />
            <span>Generate Voice Tips</span>
          </button>
        </div>
      )}

      {/* Voice Coaching Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Narration Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Speak at a moderate pace (120-150 words per minute) for optimal clarity</li>
          <li>• Use diaphragmatic breathing for better vocal support</li>
          <li>• Emphasize key words to maintain listener engagement</li>
          <li>• Articulate consonants clearly, especially at the ends of words</li>
          <li>• Vary your pitch and tone to avoid monotony</li>
          <li>• Record in a quiet environment with minimal echo</li>
          <li>• Stay hydrated before and during recording sessions</li>
        </ul>
      </div>
    </div>
  );
};