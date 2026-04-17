'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function WritingModulePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          IELTS Writing Practice
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Use Examiner mode for band scoring (available now). Writing Coach is coming soon.
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
        >
          <Link href="/writing/examiner">
            <div className="group relative bg-white rounded-2xl p-8 border-2 border-blue-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Examiner Mode
                  </h2>
                  <p className="text-sm text-blue-600 font-medium">
                    Band scoring + feedback
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-6 leading-relaxed">
                Submit your Task 1 or Task 2 response and get an overall band + criterion-level feedback.
              </p>

              <div className="flex items-center text-blue-700 font-semibold">
                Start evaluation
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
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
                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.761 0-5 2.239-5 5v5h10v-5c0-2.761-2.239-5-5-5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Coach Mode
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Guided writing improvements
                </p>
              </div>
            </div>

            <p className="text-slate-600 mb-6 leading-relaxed">
              Step-by-step planning, structure, and vocabulary coaching for Task 1 and Task 2.
            </p>

            <div className="text-slate-500 text-sm">
              This mode will be enabled soon.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}