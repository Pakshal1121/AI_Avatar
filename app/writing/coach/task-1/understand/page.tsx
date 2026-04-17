'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvatarStage from '@/components/ui/AvatarStage';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function Task1UnderstandPage() {
  const router = useRouter();
  const [showDiagram, setShowDiagram] = useState(false);

  // Sample Task 1 question (graph description)
  const task = {
    type: 'Bar Chart',
    question: 'The chart below shows the percentage of households in different age groups using the internet in three countries in 2021.',
    instruction: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    wordCount: 'Write at least 150 words'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step 1 of 4</span>
            <span className="text-sm text-slate-500">Understand the Task</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full">
            <div className="h-full w-1/4 bg-emerald-600 rounded-full transition-all duration-300" />
          </div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Let's Understand Your Task Together
          </h1>
          <p className="text-lg text-slate-600">
            Before we start writing, let me explain what this question is really asking for
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Avatar & Coach Tips */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8"
            >
              <div className="flex justify-center mb-4">
                <AvatarStage state="speaking" size="medium" showStateLabel={true} />
              </div>
              
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600">
                  I'm here to help you understand exactly what the examiner wants to see
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Coach's Insight</h4>
                <p className="text-sm text-emerald-800">
                  Many students rush into writing without fully understanding the task. Taking time to analyze pays off!
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Task Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* The Task */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Your Task</h2>
                  <p className="text-sm text-emerald-600">{task.type}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-800 leading-relaxed">{task.question}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Instructions:</p>
                  <p className="text-blue-800">{task.instruction}</p>
                  <p className="text-sm text-blue-700 mt-2">
                    <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {task.wordCount}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* What This Question Is Asking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                What This Question Is Really Asking
              </h3>

              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  Let me break down what the examiner wants to see in your response:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-emerald-600 font-bold flex-shrink-0">1.</span>
                    <div>
                      <p className="font-semibold text-emerald-900">Describe the main trend or pattern</p>
                      <p className="text-sm text-emerald-800 mt-1">
                        What's the most obvious thing happening in the data? Start with the big picture.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-emerald-600 font-bold flex-shrink-0">2.</span>
                    <div>
                      <p className="font-semibold text-emerald-900">Select key features</p>
                      <p className="text-sm text-emerald-800 mt-1">
                        You don't need to describe everything. Pick the most significant data points.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-emerald-600 font-bold flex-shrink-0">3.</span>
                    <div>
                      <p className="font-semibold text-emerald-900">Make comparisons</p>
                      <p className="text-sm text-emerald-800 mt-1">
                        Compare between countries, age groups, or time periods. Use comparative language.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-emerald-600 font-bold flex-shrink-0">4.</span>
                    <div>
                      <p className="font-semibold text-emerald-900">Report objectively</p>
                      <p className="text-sm text-emerald-800 mt-1">
                        Don't give opinions or reasons. Just describe what you see in the data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Keywords to Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Key Words in the Task</h3>
              <p className="text-slate-600 mb-4">
                Pay attention to these important words that tell you exactly what to do:
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg font-semibold border-2 border-yellow-400">
                  Summarise
                </span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg font-semibold border-2 border-yellow-400">
                  Main features
                </span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg font-semibold border-2 border-yellow-400">
                  Make comparisons
                </span>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> "Summarise" means give an overview. Don't try to describe every single detail—focus on what's most important.
                </p>
              </div>
            </motion.div>

            {/* Common Mistakes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Common Mistakes to Avoid
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 text-xl flex-shrink-0">✗</span>
                  <div>
                    <p className="font-semibold text-amber-900">Giving opinions or reasons</p>
                    <p className="text-sm text-amber-800">
                      Wrong: "Young people use the internet more <em>because</em> they are tech-savvy"
                    </p>
                    <p className="text-sm text-emerald-700 mt-1">
                      ✓ Right: "Young people have higher internet usage rates"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 text-xl flex-shrink-0">✗</span>
                  <div>
                    <p className="font-semibold text-amber-900">Describing every single data point</p>
                    <p className="text-sm text-amber-800">
                      You don't need to list every percentage. Focus on trends and key comparisons.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 text-xl flex-shrink-0">✗</span>
                  <div>
                    <p className="font-semibold text-amber-900">Copying the question word-for-word</p>
                    <p className="text-sm text-amber-800">
                      Paraphrase the question in your introduction. Show language flexibility.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI-Generated Diagram Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg border-2 border-purple-200 p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Visual Example
                </h3>
                <button
                  onClick={() => setShowDiagram(!showDiagram)}
                  className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  {showDiagram ? 'Hide' : 'Show'} Example
                </button>
              </div>

              {showDiagram ? (
                <div className="bg-white rounded-lg border-2 border-dashed border-purple-300 p-12 text-center">
                  <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-purple-700 font-medium mb-2">AI-Generated Chart Example</p>
                  <p className="text-sm text-purple-600">
                    Placeholder for sample bar chart visualization showing data distribution
                  </p>
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg text-left">
                    <p className="text-xs text-purple-800">
                      <strong>Note for developers:</strong> This section will display AI-generated diagrams or annotated examples to help visual learners understand the data structure.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 text-sm">
                  Click "Show Example" to see a visual breakdown of how to analyze this type of chart
                </p>
              )}
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between items-center pt-4"
            >
              <PrimaryButton
                onClick={() => router.push('/writing/coach')}
                variant="ghost"
              >
                ← Back to Setup
              </PrimaryButton>
              
              <PrimaryButton
                onClick={() => router.push('/writing/coach/task-1/plan')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                I Understand – Let's Plan →
              </PrimaryButton>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
