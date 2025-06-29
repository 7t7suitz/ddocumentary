import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Clock, Users, AlertTriangle, 
  CheckCircle, Eye, Target, Lightbulb, FileText 
} from 'lucide-react';
import { Script, ScriptAnalysis } from '../types/script';
import { analyzeScript } from '../utils/scriptGenerator';

interface ScriptAnalyzerProps {
  script: Script;
  onAnalysisComplete: (analysis: ScriptAnalysis) => void;
}

export const ScriptAnalyzer: React.FC<ScriptAnalyzerProps> = ({
  script,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    analyzeScriptContent();
  }, [script]);

  const analyzeScriptContent = async () => {
    setIsAnalyzing(true);
    try {
      const scriptAnalysis = await analyzeScript(script);
      setAnalysis(scriptAnalysis);
      onAnalysisComplete(scriptAnalysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'readability', label: 'Readability', icon: FileText },
    { id: 'pacing', label: 'Pacing', icon: Clock },
    { id: 'structure', label: 'Structure', icon: BarChart3 },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb }
  ];

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 0.8) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 0.6) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(analysis?.readability.fleschScore || 0)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Readability Score</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analysis?.pacing.overallPace.toUpperCase()}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Overall Pace</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {script.metadata.wordCount}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Word Count</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {Math.round(script.metadata.estimatedDuration / 60)}m
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Est. Duration</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Script Quality Scores
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-300">Readability</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(analysis?.readability.fleschScore || 0)}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${getScoreColor((analysis?.readability.fleschScore || 0) / 100)}`}>
                {Math.round(analysis?.readability.fleschScore || 0)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-300">Structure</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(analysis?.structure.plotPoints.filter(p => p.present).length || 0) * 20}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${getScoreColor((analysis?.structure.plotPoints.filter(p => p.present).length || 0) / 5)}`}>
                {Math.round((analysis?.structure.plotPoints.filter(p => p.present).length || 0) * 20)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-300">Dialogue Quality</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(analysis?.dialogue.naturalness || 0) * 100}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${getScoreColor(analysis?.dialogue.naturalness || 0)}`}>
                {Math.round((analysis?.dialogue.naturalness || 0) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Strengths</h4>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Well-structured narrative flow</li>
            <li>• Appropriate pacing for documentary format</li>
            <li>• Clear scene transitions</li>
            <li>• Effective use of voiceover elements</li>
          </ul>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-semibold text-amber-900 dark:text-amber-100">Areas for Improvement</h4>
          </div>
          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
            {analysis?.suggestions.slice(0, 4).map((suggestion, index) => (
              <li key={index}>• {suggestion.title}</li>
            )) || [
              <li key="1">• Consider adding more visual action descriptions</li>,
              <li key="2">• Balance dialogue with narrative elements</li>,
              <li key="3">• Strengthen emotional beats</li>
            ]}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderReadability = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Readability Metrics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getScoreColor((analysis?.readability.fleschScore || 0) / 100)}`}>
              {Math.round(analysis?.readability.fleschScore || 0)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Flesch Score</div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {(analysis?.readability.fleschScore || 0) >= 60 ? 'Easy to read' : 
               (analysis?.readability.fleschScore || 0) >= 30 ? 'Moderate' : 'Difficult'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {Math.round(analysis?.readability.gradeLevel || 0)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Grade Level</div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Reading difficulty
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {Math.round(analysis?.readability.averageWordsPerSentence || 0)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Avg Words/Sentence</div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Sentence complexity
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Language Complexity
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Complex Words</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {analysis?.readability.complexWords || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Passive Voice</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {analysis?.readability.passiveVoice || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Avg Syllables/Word</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {(analysis?.readability.averageSyllablesPerWord || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Recommendations
          </h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use shorter sentences for better flow</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Replace complex words with simpler alternatives</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Convert passive voice to active voice</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Aim for 15-20 words per sentence</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderPacing = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Pacing Analysis
        </h3>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${
              analysis?.pacing.overallPace === 'fast' ? 'text-red-600 dark:text-red-400' :
              analysis?.pacing.overallPace === 'medium' ? 'text-green-600 dark:text-green-400' :
              'text-blue-600 dark:text-blue-400'
            }`}>
              {analysis?.pacing.overallPace.toUpperCase()}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Overall Pace</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {Math.round((analysis?.pacing.dialogueRatio || 0) * 100)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Dialogue</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2">
              {Math.round((analysis?.pacing.actionRatio || 0) * 100)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Action</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dialogue Ratio</span>
              <span className="text-sm text-slate-500 dark:text-slate-500">
                {Math.round((analysis?.pacing.dialogueRatio || 0) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(analysis?.pacing.dialogueRatio || 0) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Action Ratio</span>
              <span className="text-sm text-slate-500 dark:text-slate-500">
                {Math.round((analysis?.pacing.actionRatio || 0) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${(analysis?.pacing.actionRatio || 0) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description Ratio</span>
              <span className="text-sm text-slate-500 dark:text-slate-500">
                {Math.round((analysis?.pacing.descriptionRatio || 0) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(analysis?.pacing.descriptionRatio || 0) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Pacing Recommendations
        </h4>
        <div className="space-y-3">
          {analysis?.pacing.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400">{rec}</span>
            </div>
          )) || [
            <div key="1" className="flex items-start space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Consider balancing dialogue with visual action
              </span>
            </div>
          ]}
        </div>
      </div>
    </div>
  );

  const renderStructure = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Story Structure
        </h3>
        
        <div className="space-y-4">
          {analysis?.structure.plotPoints.map((point, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${point.present ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                    {point.type.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {point.description}
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-500">
                {Math.round(point.position * 100)}%
              </div>
            </div>
          )) || []}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Act Breakdown
        </h4>
        <div className="space-y-4">
          {analysis?.structure.actBreakdown.map((act, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-900 dark:text-slate-100">
                  Act {act.act}
                </h5>
                <span className="text-sm text-slate-500 dark:text-slate-500">
                  {Math.round(act.duration * 100)}% of script
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {act.purpose}
              </p>
              <div className="flex flex-wrap gap-2">
                {act.keyEvents.map((event, eventIndex) => (
                  <span
                    key={eventIndex}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>
          )) || []}
        </div>
      </div>
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-4">
      {analysis?.suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className={`
            rounded-xl p-6 border
            ${suggestion.severity === 'high' 
              ? 'bg-red-50 dark:bg-re-950/20 border-red-200 dark:border-red-800' 
              : suggestion.severity === 'medium'
              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
              : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
            }
          `}
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className={`
              w-5 h-5 mt-0.5
              ${suggestion.severity === 'high' 
                ? 'text-red-600 dark:text-red-400' 
                : suggestion.severity === 'medium'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-blue-600 dark:text-blue-400'
              }
            `} />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className={`
                  font-semibold capitalize
                  ${suggestion.severity === 'high' 
                    ? 'text-red-900 dark:text-red-100' 
                    : suggestion.severity === 'medium'
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-blue-900 dark:text-blue-100'
                  }
                `}>
                  {suggestion.title}
                </h3>
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${suggestion.severity === 'high' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                    : suggestion.severity === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }
                `}>
                  {suggestion.severity} priority
                </span>
                <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                  {suggestion.category}
                </span>
              </div>
              <p className={`
                text-sm mb-3
                ${suggestion.severity === 'high' 
                  ? 'text-red-800 dark:text-red-200' 
                  : suggestion.severity === 'medium'
                  ? 'text-amber-800 dark:text-amber-200'
                  : 'text-blue-800 dark:text-blue-200'
                }
              `}>
                {suggestion.description}
              </p>
              <div className={`
                p-3 rounded-lg
                ${suggestion.severity === 'high' 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : suggestion.severity === 'medium'
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
                }
              `}>
                <h4 className={`
                  text-xs font-medium mb-1
                  ${suggestion.severity === 'high' 
                    ? 'text-red-900 dark:text-red-100' 
                    : suggestion.severity === 'medium'
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-blue-900 dark:text-blue-100'
                  }
                `}>
                  Recommendation:
                </h4>
                <p className={`
                  text-xs
                  ${suggestion.severity === 'high' 
                    ? 'text-red-800 dark:text-red-200' 
                    : suggestion.severity === 'medium'
                    ? 'text-amber-800 dark:text-amber-200'
                    : 'text-blue-800 dark:text-blue-200'
                  }
                `}>
                  {suggestion.suggestion}
                </p>
              </div>
            </div>
          </div>
        </div>
      )) || (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No Issues Found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Your script looks good! No significant issues were detected.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Script Analysis
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Comprehensive analysis of readability, pacing, structure, and more
          </p>
        </div>
        
        <button
          onClick={analyzeScriptContent}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}</span>
        </button>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Analyzing Script...
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Our AI is analyzing your script for readability, pacing, structure, and more.
          </p>
        </div>
      )}

      {/* Analysis Content */}
      {analysis && !isAnalyzing && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
                      ${activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'readability' && renderReadability()}
            {activeTab === 'pacing' && renderPacing()}
            {activeTab === 'structure' && renderStructure()}
            {activeTab === 'suggestions' && renderSuggestions()}
          </div>
        </>
      )}
    </div>
  );
};