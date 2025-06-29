import React, { useState } from 'react';
import { 
  AlertCircle, Plus, Edit3, Trash2, Check, 
  X, Filter, Search, Download, FileText,
  Calendar, Shield, User, MapPin
} from 'lucide-react';
import { ProductionProject, LegalCompliance, Release, Permit, License, ComplianceItem } from '../../types/production';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface ComplianceChecklistProps {
  project: ProductionProject;
  onProjectUpdate: (project: ProductionProject) => void;
}

export const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({
  project,
  onProjectUpdate
}) => {
  const [activeTab, setActiveTab] = useState('checklist');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingRelease, setEditingRelease] = useState<string | null>(null);
  const [editingPermit, setEditingPermit] = useState<string | null>(null);
  const [editingLicense, setEditingLicense] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<ComplianceItem>>({});
  const [newRelease, setNewRelease] = useState<Partial<Release>>({});
  const [newPermit, setNewPermit] = useState<Partial<Permit>>({});
  const [newLicense, setNewLicense] = useState<Partial<License>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCompleted, setFilterCompleted] = useState('all');

  const updateCompliance = (updates: Partial<LegalCompliance>) => {
    onProjectUpdate({
      ...project,
      legalCompliance: {
        ...project.legalCompliance,
        ...updates
      }
    });
  };

  const addComplianceItem = () => {
    if (!newItem.description || !newItem.category) return;
    
    const item: ComplianceItem = {
      id: uuidv4(),
      category: newItem.category || '',
      description: newItem.description || '',
      required: newItem.required !== undefined ? newItem.required : true,
      completed: false,
      notes: newItem.notes || ''
    };
    
    updateCompliance({
      checklist: [...project.legalCompliance.checklist, item]
    });
    
    setNewItem({});
  };

  const updateComplianceItem = (id: string, updates: Partial<ComplianceItem>) => {
    const updatedChecklist = project.legalCompliance.checklist.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    
    updateCompliance({ checklist: updatedChecklist });
    setEditingItem(null);
  };

  const deleteComplianceItem = (id: string) => {
    updateCompliance({
      checklist: project.legalCompliance.checklist.filter(item => item.id !== id)
    });
  };

  const toggleComplianceItem = (id: string, completed: boolean) => {
    updateComplianceItem(id, { 
      completed,
      completedDate: completed ? new Date() : undefined,
      completedBy: completed ? 'Current User' : undefined
    });
  };

  const addRelease = () => {
    if (!newRelease.type || !newRelease.releasedBy) return;
    
    const release: Release = {
      id: uuidv4(),
      type: newRelease.type || 'personal',
      releasedBy: newRelease.releasedBy || '',
      releasedDate: newRelease.releasedDate || new Date(),
      coverage: newRelease.coverage || '',
      compensation: newRelease.compensation,
      status: newRelease.status || 'pending',
      document: newRelease.document,
      notes: newRelease.notes || ''
    };
    
    updateCompliance({
      releases: [...project.legalCompliance.releases, release]
    });
    
    setNewRelease({});
  };

  const updateRelease = (id: string, updates: Partial<Release>) => {
    const updatedReleases = project.legalCompliance.releases.map(release => 
      release.id === id ? { ...release, ...updates } : release
    );
    
    updateCompliance({ releases: updatedReleases });
    setEditingRelease(null);
  };

  const deleteRelease = (id: string) => {
    updateCompliance({
      releases: project.legalCompliance.releases.filter(release => release.id !== id)
    });
  };

  const addPermit = () => {
    if (!newPermit.type || !newPermit.issuedBy) return;
    
    const permit: Permit = {
      id: uuidv4(),
      type: newPermit.type || '',
      issuedBy: newPermit.issuedBy || '',
      issuedDate: newPermit.issuedDate,
      expirationDate: newPermit.expirationDate,
      locations: newPermit.locations || [],
      restrictions: newPermit.restrictions || [],
      cost: newPermit.cost || 0,
      status: newPermit.status || 'not-applied',
      document: newPermit.document,
      notes: newPermit.notes || ''
    };
    
    updateCompliance({
      permits: [...project.legalCompliance.permits, permit]
    });
    
    setNewPermit({});
  };

  const updatePermit = (id: string, updates: Partial<Permit>) => {
    const updatedPermits = project.legalCompliance.permits.map(permit => 
      permit.id === id ? { ...permit, ...updates } : permit
    );
    
    updateCompliance({ permits: updatedPermits });
    setEditingPermit(null);
  };

  const deletePermit = (id: string) => {
    updateCompliance({
      permits: project.legalCompliance.permits.filter(permit => permit.id !== id)
    });
  };

  const addLicense = () => {
    if (!newLicense.type || !newLicense.content || !newLicense.licensor) return;
    
    const license: License = {
      id: uuidv4(),
      type: newLicense.type || 'music',
      content: newLicense.content || '',
      licensor: newLicense.licensor || '',
      acquired: newLicense.acquired || false,
      acquiredDate: newLicense.acquiredDate,
      expirationDate: newLicense.expirationDate,
      territory: newLicense.territory || 'Worldwide',
      usage: newLicense.usage || '',
      cost: newLicense.cost || 0,
      status: newLicense.status || 'needed',
      document: newLicense.document,
      notes: newLicense.notes || ''
    };
    
    updateCompliance({
      licenses: [...project.legalCompliance.licenses, license]
    });
    
    setNewLicense({});
  };

  const updateLicense = (id: string, updates: Partial<License>) => {
    const updatedLicenses = project.legalCompliance.licenses.map(license => 
      license.id === id ? { ...license, ...updates } : license
    );
    
    updateCompliance({ licenses: updatedLicenses });
    setEditingLicense(null);
  };

  const deleteLicense = (id: string) => {
    updateCompliance({
      licenses: project.legalCompliance.licenses.filter(license => license.id !== id)
    });
  };

  const exportCompliance = () => {
    const complianceData = JSON.stringify(project.legalCompliance, null, 2);
    const blob = new Blob([complianceData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-compliance.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categories = Array.from(new Set(project.legalCompliance.checklist.map(item => item.category)));

  const filteredChecklist = project.legalCompliance.checklist.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesCompleted = filterCompleted === 'all' || 
                            (filterCompleted === 'completed' && item.completed) || 
                            (filterCompleted === 'pending' && !item.completed);
    return matchesSearch && matchesCategory && matchesCompleted;
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'signed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'revoked': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'not-applied': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'denied': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'needed': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'acquired': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const renderChecklistTab = () => (
    <div className="space-y-6">
      {/* Add Compliance Item Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Compliance Item
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description*
            </label>
            <input
              type="text"
              value={newItem.description || ''}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Obtain location release forms"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category*
            </label>
            <input
              type="text"
              value={newItem.category || ''}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Releases"
              list="categories"
            />
            <datalist id="categories">
              {categories.map(category => (
                <option key={category} value={category} />
              ))}
              <option value="Releases" />
              <option value="Permits" />
              <option value="Insurance" />
              <option value="Licenses" />
              <option value="Contracts" />
              <option value="Safety" />
            </datalist>
          </div>
          
          <div className="flex items-center h-10">
            <input
              type="checkbox"
              checked={newItem.required !== undefined ? newItem.required : true}
              onChange={(e) => setNewItem({ ...newItem, required: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-600 text-blue-600"
            />
            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              This item is required for legal compliance
            </span>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newItem.notes || ''}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this compliance item"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addComplianceItem}
            disabled={!newItem.description || !newItem.category}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Compliance Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search checklist..."
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={filterCompleted}
              onChange={(e) => setFilterCompleted(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Items</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportCompliance}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Compliance Checklist
          </h3>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {project.legalCompliance.checklist.filter(item => item.completed).length} of {project.legalCompliance.checklist.length} completed
          </div>
        </div>
        
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-green-500 rounded-full"
            style={{ 
              width: `${project.legalCompliance.checklist.length > 0 
                ? (project.legalCompliance.checklist.filter(item => item.completed).length / project.legalCompliance.checklist.length) * 100 
                : 0}%` 
            }}
          />
        </div>
        
        <div className="space-y-4">
          {filteredChecklist.map(item => (
            <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700 p-4">
                {editingItem === item.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Description</label>
                        <input
                          type="text"
                          value={newItem.description !== undefined ? newItem.description : item.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Category</label>
                        <input
                          type="text"
                          value={newItem.category !== undefined ? newItem.category : item.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          list="categories"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newItem.required !== undefined ? newItem.required : item.required}
                        onChange={(e) => setNewItem({ ...newItem, required: e.target.checked })}
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                        This item is required for legal compliance
                      </span>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setNewItem({});
                        }}
                        className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => {
                          updateComplianceItem(item.id, newItem);
                          setNewItem({});
                        }}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => toggleComplianceItem(item.id, e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-600 text-green-600 w-5 h-5"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${
                            item.completed 
                              ? 'text-slate-500 dark:text-slate-400 line-through' 
                              : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {item.description}
                          </h4>
                          <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                            {item.category}
                          </span>
                          {item.required && (
                            <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        
                        {item.completed && item.completedDate && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Completed on {format(item.completedDate, 'MMM d, yyyy')}
                            {item.completedBy && ` by ${item.completedBy}`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item.id);
                          setNewItem({});
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <button
                        onClick={() => deleteComplianceItem(item.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {item.notes && (
                <div className="p-4 pt-0">
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Notes
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {item.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredChecklist.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No compliance items found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderReleasesTab = () => (
    <div className="space-y-6">
      {/* Add Release Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Release Form
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type*
            </label>
            <select
              value={newRelease.type || ''}
              onChange={(e) => setNewRelease({ ...newRelease, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Type</option>
              <option value="personal">Personal Appearance Release</option>
              <option value="location">Location Release</option>
              <option value="material">Material Release</option>
              <option value="minor">Minor Release</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Released By*
            </label>
            <input
              type="text"
              value={newRelease.releasedBy || ''}
              onChange={(e) => setNewRelease({ ...newRelease, releasedBy: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Released Date
            </label>
            <input
              type="date"
              value={newRelease.releasedDate ? format(newRelease.releasedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setNewRelease({ ...newRelease, releasedDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Coverage
            </label>
            <input
              type="text"
              value={newRelease.coverage || ''}
              onChange={(e) => setNewRelease({ ...newRelease, coverage: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Worldwide, all media, in perpetuity"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Compensation
            </label>
            <input
              type="number"
              value={newRelease.compensation || ''}
              onChange={(e) => setNewRelease({ ...newRelease, compensation: parseFloat(e.target.value) })}
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
              value={newRelease.status || 'pending'}
              onChange={(e) => setNewRelease({ ...newRelease, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newRelease.notes || ''}
              onChange={(e) => setNewRelease({ ...newRelease, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this release"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addRelease}
            disabled={!newRelease.type || !newRelease.releasedBy}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Release</span>
          </button>
        </div>
      </div>

      {/* Releases List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Releases ({project.legalCompliance.releases.length})
        </h3>
        
        <div className="space-y-4">
          {project.legalCompliance.releases.map(release => (
            <div key={release.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700 p-4">
                {editingRelease === release.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Type</label>
                        <select
                          value={newRelease.type !== undefined ? newRelease.type : release.type}
                          onChange={(e) => setNewRelease({ ...newRelease, type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        >
                          <option value="personal">Personal Appearance Release</option>
                          <option value="location">Location Release</option>
                          <option value="material">Material Release</option>
                          <option value="minor">Minor Release</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                        <select
                          value={newRelease.status !== undefined ? newRelease.status : release.status}
                          onChange={(e) => setNewRelease({ ...newRelease, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="signed">Signed</option>
                          <option value="expired">Expired</option>
                          <option value="revoked">Revoked</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingRelease(null);
                          setNewRelease({});
                        }}
                        className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => {
                          updateRelease(release.id, newRelease);
                          setNewRelease({});
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
                          {release.type === 'personal' ? 'Personal Appearance Release' :
                           release.type === 'location' ? 'Location Release' :
                           release.type === 'material' ? 'Material Release' :
                           'Minor Release'}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(release.status)}`}>
                          {release.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{release.releasedBy}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(release.releasedDate, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingRelease(release.id);
                          setNewRelease({});
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <button
                        onClick={() => deleteRelease(release.id)}
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
                  {release.coverage && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Coverage
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {release.coverage}
                      </div>
                    </div>
                  )}
                  
                  {release.compensation !== undefined && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Compensation
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        ${release.compensation.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
                
                {release.document && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Document
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <a 
                        href={release.document} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                )}
                
                {release.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Notes
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {release.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {project.legalCompliance.releases.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No releases added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPermitsTab = () => (
    <div className="space-y-6">
      {/* Add Permit Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Permit
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type*
            </label>
            <input
              type="text"
              value={newPermit.type || ''}
              onChange={(e) => setNewPermit({ ...newPermit, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Filming Permit"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Issued By*
            </label>
            <input
              type="text"
              value={newPermit.issuedBy || ''}
              onChange={(e) => setNewPermit({ ...newPermit, issuedBy: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., City of Los Angeles"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={newPermit.status || 'not-applied'}
              onChange={(e) => setNewPermit({ ...newPermit, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="not-applied">Not Applied</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Issued Date
            </label>
            <input
              type="date"
              value={newPermit.issuedDate ? format(newPermit.issuedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewPermit({ ...newPermit, issuedDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Expiration Date
            </label>
            <input
              type="date"
              value={newPermit.expirationDate ? format(newPermit.expirationDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewPermit({ ...newPermit, expirationDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Cost
            </label>
            <input
              type="number"
              value={newPermit.cost || ''}
              onChange={(e) => setNewPermit({ ...newPermit, cost: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Locations (one per line)
            </label>
            <textarea
              value={newPermit.locations?.join('\n') || ''}
              onChange={(e) => setNewPermit({ 
                ...newPermit, 
                locations: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Enter each location on a new line"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Restrictions (one per line)
            </label>
            <textarea
              value={newPermit.restrictions?.join('\n') || ''}
              onChange={(e) => setNewPermit({ 
                ...newPermit, 
                restrictions: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Enter each restriction on a new line"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newPermit.notes || ''}
              onChange={(e) => setNewPermit({ ...newPermit, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this permit"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addPermit}
            disabled={!newPermit.type || !newPermit.issuedBy}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Permit</span>
          </button>
        </div>
      </div>

      {/* Permits List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Permits ({project.legalCompliance.permits.length})
        </h3>
        
        <div className="space-y-4">
          {project.legalCompliance.permits.map(permit => (
            <div key={permit.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700 p-4">
                {editingPermit === permit.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Type</label>
                        <input
                          type="text"
                          value={newPermit.type !== undefined ? newPermit.type : permit.type}
                          onChange={(e) => setNewPermit({ ...newPermit, type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                        <select
                          value={newPermit.status !== undefined ? newPermit.status : permit.status}
                          onChange={(e) => setNewPermit({ ...newPermit, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        >
                          <option value="not-applied">Not Applied</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="denied">Denied</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingPermit(null);
                          setNewPermit({});
                        }}
                        className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => {
                          updatePermit(permit.id, newPermit);
                          setNewPermit({});
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
                          {permit.type}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(permit.status)}`}>
                          {permit.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{permit.issuedBy}</span>
                        </div>
                        
                        {permit.issuedDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Issued: {format(permit.issuedDate, 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        
                        {permit.expirationDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Expires: {format(permit.expirationDate, 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingPermit(permit.id);
                          setNewPermit({});
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <button
                        onClick={() => deletePermit(permit.id)}
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
                  {permit.locations.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Locations
                      </div>
                      <div className="space-y-1">
                        {permit.locations.map((location, index) => (
                          <div key={index} className="text-sm text-slate-700 dark:text-slate-300">
                            • {location}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {permit.restrictions.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Restrictions
                      </div>
                      <div className="space-y-1">
                        {permit.restrictions.map((restriction, index) => (
                          <div key={index} className="text-sm text-slate-700 dark:text-slate-300">
                            • {restriction}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {permit.cost > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Cost
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      ${permit.cost.toLocaleString()}
                    </div>
                  </div>
                )}
                
                {permit.document && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Document
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <a 
                        href={permit.document} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                )}
                
                {permit.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Notes
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {permit.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {project.legalCompliance.permits.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No permits added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLicensesTab = () => (
    <div className="space-y-6">
      {/* Add License Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add License
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type*
            </label>
            <select
              value={newLicense.type || ''}
              onChange={(e) => setNewLicense({ ...newLicense, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Type</option>
              <option value="music">Music License</option>
              <option value="footage">Stock Footage License</option>
              <option value="image">Image License</option>
              <option value="software">Software License</option>
              <option value="other">Other License</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Content*
            </label>
            <input
              type="text"
              value={newLicense.content || ''}
              onChange={(e) => setNewLicense({ ...newLicense, content: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Song Title - Artist"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Licensor*
            </label>
            <input
              type="text"
              value={newLicense.licensor || ''}
              onChange={(e) => setNewLicense({ ...newLicense, licensor: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Record Label or Stock Agency"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={newLicense.status || 'needed'}
              onChange={(e) => setNewLicense({ ...newLicense, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="needed">Needed</option>
              <option value="pending">Pending</option>
              <option value="acquired">Acquired</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Territory
            </label>
            <input
              type="text"
              value={newLicense.territory || ''}
              onChange={(e) => setNewLicense({ ...newLicense, territory: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Worldwide"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Cost
            </label>
            <input
              type="number"
              value={newLicense.cost || ''}
              onChange={(e) => setNewLicense({ ...newLicense, cost: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Acquired
            </label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                checked={newLicense.acquired || false}
                onChange={(e) => setNewLicense({ ...newLicense, acquired: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                License has been acquired
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Acquired Date
            </label>
            <input
              type="date"
              value={newLicense.acquiredDate ? format(newLicense.acquiredDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewLicense({ ...newLicense, acquiredDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              disabled={!newLicense.acquired}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Expiration Date
            </label>
            <input
              type="date"
              value={newLicense.expirationDate ? format(newLicense.expirationDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewLicense({ ...newLicense, expirationDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Usage
            </label>
            <textarea
              value={newLicense.usage || ''}
              onChange={(e) => setNewLicense({ ...newLicense, usage: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., All media, in perpetuity"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newLicense.notes || ''}
              onChange={(e) => setNewLicense({ ...newLicense, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this license"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addLicense}
            disabled={!newLicense.type || !newLicense.content || !newLicense.licensor}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add License</span>
          </button>
        </div>
      </div>

      {/* Licenses List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Licenses ({project.legalCompliance.licenses.length})
        </h3>
        
        <div className="space-y-4">
          {project.legalCompliance.licenses.map(license => (
            <div key={license.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700 p-4">
                {editingLicense === license.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Content</label>
                        <input
                          type="text"
                          value={newLicense.content !== undefined ? newLicense.content : license.content}
                          onChange={(e) => setNewLicense({ ...newLicense, content: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                        <select
                          value={newLicense.status !== undefined ? newLicense.status : license.status}
                          onChange={(e) => setNewLicense({ ...newLicense, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        >
                          <option value="needed">Needed</option>
                          <option value="pending">Pending</option>
                          <option value="acquired">Acquired</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingLicense(null);
                          setNewLicense({});
                        }}
                        className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => {
                          updateLicense(license.id, newLicense);
                          setNewLicense({});
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
                          {license.content}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(license.status)}`}>
                          {license.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <div className="capitalize">{license.type} License</div>
                        <div>From: {license.licensor}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingLicense(license.id);
                          setNewLicense({});
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <button
                        onClick={() => deleteLicense(license.id)}
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
                  {license.territory && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Territory
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {license.territory}
                      </div>
                    </div>
                  )}
                  
                  {license.usage && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Usage
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {license.usage}
                      </div>
                    </div>
                  )}
                  
                  {license.cost > 0 && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Cost
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        ${license.cost.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {license.acquiredDate && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Acquired Date
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {format(license.acquiredDate, 'MMM d, yyyy')}
                      </div>
                    </div>
                  )}
                  
                  {license.expirationDate && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Expiration Date
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {format(license.expirationDate, 'MMM d, yyyy')}
                      </div>
                    </div>
                  )}
                </div>
                
                {license.document && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Document
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <a 
                        href={license.document} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                )}
                
                {license.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Notes
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {license.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {project.legalCompliance.licenses.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No licenses added yet
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
            Legal Compliance
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage releases, permits, licenses, and compliance checklist
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportCompliance}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Compliance Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Checklist
              </div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {project.legalCompliance.checklist.filter(item => item.completed).length}/{project.legalCompliance.checklist.length}
              </div>
            </div>
            <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ 
                  width: `${project.legalCompliance.checklist.length > 0 
                    ? (project.legalCompliance.checklist.filter(item => item.completed).length / project.legalCompliance.checklist.length) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-green-700 dark:text-green-300">
                Releases
              </div>
              <div className="text-lg font-bold text-green-900 dark:text-green-100">
                {project.legalCompliance.releases.filter(r => r.status === 'signed').length}/{project.legalCompliance.releases.length}
              </div>
            </div>
            <div className="w-full h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ 
                  width: `${project.legalCompliance.releases.length > 0 
                    ? (project.legalCompliance.releases.filter(r => r.status === 'signed').length / project.legalCompliance.releases.length) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Permits
              </div>
              <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                {project.legalCompliance.permits.filter(p => p.status === 'approved').length}/{project.legalCompliance.permits.length}
              </div>
            </div>
            <div className="w-full h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full"
                style={{ 
                  width: `${project.legalCompliance.permits.length > 0 
                    ? (project.legalCompliance.permits.filter(p => p.status === 'approved').length / project.legalCompliance.permits.length) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Licenses
              </div>
              <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {project.legalCompliance.licenses.filter(l => l.status === 'acquired').length}/{project.legalCompliance.licenses.length}
              </div>
            </div>
            <div className="w-full h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ 
                  width: `${project.legalCompliance.licenses.length > 0 
                    ? (project.legalCompliance.licenses.filter(l => l.status === 'acquired').length / project.legalCompliance.licenses.length) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'checklist'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Checklist</span>
          </button>
          
          <button
            onClick={() => setActiveTab('releases')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'releases'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <User className="w-4 h-4" />
            <span>Releases</span>
          </button>
          
          <button
            onClick={() => setActiveTab('permits')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'permits'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <MapPin className="w-4 h-4" />
            <span>Permits</span>
          </button>
          
          <button
            onClick={() => setActiveTab('licenses')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'licenses'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            <span>Licenses</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'checklist' && renderChecklistTab()}
        {activeTab === 'releases' && renderReleasesTab()}
        {activeTab === 'permits' && renderPermitsTab()}
        {activeTab === 'licenses' && renderLicensesTab()}
      </div>
    </div>
  );
};

// For TypeScript
const User = ({ className }: { className?: string }) => (
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
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);