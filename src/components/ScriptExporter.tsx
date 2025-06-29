import React, { useState } from 'react';
import { Download, FileText, FileImage, Printer, Settings, Eye, Share2 } from 'lucide-react';
import { Script, ExportOptions, ExportFormat } from '../types/script';
import jsPDF from 'jspdf';

interface ScriptExporterProps {
  script: Script;
}

export const ScriptExporter: React.FC<ScriptExporterProps> = ({
  script
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeComments: false,
    includeRevisions: false,
    includeTimecodes: true,
    pageNumbers: true,
    watermark: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats: { value: ExportFormat; label: string; icon: any; description: string }[] = [
    { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Standard PDF format for sharing and printing' },
    { value: 'docx', label: 'Word Document', icon: FileText, description: 'Editable Microsoft Word format' },
    { value: 'fountain', label: 'Fountain', icon: FileText, description: 'Plain text screenplay format' },
    { value: 'fdx', label: 'Final Draft', icon: FileText, description: 'Industry standard screenwriting format' },
    { value: 'html', label: 'HTML', icon: FileImage, description: 'Web-friendly format with styling' },
    { value: 'txt', label: 'Plain Text', icon: FileText, description: 'Simple text format without formatting' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      switch (exportOptions.format) {
        case 'pdf':
          await exportToPDF();
          break;
        case 'docx':
        case 'fountain':
        case 'fdx':
        case 'html':
        case 'txt':
          exportToText();
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Title
    pdf.setFontSize(24);
    pdf.text(script.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Description
    pdf.setFontSize(12);
    pdf.text(script.description, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Content
    pdf.setFontSize(12);
    for (const element of script.content) {
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = margin;
        
        if (exportOptions.pageNumbers) {
          pdf.setFontSize(8);
          pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth - margin, 10);
          pdf.setFontSize(12);
        }
      }

      // Element type
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(element.type.toUpperCase().replace('-', ' '), margin, yPosition);
      yPosition += 5;
      
      // Element content
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      
      // Apply formatting
      if (element.formatting.bold) pdf.setFont(undefined, 'bold');
      else if (element.formatting.italic) pdf.setFont(undefined, 'italic');
      else pdf.setFont(undefined, 'normal');
      
      // Handle alignment
      const textX = element.formatting.alignment === 'center' ? pageWidth / 2 :
                    element.formatting.alignment === 'right' ? pageWidth - margin :
                    margin + (element.formatting.indent || 0);
      
      const textOptions = element.formatting.alignment === 'center' || element.formatting.alignment === 'right' 
        ? { align: element.formatting.alignment } 
        : undefined;
      
      // Split text to fit page width
      const maxWidth = pageWidth - (2 * margin) - (element.formatting.indent || 0);
      const textLines = pdf.splitTextToSize(element.content, maxWidth);
      
      pdf.text(textLines, textX, yPosition, textOptions);
      yPosition += (textLines.length * 7) + 5;
      
      // Add timecode if enabled
      if (exportOptions.includeTimecodes && element.timing?.estimatedDuration) {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Duration: ${element.timing.estimatedDuration}s`, margin, yPosition);
        yPosition += 5;
      }
      
      // Reset font
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Add spacing between elements
      yPosition += 5;
    }

    // Add watermark if specified
    if (exportOptions.watermark) {
      const watermarkText = exportOptions.watermark;
      pdf.setFontSize(40);
      pdf.setTextColor(200, 200, 200);
      pdf.setGState({ opacity: 0.2 });
      
      for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
        pdf.setPage(i);
        pdf.text(watermarkText, pageWidth / 2, pdf.internal.pageSize.getHeight() / 2, {
          align: 'center',
          angle: 45
        });
      }
    }

    pdf.save(`${script.title.replace(/\s+/g, '_')}.pdf`);
  };

  const exportToText = () => {
    let content = `${script.title.toUpperCase()}\n\n`;
    content += `${script.description}\n\n`;
    content += '='.repeat(80) + '\n\n';

    script.content.forEach(element => {
      content += `[${element.type.toUpperCase().replace('-', ' ')}]\n`;
      content += `${element.content}\n`;
      
      if (exportOptions.includeTimecodes && element.timing?.estimatedDuration) {
        content += `[Duration: ${element.timing.estimatedDuration}s]\n`;
      }
      
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, '_')}.${exportOptions.format === 'txt' ? 'txt' : 'fountain'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareScript = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: script.title,
          text: script.description,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Export Script
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Export your script in various industry-standard formats
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={shareScript}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Export Format Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Export Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {exportFormats.map((format) => {
            const Icon = format.icon;
            const isSelected = exportOptions.format === format.value;
            
            return (
              <button
                key={format.value}
                onClick={() => setExportOptions({ ...exportOptions, format: format.value })}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                `}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`
                    p-2 rounded-lg
                    ${isSelected 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-slate-100 dark:bg-slate-700'
                    }
                  `}>
                    <Icon className={`
                      w-5 h-5
                      ${isSelected 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-600 dark:text-slate-400'
                      }
                    `} />
                  </div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {format.label}
                  </h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {format.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Content Options
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTimecodes}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeTimecodes: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Include Timecodes</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeComments}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeComments: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Include Comments</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeRevisions}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeRevisions: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Include Revision History</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.pageNumbers}
                  onChange={(e) => setExportOptions({ ...exportOptions, pageNumbers: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Include Page Numbers</span>
              </label>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Watermark (Optional)
            </h4>
            <input
              type="text"
              value={exportOptions.watermark || ''}
              onChange={(e) => setExportOptions({ ...exportOptions, watermark: e.target.value })}
              placeholder="Enter watermark text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              Add a watermark to protect your intellectual property
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Export Preview
          </h3>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {script.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {script.description}
            </p>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {script.content.slice(0, 5).map((element, index) => (
              <div key={index} className="border-b border-slate-200 dark:border-slate-600 pb-3">
                {exportOptions.includeTimecodes && element.timing && (
                  <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                    Duration: {element.timing.estimatedDuration}s
                  </div>
                )}
                <div
                  className="text-slate-900 dark:text-slate-100"
                  style={{
                    fontWeight: element.formatting.bold ? 'bold' : 'normal',
                    fontStyle: element.formatting.italic ? 'italic' : 'normal',
                    textAlign: element.formatting.alignment || 'left',
                    marginLeft: `${element.formatting.indent || 0}px`
                  }}
                >
                  {element.content}
                </div>
              </div>
            ))}
            
            {script.content.length > 5 && (
              <div className="text-center text-sm text-slate-500 dark:text-slate-500">
                ... and {script.content.length - 5} more elements
              </div>
            )}
          </div>

          {exportOptions.watermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-4xl font-bold text-slate-300 dark:text-slate-700 opacity-20 transform rotate-45">
                {exportOptions.watermark}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Export Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• PDF format is best for sharing with clients and team members</li>
          <li>• Use Fountain format for compatibility with screenwriting software</li>
          <li>• Include timecodes for production planning and scheduling</li>
          <li>• Add a watermark for drafts shared outside your organization</li>
          <li>• Final Draft (FDX) format is the industry standard for professional production</li>
        </ul>
      </div>
    </div>
  );
};