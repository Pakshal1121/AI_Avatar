'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  FileText,
  BarChart3,
  BookOpen,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function ReadingModulePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          IELTS Reading Practice
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Use Examiner mode for real test simulation (available now). Reading Coach is coming soon.
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
          alt="Reading Coach Avatar"
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
        >
          <Link href="/reading/examiner">
            <div className="group relative bg-white rounded-2xl p-8 border-2 border-blue-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <CheckCircle2 className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Examiner Mode
                  </h2>
                  <p className="text-sm text-blue-600 font-medium">
                    Real test simulation
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-6 leading-relaxed">
                Simulate the real IELTS Reading test with three passages, strict timing, and exam-style questions.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>60-minute timed test</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Official IELTS format</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Band score evaluation</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-sm font-medium text-slate-500">
                  3 passages · 40 questions
                </span>
                <div className="flex items-center gap-2 text-blue-700 font-semibold group-hover:gap-3 transition-all">
                  <span>Start Test</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
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
                <BookOpen className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Coach Mode
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Learn & improve
                </p>
              </div>
            </div>

            <p className="text-slate-600 mb-6 leading-relaxed">
              Learn how to master skimming, scanning, and question strategies with step-by-step guidance.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <BookOpen className="w-5 h-5 text-slate-500" />
                <span>Personal AI reading coach</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Zap className="w-5 h-5 text-slate-500" />
                <span>Instant strategy feedback</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Clock className="w-5 h-5 text-slate-500" />
                <span>Self-paced learning</span>
              </div>
            </div>

            <div className="text-slate-500 text-sm">
              This mode will be enabled soon.
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-16 text-center"
      >
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 max-w-3xl mx-auto">
          <p className="text-sm text-blue-900">
            <strong>Not sure which mode?</strong> Start with Examiner Mode to practice under real exam conditions. Coach Mode will be added soon.
          </p>
        </div>
      </motion.div>
    </div>
  );
}