import React, { useState } from 'react';
import { Wand2, Loader2, FileText, Sparkles } from 'lucide-react';
import { StoryboardFrame } from '../types';
import { generateStoryboardFromText, generateShotSequence } from '../utils/storyboardGenerator';

interface TextToStoryboardProps {
  onFramesGenerated: (frames: StoryboardFrame[]) => void;
}

export const TextToStoryboard: React.FC<TextToStoryboardProps> = ({
  onFramesGenerated
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + Math.random() * 20, 90));
    }, 200);

    try {
      const frames = await generateStoryboardFromText(inputText);
      onFramesGenerated(frames);
      setGenerationProgress(100);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 500);
    }
  };

  const exampleTexts = [
    "A documentary interview setup. The subject sits in a comfortable chair with warm lighting. Camera starts wide to show the environment, then moves to medium shot for the conversation. Soft natural light from a window creates depth.",
    "Opening scene of a city documentary. Aerial establishing shot of the skyline at golden hour. Camera slowly pans across the buildings, then tilts down to street level where people are walking. Urban ambient sounds.",
    "Intimate portrait session. Close-up shots of hands working on a craft. Shallow depth of field with warm, soft lighting. Camera moves slowly to capture the details and concentration on the subject's face.",
    "Nature documentary sequence. Wide shot of a forest clearing at dawn. Mist rises from the ground. Camera tracks forward through the trees, revealing wildlife in their natural habitat. Peaceful morning ambience."
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Wand2 className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Text to Storyboard Generator
        </h2>
        <Sparkles className="w-4 h-4 text-purple-400" />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Describe your scene or sequence
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Describe your scene in detail. Include camera movements, lighting, characters, emotions, and any specific visual elements you want to capture..."
            disabled={isGenerating}
          />
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {inputText.length}/1000 characters
          </div>
        </div>

        {/* Example Prompts */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Example Prompts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                onClick={() => setInputText(example)}
                disabled={isGenerating}
                className="p-3 text-left text-sm bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 line-clamp-3">
                    {example}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Generating storyboard frames...
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {Math.round(generationProgress)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Analyzing text • Extracting visual elements • Generating camera suggestions • Creating frames
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            AI will analyze your text and create professional storyboard frames
          </div>
          <button
            onClick={handleGenerate}
            disabled={!inputText.trim() || isGenerating}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Storyboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};