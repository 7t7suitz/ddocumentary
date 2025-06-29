import React, { useState } from 'react';
import { Wand2, Loader2, Camera, Lightbulb, Music, MapPin, Settings } from 'lucide-react';
import { Scene } from '../types';
import { analyzeSceneDescription } from '../utils/sceneAnalyzer';

interface SceneComposerProps {
  onSceneGenerated: (scene: Scene) => void;
}

export const SceneComposer: React.FC<SceneComposerProps> = ({ onSceneGenerated }) => {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleAnalyze = async () => {
    if (!description.trim()) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 200);

    try {
      const scene = await analyzeSceneDescription(description);
      onSceneGenerated(scene);
      setAnalysisProgress(100);
    } catch (error) {
      console.error('Scene analysis failed:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);
    }
  };

  const exampleScenes = [
    "Corporate interview in a modern office with floor-to-ceiling windows. Natural lighting from the left, subject seated at a sleek desk. Camera captures medium shots and close-ups for emotional moments. Professional but warm atmosphere.",
    
    "Outdoor documentary scene in a city park during golden hour. Subject walking along a tree-lined path while discussing their journey. Handheld camera follows with smooth tracking shots. Natural ambient sounds of birds and distant traffic.",
    
    "Intimate home interview in a cozy living room. Soft lamp lighting creates warm atmosphere. Subject seated on comfortable sofa with family photos visible in background. Close-up shots emphasize personal storytelling moments.",
    
    "Dynamic workplace scene showing subject in their element. Multiple camera angles capture the work process. Natural lighting supplemented with LED panels. Focus on hands-on activities and environmental details."
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Camera className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Scene Composition Tool
        </h2>
        <Wand2 className="w-4 h-4 text-purple-400" />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Scene Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Describe your scene in detail. Include location, lighting conditions, camera movements, subject positioning, mood, and any specific visual elements you want to capture..."
            disabled={isAnalyzing}
          />
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {description.length}/2000 characters
          </div>
        </div>

        {/* Example Scenes */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Example Scene Descriptions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleScenes.map((example, index) => (
              <button
                key={index}
                onClick={() => setDescription(example)}
                disabled={isAnalyzing}
                className="p-3 text-left text-sm bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-1">
                    {index === 0 && <Settings className="w-4 h-4 text-blue-500" />}
                    {index === 1 && <MapPin className="w-4 h-4 text-green-500" />}
                    {index === 2 && <Lightbulb className="w-4 h-4 text-amber-500" />}
                    {index === 3 && <Music className="w-4 h-4 text-purple-500" />}
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 line-clamp-3">
                    {example}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Analyzing scene composition...
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {Math.round(analysisProgress)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Generating shot list • Analyzing lighting • Creating equipment recommendations • Planning logistics
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            AI will analyze your scene and generate comprehensive production plans
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!description.trim() || isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Analyze Scene</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};