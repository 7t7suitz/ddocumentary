import React, { useState } from 'react';
import { 
  Heart, FileText, Upload, 
  Download, Share2, Settings, 
  Loader2, Zap, Music, Users, 
  AlertTriangle, Eye
} from 'lucide-react';
import { Document, DocumentAnalysis, EmotionalJourney, EmotionMap, MusicSuggestion, SoundDesignSuggestion } from '../types';
import { EmotionalJourneyMapper } from './EmotionalJourneyMapper';
import { EmotionMapGenerator } from './EmotionMapGenerator';
import { EmotionMapViewer } from './EmotionMapViewer';
import { MusicSuggestionGenerator } from './MusicSuggestionGenerator';
import { AudienceEngagementOptimizer } from './AudienceEngagementOptimizer';
import { AccessibilityConsiderations } from './AccessibilityConsiderations';

interface EmotionalArcDashboardProps {
  document: Document | null;
  analysis: DocumentAnalysis | null;
}

export const EmotionalArcDashboard: React.FC<EmotionalArcDashboardProps> = ({
  document,
  analysis
}) => {
  const [activeTab, setActiveTab] = useState('journey');
  const [emotionalJourney, setEmotionalJourney] = useState<EmotionalJourney | null>(null);
  const [emotionMap, setEmotionMap] = useState<EmotionMap | null>(null);
  const [musicSuggestions, setMusicSuggestions] = useState<MusicSuggestion[]>([]);
  const [soundDesignSuggestions, setSoundDesignSuggestions] = useState<SoundDesignSuggestion[]>([]);

  const handleJourneyGenerated = (journey: EmotionalJourney) => {
    setEmotionalJourney(journey);
  };

  const handleEmotionMapGenerated = (map: EmotionMap) => {
    setEmotionMap(map);
    setActiveTab('map');
  };

  const handleMusicSuggestionsGenerated = (
    music: MusicSuggestion[], 
    soundDesign: SoundDesignSuggestion[]
  ) => {
    setMusicSuggestions(music);
    setSoundDesignSuggestions(soundDesign);
  };

  const tabs = [
    { id: 'journey', label: 'Emotional Journey', icon: Heart },
    { id: 'map', label: 'Emotion Map', icon: Zap, disabled: !emotionMap },
    { id: 'music', label: 'Music & Sound', icon: Music, disabled: !emotionalJourney },
    { id: 'audience', label: 'Audience Engagement', icon: Users, disabled: !emotionalJourney },
    { id: 'accessibility', label: 'Accessibility', icon: AlertTriangle, disabled: !emotionalJourney }
  ];

  if (!document || !analysis) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Document Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Upload and analyze a document to generate emotional arc visualizations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Emotional Arc Analysis
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Analyze and visualize the emotional journey of your documentary
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {emotionalJourney && (
            <button
              onClick={() => {}}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
          
          {emotionalJourney && (
            <button
              onClick={() => {}}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Document Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">
              {document.name}
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {document.content.length} characters • {analysis.emotionalBeats.length} emotional beats
            </div>
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
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    : tab.disabled
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
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
        {activeTab === 'journey' && (
          <EmotionalJourneyMapper 
            document={document} 
            analysis={analysis} 
            onJourneyGenerated={handleJourneyGenerated}
          />
        )}
        
        {activeTab === 'map' && emotionMap && (
          <EmotionMapViewer emotionMap={emotionMap} />
        )}
        
        {activeTab === 'map' && !emotionMap && (
          <EmotionMapGenerator 
            analysis={analysis} 
            onMapGenerated={handleEmotionMapGenerated} 
          />
        )}
        
        {activeTab === 'music' && (
          <MusicSuggestionGenerator 
            emotionalJourney={emotionalJourney} 
            onSuggestionsGenerated={handleMusicSuggestionsGenerated} 
          />
        )}
        
        {activeTab === 'audience' && (
          <AudienceEngagementOptimizer 
            emotionalJourney={emotionalJourney} 
          />
        )}
        
        {activeTab === 'accessibility' && (
          <AccessibilityConsiderations 
            emotionalJourney={emotionalJourney} 
          />
        )}
      </div>
    </div>
  );
};