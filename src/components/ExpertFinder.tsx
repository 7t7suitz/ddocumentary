import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, Mail, Phone, 
  Globe, FileText, Star, ExternalLink, Filter,
  Download, Check, X, Clock, AlertTriangle
} from 'lucide-react';
import { ResearchProject, Expert, ResearchTopic } from '../types/research';
import { findExperts } from '../utils/researchService';

interface ExpertFinderProps {
  project: ResearchProject;
  onExpertAdd: (expert: Expert) => void;
}

export const ExpertFinder: React.FC<ExpertFinderProps> = ({
  project,
  onExpertAdd
}) => {
  const [searchTopics, setSearchTopics] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Expert[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [expertNotes, setExpertNotes] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  const handleSearch = async () => {
    if (searchTopics.length === 0) return;
    
    setIsSearching(true);
    try {
      const results = await findExperts(searchTopics);
      setSearchResults(results);
    } catch (error) {
      console.error('Expert search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExpertSelect = (expert: Expert) => {
    setSelectedExpert(expert);
    setExpertNotes('');
  };

  const addExpertToProject = () => {
    if (!selectedExpert) return;
    
    const updatedExpert: Expert = {
      ...selectedExpert,
      notes: expertNotes
    };
    
    onExpertAdd(updatedExpert);
    setSelectedExpert(null);
    setExpertNotes('');
  };

  const toggleTopicSelection = (topicId: string) => {
    if (searchTopics.includes(topicId)) {
      setSearchTopics(searchTopics.filter(id => id !== topicId));
    } else {
      setSearchTopics([...searchTopics, topicId]);
    }
  };

  const getAvailabilityColor = (availability: string): string => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'potentially-available': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'unavailable': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return <Check className="w-4 h-4 text-green-500" />;
      case 'potentially-available': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'unavailable': return <X className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredExperts = project.experts.filter(expert => {
    if (filterAvailability === 'all') return true;
    return expert.availability === filterAvailability;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Expert Finder
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Find and contact subject matter experts for interviews and insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Experts</option>
              <option value="available">Available</option>
              <option value="potentially-available">Potentially Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          
          <button
            onClick={() => {}}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <Download className="w-4 h-4" />
            <span>Export Experts</span>
          </button>
        </div>
      </div>

      {/* Topic Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Select Topics for Expert Search
          </h3>
        </div>
        
        {project.topics.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {project.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => toggleTopicSelection(topic.name)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors
                    ${searchTopics.includes(topic.name)
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <span>{topic.name}</span>
                  {searchTopics.includes(topic.name) && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-end">
              <button
                onClick={handleSearch}
                disabled={isSearching || searchTopics.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? 'Searching...' : 'Find Experts'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No topics available in the project. Add topics first.
            </p>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Research Topic</span>
            </button>
          </div>
        )}
      </div>

      {/* Expert Search Results */}
      {searchResults.length > 0 && !selectedExpert && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Expert Search Results ({searchResults.length})
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing experts for topics: {searchTopics.join(', ')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((expert) => (
              <div 
                key={expert.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleExpertSelect(expert)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {expert.name}
                    </h4>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {expert.title} • {expert.organization}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {expert.expertise.map((area, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(expert.availability)}`}>
                    {expert.availability.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>{expert.publications.length} publications</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Relevance: {Math.round(expert.relevance * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expert Details */}
      {selectedExpert && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Expert Details
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedExpert(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Back to Results
              </button>
              <button
                onClick={addExpertToProject}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add to Project</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Expert Info */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xl mb-1">
                      {selectedExpert.name}
                    </h4>
                    <div className="text-slate-600 dark:text-slate-400 mb-2">
                      {selectedExpert.title}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedExpert.organization}
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 text-sm rounded-full ${getAvailabilityColor(selectedExpert.availability)}`}>
                    {getAvailabilityIcon(selectedExpert.availability)}
                    <span className="ml-1">{selectedExpert.availability.replace('-', ' ')}</span>
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Areas of Expertise
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpert.expertise.map((area, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Publications
                    </h5>
                    <ul className="space-y-2">
                      {selectedExpert.publications.map((publication, index) => (
                        <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                          • {publication}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Notes
                    </h5>
                    <textarea
                      value={expertNotes}
                      onChange={(e) => setExpertNotes(e.target.value)}
                      placeholder="Add notes about this expert..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Contact Information
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedExpert.contactInfo?.email || 'Email not available'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedExpert.contactInfo?.phone || 'Phone not available'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedExpert.contactInfo?.website ? (
                        <a 
                          href={selectedExpert.contactInfo.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Website
                        </a>
                      ) : 'Website not available'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Relevance */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Relevance to Project
                  </h4>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(selectedExpert.relevance * 100)}%
                  </div>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.round(selectedExpert.relevance * 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  This expert's areas of expertise closely align with your research topics.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Experts */}
      {activeTab === 'experts' && !selectedExpert && searchResults.length === 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Project Experts ({filteredExperts.length})
            </h3>
          </div>
          
          {filteredExperts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExperts.map((expert) => (
                <div key={expert.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {expert.name}
                      </h4>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {expert.title} • {expert.organization}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {expert.expertise.map((area, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(expert.availability)}`}>
                      {expert.availability.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>{expert.publications.length} publications</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>Relevance: {Math.round(expert.relevance * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Experts Yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Search for experts to add to your research project
              </p>
              <button
                onClick={() => document.querySelector('button')?.focus()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
              >
                <Search className="w-4 h-4" />
                <span>Find Experts</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expert Finding Tips */}
      {activeTab === 'experts' && !selectedExpert && searchResults.length === 0 && filteredExperts.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Expert Finding Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Select specific research topics to find the most relevant experts</li>
            <li>• Look for experts with recent publications in your field</li>
            <li>• Consider experts from different organizations for diverse perspectives</li>
            <li>• Check availability before reaching out for interviews</li>
            <li>• Review an expert's previous interviews to understand their communication style</li>
            <li>• Prepare specific questions based on the expert's area of specialization</li>
          </ul>
        </div>
      )}
    </div>
  );
};