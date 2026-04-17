'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function SpeakingModulePage() {
  useRequireAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          IELTS Speaking Practice
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Choose your practice mode: test yourself like the real exam, or learn with a personal coach.
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
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Examiner Mode — Coming soon */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="group relative bg-white rounded-2xl p-8 border-2 border-slate-200 opacity-60 cursor-not-allowed h-full">
            <div className="absolute top-4 right-4 bg-slate-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Coming Soon
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Examiner Mode
            </h2>
            <p className="text-slate-600">
              Real test simulation with band score evaluation.
            </p>
          </div>
        </motion.div>

        {/* Coach Mode — Active */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/speaking/coach">
            <div className="group relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 border-2 border-emerald-200 hover:border-emerald-500 transition-all duration-300 hover:shadow-xl cursor-pointer h-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Coach Mode
              </h2>
              <p className="text-slate-600 mb-6">
                Learn and improve with your AI speaking coach Mia.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-medium group-hover:gap-3 transition-all">
                <span>Start Coaching</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
