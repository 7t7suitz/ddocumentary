import React, { useState } from 'react';
import { MapPin, Star, AlertTriangle, CheckCircle, Camera, Clock, DollarSign } from 'lucide-react';
import { LocationDetails, Scene } from '../types';
import { generateLocationSuggestions } from '../utils/sceneAnalyzer';

interface LocationScoutingProps {
  scene: Scene;
  onSceneUpdate: (scene: Scene) => void;
}

export const LocationScouting: React.FC<LocationScoutingProps> = ({ scene, onSceneUpdate }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const newSuggestions = generateLocationSuggestions(scene.description);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getLocationTypeColor = (type: string) => {
    const colors = {
      'indoor': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'outdoor': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'office': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'home': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'public': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'studio': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Location Scouting
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Location details and scouting recommendations
          </p>
        </div>
        <button
          onClick={generateSuggestions}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          <MapPin className="w-4 h-4" />
          <span>{isGenerating ? 'Generating...' : 'Find Alternatives'}</span>
        </button>
      </div>

      {/* Current Location */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">Primary Location</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h5 className="font-medium text-slate-900 dark:text-slate-100">
                {scene.location.name}
              </h5>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLocationTypeColor(scene.location.type)}`}>
                {scene.location.type}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {scene.location.address}
            </p>

            {/* Accessibility Features */}
            <div className="space-y-2">
              <h6 className="text-sm font-medium text-slate-700 dark:text-slate-300">Accessibility</h6>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${scene.location.accessibility.parking ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-slate-600 dark:text-slate-400">Parking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${scene.location.accessibility.powerAccess ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-slate-600 dark:text-slate-400">Power Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${scene.location.accessibility.wifi ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-slate-600 dark:text-slate-400">WiFi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${scene.location.accessibility.restrooms ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-slate-600 dark:text-slate-400">Restrooms</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Logistics */}
            <div className="space-y-4">
              <div>
                <h6 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Logistics</h6>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-slate-600 dark:text-slate-400">Setup Time</div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {scene.location.logistics.setupTime} min
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-slate-600 dark:text-slate-400">Crew Size</div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {scene.location.logistics.crewSize} people
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permits */}
              {scene.location.permits.required && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Permit Required
                    </span>
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    <div>Type: {scene.location.permits.type}</div>
                    <div>Cost: ${scene.location.permits.cost}</div>
                    <div>Duration: {scene.location.permits.duration}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Characteristics */}
        {scene.location.characteristics.length > 0 && (
          <div className="mt-6">
            <h6 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Location Characteristics
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scene.location.characteristics.map((char, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-1 mt-1">
                    {renderStarRating(char.rating)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {char.type.replace('-', ' ')}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {char.description}
                    </div>
                    {char.notes && (
                      <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {char.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alternative Locations */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Alternative Locations
          </h4>
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-slate-900 dark:text-slate-100">
                      {suggestion.name}
                    </h5>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLocationTypeColor(suggestion.type)}`}>
                      {suggestion.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderStarRating(suggestion.rating)}
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {suggestion.rating}/5 rating
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Pros</h6>
                  <ul className="space-y-1">
                    {suggestion.pros.map((pro: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-slate-600 dark:text-slate-400">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Cons</h6>
                  <ul className="space-y-1">
                    {suggestion.cons.map((con: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-slate-600 dark:text-slate-400">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Reason for suggestion:</strong> {suggestion.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scouting Checklist */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-3">
          Location Scouting Checklist
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
              Technical Requirements
            </h6>
            <ul className="space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
              <li>• Power outlet locations and capacity</li>
              <li>• Natural lighting conditions throughout day</li>
              <li>• Acoustic properties and noise levels</li>
              <li>• Equipment access and load-in routes</li>
              <li>• Internet connectivity and cell service</li>
            </ul>
          </div>
          <div>
            <h6 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
              Logistics & Legal
            </h6>
            <ul className="space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
              <li>• Parking availability for crew and equipment</li>
              <li>• Permits and insurance requirements</li>
              <li>• Backup location identification</li>
              <li>• Weather contingency plans</li>
              <li>• Emergency contact information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};