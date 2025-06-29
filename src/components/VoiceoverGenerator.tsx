import React, { useState } from 'react';
import { Mic, Wand2, Play, Pause, Download, Volume2, Settings } from 'lucide-react';
import { VoiceoverSuggestion, VoiceoverTone, VoiceoverStyle, ScriptElement } from '../types/script';
import { generateVoiceoverSuggestions } from '../utils/scriptGenerator';

interface VoiceoverGeneratorProps {
  scriptElements: ScriptElement[];
  onVoiceoverGenerated: (elementId: string, voiceover: string) => void;
}

export const VoiceoverGenerator: React.FC<VoiceoverGeneratorProps> = ({
  scriptElements,
  onVoiceoverGenerated
}) => {
  const [suggestions, setSuggestions] = useState<VoiceoverSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<VoiceoverTone>('documentary');
  const [selectedStyle, setSelectedStyle] = useState<VoiceoverStyle>('narrator');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const tones: { value: VoiceoverTone; label: string; description: string }[] = [
    { value: 'authoritative', label: 'Authoritative', description: 'Confident and commanding' },
    { value: 'conversational', label: 'Conversational', description: 'Friendly and approachable' },
    { value: 'dramatic', label: 'Dramatic', description: 'Intense and emotional' },
    { value: 'intimate', label: 'Intimate', description: 'Personal and close' },
    { value: 'educational', label: 'Educational', description: 'Informative and clear' },
    { value: 'inspiring', label: 'Inspiring', description: 'Uplifting and motivational' }
  ];

  const styles: { value: VoiceoverStyle; label: string; description: string }[] = [
    { value: 'narrator', label: 'Narrator', description: 'Third-person storytelling' },
    { value: 'character', label: 'Character', description: 'First-person perspective' },
    { value: 'documentary', label: 'Documentary', description: 'Factual and observational' },
    { value: 'commercial', label: 'Commercial', description: 'Promotional and engaging' },
    { value: 'poetic', label: 'Poetic', description: 'Artistic and lyrical' }
  ];

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const newSuggestions = await generateVoiceoverSuggestions(scriptElements);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to generate voiceover suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playVoiceover = (suggestionId: string) => {
    if (playingId === suggestionId) {
      setPlayingId(null);
      // Stop audio playback
    } else {
      setPlayingId(suggestionId);
      // Start audio playback simulation
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  const acceptSuggestion = (suggestion: VoiceoverSuggestion) => {
    onVoiceoverGenerated(suggestion.elementId, suggestion.text);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getElementContent = (elementId: string): string => {
    const element = scriptElements.find(el => el.id === elementId);
    return element ? element.content.substring(0, 50) + '...' : 'Unknown element';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          AI Voiceover Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Generate intelligent voiceover suggestions for your script elements. 
          Choose tone and style to match your documentary's narrative voice.
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Voiceover Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tone
            </label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as VoiceoverTone)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {tones.map(tone => (
                <option key={tone.value} value={tone.value}>
                  {tone.label} - {tone.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as VoiceoverStyle)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {styles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label} - {style.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {scriptElements.length} script elements available for voiceover generation
          </div>
          <button
            onClick={generateSuggestions}
            disabled={isGenerating || scriptElements.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Voiceovers'}</span>
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Voiceover Suggestions ({suggestions.length})
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Duration: {formatTime(suggestions.reduce((sum, s) => sum + (s.timing.estimatedDuration || 0), 0))}
            </div>
          </div>

          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mic className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      For: {getElementContent(suggestion.elementId)}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                      {suggestion.tone}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {suggestion.style}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
                    <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                      "{suggestion.text}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Volume2 className="w-3 h-3" />
                      <span>Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mic className="w-3 h-3" />
                      <span>Duration: {formatTime(suggestion.timing.estimatedDuration || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => playVoiceover(suggestion.id)}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    title="Preview voiceover"
                  >
                    {playingId === suggestion.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => acceptSuggestion(suggestion)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Use This
                  </button>
                </div>
              </div>

              {/* Alternative Suggestions */}
              {suggestion.alternatives.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Alternative Versions:
                  </h4>
                  <div className="space-y-2">
                    {suggestion.alternatives.map((alternative, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                          "{alternative}"
                        </p>
                        <button
                          onClick={() => onVoiceoverGenerated(suggestion.elementId, alternative)}
                          className="ml-3 px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-xs hover:bg-slate-300 dark:hover:bg-slate-500"
                        >
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !isGenerating && (
        <div className="text-center py-12">
          <Mic className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Voiceover Suggestions Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Configure your settings and click "Generate Voiceovers" to create AI-powered narration suggestions
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Voiceover Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Choose a tone that matches your documentary's overall mood and subject matter</li>
          <li>• Documentary style works best for factual content, while narrative style suits storytelling</li>
          <li>• Consider your target audience when selecting tone - authoritative for educational content, conversational for general audiences</li>
          <li>• Preview different alternatives to find the voice that best serves your story</li>
          <li>• Keep voiceover segments concise and impactful - less is often more</li>
        </ul>
      </div>
    </div>
  );
};