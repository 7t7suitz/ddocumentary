import { ProductionProject, ProductionStats } from '../types/production';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const createNewProductionProject = (title: string, description: string): ProductionProject => {
  const startDate = new Date();
  const endDate = addDays(startDate, 90); // 3 months project by default
  
  return {
    id: uuidv4(),
    title,
    description,
    status: 'planning',
    startDate,
    endDate,
    budget: {
      id: uuidv4(),
      totalBudget: 100000,
      allocatedBudget: 0,
      remainingBudget: 100000,
      contingencyAmount: 10000,
      categories: [],
      expenses: [],
      notes: ''
    },
    team: [],
    schedule: {
      id: uuidv4(),
      phases: [],
      shootingDays: [],
      conflicts: [],
      notes: ''
    },
    equipment: {
      id: uuidv4(),
      items: [],
      packages: [],
      rentals: [],
      insurance: []
    },
    locations: [],
    documents: [],
    milestones: [],
    legalCompliance: {
      id: uuidv4(),
      releases: [],
      permits: [],
      licenses: [],
      insurance: [],
      checklist: []
    },
    distribution: {
      id: uuidv4(),
      strategy: '',
      platforms: [],
      festivals: [],
      marketingAssets: [],
      timeline: [],
      budget: 10000,
      targetAudience: [],
      notes: ''
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const calculateProductionStats = (project: ProductionProject): ProductionStats => {
  const today = new Date();
  
  // Budget stats
  const totalBudget = project.budget.totalBudget;
  const spentBudget = project.budget.expenses.reduce((sum, expense) => 
    expense.status === 'approved' || expense.status === 'reimbursed' ? sum + expense.amount : sum, 0);
  const remainingBudget = totalBudget - spentBudget;
  
  // Schedule stats
  const totalDays = project.schedule.shootingDays.length;
  const completedDays = project.schedule.shootingDays.filter(day => 
    day.status === 'completed' || (day.status === 'confirmed' && isAfter(today, day.date))).length;
  const remainingDays = totalDays - completedDays;
  
  // Task stats
  const allTasks = project.schedule.phases.flatMap(phase => phase.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = allTasks.filter(task => task.status === 'in-progress').length;
  const notStartedTasks = allTasks.filter(task => task.status === 'not-started').length;
  const blockedTasks = allTasks.filter(task => task.status === 'blocked').length;
  
  // Milestone stats
  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
  const upcomingMilestones = project.milestones.filter(m => 
    m.status !== 'completed' && isBefore(m.dueDate, addDays(today, 14))).length;
  const overdueMilestones = project.milestones.filter(m => 
    m.status !== 'completed' && isAfter(today, m.dueDate)).length;
  
  // Team stats
  const totalTeam = project.team.length;
  const teamByDepartment = project.team.reduce((acc, member) => {
    acc[member.department] = (acc[member.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Equipment stats
  const totalEquipment = project.equipment.items.length;
  const availableEquipment = project.equipment.items.filter(item => item.status === 'available').length;
  const inUseEquipment = project.equipment.items.filter(item => item.status === 'in-use').length;
  const maintenanceEquipment = project.equipment.items.filter(item => item.status === 'maintenance').length;
  
  // Compliance stats
  const totalCompliance = project.legalCompliance.checklist.length;
  const completedCompliance = project.legalCompliance.checklist.filter(item => item.completed).length;
  const pendingCompliance = totalCompliance - completedCompliance;
  
  return {
    budget: {
      total: totalBudget,
      spent: spentBudget,
      remaining: remainingBudget,
      percentageUsed: (spentBudget / totalBudget) * 100
    },
    schedule: {
      totalDays,
      completedDays,
      remainingDays,
      percentageComplete: (completedDays / totalDays) * 100,
      onSchedule: completedDays >= (totalDays * (Date.now() - project.startDate.getTime()) / 
        (project.endDate.getTime() - project.startDate.getTime()))
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      notStarted: notStartedTasks,
      blocked: blockedTasks,
      percentageComplete: (completedTasks / totalTasks) * 100
    },
    milestones: {
      total: totalMilestones,
      completed: completedMilestones,
      upcoming: upcomingMilestones,
      overdue: overdueMilestones
    },
    team: {
      total: totalTeam,
      byDepartment: teamByDepartment
    },
    equipment: {
      total: totalEquipment,
      available: availableEquipment,
      inUse: inUseEquipment,
      maintenance: maintenanceEquipment
    },
    compliance: {
      total: totalCompliance,
      completed: completedCompliance,
      pending: pendingCompliance,
      percentageComplete: (completedCompliance / totalCompliance) * 100
    }
  };
};

export const generateCallSheet = (project: ProductionProject, shootingDayId: string) => {
  const shootingDay = project.schedule.shootingDays.find(day => day.id === shootingDayId);
  if (!shootingDay) return null;
  
  const location = project.locations.find(loc => loc.id === shootingDay.locationId);
  
  const crew = shootingDay.crew.map(crewId => {
    const member = project.team.find(m => m.id === crewId);
    return member ? {
      name: member.name,
      role: member.role,
      callTime: shootingDay.callTime,
      contact: member.phone
    } : null;
  }).filter(Boolean);
  
  const equipment = shootingDay.equipment.map(equipId => {
    const item = project.equipment.items.find(i => i.id === equipId);
    return item ? {
      name: item.name,
      type: item.type,
      notes: item.notes
    } : null;
  }).filter(Boolean);
  
  return {
    title: `Call Sheet - ${format(shootingDay.date, 'MMMM d, yyyy')}`,
    projectTitle: project.title,
    date: shootingDay.date,
    callTime: shootingDay.callTime,
    wrapTime: shootingDay.wrapTime,
    location: location ? {
      name: location.name,
      address: location.address,
      notes: location.notes
    } : null,
    crew,
    equipment,
    scenes: shootingDay.scenes,
    notes: shootingDay.notes,
    emergencyContacts: [
      { name: 'Production Manager', phone: '555-123-4567' },
      { name: 'Nearest Hospital', phone: '555-911', address: 'Hospital Address' }
    ]
  };
};

export const generateProductionReport = (project: ProductionProject) => {
  const stats = calculateProductionStats(project);
  
  return {
    title: `Production Report - ${project.title}`,
    date: new Date(),
    projectStatus: project.status,
    duration: {
      total: Math.ceil((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)),
      elapsed: Math.ceil((Date.now() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)),
      remaining: Math.ceil((project.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    },
    budget: {
      total: stats.budget.total,
      spent: stats.budget.spent,
      remaining: stats.budget.remaining,
      percentageUsed: stats.budget.percentageUsed
    },
    schedule: {
      shootingDays: {
        total: stats.schedule.totalDays,
        completed: stats.schedule.completedDays,
        remaining: stats.schedule.remainingDays,
        percentageComplete: stats.schedule.percentageComplete
      },
      onSchedule: stats.schedule.onSchedule
    },
    tasks: {
      total: stats.tasks.total,
      completed: stats.tasks.completed,
      inProgress: stats.tasks.inProgress,
      notStarted: stats.tasks.notStarted,
      blocked: stats.tasks.blocked,
      percentageComplete: stats.tasks.percentageComplete
    },
    milestones: {
      total: stats.milestones.total,
      completed: stats.milestones.completed,
      upcoming: stats.milestones.upcoming,
      overdue: stats.milestones.overdue
    },
    compliance: {
      total: stats.compliance.total,
      completed: stats.compliance.completed,
      pending: stats.compliance.pending,
      percentageComplete: stats.compliance.percentageComplete
    },
    issues: [
      ...stats.milestones.overdue > 0 ? [`${stats.milestones.overdue} overdue milestone(s)`] : [],
      ...stats.budget.percentageUsed > 90 ? ['Budget usage over 90%'] : [],
      ...stats.tasks.blocked > 0 ? [`${stats.tasks.blocked} blocked task(s)`] : [],
      ...project.schedule.conflicts.filter(c => c.status === 'unresolved').length > 0 ? 
        [`${project.schedule.conflicts.filter(c => c.status === 'unresolved').length} unresolved schedule conflict(s)`] : []
    ],
    recommendations: [
      ...stats.milestones.overdue > 0 ? ['Review and update overdue milestones'] : [],
      ...stats.budget.percentageUsed > 90 ? ['Review budget allocation and consider additional funding'] : [],
      ...stats.tasks.blocked > 0 ? ['Address blocked tasks to maintain schedule'] : [],
      ...project.schedule.conflicts.filter(c => c.status === 'unresolved').length > 0 ? 
        ['Resolve schedule conflicts to avoid delays'] : []
    ]
  };
};