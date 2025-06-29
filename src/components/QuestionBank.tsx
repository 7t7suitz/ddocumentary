import React, { useState } from 'react';
import { 
  MessageSquare, 
  Filter, 
  Search, 
  Edit3, 
  Copy, 
  Trash2, 
  Plus,
  AlertTriangle,
  Clock,
  Heart,
  User,
  FileText,
  Eye,
  Brain,
  Globe
} from 'lucide-react';
import { InterviewQuestion, QuestionCategory } from '../types';
import { checkQuestionSensitivity } from '../utils/questionGenerator';

interface QuestionBankProps {
  questions: InterviewQuestion[];
  onQuestionUpdate: (question: InterviewQuestion) => void;
  onQuestionDelete: (questionId: string) => void;
  onQuestionDuplicate: (question: InterviewQuestion) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({
  questions,
  onQuestionUpdate,
  onQuestionDelete,
  onQuestionDuplicate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [selectedSensitivity, setSelectedSensitivity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedTiming, setSelectedTiming] = useState<'all' | 'early' | 'middle' | 'late'>('all');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  const categories: { value: QuestionCategory | 'all'; label: string; icon: any; color: string }[] = [
    { value: 'all', label: 'All Categories', icon: MessageSquare, color: 'slate' },
    { value: 'personal', label: 'Personal', icon: User, color: 'blue' },
    { value: 'factual', label: 'Factual', icon: FileText, color: 'green' },
    { value: 'emotional', label: 'Emotional', icon: Heart, color: 'red' },
    { value: 'contextual', label: 'Contextual', icon: Globe, color: 'purple' },
    { value: 'reflective', label: 'Reflective', icon: Brain, color: 'amber' },
    { value: 'relationship', label: 'Relationship', icon: User, color: 'pink' },
    { value: 'historical', label: 'Historical', icon: Clock, color: 'indigo' },
    { value: 'cultural', label: 'Cultural', icon: Globe, color: 'emerald' }
  ];

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.context.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    const matchesSensitivity = selectedSensitivity === 'all' || question.sensitivity === selectedSensitivity;
    const matchesTiming = selectedTiming === 'all' || question.timing === selectedTiming;
    
    return matchesSearch && matchesCategory && matchesSensitivity && matchesTiming;
  });

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700';
    }
  };

  const getCategoryColor = (category: QuestionCategory) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.color || 'slate';
  };

  const handleQuestionEdit = (question: InterviewQuestion, newText: string) => {
    const updatedQuestion = { ...question, question: newText };
    onQuestionUpdate(updatedQuestion);
    setEditingQuestion(null);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          No Questions Generated Yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Generate questions from document analysis to build your interview question bank
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
            Question Bank
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filteredQuestions.length} of {questions.length} questions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500 dark:text-slate-500">
            Est. Duration: {Math.round(filteredQuestions.reduce((sum, q) => sum + q.expectedDuration, 0))} min
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          {/* Sensitivity Filter */}
          <select
            value={selectedSensitivity}
            onChange={(e) => setSelectedSensitivity(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
          >
            <option value="all">All Sensitivity Levels</option>
            <option value="low">Low Sensitivity</option>
            <option value="medium">Medium Sensitivity</option>
            <option value="high">High Sensitivity</option>
          </select>
          
          {/* Timing Filter */}
          <select
            value={selectedTiming}
            onChange={(e) => setSelectedTiming(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
          >
            <option value="all">All Timing</option>
            <option value="early">Early Interview</option>
            <option value="middle">Middle Interview</option>
            <option value="late">Late Interview</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, index) => {
          const sensitivityCheck = checkQuestionSensitivity(question);
          const categoryData = categories.find(c => c.value === question.category);
          const CategoryIcon = categoryData?.icon || MessageSquare;
          
          return (
            <div
              key={question.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`
                    p-2 rounded-lg
                    ${categoryData?.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      categoryData?.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                      categoryData?.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                      categoryData?.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      categoryData?.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      'bg-slate-100 dark:bg-slate-700'
                    }
                  `}>
                    <CategoryIcon className={`
                      w-4 h-4
                      ${categoryData?.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        categoryData?.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        categoryData?.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        categoryData?.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        categoryData?.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                        'text-slate-600 dark:text-slate-400'
                      }
                    `} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${categoryData?.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          categoryData?.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          categoryData?.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          categoryData?.color === 'purple' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                          categoryData?.color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }
                      `}>
                        {question.category}
                      </span>
                      
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSensitivityColor(question.sensitivity)}`}>
                        {question.sensitivity} sensitivity
                      </span>
                      
                      <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                        {question.timing} interview
                      </span>
                      
                      <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                        {question.expectedDuration} min
                      </span>
                    </div>
                    
                    {editingQuestion === question.id ? (
                      <div className="space-y-2">
                        <textarea
                          defaultValue={question.question}
                          onBlur={(e) => handleQuestionEdit(question, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleQuestionEdit(question, e.currentTarget.value);
                            }
                            if (e.key === 'Escape') {
                              setEditingQuestion(null);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          rows={2}
                          autoFocus
                        />
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Press Enter to save, Escape to cancel
                        </div>
                      </div>
                    ) : (
                      <h3 
                        className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => setEditingQuestion(question.id)}
                      >
                        {question.question}
                      </h3>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingQuestion(question.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    title="Edit question"
                  >
                    <Edit3 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => onQuestionDuplicate(question)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    title="Duplicate question"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => onQuestionDelete(question.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Question Context */}
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {question.context}
              </div>

              {/* Follow-up Questions */}
              {question.followUps.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Follow-up Questions:
                  </h4>
                  <ul className="space-y-1">
                    {question.followUps.map((followUp, fIndex) => (
                      <li key={fIndex} className="text-sm text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-slate-200 dark:border-slate-600">
                        {followUp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cultural Notes */}
              {question.culturalNotes && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Cultural Considerations
                    </span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {question.culturalNotes}
                  </p>
                </div>
              )}

              {/* Sensitivity Warnings */}
              {sensitivityCheck.issues.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      Sensitivity Alerts
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {sensitivityCheck.issues.map((issue, iIndex) => (
                      <li key={iIndex} className="text-sm text-red-700 dark:text-red-300">
                        • {issue.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Question Metrics */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                <div className="flex items-center space-x-4">
                  <span>Emotional Impact: {Math.round(question.emotionalImpact * 100)}%</span>
                  <span>Narrative Value: {Math.round(question.narrativeValue * 100)}%</span>
                  {question.alternatives.length > 0 && (
                    <span>{question.alternatives.length} alternative{question.alternatives.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <span>Question #{index + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};