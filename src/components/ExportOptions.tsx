import React, { useState } from 'react';
import { StoryboardFrame, StoryboardProject } from '../types';
import { Download, FileImage, FileText, Printer, Share2, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptionsProps {
  project: StoryboardProject;
  frames: StoryboardFrame[];
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  project,
  frames
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Title page
      pdf.setFontSize(24);
      pdf.text(project.title, pageWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(project.description, pageWidth / 2, 45, { align: 'center' });
      pdf.text(`Created: ${project.createdAt.toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' });
      pdf.text(`Total Frames: ${frames.length}`, pageWidth / 2, 65, { align: 'center' });
      pdf.text(`Total Duration: ${Math.floor(frames.reduce((sum, f) => sum + f.duration, 0) / 60)}:${(frames.reduce((sum, f) => sum + f.duration, 0) % 60).toString().padStart(2, '0')}`, pageWidth / 2, 75, { align: 'center' });

      // Frames per page (2x2 grid)
      const framesPerPage = 4;
      const frameWidth = (contentWidth - 10) / 2;
      const frameHeight = (contentHeight - 40) / 2;

      for (let i = 0; i < frames.length; i += framesPerPage) {
        if (i > 0) pdf.addPage();
        
        const pageFrames = frames.slice(i, i + framesPerPage);
        
        for (let j = 0; j < pageFrames.length; j++) {
          const frame = pageFrames[j];
          const row = Math.floor(j / 2);
          const col = j % 2;
          const x = margin + (col * (frameWidth + 5));
          const y = margin + 20 + (row * (frameHeight + 10));

          // Frame border
          pdf.rect(x, y, frameWidth, frameHeight - 30);

          // Frame info
          pdf.setFontSize(10);
          pdf.text(`${i + j + 1}. ${frame.title}`, x, y - 2);
          pdf.setFontSize(8);
          pdf.text(`${frame.shotType} • ${frame.cameraAngle} • ${frame.duration}s`, x, y + frameHeight - 25);
          pdf.text(frame.description.substring(0, 80) + (frame.description.length > 80 ? '...' : ''), x, y + frameHeight - 20, { maxWidth: frameWidth });
          
          if (frame.voiceoverText) {
            pdf.text(`VO: ${frame.voiceoverText.substring(0, 60)}${frame.voiceoverText.length > 60 ? '...' : ''}`, x, y + frameHeight - 15, { maxWidth: frameWidth });
          }
          
          if (frame.audioNotes) {
            pdf.text(`Audio: ${frame.audioNotes.substring(0, 40)}${frame.audioNotes.length > 40 ? '...' : ''}`, x, y + frameHeight - 10, { maxWidth: frameWidth });
          }

          setExportProgress(((i + j + 1) / frames.length) * 100);
        }
      }

      pdf.save(`${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_storyboard.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToImages = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // This would require canvas elements to be rendered
      // For now, we'll simulate the export
      for (let i = 0; i < frames.length; i++) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        setExportProgress(((i + 1) / frames.length) * 100);
      }
      
      // In a real implementation, you would:
      // 1. Render each frame to a canvas
      // 2. Convert canvas to blob
      // 3. Create download links or zip file
      
      alert('Image export would download individual frame images');
    } catch (error) {
      console.error('Image export failed:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToScript = () => {
    let script = `${project.title.toUpperCase()}\nSTORYBOARD SCRIPT\n\n`;
    script += `Created: ${project.createdAt.toLocaleDateString()}\n`;
    script += `Total Duration: ${Math.floor(frames.reduce((sum, f) => sum + f.duration, 0) / 60)}:${(frames.reduce((sum, f) => sum + f.duration, 0) % 60).toString().padStart(2, '0')}\n\n`;
    script += '=' .repeat(50) + '\n\n';

    frames.forEach((frame, index) => {
      script += `FRAME ${index + 1}: ${frame.title.toUpperCase()}\n`;
      script += `Duration: ${frame.duration} seconds\n`;
      script += `Shot: ${frame.shotType} • Angle: ${frame.cameraAngle} • Movement: ${frame.cameraMovement}\n`;
      script += `Lighting: ${frame.lighting.mood} (${frame.lighting.timeOfDay})\n\n`;
      
      script += `DESCRIPTION:\n${frame.description}\n\n`;
      
      if (frame.characters.length > 0) {
        script += `CHARACTERS:\n`;
        frame.characters.forEach(char => {
          script += `- ${char.name} (${char.emotion}, ${char.action})\n`;
        });
        script += '\n';
      }
      
      if (frame.voiceoverText) {
        script += `VOICEOVER:\n"${frame.voiceoverText}"\n\n`;
      }
      
      if (frame.audioNotes) {
        script += `AUDIO NOTES:\n${frame.audioNotes}\n\n`;
      }
      
      script += '-'.repeat(30) + '\n\n';
    });

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const exportData = {
      project,
      frames,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_storyboard.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareProject = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: `Check out my storyboard: ${project.description}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Project URL copied to clipboard!');
    }
  };

  const exportOptions = [
    {
      id: 'pdf',
      title: 'Export as PDF',
      description: 'Professional storyboard document with frames and details',
      icon: FileText,
      action: exportToPDF,
      color: 'red'
    },
    {
      id: 'images',
      title: 'Export as Images',
      description: 'Individual frame images for presentations',
      icon: FileImage,
      action: exportToImages,
      color: 'blue'
    },
    {
      id: 'script',
      title: 'Export Script',
      description: 'Text-based shooting script with all frame details',
      icon: Printer,
      action: exportToScript,
      color: 'green'
    },
    {
      id: 'json',
      title: 'Export Project Data',
      description: 'JSON file for backup or sharing with other tools',
      icon: Download,
      action: exportToJSON,
      color: 'purple'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Export Storyboard
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Export your storyboard in various formats for production use
          </p>
        </div>
        <button
          onClick={shareProject}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Progress Bar */}
      {isExporting && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Exporting storyboard...
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {Math.round(exportProgress)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={option.action}
              disabled={isExporting || frames.length === 0}
              className={`
                p-4 text-left border-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${option.color === 'red' ? 'border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950/20' :
                  option.color === 'blue' ? 'border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/20' :
                  option.color === 'green' ? 'border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-700 dark:hover:bg-green-950/20' :
                  'border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:hover:border-purple-700 dark:hover:bg-purple-950/20'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  p-2 rounded-lg
                  ${option.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                    option.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    option.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-purple-100 dark:bg-purple-900/30'
                  }
                `}>
                  <Icon className={`
                    w-5 h-5
                    ${option.color === 'red' ? 'text-red-600 dark:text-red-400' :
                      option.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      option.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      'text-purple-600 dark:text-purple-400'
                    }
                  `} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {frames.length === 0 && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Create some storyboard frames first to enable export options.
          </p>
        </div>
      )}
    </div>
  );
};