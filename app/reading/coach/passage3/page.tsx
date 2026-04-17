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
            <p className="text-emerald-600 font-semibold">Passage 3 - Academic Analysis</p>
          </div>

          {/* Coach Ready Box */}
          <div className="p-6 bg-emerald-50 border-b-2 border-emerald-100">
            <p className="text-center text-sm text-emerald-900 font-semibold mb-2">
              Your coach is ready to help
            </p>
            <p className="text-center text-xs text-emerald-700 leading-relaxed">
              Focus on critical analysis, complex arguments, and nuanced understanding
            </p>
          </div>

          {/* Coaching Tip Box */}
          <div className="p-6 bg-blue-50">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-sm mb-2">Coaching Tip</p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Passage 3 is the most challenging. Take your time to understand nuanced arguments and subtle qualifications in the writer's views.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function Passage3CoachPage() {
  const router = useRouter()
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set())

  const allStrategies = [
    {
      id: 'skimming',
      title: 'Analytical Skimming',
      icon: Eye,
      description: 'Understand complex arguments and structure',
      details: [
        'Identify the writer\'s overall argument and thesis',
        'Understand how paragraphs build upon each other',
        'Recognize counter-arguments and rebuttals',
        'Follow multi-layered reasoning across the passage',
        'Distinguish between claims, evidence, and conclusions'
      ],
      tip: 'Passage 3 presents complex, analytical texts. You need to understand not just WHAT is said, but HOW the argument is constructed and WHY the writer makes specific claims.',
      example: 'When skimming Passage 3, ask: What is the writer\'s main argument? How do they support it? Are there any opposing views discussed?',
      color: 'emerald'
    },
    {
      id: 'scanning',
      title: 'Strategic Scanning',
      icon: Search,
      description: 'Locate information in complex texts',
      details: [
        'Scan for abstract concepts, not just concrete facts',
        'Look for synonyms of sophisticated vocabulary',
        'Identify where key arguments are developed',
        'Find connections between ideas across paragraphs',
        'Recognize heavily paraphrased information'
      ],
      tip: 'Passage 3 requires advanced scanning - you\'re looking for complex ideas that might be expressed very differently from the question. Don\'t expect simple keyword matches!',
      example: 'A question asking about "financial incentives" might be answered in a paragraph discussing "economic motivation" or "monetary rewards." Passage 3 tests deep paraphrasing.',
      color: 'teal'
    },
    {
      id: 'inference',
      title: 'Critical Analysis',
      icon: Target,
      description: 'Make inferences and understand implications',
      details: [
        'Read between the lines - understand implied meanings',
        'Evaluate the strength of arguments presented',
        'Understand nuanced positions and qualifications',
        'Recognize bias, assumptions, and logical relationships',
        'Distinguish between correlation and causation'
      ],
      tip: 'Passage 3 demands critical thinking. You must infer meaning, understand implications, and evaluate arguments - not just identify facts.',
      example: 'If the passage says "While policy X has shown some benefits, critics argue it fails to address root causes," you need to understand BOTH the writer\'s acknowledgment and the criticism.',
      color: 'green'
    },
    {
      id: 'vocabulary',
      title: 'Advanced Academic Vocabulary',
      icon: BookOpen,
      description: 'Handle sophisticated language',
      details: [
        'Understand complex academic and technical terms',
        'Recognize sophisticated paraphrasing and synonyms',
        'Deal with abstract and theoretical concepts',
        'Understand nuanced differences in meaning',
        'Build advanced vocabulary for various academic fields'
      ],
      tip: 'Passage 3 uses the most challenging vocabulary. Context is crucial - use your understanding of the argument to decode unfamiliar terms.',
      example: 'Terms like "paradigm shift," "dichotomy," "empirical," or "antithetical" are common in Passage 3. Understanding these through context is essential.',
      color: 'lime'
    }
  ]

  const questionTypes = [
    {
      type: 'Yes / No / Not Given (Complex)',
      strategy: 'Identify the writer\'s nuanced views and claims. Look for qualifications and subtle positions.',
      commonMistake: 'Missing qualifications like "some," "often," "may" which change meanings',
      tip: 'Passage 3 Y/N/NG questions are the most challenging! The writer\'s view might be qualified or nuanced. "YES" doesn\'t mean the writer strongly agrees - they might acknowledge something with reservations. Read very carefully!',
      difficulty: 'Very Common & Most Difficult'
    },
    {
      type: 'Matching Headings (Complex)',
      strategy: 'Understand abstract main ideas. Paragraphs may present multi-faceted arguments.',
      commonMistake: 'Getting distracted by complex examples instead of identifying core themes',
      tip: 'Passage 3 paragraphs often discuss complex, abstract topics. The heading must capture the MAIN abstract idea, not specific examples. Think conceptually!',
      difficulty: 'Very Common & Very Difficult'
    },
    {
      type: 'Multiple Choice (Analytical)',
      strategy: 'Read all options carefully. Eliminate based on subtle differences in meaning.',
      commonMistake: 'Choosing options that are partially correct but miss key qualifications',
      tip: 'Passage 3 multiple choice tests deep comprehension. ALL options might seem plausible! The correct answer often has subtle but important differences from wrong answers. Read every word carefully.',
      difficulty: 'Very Common & Challenging'
    },
    {
      type: 'Matching Sentence Endings (Complex)',
      strategy: 'Understand complex grammatical structures and logical relationships between ideas.',
      commonMistake: 'Not understanding how the sentence beginning constrains possible endings',
      tip: 'In Passage 3, sentence endings test logical completion of complex ideas. The grammatical structure AND the meaning must both fit perfectly.',
      difficulty: 'Common'
    },
    {
      type: 'Matching Information (Abstract)',
      strategy: 'Scan for paragraphs discussing abstract concepts. Information is heavily paraphrased.',
      commonMistake: 'Looking for concrete keywords instead of understanding concepts',
      tip: 'Passage 3 matching information questions ask you to find paragraphs discussing abstract ideas like "criticism of a theory" or "long-term implications." Think conceptually, not literally!',
      difficulty: 'Common & Difficult'
    },
    {
      type: 'Summary Completion (Complex)',
      strategy: 'Understand the logical flow of complex arguments. Gaps require sophisticated vocabulary.',
      commonMistake: 'Filling gaps based on passage words without checking if they fit the summary logic',
      tip: 'Passage 3 summaries condense complex arguments. Make sure your answer fits both grammatically AND logically in the summary\'s argument flow.',
      difficulty: 'Less Common But Challenging'
    }
  ]

  const practiceChecklist = [
    'Can identify complex arguments and how they\'re structured',
    'Successfully match headings to paragraphs with abstract themes',
    'Distinguish subtle differences in Y/N/NG questions with qualifications',
    'Recognize heavily paraphrased information in complex texts',
    'Make inferences and understand implied meanings',
    'Follow multi-paragraph arguments and counter-arguments',
    'Handle advanced academic vocabulary using context',
    'Complete Passage 3 questions in 20-22 minutes with good accuracy'
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
                <h1 className="text-4xl font-bold text-slate-900">Reading Coach - Passage 3</h1>
                <p className="text-lg text-slate-600">Complex academic text (most challenging)</p>
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
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold transition-colors"
              >
                Passage 2
              </button>
              <button
                onClick={() => router.push('/reading/coach/passage3')}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
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
                Welcome to Passage 3 Coaching! 🎓
              </h2>
              <p className="text-emerald-800 leading-relaxed mb-3">
                <strong>Passage 3</strong> is the most challenging passage, designed to test your 
                <strong> critical thinking and analytical skills</strong>. It features complex arguments, 
                sophisticated vocabulary, abstract concepts, and nuanced positions that require deep comprehension.
              </p>
              <p className="text-emerald-800 leading-relaxed mb-3">
                Unlike Passages 1 and 2, you can't rely on simple scanning or surface-level reading. You must 
                <strong> understand how arguments are constructed</strong>, recognize subtle qualifications, 
                make inferences, and distinguish between similar but distinct ideas.
              </p>
              <p className="text-emerald-800 leading-relaxed">
                Master Passage 3, and you'll demonstrate the reading comprehension expected at university level. 
                Allocate <strong>20-22 minutes</strong> for this passage - it's worth the extra time!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Essential Strategies Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-emerald-600" />
            <h2 className="text-3xl font-bold text-slate-900">Essential Strategies for Passage 3</h2>
          </div>
          
          <p className="text-slate-600 mb-8 text-lg">
            Master these four advanced strategies to excel at Passage 3. Click any card to learn more.
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
                                Passage 3 Tip:
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
            Passage 3 Question Types & Strategies
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Pro Tip for Passage 3</th>
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
            Your Passage 3 Practice Checklist
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
                  🎉 Outstanding! You're ready to tackle the toughest IELTS Reading passages!
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
            Try It Yourself: Complex Y/N/NG Practice
          </motion.h2>
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-8 border-2 border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Practice: The Impact of Technology on Employment (Passage 3 Style)
            </h3>
            <div className="bg-white p-6 rounded-lg mb-6 border border-slate-200">
              <p className="text-slate-700 leading-relaxed mb-4">
                While automation has undoubtedly displaced workers in certain sectors, particularly manufacturing, 
                some economists argue that technology ultimately creates more jobs than it destroys. Historical evidence 
                suggests that technological revolutions have consistently led to net job creation, though this process 
                can take decades and often requires significant workforce retraining. However, critics contend that 
                this time may be different, pointing to the unprecedented pace of AI development and its potential 
                to affect even high-skilled professions.
              </p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-600">
              <p className="font-semibold text-emerald-900 mb-4">Practice Question (Typical Passage 3 complexity):</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-emerald-800 font-semibold">Statement: The writer believes that automation will create more employment opportunities than it eliminates.</p>
                  <details className="cursor-pointer mt-2">
                    <summary className="text-emerald-700 font-semibold hover:text-emerald-900">
                      Click to see the answer & explanation →
                    </summary>
                    <div className="mt-2 text-emerald-800 bg-white p-4 rounded-lg space-y-2">
                      <p><strong>Answer: NO</strong></p>
                      <p className="text-sm">
                        <strong>Why not YES?</strong> The writer doesn't express this as their own belief. They say 
                        "some economists argue" - this is reporting others' views, not stating their own position.
                      </p>
                      <p className="text-sm">
                        <strong>Why not NOT GIVEN?</strong> The writer does express skepticism by presenting the 
                        critics' view that "this time may be different" without refuting it. This suggests the writer 
                        does NOT believe the optimistic economic argument.
                      </p>
                      <p className="text-sm font-bold mt-3">
                        This is classic Passage 3 complexity! You must distinguish between: (1) what others claim, 
                        (2) historical evidence, and (3) the writer's actual position, which is suggested but not 
                        explicitly stated.
                      </p>
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
          <h2 className="text-3xl font-bold mb-4">You've Mastered All Three Passages!</h2>
          <p className="text-emerald-100 text-lg mb-6">
            Congratulations! You've learned strategies for all IELTS Reading passage types. Now it's time to 
            put everything together in a full practice test under real exam conditions!
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-md"
              onClick={() => router.push('/reading/coach/passage1')}
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Review Passage 1
              </span>
            </button>
            <button
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-md"
              onClick={() => router.push('/reading/coach/passage2')}
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Review Passage 2
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