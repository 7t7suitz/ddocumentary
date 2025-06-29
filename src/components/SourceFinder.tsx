import React, { useState } from 'react';
import { 
  Search, FileText, Globe, Filter, Download, 
  ExternalLink, Check, AlertTriangle, Clock, 
  BookOpen, Star, BarChart2, Plus
} from 'lucide-react';
import { ResearchProject, Source, WebSearchResult, SourceType } from '../types/research';
import { searchWeb } from '../utils/researchService';

interface SourceFinderProps {
  project: ResearchProject;
  onSourceAdd: (source: Source) => void;
}

export const SourceFinder: React.FC<SourceFinderProps> = ({
  project,
  onSourceAdd
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WebSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<SourceType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSource, setSelectedSource] = useState<WebSearchResult | null>(null);
  const [sourceContent, setSourceContent] = useState('');
  const [sourceAuthors, setSourceAuthors] = useState<string[]>([]);
  const [sourceReliability, setSourceReliability] = useState({
    factualAccuracy: 0.8,
    bias: 0.7,
    expertise: 0.8,
    reputation: 0.9
  });

  const sourceTypes: { value: SourceType; label: string; icon: any }[] = [
    { value: 'academic', label: 'Academic', icon: BookOpen },
    { value: 'news', label: 'News', icon: Globe },
    { value: 'journal', label: 'Journal', icon: FileText },
    { value: 'website', label: 'Website', icon: Globe },
    { value: 'book', label: 'Book', icon: BookOpen },
    { value: 'government', label: 'Government', icon: FileText },
    { value: 'report', label: 'Report', icon: FileText }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchWeb(searchQuery, selectedSourceTypes.length > 0 ? selectedSourceTypes : undefined);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSourceSelect = (source: WebSearchResult) => {
    setSelectedSource(source);
    // In a real app, this would fetch the actual content
    setSourceContent(`This is simulated content for "${source.title}" from ${source.source}. In a real application, this would be the actual content fetched from the URL.
    
The content would include detailed information about the topic, supporting evidence, and relevant data. This would be used for fact-checking, citation, and research purposes.

This source was published on ${source.date?.toLocaleDateString() || 'an unknown date'} and is categorized as ${source.type}.`);
    
    // Set default authors based on source
    setSourceAuthors([`Author from ${source.source}`]);
  };

  const addToProject = () => {
    if (!selectedSource) return;
    
    const overallReliability = (
      sourceReliability.factualAccuracy + 
      sourceReliability.bias + 
      sourceReliability.expertise + 
      sourceReliability.reputation
    ) / 4;
    
    const newSource: Source = {
      id: `source-${Date.now()}`,
      title: selectedSource.title,
      url: selectedSource.url,
      type: selectedSource.type,
      authors: sourceAuthors,
      publishedDate: selectedSource.date,
      retrievedDate: new Date(),
      content: sourceContent,
      summary: selectedSource.snippet,
      topics: project.topics.slice(0, 2).map(t => t.id),
      reliability: {
        overall: overallReliability,
        factualAccuracy: sourceReliability.factualAccuracy,
        bias: sourceReliability.bias,
        expertise: sourceReliability.expertise,
        reputation: sourceReliability.reputation,
        notes: ''
      },
      tags: [],
      notes: '',
      citations: [],
      status: 'unverified'
    };
    
    onSourceAdd(newSource);
    setSelectedSource(null);
    setSourceContent('');
    setSourceAuthors([]);
  };

  const toggleSourceType = (type: SourceType) => {
    if (selectedSourceTypes.includes(type)) {
      setSelectedSourceTypes(selectedSourceTypes.filter(t => t !== type));
    } else {
      setSelectedSourceTypes([...selectedSourceTypes, type]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Source Finder
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Search for reliable sources and add them to your research project
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors
              ${showFilters 
                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }
            `}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for sources..."
              className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-64"
            />
          </div>
          
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Search Filters
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Source Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {sourceTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedSourceTypes.includes(type.value);
                  
                  return (
                    <button
                      key={type.value}
                      onClick={() => toggleSourceType(type.value)}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors
                        ${isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date Range
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="any">Any time</option>
                  <option value="day">Past 24 hours</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                  <option value="year">Past year</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reliability
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="any">Any reliability</option>
                  <option value="high">High reliability</option>
                  <option value="medium">Medium reliability</option>
                  <option value="low">Low reliability</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sort By
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="relevance">Relevance</option>
                  <option value="date">Date (newest first)</option>
                  <option value="reliability">Reliability</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !selectedSource && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Search Results ({searchResults.length})
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing results for "{searchQuery}"
            </div>
          </div>
          
          <div className="space-y-4">
            {searchResults.map((result) => (
              <div 
                key={result.url}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSourceSelect(result)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {result.title}
                      </h4>
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${result.type === 'academic' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                          result.type === 'news' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          result.type === 'journal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }
                      `}>
                        {result.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {result.snippet}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{result.source}</span>
                      </div>
                      
                      {result.date && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{result.date.toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>Relevance: {Math.round(result.relevance * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source Preview & Add */}
      {selectedSource && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Source Preview
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedSource(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Back to Results
              </button>
              <button
                onClick={addToProject}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Project</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Source Info */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {selectedSource.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <a 
                          href={selectedSource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {selectedSource.source}
                        </a>
                      </div>
                      
                      {selectedSource.date && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{selectedSource.date.toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span className="capitalize">{selectedSource.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      Relevance: {Math.round(selectedSource.relevance * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Authors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sourceAuthors.map((author, index) => (
                      <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{author}</span>
                        <button
                          onClick={() => setSourceAuthors(sourceAuthors.filter((_, i) => i !== index))}
                          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Add author..."
                      className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          setSourceAuthors([...sourceAuthors, e.currentTarget.value.trim()]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    rows={8}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Reliability Assessment */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Reliability Assessment
                  </h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Factual Accuracy</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {Math.round(sourceReliability.factualAccuracy * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={sourceReliability.factualAccuracy}
                      onChange={(e) => setSourceReliability({
                        ...sourceReliability,
                        factualAccuracy: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Bias Level (lower is better)</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {Math.round(sourceReliability.bias * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={sourceReliability.bias}
                      onChange={(e) => setSourceReliability({
                        ...sourceReliability,
                        bias: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Author Expertise</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {Math.round(sourceReliability.expertise * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={sourceReliability.expertise}
                      onChange={(e) => setSourceReliability({
                        ...sourceReliability,
                        expertise: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Source Reputation</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {Math.round(sourceReliability.reputation * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={sourceReliability.reputation}
                      onChange={(e) => setSourceReliability({
                        ...sourceReliability,
                        reputation: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Overall Reliability</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {Math.round(
                          (sourceReliability.factualAccuracy + 
                           sourceReliability.bias + 
                           sourceReliability.expertise + 
                           sourceReliability.reputation) / 4 * 100
                        )}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.round(
                            (sourceReliability.factualAccuracy + 
                             sourceReliability.bias + 
                             sourceReliability.expertise + 
                             sourceReliability.reputation) / 4 * 100
                          )}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Related Sources */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Related Project Sources
                </h4>
                
                {project.sources.length > 0 ? (
                  <div className="space-y-3">
                    {project.sources.slice(0, 3).map((source) => (
                      <div key={source.id} className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 truncate">
                          {source.title}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    No related sources in project yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Sources */}
      {activeTab === 'sources' && !selectedSource && searchResults.length === 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Project Sources ({project.sources.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {}}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                <Download className="w-4 h-4" />
                <span>Export Sources</span>
              </button>
            </div>
          </div>
          
          {project.sources.length > 0 ? (
            <div className="space-y-4">
              {project.sources.map((source) => (
                <div key={source.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {source.title}
                        </h4>
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${source.status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            source.status === 'unverified' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }
                        `}>
                          {source.status}
                        </span>
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${source.type === 'academic' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                            source.type === 'news' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            source.type === 'journal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }
                        `}>
                          {source.type}
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {source.authors.join(', ')}
                        {source.publishedDate && ` • ${source.publishedDate.toLocaleDateString()}`}
                      </div>
                      
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        {source.summary}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-500" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>
                          Reliability: {Math.round(source.reliability.overall * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Added: {source.retrievedDate.toLocaleDateString()}
                        </span>
                      </div>
                      
                      {source.citations.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-3 h-3" />
                          <span>
                            {source.citations.length} citation{source.citations.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {source.status !== 'verified' && (
                        <button className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs hover:bg-green-200 dark:hover:bg-green-900/50">
                          <Check className="w-3 h-3" />
                          <span>Verify</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Sources Yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Search for sources to add to your research project
              </p>
              <button
                onClick={() => document.querySelector('input[type="text"]')?.focus()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
              >
                <Search className="w-4 h-4" />
                <span>Search for Sources</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Source Finding Tips */}
      {activeTab === 'sources' && !selectedSource && searchResults.length === 0 && project.sources.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Source Finding Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Use specific keywords related to your research topic</li>
            <li>• Filter by source type to find academic or journalistic sources</li>
            <li>• Check the reliability score before adding sources to your project</li>
            <li>• Verify information across multiple sources for accuracy</li>
            <li>• Consider the publication date to ensure information is current</li>
            <li>• Look for primary sources whenever possible</li>
          </ul>
        </div>
      )}
    </div>
  );
};