import React, { useState } from 'react';
import { 
  AlertTriangle, Eye, Ear, Brain, 
  Heart, Globe, Download, Settings, 
  Check, X, Info
} from 'lucide-react';
import { EmotionalJourney, AccessibilityConsideration } from '../types';
import { generateAccessibilityConsiderations } from '../utils/emotionAnalyzer';

interface AccessibilityConsiderationsProps {
  emotionalJourney: EmotionalJourney | null;
}

export const AccessibilityConsiderations: React.FC<AccessibilityConsiderationsProps> = ({
  emotionalJourney
}) => {
  const [considerations, setConsiderations] = useState<AccessibilityConsideration[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [settings, setSettings] = useState({
    includeVisual: true,
    includeAuditory: true,
    includeCognitive: true,
    includeEmotional: true,
    includeCultural: true
  });

  const handleGenerate = async () => {
    if (!emotionalJourney) return;
    
    setIsGenerating(true);
    try {
      const accessibilityConsiderations = await generateAccessibilityConsiderations(emotionalJourney, settings);
      setConsiderations(accessibilityConsiderations);
    } catch (error) {
      console.error('Failed to generate accessibility considerations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportConsiderations = () => {
    const data = JSON.stringify(considerations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-considerations-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'visual': return <Eye className="w-4 h-4" />;
      case 'auditory': return <Ear className="w-4 h-4" />;
      case 'cognitive': return <Brain className="w-4 h-4" />;
      case 'emotional': return <Heart className="w-4 h-4" />;
      case 'cultural': return <Globe className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'visual': return 'text-blue-500 dark:text-blue-400';
      case 'auditory': return 'text-green-500 dark:text-green-400';
      case 'cognitive': return 'text-purple-500 dark:text-purple-400';
      case 'emotional': return 'text-red-500 dark:text-red-400';
      case 'cultural': return 'text-amber-500 dark:text-amber-400';
      default: return 'text-slate-500 dark:text-slate-400';
    }
  };

  const getCategoryBgColor = (category: string): string => {
    switch (category) {
      case 'visual': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'auditory': return 'bg-green-50 dark:bg-green-900/20';
      case 'cognitive': return 'bg-purple-50 dark:bg-purple-900/20';
      case 'emotional': return 'bg-red-50 dark:bg-red-900/20';
      case 'cultural': return 'bg-amber-50 dark:bg-amber-900/20';
      default: return 'bg-slate-50 dark:bg-slate-700';
    }
  };

  const getCategoryBorderColor = (category: string): string => {
    switch (category) {
      case 'visual': return 'border-blue-200 dark:border-blue-800';
      case 'auditory': return 'border-green-200 dark:border-green-800';
      case 'cognitive': return 'border-purple-200 dark:border-purple-800';
      case 'emotional': return 'border-red-200 dark:border-red-800';
      case 'cultural': return 'border-amber-200 dark:border-amber-800';
      default: return 'border-slate-200 dark:border-slate-700';
    }
  };

  const getImpactBadgeColor = (impact: string): string => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const filteredConsiderations = activeCategory === 'all' 
    ? considerations 
    : considerations.filter(c => c.category === activeCategory);

  if (!emotionalJourney) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Emotional Journey Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Generate an emotional journey first to create accessibility considerations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Accessibility Considerations
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ensure your documentary is accessible to all audiences
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {considerations.length > 0 && (
            <button
              onClick={exportConsiderations}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Considerations'}</span>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Accessibility Settings
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeVisual"
              checked={settings.includeVisual}
              onChange={(e) => setSettings({...settings, includeVisual: e.target.checked})}
              className="rounded border-slate-300 dark:border-slate-600 text-blue-600"
            />
            <label htmlFor="includeVisual" className="text-sm text-slate-700 dark:text-slate-300">
              Visual Accessibility
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeAuditory"
              checked={settings.includeAuditory}
              onChange={(e) => setSettings({...settings, includeAuditory: e.target.checked})}
              className="rounded border-slate-300 dark:border-slate-600 text-green-600"
            />
            <label htmlFor="includeAuditory" className="text-sm text-slate-700 dark:text-slate-300">
              Auditory Accessibility
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeCognitive"
              checked={settings.includeCognitive}
              onChange={(e) => setSettings({...settings, includeCognitive: e.target.checked})}
              className="rounded border-slate-300 dark:border-slate-600 text-purple-600"
            />
            <label htmlFor="includeCognitive" className="text-sm text-slate-700 dark:text-slate-300">
              Cognitive Accessibility
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeEmotional"
              checked={settings.includeEmotional}
              onChange={(e) => setSettings({...settings, includeEmotional: e.target.checked})}
              className="rounded border-slate-300 dark:border-slate-600 text-red-600"
            />
            <label htmlFor="includeEmotional" className="text-sm text-slate-700 dark:text-slate-300">
              Emotional Accessibility
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeCultural"
              checked={settings.includeCultural}
              onChange={(e) => setSettings({...settings, includeCultural: e.target.checked})}
              className="rounded border-slate-300 dark:border-slate-600 text-amber-600"
            />
            <label htmlFor="includeCultural" className="text-sm text-slate-700 dark:text-slate-300">
              Cultural Accessibility
            </label>
          </div>
        </div>
      </div>

      {/* Accessibility Considerations */}
      {considerations.length > 0 ? (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm
                ${activeCategory === 'all'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
              `}
            >
              <span>All Categories</span>
            </button>
            
            {['visual', 'auditory', 'cognitive', 'emotional', 'cultural'].map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm
                  ${activeCategory === category
                    ? `${getCategoryBgColor(category)} ${getCategoryColor(category)}`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }
                `}
              >
                {getCategoryIcon(category)}
                <span className="capitalize">{category}</span>
              </button>
            ))}
          </div>

          {/* Consideration Cards */}
          <div className="space-y-4">
            {filteredConsiderations.map((consideration) => (
              <div 
                key={consideration.id} 
                className={`p-6 rounded-xl border ${getCategoryBgColor(consideration.category)} ${getCategoryBorderColor(consideration.category)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getCategoryBgColor(consideration.category)}`}>
                    {getCategoryIcon(consideration.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {consideration.description}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getImpactBadgeColor(consideration.impact)}`}>
                        {consideration.impact} impact
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {consideration.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-400">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Examples
                        </h4>
                        <ul className="space-y-1">
                          {consideration.examples.map((example, index) => (
                            <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                              • {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {consideration.standards.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Relevant Standards
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {consideration.standards.map((standard, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs"
                              >
                                {standard}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          {isGenerating ? (
            <div className="animate-pulse flex flex-col items-center">
              <AlertTriangle className="w-16 h-16 text-amber-300 dark:text-amber-800 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                Generating Accessibility Considerations...
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Analyzing emotional journey for accessibility needs
              </p>
            </div>
          ) : (
            <>
              <AlertTriangle className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Accessibility Considerations Yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Generate accessibility considerations to ensure your documentary is accessible to all audiences
              </p>
              <button
                onClick={handleGenerate}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 mx-auto"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Generate Considerations</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Accessibility Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Accessibility Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Include closed captions and subtitles for all dialogue and important sounds</li>
          <li>• Provide audio descriptions for key visual elements</li>
          <li>• Ensure sufficient contrast for text elements and important visuals</li>
          <li>• Avoid rapid flashing or strobing effects that could trigger seizures</li>
          <li>• Provide content warnings for emotionally intense or potentially triggering content</li>
          <li>• Consider the cognitive load of complex narrative structures</li>
          <li>• Be aware of cultural differences in emotional expression and interpretation</li>
        </ul>
      </div>
    </div>
  );
};

// For TypeScript
const Ear = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"></path>
    <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"></path>
  </svg>
);

const Brain = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
  </svg>
);