import React, { useState } from 'react';
import { 
  Heart, Wand2, Loader2, Download, 
  Share2, Settings, TrendingUp, 
  Clock, Zap, AlertTriangle
} from 'lucide-react';
import { Document, DocumentAnalysis, EmotionalJourney } from '../types';
import { generateEmotionalJourney } from '../utils/emotionAnalyzer';
import { Chart } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

interface EmotionalJourneyMapperProps {
  document: Document;
  analysis: DocumentAnalysis;
  onJourneyGenerated: (journey: EmotionalJourney) => void;
}

export const EmotionalJourneyMapper: React.FC<EmotionalJourneyMapperProps> = ({
  document,
  analysis,
  onJourneyGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [emotionalJourney, setEmotionalJourney] = useState<EmotionalJourney | null>(null);
  const [settings, setSettings] = useState({
    includeAudioSuggestions: true,
    includeAccessibilityNotes: true,
    detailedAnalysis: true
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const journey = await generateEmotionalJourney(analysis);
      setEmotionalJourney(journey);
      onJourneyGenerated(journey);
    } catch (error) {
      console.error('Failed to generate emotional journey:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportJourney = () => {
    if (!emotionalJourney) return;
    
    const journeyData = JSON.stringify(emotionalJourney, null, 2);
    const blob = new Blob([journeyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotional-journey-${document.name.replace(/\.[^/.]+$/, '')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareJourney = async () => {
    if (!emotionalJourney) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emotional Journey Analysis',
          text: `Emotional journey analysis for ${document.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('URL copied to clipboard!');
    }
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

  const renderEmotionalJourneyChart = () => {
    if (!emotionalJourney) return null;
    
    const beats = emotionalJourney.beats;
    
    const data = {
      labels: beats.map((_, index) => 
        `${Math.round((index / (beats.length - 1)) * 100)}%`
      ),
      datasets: [
        {
          label: 'Emotional Intensity',
          data: beats.map(beat => beat.intensity * 100),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: beats.map(beat => getEmotionColor(beat.emotion)),
          pointBorderColor: '#fff',
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
    
    const options = {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Emotional Intensity (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Document Position'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const index = context.dataIndex;
              const beat = beats[index];
              return [
                `Emotion: ${beat.emotion}`,
                `Intensity: ${Math.round(beat.intensity * 100)}%`,
                `Description: ${beat.description}`
              ];
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
    
    return (
      <div className="h-80">
        <Line data={data} options={options as any} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Emotional Journey Mapper
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Visualize and analyze the emotional arc of your documentary
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {emotionalJourney && (
            <>
              <button
                onClick={exportJourney}
                className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={shareJourney}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            <Heart className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Journey'}</span>
          </button>
        </div>
      </div>

      {/* Generator Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Generator Settings
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeAudioSuggestions"
              checked={settings.includeAudioSuggestions}
              onChange={(e) => setSettings({...settings, includeAudioSuggestions: e.target.checked})}
              className="rounded border-slate-300 dark:border-slate-600 text-purple-600"
            />
            <label htmlFor="includeAudioSuggestions" className="text-sm text-slate-700 dark:text-slate-300">
              Include Audio Suggestions
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeAccessibilityNotes"
              checked={settings.includeAccessibilityNotes}
              onChange={(e) => setSettings({...settings, includeAccessibilityNotes: e.target.checked})}
              className="rounded border-slate-300 dark:border-slate-600 text-purple-600"
            />
            <label htmlFor="includeAccessibilityNotes" className="text-sm text-slate-700 dark:text-slate-300">
              Include Accessibility Notes
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="detailedAnalysis"
              checked={settings.detailedAnalysis}
              onChange={(e) => setSettings({...settings, detailedAnalysis: e.target.checked})}
              className="rounded border-slate-300 dark:border-slate-600 text-purple-600"
            />
            <label htmlFor="detailedAnalysis" className="text-sm text-slate-700 dark:text-slate-300">
              Detailed Analysis
            </label>
          </div>
        </div>
      </div>

      {/* Document Analysis Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Document Analysis Summary
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {analysis.emotionalBeats.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Emotional Beats</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analysis.characters.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Characters</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {analysis.themes.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Themes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {analysis.sensitiveTopics.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Sensitive Topics</div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Emotional Beats */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Primary Emotions
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.emotionalBeats
                .reduce((acc, beat) => {
                  const existing = acc.find(e => e.emotion === beat.emotion);
                  if (existing) {
                    existing.count++;
                    existing.totalIntensity += beat.intensity;
                  } else {
                    acc.push({ 
                      emotion: beat.emotion, 
                      count: 1, 
                      totalIntensity: beat.intensity 
                    });
                  }
                  return acc;
                }, [] as { emotion: string; count: number; totalIntensity: number }[])
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(emotion => (
                  <div 
                    key={emotion.emotion}
                    className="flex items-center space-x-1 px-3 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${getEmotionColor(emotion.emotion)}20`,
                      color: getEmotionColor(emotion.emotion)
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: getEmotionColor(emotion.emotion) }}
                    />
                    <span>{emotion.emotion}</span>
                    <span className="text-xs opacity-70">
                      ({emotion.count})
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
          
          {/* Sensitive Topics */}
          {analysis.sensitiveTopics.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="font-medium text-amber-900 dark:text-amber-100">
                  Sensitive Topics Detected
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.sensitiveTopics.map(topic => (
                  <span 
                    key={topic.id}
                    className={`
                      px-2 py-1 text-xs rounded-full
                      ${topic.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        topic.severity === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }
                    `}
                  >
                    {topic.topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emotional Journey Visualization */}
      {isGenerating ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Generating Emotional Journey
            </h3>
          </div>
          
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Analyzing emotional patterns and creating visualization
            </p>
            <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-purple-500 animate-pulse rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ) : emotionalJourney ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Heart className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Emotional Journey
            </h3>
          </div>
          
          {/* Emotional Arc Chart */}
          {renderEmotionalJourneyChart()}
          
          {/* Journey Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-3">
                Emotional Arc
              </h4>
              <div className="text-sm text-purple-800 dark:text-purple-200">
                <div className="font-medium mb-1 capitalize">
                  {emotionalJourney.overallArc.replace('-', ' ')} Arc
                </div>
                <p>
                  This documentary follows a {emotionalJourney.overallArc.replace('-', ' ')} emotional pattern, 
                  with {emotionalJourney.peaks.length} major emotional peak{emotionalJourney.peaks.length !== 1 ? 's' : ''} 
                  and {emotionalJourney.valleys.length} emotional valley{emotionalJourney.valleys.length !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                Audience Impact
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-blue-800 dark:text-blue-200">Engagement</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {Math.round(emotionalJourney.audienceImpact.engagement * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${emotionalJourney.audienceImpact.engagement * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-blue-800 dark:text-blue-200">Memorability</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {Math.round(emotionalJourney.audienceImpact.memorability * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${emotionalJourney.audienceImpact.memorability * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-blue-800 dark:text-blue-200">Emotional Resonance</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {Math.round(emotionalJourney.audienceImpact.emotionalResonance * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${emotionalJourney.audienceImpact.emotionalResonance * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-3">
                Key Moments
              </h4>
              <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                {emotionalJourney.peaks.slice(0, 2).map((peak, index) => (
                  <div key={index}>
                    <div className="font-medium">
                      Peak: {peak.emotion} ({Math.round(peak.position * 100)}%)
                    </div>
                    <p className="text-xs">{peak.description}</p>
                  </div>
                ))}
                
                {emotionalJourney.valleys.slice(0, 1).map((valley, index) => (
                  <div key={index}>
                    <div className="font-medium">
                      Valley: {valley.emotion} ({Math.round(valley.position * 100)}%)
                    </div>
                    <p className="text-xs">{valley.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Music Suggestions */}
          {settings.includeAudioSuggestions && emotionalJourney.musicSuggestions.length > 0 && (
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-medium text-indigo-900 dark:text-indigo-100">
                  Music Suggestions
                </h4>
              </div>
              
              <div className="space-y-3">
                {emotionalJourney.musicSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-indigo-900 dark:text-indigo-100">
                        {suggestion.style} ({Math.round(suggestion.position * 100)}% mark)
                      </div>
                      <div className="text-sm text-indigo-700 dark:text-indigo-300">
                        {suggestion.purpose}
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        Examples: {suggestion.examples.slice(0, 1).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Accessibility Notes */}
          {settings.includeAccessibilityNotes && emotionalJourney.accessibilityNotes.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Accessibility Considerations
                </h4>
              </div>
              
              <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                {emotionalJourney.accessibilityNotes.map((note, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span>•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Heart className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Emotional Journey Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Generate an emotional journey to visualize the emotional arc of your documentary
          </p>
          <button
            onClick={handleGenerate}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 mx-auto"
          >
            <Heart className="w-4 h-4" />
            <span>Generate Journey</span>
          </button>
        </div>
      )}

      {/* Emotional Journey Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Emotional Arc Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Start with a strong emotional hook to engage viewers immediately</li>
          <li>• Create emotional contrast throughout your documentary for dynamic pacing</li>
          <li>• Place your most powerful emotional moment at 70-80% through your documentary</li>
          <li>• Allow breathing room after intense emotional moments</li>
          <li>• End with emotional resolution that provides closure</li>
          <li>• Use music and sound design to enhance emotional impact</li>
          <li>• Consider emotional accessibility for all viewers</li>
        </ul>
      </div>
    </div>
  );
};