import React, { useState, useMemo } from 'react';
import { Grid, List, Calendar, Map, Users, Tag, Search, Filter, SortAsc, Eye, Download, Share2 } from 'lucide-react';
import { MediaFile, SearchQuery } from '../types/media';
import { searchMedia } from '../utils/mediaAnalyzer';
import { format } from 'date-fns';

interface MediaLibraryProps {
  mediaFiles: MediaFile[];
  onMediaSelect: (media: MediaFile) => void;
  selectedMedia: MediaFile[];
  onSelectionChange: (media: MediaFile[]) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  mediaFiles,
  onMediaSelect,
  selectedMedia,
  onSelectionChange
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({});
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'relevance'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMedia = useMemo(() => {
    let results = searchMedia(mediaFiles, { ...searchQuery, text: searchText });
    
    // Sort results
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'relevance':
          comparison = (b.analysis.documentaryValue.narrativeScore || 0) - (a.analysis.documentaryValue.narrativeScore || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return results;
  }, [mediaFiles, searchQuery, searchText, sortBy, sortOrder]);

  const handleMediaClick = (media: MediaFile, isCtrlClick: boolean = false) => {
    if (isCtrlClick) {
      const isSelected = selectedMedia.some(m => m.id === media.id);
      if (isSelected) {
        onSelectionChange(selectedMedia.filter(m => m.id !== media.id));
      } else {
        onSelectionChange([...selectedMedia, media]);
      }
    } else {
      onMediaSelect(media);
    }
  };

  const handleSelectAll = () => {
    if (selectedMedia.length === filteredMedia.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredMedia);
    }
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filteredMedia.map((media) => {
        const isSelected = selectedMedia.some(m => m.id === media.id);
        
        return (
          <div
            key={media.id}
            onClick={(e) => handleMediaClick(media, e.ctrlKey || e.metaKey)}
            className={`
              relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200
              ${isSelected 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md hover:scale-105'
              }
            `}
          >
            <div className="aspect-square bg-slate-100 dark:bg-slate-800">
              {media.type === 'image' ? (
                <img
                  src={media.thumbnailUrl || media.url}
                  alt={media.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">{getMediaTypeIcon(media.type)}</span>
                </div>
              )}
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <button className="p-1 bg-white rounded-full shadow-md hover:bg-slate-100">
                    <Eye className="w-3 h-3 text-slate-600" />
                  </button>
                  <button className="p-1 bg-white rounded-full shadow-md hover:bg-slate-100">
                    <Download className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white text-xs truncate">{media.name}</div>
                <div className="text-white text-xs opacity-75">
                  {format(media.uploadedAt, 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
            
            {/* Quality indicator */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className={`
                px-2 py-1 rounded text-xs font-medium
                ${media.analysis.quality.overall > 0.8 
                  ? 'bg-green-500 text-white' 
                  : media.analysis.quality.overall > 0.6 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-red-500 text-white'
                }
              `}>
                {Math.round(media.analysis.quality.overall * 100)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredMedia.map((media) => {
        const isSelected = selectedMedia.some(m => m.id === media.id);
        
        return (
          <div
            key={media.id}
            onClick={(e) => handleMediaClick(media, e.ctrlKey || e.metaKey)}
            className={`
              flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800' 
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }
            `}
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
              {media.type === 'image' ? (
                <img
                  src={media.thumbnailUrl || media.url}
                  alt={media.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">{getMediaTypeIcon(media.type)}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {media.name}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-500 capitalize">
                  {media.type}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                <span>{format(media.uploadedAt, 'MMM d, yyyy')}</span>
                <span>{formatFileSize(media.size)}</span>
                {media.metadata.width && media.metadata.height && (
                  <span>{media.metadata.width} × {media.metadata.height}</span>
                )}
                <span className="flex items-center space-x-1">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${media.analysis.quality.overall > 0.8 
                      ? 'bg-green-500' 
                      : media.analysis.quality.overall > 0.6 
                      ? 'bg-amber-500' 
                      : 'bg-red-500'
                    }
                  `} />
                  <span>Quality: {Math.round(media.analysis.quality.overall * 100)}%</span>
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {media.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
                {media.tags.length > 3 && (
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                    +{media.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Eye className="w-4 h-4 text-slate-500" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Download className="w-4 h-4 text-slate-500" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Share2 className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTimelineView = () => {
    const groupedByDate = filteredMedia.reduce((groups, media) => {
      const date = format(media.uploadedAt, 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(media);
      return groups;
    }, {} as Record<string, MediaFile[]>);

    return (
      <div className="space-y-8">
        {Object.entries(groupedByDate).map(([date, mediaList]) => (
          <div key={date}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaList.map((media) => {
                const isSelected = selectedMedia.some(m => m.id === media.id);
                
                return (
                  <div
                    key={media.id}
                    onClick={(e) => handleMediaClick(media, e.ctrlKey || e.metaKey)}
                    className={`
                      relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                      ${isSelected 
                        ? 'ring-2 ring-blue-500 shadow-lg' 
                        : 'hover:shadow-md hover:scale-105'
                      }
                    `}
                  >
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800">
                      {media.type === 'image' ? (
                        <img
                          src={media.thumbnailUrl || media.url}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">{getMediaTypeIcon(media.type)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (mediaFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/20 dark:to-purple-950/20 rounded-full flex items-center justify-center">
          <Grid className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          No Media Files Yet
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Upload your first media files to start building your intelligent media library with AI-powered organization and tagging.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-64"
            />
          </div>
          
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
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="relevance">Relevance</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <SortAsc className={`w-4 h-4 text-slate-500 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Grid className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <List className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      {selectedMedia.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedMedia.length} item{selectedMedia.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              {selectedMedia.length === filteredMedia.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Tag className="w-4 h-4" />
              <span>Add Tags</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>
          Showing {filteredMedia.length} of {mediaFiles.length} files
        </span>
        <span>
          Total size: {formatFileSize(filteredMedia.reduce((sum, media) => sum + media.size, 0))}
        </span>
      </div>

      {/* Media Grid/List */}
      <div>
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'list' && renderListView()}
        {viewMode === 'timeline' && renderTimelineView()}
      </div>
    </div>
  );
};