'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type PassageText = {
  passageId: string
  title?: string
  text: string
}

type WrongAnswer = {
  questionId: string
  passageId: string
  prompt: string
  type?: string
  userAnswer: any
  correctAnswer: any
  explanation?: string
  evidence_sentences?: string[]
}

type WritingCriterion = {
  name: string
  score: number
  description: string
}

type WritingFeedbackAI = {
  summary?: string
  strengths?: string[]
  weaknesses?: string[]
  nextSteps?: string[]
  bandAdvice?: string
} | null

type WritingFeedback = {
  taskType: 'task1' | 'task2'
  question: string
  essay: string
  overallScore: number
  criteria: WritingCriterion[]
  feedbackAi?: WritingFeedbackAI
}

type Props = {
  label?: string
  buttonClassName?: string

  comments?: string
  setComments?: (v: string) => void
  AvatarSlot?: React.ReactNode
  onOpen?: () => void
  onStop?: () => void

  wrongAnswers?: WrongAnswer[]
  passagesTextById?: Record<string, PassageText | undefined>

  writingFeedback?: WritingFeedback | null
}

function normalizeAnswer(a: any): string {
  if (a === null || a === undefined) return ''
  if (typeof a === 'string') return a
  try {
    return JSON.stringify(a)
  } catch {
    return String(a)
  }
}

function splitSentences(text: string): string[] {
  const t = (text || '').trim()
  if (!t) return []
  return t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function tokenize(text: string): Set<string> {
  const t = (text || '').toLowerCase()
  const matches = t.match(/[a-z0-9']+/g) || []
  return new Set(matches.filter((w) => w.length >= 3))
}

function bestEvidenceSentences(
  passageText: string,
  prompt: string,
  correctAnswer: any,
  limit = 2
): string[] {
  const sentences = splitSentences(passageText)
  if (sentences.length === 0) return []

  const key = new Set<string>([
    ...Array.from(tokenize(prompt)),
    ...Array.from(tokenize(String(correctAnswer ?? ''))),
  ])

  if (key.size === 0) return sentences.slice(0, Math.min(limit, sentences.length))

  const scored = sentences.map((s, idx) => {
    const st = tokenize(s)
    let overlap = 0
    for (const w of st) {
      if (key.has(w)) overlap++
    }

    const lengthPenalty = Math.max(0, st.size - 28)
    const score = overlap * 10 - lengthPenalty
    return { s, idx, score }
  })

  scored.sort((a, b) => (b.score - a.score) || (a.idx - b.idx))

  let best = scored
    .filter((x) => x.score > 0)
    .slice(0, limit)
    .map((x) => x.s)

  if (best.length === 0) {
    best = [scored[0].s]
  }

  const seen = new Set<string>()
  return best
    .filter((s) => {
      if (seen.has(s)) return false
      seen.add(s)
      return true
    })
    .map((s) => ({ s, pos: sentences.indexOf(s) }))
    .sort((a, b) => a.pos - b.pos)
    .map((x) => x.s)
}

function buildExplanation(correctAnswer: any, evidence: string[]): string {
  const ca = String(correctAnswer ?? '').trim()

  if (evidence.length > 0) {
    if (evidence.length === 1) {
      return `The correct answer is '${ca}' because the passage directly states: ${evidence[0]}`
    }

    return `The correct answer is '${ca}' because the passage states these key lines: ${evidence.join(' ')}`
  }

  return `The correct answer is '${ca}' based on the passage.`
}

function selectWritingEvidenceSentences(writingFeedback: WritingFeedback, limit = 3): string[] {
  const essaySentences = splitSentences(writingFeedback.essay)
  if (essaySentences.length === 0) return []

  const weakest = [...(writingFeedback.criteria || [])]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)

  const key = new Set<string>([
    ...Array.from(tokenize(writingFeedback.question || '')),
    ...Array.from(tokenize(writingFeedback.feedbackAi?.summary || '')),
    ...Array.from(tokenize((writingFeedback.feedbackAi?.weaknesses || []).join(' '))),
    ...Array.from(tokenize((writingFeedback.feedbackAi?.nextSteps || []).join(' '))),
    ...weakest.flatMap((c) => Array.from(tokenize(`${c.name} ${c.description}`))),
  ])

  const scored = essaySentences.map((s, idx) => {
    const st = tokenize(s)
    let overlap = 0
    for (const w of st) {
      if (key.has(w)) overlap++
    }

    const lengthPenalty = Math.max(0, st.size - 30)
    const score = overlap * 10 - lengthPenalty
    return { s, idx, score }
  })

  scored.sort((a, b) => (b.score - a.score) || (a.idx - b.idx))

  let picked = scored
    .filter((x) => x.score > 0)
    .slice(0, limit)
    .map((x) => x.s)

  if (picked.length === 0) {
    picked = essaySentences.slice(0, Math.min(limit, essaySentences.length))
  }

  const seen = new Set<string>()
  return picked
    .filter((s) => {
      if (seen.has(s)) return false
      seen.add(s)
      return true
    })
    .map((s) => ({ s, pos: essaySentences.indexOf(s) }))
    .sort((a, b) => a.pos - b.pos)
    .map((x) => x.s)
}

function buildWritingExplanation(writingFeedback: WritingFeedback, evidence: string[]): string {
  const ai = writingFeedback.feedbackAi
  const weakest = [...(writingFeedback.criteria || [])]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map((c) => c.name)

  if (ai?.summary?.trim()) {
    const focus =
      weakest.length > 0
        ? ` Your main improvement areas are ${weakest.join(' and ')}.`
        : ''

    const evidenceLine =
      evidence.length > 0
        ? ` The most relevant lines from your response are: ${evidence.join(' ')}`
        : ''

    return `${ai.summary.trim()}${focus}${evidenceLine}`
  }

  return `Your current band is ${writingFeedback.overallScore}. Focus on improving ${weakest.join(' and ') || 'your writing accuracy and structure'}.`
}

function scorePillClass(score: number) {
  if (score >= 7) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 5) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
}

function VoiceWave() {
  return (
    <span className="inline-flex h-4 items-end gap-[3px]" aria-hidden="true">
      <span className="w-[3px] rounded-full bg-white/95 animate-[voicewave_0.9s_ease-in-out_infinite]" style={{ height: '8px' }} />
      <span className="w-[3px] rounded-full bg-white/95 animate-[voicewave_0.9s_ease-in-out_0.15s_infinite]" style={{ height: '14px' }} />
      <span className="w-[3px] rounded-full bg-white/95 animate-[voicewave_0.9s_ease-in-out_0.3s_infinite]" style={{ height: '10px' }} />
      <span className="w-[3px] rounded-full bg-white/95 animate-[voicewave_0.9s_ease-in-out_0.45s_infinite]" style={{ height: '16px' }} />
    </span>
  )
}

// ─── Real-time Audio Waveform Visualizer ────────────────────────────────────
function AudioWaveVisualizer({
  analyserRef,
  speaking,
}: {
  analyserRef: React.RefObject<AnalyserNode | null>
  speaking: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const phaseRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use the canvas's actual pixel dimensions
    const DPR = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * DPR
    canvas.height = rect.height * DPR
    ctx.scale(DPR, DPR)

    const W = rect.width
    const H = rect.height

    // ── Idle: draw a calm, thin flat line ────────────────────────────────
    if (!speaking) {
      cancelAnimationFrame(animFrameRef.current)
      ctx.clearRect(0, 0, W, H)
      const idleGrad = ctx.createLinearGradient(0, 0, W, 0)
      idleGrad.addColorStop(0, 'rgba(147,197,253,0)')
      idleGrad.addColorStop(0.35, 'rgba(96,165,250,0.45)')
      idleGrad.addColorStop(0.65, 'rgba(96,165,250,0.45)')
      idleGrad.addColorStop(1, 'rgba(147,197,253,0)')
      ctx.beginPath()
      ctx.strokeStyle = idleGrad
      ctx.lineWidth = 1.5
      ctx.moveTo(0, H / 2)
      ctx.lineTo(W, H / 2)
      ctx.stroke()
      return
    }

    // ── Active: animate real or synthetic waveform ────────────────────────
    const bufferLength = analyserRef.current
      ? analyserRef.current.fftSize
      : 256
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, W, H)

      const analyser = analyserRef.current

      // Background glow strip
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
      bgGrad.addColorStop(0, 'rgba(59,130,246,0.06)')
      bgGrad.addColorStop(0.5, 'rgba(59,130,246,0.04)')
      bgGrad.addColorStop(1, 'rgba(59,130,246,0.06)')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      if (analyser) {
        // ── Real audio waveform ──────────────────────────────────────────
        analyser.getByteTimeDomainData(dataArray)

        // Filled area under waveform
        const fillGrad = ctx.createLinearGradient(0, 0, 0, H)
        fillGrad.addColorStop(0, 'rgba(59,130,246,0.18)')
        fillGrad.addColorStop(1, 'rgba(59,130,246,0)')
        ctx.beginPath()
        const sliceW = W / (dataArray.length - 1)
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0
          const y = (v * H) / 2
          i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * sliceW, y)
        }
        ctx.lineTo(W, H / 2)
        ctx.lineTo(0, H / 2)
        ctx.closePath()
        ctx.fillStyle = fillGrad
        ctx.fill()

        // Stroke waveform line
        const lineGrad = ctx.createLinearGradient(0, 0, W, 0)
        lineGrad.addColorStop(0, 'rgba(147,197,253,0.5)')
        lineGrad.addColorStop(0.2, 'rgba(59,130,246,0.9)')
        lineGrad.addColorStop(0.5, 'rgba(37,99,235,1)')
        lineGrad.addColorStop(0.8, 'rgba(59,130,246,0.9)')
        lineGrad.addColorStop(1, 'rgba(147,197,253,0.5)')

        ctx.beginPath()
        ctx.strokeStyle = lineGrad
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0
          const y = (v * H) / 2
          i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * sliceW, y)
        }
        ctx.stroke()

        // Glowing duplicate line (blurred-feel via opacity)
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(96,165,250,0.22)'
        ctx.lineWidth = 5
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0
          const y = (v * H) / 2
          i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * sliceW, y)
        }
        ctx.stroke()
      } else {
        // ── Synthetic animated sine wave fallback ────────────────────────
        phaseRef.current += 0.055

        const fillGrad = ctx.createLinearGradient(0, 0, 0, H)
        fillGrad.addColorStop(0, 'rgba(59,130,246,0.14)')
        fillGrad.addColorStop(1, 'rgba(59,130,246,0)')

        const lineGrad = ctx.createLinearGradient(0, 0, W, 0)
        lineGrad.addColorStop(0, 'rgba(147,197,253,0.4)')
        lineGrad.addColorStop(0.3, 'rgba(59,130,246,0.9)')
        lineGrad.addColorStop(0.5, 'rgba(37,99,235,1)')
        lineGrad.addColorStop(0.7, 'rgba(59,130,246,0.9)')
        lineGrad.addColorStop(1, 'rgba(147,197,253,0.4)')

        // Filled area
        ctx.beginPath()
        for (let x = 0; x <= W; x++) {
          const t = x / W
          const amp =
            10 * Math.sin(t * Math.PI * 2 + phaseRef.current) +
            5 * Math.sin(t * Math.PI * 5 + phaseRef.current * 1.3) +
            3 * Math.sin(t * Math.PI * 9 + phaseRef.current * 0.7)
          const y = H / 2 + amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.lineTo(W, H / 2)
        ctx.lineTo(0, H / 2)
        ctx.closePath()
        ctx.fillStyle = fillGrad
        ctx.fill()

        // Stroke line
        ctx.beginPath()
        ctx.strokeStyle = lineGrad
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        for (let x = 0; x <= W; x++) {
          const t = x / W
          const amp =
            10 * Math.sin(t * Math.PI * 2 + phaseRef.current) +
            5 * Math.sin(t * Math.PI * 5 + phaseRef.current * 1.3) +
            3 * Math.sin(t * Math.PI * 9 + phaseRef.current * 0.7)
          const y = H / 2 + amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()

        // Glow
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(96,165,250,0.18)'
        ctx.lineWidth = 6
        for (let x = 0; x <= W; x++) {
          const t = x / W
          const amp =
            10 * Math.sin(t * Math.PI * 2 + phaseRef.current) +
            5 * Math.sin(t * Math.PI * 5 + phaseRef.current * 1.3) +
            3 * Math.sin(t * Math.PI * 9 + phaseRef.current * 0.7)
          const y = H / 2 + amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // Edge fade masks
      const leftFade = ctx.createLinearGradient(0, 0, 36, 0)
      leftFade.addColorStop(0, 'rgba(248,250,252,1)')
      leftFade.addColorStop(1, 'rgba(248,250,252,0)')
      ctx.fillStyle = leftFade
      ctx.fillRect(0, 0, 36, H)

      const rightFade = ctx.createLinearGradient(W - 36, 0, W, 0)
      rightFade.addColorStop(0, 'rgba(248,250,252,0)')
      rightFade.addColorStop(1, 'rgba(248,250,252,1)')
      ctx.fillStyle = rightFade
      ctx.fillRect(W - 36, 0, 36, H)
    }

    draw()
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [speaking, analyserRef])

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-blue-100/80 bg-slate-50"
      style={{ height: '52px' }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '52px', display: 'block' }}
      />
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

async function fetchTtsMp3(text: string, voice = 'coral'): Promise<Blob> {
  const r = await fetch('/api/livekit/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  })

  if (!r.ok) {
    const msg = await r.text().catch(() => '')
    throw new Error(msg || 'TTS request failed')
  }

  const buf = await r.arrayBuffer()
  return new Blob([buf], { type: 'audio/mpeg' })
}

export default function FeedbackAvatarModal({
  label = 'Feedback',
  buttonClassName,
  comments,
  setComments,
  AvatarSlot,
  onOpen,
  onStop,
  wrongAnswers,
  passagesTextById,
  writingFeedback,
}: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const isReadingReviewMode = Array.isArray(wrongAnswers)
  const isWritingReviewMode = !!writingFeedback && !isReadingReviewMode

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeAudioUrlRef = useRef<string | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [ttsError, setTtsError] = useState<string | null>(null)

  // ── Web Audio API refs for waveform visualizer ───────────────────────────
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  // ─────────────────────────────────────────────────────────────────────────

  const stopVoice = () => {
    setTtsError(null)
    setSpeaking(false)

    const a = audioRef.current
    if (a) {
      a.pause()
      a.currentTime = 0
      a.onended = null
      a.onerror = null
      a.onpause = null
    }

    if (activeAudioUrlRef.current) {
      URL.revokeObjectURL(activeAudioUrlRef.current)
      activeAudioUrlRef.current = null
    }

    if (a) {
      a.src = ''
    }
  }

  const speak = async (text: string) => {
    try {
      stopVoice()
      setTtsError(null)

      const cleaned = (text || '').trim()
      if (!cleaned) throw new Error('Nothing to read')

      const blob = await fetchTtsMp3(cleaned, 'coral')
      const url = URL.createObjectURL(blob)
      activeAudioUrlRef.current = url

      if (!audioRef.current) {
        audioRef.current = new Audio()
      }

      const audio = audioRef.current
      audio.src = url

      // ── Set up Web Audio API (only once per audio element) ─────────────
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (
            window.AudioContext ||
            (window as any).webkitAudioContext
          )()
        }
        const audioCtx = audioCtxRef.current

        if (!analyserRef.current) {
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 2048
          analyser.smoothingTimeConstant = 0.82
          analyserRef.current = analyser
        }

        if (!sourceRef.current) {
          const source = audioCtx.createMediaElementSource(audio)
          source.connect(analyserRef.current)
          analyserRef.current.connect(audioCtx.destination)
          sourceRef.current = source
        }

        if (audioCtx.state === 'suspended') {
          await audioCtx.resume()
        }
      } catch {
        // AudioContext setup is best-effort; visualizer falls back to synthetic
      }
      // ───────────────────────────────────────────────────────────────────

      audio.onended = () => {
        setSpeaking(false)
        if (activeAudioUrlRef.current) {
          URL.revokeObjectURL(activeAudioUrlRef.current)
          activeAudioUrlRef.current = null
        }
      }

      audio.onerror = () => {
        setSpeaking(false)
        if (activeAudioUrlRef.current) {
          URL.revokeObjectURL(activeAudioUrlRef.current)
          activeAudioUrlRef.current = null
        }
        setTtsError('Voice playback failed')
      }

      setSpeaking(true)
      await audio.play()
    } catch (e: any) {
      setSpeaking(false)
      setTtsError(e?.message || 'Voice failed')
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    return () => {
      stopVoice()
    }
  }, [])

  const openModal = () => {
    setActiveIndex(0)
    setOpen(true)
  }

  const closeModal = () => {
    stopVoice()
    onStop?.()
    setOpen(false)
  }

  useEffect(() => {
    if (!open || !mounted) return
    onOpen?.()

    if (!isReadingReviewMode && !isWritingReviewMode) {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [open, mounted, isReadingReviewMode, isWritingReviewMode, onOpen])

  const modal = useMemo(() => {
    if (!open || !mounted) return null

    if (isReadingReviewMode) {
      const list = wrongAnswers || []
      const active = list[activeIndex]
      const passage = active ? passagesTextById?.[String(active.passageId)] : undefined
      const passageText = passage?.text || ''

      const evidence =
        active?.evidence_sentences && active.evidence_sentences.length > 0
          ? active.evidence_sentences.slice(0, 2)
          : bestEvidenceSentences(passageText, active?.prompt || '', active?.correctAnswer, 2)

      const explanation =
        active?.explanation && active.explanation.trim()
          ? active.explanation.trim()
          : buildExplanation(active?.correctAnswer, evidence)

      const answerForVoice = normalizeAnswer(active?.correctAnswer) || 'the correct answer'

      const explainAnswerWithEvidence = () => {
        const text = evidence.length
          ? `The correct answer is ${answerForVoice}. ${explanation} Evidence from the passage: ${evidence.join(' ')}`
          : `The correct answer is ${answerForVoice}. ${explanation}`
        speak(text)
      }

      return createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-[2px]"
          onMouseDown={closeModal}
        >
          <style>{`
            @keyframes voicewave {
              0%, 100% { transform: scaleY(0.55); opacity: 0.7; }
              50% { transform: scaleY(1.25); opacity: 1; }
            }
          `}</style>

          <div
            className="w-[min(820px,94vw)] max-h-[84vh] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_25px_90px_rgba(15,23,42,0.18)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                    Review Mode
                  </div>
                  <div className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                    Reading Review
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Clear corrections, exact evidence, and voice explanation.
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-bold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="max-h-[calc(84vh-88px)] overflow-auto bg-slate-50/60">
              <div className="grid gap-4 p-4 md:grid-cols-[250px_1fr]">
                <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">Wrong Answers</div>
                      <div className="text-xs text-slate-500">{list.length} question(s)</div>
                    </div>

                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      onClick={() => {
                        const summary = list
                          .map((w, i) => {
                            const p = passagesTextById?.[String(w.passageId)]?.text || ''
                            const ev =
                              w.evidence_sentences && w.evidence_sentences.length > 0
                                ? w.evidence_sentences.slice(0, 2)
                                : bestEvidenceSentences(p, w.prompt, w.correctAnswer, 2)

                            const ex =
                              w.explanation && w.explanation.trim()
                                ? w.explanation.trim()
                                : buildExplanation(w.correctAnswer, ev)

                            return [
                              `#${i + 1} (Passage ${w.passageId})`,
                              `Q: ${w.prompt}`,
                              `Your: ${normalizeAnswer(w.userAnswer) || '—'}`,
                              `Correct: ${normalizeAnswer(w.correctAnswer) || '—'}`,
                              `Explanation: ${ex}`,
                              `Evidence: ${ev.join(' | ') || 'Not available'}`,
                            ].join('\n')
                          })
                          .join('\n\n---\n\n')

                        navigator.clipboard?.writeText(summary).catch(() => {})
                      }}
                    >
                      Copy all
                    </button>
                  </div>

                  <div className="max-h-[58vh] overflow-auto pr-1">
                    {list.map((w, idx) => {
                      const isActive = idx === activeIndex
                      return (
                        <button
                          key={`${w.questionId}-${idx}`}
                          type="button"
                          onClick={() => {
                            stopVoice()
                            setActiveIndex(idx)
                          }}
                          className={`mb-2 w-full rounded-2xl border p-3 text-left transition-all ${
                            isActive
                              ? 'border-blue-200 bg-blue-50 shadow-sm ring-1 ring-blue-100'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Passage {w.passageId}
                            {w.type ? ` • ${String(w.type).replaceAll('_', ' ')}` : ''}
                          </div>
                          <div className="mt-1 line-clamp-3 text-sm font-semibold leading-5 text-slate-900">
                            {w.prompt}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  {!active ? (
                    <div className="grid h-[40vh] place-items-center text-slate-600">
                      No wrong answers found.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Passage {active.passageId} • Question ID: {active.questionId}
                        </div>
                        <div className="mt-2 text-lg font-extrabold leading-7 text-slate-900">
                          {active.prompt}
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4">
                          <div className="text-xs font-bold uppercase tracking-wide text-rose-700">
                            Your Answer
                          </div>
                          <div className="mt-2 text-sm font-semibold text-slate-900">
                            {normalizeAnswer(active.userAnswer) || '—'}
                          </div>
                        </div>

                        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
                          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                            Correct Answer
                          </div>
                          <div className="mt-2 text-sm font-semibold text-slate-900">
                            {normalizeAnswer(active.correctAnswer) || '—'}
                          </div>
                        </div>
                      </div>

                      {/* ── Voice Controls + Waveform ─────────────────────────────────── */}
                      <div className="rounded-[22px] border border-blue-100/60 bg-slate-50 p-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={speaking}
                            onClick={explainAnswerWithEvidence}
                          >
                            {speaking ? <VoiceWave /> : null}
                            <span>{speaking ? 'Playing...' : 'Explanation'}</span>
                          </button>

                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-slate-300 hover:bg-slate-50"
                            onClick={stopVoice}
                          >
                            Stop
                          </button>
                        </div>

                        {/* Waveform visualizer */}
                        <AudioWaveVisualizer analyserRef={analyserRef} speaking={speaking} />
                      </div>
                      {/* ──────────────────────────────────────────────────────────────── */}

                      {ttsError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                          Voice error: {ttsError}
                        </div>
                      ) : null}

                      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                          Explanation
                        </div>
                        <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                          {explanation}
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                        <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-700">
                          Evidence (Exact sentences)
                        </div>

                        {evidence.length > 0 ? (
                          <ul className="space-y-2">
                            {evidence.map((s, i) => (
                              <li
                                key={`${active.questionId}-ev-${i}`}
                                className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-7 text-slate-800"
                              >
                                {s}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-slate-600">Evidence not available.</div>
                        )}
                      </div>

                      <div className="flex justify-center pt-1">
                        <button
                          type="button"
                          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    }

    if (isWritingReviewMode && writingFeedback) {
      const weakestCriteria = [...(writingFeedback.criteria || [])].sort((a, b) => a.score - b.score)
      const evidence = selectWritingEvidenceSentences(writingFeedback, 3)
      const explanation = buildWritingExplanation(writingFeedback, evidence)

      const strengths = writingFeedback.feedbackAi?.strengths || []
      const weaknesses = writingFeedback.feedbackAi?.weaknesses || []
      const nextSteps = writingFeedback.feedbackAi?.nextSteps || []
      const bandAdvice = writingFeedback.feedbackAi?.bandAdvice || ''

      const explainWriting = () => {
        const textParts = [
          `Writing feedback for ${writingFeedback.taskType === 'task1' ? 'task 1' : 'task 2'}.`,
          `Overall band score is ${writingFeedback.overallScore}.`,
          explanation,
          weaknesses.length ? `Main weaknesses: ${weaknesses.join('. ')}` : '',
          nextSteps.length ? `Next steps: ${nextSteps.join('. ')}` : '',
          bandAdvice ? `Band advice: ${bandAdvice}` : '',
        ].filter(Boolean)

        speak(textParts.join(' '))
      }

      return createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/55 p-3 backdrop-blur-[2px]"
          onMouseDown={closeModal}
        >
          <style>{`
            @keyframes voicewave {
              0%, 100% { transform: scaleY(0.55); opacity: 0.7; }
              50% { transform: scaleY(1.25); opacity: 1; }
            }
          `}</style>

          <div
            className="w-[min(920px,95vw)] max-h-[86vh] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_25px_90px_rgba(15,23,42,0.18)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                    Writing Review
                  </div>
                  <div className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                    Examiner Feedback
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Score breakdown, exact essay lines, and voice explanation.
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-bold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="max-h-[calc(86vh-88px)] overflow-auto bg-slate-50/60">
              <div className="grid gap-4 p-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {writingFeedback.taskType === 'task1' ? 'Task 1' : 'Task 2'}
                        </div>
                        <div className="mt-2 text-base font-extrabold leading-7 text-slate-900">
                          {writingFeedback.question}
                        </div>
                      </div>

                      <div className="rounded-[20px] bg-slate-900 px-5 py-4 text-center text-white shadow-sm">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                          Overall Band
                        </div>
                        <div className="mt-1 text-3xl font-extrabold">{writingFeedback.overallScore}</div>
                      </div>
                    </div>
                  </div>

                  {/* ── Voice Controls + Waveform ─────────────────────────────────── */}
                  <div className="rounded-[24px] border border-blue-100/60 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={speaking}
                        onClick={explainWriting}
                      >
                        {speaking ? <VoiceWave /> : null}
                        <span>{speaking ? 'Playing...' : 'Explanation'}</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-slate-300 hover:bg-slate-50"
                        onClick={stopVoice}
                      >
                        Stop
                      </button>
                    </div>

                    {/* Waveform visualizer */}
                    <AudioWaveVisualizer analyserRef={analyserRef} speaking={speaking} />

                    {ttsError ? (
                      <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                        Voice error: {ttsError}
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                        Explanation
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                        {explanation}
                      </div>
                    </div>
                  </div>
                  {/* ──────────────────────────────────────────────────────────────── */}

                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-700">
                      Evidence (Exact lines from your essay)
                    </div>

                    {evidence.length > 0 ? (
                      <ul className="space-y-2">
                        {evidence.map((s, i) => (
                          <li
                            key={`writing-ev-${i}`}
                            className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-7 text-slate-800"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-600">Evidence not available.</div>
                    )}
                  </div>

                  {nextSteps.length > 0 && (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-700">
                        Next Steps
                      </div>
                      <ul className="space-y-2">
                        {nextSteps.slice(0, 4).map((step, i) => (
                          <li
                            key={`step-${i}`}
                            className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm leading-7 text-slate-800"
                          >
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 text-sm font-extrabold text-slate-900">Criteria Breakdown</div>
                    <div className="space-y-3">
                      {(writingFeedback.criteria || []).map((criterion, idx) => (
                        <div
                          key={`${criterion.name}-${idx}`}
                          className="rounded-[20px] border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-sm font-bold leading-6 text-slate-900">
                              {criterion.name}
                            </div>
                            <div
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${scorePillClass(
                                criterion.score
                              )}`}
                            >
                              {criterion.score}
                            </div>
                          </div>
                          <div className="mt-2 text-sm leading-6 text-slate-700">
                            {criterion.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {strengths.length > 0 && (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 text-sm font-extrabold text-slate-900">Strengths</div>
                      <ul className="space-y-2">
                        {strengths.slice(0, 4).map((item, i) => (
                          <li
                            key={`strength-${i}`}
                            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm leading-7 text-slate-800"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weakestCriteria.length > 0 && (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 text-sm font-extrabold text-slate-900">Priority Areas</div>
                      <ul className="space-y-2">
                        {weakestCriteria.slice(0, 3).map((item, i) => (
                          <li
                            key={`weak-${i}`}
                            className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm leading-7 text-slate-800"
                          >
                            <span className="font-semibold">{item.name}</span>: {item.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {bandAdvice ? (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-2 text-sm font-extrabold text-slate-900">Band Advice</div>
                      <div className="rounded-2xl border border-violet-200 bg-violet-50 px-3 py-3 text-sm leading-7 text-slate-800">
                        {bandAdvice}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    }

    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-3"
        onMouseDown={closeModal}
      >
        <div
          className="w-[min(980px,94vw)] max-h-[84vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="font-extrabold text-slate-900">AI Feedback</div>
            <button
              type="button"
              className="rounded-lg px-3 py-1 text-lg font-bold text-slate-600 hover:bg-slate-100"
              onClick={closeModal}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[calc(84vh-56px)] overflow-auto">
            <div className="flex flex-col gap-4 p-4 md:flex-row">
              <div className="min-h-[440px] rounded-2xl border border-slate-200 bg-slate-50 p-3 md:basis-[70%] flex flex-col">
                <div className="flex-1">
                  {AvatarSlot ? (
                    AvatarSlot
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="max-w-sm text-center">
                        <div className="mb-2 text-lg font-extrabold text-slate-900">Avatar will show here</div>
                        <div className="text-sm text-slate-600">
                          Next step: we'll plug your existing Speaking avatar component into this popup.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    className="rounded-xl bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    onClick={closeModal}
                  >
                    Stop
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:basis-[30%]">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-extrabold text-slate-900">Comments</div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      onClick={() => setComments?.('')}
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(comments || '')
                        } catch {}
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <textarea
                  value={comments || ''}
                  onChange={(e) => setComments?.(e.target.value)}
                  placeholder="Avatar feedback will automatically appear here..."
                  className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  ref={textareaRef}
                />

                <div className="text-xs text-slate-500">This box is editable — you can add your own notes too.</div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }, [
    open,
    mounted,
    isReadingReviewMode,
    isWritingReviewMode,
    wrongAnswers,
    passagesTextById,
    activeIndex,
    AvatarSlot,
    comments,
    setComments,
    speaking,
    ttsError,
    onStop,
    writingFeedback,
  ])

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          buttonClassName ||
          'flex-1 rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-200'
        }
      >
        {label}
      </button>

      {modal}
    </>
  )
}