'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AvatarStage from '@/components/ui/AvatarStage';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function Task2FeedbackPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step 4 of 4</span>
            <span className="text-sm text-slate-500">Coach Feedback</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full">
            <div className="h-full w-full bg-emerald-600 rounded-full transition-all duration-300" />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Let's Review Your Essay Together</h1>
          <p className="text-lg text-slate-600">
            I'll explain what's working well and how to make it even better
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <div className="flex justify-center mb-4">
                <AvatarStage state="thinking" size="medium" showStateLabel={true} />
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Feedback Focus</h4>
                <p className="text-xs text-emerald-800">
                  I analyze: task response, coherence, vocabulary, grammar, and development of ideas.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Overall Impression</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You've made a strong attempt at addressing the question. You discussed both viewpoints and gave your opinion, which is exactly what the task requires.
              </p>
              <p className="text-slate-700 leading-relaxed">
                To reach the next level, let's focus on developing your ideas more fully, using stronger linking phrases, and varying your sentence structures.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-emerald-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">What's Working Well</h3>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-900 mb-2">✓ Clear structure</p>
                  <p className="text-sm text-emerald-800">
                    Your essay follows a logical progression: introduction, both views, your opinion, conclusion.
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-900 mb-2">✓ Task addressed</p>
                  <p className="text-sm text-emerald-800">
                    You discussed both viewpoints and gave your opinion, fulfilling the task requirements.
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-900 mb-2">✓ Relevant examples</p>
                  <p className="text-sm text-emerald-800">
                    You included real-world examples to support your points, which strengthens your argument.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">How to Reach the Next Level</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">1. Develop ideas more fully</p>
                  <p className="text-sm text-slate-700 mb-2">
                    Instead of: "Technology makes communication easier."
                  </p>
                  <p className="text-sm text-slate-700 mb-2">
                    Try: "Technology has revolutionized communication by enabling instant global connectivity. For instance, video calling platforms allow families separated by continents to maintain close relationships, something impossible just decades ago."
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Why this is better:</strong> It explains HOW technology helps, gives a specific example, and shows the significance.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">2. Use stronger linking phrases</p>
                  <p className="text-sm text-slate-700 mb-2">
                    Instead of: "However" for every contrast
                  </p>
                  <p className="text-sm text-slate-700 mb-2">
                    Try: "On the other hand," "Conversely," "Nevertheless," "Despite this"
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Why this matters:</strong> Variety in linking phrases shows language range and makes your essay flow better.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">3. Vary sentence structures</p>
                  <p className="text-sm text-slate-700 mb-2">
                    Mix simple, compound, and complex sentences. Use: relative clauses, conditionals, passive voice where appropriate.
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Why this matters:</strong> Sentence variety is a key criterion in grammatical range and accuracy.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h4 className="font-semibold text-emerald-900 mb-3">What to Focus On Next</h4>
              <div className="space-y-2 text-sm text-emerald-800">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Rewrite this essay using the feedback above</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Practice with different essay types (agree/disagree, advantages/disadvantages)</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Build your academic vocabulary and linking phrase repertoire</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <PrimaryButton onClick={() => router.push('/writing/coach/task-2/write')} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Rewrite & Improve
              </PrimaryButton>
              <PrimaryButton onClick={() => router.push('/writing/examiner')} variant="secondary" className="flex-1">
                Try Examiner Mode
              </PrimaryButton>
              <PrimaryButton onClick={() => router.push('/writing/coach')} variant="ghost" className="flex-1">
                Start New Task
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
