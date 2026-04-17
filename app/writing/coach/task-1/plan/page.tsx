'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvatarStage from '@/components/ui/AvatarStage';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function Task1PlanPage() {
  const router = useRouter();
  const [showExample, setShowExample] = useState(false);
  const [overview, setOverview] = useState('');
  const [keyFeature1, setKeyFeature1] = useState('');
  const [keyFeature2, setKeyFeature2] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step 2 of 4</span>
            <span className="text-sm text-slate-500">Plan Your Response</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full">
            <div className="h-full w-2/4 bg-emerald-600 rounded-full transition-all duration-300" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Let's Plan Before We Write
          </h1>
          <p className="text-lg text-slate-600">
            Good planning makes writing easier. Let's organize your ideas first.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Coach Guidance */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8 space-y-6"
            >
              <div className="flex justify-center">
                <AvatarStage state="thinking" size="medium" showStateLabel={true} />
              </div>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Band 7+ Planning Strategy</h4>
                <ul className="text-sm text-emerald-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Overview sentence first</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>2-3 body paragraphs with specific data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Clear comparisons between groups</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowExample(!showExample)}
                className="w-full px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium text-sm transition-colors"
              >
                {showExample ? 'Hide' : 'Show'} Example Outline
              </button>
            </motion.div>
          </div>

          {/* Right: Planning Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">1. Overview Statement</h3>
              <p className="text-slate-600 mb-4">
                Write one sentence that describes the overall trend or main pattern in the data.
              </p>
              <textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Example: Overall, internet usage increases significantly with younger age groups across all three countries..."
                className="w-full h-24 p-4 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 Tip: Use words like "overall," "generally," "in general" to start
              </p>
            </motion.div>

            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">2. Key Features to Describe</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Key Feature
                  </label>
                  <textarea
                    value={keyFeature1}
                    onChange={(e) => setKeyFeature1(e.target.value)}
                    placeholder="What stands out most? (e.g., Highest/lowest values, biggest differences)"
                    className="w-full h-20 p-4 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Second Key Feature
                  </label>
                  <textarea
                    value={keyFeature2}
                    onChange={(e) => setKeyFeature2(e.target.value)}
                    placeholder="What else is significant? (e.g., Comparisons, trends, patterns)"
                    className="w-full h-20 p-4 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Example Outline Expansion */}
            {showExample && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-purple-50 rounded-2xl shadow-lg border border-purple-200 p-8"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">Example Planning</h3>
                
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-900 mb-2">Overview:</p>
                    <p className="text-slate-700">
                      "Overall, internet usage is highest among younger age groups in all three countries, with usage declining significantly in older demographics."
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-900 mb-2">Body 1 - Highest usage:</p>
                    <p className="text-slate-700">
                      "18-30 age group: Japan 95%, UK 92%, USA 90%. Minimal difference between countries for this demographic."
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-900 mb-2">Body 2 - Decline pattern:</p>
                    <p className="text-slate-700">
                      "Sharp drop in 60+ group: Japan 45%, UK 38%, USA 42%. Steeper decline in UK compared to others."
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Useful Language Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 rounded-2xl border border-blue-200 p-6"
            >
              <h4 className="font-semibold text-blue-900 mb-3">Useful Language for Comparisons</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-medium text-blue-900">Higher values:</p>
                  <p className="text-slate-700">significantly higher, considerably more, far exceeds</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-medium text-blue-900">Lower values:</p>
                  <p className="text-slate-700">substantially lower, notably less, falls below</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-medium text-blue-900">Similar values:</p>
                  <p className="text-slate-700">comparable to, similar level, roughly equal</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-medium text-blue-900">Trends:</p>
                  <p className="text-slate-700">steady increase, gradual decline, sharp drop</p>
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
                onClick={() => router.push('/writing/coach/task-1/understand')}
                variant="ghost"
              >
                ← Back to Understand
              </PrimaryButton>
              
              <PrimaryButton
                onClick={() => router.push('/writing/coach/task-1/write')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Ready to Write →
              </PrimaryButton>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
