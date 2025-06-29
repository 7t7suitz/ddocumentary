import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Phone, AlertTriangle, Download, Share2 } from 'lucide-react';
import { CallSheet as CallSheetType, Scene, WeatherForecast } from '../types';
import { generateWeatherForecast } from '../utils/sceneAnalyzer';
import { format, addDays } from 'date-fns';

interface CallSheetProps {
  scene: Scene;
  shootDate: Date;
}

export const CallSheet: React.FC<CallSheetProps> = ({ scene, shootDate }) => {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCallSheet = async () => {
    setIsGenerating(true);
    try {
      const weatherForecast = generateWeatherForecast(shootDate);
      setWeather(weatherForecast);
    } catch (error) {
      console.error('Failed to generate call sheet:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    generateCallSheet();
  }, [shootDate]);

  const exportCallSheet = () => {
    const callSheetData = {
      projectTitle: scene.title,
      shootDate: shootDate.toISOString(),
      location: scene.location,
      weather,
      crew: scene.crew,
      equipment: scene.equipment,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(callSheetData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-sheet-${format(shootDate, 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareCallSheet = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Call Sheet - ${scene.title}`,
          text: `Production call sheet for ${format(shootDate, 'MMMM d, yyyy')}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Call sheet URL copied to clipboard!');
    }
  };

  const getWeatherIcon = (condition: string) => {
    const icons = {
      'clear': '☀️',
      'partly-cloudy': '⛅',
      'overcast': '☁️',
      'foggy': '🌫️',
      'rainy': '🌧️',
      'stormy': '⛈️',
      'snowy': '❄️',
      'windy': '💨'
    };
    return icons[condition as keyof typeof icons] || '☀️';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Call Sheet
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Production call sheet for {format(shootDate, 'MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportCallSheet}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={shareCallSheet}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Header Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Production Details
            </h4>
            <div className="space-y-1 text-sm">
              <div className="text-blue-800 dark:text-blue-200">
                <strong>Project:</strong> {scene.title}
              </div>
              <div className="text-blue-800 dark:text-blue-200">
                <strong>Date:</strong> {format(shootDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-blue-800 dark:text-blue-200">
                <strong>Duration:</strong> {scene.duration} minutes
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Location
            </h4>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{scene.location.name}</span>
              </div>
              <div>{scene.location.address}</div>
              <div className="capitalize">{scene.location.type} location</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Weather Forecast
            </h4>
            {weather ? (
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getWeatherIcon(weather.condition)}</span>
                  <span className="capitalize">{weather.condition.replace('-', ' ')}</span>
                </div>
                <div>Temperature: {weather.temperature.low}°-{weather.temperature.high}°C</div>
                <div>Wind: {weather.wind.speed} km/h {weather.wind.direction}</div>
                <div>Precipitation: {weather.precipitation}%</div>
              </div>
            ) : (
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Loading weather forecast...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {weather?.alerts && weather.alerts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-semibold text-amber-900 dark:text-amber-100">
              Weather Alerts
            </h4>
          </div>
          <ul className="space-y-1">
            {weather.alerts.map((alert, index) => (
              <li key={index} className="text-sm text-amber-800 dark:text-amber-200">
                • {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Crew Schedule */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Crew Schedule
          </h4>
        </div>
        
        <div className="space-y-4">
          {scene.crew.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                    {member.role.replace('-', ' ')}
                  </div>
                  {member.name && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {member.name}
                    </div>
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {member.responsibilities.join(', ')}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {format(member.callTime, 'HH:mm')} - {format(member.wrapTime, 'HH:mm')}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  ${member.rate}/day
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Checklist */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Equipment Checklist
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Camera & Lenses</h5>
            <div className="space-y-2">
              {scene.equipment.cameras.map((camera, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {camera.model} ({camera.quantity}x)
                  </span>
                </div>
              ))}
              {scene.equipment.lenses.map((lens, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {lens.focal} {lens.aperture} ({lens.quantity}x)
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Lighting & Audio</h5>
            <div className="space-y-2">
              {scene.equipment.lighting.map((light, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {light.type} {light.wattage}W ({light.quantity}x)
                  </span>
                </div>
              ))}
              {scene.equipment.audio.map((audio, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {audio.model} ({audio.quantity}x)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Phone className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h4 className="font-semibold text-red-900 dark:text-red-100">
            Emergency Contacts
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-red-800 dark:text-red-200">Emergency Services</div>
            <div className="text-red-700 dark:text-red-300">Police: 911</div>
            <div className="text-red-700 dark:text-red-300">Fire: 911</div>
            <div className="text-red-700 dark:text-red-300">Medical: 911</div>
          </div>
          <div>
            <div className="font-medium text-red-800 dark:text-red-200">Production</div>
            <div className="text-red-700 dark:text-red-300">Producer: (555) 123-4567</div>
            <div className="text-red-700 dark:text-red-300">Director: (555) 234-5678</div>
            <div className="text-red-700 dark:text-red-300">Location Manager: (555) 345-6789</div>
          </div>
          <div>
            <div className="font-medium text-red-800 dark:text-red-200">Location</div>
            <div className="text-red-700 dark:text-red-300">Nearest Hospital: (555) 456-7890</div>
            <div className="text-red-700 dark:text-red-300">Location Contact: (555) 567-8901</div>
            <div className="text-red-700 dark:text-red-300">Security: (555) 678-9012</div>
          </div>
        </div>
      </div>

      {/* Production Notes */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Production Notes
        </h4>
        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <p>{scene.notes}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <strong>Setup Time:</strong> {scene.location.logistics.setupTime} minutes
            </div>
            <div>
              <strong>Breakdown Time:</strong> {scene.location.logistics.breakdown} minutes
            </div>
            <div>
              <strong>Crew Size:</strong> {scene.location.logistics.crewSize} people
            </div>
            <div>
              <strong>Equipment Access:</strong> {scene.location.logistics.equipmentAccess}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};