'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvatarStage from '@/components/ui/AvatarStage';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function Task2WritePage() {
  const router = useRouter();
  const [essay, setEssay] = useState('');
  const wordCount = essay.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step 3 of 4</span>
            <span className="text-sm text-slate-500">Write Your Essay</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full">
            <div className="h-full w-3/4 bg-emerald-600 rounded-full transition-all duration-300" />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Now Let's Write Your Essay</h1>
          <p className="text-lg text-slate-600">
            Use your plan to guide you. I'm here if you need help with ideas or structure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <div className="flex justify-center mb-4">
                <AvatarStage state="idle" size="medium" showStateLabel={false} />
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Writing Tips</h4>
                <ul className="text-xs text-emerald-800 space-y-2">
                  <li>✓ Clear thesis statement</li>
                  <li>✓ Discuss both views</li>
                  <li>✓ Give your opinion</li>
                  <li>✓ Use examples</li>
                  <li>✓ Link paragraphs</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200 p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Your Essay</h3>
                <span className={`text-sm font-medium ${wordCount >= 250 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {wordCount} / 250 words {wordCount >= 250 && '✓'}
                </span>
              </div>

              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Start writing your essay here...

Remember your plan:
• Introduction with clear thesis
• Body paragraph 1: First viewpoint
• Body paragraph 2: Second viewpoint  
• Body paragraph 3: Your opinion
• Conclusion: Summarize without new ideas"
                className="w-full h-96 p-6 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none text-slate-800 leading-relaxed"
              />

              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <strong>Coach's Note:</strong> Focus on communicating your ideas clearly. We'll review and improve together afterwards.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <PrimaryButton onClick={() => router.push('/writing/coach/task-2/plan')} variant="ghost">
                ← Back
              </PrimaryButton>
              <PrimaryButton
                onClick={() => router.push('/writing/coach/task-2/feedback')}
                disabled={wordCount < 100}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {wordCount < 100 ? 'Write at least 100 words' : 'Get Feedback →'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
