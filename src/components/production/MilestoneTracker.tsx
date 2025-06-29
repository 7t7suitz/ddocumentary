import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Edit3, Trash2, Check, 
  X, Filter, Search, Download, Calendar,
  Clock, Users, AlertCircle, Flag
} from 'lucide-react';
import { ProductionProject, Milestone } from '../../types/production';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface MilestoneTrackerProps {
  project: ProductionProject;
  onProjectUpdate: (project: ProductionProject) => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  project,
  onProjectUpdate
}) => {
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const updateMilestones = (milestones: Milestone[]) => {
    onProjectUpdate({
      ...project,
      milestones
    });
  };

  const addMilestone = () => {
    if (!newMilestone.title || !newMilestone.dueDate) return;
    
    const milestone: Milestone = {
      id: uuidv4(),
      title: newMilestone.title || '',
      description: newMilestone.description || '',
      dueDate: newMilestone.dueDate || new Date(),
      status: 'not-started',
      priority: newMilestone.priority || 'medium',
      assignedTo: newMilestone.assignedTo || [],
      dependencies: newMilestone.dependencies || [],
      deliverables: newMilestone.deliverables?.filter(Boolean) || [],
      notes: newMilestone.notes || ''
    };
    
    updateMilestones([...project.milestones, milestone]);
    setNewMilestone({});
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    const updatedMilestones = project.milestones.map(milestone => 
      milestone.id === id ? { ...milestone, ...updates } : milestone
    );
    
    updateMilestones(updatedMilestones);
    setEditingMilestone(null);
  };

  const deleteMilestone = (id: string) => {
    updateMilestones(project.milestones.filter(milestone => milestone.id !== id));
  };

  const completeMilestone = (id: string) => {
    updateMilestone(id, { 
      status: 'completed',
      completedDate: new Date()
    });
  };

  const exportMilestones = () => {
    const milestonesData = JSON.stringify(project.milestones, null, 2);
    const blob = new Blob([milestonesData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-milestones.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'not-started': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'delayed': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const filteredMilestones = project.milestones.filter(milestone => {
    const matchesSearch = milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         milestone.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || milestone.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || milestone.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const today = new Date();
  const upcomingMilestones = filteredMilestones.filter(m => 
    m.status !== 'completed' && isBefore(m.dueDate, addDays(today, 14))
  );
  
  const completedMilestones = filteredMilestones.filter(m => 
    m.status === 'completed'
  );
  
  const allMilestones = filteredMilestones.filter(m => 
    !upcomingMilestones.includes(m) && !completedMilestones.includes(m)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Milestone Tracker
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track project milestones and deliverables
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportMilestones}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Add Milestone Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Milestone
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title*
            </label>
            <input
              type="text"
              value={newMilestone.title || ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Complete Pre-Production"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Due Date*
            </label>
            <input
              type="date"
              value={newMilestone.dueDate ? format(newMilestone.dueDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={newMilestone.priority || 'medium'}
              onChange={(e) => setNewMilestone({ ...newMilestone, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assigned To
            </label>
            <select
              multiple
              value={newMilestone.assignedTo || []}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setNewMilestone({ ...newMilestone, assignedTo: options });
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {project.team.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hold Ctrl/Cmd to select multiple team members
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={newMilestone.description || ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Describe this milestone"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Deliverables (one per line)
            </label>
            <textarea
              value={newMilestone.deliverables?.join('\n') || ''}
              onChange={(e) => setNewMilestone({ 
                ...newMilestone, 
                deliverables: e.target.value.split('\n').map(item => item.trim())
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="List deliverables, one per line"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addMilestone}
            disabled={!newMilestone.title || !newMilestone.dueDate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Milestone Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milestones..."
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Upcoming Milestones
          </h3>
          
          <div className="space-y-4">
            {upcomingMilestones
              .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
              .map(milestone => (
                <div key={milestone.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-700 p-4">
                    {editingMilestone === milestone.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Title</label>
                            <input
                              type="text"
                              value={newMilestone.title !== undefined ? newMilestone.title : milestone.title}
                              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Due Date</label>
                            <input
                              type="date"
                              value={newMilestone.dueDate ? format(newMilestone.dueDate, 'yyyy-MM-dd') : format(milestone.dueDate, 'yyyy-MM-dd')}
                              onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: new Date(e.target.value) })}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                            <select
                              value={newMilestone.status !== undefined ? newMilestone.status : milestone.status}
                              onChange={(e) => setNewMilestone({ ...newMilestone, status: e.target.value as any })}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="delayed">Delayed</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                            <select
                              value={newMilestone.priority !== undefined ? newMilestone.priority : milestone.priority}
                              onChange={(e) => setNewMilestone({ ...newMilestone, priority: e.target.value as any })}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingMilestone(null);
                              setNewMilestone({});
                            }}
                            className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                          >
                            Cancel
                          </button>
                          
                          <button
                            onClick={() => {
                              updateMilestone(milestone.id, newMilestone);
                              setNewMilestone({});
                            }}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">
                              {milestone.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(milestone.status)}`}>
                              {milestone.status.replace('-', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(milestone.priority)}`}>
                              {milestone.priority}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {format(milestone.dueDate, 'MMM d, yyyy')}</span>
                            </div>
                            
                            {isAfter(today, milestone.dueDate) && milestone.status !== 'completed' && (
                              <div className="text-red-600 dark:text-red-400">
                                Overdue
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {milestone.status !== 'completed' && (
                            <button
                              onClick={() => completeMilestone(milestone.id)}
                              className="p-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                              title="Mark as completed"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setEditingMilestone(milestone.id);
                              setNewMilestone({});
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                            title="Edit milestone"
                          >
                            <Edit3 className="w-4 h-4 text-slate-500" />
                          </button>
                          
                          <button
                            onClick={() => deleteMilestone(milestone.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            title="Delete milestone"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    {milestone.description && (
                      <div className="mb-3">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {milestone.description}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {milestone.assignedTo.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Assigned To
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            {milestone.assignedTo.map(id => 
                              project.team.find(m => m.id === id)?.name || id
                            ).join(', ')}
                          </div>
                        </div>
                      )}
                      
                      {milestone.deliverables.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Deliverables
                          </div>
                          <div className="space-y-1">
                            {milestone.deliverables.map((deliverable, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span>{deliverable}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All Milestones */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          All Milestones ({filteredMilestones.length})
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Due Date</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Priority</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Assigned To</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allMilestones
                .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                .map(milestone => (
                  <tr key={milestone.id} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {milestone.title}
                      </div>
                      {milestone.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {milestone.description.length > 50 ? `${milestone.description.substring(0, 50)}...` : milestone.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {format(milestone.dueDate, 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(milestone.status)}`}>
                        {milestone.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(milestone.priority)}`}>
                        {milestone.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {milestone.assignedTo.map(id => 
                        project.team.find(m => m.id === id)?.name || id
                      ).join(', ') || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        {milestone.status !== 'completed' && (
                          <button
                            onClick={() => completeMilestone(milestone.id)}
                            className="p-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                            title="Mark as completed"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setEditingMilestone(milestone.id);
                            setNewMilestone({});
                          }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                          title="Edit milestone"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                        </button>
                        
                        <button
                          onClick={() => deleteMilestone(milestone.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          title="Delete milestone"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          
          {allMilestones.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No milestones found matching your criteria
            </div>
          )}
        </div>
      </div>

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Completed Milestones
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {completedMilestones.length} milestone{completedMilestones.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="space-y-2">
            {completedMilestones
              .sort((a, b) => (b.completedDate?.getTime() || 0) - (a.completedDate?.getTime() || 0))
              .map(milestone => (
                <div key={milestone.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {milestone.title}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Completed: {milestone.completedDate ? format(milestone.completedDate, 'MMM d, yyyy') : 'Unknown'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// For TypeScript
const Flag = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
);