import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-500 dark:text-slate-400">
          No timeline events found in this document
        </p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Timeline Analysis
        </h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600"></div>

        <div className="space-y-8">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="relative flex items-start space-x-4">
              {/* Timeline dot */}
              <div className={`
                relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900
                ${event.type === 'turning-point' 
                  ? 'bg-red-500' 
                  : event.type === 'milestone' 
                  ? 'bg-emerald-500' 
                  : 'bg-blue-500'
                }
              `}>
                <div className={`
                  w-2 h-2 rounded-full
                  ${event.type === 'turning-point' 
                    ? 'bg-red-100' 
                    : event.type === 'milestone' 
                    ? 'bg-emerald-100' 
                    : 'bg-blue-100'
                  }
                `}></div>
              </div>

              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {event.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {event.date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${event.type === 'turning-point' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                          : event.type === 'milestone' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }
                      `}>
                        {event.type.replace('-', ' ')}
                      </span>
                      
                      {/* Importance indicator */}
                      <div className="flex items-center space-x-1">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                            style={{ width: `${event.importance * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-4">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      {event.characters.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {event.characters.length} character{event.characters.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {event.themes.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {event.themes.length} theme{event.themes.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <span className="text-slate-500 dark:text-slate-500">
                      Event #{index + 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};