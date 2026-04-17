'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { generateRoomId } from '@/app/livekit/lib/client-utils';

export default function CoachWelcomePage() {
  useRequireAuth();
  const router = useRouter();
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [focusArea, setFocusArea] = useState<string | null>(null);

  const bandOptions = [
    { value: 6, label: 'Band 6', description: 'Competent user' },
    { value: 7, label: 'Band 7', description: 'Good user' },
    { value: 8, label: 'Band 8+', description: 'Very good to expert' },
  ];

  const focusAreas = [
    {
      id: 'fluency',
      label: 'Fluency',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'vocabulary',
      label: 'Vocabulary',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: 'grammar',
      label: 'Grammar',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'confidence',
      label: 'Confidence',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
    },
  ];

  const handleStart = () => {
    if (!targetBand) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'speakingCoachPreferences',
        JSON.stringify({
          targetBand,
          focusArea,
        })
      );
    }
    const roomName = generateRoomId();
    router.push(`/livekit/room/${roomName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Your Personal IELTS Speaking Coach
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Learn strategies, get instant feedback, and build confidence at your own pace.
          </p>
        </motion.div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <Image
            src="/images/coach-avatar.png"
            alt="Coach Avatar"
            width={420}
            height={420}
            className="rounded-2xl shadow-xl"
            priority
          />
        </motion.div>

        {/* Target Band Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              What&apos;s your target band score?
            </h2>
            <p className="text-slate-600">
              This helps personalise your coaching experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bandOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => setTargetBand(option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  targetBand === option.value
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    targetBand === option.value ? 'text-emerald-600' : 'text-slate-700'
                  }`}>
                    {option.label}
                  </div>
                  <p className="text-sm text-slate-600">{option.description}</p>
                  {targetBand === option.value && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-emerald-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Focus Area Selection (Optional) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              What would you like to focus on?
            </h2>
            <p className="text-slate-600">
              Optional – choose one area to emphasise
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {focusAreas.map((area) => (
              <motion.button
                key={area.id}
                onClick={() => setFocusArea(focusArea === area.id ? null : area.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  focusArea === area.id
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`${focusArea === area.id ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {area.icon}
                  </div>
                  <span className={`font-semibold ${focusArea === area.id ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {area.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <PrimaryButton
            size="large"
            disabled={!targetBand}
            onClick={handleStart}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {targetBand ? 'Start Coaching Session' : 'Select Target Band to Continue'}
          </PrimaryButton>

          {targetBand && (
            <p className="mt-4 text-sm text-slate-600">
              Coaching for Band {targetBand}
              {focusArea && ` · Focusing on ${focusArea.charAt(0).toUpperCase() + focusArea.slice(1)}`}
            </p>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-emerald-50 border border-emerald-200 rounded-lg p-6 max-w-3xl mx-auto"
        >
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-emerald-900 mb-1">
                Coach Mode Benefits
              </p>
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>• Get immediate feedback after each answer</li>
                <li>• Learn strategies for each part of the test</li>
                <li>• Practice at your own pace with no pressure</li>
                <li>• Try answers multiple times to improve</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}