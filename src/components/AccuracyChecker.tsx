import React, { useState } from 'react';
import { 
  AlertTriangle, Search, FileText, Check, 
  X, BarChart2, Download, RefreshCw, Eye,
  Zap, Copy, ExternalLink, Filter
} from 'lucide-react';
import { ResearchProject, AccuracyReport, PlagiarismResult, FactualError } from '../types/research';
import { checkAccuracy, checkPlagiarism } from '../utils/researchService';
import { format } from 'date-fns';

interface AccuracyCheckerProps {
  project: ResearchProject;
  onProjectUpdate: (project: ResearchProject) => void;
}

export const AccuracyChecker: React.FC<AccuracyCheckerProps> = ({
  project,
  onProjectUpdate
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AccuracyReport | null>(null);
  const [textToCheck, setTextToCheck] = useState('');
  const [plagiarismResults, setPlagiarismResults] = useState<PlagiarismResult[]>([]);
  const [isPlagiarismChecking, setIsPlagiarismChecking] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const runAccuracyCheck = async () => {
    setIsChecking(true);
    try {
      const report = await checkAccuracy(project);
      
      onProjectUpdate({
        ...project,
        accuracyReports: [...project.accuracyReports, report]
      });
      
      setSelectedReport(report);
    } catch (error) {
      console.error('Accuracy check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const checkPlagiarismInText = async () => {
    if (!textToCheck.trim()) return;
    
    setIsPlagiarismChecking(true);
    try {
      const results = await checkPlagiarism(textToCheck);
      setPlagiarismResults(results);
    } catch (error) {
      console.error('Plagiarism check failed:', error);
    } finally {
      setIsPlagiarismChecking(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getAccuracyScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredErrors = selectedReport?.factualErrors.filter(error => {
    if (filterSeverity === 'all') return true;
    return error.severity === filterSeverity;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Accuracy Checker
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Verify accuracy and check for plagiarism in your research
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={runAccuracyCheck}
            disabled={isChecking || project.sources.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{isChecking ? 'Checking...' : 'Run Accuracy Check'}</span>
          </button>
        </div>
      </div>

      {/* Plagiarism Checker */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Plagiarism Checker
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enter text to check for plagiarism
            </label>
            <textarea
              value={textToCheck}
              onChange={(e) => setTextToCheck(e.target.value)}
              placeholder="Paste text to check for plagiarism..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              rows={4}
            />
          </div>
          
          <div className="flex items-center justify-end">
            <button
              onClick={checkPlagiarismInText}
              disabled={isPlagiarismChecking || !textToCheck.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isPlagiarismChecking ? 'Checking...' : 'Check Plagiarism'}</span>
            </button>
          </div>
        </div>
        
        {/* Plagiarism Results */}
        {plagiarismResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              Plagiarism Check Results
            </h4>
            
            {plagiarismResults.map((result, index) => (
              <div key={index} className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-200">
                      {Math.round(result.matchPercentage * 100)}% Match
                    </span>
                  </div>
                  
                  {result.url && (
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Source
                    </a>
                  )}
                </div>
                
                <div className="p-3 bg-white dark:bg-slate-800 rounded border border-red-200 dark:border-red-800 mb-2">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    "{result.text}"
                  </p>
                </div>
                
                <div className="text-xs text-red-700 dark:text-red-300">
                  Matched source: {result.matchedSource}
                </div>
              </div>
            ))}
            
            {plagiarismResults.length === 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    No plagiarism detected
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accuracy Report */}
      {selectedReport && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Accuracy Report: {selectedReport.title}
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Generated on {format(selectedReport.date, 'MMMM d, yyyy')}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${selectedReport.overallAccuracy >= 0.8 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                  : selectedReport.overallAccuracy >= 0.6 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }
              `}>
                Accuracy: {Math.round(selectedReport.overallAccuracy * 100)}%
              </div>
              
              <button
                onClick={() => {}}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <Download className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
          
          {/* Report Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${getAccuracyScoreColor(selectedReport.overallAccuracy)}`}>
                  {Math.round(selectedReport.overallAccuracy * 100)}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Overall Accuracy</div>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1 text-red-600 dark:text-red-400">
                  {selectedReport.factualErrors.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Factual Errors</div>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1 text-amber-600 dark:text-amber-400">
                  {selectedReport.plagiarismResults.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Plagiarism Matches</div>
              </div>
            </div>
          </div>
          
          {/* Factual Errors */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Factual Errors ({selectedReport.factualErrors.length})
              </h4>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value as any)}
                  className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                >
                  <option value="all">All Severities</option>
                  <option value="high">High Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="low">Low Severity</option>
                </select>
              </div>
            </div>
            
            {filteredErrors.length > 0 ? (
              <div className="space-y-4">
                {filteredErrors.map((error, index) => (
                  <div key={index} className={`
                    p-4 rounded-lg border
                    ${error.severity === 'high' 
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
                      : error.severity === 'medium' 
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' 
                      : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    }
                  `}>
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(error.severity)}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`
                            px-2 py-1 text-xs font-medium rounded-full
                            ${getSeverityColor(error.severity)}
                          `}>
                            {error.severity} severity
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                            Incorrect Statement:
                          </div>
                          <p className={`
                            text-sm
                            ${error.severity === 'high' 
                              ? 'text-red-800 dark:text-red-200' 
                              : error.severity === 'medium' 
                              ? 'text-amber-800 dark:text-amber-200' 
                              : 'text-blue-800 dark:text-blue-200'
                            }
                          `}>
                            {error.statement}
                          </p>
                        </div>
                        
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                            Correction:
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {error.correction}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Check className="w-12 h-12 mx-auto text-green-500 mb-2" />
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedReport.factualErrors.length === 0 
                    ? 'No factual errors found in your research' 
                    : 'No errors matching the selected filter'}
                </p>
              </div>
            )}
          </div>
          
          {/* Plagiarism Results */}
          {selectedReport.plagiarismResults.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
                Plagiarism Matches ({selectedReport.plagiarismResults.length})
              </h4>
              
              <div className="space-y-4">
                {selectedReport.plagiarismResults.map((result, index) => (
                  <div key={index} className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="font-medium text-red-800 dark:text-red-200">
                          {Math.round(result.matchPercentage * 100)}% Match
                        </span>
                      </div>
                      
                      {result.url && (
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View Source
                        </a>
                      )}
                    </div>
                    
                    <div className="p-3 bg-white dark:bg-slate-800 rounded border border-red-200 dark:border-red-800 mb-2">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        "{result.text}"
                      </p>
                    </div>
                    
                    <div className="text-xs text-red-700 dark:text-red-300">
                      Matched source: {result.matchedSource}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
              Recommendations
            </h4>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <ul className="space-y-2">
                {selectedReport.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-blue-800 dark:text-blue-200">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {!selectedReport && project.accuracyReports.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Previous Accuracy Reports ({project.accuracyReports.length})
          </h3>
          
          <div className="space-y-3">
            {project.accuracyReports.map((report) => (
              <div 
                key={report.id} 
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => setSelectedReport(report)}
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {report.title}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Generated on {format(report.date, 'MMMM d, yyyy')}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${report.overallAccuracy >= 0.8 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                      : report.overallAccuracy >= 0.6 
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }
                  `}>
                    Accuracy: {Math.round(report.overallAccuracy * 100)}%
                  </div>
                  
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-lg">
                    <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedReport && project.accuracyReports.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <AlertTriangle className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Accuracy Reports Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Run an accuracy check to verify your research and identify potential issues
          </p>
          <button
            onClick={runAccuracyCheck}
            disabled={isChecking || project.sources.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Run Accuracy Check</span>
          </button>
        </div>
      )}

      {/* Accuracy Checking Tips */}
      {!selectedReport && project.accuracyReports.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Accuracy Checking Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Run regular accuracy checks throughout your research process</li>
            <li>• Verify facts across multiple reliable sources</li>
            <li>• Pay special attention to high-severity factual errors</li>
            <li>• Use the plagiarism checker for all written content</li>
            <li>• Properly attribute and cite all sources to avoid plagiarism</li>
            <li>• Implement the recommendations to improve overall accuracy</li>
          </ul>
        </div>
      )}
    </div>
  );
};