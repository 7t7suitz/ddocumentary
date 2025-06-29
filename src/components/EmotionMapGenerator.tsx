import React, { useState } from 'react';
import { 
  Heart, Users, Brain, Zap, 
  Wand2, Download, Settings, Loader2 
} from 'lucide-react';
import { EmotionMap, DocumentAnalysis } from '../types';
import { generateEmotionMap } from '../utils/emotionAnalyzer';

interface EmotionMapGeneratorProps {
  analysis: DocumentAnalysis | null;
  onMapGenerated: (map: EmotionMap) => void;
}

export const EmotionMapGenerator: React.FC<EmotionMapGeneratorProps> = ({
  analysis,
  onMapGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    includeAudiencePersonas: true,
    detailedEmotions: true,
    accessibilityFocus: true,
    emotionGranularity: 'high'
  });

  const handleGenerate = async () => {
    if (!analysis) return;
    
    setIsGenerating(true);
    try {
      const emotionMap = await generateEmotionMap(analysis, settings);
      onMapGenerated(emotionMap);
    } catch (error) {
      console.error('Failed to generate emotion map:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Document Analysis Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Upload and analyze a document first to generate an emotion map
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Heart className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Emotion Map Generator
        </h2>
      </div>

      <div className="space-y-6">
        {/* Document Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Document Analysis Summary
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {analysis.emotionalBeats.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Emotional Beats</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {analysis.characters.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Characters</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {analysis.themes.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Themes</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {analysis.sensitiveTopics.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Sensitive Topics</div>
            </div>
          </div>
          
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <strong>Primary emotions detected:</strong> {analysis.emotionalBeats.slice(0, 5).map(beat => beat.emotion).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
          </div>
        </div>

        {/* Generator Settings */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Generator Settings
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeAudiencePersonas"
                checked={settings.includeAudiencePersonas}
                onChange={(e) => setSettings({...settings, includeAudiencePersonas: e.target.checked})}
                className="rounded border-slate-300 dark:border-slate-600 text-purple-600"
              />
              <label htmlFor="includeAudiencePersonas" className="text-sm text-slate-700 dark:text-slate-300">
                Include Audience Personas
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="detailedEmotions"
                checked={settings.detailedEmotions}
                onChange={(e) => setSettings({...settings, detailedEmotions: e.target.checked})}
                className="rounded border-slate-300 dark:border-slate-600 text-purple-600"
              />
              <label htmlFor="detailedEmotions" className="text-sm text-slate-700 dark:text-slate-300">
                Detailed Emotion Analysis
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="accessibilityFocus"
                checked={settings.accessibilityFocus}
                onChange={(e) => setSettings({...settings, accessibilityFocus: e.target.checked})}
                className="rounded border-slate-300 dark:border-slate-600 text-purple-600"
              />
              <label htmlFor="accessibilityFocus" className="text-sm text-slate-700 dark:text-slate-300">
                Accessibility Recommendations
              </label>
            </div>
            
            <div>
              <label htmlFor="emotionGranularity" className="block text-sm text-slate-700 dark:text-slate-300 mb-1">
                Emotion Granularity
              </label>
              <select
                id="emotionGranularity"
                value={settings.emotionGranularity}
                onChange={(e) => setSettings({...settings, emotionGranularity: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="low">Basic (6 emotions)</option>
                <option value="medium">Standard (12 emotions)</option>
                <option value="high">Detailed (24 emotions)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Emotion Map Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-medium text-red-900 dark:text-red-100">
                Emotional Journey
              </h3>
            </div>
            <p className="text-xs text-red-800 dark:text-red-200">
              Visualize the emotional arc throughout your documentary with intensity mapping and transition analysis.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Audience Personas
              </h3>
            </div>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Create detailed audience personas with predicted emotional responses and engagement points.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Empathy Mapping
              </h3>
            </div>
            <p className="text-xs text-purple-800 dark:text-purple-200">
              Generate comprehensive empathy maps to understand audience thinking, feeling, seeing, and hearing.
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Generate a detailed emotion map based on document analysis
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Emotion Map</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};