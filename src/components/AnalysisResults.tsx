import React, { useState } from 'react';
import { 
  Brain, 
  Users, 
  Calendar, 
  Tag, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Heart,
  Zap
} from 'lucide-react';
import { DocumentAnalysis } from '../types';
import { Timeline } from './Timeline';

interface AnalysisResultsProps {
  analysis: DocumentAnalysis;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'themes', label: 'Themes', icon: Tag },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'cinematic', label: 'Cinematic', icon: Zap },
    { id: 'interviews', label: 'Interview Questions', icon: MessageSquare },
    { id: 'concerns', label: 'Legal Concerns', icon: AlertTriangle }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">AI Summary</h3>
        </div>
        <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <Tag className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Themes</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {analysis.themes.length}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Characters</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {analysis.characters.length}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Timeline Events</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {analysis.timeline.length}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cinematic Score</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {Math.round(analysis.cinematicPotential.score * 100)}%
          </div>
        </div>
      </div>

      {/* Narrative Arcs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Narrative Structure</h3>
        <div className="space-y-4">
          {analysis.narrativeArcs.map((arc) => (
            <div key={arc.id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">{arc.title}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">{arc.type.replace('-', ' ')}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                  style={{
                    marginLeft: `${arc.startPosition * 100}%`,
                    width: `${(arc.endPosition - arc.startPosition) * 100}%`
                  }}
                />
                <div
                  className="absolute top-0 h-full w-1 bg-white"
                  style={{ left: `${arc.startPosition * 100 + (arc.endPosition - arc.startPosition) * 50}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{arc.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderThemes = () => (
    <div className="space-y-4">
      {analysis.themes.map((theme) => (
        <div key={theme.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{theme.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{theme.description}</p>
            </div>
            <span className={`
              px-3 py-1 text-xs font-medium rounded-full
              ${theme.relevance === 'high' 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : theme.relevance === 'medium'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }
            `}>
              {theme.relevance} relevance
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
              <span>{theme.occurrences} mentions</span>
              <span>{Math.round(theme.confidence * 100)}% confidence</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                  style={{ width: `${theme.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCharacters = () => (
    <div className="space-y-4">
      {analysis.characters.map((character) => (
        <div key={character.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{character.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{character.role}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {character.totalMentions} mentions
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                Importance: {Math.round(character.importance * 100)}%
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{character.description}</p>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-500">First mention:</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {Math.round(character.firstMention * 100)}% through document
              </span>
            </div>
            <div className="flex-1">
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  style={{ width: `${character.importance * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCinematic = () => (
    <div className="space-y-6">
      {/* Cinematic Score */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Cinematic Potential</h3>
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {Math.round(analysis.cinematicPotential.score * 100)}%
          </div>
        </div>
        <div className="w-full h-3 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
            style={{ width: `${analysis.cinematicPotential.score * 100}%` }}
          />
        </div>
      </div>

      {/* Visual Elements */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Suggested Visual Elements</h3>
        <div className="grid grid-cols-2 gap-3">
          {analysis.cinematicPotential.visualElements.map((element, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <Eye className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{element}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emotional Beats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Emotional Journey</h3>
        <div className="space-y-4">
          {analysis.cinematicPotential.emotionalBeats.map((beat, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{beat.emotion}</span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-500">
                  {Math.round(beat.position * 100)}% through story
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-pink-500 rounded-full"
                  style={{ width: `${beat.intensity * 100}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{beat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Scenes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Suggested Scenes</h3>
        <div className="space-y-4">
          {analysis.cinematicPotential.suggestedScenes.map((scene, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">{scene.title}</h4>
                <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                  {scene.type}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{scene.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                <span>Style: {scene.visualStyle}</span>
                <span>Duration: {scene.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInterviews = () => (
    <div className="space-y-4">
      {analysis.interviewQuestions.map((question) => (
        <div key={question.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {question.category} Question
                </span>
                <span className={`
                  px-2 py-1 text-xs rounded-full
                  ${question.sensitivity === 'high' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : question.sensitivity === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }
                `}>
                  {question.sensitivity} sensitivity
                </span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                {question.question}
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-500 capitalize">
              {question.timing} interview
            </span>
          </div>
          
          {question.followUp.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Follow-up questions:</h4>
              <ul className="space-y-1">
                {question.followUp.map((followUp, index) => (
                  <li key={index} className="text-sm text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-slate-200 dark:border-slate-600">
                    {followUp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderConcerns = () => (
    <div className="space-y-4">
      {analysis.legalConcerns.length === 0 ? (
        <div className="text-center py-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-medium text-emerald-900 dark:text-emerald-100 mb-1">No Major Concerns</h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            No significant legal or privacy concerns detected in this document
          </p>
        </div>
      ) : (
        analysis.legalConcerns.map((concern) => (
          <div key={concern.id} className={`
            rounded-xl p-6 border
            ${concern.severity === 'high' 
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              : concern.severity === 'medium'
              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
              : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
            }
          `}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className={`
                w-5 h-5 mt-0.5
                ${concern.severity === 'high' 
                  ? 'text-red-600 dark:text-red-400'
                  : concern.severity === 'medium'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
                }
              `} />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className={`
                    font-semibold capitalize
                    ${concern.severity === 'high' 
                      ? 'text-red-900 dark:text-red-100'
                      : concern.severity === 'medium'
                      ? 'text-amber-900 dark:text-amber-100'
                      : 'text-blue-900 dark:text-blue-100'
                    }
                  `}>
                    {concern.type.replace('-', ' ')} Concern
                  </h3>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${concern.severity === 'high' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : concern.severity === 'medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }
                  `}>
                    {concern.severity} severity
                  </span>
                </div>
                <p className={`
                  text-sm mb-3
                  ${concern.severity === 'high' 
                    ? 'text-red-800 dark:text-red-200'
                    : concern.severity === 'medium'
                    ? 'text-amber-800 dark:text-amber-200'
                    : 'text-blue-800 dark:text-blue-200'
                  }
                `}>
                  {concern.description}
                </p>
                <div className={`
                  p-3 rounded-lg
                  ${concern.severity === 'high' 
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : concern.severity === 'medium'
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                  }
                `}>
                  <h4 className={`
                    text-xs font-medium mb-1
                    ${concern.severity === 'high' 
                      ? 'text-red-900 dark:text-red-100'
                      : concern.severity === 'medium'
                      ? 'text-amber-900 dark:text-amber-100'
                      : 'text-blue-900 dark:text-blue-100'
                    }
                  `}>
                    Recommendation:
                  </h4>
                  <p className={`
                    text-xs
                    ${concern.severity === 'high' 
                      ? 'text-red-800 dark:text-red-200'
                      : concern.severity === 'medium'
                      ? 'text-amber-800 dark:text-amber-200'
                      : 'text-blue-800 dark:text-blue-200'
                    }
                  `}>
                    {concern.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20'
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
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'themes' && renderThemes()}
        {activeTab === 'characters' && renderCharacters()}
        {activeTab === 'timeline' && <Timeline events={analysis.timeline} />}
        {activeTab === 'cinematic' && renderCinematic()}
        {activeTab === 'interviews' && renderInterviews()}
        {activeTab === 'concerns' && renderConcerns()}
      </div>
    </div>
  );
};