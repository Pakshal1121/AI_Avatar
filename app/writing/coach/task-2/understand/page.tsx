'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvatarStage from '@/components/ui/AvatarStage';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function Task2UnderstandPage() {
  const router = useRouter();

  const task = {
    type: 'Opinion Essay',
    question: 'Some people believe that technology has made our lives more complicated. Others think it has made life easier. Discuss both views and give your own opinion.',
    instruction: 'Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
    wordCount: 'Write at least 250 words'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step 1 of 4</span>
            <span className="text-sm text-slate-500">Understand the Task</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full">
            <div className="h-full w-1/4 bg-emerald-600 rounded-full transition-all duration-300" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Let's Understand Your Essay Question
          </h1>
          <p className="text-lg text-slate-600">
            Before we start writing, let me break down what this question is asking
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8"
            >
              <div className="flex justify-center mb-4">
                <AvatarStage state="speaking" size="medium" showStateLabel={true} />
              </div>
              
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600">
                  I'll help you understand exactly what the examiner wants to see in your essay
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Coach's Insight</h4>
                <p className="text-sm text-emerald-800">
                  This type of question requires balanced discussion AND your personal opinion. Many students forget one part!
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Your Essay Question</h2>
                  <p className="text-sm text-emerald-600">{task.type}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-800 leading-relaxed text-lg">{task.question}</p>
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">What This Question Is Really Asking</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-emerald-600 font-bold flex-shrink-0">1.</span>
                  <div>
                    <p className="font-semibold text-emerald-900">Discuss BOTH viewpoints</p>
                    <p className="text-sm text-emerald-800 mt-1">
                      You must explain why SOME people think technology complicates life AND why OTHERS think it makes life easier.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-emerald-600 font-bold flex-shrink-0">2.</span>
                  <div>
                    <p className="font-semibold text-emerald-900">Give YOUR opinion</p>
                    <p className="text-sm text-emerald-800 mt-1">
                      After discussing both sides, you must state which view you agree with more, or present your own balanced perspective.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-emerald-600 font-bold flex-shrink-0">3.</span>
                  <div>
                    <p className="font-semibold text-emerald-900">Support with reasons and examples</p>
                    <p className="text-sm text-emerald-800 mt-1">
                      Each point needs backing. Use real-life examples, personal experience, or logical reasoning.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Keywords to Notice</h3>
              <p className="text-slate-600 mb-4">
                These words tell you exactly what structure to use:
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg font-semibold border-2 border-yellow-400">
                  Discuss both views
                </span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg font-semibold border-2 border-yellow-400">
                  Give your opinion
                </span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg font-semibold border-2 border-yellow-400">
                  Give reasons
                </span>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> "Discuss both views" means you must present BOTH sides fairly before giving your opinion. Don't just argue for one side!
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Common Mistakes to Avoid</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 text-xl flex-shrink-0">✗</span>
                  <div>
                    <p className="font-semibold text-amber-900">Only discussing one viewpoint</p>
                    <p className="text-sm text-amber-800">
                      You MUST discuss both sides, even if you strongly agree with one.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 text-xl flex-shrink-0">✗</span>
                  <div>
                    <p className="font-semibold text-amber-900">Not stating your opinion clearly</p>
                    <p className="text-sm text-amber-800">
                      Your opinion should be obvious. Use phrases like "In my view," "I believe," "From my perspective."
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 text-xl flex-shrink-0">✗</span>
                  <div>
                    <p className="font-semibold text-amber-900">Making claims without support</p>
                    <p className="text-sm text-amber-800">
                      Don't just say "Technology makes life easier." Explain HOW and give examples.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-between items-center pt-4"
            >
              <PrimaryButton
                onClick={() => router.push('/writing/coach')}
                variant="ghost"
              >
                ← Back to Setup
              </PrimaryButton>
              
              <PrimaryButton
                onClick={() => router.push('/writing/coach/task-2/plan')}
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
