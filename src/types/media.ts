export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  size: number;
  uploadedAt: Date;
  lastModified: Date;
  metadata: MediaMetadata;
  tags: Tag[];
  faces: DetectedFace[];
  analysis: MediaAnalysis;
  versions: MediaVersion[];
  collections: string[];
  status: 'processing' | 'ready' | 'error';
}

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  colorSpace?: string;
  bitRate?: number;
  frameRate?: number;
  location?: GeoLocation;
  camera?: CameraInfo;
  exif?: ExifData;
}

export interface ExifData {
  make?: string;
  model?: string;
  dateTime?: Date;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  flash?: boolean;
  orientation?: number;
}

export interface CameraInfo {
  make: string;
  model: string;
  lens?: string;
  settings: CameraSettings;
}

export interface CameraSettings {
  aperture: string;
  shutterSpeed: string;
  iso: number;
  focalLength: string;
  exposureMode: string;
  whiteBalance: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  confidence: number;
  source: 'ai' | 'manual' | 'metadata';
  color?: string;
}

export type TagCategory = 
  | 'object' | 'person' | 'location' | 'emotion' | 'activity' 
  | 'color' | 'style' | 'technical' | 'custom';

export interface DetectedFace {
  id: string;
  boundingBox: BoundingBox;
  confidence: number;
  personId?: string;
  personName?: string;
  emotions: EmotionScore[];
  age?: number;
  gender?: string;
  landmarks: FaceLandmark[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EmotionScore {
  emotion: string;
  confidence: number;
}

export interface FaceLandmark {
  type: string;
  x: number;
  y: number;
}

export interface MediaAnalysis {
  description: string;
  objects: DetectedObject[];
  scenes: DetectedScene[];
  colors: ColorAnalysis;
  composition: CompositionAnalysis;
  quality: QualityMetrics;
  documentaryValue: DocumentaryValue;
}

export interface DetectedObject {
  id: string;
  name: string;
  confidence: number;
  boundingBox: BoundingBox;
  category: string;
}

export interface DetectedScene {
  name: string;
  confidence: number;
  category: string;
}

export interface ColorAnalysis {
  dominantColors: string[];
  colorPalette: string[];
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: 'warm' | 'cool' | 'neutral';
}

export interface CompositionAnalysis {
  ruleOfThirds: boolean;
  symmetry: number;
  leadingLines: boolean;
  depth: number;
  balance: number;
  focusPoint: { x: number; y: number };
}

export interface QualityMetrics {
  sharpness: number;
  exposure: number;
  noise: number;
  overall: number;
  issues: string[];
}

export interface DocumentaryValue {
  narrativeScore: number;
  emotionalImpact: number;
  historicalValue: number;
  uniqueness: number;
  suggestedUse: string[];
  placementRecommendations: PlacementRecommendation[];
}

export interface PlacementRecommendation {
  section: string;
  confidence: number;
  reason: string;
  timing: number;
}

export interface MediaVersion {
  id: string;
  type: 'original' | 'edited' | 'compressed' | 'thumbnail';
  url: string;
  size: number;
  format: string;
  createdAt: Date;
  editHistory?: EditOperation[];
}

export interface EditOperation {
  id: string;
  type: string;
  parameters: Record<string, any>;
  timestamp: Date;
  user?: string;
}

export interface MediaCollection {
  id: string;
  name: string;
  description: string;
  type: 'album' | 'project' | 'timeline' | 'theme' | 'auto';
  mediaIds: string[];
  coverImageId?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: CollectionSettings;
  sharing: SharingSettings;
}

export interface CollectionSettings {
  autoAdd: boolean;
  sortBy: 'date' | 'name' | 'relevance' | 'manual';
  sortOrder: 'asc' | 'desc';
  filters: MediaFilter[];
  layout: 'grid' | 'timeline' | 'masonry' | 'slideshow';
}

export interface SharingSettings {
  isPublic: boolean;
  allowDownload: boolean;
  password?: string;
  expiresAt?: Date;
  permissions: Permission[];
}

export interface Permission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  grantedAt: Date;
}

export interface MediaFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

export interface SearchQuery {
  text?: string;
  tags?: string[];
  dateRange?: { start: Date; end: Date };
  location?: string;
  faces?: string[];
  type?: string[];
  collections?: string[];
  quality?: { min: number; max: number };
  advanced?: AdvancedSearchOptions;
}

export interface AdvancedSearchOptions {
  colorPalette?: string[];
  emotions?: string[];
  objects?: string[];
  cameraSettings?: Partial<CameraSettings>;
  documentaryValue?: { min: number; max: number };
  similarity?: { mediaId: string; threshold: number };
}

export interface BatchOperation {
  id: string;
  type: 'tag' | 'move' | 'delete' | 'edit' | 'export' | 'analyze';
  mediaIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  results?: BatchResult[];
  errors?: BatchError[];
}

export interface BatchResult {
  mediaId: string;
  success: boolean;
  result?: any;
  error?: string;
}

export interface BatchError {
  mediaId: string;
  error: string;
  code: string;
}

export interface BackupSettings {
  enabled: boolean;
  provider: 'local' | 'cloud' | 'both';
  schedule: 'realtime' | 'hourly' | 'daily' | 'weekly';
  retention: number;
  compression: boolean;
  encryption: boolean;
  destinations: BackupDestination[];
}

export interface BackupDestination {
  id: string;
  type: 'local' | 'aws' | 'google' | 'azure' | 'dropbox';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
}

export interface VersionControl {
  enabled: boolean;
  maxVersions: number;
  autoSave: boolean;
  saveInterval: number;
  compressionLevel: number;
}

export interface Person {
  id: string;
  name: string;
  aliases: string[];
  faceIds: string[];
  mediaCount: number;
  firstSeen: Date;
  lastSeen: Date;
  verified: boolean;
  notes?: string;
  relationships: PersonRelationship[];
}

export interface PersonRelationship {
  personId: string;
  type: string;
  confidence: number;
}

export interface AutoTaggingSettings {
  enabled: boolean;
  confidence: number;
  categories: TagCategory[];
  customModels: string[];
  reviewRequired: boolean;
}

export interface ProcessingQueue {
  id: string;
  mediaId: string;
  operation: string;
  priority: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface MediaLibraryStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
  byDate: Record<string, number>;
  topTags: Array<{ tag: string; count: number }>;
  qualityDistribution: Record<string, number>;
  processingQueue: number;
  storageUsed: number;
  storageLimit: number;
}

export interface ExportSettings {
  format: string;
  quality: number;
  resolution?: { width: number; height: number };
  watermark?: WatermarkSettings;
  metadata: boolean;
  compression: number;
  destination: string;
}

export interface WatermarkSettings {
  enabled: boolean;
  text?: string;
  image?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: number;
}

export interface SmartSuggestion {
  id: string;
  type: 'collection' | 'tag' | 'edit' | 'placement' | 'duplicate';
  title: string;
  description: string;
  confidence: number;
  mediaIds: string[];
  action: SuggestionAction;
  createdAt: Date;
  dismissed?: boolean;
}

export interface SuggestionAction {
  type: string;
  parameters: Record<string, any>;
  preview?: string;
}