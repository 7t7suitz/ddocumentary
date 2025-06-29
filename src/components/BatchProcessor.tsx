import React, { useState } from 'react';
import { Zap, Play, Pause, RotateCcw, Download, Tag, Edit3, Trash2, FolderPlus, Settings } from 'lucide-react';
import { MediaFile, BatchOperation } from '../types/media';

interface BatchProcessorProps {
  selectedMedia: MediaFile[];
  onBatchComplete: (results: any[]) => void;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({
  selectedMedia,
  onBatchComplete
}) => {
  const [activeOperation, setActiveOperation] = useState<BatchOperation | null>(null);
  const [operationType, setOperationType] = useState<string>('tag');
  const [operationParams, setOperationParams] = useState<Record<string, any>>({});

  const batchOperations = [
    {
      id: 'tag',
      name: 'Add Tags',
      description: 'Add tags to selected media files',
      icon: Tag,
      color: 'blue',
      params: [
        { name: 'tags', type: 'text', label: 'Tags (comma separated)', placeholder: 'nature, landscape, outdoor' }
      ]
    },
    {
      id: 'move',
      name: 'Move to Collection',
      description: 'Move files to a specific collection',
      icon: FolderPlus,
      color: 'green',
      params: [
        { name: 'collection', type: 'select', label: 'Target Collection', options: ['Project A', 'Project B', 'Archive'] }
      ]
    },
    {
      id: 'edit',
      name: 'Batch Edit',
      description: 'Apply edits to multiple files',
      icon: Edit3,
      color: 'purple',
      params: [
        { name: 'brightness', type: 'range', label: 'Brightness', min: -100, max: 100, default: 0 },
        { name: 'contrast', type: 'range', label: 'Contrast', min: -100, max: 100, default: 0 },
        { name: 'saturation', type: 'range', label: 'Saturation', min: -100, max: 100, default: 0 }
      ]
    },
    {
      id: 'export',
      name: 'Batch Export',
      description: 'Export files in specific format',
      icon: Download,
      color: 'amber',
      params: [
        { name: 'format', type: 'select', label: 'Export Format', options: ['JPEG', 'PNG', 'WebP', 'TIFF'] },
        { name: 'quality', type: 'range', label: 'Quality', min: 1, max: 100, default: 85 },
        { name: 'resize', type: 'checkbox', label: 'Resize Images' },
        { name: 'width', type: 'number', label: 'Width (px)', default: 1920 },
        { name: 'height', type: 'number', label: 'Height (px)', default: 1080 }
      ]
    },
    {
      id: 'analyze',
      name: 'Re-analyze',
      description: 'Re-run AI analysis on selected files',
      icon: Zap,
      color: 'indigo',
      params: [
        { name: 'includeObjects', type: 'checkbox', label: 'Object Detection', default: true },
        { name: 'includeFaces', type: 'checkbox', label: 'Face Recognition', default: true },
        { name: 'includeScenes', type: 'checkbox', label: 'Scene Analysis', default: true }
      ]
    },
    {
      id: 'delete',
      name: 'Delete Files',
      description: 'Permanently delete selected files',
      icon: Trash2,
      color: 'red',
      params: [
        { name: 'confirm', type: 'checkbox', label: 'I understand this action cannot be undone' }
      ]
    }
  ];

  const startBatchOperation = async () => {
    if (!operationType || selectedMedia.length === 0) return;

    const operation: BatchOperation = {
      id: `batch-${Date.now()}`,
      type: operationType as any,
      mediaIds: selectedMedia.map(m => m.id),
      parameters: operationParams,
      status: 'processing',
      progress: 0,
      startedAt: new Date(),
      results: [],
      errors: []
    };

    setActiveOperation(operation);

    // Simulate batch processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setActiveOperation(prev => prev ? { ...prev, progress: i } : null);
    }

    // Complete operation
    setActiveOperation(prev => prev ? {
      ...prev,
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      results: selectedMedia.map(media => ({
        mediaId: media.id,
        success: true,
        result: `${operationType} completed successfully`
      }))
    } : null);

    onBatchComplete(selectedMedia);
  };

  const cancelOperation = () => {
    setActiveOperation(null);
  };

  const resetOperation = () => {
    setActiveOperation(null);
    setOperationParams({});
  };

  const selectedOperation = batchOperations.find(op => op.id === operationType);

  const renderParameterInput = (param: any) => {
    const value = operationParams[param.name] ?? param.default ?? '';

    switch (param.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setOperationParams(prev => ({ ...prev, [param.name]: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            placeholder={param.placeholder}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setOperationParams(prev => ({ ...prev, [param.name]: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        );
      
      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={param.min}
              max={param.max}
              value={value}
              onChange={(e) => setOperationParams(prev => ({ ...prev, [param.name]: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              {value}
            </div>
          </div>
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setOperationParams(prev => ({ ...prev, [param.name]: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="">Select {param.label}</option>
            {param.options.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setOperationParams(prev => ({ ...prev, [param.name]: e.target.checked }))}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{param.label}</span>
          </label>
        );
      
      default:
        return null;
    }
  };

  if (selectedMedia.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Media Selected
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Select media files to perform batch operations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Batch Processing
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Process {selectedMedia.length} selected file{selectedMedia.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Operation Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {batchOperations.map((operation) => {
          const Icon = operation.icon;
          const isSelected = operationType === operation.id;
          
          return (
            <button
              key={operation.id}
              onClick={() => setOperationType(operation.id)}
              disabled={activeOperation?.status === 'processing'}
              className={`
                p-4 rounded-xl border-2 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected
                  ? `border-${operation.color}-400 bg-${operation.color}-50 dark:bg-${operation.color}-950/20`
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }
              `}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected 
                    ? `bg-${operation.color}-100 dark:bg-${operation.color}-900/30` 
                    : 'bg-slate-100 dark:bg-slate-700'
                  }
                `}>
                  <Icon className={`
                    w-5 h-5
                    ${isSelected 
                      ? `text-${operation.color}-600 dark:text-${operation.color}-400` 
                      : 'text-slate-600 dark:text-slate-400'
                    }
                  `} />
                </div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {operation.name}
                </h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {operation.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Operation Parameters */}
      {selectedOperation && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <selectedOperation.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              {selectedOperation.name} Settings
            </h4>
          </div>

          <div className="space-y-4">
            {selectedOperation.params.map((param) => (
              <div key={param.name}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {param.label}
                </label>
                {renderParameterInput(param)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {activeOperation && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                Processing {selectedOperation?.name}
              </h4>
            </div>
            
            <div className="flex items-center space-x-2">
              {activeOperation.status === 'processing' && (
                <button
                  onClick={cancelOperation}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Pause className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              )}
              
              {activeOperation.status === 'completed' && (
                <button
                  onClick={resetOperation}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Progress: {activeOperation.progress}%
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {activeOperation.mediaIds.length} files
              </span>
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${activeOperation.progress}%` }}
              />
            </div>

            {activeOperation.status === 'completed' && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-sm text-green-800 dark:text-green-200">
                  ✅ Operation completed successfully! Processed {activeOperation.results?.length || 0} files.
                </div>
              </div>
            )}

            {activeOperation.errors && activeOperation.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="text-sm text-red-800 dark:text-red-200">
                  ⚠️ {activeOperation.errors.length} error{activeOperation.errors.length !== 1 ? 's' : ''} occurred during processing.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedOperation && !activeOperation && (
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => setOperationType('')}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={startBatchOperation}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Play className="w-4 h-4" />
            <span>Start Processing</span>
          </button>
        </div>
      )}
    </div>
  );
};