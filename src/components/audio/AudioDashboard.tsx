import React, { useState, useEffect } from 'react';
import { 
  Mic, Music, Waveform, Upload, 
  Download, Settings, FileAudio, Play, 
  Pause, BarChart2, MessageSquare, Sliders,
  Volume2, Headphones, Zap, AlertTriangle
} from 'lucide-react';
import { AudioFile, AudioProject, ProcessingJob } from '../../types/audio';
import { processAudioFile } from '../../utils/audioProcessor';
import { AudioUploader } from './AudioUploader';
import { AudioPlayer } from './AudioPlayer';
import { TranscriptionEditor } from './TranscriptionEditor';
import { AudioEnhancer } from './AudioEnhancer';
import { MusicRecommender } from './MusicRecommender';
import { VoiceCoach } from './VoiceCoach';
import { AccessibilityTools } from './AccessibilityTools';
import { MixingConsole } from './MixingConsole';
import { SoundEffectGenerator } from './SoundEffectGenerator';

interface AudioDashboardProps {
  initialProject?: AudioProject;
}

export const AudioDashboard: React.FC<AudioDashboardProps> = ({
  initialProject
}) => {
  const [project, setProject] = useState<AudioProject>(
    initialProject || {
      id: 'default-project',
      title: 'New Audio Project',
      description: 'Audio processing and enhancement project',
      files: [],
      transcriptions: [],
      musicRecommendations: [],
      soundEffectRecommendations: [],
      mixingRecommendations: [],
      voiceCoachingTips: [],
      accessibilityFeatures: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );
  
  const [activeTab, setActiveTab] = useState('files');
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Auto-save project every 30 seconds
    const saveInterval = setInterval(() => {
      saveProject();
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, [project]);

  const saveProject = () => {
    // In a real app, this would save to a database or file
    console.log('Saving project:', project);
    localStorage.setItem('audio-project', JSON.stringify(project));
    
    setProject({
      ...project,
      updatedAt: new Date()
    });
  };

  const handleFileUpload = async (files: File[]) => {
    const newProcessingJobs: ProcessingJob[] = [];
    
    for (const file of files) {
      const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a processing job
      const job: ProcessingJob = {
        id: jobId,
        type: 'analysis',
        status: 'queued',
        progress: 0,
        fileId: '',
        parameters: { filename: file.name },
        startedAt: new Date()
      };
      
      newProcessingJobs.push(job);
      setProcessingJobs(prev => [...prev, job]);
      
      try {
        // Update job status
        setProcessingJobs(prev => 
          prev.map(j => j.id === jobId ? { ...j, status: 'processing', progress: 10 } : j)
        );
        
        // Process the file
        const audioFile = await processAudioFile(file);
        
        // Update job progress
        setProcessingJobs(prev => 
          prev.map(j => j.id === jobId ? { ...j, progress: 50 } : j)
        );
        
        // Add the file to the project
        setProject(prev => ({
          ...prev,
          files: [...prev.files, audioFile],
          updatedAt: new Date()
        }));
        
        // Update job status
        setProcessingJobs(prev => 
          prev.map(j => j.id === jobId ? { 
            ...j, 
            status: 'completed', 
            progress: 100, 
            fileId: audioFile.id,
            completedAt: new Date()
          } : j)
        );
        
        // Select the newly uploaded file
        setSelectedFile(audioFile);
        
      } catch (error) {
        console.error('File processing failed:', error);
        
        // Update job status
        setProcessingJobs(prev => 
          prev.map(j => j.id === jobId ? { 
            ...j, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date()
          } : j)
        );
      }
    }
  };

  const updateFile = (updatedFile: AudioFile) => {
    setProject(prev => ({
      ...prev,
      files: prev.files.map(file => file.id === updatedFile.id ? updatedFile : file),
      updatedAt: new Date()
    }));
    
    setSelectedFile(updatedFile);
  };

  const deleteFile = (fileId: string) => {
    setProject(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId),
      updatedAt: new Date()
    }));
    
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const updateProject = (updates: Partial<AudioProject>) => {
    setProject(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  };

  const exportProject = () => {
    const projectData = JSON.stringify(project, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-audio-project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'files', label: 'Files', icon: FileAudio },
    { id: 'transcription', label: 'Transcription', icon: MessageSquare, disabled: !selectedFile },
    { id: 'enhance', label: 'Enhance', icon: Sliders, disabled: !selectedFile },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'sfx', label: 'Sound Effects', icon: Volume2 },
    { id: 'mixing', label: 'Mixing', icon: Waveform, disabled: !selectedFile },
    { id: 'voice', label: 'Voice Coach', icon: Mic, disabled: !selectedFile?.transcription },
    { id: 'accessibility', label: 'Accessibility', icon: Headphones }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Waveform className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Audio Toolkit
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI-Powered Audio Processing
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {project.files.length} file{project.files.length !== 1 ? 's' : ''}
              </div>
              
              <button
                onClick={saveProject}
                className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Save Project
              </button>
              
              <button
                onClick={exportProject}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Export Project"
              >
                <Download className="w-5 h-5 text-slate-500" />
              </button>
              
              <button
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Project Info */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {project.title}
                </h2>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <Settings className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {project.description}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedFile && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    ) : (
                      <Play className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    )}
                  </button>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {selectedFile.name}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => setActiveTab('files')}
                className="flex items-center space-x-2 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Audio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
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
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'files' && (
          <AudioUploader 
            files={project.files}
            onFileUpload={handleFileUpload}
            onFileSelect={setSelectedFile}
            onFileDelete={deleteFile}
            processingJobs={processingJobs}
            selectedFile={selectedFile}
          />
        )}
        
        {activeTab === 'transcription' && selectedFile && (
          <TranscriptionEditor 
            file={selectedFile}
            onFileUpdate={updateFile}
          />
        )}
        
        {activeTab === 'enhance' && selectedFile && (
          <AudioEnhancer 
            file={selectedFile}
            onFileUpdate={updateFile}
          />
        )}
        
        {activeTab === 'music' && (
          <MusicRecommender 
            project={project}
            onProjectUpdate={updateProject}
          />
        )}
        
        {activeTab === 'sfx' && (
          <SoundEffectGenerator 
            project={project}
            onProjectUpdate={updateProject}
          />
        )}
        
        {activeTab === 'mixing' && selectedFile && (
          <MixingConsole 
            file={selectedFile}
            onFileUpdate={updateFile}
          />
        )}
        
        {activeTab === 'voice' && selectedFile?.transcription && (
          <VoiceCoach 
            file={selectedFile}
            onFileUpdate={updateFile}
            project={project}
            onProjectUpdate={updateProject}
          />
        )}
        
        {activeTab === 'accessibility' && (
          <AccessibilityTools 
            project={project}
            onProjectUpdate={updateProject}
            selectedFile={selectedFile}
          />
        )}
      </main>

      {/* Audio Player */}
      {selectedFile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="max-w-7xl mx-auto">
            <AudioPlayer 
              file={selectedFile}
              isPlaying={isPlaying}
              onPlayPause={setIsPlaying}
            />
          </div>
        </div>
      )}
    </div>
  );
};