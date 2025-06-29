import React, { useState } from 'react';
import { Users, UserPlus, Edit3, Trash2, Eye, Search, Tag } from 'lucide-react';
import { MediaFile, Person, DetectedFace } from '../types/media';

interface FaceRecognitionProps {
  mediaFiles: MediaFile[];
  onPersonUpdate: (person: Person) => void;
}

export const FaceRecognition: React.FC<FaceRecognitionProps> = ({
  mediaFiles,
  onPersonUpdate
}) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isCreatingPerson, setIsCreatingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  // Extract all faces from media files
  const allFaces = mediaFiles.flatMap(media => 
    media.faces.map(face => ({ ...face, mediaId: media.id, mediaName: media.name }))
  );

  // Group unidentified faces
  const unidentifiedFaces = allFaces.filter(face => !face.personId);

  // Get media files for a specific person
  const getPersonMedia = (personId: string) => {
    return mediaFiles.filter(media => 
      media.faces.some(face => face.personId === personId)
    );
  };

  const createPerson = () => {
    if (!newPersonName.trim()) return;

    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: newPersonName,
      aliases: [],
      faceIds: [],
      mediaCount: 0,
      firstSeen: new Date(),
      lastSeen: new Date(),
      verified: false,
      relationships: []
    };

    setPeople([...people, newPerson]);
    setNewPersonName('');
    setIsCreatingPerson(false);
    onPersonUpdate(newPerson);
  };

  const assignFaceToPerson = (faceId: string, personId: string) => {
    // Update the person's face list
    setPeople(people.map(person => 
      person.id === personId 
        ? { ...person, faceIds: [...person.faceIds, faceId] }
        : person
    ));

    // This would typically update the media files as well
    // For now, we'll just simulate the assignment
  };

  const renderPersonCard = (person: Person) => {
    const personMedia = getPersonMedia(person.id);
    
    return (
      <div
        key={person.id}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {person.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span>{person.faceIds.length} faces</span>
                <span>•</span>
                <span>{personMedia.length} photos</span>
                {person.verified && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 dark:text-green-400">Verified</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedPerson(person)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Edit3 className="w-4 h-4 text-slate-500" />
            </button>
            <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Sample faces */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {personMedia.slice(0, 4).map((media, index) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
              <img
                src={media.thumbnailUrl || media.url}
                alt={`${person.name} in ${media.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Person stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {person.faceIds.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Faces</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {personMedia.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Photos</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {Math.round((person.lastSeen.getTime() - person.firstSeen.getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Days</div>
          </div>
        </div>
      </div>
    );
  };

  const renderUnidentifiedFaces = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Unidentified Faces ({unidentifiedFaces.length})
        </h3>
        <button
          onClick={() => setIsCreatingPerson(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Person</span>
        </button>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {unidentifiedFaces.slice(0, 24).map((face, index) => {
          const media = mediaFiles.find(m => m.id === face.mediaId);
          if (!media) return null;

          return (
            <div
              key={`${face.mediaId}-${face.id}`}
              className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-400"
            >
              <img
                src={media.thumbnailUrl || media.url}
                alt={`Unidentified face in ${media.name}`}
                className="w-full h-full object-cover"
              />
              
              {/* Face bounding box overlay */}
              <div
                className="absolute border-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  left: `${face.boundingBox.x * 100}%`,
                  top: `${face.boundingBox.y * 100}%`,
                  width: `${face.boundingBox.width * 100}%`,
                  height: `${face.boundingBox.height * 100}%`
                }}
              />
              
              {/* Confidence score */}
              <div className="absolute top-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                {Math.round(face.confidence * 100)}%
              </div>
              
              {/* Action buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      // Open person assignment modal
                    }}
                    className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {unidentifiedFaces.length > 24 && (
        <div className="mt-4 text-center">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">
            Show {unidentifiedFaces.length - 24} more faces
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Face Recognition
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage people and organize photos by faces
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search people..."
              className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {people.length}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Identified People</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {allFaces.length}
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">Total Faces</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {unidentifiedFaces.length}
          </div>
          <div className="text-sm text-amber-700 dark:text-amber-300">Unidentified</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round((allFaces.length - unidentifiedFaces.length) / allFaces.length * 100) || 0}%
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">Identified</div>
        </div>
      </div>

      {/* Unidentified Faces */}
      {unidentifiedFaces.length > 0 && renderUnidentifiedFaces()}

      {/* People Grid */}
      {people.length > 0 ? (
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Identified People
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map(renderPersonCard)}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No People Identified Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Start by identifying faces in your photos to organize them by people
          </p>
        </div>
      )}

      {/* Create Person Modal */}
      {isCreatingPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Add New Person
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Person Name
                </label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  placeholder="Enter person's name"
                  autoFocus
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setIsCreatingPerson(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={createPerson}
                  disabled={!newPersonName.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Person
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};