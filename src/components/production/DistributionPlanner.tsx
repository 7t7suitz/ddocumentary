import React, { useState } from 'react';
import { 
  Film, Plus, Edit3, Trash2, Check, 
  X, Filter, Search, Download, Calendar,
  Globe, Award, FileText, Share2, Play
} from 'lucide-react';
import { ProductionProject, DistributionPlan, DistributionPlatform, FilmFestival, MarketingAsset, DistributionMilestone } from '../../types/production';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface DistributionPlannerProps {
  project: ProductionProject;
  onProjectUpdate: (project: ProductionProject) => void;
}

export const DistributionPlanner: React.FC<DistributionPlannerProps> = ({
  project,
  onProjectUpdate
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editingFestival, setEditingFestival] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [newPlatform, setNewPlatform] = useState<Partial<DistributionPlatform>>({});
  const [newFestival, setNewFestival] = useState<Partial<FilmFestival>>({});
  const [newAsset, setNewAsset] = useState<Partial<MarketingAsset>>({});
  const [newMilestone, setNewMilestone] = useState<Partial<DistributionMilestone>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const updateDistribution = (updates: Partial<DistributionPlan>) => {
    onProjectUpdate({
      ...project,
      distribution: {
        ...project.distribution,
        ...updates
      }
    });
  };

  const addPlatform = () => {
    if (!newPlatform.name || !newPlatform.type || !newPlatform.targetDate) return;
    
    const platform: DistributionPlatform = {
      id: uuidv4(),
      name: newPlatform.name || '',
      type: newPlatform.type || 'streaming',
      targetDate: newPlatform.targetDate || new Date(),
      requirements: newPlatform.requirements || [],
      deliverables: newPlatform.deliverables || [],
      status: newPlatform.status || 'planned',
      revenue: newPlatform.revenue,
      notes: newPlatform.notes || ''
    };
    
    updateDistribution({
      platforms: [...project.distribution.platforms, platform]
    });
    
    setNewPlatform({});
  };

  const updatePlatform = (id: string, updates: Partial<DistributionPlatform>) => {
    const updatedPlatforms = project.distribution.platforms.map(platform => 
      platform.id === id ? { ...platform, ...updates } : platform
    );
    
    updateDistribution({ platforms: updatedPlatforms });
    setEditingPlatform(null);
  };

  const deletePlatform = (id: string) => {
    updateDistribution({
      platforms: project.distribution.platforms.filter(platform => platform.id !== id)
    });
  };

  const addFestival = () => {
    if (!newFestival.name || !newFestival.location || !newFestival.submissionDeadline) return;
    
    const festival: FilmFestival = {
      id: uuidv4(),
      name: newFestival.name || '',
      location: newFestival.location || '',
      category: newFestival.category || '',
      submissionDeadline: newFestival.submissionDeadline || new Date(),
      notificationDate: newFestival.notificationDate,
      eventDate: newFestival.eventDate,
      submissionFee: newFestival.submissionFee || 0,
      status: newFestival.status || 'planned',
      notes: newFestival.notes || ''
    };
    
    updateDistribution({
      festivals: [...project.distribution.festivals, festival]
    });
    
    setNewFestival({});
  };

  const updateFestival = (id: string, updates: Partial<FilmFestival>) => {
    const updatedFestivals = project.distribution.festivals.map(festival => 
      festival.id === id ? { ...festival, ...updates } : festival
    );
    
    updateDistribution({ festivals: updatedFestivals });
    setEditingFestival(null);
  };

  const deleteFestival = (id: string) => {
    updateDistribution({
      festivals: project.distribution.festivals.filter(festival => festival.id !== id)
    });
  };

  const addMarketingAsset = () => {
    if (!newAsset.type || !newAsset.title || !newAsset.dueDate) return;
    
    const asset: MarketingAsset = {
      id: uuidv4(),
      type: newAsset.type || 'trailer',
      title: newAsset.title || '',
      description: newAsset.description || '',
      dueDate: newAsset.dueDate || new Date(),
      completedDate: newAsset.completedDate,
      assignedTo: newAsset.assignedTo || [],
      status: newAsset.status || 'planned',
      file: newAsset.file,
      notes: newAsset.notes || ''
    };
    
    updateDistribution({
      marketingAssets: [...project.distribution.marketingAssets, asset]
    });
    
    setNewAsset({});
  };

  const updateMarketingAsset = (id: string, updates: Partial<MarketingAsset>) => {
    const updatedAssets = project.distribution.marketingAssets.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    );
    
    updateDistribution({ marketingAssets: updatedAssets });
    setEditingAsset(null);
  };

  const deleteMarketingAsset = (id: string) => {
    updateDistribution({
      marketingAssets: project.distribution.marketingAssets.filter(asset => asset.id !== id)
    });
  };

  const addDistributionMilestone = () => {
    if (!newMilestone.title || !newMilestone.date) return;
    
    const milestone: DistributionMilestone = {
      id: uuidv4(),
      title: newMilestone.title || '',
      description: newMilestone.description || '',
      date: newMilestone.date || new Date(),
      completedDate: newMilestone.completedDate,
      status: newMilestone.status || 'planned',
      dependencies: newMilestone.dependencies || [],
      notes: newMilestone.notes || ''
    };
    
    updateDistribution({
      timeline: [...project.distribution.timeline, milestone]
    });
    
    setNewMilestone({});
  };

  const updateDistributionMilestone = (id: string, updates: Partial<DistributionMilestone>) => {
    const updatedTimeline = project.distribution.timeline.map(milestone => 
      milestone.id === id ? { ...milestone, ...updates } : milestone
    );
    
    updateDistribution({ timeline: updatedTimeline });
    setEditingMilestone(null);
  };

  const deleteDistributionMilestone = (id: string) => {
    updateDistribution({
      timeline: project.distribution.timeline.filter(milestone => milestone.id !== id)
    });
  };

  const exportDistribution = () => {
    const distributionData = JSON.stringify(project.distribution, null, 2);
    const blob = new Blob([distributionData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-distribution.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planned': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'screened': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'delayed': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'live': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'reserved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Distribution Strategy */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Distribution Strategy
          </h3>
          <button
            onClick={() => {
              const textarea = document.getElementById('distribution-strategy');
              if (textarea) {
                textarea.classList.remove('hidden');
                textarea.focus();
              }
            }}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        
        <p className="text-slate-700 dark:text-slate-300 mb-4">
          {project.distribution.strategy || 'No distribution strategy defined yet.'}
        </p>
        
        <textarea
          id="distribution-strategy"
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hidden mb-3"
          rows={5}
          defaultValue={project.distribution.strategy}
          onBlur={(e) => {
            updateDistribution({ strategy: e.target.value });
            e.target.classList.add('hidden');
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Platforms
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {project.distribution.platforms.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              {project.distribution.platforms.filter(p => p.status === 'live').length} live
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
              Festivals
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {project.distribution.festivals.length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              {project.distribution.festivals.filter(f => f.status === 'accepted' || f.status === 'screened').length} accepted
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Marketing Assets
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
              {project.distribution.marketingAssets.length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {project.distribution.marketingAssets.filter(a => a.status === 'completed').length} completed
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Target Audience
          </h3>
          <button
            onClick={() => {
              const textarea = document.getElementById('target-audience');
              if (textarea) {
                textarea.classList.remove('hidden');
                textarea.focus();
              }
            }}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.distribution.targetAudience.map((audience, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              {audience}
            </span>
          ))}
          
          {project.distribution.targetAudience.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400">
              No target audience defined yet.
            </p>
          )}
        </div>
        
        <textarea
          id="target-audience"
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hidden mb-3"
          rows={3}
          placeholder="Enter target audience segments, one per line"
          defaultValue={project.distribution.targetAudience.join('\n')}
          onBlur={(e) => {
            updateDistribution({ 
              targetAudience: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
            });
            e.target.classList.add('hidden');
          }}
        />
      </div>

      {/* Distribution Budget */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Distribution Budget
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={project.distribution.budget}
              onChange={(e) => updateDistribution({ budget: parseFloat(e.target.value) })}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-32"
              min="0"
              step="0.01"
            />
            <span className="text-slate-500 dark:text-slate-400">USD</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Festival Submissions
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {project.distribution.festivals.length} festivals × ${project.distribution.festivals.reduce((sum, f) => sum + f.submissionFee, 0) / Math.max(1, project.distribution.festivals.length)} avg fee
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                ${project.distribution.festivals.reduce((sum, f) => sum + f.submissionFee, 0).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Marketing Assets
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {project.distribution.marketingAssets.length} assets
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                ${Math.round(project.distribution.budget * 0.4).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Platform Deliverables
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {project.distribution.platforms.length} platforms
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                ${Math.round(project.distribution.budget * 0.3).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Remaining Budget
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Contingency & miscellaneous
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                ${Math.max(0, project.distribution.budget - project.distribution.festivals.reduce((sum, f) => sum + f.submissionFee, 0) - Math.round(project.distribution.budget * 0.7)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Distribution Timeline
          </h3>
          <button
            onClick={() => setActiveTab('timeline')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Full Timeline
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
          
          <div className="space-y-6">
            {project.distribution.timeline
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 3)
              .map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-start space-x-4">
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900
                    ${milestone.status === 'completed' 
                      ? 'bg-green-500' 
                      : milestone.status === 'in-progress' 
                      ? 'bg-blue-500' 
                      : 'bg-slate-300 dark:bg-slate-600'
                    }
                  `}>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {milestone.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {format(milestone.date, 'MMMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(milestone.status)}`}>
                          {milestone.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      {milestone.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {project.distribution.timeline.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No distribution milestones defined yet
            </div>
          )}
          
          {project.distribution.timeline.length > 3 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setActiveTab('timeline')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                View All {project.distribution.timeline.length} Milestones
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPlatformsTab = () => (
    <div className="space-y-6">
      {/* Add Platform Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Distribution Platform
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Platform Name*
            </label>
            <input
              type="text"
              value={newPlatform.name || ''}
              onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Netflix, Amazon Prime"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type*
            </label>
            <select
              value={newPlatform.type || ''}
              onChange={(e) => setNewPlatform({ ...newPlatform, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Type</option>
              <option value="theatrical">Theatrical</option>
              <option value="streaming">Streaming</option>
              <option value="broadcast">Broadcast</option>
              <option value="educational">Educational</option>
              <option value="social">Social Media</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Date*
            </label>
            <input
              type="date"
              value={newPlatform.targetDate ? format(newPlatform.targetDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewPlatform({ ...newPlatform, targetDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={newPlatform.status || 'planned'}
              onChange={(e) => setNewPlatform({ ...newPlatform, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="planned">Planned</option>
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="live">Live</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Projected Revenue
            </label>
            <input
              type="number"
              value={newPlatform.revenue?.projected || ''}
              onChange={(e) => setNewPlatform({ 
                ...newPlatform, 
                revenue: { 
                  ...newPlatform.revenue, 
                  projected: parseFloat(e.target.value) 
                } 
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Actual Revenue
            </label>
            <input
              type="number"
              value={newPlatform.revenue?.actual || ''}
              onChange={(e) => setNewPlatform({ 
                ...newPlatform, 
                revenue: { 
                  ...newPlatform.revenue, 
                  actual: parseFloat(e.target.value) 
                } 
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Requirements (one per line)
            </label>
            <textarea
              value={newPlatform.requirements?.join('\n') || ''}
              onChange={(e) => setNewPlatform({ 
                ...newPlatform, 
                requirements: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Enter each requirement on a new line"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Deliverables (one per line)
            </label>
            <textarea
              value={newPlatform.deliverables?.join('\n') || ''}
              onChange={(e) => setNewPlatform({ 
                ...newPlatform, 
                deliverables: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Enter each deliverable on a new line"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newPlatform.notes || ''}
              onChange={(e) => setNewPlatform({ ...newPlatform, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this platform"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addPlatform}
            disabled={!newPlatform.name || !newPlatform.type || !newPlatform.targetDate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Platform</span>
          </button>
        </div>
      </div>

      {/* Platforms List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Distribution Platforms ({project.distribution.platforms.length})
        </h3>
        
        <div className="space-y-4">
          {project.distribution.platforms.map(platform => (
            <div key={platform.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700 p-4">
                {editingPlatform === platform.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Name</label>
                        <input
                          type="text"
                          value={newPlatform.name !== undefined ? newPlatform.name : platform.name}
                          onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                        <select
                          value={newPlatform.status !== undefined ? newPlatform.status : platform.status}
                          onChange={(e) => setNewPlatform({ ...newPlatform, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        >
                          <option value="planned">Planned</option>
                          <option value="submitted">Submitted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="live">Live</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingPlatform(null);
                          setNewPlatform({});
                        }}
                        className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => {
                          updatePlatform(platform.id, newPlatform);
                          setNewPlatform({});
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
                          {platform.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(platform.status)}`}>
                          {platform.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <div className="capitalize">{platform.type.replace('-', ' ')}</div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Target: {format(platform.targetDate, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingPlatform(platform.id);
                          setNewPlatform({});
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <button
                        onClick={() => deletePlatform(platform.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {platform.requirements.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Requirements
                      </div>
                      <div className="space-y-1">
                        {platform.requirements.map((requirement, index) => (
                          <div key={index} className="text-sm text-slate-700 dark:text-slate-300">
                            • {requirement}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {platform.deliverables.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Deliverables
                      </div>
                      <div className="space-y-1">
                        {platform.deliverables.map((deliverable, index) => (
                          <div key={index} className="text-sm text-slate-700 dark:text-slate-300">
                            • {deliverable}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {platform.revenue && (platform.revenue.projected > 0 || platform.revenue.actual > 0) && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Revenue
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      {platform.revenue.projected > 0 && (
                        <div className="text-slate-700 dark:text-slate-300">
                          Projected: ${platform.revenue.projected.toLocaleString()}
                        </div>
                      )}
                      
                      {platform.revenue.actual > 0 && (
                        <div className="text-green-600 dark:text-green-400">
                          Actual: ${platform.revenue.actual.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {platform.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Notes
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {platform.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {project.distribution.platforms.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No distribution platforms added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFestivalsTab = () => (
    <div className="space-y-6">
      {/* Add Festival Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Film Festival
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Festival Name*
            </label>
            <input
              type="text"
              value={newFestival.name || ''}
              onChange={(e) => setNewFestival({ ...newFestival, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Sundance Film Festival"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Location*
            </label>
            <input
              type="text"
              value={newFestival.location || ''}
              onChange={(e) => setNewFestival({ ...newFestival, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Park City, Utah"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={newFestival.category || ''}
              onChange={(e) => setNewFestival({ ...newFestival, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Documentary Feature"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Submission Deadline*
            </label>
            <input
              type="date"
              value={newFestival.submissionDeadline ? format(newFestival.submissionDeadline, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewFestival({ ...newFestival, submissionDeadline: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notification Date
            </label>
            <input
              type="date"
              value={newFestival.notificationDate ? format(newFestival.notificationDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewFestival({ ...newFestival, notificationDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Event Date
            </label>
            <input
              type="date"
              value={newFestival.eventDate ? format(newFestival.eventDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewFestival({ ...newFestival, eventDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Submission Fee
            </label>
            <input
              type="number"
              value={newFestival.submissionFee || ''}
              onChange={(e) => setNewFestival({ ...newFestival, submissionFee: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={newFestival.status || 'planned'}
              onChange={(e) => setNewFestival({ ...newFestival, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="planned">Planned</option>
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="screened">Screened</option>
            </select>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newFestival.notes || ''}
              onChange={(e) => setNewFestival({ ...newFestival, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this festival"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addFestival}
            disabled={!newFestival.name || !newFestival.location || !newFestival.submissionDeadline}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Festival</span>
          </button>
        </div>
      </div>

      {/* Festivals List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Film Festivals ({project.distribution.festivals.length})
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search festivals..."
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="screened">Screened</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          {project.distribution.festivals
            .filter(festival => {
              const matchesSearch = festival.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   festival.location.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesStatus = filterStatus === 'all' || festival.status === filterStatus;
              return matchesSearch && matchesStatus;
            })
            .sort((a, b) => a.submissionDeadline.getTime() - b.submissionDeadline.getTime())
            .map(festival => (
              <div key={festival.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700 p-4">
                  {editingFestival === festival.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Name</label>
                          <input
                            type="text"
                            value={newFestival.name !== undefined ? newFestival.name : festival.name}
                            onChange={(e) => setNewFestival({ ...newFestival, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                          <select
                            value={newFestival.status !== undefined ? newFestival.status : festival.status}
                            onChange={(e) => setNewFestival({ ...newFestival, status: e.target.value as any })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          >
                            <option value="planned">Planned</option>
                            <option value="submitted">Submitted</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="screened">Screened</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingFestival(null);
                            setNewFestival({});
                          }}
                          className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          Cancel
                        </button>
                        
                        <button
                          onClick={() => {
                            updateFestival(festival.id, newFestival);
                            setNewFestival({});
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
                            {festival.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(festival.status)}`}>
                            {festival.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Globe className="w-3 h-3" />
                            <span>{festival.location}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Deadline: {format(festival.submissionDeadline, 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingFestival(festival.id);
                            setNewFestival({});
                          }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          <Edit3 className="w-4 h-4 text-slate-500" />
                        </button>
                        
                        <button
                          onClick={() => deleteFestival(festival.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    {festival.category && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Category
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {festival.category}
                        </div>
                      </div>
                    )}
                    
                    {festival.notificationDate && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Notification Date
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {format(festival.notificationDate, 'MMM d, yyyy')}
                        </div>
                      </div>
                    )}
                    
                    {festival.eventDate && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Event Date
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {format(festival.eventDate, 'MMM d, yyyy')}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {festival.submissionFee > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Submission Fee
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        ${festival.submissionFee.toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {festival.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Notes
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {festival.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          
          {project.distribution.festivals.filter(festival => {
            const matchesSearch = festival.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 festival.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'all' || festival.status === filterStatus;
            return matchesSearch && matchesStatus;
          }).length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No festivals found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMarketingTab = () => (
    <div className="space-y-6">
      {/* Add Marketing Asset Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Marketing Asset
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Asset Type*
            </label>
            <select
              value={newAsset.type || ''}
              onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Type</option>
              <option value="trailer">Trailer</option>
              <option value="poster">Poster</option>
              <option value="press-kit">Press Kit</option>
              <option value="website">Website</option>
              <option value="social">Social Media Assets</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title*
            </label>
            <input
              type="text"
              value={newAsset.title || ''}
              onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Official Trailer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Due Date*
            </label>
            <input
              type="date"
              value={newAsset.dueDate ? format(newAsset.dueDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewAsset({ ...newAsset, dueDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={newAsset.status || 'planned'}
              onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assigned To
            </label>
            <select
              multiple
              value={newAsset.assignedTo || []}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setNewAsset({ ...newAsset, assignedTo: options });
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
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Completed Date
            </label>
            <input
              type="date"
              value={newAsset.completedDate ? format(newAsset.completedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewAsset({ ...newAsset, completedDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              disabled={newAsset.status !== 'completed'}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={newAsset.description || ''}
              onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Description of this marketing asset"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newAsset.notes || ''}
              onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this asset"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addMarketingAsset}
            disabled={!newAsset.type || !newAsset.title || !newAsset.dueDate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Marketing Assets List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Marketing Assets ({project.distribution.marketingAssets.length})
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="trailer">Trailer</option>
              <option value="poster">Poster</option>
              <option value="press-kit">Press Kit</option>
              <option value="website">Website</option>
              <option value="social">Social Media</option>
              <option value="other">Other</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          {project.distribution.marketingAssets
            .filter(asset => {
              const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   (asset.description || '').toLowerCase().includes(searchQuery.toLowerCase());
              const matchesType = filterType === 'all' || asset.type === filterType;
              const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
              return matchesSearch && matchesType && matchesStatus;
            })
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .map(asset => (
              <div key={asset.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700 p-4">
                  {editingAsset === asset.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={newAsset.title !== undefined ? newAsset.title : asset.title}
                            onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                          <select
                            value={newAsset.status !== undefined ? newAsset.status : asset.status}
                            onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value as any })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          >
                            <option value="planned">Planned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingAsset(null);
                            setNewAsset({});
                          }}
                          className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          Cancel
                        </button>
                        
                        <button
                          onClick={() => {
                            updateMarketingAsset(asset.id, newAsset);
                            setNewAsset({});
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
                            {asset.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(asset.status)}`}>
                            {asset.status.replace('-', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <div className="capitalize">{asset.type.replace('-', ' ')}</div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {format(asset.dueDate, 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingAsset(asset.id);
                            setNewAsset({});
                          }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          <Edit3 className="w-4 h-4 text-slate-500" />
                        </button>
                        
                        <button
                          onClick={() => deleteMarketingAsset(asset.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  {asset.description && (
                    <div className="mb-3">
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {asset.description}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {asset.assignedTo.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Assigned To
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {asset.assignedTo.map(id => 
                            project.team.find(m => m.id === id)?.name || id
                          ).join(', ')}
                        </div>
                      </div>
                    )}
                    
                    {asset.completedDate && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Completed Date
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {format(asset.completedDate, 'MMM d, yyyy')}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {asset.file && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        File
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <a 
                          href={asset.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View File
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {asset.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Notes
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {asset.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          
          {project.distribution.marketingAssets.filter(asset => {
            const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (asset.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'all' || asset.type === filterType;
            const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
            return matchesSearch && matchesType && matchesStatus;
          }).length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No marketing assets found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="space-y-6">
      {/* Add Milestone Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Distribution Milestone
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
              placeholder="e.g., Festival Premiere"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date*
            </label>
            <input
              type="date"
              value={newMilestone.date ? format(newMilestone.date, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, date: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={newMilestone.status || 'planned'}
              onChange={(e) => setNewMilestone({ ...newMilestone, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Completed Date
            </label>
            <input
              type="date"
              value={newMilestone.completedDate ? format(newMilestone.completedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, completedDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              disabled={newMilestone.status !== 'completed'}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={newMilestone.description || ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Description of this milestone"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Dependencies (one per line)
            </label>
            <textarea
              value={newMilestone.dependencies?.join('\n') || ''}
              onChange={(e) => setNewMilestone({ 
                ...newMilestone, 
                dependencies: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Enter each dependency on a new line"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newMilestone.notes || ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this milestone"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addDistributionMilestone}
            disabled={!newMilestone.title || !newMilestone.date}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Distribution Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Distribution Timeline
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportDistribution}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
          
          <div className="space-y-6">
            {project.distribution.timeline
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-start space-x-4">
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900
                    ${milestone.status === 'completed' 
                      ? 'bg-green-500' 
                      : milestone.status === 'in-progress' 
                      ? 'bg-blue-500' 
                      : milestone.status === 'delayed' 
                      ? 'bg-amber-500' 
                      : 'bg-slate-300 dark:bg-slate-600'
                    }
                  `}>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
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
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                              <select
                                value={newMilestone.status !== undefined ? newMilestone.status : milestone.status}
                                onChange={(e) => setNewMilestone({ ...newMilestone, status: e.target.value as any })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                              >
                                <option value="planned">Planned</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="delayed">Delayed</option>
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
                                updateDistributionMilestone(milestone.id, newMilestone);
                                setNewMilestone({});
                              }}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                {milestone.title}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  {format(milestone.date, 'MMMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(milestone.status)}`}>
                                {milestone.status.replace('-', ' ')}
                              </span>
                              
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingMilestone(milestone.id);
                                    setNewMilestone({});
                                  }}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                                >
                                  <Edit3 className="w-3 h-3 text-slate-500" />
                                </button>
                                
                                <button
                                  onClick={() => deleteDistributionMilestone(milestone.id)}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {milestone.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {milestone.description}
                            </p>
                          )}
                          
                          {milestone.dependencies.length > 0 && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                Dependencies
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {milestone.dependencies.map((dependency, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                                  >
                                    {dependency}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {milestone.completedDate && (
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Completed on {format(milestone.completedDate, 'MMMM d, yyyy')}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {project.distribution.timeline.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No distribution milestones defined yet
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
            Distribution Planner
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Plan and manage your distribution strategy, platforms, festivals, and marketing
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportDistribution}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Film className="w-4 h-4" />
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('platforms')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'platforms'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Globe className="w-4 h-4" />
            <span>Platforms</span>
          </button>
          
          <button
            onClick={() => setActiveTab('festivals')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'festivals'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Award className="w-4 h-4" />
            <span>Festivals</span>
          </button>
          
          <button
            onClick={() => setActiveTab('marketing')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'marketing'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Play className="w-4 h-4" />
            <span>Marketing</span>
          </button>
          
          <button
            onClick={() => setActiveTab('timeline')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'timeline'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'platforms' && renderPlatformsTab()}
        {activeTab === 'festivals' && renderFestivalsTab()}
        {activeTab === 'marketing' && renderMarketingTab()}
        {activeTab === 'timeline' && renderTimelineTab()}
      </div>
    </div>
  );
};