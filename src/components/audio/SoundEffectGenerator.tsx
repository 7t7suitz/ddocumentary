import React, { useState } from 'react';
import { 
  Volume2, Search, Play, Pause, 
  Download, Plus, Filter, Clock, 
  Zap, Loader2, Trash2
} from 'lucide-react';
import { AudioProject, SoundEffectRecommendation } from '../../types/audio';
import { generateSoundEffectRecommendations } from '../../utils/audioProcessor';

interface SoundEffectGeneratorProps {
  project: AudioProject;
  onProjectUpdate: (project: AudioProject) => void;
}

export const SoundEffectGenerator: React.FC<SoundEffectGeneratorProps> = ({
  project,
  onProjectUpdate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  
  const generateRecommendations = async () => {
    if (!category) return;
    
    setIsGenerating(true);
    try {
      const recommendations = await generateSoundEffectRecommendations(category, duration);
      
      onProjectUpdate({
        ...project,
        soundEffectRecommendations: [...project.soundEffectRecommendations, ...recommendations]
      });
    } catch (error) {
      console.error('Failed to generate sound effect recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addToProject = (recommendation: SoundEffectRecommendation) => {
    // Check if already added
    if (project.soundEffectRecommendations.some(r => r.id === recommendation.id)) {
      return;
    }
    
    onProjectUpdate({
      ...project,
      soundEffectRecommendations: [...project.soundEffectRecommendations, recommendation]
    });
  };

  const removeFromProject = (id: string) => {
    onProjectUpdate({
      ...project,
      soundEffectRecommendations: project.soundEffectRecommendations.filter(r => r.id !== id)
    });
  };

  const playPreview = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
      // Stop audio playback
    } else {
      setPlayingId(id);
      // Start audio playback simulation
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      'nature': '#10B981', // green
      'urban': '#3B82F6', // blue
      'household': '#8B5CF6', // purple
      'technology': '#6366F1', // indigo
      'transportation': '#F59E0B', // amber
      'human': '#EC4899', // pink
      'animals': '#F97316', // orange
      'weather': '#14B8A6', // teal
      'ambience': '#6B7280', // gray
    };
    
    return categoryColors[category.toLowerCase()] || '#6B7280'; // gray default
  };

  const filteredRecommendations = project.soundEffectRecommendations.filter(rec => {
    const matchesSearch = rec.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || rec.category.toLowerCase() === filterCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const allCategories = Array.from(new Set(project.soundEffectRecommendations.map(r => r.category.toLowerCase())));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Sound Effect Generator
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Find the perfect sound effects for your documentary
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={generateRecommendations}
            disabled={isGenerating || !category}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Sound Effects'}</span>
          </button>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Volume2 className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Sound Effect Finder
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category*
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Category</option>
              <option value="nature">Nature</option>
              <option value="urban">Urban</option>
              <option value="household">Household</option>
              <option value="technology">Technology</option>
              <option value="transportation">Transportation</option>
              <option value="human">Human</option>
              <option value="animals">Animals</option>
              <option value="weather">Weather</option>
              <option value="ambience">Ambience</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={duration || ''}
              onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 5"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              min="1"
              max="60"
            />
          </div>
        </div>
      </div>

      {/* Sound Effect Library */}
      {project.soundEffectRecommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Sound Effect Library
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sounds..."
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {recommendation.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(recommendation.category) }}
                        />
                        <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                          {recommendation.category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => playPreview(recommendation.id)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"
                      >
                        {playingId === recommendation.id ? (
                          <Pause className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        ) : (
                          <Play className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => removeFromProject(recommendation.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                    {recommendation.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(recommendation.duration)}</span>
                    </div>
                    
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      Match confidence: {Math.round(recommendation.confidence * 100)}%
                    </div>
                  </div>
                  
                  {recommendation.tags.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex flex-wrap gap-1">
                        {recommendation.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredRecommendations.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No sound effects found matching your criteria
            </div>
          )}
        </div>
      )}

      {/* Sound Effect Suggestions */}
      {isGenerating ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Generating Sound Effect Recommendations
            </h3>
          </div>
          
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Finding the perfect sound effects for your {category} scenes
            </p>
            <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-indigo-500 animate-pulse rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ) : project.soundEffectRecommendations.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Volume2 className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Sound Effects Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Select a category and generate recommendations to find the perfect sound effects
          </p>
          <button
            onClick={generateRecommendations}
            disabled={!category}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 mx-auto"
          >
            <Volume2 className="w-4 h-4" />
            <span>Generate Sound Effects</span>
          </button>
        </div>
      )}

      {/* Sound Design Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Sound Design Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Use ambient sounds to establish location and atmosphere</li>
          <li>• Layer multiple sound effects for a richer, more realistic soundscape</li>
          <li>• Subtle sound effects can enhance emotional impact without being distracting</li>
          <li>• Consider the psychological impact of different sounds on your audience</li>
          <li>• Balance sound effects with dialogue and music for a cohesive mix</li>
          <li>• Use sound transitions to smooth cuts between scenes</li>
        </ul>
      </div>
    </div>
  );
};