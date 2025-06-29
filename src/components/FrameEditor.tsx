import React, { useState } from 'react';
import { StoryboardFrame, ShotType, CameraAngle, CameraMovement } from '../types';
import { 
  Camera, 
  Palette, 
  Users, 
  Clock, 
  Volume2, 
  Lightbulb,
  RotateCcw,
  Move,
  Eye,
  Mic
} from 'lucide-react';

interface FrameEditorProps {
  frame: StoryboardFrame;
  onFrameUpdate: (frame: StoryboardFrame) => void;
  onClose: () => void;
}

export const FrameEditor: React.FC<FrameEditorProps> = ({
  frame,
  onFrameUpdate,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('camera');

  const shotTypes: { value: ShotType; label: string }[] = [
    { value: 'extreme-wide', label: 'Extreme Wide Shot' },
    { value: 'wide', label: 'Wide Shot' },
    { value: 'medium-wide', label: 'Medium Wide Shot' },
    { value: 'medium', label: 'Medium Shot' },
    { value: 'medium-close', label: 'Medium Close-up' },
    { value: 'close-up', label: 'Close-up' },
    { value: 'extreme-close-up', label: 'Extreme Close-up' },
    { value: 'over-shoulder', label: 'Over Shoulder' },
    { value: 'two-shot', label: 'Two Shot' },
    { value: 'insert', label: 'Insert Shot' }
  ];

  const cameraAngles: { value: CameraAngle; label: string }[] = [
    { value: 'eye-level', label: 'Eye Level' },
    { value: 'high-angle', label: 'High Angle' },
    { value: 'low-angle', label: 'Low Angle' },
    { value: 'birds-eye', label: 'Bird\'s Eye' },
    { value: 'worms-eye', label: 'Worm\'s Eye' },
    { value: 'dutch-angle', label: 'Dutch Angle' },
    { value: 'profile', label: 'Profile' },
    { value: 'three-quarter', label: 'Three Quarter' }
  ];

  const cameraMovements: { value: CameraMovement; label: string }[] = [
    { value: 'static', label: 'Static' },
    { value: 'pan-left', label: 'Pan Left' },
    { value: 'pan-right', label: 'Pan Right' },
    { value: 'tilt-up', label: 'Tilt Up' },
    { value: 'tilt-down', label: 'Tilt Down' },
    { value: 'zoom-in', label: 'Zoom In' },
    { value: 'zoom-out', label: 'Zoom Out' },
    { value: 'dolly-in', label: 'Dolly In' },
    { value: 'dolly-out', label: 'Dolly Out' },
    { value: 'tracking', label: 'Tracking' },
    { value: 'handheld', label: 'Handheld' },
    { value: 'crane', label: 'Crane' },
    { value: 'steadicam', label: 'Steadicam' }
  ];

  const updateFrame = (updates: Partial<StoryboardFrame>) => {
    onFrameUpdate({ ...frame, ...updates });
  };

  const tabs = [
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'lighting', label: 'Lighting', icon: Lightbulb },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'timing', label: 'Timing', icon: Clock }
  ];

  const renderCameraTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Shot Type
        </label>
        <select
          value={frame.shotType}
          onChange={(e) => updateFrame({ shotType: e.target.value as ShotType })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          {shotTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Camera Angle
        </label>
        <select
          value={frame.cameraAngle}
          onChange={(e) => updateFrame({ cameraAngle: e.target.value as CameraAngle })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          {cameraAngles.map(angle => (
            <option key={angle.value} value={angle.value}>
              {angle.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Camera Movement
        </label>
        <select
          value={frame.cameraMovement}
          onChange={(e) => updateFrame({ cameraMovement: e.target.value as CameraMovement })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          {cameraMovements.map(movement => (
            <option key={movement.value} value={movement.value}>
              {movement.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderLightingTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Lighting Mood
        </label>
        <select
          value={frame.lighting.mood}
          onChange={(e) => updateFrame({
            lighting: { ...frame.lighting, mood: e.target.value as any }
          })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="bright">Bright</option>
          <option value="neutral">Neutral</option>
          <option value="dim">Dim</option>
          <option value="dramatic">Dramatic</option>
          <option value="moody">Moody</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Time of Day
        </label>
        <select
          value={frame.lighting.timeOfDay}
          onChange={(e) => updateFrame({
            lighting: { ...frame.lighting, timeOfDay: e.target.value as any }
          })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="dawn">Dawn</option>
          <option value="morning">Morning</option>
          <option value="midday">Midday</option>
          <option value="afternoon">Afternoon</option>
          <option value="golden-hour">Golden Hour</option>
          <option value="dusk">Dusk</option>
          <option value="night">Night</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Weather
        </label>
        <select
          value={frame.lighting.weather}
          onChange={(e) => updateFrame({
            lighting: { ...frame.lighting, weather: e.target.value as any }
          })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="clear">Clear</option>
          <option value="cloudy">Cloudy</option>
          <option value="overcast">Overcast</option>
          <option value="stormy">Stormy</option>
          <option value="foggy">Foggy</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Key Light
          </label>
          <input
            type="text"
            value={frame.lighting.keyLight}
            onChange={(e) => updateFrame({
              lighting: { ...frame.lighting, keyLight: e.target.value }
            })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Fill Light
          </label>
          <input
            type="text"
            value={frame.lighting.fillLight}
            onChange={(e) => updateFrame({
              lighting: { ...frame.lighting, fillLight: e.target.value }
            })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={frame.colorPalette.primary}
              onChange={(e) => updateFrame({
                colorPalette: { ...frame.colorPalette, primary: e.target.value }
              })}
              className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded"
            />
            <input
              type="text"
              value={frame.colorPalette.primary}
              onChange={(e) => updateFrame({
                colorPalette: { ...frame.colorPalette, primary: e.target.value }
              })}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Secondary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={frame.colorPalette.secondary}
              onChange={(e) => updateFrame({
                colorPalette: { ...frame.colorPalette, secondary: e.target.value }
              })}
              className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded"
            />
            <input
              type="text"
              value={frame.colorPalette.secondary}
              onChange={(e) => updateFrame({
                colorPalette: { ...frame.colorPalette, secondary: e.target.value }
              })}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Accent Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={frame.colorPalette.accent}
              onChange={(e) => updateFrame({
                colorPalette: { ...frame.colorPalette, accent: e.target.value }
              })}
              className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded"
            />
            <input
              type="text"
              value={frame.colorPalette.accent}
              onChange={(e) => updateFrame({
                colorPalette: { ...frame.colorPalette, accent: e.target.value }
              })}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={frame.colorPalette.background}
              onChange={(e) => updateFrame({
                colorPalette: { ...frame.colorPalette, background: e.target.value }
              })}
              className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded"
            />
            <input
              type="text"
              value={frame.colorPalette.background}
              onChange={(e) => updateFrame({
                colorPalette: { ...frame.colorPalette, background: e.target.value }
              })}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Color Temperature
        </label>
        <select
          value={frame.colorPalette.temperature}
          onChange={(e) => updateFrame({
            colorPalette: { ...frame.colorPalette, temperature: e.target.value as any }
          })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="warm">Warm</option>
          <option value="neutral">Neutral</option>
          <option value="cool">Cool</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Saturation
        </label>
        <select
          value={frame.colorPalette.saturation}
          onChange={(e) => updateFrame({
            colorPalette: { ...frame.colorPalette, saturation: e.target.value as any }
          })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="desaturated">Desaturated</option>
        </select>
      </div>
    </div>
  );

  const renderCharactersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          Characters in Frame
        </h3>
        <button
          onClick={() => {
            const newCharacter = {
              id: `char-${Date.now()}`,
              name: `Character ${frame.characters.length + 1}`,
              position: { x: 50, y: 50 },
              size: 1,
              emotion: 'neutral',
              action: 'standing',
              eyeline: 'camera'
            };
            updateFrame({
              characters: [...frame.characters, newCharacter]
            });
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
        >
          Add Character
        </button>
      </div>

      {frame.characters.map((character, index) => (
        <div key={character.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => {
                  const updatedCharacters = frame.characters.map(char =>
                    char.id === character.id ? { ...char, name: e.target.value } : char
                  );
                  updateFrame({ characters: updatedCharacters });
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Emotion
              </label>
              <select
                value={character.emotion}
                onChange={(e) => {
                  const updatedCharacters = frame.characters.map(char =>
                    char.id === character.id ? { ...char, emotion: e.target.value } : char
                  );
                  updateFrame({ characters: updatedCharacters });
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="neutral">Neutral</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="angry">Angry</option>
                <option value="surprised">Surprised</option>
                <option value="worried">Worried</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Position: {Math.round(character.position.x)}%, {Math.round(character.position.y)}%
            </div>
            <button
              onClick={() => {
                const updatedCharacters = frame.characters.filter(char => char.id !== character.id);
                updateFrame({ characters: updatedCharacters });
              }}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAudioTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Voiceover Text
        </label>
        <textarea
          value={frame.voiceoverText || ''}
          onChange={(e) => updateFrame({ voiceoverText: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          placeholder="Enter voiceover narration..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Audio Notes
        </label>
        <textarea
          value={frame.audioNotes || ''}
          onChange={(e) => updateFrame({ audioNotes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          placeholder="Music, sound effects, ambient audio..."
        />
      </div>
    </div>
  );

  const renderTimingTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Duration (seconds)
        </label>
        <input
          type="number"
          min="1"
          max="60"
          value={frame.duration}
          onChange={(e) => updateFrame({ duration: parseInt(e.target.value) || 5 })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Transition In
        </label>
        <select
          value={frame.transitionIn || 'cut'}
          onChange={(e) => updateFrame({ transitionIn: e.target.value as any })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="cut">Cut</option>
          <option value="fade-in">Fade In</option>
          <option value="dissolve">Dissolve</option>
          <option value="wipe">Wipe</option>
          <option value="iris">Iris</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Transition Out
        </label>
        <select
          value={frame.transitionOut || 'cut'}
          onChange={(e) => updateFrame({ transitionOut: e.target.value as any })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="cut">Cut</option>
          <option value="fade-out">Fade Out</option>
          <option value="dissolve">Dissolve</option>
          <option value="wipe">Wipe</option>
          <option value="iris">Iris</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Edit Frame: {frame.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <RotateCcw className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex">
          {/* Tab Navigation */}
          <div className="w-48 border-r border-slate-200 dark:border-slate-700 p-4">
            <div className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left
                      ${activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {activeTab === 'camera' && renderCameraTab()}
            {activeTab === 'lighting' && renderLightingTab()}
            {activeTab === 'colors' && renderColorsTab()}
            {activeTab === 'characters' && renderCharactersTab()}
            {activeTab === 'audio' && renderAudioTab()}
            {activeTab === 'timing' && renderTimingTab()}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};