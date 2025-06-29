export interface Script {
  id: string;
  title: string;
  description: string;
  type: ScriptType;
  format: ScriptFormat;
  content: ScriptElement[];
  metadata: ScriptMetadata;
  versions: ScriptVersion[];
  collaborators: Collaborator[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  status: ScriptStatus;
}

export type ScriptType = 'documentary' | 'interview' | 'voiceover' | 'treatment' | 'outline';
export type ScriptFormat = 'fountain' | 'final-draft' | 'celtx' | 'custom';
export type ScriptStatus = 'draft' | 'review' | 'approved' | 'final' | 'archived';

export interface ScriptElement {
  id: string;
  type: ElementType;
  content: string;
  formatting: ElementFormatting;
  timing?: TimingInfo;
  metadata?: ElementMetadata;
  order: number;
  locked?: boolean;
}

export type ElementType = 
  | 'scene-heading' | 'action' | 'character' | 'dialogue' | 'parenthetical'
  | 'voiceover' | 'interview-question' | 'interview-answer' | 'transition'
  | 'music-cue' | 'sound-effect' | 'title-card' | 'lower-third' | 'b-roll';

export interface ElementFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
  indent?: number;
  spacing?: number;
}

export interface TimingInfo {
  startTime?: number;
  duration?: number;
  endTime?: number;
  estimatedDuration?: number;
}

export interface ElementMetadata {
  storyboardFrameId?: string;
  mediaFileId?: string;
  characterId?: string;
  locationId?: string;
  tags?: string[];
  notes?: string;
}

export interface ScriptMetadata {
  genre: string;
  targetDuration: number;
  estimatedDuration: number;
  wordCount: number;
  pageCount: number;
  readabilityScore: number;
  pacingScore: number;
  emotionalArc: EmotionalBeat[];
  themes: string[];
  characters: string[];
  locations: string[];
}

export interface EmotionalBeat {
  position: number;
  emotion: string;
  intensity: number;
  description: string;
}

export interface ScriptVersion {
  id: string;
  version: string;
  description: string;
  changes: VersionChange[];
  createdBy: string;
  createdAt: Date;
  approved?: boolean;
  notes?: string;
}

export interface VersionChange {
  elementId: string;
  type: 'added' | 'modified' | 'deleted';
  oldContent?: string;
  newContent?: string;
  reason?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: CollaboratorRole;
  permissions: Permission[];
  lastActive: Date;
  avatar?: string;
}

export type CollaboratorRole = 'owner' | 'editor' | 'reviewer' | 'viewer';

export interface Permission {
  action: 'read' | 'write' | 'comment' | 'approve' | 'export';
  granted: boolean;
}

export interface Comment {
  id: string;
  elementId?: string;
  content: string;
  author: string;
  createdAt: Date;
  resolved?: boolean;
  replies?: CommentReply[];
  type: 'general' | 'suggestion' | 'question' | 'approval';
}

export interface CommentReply {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

export interface StoryboardFrame {
  id: string;
  title: string;
  description: string;
  shotType: string;
  cameraAngle: string;
  duration: number;
  voiceoverText?: string;
  audioNotes?: string;
}

export interface TranscriptionSegment {
  id: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  text: string;
  confidence: number;
  edited?: boolean;
  tags?: string[];
}

export interface VoiceoverSuggestion {
  id: string;
  elementId: string;
  text: string;
  tone: VoiceoverTone;
  style: VoiceoverStyle;
  confidence: number;
  alternatives: string[];
  timing: TimingInfo;
}

export type VoiceoverTone = 'authoritative' | 'conversational' | 'dramatic' | 'intimate' | 'educational' | 'inspiring';
export type VoiceoverStyle = 'narrator' | 'character' | 'documentary' | 'commercial' | 'poetic';

export interface ScriptAnalysis {
  readability: ReadabilityMetrics;
  pacing: PacingAnalysis;
  structure: StructureAnalysis;
  dialogue: DialogueAnalysis;
  suggestions: ScriptSuggestion[];
}

export interface ReadabilityMetrics {
  fleschScore: number;
  gradeLevel: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  complexWords: number;
  passiveVoice: number;
}

export interface PacingAnalysis {
  overallPace: 'slow' | 'medium' | 'fast';
  sceneBreakdown: ScenePacing[];
  dialogueRatio: number;
  actionRatio: number;
  descriptionRatio: number;
  recommendations: string[];
}

export interface ScenePacing {
  sceneId: string;
  pace: 'slow' | 'medium' | 'fast';
  duration: number;
  wordCount: number;
  dialoguePercentage: number;
}

export interface StructureAnalysis {
  actBreakdown: ActStructure[];
  plotPoints: PlotPoint[];
  characterArcs: CharacterArc[];
  thematicElements: ThematicElement[];
}

export interface ActStructure {
  act: number;
  startPage: number;
  endPage: number;
  duration: number;
  purpose: string;
  keyEvents: string[];
}

export interface PlotPoint {
  type: 'inciting-incident' | 'plot-point-1' | 'midpoint' | 'plot-point-2' | 'climax' | 'resolution';
  position: number;
  description: string;
  present: boolean;
}

export interface CharacterArc {
  character: string;
  arcType: string;
  development: number;
  keyMoments: string[];
}

export interface ThematicElement {
  theme: string;
  strength: number;
  occurrences: number;
  examples: string[];
}

export interface DialogueAnalysis {
  characterVoices: CharacterVoice[];
  naturalness: number;
  distinctiveness: number;
  subtext: number;
  exposition: number;
}

export interface CharacterVoice {
  character: string;
  distinctiveness: number;
  consistency: number;
  vocabulary: string[];
  speechPatterns: string[];
}

export interface ScriptSuggestion {
  id: string;
  type: SuggestionType;
  elementId?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: SuggestionCategory;
  suggestion: string;
  examples?: string[];
}

export type SuggestionType = 'improvement' | 'error' | 'style' | 'structure' | 'pacing' | 'dialogue';
export type SuggestionCategory = 'formatting' | 'content' | 'character' | 'plot' | 'dialogue' | 'technical';

export interface ExportOptions {
  format: ExportFormat;
  includeComments: boolean;
  includeRevisions: boolean;
  includeTimecodes: boolean;
  pageNumbers: boolean;
  watermark?: string;
  customFormatting?: CustomFormatting;
}

export type ExportFormat = 'pdf' | 'docx' | 'fountain' | 'fdx' | 'html' | 'txt';

export interface CustomFormatting {
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  margins: Margins;
  headerFooter: HeaderFooter;
}

export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface HeaderFooter {
  includeTitle: boolean;
  includePageNumbers: boolean;
  includeDate: boolean;
  customText?: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  script: Script;
  metrics: VariantMetrics;
  feedback: VariantFeedback[];
}

export interface VariantMetrics {
  readabilityScore: number;
  engagementScore: number;
  emotionalImpact: number;
  pacingScore: number;
  audienceRating?: number;
}

export interface VariantFeedback {
  id: string;
  reviewer: string;
  rating: number;
  comments: string;
  categories: FeedbackCategory[];
  timestamp: Date;
}

export interface FeedbackCategory {
  category: string;
  rating: number;
  notes?: string;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  type: ScriptType;
  structure: TemplateStructure[];
  defaultFormatting: ElementFormatting;
  guidelines: string[];
}

export interface TemplateStructure {
  elementType: ElementType;
  required: boolean;
  order: number;
  description: string;
  examples: string[];
}