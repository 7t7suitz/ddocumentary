import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye
} from 'lucide-react';
import { InterviewQuestion, ConversationFlow, InterviewSession } from '../types';
import jsPDF from 'jspdf';

interface InterviewScriptProps {
  questions: InterviewQuestion[];
  conversationFlow: ConversationFlow | null;
  session: InterviewSession | null;
}

export const InterviewScript: React.FC<InterviewScriptProps> = ({
  questions,
  conversationFlow,
  session
}) => {
  const [scriptFormat, setScriptFormat] = useState<'detailed' | 'compact' | 'notes'>('detailed');
  const [includeFollowUps, setIncludeFollowUps] = useState(true);
  const [includeTiming, setIncludeTiming] = useState(true);
  const [includeSensitivity, setIncludeSensitivity] = useState(true);
  const [includeContext, setIncludeContext] = useState(true);

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Title
    pdf.setFontSize(20);
    pdf.text('Interview Script', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    if (session) {
      pdf.setFontSize(12);
      pdf.text(`Session: ${session.title}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Created: ${session.createdAt.toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;
    }

    // Questions
    questions.forEach((question, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = margin;
      }

      // Question number and category
      pdf.setFontSize(14);
      pdf.text(`${index + 1}. [${question.category.toUpperCase()}]`, margin, yPosition);
      yPosition += 8;

      // Question text
      pdf.setFontSize(11);
      const questionLines = pdf.splitTextToSize(question.question, pageWidth - 2 * margin);
      pdf.text(questionLines, margin, yPosition);
      yPosition += questionLines.length * 5 + 5;

      // Additional details based on format
      if (scriptFormat === 'detailed') {
        if (includeContext) {
          pdf.setFontSize(9);
          pdf.text(`Context: ${question.context}`, margin + 10, yPosition);
          yPosition += 6;
        }

        if (includeTiming) {
          pdf.text(`Duration: ${question.expectedDuration} minutes`, margin + 10, yPosition);
          yPosition += 6;
        }

        if (includeSensitivity && question.sensitivity !== 'low') {
          pdf.text(`Sensitivity: ${question.sensitivity}`, margin + 10, yPosition);
          yPosition += 6;
        }

        if (includeFollowUps && question.followUps.length > 0) {
          pdf.text('Follow-ups:', margin + 10, yPosition);
          yPosition += 5;
          question.followUps.forEach(followUp => {
            const followUpLines = pdf.splitTextToSize(`• ${followUp}`, pageWidth - 2 * margin - 20);
            pdf.text(followUpLines, margin + 20, yPosition);
            yPosition += followUpLines.length * 4 + 2;
          });
        }
      }

      yPosition += 10;
    });

    pdf.save(`interview-script-${Date.now()}.pdf`);
  };

  const exportToText = () => {
    let script = '';
    
    if (session) {
      script += `INTERVIEW SCRIPT\n`;
      script += `Session: ${session.title}\n`;
      script += `Created: ${session.createdAt.toLocaleDateString()}\n`;
      script += `Total Questions: ${questions.length}\n`;
      script += `Estimated Duration: ${questions.reduce((sum, q) => sum + q.expectedDuration, 0)} minutes\n\n`;
      script += '='.repeat(50) + '\n\n';
    }

    questions.forEach((question, index) => {
      script += `${index + 1}. [${question.category.toUpperCase()}] `;
      if (includeSensitivity && question.sensitivity !== 'low') {
        script += `[${question.sensitivity.toUpperCase()} SENSITIVITY] `;
      }
      if (includeTiming) {
        script += `[${question.expectedDuration}min] `;
      }
      script += '\n';
      
      script += `${question.question}\n\n`;
      
      if (scriptFormat === 'detailed') {
        if (includeContext) {
          script += `Context: ${question.context}\n`;
        }
        
        if (includeFollowUps && question.followUps.length > 0) {
          script += `Follow-up questions:\n`;
          question.followUps.forEach(followUp => {
            script += `  • ${followUp}\n`;
          });
        }
        
        if (question.culturalNotes) {
          script += `Cultural notes: ${question.culturalNotes}\n`;
        }
        
        script += '\n';
      }
      
      script += '-'.repeat(30) + '\n\n';
    });

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-script-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareScript = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Interview Script',
          text: `Interview script with ${questions.length} questions`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Script URL copied to clipboard!');
    }
  };

  const getTotalDuration = () => {
    return questions.reduce((sum, q) => sum + q.expectedDuration, 0);
  };

  const getSensitivityStats = () => {
    const stats = { high: 0, medium: 0, low: 0 };
    questions.forEach(q => stats[q.sensitivity]++);
    return stats;
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Interview Script Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Generate questions first to create an interview script
        </p>
      </div>
    );
  }

  const sensitivityStats = getSensitivityStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Interview Script
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Professional interview script with timing and sensitivity guidance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToText}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <FileText className="w-4 h-4" />
            <span>Text</span>
          </button>
          
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          
          <button
            onClick={shareScript}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Script Settings */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Script Format</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Format Style
            </label>
            <select
              value={scriptFormat}
              onChange={(e) => setScriptFormat(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value="detailed">Detailed</option>
              <option value="compact">Compact</option>
              <option value="notes">Notes Only</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeFollowUps"
              checked={includeFollowUps}
              onChange={(e) => setIncludeFollowUps(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label htmlFor="includeFollowUps" className="text-sm text-slate-700 dark:text-slate-300">
              Follow-ups
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeTiming"
              checked={includeTiming}
              onChange={(e) => setIncludeTiming(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label htmlFor="includeTiming" className="text-sm text-slate-700 dark:text-slate-300">
              Timing
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeSensitivity"
              checked={includeSensitivity}
              onChange={(e) => setIncludeSensitivity(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label htmlFor="includeSensitivity" className="text-sm text-slate-700 dark:text-slate-300">
              Sensitivity
            </label>
          </div>
        </div>
      </div>

      {/* Script Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Script Overview
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {questions.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Questions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {getTotalDuration()}m
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Duration</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {sensitivityStats.high}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">High Sensitivity</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {new Set(questions.map(q => q.category)).size}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Categories</div>
          </div>
        </div>
        
        {sensitivityStats.high > 0 && (
          <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              This script contains {sensitivityStats.high} high-sensitivity question{sensitivityStats.high !== 1 ? 's' : ''}. 
              Approach with extra care and empathy.
            </span>
          </div>
        )}
      </div>

      {/* Script Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Interview Questions
            </h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="border-l-4 border-slate-200 dark:border-slate-700 pl-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {index + 1}.
                    </span>
                    
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${question.category === 'personal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        question.category === 'emotional' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        question.category === 'factual' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }
                    `}>
                      {question.category}
                    </span>
                    
                    {includeSensitivity && question.sensitivity !== 'low' && (
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${question.sensitivity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }
                      `}>
                        {question.sensitivity} sensitivity
                      </span>
                    )}
                    
                    {includeTiming && (
                      <span className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{question.expectedDuration}m</span>
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    {question.question}
                  </h4>
                  
                  {includeContext && scriptFormat === 'detailed' && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <strong>Context:</strong> {question.context}
                    </p>
                  )}
                  
                  {includeFollowUps && question.followUps.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Follow-up questions:
                      </h5>
                      <ul className="space-y-1">
                        {question.followUps.map((followUp, fIndex) => (
                          <li key={fIndex} className="text-sm text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-slate-200 dark:border-slate-600">
                            {followUp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {question.culturalNotes && scriptFormat === 'detailed' && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Cultural Considerations
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {question.culturalNotes}
                      </p>
                    </div>
                  )}
                  
                  {question.sensitivity === 'high' && (
                    <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Handle with extra care - allow time for emotional processing</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interview Tips */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
            Interview Best Practices
          </h3>
        </div>
        
        <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
          <li>• Review the script beforehand but be prepared to adapt based on responses</li>
          <li>• Start with easier questions to build rapport and comfort</li>
          <li>• Use active listening and maintain eye contact</li>
          <li>• Allow silence for processing, especially after emotional questions</li>
          <li>• Be prepared to offer breaks during sensitive topics</li>
          <li>• Follow up naturally based on interesting responses</li>
          <li>• End with positive, forward-looking questions when possible</li>
        </ul>
      </div>
    </div>
  );
};