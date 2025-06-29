import React, { useState } from 'react';
import { 
  DollarSign, Plus, Download, Filter, 
  TrendingUp, PieChart, FileText, Edit3, 
  Trash2, Check, X, Search
} from 'lucide-react';
import { ProductionProject, Budget, BudgetCategory, BudgetItem, Expense } from '../../types/production';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface BudgetOverviewProps {
  project: ProductionProject;
  onProjectUpdate: (project: ProductionProject) => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  project,
  onProjectUpdate
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<BudgetCategory>>({});
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({});
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const updateBudget = (updates: Partial<Budget>) => {
    const updatedBudget = { ...project.budget, ...updates };
    onProjectUpdate({
      ...project,
      budget: updatedBudget
    });
  };

  const addCategory = () => {
    if (!newCategory.name) return;
    
    const category: BudgetCategory = {
      id: uuidv4(),
      name: newCategory.name || '',
      description: newCategory.description || '',
      allocatedAmount: newCategory.allocatedAmount || 0,
      spentAmount: 0,
      remainingAmount: newCategory.allocatedAmount || 0,
      items: []
    };
    
    updateBudget({
      categories: [...project.budget.categories, category],
      allocatedBudget: project.budget.allocatedBudget + (newCategory.allocatedAmount || 0)
    });
    
    setNewCategory({});
  };

  const updateCategory = (id: string, updates: Partial<BudgetCategory>) => {
    const category = project.budget.categories.find(c => c.id === id);
    if (!category) return;
    
    const oldAllocated = category.allocatedAmount;
    const newAllocated = updates.allocatedAmount !== undefined ? updates.allocatedAmount : oldAllocated;
    
    const updatedCategories = project.budget.categories.map(c => 
      c.id === id ? { 
        ...c, 
        ...updates,
        remainingAmount: (updates.allocatedAmount || c.allocatedAmount) - c.spentAmount
      } : c
    );
    
    updateBudget({
      categories: updatedCategories,
      allocatedBudget: project.budget.allocatedBudget - oldAllocated + newAllocated
    });
    
    setEditingCategory(null);
  };

  const deleteCategory = (id: string) => {
    const category = project.budget.categories.find(c => c.id === id);
    if (!category) return;
    
    updateBudget({
      categories: project.budget.categories.filter(c => c.id !== id),
      allocatedBudget: project.budget.allocatedBudget - category.allocatedAmount
    });
  };

  const addItem = (categoryId: string) => {
    if (!newItem.name) return;
    
    const category = project.budget.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const item: BudgetItem = {
      id: uuidv4(),
      name: newItem.name || '',
      description: newItem.description || '',
      estimatedCost: newItem.estimatedCost || 0,
      actualCost: 0,
      quantity: newItem.quantity || 1,
      unit: newItem.unit || 'item',
      status: 'planned',
      notes: newItem.notes || ''
    };
    
    const updatedCategories = project.budget.categories.map(c => 
      c.id === categoryId ? { ...c, items: [...c.items, item] } : c
    );
    
    updateBudget({ categories: updatedCategories });
    setNewItem({});
  };

  const updateItem = (categoryId: string, itemId: string, updates: Partial<BudgetItem>) => {
    const updatedCategories = project.budget.categories.map(c => 
      c.id === categoryId ? { 
        ...c, 
        items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i) 
      } : c
    );
    
    updateBudget({ categories: updatedCategories });
    setEditingItem(null);
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    const updatedCategories = project.budget.categories.map(c => 
      c.id === categoryId ? { 
        ...c, 
        items: c.items.filter(i => i.id !== itemId) 
      } : c
    );
    
    updateBudget({ categories: updatedCategories });
  };

  const addExpense = () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.categoryId) return;
    
    const expense: Expense = {
      id: uuidv4(),
      categoryId: newExpense.categoryId || '',
      itemId: newExpense.itemId,
      date: newExpense.date || new Date(),
      amount: newExpense.amount || 0,
      description: newExpense.description || '',
      paymentMethod: newExpense.paymentMethod || 'credit card',
      paidBy: newExpense.paidBy || '',
      status: 'pending',
      notes: newExpense.notes || ''
    };
    
    // Update category spent amount
    const updatedCategories = project.budget.categories.map(c => 
      c.id === expense.categoryId ? { 
        ...c, 
        spentAmount: c.spentAmount + expense.amount,
        remainingAmount: c.allocatedAmount - (c.spentAmount + expense.amount)
      } : c
    );
    
    updateBudget({ 
      expenses: [...project.budget.expenses, expense],
      categories: updatedCategories
    });
    
    setNewExpense({});
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const expense = project.budget.expenses.find(e => e.id === id);
    if (!expense) return;
    
    // If amount or category changed, update category spent amounts
    let updatedCategories = [...project.budget.categories];
    
    if (updates.amount !== undefined && updates.amount !== expense.amount) {
      // Update old category
      updatedCategories = updatedCategories.map(c => 
        c.id === expense.categoryId ? { 
          ...c, 
          spentAmount: c.spentAmount - expense.amount,
          remainingAmount: c.allocatedAmount - (c.spentAmount - expense.amount)
        } : c
      );
      
      // Update new category if changed
      const newCategoryId = updates.categoryId || expense.categoryId;
      updatedCategories = updatedCategories.map(c => 
        c.id === newCategoryId ? { 
          ...c, 
          spentAmount: c.spentAmount + (updates.amount || 0),
          remainingAmount: c.allocatedAmount - (c.spentAmount + (updates.amount || 0))
        } : c
      );
    } else if (updates.categoryId !== undefined && updates.categoryId !== expense.categoryId) {
      // Move expense amount from old category to new one
      updatedCategories = updatedCategories.map(c => {
        if (c.id === expense.categoryId) {
          return { 
            ...c, 
            spentAmount: c.spentAmount - expense.amount,
            remainingAmount: c.allocatedAmount - (c.spentAmount - expense.amount)
          };
        } else if (c.id === updates.categoryId) {
          return { 
            ...c, 
            spentAmount: c.spentAmount + expense.amount,
            remainingAmount: c.allocatedAmount - (c.spentAmount + expense.amount)
          };
        }
        return c;
      });
    }
    
    const updatedExpenses = project.budget.expenses.map(e => 
      e.id === id ? { ...e, ...updates } : e
    );
    
    updateBudget({ 
      expenses: updatedExpenses,
      categories: updatedCategories
    });
    
    setEditingExpense(null);
  };

  const deleteExpense = (id: string) => {
    const expense = project.budget.expenses.find(e => e.id === id);
    if (!expense) return;
    
    // Update category spent amount
    const updatedCategories = project.budget.categories.map(c => 
      c.id === expense.categoryId ? { 
        ...c, 
        spentAmount: c.spentAmount - expense.amount,
        remainingAmount: c.allocatedAmount - (c.spentAmount - expense.amount)
      } : c
    );
    
    updateBudget({ 
      expenses: project.budget.expenses.filter(e => e.id !== id),
      categories: updatedCategories
    });
  };

  const approveExpense = (id: string) => {
    updateExpense(id, { 
      status: 'approved',
      approvedBy: 'Current User',
      approvalDate: new Date()
    });
  };

  const rejectExpense = (id: string) => {
    updateExpense(id, { status: 'rejected' });
  };

  const exportBudget = () => {
    const budgetData = JSON.stringify(project.budget, null, 2);
    const blob = new Blob([budgetData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-budget.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredExpenses = project.budget.expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Budget Overview
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportBudget}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              Total Budget
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              ${project.budget.totalBudget.toLocaleString()}
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
              Spent
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              ${project.budget.expenses.reduce((sum, expense) => 
                expense.status === 'approved' || expense.status === 'reimbursed' 
                  ? sum + expense.amount 
                  : sum, 0).toLocaleString()}
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
              Remaining
            </div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              ${(project.budget.totalBudget - project.budget.expenses.reduce((sum, expense) => 
                expense.status === 'approved' || expense.status === 'reimbursed' 
                  ? sum + expense.amount 
                  : sum, 0)).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Budget Utilization
          </div>
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                project.budget.expenses.reduce((sum, expense) => 
                  expense.status === 'approved' || expense.status === 'reimbursed' 
                    ? sum + expense.amount 
                    : sum, 0) / project.budget.totalBudget > 0.9 
                  ? 'bg-red-500' 
                  : 'bg-blue-500'
              }`}
              style={{ 
                width: `${Math.min(100, (project.budget.expenses.reduce((sum, expense) => 
                  expense.status === 'approved' || expense.status === 'reimbursed' 
                    ? sum + expense.amount 
                    : sum, 0) / project.budget.totalBudget) * 100)}%` 
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Budget Categories
          </h3>
          <button
            onClick={() => setActiveTab('categories')}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Category</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Allocated</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Spent</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Remaining</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Usage</th>
              </tr>
            </thead>
            <tbody>
              {project.budget.categories.map(category => (
                <tr key={category.id} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-300">
                    ${category.allocatedAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-300">
                    ${category.spentAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-300">
                    ${category.remainingAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            category.spentAmount / category.allocatedAmount > 0.9 
                              ? 'bg-red-500' 
                              : category.spentAmount / category.allocatedAmount > 0.7 
                              ? 'bg-amber-500' 
                              : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (category.spentAmount / category.allocatedAmount) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {Math.round((category.spentAmount / category.allocatedAmount) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-700">
                <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100">Total</td>
                <td className="px-4 py-3 text-sm font-bold text-right text-slate-900 dark:text-slate-100">
                  ${project.budget.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-right text-slate-900 dark:text-slate-100">
                  ${project.budget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-right text-slate-900 dark:text-slate-100">
                  ${project.budget.categories.reduce((sum, cat) => sum + cat.remainingAmount, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          project.budget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0) / 
                          project.budget.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0) > 0.9 
                            ? 'bg-red-500' 
                            : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (project.budget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0) / 
                            project.budget.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0)) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {Math.round((project.budget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0) / 
                        project.budget.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0)) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Recent Expenses
          </h3>
          <button
            onClick={() => setActiveTab('expenses')}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Description</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Category</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Amount</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {project.budget.expenses
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 5)
                .map(expense => {
                  const category = project.budget.categories.find(c => c.id === expense.categoryId);
                  
                  return (
                    <tr key={expense.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {format(expense.date, 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {expense.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {category?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-slate-900 dark:text-slate-100">
                        ${expense.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          expense.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          expense.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          expense.status === 'reimbursed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {expense.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          
          {project.budget.expenses.length === 0 && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              No expenses recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      {/* Add Category Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Budget Category
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category Name*
            </label>
            <input
              type="text"
              value={newCategory.name || ''}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Camera Equipment"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Allocated Amount*
            </label>
            <input
              type="number"
              value={newCategory.allocatedAmount || ''}
              onChange={(e) => setNewCategory({ ...newCategory, allocatedAmount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={newCategory.description || ''}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Category description"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addCategory}
            disabled={!newCategory.name || !newCategory.allocatedAmount}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Budget Categories
        </h3>
        
        <div className="space-y-4">
          {project.budget.categories.map(category => (
            <div key={category.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className="bg-slate-50 dark:bg-slate-700 p-4">
                {editingCategory === category.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newCategory.name || category.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      
                      <input
                        type="number"
                        value={newCategory.allocatedAmount !== undefined ? newCategory.allocatedAmount : category.allocatedAmount}
                        onChange={(e) => setNewCategory({ ...newCategory, allocatedAmount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <textarea
                      value={newCategory.description !== undefined ? newCategory.description : category.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      rows={2}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setNewCategory({});
                        }}
                        className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={() => updateCategory(category.id, newCategory)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                          {category.name}
                        </h4>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          ${category.allocatedAmount.toLocaleString()} allocated
                        </span>
                      </div>
                      
                      {category.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category.id);
                          setNewCategory({});
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                      
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Budget Items */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Budget Items
                  </h5>
                  
                  <button
                    onClick={() => {
                      setNewItem({ ...newItem, categoryId: category.id });
                      document.getElementById(`add-item-${category.id}`)?.classList.remove('hidden');
                    }}
                    className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>
                
                {/* Add Item Form */}
                <div id={`add-item-${category.id}`} className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Item Name*
                      </label>
                      <input
                        type="text"
                        value={newItem.name || ''}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        placeholder="e.g., Camera Rental"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Estimated Cost*
                      </label>
                      <input
                        type="number"
                        value={newItem.estimatedCost || ''}
                        onChange={(e) => setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={newItem.quantity || ''}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        placeholder="1"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={newItem.unit || ''}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                        placeholder="e.g., day, item, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                      placeholder="Item description"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setNewItem({});
                        document.getElementById(`add-item-${category.id}`)?.classList.add('hidden');
                      }}
                      className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={() => {
                        addItem(category.id);
                        document.getElementById(`add-item-${category.id}`)?.classList.add('hidden');
                      }}
                      disabled={!newItem.name || !newItem.estimatedCost}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
                
                {/* Items List */}
                {category.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="px-2 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Item</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Est. Cost</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Actual</th>
                          <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Qty</th>
                          <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map(item => (
                          <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                            {editingItem === item.id ? (
                              <>
                                <td className="px-2 py-2">
                                  <input
                                    type="text"
                                    value={newItem.name !== undefined ? newItem.name : item.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <input
                                    type="number"
                                    value={newItem.estimatedCost !== undefined ? newItem.estimatedCost : item.estimatedCost}
                                    onChange={(e) => setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) })}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                    min="0"
                                    step="0.01"
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <input
                                    type="number"
                                    value={newItem.actualCost !== undefined ? newItem.actualCost : item.actualCost}
                                    onChange={(e) => setNewItem({ ...newItem, actualCost: parseFloat(e.target.value) })}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                    min="0"
                                    step="0.01"
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <input
                                    type="number"
                                    value={newItem.quantity !== undefined ? newItem.quantity : item.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                    min="1"
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <select
                                    value={newItem.status !== undefined ? newItem.status : item.status}
                                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                  >
                                    <option value="planned">Planned</option>
                                    <option value="approved">Approved</option>
                                    <option value="purchased">Purchased</option>
                                    <option value="paid">Paid</option>
                                  </select>
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <div className="flex justify-end space-x-1">
                                    <button
                                      onClick={() => {
                                        updateItem(category.id, item.id, newItem);
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
                                <td className="px-2 py-2 text-xs text-slate-700 dark:text-slate-300">
                                  {item.name}
                                </td>
                                <td className="px-2 py-2 text-xs text-right text-slate-700 dark:text-slate-300">
                                  ${item.estimatedCost.toLocaleString()}
                                </td>
                                <td className="px-2 py-2 text-xs text-right text-slate-700 dark:text-slate-300">
                                  ${item.actualCost.toLocaleString()}
                                </td>
                                <td className="px-2 py-2 text-xs text-center text-slate-700 dark:text-slate-300">
                                  {item.quantity} {item.unit}
                                </td>
                                <td className="px-2 py-2 text-center">
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    item.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                    item.status === 'purchased' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                    item.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-right">
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
                                      onClick={() => deleteItem(category.id, item.id)}
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
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">
                    No budget items in this category
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {project.budget.categories.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No budget categories defined yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderExpensesTab = () => (
    <div className="space-y-6">
      {/* Add Expense Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Expense
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description*
            </label>
            <input
              type="text"
              value={newExpense.description || ''}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Camera Rental"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount*
            </label>
            <input
              type="number"
              value={newExpense.amount || ''}
              onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date*
            </label>
            <input
              type="date"
              value={newExpense.date ? format(newExpense.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setNewExpense({ ...newExpense, date: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category*
            </label>
            <select
              value={newExpense.categoryId || ''}
              onChange={(e) => setNewExpense({ ...newExpense, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Category</option>
              {project.budget.categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Budget Item
            </label>
            <select
              value={newExpense.itemId || ''}
              onChange={(e) => setNewExpense({ ...newExpense, itemId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              disabled={!newExpense.categoryId}
            >
              <option value="">Select Item (Optional)</option>
              {project.budget.categories
                .find(c => c.id === newExpense.categoryId)?.items
                .map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Paid By*
            </label>
            <input
              type="text"
              value={newExpense.paidBy || ''}
              onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={newExpense.paymentMethod || ''}
              onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="credit card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="wire transfer">Wire Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="venmo">Venmo</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newExpense.notes || ''}
              onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addExpense}
            disabled={!newExpense.description || !newExpense.amount || !newExpense.categoryId || !newExpense.paidBy}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Expenses
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses..."
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              {project.budget.categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Description</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Category</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Paid By</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map(expense => {
                  const category = project.budget.categories.find(c => c.id === expense.categoryId);
                  
                  return (
                    <tr key={expense.id} className="border-b border-slate-200 dark:border-slate-700">
                      {editingExpense === expense.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              value={newExpense.date ? format(newExpense.date, 'yyyy-MM-dd') : format(expense.date, 'yyyy-MM-dd')}
                              onChange={(e) => setNewExpense({ ...newExpense, date: new Date(e.target.value) })}
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={newExpense.description !== undefined ? newExpense.description : expense.description}
                              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={newExpense.categoryId !== undefined ? newExpense.categoryId : expense.categoryId}
                              onChange={(e) => setNewExpense({ ...newExpense, categoryId: e.target.value })}
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                            >
                              {project.budget.categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={newExpense.amount !== undefined ? newExpense.amount : expense.amount}
                              onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={newExpense.paidBy !== undefined ? newExpense.paidBy : expense.paidBy}
                              onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={newExpense.status !== undefined ? newExpense.status : expense.status}
                              onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value as any })}
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="reimbursed">Reimbursed</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => {
                                  updateExpense(expense.id, newExpense);
                                  setNewExpense({});
                                }}
                                className="p-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingExpense(null);
                                  setNewExpense({});
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
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                            {format(expense.date, 'MMM d, yyyy')}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                            {expense.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                            {category?.name || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-slate-900 dark:text-slate-100">
                            ${expense.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                            {expense.paidBy}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              expense.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              expense.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              expense.status === 'reimbursed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}>
                              {expense.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end space-x-1">
                              {expense.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => approveExpense(expense.id)}
                                    className="p-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                                    title="Approve"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => rejectExpense(expense.id)}
                                    className="p-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                                    title="Reject"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setEditingExpense(expense.id);
                                  setNewExpense({});
                                }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                                title="Edit"
                              >
                                <Edit3 className="w-3 h-3 text-slate-500" />
                              </button>
                              <button
                                onClick={() => deleteExpense(expense.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
          
          {filteredExpenses.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No expenses found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('summary')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'summary'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <PieChart className="w-4 h-4" />
            <span>Summary</span>
          </button>
          
          <button
            onClick={() => setActiveTab('categories')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'categories'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            <span>Categories</span>
          </button>
          
          <button
            onClick={() => setActiveTab('expenses')}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
              ${activeTab === 'expenses'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <DollarSign className="w-4 h-4" />
            <span>Expenses</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'expenses' && renderExpensesTab()}
      </div>
    </div>
  );
};