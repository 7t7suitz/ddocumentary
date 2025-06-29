import React, { useState } from 'react';
import { 
  Music, Search, Play, Pause, 
  Download, Plus, Filter, Clock, 
  Heart, Zap, Volume2, Loader2
} from 'lucide-react';
import { AudioProject, MusicRecommendation } from '../../types/audio';
import { generateMusicRecommendations } from '../../utils/audioProcessor';

interface MusicRecommenderProps {
  project: AudioProject;
  onProjectUpdate: (project: AudioProject) => void;
}

export const MusicRecommender: React.FC<MusicRecommenderProps> = ({
  project,
  onProjectUpdate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [mood, setMood] = useState('');
  const [tempo, setTempo] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  
  const generateRecommendations = async () => {
    if (!mood) return;
    
    setIsGenerating(true);
    try {
      const recommendations = await generateMusicRecommendations(mood, tempo, duration);
      
      onProjectUpdate({
        ...project,
        musicRecommendations: [...project.musicRecommendations, ...recommendations]
      });
    } catch (error) {
      console.error('Failed to generate music recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addToProject = (recommendation: MusicRecommendation) => {
    // Check if already added
    if (project.musicRecommendations.some(r => r.id === recommendation.id)) {
      return;
    }
    
    onProjectUpdate({
      ...project,
      musicRecommendations: [...project.musicRecommendations, recommendation]
    });
  };

  const removeFromProject = (id: string) => {
    onProjectUpdate({
      ...project,
      musicRecommendations: project.musicRecommendations.filter(r => r.id !== id)
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

  const getMoodColor = (mood: string): string => {
    const moodColors: Record<string, string> = {
      'upbeat': '#10B981', // green
      'cheerful': '#10B981', // green
      'happy': '#10B981', // green
      'sad': '#3B82F6', // blue
      'melancholic': '#3B82F6', // blue
      'emotional': '#3B82F6', // blue
      'reflective': '#8B5CF6', // purple
      'dramatic': '#EF4444', // red
      'intense': '#EF4444', // red
      'peaceful': '#14B8A6', // teal
      'serene': '#14B8A6', // teal
      'ambient': '#14B8A6', // teal
      'relaxed': '#14B8A6', // teal
      'energetic': '#F59E0B', // amber
      'powerful': '#F59E0B', // amber
    };
    
    return moodColors[mood.toLowerCase()] || '#6B7280'; // gray default
  };

  const filteredRecommendations = project.musicRecommendations.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         rec.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.mood.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMood = filterMood === 'all' || rec.mood.toLowerCase() === filterMood.toLowerCase();
    const matchesGenre = filterGenre === 'all' || rec.genre.toLowerCase() === filterGenre.toLowerCase();
    
    return matchesSearch && matchesMood && matchesGenre;
  });

  const allMoods = Array.from(new Set(project.musicRecommendations.map(r => r.mood.toLowerCase())));
  const allGenres = Array.from(new Set(project.musicRecommendations.map(r => r.genre.toLowerCase())));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Music Recommendations
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Get AI-powered music suggestions based on mood and tempo
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={generateRecommendations}
            disabled={isGenerating || !mood}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            <Music className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Music Finder
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mood*
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Mood</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="tense">Tense</option>
              <option value="calm">Calm</option>
              <option value="epic">Epic</option>
              <option value="mysterious">Mysterious</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tempo (BPM)
            </label>
            <input
              type="number"
              value={tempo || ''}
              onChange={(e) => setTempo(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 120"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              min="60"
              max="200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={duration || ''}
              onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 60"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              min="10"
              max="300"
            />
          </div>
        </div>
      </div>

      {/* Music Library */}
      {project.musicRecommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Music className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Music Library
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search music..."
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
                />
              </div>
              
              <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Moods</option>
                {allMoods.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
              
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Genres</option>
                {allGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
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
                        {recommendation.title}
                      </h4>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {recommendation.artist}
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Genre</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                        {recommendation.genre}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Mood</div>
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getMoodColor(recommendation.mood) }}
                        />
                        <div className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                          {recommendation.mood}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Tempo</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {recommendation.tempo} BPM
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Duration</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {formatDuration(recommendation.duration)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Key Instruments</div>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.instruments.map((instrument, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs"
                        >
                          {instrument}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Match confidence: {Math.round(recommendation.confidence * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredRecommendations.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No music found matching your criteria
            </div>
          )}
        </div>
      )}

      {/* Music Suggestions */}
      {isGenerating ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Generating Music Recommendations
            </h3>
          </div>
          
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Analyzing mood, tempo, and musical characteristics to find the perfect soundtrack
            </p>
            <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-indigo-500 animate-pulse rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ) : project.musicRecommendations.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Music className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Music Recommendations Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Select a mood and generate recommendations to find the perfect soundtrack
          </p>
          <button
            onClick={generateRecommendations}
            disabled={!mood}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 mx-auto"
          >
            <Music className="w-4 h-4" />
            <span>Generate Recommendations</span>
          </button>
        </div>
      )}

      {/* Music Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Music Selection Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Choose music that enhances the emotional tone without overwhelming it</li>
          <li>• Match music tempo to the pacing of your scene</li>
          <li>• Consider using leitmotifs (recurring themes) for key subjects or concepts</li>
          <li>• Ensure music transitions align with narrative shifts</li>
          <li>• Balance music volume with dialogue and ambient sound</li>
          <li>• Remember to secure proper licensing for all music used in your project</li>
        </ul>
      </div>
    </div>
  );
};