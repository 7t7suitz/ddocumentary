import React, { useState } from 'react';
import { Wand2, Loader2, MessageSquare, Sparkles, Settings, AlertTriangle } from 'lucide-react';
import { InterviewQuestion, DocumentAnalysis, InterviewTemplate, CulturalSettings } from '../types';
import { generateQuestionsFromAnalysis, getInterviewTemplates } from '../utils/questionGenerator';

interface QuestionGeneratorProps {
  analysis: DocumentAnalysis | null;
  onQuestionsGenerated: (questions: InterviewQuestion[]) => void;
}

export const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({
  analysis,
  onQuestionsGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('documentary-standard');
  const [culturalSettings, setCulturalSettings] = useState<CulturalSettings>({
    primaryCulture: 'General',
    communicationStyle: 'direct',
    formalityLevel: 'semi-formal',
    sensitivityLevel: 'medium',
    languagePreferences: ['English'],
    culturalConsiderations: []
  });
  const [customPrompt, setCustomPrompt] = useState('');

  const templates = getInterviewTemplates();

  const handleGenerate = async () => {
    if (!analysis) return;

    setIsGenerating(true);
    try {
      const questions = await generateQuestionsFromAnalysis(analysis);
      onQuestionsGenerated(questions);
    } catch (error) {
      console.error('Question generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Wand2 className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          AI Question Generator
        </h2>
        <Sparkles className="w-4 h-4 text-blue-400" />
      </div>

      {!analysis ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Document Analysis Available
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Upload and analyze a document first to generate intelligent interview questions
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Interview Style Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
            {selectedTemplateData && (
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Duration:</strong> {selectedTemplateData.duration} minutes • 
                  <strong> Style:</strong> {selectedTemplateData.style} • 
                  <strong> Sections:</strong> {selectedTemplateData.structure.length}
                </div>
              </div>
            )}
          </div>

          {/* Cultural Settings */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Settings className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                Cultural Sensitivity Settings
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Culture
                </label>
                <select
                  value={culturalSettings.primaryCulture}
                  onChange={(e) => setCulturalSettings(prev => ({ ...prev, primaryCulture: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                >
                  <option value="General">General</option>
                  <option value="Western">Western</option>
                  <option value="Asian">Asian</option>
                  <option value="Middle Eastern">Middle Eastern</option>
                  <option value="African">African</option>
                  <option value="Latin American">Latin American</option>
                  <option value="Indigenous">Indigenous</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Communication Style
                </label>
                <select
                  value={culturalSettings.communicationStyle}
                  onChange={(e) => setCulturalSettings(prev => ({ ...prev, communicationStyle: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                >
                  <option value="direct">Direct</option>
                  <option value="indirect">Indirect</option>
                  <option value="high-context">High Context</option>
                  <option value="low-context">Low Context</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Formality Level
                </label>
                <select
                  value={culturalSettings.formalityLevel}
                  onChange={(e) => setCulturalSettings(prev => ({ ...prev, formalityLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                >
                  <option value="formal">Formal</option>
                  <option value="semi-formal">Semi-formal</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sensitivity Level
                </label>
                <select
                  value={culturalSettings.sensitivityLevel}
                  onChange={(e) => setCulturalSettings(prev => ({ ...prev, sensitivityLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Additional Instructions (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Add specific instructions for question generation, topics to focus on, or approaches to avoid..."
            />
          </div>

          {/* Analysis Preview */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              Analysis Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analysis.themes.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Themes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analysis.characters.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analysis.timeline.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {analysis.emotionalBeats.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Emotions</div>
              </div>
            </div>
            
            {analysis.sensitiveTopics.length > 0 && (
              <div className="flex items-center space-x-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-800 dark:text-amber-200">
                  {analysis.sensitiveTopics.length} sensitive topic{analysis.sensitiveTopics.length !== 1 ? 's' : ''} detected - questions will be adapted accordingly
                </span>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              AI will generate culturally sensitive, empathetic questions based on your document analysis
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Questions</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};