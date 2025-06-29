import React, { useState } from 'react';
import { Volume2, Mic, Music, Radio, Settings, Headphones } from 'lucide-react';
import { AudioDesign as AudioDesignType, Scene } from '../types';

interface AudioDesignProps {
  scene: Scene;
  onSceneUpdate: (scene: Scene) => void;
}

export const AudioDesign: React.FC<AudioDesignProps> = ({ scene, onSceneUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const updateAudio = (updates: Partial<AudioDesignType>) => {
    onSceneUpdate({
      ...scene,
      audio: { ...scene.audio, ...updates }
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Volume2 },
    { id: 'dialogue', label: 'Dialogue', icon: Mic },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'effects', label: 'Sound FX', icon: Radio },
    { id: 'ambience', label: 'Ambience', icon: Headphones }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Audio Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-3">
          <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Audio Design Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {scene.audio.dialogue.micType}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Primary Mic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {scene.audio.music.style}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Music Style</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {scene.audio.soundEffects.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Sound FX</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {scene.audio.ambience.environment}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Ambience</div>
          </div>
        </div>
      </div>

      {/* Audio Levels Visualization */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Audio Mix Levels
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dialogue</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-500">-6dB</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Music</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-500">-18dB</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sound Effects</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '60%' }} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-500">-12dB</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ambience</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-500">-24dB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Notes */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">
          Recording Notes
        </h3>
        <p className="text-amber-800 dark:text-amber-200">
          {scene.audio.recordingNotes}
        </p>
      </div>
    </div>
  );

  const renderDialogue = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Mic className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Dialogue Recording Setup</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Primary Microphone
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                {scene.audio.dialogue.micType.replace('-', ' ')}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {getMicDescription(scene.audio.dialogue.micType)}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Placement
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {scene.audio.dialogue.placement}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Features
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${scene.audio.dialogue.backup ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-sm text-slate-600 dark:text-slate-400">Backup Recording</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${scene.audio.dialogue.windProtection ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-sm text-slate-600 dark:text-slate-400">Wind Protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${scene.audio.dialogue.roomTone ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-sm text-slate-600 dark:text-slate-400">Room Tone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMusic = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Music Design</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Style & Mood
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {scene.audio.music.style}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {scene.audio.music.mood}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tempo & Volume
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                {scene.audio.music.tempo} tempo
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                {scene.audio.music.volume} volume
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Timing
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                {scene.audio.music.timing}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Suggested Instruments
          </label>
          <div className="flex flex-wrap gap-2">
            {scene.audio.music.instruments.map((instrument, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
              >
                {instrument}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEffects = () => (
    <div className="space-y-4">
      {scene.audio.soundEffects.map((effect) => (
        <div key={effect.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {effect.type}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {effect.description}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Timing
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {effect.timing}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Source
              </label>
              <div className="flex items-center space-x-2">
                <span className={`
                  px-2 py-1 text-xs rounded-full
                  ${effect.source === 'live' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    effect.source === 'foley' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  }
                `}>
                  {effect.source}
                </span>
                <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${effect.volume}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {scene.audio.soundEffects.length === 0 && (
        <div className="text-center py-8">
          <Radio className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No sound effects specified for this scene
          </p>
        </div>
      )}
    </div>
  );

  const renderAmbience = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Ambient Sound Design</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Environment
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {scene.audio.ambience.environment}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Volume Level
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${scene.audio.ambience.volume}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {scene.audio.ambience.volume}%
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Recording Method
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                {scene.audio.ambience.recordingMethod}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Ambient Characteristics
          </label>
          <div className="flex flex-wrap gap-2">
            {scene.audio.ambience.characteristics.map((characteristic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
              >
                {characteristic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getMicDescription = (micType: string): string => {
    const descriptions = {
      'boom': 'Directional microphone on boom pole for dialogue capture',
      'lavalier': 'Small clip-on microphone for hands-free recording',
      'handheld': 'Portable microphone for interviews and presentations',
      'wireless': 'Wireless microphone system for freedom of movement'
    };
    return descriptions[micType as keyof typeof descriptions] || 'Professional microphone';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Audio Design
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Comprehensive audio planning and recording specifications
          </p>
        </div>
      </div>

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
        {activeTab === 'dialogue' && renderDialogue()}
        {activeTab === 'music' && renderMusic()}
        {activeTab === 'effects' && renderEffects()}
        {activeTab === 'ambience' && renderAmbience()}
      </div>
    </div>
  );
};