import React, { useState } from 'react';
import { StoryboardFrame } from '../types';
import { StoryboardCanvas } from './StoryboardCanvas';
import { FrameEditor } from './FrameEditor';
import { 
  Edit3, 
  Copy, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown,
  Play,
  Clock,
  Camera,
  Palette
} from 'lucide-react';

interface StoryboardGridProps {
  frames: StoryboardFrame[];
  onFramesUpdate: (frames: StoryboardFrame[]) => void;
  aspectRatio: string;
}

export const StoryboardGrid: React.FC<StoryboardGridProps> = ({
  frames,
  onFramesUpdate,
  aspectRatio
}) => {
  const [selectedFrame, setSelectedFrame] = useState<StoryboardFrame | null>(null);
  const [editingFrame, setEditingFrame] = useState<StoryboardFrame | null>(null);

  const updateFrame = (updatedFrame: StoryboardFrame) => {
    const updatedFrames = frames.map(frame =>
      frame.id === updatedFrame.id ? updatedFrame : frame
    );
    onFramesUpdate(updatedFrames);
  };

  const duplicateFrame = (frameId: string) => {
    const frameIndex = frames.findIndex(f => f.id === frameId);
    if (frameIndex === -1) return;

    const originalFrame = frames[frameIndex];
    const duplicatedFrame: StoryboardFrame = {
      ...originalFrame,
      id: `frame-${Date.now()}`,
      title: `${originalFrame.title} (Copy)`,
      order: originalFrame.order + 0.5
    };

    const newFrames = [
      ...frames.slice(0, frameIndex + 1),
      duplicatedFrame,
      ...frames.slice(frameIndex + 1)
    ];

    // Reorder frames
    const reorderedFrames = newFrames.map((frame, index) => ({
      ...frame,
      order: index
    }));

    onFramesUpdate(reorderedFrames);
  };

  const deleteFrame = (frameId: string) => {
    const updatedFrames = frames.filter(frame => frame.id !== frameId);
    onFramesUpdate(updatedFrames);
  };

  const moveFrame = (frameId: string, direction: 'up' | 'down') => {
    const frameIndex = frames.findIndex(f => f.id === frameId);
    if (frameIndex === -1) return;

    const newIndex = direction === 'up' ? frameIndex - 1 : frameIndex + 1;
    if (newIndex < 0 || newIndex >= frames.length) return;

    const newFrames = [...frames];
    [newFrames[frameIndex], newFrames[newIndex]] = [newFrames[newIndex], newFrames[frameIndex]];

    // Update order
    const reorderedFrames = newFrames.map((frame, index) => ({
      ...frame,
      order: index
    }));

    onFramesUpdate(reorderedFrames);
  };

  const addNewFrame = () => {
    const newFrame: StoryboardFrame = {
      id: `frame-${Date.now()}`,
      title: `Scene ${frames.length + 1}`,
      description: 'New scene description',
      shotType: 'medium',
      cameraAngle: 'eye-level',
      cameraMovement: 'static',
      lighting: {
        mood: 'neutral',
        keyLight: 'Soft key',
        fillLight: 'Balanced fill',
        backLight: 'Rim lighting',
        practicalLights: [],
        timeOfDay: 'midday',
        weather: 'clear'
      },
      colorPalette: {
        primary: '#4A90E2',
        secondary: '#7ED321',
        accent: '#F5A623',
        background: '#F8F9FA',
        mood: 'balanced',
        temperature: 'neutral',
        saturation: 'medium'
      },
      characters: [],
      duration: 5,
      visualElements: [],
      timestamp: frames.length * 5,
      order: frames.length
    };

    onFramesUpdate([...frames, newFrame]);
  };

  const getTotalDuration = () => {
    return frames.reduce((total, frame) => total + frame.duration, 0);
  };

  if (frames.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950/20 dark:to-blue-950/20 rounded-full flex items-center justify-center">
          <Camera className="w-12 h-12 text-purple-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          No Storyboard Frames Yet
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
          Generate your first storyboard frames using the text-to-storyboard tool above, or create frames manually.
        </p>
        <button
          onClick={addNewFrame}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 mx-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create First Frame</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {frames.length} frame{frames.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {Math.floor(getTotalDuration() / 60)}:{(getTotalDuration() % 60).toString().padStart(2, '0')} total
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {aspectRatio} aspect ratio
              </span>
            </div>
          </div>
          <button
            onClick={addNewFrame}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Frame</span>
          </button>
        </div>
      </div>

      {/* Storyboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frames.map((frame, index) => (
          <div
            key={frame.id}
            className={`
              bg-white dark:bg-slate-800 rounded-xl border-2 transition-all duration-200
              ${selectedFrame?.id === frame.id
                ? 'border-purple-400 shadow-lg'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
          >
            {/* Frame Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {frame.title}
                </h3>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveFrame(frame.id, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3 h-3 text-slate-500" />
                  </button>
                  <button
                    onClick={() => moveFrame(frame.id, 'down')}
                    disabled={index === frames.length - 1}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Frame {index + 1}</span>
                <span>{frame.duration}s</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="p-4">
              <div
                className="cursor-pointer"
                onClick={() => setSelectedFrame(selectedFrame?.id === frame.id ? null : frame)}
              >
                <StoryboardCanvas
                  frame={frame}
                  onFrameUpdate={updateFrame}
                  aspectRatio={aspectRatio}
                  isEditing={false}
                />
              </div>
            </div>

            {/* Frame Info */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                {frame.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 mb-3">
                <span>{frame.shotType}</span>
                <span>{frame.cameraAngle}</span>
                <span>{frame.cameraMovement}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingFrame(frame)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    title="Edit frame"
                  >
                    <Edit3 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => duplicateFrame(frame.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    title="Duplicate frame"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => deleteFrame(frame.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    title="Delete frame"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  {frame.characters.length} character{frame.characters.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Frame Editor Modal */}
      {editingFrame && (
        <FrameEditor
          frame={editingFrame}
          onFrameUpdate={(updatedFrame) => {
            updateFrame(updatedFrame);
            setEditingFrame(updatedFrame);
          }}
          onClose={() => setEditingFrame(null)}
        />
      )}
    </div>
  );
};