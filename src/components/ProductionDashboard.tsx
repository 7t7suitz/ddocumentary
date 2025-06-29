import React, { useState } from 'react';
import { 
  Calendar, Clock, DollarSign, Users, 
  Briefcase, MapPin, FileText, CheckSquare, 
  BarChart2, Film, Plus, Download, Settings,
  AlertCircle, TrendingUp, Zap
} from 'lucide-react';
import { ProductionProject, ProductionStats } from '../types/production';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { BudgetOverview } from './production/BudgetOverview';
import { ScheduleOverview } from './production/ScheduleOverview';
import { TeamOverview } from './production/TeamOverview';
import { EquipmentOverview } from './production/EquipmentOverview';
import { MilestoneTracker } from './production/MilestoneTracker';
import { ComplianceChecklist } from './production/ComplianceChecklist';
import { DistributionPlanner } from './production/DistributionPlanner';
import { DocumentManager } from './production/DocumentManager';

interface ProductionDashboardProps {
  project: ProductionProject;
  onProjectUpdate: (project: ProductionProject) => void;
}

export const ProductionDashboard: React.FC<ProductionDashboardProps> = ({
  project,
  onProjectUpdate
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);

  const calculateStats = (): ProductionStats => {
    // Budget stats
    const totalBudget = project.budget.totalBudget;
    const spentBudget = project.budget.expenses.reduce((sum, expense) => 
      expense.status === 'approved' || expense.status === 'reimbursed' ? sum + expense.amount : sum, 0);
    const remainingBudget = totalBudget - spentBudget;
    
    // Schedule stats
    const today = new Date();
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

  const stats = calculateStats();

  const exportProject = () => {
    setIsExporting(true);
    
    try {
      const projectData = JSON.stringify(project, null, 2);
      const blob = new Blob([projectData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-production-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pre-production': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'production': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'post-production': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'distribution': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'equipment', label: 'Equipment', icon: Briefcase },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'milestones', label: 'Milestones', icon: CheckSquare },
    { id: 'compliance', label: 'Legal', icon: AlertCircle },
    { id: 'distribution', label: 'Distribution', icon: Film }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Project Summary
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {project.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Start Date</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {format(project.startDate, 'MMMM d, yyyy')}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">End Date</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {format(project.endDate, 'MMMM d, yyyy')}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Duration</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {Math.ceil((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Team Size</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {project.team.length} members
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Progress</div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${stats.tasks.percentageComplete}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {Math.round(stats.tasks.percentageComplete)}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Budget Status</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  ${stats.budget.spent.toLocaleString()} / ${stats.budget.total.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Shooting Days</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {stats.schedule.completedDays} / {stats.schedule.totalDays} days
                </div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Tasks</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {stats.tasks.completed} / {stats.tasks.total} completed
                </div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Milestones</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {stats.milestones.completed} / {stats.milestones.total} completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Budget</div>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            ${stats.budget.remaining.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {Math.round(stats.budget.percentageUsed)}% used
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                stats.budget.percentageUsed > 90 ? 'bg-red-500' : 
                stats.budget.percentageUsed > 75 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${stats.budget.percentageUsed}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Schedule</div>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.schedule.remainingDays} days left
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {Math.round(stats.schedule.percentageComplete)}% complete
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${stats.schedule.percentageComplete}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Tasks</div>
            <CheckSquare className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.tasks.completed} / {stats.tasks.total}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {stats.tasks.inProgress} in progress, {stats.tasks.blocked} blocked
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${stats.tasks.percentageComplete}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Compliance</div>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.compliance.completed} / {stats.compliance.total}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {stats.compliance.pending} items pending
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                stats.compliance.percentageComplete < 50 ? 'bg-red-500' : 
                stats.compliance.percentageComplete < 80 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${stats.compliance.percentageComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Upcoming Milestones
            </h3>
            <button 
              onClick={() => setActiveTab('milestones')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {project.milestones
              .filter(m => m.status !== 'completed')
              .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
              .slice(0, 3)
              .map(milestone => (
                <div key={milestone.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {milestone.title}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Due: {format(milestone.dueDate, 'MMM d, yyyy')}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    milestone.status === 'delayed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {milestone.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            
            {project.milestones.filter(m => m.status !== 'completed').length === 0 && (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                No upcoming milestones
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Upcoming Shooting Days
            </h3>
            <button 
              onClick={() => setActiveTab('schedule')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {project.schedule.shootingDays
              .filter(day => day.status !== 'completed' && day.status !== 'cancelled')
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 3)
              .map(day => {
                const location = project.locations.find(l => l.id === day.locationId);
                
                return (
                  <div key={day.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {format(day.date, 'EEEE, MMMM d')}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {location?.name || 'Unknown location'} • {format(day.callTime, 'h:mm a')} call
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      day.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {day.status}
                    </span>
                  </div>
                );
              })}
            
            {project.schedule.shootingDays.filter(day => 
              day.status !== 'completed' && day.status !== 'cancelled').length === 0 && (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                No upcoming shooting days
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Alerts & Notifications
          </h3>
        </div>
        
        <div className="space-y-3">
          {/* Budget Alert */}
          {stats.budget.percentageUsed > 90 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-800 dark:text-red-200">Budget Alert</span>
              </div>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Budget usage is at {Math.round(stats.budget.percentageUsed)}%. Only ${stats.budget.remaining.toLocaleString()} remaining.
              </p>
            </div>
          )}
          
          {/* Overdue Milestones */}
          {stats.milestones.overdue > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-200">Overdue Milestones</span>
              </div>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                {stats.milestones.overdue} milestone{stats.milestones.overdue !== 1 ? 's are' : ' is'} past due. Review timeline.
              </p>
            </div>
          )}
          
          {/* Schedule Conflicts */}
          {project.schedule.conflicts.filter(c => c.status === 'unresolved').length > 0 && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-purple-800 dark:text-purple-200">Schedule Conflicts</span>
              </div>
              <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                {project.schedule.conflicts.filter(c => c.status === 'unresolved').length} unresolved schedule conflict{
                  project.schedule.conflicts.filter(c => c.status === 'unresolved').length !== 1 ? 's' : ''
                }. Resolve to avoid delays.
              </p>
            </div>
          )}
          
          {/* Compliance Issues */}
          {stats.compliance.percentageComplete < 80 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Legal Compliance</span>
              </div>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Legal compliance is at {Math.round(stats.compliance.percentageComplete)}%. Complete remaining items.
              </p>
            </div>
          )}
          
          {/* No Alerts */}
          {stats.budget.percentageUsed <= 90 && 
           stats.milestones.overdue === 0 && 
           project.schedule.conflicts.filter(c => c.status === 'unresolved').length === 0 &&
           stats.compliance.percentageComplete >= 80 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">All Systems Go</span>
              </div>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                No critical issues detected. Production is on track.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {project.title}
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
              {project.status.replace('-', ' ')}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {format(project.startDate, 'MMM d, yyyy')} - {format(project.endDate, 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportProject}
            disabled={isExporting}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
          
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'schedule' && <ScheduleOverview project={project} onProjectUpdate={onProjectUpdate} />}
        {activeTab === 'budget' && <BudgetOverview project={project} onProjectUpdate={onProjectUpdate} />}
        {activeTab === 'team' && <TeamOverview project={project} onProjectUpdate={onProjectUpdate} />}
        {activeTab === 'equipment' && <EquipmentOverview project={project} onProjectUpdate={onProjectUpdate} />}
        {activeTab === 'milestones' && <MilestoneTracker project={project} onProjectUpdate={onProjectUpdate} />}
        {activeTab === 'compliance' && <ComplianceChecklist project={project} onProjectUpdate={onProjectUpdate} />}
        {activeTab === 'distribution' && <DistributionPlanner project={project} onProjectUpdate={onProjectUpdate} />}
        {activeTab === 'documents' && <DocumentManager project={project} onProjectUpdate={onProjectUpdate} />}
      </div>
    </div>
  );
};