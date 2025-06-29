import React, { useState } from 'react';
import { 
  Users, BarChart2, TrendingUp, Heart, 
  Zap, Download, Settings, Loader2, 
  Clock, AlertTriangle, Eye
} from 'lucide-react';
import { EmotionalJourney, AudienceEngagement } from '../types';
import { generateAudienceEngagement } from '../utils/emotionAnalyzer';
import { Chart } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

interface AudienceEngagementOptimizerProps {
  emotionalJourney: EmotionalJourney | null;
}

export const AudienceEngagementOptimizer: React.FC<AudienceEngagementOptimizerProps> = ({
  emotionalJourney
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [engagement, setEngagement] = useState<AudienceEngagement | null>(null);
  const [settings, setSettings] = useState({
    targetAudience: 'general',
    focusArea: 'emotional-impact',
    optimizationLevel: 'balanced'
  });

  const handleGenerate = async () => {
    if (!emotionalJourney) return;
    
    setIsGenerating(true);
    try {
      const audienceEngagement = await generateAudienceEngagement(emotionalJourney, settings);
      setEngagement(audienceEngagement);
    } catch (error) {
      console.error('Failed to generate audience engagement:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportEngagement = () => {
    if (!engagement) return;
    
    const data = JSON.stringify(engagement, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audience-engagement-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderAttentionMapChart = () => {
    if (!engagement) return null;
    
    const data = {
      labels: engagement.attentionMap.map((_, index) => 
        `${Math.round((index / (engagement.attentionMap.length - 1)) * 100)}%`
      ),
      datasets: [
        {
          label: 'Attention Level',
          data: engagement.attentionMap.map(point => point.attentionLevel * 100),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
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
            text: 'Attention Level (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Timeline Position'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const index = context.dataIndex;
              const point = engagement.attentionMap[index];
              return [
                `Attention: ${Math.round(point.attentionLevel * 100)}%`,
                `Reason: ${point.reason}`
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

  if (!emotionalJourney) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Emotional Journey Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Generate an emotional journey first to optimize audience engagement
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Audience Engagement Optimizer
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Optimize your documentary for maximum audience engagement
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {engagement && (
            <button
              onClick={exportEngagement}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            <span>{isGenerating ? 'Analyzing...' : 'Analyze Engagement'}</span>
          </button>
        </div>
      </div>

      {/* Optimization Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Optimization Settings
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Target Audience
            </label>
            <select
              value={settings.targetAudience}
              onChange={(e) => setSettings({...settings, targetAudience: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="general">General Documentary Audience</option>
              <option value="educational">Educational/Academic</option>
              <option value="cinephile">Film Enthusiasts</option>
              <option value="topic-specific">Topic-Specific Audience</option>
              <option value="younger">Younger Viewers (18-34)</option>
              <option value="older">Older Viewers (35+)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Focus Area
            </label>
            <select
              value={settings.focusArea}
              onChange={(e) => setSettings({...settings, focusArea: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="emotional-impact">Emotional Impact</option>
              <option value="narrative-clarity">Narrative Clarity</option>
              <option value="pacing-optimization">Pacing Optimization</option>
              <option value="retention">Audience Retention</option>
              <option value="memorability">Memorability</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Optimization Level
            </label>
            <select
              value={settings.optimizationLevel}
              onChange={(e) => setSettings({...settings, optimizationLevel: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="subtle">Subtle (Minor Adjustments)</option>
              <option value="balanced">Balanced (Moderate Changes)</option>
              <option value="aggressive">Aggressive (Major Restructuring)</option>
              <option value="artistic">Artistic Integrity (Suggestions Only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Engagement Analysis */}
      {engagement ? (
        <div className="space-y-6">
          {/* Attention Map */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Audience Attention Map
              </h3>
            </div>
            
            {renderAttentionMapChart()}
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Opening Engagement
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  {engagement.attentionMap[0].attentionLevel > 0.7 
                    ? 'Strong opening hook captures immediate attention' 
                    : 'Consider strengthening your opening to grab attention faster'}
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Middle Retention
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  {engagement.attentionMap.filter((p, i) => i > engagement.attentionMap.length * 0.3 && i < engagement.attentionMap.length * 0.7).some(p => p.attentionLevel < 0.5)
                    ? 'Potential audience drop-off detected in middle sections' 
                    : 'Good audience retention throughout middle sections'}
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Closing Impact
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  {engagement.attentionMap[engagement.attentionMap.length - 1].attentionLevel > 0.7 
                    ? 'Strong closing leaves lasting impression' 
                    : 'Consider strengthening conclusion for better memorability'}
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Points */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Key Engagement Points
              </h3>
            </div>
            
            <div className="space-y-4">
              {engagement.engagementPoints.map((point, index) => (
                <div key={index} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${point.type === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          point.type === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }
                      `}>
                        {point.type} engagement
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {Math.round(point.position * 100)}% through
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                    <strong>Reason:</strong> {point.reason}
                  </p>
                  
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Suggestion:</strong> {point.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Resonance */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Emotional Resonance Analysis
              </h3>
            </div>
            
            <div className="space-y-4">
              {engagement.emotionalResonance.map((item, index) => (
                <div key={index} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getEmotionColor(item.emotion) }}
                      />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {item.emotion}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {Math.round(item.position * 100)}% through
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Resonance Level</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ width: `${item.resonanceLevel * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {Math.round(item.resonanceLevel * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Audience Segment</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {item.audienceSegment}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Optimization Suggestions
              </h3>
            </div>
            
            <div className="space-y-4">
              {engagement.optimizationSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {suggestion.issue}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {Math.round(suggestion.position * 100)}% through
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                    <strong>Suggestion:</strong> {suggestion.suggestion}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 dark:text-slate-500">Expected Impact:</span>
                    <div className="w-20 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${suggestion.expectedImpact * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {Math.round(suggestion.expectedImpact * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          {isGenerating ? (
            <div className="animate-pulse flex flex-col items-center">
              <Users className="w-16 h-16 text-blue-300 dark:text-blue-800 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                Analyzing Audience Engagement...
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Identifying engagement points, emotional resonance, and optimization opportunities
              </p>
            </div>
          ) : (
            <>
              <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Engagement Analysis Yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Analyze your emotional journey to identify audience engagement opportunities
              </p>
              <button
                onClick={handleGenerate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
              >
                <Users className="w-4 h-4" />
                <span>Analyze Engagement</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Audience Engagement Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Start with a strong emotional hook in the first 2-3 minutes</li>
          <li>• Create emotional variety to maintain engagement throughout</li>
          <li>• Place your most powerful emotional moments at 70-80% through your documentary</li>
          <li>• Use music and sound design to enhance emotional impact</li>
          <li>• Consider pacing - allow breathing room after intense emotional moments</li>
          <li>• End with emotional resolution that provides closure</li>
          <li>• Test your documentary with sample audiences to validate emotional impact</li>
        </ul>
      </div>
    </div>
  );
};

// For TypeScript
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