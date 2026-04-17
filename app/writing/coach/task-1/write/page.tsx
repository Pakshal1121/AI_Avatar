'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvatarStage from '@/components/ui/AvatarStage';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function Task1WritePage() {
  const router = useRouter();
  const [essay, setEssay] = useState('');
  const [showVocab, setShowVocab] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const wordCount = essay.trim().split(/\s+/).filter(word => word.length > 0).length;

  // Placeholder vocabulary suggestions
  const vocabSuggestions = [
    { category: 'Comparatives', words: ['significantly higher', 'considerably more', 'marginally lower'] },
    { category: 'Trends', words: ['steady increase', 'gradual decline', 'sharp drop', 'remain stable'] },
    { category: 'Data Description', words: ['account for', 'represent', 'constitute', 'comprise'] },
  ];

  // Placeholder example sentences
  const exampleSentences = [
    { context: 'Starting overview', example: 'The chart illustrates the distribution of internet usage across three age demographics...' },
    { context: 'Making comparisons', example: 'In contrast to the younger cohort, the 60+ age group showed significantly lower usage rates...' },
    { context: 'Describing trends', example: 'Internet usage declined steadily as age increased, with the most pronounced drop occurring...' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step 3 of 4</span>
            <span className="text-sm text-slate-500">Write Your Response</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full">
            <div className="h-full w-3/4 bg-emerald-600 rounded-full transition-all duration-300" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Now Let's Write Your Response
          </h1>
          <p className="text-lg text-slate-600">
            Use your plan to guide you. I'm here if you need help with vocabulary or structure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar: Avatar & Quick Tips */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8 space-y-6"
            >
              <div className="flex justify-center">
                <AvatarStage state="idle" size="medium" showStateLabel={false} />
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-600">
                  I'm here while you write. Take your time!
                </p>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Writing Reminders</h4>
                <ul className="text-xs text-emerald-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Start with overview</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Use specific data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Make comparisons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Stay objective</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setShowVocab(!showVocab)}
                  className="w-full px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium text-sm transition-colors"
                >
                  {showVocab ? 'Hide' : 'Show'} Vocabulary Help
                </button>
                
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium text-sm transition-colors"
                >
                  {showExamples ? 'Hide' : 'Show'} Example Sentences
                </button>
              </div>
            </motion.div>
          </div>

          {/* Center: Writing Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Writing Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200 p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Your Response</h3>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${
                    wordCount >= 150 ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    {wordCount} / 150 words {wordCount >= 150 && '✓'}
                  </span>
                </div>
              </div>

              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Start writing your response here...

Remember your plan:
• Overview statement
• Key feature 1 with data
• Key feature 2 with comparisons
• Objective description"
                className="w-full h-96 p-6 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none text-slate-800 leading-relaxed"
              />

              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <strong>Coach's Note:</strong> Don't worry about being perfect. Focus on communicating your ideas clearly. We'll review together afterwards.
                </p>
              </div>
            </motion.div>

            {/* Paragraph Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h4 className="font-semibold text-slate-900 mb-3 text-sm">Suggested Structure</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Introduction with overview</p>
                    <p className="text-xs text-slate-500">1-2 sentences</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Body paragraph 1</p>
                    <p className="text-xs text-slate-500">Key feature with specific data</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Body paragraph 2</p>
                    <p className="text-xs text-slate-500">Comparisons and trends</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between items-center pt-4"
            >
              <PrimaryButton
                onClick={() => router.push('/writing/coach/task-1/plan')}
                variant="ghost"
              >
                ← Back to Plan
              </PrimaryButton>
              
              <PrimaryButton
                onClick={() => router.push('/writing/coach/task-1/feedback')}
                disabled={wordCount < 50}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {wordCount < 50 ? 'Write at least 50 words' : 'Get Feedback →'}
              </PrimaryButton>
            </motion.div>
          </div>

          {/* Right Sidebar: Help Panels */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vocabulary Suggestions */}
            <AnimatePresence>
              {showVocab && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-purple-50 rounded-xl border border-purple-200 p-6"
                >
                  <h4 className="font-semibold text-purple-900 mb-4">Vocabulary Suggestions</h4>
                  <div className="space-y-4">
                    {vocabSuggestions.map((category, index) => (
                      <div key={index}>
                        <p className="text-xs font-medium text-purple-700 mb-2">{category.category}</p>
                        <div className="flex flex-wrap gap-2">
                          {category.words.map((word, wordIndex) => (
                            <span key={wordIndex} className="px-2 py-1 bg-white text-purple-800 rounded text-xs border border-purple-200">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <p className="text-xs text-purple-800">
                      <strong>AI Integration Point:</strong> Real-time vocabulary suggestions based on context
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Example Sentences */}
            <AnimatePresence>
              {showExamples && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-blue-50 rounded-xl border border-blue-200 p-6"
                >
                  <h4 className="font-semibold text-blue-900 mb-4">Example Sentences</h4>
                  <div className="space-y-4">
                    {exampleSentences.map((item, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-700 mb-1">{item.context}</p>
                        <p className="text-xs text-slate-700 italic">"{item.example}"</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>AI Integration Point:</strong> Context-aware example sentences
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Coach Hints - Always Visible */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-amber-50 rounded-xl border border-amber-200 p-6"
            >
              <h4 className="font-semibold text-amber-900 mb-3">Coach Hints</h4>
              <div className="space-y-3 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p>Include specific numbers from the data</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p>Use "while" or "whereas" to show contrast</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p>Remember: No opinions, just describe</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>AI Integration Point:</strong> Dynamic hints based on user's writing progress
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
