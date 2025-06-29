import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, Users, AlertCircle, Clock, 
  BarChart2, Globe, BookOpen, RefreshCw, Settings,
  Plus, Download, Share2, Filter, Eye, Edit3
} from 'lucide-react';
import { ResearchProject, ResearchTopic, Source, Claim, Expert, NewsAlert } from '../types/research';
import { createNewResearchProject, searchProject } from '../utils/researchService';
import { SourceFinder } from './SourceFinder';
import { FactChecker } from './FactChecker';
import { ExpertFinder } from './ExpertFinder';
import { NewsMonitor } from './NewsMonitor';
import { ResearchTimeline } from './ResearchTimeline';
import { AccuracyChecker } from './AccuracyChecker';
import { CitationManager } from './CitationManager';
import { ResearchMap } from './ResearchMap';

interface ResearchDashboardProps {
  initialProject?: ResearchProject;
}

export const ResearchDashboard: React.FC<ResearchDashboardProps> = ({
  initialProject
}) => {
  const [project, setProject] = useState<ResearchProject>(
    initialProject || createNewResearchProject('New Research Project', 'Research project description')
  );
  const [activeTab, setActiveTab] = useState('sources');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Auto-save project every 5 minutes
    const saveInterval = setInterval(() => {
      saveProject();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(saveInterval);
  }, [project]);

  const saveProject = () => {
    // In a real app, this would save to a database or file
    console.log('Saving project:', project);
    localStorage.setItem(`research-project-${project.id}`, JSON.stringify(project));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Search within the project
    const results = searchProject(project, searchQuery);
    setSearchResults(results);
    
    setIsSearching(false);
  };

  const addSource = (source: Source) => {
    setProject({
      ...project,
      sources: [...project.sources, source],
      updatedAt: new Date()
    });
  };

  const addClaim = (claim: Claim) => {
    setProject({
      ...project,
      claims: [...project.claims, claim],
      updatedAt: new Date()
    });
  };

  const addExpert = (expert: Expert) => {
    setProject({
      ...project,
      experts: [...project.experts, expert],
      updatedAt: new Date()
    });
  };

  const addNewsAlert = (alert: NewsAlert) => {
    setProject({
      ...project,
      newsAlerts: [...project.newsAlerts, alert],
      updatedAt: new Date()
    });
  };

  const addTopic = (topic: ResearchTopic) => {
    setProject({
      ...project,
      topics: [...project.topics, topic],
      updatedAt: new Date()
    });
  };

  const updateProject = (updates: Partial<ResearchProject>) => {
    setProject({
      ...project,
      ...updates,
      updatedAt: new Date()
    });
  };

  const exportProject = () => {
    const projectData = JSON.stringify(project, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-research.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'sources', label: 'Sources', icon: FileText, count: project.sources.length },
    { id: 'claims', label: 'Claims', icon: AlertCircle, count: project.claims.length },
    { id: 'experts', label: 'Experts', icon: Users, count: project.experts.length },
    { id: 'news', label: 'News Monitor', icon: Globe, count: project.newsAlerts.length },
    { id: 'timeline', label: 'Timeline', icon: Clock, count: project.timeline.length },
    { id: 'citations', label: 'Citations', icon: BookOpen, count: project.citations.length },
    { id: 'accuracy', label: 'Accuracy', icon: BarChart2, count: project.accuracyReports.length },
    { id: 'map', label: 'Research Map', icon: Globe, count: 0 }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sources':
        return <SourceFinder project={project} onSourceAdd={addSource} />;
      case 'claims':
        return <FactChecker project={project} onClaimAdd={addClaim} />;
      case 'experts':
        return <ExpertFinder project={project} onExpertAdd={addExpert} />;
      case 'news':
        return <NewsMonitor project={project} onNewsAlertAdd={addNewsAlert} />;
      case 'timeline':
        return <ResearchTimeline project={project} onProjectUpdate={updateProject} />;
      case 'citations':
        return <CitationManager project={project} onProjectUpdate={updateProject} />;
      case 'accuracy':
        return <AccuracyChecker project={project} onProjectUpdate={updateProject} />;
      case 'map':
        return <ResearchMap project={project} />;
      default:
        return <SourceFinder project={project} onSourceAdd={addSource} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Research Assistant
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI-Powered Documentary Research
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search research..."
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-64"
                />
              </div>
              
              <button
                onClick={saveProject}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="Save Project"
              >
                <RefreshCw className="w-5 h-5 text-slate-500" />
              </button>
              
              <button
                onClick={() => {}}
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
                  <Edit3 className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {project.description}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={exportProject}
                className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 mt-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>{project.sources.length} sources</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{project.claims.length} claims</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{project.experts.length} experts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Updated {project.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Search Results for "{searchQuery}"
              </h3>
              <button
                onClick={() => setSearchResults(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {searchResults.sources.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sources ({searchResults.sources.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.sources.slice(0, 3).map((source: Source) => (
                      <div key={source.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {source.title}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {source.authors.join(', ')} • {source.type}
                        </div>
                      </div>
                    ))}
                    {searchResults.sources.length > 3 && (
                      <div className="text-center text-sm text-blue-600 dark:text-blue-400">
                        + {searchResults.sources.length - 3} more sources
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {searchResults.claims.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Claims ({searchResults.claims.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.claims.slice(0, 3).map((claim: Claim) => (
                      <div key={claim.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {claim.statement}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Status: {claim.status} • Confidence: {Math.round(claim.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {searchResults.experts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Experts ({searchResults.experts.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.experts.slice(0, 3).map((expert: Expert) => (
                      <div key={expert.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {expert.name}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {expert.title} • {expert.organization}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {searchResults.newsAlerts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    News Alerts ({searchResults.newsAlerts.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.newsAlerts.slice(0, 3).map((alert: NewsAlert) => (
                      <div key={alert.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {alert.title}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {alert.source} • {alert.date.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {searchResults.sources.length === 0 && 
               searchResults.claims.length === 0 && 
               searchResults.experts.length === 0 && 
               searchResults.newsAlerts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">
                    No results found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-6 py-4 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      {tab.count}
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
        {renderTabContent()}
      </main>
    </div>
  );
};