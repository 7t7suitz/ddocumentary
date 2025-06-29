export interface Document {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
  analysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  themes: Theme[];
  characters: Character[];
  timeline: TimelineEvent[];
  emotionalBeats: EmotionalBeat[];
  culturalContext: CulturalContext;
  sensitiveTopics: SensitiveTopic[];
  keyEvents: KeyEvent[];
  relationships: Relationship[];
  summary: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  confidence: number;
  occurrences: number;
  relevance: 'high' | 'medium' | 'low';
  relatedTopics: string[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  importance: number;
  firstMention: number;
  totalMentions: number;
  description: string;
  relationships: string[];
  emotionalState: string;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'event' | 'milestone' | 'turning-point';
  importance: number;
  characters: string[];
  themes: string[];
}

export interface EmotionalBeat {
  id: string;
  position: number; // 0-1 representing position in document
  emotion: string;
  intensity: number; // 0-1
  description: string;
  triggers: string[];
}

export interface CulturalContext {
  primaryCulture: string;
  secondaryCultures: string[];
  traditions: string[];
  sensitivities: string[];
  considerations: string[];
}

export interface SensitiveTopic {
  id: string;
  topic: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendations: string[];
  culturalConsiderations: string[];
}

export interface KeyEvent {
  id: string;
  title: string;
  description: string;
  impact: number; // 0-1
  emotionalWeight: number; // 0-1
  questionPotential: number; // 0-1
}

export interface Relationship {
  id: string;
  person1: string;
  person2: string;
  type: string;
  description: string;
  significance: number; // 0-1
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  type: QuestionType;
  sensitivity: 'high' | 'medium' | 'low';
  timing: 'early' | 'middle' | 'late';
  followUps: string[];
  context: string;
  culturalNotes?: string;
  alternatives: string[];
  expectedDuration: number; // minutes
  emotionalImpact: number; // 0-1
  narrativeValue: number; // 0-1
  relatedThemes: string[];
  relatedCharacters: string[];
}

export type QuestionCategory = 
  | 'personal' | 'factual' | 'emotional' | 'contextual' 
  | 'reflective' | 'relationship' | 'historical' | 'cultural';

export type QuestionType = 
  | 'open-ended' | 'closed' | 'descriptive' | 'comparative' 
  | 'hypothetical' | 'memory-based' | 'future-focused';

export interface SensitivityCheck {
  questionId: string;
  issues: {
    type: string;
    severity: string;
    description: string;
    suggestion: string;
  }[];
  recommendations: string[];
  culturalFlags: {
    culture: string;
    issue: string;
    recommendation: string;
    severity: string;
  }[];
  overallScore: number; // 0-1
}

export interface InterviewTemplate {
  id: string;
  name: string;
  description: string;
  style: string;
  duration: number; // minutes
  structure: {
    id: string;
    title: string;
    purpose: string;
    duration: number; // minutes
    questionTypes: QuestionCategory[];
    tone: string;
    techniques: string[];
  }[];
  culturalAdaptations: {
    culture: string;
    modifications: string[];
    avoidTopics: string[];
    preferredApproaches: string[];
    communicationStyle: string;
  }[];
}

export interface ConversationFlow {
  id: string;
  title: string;
  description: string;
  questions: InterviewQuestion[];
  transitions: {
    fromQuestionId: string;
    toQuestionId: string;
    trigger: string;
    type: 'natural' | 'guided' | 'pivot';
    script: string;
  }[];
  alternativePaths: {
    condition: string;
    questionId: string;
  }[];
  estimatedDuration: number; // minutes
  difficultyLevel: number; // 0-1
  emotionalArc: {
    position: number; // 0-1
    targetEmotion: string;
    intensity: number; // 0-1
    techniques: string[];
  }[];
}

export interface InterviewSession {
  id: string;
  title: string;
  subject: string;
  interviewer: string;
  location: string;
  date: Date;
  duration: number; // minutes
  questions: InterviewQuestion[];
  flow: ConversationFlow;
  notes: string;
  status: 'planned' | 'completed' | 'cancelled';
  recording?: {
    audioUrl: string;
    videoUrl?: string;
    transcriptUrl?: string;
  };
  createdAt: Date;
}

export interface CulturalSettings {
  primaryCulture: string;
  communicationStyle: 'direct' | 'indirect' | 'high-context' | 'low-context';
  formalityLevel: 'formal' | 'semi-formal' | 'casual';
  sensitivityLevel: 'high' | 'medium' | 'low';
  languagePreferences: string[];
  culturalConsiderations: string[];
}

export interface EmotionalJourney {
  id: string;
  title: string;
  description: string;
  beats: EmotionalBeat[];
  peaks: {
    position: number;
    emotion: string;
    intensity: number;
    description: string;
    suggestedTreatment: string;
  }[];
  valleys: {
    position: number;
    emotion: string;
    intensity: number;
    description: string;
    suggestedTreatment: string;
  }[];
  overallArc: 'rising' | 'falling' | 'rising-falling' | 'falling-rising' | 'flat' | 'wave';
  audienceImpact: {
    engagement: number;
    memorability: number;
    emotionalResonance: number;
  };
  musicSuggestions: {
    position: number;
    style: string;
    mood: string;
    intensity: number;
    purpose: string;
    examples: string[];
  }[];
  accessibilityNotes: string[];
}

export interface EmotionMap {
  id: string;
  title: string;
  description: string;
  primaryEmotions: {
    emotion: string;
    intensity: number;
    triggers: string[];
    visualCues: string[];
    audioCues: string[];
  }[];
  emotionalJourney: {
    segments: {
      startTime: number;
      endTime: number;
      dominantEmotion: string;
      intensity: number;
      description: string;
    }[];
    transitions: {
      fromEmotion: string;
      toEmotion: string;
      position: number;
      smoothness: number;
      technique: string;
    }[];
  };
  audiencePersonas: {
    name: string;
    demographics: string;
    emotionalResponse: {
      emotion: string;
      intensity: number;
      reason: string;
    }[];
    engagementPoints: number[];
    accessibilityConsiderations: string[];
  }[];
}

export interface MusicSuggestion {
  id: string;
  position: number;
  emotion: string;
  intensity: number;
  genre: string;
  tempo: string;
  instruments: string[];
  mood: string;
  purpose: string;
  duration: number;
  transitionType: 'fade-in' | 'fade-out' | 'cross-fade' | 'hard-cut' | 'layered';
  examples: string[];
}

export interface SoundDesignSuggestion {
  id: string;
  position: number;
  type: 'ambient' | 'effect' | 'transition' | 'emphasis';
  description: string;
  purpose: string;
  intensity: number;
  duration: number;
  examples: string[];
}

export interface EmotionalPacing {
  id: string;
  title: string;
  description: string;
  segments: {
    startPosition: number;
    endPosition: number;
    paceDescription: 'slow' | 'medium' | 'fast';
    emotionalIntensity: number;
    purpose: string;
    techniques: string[];
  }[];
  recommendations: {
    position: number;
    issue: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  overallPacing: 'balanced' | 'front-loaded' | 'back-loaded' | 'erratic' | 'consistent';
}

export interface AudienceEngagement {
  id: string;
  title: string;
  description: string;
  engagementPoints: {
    position: number;
    type: 'high' | 'medium' | 'low';
    reason: string;
    suggestion: string;
  }[];
  attentionMap: {
    position: number;
    attentionLevel: number;
    reason: string;
  }[];
  emotionalResonance: {
    position: number;
    emotion: string;
    resonanceLevel: number;
    audienceSegment: string;
  }[];
  optimizationSuggestions: {
    position: number;
    issue: string;
    suggestion: string;
    expectedImpact: number;
  }[];
}

export interface AccessibilityConsideration {
  id: string;
  category: 'visual' | 'auditory' | 'cognitive' | 'emotional' | 'cultural';
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendations: string[];
  examples: string[];
  standards: string[];
}