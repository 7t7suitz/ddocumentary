import React from 'react';
import { FileText, Calendar, Users, Tags, Brain, Clock } from 'lucide-react';
import { Document } from '../types';

interface DocumentLibraryProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (document: Document) => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  selectedDocument,
  onSelectDocument
}) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Documents Yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Upload your first document to start AI analysis and question generation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Document Library
        </h2>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-4">
        {documents.map((document) => (
          <div
            key={document.id}
            onClick={() => onSelectDocument(document)}
            className={`
              p-4 rounded-xl border cursor-pointer transition-all duration-200
              ${selectedDocument?.id === document.id
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20 shadow-md'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
              }
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`
                  p-2 rounded-lg
                  ${selectedDocument?.id === document.id
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-slate-100 dark:bg-slate-700'
                  }
                `}>
                  <FileText className={`
                    w-4 h-4
                    ${selectedDocument?.id === document.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400'
                    }
                  `} />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {document.name}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{document.uploadedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>{document.content.length} chars</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {document.analysis && (
                <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Brain className="w-3 h-3" />
                  <span>Analyzed</span>
                </div>
              )}
            </div>

            {document.analysis && (
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Tags className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {document.analysis.themes.length} themes
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {document.analysis.characters.length} characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {document.analysis.timeline.length} events
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {document.analysis.summary}
                </div>
                
                {document.analysis.sensitiveTopics.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {document.analysis.sensitiveTopics.length} sensitive topic{document.analysis.sensitiveTopics.length !== 1 ? 's' : ''} identified
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};