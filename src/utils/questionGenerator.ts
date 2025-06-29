import { InterviewQuestion, DocumentAnalysis, QuestionCategory, QuestionType, InterviewTemplate, ConversationFlow, SensitivityCheck } from '../types';

export const generateQuestionsFromAnalysis = async (analysis: DocumentAnalysis): Promise<InterviewQuestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const questions: InterviewQuestion[] = [];
  
  // Generate theme-based questions
  analysis.themes.forEach((theme, index) => {
    questions.push(...generateThemeQuestions(theme, index));
  });
  
  // Generate character-based questions
  analysis.characters.forEach((character, index) => {
    questions.push(...generateCharacterQuestions(character, index));
  });
  
  // Generate timeline-based questions
  analysis.timeline.forEach((event, index) => {
    questions.push(...generateTimelineQuestions(event, index));
  });
  
  // Generate emotional beat questions
  analysis.emotionalBeats.forEach((beat, index) => {
    questions.push(...generateEmotionalQuestions(beat, index));
  });
  
  // Generate sensitive topic questions
  analysis.sensitiveTopics.forEach((topic, index) => {
    questions.push(...generateSensitiveQuestions(topic, index));
  });
  
  // Add opening and closing questions
  questions.unshift(...generateOpeningQuestions());
  questions.push(...generateClosingQuestions());
  
  return questions.slice(0, 25); // Limit to 25 questions
};

const generateThemeQuestions = (theme: any, index: number): InterviewQuestion[] => {
  const themeQuestions = {
    'family-heritage': [
      'Can you tell me about your family background and heritage?',
      'What traditions or values were passed down in your family?',
      'How has your family history shaped who you are today?'
    ],
    'identity-belonging': [
      'How would you describe your sense of identity?',
      'Where do you feel you truly belong?',
      'What experiences have shaped your understanding of yourself?'
    ],
    'struggle-resilience': [
      'Can you walk me through some of the challenges you\'ve faced?',
      'What gave you the strength to persevere during difficult times?',
      'How did you find the resilience to overcome obstacles?'
    ],
    'loss-grief': [
      'How did this loss impact your life?',
      'What helped you through the grieving process?',
      'How do you honor the memory of what you\'ve lost?'
    ]
  };
  
  const questions = themeQuestions[theme.id as keyof typeof themeQuestions] || [
    `How has ${theme.name.toLowerCase()} influenced your life?`,
    `Can you share a specific example related to ${theme.name.toLowerCase()}?`,
    `What would you want others to understand about ${theme.name.toLowerCase()}?`
  ];
  
  return questions.map((question, qIndex) => ({
    id: `theme-${theme.id}-${qIndex}`,
    question,
    category: 'personal' as QuestionCategory,
    type: 'open-ended' as QuestionType,
    sensitivity: theme.relevance === 'high' ? 'medium' : 'low' as const,
    timing: index < 2 ? 'early' : index < 4 ? 'middle' : 'late' as const,
    followUps: generateFollowUps(question),
    context: `Related to the theme of ${theme.name}`,
    alternatives: generateAlternatives(question),
    expectedDuration: 3,
    emotionalImpact: theme.relevance === 'high' ? 0.7 : 0.4,
    narrativeValue: theme.confidence,
    relatedThemes: [theme.id],
    relatedCharacters: []
  }));
};

const generateCharacterQuestions = (character: any, index: number): InterviewQuestion[] => {
  const questions = [
    `Tell me about ${character.name} and their role in your life.`,
    `What kind of person was ${character.name}?`,
    `How did your relationship with ${character.name} evolve over time?`,
    `What did you learn from ${character.name}?`
  ];
  
  return questions.slice(0, 2).map((question, qIndex) => ({
    id: `character-${character.id}-${qIndex}`,
    question,
    category: 'relationship' as QuestionCategory,
    type: 'descriptive' as QuestionType,
    sensitivity: character.emotionalState === 'sad' ? 'high' : 'medium' as const,
    timing: 'middle' as const,
    followUps: [
      `Can you share a specific memory of ${character.name}?`,
      `How do you think ${character.name} would describe you?`,
      `What would you want to say to ${character.name} if you could?`
    ],
    context: `About ${character.name}, who appears ${character.totalMentions} times in the document`,
    alternatives: [
      `How would you describe your connection with ${character.name}?`,
      `What made ${character.name} special to you?`
    ],
    expectedDuration: 4,
    emotionalImpact: character.importance,
    narrativeValue: character.importance,
    relatedThemes: [],
    relatedCharacters: [character.id]
  }));
};

const generateTimelineQuestions = (event: any, index: number): InterviewQuestion[] => {
  return [{
    id: `timeline-${event.id}`,
    question: `Can you tell me about what happened around ${event.date.getFullYear()}?`,
    category: 'factual' as QuestionCategory,
    type: 'memory-based' as QuestionType,
    sensitivity: event.type === 'turning-point' ? 'high' : 'medium' as const,
    timing: 'middle' as const,
    followUps: [
      'What led up to this event?',
      'How did this change things for you?',
      'Who else was involved in this situation?'
    ],
    context: `Timeline event: ${event.title}`,
    alternatives: [
      `Walk me through the events of ${event.date.getFullYear()}.`,
      `What was happening in your life during ${event.date.getFullYear()}?`
    ],
    expectedDuration: 5,
    emotionalImpact: event.importance,
    narrativeValue: event.importance,
    relatedThemes: event.themes,
    relatedCharacters: event.characters
  }];
};

const generateEmotionalQuestions = (beat: any, index: number): InterviewQuestion[] => {
  const emotionQuestions = {
    'joy': 'What brought you the most happiness during this time?',
    'sadness': 'How did you cope with the sadness you were feeling?',
    'fear': 'What were you most afraid of during this period?',
    'anger': 'What made you feel angry or frustrated?',
    'hope': 'What kept you hopeful during this time?',
    'nostalgia': 'What memories from this time do you treasure most?',
    'love': 'How did love manifest in your life during this period?'
  };
  
  const question = emotionQuestions[beat.emotion as keyof typeof emotionQuestions] || 
    `How did you experience ${beat.emotion} during this time?`;
  
  return [{
    id: `emotional-${beat.id}`,
    question,
    category: 'emotional' as QuestionCategory,
    type: 'open-ended' as QuestionType,
    sensitivity: ['sadness', 'fear', 'anger'].includes(beat.emotion) ? 'high' : 'medium' as const,
    timing: beat.position < 0.3 ? 'early' : beat.position < 0.7 ? 'middle' : 'late' as const,
    followUps: [
      'Can you describe that feeling in more detail?',
      'How did others around you respond to this?',
      'What helped you process these emotions?'
    ],
    context: `Emotional beat: ${beat.emotion} at ${Math.round(beat.position * 100)}% through the story`,
    alternatives: [
      `Tell me about the ${beat.emotion} you experienced.`,
      `How did ${beat.emotion} affect your decisions at that time?`
    ],
    expectedDuration: 4,
    emotionalImpact: beat.intensity,
    narrativeValue: beat.intensity * 0.8,
    relatedThemes: [],
    relatedCharacters: []
  }];
};

const generateSensitiveQuestions = (topic: any, index: number): InterviewQuestion[] => {
  const sensitiveApproaches = {
    'death-loss': 'If you feel comfortable sharing, how did this loss affect you?',
    'trauma-violence': 'Would you be willing to talk about how this experience impacted you?',
    'mental-health': 'How did you take care of your mental and emotional wellbeing?',
    'financial-hardship': 'How did financial challenges affect your daily life?',
    'discrimination': 'Can you share your experience with discrimination, if you\'re comfortable?'
  };
  
  const question = sensitiveApproaches[topic.id as keyof typeof sensitiveApproaches] || 
    `If you\'re comfortable, could you share your experience with ${topic.topic.toLowerCase()}?`;
  
  return [{
    id: `sensitive-${topic.id}`,
    question,
    category: 'emotional' as QuestionCategory,
    type: 'open-ended' as QuestionType,
    sensitivity: topic.severity,
    timing: 'late' as const,
    followUps: [
      'Take your time with this - there\'s no pressure to share more than you\'re comfortable with.',
      'How did you find support during this time?',
      'What would you want others to know about this experience?'
    ],
    context: `Sensitive topic: ${topic.topic}`,
    culturalNotes: 'Consider cultural attitudes and taboos around this topic',
    alternatives: [
      `How did you navigate the challenges around ${topic.topic.toLowerCase()}?`,
      `What resources or support helped you through this?`
    ],
    expectedDuration: 6,
    emotionalImpact: 0.9,
    narrativeValue: 0.8,
    relatedThemes: [],
    relatedCharacters: []
  }];
};

const generateOpeningQuestions = (): InterviewQuestion[] => {
  return [
    {
      id: 'opening-1',
      question: 'Could you start by telling me a bit about yourself?',
      category: 'personal' as QuestionCategory,
      type: 'open-ended' as QuestionType,
      sensitivity: 'low' as const,
      timing: 'early' as const,
      followUps: [
        'What would you like people to know about you?',
        'How would your friends describe you?'
      ],
      context: 'Opening question to establish rapport',
      alternatives: [
        'How would you introduce yourself to someone new?',
        'What\'s important for me to know about you as we begin?'
      ],
      expectedDuration: 3,
      emotionalImpact: 0.2,
      narrativeValue: 0.6,
      relatedThemes: [],
      relatedCharacters: []
    },
    {
      id: 'opening-2',
      question: 'What brought you to share your story today?',
      category: 'contextual' as QuestionCategory,
      type: 'open-ended' as QuestionType,
      sensitivity: 'low' as const,
      timing: 'early' as const,
      followUps: [
        'What do you hope people will understand from your story?',
        'Why is it important to you to share this now?'
      ],
      context: 'Understanding motivation for sharing',
      alternatives: [
        'What made you decide to tell your story?',
        'What do you hope will come from sharing your experiences?'
      ],
      expectedDuration: 2,
      emotionalImpact: 0.3,
      narrativeValue: 0.7,
      relatedThemes: [],
      relatedCharacters: []
    }
  ];
};

const generateClosingQuestions = (): InterviewQuestion[] => {
  return [
    {
      id: 'closing-1',
      question: 'What would you want people to take away from your story?',
      category: 'reflective' as QuestionCategory,
      type: 'future-focused' as QuestionType,
      sensitivity: 'low' as const,
      timing: 'late' as const,
      followUps: [
        'What message would you want to leave with our audience?',
        'How do you hope your story might help others?'
      ],
      context: 'Closing reflection on story impact',
      alternatives: [
        'What\'s the most important thing you\'ve shared today?',
        'If someone was going through something similar, what would you tell them?'
      ],
      expectedDuration: 3,
      emotionalImpact: 0.4,
      narrativeValue: 0.8,
      relatedThemes: [],
      relatedCharacters: []
    },
    {
      id: 'closing-2',
      question: 'Is there anything else you\'d like to add that we haven\'t covered?',
      category: 'contextual' as QuestionCategory,
      type: 'open-ended' as QuestionType,
      sensitivity: 'low' as const,
      timing: 'late' as const,
      followUps: [
        'Thank you for sharing your story with such openness.',
        'Your experiences will help others understand this journey.'
      ],
      context: 'Final opportunity for additional sharing',
      alternatives: [
        'What haven\'t we talked about that feels important to you?',
        'Is there anything you\'d like to revisit or expand on?'
      ],
      expectedDuration: 2,
      emotionalImpact: 0.2,
      narrativeValue: 0.5,
      relatedThemes: [],
      relatedCharacters: []
    }
  ];
};

const generateFollowUps = (question: string): string[] => {
  const genericFollowUps = [
    'Can you tell me more about that?',
    'How did that make you feel?',
    'What happened next?',
    'Can you give me a specific example?',
    'How did that change things for you?'
  ];
  
  return genericFollowUps.slice(0, 3);
};

const generateAlternatives = (question: string): string[] => {
  // Simple alternatives - in a real implementation, this would be more sophisticated
  return [
    question.replace('Can you', 'Could you'),
    question.replace('tell me', 'share with me'),
    question.replace('How', 'In what way')
  ].filter(alt => alt !== question).slice(0, 2);
};

export const checkQuestionSensitivity = (question: InterviewQuestion): SensitivityCheck => {
  const issues: any[] = [];
  const culturalFlags: any[] = [];
  
  // Check for potentially insensitive language
  const sensitiveWords = ['why didn\'t you', 'you should have', 'fault', 'blame', 'wrong'];
  sensitiveWords.forEach(word => {
    if (question.question.toLowerCase().includes(word)) {
      issues.push({
        type: 'emotional',
        severity: 'high',
        description: `Question contains potentially judgmental language: "${word}"`,
        suggestion: 'Rephrase to be more neutral and supportive'
      });
    }
  });
  
  // Check for cultural sensitivity
  const culturallyLoaded = ['family honor', 'shame', 'tradition', 'religion'];
  culturallyLoaded.forEach(term => {
    if (question.question.toLowerCase().includes(term)) {
      culturalFlags.push({
        culture: 'General',
        issue: `Question touches on culturally sensitive topic: ${term}`,
        recommendation: 'Consider cultural context and adapt language accordingly',
        severity: 'medium'
      });
    }
  });
  
  const overallScore = Math.max(0, 1 - (issues.length * 0.3) - (culturalFlags.length * 0.2));
  
  return {
    questionId: question.id,
    issues,
    recommendations: [
      'Use empathetic, non-judgmental language',
      'Allow time for emotional processing',
      'Respect cultural sensitivities',
      'Offer breaks if needed'
    ],
    culturalFlags,
    overallScore
  };
};

export const generateConversationFlow = (questions: InterviewQuestion[]): ConversationFlow => {
  const sortedQuestions = [...questions].sort((a, b) => {
    const timingOrder = { early: 0, middle: 1, late: 2 };
    return timingOrder[a.timing] - timingOrder[b.timing];
  });
  
  const transitions = sortedQuestions.slice(0, -1).map((question, index) => ({
    fromQuestionId: question.id,
    toQuestionId: sortedQuestions[index + 1].id,
    trigger: 'natural progression',
    type: 'natural' as const,
    script: 'Thank you for sharing that. Now I\'d like to ask about...'
  }));
  
  const emotionalArc = [
    { position: 0, targetEmotion: 'comfortable', intensity: 0.3, techniques: ['rapport building', 'easy questions'] },
    { position: 0.3, targetEmotion: 'engaged', intensity: 0.6, techniques: ['active listening', 'follow-up questions'] },
    { position: 0.7, targetEmotion: 'reflective', intensity: 0.8, techniques: ['deeper questions', 'emotional support'] },
    { position: 1, targetEmotion: 'closure', intensity: 0.4, techniques: ['summary', 'appreciation'] }
  ];
  
  return {
    id: `flow-${Date.now()}`,
    title: 'Generated Interview Flow',
    description: 'AI-generated conversation flow based on document analysis',
    questions: sortedQuestions,
    transitions,
    alternativePaths: [],
    estimatedDuration: sortedQuestions.reduce((total, q) => total + q.expectedDuration, 0),
    difficultyLevel: Math.max(...sortedQuestions.map(q => q.sensitivity === 'high' ? 0.8 : q.sensitivity === 'medium' ? 0.5 : 0.2)),
    emotionalArc
  };
};

export const getInterviewTemplates = (): InterviewTemplate[] => {
  return [
    {
      id: 'documentary-standard',
      name: 'Documentary Standard',
      description: 'Comprehensive documentary interview approach',
      style: 'documentary',
      duration: 60,
      structure: [
        {
          id: 'intro',
          title: 'Introduction & Rapport',
          purpose: 'Establish comfort and context',
          duration: 10,
          questionTypes: ['personal', 'contextual'],
          tone: 'warm and welcoming',
          techniques: ['active listening', 'eye contact', 'open body language']
        },
        {
          id: 'background',
          title: 'Background & Context',
          purpose: 'Gather factual information',
          duration: 15,
          questionTypes: ['factual', 'historical'],
          tone: 'curious and respectful',
          techniques: ['clarifying questions', 'timeline building']
        },
        {
          id: 'core-story',
          title: 'Core Story',
          purpose: 'Explore main narrative',
          duration: 25,
          questionTypes: ['emotional', 'personal', 'reflective'],
          tone: 'empathetic and supportive',
          techniques: ['emotional support', 'gentle probing', 'silence for processing']
        },
        {
          id: 'reflection',
          title: 'Reflection & Meaning',
          purpose: 'Extract insights and lessons',
          duration: 10,
          questionTypes: ['reflective', 'contextual'],
          tone: 'thoughtful and appreciative',
          techniques: ['summarizing', 'meaning-making', 'future focus']
        }
      ],
      culturalAdaptations: [
        {
          culture: 'Asian',
          modifications: ['Allow more time for responses', 'Use indirect questioning'],
          avoidTopics: ['Direct confrontation', 'Family criticism'],
          preferredApproaches: ['Respectful formality', 'Honor-based language'],
          communicationStyle: 'high-context'
        }
      ]
    },
    {
      id: 'oral-history',
      name: 'Oral History',
      description: 'Preserving personal and family histories',
      style: 'oral-history',
      duration: 90,
      structure: [
        {
          id: 'family-background',
          title: 'Family Background',
          purpose: 'Establish family context and heritage',
          duration: 20,
          questionTypes: ['historical', 'cultural'],
          tone: 'respectful and interested',
          techniques: ['genealogy focus', 'cultural exploration']
        },
        {
          id: 'life-chronology',
          title: 'Life Chronology',
          purpose: 'Document life events in sequence',
          duration: 40,
          questionTypes: ['factual', 'personal'],
          tone: 'systematic and thorough',
          techniques: ['timeline method', 'detailed documentation']
        },
        {
          id: 'legacy-wisdom',
          title: 'Legacy & Wisdom',
          purpose: 'Capture lessons and advice',
          duration: 30,
          questionTypes: ['reflective', 'contextual'],
          tone: 'reverent and appreciative',
          techniques: ['wisdom extraction', 'legacy focus']
        }
      ],
      culturalAdaptations: []
    },
    {
      id: 'therapeutic',
      name: 'Therapeutic Approach',
      description: 'Healing-focused interview style',
      style: 'therapeutic',
      duration: 45,
      structure: [
        {
          id: 'safety-establishment',
          title: 'Safety & Trust',
          purpose: 'Create safe space for sharing',
          duration: 10,
          questionTypes: ['personal'],
          tone: 'gentle and reassuring',
          techniques: ['safety establishment', 'boundary setting']
        },
        {
          id: 'exploration',
          title: 'Gentle Exploration',
          purpose: 'Explore experiences with care',
          duration: 25,
          questionTypes: ['emotional', 'personal'],
          tone: 'empathetic and non-judgmental',
          techniques: ['trauma-informed', 'emotional regulation']
        },
        {
          id: 'integration',
          title: 'Integration & Strength',
          purpose: 'Focus on resilience and growth',
          duration: 10,
          questionTypes: ['reflective'],
          tone: 'empowering and hopeful',
          techniques: ['strength-based', 'future orientation']
        }
      ],
      culturalAdaptations: []
    }
  ];
};