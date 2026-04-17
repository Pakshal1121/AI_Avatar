'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { CheckCircle2, Clock, Headphones, BookOpen, Zap, BarChart3, ArrowRight } from 'lucide-react';

export default function ListeningModulePage() {
  useRequireAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          IELTS Listening Practice
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Use Coach Mode for a real-time interactive session with your AI coach Mia.
          Examiner Mode is coming soon.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-16"
      >
        <Image
          src="/images/coach-avatar.png"
          alt="AI Coach Avatar"
          width={420}
          height={420}
          className="rounded-2xl shadow-xl"
          priority
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="relative bg-white rounded-2xl p-8 border-2 border-slate-200 opacity-60 cursor-not-allowed h-full">
            <div className="absolute -top-3 right-6 bg-slate-900 text-white text-xs px-3 py-1 rounded-full">
              Coming soon
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Examiner Mode</h2>
                <p className="text-sm text-slate-500 font-medium">Full timed test simulation</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Simulate the full IELTS Listening test — all four sections, 30 minutes,
              strict timing, and a final band score.
            </p>
            <div className="space-y-2 mb-6">
              {[
                [Clock, '30-minute timed test'],
                [BarChart3, 'Official band score'],
                [Headphones, '4 sections · 40 questions'],
              ].map(([Icon, label]: any) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-500">
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="text-slate-400 text-sm">This mode will be enabled soon.</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/listening/coach">
            <div className="group relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 border-2 border-emerald-200 hover:border-emerald-500 transition-all duration-300 hover:shadow-xl cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                  <BookOpen className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Coach Mode</h2>
                  <p className="text-sm text-emerald-600 font-medium">Live AI coaching with Mia</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Mia, your AI coach, runs a live interactive session — she teaches strategies,
                narrates the passage with her real voice, and gives personalised feedback on
                every answer.
              </p>
              <div className="space-y-2 mb-6">
                {[
                  [BookOpen, 'Real ANAM avatar coach'],
                  [Zap, 'Real-time voice interaction'],
                  [Clock, 'Self-paced, section by section'],
                ].map(([Icon, label]: any) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-slate-700">
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-emerald-200">
                <span className="text-sm font-medium text-slate-500">Sections 1 – 4</span>
                <div className="flex items-center gap-2 text-emerald-600 font-medium group-hover:gap-3 transition-all">
                  <span>Start with Mia</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-16 text-center"
      >
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 max-w-3xl mx-auto">
          <p className="text-sm text-emerald-900">
            <strong>How Coach Mode works:</strong> Mia introduces the section, teaches 3 key
            strategies → shows you the questions to preview → narrates the passage aloud with
            her real avatar voice → asks each question → gives full answer-by-answer feedback.
            Just like a personal IELTS tutor.
          </p>
        </div>
      </motion.div>
    </div>
  );
}