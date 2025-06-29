import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Save, Download, Share2, MessageSquare, Users, Clock, Eye,
  Plus, Trash2, Edit3, Copy, RotateCcw, Play, Pause
} from 'lucide-react';
import { Script, ScriptElement, ElementType, Collaborator, Comment } from '../types/script';

interface ScriptEditorProps {
  script: Script;
  onScriptUpdate: (script: Script) => void;
  collaborators: Collaborator[];
  isCollaborative?: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  onScriptUpdate,
  collaborators,
  isCollaborative = false
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const elementTypes: { type: ElementType; label: string; shortcut: string }[] = [
    { type: 'scene-heading', label: 'Scene Heading', shortcut: 'Ctrl+1' },
    { type: 'action', label: 'Action', shortcut: 'Ctrl+2' },
    { type: 'character', label: 'Character', shortcut: 'Ctrl+3' },
    { type: 'dialogue', label: 'Dialogue', shortcut: 'Ctrl+4' },
    { type: 'voiceover', label: 'Voiceover', shortcut: 'Ctrl+5' },
    { type: 'transition', label: 'Transition', shortcut: 'Ctrl+6' }
  ];

  const updateElement = (elementId: string, updates: Partial<ScriptElement>) => {
    const updatedElements = script.content.map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );
    
    onScriptUpdate({
      ...script,
      content: updatedElements,
      updatedAt: new Date()
    });
  };

  const addElement = (type: ElementType, afterElementId?: string) => {
    const newElement: ScriptElement = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      formatting: getDefaultFormatting(type),
      order: script.content.length,
      timing: type === 'voiceover' ? { estimatedDuration: 5 } : undefined
    };

    let updatedElements;
    if (afterElementId) {
      const insertIndex = script.content.findIndex(el => el.id === afterElementId) + 1;
      updatedElements = [
        ...script.content.slice(0, insertIndex),
        newElement,
        ...script.content.slice(insertIndex)
      ];
    } else {
      updatedElements = [...script.content, newElement];
    }

    // Reorder elements
    updatedElements.forEach((element, index) => {
      element.order = index;
    });

    onScriptUpdate({
      ...script,
      content: updatedElements,
      updatedAt: new Date()
    });
  };

  const deleteElement = (elementId: string) => {
    const updatedElements = script.content.filter(el => el.id !== elementId);
    updatedElements.forEach((element, index) => {
      element.order = index;
    });

    onScriptUpdate({
      ...script,
      content: updatedElements,
      updatedAt: new Date()
    });
  };

  const duplicateElement = (elementId: string) => {
    const element = script.content.find(el => el.id === elementId);
    if (!element) return;

    const duplicatedElement: ScriptElement = {
      ...element,
      id: `element-${Date.now()}`,
      content: `${element.content} (Copy)`,
      order: element.order + 1
    };

    const insertIndex = script.content.findIndex(el => el.id === elementId) + 1;
    const updatedElements = [
      ...script.content.slice(0, insertIndex),
      duplicatedElement,
      ...script.content.slice(insertIndex)
    ];

    updatedElements.forEach((element, index) => {
      element.order = index;
    });

    onScriptUpdate({
      ...script,
      content: updatedElements,
      updatedAt: new Date()
    });
  };

  const getDefaultContent = (type: ElementType): string => {
    const defaults = {
      'scene-heading': 'INT. LOCATION - DAY',
      'action': 'Describe the action here.',
      'character': 'CHARACTER NAME',
      'dialogue': 'Character dialogue goes here.',
      'voiceover': 'Voiceover narration text.',
      'transition': 'CUT TO:',
      'interview-question': 'Interview question?',
      'interview-answer': 'Interview response.',
      'music-cue': 'MUSIC: Description',
      'sound-effect': 'SFX: Sound description',
      'title-card': 'TITLE CARD: Text',
      'lower-third': 'LOWER THIRD: Name, Title',
      'b-roll': 'B-ROLL: Visual description',
      'parenthetical': '(direction)'
    };
    return defaults[type] || 'New element';
  };

  const getDefaultFormatting = (type: ElementType) => {
    const formatting = {
      'scene-heading': { bold: true, fontSize: 12, alignment: 'left' as const },
      'action': { fontSize: 12, alignment: 'left' as const },
      'character': { bold: true, fontSize: 12, alignment: 'center' as const, indent: 20 },
      'dialogue': { fontSize: 12, alignment: 'left' as const, indent: 10 },
      'voiceover': { italic: true, fontSize: 12, alignment: 'left' as const },
      'transition': { bold: true, fontSize: 12, alignment: 'right' as const },
      'parenthetical': { italic: true, fontSize: 10, alignment: 'center' as const }
    };
    return formatting[type] || { fontSize: 12, alignment: 'left' as const };
  };

  const getElementStyle = (element: ScriptElement) => {
    const { formatting } = element;
    return {
      fontWeight: formatting.bold ? 'bold' : 'normal',
      fontStyle: formatting.italic ? 'italic' : 'normal',
      textDecoration: formatting.underline ? 'underline' : 'none',
      fontSize: `${formatting.fontSize || 12}px`,
      textAlign: formatting.alignment || 'left',
      marginLeft: `${formatting.indent || 0}px`,
      lineHeight: formatting.spacing ? `${formatting.spacing}em` : '1.5'
    };
  };

  const addComment = (elementId?: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      elementId,
      content: newComment,
      author: 'Current User',
      createdAt: new Date(),
      type: 'general'
    };

    onScriptUpdate({
      ...script,
      comments: [...script.comments, comment],
      updatedAt: new Date()
    });

    setNewComment('');
  };

  const playScript = () => {
    setIsPlaying(true);
    // Simulate script playback
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        if (newTime >= script.metadata.estimatedDuration) {
          setIsPlaying(false);
          clearInterval(interval);
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-900">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Formatting Tools */}
              <div className="flex items-center space-x-1 border-r border-slate-200 dark:border-slate-700 pr-4">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <Bold className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <Italic className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <Underline className="w-4 h-4" />
                </button>
              </div>

              {/* Alignment */}
              <div className="flex items-center space-x-1 border-r border-slate-200 dark:border-slate-700 pr-4">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>

              {/* Element Types */}
              <select className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm">
                {elementTypes.map(type => (
                  <option key={type.type} value={type.type}>
                    {type.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => addElement('action')}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                <span>Add Element</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Playback Controls */}
              <button
                onClick={isPlaying ? () => setIsPlaying(false) : playScript}
                className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <div className="text-sm text-slate-600 dark:text-slate-400">
                {formatTime(currentTime)} / {formatTime(script.metadata.estimatedDuration)}
              </div>

              {/* Collaboration */}
              {isCollaborative && (
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Comments ({script.comments.length})</span>
                </button>
              )}

              {/* Actions */}
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <Save className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Script Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-4" ref={editorRef}>
            {/* Script Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {script.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {script.description}
              </p>
              <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-slate-500 dark:text-slate-500">
                <span>{script.metadata.wordCount} words</span>
                <span>•</span>
                <span>{script.metadata.pageCount} pages</span>
                <span>•</span>
                <span>{formatTime(script.metadata.estimatedDuration)} estimated</span>
              </div>
            </div>

            {/* Script Elements */}
            {script.content.map((element, index) => (
              <div
                key={element.id}
                className={`
                  group relative p-4 rounded-lg transition-all duration-200
                  ${selectedElement === element.id 
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-transparent'
                  }
                `}
                onClick={() => setSelectedElement(element.id)}
              >
                {/* Element Controls */}
                <div className="absolute -left-12 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addElement('action', element.id);
                      }}
                      className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                      title="Add element after"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateElement(element.id);
                      }}
                      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Element Type Badge */}
                <div className="absolute -top-2 left-4">
                  <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                    {element.type.replace('-', ' ')}
                  </span>
                </div>

                {/* Element Content */}
                <div
                  contentEditable
                  suppressContentEditableWarning
                  style={getElementStyle(element)}
                  className="outline-none min-h-[1.5em] text-slate-900 dark:text-slate-100"
                  onBlur={(e) => {
                    updateElement(element.id, { content: e.currentTarget.textContent || '' });
                  }}
                  dangerouslySetInnerHTML={{ __html: element.content }}
                />

                {/* Timing Info */}
                {element.timing && (
                  <div className="absolute -right-16 top-4 text-xs text-slate-500 dark:text-slate-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatTime(element.timing.estimatedDuration || 0)}
                  </div>
                )}

                {/* Comments Indicator */}
                {script.comments.some(comment => comment.elementId === element.id) && (
                  <div className="absolute -right-8 top-4">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                  </div>
                )}
              </div>
            ))}

            {/* Add Element at End */}
            <div className="text-center py-8">
              <button
                onClick={() => addElement('action')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Element</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Sidebar */}
      {showComments && isCollaborative && (
        <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Comments ({script.comments.length})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
              >
                ×
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {script.comments.map((comment) => (
              <div key={comment.id} className="bg-white dark:bg-slate-700 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {comment.author.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {comment.author}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {comment.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm resize-none"
              rows={3}
            />
            <button
              onClick={() => addComment(selectedElement || undefined)}
              disabled={!newComment.trim()}
              className="mt-2 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Add Comment
            </button>
          </div>
        </div>
      )}

      {/* Collaborators */}
      {isCollaborative && collaborators.length > 0 && (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="flex -space-x-2">
            {collaborators.slice(0, 3).map((collaborator) => (
              <div
                key={collaborator.id}
                className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-slate-900"
                title={collaborator.name}
              >
                {collaborator.name.charAt(0)}
              </div>
            ))}
          </div>
          {collaborators.length > 3 && (
            <span className="text-sm text-slate-500 dark:text-slate-500">
              +{collaborators.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};