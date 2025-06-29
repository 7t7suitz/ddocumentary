export interface ProductionProject {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'pre-production' | 'production' | 'post-production' | 'distribution' | 'completed';
  startDate: Date;
  endDate: Date;
  budget: Budget;
  team: TeamMember[];
  schedule: ProductionSchedule;
  equipment: EquipmentInventory;
  locations: Location[];
  documents: Document[];
  milestones: Milestone[];
  legalCompliance: LegalCompliance;
  distribution: DistributionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  totalBudget: number;
  allocatedBudget: number;
  remainingBudget: number;
  contingencyAmount: number;
  categories: BudgetCategory[];
  expenses: Expense[];
  approvedBy?: string;
  approvalDate?: Date;
  notes: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  name: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  quantity: number;
  unit: string;
  vendor?: string;
  status: 'planned' | 'approved' | 'purchased' | 'paid';
  notes: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  itemId?: string;
  date: Date;
  amount: number;
  description: string;
  receipt?: string;
  paymentMethod: string;
  paidBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  approvedBy?: string;
  approvalDate?: Date;
  notes: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  rate: {
    amount: number;
    unit: 'hourly' | 'daily' | 'weekly' | 'project';
  };
  availability: {
    startDate: Date;
    endDate: Date;
    exceptions: {
      date: Date;
      available: boolean;
      reason?: string;
    }[];
  };
  skills: string[];
  notes: string;
  documents: {
    contract?: string;
    resume?: string;
    portfolio?: string;
    other?: string[];
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface ProductionSchedule {
  id: string;
  phases: ProductionPhase[];
  shootingDays: ShootingDay[];
  conflicts: ScheduleConflict[];
  notes: string;
}

export interface ProductionPhase {
  id: string;
  name: string;
  type: 'pre-production' | 'production' | 'post-production' | 'distribution';
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  tasks: Task[];
  milestoneIds: string[];
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  startDate: Date;
  dueDate: Date;
  duration: number; // in hours
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[]; // IDs of tasks that must be completed before this one
  progress: number; // 0-100
  notes: string;
  attachments: string[];
}

export interface ShootingDay {
  id: string;
  date: Date;
  locationId: string;
  callTime: Date;
  wrapTime: Date;
  scenes: string[];
  crew: string[];
  equipment: string[];
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  weatherForecast?: WeatherForecast;
}

export interface WeatherForecast {
  condition: string;
  temperature: {
    min: number;
    max: number;
  };
  precipitation: number;
  windSpeed: number;
  sunrise: Date;
  sunset: Date;
}

export interface ScheduleConflict {
  id: string;
  type: 'team' | 'equipment' | 'location' | 'other';
  description: string;
  affectedItems: string[];
  startDate: Date;
  endDate: Date;
  severity: 'low' | 'medium' | 'high';
  resolution?: string;
  status: 'unresolved' | 'resolved';
}

export interface EquipmentInventory {
  id: string;
  items: EquipmentItem[];
  packages: EquipmentPackage[];
  rentals: EquipmentRental[];
  insurance: InsurancePolicy[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  status: 'available' | 'in-use' | 'maintenance' | 'lost' | 'damaged';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  owner: 'owned' | 'rented' | 'borrowed';
  purchaseDate?: Date;
  purchasePrice?: number;
  notes: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  attachments: string[];
}

export interface EquipmentPackage {
  id: string;
  name: string;
  description: string;
  items: string[]; // IDs of equipment items
  status: 'available' | 'in-use' | 'incomplete';
  assignedTo?: string;
  notes: string;
}

export interface EquipmentRental {
  id: string;
  vendor: string;
  items: string[];
  startDate: Date;
  endDate: Date;
  cost: number;
  deposit?: number;
  insuranceRequired: boolean;
  status: 'planned' | 'reserved' | 'picked-up' | 'returned';
  confirmationNumber?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  notes: string;
  attachments: string[];
}

export interface InsurancePolicy {
  id: string;
  type: 'equipment' | 'liability' | 'production' | 'errors-omissions';
  provider: string;
  policyNumber: string;
  coverage: string;
  startDate: Date;
  endDate: Date;
  cost: number;
  deductible: number;
  coveredItems: string[];
  documents: string[];
  notes: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  type: 'interior' | 'exterior' | 'studio' | 'mixed';
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  permitRequired: boolean;
  permitStatus?: 'not-applied' | 'pending' | 'approved' | 'denied';
  permitCost?: number;
  permitDocuments?: string[];
  features: string[];
  limitations: string[];
  availableDates: {
    startDate: Date;
    endDate: Date;
  }[];
  cost: number;
  deposit?: number;
  photos: string[];
  notes: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'contract' | 'release' | 'permit' | 'script' | 'storyboard' | 'shot-list' | 'call-sheet' | 'budget' | 'other';
  file: string;
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'review' | 'approved' | 'final';
  approvedBy?: string;
  approvalDate?: Date;
  notes: string;
  tags: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string[];
  dependencies: string[];
  deliverables: string[];
  notes: string;
}

export interface LegalCompliance {
  id: string;
  releases: Release[];
  permits: Permit[];
  licenses: License[];
  insurance: InsurancePolicy[];
  checklist: ComplianceItem[];
}

export interface Release {
  id: string;
  type: 'personal' | 'location' | 'material' | 'minor';
  releasedBy: string;
  releasedDate: Date;
  coverage: string;
  compensation?: number;
  status: 'pending' | 'signed' | 'expired' | 'revoked';
  document?: string;
  notes: string;
}

export interface Permit {
  id: string;
  type: string;
  issuedBy: string;
  issuedDate?: Date;
  expirationDate?: Date;
  locations: string[];
  restrictions: string[];
  cost: number;
  status: 'not-applied' | 'pending' | 'approved' | 'denied';
  document?: string;
  notes: string;
}

export interface License {
  id: string;
  type: 'music' | 'footage' | 'image' | 'software' | 'other';
  content: string;
  licensor: string;
  acquired: boolean;
  acquiredDate?: Date;
  expirationDate?: Date;
  territory: string;
  usage: string;
  cost: number;
  status: 'needed' | 'pending' | 'acquired' | 'expired';
  document?: string;
  notes: string;
}

export interface ComplianceItem {
  id: string;
  category: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedDate?: Date;
  completedBy?: string;
  notes: string;
}

export interface DistributionPlan {
  id: string;
  strategy: string;
  platforms: DistributionPlatform[];
  festivals: FilmFestival[];
  marketingAssets: MarketingAsset[];
  timeline: DistributionMilestone[];
  budget: number;
  targetAudience: string[];
  notes: string;
}

export interface DistributionPlatform {
  id: string;
  name: string;
  type: 'theatrical' | 'streaming' | 'broadcast' | 'educational' | 'social' | 'other';
  targetDate: Date;
  requirements: string[];
  deliverables: string[];
  status: 'planned' | 'submitted' | 'accepted' | 'rejected' | 'live';
  revenue?: {
    projected: number;
    actual: number;
  };
  notes: string;
}

export interface FilmFestival {
  id: string;
  name: string;
  location: string;
  category: string;
  submissionDeadline: Date;
  notificationDate?: Date;
  eventDate?: Date;
  submissionFee: number;
  status: 'planned' | 'submitted' | 'accepted' | 'rejected' | 'screened';
  notes: string;
}

export interface MarketingAsset {
  id: string;
  type: 'trailer' | 'poster' | 'press-kit' | 'website' | 'social' | 'other';
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  assignedTo: string[];
  status: 'planned' | 'in-progress' | 'completed';
  file?: string;
  notes: string;
}

export interface DistributionMilestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  completedDate?: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  dependencies: string[];
  notes: string;
}

export interface ProductionStats {
  budget: {
    total: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
  };
  schedule: {
    totalDays: number;
    completedDays: number;
    remainingDays: number;
    percentageComplete: number;
    onSchedule: boolean;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    blocked: number;
    percentageComplete: number;
  };
  milestones: {
    total: number;
    completed: number;
    upcoming: number;
    overdue: number;
  };
  team: {
    total: number;
    byDepartment: Record<string, number>;
  };
  equipment: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
  compliance: {
    total: number;
    completed: number;
    pending: number;
    percentageComplete: number;
  };
}