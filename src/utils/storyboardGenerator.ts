import { StoryboardFrame, ShotType, CameraAngle, CameraMovement, LightingSetup, ColorPalette, Character, Transition } from '../types';

export const generateStoryboardFromText = async (description: string): Promise<StoryboardFrame[]> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const frames: StoryboardFrame[] = [];
  
  sentences.forEach((sentence, index) => {
    const frame = analyzeTextForFrame(sentence.trim(), index);
    if (frame) {
      frames.push(frame);
    }
  });
  
  return frames.length > 0 ? frames : [generateDefaultFrame()];
};

const analyzeTextForFrame = (text: string, index: number): StoryboardFrame => {
  const lowerText = text.toLowerCase();
  
  // Analyze shot type based on keywords
  const shotType = determineShotType(lowerText);
  const cameraAngle = determineCameraAngle(lowerText);
  const cameraMovement = determineCameraMovement(lowerText);
  const lighting = determineLighting(lowerText);
  const colorPalette = determineColorPalette(lowerText);
  const characters = extractCharacters(text);
  const transitions = determineTransitions(lowerText);
  
  return {
    id: `frame-${Date.now()}-${index}`,
    title: `Scene ${index + 1}`,
    description: text,
    shotType,
    cameraAngle,
    cameraMovement,
    lighting,
    colorPalette,
    characters,
    duration: estimateDuration(text),
    voiceoverText: extractVoiceover(text),
    audioNotes: generateAudioNotes(lowerText),
    transitionIn: transitions.in,
    transitionOut: transitions.out,
    visualElements: [],
    timestamp: index * 5,
    order: index
  };
};

const determineShotType = (text: string): ShotType => {
  if (text.includes('close') || text.includes('detail') || text.includes('face')) return 'close-up';
  if (text.includes('extreme close') || text.includes('macro')) return 'extreme-close-up';
  if (text.includes('wide') || text.includes('establishing') || text.includes('landscape')) return 'wide';
  if (text.includes('extreme wide') || text.includes('aerial')) return 'extreme-wide';
  if (text.includes('medium') || text.includes('waist')) return 'medium';
  if (text.includes('over shoulder') || text.includes('conversation')) return 'over-shoulder';
  if (text.includes('two people') || text.includes('both')) return 'two-shot';
  if (text.includes('insert') || text.includes('cutaway')) return 'insert';
  
  return 'medium';
};

const determineCameraAngle = (text: string): CameraAngle => {
  if (text.includes('high angle') || text.includes('looking down')) return 'high-angle';
  if (text.includes('low angle') || text.includes('looking up')) return 'low-angle';
  if (text.includes('bird') || text.includes('overhead')) return 'birds-eye';
  if (text.includes('worm') || text.includes('ground level')) return 'worms-eye';
  if (text.includes('dutch') || text.includes('tilted') || text.includes('diagonal')) return 'dutch-angle';
  if (text.includes('profile') || text.includes('side')) return 'profile';
  if (text.includes('three quarter')) return 'three-quarter';
  
  return 'eye-level';
};

const determineCameraMovement = (text: string): CameraMovement => {
  if (text.includes('pan left') || text.includes('sweep left')) return 'pan-left';
  if (text.includes('pan right') || text.includes('sweep right')) return 'pan-right';
  if (text.includes('tilt up') || text.includes('look up')) return 'tilt-up';
  if (text.includes('tilt down') || text.includes('look down')) return 'tilt-down';
  if (text.includes('zoom in') || text.includes('push in')) return 'zoom-in';
  if (text.includes('zoom out') || text.includes('pull out')) return 'zoom-out';
  if (text.includes('dolly') || text.includes('track')) return 'tracking';
  if (text.includes('handheld') || text.includes('shaky')) return 'handheld';
  if (text.includes('crane') || text.includes('jib')) return 'crane';
  if (text.includes('steadicam') || text.includes('smooth')) return 'steadicam';
  
  return 'static';
};

const determineLighting = (text: string): LightingSetup => {
  let mood: LightingSetup['mood'] = 'neutral';
  let timeOfDay: LightingSetup['timeOfDay'] = 'midday';
  let weather: LightingSetup['weather'] = 'clear';
  
  // Mood analysis
  if (text.includes('bright') || text.includes('cheerful')) mood = 'bright';
  if (text.includes('dark') || text.includes('moody') || text.includes('shadow')) mood = 'moody';
  if (text.includes('dramatic') || text.includes('intense')) mood = 'dramatic';
  if (text.includes('dim') || text.includes('soft')) mood = 'dim';
  
  // Time of day
  if (text.includes('dawn') || text.includes('sunrise')) timeOfDay = 'dawn';
  if (text.includes('morning')) timeOfDay = 'morning';
  if (text.includes('noon') || text.includes('midday')) timeOfDay = 'midday';
  if (text.includes('afternoon')) timeOfDay = 'afternoon';
  if (text.includes('golden hour') || text.includes('sunset')) timeOfDay = 'golden-hour';
  if (text.includes('dusk') || text.includes('twilight')) timeOfDay = 'dusk';
  if (text.includes('night') || text.includes('evening')) timeOfDay = 'night';
  
  // Weather
  if (text.includes('cloudy') || text.includes('overcast')) weather = 'overcast';
  if (text.includes('storm') || text.includes('rain')) weather = 'stormy';
  if (text.includes('fog') || text.includes('mist')) weather = 'foggy';
  
  return {
    mood,
    keyLight: mood === 'dramatic' ? 'Hard directional' : 'Soft key',
    fillLight: mood === 'moody' ? 'Minimal fill' : 'Balanced fill',
    backLight: 'Rim lighting',
    practicalLights: [],
    timeOfDay,
    weather
  };
};

const determineColorPalette = (text: string): ColorPalette => {
  let temperature: ColorPalette['temperature'] = 'neutral';
  let saturation: ColorPalette['saturation'] = 'medium';
  let primary = '#4A90E2';
  let secondary = '#7ED321';
  let accent = '#F5A623';
  let background = '#F8F9FA';
  let mood = 'balanced';
  
  // Temperature analysis
  if (text.includes('warm') || text.includes('orange') || text.includes('red') || text.includes('sunset')) {
    temperature = 'warm';
    primary = '#E74C3C';
    secondary = '#F39C12';
    accent = '#E67E22';
  }
  if (text.includes('cool') || text.includes('blue') || text.includes('cold') || text.includes('winter')) {
    temperature = 'cool';
    primary = '#3498DB';
    secondary = '#2ECC71';
    accent = '#9B59B6';
  }
  
  // Saturation analysis
  if (text.includes('vibrant') || text.includes('colorful') || text.includes('bright')) saturation = 'high';
  if (text.includes('muted') || text.includes('subtle') || text.includes('pale')) saturation = 'low';
  if (text.includes('desaturated') || text.includes('washed out')) saturation = 'desaturated';
  
  // Mood analysis
  if (text.includes('happy') || text.includes('joyful')) mood = 'uplifting';
  if (text.includes('sad') || text.includes('melancholy')) mood = 'somber';
  if (text.includes('tense') || text.includes('dramatic')) mood = 'intense';
  if (text.includes('peaceful') || text.includes('calm')) mood = 'serene';
  
  return {
    primary,
    secondary,
    accent,
    background,
    mood,
    temperature,
    saturation
  };
};

const extractCharacters = (text: string): Character[] => {
  const characters: Character[] = [];
  const nameRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const names = text.match(nameRegex) || [];
  
  names.forEach((name, index) => {
    if (name.length > 2 && !['The', 'And', 'But', 'For', 'Or', 'So', 'Yet'].includes(name)) {
      characters.push({
        id: `char-${index}`,
        name,
        position: { x: 50 + (index * 30), y: 60 },
        size: 1,
        emotion: determineEmotion(text),
        action: determineAction(text),
        eyeline: 'camera'
      });
    }
  });
  
  return characters.slice(0, 3); // Limit to 3 characters per frame
};

const determineEmotion = (text: string): string => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('happy') || lowerText.includes('smile')) return 'happy';
  if (lowerText.includes('sad') || lowerText.includes('cry')) return 'sad';
  if (lowerText.includes('angry') || lowerText.includes('mad')) return 'angry';
  if (lowerText.includes('surprised') || lowerText.includes('shock')) return 'surprised';
  if (lowerText.includes('worried') || lowerText.includes('concern')) return 'worried';
  return 'neutral';
};

const determineAction = (text: string): string => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('walk') || lowerText.includes('move')) return 'walking';
  if (lowerText.includes('sit') || lowerText.includes('seated')) return 'sitting';
  if (lowerText.includes('stand') || lowerText.includes('standing')) return 'standing';
  if (lowerText.includes('run') || lowerText.includes('running')) return 'running';
  if (lowerText.includes('talk') || lowerText.includes('speak')) return 'talking';
  if (lowerText.includes('look') || lowerText.includes('watch')) return 'looking';
  return 'neutral';
};

const determineTransitions = (text: string): { in?: Transition; out?: Transition } => {
  const transitions: { in?: Transition; out?: Transition } = {};
  
  if (text.includes('fade in')) transitions.in = 'fade-in';
  if (text.includes('fade out')) transitions.out = 'fade-out';
  if (text.includes('dissolve')) transitions.out = 'dissolve';
  if (text.includes('cut to')) transitions.out = 'cut';
  if (text.includes('wipe')) transitions.out = 'wipe';
  if (text.includes('match cut')) transitions.out = 'match-cut';
  
  return transitions;
};

const estimateDuration = (text: string): number => {
  const words = text.split(' ').length;
  const baseTime = Math.max(3, Math.min(15, words * 0.5));
  
  // Adjust for action words
  const lowerText = text.toLowerCase();
  if (lowerText.includes('slow') || lowerText.includes('pause')) return baseTime * 1.5;
  if (lowerText.includes('quick') || lowerText.includes('fast')) return baseTime * 0.7;
  
  return Math.round(baseTime);
};

const extractVoiceover = (text: string): string | undefined => {
  const voiceoverRegex = /["']([^"']+)["']/g;
  const matches = text.match(voiceoverRegex);
  return matches ? matches[0].replace(/["']/g, '') : undefined;
};

const generateAudioNotes = (text: string): string => {
  const notes: string[] = [];
  
  if (text.includes('music') || text.includes('song')) notes.push('Background music');
  if (text.includes('quiet') || text.includes('whisper')) notes.push('Low volume');
  if (text.includes('loud') || text.includes('shout')) notes.push('Increased volume');
  if (text.includes('echo') || text.includes('reverb')) notes.push('Echo effect');
  if (text.includes('wind') || text.includes('nature')) notes.push('Natural ambience');
  if (text.includes('city') || text.includes('traffic')) notes.push('Urban ambience');
  
  return notes.length > 0 ? notes.join(', ') : 'Natural sound';
};

const generateDefaultFrame = (): StoryboardFrame => ({
  id: `frame-${Date.now()}`,
  title: 'Scene 1',
  description: 'Opening shot establishing the scene',
  shotType: 'wide',
  cameraAngle: 'eye-level',
  cameraMovement: 'static',
  lighting: {
    mood: 'neutral',
    keyLight: 'Soft key',
    fillLight: 'Balanced fill',
    backLight: 'Rim lighting',
    practicalLights: [],
    timeOfDay: 'midday',
    weather: 'clear'
  },
  colorPalette: {
    primary: '#4A90E2',
    secondary: '#7ED321',
    accent: '#F5A623',
    background: '#F8F9FA',
    mood: 'balanced',
    temperature: 'neutral',
    saturation: 'medium'
  },
  characters: [],
  duration: 5,
  visualElements: [],
  timestamp: 0,
  order: 0
});

export const generateShotSequence = (description: string): ShotType[] => {
  const sequence: ShotType[] = [];
  const lowerText = description.toLowerCase();
  
  // Standard documentary sequence
  if (lowerText.includes('interview') || lowerText.includes('conversation')) {
    sequence.push('wide', 'medium', 'close-up', 'over-shoulder');
  } else if (lowerText.includes('action') || lowerText.includes('movement')) {
    sequence.push('wide', 'medium-wide', 'medium', 'close-up', 'insert');
  } else if (lowerText.includes('location') || lowerText.includes('place')) {
    sequence.push('extreme-wide', 'wide', 'medium-wide', 'medium');
  } else {
    // Default sequence
    sequence.push('wide', 'medium', 'close-up');
  }
  
  return sequence;
};

export const generateMoodBoard = (description: string): any => {
  const lowerText = description.toLowerCase();
  
  return {
    id: `mood-${Date.now()}`,
    title: 'Generated Mood Board',
    colorPalettes: [determineColorPalette(lowerText)],
    lightingSetups: [determineLighting(lowerText)],
    references: [],
    mood: determineEmotion(description),
    genre: determineGenre(lowerText)
  };
};

const determineGenre = (text: string): string => {
  if (text.includes('documentary') || text.includes('real') || text.includes('interview')) return 'documentary';
  if (text.includes('drama') || text.includes('emotional')) return 'drama';
  if (text.includes('action') || text.includes('fast')) return 'action';
  if (text.includes('comedy') || text.includes('funny')) return 'comedy';
  if (text.includes('horror') || text.includes('scary')) return 'horror';
  return 'general';
};