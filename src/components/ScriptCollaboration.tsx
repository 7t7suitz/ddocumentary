import React, { useState } from 'react';
import { 
  Users, UserPlus, MessageSquare, Clock, Eye, 
  Lock, Unlock, Settings, Save, AlertCircle 
} from 'lucide-react';
import { Script, Collaborator, CollaboratorRole, Comment } from '../types/script';

interface ScriptCollaborationProps {
  script: Script;
  onScriptUpdate: (script: Script) => void;
}

export const ScriptCollaboration: React.FC<ScriptCollaborationProps> = ({
  script,
  onScriptUpdate
}) => {
  const [newCollaborator, setNewCollaborator] = useState({
    name: '',
    email: '',
    role: 'viewer' as CollaboratorRole
  });
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'general' | 'suggestion' | 'question'>('general');

  const addCollaborator = () => {
    if (!newCollaborator.name || !newCollaborator.email) return;

    const collaborator: Collaborator = {
      id: `collab-${Date.now()}`,
      name: newCollaborator.name,
      email: newCollaborator.email,
      role: newCollaborator.role,
      permissions: getPermissionsForRole(newCollaborator.role),
      lastActive: new Date()
    };

    onScriptUpdate({
      ...script,
      collaborators: [...script.collaborators, collaborator],
      updatedAt: new Date()
    });

    setNewCollaborator({
      name: '',
      email: '',
      role: 'viewer'
    });
  };

  const getPermissionsForRole = (role: CollaboratorRole) => {
    switch (role) {
      case 'owner':
        return [
          { action: 'read', granted: true },
          { action: 'write', granted: true },
          { action: 'comment', granted: true },
          { action: 'approve', granted: true },
          { action: 'export', granted: true }
        ];
      case 'editor':
        return [
          { action: 'read', granted: true },
          { action: 'write', granted: true },
          { action: 'comment', granted: true },
          { action: 'approve', granted: false },
          { action: 'export', granted: true }
        ];
      case 'reviewer':
        return [
          { action: 'read', granted: true },
          { action: 'write', granted: false },
          { action: 'comment', granted: true },
          { action: 'approve', granted: true },
          { action: 'export', granted: false }
        ];
      case 'viewer':
      default:
        return [
          { action: 'read', granted: true },
          { action: 'write', granted: false },
          { action: 'comment', granted: false },
          { action: 'approve', granted: false },
          { action: 'export', granted: false }
        ];
    }
  };

  const removeCollaborator = (id: string) => {
    onScriptUpdate({
      ...script,
      collaborators: script.collaborators.filter(c => c.id !== id),
      updatedAt: new Date()
    });
  };

  const updateCollaboratorRole = (id: string, role: CollaboratorRole) => {
    onScriptUpdate({
      ...script,
      collaborators: script.collaborators.map(c =>
        c.id === id
          ? { ...c, role, permissions: getPermissionsForRole(role) }
          : c
      ),
      updatedAt: new Date()
    });
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content: newComment,
      author: 'Current User',
      createdAt: new Date(),
      type: commentType
    };

    onScriptUpdate({
      ...script,
      comments: [...script.comments, comment],
      updatedAt: new Date()
    });

    setNewComment('');
  };

  const resolveComment = (id: string) => {
    onScriptUpdate({
      ...script,
      comments: script.comments.map(c =>
        c.id === id ? { ...c, resolved: true } : c
      ),
      updatedAt: new Date()
    });
  };

  const getRoleColor = (role: CollaboratorRole): string => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'editor': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'reviewer': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'viewer': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getCommentTypeColor = (type: string): string => {
    switch (type) {
      case 'suggestion': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'question': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'approval': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Collaboration Tools
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Invite team members to collaborate on your script, manage permissions, 
          and coordinate feedback through comments and suggestions.
        </p>
      </div>

      {/* Collaborators Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Collaborators ({script.collaborators.length})
            </h3>
          </div>
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => document.getElementById('add-collaborator-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Collaborator</span>
          </button>
        </div>

        {/* Collaborators List */}
        {script.collaborators.length > 0 ? (
          <div className="space-y-4">
            {script.collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {collaborator.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {collaborator.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {collaborator.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {collaborator.lastActive.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <select
                    value={collaborator.role}
                    onChange={(e) => updateCollaboratorRole(collaborator.id, e.target.value as CollaboratorRole)}
                    className="px-2 py-1 text-xs rounded-full border-0 font-medium focus:ring-0 focus:outline-none"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <option value="owner" className="bg-white dark:bg-slate-800">Owner</option>
                    <option value="editor" className="bg-white dark:bg-slate-800">Editor</option>
                    <option value="reviewer" className="bg-white dark:bg-slate-800">Reviewer</option>
                    <option value="viewer" className="bg-white dark:bg-slate-800">Viewer</option>
                  </select>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(collaborator.role)}`}>
                    {collaborator.role}
                  </span>
                  
                  <button
                    onClick={() => removeCollaborator(collaborator.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No collaborators yet. Add team members to work together.
            </p>
          </div>
        )}

        {/* Add Collaborator Form */}
        <div id="add-collaborator-form" className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
            Add New Collaborator
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newCollaborator.name}
                onChange={(e) => setNewCollaborator({ ...newCollaborator, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Collaborator name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newCollaborator.email}
                onChange={(e) => setNewCollaborator({ ...newCollaborator, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Role
              </label>
              <select
                value={newCollaborator.role}
                onChange={(e) => setNewCollaborator({ ...newCollaborator, role: e.target.value as CollaboratorRole })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="viewer">Viewer (can only view)</option>
                <option value="reviewer">Reviewer (can comment)</option>
                <option value="editor">Editor (can edit)</option>
                <option value="owner">Owner (full access)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {newCollaborator.role === 'viewer' && 'Can view the script but cannot make changes or comments'}
              {newCollaborator.role === 'reviewer' && 'Can view and comment on the script but cannot edit'}
              {newCollaborator.role === 'editor' && 'Can view, comment, and edit the script'}
              {newCollaborator.role === 'owner' && 'Has full access to the script, including approval rights'}
            </div>
            <button
              onClick={addCollaborator}
              disabled={!newCollaborator.name || !newCollaborator.email}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Collaborator
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Comments & Feedback ({script.comments.length})
          </h3>
        </div>

        {/* Comments List */}
        {script.comments.length > 0 ? (
          <div className="space-y-4 mb-6">
            {script.comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg border ${
                  comment.resolved
                    ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {comment.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {comment.author}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        {comment.createdAt.toLocaleString()}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCommentTypeColor(comment.type)}`}>
                      {comment.type}
                    </span>
                  </div>
                  
                  {!comment.resolved && (
                    <button
                      onClick={() => resolveComment(comment.id)}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                    >
                      Resolve
                    </button>
                  )}
                </div>
                
                <p className={`text-sm ${
                  comment.resolved
                    ? 'text-slate-500 dark:text-slate-500'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {comment.content}
                </p>
                
                {comment.elementId && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                    Referring to: {script.content.find(e => e.id === comment.elementId)?.content.substring(0, 50)}...
                  </div>
                )}
                
                {comment.resolved && (
                  <div className="mt-2 flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Resolved</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-6">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No comments yet. Add feedback to collaborate with your team.
            </p>
          </div>
        )}

        {/* Add Comment Form */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
            Add Comment
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-700 dark:text-slate-300">Type:</label>
              <div className="flex space-x-2">
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    checked={commentType === 'general'}
                    onChange={() => setCommentType('general')}
                    className="text-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">General</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    checked={commentType === 'suggestion'}
                    onChange={() => setCommentType('suggestion')}
                    className="text-green-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Suggestion</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    checked={commentType === 'question'}
                    onChange={() => setCommentType('question')}
                    className="text-amber-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Question</span>
                </label>
              </div>
            </div>
            
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comment or feedback..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              rows={3}
            />
            
            <div className="flex items-center justify-end">
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Collaboration Settings
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">Lock Script for Editing</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">Show Collaborator Cursors</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">Real-time Comments</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Collaboration Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Collaboration Best Practices
          </h3>
        </div>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Assign clear roles to team members based on their responsibilities</li>
          <li>• Use specific comment types to distinguish between questions and suggestions</li>
          <li>• Resolve comments once they've been addressed to keep the workspace clean</li>
          <li>• Consider locking the script when finalizing to prevent accidental changes</li>
          <li>• Use version control to track major revisions and changes</li>
        </ul>
      </div>
    </div>
  );
};