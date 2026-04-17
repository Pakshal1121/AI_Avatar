'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvatarStage from '@/components/ui/AvatarStage';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function Task1FeedbackPage() {
  const router = useRouter();
  const [showImproved, setShowImproved] = useState(false);

  // Mock user essay for demonstration
  const userEssay = "The chart shows internet usage across different age groups in three countries. Younger people use the internet more than older people. In Japan, 95% of 18-30 year olds use the internet. This is higher than the UK where 92% use it. The 60+ age group has much lower usage.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step 4 of 4</span>
            <span className="text-sm text-slate-500">Coach Feedback</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full">
            <div className="h-full w-full bg-emerald-600 rounded-full transition-all duration-300" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Let's Review Your Writing Together
          </h1>
          <p className="text-lg text-slate-600">
            I'll explain what's working well and how to make it even better
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Avatar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8"
            >
              <div className="flex justify-center mb-4">
                <AvatarStage state="thinking" size="medium" showStateLabel={true} />
              </div>
              
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600">
                  I've analyzed your response and I'm ready to help you improve
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Feedback Philosophy</h4>
                <p className="text-xs text-emerald-800">
                  I focus on explaining <em>why</em> things work and <em>how</em> to improve, not just pointing out mistakes.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Feedback Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Essay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-2xl border border-slate-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Your Response</h3>
              <div className="bg-white rounded-lg p-6 border border-slate-300">
                <p className="text-slate-800 leading-relaxed">{userEssay}</p>
              </div>
              <p className="text-sm text-slate-500 mt-2">83 words</p>
            </motion.div>

            {/* Overall Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border-2 border-emerald-200 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Overall Impression</h3>
              </div>

              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed mb-4">
                  You've made a good start! You've identified the main trend (younger people use internet more) and included some specific data. This shows you understand what the task is asking for.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  To reach the next level, let's focus on three key areas: expanding your overview, making more detailed comparisons, and using a wider range of vocabulary.
                </p>
              </div>
            </motion.div>

            {/* What's Working Well */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-emerald-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                What's Working Well
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-900 mb-2">✓ Clear main trend identified</p>
                  <p className="text-sm text-slate-700 mb-2">
                    "Younger people use the internet more than older people"
                  </p>
                  <p className="text-sm text-emerald-800">
                    <strong>Why this works:</strong> You've successfully identified the overall pattern. This gives your response a clear focus.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-900 mb-2">✓ Specific data included</p>
                  <p className="text-sm text-slate-700 mb-2">
                    "In Japan, 95% of 18-30 year olds use the internet"
                  </p>
                  <p className="text-sm text-emerald-800">
                    <strong>Why this works:</strong> You're supporting your description with actual numbers from the data, not just vague statements.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-900 mb-2">✓ Comparison attempted</p>
                  <p className="text-sm text-slate-700 mb-2">
                    "This is higher than the UK where 92% use it"
                  </p>
                  <p className="text-sm text-emerald-800">
                    <strong>Why this works:</strong> You're making comparisons between countries, which is exactly what the task asks for.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* How to Reach the Next Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                How to Reach the Next Level
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">1. Expand your overview</p>
                  <p className="text-sm text-slate-700 mb-3">
                    <strong>Current:</strong> "Younger people use the internet more"
                  </p>
                  <p className="text-sm text-slate-700 mb-3">
                    <strong>Improved:</strong> "Overall, internet usage is highest among the 18-30 age group across all three countries, declining significantly in older demographics, with the steepest drop observed in the 60+ category."
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Why this is better:</strong> It captures the <em>trend</em>, not just a single observation. It also mentions all age groups and the pattern of decline.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">2. Make more detailed comparisons</p>
                  <p className="text-sm text-slate-700 mb-3">
                    <strong>Current:</strong> "The 60+ age group has much lower usage"
                  </p>
                  <p className="text-sm text-slate-700 mb-3">
                    <strong>Improved:</strong> "The 60+ demographic shows markedly lower usage, with Japan at 45%, the UK at 38%, and the USA at 42%, representing roughly half the usage rates of the youngest cohort."
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Why this is better:</strong> It includes <em>all three countries</em> with specific figures and makes a mathematical comparison (half the usage).
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">3. Vary your vocabulary</p>
                  <p className="text-sm text-slate-700 mb-3">
                    You used "higher" and "lower" several times. Try alternatives:
                  </p>
                  <ul className="text-sm text-slate-700 space-y-1 ml-4">
                    <li>• Instead of "higher": considerably greater, significantly more, exceeds</li>
                    <li>• Instead of "lower": substantially less, notably fewer, falls below</li>
                    <li>• Instead of "shows": demonstrates, exhibits, displays</li>
                  </ul>
                  <p className="text-sm text-blue-800 mt-3">
                    <strong>Why this matters:</strong> Using synonyms shows language range and makes your writing more sophisticated.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Improved Example */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg border-2 border-purple-200 p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Improved Version Example</h3>
                <button
                  onClick={() => setShowImproved(!showImproved)}
                  className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  {showImproved ? 'Hide' : 'Show'} Example
                </button>
              </div>

              {showImproved && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-6 border-2 border-purple-300">
                    <p className="text-slate-800 leading-relaxed">
                      The chart illustrates internet usage patterns across three age demographics in Japan, the UK, and the USA during 2021. <span className="bg-purple-100">Overall, internet usage is highest among the 18-30 age group across all three nations, declining significantly in older demographics.</span>
                    </p>
                    <p className="text-slate-800 leading-relaxed mt-4">
                      <span className="bg-purple-100">The youngest cohort demonstrates remarkably high usage rates,</span> with Japan leading at 95%, followed closely by the UK at 92% and the USA at 90%. The similarity between these figures suggests that internet adoption among young adults is nearly universal regardless of country.
                    </p>
                    <p className="text-slate-800 leading-relaxed mt-4">
                      <span className="bg-purple-100">In contrast, the 60+ demographic exhibits substantially lower engagement,</span> with usage rates roughly half those of the youngest group. The UK shows the steepest decline at 38%, while Japan and the USA maintain comparatively higher levels at 45% and 42% respectively.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-100 rounded-lg">
                    <p className="text-sm text-purple-900">
                      <strong>Highlighted sections</strong> show improved vocabulary, clearer structure, and more detailed comparisons. Notice how each paragraph has a clear focus and uses varied language.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-6"
            >
              <h4 className="font-semibold text-emerald-900 mb-3">What to Focus On Next</h4>
              <div className="space-y-2 text-sm text-emerald-800">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Try rewriting this response using the feedback above</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Practice with different chart types (line graphs, pie charts)</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Build your vocabulary list of comparison and trend words</span>
                </div>
              </div>
            </motion.div>

            {/* AI Integration Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6"
            >
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-indigo-900 mb-1">
                    AI Integration Point
                  </p>
                  <p className="text-sm text-indigo-800">
                    This feedback will be generated in real-time by AI, analyzing the user's actual writing for: task achievement, vocabulary range, grammatical accuracy, coherence, and providing paragraph-by-paragraph explanations with specific examples from their text.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <PrimaryButton
                onClick={() => router.push('/writing/coach/task-1/write')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Rewrite & Improve
              </PrimaryButton>
              <PrimaryButton
                onClick={() => router.push('/writing/examiner')}
                variant="secondary"
                className="flex-1"
              >
                Try Examiner Mode
              </PrimaryButton>
              <PrimaryButton
                onClick={() => router.push('/writing/coach')}
                variant="ghost"
                className="flex-1"
              >
                Start New Task
              </PrimaryButton>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
