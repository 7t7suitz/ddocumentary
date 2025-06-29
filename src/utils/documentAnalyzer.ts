import { DocumentAnalysis, Document, Theme, Character, TimelineEvent, EmotionalBeat, CulturalContext, SensitiveTopic, KeyEvent, Relationship } from '../types';

export const analyzeDocument = async (document: Document): Promise<DocumentAnalysis> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  const content = document.content.toLowerCase();
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  // Extract themes
  const themes = extractThemes(content, words);
  
  // Extract characters
  const characters = extractCharacters(document.content, content);
  
  // Extract timeline events
  const timeline = extractTimelineEvents(content);
  
  // Extract emotional beats
  const emotionalBeats = extractEmotionalBeats(content, sentences);
  
  // Analyze cultural context
  const culturalContext = analyzeCulturalContext(content);
  
  // Identify sensitive topics
  const sensitiveTopics = identifySensitiveTopics(content);
  
  // Extract key events
  const keyEvents = extractKeyEvents(content);
  
  // Analyze relationships
  const relationships = analyzeRelationships(characters, content);
  
  // Generate summary
  const summary = generateSummary(themes, characters, keyEvents);
  
  return {
    themes,
    characters,
    timeline,
    emotionalBeats,
    culturalContext,
    sensitiveTopics,
    keyEvents,
    relationships,
    summary
  };
};

const extractThemes = (content: string, words: string[]): Theme[] => {
  const themeKeywords = {
    'Family & Heritage': ['family', 'mother', 'father', 'heritage', 'tradition', 'ancestors', 'generations'],
    'Identity & Belonging': ['identity', 'belong', 'culture', 'roots', 'home', 'community', 'self'],
    'Struggle & Resilience': ['struggle', 'difficult', 'challenge', 'overcome', 'survive', 'endure', 'strength'],
    'Loss & Grief': ['loss', 'death', 'grief', 'mourning', 'goodbye', 'tragedy', 'sorrow'],
    'Love & Relationships': ['love', 'relationship', 'marriage', 'friendship', 'connection', 'bond'],
    'Migration & Journey': ['move', 'travel', 'journey', 'migration', 'displacement', 'border', 'new country'],
    'War & Conflict': ['war', 'conflict', 'battle', 'violence', 'peace', 'soldier', 'refugee'],
    'Hope & Dreams': ['hope', 'dream', 'future', 'aspiration', 'goal', 'wish', 'possibility'],
    'Education & Growth': ['school', 'learn', 'education', 'knowledge', 'growth', 'development'],
    'Work & Career': ['work', 'job', 'career', 'profession', 'business', 'employment']
  };
  
  return Object.entries(themeKeywords).map(([theme, keywords]) => {
    const occurrences = keywords.reduce((count, keyword) => 
      count + (content.match(new RegExp(`\\b${keyword}\\b`, 'gi')) || []).length, 0
    );
    
    if (occurrences === 0) return null;
    
    return {
      id: theme.toLowerCase().replace(/\s+/g, '-'),
      name: theme,
      description: `Identified through contextual analysis of ${keywords.join(', ')}`,
      confidence: Math.min(0.95, (occurrences / words.length) * 1000),
      occurrences,
      relevance: occurrences > 5 ? 'high' : occurrences > 2 ? 'medium' : 'low' as const,
      relatedTopics: keywords
    };
  }).filter(Boolean).sort((a, b) => b!.occurrences - a!.occurrences) as Theme[];
};

const extractCharacters = (originalContent: string, lowerContent: string): Character[] => {
  const nameRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const potentialNames = originalContent.match(nameRegex) || [];
  
  const characterCounts = potentialNames.reduce((acc, name) => {
    if (name.length > 2 && !['The', 'And', 'But', 'For', 'Or', 'So', 'Yet', 'This', 'That'].includes(name)) {
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(characterCounts)
    .filter(([name, count]) => count > 1)
    .slice(0, 8)
    .map(([name, count], index) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      role: determineRole(name, lowerContent),
      importance: Math.min(1, count / 10),
      firstMention: lowerContent.indexOf(name.toLowerCase()) / lowerContent.length,
      totalMentions: count,
      description: `Mentioned ${count} times throughout the document`,
      relationships: [],
      emotionalState: determineEmotionalState(name, lowerContent)
    }));
};

const determineRole = (name: string, content: string): string => {
  const nameContext = content.toLowerCase();
  const roles = [
    { keywords: ['mother', 'mom', 'mama'], role: 'Mother' },
    { keywords: ['father', 'dad', 'papa'], role: 'Father' },
    { keywords: ['sister', 'brother', 'sibling'], role: 'Sibling' },
    { keywords: ['friend', 'buddy', 'companion'], role: 'Friend' },
    { keywords: ['teacher', 'professor', 'educator'], role: 'Educator' },
    { keywords: ['doctor', 'nurse', 'medical'], role: 'Medical Professional' },
    { keywords: ['neighbor', 'community'], role: 'Community Member' },
    { keywords: ['colleague', 'coworker'], role: 'Colleague' }
  ];
  
  for (const { keywords, role } of roles) {
    if (keywords.some(keyword => nameContext.includes(keyword))) {
      return role;
    }
  }
  
  return 'Key Figure';
};

const determineEmotionalState = (name: string, content: string): string => {
  const emotions = ['happy', 'sad', 'worried', 'excited', 'calm', 'angry', 'hopeful', 'nostalgic'];
  const nameIndex = content.indexOf(name.toLowerCase());
  const contextWindow = content.substring(Math.max(0, nameIndex - 100), nameIndex + 100);
  
  for (const emotion of emotions) {
    if (contextWindow.includes(emotion)) {
      return emotion;
    }
  }
  
  return 'neutral';
};

const extractTimelineEvents = (content: string): TimelineEvent[] => {
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/gi;
  const dates = content.match(dateRegex) || [];
  
  return dates.slice(0, 6).map((date, index) => ({
    id: `event-${index}`,
    date: new Date(date),
    title: `Significant Event ${index + 1}`,
    description: `Important moment identified around ${date}`,
    type: ['event', 'milestone', 'turning-point'][index % 3] as const,
    importance: Math.random() * 0.8 + 0.2,
    characters: [],
    themes: []
  }));
};

const extractEmotionalBeats = (content: string, sentences: string[]): EmotionalBeat[] => {
  const emotionalKeywords = {
    'joy': ['happy', 'joy', 'celebration', 'laughter', 'smile', 'delight'],
    'sadness': ['sad', 'cry', 'tears', 'sorrow', 'grief', 'mourning'],
    'fear': ['afraid', 'scared', 'terror', 'anxiety', 'worry', 'panic'],
    'anger': ['angry', 'rage', 'fury', 'mad', 'irritated', 'frustrated'],
    'surprise': ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected'],
    'nostalgia': ['remember', 'memories', 'past', 'childhood', 'nostalgia', 'reminisce'],
    'hope': ['hope', 'optimism', 'future', 'dream', 'aspiration', 'possibility'],
    'love': ['love', 'affection', 'care', 'tenderness', 'devotion', 'adoration']
  };
  
  const beats: EmotionalBeat[] = [];
  
  sentences.forEach((sentence, index) => {
    Object.entries(emotionalKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => sentence.includes(keyword));
      if (matches.length > 0) {
        beats.push({
          id: `beat-${index}-${emotion}`,
          position: index / sentences.length,
          emotion,
          intensity: Math.min(1, matches.length * 0.3 + Math.random() * 0.4),
          description: `${emotion} detected in: "${sentence.substring(0, 100)}..."`,
          triggers: matches
        });
      }
    });
  });
  
  return beats.slice(0, 8);
};

const analyzeCulturalContext = (content: string): CulturalContext => {
  const culturalIndicators = {
    'Western': ['american', 'european', 'western', 'english', 'christian'],
    'Asian': ['asian', 'chinese', 'japanese', 'korean', 'indian', 'buddhist', 'hindu'],
    'Middle Eastern': ['arab', 'persian', 'turkish', 'muslim', 'islamic'],
    'African': ['african', 'nigerian', 'kenyan', 'south african'],
    'Latin American': ['mexican', 'brazilian', 'argentinian', 'hispanic', 'latino'],
    'Indigenous': ['native', 'indigenous', 'tribal', 'aboriginal']
  };
  
  let primaryCulture = 'General';
  let maxMatches = 0;
  
  Object.entries(culturalIndicators).forEach(([culture, indicators]) => {
    const matches = indicators.filter(indicator => content.includes(indicator)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      primaryCulture = culture;
    }
  });
  
  return {
    primaryCulture,
    secondaryCultures: [],
    traditions: ['family gatherings', 'cultural celebrations', 'religious observances'],
    sensitivities: ['religious beliefs', 'family honor', 'cultural practices'],
    considerations: ['respectful language', 'cultural context', 'traditional values']
  };
};

const identifySensitiveTopics = (content: string): SensitiveTopic[] => {
  const sensitiveKeywords = {
    'Death & Loss': {
      keywords: ['death', 'died', 'funeral', 'loss', 'grief'],
      severity: 'high' as const,
      description: 'Topics related to death and loss require careful handling'
    },
    'Trauma & Violence': {
      keywords: ['abuse', 'violence', 'trauma', 'assault', 'war'],
      severity: 'high' as const,
      description: 'Traumatic experiences need sensitive approach'
    },
    'Mental Health': {
      keywords: ['depression', 'anxiety', 'mental health', 'therapy', 'medication'],
      severity: 'medium' as const,
      description: 'Mental health topics require empathetic handling'
    },
    'Financial Hardship': {
      keywords: ['poverty', 'homeless', 'unemployed', 'debt', 'financial'],
      severity: 'medium' as const,
      description: 'Economic struggles can be sensitive topics'
    },
    'Discrimination': {
      keywords: ['racism', 'discrimination', 'prejudice', 'bias', 'inequality'],
      severity: 'high' as const,
      description: 'Discrimination experiences require careful discussion'
    }
  };
  
  return Object.entries(sensitiveKeywords)
    .map(([topic, data]) => {
      const occurrences = data.keywords.filter(keyword => content.includes(keyword)).length;
      if (occurrences === 0) return null;
      
      return {
        id: topic.toLowerCase().replace(/\s+/g, '-'),
        topic,
        severity: data.severity,
        description: data.description,
        recommendations: [
          'Approach with empathy and respect',
          'Allow time for emotional processing',
          'Offer breaks if needed',
          'Use gentle, non-judgmental language'
        ],
        culturalConsiderations: [
          'Consider cultural attitudes toward the topic',
          'Respect cultural taboos and sensitivities',
          'Adapt communication style appropriately'
        ]
      };
    })
    .filter(Boolean) as SensitiveTopic[];
};

const extractKeyEvents = (content: string): KeyEvent[] => {
  const eventKeywords = [
    'birth', 'marriage', 'graduation', 'death', 'divorce', 'move', 'job', 'accident',
    'illness', 'recovery', 'achievement', 'failure', 'discovery', 'loss', 'gain'
  ];
  
  return eventKeywords
    .map((keyword, index) => {
      if (!content.includes(keyword)) return null;
      
      return {
        id: `key-event-${index}`,
        title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Event`,
        description: `Significant life event involving ${keyword}`,
        impact: Math.random() * 0.8 + 0.2,
        emotionalWeight: Math.random() * 0.9 + 0.1,
        questionPotential: Math.random() * 0.8 + 0.2
      };
    })
    .filter(Boolean)
    .slice(0, 5) as KeyEvent[];
};

const analyzeRelationships = (characters: Character[], content: string): Relationship[] => {
  const relationships: Relationship[] = [];
  
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const person1 = characters[i];
      const person2 = characters[j];
      
      // Check if both names appear in close proximity
      const person1Index = content.indexOf(person1.name.toLowerCase());
      const person2Index = content.indexOf(person2.name.toLowerCase());
      
      if (Math.abs(person1Index - person2Index) < 200) {
        relationships.push({
          id: `rel-${person1.id}-${person2.id}`,
          person1: person1.name,
          person2: person2.name,
          type: 'Associated',
          description: `${person1.name} and ${person2.name} appear to be connected`,
          significance: Math.random() * 0.8 + 0.2
        });
      }
    }
  }
  
  return relationships.slice(0, 4);
};

const generateSummary = (themes: Theme[], characters: Character[], keyEvents: KeyEvent[]): string => {
  const topThemes = themes.slice(0, 3).map(t => t.name);
  const mainCharacter = characters.length > 0 ? characters[0].name : 'the subject';
  const eventCount = keyEvents.length;
  
  return `This document presents a compelling narrative centered around ${mainCharacter}. Key themes include ${topThemes.join(', ')}. The story contains ${eventCount} significant life events that offer rich interview opportunities. The narrative demonstrates strong emotional depth and would benefit from a sensitive, empathetic interview approach.`;
};