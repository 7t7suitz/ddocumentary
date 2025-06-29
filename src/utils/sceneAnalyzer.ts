import { Scene, Shot, LightingSetup, AudioDesign, LocationDetails, EquipmentList } from '../types';

export const analyzeSceneDescription = async (description: string): Promise<Scene> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const lowerDesc = description.toLowerCase();
  
  return {
    id: `scene-${Date.now()}`,
    title: extractSceneTitle(description),
    description,
    location: analyzeLocation(lowerDesc),
    timeOfDay: extractTimeOfDay(lowerDesc),
    weather: extractWeather(lowerDesc),
    duration: estimateSceneDuration(description),
    shots: generateShotList(description),
    lighting: analyzeLighting(lowerDesc),
    audio: analyzeAudio(lowerDesc),
    equipment: generateEquipmentList(lowerDesc),
    crew: generateCrewRequirements(lowerDesc),
    notes: generateProductionNotes(lowerDesc),
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

const extractSceneTitle = (description: string): string => {
  const sentences = description.split(/[.!?]+/);
  const firstSentence = sentences[0]?.trim();
  
  if (firstSentence && firstSentence.length < 50) {
    return firstSentence;
  }
  
  // Extract key elements for title
  const words = description.split(' ').slice(0, 8);
  return words.join(' ') + (description.split(' ').length > 8 ? '...' : '');
};

const analyzeLocation = (description: string): LocationDetails => {
  let locationType: any = 'indoor';
  let locationName = 'Studio';
  
  // Determine location type
  if (description.includes('outdoor') || description.includes('outside') || 
      description.includes('park') || description.includes('street') ||
      description.includes('forest') || description.includes('beach')) {
    locationType = 'outdoor';
    locationName = 'Outdoor Location';
  }
  
  if (description.includes('office') || description.includes('workplace')) {
    locationType = 'office';
    locationName = 'Office Building';
  }
  
  if (description.includes('home') || description.includes('house') || description.includes('apartment')) {
    locationType = 'home';
    locationName = 'Residential Location';
  }
  
  if (description.includes('public') || description.includes('restaurant') || description.includes('store')) {
    locationType = 'public';
    locationName = 'Public Venue';
  }
  
  return {
    name: locationName,
    address: 'TBD - Location scouting required',
    type: locationType,
    characteristics: generateLocationCharacteristics(description),
    accessibility: {
      parking: true,
      loadIn: 'Standard access',
      powerAccess: true,
      restrooms: true,
      catering: false,
      wifi: locationType === 'office' || locationType === 'public',
      cellService: true
    },
    permits: {
      required: locationType === 'public' || locationType === 'outdoor',
      type: locationType === 'public' ? 'Public filming permit' : 'Location release',
      cost: locationType === 'public' ? 500 : 0,
      duration: '1 day',
      restrictions: locationType === 'outdoor' ? ['Weather dependent', 'Daylight hours only'] : [],
      contact: 'Location manager TBD'
    },
    logistics: {
      travelTime: 30,
      setupTime: locationType === 'outdoor' ? 90 : 60,
      breakdown: 45,
      crewSize: 6,
      equipmentAccess: 'Good',
      backup: false
    },
    alternatives: [],
    scouting: {
      visitDate: new Date(),
      timeOfDay: 'morning',
      weather: 'clear',
      photos: [],
      measurements: 'TBD during scout',
      concerns: [],
      opportunities: []
    }
  };
};

const generateLocationCharacteristics = (description: string): any[] => {
  const characteristics = [];
  
  if (description.includes('bright') || description.includes('window') || description.includes('natural light')) {
    characteristics.push({
      type: 'lighting',
      description: 'Good natural light available',
      rating: 4,
      notes: 'Large windows provide excellent natural lighting'
    });
  }
  
  if (description.includes('quiet') || description.includes('peaceful')) {
    characteristics.push({
      type: 'acoustics',
      description: 'Quiet environment suitable for dialogue',
      rating: 4,
      notes: 'Minimal ambient noise'
    });
  }
  
  if (description.includes('spacious') || description.includes('large') || description.includes('open')) {
    characteristics.push({
      type: 'space',
      description: 'Ample space for equipment and crew',
      rating: 5,
      notes: 'Sufficient room for multiple camera angles'
    });
  }
  
  return characteristics;
};

const extractTimeOfDay = (description: string): any => {
  if (description.includes('dawn') || description.includes('sunrise')) return 'dawn';
  if (description.includes('morning')) return 'morning';
  if (description.includes('noon') || description.includes('midday')) return 'midday';
  if (description.includes('afternoon')) return 'afternoon';
  if (description.includes('golden hour') || description.includes('sunset')) return 'golden-hour';
  if (description.includes('dusk') || description.includes('twilight')) return 'dusk';
  if (description.includes('night') || description.includes('evening')) return 'night';
  if (description.includes('blue hour')) return 'blue-hour';
  
  return 'midday';
};

const extractWeather = (description: string): any => {
  if (description.includes('rain') || description.includes('storm')) return 'rainy';
  if (description.includes('cloud') || description.includes('overcast')) return 'overcast';
  if (description.includes('fog') || description.includes('mist')) return 'foggy';
  if (description.includes('snow')) return 'snowy';
  if (description.includes('wind')) return 'windy';
  if (description.includes('partly cloudy')) return 'partly-cloudy';
  
  return 'clear';
};

const estimateSceneDuration = (description: string): number => {
  const words = description.split(' ').length;
  const baseTime = Math.max(2, Math.min(10, words * 0.1));
  
  // Adjust for complexity indicators
  let multiplier = 1;
  if (description.includes('complex') || description.includes('multiple')) multiplier = 1.5;
  if (description.includes('simple') || description.includes('quick')) multiplier = 0.7;
  if (description.includes('dialogue') || description.includes('conversation')) multiplier = 1.3;
  
  return Math.round(baseTime * multiplier);
};

const generateShotList = (description: string): Shot[] => {
  const shots: Shot[] = [];
  const lowerDesc = description.toLowerCase();
  
  // Analyze for shot types based on content
  const shotSequence = determineShotSequence(lowerDesc);
  
  shotSequence.forEach((shotType, index) => {
    shots.push({
      id: `shot-${index + 1}`,
      shotNumber: `${index + 1}`,
      type: shotType,
      angle: determineAngle(lowerDesc, shotType),
      movement: determineMovement(lowerDesc, index),
      lens: determineLens(shotType),
      frameRate: 24,
      duration: Math.max(3, Math.random() * 8 + 2),
      description: generateShotDescription(shotType, lowerDesc),
      composition: generateComposition(shotType, lowerDesc),
      focus: generateFocusSettings(shotType),
      exposure: generateExposureSettings(lowerDesc),
      notes: generateShotNotes(shotType, lowerDesc)
    });
  });
  
  return shots;
};

const determineShotSequence = (description: string): any[] => {
  const sequence = [];
  
  // Standard documentary/interview sequence
  if (description.includes('interview') || description.includes('conversation')) {
    sequence.push('wide', 'medium', 'close-up', 'over-shoulder');
  }
  // Action or movement sequence
  else if (description.includes('action') || description.includes('movement') || description.includes('walking')) {
    sequence.push('wide', 'medium-wide', 'medium', 'close-up', 'insert');
  }
  // Location or establishing sequence
  else if (description.includes('location') || description.includes('establishing') || description.includes('environment')) {
    sequence.push('extreme-wide', 'wide', 'medium-wide', 'medium');
  }
  // Detail or product sequence
  else if (description.includes('detail') || description.includes('product') || description.includes('object')) {
    sequence.push('medium', 'close-up', 'extreme-close-up', 'insert');
  }
  // Default narrative sequence
  else {
    sequence.push('wide', 'medium', 'close-up');
  }
  
  return sequence;
};

const determineAngle = (description: string, shotType: any): any => {
  if (description.includes('high angle') || description.includes('looking down')) return 'high-angle';
  if (description.includes('low angle') || description.includes('looking up')) return 'low-angle';
  if (description.includes('overhead') || description.includes('bird')) return 'birds-eye';
  if (description.includes('ground level') || description.includes('worm')) return 'worms-eye';
  if (description.includes('tilted') || description.includes('dutch')) return 'dutch-angle';
  if (description.includes('profile') || description.includes('side')) return 'profile';
  
  return 'eye-level';
};

const determineMovement = (description: string, index: number): any => {
  if (description.includes('pan')) return index % 2 === 0 ? 'pan-right' : 'pan-left';
  if (description.includes('tilt')) return 'tilt-up';
  if (description.includes('zoom')) return 'zoom-in';
  if (description.includes('dolly') || description.includes('push')) return 'dolly-in';
  if (description.includes('track') || description.includes('follow')) return 'tracking';
  if (description.includes('handheld') || description.includes('dynamic')) return 'handheld';
  if (description.includes('smooth') || description.includes('steadicam')) return 'steadicam';
  if (description.includes('crane') || description.includes('aerial')) return 'crane';
  
  return 'static';
};

const determineLens = (shotType: any): any => {
  switch (shotType) {
    case 'extreme-wide': return '14mm';
    case 'wide': return '24mm';
    case 'medium-wide': return '35mm';
    case 'medium': return '50mm';
    case 'close-up': return '85mm';
    case 'extreme-close-up': return 'macro';
    default: return '50mm';
  }
};

const generateShotDescription = (shotType: any, description: string): string => {
  const shotDescriptions = {
    'extreme-wide': 'Establishing shot showing the full environment and context',
    'wide': 'Wide shot capturing the subject and immediate surroundings',
    'medium-wide': 'Medium wide shot showing subject from knees up',
    'medium': 'Medium shot framing subject from waist up',
    'close-up': 'Close-up shot focusing on facial expressions and emotions',
    'extreme-close-up': 'Extreme close-up highlighting specific details',
    'over-shoulder': 'Over-shoulder shot showing conversation dynamics',
    'insert': 'Insert shot of important details or objects'
  };
  
  return shotDescriptions[shotType] || 'Standard shot composition';
};

const generateComposition = (shotType: any, description: string): any => {
  return {
    ruleOfThirds: true,
    leadingLines: description.includes('lines') ? ['Architectural elements', 'Natural lines'] : [],
    symmetry: description.includes('symmetr') ? 'horizontal' : 'none',
    depth: shotType === 'close-up' ? 'shallow' : shotType === 'wide' ? 'deep' : 'medium',
    foreground: 'Subject placement',
    midground: 'Supporting elements',
    background: 'Environmental context',
    colorPalette: generateColorPalette(description)
  };
};

const generateColorPalette = (description: string): any => {
  let mood = 'neutral';
  let primary = '#4A90E2';
  let secondary = '#7ED321';
  let accent = '#F5A623';
  
  if (description.includes('warm') || description.includes('sunset') || description.includes('golden')) {
    mood = 'warm';
    primary = '#E74C3C';
    secondary = '#F39C12';
    accent = '#E67E22';
  } else if (description.includes('cool') || description.includes('blue') || description.includes('cold')) {
    mood = 'cool';
    primary = '#3498DB';
    secondary = '#2ECC71';
    accent = '#9B59B6';
  } else if (description.includes('dramatic') || description.includes('dark') || description.includes('moody')) {
    mood = 'dramatic';
    primary = '#2C3E50';
    secondary = '#34495E';
    accent = '#E74C3C';
  }
  
  return {
    primary,
    secondary,
    accent,
    mood,
    saturation: description.includes('vibrant') ? 'high' : description.includes('muted') ? 'low' : 'medium',
    contrast: description.includes('high contrast') ? 'high' : description.includes('soft') ? 'low' : 'medium'
  };
};

const generateFocusSettings = (shotType: any): any => {
  return {
    type: 'single',
    point: shotType === 'close-up' ? 'subject' : 'center',
    aperture: shotType === 'close-up' ? 'f/2.8' : shotType === 'wide' ? 'f/8' : 'f/5.6',
    depthOfField: shotType === 'close-up' ? 'shallow' : shotType === 'wide' ? 'deep' : 'medium'
  };
};

const generateExposureSettings = (description: string): any => {
  const isLowLight = description.includes('night') || description.includes('dark') || description.includes('dim');
  const isBright = description.includes('bright') || description.includes('sunny') || description.includes('daylight');
  
  return {
    iso: isLowLight ? 1600 : isBright ? 100 : 400,
    shutterSpeed: '1/50',
    aperture: 'f/5.6',
    exposureCompensation: 0,
    meteringMode: 'matrix'
  };
};

const generateShotNotes = (shotType: any, description: string): string => {
  const notes = [];
  
  if (shotType === 'close-up') {
    notes.push('Focus on emotional expression');
  }
  if (description.includes('movement')) {
    notes.push('Follow action smoothly');
  }
  if (description.includes('dialogue')) {
    notes.push('Ensure clear audio capture');
  }
  
  return notes.join('. ') || 'Standard shot execution';
};

const analyzeLighting = (description: string): LightingSetup => {
  const timeOfDay = extractTimeOfDay(description);
  const isIndoor = !description.includes('outdoor') && !description.includes('outside');
  
  let style: any = 'three-point';
  let mood: any = 'neutral';
  let colorTemp = 5600;
  
  // Determine lighting style
  if (description.includes('natural')) style = 'natural';
  if (description.includes('dramatic') || description.includes('moody')) {
    style = 'rembrandt';
    mood = 'dramatic';
  }
  if (description.includes('bright') || description.includes('cheerful')) {
    style = 'high-key';
    mood = 'bright';
  }
  if (description.includes('silhouette')) style = 'silhouette';
  
  // Adjust color temperature
  if (timeOfDay === 'golden-hour' || timeOfDay === 'dusk') colorTemp = 3200;
  if (timeOfDay === 'blue-hour' || timeOfDay === 'night') colorTemp = 4000;
  if (isIndoor) colorTemp = 3200;
  
  return {
    style,
    keyLight: {
      type: 'key',
      equipment: isIndoor ? 'LED Panel 1K' : 'Natural sunlight',
      position: { x: 45, y: 30, z: 100, rotation: 45 },
      intensity: 80,
      color: '#FFFFFF',
      diffusion: 60,
      angle: 45
    },
    fillLight: {
      type: 'fill',
      equipment: 'LED Panel 500W',
      position: { x: -30, y: 20, z: 80, rotation: -30 },
      intensity: 40,
      color: '#FFFFFF',
      diffusion: 80,
      angle: 60
    },
    backLight: {
      type: 'back',
      equipment: 'LED Strip',
      position: { x: 0, y: 45, z: -50, rotation: 180 },
      intensity: 60,
      color: '#FFFFFF',
      diffusion: 20,
      angle: 30
    },
    practicalLights: generatePracticalLights(description),
    modifiers: generateLightModifiers(style),
    colorTemperature: colorTemp,
    mood,
    timeOfDay: timeOfDay as any,
    weather: extractWeather(description) as any
  };
};

const generatePracticalLights = (description: string): any[] => {
  const practicals = [];
  
  if (description.includes('lamp') || description.includes('table light')) {
    practicals.push({
      id: 'practical-1',
      type: 'Table lamp',
      position: 'Background right',
      intensity: 30,
      color: '#FFA500',
      purpose: 'Ambient background lighting'
    });
  }
  
  if (description.includes('window') || description.includes('natural light')) {
    practicals.push({
      id: 'practical-2',
      type: 'Window light',
      position: 'Camera left',
      intensity: 70,
      color: '#FFFFFF',
      purpose: 'Natural key light source'
    });
  }
  
  return practicals;
};

const generateLightModifiers = (style: string): any[] => {
  const modifiers = [];
  
  if (style === 'three-point' || style === 'rembrandt') {
    modifiers.push({
      type: 'softbox',
      size: '2x3 feet',
      position: 'Key light',
      purpose: 'Soften key light'
    });
    
    modifiers.push({
      type: 'reflector',
      size: '32 inch',
      position: 'Fill side',
      purpose: 'Bounce fill light'
    });
  }
  
  if (style === 'dramatic') {
    modifiers.push({
      type: 'flag',
      size: '2x3 feet',
      position: 'Camera right',
      purpose: 'Control spill light'
    });
  }
  
  return modifiers;
};

const analyzeAudio = (description: string): AudioDesign => {
  const hasDialogue = description.includes('dialogue') || description.includes('conversation') || description.includes('interview');
  const isOutdoor = description.includes('outdoor') || description.includes('outside');
  
  return {
    dialogue: {
      micType: hasDialogue ? (isOutdoor ? 'boom' : 'lavalier') : 'boom',
      placement: hasDialogue ? 'Close to subject' : 'Ambient capture',
      backup: hasDialogue,
      windProtection: isOutdoor,
      roomTone: true
    },
    music: generateMusicSettings(description),
    soundEffects: generateSoundEffects(description),
    ambience: {
      environment: isOutdoor ? 'Natural outdoor' : 'Indoor room tone',
      volume: 20,
      characteristics: generateAmbienceCharacteristics(description),
      recordingMethod: 'live'
    },
    recordingNotes: generateAudioNotes(description, hasDialogue, isOutdoor)
  };
};

const generateMusicSettings = (description: string): any => {
  let style = 'Cinematic';
  let mood = 'Neutral';
  let tempo: any = 'medium';
  
  if (description.includes('dramatic') || description.includes('intense')) {
    style = 'Orchestral';
    mood = 'Dramatic';
    tempo = 'fast';
  } else if (description.includes('peaceful') || description.includes('calm')) {
    style = 'Ambient';
    mood = 'Peaceful';
    tempo = 'slow';
  } else if (description.includes('upbeat') || description.includes('energetic')) {
    style = 'Electronic';
    mood = 'Energetic';
    tempo = 'fast';
  }
  
  return {
    style,
    mood,
    tempo,
    instruments: generateInstruments(style),
    volume: 'background',
    timing: 'underscore'
  };
};

const generateInstruments = (style: string): string[] => {
  switch (style) {
    case 'Orchestral':
      return ['Strings', 'Brass', 'Woodwinds', 'Percussion'];
    case 'Electronic':
      return ['Synthesizer', 'Electronic drums', 'Bass synth'];
    case 'Ambient':
      return ['Pad synths', 'Atmospheric textures', 'Subtle percussion'];
    default:
      return ['Piano', 'Strings', 'Light percussion'];
  }
};

const generateSoundEffects = (description: string): any[] => {
  const effects = [];
  
  if (description.includes('door')) {
    effects.push({
      id: 'sfx-1',
      type: 'Door sound',
      description: 'Door opening/closing',
      timing: 'As needed',
      volume: 60,
      source: 'foley'
    });
  }
  
  if (description.includes('footsteps') || description.includes('walking')) {
    effects.push({
      id: 'sfx-2',
      type: 'Footsteps',
      description: 'Character movement',
      timing: 'Sync with action',
      volume: 40,
      source: 'foley'
    });
  }
  
  if (description.includes('phone') || description.includes('notification')) {
    effects.push({
      id: 'sfx-3',
      type: 'Phone/notification',
      description: 'Device sounds',
      timing: 'Specific moments',
      volume: 70,
      source: 'library'
    });
  }
  
  return effects;
};

const generateAmbienceCharacteristics = (description: string): string[] => {
  const characteristics = [];
  
  if (description.includes('city') || description.includes('urban')) {
    characteristics.push('Traffic noise', 'Urban ambience', 'Distant voices');
  } else if (description.includes('nature') || description.includes('forest')) {
    characteristics.push('Bird songs', 'Wind in trees', 'Natural sounds');
  } else if (description.includes('office')) {
    characteristics.push('Air conditioning', 'Keyboard typing', 'Phone rings');
  } else {
    characteristics.push('Room tone', 'Subtle ambience');
  }
  
  return characteristics;
};

const generateAudioNotes = (description: string, hasDialogue: boolean, isOutdoor: boolean): string => {
  const notes = [];
  
  if (hasDialogue) {
    notes.push('Prioritize clear dialogue capture');
  }
  
  if (isOutdoor) {
    notes.push('Monitor wind noise and use windscreen');
    notes.push('Consider backup indoor location for audio');
  }
  
  if (description.includes('echo') || description.includes('reverb')) {
    notes.push('Manage room acoustics and echo');
  }
  
  notes.push('Record room tone for post-production');
  notes.push('Monitor audio levels throughout shoot');
  
  return notes.join('. ');
};

const generateEquipmentList = (description: string): EquipmentList => {
  const isOutdoor = description.includes('outdoor') || description.includes('outside');
  const hasMovement = description.includes('movement') || description.includes('tracking');
  const hasDialogue = description.includes('dialogue') || description.includes('conversation');
  
  return {
    cameras: [
      {
        id: 'cam-1',
        model: 'Sony FX6',
        type: 'primary',
        settings: '4K 24fps',
        accessories: ['Battery grip', 'Memory cards', 'Lens filters'],
        quantity: 1
      },
      {
        id: 'cam-2',
        model: 'Sony A7S III',
        type: 'secondary',
        settings: '4K 24fps',
        accessories: ['Extra batteries', 'Memory cards'],
        quantity: 1
      }
    ],
    lenses: generateLensEquipment(),
    lighting: generateLightingEquipment(isOutdoor),
    audio: generateAudioEquipmentList(hasDialogue, isOutdoor),
    support: generateSupportEquipment(hasMovement),
    accessories: generateAccessories(),
    power: generatePowerEquipment(isOutdoor),
    storage: generateStorageEquipment()
  };
};

const generateLensEquipment = (): any[] => {
  return [
    {
      id: 'lens-1',
      focal: '24-70mm',
      aperture: 'f/2.8',
      type: 'Zoom',
      purpose: 'Primary shooting lens',
      quantity: 1
    },
    {
      id: 'lens-2',
      focal: '85mm',
      aperture: 'f/1.4',
      type: 'Prime',
      purpose: 'Portrait and close-ups',
      quantity: 1
    },
    {
      id: 'lens-3',
      focal: '16-35mm',
      aperture: 'f/2.8',
      type: 'Wide zoom',
      purpose: 'Wide shots and establishing',
      quantity: 1
    }
  ];
};

const generateLightingEquipment = (isOutdoor: boolean): any[] => {
  const equipment = [
    {
      id: 'light-1',
      type: 'LED Panel',
      wattage: 1000,
      modifiers: ['Softbox', 'Barn doors'],
      stands: true,
      quantity: 2
    },
    {
      id: 'light-2',
      type: 'LED Strip',
      wattage: 500,
      modifiers: ['Diffusion', 'Color gels'],
      stands: true,
      quantity: 1
    }
  ];
  
  if (!isOutdoor) {
    equipment.push({
      id: 'light-3',
      type: 'Practical lamp',
      wattage: 100,
      modifiers: ['Dimmer'],
      stands: false,
      quantity: 2
    });
  }
  
  return equipment;
};

const generateAudioEquipmentList = (hasDialogue: boolean, isOutdoor: boolean): any[] => {
  const equipment = [
    {
      id: 'audio-1',
      type: 'Audio recorder',
      model: 'Zoom F6',
      purpose: 'Primary audio recording',
      accessories: ['Memory cards', 'Batteries'],
      quantity: 1
    }
  ];
  
  if (hasDialogue) {
    equipment.push({
      id: 'audio-2',
      type: 'Boom microphone',
      model: 'Rode NTG3',
      purpose: 'Dialogue capture',
      accessories: ['Boom pole', 'Windscreen', 'Shock mount'],
      quantity: 1
    });
    
    equipment.push({
      id: 'audio-3',
      type: 'Wireless lavalier',
      model: 'Sennheiser G4',
      purpose: 'Backup dialogue',
      accessories: ['Transmitter', 'Receiver', 'Batteries'],
      quantity: 2
    });
  }
  
  if (isOutdoor) {
    equipment.push({
      id: 'audio-4',
      type: 'Wind protection',
      model: 'Rycote windshield',
      purpose: 'Outdoor recording',
      accessories: ['Dead cat', 'Suspension'],
      quantity: 1
    });
  }
  
  return equipment;
};

const generateSupportEquipment = (hasMovement: boolean): any[] => {
  const equipment = [
    {
      id: 'support-1',
      type: 'tripod',
      model: 'Manfrotto 502',
      capacity: '15kg',
      purpose: 'Static shots',
      quantity: 2
    }
  ];
  
  if (hasMovement) {
    equipment.push({
      id: 'support-2',
      type: 'gimbal',
      model: 'DJI RS3',
      capacity: '3kg',
      purpose: 'Smooth movement',
      quantity: 1
    });
    
    equipment.push({
      id: 'support-3',
      type: 'slider',
      model: 'Rhino Arc II',
      capacity: '5kg',
      purpose: 'Linear movement',
      quantity: 1
    });
  }
  
  return equipment;
};

const generateAccessories = (): any[] => {
  return [
    {
      id: 'acc-1',
      type: 'Memory cards',
      description: 'CFexpress Type A',
      purpose: 'Camera storage',
      quantity: 6
    },
    {
      id: 'acc-2',
      type: 'Lens filters',
      description: 'ND and polarizing filters',
      purpose: 'Exposure control',
      quantity: 1
    },
    {
      id: 'acc-3',
      type: 'Cleaning kit',
      description: 'Lens cleaning supplies',
      purpose: 'Equipment maintenance',
      quantity: 1
    }
  ];
};

const generatePowerEquipment = (isOutdoor: boolean): any[] => {
  const equipment = [
    {
      id: 'power-1',
      type: 'battery',
      capacity: 'V-Mount 150Wh',
      duration: '4 hours',
      quantity: 8
    },
    {
      id: 'power-2',
      type: 'charger',
      capacity: 'Dual V-Mount',
      duration: '2 hour charge',
      quantity: 2
    }
  ];
  
  if (isOutdoor) {
    equipment.push({
      id: 'power-3',
      type: 'power-bank',
      capacity: '20000mAh',
      duration: '8 hours',
      quantity: 4
    });
  } else {
    equipment.push({
      id: 'power-4',
      type: 'extension',
      capacity: '20A',
      duration: 'Continuous',
      quantity: 3
    });
  }
  
  return equipment;
};

const generateStorageEquipment = (): any[] => {
  return [
    {
      id: 'storage-1',
      type: 'memory-card',
      capacity: '128GB CFexpress',
      speed: '1700MB/s',
      quantity: 4
    },
    {
      id: 'storage-2',
      type: 'ssd',
      capacity: '2TB',
      speed: '1000MB/s',
      quantity: 2
    },
    {
      id: 'storage-3',
      type: 'hard-drive',
      capacity: '8TB',
      speed: '7200RPM',
      quantity: 1
    }
  ];
};

const generateCrewRequirements = (description: string): any[] => {
  const baseTime = new Date();
  baseTime.setHours(8, 0, 0, 0); // 8 AM call time
  
  const crew = [
    {
      role: 'director',
      callTime: new Date(baseTime),
      wrapTime: new Date(baseTime.getTime() + 10 * 60 * 60 * 1000), // 10 hours
      rate: 800,
      responsibilities: ['Creative direction', 'Talent direction', 'Final approval'],
      equipment: ['Director monitor', 'Script'],
      notes: 'Lead creative decision maker'
    },
    {
      role: 'cinematographer',
      callTime: new Date(baseTime),
      wrapTime: new Date(baseTime.getTime() + 10 * 60 * 60 * 1000),
      rate: 600,
      responsibilities: ['Camera operation', 'Lighting design', 'Visual style'],
      equipment: ['Camera package', 'Lighting kit'],
      notes: 'Responsible for visual execution'
    }
  ];
  
  const hasDialogue = description.includes('dialogue') || description.includes('conversation');
  if (hasDialogue) {
    crew.push({
      role: 'sound-recordist',
      callTime: new Date(baseTime),
      wrapTime: new Date(baseTime.getTime() + 10 * 60 * 60 * 1000),
      rate: 400,
      responsibilities: ['Audio recording', 'Sound monitoring', 'Equipment setup'],
      equipment: ['Audio recorder', 'Microphones', 'Headphones'],
      notes: 'Critical for dialogue scenes'
    });
  }
  
  const isComplex = description.includes('complex') || description.includes('multiple');
  if (isComplex) {
    crew.push({
      role: 'gaffer',
      callTime: new Date(baseTime.getTime() - 60 * 60 * 1000), // 1 hour early
      wrapTime: new Date(baseTime.getTime() + 11 * 60 * 60 * 1000),
      rate: 500,
      responsibilities: ['Lighting setup', 'Electrical safety', 'Lighting crew management'],
      equipment: ['Lighting instruments', 'Electrical distribution'],
      notes: 'Early call for lighting setup'
    });
  }
  
  return crew;
};

const generateProductionNotes = (description: string): string => {
  const notes = [];
  
  if (description.includes('outdoor')) {
    notes.push('Weather contingency plan required');
    notes.push('Backup indoor location identified');
  }
  
  if (description.includes('dialogue')) {
    notes.push('Audio quality is critical - monitor carefully');
    notes.push('Have backup audio recording method');
  }
  
  if (description.includes('movement')) {
    notes.push('Rehearse camera movements before rolling');
    notes.push('Safety briefing for moving equipment');
  }
  
  if (description.includes('complex')) {
    notes.push('Allow extra setup time');
    notes.push('Consider additional crew members');
  }
  
  notes.push('Confirm all equipment 24 hours before shoot');
  notes.push('Have emergency contact list available');
  
  return notes.join('. ');
};

export const generateLocationSuggestions = (sceneDescription: string): any[] => {
  const lowerDesc = sceneDescription.toLowerCase();
  const suggestions = [];
  
  if (lowerDesc.includes('office') || lowerDesc.includes('corporate')) {
    suggestions.push({
      id: 'loc-1',
      name: 'Modern Office Building',
      type: 'office',
      pros: ['Professional appearance', 'Good lighting', 'Controlled environment'],
      cons: ['May require permits', 'Limited weekend access'],
      rating: 4,
      notes: 'Glass offices provide excellent natural light'
    });
  }
  
  if (lowerDesc.includes('home') || lowerDesc.includes('personal')) {
    suggestions.push({
      id: 'loc-2',
      name: 'Residential Home',
      type: 'home',
      pros: ['Intimate setting', 'Easy access', 'Personal atmosphere'],
      cons: ['Limited space', 'Noise control challenges'],
      rating: 4,
      notes: 'Living room with large windows preferred'
    });
  }
  
  if (lowerDesc.includes('outdoor') || lowerDesc.includes('nature')) {
    suggestions.push({
      id: 'loc-3',
      name: 'Public Park',
      type: 'outdoor',
      pros: ['Natural beauty', 'Good acoustics', 'Free location'],
      cons: ['Weather dependent', 'Public interference', 'Permit required'],
      rating: 3,
      notes: 'Early morning shoots recommended for fewer crowds'
    });
  }
  
  return suggestions;
};

export const generateWeatherForecast = (date: Date): any => {
  // Simulate weather forecast
  return {
    date,
    temperature: {
      high: Math.floor(Math.random() * 15) + 20, // 20-35°C
      low: Math.floor(Math.random() * 10) + 10   // 10-20°C
    },
    condition: ['clear', 'partly-cloudy', 'overcast'][Math.floor(Math.random() * 3)],
    precipitation: Math.floor(Math.random() * 30), // 0-30%
    wind: {
      speed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]
    },
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    sunrise: new Date(date.getTime() + 6 * 60 * 60 * 1000), // 6 AM
    sunset: new Date(date.getTime() + 18 * 60 * 60 * 1000), // 6 PM
    alerts: Math.random() > 0.8 ? ['High wind warning'] : []
  };
};