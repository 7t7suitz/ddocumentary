import React, { useState } from 'react';
import { Camera, Edit3, Copy, Trash2, Plus, Eye, Settings, Aperture } from 'lucide-react';
import { Shot, Scene } from '../types';

interface ShotListProps {
  scene: Scene;
  onSceneUpdate: (scene: Scene) => void;
}

export const ShotList: React.FC<ShotListProps> = ({ scene, onSceneUpdate }) => {
  const [editingShot, setEditingShot] = useState<string | null>(null);
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);

  const updateShot = (updatedShot: Shot) => {
    const updatedShots = scene.shots.map(shot =>
      shot.id === updatedShot.id ? updatedShot : shot
    );
    onSceneUpdate({ ...scene, shots: updatedShots });
  };

  const duplicateShot = (shotId: string) => {
    const shot = scene.shots.find(s => s.id === shotId);
    if (!shot) return;

    const newShot: Shot = {
      ...shot,
      id: `shot-${Date.now()}`,
      shotNumber: `${scene.shots.length + 1}`,
      description: `${shot.description} (Copy)`
    };

    onSceneUpdate({ ...scene, shots: [...scene.shots, newShot] });
  };

  const deleteShot = (shotId: string) => {
    const updatedShots = scene.shots.filter(shot => shot.id !== shotId);
    onSceneUpdate({ ...scene, shots: updatedShots });
  };

  const addNewShot = () => {
    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      shotNumber: `${scene.shots.length + 1}`,
      type: 'medium',
      angle: 'eye-level',
      movement: 'static',
      lens: '50mm',
      frameRate: 24,
      duration: 5,
      description: 'New shot description',
      composition: {
        ruleOfThirds: true,
        leadingLines: [],
        symmetry: 'none',
        depth: 'medium',
        foreground: 'Subject',
        midground: 'Environment',
        background: 'Context',
        colorPalette: {
          primary: '#4A90E2',
          secondary: '#7ED321',
          accent: '#F5A623',
          mood: 'neutral',
          saturation: 'medium',
          contrast: 'medium'
        }
      },
      focus: {
        type: 'single',
        point: 'subject',
        aperture: 'f/5.6',
        depthOfField: 'medium'
      },
      exposure: {
        iso: 400,
        shutterSpeed: '1/50',
        aperture: 'f/5.6',
        exposureCompensation: 0,
        meteringMode: 'matrix'
      },
      notes: ''
    };

    onSceneUpdate({ ...scene, shots: [...scene.shots, newShot] });
  };

  const getShotTypeColor = (type: string) => {
    const colors = {
      'extreme-wide': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'wide': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'medium-wide': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      'medium': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'medium-close': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'close-up': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'extreme-close-up': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Shot List
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {scene.shots.length} shots • {Math.round(scene.shots.reduce((sum, shot) => sum + shot.duration, 0))} seconds total
          </p>
        </div>
        <button
          onClick={addNewShot}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shot</span>
        </button>
      </div>

      <div className="grid gap-4">
        {scene.shots.map((shot, index) => (
          <div
            key={shot.id}
            className={`
              bg-white dark:bg-slate-800 rounded-xl border-2 transition-all duration-200
              ${selectedShot?.id === shot.id
                ? 'border-purple-400 shadow-lg'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        Shot {shot.shotNumber}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getShotTypeColor(shot.type)}`}>
                        {shot.type.replace('-', ' ')}
                      </span>
                      <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                        {shot.lens}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {shot.angle} • {shot.movement} • {shot.duration}s
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedShot(selectedShot?.id === shot.id ? null : shot)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    title="View details"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => setEditingShot(shot.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    title="Edit shot"
                  >
                    <Edit3 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => duplicateShot(shot.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    title="Duplicate shot"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => deleteShot(shot.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    title="Delete shot"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                {shot.description}
              </p>

              {/* Technical Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Aperture className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Aperture</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {shot.focus.aperture}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">ISO</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {shot.exposure.iso}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Shutter</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {shot.exposure.shutterSpeed}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">DoF</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {shot.focus.depthOfField}
                    </div>
                  </div>
                </div>
              </div>

              {/* Composition Guide */}
              {selectedShot?.id === shot.id && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                    Composition Guide
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Foreground</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {shot.composition.foreground}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Midground</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {shot.composition.midground}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Background</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {shot.composition.background}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-slate-300"
                        style={{ backgroundColor: shot.composition.colorPalette.primary }}
                      />
                      <span className="text-slate-600 dark:text-slate-400">Primary</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-slate-300"
                        style={{ backgroundColor: shot.composition.colorPalette.secondary }}
                      />
                      <span className="text-slate-600 dark:text-slate-400">Secondary</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-slate-300"
                        style={{ backgroundColor: shot.composition.colorPalette.accent }}
                      />
                      <span className="text-slate-600 dark:text-slate-400">Accent</span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">
                      Mood: {shot.composition.colorPalette.mood}
                    </span>
                  </div>

                  {shot.notes && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">
                        Production Notes
                      </div>
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        {shot.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {scene.shots.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Shots Generated
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Analyze a scene description to generate an intelligent shot list
          </p>
        </div>
      )}
    </div>
  );
};