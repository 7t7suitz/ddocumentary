import { MediaFile, MediaAnalysis, DetectedFace, Tag, DetectedObject, ColorAnalysis, QualityMetrics, DocumentaryValue } from '../types/media';

export const analyzeMediaFile = async (file: File): Promise<Partial<MediaFile>> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const url = URL.createObjectURL(file);
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  
  let metadata: any = {
    format: file.type,
    size: file.size
  };
  
  if (isImage) {
    metadata = await analyzeImageMetadata(file);
  } else if (isVideo) {
    metadata = await analyzeVideoMetadata(file);
  }
  
  const analysis = await generateMediaAnalysis(file, isImage);
  const tags = await generateAITags(file, analysis);
  const faces = isImage ? await detectFaces(file) : [];
  
  return {
    id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    type: isImage ? 'image' : isVideo ? 'video' : 'document',
    url,
    thumbnailUrl: isImage ? url : await generateVideoThumbnail(file),
    size: file.size,
    uploadedAt: new Date(),
    lastModified: new Date(file.lastModified),
    metadata,
    tags,
    faces,
    analysis,
    versions: [{
      id: 'original',
      type: 'original',
      url,
      size: file.size,
      format: file.type,
      createdAt: new Date()
    }],
    collections: [],
    status: 'ready'
  };
};

const analyzeImageMetadata = async (file: File): Promise<any> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        format: file.type,
        colorSpace: 'sRGB',
        exif: generateMockExifData(),
        camera: generateMockCameraInfo(),
        location: Math.random() > 0.7 ? generateMockLocation() : undefined
      });
    };
    img.src = URL.createObjectURL(file);
  });
};

const analyzeVideoMetadata = async (file: File): Promise<any> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        format: file.type,
        frameRate: 30, // Mock frame rate
        bitRate: Math.floor(file.size * 8 / video.duration),
        camera: generateMockCameraInfo(),
        location: Math.random() > 0.7 ? generateMockLocation() : undefined
      });
    };
    video.src = URL.createObjectURL(file);
  });
};

const generateMockExifData = () => ({
  make: ['Canon', 'Nikon', 'Sony', 'Fujifilm'][Math.floor(Math.random() * 4)],
  model: 'Camera Model',
  dateTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  exposureTime: ['1/60', '1/125', '1/250', '1/500'][Math.floor(Math.random() * 4)],
  fNumber: 2.8 + Math.random() * 8,
  iso: [100, 200, 400, 800, 1600][Math.floor(Math.random() * 5)],
  focalLength: 24 + Math.random() * 176,
  flash: Math.random() > 0.5,
  orientation: 1
});

const generateMockCameraInfo = () => ({
  make: ['Canon', 'Nikon', 'Sony', 'Fujifilm'][Math.floor(Math.random() * 4)],
  model: 'Professional Camera',
  lens: '24-70mm f/2.8',
  settings: {
    aperture: 'f/5.6',
    shutterSpeed: '1/125',
    iso: 400,
    focalLength: '50mm',
    exposureMode: 'Manual',
    whiteBalance: 'Auto'
  }
});

const generateMockLocation = () => ({
  latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
  longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
  address: '123 Main Street',
  city: 'New York',
  country: 'United States'
});

const generateMediaAnalysis = async (file: File, isImage: boolean): Promise<MediaAnalysis> => {
  const fileName = file.name.toLowerCase();
  
  // Generate description based on filename and type
  const description = generateDescription(fileName, isImage);
  
  // Generate objects based on common photography subjects
  const objects = generateDetectedObjects();
  
  // Generate scene analysis
  const scenes = generateDetectedScenes(fileName);
  
  // Generate color analysis
  const colors = generateColorAnalysis();
  
  // Generate composition analysis
  const composition = generateCompositionAnalysis();
  
  // Generate quality metrics
  const quality = generateQualityMetrics();
  
  // Generate documentary value
  const documentaryValue = generateDocumentaryValue(fileName, objects, scenes);
  
  return {
    description,
    objects,
    scenes,
    colors,
    composition,
    quality,
    documentaryValue
  };
};

const generateDescription = (fileName: string, isImage: boolean): string => {
  const descriptors = [
    'A professional photograph showing',
    'Documentary image capturing',
    'High-quality shot featuring',
    'Candid moment depicting',
    'Artistic composition of'
  ];
  
  const subjects = [
    'people in conversation',
    'urban landscape',
    'natural environment',
    'architectural details',
    'human interaction',
    'cultural scene',
    'everyday life moment',
    'professional setting'
  ];
  
  const qualities = [
    'with excellent lighting',
    'in natural setting',
    'with emotional depth',
    'showing authentic moments',
    'with strong composition'
  ];
  
  return `${descriptors[Math.floor(Math.random() * descriptors.length)]} ${subjects[Math.floor(Math.random() * subjects.length)]} ${qualities[Math.floor(Math.random() * qualities.length)]}.`;
};

const generateDetectedObjects = (): DetectedObject[] => {
  const commonObjects = [
    { name: 'person', category: 'people', confidence: 0.95 },
    { name: 'face', category: 'people', confidence: 0.92 },
    { name: 'building', category: 'architecture', confidence: 0.88 },
    { name: 'tree', category: 'nature', confidence: 0.85 },
    { name: 'car', category: 'vehicle', confidence: 0.82 },
    { name: 'chair', category: 'furniture', confidence: 0.78 },
    { name: 'table', category: 'furniture', confidence: 0.75 },
    { name: 'window', category: 'architecture', confidence: 0.72 },
    { name: 'door', category: 'architecture', confidence: 0.70 },
    { name: 'book', category: 'object', confidence: 0.68 }
  ];
  
  const numObjects = Math.floor(Math.random() * 5) + 2;
  const selectedObjects = commonObjects
    .sort(() => Math.random() - 0.5)
    .slice(0, numObjects);
  
  return selectedObjects.map((obj, index) => ({
    id: `obj-${index}`,
    name: obj.name,
    confidence: obj.confidence + (Math.random() - 0.5) * 0.1,
    boundingBox: {
      x: Math.random() * 0.6,
      y: Math.random() * 0.6,
      width: 0.2 + Math.random() * 0.3,
      height: 0.2 + Math.random() * 0.3
    },
    category: obj.category
  }));
};

const generateDetectedScenes = (fileName: string): any[] => {
  const scenes = [
    { name: 'indoor', confidence: 0.85, category: 'environment' },
    { name: 'outdoor', confidence: 0.75, category: 'environment' },
    { name: 'office', confidence: 0.70, category: 'location' },
    { name: 'home', confidence: 0.68, category: 'location' },
    { name: 'street', confidence: 0.65, category: 'location' },
    { name: 'nature', confidence: 0.62, category: 'environment' },
    { name: 'urban', confidence: 0.60, category: 'environment' }
  ];
  
  // Select 2-3 scenes based on filename hints
  const numScenes = Math.floor(Math.random() * 2) + 2;
  return scenes
    .sort(() => Math.random() - 0.5)
    .slice(0, numScenes)
    .map(scene => ({
      ...scene,
      confidence: scene.confidence + (Math.random() - 0.5) * 0.2
    }));
};

const generateColorAnalysis = (): ColorAnalysis => {
  const colorPalettes = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1'],
    ['#E74C3C', '#F39C12', '#F1C40F', '#27AE60', '#3498DB'],
    ['#8E44AD', '#9B59B6', '#E67E22', '#E74C3C', '#1ABC9C']
  ];
  
  const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  
  return {
    dominantColors: palette.slice(0, 3),
    colorPalette: palette,
    brightness: Math.random(),
    contrast: Math.random(),
    saturation: Math.random(),
    temperature: ['warm', 'cool', 'neutral'][Math.floor(Math.random() * 3)] as any
  };
};

const generateCompositionAnalysis = (): any => ({
  ruleOfThirds: Math.random() > 0.4,
  symmetry: Math.random(),
  leadingLines: Math.random() > 0.6,
  depth: Math.random(),
  balance: Math.random(),
  focusPoint: {
    x: 0.3 + Math.random() * 0.4,
    y: 0.3 + Math.random() * 0.4
  }
});

const generateQualityMetrics = (): QualityMetrics => {
  const sharpness = Math.random();
  const exposure = Math.random();
  const noise = Math.random();
  const overall = (sharpness + exposure + (1 - noise)) / 3;
  
  const issues = [];
  if (sharpness < 0.3) issues.push('Low sharpness detected');
  if (exposure < 0.2 || exposure > 0.8) issues.push('Exposure issues');
  if (noise > 0.7) issues.push('High noise levels');
  
  return {
    sharpness,
    exposure,
    noise,
    overall,
    issues
  };
};

const generateDocumentaryValue = (fileName: string, objects: DetectedObject[], scenes: any[]): DocumentaryValue => {
  const hasPeople = objects.some(obj => obj.category === 'people');
  const hasArchitecture = objects.some(obj => obj.category === 'architecture');
  const isOutdoor = scenes.some(scene => scene.name === 'outdoor');
  
  const narrativeScore = (hasPeople ? 0.3 : 0) + (hasArchitecture ? 0.2 : 0) + Math.random() * 0.5;
  const emotionalImpact = hasPeople ? 0.4 + Math.random() * 0.6 : Math.random() * 0.4;
  const historicalValue = hasArchitecture ? 0.3 + Math.random() * 0.4 : Math.random() * 0.3;
  const uniqueness = Math.random();
  
  const suggestedUse = [];
  if (narrativeScore > 0.6) suggestedUse.push('Main story element');
  if (emotionalImpact > 0.7) suggestedUse.push('Emotional moment');
  if (hasArchitecture) suggestedUse.push('Establishing shot');
  if (hasPeople) suggestedUse.push('Character introduction');
  
  const placementRecommendations = [
    {
      section: 'Opening sequence',
      confidence: narrativeScore,
      reason: 'Strong narrative potential',
      timing: 0.1
    },
    {
      section: 'Character development',
      confidence: emotionalImpact,
      reason: 'High emotional impact',
      timing: 0.4
    },
    {
      section: 'Conclusion',
      confidence: historicalValue,
      reason: 'Historical significance',
      timing: 0.8
    }
  ].filter(rec => rec.confidence > 0.5);
  
  return {
    narrativeScore,
    emotionalImpact,
    historicalValue,
    uniqueness,
    suggestedUse,
    placementRecommendations
  };
};

const generateAITags = async (file: File, analysis: MediaAnalysis): Promise<Tag[]> => {
  const tags: Tag[] = [];
  
  // Generate tags from objects
  analysis.objects.forEach((obj, index) => {
    if (obj.confidence > 0.7) {
      tags.push({
        id: `tag-obj-${index}`,
        name: obj.name,
        category: 'object',
        confidence: obj.confidence,
        source: 'ai',
        color: getRandomTagColor()
      });
    }
  });
  
  // Generate tags from scenes
  analysis.scenes.forEach((scene, index) => {
    if (scene.confidence > 0.6) {
      tags.push({
        id: `tag-scene-${index}`,
        name: scene.name,
        category: 'location',
        confidence: scene.confidence,
        source: 'ai',
        color: getRandomTagColor()
      });
    }
  });
  
  // Generate color tags
  if (analysis.colors.temperature) {
    tags.push({
      id: 'tag-color-temp',
      name: `${analysis.colors.temperature} tones`,
      category: 'color',
      confidence: 0.8,
      source: 'ai',
      color: analysis.colors.dominantColors[0]
    });
  }
  
  // Generate quality tags
  if (analysis.quality.overall > 0.8) {
    tags.push({
      id: 'tag-quality',
      name: 'high quality',
      category: 'technical',
      confidence: analysis.quality.overall,
      source: 'ai',
      color: '#10B981'
    });
  }
  
  // Generate documentary value tags
  if (analysis.documentaryValue.narrativeScore > 0.7) {
    tags.push({
      id: 'tag-narrative',
      name: 'strong narrative',
      category: 'style',
      confidence: analysis.documentaryValue.narrativeScore,
      source: 'ai',
      color: '#8B5CF6'
    });
  }
  
  return tags;
};

const detectFaces = async (file: File): Promise<DetectedFace[]> => {
  // Simulate face detection
  const numFaces = Math.floor(Math.random() * 3);
  const faces: DetectedFace[] = [];
  
  for (let i = 0; i < numFaces; i++) {
    faces.push({
      id: `face-${i}`,
      boundingBox: {
        x: Math.random() * 0.6,
        y: Math.random() * 0.6,
        width: 0.15 + Math.random() * 0.2,
        height: 0.15 + Math.random() * 0.2
      },
      confidence: 0.8 + Math.random() * 0.2,
      emotions: generateEmotions(),
      age: 20 + Math.floor(Math.random() * 50),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      landmarks: generateFaceLandmarks()
    });
  }
  
  return faces;
};

const generateEmotions = () => {
  const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust'];
  const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  
  return emotions.map(emotion => ({
    emotion,
    confidence: emotion === primaryEmotion ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3
  }));
};

const generateFaceLandmarks = () => [
  { type: 'left_eye', x: 0.3, y: 0.4 },
  { type: 'right_eye', x: 0.7, y: 0.4 },
  { type: 'nose', x: 0.5, y: 0.6 },
  { type: 'mouth', x: 0.5, y: 0.8 }
];

const generateVideoThumbnail = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.onloadeddata = () => {
      video.currentTime = video.duration * 0.1; // 10% into video
    };
    
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      resolve(canvas.toDataURL());
    };
    
    video.src = URL.createObjectURL(file);
  });
};

const getRandomTagColor = (): string => {
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const searchMedia = (mediaFiles: MediaFile[], query: any): MediaFile[] => {
  let results = [...mediaFiles];
  
  // Text search
  if (query.text) {
    const searchText = query.text.toLowerCase();
    results = results.filter(media => 
      media.name.toLowerCase().includes(searchText) ||
      media.analysis.description.toLowerCase().includes(searchText) ||
      media.tags.some(tag => tag.name.toLowerCase().includes(searchText))
    );
  }
  
  // Tag filter
  if (query.tags && query.tags.length > 0) {
    results = results.filter(media =>
      query.tags.some((tagName: string) =>
        media.tags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())
      )
    );
  }
  
  // Date range filter
  if (query.dateRange) {
    results = results.filter(media =>
      media.uploadedAt >= query.dateRange.start &&
      media.uploadedAt <= query.dateRange.end
    );
  }
  
  // Type filter
  if (query.type && query.type.length > 0) {
    results = results.filter(media => query.type.includes(media.type));
  }
  
  // Face filter
  if (query.faces && query.faces.length > 0) {
    results = results.filter(media =>
      media.faces.some(face =>
        query.faces.includes(face.personName || face.id)
      )
    );
  }
  
  // Quality filter
  if (query.quality) {
    results = results.filter(media =>
      media.analysis.quality.overall >= query.quality.min &&
      media.analysis.quality.overall <= query.quality.max
    );
  }
  
  return results;
};

export const generateSmartCollections = (mediaFiles: MediaFile[]): any[] => {
  const collections = [];
  
  // Group by date
  const dateGroups = groupByDate(mediaFiles);
  Object.entries(dateGroups).forEach(([date, files]) => {
    if (files.length >= 5) {
      collections.push({
        id: `date-${date}`,
        name: `Photos from ${date}`,
        type: 'auto',
        mediaIds: files.map(f => f.id),
        confidence: 0.9
      });
    }
  });
  
  // Group by location
  const locationGroups = groupByLocation(mediaFiles);
  Object.entries(locationGroups).forEach(([location, files]) => {
    if (files.length >= 3) {
      collections.push({
        id: `location-${location}`,
        name: `Photos from ${location}`,
        type: 'auto',
        mediaIds: files.map(f => f.id),
        confidence: 0.8
      });
    }
  });
  
  // Group by people
  const peopleGroups = groupByPeople(mediaFiles);
  Object.entries(peopleGroups).forEach(([person, files]) => {
    if (files.length >= 3) {
      collections.push({
        id: `person-${person}`,
        name: `Photos with ${person}`,
        type: 'auto',
        mediaIds: files.map(f => f.id),
        confidence: 0.85
      });
    }
  });
  
  return collections;
};

const groupByDate = (mediaFiles: MediaFile[]) => {
  return mediaFiles.reduce((groups, media) => {
    const date = media.uploadedAt.toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(media);
    return groups;
  }, {} as Record<string, MediaFile[]>);
};

const groupByLocation = (mediaFiles: MediaFile[]) => {
  return mediaFiles.reduce((groups, media) => {
    const location = media.metadata.location?.city || 'Unknown';
    if (!groups[location]) groups[location] = [];
    groups[location].push(media);
    return groups;
  }, {} as Record<string, MediaFile[]>);
};

const groupByPeople = (mediaFiles: MediaFile[]) => {
  return mediaFiles.reduce((groups, media) => {
    media.faces.forEach(face => {
      const person = face.personName || `Person ${face.id}`;
      if (!groups[person]) groups[person] = [];
      groups[person].push(media);
    });
    return groups;
  }, {} as Record<string, MediaFile[]>);
};