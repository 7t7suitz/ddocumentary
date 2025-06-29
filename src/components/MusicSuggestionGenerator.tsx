import React, { useState } from 'react';
import { 
  Music, Wand2, Loader2, Heart, 
  Play, Pause, Download, Plus, 
  Clock, Volume2, Zap, Settings
} from 'lucide-react';
import { EmotionalJourney, MusicSuggestion, SoundDesignSuggestion } from '../types';
import { generateMusicSuggestions, generateSoundDesignSuggestions } from '../utils/emotionAnalyzer';

interface MusicSuggestionGeneratorProps {
  emotionalJourney: EmotionalJourney | null;
  onSuggestionsGenerated: (music: MusicSuggestion[], soundDesign: SoundDesignSuggestion[]) => void;
}

export const MusicSuggestionGenerator: React.FC<MusicSuggestionGeneratorProps> = ({
  emotionalJourney,
  onSuggestionsGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [musicSuggestions, setMusicSuggestions] = useState<MusicSuggestion[]>([]);
  const [soundDesignSuggestions, setSoundDesignSuggestions] = useState<SoundDesignSuggestion[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    musicStyle: 'documentary',
    emotionalIntensity: 'balanced',
    culturalContext: 'western',
    instrumentalFocus: true
  });

  const handleGenerate = async () => {
    if (!emotionalJourney) return;
    
    setIsGenerating(true);
    try {
      const music = await generateMusicSuggestions(emotionalJourney, settings);
      const soundDesign = await generateSoundDesignSuggestions(emotionalJourney);
      
      setMusicSuggestions(music);
      setSoundDesignSuggestions(soundDesign);
      onSuggestionsGenerated(music, soundDesign);
    } catch (error) {
      console.error('Failed to generate music suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playPreview = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
      // Stop audio playback
    } else {
      setPlayingId(id);
      // Start audio playback simulation
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  const exportSuggestions = () => {
    const data = {
      music: musicSuggestions,
      soundDesign: soundDesignSuggestions,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `music-suggestions-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getEmotionColor = (emotion: string): string => {
    const emotionColors: Record<string, string> = {
      'joy': '#10B981', // green
      'sadness': '#3B82F6', // blue
      'fear': '#6366F1', // indigo
      'anger': '#EF4444', // red
      'surprise': '#F59E0B', // amber
      'anticipation': '#8B5CF6', // purple
      'trust': '#14B8A6', // teal
      'disgust': '#F97316', // orange
      'love': '#EC4899', // pink
      'hope': '#6EE7B7', // emerald
      'nostalgia': '#A78BFA', // violet
      'pride': '#FBBF24', // yellow
    };
    
    return emotionColors[emotion.toLowerCase()] || '#6B7280'; // gray default
  };

  if (!emotionalJourney) {
    return (
      <div className="text-center py-12">
        <Music className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Emotional Journey Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Generate an emotional journey first to create music suggestions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Music & Sound Design Generator
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate music and sound design suggestions based on emotional journey
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {musicSuggestions.length > 0 && (
            <button
              onClick={exportSuggestions}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            <Music className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Suggestions'}</span>
          </button>
        </div>
      </div>

      {/* Generator Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Music Generator Settings
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Music Style
            </label>
            <select
              value={settings.musicStyle}
              onChange={(e) => setSettings({...settings, musicStyle: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="documentary">Documentary (Understated, Supportive)</option>
              <option value="cinematic">Cinematic (Dramatic, Orchestral)</option>
              <option value="minimalist">Minimalist (Subtle, Ambient)</option>
              <option value="contemporary">Contemporary (Modern, Electronic)</option>
              <option value="classical">Classical (Traditional, Orchestral)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Emotional Intensity
            </label>
            <select
              value={settings.emotionalIntensity}
              onChange={(e) => setSettings({...settings, emotionalIntensity: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="subtle">Subtle (Background, Supportive)</option>
              <option value="balanced">Balanced (Complementary)</option>
              <option value="pronounced">Pronounced (Emotionally Driven)</option>
              <option value="dramatic">Dramatic (Highly Expressive)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cultural Context
            </label>
            <select
              value={settings.culturalContext}
              onChange={(e) => setSettings({...settings, culturalContext: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="western">Western (Orchestral, Pop, Jazz)</option>
              <option value="eastern">Eastern (Traditional Asian Instruments)</option>
              <option value="african">African (Rhythmic, Percussion-Based)</option>
              <option value="latin">Latin American (Rhythmic, String-Based)</option>
              <option value="middle-eastern">Middle Eastern (Modal, String-Based)</option>
              <option value="global-fusion">Global Fusion (Mixed Traditions)</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="instrumentalFocus"
              checked={settings.instrumentalFocus}
              onChange={(e) => setSettings({...settings, instrumentalFocus: e.target.checked})}
              className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
            />
            <label htmlFor="instrumentalFocus" className="text-sm text-slate-700 dark:text-slate-300">
              Instrumental Focus (No Vocals)
            </label>
          </div>
        </div>
      </div>

      {/* Music Suggestions */}
      {musicSuggestions.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Music className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Music Suggestions
            </h3>
          </div>
          
          <div className="space-y-4">
            {musicSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getEmotionColor(suggestion.emotion) }}
                    />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {suggestion.emotion} - {suggestion.mood}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {Math.round(suggestion.position * 100)}%
                    </span>
                    <button
                      onClick={() => playPreview(suggestion.id)}
                      className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                    >
                      {playingId === suggestion.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Genre & Tempo</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {suggestion.genre}, {suggestion.tempo}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Duration</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {suggestion.duration} seconds
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Transition</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                      {suggestion.transitionType.replace('-', ' ')}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Instruments</div>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.instruments.map((instrument, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs"
                      >
                        {instrument}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Purpose</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {suggestion.purpose}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
                  <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Examples</div>
                  <div className="text-sm text-indigo-600 dark:text-indigo-400">
                    {suggestion.examples.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Music className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Music Suggestions Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Generate music suggestions based on the emotional journey
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 mx-auto"
          >
            <Music className="w-4 h-4" />
            <span>Generate Suggestions</span>
          </button>
        </div>
      )}

      {/* Sound Design Suggestions */}
      {soundDesignSuggestions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Sound Design Suggestions
            </h3>
          </div>
          
          <div className="space-y-4">
            {soundDesignSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full capitalize">
                      {suggestion.type}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {suggestion.description}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {Math.round(suggestion.position * 100)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Purpose</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {suggestion.purpose}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Duration</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {suggestion.duration} seconds
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 dark:text-slate-500">Intensity:</span>
                    <div className="w-20 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${suggestion.intensity * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {Math.round(suggestion.intensity * 100)}%
                    </span>
                  </div>
                  
                  <button
                    onClick={() => playPreview(suggestion.id)}
                    className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50"
                  >
                    {playingId === suggestion.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Music & Sound Design Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Use music to enhance emotional moments, not overwhelm them</li>
          <li>• Consider the cultural context of your audience when selecting music</li>
          <li>• Create smooth transitions between different emotional segments</li>
          <li>• Balance dialogue clarity with emotional music cues</li>
          <li>• Use ambient sound design to subtly reinforce emotional states</li>
          <li>• Consider licensing requirements for all music selections</li>
          <li>• Test music choices with sample audiences for emotional impact</li>
        </ul>
      </div>
    </div>
  );
};