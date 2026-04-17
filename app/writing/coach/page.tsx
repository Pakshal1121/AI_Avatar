'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function WritingCoachComingSoonPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12"
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs px-3 py-1 rounded-full mb-4">
            Coming soon
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Writing Coach Mode
          </h1>
          <p className="text-slate-600 mb-8">
            Writing Coach mode is disabled for now. Please use <span className="font-semibold">Examiner Mode</span> for scoring and feedback.
          </p>

          <Link href="/writing">
            <PrimaryButton>Back to Writing</PrimaryButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
