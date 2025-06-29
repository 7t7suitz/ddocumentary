import React, { useState } from 'react';
import { 
  Briefcase, Plus, Edit3, Trash2, Check, 
  X, Filter, Search, Download, Calendar,
  AlertCircle, Settings, Package, Shield
} from 'lucide-react';
import { ProductionProject, EquipmentItem, EquipmentPackage, EquipmentRental, InsurancePolicy } from '../../types/production';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface EquipmentOverviewProps {
  project: ProductionProject;
  onProjectUpdate: (project: ProductionProject) => void;
}

export const EquipmentOverview: React.FC<EquipmentOverviewProps> = ({
  project,
  onProjectUpdate
}) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [editingRental, setEditingRental] = useState<string | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<EquipmentItem>>({});
  const [newPackage, setNewPackage] = useState<Partial<EquipmentPackage>>({});
  const [newRental, setNewRental] = useState<Partial<EquipmentRental>>({});
  const [newInsurance, setNewInsurance] = useState<Partial<InsurancePolicy>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const updateEquipment = (updates: Partial<ProductionProject['equipment']>) => {
    onProjectUpdate({
      ...project,
      equipment: {
        ...project.equipment,
        ...updates
      }
    });
  };

  const addEquipmentItem = () => {
    if (!newItem.name || !newItem.category || !newItem.type) return;
    
    const item: EquipmentItem = {
      id: uuidv4(),
      name: newItem.name || '',
      category: newItem.category || '',
      type: newItem.type || '',
      manufacturer: newItem.manufacturer || '',
      model: newItem.model || '',
      serialNumber: newItem.serialNumber,
      status: newItem.status || 'available',
      condition: newItem.condition || 'good',
      location: newItem.location || '',
      owner: newItem.owner || 'owned',
      purchaseDate: newItem.purchaseDate,
      purchasePrice: newItem.purchasePrice,
      notes: newItem.notes || '',
      lastMaintenance: newItem.lastMaintenance,
      nextMaintenance: newItem.nextMaintenance,
      attachments: []
    };
    
    updateEquipment({
      items: [...project.equipment.items, item]
    });
    
    setNewItem({});
  };

  const updateEquipmentItem = (id: string, updates: Partial<EquipmentItem>) => {
    const updatedItems = project.equipment.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    
    updateEquipment({ items: updatedItems });
    setEditingItem(null);
  };

  const deleteEquipmentItem = (id: string) => {
    updateEquipment({
      items: project.equipment.items.filter(item => item.id !== id)
    });
  };

  const addEquipmentPackage = () => {
    if (!newPackage.name || !newPackage.items || newPackage.items.length === 0) return;
    
    const pkg: EquipmentPackage = {
      id: uuidv4(),
      name: newPackage.name || '',
      description: newPackage.description || '',
      items: newPackage.items || [],
      status: newPackage.status || 'available',
      assignedTo: newPackage.assignedTo,
      notes: newPackage.notes || ''
    };
    
    updateEquipment({
      packages: [...project.equipment.packages, pkg]
    });
    
    setNewPackage({});
  };

  const updateEquipmentPackage = (id: string, updates: Partial<EquipmentPackage>) => {
    const updatedPackages = project.equipment.packages.map(pkg => 
      pkg.id === id ? { ...pkg, ...updates } : pkg
    );
    
    updateEquipment({ packages: updatedPackages });
    setEditingPackage(null);
  };

  const deleteEquipmentPackage = (id: string) => {
    updateEquipment({
      packages: project.equipment.packages.filter(pkg => pkg.id !== id)
    });
  };

  const addEquipmentRental = () => {
    if (!newRental.vendor || !newRental.items || newRental.items.length === 0 || !newRental.startDate || !newRental.endDate) return;
    
    const rental: EquipmentRental = {
      id: uuidv4(),
      vendor: newRental.vendor || '',
      items: newRental.items || [],
      startDate: newRental.startDate || new Date(),
      endDate: newRental.endDate || new Date(),
      cost: newRental.cost || 0,
      deposit: newRental.deposit,
      insuranceRequired: newRental.insuranceRequired || false,
      status: newRental.status || 'planned',
      confirmationNumber: newRental.confirmationNumber,
      contactInfo: {
        name: newRental.contactInfo?.name || '',
        email: newRental.contactInfo?.email || '',
        phone: newRental.contactInfo?.phone || ''
      },
      notes: newRental.notes || '',
      attachments: []
    };
    
    updateEquipment({
      rentals: [...project.equipment.rentals, rental]
    });
    
    setNewRental({});
  };

  const updateEquipmentRental = (id: string, updates: Partial<EquipmentRental>) => {
    const updatedRentals = project.equipment.rentals.map(rental => 
      rental.id === id ? { ...rental, ...updates } : rental
    );
    
    updateEquipment({ rentals: updatedRentals });
    setEditingRental(null);
  };

  const deleteEquipmentRental = (id: string) => {
    updateEquipment({
      rentals: project.equipment.rentals.filter(rental => rental.id !== id)
    });
  };

  const addInsurancePolicy = () => {
    if (!newInsurance.type || !newInsurance.provider || !newInsurance.policyNumber || !newInsurance.startDate || !newInsurance.endDate) return;
    
    const policy: InsurancePolicy = {
      id: uuidv4(),
      type: newInsurance.type || 'equipment',
      provider: newInsurance.provider || '',
      policyNumber: newInsurance.policyNumber || '',
      coverage: newInsurance.coverage || '',
      startDate: newInsurance.startDate || new Date(),
      endDate: newInsurance.endDate || new Date(),
      cost: newInsurance.cost || 0,
      deductible: newInsurance.deductible || 0,
      coveredItems: newInsurance.coveredItems || [],
      documents: [],
      notes: newInsurance.notes || ''
    };
    
    updateEquipment({
      insurance: [...project.equipment.insurance, policy]
    });
    
    setNewInsurance({});
  };

  const updateInsurancePolicy = (id: string, updates: Partial<InsurancePolicy>) => {
    const updatedPolicies = project.equipment.insurance.map(policy => 
      policy.id === id ? { ...policy, ...updates } : policy
    );
    
    updateEquipment({ insurance: updatedPolicies });
    setEditingInsurance(null);
  };

  const deleteInsurancePolicy = (id: string) => {
    updateEquipment({
      insurance: project.equipment.insurance.filter(policy => policy.id !== id)
    });
  };

  const exportEquipment = () => {
    const equipmentData = JSON.stringify(project.equipment, null, 2);
    const blob = new Blob([equipmentData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-equipment.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categories = Array.from(new Set(project.equipment.items.map(item => item.category)));

  const filteredItems = project.equipment.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in-use': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'damaged': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getConditionColor = (condition: string): string => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'fair': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'poor': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const renderInventoryTab = () => (
    <div className="space-y-6">
      {/* Add Equipment Item Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Equipment Item
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name*
            </label>
            <input
              type="text"
              value={newItem.name || ''}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Sony A7S III"
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
              placeholder="e.g., Camera"
              list="categories"
            />
            <datalist id="categories">
              {categories.map(category => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type*
            </label>
            <input
              type="text"
              value={newItem.type || ''}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Mirrorless Camera"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              value={newItem.manufacturer || ''}
              onChange={(e) => setNewItem({ ...newItem, manufacturer: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Sony"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Model
            </label>
            <input
              type="text"
              value={newItem.model || ''}
              onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., A7S III"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Serial Number
            </label>
            <input
              type="text"
              value={newItem.serialNumber || ''}
              onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., S123456789"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={newItem.status || 'available'}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="available">Available</option>
              <option value="in-use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="lost">Lost</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Condition
            </label>
            <select
              value={newItem.condition || 'good'}
              onChange={(e) => setNewItem({ ...newItem, condition: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Owner
            </label>
            <select
              value={newItem.owner || 'owned'}
              onChange={(e) => setNewItem({ ...newItem, owner: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="owned">Owned</option>
              <option value="rented">Rented</option>
              <option value="borrowed">Borrowed</option>
            </select>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newItem.notes || ''}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this equipment"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addEquipmentItem}
            disabled={!newItem.name || !newItem.category || !newItem.type}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Equipment</span>
          </button>
        </div>
      </div>

      {/* Equipment Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="in-use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="lost">Lost</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportEquipment}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Equipment Inventory ({filteredItems.length})
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Model</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Condition</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Owner</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                  {editingItem === item.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={newItem.name !== undefined ? newItem.name : item.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={newItem.category !== undefined ? newItem.category : item.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                          list="categories"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={newItem.model !== undefined ? newItem.model : item.model}
                          onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={newItem.status !== undefined ? newItem.status : item.status}
                          onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                        >
                          <option value="available">Available</option>
                          <option value="in-use">In Use</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="lost">Lost</option>
                          <option value="damaged">Damaged</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={newItem.condition !== undefined ? newItem.condition : item.condition}
                          onChange={(e) => setNewItem({ ...newItem, condition: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                        >
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={newItem.owner !== undefined ? newItem.owner : item.owner}
                          onChange={(e) => setNewItem({ ...newItem, owner: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                        >
                          <option value="owned">Owned</option>
                          <option value="rented">Rented</option>
                          <option value="borrowed">Borrowed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => {
                              updateEquipmentItem(item.id, newItem);
                              setNewItem({});
                            }}
                            className="p-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(null);
                              setNewItem({});
                            }}
                            className="p-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </div>
                        {item.serialNumber && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            S/N: {item.serialNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {item.manufacturer} {item.model}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${getConditionColor(item.condition)}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 capitalize">
                        {item.owner}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => {
                              setEditingItem(item.id);
                              setNewItem({});
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                          </button>
                          <button
                            onClick={() => deleteEquipmentItem(item.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No equipment items found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPackagesTab = () => (
    <div className="space-y-6">
      {/* Add Equipment Package Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Create Equipment Package
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Package Name*
            </label>
            <input
              type="text"
              value={newPackage.name || ''}
              onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Camera Package A"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={newPackage.status || 'available'}
              onChange={(e) => setNewPackage({ ...newPackage, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="available">Available</option>
              <option value="in-use">In Use</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={newPackage.description || ''}
              onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Package description"
              rows={2}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Items*
            </label>
            <select
              multiple
              value={newPackage.items || []}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setNewPackage({ ...newPackage, items: options });
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              size={5}
            >
              {project.equipment.items.map(item => (
                <option key={item.id} value={item.id}>{item.name} - {item.model}</option>
              ))}
            </select>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hold Ctrl/Cmd to select multiple items
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newPackage.notes || ''}
              onChange={(e) => setNewPackage({ ...newPackage, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this package"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addEquipmentPackage}
            disabled={!newPackage.name || !newPackage.items || newPackage.items.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Create Package</span>
          </button>
        </div>
      </div>

      {/* Equipment Packages List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Equipment Packages ({project.equipment.packages.length})
        </h3>
        
        <div className="space-y-4">
          {project.equipment.packages.map(pkg => (
            <div key={pkg.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700 p-4">
                {editingPackage === pkg.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Name</label>
                        <input
                          type="text"
                          value={newPackage.name !== undefined ? newPackage.name : pkg.name}
                          onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                        <select
                          value={newPackage.status !== undefined ? newPackage.status : pkg.status}
                          onChange={(e) => setNewPackage({ ...newPackage, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        >
                          <option value="available">Available</option>
                          <option value="in-use">In Use</option>
                          <option value="incomplete">Incomplete</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingPackage(null);
                          setNewPackage({});
                        }}
                        className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => {
                          updateEquipmentPackage(pkg.id, newPackage);
                          setNewPackage({});
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
                          {pkg.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pkg.status)}`}>
                          {pkg.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      {pkg.description && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {pkg.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingPackage(pkg.id);
                          setNewPackage({});
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <button
                        onClick={() => deleteEquipmentPackage(pkg.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Package Contents ({pkg.items.length} items)
                </h5>
                
                <div className="space-y-2">
                  {pkg.items.map(itemId => {
                    const item = project.equipment.items.find(i => i.id === itemId);
                    
                    return item ? (
                      <div key={itemId} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {item.name} - {item.model}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>
                    ) : (
                      <div key={itemId} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded">
                        Missing item (ID: {itemId})
                      </div>
                    );
                  })}
                  
                  {pkg.items.length === 0 && (
                    <div className="text-center py-2 text-sm text-slate-500 dark:text-slate-400">
                      No items in this package
                    </div>
                  )}
                </div>
                
                {pkg.assignedTo && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Assigned To
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {project.team.find(m => m.id === pkg.assignedTo)?.name || pkg.assignedTo}
                    </div>
                  </div>
                )}
                
                {pkg.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Notes
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {pkg.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {project.equipment.packages.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No equipment packages created yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRentalsTab = () => (
    <div className="space-y-6">
      {/* Add Equipment Rental Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Equipment Rental
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Vendor*
            </label>
            <input
              type="text"
              value={newRental.vendor || ''}
              onChange={(e) => setNewRental({ ...newRental, vendor: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Rental Company Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Start Date*
            </label>
            <input
              type="date"
              value={newRental.startDate ? format(newRental.startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewRental({ ...newRental, startDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              End Date*
            </label>
            <input
              type="date"
              value={newRental.endDate ? format(newRental.endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewRental({ ...newRental, endDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Cost
            </label>
            <input
              type="number"
              value={newRental.cost || ''}
              onChange={(e) => setNewRental({ ...newRental, cost: parseFloat(e.target.value) })}
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
              value={newRental.status || 'planned'}
              onChange={(e) => setNewRental({ ...newRental, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="planned">Planned</option>
              <option value="reserved">Reserved</option>
              <option value="picked-up">Picked Up</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Insurance Required
            </label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                checked={newRental.insuranceRequired || false}
                onChange={(e) => setNewRental({ ...newRental, insuranceRequired: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                Insurance is required for this rental
              </span>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Items*
            </label>
            <textarea
              value={newRental.items?.join('\n') || ''}
              onChange={(e) => setNewRental({ 
                ...newRental, 
                items: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Enter each item on a new line"
              rows={3}
            />
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter each item on a new line
            </div>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contact Information
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newRental.contactInfo?.name || ''}
                onChange={(e) => setNewRental({ 
                  ...newRental, 
                  contactInfo: { 
                    ...newRental.contactInfo, 
                    name: e.target.value 
                  } 
                })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Contact Name"
              />
              
              <input
                type="email"
                value={newRental.contactInfo?.email || ''}
                onChange={(e) => setNewRental({ 
                  ...newRental, 
                  contactInfo: { 
                    ...newRental.contactInfo, 
                    email: e.target.value 
                  } 
                })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Email"
              />
              
              <input
                type="tel"
                value={newRental.contactInfo?.phone || ''}
                onChange={(e) => setNewRental({ 
                  ...newRental, 
                  contactInfo: { 
                    ...newRental.contactInfo, 
                    phone: e.target.value 
                  } 
                })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Phone"
              />
            </div>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newRental.notes || ''}
              onChange={(e) => setNewRental({ ...newRental, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this rental"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addEquipmentRental}
            disabled={!newRental.vendor || !newRental.items || newRental.items.length === 0 || !newRental.startDate || !newRental.endDate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rental</span>
          </button>
        </div>
      </div>

      {/* Rentals List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Equipment Rentals ({project.equipment.rentals.length})
        </h3>
        
        <div className="space-y-4">
          {project.equipment.rentals.map(rental => (
            <div key={rental.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700 p-4">
                {editingRental === rental.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Vendor</label>
                        <input
                          type="text"
                          value={newRental.vendor !== undefined ? newRental.vendor : rental.vendor}
                          onChange={(e) => setNewRental({ ...newRental, vendor: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                        <select
                          value={newRental.status !== undefined ? newRental.status : rental.status}
                          onChange={(e) => setNewRental({ ...newRental, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        >
                          <option value="planned">Planned</option>
                          <option value="reserved">Reserved</option>
                          <option value="picked-up">Picked Up</option>
                          <option value="returned">Returned</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingRental(null);
                          setNewRental({});
                        }}
                        className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => {
                          updateEquipmentRental(rental.id, newRental);
                          setNewRental({});
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
                          {rental.vendor}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rental.status === 'planned' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' :
                          rental.status === 'reserved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          rental.status === 'picked-up' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        }`}>
                          {rental.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(rental.startDate, 'MMM d')} - {format(rental.endDate, 'MMM d, yyyy')}</span>
                        </div>
                        
                        {rental.cost > 0 && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>${rental.cost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingRental(rental.id);
                          setNewRental({});
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <button
                        onClick={() => deleteEquipmentRental(rental.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Rental Items ({rental.items.length})
                </h5>
                
                <div className="space-y-1 mb-3">
                  {rental.items.map((item, index) => (
                    <div key={index} className="text-sm text-slate-700 dark:text-slate-300">
                      • {item}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {rental.contactInfo && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Contact Information
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        {rental.contactInfo.name && <div>{rental.contactInfo.name}</div>}
                        {rental.contactInfo.email && <div>{rental.contactInfo.email}</div>}
                        {rental.contactInfo.phone && <div>{rental.contactInfo.phone}</div>}
                      </div>
                    </div>
                  )}
                  
                  {rental.confirmationNumber && (
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Confirmation Number
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        {rental.confirmationNumber}
                      </div>
                    </div>
                  )}
                </div>
                
                {rental.insuranceRequired && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Insurance Required
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      This rental requires insurance coverage. Make sure appropriate insurance is in place.
                    </p>
                  </div>
                )}
                
                {rental.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Notes
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {rental.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {project.equipment.rentals.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No equipment rentals scheduled yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInsuranceTab = () => (
    <div className="space-y-6">
      {/* Add Insurance Policy Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Insurance Policy
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Policy Type*
            </label>
            <select
              value={newInsurance.type || ''}
              onChange={(e) => setNewInsurance({ ...newInsurance, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Type</option>
              <option value="equipment">Equipment Insurance</option>
              <option value="liability">Liability Insurance</option>
              <option value="production">Production Insurance</option>
              <option value="errors-omissions">Errors & Omissions</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Provider*
            </label>
            <input
              type="text"
              value={newInsurance.provider || ''}
              onChange={(e) => setNewInsurance({ ...newInsurance, provider: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Insurance Company Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Policy Number*
            </label>
            <input
              type="text"
              value={newInsurance.policyNumber || ''}
              onChange={(e) => setNewInsurance({ ...newInsurance, policyNumber: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., POL-123456789"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Start Date*
            </label>
            <input
              type="date"
              value={newInsurance.startDate ? format(newInsurance.startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewInsurance({ ...newInsurance, startDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              End Date*
            </label>
            <input
              type="date"
              value={newInsurance.endDate ? format(newInsurance.endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewInsurance({ ...newInsurance, endDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Cost
            </label>
            <input
              type="number"
              value={newInsurance.cost || ''}
              onChange={(e) => setNewInsurance({ ...newInsurance, cost: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Coverage
            </label>
            <input
              type="text"
              value={newInsurance.coverage || ''}
              onChange={(e) => setNewInsurance({ ...newInsurance, coverage: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., $1,000,000 coverage"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Deductible
            </label>
            <input
              type="number"
              value={newInsurance.deductible || ''}
              onChange={(e) => setNewInsurance({ ...newInsurance, deductible: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Covered Items
            </label>
            <textarea
              value={newInsurance.coveredItems?.join('\n') || ''}
              onChange={(e) => setNewInsurance({ 
                ...newInsurance, 
                coveredItems: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Enter each covered item on a new line"
              rows={3}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newInsurance.notes || ''}
              onChange={(e) => setNewInsurance({ ...newInsurance, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this insurance policy"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addInsurancePolicy}
            disabled={!newInsurance.type || !newInsurance.provider || !newInsurance.policyNumber || !newInsurance.startDate || !newInsurance.endDate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Policy</span>
          </button>
        </div>
      </div>

      {/* Insurance Policies List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Insurance Policies ({project.equipment.insurance.length})
        </h3>
        
        <div className="space-y-4">
          {project.equipment.insurance.map(policy => (
            <div key={policy.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700 p-4">
                {editingInsurance === policy.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Provider</label>
                        <input
                          type="text"
                          value={newInsurance.provider !== undefined ? newInsurance.provider : policy.provider}
                          onChange={(e) => setNewInsurance({ ...newInsurance, provider: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Policy Number</label>
                        <input
                          type="text"
                          value={newInsurance.policyNumber !== undefined ? newInsurance.policyNumber : policy.policyNumber}
                          onChange={(e) => setNewInsurance({ ...newInsurance, policyNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingInsurance(null);
                          setNewInsurance({});
                        }}
                        className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => {
                          updateInsurancePolicy(policy.id, newInsurance);
                          setNewInsurance({});
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
                          {policy.provider} - {policy.type.replace('-', ' & ')} Insurance
                        </h4>
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                          {policy.policyNumber}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(policy.startDate, 'MMM d, yyyy')} - {format(policy.endDate, 'MMM d, yyyy')}</span>
                        </div>
                        
                        {policy.coverage && (
                          <div>Coverage: {policy.coverage}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingInsurance(policy.id);
                          setNewInsurance({});
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <button
                        onClick={() => deleteInsurancePolicy(policy.id)}
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
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Cost
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      ${policy.cost.toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Deductible
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      ${policy.deductible.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {policy.coveredItems.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Covered Items
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {policy.coveredItems.join(', ')}
                    </div>
                  </div>
                )}
                
                {policy.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Notes
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {policy.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {project.equipment.insurance.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No insurance policies added yet
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
            Equipment Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage equipment inventory, packages, rentals, and insurance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportEquipment}
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
            onClick={() => setActiveTab('inventory')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'inventory'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Briefcase className="w-4 h-4" />
            <span>Inventory</span>
          </button>
          
          <button
            onClick={() => setActiveTab('packages')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'packages'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Package className="w-4 h-4" />
            <span>Packages</span>
          </button>
          
          <button
            onClick={() => setActiveTab('rentals')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'rentals'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            <span>Rentals</span>
          </button>
          
          <button
            onClick={() => setActiveTab('insurance')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'insurance'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Shield className="w-4 h-4" />
            <span>Insurance</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'packages' && renderPackagesTab()}
        {activeTab === 'rentals' && renderRentalsTab()}
        {activeTab === 'insurance' && renderInsuranceTab()}
      </div>
    </div>
  );
};

// For TypeScript
const Package = ({ className }: { className?: string }) => (
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
    <path d="M16.5 9.4 7.55 4.24"></path>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.29 7 12 12 20.71 7"></polyline>
    <line x1="12" y1="22" x2="12" y2="12"></line>
  </svg>
);

const Shield = ({ className }: { className?: string }) => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);