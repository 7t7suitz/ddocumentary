import React, { useState } from 'react';
import { 
  FileText, Plus, Edit3, Trash2, Check, 
  X, Filter, Search, Download, Calendar,
  Upload, Eye, Share2, Tag
} from 'lucide-react';
import { ProductionProject, Document } from '../../types/production';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface DocumentManagerProps {
  project: ProductionProject;
  onProjectUpdate: (project: ProductionProject) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  project,
  onProjectUpdate
}) => {
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [newDocument, setNewDocument] = useState<Partial<Document>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const updateDocuments = (documents: Document[]) => {
    onProjectUpdate({
      ...project,
      documents
    });
  };

  const addDocument = () => {
    if (!newDocument.title || !newDocument.type) return;
    
    const document: Document = {
      id: uuidv4(),
      title: newDocument.title || '',
      type: newDocument.type || 'other',
      file: newDocument.file || '',
      version: newDocument.version || '1.0',
      createdBy: newDocument.createdBy || 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: newDocument.status || 'draft',
      notes: newDocument.notes || '',
      tags: newDocument.tags || []
    };
    
    updateDocuments([...project.documents, document]);
    setNewDocument({});
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    const updatedDocuments = project.documents.map(document => 
      document.id === id ? { 
        ...document, 
        ...updates,
        updatedAt: new Date()
      } : document
    );
    
    updateDocuments(updatedDocuments);
    setEditingDocument(null);
  };

  const deleteDocument = (id: string) => {
    updateDocuments(project.documents.filter(document => document.id !== id));
  };

  const approveDocument = (id: string) => {
    updateDocument(id, { 
      status: 'approved',
      approvedBy: 'Current User',
      approvalDate: new Date()
    });
  };

  const exportDocuments = () => {
    const documentsData = JSON.stringify(project.documents, null, 2);
    const blob = new Blob([documentsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-documents.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'review': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'final': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'release': return <FileText className="w-4 h-4 text-green-500" />;
      case 'permit': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'script': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'storyboard': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'shot-list': return <FileText className="w-4 h-4 text-red-500" />;
      case 'call-sheet': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'budget': return <FileText className="w-4 h-4 text-emerald-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    project.documents.forEach(doc => {
      doc.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredDocuments = project.documents.filter(document => {
    const matchesSearch = document.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         document.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || document.type === filterType;
    const matchesStatus = filterStatus === 'all' || document.status === filterStatus;
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => document.tags.includes(tag));
    return matchesSearch && matchesType && matchesStatus && matchesTags;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Document Manager
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage production documents, contracts, and forms
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportDocuments}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Add Document Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Add Document
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title*
            </label>
            <input
              type="text"
              value={newDocument.title || ''}
              onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., Location Release Form"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type*
            </label>
            <select
              value={newDocument.type || ''}
              onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Type</option>
              <option value="contract">Contract</option>
              <option value="release">Release Form</option>
              <option value="permit">Permit</option>
              <option value="script">Script</option>
              <option value="storyboard">Storyboard</option>
              <option value="shot-list">Shot List</option>
              <option value="call-sheet">Call Sheet</option>
              <option value="budget">Budget</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              File URL
            </label>
            <input
              type="text"
              value={newDocument.file || ''}
              onChange={(e) => setNewDocument({ ...newDocument, file: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., https://example.com/document.pdf"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Version
            </label>
            <input
              type="text"
              value={newDocument.version || ''}
              onChange={(e) => setNewDocument({ ...newDocument, version: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., 1.0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Created By
            </label>
            <input
              type="text"
              value={newDocument.createdBy || ''}
              onChange={(e) => setNewDocument({ ...newDocument, createdBy: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={newDocument.status || 'draft'}
              onChange={(e) => setNewDocument({ ...newDocument, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="final">Final</option>
            </select>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={newDocument.tags?.join(', ') || ''}
              onChange={(e) => setNewDocument({ 
                ...newDocument, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="e.g., legal, location, important"
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={newDocument.notes || ''}
              onChange={(e) => setNewDocument({ ...newDocument, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Additional notes about this document"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={addDocument}
            disabled={!newDocument.title || !newDocument.type}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Document Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="contract">Contracts</option>
              <option value="release">Release Forms</option>
              <option value="permit">Permits</option>
              <option value="script">Scripts</option>
              <option value="storyboard">Storyboards</option>
              <option value="shot-list">Shot Lists</option>
              <option value="call-sheet">Call Sheets</option>
              <option value="budget">Budgets</option>
              <option value="other">Other</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="final">Final</option>
            </select>
          </div>
        </div>
        
        {/* Tags Filter */}
        {getAllTags().length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filter by Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {getAllTags().map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    flex items-center space-x-1 px-3 py-1 rounded-full text-xs
                    ${selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }
                  `}
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Documents ({filteredDocuments.length})
        </h3>
        
        <div className="space-y-4">
          {filteredDocuments
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .map(document => (
              <div key={document.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700 p-4">
                  {editingDocument === document.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={newDocument.title !== undefined ? newDocument.title : document.title}
                            onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                          <select
                            value={newDocument.status !== undefined ? newDocument.status : document.status}
                            onChange={(e) => setNewDocument({ ...newDocument, status: e.target.value as any })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          >
                            <option value="draft">Draft</option>
                            <option value="review">Review</option>
                            <option value="approved">Approved</option>
                            <option value="final">Final</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Tags</label>
                        <input
                          type="text"
                          value={newDocument.tags !== undefined ? newDocument.tags.join(', ') : document.tags.join(', ')}
                          onChange={(e) => setNewDocument({ 
                            ...newDocument, 
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                          })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          placeholder="e.g., legal, location, important"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingDocument(null);
                            setNewDocument({});
                          }}
                          className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          Cancel
                        </button>
                        
                        <button
                          onClick={() => {
                            updateDocument(document.id, newDocument);
                            setNewDocument({});
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
                        {getTypeIcon(document.type)}
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">
                              {document.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(document.status)}`}>
                              {document.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <div className="capitalize">{document.type.replace('-', ' ')}</div>
                            <div>v{document.version}</div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Updated: {format(document.updatedAt, 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {document.file && (
                          <a 
                            href={document.file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </a>
                        )}
                        
                        {document.status === 'review' && (
                          <button
                            onClick={() => approveDocument(document.id)}
                            className="p-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                            title="Approve document"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setEditingDocument(document.id);
                            setNewDocument({});
                          }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          <Edit3 className="w-4 h-4 text-slate-500" />
                        </button>
                        
                        <button
                          onClick={() => deleteDocument(document.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  {document.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {document.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Created By
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {document.createdBy} on {format(document.createdAt, 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    {document.approvedBy && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Approved By
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {document.approvedBy} on {document.approvalDate ? format(document.approvalDate, 'MMM d, yyyy') : 'Unknown'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {document.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Notes
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {document.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No documents found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};