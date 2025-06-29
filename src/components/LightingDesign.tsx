import React, { useState } from 'react';
import { Lightbulb, Sun, Palette, Settings, Zap, Eye } from 'lucide-react';
import { LightingSetup, Scene } from '../types';

interface LightingDesignProps {
  scene: Scene;
  onSceneUpdate: (scene: Scene) => void;
}

export const LightingDesign: React.FC<LightingDesignProps> = ({ scene, onSceneUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const updateLighting = (updates: Partial<LightingSetup>) => {
    onSceneUpdate({
      ...scene,
      lighting: { ...scene.lighting, ...updates }
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'setup', label: 'Setup', icon: Lightbulb },
    { id: 'modifiers', label: 'Modifiers', icon: Settings },
    { id: 'practical', label: 'Practical', icon: Zap }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Lighting Style */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center space-x-2 mb-3">
          <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">
            Lighting Style: {scene.lighting.style.replace('-', ' ').toUpperCase()}
          </h3>
        </div>
        <p className="text-amber-800 dark:text-amber-200 mb-4">
          {getLightingStyleDescription(scene.lighting.style)}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {scene.lighting.colorTemperature}K
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">Color Temp</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {scene.lighting.mood}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">Mood</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {scene.lighting.timeOfDay}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {scene.lighting.weather}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">Weather</div>
          </div>
        </div>
      </div>

      {/* Lighting Diagram */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Lighting Diagram
        </h3>
        <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
          <svg className="w-full h-full">
            {/* Subject */}
            <circle cx="50%" cy="60%" r="20" fill="#4A90E2" opacity="0.8" />
            <text x="50%" y="60%" textAnchor="middle" dy="5" className="text-xs fill-white font-medium">
              Subject
            </text>
            
            {/* Key Light */}
            <line 
              x1={`${50 + scene.lighting.keyLight.position.x}%`} 
              y1={`${60 + scene.lighting.keyLight.position.y}%`}
              x2="50%" 
              y2="60%" 
              stroke="#F59E0B" 
              strokeWidth="3"
              opacity="0.8"
            />
            <circle 
              cx={`${50 + scene.lighting.keyLight.position.x}%`} 
              cy={`${60 + scene.lighting.keyLight.position.y}%`} 
              r="8" 
              fill="#F59E0B"
            />
            <text 
              x={`${50 + scene.lighting.keyLight.position.x}%`} 
              y={`${60 + scene.lighting.keyLight.position.y - 15}%`} 
              textAnchor="middle" 
              className="text-xs fill-slate-600 dark:fill-slate-300 font-medium"
            >
              Key
            </text>
            
            {/* Fill Light */}
            <line 
              x1={`${50 + scene.lighting.fillLight.position.x}%`} 
              y1={`${60 + scene.lighting.fillLight.position.y}%`}
              x2="50%" 
              y2="60%" 
              stroke="#10B981" 
              strokeWidth="2"
              opacity="0.6"
            />
            <circle 
              cx={`${50 + scene.lighting.fillLight.position.x}%`} 
              cy={`${60 + scene.lighting.fillLight.position.y}%`} 
              r="6" 
              fill="#10B981"
            />
            <text 
              x={`${50 + scene.lighting.fillLight.position.x}%`} 
              y={`${60 + scene.lighting.fillLight.position.y - 12}%`} 
              textAnchor="middle" 
              className="text-xs fill-slate-600 dark:fill-slate-300 font-medium"
            >
              Fill
            </text>
            
            {/* Back Light */}
            <line 
              x1={`${50 + scene.lighting.backLight.position.x}%`} 
              y1={`${60 + scene.lighting.backLight.position.y}%`}
              x2="50%" 
              y2="60%" 
              stroke="#8B5CF6" 
              strokeWidth="2"
              opacity="0.6"
            />
            <circle 
              cx={`${50 + scene.lighting.backLight.position.x}%`} 
              cy={`${60 + scene.lighting.backLight.position.y}%`} 
              r="6" 
              fill="#8B5CF6"
            />
            <text 
              x={`${50 + scene.lighting.backLight.position.x}%`} 
              y={`${60 + scene.lighting.backLight.position.y - 12}%`} 
              textAnchor="middle" 
              className="text-xs fill-slate-600 dark:fill-slate-300 font-medium"
            >
              Back
            </text>
            
            {/* Camera */}
            <rect x="45%" y="85%" width="10%" height="8%" fill="#374151" rx="2" />
            <text x="50%" y="92%" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-300 font-medium">
              Camera
            </text>
          </svg>
        </div>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="space-y-6">
      {/* Key Light */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Key Light</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Equipment
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.keyLight.equipment}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Intensity
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.keyLight.intensity}%
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Diffusion
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.keyLight.diffusion}%
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Angle
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.keyLight.angle}°
            </div>
          </div>
        </div>
      </div>

      {/* Fill Light */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Fill Light</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Equipment
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.fillLight.equipment}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Intensity
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.fillLight.intensity}%
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Diffusion
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.fillLight.diffusion}%
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Angle
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.fillLight.angle}°
            </div>
          </div>
        </div>
      </div>

      {/* Back Light */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Back Light</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Equipment
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.backLight.equipment}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Intensity
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.backLight.intensity}%
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Diffusion
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.backLight.diffusion}%
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Angle
            </label>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {scene.lighting.backLight.angle}°
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModifiers = () => (
    <div className="space-y-4">
      {scene.lighting.modifiers.map((modifier, index) => (
        <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                {modifier.type.replace('-', ' ')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Size
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {modifier.size}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Position
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {modifier.position}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purpose
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {modifier.purpose}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {scene.lighting.modifiers.length === 0 && (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No light modifiers specified for this setup
          </p>
        </div>
      )}
    </div>
  );

  const renderPractical = () => (
    <div className="space-y-4">
      {scene.lighting.practicalLights.map((practical) => (
        <div key={practical.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {practical.type}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Position
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {practical.position}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Intensity
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {practical.intensity}%
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purpose
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {practical.purpose}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {scene.lighting.practicalLights.length === 0 && (
        <div className="text-center py-8">
          <Zap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No practical lights specified for this scene
          </p>
        </div>
      )}
    </div>
  );

  const getLightingStyleDescription = (style: string): string => {
    const descriptions = {
      'natural': 'Utilizes available natural light sources with minimal artificial lighting',
      'three-point': 'Classic setup with key, fill, and back lights for balanced illumination',
      'rembrandt': 'Dramatic lighting creating a triangle of light on the shadow side of the face',
      'butterfly': 'Beauty lighting with the key light directly in front and above the subject',
      'split': 'Half the face in light, half in shadow for dramatic effect',
      'rim': 'Strong back lighting to create a rim of light around the subject',
      'silhouette': 'Subject backlit to create a silhouette effect',
      'high-key': 'Bright, even lighting with minimal shadows',
      'low-key': 'Dramatic lighting with strong shadows and contrast'
    };
    return descriptions[style as keyof typeof descriptions] || 'Professional lighting setup';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Lighting Design
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Professional lighting setup and recommendations
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
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'setup' && renderSetup()}
        {activeTab === 'modifiers' && renderModifiers()}
        {activeTab === 'practical' && renderPractical()}
      </div>
    </div>
  );
};