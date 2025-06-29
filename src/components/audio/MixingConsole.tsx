import React, { useState, useEffect } from 'react';
import { Sliders, AudioWaveform as Waveform, BarChart2, Download, Settings, Zap, Volume2, Loader2, Check, AlertTriangle } from 'lucide-react';
import { AudioFile, MixingRecommendation } from '../../types/audio';
import { generateMixingRecommendations } from '../../utils/audioProcessor';

interface MixingConsoleProps {
  file: AudioFile;
  onFileUpdate: (file: AudioFile) => void;
}

export const MixingConsole: React.FC<MixingConsoleProps> = ({
  file,
  onFileUpdate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mixingRecommendation, setMixingRecommendation] = useState<MixingRecommendation | null>(null);
  const [mixSettings, setMixSettings] = useState({
    volume: 0,
    pan: 0,
    lowEQ: 0,
    midEQ: 0,
    highEQ: 0,
    compression: 0,
    reverb: 0,
    delay: 0
  });
  
  useEffect(() => {
    // Initialize mix settings based on file analysis
    if (file.analysis) {
      setMixSettings({
        volume: 0,
        pan: 0,
        lowEQ: file.analysis.spectrum.lowFrequency > 0.6 ? -3 : file.analysis.spectrum.lowFrequency < 0.3 ? 3 : 0,
        midEQ: file.analysis.spectrum.midFrequency > 0.6 ? -2 : file.analysis.spectrum.midFrequency < 0.3 ? 2 : 0,
        highEQ: file.analysis.spectrum.highFrequency > 0.6 ? -3 : file.analysis.spectrum.highFrequency < 0.3 ? 3 : 0,
        compression: file.analysis.dynamics.dynamicRange > 15 ? 40 : file.analysis.dynamics.dynamicRange < 6 ? 10 : 20,
        reverb: 0,
        delay: 0
      });
    }
  }, [file]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      const recommendation = await generateMixingRecommendations(file.analysis);
      setMixingRecommendation(recommendation);
      
      // Apply recommended settings
      const newSettings = {
        volume: 0, // Keep user volume setting
        pan: 0, // Keep user pan setting
        lowEQ: recommendation.eqSettings.find(eq => eq.band === 'low')?.gain || 0,
        midEQ: recommendation.eqSettings.find(eq => eq.band === 'mid')?.gain || 0,
        highEQ: recommendation.eqSettings.find(eq => eq.band === 'high')?.gain || 0,
        compression: recommendation.compressionSettings.ratio * 10,
        reverb: 0, // Not part of recommendations
        delay: 0 // Not part of recommendations
      };
      
      setMixSettings(newSettings);
    } catch (error) {
      console.error('Failed to generate mixing recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyMixSettings = () => {
    // In a real implementation, this would apply the mix settings to the audio file
    // For now, we'll just update the file with a note about the applied settings
    
    const updatedFile: AudioFile = {
      ...file,
      metadata: {
        ...file.metadata,
        notes: `${file.metadata.notes || ''}\nMix settings applied: Volume: ${mixSettings.volume}dB, EQ: ${mixSettings.lowEQ}/${mixSettings.midEQ}/${mixSettings.highEQ}, Compression: ${mixSettings.compression}%`
      },
      updatedAt: new Date()
    };
    
    onFileUpdate(updatedFile);
  };

  const exportMixSettings = () => {
    const settings = {
      file: file.name,
      mixSettings,
      recommendation: mixingRecommendation,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}-mix-settings.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetMixSettings = () => {
    setMixSettings({
      volume: 0,
      pan: 0,
      lowEQ: 0,
      midEQ: 0,
      highEQ: 0,
      compression: 0,
      reverb: 0,
      delay: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Mixing Console
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Professional audio mixing tools with AI recommendations
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={applyMixSettings}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Check className="w-4 h-4" />
            <span>Apply Mix</span>
          </button>
          
          <button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{isGenerating ? 'Analyzing...' : 'Get Mix Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* Audio Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Audio Analysis
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Loudness */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              Loudness
            </h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Integrated</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {file.analysis.loudness.integrated.toFixed(1)} LUFS
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(0, (file.analysis.loudness.integrated + 24) / 24 * 100))}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">True Peak</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {file.analysis.loudness.truePeak.toFixed(1)} dBTP
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      file.analysis.loudness.truePeak > -1 ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, (file.analysis.loudness.truePeak + 20) / 20 * 100))}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Loudness Range</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {file.analysis.loudness.loudnessRange.toFixed(1)} LU
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(0, file.analysis.loudness.loudnessRange / 20 * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Spectrum */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              Frequency Spectrum
            </h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Low Frequency</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(file.analysis.spectrum.lowFrequency * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${file.analysis.spectrum.lowFrequency * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Mid Frequency</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(file.analysis.spectrum.midFrequency * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${file.analysis.spectrum.midFrequency * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">High Frequency</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(file.analysis.spectrum.highFrequency * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${file.analysis.spectrum.highFrequency * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Dynamics */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              Dynamics
            </h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Dynamic Range</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {file.analysis.dynamics.dynamicRange.toFixed(1)} dB
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, file.analysis.dynamics.dynamicRange / 20 * 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Crest Factor</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {file.analysis.dynamics.crestFactor.toFixed(1)} dB
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, file.analysis.dynamics.crestFactor / 20 * 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Compression</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.round(file.analysis.dynamics.compression * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${file.analysis.dynamics.compression * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mixing Recommendations */}
      {isGenerating ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Generating Mixing Recommendations
            </h3>
          </div>
          
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Analyzing audio characteristics to create optimal mixing settings
            </p>
            <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-indigo-500 animate-pulse rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ) : mixingRecommendation && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Mixing Recommendations
              </h3>
            </div>
            
            <button
              onClick={exportMixSettings}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download className="w-4 h-4" />
              <span>Export Settings</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                {mixingRecommendation.name}
              </h4>
              <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-3">
                {mixingRecommendation.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                    Target Loudness
                  </div>
                  <div className="text-sm text-indigo-800 dark:text-indigo-200">
                    {mixingRecommendation.targetLoudness} LUFS
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                    Target Dynamic Range
                  </div>
                  <div className="text-sm text-indigo-800 dark:text-indigo-200">
                    {mixingRecommendation.targetDynamicRange} LU
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* EQ Recommendations */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                  EQ Recommendations
                </h4>
                
                <div className="space-y-2">
                  {mixingRecommendation.eqSettings.map((eq, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 capitalize">
                        {eq.band} ({eq.frequency} Hz)
                      </span>
                      <span className={`font-medium ${
                        eq.gain > 0 ? 'text-green-600 dark:text-green-400' : 
                        eq.gain < 0 ? 'text-red-600 dark:text-red-400' : 
                        'text-slate-600 dark:text-slate-400'
                      }`}>
                        {eq.gain > 0 ? '+' : ''}{eq.gain} dB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Compression Recommendations */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                  Compression Recommendations
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Threshold</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {mixingRecommendation.compressionSettings.threshold} dB
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Ratio</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {mixingRecommendation.compressionSettings.ratio}:1
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Attack</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {mixingRecommendation.compressionSettings.attack} ms
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Release</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {mixingRecommendation.compressionSettings.release} ms
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Makeup Gain</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {mixingRecommendation.compressionSettings.makeupGain} dB
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="font-medium text-amber-900 dark:text-amber-100">
                  Mixing Notes
                </h4>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {mixingRecommendation.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mixing Console */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Mixing Console
            </h3>
          </div>
          
          <button
            onClick={resetMixSettings}
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Settings className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Volume & Pan */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Volume
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {mixSettings.volume > 0 ? '+' : ''}{mixSettings.volume} dB
                </span>
              </div>
              <input
                type="range"
                min="-24"
                max="12"
                step="0.1"
                value={mixSettings.volume}
                onChange={(e) => setMixSettings({
                  ...mixSettings,
                  volume: parseFloat(e.target.value)
                })}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>-24 dB</span>
                <span>0 dB</span>
                <span>+12 dB</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pan
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {mixSettings.pan === 0 ? 'Center' : 
                   mixSettings.pan < 0 ? `${Math.abs(mixSettings.pan)}L` : 
                   `${mixSettings.pan}R`}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={mixSettings.pan}
                onChange={(e) => setMixSettings({
                  ...mixSettings,
                  pan: parseInt(e.target.value)
                })}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>L</span>
                <span>C</span>
                <span>R</span>
              </div>
            </div>
          </div>
          
          {/* EQ */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              Equalizer
            </h4>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Low (100 Hz)
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {mixSettings.lowEQ > 0 ? '+' : ''}{mixSettings.lowEQ} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={mixSettings.lowEQ}
                onChange={(e) => setMixSettings({
                  ...mixSettings,
                  lowEQ: parseInt(e.target.value)
                })}
                className="w-full accent-indigo-500"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Mid (1 kHz)
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {mixSettings.midEQ > 0 ? '+' : ''}{mixSettings.midEQ} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={mixSettings.midEQ}
                onChange={(e) => setMixSettings({
                  ...mixSettings,
                  midEQ: parseInt(e.target.value)
                })}
                className="w-full accent-indigo-500"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  High (5 kHz)
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {mixSettings.highEQ > 0 ? '+' : ''}{mixSettings.highEQ} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={mixSettings.highEQ}
                onChange={(e) => setMixSettings({
                  ...mixSettings,
                  highEQ: parseInt(e.target.value)
                })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
          
          {/* Dynamics & Effects */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              Dynamics
            </h4>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Compression
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {mixSettings.compression}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mixSettings.compression}
                onChange={(e) => setMixSettings({
                  ...mixSettings,
                  compression: parseInt(e.target.value)
                })}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>None</span>
                <span>Medium</span>
                <span>Heavy</span>
              </div>
            </div>
          </div>
          
          {/* Effects */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              Effects
            </h4>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Reverb
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {mixSettings.reverb}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mixSettings.reverb}
                onChange={(e) => setMixSettings({
                  ...mixSettings,
                  reverb: parseInt(e.target.value)
                })}
                className="w-full accent-indigo-500"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Delay
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {mixSettings.delay}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mixSettings.delay}
                onChange={(e) => setMixSettings({
                  ...mixSettings,
                  delay: parseInt(e.target.value)
                })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mixing Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Audio Mixing Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Aim for a target loudness of -14 LUFS for online streaming</li>
          <li>• Use EQ to create space for each element in the mix</li>
          <li>• Apply compression to control dynamic range and improve clarity</li>
          <li>• Keep dialogue in the center channel for better clarity</li>
          <li>• Use reverb sparingly to avoid muddying dialogue</li>
          <li>• Always check your mix on different playback systems</li>
        </ul>
      </div>
    </div>
  );
};