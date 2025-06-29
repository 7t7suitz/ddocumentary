export interface AudioFile {
  id: string;
  name: string;
  type: 'interview' | 'narration' | 'ambient' | 'music' | 'sound-effect' | 'other';
  url: string;
  waveformData?: number[];
  duration: number;
  sampleRate: number;
  channels: number;
  bitRate?: number;
  format: string;
  size: number;
  transcription?: Transcription;
  markers: AudioMarker[];
  tags: string[];
  metadata: {
    artist?: string;
    album?: string;
    title?: string;
    year?: number;
    genre?: string;
    bpm?: number;
    key?: string;
    recordingDate?: Date;
    recordingLocation?: string;
    recordingDevice?: string;
    notes?: string;
  };
  analysis: AudioAnalysis;
  enhancements: AudioEnhancement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Transcription {
  id: string;
  segments: TranscriptionSegment[];
  speakers: Speaker[];
  language: string;
  accuracy: number;
  wordCount: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptionSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speakerId?: string;
  confidence: number;
  words: {
    text: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }[];
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  edited: boolean;
}

export interface Speaker {
  id: string;
  name: string;
  role?: string;
  gender?: 'male' | 'female' | 'unknown';
  segments: string[]; // IDs of segments
  totalDuration: number;
  color: string;
}

export interface AudioMarker {
  id: string;
  time: number;
  label: string;
  type: 'cue' | 'edit' | 'bookmark' | 'issue' | 'note';
  color: string;
  notes?: string;
}

export interface AudioAnalysis {
  loudness: {
    integrated: number; // LUFS
    shortTerm: number[]; // LUFS over time
    truePeak: number; // dBTP
    loudnessRange: number; // LU
  };
  spectrum: {
    lowFrequency: number; // 0-1 relative energy
    midFrequency: number; // 0-1 relative energy
    highFrequency: number; // 0-1 relative energy
    spectralCentroid: number; // Hz
  };
  dynamics: {
    dynamicRange: number; // dB
    crestFactor: number; // dB
    compression: number; // 0-1 (amount of compression detected)
  };
  clarity: {
    signalToNoiseRatio: number; // dB
    harmonyToNoiseRatio: number; // dB
    articulation: number; // 0-1 (speech clarity)
  };
  rhythm: {
    tempo: number; // BPM
    beatPositions: number[]; // seconds
    rhythmicRegularity: number; // 0-1
  };
  issues: AudioIssue[];
  quality: {
    overall: number; // 0-1
    clarity: number; // 0-1
    noise: number; // 0-1
    balance: number; // 0-1
  };
}

export interface AudioIssue {
  id: string;
  type: 'noise' | 'clipping' | 'silence' | 'distortion' | 'echo' | 'plosive' | 'sibilance' | 'hum' | 'other';
  startTime: number;
  endTime: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  fixRecommendation: string;
}

export interface AudioEnhancement {
  id: string;
  type: 'noise-reduction' | 'eq' | 'compression' | 'normalization' | 'de-essing' | 'de-reverb' | 'other';
  parameters: Record<string, any>;
  appliedAt: Date;
  appliedBy: string;
  before?: string; // URL to before audio sample
  after?: string; // URL to after audio sample
  notes: string;
}

export interface MusicRecommendation {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  tempo: number;
  key: string;
  duration: number;
  url?: string;
  previewUrl?: string;
  waveformUrl?: string;
  coverArt?: string;
  tags: string[];
  similarTo?: string[];
  confidence: number;
  notes: string;
}

export interface SoundEffectRecommendation {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number;
  url?: string;
  previewUrl?: string;
  waveformUrl?: string;
  tags: string[];
  confidence: number;
  notes: string;
}

export interface MixingRecommendation {
  id: string;
  name: string;
  description: string;
  targetLoudness: number; // LUFS
  targetDynamicRange: number; // LU
  eqSettings: {
    band: string;
    frequency: number;
    gain: number;
    q: number;
  }[];
  compressionSettings: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    makeupGain: number;
  };
  channelBalance: {
    [channelName: string]: number; // 0-1 relative volume
  };
  notes: string;
}

export interface VoiceCoachingTip {
  id: string;
  category: 'pace' | 'pitch' | 'articulation' | 'breathing' | 'emotion' | 'emphasis' | 'other';
  title: string;
  description: string;
  examples: {
    text: string;
    audioUrl?: string;
  }[];
  exercises: string[];
  relevance: number; // 0-1
}

export interface AudioAccessibilityFeature {
  id: string;
  type: 'caption' | 'transcript' | 'audio-description' | 'sign-language' | 'other';
  title: string;
  description: string;
  implementation: string;
  standards: string[];
  importance: 'required' | 'recommended' | 'optional';
  notes: string;
}

export interface AudioProject {
  id: string;
  title: string;
  description: string;
  files: AudioFile[];
  transcriptions: Transcription[];
  musicRecommendations: MusicRecommendation[];
  soundEffectRecommendations: SoundEffectRecommendation[];
  mixingRecommendations: MixingRecommendation[];
  voiceCoachingTips: VoiceCoachingTip[];
  accessibilityFeatures: AudioAccessibilityFeature[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessingJob {
  id: string;
  type: 'transcription' | 'enhancement' | 'analysis' | 'export';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileId: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ExportOptions {
  format: 'wav' | 'mp3' | 'ogg' | 'flac';
  quality: 'low' | 'medium' | 'high';
  includeEnhancements: boolean;
  normalizeLoudness: boolean;
  targetLoudness?: number;
  metadata: Record<string, string>;
}

export interface SubtitleOptions {
  format: 'srt' | 'vtt' | 'ass' | 'json';
  includeSpeakerNames: boolean;
  includeTimecodes: boolean;
  maxLineLength: number;
  maxLinesPerCaption: number;
  minDuration: number;
  maxDuration: number;
}