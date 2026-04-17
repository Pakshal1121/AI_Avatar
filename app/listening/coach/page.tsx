'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { generateRoomId } from '@/app/livekit/lib/client-utils';
import { Users, Mic, BookOpen, Headphones } from 'lucide-react';

const SECTIONS = [
  {
    id: 'section1',
    label: 'Section 1',
    subtitle: 'Social conversation',
    description:
      'Two speakers in an everyday social context — hotel booking, phone enquiry, appointment scheduling.',
    icon: <Users className="w-6 h-6" />,
    difficulty: 'Easy',
    difficultyColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'section2',
    label: 'Section 2',
    subtitle: 'Social monologue',
    description:
      'One speaker giving practical information — a tour guide, local facility announcement, orientation speech.',
    icon: <Mic className="w-6 h-6" />,
    difficulty: 'Medium',
    difficultyColor: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'section3',
    label: 'Section 3',
    subtitle: 'Educational conversation',
    description:
      'Two to four people in an academic context — university tutorial, student project discussion.',
    icon: <BookOpen className="w-6 h-6" />,
    difficulty: 'Medium',
    difficultyColor: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'section4',
    label: 'Section 4',
    subtitle: 'Academic lecture',
    description:
      'A single lecturer delivering an academic talk on a specific topic — the hardest section.',
    icon: <Headphones className="w-6 h-6" />,
    difficulty: 'Hard',
    difficultyColor: 'text-amber-600 bg-amber-50 border-amber-200',
  },
];

export default function ListeningCoachPage() {
  useRequireAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleStart = () => {
    if (!selected) return;
    const roomName = `listening-${selected}-${generateRoomId()}`;
    router.push(`/listening/room/${roomName}?section=${selected}`);
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
            Choose Your Section
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Mia will join you in a live session — she teaches strategies, narrates
            the passage with her real voice, and gives personalised feedback.
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

        {/* Section Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
        >
          {SECTIONS.map((sec) => (
            <motion.button
              key={sec.id}
              onClick={() => setSelected(sec.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                selected === sec.id
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                    selected === sec.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {sec.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-bold text-lg ${
                        selected === sec.id ? 'text-emerald-900' : 'text-slate-900'
                      }`}
                    >
                      {sec.label}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sec.difficultyColor}`}
                    >
                      {sec.difficulty}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-medium mb-1 ${
                      selected === sec.id ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {sec.subtitle}
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${
                      selected === sec.id ? 'text-emerald-800' : 'text-slate-600'
                    }`}
                  >
                    {sec.description}
                  </p>
                  {selected === sec.id && (
                    <div className="mt-3 flex items-center gap-2 text-emerald-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <PrimaryButton
            size="large"
            disabled={!selected}
            onClick={handleStart}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
          >
            {selected
              ? `Start ${SECTIONS.find((s) => s.id === selected)?.label} with Mia`
              : 'Select a Section to Continue'}
          </PrimaryButton>
        </motion.div>

        {/* What to expect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-emerald-50 border border-emerald-200 rounded-lg p-6 max-w-3xl mx-auto"
        >
          <div className="flex gap-3">
            <svg
              className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-emerald-900 mb-2">What to expect</p>
              <ol className="text-sm text-emerald-800 space-y-1">
                <li>
                  <strong>1. Strategies</strong> — Mia teaches 3 key strategies specific to
                  your chosen section
                </li>
                <li>
                  <strong>2. Preview</strong> — You see and hear the questions before the
                  passage (just like the real exam)
                </li>
                <li>
                  <strong>3. Passage</strong> — Mia narrates the full audio passage with her
                  real avatar voice
                </li>
                <li>
                  <strong>4. Q&amp;A</strong> — Mia asks each question, you answer by voice
                </li>
                <li>
                  <strong>5. Feedback</strong> — Full answer-by-answer explanation with score
                </li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}