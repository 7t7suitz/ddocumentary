import React, { useState } from 'react';
import { 
  Clock, Calendar, Plus, Edit3, Trash2, 
  MapPin, Users, FileText, Filter, Download,
  ChevronRight, ChevronLeft, Star
} from 'lucide-react';
import { ResearchProject, TimelineEvent } from '../types/research';
import { generateTimeline } from '../utils/researchService';
import { format } from 'date-fns';

interface ResearchTimelineProps {
  project: ResearchProject;
  onProjectUpdate: (project: ResearchProject) => void;
}

export const ResearchTimeline: React.FC<ResearchTimelineProps> = ({
  project,
  onProjectUpdate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    title: '',
    date: new Date(),
    description: '',
    sources: [],
    importance: 'medium',
    type: 'historical',
    people: [],
    notes: ''
  });
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'historical' | 'contemporary' | 'future'>('all');
  const [filterImportance, setFilterImportance] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const generateTimelineEvents = async () => {
    if (project.sources.length === 0) return;
    
    setIsGenerating(true);
    try {
      const events = generateTimeline(project.sources, project.claims);
      
      onProjectUpdate({
        ...project,
        timeline: [...project.timeline, ...events]
      });
    } catch (error) {
      console.error('Timeline generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.description) return;
    
    const event: TimelineEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title || '',
      date: newEvent.date || new Date(),
      description: newEvent.description || '',
      sources: newEvent.sources || [],
      importance: newEvent.importance as 'high' | 'medium' | 'low' || 'medium',
      type: newEvent.type as 'historical' | 'contemporary' | 'future' || 'historical',
      location: newEvent.location,
      people: newEvent.people || [],
      media: newEvent.media || [],
      notes: newEvent.notes || ''
    };
    
    onProjectUpdate({
      ...project,
      timeline: [...project.timeline, event].sort((a, b) => a.date.getTime() - b.date.getTime())
    });
    
    setIsAddingEvent(false);
    setNewEvent({
      title: '',
      date: new Date(),
      description: '',
      sources: [],
      importance: 'medium',
      type: 'historical',
      people: [],
      notes: ''
    });
  };

  const updateEvent = (eventId: string, updates: Partial<TimelineEvent>) => {
    onProjectUpdate({
      ...project,
      timeline: project.timeline.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      )
    });
  };

  const deleteEvent = (eventId: string) => {
    onProjectUpdate({
      ...project,
      timeline: project.timeline.filter(event => event.id !== eventId)
    });
    
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    }
  };

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'historical': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'contemporary': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'future': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const filteredEvents = project.timeline
    .filter(event => filterType === 'all' || event.type === filterType)
    .filter(event => filterImportance === 'all' || event.importance === filterImportance)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Research Timeline
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Chronological view of events related to your research
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Types</option>
                <option value="historical">Historical</option>
                <option value="contemporary">Contemporary</option>
                <option value="future">Future</option>
              </select>
            </div>
            
            <select
              value={filterImportance}
              onChange={(e) => setFilterImportance(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Importance</option>
              <option value="high">High Importance</option>
              <option value="medium">Medium Importance</option>
              <option value="low">Low Importance</option>
            </select>
          </div>
          
          <button
            onClick={() => setIsAddingEvent(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
          
          <button
            onClick={generateTimelineEvents}
            disabled={isGenerating || project.sources.length === 0}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Timeline'}</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Event Form */}
      {isAddingEvent && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Add Timeline Event
            </h3>
            <button
              onClick={() => setIsAddingEvent(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Event Title*
              </label>
              <input
                type="text"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Enter event title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date*
              </label>
              <input
                type="date"
                value={newEvent.date ? format(newEvent.date, 'yyyy-MM-dd') : ''}
                onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description*
              </label>
              <textarea
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                rows={3}
                placeholder="Describe the event"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Event Type
              </label>
              <select
                value={newEvent.type || 'historical'}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="historical">Historical</option>
                <option value="contemporary">Contemporary</option>
                <option value="future">Future</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Importance
              </label>
              <select
                value={newEvent.importance || 'medium'}
                onChange={(e) => setNewEvent({ ...newEvent, importance: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                value={newEvent.location || ''}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Event location"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                People Involved (Optional)
              </label>
              <input
                type="text"
                value={newEvent.people?.join(', ') || ''}
                onChange={(e) => setNewEvent({ 
                  ...newEvent, 
                  people: e.target.value.split(',').map(p => p.trim()).filter(p => p) 
                })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Names separated by commas"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={newEvent.notes || ''}
                onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                rows={2}
                placeholder="Additional notes about this event"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => setIsAddingEvent(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            
            <button
              onClick={addEvent}
              disabled={!newEvent.title || !newEvent.date || !newEvent.description}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>
      )}

      {/* Timeline Visualization */}
      {filteredEvents.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Timeline ({filteredEvents.length} events)
          </h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
            
            <div className="space-y-8">
              {filteredEvents.map((event) => (
                <div key={event.id} className="relative flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-800
                    ${event.importance === 'high' 
                      ? 'bg-red-500' 
                      : event.importance === 'medium' 
                      ? 'bg-amber-500' 
                      : 'bg-blue-500'
                    }
                  `}>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {event.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {format(event.date, 'MMMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(event.importance)}`}>
                            {event.importance}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                        <div className="flex items-center space-x-4">
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          {event.people && event.people.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{event.people.length} people</span>
                            </div>
                          )}
                          
                          {event.sources && event.sources.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>{event.sources.length} sources</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Clock className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Timeline Events Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Add events manually or generate a timeline from your sources
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsAddingEvent(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
            
            <button
              onClick={generateTimelineEvents}
              disabled={isGenerating || project.sources.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
              <span>Generate Timeline</span>
            </button>
          </div>
        </div>
      )}

      {/* Event Details */}
      {selectedEvent && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Event Details
            </h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={selectedEvent.title}
                  onChange={(e) => updateEvent(selectedEvent.id, { title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={format(selectedEvent.date, 'yyyy-MM-dd')}
                  onChange={(e) => updateEvent(selectedEvent.id, { date: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedEvent.description}
                  onChange={(e) => updateEvent(selectedEvent.id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  rows={4}
                />
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Event Type
                </label>
                <select
                  value={selectedEvent.type}
                  onChange={(e) => updateEvent(selectedEvent.id, { type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="historical">Historical</option>
                  <option value="contemporary">Contemporary</option>
                  <option value="future">Future</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Importance
                </label>
                <select
                  value={selectedEvent.importance}
                  onChange={(e) => updateEvent(selectedEvent.id, { importance: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={selectedEvent.location || ''}
                  onChange={(e) => updateEvent(selectedEvent.id, { location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  placeholder="Event location"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  People Involved
                </label>
                <input
                  type="text"
                  value={selectedEvent.people.join(', ')}
                  onChange={(e) => updateEvent(selectedEvent.id, { 
                    people: e.target.value.split(',').map(p => p.trim()).filter(p => p) 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  placeholder="Names separated by commas"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={selectedEvent.notes}
              onChange={(e) => updateEvent(selectedEvent.id, { notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              rows={3}
              placeholder="Additional notes about this event"
            />
          </div>
          
          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              onClick={() => deleteEvent(selectedEvent.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Event</span>
            </button>
            
            <button
              onClick={() => setSelectedEvent(null)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Timeline Tips */}
      {project.timeline.length === 0 && !isAddingEvent && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Timeline Creation Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Use the "Generate Timeline" button to automatically extract events from your sources</li>
            <li>• Add key historical events to provide context for your documentary</li>
            <li>• Mark important events with "high" importance for emphasis</li>
            <li>• Include location information to create geographical context</li>
            <li>• Add people involved in each event to track key figures throughout your timeline</li>
            <li>• Use the timeline to identify patterns and connections between events</li>
          </ul>
        </div>
      )}
    </div>
  );
};