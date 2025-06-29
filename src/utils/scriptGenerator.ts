import { Script, ScriptElement, StoryboardFrame, VoiceoverSuggestion, TranscriptionSegment, ScriptAnalysis } from '../types/script';

export const convertStoryboardToScript = async (frames: StoryboardFrame[]): Promise<Script> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const elements: ScriptElement[] = [];
  let order = 0;
  
  frames.forEach((frame, index) => {
    // Scene heading
    elements.push({
      id: `element-${order++}`,
      type: 'scene-heading',
      content: `SCENE ${index + 1} - ${frame.title.toUpperCase()}`,
      formatting: { bold: true, fontSize: 12 },
      order: order - 1,
      metadata: { storyboardFrameId: frame.id }
    });
    
    // Action/description
    elements.push({
      id: `element-${order++}`,
      type: 'action',
      content: frame.description,
      formatting: { fontSize: 12 },
      timing: { estimatedDuration: frame.duration },
      order: order - 1,
      metadata: { storyboardFrameId: frame.id }
    });
    
    // Voiceover if present
    if (frame.voiceoverText) {
      elements.push({
        id: `element-${order++}`,
        type: 'voiceover',
        content: frame.voiceoverText,
        formatting: { italic: true, fontSize: 12 },
        timing: { estimatedDuration: frame.duration * 0.8 },
        order: order - 1,
        metadata: { storyboardFrameId: frame.id }
      });
    }
    
    // Audio notes as sound effects
    if (frame.audioNotes) {
      elements.push({
        id: `element-${order++}`,
        type: 'sound-effect',
        content: frame.audioNotes,
        formatting: { fontSize: 10, italic: true },
        order: order - 1,
        metadata: { storyboardFrameId: frame.id }
      });
    }
    
    // Add transition between scenes
    if (index < frames.length - 1) {
      elements.push({
        id: `element-${order++}`,
        type: 'transition',
        content: 'CUT TO:',
        formatting: { bold: true, alignment: 'right', fontSize: 12 },
        order: order - 1
      });
    }
  });
  
  const totalDuration = frames.reduce((sum, frame) => sum + frame.duration, 0);
  
  return {
    id: `script-${Date.now()}`,
    title: 'Generated Script from Storyboard',
    description: 'Automatically converted from storyboard frames',
    type: 'documentary',
    format: 'custom',
    content: elements,
    metadata: {
      genre: 'Documentary',
      targetDuration: totalDuration,
      estimatedDuration: totalDuration,
      wordCount: calculateWordCount(elements),
      pageCount: Math.ceil(elements.length / 10),
      readabilityScore: 0.8,
      pacingScore: 0.7,
      emotionalArc: generateEmotionalArc(frames),
      themes: extractThemes(frames),
      characters: [],
      locations: []
    },
    versions: [],
    collaborators: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft'
  };
};

export const generateVoiceoverSuggestions = async (elements: ScriptElement[]): Promise<VoiceoverSuggestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const suggestions: VoiceoverSuggestion[] = [];
  
  elements.forEach((element, index) => {
    if (element.type === 'action' || element.type === 'scene-heading') {
      const suggestion = generateVoiceoverForElement(element, index);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
  });
  
  return suggestions;
};

const generateVoiceoverForElement = (element: ScriptElement, index: number): VoiceoverSuggestion | null => {
  const voiceoverTemplates = {
    'scene-heading': [
      'We find ourselves in {location}, where {context}.',
      'The story continues in {location}, a place where {context}.',
      'Our journey takes us to {location}, {context}.'
    ],
    'action': [
      'As we watch, {description}.',
      'In this moment, {description}.',
      'Here we see {description}.',
      'The scene unfolds as {description}.'
    ]
  };
  
  const templates = voiceoverTemplates[element.type as keyof typeof voiceoverTemplates];
  if (!templates) return null;
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  const voiceoverText = template.replace('{description}', element.content.toLowerCase())
                              .replace('{location}', 'this setting')
                              .replace('{context}', 'our story unfolds');
  
  return {
    id: `vo-${element.id}`,
    elementId: element.id,
    text: voiceoverText,
    tone: 'documentary',
    style: 'narrator',
    confidence: 0.8,
    alternatives: generateAlternativeVoiceovers(voiceoverText),
    timing: {
      estimatedDuration: estimateVoiceoverDuration(voiceoverText)
    }
  };
};

const generateAlternativeVoiceovers = (original: string): string[] => {
  return [
    original.replace('As we watch', 'We observe'),
    original.replace('Here we see', 'We witness'),
    original.replace('In this moment', 'At this point')
  ].filter(alt => alt !== original);
};

const estimateVoiceoverDuration = (text: string): number => {
  const wordsPerMinute = 150;
  const words = text.split(' ').length;
  return (words / wordsPerMinute) * 60;
};

export const processTranscription = async (audioFile: File): Promise<TranscriptionSegment[]> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate transcription processing
  const mockSegments: TranscriptionSegment[] = [
    {
      id: 'seg-1',
      startTime: 0,
      endTime: 5.2,
      speaker: 'Interviewer',
      text: 'Can you tell me about your experience growing up in this neighborhood?',
      confidence: 0.95
    },
    {
      id: 'seg-2',
      startTime: 5.8,
      endTime: 12.4,
      speaker: 'Subject',
      text: 'Well, it was a very different place back then. The community was tight-knit.',
      confidence: 0.92
    },
    {
      id: 'seg-3',
      startTime: 13.1,
      endTime: 18.7,
      speaker: 'Subject',
      text: 'Everyone knew each other, and we looked out for one another.',
      confidence: 0.89
    }
  ];
  
  return mockSegments;
};

export const generateSceneTransitions = (elements: ScriptElement[]): string[] => {
  const transitions = [
    'FADE IN:',
    'FADE OUT:',
    'CUT TO:',
    'DISSOLVE TO:',
    'MATCH CUT TO:',
    'SMASH CUT TO:',
    'JUMP CUT TO:',
    'CROSS FADE TO:',
    'WIPE TO:',
    'IRIS IN:',
    'IRIS OUT:'
  ];
  
  const contextualTransitions = {
    'emotional': ['FADE TO:', 'DISSOLVE TO:', 'SLOW FADE TO:'],
    'action': ['CUT TO:', 'SMASH CUT TO:', 'JUMP CUT TO:'],
    'time': ['FADE OUT:', 'DISSOLVE TO:', 'TIME CUT TO:'],
    'location': ['CUT TO:', 'WIPE TO:', 'MATCH CUT TO:']
  };
  
  return transitions;
};

export const analyzeScript = async (script: Script): Promise<ScriptAnalysis> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const content = script.content.map(el => el.content).join(' ');
  
  return {
    readability: analyzeReadability(content),
    pacing: analyzePacing(script.content),
    structure: analyzeStructure(script.content),
    dialogue: analyzeDialogue(script.content),
    suggestions: generateSuggestions(script.content)
  };
};

const analyzeReadability = (content: string): any => {
  const words = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const syllables = estimateSyllables(content);
  
  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;
  
  // Flesch Reading Ease Score
  const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  return {
    fleschScore: Math.max(0, Math.min(100, fleschScore)),
    gradeLevel: Math.max(1, Math.min(20, 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59)),
    averageWordsPerSentence: avgWordsPerSentence,
    averageSyllablesPerWord: avgSyllablesPerWord,
    complexWords: countComplexWords(content),
    passiveVoice: countPassiveVoice(content)
  };
};

const estimateSyllables = (text: string): number => {
  return text.toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/[aeiou]{2,}/g, 'a')
    .replace(/[^aeiou]/g, '')
    .length || 1;
};

const countComplexWords = (text: string): number => {
  const words = text.split(/\s+/);
  return words.filter(word => estimateSyllables(word) >= 3).length;
};

const countPassiveVoice = (text: string): number => {
  const passiveIndicators = ['was', 'were', 'been', 'being', 'is', 'are', 'am'];
  const words = text.toLowerCase().split(/\s+/);
  return words.filter(word => passiveIndicators.includes(word)).length;
};

const analyzePacing = (elements: ScriptElement[]): any => {
  const dialogueElements = elements.filter(el => el.type === 'dialogue' || el.type === 'interview-answer');
  const actionElements = elements.filter(el => el.type === 'action');
  const descriptionElements = elements.filter(el => el.type === 'scene-heading' || el.type === 'voiceover');
  
  const total = elements.length;
  const dialogueRatio = dialogueElements.length / total;
  const actionRatio = actionElements.length / total;
  const descriptionRatio = descriptionElements.length / total;
  
  let overallPace: 'slow' | 'medium' | 'fast' = 'medium';
  if (actionRatio > 0.6) overallPace = 'fast';
  else if (descriptionRatio > 0.5) overallPace = 'slow';
  
  return {
    overallPace,
    sceneBreakdown: [],
    dialogueRatio,
    actionRatio,
    descriptionRatio,
    recommendations: generatePacingRecommendations(overallPace, dialogueRatio, actionRatio)
  };
};

const generatePacingRecommendations = (pace: string, dialogueRatio: number, actionRatio: number): string[] => {
  const recommendations = [];
  
  if (pace === 'slow' && dialogueRatio < 0.3) {
    recommendations.push('Consider adding more dialogue to increase engagement');
  }
  if (pace === 'fast' && actionRatio > 0.7) {
    recommendations.push('Consider adding more descriptive elements for better pacing');
  }
  if (dialogueRatio > 0.8) {
    recommendations.push('Script is dialogue-heavy; consider balancing with action and description');
  }
  
  return recommendations;
};

const analyzeStructure = (elements: ScriptElement[]): any => {
  const sceneHeadings = elements.filter(el => el.type === 'scene-heading');
  const plotPoints = identifyPlotPoints(elements);
  
  return {
    actBreakdown: generateActBreakdown(sceneHeadings),
    plotPoints,
    characterArcs: [],
    thematicElements: []
  };
};

const identifyPlotPoints = (elements: ScriptElement[]): any[] => {
  const totalElements = elements.length;
  
  return [
    {
      type: 'inciting-incident',
      position: 0.1,
      description: 'Opening hook or inciting incident',
      present: totalElements > 5
    },
    {
      type: 'plot-point-1',
      position: 0.25,
      description: 'First major plot point',
      present: totalElements > 10
    },
    {
      type: 'midpoint',
      position: 0.5,
      description: 'Midpoint revelation or turn',
      present: totalElements > 15
    },
    {
      type: 'plot-point-2',
      position: 0.75,
      description: 'Second major plot point',
      present: totalElements > 20
    },
    {
      type: 'climax',
      position: 0.9,
      description: 'Climactic moment',
      present: totalElements > 25
    }
  ];
};

const generateActBreakdown = (sceneHeadings: ScriptElement[]): any[] => {
  const totalScenes = sceneHeadings.length;
  
  return [
    {
      act: 1,
      startPage: 1,
      endPage: Math.ceil(totalScenes * 0.25),
      duration: 0.25,
      purpose: 'Setup and introduction',
      keyEvents: ['Opening', 'Character introduction', 'Inciting incident']
    },
    {
      act: 2,
      startPage: Math.ceil(totalScenes * 0.25) + 1,
      endPage: Math.ceil(totalScenes * 0.75),
      duration: 0.5,
      purpose: 'Development and conflict',
      keyEvents: ['Rising action', 'Obstacles', 'Midpoint']
    },
    {
      act: 3,
      startPage: Math.ceil(totalScenes * 0.75) + 1,
      endPage: totalScenes,
      duration: 0.25,
      purpose: 'Resolution',
      keyEvents: ['Climax', 'Falling action', 'Resolution']
    }
  ];
};

const analyzeDialogue = (elements: ScriptElement[]): any => {
  const dialogueElements = elements.filter(el => 
    el.type === 'dialogue' || el.type === 'interview-answer'
  );
  
  return {
    characterVoices: [],
    naturalness: 0.8,
    distinctiveness: 0.7,
    subtext: 0.6,
    exposition: 0.5
  };
};

const generateSuggestions = (elements: ScriptElement[]): any[] => {
  const suggestions = [];
  
  // Check for formatting issues
  elements.forEach((element, index) => {
    if (element.type === 'scene-heading' && !element.formatting?.bold) {
      suggestions.push({
        id: `suggestion-${index}`,
        type: 'formatting',
        elementId: element.id,
        title: 'Scene Heading Format',
        description: 'Scene headings should be bold and uppercase',
        severity: 'medium',
        category: 'formatting',
        suggestion: 'Apply bold formatting to scene heading'
      });
    }
  });
  
  // Check for pacing issues
  const actionElements = elements.filter(el => el.type === 'action');
  if (actionElements.length < elements.length * 0.3) {
    suggestions.push({
      id: 'suggestion-pacing',
      type: 'pacing',
      title: 'Pacing Concern',
      description: 'Script may benefit from more action elements',
      severity: 'low',
      category: 'content',
      suggestion: 'Consider adding more visual action descriptions'
    });
  }
  
  return suggestions;
};

const calculateWordCount = (elements: ScriptElement[]): number => {
  return elements.reduce((count, element) => {
    return count + element.content.split(/\s+/).length;
  }, 0);
};

const generateEmotionalArc = (frames: StoryboardFrame[]): any[] => {
  return frames.map((frame, index) => ({
    position: index / frames.length,
    emotion: 'neutral',
    intensity: 0.5 + Math.random() * 0.5,
    description: `Emotional beat at frame ${index + 1}`
  }));
};

const extractThemes = (frames: StoryboardFrame[]): string[] => {
  const themes = new Set<string>();
  
  frames.forEach(frame => {
    const description = frame.description.toLowerCase();
    if (description.includes('family')) themes.add('Family');
    if (description.includes('love')) themes.add('Love');
    if (description.includes('struggle')) themes.add('Struggle');
    if (description.includes('hope')) themes.add('Hope');
    if (description.includes('journey')) themes.add('Journey');
  });
  
  return Array.from(themes);
};

export const generateABTestVariants = async (baseScript: Script, count: number = 3): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const variants = [];
  
  for (let i = 0; i < count; i++) {
    const variant = {
      id: `variant-${i + 1}`,
      name: `Version ${String.fromCharCode(65 + i)}`,
      description: getVariantDescription(i),
      script: generateScriptVariant(baseScript, i),
      metrics: generateVariantMetrics(),
      feedback: []
    };
    
    variants.push(variant);
  }
  
  return variants;
};

const getVariantDescription = (index: number): string => {
  const descriptions = [
    'More conversational tone with increased dialogue',
    'Action-focused with dynamic pacing',
    'Narrative-driven with stronger voiceover'
  ];
  return descriptions[index] || `Alternative version ${index + 1}`;
};

const generateScriptVariant = (baseScript: Script, variantIndex: number): Script => {
  const variantScript = { ...baseScript };
  variantScript.id = `${baseScript.id}-variant-${variantIndex}`;
  
  // Modify elements based on variant type
  variantScript.content = baseScript.content.map(element => {
    const newElement = { ...element };
    
    switch (variantIndex) {
      case 0: // More conversational
        if (element.type === 'voiceover') {
          newElement.content = makeMoreConversational(element.content);
        }
        break;
      case 1: // Action-focused
        if (element.type === 'action') {
          newElement.content = makeMoreDynamic(element.content);
        }
        break;
      case 2: // Narrative-driven
        if (element.type === 'voiceover') {
          newElement.content = makeMoreNarrative(element.content);
        }
        break;
    }
    
    return newElement;
  });
  
  return variantScript;
};

const makeMoreConversational = (text: string): string => {
  return text.replace(/\./g, '...')
             .replace(/We see/g, "You'll notice")
             .replace(/The scene shows/g, "What we're looking at here is");
};

const makeMoreDynamic = (text: string): string => {
  return text.replace(/slowly/g, 'quickly')
             .replace(/walks/g, 'rushes')
             .replace(/moves/g, 'darts');
};

const makeMoreNarrative = (text: string): string => {
  return `In this moment, ${text.toLowerCase()}`;
};

const generateVariantMetrics = (): any => {
  return {
    readabilityScore: 0.6 + Math.random() * 0.4,
    engagementScore: 0.5 + Math.random() * 0.5,
    emotionalImpact: 0.4 + Math.random() * 0.6,
    pacingScore: 0.5 + Math.random() * 0.5
  };
};