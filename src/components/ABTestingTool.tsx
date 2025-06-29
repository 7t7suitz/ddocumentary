import React, { useState } from 'react';
import { 
  Split, BarChart3, ThumbsUp, ThumbsDown, Users, 
  Clock, Heart, Brain, Eye, Download, Share2 
} from 'lucide-react';
import { Script, ABTestVariant } from '../types/script';
import { generateABTestVariants } from '../utils/scriptGenerator';

interface ABTestingToolProps {
  script: Script;
  onVariantSelect: (variant: Script) => void;
}

export const ABTestingTool: React.FC<ABTestingToolProps> = ({
  script,
  onVariantSelect
}) => {
  const [variants, setVariants] = useState<ABTestVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [variantCount, setVariantCount] = useState(3);

  const generateVariants = async () => {
    setIsGenerating(true);
    try {
      const newVariants = await generateABTestVariants(script, variantCount);
      setVariants(newVariants);
    } catch (error) {
      console.error('Failed to generate variants:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariantSelect = (variant: ABTestVariant) => {
    setSelectedVariant(variant.id);
    onVariantSelect(variant.script);
  };

  const addFeedback = (variantId: string, rating: number) => {
    setVariants(prev => prev.map(variant => {
      if (variant.id === variantId) {
        return {
          ...variant,
          feedback: [
            ...variant.feedback,
            {
              id: `feedback-${Date.now()}`,
              reviewer: 'Current User',
              rating,
              comments: '',
              categories: [],
              timestamp: new Date()
            }
          ],
          metrics: {
            ...variant.metrics,
            audienceRating: rating
          }
        };
      }
      return variant;
    }));
  };

  const exportVariants = () => {
    const variantsData = {
      baseScript: script.title,
      variants: variants.map(v => ({
        name: v.name,
        description: v.description,
        metrics: v.metrics,
        feedback: v.feedback.length
      })),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(variantsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-variants-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          A/B Testing Tool
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Generate multiple script variations to test different approaches, tones, and structures.
          Compare metrics and gather feedback to determine the most effective version.
        </p>
      </div>

      {/* Generator Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Split className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Generate Script Variants
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Number of Variants
            </label>
            <select
              value={variantCount}
              onChange={(e) => setVariantCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value={2}>2 Variants</option>
              <option value={3}>3 Variants</option>
              <option value={4}>4 Variants</option>
              <option value={5}>5 Variants</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Variation Focus
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="tone">Tone & Voice</option>
              <option value="structure">Structure & Pacing</option>
              <option value="dialogue">Dialogue & Character</option>
              <option value="all">All Elements</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Base script: {script.title} ({script.content.length} elements)
          </div>
          <button
            onClick={generateVariants}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            <Split className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Variants'}</span>
          </button>
        </div>
      </div>

      {/* Variants Comparison */}
      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Script Variants ({variants.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportVariants}
                className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Download className="w-4 h-4" />
                <span>Export Results</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className={`
                  bg-white dark:bg-slate-800 rounded-xl border-2 transition-all duration-200
                  ${selectedVariant === variant.id
                    ? 'border-purple-400 shadow-lg'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                `}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {variant.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => addFeedback(variant.id, 1)}
                        className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                        title="Like this variant"
                      >
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                      </button>
                      <button
                        onClick={() => addFeedback(variant.id, 0)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        title="Dislike this variant"
                      >
                        <ThumbsDown className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {variant.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3 h-3 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">Readability</div>
                        <div className={`text-sm font-medium ${getScoreColor(variant.metrics.readabilityScore)}`}>
                          {Math.round(variant.metrics.readabilityScore * 100)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Heart className="w-3 h-3 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">Emotional</div>
                        <div className={`text-sm font-medium ${getScoreColor(variant.metrics.emotionalImpact)}`}>
                          {Math.round(variant.metrics.emotionalImpact * 100)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">Pacing</div>
                        <div className={`text-sm font-medium ${getScoreColor(variant.metrics.pacingScore)}`}>
                          {Math.round(variant.metrics.pacingScore * 100)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">Engagement</div>
                        <div className={`text-sm font-medium ${getScoreColor(variant.metrics.engagementScore)}`}>
                          {Math.round(variant.metrics.engagementScore * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Count */}
                  {variant.feedback.length > 0 && (
                    <div className="flex items-center space-x-2 mb-4 text-xs text-slate-500 dark:text-slate-500">
                      <Users className="w-3 h-3" />
                      <span>{variant.feedback.length} feedback responses</span>
                    </div>
                  )}

                  {/* Preview & Select Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVariantSelect(variant)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    
                    <button
                      onClick={() => onVariantSelect(variant.script)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Download className="w-4 h-4" />
                      <span>Use This</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Variant Preview */}
      {selectedVariant && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {variants.find(v => v.id === selectedVariant)?.name} Preview
            </h3>
            <button
              onClick={() => setSelectedVariant(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              ×
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            {variants.find(v => v.id === selectedVariant)?.script.content.slice(0, 10).map((element, index) => (
              <div key={index} className="mb-4">
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                  {element.type.replace('-', ' ').toUpperCase()}
                </div>
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
            
            {(variants.find(v => v.id === selectedVariant)?.script.content.length || 0) > 10 && (
              <div className="text-center text-sm text-slate-500 dark:text-slate-500 mt-4">
                ... and {(variants.find(v => v.id === selectedVariant)?.script.content.length || 0) - 10} more elements
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {variants.length === 0 && !isGenerating && (
        <div className="text-center py-12">
          <Split className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No Variants Generated Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Generate script variants to compare different approaches and find the most effective version
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
          A/B Testing Tips
        </h3>
        <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
          <li>• Test different tones (conversational vs. authoritative) to see which resonates better</li>
          <li>• Compare different narrative structures to find the most engaging approach</li>
          <li>• Try variations in pacing to determine the optimal flow for your content</li>
          <li>• Gather feedback from multiple reviewers for more reliable results</li>
          <li>• Focus on one variable at a time for clearer insights</li>
        </ul>
      </div>
    </div>
  );
};