'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvatarStage from '@/components/ui/AvatarStage';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function Task2PlanPage() {
  const router = useRouter();
  const [thesis, setThesis] = useState('');
  const [body1, setBody1] = useState('');
  const [body2, setBody2] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step 2 of 4</span>
            <span className="text-sm text-slate-500">Plan Your Essay</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full">
            <div className="h-full w-2/4 bg-emerald-600 rounded-full transition-all duration-300" />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Let's Plan Your Essay Structure</h1>
          <p className="text-lg text-slate-600">
            A clear plan makes writing much easier. Let's organize your ideas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <div className="flex justify-center mb-4">
                <AvatarStage state="thinking" size="medium" showStateLabel={true} />
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Essay Structure</h4>
                <ul className="text-sm text-emerald-800 space-y-2">
                  <li>• Intro with thesis</li>
                  <li>• Body 1: First view</li>
                  <li>• Body 2: Second view</li>
                  <li>• Body 3: Your opinion</li>
                  <li>• Conclusion</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">1. Your Thesis Statement</h3>
              <p className="text-slate-600 mb-4">State the topic and your overall position in 1-2 sentences.</p>
              <textarea
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                placeholder="Example: While technology has undoubtedly complicated certain aspects of modern life, I believe its benefits in terms of communication and efficiency far outweigh the drawbacks..."
                className="w-full h-24 p-4 border-2 border-slate-300 rounded-lg focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">2. Body Paragraphs</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">View 1: Technology complicates life</label>
                  <textarea
                    value={body1}
                    onChange={(e) => setBody1(e.target.value)}
                    placeholder="Main reasons and examples..."
                    className="w-full h-20 p-4 border-2 border-slate-300 rounded-lg focus:border-emerald-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">View 2: Technology makes life easier</label>
                  <textarea
                    value={body2}
                    onChange={(e) => setBody2(e.target.value)}
                    placeholder="Main reasons and examples..."
                    className="w-full h-20 p-4 border-2 border-slate-300 rounded-lg focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <PrimaryButton onClick={() => router.push('/writing/coach/task-2/understand')} variant="ghost">
                ← Back
              </PrimaryButton>
              <PrimaryButton onClick={() => router.push('/writing/coach/task-2/write')} className="bg-emerald-600 hover:bg-emerald-700">
                Ready to Write →
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
