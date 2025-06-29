import React, { useState, useEffect } from 'react';
import { 
  Globe, RefreshCw, Bell, Clock, FileText, 
  ExternalLink, Check, AlertCircle, Filter, 
  Download, Eye, Plus, Calendar
} from 'lucide-react';
import { ResearchProject, NewsAlert, ResearchTopic } from '../types/research';
import { monitorNews } from '../utils/researchService';
import { format, subDays } from 'date-fns';

interface NewsMonitorProps {
  project: ResearchProject;
  onNewsAlertAdd: (alert: NewsAlert) => void;
}

export const NewsMonitor: React.FC<NewsMonitorProps> = ({
  project,
  onNewsAlertAdd
}) => {
  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [monitoringFrequency, setMonitoringFrequency] = useState<'realtime' | 'daily' | 'weekly'>('daily');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewed' | 'archived'>('all');
  const [selectedAlert, setSelectedAlert] = useState<NewsAlert | null>(null);
  const [alertNotes, setAlertNotes] = useState('');

  useEffect(() => {
    // Load existing alerts from the project
    setNewsAlerts(project.newsAlerts);
  }, [project.newsAlerts]);

  const startMonitoring = async () => {
    if (selectedTopics.length === 0) return;
    
    setIsMonitoring(true);
    try {
      const alerts = await monitorNews(selectedTopics);
      setNewsAlerts(prev => {
        // Filter out duplicates
        const existingUrls = new Set(prev.map(a => a.url));
        const newAlerts = alerts.filter(a => !existingUrls.has(a.url));
        return [...prev, ...newAlerts];
      });
    } catch (error) {
      console.error('News monitoring failed:', error);
    } finally {
      setIsMonitoring(false);
    }
  };

  const toggleTopicSelection = (topicName: string) => {
    if (selectedTopics.includes(topicName)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topicName));
    } else {
      setSelectedTopics([...selectedTopics, topicName]);
    }
  };

  const handleAlertSelect = (alert: NewsAlert) => {
    setSelectedAlert(alert);
    setAlertNotes(alert.notes || '');
  };

  const addAlertToProject = () => {
    if (!selectedAlert) return;
    
    const updatedAlert: NewsAlert = {
      ...selectedAlert,
      notes: alertNotes,
      status: 'reviewed'
    };
    
    onNewsAlertAdd(updatedAlert);
    setSelectedAlert(null);
    setAlertNotes('');
  };

  const updateAlertStatus = (alertId: string, status: 'new' | 'reviewed' | 'archived') => {
    setNewsAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status } : alert
    ));
  };

  const filteredAlerts = newsAlerts.filter(alert => {
    if (filterStatus === 'all') return true;
    return alert.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            News Monitor
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track news and updates related to your research topics
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
              <option value="all">All Alerts</option>
              <option value="new">New Alerts</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <button
            onClick={() => {}}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <Download className="w-4 h-4" />
            <span>Export Alerts</span>
          </button>
        </div>
      </div>

      {/* Monitoring Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            News Monitoring Settings
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Select Topics to Monitor
            </h4>
            
            {project.topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => toggleTopicSelection(topic.name)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors
                      ${selectedTopics.includes(topic.name)
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <span>{topic.name}</span>
                    {selectedTopics.includes(topic.name) && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 mb-2">
                  No topics available in the project. Add topics first.
                </p>
                <button
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Research Topic</span>
                </button>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Monitoring Frequency
            </h4>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={monitoringFrequency === 'realtime'}
                  onChange={() => setMonitoringFrequency('realtime')}
                  className="text-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Real-time (Immediate alerts)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={monitoringFrequency === 'daily'}
                  onChange={() => setMonitoringFrequency('daily')}
                  className="text-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Daily digest</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={monitoringFrequency === 'weekly'}
                  onChange={() => setMonitoringFrequency('weekly')}
                  className="text-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Weekly summary</span>
              </label>
            </div>
            
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={startMonitoring}
                disabled={isMonitoring || selectedTopics.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isMonitoring ? 'animate-spin' : ''}`} />
                <span>{isMonitoring ? 'Monitoring...' : 'Start Monitoring'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* News Alert Details */}
      {selectedAlert && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              News Alert Details
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Back to Alerts
              </button>
              <button
                onClick={addAlertToProject}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Project</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xl mb-2">
                  {selectedAlert.title}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{selectedAlert.source}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedAlert.date.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <a 
                href={selectedAlert.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Source</span>
              </a>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mb-4">
              <p className="text-slate-700 dark:text-slate-300">
                {selectedAlert.summary}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Related Topics
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.topics.map((topic, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notes
                </h5>
                <textarea
                  value={alertNotes}
                  onChange={(e) => setAlertNotes(e.target.value)}
                  placeholder="Add notes about this news alert..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <div>
                  Relevance: {Math.round(selectedAlert.relevance * 100)}%
                </div>
                <div>
                  Status: {selectedAlert.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Alerts List */}
      {!selectedAlert && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              News Alerts ({filteredAlerts.length})
            </h3>
          </div>
          
          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {alert.title}
                        </h4>
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${alert.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            alert.status === 'reviewed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }
                        `}>
                          {alert.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>{alert.source}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(alert.date, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        {alert.summary}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {alert.topics.map((topic, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <a 
                        href={alert.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-500">
                      <span>Relevance: {Math.round(alert.relevance * 100)}%</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAlertSelect(alert)}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      
                      {alert.status === 'new' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'reviewed')}
                          className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Reviewed</span>
                        </button>
                      )}
                      
                      {alert.status !== 'archived' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'archived')}
                          className="flex items-center space-x-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                          <span>Archive</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No News Alerts Yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Start monitoring news related to your research topics
              </p>
              <button
                onClick={startMonitoring}
                disabled={selectedTopics.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 mx-auto"
              >
                <Bell className="w-4 h-4" />
                <span>Start Monitoring</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* News Monitoring Tips */}
      {!selectedAlert && filteredAlerts.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            News Monitoring Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Select specific topics to receive more relevant news alerts</li>
            <li>• Set up daily or weekly digests to avoid information overload</li>
            <li>• Review alerts regularly to stay updated on your research topics</li>
            <li>• Archive alerts that aren't relevant to keep your workspace organized</li>
            <li>• Add notes to important alerts for future reference</li>
            <li>• Use news alerts to identify emerging trends and developments</li>
          </ul>
        </div>
      )}
    </div>
  );
};