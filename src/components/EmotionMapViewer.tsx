import React, { useState } from 'react';
import { 
  Heart, Users, Music, Clock, 
  Download, Share2, Eye, Settings, 
  Zap, AlertTriangle, BarChart2
} from 'lucide-react';
import { EmotionMap } from '../types';
import { Chart } from 'chart.js/auto';
import { Line, Radar } from 'react-chartjs-2';

interface EmotionMapViewerProps {
  emotionMap: EmotionMap;
}

export const EmotionMapViewer: React.FC<EmotionMapViewerProps> = ({
  emotionMap
}) => {
  const [activeTab, setActiveTab] = useState('emotions');
  const [selectedPersona, setSelectedPersona] = useState<number>(0);

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

  const exportEmotionMap = () => {
    const mapData = JSON.stringify(emotionMap, null, 2);
    const blob = new Blob([mapData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion-map-${emotionMap.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareEmotionMap = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: emotionMap.title,
          text: emotionMap.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Emotion map URL copied to clipboard!');
    }
  };

  const renderEmotionalJourneyChart = () => {
    const segments = emotionMap.emotionalJourney.segments;
    
    const data = {
      labels: segments.map((_, index) => 
        `${Math.round((index / (segments.length - 1)) * 100)}%`
      ),
      datasets: [
        {
          label: 'Emotional Intensity',
          data: segments.map(segment => segment.intensity * 100),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: segments.map(segment => getEmotionColor(segment.dominantEmotion)),
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
            text: 'Timeline Position'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const index = context.dataIndex;
              const segment = segments[index];
              return [
                `Emotion: ${segment.dominantEmotion}`,
                `Intensity: ${Math.round(segment.intensity * 100)}%`,
                `Description: ${segment.description}`
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

  const renderEmotionRadarChart = () => {
    const emotions = emotionMap.primaryEmotions;
    
    const data = {
      labels: emotions.map(e => e.emotion),
      datasets: [
        {
          label: 'Emotional Intensity',
          data: emotions.map(e => e.intensity * 100),
          backgroundColor: 'rgba(147, 51, 234, 0.2)',
          borderColor: 'rgba(147, 51, 234, 1)',
          pointBackgroundColor: emotions.map(e => getEmotionColor(e.emotion)),
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(147, 51, 234, 1)'
        }
      ]
    };
    
    const options = {
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            display: false
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
    
    return (
      <div className="h-80">
        <Radar data={data} options={options as any} />
      </div>
    );
  };

  const tabs = [
    { id: 'emotions', label: 'Emotions', icon: Heart },
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'accessibility', label: 'Accessibility', icon: AlertTriangle }
  ];

  const renderEmotionsTab = () => (
    <div className="space-y-6">
      {/* Primary Emotions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Primary Emotions
          </h3>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {emotionMap.primaryEmotions.length} emotions detected
          </div>
        </div>
        
        {renderEmotionRadarChart()}
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {emotionMap.primaryEmotions.map((emotion, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg"
              style={{ backgroundColor: `${getEmotionColor(emotion.emotion)}20` }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: getEmotionColor(emotion.emotion) }}
                />
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {emotion.emotion}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {Math.round(emotion.intensity * 100)}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Triggers</div>
                  <div className="flex flex-wrap gap-1">
                    {emotion.triggers.map((trigger, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Visual Cues</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {emotion.visualCues.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJourneyTab = () => (
    <div className="space-y-6">
      {/* Emotional Journey */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Emotional Journey
        </h3>
        
        {renderEmotionalJourneyChart()}
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Emotional Transitions
          </h4>
          
          <div className="space-y-3">
            {emotionMap.emotionalJourney.transitions.map((transition, index) => (
              <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getEmotionColor(transition.fromEmotion) }}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {transition.fromEmotion}
                    </span>
                    <Zap className="w-3 h-3 text-slate-400" />
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getEmotionColor(transition.toEmotion) }}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {transition.toEmotion}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {Math.round(transition.position * 100)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Technique: {transition.technique}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Smoothness: {Math.round(transition.smoothness * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pacing Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Emotional Pacing
          </h3>
        </div>
        
        <div className="relative h-16 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden mb-4">
          {emotionMap.emotionalJourney.segments.map((segment, index) => {
            const width = (segment.endTime - segment.startTime) * 100;
            const left = segment.startTime * 100;
            
            return (
              <div 
                key={index}
                className="absolute h-full"
                style={{ 
                  left: `${left}%`, 
                  width: `${width}%`,
                  backgroundColor: getEmotionColor(segment.dominantEmotion),
                  opacity: segment.intensity * 0.7 + 0.3
                }}
                title={`${segment.dominantEmotion}: ${Math.round(segment.intensity * 100)}%`}
              />
            );
          })}
          
          {/* Segment labels */}
          {emotionMap.emotionalJourney.segments.map((segment, index) => {
            const position = (segment.startTime + (segment.endTime - segment.startTime) / 2) * 100;
            
            return (
              <div 
                key={`label-${index}`}
                className="absolute top-1 text-xs text-white font-bold"
                style={{ 
                  left: `${position}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emotionMap.emotionalJourney.segments.map((segment, index) => (
            <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 flex items-center justify-center bg-slate-200 dark:bg-slate-600 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {segment.dominantEmotion}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  {Math.round(segment.startTime * 100)}% - {Math.round(segment.endTime * 100)}%
                </span>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {segment.description}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-500">
                  Intensity: {Math.round(segment.intensity * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAudienceTab = () => (
    <div className="space-y-6">
      {/* Audience Personas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Audience Personas
          </h3>
          <div className="flex space-x-1">
            {emotionMap.audiencePersonas.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedPersona(index)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  selectedPersona === index
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        
        {emotionMap.audiencePersonas[selectedPersona] && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {emotionMap.audiencePersonas[selectedPersona].name.charAt(0)}
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {emotionMap.audiencePersonas[selectedPersona].name}
                </h4>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {emotionMap.audiencePersonas[selectedPersona].demographics}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Emotional Response
              </h4>
              <div className="space-y-2">
                {emotionMap.audiencePersonas[selectedPersona].emotionalResponse.map((response, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getEmotionColor(response.emotion) }}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {response.emotion}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ width: `${response.intensity * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {Math.round(response.intensity * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Engagement Points
              </h4>
              <div className="relative h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                {emotionMap.audiencePersonas[selectedPersona].engagementPoints.map((point, index) => (
                  <div 
                    key={index}
                    className="absolute top-0 bottom-0 w-1 bg-purple-500"
                    style={{ left: `${point}%` }}
                    title={`Engagement at ${point}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-500 mt-1">
                <span>Beginning</span>
                <span>Middle</span>
                <span>End</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Accessibility Considerations
              </h4>
              <ul className="space-y-1">
                {emotionMap.audiencePersonas[selectedPersona].accessibilityConsiderations.map((consideration, index) => (
                  <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                    • {consideration}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Empathy Map */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Audience Empathy Map
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">
              Thinking
            </h4>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li>• "What happened to lead to this situation?"</li>
              <li>• "How would I react in this circumstance?"</li>
              <li>• "I wonder what happens next in their story"</li>
              <li>• "This reminds me of my own experiences"</li>
              <li>• "I'm curious about the historical context"</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
              Feeling
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Empathy for subjects' challenges</li>
              <li>• Emotional connection to key characters</li>
              <li>• Concern about negative outcomes</li>
              <li>• Hope for positive resolution</li>
              <li>• Inspiration from resilience stories</li>
            </ul>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-3">
              Seeing & Hearing
            </h4>
            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <li>• Authentic emotional expressions</li>
              <li>• Visual storytelling that reinforces themes</li>
              <li>• Music that enhances emotional moments</li>
              <li>• Environmental context that grounds the story</li>
              <li>• Facial expressions and body language</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-3">
              Doing & Saying
            </h4>
            <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
              <li>• Discussing the documentary with others</li>
              <li>• Sharing emotional moments on social media</li>
              <li>• Researching related topics</li>
              <li>• Recommending to friends with similar interests</li>
              <li>• Reflecting on personal connections to the content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMusicTab = () => (
    <div className="space-y-6">
      {/* Music Suggestions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Music className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Music Suggestions by Emotional Segment
          </h3>
        </div>
        
        <div className="space-y-4">
          {emotionMap.emotionalJourney.segments.map((segment, index) => (
            <div key={index} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-indigo-100 dark:bg-indigo-800 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {segment.dominantEmotion} Segment
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  {Math.round(segment.startTime * 100)}% - {Math.round(segment.endTime * 100)}%
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Recommended Style</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {segment.dominantEmotion === 'joy' ? 'Upbeat, major key compositions' :
                     segment.dominantEmotion === 'sadness' ? 'Slow tempo, minor key pieces' :
                     segment.dominantEmotion === 'fear' ? 'Tense, dissonant arrangements' :
                     segment.dominantEmotion === 'anger' ? 'Driving, percussive tracks' :
                     segment.dominantEmotion === 'surprise' ? 'Dynamic, unexpected elements' :
                     'Balanced, neutral compositions'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Suggested Instruments</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {segment.dominantEmotion === 'joy' ? 'Piano, strings, light percussion' :
                     segment.dominantEmotion === 'sadness' ? 'Cello, piano, ambient pads' :
                     segment.dominantEmotion === 'fear' ? 'Synthesizers, strings, percussion' :
                     segment.dominantEmotion === 'anger' ? 'Drums, electric guitar, bass' :
                     segment.dominantEmotion === 'surprise' ? 'Full orchestra, electronic elements' :
                     'Piano, strings, subtle percussion'}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Example Tracks</div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">
                  {segment.dominantEmotion === 'joy' ? '"Arrival of the Birds" by The Cinematic Orchestra, "Married Life" from Up' :
                   segment.dominantEmotion === 'sadness' ? '"On the Nature of Daylight" by Max Richter, "Adagio for Strings" by Samuel Barber' :
                   segment.dominantEmotion === 'fear' ? '"Requiem for a Dream" by Clint Mansell, "The Beast" from Sicario' :
                   segment.dominantEmotion === 'anger' ? '"Mind Heist" by Zack Hemsey, "Burn It Down" from Tenet' :
                   segment.dominantEmotion === 'surprise' ? '"Time" by Hans Zimmer, "Journey to the Line" by Hans Zimmer' :
                   '"Experience" by Ludovico Einaudi, "The Cinematic Orchestra - Arrival of the Birds"'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sound Design Suggestions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Sound Design Recommendations
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
              Ambient Sound Design
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              Use ambient sounds that reinforce the emotional context of each segment. Subtle environmental sounds can significantly enhance emotional impact.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <strong>For joy/hope:</strong> Light natural ambience, gentle wind, distant birds, soft water sounds
              </div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <strong>For sadness:</strong> Distant echoes, soft rain, minimal ambient texture, subtle wind
              </div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <strong>For tension/fear:</strong> Low frequency rumble, distant mechanical sounds, sparse environment
              </div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <strong>For reflection:</strong> Soft room tone, gentle environmental sounds, subtle resonance
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
              Transition Sound Design
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              Sound design for emotional transitions should guide the audience through emotional shifts.
            </p>
            <div className="space-y-2">
              {emotionMap.emotionalJourney.transitions.map((transition, index) => (
                <div key={index} className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>From {transition.fromEmotion} to {transition.toEmotion}:</strong> {
                    transition.smoothness > 0.7 
                      ? 'Gradual crossfade with bridging elements' 
                      : transition.smoothness > 0.4 
                      ? 'Moderate transition with subtle shift in tone' 
                      : 'Distinct change with clear auditory marker'
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="space-y-6">
      {/* Emotional Accessibility */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Emotional Accessibility Considerations
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
              Content Warnings
            </h4>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              Based on emotional intensity analysis, consider providing content warnings for:
            </p>
            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
              {emotionMap.emotionalJourney.segments
                .filter(segment => segment.intensity > 0.7 && ['fear', 'anger', 'sadness', 'disgust'].includes(segment.dominantEmotion.toLowerCase()))
                .map((segment, index) => (
                  <li key={index}>• Intense {segment.dominantEmotion.toLowerCase()} content at {Math.round(segment.startTime * 100)}% mark</li>
                ))}
              <li>• Provide specific content warnings for any potentially triggering material</li>
              <li>• Consider age-appropriate ratings based on emotional intensity</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Pacing Considerations
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Emotional pacing affects cognitive processing and accessibility:
            </p>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• Allow sufficient processing time after emotionally intense segments</li>
              <li>• Provide clear narrative signposting during emotional transitions</li>
              <li>• Consider the cognitive load of processing complex emotional content</li>
              <li>• Avoid rapid emotional shifts that may be disorienting</li>
              <li>• Include moments of emotional respite between intense segments</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Sensory Considerations
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200 mb-3">
              Emotional content often involves sensory elements that require accessibility consideration:
            </p>
            <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
              <li>• Ensure audio descriptions convey emotional context for visually impaired viewers</li>
              <li>• Provide captions that indicate emotional tone for hearing impaired viewers</li>
              <li>• Avoid rapid visual changes during emotionally intense moments</li>
              <li>• Consider sensory sensitivities when using sound design for emotional impact</li>
              <li>• Ensure visual emotional cues are reinforced with auditory elements</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              Cultural Considerations
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
              Emotional expression and reception vary across cultures:
            </p>
            <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <li>• Be aware of cultural differences in emotional expression and interpretation</li>
              <li>• Consider providing cultural context for emotional reactions</li>
              <li>• Avoid assuming universal emotional responses to content</li>
              <li>• Respect cultural sensitivities around emotional topics</li>
              <li>• Consider translation of emotional nuance for international audiences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {emotionMap.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {emotionMap.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportEmotionMap}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={shareEmotionMap}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Emotion Overview */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {emotionMap.primaryEmotions.length}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Primary Emotions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {emotionMap.emotionalJourney.segments.length}
            </div>
            <div className="text-sm text-pink-700 dark:text-pink-300">Emotional Segments</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {emotionMap.emotionalJourney.transitions.length}
            </div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300">Emotional Transitions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {emotionMap.audiencePersonas.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Audience Personas</div>
          </div>
        </div>
      </div>

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
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
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
        {activeTab === 'emotions' && renderEmotionsTab()}
        {activeTab === 'journey' && renderJourneyTab()}
        {activeTab === 'audience' && renderAudienceTab()}
        {activeTab === 'music' && renderMusicTab()}
        {activeTab === 'accessibility' && renderAccessibilityTab()}
      </div>
    </div>
  );
};

// For TypeScript
const TrendingUp = ({ className }: { className?: string }) => (
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
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
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