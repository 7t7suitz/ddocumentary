import React, { useState } from 'react';
import { 
  AlertCircle, Search, Check, X, Clock, 
  FileText, BarChart2, ExternalLink, Plus,
  ThumbsUp, ThumbsDown, Filter, Download
} from 'lucide-react';
import { ResearchProject, Claim, Source, FactCheckResult, Evidence } from '../types/research';
import { factCheckClaim } from '../utils/researchService';

interface FactCheckerProps {
  project: ResearchProject;
  onClaimAdd: (claim: Claim) => void;
}

export const FactChecker: React.FC<FactCheckerProps> = ({
  project,
  onClaimAdd
}) => {
  const [claimText, setClaimText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [supportingEvidence, setSupportingEvidence] = useState<Evidence[]>([]);
  const [contradictoryEvidence, setContradictoryEvidence] = useState<Evidence[]>([]);
  const [newEvidenceText, setNewEvidenceText] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<'supporting' | 'contradictory'>('supporting');
  const [selectedSourceForEvidence, setSelectedSourceForEvidence] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'disputed' | 'unverified'>('all');

  const handleFactCheck = async () => {
    if (!claimText.trim()) return;
    
    setIsChecking(true);
    try {
      const result = await factCheckClaim(claimText);
      setFactCheckResult(result);
    } catch (error) {
      console.error('Fact checking failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const toggleSourceSelection = (sourceId: string) => {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter(id => id !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  };

  const addEvidence = () => {
    if (!newEvidenceText.trim() || !selectedSourceForEvidence) return;
    
    const evidence: Evidence = {
      id: `evidence-${Date.now()}`,
      sourceId: selectedSourceForEvidence,
      excerpt: newEvidenceText,
      relevance: 0.8,
      strength: 0.7,
      type: 'direct',
      notes: ''
    };
    
    if (newEvidenceType === 'supporting') {
      setSupportingEvidence([...supportingEvidence, evidence]);
    } else {
      setContradictoryEvidence([...contradictoryEvidence, evidence]);
    }
    
    setNewEvidenceText('');
  };

  const addClaimToProject = () => {
    if (!factCheckResult) return;
    
    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      statement: claimText,
      topics: project.topics.slice(0, 2).map(t => t.id),
      sources: selectedSources,
      supportingEvidence,
      contradictoryEvidence,
      factCheckResult,
      confidence: calculateConfidence(factCheckResult, supportingEvidence, contradictoryEvidence),
      importance: 'medium',
      status: getStatusFromVerdict(factCheckResult.verdict),
      notes: ''
    };
    
    onClaimAdd(newClaim);
    resetForm();
  };

  const resetForm = () => {
    setClaimText('');
    setFactCheckResult(null);
    setSelectedSources([]);
    setSupportingEvidence([]);
    setContradictoryEvidence([]);
    setNewEvidenceText('');
  };

  const calculateConfidence = (
    result: FactCheckResult, 
    supporting: Evidence[], 
    contradicting: Evidence[]
  ): number => {
    let baseConfidence = 0;
    
    // Base confidence from verdict
    switch (result.verdict) {
      case 'true': baseConfidence = 0.9; break;
      case 'mostly-true': baseConfidence = 0.75; break;
      case 'mixed': baseConfidence = 0.5; break;
      case 'mostly-false': baseConfidence = 0.25; break;
      case 'false': baseConfidence = 0.1; break;
      case 'unverified': baseConfidence = 0.3; break;
    }
    
    // Adjust based on evidence
    const supportingStrength = supporting.reduce((sum, ev) => sum + ev.strength, 0) / Math.max(1, supporting.length);
    const contradictingStrength = contradicting.reduce((sum, ev) => sum + ev.strength, 0) / Math.max(1, contradicting.length);
    
    // Weighted adjustment
    const adjustment = (supportingStrength * 0.2) - (contradictingStrength * 0.2);
    
    return Math.max(0.1, Math.min(0.99, baseConfidence + adjustment));
  };

  const getStatusFromVerdict = (verdict: string): 'verified' | 'unverified' | 'disputed' => {
    switch (verdict) {
      case 'true':
      case 'mostly-true':
        return 'verified';
      case 'mixed':
      case 'mostly-false':
      case 'false':
        return 'disputed';
      default:
        return 'unverified';
    }
  };

  const getVerdictColor = (verdict: string): string => {
    switch (verdict) {
      case 'true': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'mostly-true': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'mixed': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'mostly-false': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'false': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'true': return <Check className="w-4 h-4 text-green-500" />;
      case 'mostly-true': return <Check className="w-4 h-4 text-emerald-500" />;
      case 'mixed': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'mostly-false': return <X className="w-4 h-4 text-orange-500" />;
      case 'false': return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredClaims = project.claims.filter(claim => {
    if (filterStatus === 'all') return true;
    return claim.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Fact Checker
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Verify claims and find supporting or contradictory evidence
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Claims</option>
              <option value="verified">Verified Only</option>
              <option value="disputed">Disputed Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
          
          <button
            onClick={() => {}}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <Download className="w-4 h-4" />
            <span>Export Claims</span>
          </button>
        </div>
      </div>

      {/* Claim Input */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Check a Claim
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enter the claim to fact-check
            </label>
            <textarea
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="Enter a factual statement to verify..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-end">
            <button
              onClick={handleFactCheck}
              disabled={isChecking || !claimText.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isChecking ? 'Checking...' : 'Check Facts'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fact Check Results */}
      {factCheckResult && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getVerdictIcon(factCheckResult.verdict)}
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Fact Check Result
                </h3>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getVerdictColor(factCheckResult.verdict)}`}>
                {factCheckResult.verdict.replace('-', ' ')}
              </span>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mb-4">
              <p className="text-slate-700 dark:text-slate-300">
                {factCheckResult.explanation}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-600 dark:text-slate-400">
                Checked by: {factCheckResult.checkedBy} on {factCheckResult.checkedDate.toLocaleDateString()}
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                </button>
                <button className="flex items-center space-x-1 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
          
          {/* External Fact Checks */}
          {factCheckResult.externalFactChecks.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                External Fact Checks
              </h3>
              
              <div className="space-y-3">
                {factCheckResult.externalFactChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {check.organization}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Verdict: {check.verdict} • {check.date.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <a 
                      href={check.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Source Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Select Related Sources
            </h3>
            
            {project.sources.length > 0 ? (
              <div className="space-y-3">
                {project.sources.map((source) => (
                  <div 
                    key={source.id} 
                    className={`
                      flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                      ${selectedSources.includes(source.id)
                        ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }
                    `}
                    onClick={() => toggleSourceSelection(source.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center
                        ${selectedSources.includes(source.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-600'
                        }
                      `}>
                        {selectedSources.includes(source.id) && <Check className="w-3 h-3" />}
                      </div>
                      
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {source.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {source.authors.join(', ')} • {source.type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      Reliability: {Math.round(source.reliability.overall * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-500">
                No sources available in the project. Add sources first.
              </p>
            )}
          </div>
          
          {/* Evidence */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Evidence
            </h3>
            
            <div className="space-y-4">
              {/* Supporting Evidence */}
              <div>
                <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  Supporting Evidence ({supportingEvidence.length})
                </h4>
                
                <div className="space-y-2 mb-4">
                  {supportingEvidence.map((evidence, index) => {
                    const source = project.sources.find(s => s.id === evidence.sourceId);
                    
                    return (
                      <div key={index} className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-green-800 dark:text-green-200">
                            {source?.title || 'Unknown Source'}
                          </div>
                          <button
                            onClick={() => setSupportingEvidence(supportingEvidence.filter((_, i) => i !== index))}
                            className="text-green-500 hover:text-green-700 dark:hover:text-green-300"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          "{evidence.excerpt}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Contradictory Evidence */}
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Contradictory Evidence ({contradictoryEvidence.length})
                </h4>
                
                <div className="space-y-2 mb-4">
                  {contradictoryEvidence.map((evidence, index) => {
                    const source = project.sources.find(s => s.id === evidence.sourceId);
                    
                    return (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-red-800 dark:text-red-200">
                            {source?.title || 'Unknown Source'}
                          </div>
                          <button
                            onClick={() => setContradictoryEvidence(contradictoryEvidence.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          "{evidence.excerpt}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Add Evidence Form */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Add Evidence
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Evidence Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={newEvidenceType === 'supporting'}
                          onChange={() => setNewEvidenceType('supporting')}
                          className="text-blue-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Supporting</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={newEvidenceType === 'contradictory'}
                          onChange={() => setNewEvidenceType('contradictory')}
                          className="text-blue-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Contradictory</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Source
                    </label>
                    <select
                      value={selectedSourceForEvidence}
                      onChange={(e) => setSelectedSourceForEvidence(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Select a source</option>
                      {project.sources.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Evidence Text
                    </label>
                    <textarea
                      value={newEvidenceText}
                      onChange={(e) => setNewEvidenceText(e.target.value)}
                      placeholder="Enter evidence text or quote..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={addEvidence}
                      disabled={!newEvidenceText.trim() || !selectedSourceForEvidence}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Evidence</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Add to Project */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            
            <button
              onClick={addClaimToProject}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add Claim to Project</span>
            </button>
          </div>
        </div>
      )}

      {/* Project Claims */}
      {activeTab === 'claims' && !factCheckResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Project Claims ({filteredClaims.length})
            </h3>
          </div>
          
          {filteredClaims.length > 0 ? (
            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <div key={claim.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {getVerdictIcon(claim.factCheckResult.verdict)}
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {claim.statement}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getVerdictColor(claim.factCheckResult.verdict)}`}>
                          {claim.factCheckResult.verdict.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {claim.factCheckResult.explanation}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
                      <div className="flex items-center space-x-1">
                        <BarChart2 className="w-3 h-3" />
                        <span>
                          Confidence: {Math.round(claim.confidence * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>
                          {claim.sources.length} source{claim.sources.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>
                          {claim.supportingEvidence.length} supporting
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <X className="w-3 h-3 text-red-500" />
                        <span>
                          {claim.contradictoryEvidence.length} contradicting
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Claims Yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Check facts to add claims to your research project
              </p>
              <button
                onClick={() => document.querySelector('textarea')?.focus()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Check a Claim</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fact Checking Tips */}
      {activeTab === 'claims' && !factCheckResult && filteredClaims.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Fact Checking Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Be specific when formulating claims to check</li>
            <li>• Always verify information across multiple reliable sources</li>
            <li>• Consider the context and nuance of the claim</li>
            <li>• Look for primary sources and original research when possible</li>
            <li>• Check for recent updates or corrections to previously verified information</li>
            <li>• Document both supporting and contradictory evidence</li>
          </ul>
        </div>
      )}
    </div>
  );
};