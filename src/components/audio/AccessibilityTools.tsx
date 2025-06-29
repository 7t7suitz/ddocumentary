import React, { useState } from 'react';
import { 
  Headphones, Download, Settings, 
  Zap, Loader2, Check, AlertTriangle,
  FileText, MessageSquare, Eye, Ear
} from 'lucide-react';
import { AudioProject, AudioFile, AudioAccessibilityFeature } from '../../types/audio';
import { generateAccessibilityFeatures, generateSubtitles } from '../../utils/audioProcessor';

interface AccessibilityToolsProps {
  project: AudioProject;
  onProjectUpdate: (project: AudioProject) => void;
  selectedFile: AudioFile | null;
}

export const AccessibilityTools: React.FC<AccessibilityToolsProps> = ({
  project,
  onProjectUpdate,
  selectedFile
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [subtitleOptions, setSubtitleOptions] = useState({
    format: 'vtt' as 'srt' | 'vtt' | 'ass' | 'json',
    includeSpeakerNames: true,
    maxLineLength: 42,
    maxLinesPerCaption: 2,
    minDuration: 1,
    maxDuration: 7
  });
  
  const generateFeatures = async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    try {
      const features = await generateAccessibilityFeatures(selectedFile.type);
      
      onProjectUpdate({
        ...project,
        accessibilityFeatures: [...project.accessibilityFeatures, ...features]
      });
    } catch (error) {
      console.error('Failed to generate accessibility features:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportSubtitles = async () => {
    if (!selectedFile || !selectedFile.transcription) return;
    
    try {
      const subtitles = await generateSubtitles(
        selectedFile.transcription.segments,
        {
          format: subtitleOptions.format,
          includeSpeakerNames: subtitleOptions.includeSpeakerNames,
          maxLineLength: subtitleOptions.maxLineLength,
          maxLinesPerCaption: subtitleOptions.maxLinesPerCaption
        }
      );
      
      // Create and download the file
      const blob = new Blob([subtitles], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.name.replace(/\.[^/.]+$/, '')}.${subtitleOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getFeatureTypeIcon = (type: string) => {
    switch (type) {
      case 'caption': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'transcript': return <FileText className="w-4 h-4 text-green-500" />;
      case 'audio-description': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'sign-language': return <Headphones className="w-4 h-4 text-amber-500" />;
      default: return <Headphones className="w-4 h-4 text-slate-500" />;
    }
  };

  const getFeatureTypeColor = (type: string): string => {
    switch (type) {
      case 'caption': return 'text-blue-500';
      case 'transcript': return 'text-green-500';
      case 'audio-description': return 'text-purple-500';
      case 'sign-language': return 'text-amber-500';
      default: return 'text-slate-500';
    }
  };

  const getFeatureTypeBgColor = (type: string): string => {
    switch (type) {
      case 'caption': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'transcript': return 'bg-green-50 dark:bg-green-900/20';
      case 'audio-description': return 'bg-purple-50 dark:bg-purple-900/20';
      case 'sign-language': return 'bg-amber-50 dark:bg-amber-900/20';
      default: return 'bg-slate-50 dark:bg-slate-700';
    }
  };

  const getFeatureTypeBorderColor = (type: string): string => {
    switch (type) {
      case 'caption': return 'border-blue-200 dark:border-blue-800';
      case 'transcript': return 'border-green-200 dark:border-green-800';
      case 'audio-description': return 'border-purple-200 dark:border-purple-800';
      case 'sign-language': return 'border-amber-200 dark:border-amber-800';
      default: return 'border-slate-200 dark:border-slate-700';
    }
  };

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'required': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'recommended': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'optional': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Accessibility Tools
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Make your audio content accessible to all audiences
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={generateFeatures}
            disabled={isGenerating || !selectedFile}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            <Headphones className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Features'}</span>
          </button>
        </div>
      </div>

      {/* Subtitle Generator */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Subtitle Generator
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Format
              </label>
              <select
                value={subtitleOptions.format}
                onChange={(e) => setSubtitleOptions({
                  ...subtitleOptions,
                  format: e.target.value as any
                })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="srt">SRT (SubRip Text)</option>
                <option value="vtt">VTT (Web Video Text Tracks)</option>
                <option value="ass">ASS (Advanced SubStation Alpha)</option>
                <option value="json">JSON (Raw Data)</option>
              </select>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                SRT is widely supported by video editing software
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={subtitleOptions.includeSpeakerNames}
                    onChange={(e) => setSubtitleOptions({
                      ...subtitleOptions,
                      includeSpeakerNames: e.target.checked
                    })}
                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Include Speaker Names</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Max Line Length
              </label>
              <input
                type="number"
                value={subtitleOptions.maxLineLength}
                onChange={(e) => setSubtitleOptions({
                  ...subtitleOptions,
                  maxLineLength: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                min="20"
                max="80"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Recommended: 42 characters for standard subtitles
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Max Lines Per Caption
              </label>
              <input
                type="number"
                value={subtitleOptions.maxLinesPerCaption}
                onChange={(e) => setSubtitleOptions({
                  ...subtitleOptions,
                  maxLinesPerCaption: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                min="1"
                max="4"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Recommended: 2 lines for standard subtitles
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={exportSubtitles}
              disabled={!selectedFile || !selectedFile.transcription}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Generate Subtitles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      {isGenerating ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Generating Accessibility Features
            </h3>
          </div>
          
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Analyzing content and generating accessibility recommendations
            </p>
            <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-indigo-500 animate-pulse rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ) : project.accessibilityFeatures.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Headphones className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Accessibility Features
            </h3>
          </div>
          
          <div className="space-y-4">
            {project.accessibilityFeatures.map((feature) => (
              <div 
                key={feature.id} 
                className={`
                  p-6 rounded-xl border transition-all duration-200
                  ${activeFeature === feature.id
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20'
                    : `${getFeatureTypeBgColor(feature.type)} ${getFeatureTypeBorderColor(feature.type)}`
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      {getFeatureTypeIcon(feature.type)}
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {feature.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(feature.importance)}`}>
                        {feature.importance}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                      {feature.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
                    className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg"
                  >
                    {activeFeature === feature.id ? (
                      <Check className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <Zap className="w-4 h-4 text-indigo-500" />
                    )}
                  </button>
                </div>
                
                {activeFeature === feature.id && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Implementation
                      </h5>
                      <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {feature.implementation}
                        </p>
                      </div>
                    </div>
                    
                    {feature.standards.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Compliance Standards
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {feature.standards.map((standard, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                            >
                              {standard}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {feature.notes && (
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Notes
                        </h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {feature.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Headphones className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Accessibility Features Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Generate accessibility features to make your content available to all audiences
          </p>
          <button
            onClick={generateFeatures}
            disabled={!selectedFile}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 mx-auto"
          >
            <Headphones className="w-4 h-4" />
            <span>Generate Features</span>
          </button>
        </div>
      )}

      {/* Accessibility Checklist */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Check className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Accessibility Checklist
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <input
              type="checkbox"
              className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
              checked={selectedFile?.transcription !== undefined}
              readOnly
            />
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Transcription
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Provide a text version of all spoken content
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              {selectedFile?.transcription ? 'Complete' : 'Incomplete'}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <input
              type="checkbox"
              className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
              checked={project.accessibilityFeatures.some(f => f.type === 'caption')}
              readOnly
            />
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Closed Captions
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Provide synchronized text for all audio content
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              {project.accessibilityFeatures.some(f => f.type === 'caption') ? 'Complete' : 'Incomplete'}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <input
              type="checkbox"
              className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
              checked={project.accessibilityFeatures.some(f => f.type === 'audio-description')}
              readOnly
            />
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Audio Descriptions
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Provide descriptions of visual elements for visually impaired users
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              {project.accessibilityFeatures.some(f => f.type === 'audio-description') ? 'Complete' : 'Incomplete'}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <input
              type="checkbox"
              className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
              checked={file?.analysis.loudness.integrated <= -14}
              readOnly
            />
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Appropriate Loudness
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Ensure audio is at an appropriate loudness level (-14 LUFS or lower)
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              {file?.analysis.loudness.integrated <= -14 ? 'Complete' : 'Incomplete'}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <input
              type="checkbox"
              className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
              checked={file?.analysis.clarity.articulation >= 0.7}
              readOnly
            />
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Clear Speech
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Ensure speech is clear and well-articulated
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              {file?.analysis.clarity.articulation >= 0.7 ? 'Complete' : 'Incomplete'}
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Accessibility Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Include captions for all dialogue and important sounds</li>
          <li>• Provide transcripts for all audio content</li>
          <li>• Use clear, well-paced narration</li>
          <li>• Describe important visual elements for audio description</li>
          <li>• Ensure sufficient contrast between speech and background audio</li>
          <li>• Provide alternative formats for different accessibility needs</li>
          <li>• Test with actual users who have different accessibility needs</li>
        </ul>
      </div>
    </div>
  );
};