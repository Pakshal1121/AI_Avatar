'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BookOpen, Eye, Search, Target, Clock, Lightbulb, CheckCircle2, ArrowRight, Brain, User, FileText, Layers, Link as LinkIcon, CheckSquare, ArrowLeft, X } from 'lucide-react'

// ============================================
// FLOATING COACHING SIDEBAR - PROFESSIONAL
// ============================================
const FloatingCoachingSidebar = () => {
  return (
    <div className="hidden lg:block fixed top-[180px] left-20 w-80 z-30">
      <div className="sticky top-[180px]">
        <motion.div
          className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 max-h-[calc(100vh-200px)] overflow-y-auto"
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
            <p className="text-emerald-600 font-semibold">Passage 2 - Work Context</p>
          </div>

          {/* Coach Ready Box */}
          <div className="p-6 bg-emerald-50 border-b-2 border-emerald-100">
            <p className="text-center text-sm text-emerald-900 font-semibold mb-2">
              Your coach is ready to help
            </p>
            <p className="text-center text-xs text-emerald-700 leading-relaxed">
              Focus on identifying main ideas and understanding paragraph organization
            </p>
          </div>

          {/* Coaching Tip Box */}
          <div className="p-6 bg-blue-50">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-sm mb-2">Coaching Tip</p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Passage 2 requires understanding main ideas, not just facts. Practice matching headings to master this skill.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function Passage2CoachPage() {
  const router = useRouter()
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set())

  const allStrategies = [
    {
      id: 'skimming',
      title: 'Skimming for Main Ideas',
      icon: Eye,
      description: 'Identify the main theme of each paragraph',
      details: [
        'Read the first and last sentence of each paragraph carefully',
        'Look for topic sentences that state the main idea',
        'Identify supporting ideas vs. main ideas',
        'Practice distinguishing between details and core concepts',
        'Essential for Matching Headings questions in Passage 2'
      ],
      tip: 'Passage 2 tests your ability to understand paragraph structure and main ideas. Don\'t get distracted by details - focus on the BIG picture of each paragraph.',
      example: 'For Matching Headings in Passage 2, skim each paragraph and ask: "What is the ONE main point here?" Ignore examples and details.',
      color: 'emerald'
    },
    {
      id: 'scanning',
      title: 'Scanning for Features',
      icon: Search,
      description: 'Locate specific information and features',
      details: [
        'Scan for proper nouns: names, places, organizations',
        'Look for dates, years, and time periods',
        'Identify key figures and their contributions',
        'Match features to correct categories',
        'Information may be scattered throughout the passage'
      ],
      tip: 'Passage 2 often requires matching features (people, dates, places) to information. Scan carefully - the answers might not be in order!',
      example: 'If matching researchers to their discoveries, scan for all names first, then read around each name to understand their contribution.',
      color: 'teal'
    },
    {
      id: 'inference',
      title: 'Understanding Arguments',
      icon: Target,
      description: 'Follow complex arguments and relationships',
      details: [
        'Pay attention to cause-and-effect relationships',
        'Understand comparisons and contrasts',
        'Follow multi-step arguments across paragraphs',
        'Identify the writer\'s perspective on topics',
        'Connect ideas that span multiple paragraphs'
      ],
      tip: 'Passage 2 introduces more complex text structure. You need to understand how ideas connect and relate to each other.',
      example: 'Yes/No/Not Given questions in Passage 2 test whether you understand the writer\'s claims and opinions, not just facts.',
      color: 'green'
    },
    {
      id: 'vocabulary',
      title: 'Academic Vocabulary',
      icon: BookOpen,
      description: 'Handle academic and technical terms',
      details: [
        'Recognize more sophisticated paraphrasing',
        'Understand academic collocations',
        'Deal with subject-specific terminology',
        'Use context for complex vocabulary',
        'Build domain-specific word knowledge'
      ],
      tip: 'Passage 2 uses more academic vocabulary than Passage 1. Focus on understanding synonyms and how questions paraphrase the passage.',
      example: 'The question might say "researchers" while the passage says "scientists" or "scholars." Passage 2 tests your ability to recognize these connections.',
      color: 'lime'
    }
  ]

  const questionTypes = [
    {
      type: 'Matching Headings',
      strategy: 'Skim each paragraph for its main idea, not details. Cross off headings as you use them.',
      commonMistake: 'Matching based on repeated words instead of main ideas',
      tip: 'This is THE most common question type in Passage 2! Read each paragraph carefully to identify its core theme. Extra headings are included to confuse you - focus on the BIG idea, not small details.',
      difficulty: 'Very Common in Passage 2'
    },
    {
      type: 'Yes / No / Not Given (Opinion-based)',
      strategy: 'Identify the writer\'s views and claims, not just facts. Look for opinion markers.',
      commonMistake: 'Confusing NO with NOT GIVEN, or using personal knowledge',
      tip: 'Unlike Passage 1 (True/False/Not Given about facts), Passage 2 tests the WRITER\'S OPINION. Look for words like "believe," "claim," "argue," "suggest." NO means the writer disagrees, NOT GIVEN means the writer hasn\'t expressed that view.',
      difficulty: 'Very Common in Passage 2'
    },
    {
      type: 'Matching Features',
      strategy: 'Scan for names, dates, or categories first. Then read around them to match information.',
      commonMistake: 'Not reading carefully around the features',
      tip: 'Common in Passage 2! You might match: researchers to their discoveries, dates to events, or places to characteristics. Answers are usually NOT in order. Some features might be used twice or not at all.',
      difficulty: 'Very Common in Passage 2'
    },
    {
      type: 'Matching Sentence Endings',
      strategy: 'Read the sentence starter, understand its meaning, then scan for the logical ending.',
      commonMistake: 'Not checking if the combined sentence makes grammatical sense',
      tip: 'Read the beginning of the sentence carefully and think about what would logically follow. Eliminate endings that don\'t make grammatical or logical sense.',
      difficulty: 'Common in Passage 2'
    },
    {
      type: 'Multiple Choice (Complex)',
      strategy: 'Read the question and all options carefully. Eliminate obviously wrong answers first.',
      commonMistake: 'Choosing options with exact words from the passage',
      tip: 'Passage 2 multiple choice tests deeper understanding. The correct answer is often paraphrased. Be careful of "distractors" - wrong answers that use words from the passage to confuse you.',
      difficulty: 'Common in Passage 2'
    },
    {
      type: 'Summary/Note Completion (Selective)',
      strategy: 'Understand which section of the passage the summary covers. Fill gaps in order.',
      commonMistake: 'Thinking the summary covers the whole passage',
      tip: 'In Passage 2, summaries usually cover only ONE section, not the entire passage. Read the summary first to understand the context, then scan for the specific section it summarizes.',
      difficulty: 'Common in Passage 2'
    }
  ]

  const practiceChecklist = [
    'Can skim paragraphs to identify main ideas vs. supporting details',
    'Successfully match paragraph headings by understanding core themes',
    'Distinguish between YES/NO/NOT GIVEN based on writer\'s opinions',
    'Scan and match features (people, dates, places) to information',
    'Recognize complex paraphrasing and academic synonyms',
    'Follow arguments that span multiple paragraphs',
    'Complete matching sentence endings with grammatical accuracy',
    'Finish Passage 2 questions in 18-20 minutes with good accuracy'
  ]

  const toggleTip = (tip: string) => {
    const newCompleted = new Set(completedTips)
    if (newCompleted.has(tip)) {
      newCompleted.delete(tip)
    } else {
      newCompleted.add(tip)
    }
    setCompletedTips(newCompleted)
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
      {/* ============================================ */}
      {/* FLOATING COACHING SIDEBAR - PROFESSIONAL */}
      {/* ============================================ */}
      <FloatingCoachingSidebar />

      {/* Header */}
      <motion.header 
        className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/reading/coach')}
            className="text-slate-600 hover:text-slate-900 mb-4 flex items-center gap-2 transition-colors"
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
                <h1 className="text-4xl font-bold text-slate-900">Reading Coach - Passage 2</h1>
                <p className="text-lg text-slate-600">Work-related context (moderate difficulty)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/reading/coach/passage1')}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold transition-colors"
              >
                Passage 1
              </button>
              <button
                onClick={() => router.push('/reading/coach/passage2')}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
              >
                Passage 2
              </button>
              <button
                onClick={() => router.push('/reading/coach/passage3')}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold transition-colors"
              >
                Passage 3
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-[450px] py-12">
        {/* AI Coach Introduction */}
        <motion.div
          className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-8 mb-12 border-2 border-emerald-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start gap-6">
            <div className="bg-emerald-600 w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-emerald-900 mb-3">
                Welcome to Passage 2 Coaching! 📚
              </h2>
              <p className="text-emerald-800 leading-relaxed mb-3">
                <strong>Passage 2</strong> is the middle passage with <strong>moderate difficulty</strong>. 
                It features more academic content with clear structure but requires you to understand 
                <strong> main ideas, paragraph organization, and writer's opinions</strong> - not just scan for facts.
              </p>
              <p className="text-emerald-800 leading-relaxed">
                The most common question type here is <strong>Matching Headings</strong>, which tests your ability 
                to identify the main theme of each paragraph. You'll also see Yes/No/Not Given (opinion-based) and 
                Matching Features questions. Budget <strong>18-20 minutes</strong> for this passage.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Essential Strategies Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-emerald-600" />
            <h2 className="text-3xl font-bold text-slate-900">Essential Strategies for Passage 2</h2>
          </div>
          
          <p className="text-slate-600 mb-8 text-lg">
            Master these four core strategies to excel at Passage 2. Click any card to learn more.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {allStrategies.map((strategy) => {
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
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStrategy(null)}
              />
              
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
                    const strategy = allStrategies.find(s => s.id === selectedStrategy)
                    if (!strategy) return null
                    
                    const Icon = strategy.icon
                    const colors = getColorClasses(strategy.color)
                    
                    return (
                      <>
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
                        
                        <div className="p-8">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 p-5 mb-6 rounded-r-xl">
                            <p className="text-blue-900">
                              <strong className="flex items-center gap-2 mb-2 text-lg">
                                <Lightbulb className="w-5 h-5" />
                                Passage 2 Tip:
                              </strong>
                              {strategy.tip}
                            </p>
                          </div>

                          <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <CheckCircle2 className={`w-5 h-5 ${colors.icon}`} />
                            Key Steps:
                          </h4>
                          <ul className="space-y-3 mb-6">
                            {strategy.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full ${colors.iconBg} ${colors.icon} flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm`}>
                                  {idx + 1}
                                </div>
                                <p className="text-slate-700 leading-relaxed">{detail}</p>
                              </li>
                            ))}
                          </ul>

                          <div className="bg-slate-100 p-5 rounded-xl border-2 border-slate-200">
                            <p className="text-sm font-bold text-slate-900 mb-2">Example:</p>
                            <p className="text-slate-700">{strategy.example}</p>
                          </div>
                          
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

        {/* Question Types Guide */}
        <section className="mb-12">
          <motion.h2 
            className="text-3xl font-bold text-slate-900 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Passage 2 Question Types & Strategies
          </motion.h2>
          <motion.div
            className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50 border-b border-emerald-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Question Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Best Strategy</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Pro Tip for Passage 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {questionTypes.map((qt, index) => (
                    <motion.tr
                      key={index}
                      className="hover:bg-emerald-50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{qt.type}</div>
                        <div className="text-xs text-red-600 mt-1">⚠️ {qt.commonMistake}</div>
                        <div className="text-xs text-emerald-600 mt-1 font-medium">✓ {qt.difficulty}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{qt.strategy}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <Brain className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-emerald-700 text-sm">{qt.tip}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        {/* Interactive Practice Checklist */}
        <section className="mb-12">
          <motion.h2 
            className="text-3xl font-bold text-slate-900 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Your Passage 2 Practice Checklist
          </motion.h2>
          <motion.div
            className="bg-white rounded-xl p-8 border-2 border-slate-200 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-slate-600 mb-6">
              Track your progress! Click each skill when you feel confident with it:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {practiceChecklist.map((item, index) => {
                const isCompleted = completedTips.has(item)
                return (
                  <motion.div
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                    }`}
                    onClick={() => toggleTip(item)}
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
                <strong>{completedTips.size} of {practiceChecklist.length}</strong> skills mastered
              </p>
              {completedTips.size === practiceChecklist.length && (
                <motion.p
                  className="text-emerald-600 font-semibold mt-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  🎉 Excellent! You're ready for Passage 2 practice tests!
                </motion.p>
              )}
            </div>
          </motion.div>
        </section>

        {/* Sample Reading Exercise */}
        <section className="mb-12">
          <motion.h2 
            className="text-3xl font-bold text-slate-900 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Try It Yourself: Matching Headings Practice
          </motion.h2>
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-8 border-2 border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Practice: The Impact of Urbanization (Passage 2 Style)
            </h3>
            <div className="bg-white p-6 rounded-lg mb-6 border border-slate-200 space-y-4">
              <div>
                <p className="font-bold text-slate-900 mb-2">Paragraph A</p>
                <p className="text-slate-700 leading-relaxed">
                  Cities around the world are expanding at an unprecedented rate. By 2050, experts predict that 
                  nearly 70% of the global population will live in urban areas. This rapid growth presents both 
                  opportunities and challenges for city planners and residents alike. While urbanization can drive 
                  economic growth, it also strains infrastructure and resources.
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-2">Paragraph B</p>
                <p className="text-slate-700 leading-relaxed">
                  One of the most pressing concerns is the environmental impact. Urban areas consume vast amounts 
                  of energy and produce significant greenhouse gas emissions. Green spaces are often sacrificed for 
                  development, leading to loss of biodiversity. Many cities are now implementing sustainable 
                  practices to mitigate these effects.
                </p>
              </div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-600">
              <p className="font-semibold text-emerald-900 mb-4">Matching Headings Practice:</p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-emerald-800 font-semibold mb-2">List of Headings:</p>
                  <ul className="space-y-1 text-slate-700">
                    <li>i. The speed and scale of city growth</li>
                    <li>ii. Solutions to urban problems</li>
                    <li>iii. Environmental consequences of cities</li>
                    <li>iv. Economic benefits of urbanization</li>
                  </ul>
                </div>

                <div>
                  <p className="text-emerald-800 font-semibold">Match headings to Paragraph A and B</p>
                  <details className="cursor-pointer mt-2">
                    <summary className="text-emerald-700 font-semibold hover:text-emerald-900">
                      Click to see the answer →
                    </summary>
                    <div className="mt-2 text-emerald-800 bg-white p-4 rounded-lg space-y-2">
                      <p><strong>Paragraph A: i (The speed and scale of city growth)</strong></p>
                      <p className="text-sm">The main idea is about rapid urbanization and growth rates. Don't be distracted by "economic growth" mentioned as a supporting detail!</p>
                      <p><strong>Paragraph B: iii (Environmental consequences of cities)</strong></p>
                      <p className="text-sm">The main theme is environmental impact - energy use, emissions, biodiversity loss. "Sustainable practices" is mentioned but is a supporting point, not the main idea.</p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Next Steps */}
        <motion.section
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready for the Final Challenge?</h2>
          <p className="text-emerald-100 text-lg mb-6">
            You've conquered Passage 2! Now tackle Passage 3 - the most challenging passage with complex arguments 
            and analytical thinking required.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-md"
              onClick={() => router.push('/reading/coach/passage3')}
            >
              <span className="flex items-center gap-2">
                Learn Passage 3 Strategies
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
            <button
              className="bg-emerald-800 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-900 transition-all transform hover:scale-105 shadow-md"
              onClick={() => router.push('/reading/examiner')}
            >
              <span className="flex items-center gap-2">
                Take Full Practice Test
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  )
}