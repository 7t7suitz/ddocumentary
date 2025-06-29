import React, { useState } from 'react';
import { 
  BookOpen, Copy, Download, FileText, 
  Search, Filter, Plus, Trash2, Check,
  ExternalLink, Edit3, ClipboardCopy
} from 'lucide-react';
import { ResearchProject, Source, Citation } from '../types/research';
import { generateCitation } from '../utils/researchService';

interface CitationManagerProps {
  project: ResearchProject;
  onProjectUpdate: (project: ResearchProject) => void;
}

export const CitationManager: React.FC<CitationManagerProps> = ({
  project,
  onProjectUpdate
}) => {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee'>('apa');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSourceType, setFilterSourceType] = useState<string>('all');
  const [showBibTeX, setShowBibTeX] = useState(false);

  const generateCitationForSource = (source: Source) => {
    const citation = generateCitation(source, citationStyle);
    
    // Add citation to project
    onProjectUpdate({
      ...project,
      citations: [...project.citations, citation]
    });
    
    // Also add citation to source
    onProjectUpdate({
      ...project,
      sources: project.sources.map(s => 
        s.id === source.id 
          ? { ...s, citations: [...s.citations, citation.id] } 
          : s
      )
    });
  };

  const deleteCitation = (citationId: string) => {
    // Remove citation from project
    onProjectUpdate({
      ...project,
      citations: project.citations.filter(c => c.id !== citationId)
    });
    
    // Also remove citation from source
    onProjectUpdate({
      ...project,
      sources: project.sources.map(s => ({
        ...s,
        citations: s.citations.filter(id => id !== citationId)
      }))
    });
  };

  const copyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you would show a toast notification here
    alert('Citation copied to clipboard!');
  };

  const exportCitations = () => {
    let content = '';
    
    // Group citations by style
    const citationsByStyle: Record<string, Citation[]> = {};
    project.citations.forEach(citation => {
      if (!citationsByStyle[citation.style]) {
        citationsByStyle[citation.style] = [];
      }
      citationsByStyle[citation.style].push(citation);
    });
    
    // Format content
    Object.entries(citationsByStyle).forEach(([style, citations]) => {
      content += `# ${style.toUpperCase()} Style Citations\n\n`;
      citations.forEach(citation => {
        content += `${citation.formattedCitation}\n\n`;
      });
      content += '\n';
    });
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-citations.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredSources = project.sources
    .filter(source => 
      (filterSourceType === 'all' || source.type === filterSourceType) &&
      (searchQuery === '' || 
        source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())))
    );

  const getCitationsBySource = (sourceId: string): Citation[] => {
    return project.citations.filter(citation => citation.sourceId === sourceId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Citation Manager
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate and manage citations for your research sources
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportCitations}
            disabled={project.citations.length === 0}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Citations</span>
          </button>
        </div>
      </div>

      {/* Citation Style Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Citation Style
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { value: 'apa', label: 'APA' },
            { value: 'mla', label: 'MLA' },
            { value: 'chicago', label: 'Chicago' },
            { value: 'harvard', label: 'Harvard' },
            { value: 'ieee', label: 'IEEE' }
          ].map((style) => (
            <button
              key={style.value}
              onClick={() => setCitationStyle(style.value as any)}
              className={`
                px-4 py-2 rounded-lg border transition-colors
                ${citationStyle === style.value
                  ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }
              `}
            >
              {style.label}
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {citationStyle.toUpperCase()} Style Example
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {citationStyle === 'apa' && 'Author, A. A. (Year). Title of work. Publisher.'}
            {citationStyle === 'mla' && 'Author. "Title of Source." Title of Container, Other contributors, Version, Number, Publisher, Publication Date, Location.'}
            {citationStyle === 'chicago' && 'Author, Title, (Place of publication: Publisher, Year), Page number.'}
            {citationStyle === 'harvard' && 'Author (Year) Title. Place of publication: Publisher.'}
            {citationStyle === 'ieee' && '[1] A. Author, "Title of article," Title of Journal, vol. x, no. x, pp. xxx-xxx, Month Year.'}
          </p>
        </div>
      </div>

      {/* Source Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Sources ({filteredSources.length})
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sources..."
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterSourceType}
                onChange={(e) => setFilterSourceType(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Types</option>
                <option value="academic">Academic</option>
                <option value="news">News</option>
                <option value="book">Book</option>
                <option value="journal">Journal</option>
                <option value="website">Website</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredSources.length > 0 ? (
          <div className="space-y-4">
            {filteredSources.map((source) => {
              const citations = getCitationsBySource(source.id);
              const hasCitationForCurrentStyle = citations.some(c => c.style === citationStyle);
              
              return (
                <div key={source.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {source.title}
                      </h4>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {source.authors.join(', ')} • {source.type}
                        {source.publishedDate && ` • ${source.publishedDate.getFullYear()}`}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!hasCitationForCurrentStyle && (
                        <button
                          onClick={() => generateCitationForSource(source)}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Generate {citationStyle.toUpperCase()}</span>
                        </button>
                      )}
                      
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-500" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Existing Citations */}
                  {citations.length > 0 && (
                    <div className="space-y-3 mt-3">
                      {citations.map((citation) => (
                        <div key={citation.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {citation.style.toUpperCase()} Citation
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => copyCitation(citation.formattedCitation)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                                title="Copy citation"
                              >
                                <Copy className="w-3 h-3 text-slate-500" />
                              </button>
                              
                              <button
                                onClick={() => deleteCitation(citation.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                title="Delete citation"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {citation.formattedCitation}
                          </p>
                          
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <div className="text-slate-500 dark:text-slate-500">
                              In-text: {citation.inTextCitation}
                            </div>
                            
                            {citation.bibtex && (
                              <button
                                onClick={() => setShowBibTeX(!showBibTeX)}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {showBibTeX ? 'Hide BibTeX' : 'Show BibTeX'}
                              </button>
                            )}
                          </div>
                          
                          {showBibTeX && citation.bibtex && (
                            <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-600 rounded text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                              <pre>{citation.bibtex}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No sources found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Bibliography Preview */}
      {project.citations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Bibliography Preview ({project.citations.filter(c => c.style === citationStyle).length} citations)
            </h3>
            <button
              onClick={() => copyCitation(
                project.citations
                  .filter(c => c.style === citationStyle)
                  .map(c => c.formattedCitation)
                  .join('\n\n')
              )}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
            >
              <ClipboardCopy className="w-4 h-4" />
              <span>Copy All</span>
            </button>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              {citationStyle.toUpperCase()} Bibliography
            </h4>
            
            <div className="space-y-4">
              {project.citations
                .filter(c => c.style === citationStyle)
                .map((citation, index) => (
                  <div key={citation.id} className="text-sm text-slate-700 dark:text-slate-300">
                    {citation.formattedCitation}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Citation Tips */}
      {project.sources.length > 0 && project.citations.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Citation Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Choose the citation style that matches your project requirements</li>
            <li>• Generate citations for all sources you reference in your documentary</li>
            <li>• Use in-text citations when quoting or paraphrasing in your script</li>
            <li>• Export your bibliography for inclusion in your documentary credits</li>
            <li>• Keep your citations organized by consistently using the same style</li>
            <li>• Include DOIs or URLs when available for digital verification</li>
          </ul>
        </div>
      )}
    </div>
  );
};