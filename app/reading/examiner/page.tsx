'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Clock, AlertTriangle, Send, CheckCircle2, FileText, PlayCircle } from 'lucide-react'
import FeedbackAvatarModal from '@/components/ui/FeedbackAvatarModal'

type TestPhase = 'instructions' | 'testing' | 'submitting' | 'completed'

type QuestionType = 'multiple_choice' | 'true_false_not_given' | 'matching_headings' | 'short_answer'

type ReadingQuestion = {
  id: string
  type: QuestionType
  prompt: string
  options?: string[] | null
}

type PassageQuestions = {
  passageId: string
  questions: ReadingQuestion[]
}

// ✅ NEW: passagesText returned from backend (title + text)
type PassageText = {
  passageId: string
  title: string
  text: string
}

// ✅ NEW: backend /reading/generate-test response
type GenerateTestResponse = {
  attemptId: string
  userId: string
  passagesText: PassageText[]
  passages: PassageQuestions[]
}

type SubmitResponse = {
  attemptId: string
  userId: string
  createdAt: string
  overall_score: number
  passage_1_score: number
  passage_2_score: number
  passage_3_score: number
  total_questions: number
  correct_questions: number

  // ✅ this must come from backend
  wrong_answer: Array<{
    questionId: string
    passageId: string
    prompt: string
    correctAnswer: any
    userAnswer: any
    type: QuestionType

    // ✅ future fields from backend (optional but needed for highlighting + reasons)
    explanation?: string
    evidence_sentences?: string[]
  }>
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function getUserId(): string {
  if (typeof window === 'undefined') return 'anonymous'

  // 1) direct userId
  const direct = localStorage.getItem('userId')
  if (direct && direct.trim()) return direct.trim()

  // 2) user object
  const userObj =
    safeJsonParse<any>(localStorage.getItem('user')) ||
    safeJsonParse<any>(localStorage.getItem('authUser')) ||
    safeJsonParse<any>(localStorage.getItem('profile'))

  const candidate =
    userObj?.id ||
    userObj?.userId ||
    userObj?.email ||
    userObj?.username ||
    userObj?.name ||
    userObj?.user?.email ||
    userObj?.userid ||
    userObj?.user?.username

  if (candidate && String(candidate).trim()) {
    const v = String(candidate).trim()
    localStorage.setItem('userId', v) // ✅ store for future
    return v
  }

  // 3) fallback email
  const email = localStorage.getItem('email')
  if (email && email.trim()) {
    const v = email.trim()
    localStorage.setItem('userId', v) // ✅ store for future
    return v
  }

  // 4) persistent guest id (prevents "anonymous")
  const guest = localStorage.getItem('guestId')
  if (guest && guest.trim()) {
    localStorage.setItem('userId', guest.trim())
    return guest.trim()
  }

  const newGuest =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `guest_${crypto.randomUUID()}`
      : `guest_${Date.now()}_${Math.random().toString(16).slice(2)}`

  localStorage.setItem('guestId', newGuest)
  localStorage.setItem('userId', newGuest)
  return newGuest
}

const READING_BACKEND_URL =
  process.env.NEXT_PUBLIC_READING_BACKEND_URL || 'http://localhost:8002'

export default function ReadingExaminerPage() {
  const router = useRouter()

  const [testPhase, setTestPhase] = useState<TestPhase>('instructions')
  const [timeRemaining, setTimeRemaining] = useState(60 * 60)
  const [currentPassage, setCurrentPassage] = useState(1)

  // answers map: questionId -> userAnswer
  const [answers, setAnswers] = useState<Record<string, any>>({})

  const [showTimeWarning, setShowTimeWarning] = useState(false)
  const [testStartTime, setTestStartTime] = useState<number | null>(null)

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [questionError, setQuestionError] = useState<string | null>(null)

  const [attemptId, setAttemptId] = useState<string | null>(null)

  // ✅ Now holds both passagesText + questions
  const [generated, setGenerated] = useState<GenerateTestResponse | null>(null)

  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null)

  const [aiFeedback, setAiFeedback] = useState<any | null>(null)
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)

  // (kept as-is so nothing else breaks; no longer used by button)
  const [feedbackComments, setFeedbackComments] = useState<string>('')
  const [feedbackIframeKey, setFeedbackIframeKey] = useState(0)
  const [mountIframe, setMountIframe] = useState(false)

  // timer
  useEffect(() => {
    if (testPhase === 'testing' && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [testPhase, timeRemaining])

  useEffect(() => {
    if (timeRemaining === 5 * 60 && testPhase === 'testing') {
      setShowTimeWarning(true)
      setTimeout(() => setShowTimeWarning(false), 5000)
    }
  }, [timeRemaining, testPhase])

  // ✅ passage map from backend
  const passagesTextById = useMemo(() => {
    const map: Record<string, PassageText> = {}
    for (const p of generated?.passagesText || []) {
      map[String(p.passageId)] = p
    }
    return map
  }, [generated])

  // ✅ questions map from backend
  const questionsByPassageId = useMemo(() => {
    const map: Record<string, ReadingQuestion[]> = {}
    for (const p of generated?.passages || []) {
      map[String(p.passageId)] = Array.isArray(p.questions) ? p.questions : []
    }
    return map
  }, [generated])

  const allQuestions = useMemo(() => {
    const out: Array<{ passageId: string; q: ReadingQuestion; index: number }> = []
    let i = 0
    for (const pid of ['1', '2', '3']) {
      const qs = questionsByPassageId[pid] || []
      for (const q of qs) {
        i += 1
        out.push({ passageId: pid, q, index: i })
      }
    }
    return out
  }, [questionsByPassageId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeRemaining <= 5 * 60) return 'text-red-600'
    if (timeRemaining <= 15 * 60) return 'text-orange-600'
    return 'text-slate-700'
  }

  const getAnsweredCount = () => Object.keys(answers).length

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  // ✅ Start Test now calls backend to generate BOTH passages + questions
  const handleStartTest = async () => {
    setIsLoadingQuestions(true)
    setQuestionError(null)
    setSubmitResult(null)
    setAiFeedback(null)

    setAnswers({})
    setCurrentPassage(1)
    setTimeRemaining(60 * 60)

    try {
      const userId = getUserId()

      const res = await fetch(`${READING_BACKEND_URL}/reading/generate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        cache: 'no-store',
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Failed to generate test: ${res.status}`)
      }

      const data = (await res.json()) as GenerateTestResponse

      if (!data?.attemptId || !Array.isArray(data?.passagesText) || !Array.isArray(data?.passages)) {
        throw new Error('Backend returned an unexpected response format for reading test.')
      }

      setAttemptId(data.attemptId)
      setGenerated(data)
      setTestPhase('testing')
      setTestStartTime(Date.now())
    } catch (e: any) {
      setQuestionError(e?.message || 'Failed to generate reading test.')
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const handleTimeUp = useCallback(() => {
    setTestPhase('submitting')
    setTimeout(() => {
      handleSubmitToBackend()
    }, 1000)
  }, [])

  const handleSubmit = () => {
    const answeredCount = getAnsweredCount()
    const total = allQuestions.length || 0

    if (total > 0 && answeredCount < total) {
      const confirmed = window.confirm(
        `You've only answered ${answeredCount} out of ${total} questions. Are you sure you want to submit?`
      )
      if (!confirmed) return
    }

    setTestPhase('submitting')
    handleSubmitToBackend()
  }

  const handleSubmitToBackend = async () => {
    try {
      if (!attemptId) throw new Error('Missing attemptId. Please restart the test.')

      const timeSpent = testStartTime ? Math.floor((Date.now() - testStartTime) / 1000) : 0
      const userId = getUserId()

      const submissionData = {
        userId,
        attemptId,
        answers,
        meta: {
          timeSpent,
          answeredQuestions: getAnsweredCount(),
          totalQuestions: allQuestions.length,
          submittedAt: new Date().toISOString(),
        },
      }

      const response = await fetch(`${READING_BACKEND_URL}/reading/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const txt = await response.text()
        throw new Error(txt || 'Submission failed')
      }

      const result = (await response.json()) as SubmitResponse
      setSubmitResult(result)
      setTestPhase('completed')
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit test. Please try again.')
      setTestPhase('testing')
    }
  }

  const handleViewResult = async () => {
    try {
      const userId = getUserId()
      const res = await fetch(
        `${READING_BACKEND_URL}/reading/results/${encodeURIComponent(userId)}/latest`,
        { method: 'GET', cache: 'no-store' }
      )
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Failed to load result: ${res.status}`)
      }
      const data = await res.json()
      const score = data?.overall_score
      if (typeof score === 'number') {
        alert(`Overall Score: ${score}%`)
      } else {
        alert('No result found yet.')
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to load results.')
    }
  }

  const handleAIFeedback = async () => {
    if (!attemptId) return alert('Missing attemptId. Please submit the test first.')

    setIsLoadingFeedback(true)
    try {
      const userId = getUserId()
      const res = await fetch(`${READING_BACKEND_URL}/reading/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, attemptId }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Failed to load feedback: ${res.status}`)
      }

      const data = await res.json()
      setAiFeedback(data?.feedback || data)
    } catch (e: any) {
      alert(e?.message || 'Failed to load AI feedback.')
    } finally {
      setIsLoadingFeedback(false)
    }
  }

  // ----------------------
  // UI: Instructions (UNCHANGED)
  // ----------------------
  if (testPhase === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <motion.header
          className="bg-white border-b border-slate-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => router.push('/reading')}
              className="text-slate-600 hover:text-slate-900 mb-4 flex items-center gap-2 transition-colors"
            >
              ← Back to Reading Module
            </button>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Reading Examiner Mode</h1>
                <p className="text-lg text-slate-600">Full IELTS Reading Test - 60 Minutes</p>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="bg-white rounded-2xl p-8 border-2 border-blue-200 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Test Instructions
            </h2>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Time Limit: 60 Minutes
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  You have <strong>exactly 60 minutes</strong> to complete all questions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  There is <strong>NO extra time</strong> for transferring answers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  The timer will count down and is visible at all times
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Test will auto-submit when time expires
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Test Format</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">3 Reading Passages</p>
                    <p className="text-sm text-slate-600">Passage 1, Passage 2, Passage 3</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">OpenAI-generated Questions (Real-time)</p>
                    <p className="text-sm text-slate-600">Questions are generated from each passage text</p>
                  </div>
                </div>
              </div>
            </div>

            {questionError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-800 font-semibold">Failed to generate questions</p>
                <p className="text-red-700 text-sm mt-1">{questionError}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/reading')}
                className="flex-1 bg-slate-200 text-slate-700 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStartTest}
                disabled={isLoadingQuestions}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                  isLoadingQuestions
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <PlayCircle className="w-6 h-6" />
                {isLoadingQuestions ? 'Generating Questions…' : 'Start Test Now'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ----------------------
  // UI: Testing (UNCHANGED layout, only data source swapped)
  // ----------------------
  if (testPhase === 'testing') {
    const pid = String(currentPassage)
    const passageObj = passagesTextById[pid]
    const passageQuestions = questionsByPassageId[pid] || []

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="fixed top-0 left-0 right-0 bg-white border-b-2 border-slate-200 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold text-slate-900">IELTS Reading Test</h1>
                <div className="flex gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentPassage(num)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPassage === num
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Passage {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100`}>
                  <Clock className={`w-5 h-5 ${getTimeColor()}`} />
                  <span className={`font-mono text-lg font-bold ${getTimeColor()}`}>{formatTime(timeRemaining)}</span>
                </div>
                <div className="text-sm text-slate-600">
                  {getAnsweredCount()}/{allQuestions.length || 0} answered
                </div>
                <button
                  onClick={handleSubmit}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md"
                >
                  <Send className="w-5 h-5" />
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showTimeWarning && (
            <motion.div
              className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-xl shadow-2xl z-50"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" />
                <span className="font-bold text-lg">Warning: Only 5 minutes remaining!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm sticky top-28 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="mb-6">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Passage {currentPassage}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">
                  {passageObj?.title || `Passage ${currentPassage}`}
                </h2>
                <p className="text-slate-600 text-sm">Reading time: ~20 minutes recommended</p>
              </div>

              <div className="prose max-w-none text-slate-700 leading-relaxed">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 whitespace-pre-wrap">
                  {passageObj?.text || 'Passage text not found.'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Questions</h3>

              {passageQuestions.length === 0 ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-800 font-semibold">No questions loaded for this passage.</p>
                  <p className="text-red-700 text-sm">Please go back and start the test again.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {passageQuestions.map((q, idx) => {
                    const globalIndex = allQuestions.find((x) => x.q.id === q.id)?.index || idx + 1

                    return (
                      <div key={q.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                            {globalIndex}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-1">{q.type.replaceAll('_', ' ')}</p>
                            <p className="text-slate-900 font-medium whitespace-pre-wrap">{q.prompt}</p>
                          </div>
                        </div>

                        {q.type === 'true_false_not_given' && (
                          <div className="flex flex-wrap gap-3">
                            {['TRUE', 'FALSE', 'NOT GIVEN'].map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-2 cursor-pointer hover:bg-white px-3 py-2 rounded-lg transition-colors"
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={option}
                                  checked={(answers[q.id] || '') === option}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className="w-4 h-4 text-blue-600 cursor-pointer"
                                />
                                <span className="text-sm font-medium">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {q.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {(q.options || []).map((opt, i) => {
                              const letter = String.fromCharCode(65 + i)
                              return (
                                <label
                                  key={letter}
                                  className="flex items-start gap-2 cursor-pointer hover:bg-white p-3 rounded-lg transition-colors"
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={letter}
                                    checked={(answers[q.id] || '') === letter}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="w-4 h-4 text-blue-600 mt-1 cursor-pointer"
                                  />
                                  <span className="text-sm flex-1">
                                    <strong>{letter}.</strong> {opt}
                                  </span>
                                </label>
                              )
                            })}
                            {(q.options || []).length === 0 && (
                              <p className="text-sm text-slate-600">Options not provided by backend.</p>
                            )}
                          </div>
                        )}

                        {(q.type === 'short_answer' || q.type === 'matching_headings') && (
                          <input
                            type="text"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder={
                              q.type === 'short_answer' ? 'Type your answer…' : 'Type your heading match…'
                            }
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------
  // UI: Submitting (UNCHANGED)
  // ----------------------
  if (testPhase === 'submitting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl p-12 max-w-md text-center border-2 border-blue-200 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Submitting Your Test...</h2>
          <p className="text-slate-600 mb-4">Our AI is analyzing your answers and saving your logs.</p>
          <p className="text-xs text-slate-500">Backend: {READING_BACKEND_URL}</p>
        </motion.div>
      </div>
    )
  }

  // ----------------------
  // UI: Completed (ONLY Feedback button changed)
  // ----------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-emerald-600 p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Test Submitted Successfully!</h2>
          <p className="text-emerald-100">
            Logs saved in <strong>backend-reading/data/reading_attempts</strong> and
            <strong> backend-reading/data/reading_logs.json</strong>.
          </p>
        </div>

        <div className="p-8">
          {submitResult && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 text-left">
              <h3 className="font-bold text-slate-900 mb-3">Your Scores</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-slate-700">
                <p>
                  <strong>Overall:</strong> {submitResult.overall_score}%
                </p>
                <p>
                  <strong>Correct:</strong> {submitResult.correct_questions}/{submitResult.total_questions}
                </p>
                <p>
                  <strong>Passage 1:</strong> {submitResult.passage_1_score}%
                </p>
                <p>
                  <strong>Passage 2:</strong> {submitResult.passage_2_score}%
                </p>
                <p>
                  <strong>Passage 3:</strong> {submitResult.passage_3_score}%
                </p>
              </div>
            </div>
          )}

          {aiFeedback && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-8 text-left">
              <h3 className="font-bold text-blue-900 mb-3">AI Feedback</h3>
              <pre className="text-xs text-blue-900 whitespace-pre-wrap bg-white/70 p-4 rounded-lg border border-blue-100">
                {JSON.stringify(aiFeedback, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/reading')}
              className="flex-1 bg-slate-200 text-slate-700 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-slate-300 transition-all"
            >
              Back to Reading
            </button>

            <button
              onClick={handleViewResult}
              className="flex-1 bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all shadow-md"
            >
              View Result
            </button>

            {/* ✅ CHANGED: Feedback button now opens Wrong Answer Review (no avatar) */}
            <FeedbackAvatarModal
              label="Feedback AI"
              buttonClassName="flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all shadow-md bg-blue-600 text-white hover:bg-blue-700"
              wrongAnswers={submitResult?.wrong_answer || []}
              passagesTextById={passagesTextById}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
