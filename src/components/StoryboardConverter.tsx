import React, { useState } from 'react';
import { Camera, FileText, Wand2, Download, Eye, Clock } from 'lucide-react';
import { StoryboardFrame, Script } from '../types/script';
import { convertStoryboardToScript } from '../utils/scriptGenerator';

interface StoryboardConverterProps {
  onScriptGenerated: (script: Script) => void;
}

export const StoryboardConverter: React.FC<StoryboardConverterProps> = ({
  onScriptGenerated
}) => {
  const [storyboardFrames, setStoryboardFrames] = useState<StoryboardFrame[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [previewScript, setPreviewScript] = useState<Script | null>(null);

  const handleFrameUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate storyboard frame extraction
      const mockFrames: StoryboardFrame[] = [
        {
          id: 'frame-1',
          title: 'Opening Shot',
          description: 'Wide establishing shot of the city skyline at dawn. Camera slowly pans across the buildings as the sun rises.',
          shotType: 'wide',
          cameraAngle: 'eye-level',
          duration: 8,
          voiceoverText: 'Every city has its stories, hidden in the shadows between buildings.',
          audioNotes: 'Ambient city sounds, gentle music fade in'
        },
        {
          id: 'frame-2',
          title: 'Character Introduction',
          description: 'Medium shot of protagonist walking down a busy street. People move around them in a blur.',
          shotType: 'medium',
          cameraAngle: 'eye-level',
          duration: 6,
          voiceoverText: 'Sarah had walked these streets for twenty years, but today felt different.',
          audioNotes: 'Footsteps, street ambience'
        },
        {
          id: 'frame-3',
          title: 'Close-up Reaction',
          description: 'Close-up of protagonist\'s face as they stop and look up at an old building.',
          shotType: 'close-up',
          cameraAngle: 'low-angle',
          duration: 4,
          voiceoverText: 'The building held memories she thought were lost forever.',
          audioNotes: 'Music swells, traffic fades'
        }
      ];
      
      setStoryboardFrames(mockFrames);
    }
  };

  const convertToScript = async () => {
    if (storyboardFrames.length === 0) return;
    
    setIsConverting(true);
    try {
      const script = await convertStoryboardToScript(storyboardFrames);
      setPreviewScript(script);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const acceptScript = () => {
    if (previewScript) {
      onScriptGenerated(previewScript);
      setPreviewScript(null);
      setStoryboardFrames([]);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Storyboard to Script Converter
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Upload your storyboard frames and let AI convert them into a properly formatted script 
          with scene descriptions, voiceover suggestions, and timing information.
        </p>
      </div>

      {/* Upload Section */}
      {storyboardFrames.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="text-center">
            <Camera className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Upload Storyboard
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Upload your storyboard file or use our demo frames
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <label className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Upload Storyboard</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png,.jpeg"
                  onChange={handleFrameUpload}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleFrameUpload}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Eye className="w-4 h-4" />
                <span>Use Demo Frames</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storyboard Frames Preview */}
      {storyboardFrames.length > 0 && !previewScript && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Storyboard Frames ({storyboardFrames.length})
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Total Duration: {formatTime(storyboardFrames.reduce((sum, frame) => sum + frame.duration, 0))}
              </span>
              <button
                onClick={convertToScript}
                disabled={isConverting}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4" />
                <span>{isConverting ? 'Converting...' : 'Convert to Script'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storyboardFrames.map((frame, index) => (
              <div key={frame.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Frame {index + 1}
                  </h4>
                  <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{frame.duration}s</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {frame.title}
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {frame.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
                    <span className="capitalize">{frame.shotType}</span>
                    <span className="capitalize">{frame.cameraAngle}</span>
                  </div>

                  {frame.voiceoverText && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h6 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Voiceover
                      </h6>
                      <p className="text-sm text-blue-600 dark:text-blue-400 italic">
                        "{frame.voiceoverText}"
                      </p>
                    </div>
                  )}

                  {frame.audioNotes && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <h6 className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                        Audio Notes
                      </h6>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {frame.audioNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Script Preview */}
      {previewScript && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Generated Script Preview
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewScript(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Back to Frames
              </button>
              <button
                onClick={acceptScript}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Download className="w-4 h-4" />
                <span>Use This Script</span>
              </button>
            </div>
          </div>

          {/* Script Metadata */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {previewScript.content.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Elements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {previewScript.metadata.wordCount}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {previewScript.metadata.pageCount}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Pages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatTime(previewScript.metadata.estimatedDuration)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Duration</div>
              </div>
            </div>
          </div>

          {/* Script Content Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {previewScript.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {previewScript.description}
                </p>
              </div>

              {previewScript.content.slice(0, 10).map((element) => (
                <div key={element.id} className="py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded">
                      {element.type.replace('-', ' ')}
                    </span>
                    {element.timing && (
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {formatTime(element.timing.estimatedDuration || 0)}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-slate-900 dark:text-slate-100"
                    style={{
                      fontWeight: element.formatting.bold ? 'bold' : 'normal',
                      fontStyle: element.formatting.italic ? 'italic' : 'normal',
                      textAlign: element.formatting.alignment || 'left',
                      marginLeft: `${element.formatting.indent || 0}px`
                    }}
                  >
                    {element.content}
                  </div>
                </div>
              ))}

              {previewScript.content.length > 10 && (
                <div className="text-center py-4 text-slate-500 dark:text-slate-500">
                  ... and {previewScript.content.length - 10} more elements
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};