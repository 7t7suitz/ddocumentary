import React, { useState, useCallback } from 'react';
import { Camera, Lightbulb, Music, MapPin, Calendar, Settings, Users, FileText, BookOpen, Heart, BarChart2 } from 'lucide-react';
import { Scene } from './types';
import { SceneComposer } from './components/SceneComposer';
import { ShotList } from './components/ShotList';
import { LightingDesign } from './components/LightingDesign';
import { AudioDesign } from './components/AudioDesign';
import { EquipmentList } from './components/EquipmentList';
import { LocationScouting } from './components/LocationScouting';
import { CallSheet } from './components/CallSheet';
import { ResearchDashboard } from './components/ResearchDashboard';
import { EmotionalArcDashboard } from './components/EmotionalArcDashboard';
import { Document, DocumentAnalysis } from './types';
import { ProductionDashboard } from './components/ProductionDashboard';
import { createNewProductionProject } from './utils/productionUtils';

function App() {
  const [scene, setScene] = useState<Scene | null>(null);
  const [activeTab, setActiveTab] = useState('research');
  const [shootDate, setShootDate] = useState(new Date());
  const [document, setDocument] = useState<Document | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis | null>(null);
  const [productionProject, setProductionProject] = useState(createNewProductionProject('Documentary Project', 'A comprehensive documentary production'));

  const handleSceneGenerated = useCallback((newScene: Scene) => {
    setScene(newScene);
    setActiveTab('shots');
  }, []);

  const handleSceneUpdate = useCallback((updatedScene: Scene) => {
    setScene(updatedScene);
  }, []);

  const handleDocumentAnalyzed = useCallback((doc: Document, analysis: DocumentAnalysis) => {
    setDocument(doc);
    setDocumentAnalysis(analysis);
  }, []);

  const handleProjectUpdate = useCallback((updatedProject: any) => {
    setProductionProject(updatedProject);
  }, []);

  const tabs = [
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'emotions', label: 'Emotional Arc', icon: Heart },
    { id: 'production', label: 'Production', icon: BarChart2 },
    { id: 'composer', label: 'Scene Composer', icon: Camera },
    { id: 'shots', label: 'Shot List', icon: Settings },
    { id: 'lighting', label: 'Lighting', icon: Lightbulb },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'equipment', label: 'Equipment', icon: FileText },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'callsheet', label: 'Call Sheet', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Documentary Toolkit
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI-Powered Production Planning
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {scene && (
                <>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {scene.shots.length} shot{scene.shots.length !== 1 ? 's' : ''} • {scene.duration}min
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {scene.location.name}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isDisabled = (tab.id !== 'composer' && tab.id !== 'research' && tab.id !== 'emotions' && tab.id !== 'production') && !scene;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`
                    flex items-center space-x-2 px-6 py-4 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                      : isDisabled
                      ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'shots' && scene && scene.shots.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      {scene.shots.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'research' && (
          <ResearchDashboard />
        )}
        
        {activeTab === 'emotions' && (
          <EmotionalArcDashboard 
            document={document}
            analysis={documentAnalysis}
          />
        )}
        
        {activeTab === 'production' && (
          <ProductionDashboard 
            project={productionProject}
            onProjectUpdate={handleProjectUpdate}
          />
        )}
        
        {activeTab === 'composer' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                AI Scene Composition Tool
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Describe your scene and let AI generate comprehensive production plans including shot lists, 
                lighting setups, audio design, equipment recommendations, and call sheets.
              </p>
            </div>
            
            <SceneComposer onSceneGenerated={handleSceneGenerated} />
          </div>
        )}

        {scene && (
          <>
            {activeTab === 'shots' && (
              <ShotList scene={scene} onSceneUpdate={handleSceneUpdate} />
            )}

            {activeTab === 'lighting' && (
              <LightingDesign scene={scene} onSceneUpdate={handleSceneUpdate} />
            )}

            {activeTab === 'audio' && (
              <AudioDesign scene={scene} onSceneUpdate={handleSceneUpdate} />
            )}

            {activeTab === 'equipment' && (
              <EquipmentList scene={scene} onSceneUpdate={handleSceneUpdate} />
            )}

            {activeTab === 'location' && (
              <LocationScouting scene={scene} onSceneUpdate={handleSceneUpdate} />
            )}

            {activeTab === 'callsheet' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Shoot Date:
                  </label>
                  <input
                    type="date"
                    value={shootDate.toISOString().split('T')[0]}
                    onChange={(e) => setShootDate(new Date(e.target.value))}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <CallSheet scene={scene} shootDate={shootDate} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;