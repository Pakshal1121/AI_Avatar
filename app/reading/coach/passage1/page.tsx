'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  BookOpen,
  Eye,
  Search,
  Target,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  AlertTriangle,
  User,
  X
} from 'lucide-react'

// ============================================
// FLOATING COACHING SIDEBAR - PROFESSIONAL
// ============================================
const FloatingCoachingSidebar = () => {
  return (
    <div className="hidden lg:block w-80 flex-shrink-0">
      {/* Sticky container — stops at header (top-[100px]) and won't bleed into footer */}
      <div className="sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-lg border-2 border-slate-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center text-center p-8 border-b-2 border-slate-100">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg mb-4">
              <User className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Reading Coach</h3>
            <p className="text-emerald-600 font-semibold">Passage 1 - Factual Reading</p>
          </div>

          {/* Coach Ready Box */}
          <div className="p-6 bg-emerald-50 border-b-2 border-emerald-100">
            <p className="text-center text-sm text-emerald-900 font-semibold mb-2">
              Your coach is ready to help
            </p>
            <p className="text-center text-xs text-emerald-700 leading-relaxed">
              Focus on scanning for facts and following instructions carefully
            </p>
          </div>

          {/* Coaching Tip Box */}
          <div className="p-6 bg-blue-50 rounded-b-2xl">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-sm mb-2">Coaching Tip</p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Passage 1 is about speed and accuracy. Aim to complete it in 15-17 minutes to save time for harder passages.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function Passage1CoachPage() {
  const router = useRouter()
  const [completedChecklist, setCompletedChecklist] = useState<Set<string>>(new Set())
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)

  const strategies = [
    {
      id: 'skimming',
      title: 'Skimming for Main Ideas',
      icon: Eye,
      description: 'Quickly identify the main theme and purpose of the passage',
      details: [
        'Read the title, headings, and first sentences of each paragraph',
        'Look for repeated words or themes throughout the text',
        'Pay attention to the introduction and conclusion',
        'Don\'t read every word - focus on getting the general idea',
        'Time goal: 2-3 minutes for the entire passage'
      ],
      color: 'emerald'
    },
    {
      id: 'scanning',
      title: 'Scanning for Specific Details',
      icon: Search,
      description: 'Locate specific information like names, dates, and numbers',
      details: [
        'Know exactly what you\'re looking for before you start',
        'Use your finger or cursor to guide your eyes quickly',
        'Look for capital letters (names, places), numbers, and dates',
        'Don\'t read everything - your eyes should jump to keywords',
        'Practice scanning backwards and forwards through the text'
      ],
      color: 'teal'
    },
    {
      id: 'instructions',
      title: 'Following Instructions Carefully',
      icon: Target,
      description: 'Pay close attention to word limits and question requirements',
      details: [
        'Always check word limits: "NO MORE THAN TWO WORDS"',
        'Copy spelling exactly from the passage - no changes',
        'Make sure your answer fits grammatically in the sentence',
        'Use words from the passage, not your own words',
        'Double-check you\'ve answered what was actually asked'
      ],
      color: 'green'
    },
    {
      id: 'question-types',
      title: 'Understanding Question Types',
      icon: FileText,
      description: 'Master the different question formats in Passage 1',
      details: [
        'True/False/Not Given: FALSE contradicts, NOT GIVEN isn\'t mentioned',
        'Short Answer: Stay within word limit, copy exact spelling',
        'Completion: Check grammar - does your answer fit naturally?',
        'Table/Diagram: Understand the structure before scanning',
        'Multiple Choice: Look for paraphrased meanings, not exact words'
      ],
      color: 'lime'
    }
  ]

  const questionTypesTable = [
    {
      type: 'True / False / Not Given',
      commonMistake: 'Confusing FALSE with NOT GIVEN',
      frequency: 'Very Common in Passage 1',
      strategy: 'Scan for the statement and compare meaning carefully',
      tip: 'FALSE means the passage contradicts the statement. NOT GIVEN means the passage does not mention this information at all.'
    },
    {
      type: 'Short Answer Questions',
      commonMistake: 'Exceeding the word limit or misspelling',
      frequency: 'Very Common in Passage 1',
      strategy: 'Scan for exact information and copy words from passage',
      tip: 'If the limit is "NO MORE THAN TWO WORDS," your answer must be 1 or 2 words only. Copy spelling EXACTLY from the passage.'
    },
    {
      type: 'Summary / Sentence Completion',
      commonMistake: 'Choosing words that don\'t fit grammatically',
      frequency: 'Common in Passage 1',
      strategy: 'Read the sentence, scan for missing detail, check grammar',
      tip: 'Your answer must fit both MEANING and GRAMMAR. Read the sentence out loud to check if it sounds natural.'
    },
    {
      type: 'Table / Diagram / Note Completion',
      commonMistake: 'Ignoring the type of word required',
      frequency: 'Common in Passage 1',
      strategy: 'Understand the structure first, then scan for specific details',
      tip: 'Check if the gap needs a noun, number, verb, or adjective. This helps you scan more accurately for the right information.'
    },
    {
      type: 'Multiple Choice Questions',
      commonMistake: 'Choosing answers with matching words instead of matching meaning',
      frequency: 'Occasional in Passage 1',
      strategy: 'Read the question, scan for relevant section, eliminate wrong answers',
      tip: 'The correct answer is often paraphrased. Don\'t just look for exact word matches - look for synonyms and similar meanings.'
    },
    {
      type: 'Matching Information to Paragraphs',
      commonMistake: 'Not checking all paragraphs for each statement',
      frequency: 'Occasional in Passage 1',
      strategy: 'Skim paragraphs, note main topics, then match information',
      tip: 'Some paragraphs may have multiple answers, some may have none. Answers are NOT in order - check all paragraphs.'
    }
  ]

  const practiceChecklist = [
    'Can skim a Passage 1 text in under 3 minutes',
    'Can scan accurately for names, dates, and numbers',
    'Clearly understand the difference between FALSE and NOT GIVEN',
    'Always follow word limits strictly (NO MORE THAN TWO WORDS, etc.)',
    'Copy spelling EXACTLY from the passage',
    'Check that my answers fit grammatically in completion questions',
    'Look for synonyms and paraphrasing, not just exact word matches',
    'Can complete Passage 1 in 15–17 minutes confidently'
  ]

  const practiceExercise = {
    title: 'Try It Yourself: Passage 1 Practice',
    instructions: 'Read this sample Passage 1 text and answer the questions to practice your skills.',
    passage: `
      <h3>The City Museum</h3>
      <p>The City Museum opened in 1995 and has since become one of the most popular tourist attractions in the region. Located in the heart of downtown, the museum welcomes over 200,000 visitors annually. The building itself is a restored 19th-century warehouse that was converted into a modern exhibition space.</p>
      
      <p>The museum houses three main collections: historical artifacts, contemporary art, and interactive science exhibits. The historical collection features items dating back to the city's founding in 1842. Visitors can explore the daily lives of early settlers through photographs, tools, and personal belongings.</p>
      
      <p>Entry to the museum is free on the first Sunday of every month. Standard adult tickets cost $15, while students and seniors receive a 25% discount. Children under 12 can enter for free when accompanied by an adult. The museum is open from 9 AM to 6 PM Tuesday through Sunday, and is closed on Mondays.</p>
      
      <p>The museum offers guided tours in English and Spanish every hour. Group bookings for schools and organizations must be made at least two weeks in advance. Special educational programs for children aged 6-14 run during school holidays.</p>
    `,
    questions: [
      {
        type: 'Short Answer',
        question: 'When did the City Museum open?',
        answer: '1995'
      },
      {
        type: 'True/False/Not Given',
        question: 'The museum building was originally a warehouse.',
        answer: 'TRUE'
      },
      {
        type: 'True/False/Not Given',
        question: 'The museum has the largest art collection in the country.',
        answer: 'NOT GIVEN'
      },
      {
        type: 'Sentence Completion (NO MORE THAN TWO WORDS)',
        question: 'The museum is closed on _______.',
        answer: 'Mondays'
      },
      {
        type: 'Multiple Choice',
        question: 'How much would a student pay for a ticket?',
        options: ['$15', '$11.25', '$7.50', 'Free'],
        answer: '$11.25 (25% discount of $15)'
      }
    ]
  }

  const toggleChecklist = (item: string) => {
    const updated = new Set(completedChecklist)
    updated.has(item) ? updated.delete(item) : updated.add(item)
    setCompletedChecklist(updated)
  }

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50',
        hover: 'hover:border-emerald-300 hover:shadow-emerald-100',
        icon: 'text-emerald-600',
        iconBg: 'bg-emerald-100'
      },
      teal: {
        border: 'border-teal-200',
        bg: 'bg-teal-50',
        hover: 'hover:border-teal-300 hover:shadow-teal-100',
        icon: 'text-teal-600',
        iconBg: 'bg-teal-100'
      },
      green: {
        border: 'border-green-200',
        bg: 'bg-green-50',
        hover: 'hover:border-green-300 hover:shadow-green-100',
        icon: 'text-green-600',
        iconBg: 'bg-green-100'
      },
      lime: {
        border: 'border-lime-200',
        bg: 'bg-lime-50',
        hover: 'hover:border-lime-300 hover:shadow-lime-100',
        icon: 'text-lime-700',
        iconBg: 'bg-lime-100'
      }
    }
    return colors[color as keyof typeof colors] || colors.emerald
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      {/* Header */}
      <motion.header
        className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/reading/coach')}
            className="text-slate-600 hover:text-slate-900 mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Selection
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Reading Coach – Passage 1</h1>
                <p className="text-lg text-slate-600">Factual & straightforward (easiest passage)</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold">
                Passage 1
              </button>
              <button
                onClick={() => router.push('/reading/coach/passage2')}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold"
              >
                Passage 2
              </button>
              <button
                onClick={() => router.push('/reading/coach/passage3')}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold"
              >
                Passage 3
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ============================================ */}
      {/* FLEX LAYOUT: Sidebar + Main Content          */}
      {/* The sidebar lives INSIDE the content flow     */}
      {/* so sticky positioning works correctly.        */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex gap-8">
        {/* Sidebar — in-flow, sticky within this flex row */}
        <FloatingCoachingSidebar />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Intro */}
          <motion.div
            className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-8 mb-12 border-2 border-emerald-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-start gap-6">
              <div className="bg-emerald-600 w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-3">
                  Welcome to Passage 1 Coaching! 👋
                </h2>
                <p className="text-emerald-800 leading-relaxed mb-2">
                  Passage 1 is designed to test your ability to find factual information quickly and accurately.
                  It's the easiest of the three passages, with straightforward topics and clear language.
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  Focus on <strong>speed</strong>, <strong>scanning</strong>, and <strong>following instructions carefully</strong>. 
                  Aim to finish this passage in <strong>15–17 minutes</strong> to save time for harder passages.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Essential Strategies Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-slate-900">Essential Strategies for Passage 1</h2>
            </div>
            
            <p className="text-slate-600 mb-8 text-lg">
              Master these four core strategies to excel at Passage 1. Click any card to learn more.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {strategies.map((strategy) => {
                const Icon = strategy.icon
                const colors = getColorClasses(strategy.color)
                
                return (
                  <motion.div
                    key={strategy.id}
                    className={`bg-white rounded-xl p-6 border-2 ${colors.border} cursor-pointer transition-all ${colors.hover} shadow-sm`}
                    onClick={() => setSelectedStrategy(strategy.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${colors.iconBg} p-3 rounded-lg flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg mb-2">{strategy.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{strategy.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* Strategy Modal with Blur Effect */}
          <AnimatePresence>
            {selectedStrategy && (
              <>
                {/* Backdrop Blur */}
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedStrategy(null)}
                />
                
                {/* Modal Card */}
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedStrategy(null)}
                >
                  <motion.div
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    initial={{ scale: 0.8, rotateY: -15 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    exit={{ scale: 0.8, rotateY: 15 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(() => {
                      const strategy = strategies.find(s => s.id === selectedStrategy)
                      if (!strategy) return null
                      
                      const Icon = strategy.icon
                      const colors = getColorClasses(strategy.color)
                      
                      return (
                        <>
                          {/* Header */}
                          <div className={`${colors.bg} p-6 border-b-2 ${colors.border}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`${colors.iconBg} p-4 rounded-xl`}>
                                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                                    {strategy.title}
                                  </h3>
                                  <p className="text-slate-600">{strategy.description}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedStrategy(null)}
                                className="text-slate-400 hover:text-slate-600 transition"
                              >
                                <X className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-8">
                            <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                              <CheckCircle2 className={`w-5 h-5 ${colors.icon}`} />
                              Key Steps:
                            </h4>
                            <ul className="space-y-3">
                              {strategy.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <div className={`w-6 h-6 rounded-full ${colors.iconBg} ${colors.icon} flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm`}>
                                    {idx + 1}
                                  </div>
                                  <p className="text-slate-700 leading-relaxed">{detail}</p>
                                </li>
                              ))}
                            </ul>
                            
                            <div className="mt-6 pt-6 border-t border-slate-200">
                              <button
                                onClick={() => setSelectedStrategy(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition"
                              >
                                Got it! Close
                              </button>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Question Types Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-slate-900">Passage 1 Question Types & Strategies</h2>
            </div>
            
            <p className="text-slate-600 mb-8">
              Here are the most common question types in Passage 1 with strategies to tackle each one effectively.
            </p>

            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-teal-50 border-b-2 border-teal-100">
                      <th className="text-left p-6 font-bold text-teal-900 text-lg">Question Type</th>
                      <th className="text-left p-6 font-bold text-teal-900 text-lg">Best Strategy</th>
                      <th className="text-left p-6 font-bold text-teal-900 text-lg">Pro Tip for Passage 1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionTypesTable.map((row, idx) => (
                      <tr key={idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="p-6 align-top">
                          <div className="font-bold text-slate-900 mb-3">{row.type}</div>
                          <div className="flex items-start gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-600">{row.commonMistake}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-emerald-600 font-medium">{row.frequency}</span>
                          </div>
                        </td>
                        <td className="p-6 align-top">
                          <p className="text-slate-700 leading-relaxed">{row.strategy}</p>
                        </td>
                        <td className="p-6 align-top">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                            <p className="text-teal-700 leading-relaxed">{row.tip}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Practice Checklist */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-slate-900">Your Passage 1 Practice Checklist</h2>
            </div>
            
            <div className="bg-white rounded-xl p-8 border-2 border-slate-200 shadow-sm">
              <p className="text-slate-600 mb-6">
                Track your progress! Click each skill when you feel confident with it:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {practiceChecklist.map((item, index) => {
                  const isCompleted = completedChecklist.has(item)
                  return (
                    <motion.div
                      key={index}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                      }`}
                      onClick={() => toggleChecklist(item)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {isCompleted && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`${isCompleted ? 'text-emerald-900 font-medium' : 'text-slate-700'}`}>
                        {item}
                      </span>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-6 text-center">
                <p className="text-slate-600">
                  <strong>{completedChecklist.size} of {practiceChecklist.length}</strong> skills mastered
                </p>
                {completedChecklist.size === practiceChecklist.length && (
                  <motion.p
                    className="text-emerald-600 font-semibold mt-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    🎉 Excellent! You're ready for Passage 1 practice tests!
                  </motion.p>
                )}
              </div>
            </div>
          </section>

          {/* Try It Yourself Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-slate-900">Try It Yourself: Passage 1 Practice</h2>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
              {/* Instructions */}
              <div className="bg-blue-50 p-6 border-b-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Practice Instructions</h3>
                    <p className="text-blue-800">
                      Read the passage below and try to answer the questions. This simulates a real Passage 1 
                      experience. Time yourself - aim for 15-17 minutes total!
                    </p>
                  </div>
                </div>
              </div>

              {/* Passage */}
              <div className="p-8 border-b-2 border-slate-200">
                <div 
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: practiceExercise.passage }}
                />
              </div>

              {/* Questions */}
              <div className="p-8 bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Practice Questions</h3>
                <div className="space-y-6">
                  {practiceExercise.questions.map((q, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-1">{q.type}</p>
                          <p className="font-medium text-slate-900">{q.question}</p>
                          {q.options && (
                            <ul className="mt-3 space-y-2">
                              {q.options.map((opt, i) => (
                                <li key={i} className="text-slate-700">
                                  {String.fromCharCode(65 + i)}. {opt}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <details className="mt-4">
                        <summary className="text-sm text-emerald-600 cursor-pointer hover:text-emerald-700 font-medium">
                          Show Answer & Explanation
                        </summary>
                        <div className="mt-3 p-4 bg-emerald-50 rounded-lg">
                          <p className="text-emerald-900">
                            <strong>Answer:</strong> {q.answer}
                          </p>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom CTA Box */}
          <motion.div
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-10 text-white shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-3">Ready for the Next Challenge?</h2>
            <p className="text-emerald-50 text-lg mb-8">
              You've mastered Passage 1! Now tackle Passage 2 - work-related texts with moderate complexity.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/reading/coach/passage2')}
                className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition flex items-center gap-2"
              >
                Learn Passage 2 Strategies
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/reading/examiner')}
                className="px-8 py-4 bg-emerald-800 text-white rounded-xl font-semibold hover:bg-emerald-900 transition flex items-center gap-2"
              >
                <Clock className="w-5 h-5" />
                Take Full Practice Test
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}