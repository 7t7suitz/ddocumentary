import React, { useState } from 'react';
import { 
  ArrowRight, 
  Clock, 
  Heart, 
  TrendingUp, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Download,
  Share2
} from 'lucide-react';
import { ConversationFlow as ConversationFlowType, InterviewQuestion } from '../types';
import { generateConversationFlow } from '../utils/questionGenerator';

interface ConversationFlowProps {
  questions: InterviewQuestion[];
  onFlowUpdate: (flow: ConversationFlowType) => void;
}

export const ConversationFlow: React.FC<ConversationFlowProps> = ({
  questions,
  onFlowUpdate
}) => {
  const [flow, setFlow] = useState<ConversationFlowType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateFlow = async () => {
    setIsGenerating(true);
    try {
      const generatedFlow = generateConversationFlow(questions);
      setFlow(generatedFlow);
      onFlowUpdate(generatedFlow);
    } catch (error) {
      console.error('Flow generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playFlow = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= (flow?.questions.length || 0) - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const resetFlow = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const exportFlow = () => {
    if (!flow) return;
    
    const flowData = {
      title: flow.title,
      description: flow.description,
      estimatedDuration: flow.estimatedDuration,
      questions: flow.questions.map((q, index) => ({
        order: index + 1,
        question: q.question,
        category: q.category,
        timing: q.timing,
        duration: q.expectedDuration,
        followUps: q.followUps,
        context: q.context
      })),
      emotionalArc: flow.emotionalArc,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-flow-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Questions Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Generate interview questions first to create a conversation flow
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Conversation Flow
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Intelligent question sequencing and conversation management
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {flow && (
            <>
              <button
                onClick={isPlaying ? () => setIsPlaying(false) : playFlow}
                className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Preview'}</span>
              </button>
              
              <button
                onClick={resetFlow}
                className="p-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600"
                title="Reset flow"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={exportFlow}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                title="Export flow"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button
            onClick={generateFlow}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            <Settings className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Flow'}</span>
          </button>
        </div>
      </div>

      {flow && (
        <>
          {/* Flow Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {flow.questions.length}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(flow.estimatedDuration)}m
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {Math.round(flow.difficultyLevel * 100)}%
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {flow.emotionalArc.length}
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300">Emotional Beats</div>
              </div>
            </div>
          </div>

          {/* Emotional Arc Visualization */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Emotional Journey
            </h3>
            <div className="relative h-32 bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden">
              <svg className="w-full h-full">
                <defs>
                  <linearGradient id="emotionalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#EF4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                
                {/* Emotional arc line */}
                <path
                  d={`M 0,${128 - flow.emotionalArc[0].intensity * 100} ${flow.emotionalArc.map((beat, index) => 
                    `L ${(index / (flow.emotionalArc.length - 1)) * 100}%,${128 - beat.intensity * 100}`
                  ).join(' ')}`}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
                
                {/* Fill area */}
                <path
                  d={`M 0,128 L 0,${128 - flow.emotionalArc[0].intensity * 100} ${flow.emotionalArc.map((beat, index) => 
                    `L ${(index / (flow.emotionalArc.length - 1)) * 100}%,${128 - beat.intensity * 100}`
                  ).join(' ')} L 100%,128 Z`}
                  fill="url(#emotionalGradient)"
                />
                
                {/* Emotional beat points */}
                {flow.emotionalArc.map((beat, index) => (
                  <circle
                    key={index}
                    cx={`${(index / (flow.emotionalArc.length - 1)) * 100}%`}
                    cy={128 - beat.intensity * 100}
                    r="4"
                    fill="#6366F1"
                    className="drop-shadow-sm"
                  />
                ))}
              </svg>
              
              {/* Emotional labels */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4">
                {flow.emotionalArc.map((beat, index) => (
                  <div key={index} className="text-xs text-slate-600 dark:text-slate-400 text-center">
                    <div className="font-medium">{beat.targetEmotion}</div>
                    <div>{Math.round(beat.intensity * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question Flow */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Question Sequence
            </h3>
            
            <div className="space-y-4">
              {flow.questions.map((question, index) => {
                const isActive = currentStep === index;
                const isPast = currentStep > index;
                const transition = flow.transitions.find(t => t.fromQuestionId === question.id);
                
                return (
                  <div key={question.id} className="relative">
                    <div className={`
                      p-4 rounded-lg border-2 transition-all duration-300
                      ${isActive 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20 shadow-md' 
                        : isPast 
                        ? 'border-green-300 bg-green-50 dark:bg-green-950/20' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700'
                      }
                    `}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${isActive 
                              ? 'bg-blue-500 text-white' 
                              : isPast 
                              ? 'bg-green-500 text-white' 
                              : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                            }
                          `}>
                            {index + 1}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
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
                              
                              <span className={`
                                px-2 py-1 text-xs font-medium rounded-full
                                ${question.sensitivity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                  question.sensitivity === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                }
                              `}>
                                {question.sensitivity}
                              </span>
                            </div>
                            
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">
                              {question.question}
                            </h4>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{question.expectedDuration}m</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {question.context}
                      </div>
                      
                      {question.followUps.length > 0 && (
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          <strong>Follow-ups:</strong> {question.followUps.slice(0, 2).join(', ')}
                          {question.followUps.length > 2 && '...'}
                        </div>
                      )}
                      
                      {question.sensitivity === 'high' && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Handle with extra care and empathy</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Transition Arrow */}
                    {transition && index < flow.questions.length - 1 && (
                      <div className="flex items-center justify-center my-2">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-400">
                          <ArrowRight className="w-3 h-3" />
                          <span>{transition.script}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flow Tips */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">
              Interview Flow Tips
            </h3>
            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <li>• Start with comfortable, low-stakes questions to build rapport</li>
              <li>• Gradually increase emotional intensity as trust develops</li>
              <li>• Use transitions to maintain natural conversation flow</li>
              <li>• Be prepared to adjust based on the interviewee's responses</li>
              <li>• Allow extra time for high-sensitivity questions</li>
              <li>• End with reflective questions that provide closure</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};