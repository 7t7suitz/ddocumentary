export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  topics: ResearchTopic[];
  sources: Source[];
  claims: Claim[];
  citations: Citation[];
  experts: Expert[];
  newsAlerts: NewsAlert[];
  timeline: TimelineEvent[];
  accuracyReports: AccuracyReport[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'completed';
}

export interface ResearchTopic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  importance: 'high' | 'medium' | 'low';
  status: 'researching' | 'completed' | 'pending';
  sources: string[]; // Source IDs
  notes: string;
}

export interface Source {
  id: string;
  title: string;
  url?: string;
  type: SourceType;
  authors: string[];
  publishedDate?: Date;
  retrievedDate: Date;
  content: string;
  summary: string;
  topics: string[]; // Topic IDs
  reliability: ReliabilityScore;
  tags: string[];
  notes: string;
  citations: string[]; // Citation IDs
  status: 'verified' | 'unverified' | 'disputed';
}

export type SourceType = 
  | 'academic' | 'news' | 'book' | 'journal' | 'website' 
  | 'interview' | 'government' | 'report' | 'social-media' | 'video' | 'audio';

export interface ReliabilityScore {
  overall: number; // 0-1
  factualAccuracy: number; // 0-1
  bias: number; // 0-1
  expertise: number; // 0-1
  reputation: number; // 0-1
  notes: string;
}

export interface Claim {
  id: string;
  statement: string;
  topics: string[]; // Topic IDs
  sources: string[]; // Source IDs
  supportingEvidence: Evidence[];
  contradictoryEvidence: Evidence[];
  factCheckResult: FactCheckResult;
  confidence: number; // 0-1
  importance: 'high' | 'medium' | 'low';
  status: 'verified' | 'unverified' | 'disputed';
  notes: string;
}

export interface Evidence {
  id: string;
  sourceId: string;
  excerpt: string;
  relevance: number; // 0-1
  strength: number; // 0-1
  type: 'direct' | 'indirect' | 'anecdotal' | 'statistical';
  notes: string;
}

export interface FactCheckResult {
  verdict: 'true' | 'mostly-true' | 'mixed' | 'mostly-false' | 'false' | 'unverified';
  explanation: string;
  checkedBy: string;
  checkedDate: Date;
  externalFactChecks: ExternalFactCheck[];
}

export interface ExternalFactCheck {
  organization: string;
  url: string;
  verdict: string;
  date: Date;
}

export interface Citation {
  id: string;
  sourceId: string;
  style: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee';
  formattedCitation: string;
  inTextCitation: string;
  doi?: string;
  bibtex?: string;
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  organization: string;
  expertise: string[];
  contactInfo?: ContactInfo;
  publications: string[];
  relevance: number; // 0-1
  availability: 'available' | 'potentially-available' | 'unavailable' | 'unknown';
  previousInterviews: string[];
  notes: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  socialMedia?: SocialMedia;
  address?: string;
}

export interface SocialMedia {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
}

export interface NewsAlert {
  id: string;
  title: string;
  source: string;
  url: string;
  date: Date;
  summary: string;
  topics: string[]; // Topic IDs
  relevance: number; // 0-1
  status: 'new' | 'reviewed' | 'archived';
  notes: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  sources: string[]; // Source IDs
  importance: 'high' | 'medium' | 'low';
  type: 'historical' | 'contemporary' | 'future';
  location?: string;
  people: string[];
  media?: string[];
  notes: string;
}

export interface AccuracyReport {
  id: string;
  title: string;
  date: Date;
  content: string;
  sources: string[]; // Source IDs
  claims: string[]; // Claim IDs
  plagiarismResults: PlagiarismResult[];
  factualErrors: FactualError[];
  recommendations: string[];
  overallAccuracy: number; // 0-1
}

export interface PlagiarismResult {
  text: string;
  matchedSource: string;
  matchPercentage: number;
  url?: string;
}

export interface FactualError {
  statement: string;
  correction: string;
  sources: string[]; // Source IDs
  severity: 'high' | 'medium' | 'low';
}

export interface SearchQuery {
  text: string;
  topics?: string[];
  sourceTypes?: SourceType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  reliability?: number; // Minimum reliability score
  sortBy?: 'relevance' | 'date' | 'reliability';
}

export interface SearchResult {
  sources: Source[];
  experts: Expert[];
  claims: Claim[];
  newsAlerts: NewsAlert[];
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: Date;
  type: SourceType;
  relevance: number;
}

export interface ResearchMap {
  id: string;
  title: string;
  description: string;
  nodes: ResearchNode[];
  connections: NodeConnection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchNode {
  id: string;
  type: 'topic' | 'source' | 'claim' | 'expert' | 'event';
  title: string;
  description: string;
  itemId: string; // ID of the corresponding item
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  color: string;
}

export interface NodeConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: 'supports' | 'contradicts' | 'relates' | 'cites';
  strength: number; // 0-1
  label?: string;
}

export interface ResearchSettings {
  defaultCitationStyle: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee';
  autoSaveInterval: number; // minutes
  newsAlertFrequency: 'realtime' | 'daily' | 'weekly';
  minReliabilityScore: number; // 0-1
  plagiarismThreshold: number; // 0-1
  searchEngines: string[];
  apiKeys: Record<string, string>;
}

export interface ResearchStats {
  totalSources: number;
  totalClaims: number;
  verifiedClaims: number;
  disputedClaims: number;
  averageReliability: number;
  topTopics: { topic: string; count: number }[];
  sourcesByType: Record<SourceType, number>;
  recentActivity: {
    date: Date;
    action: string;
    item: string;
  }[];
}