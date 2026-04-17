'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  BookOpen,
  Ear,
  Target,
  Zap,
  User,
  Check,
  Info
} from 'lucide-react'

export default function ListeningCoachPage() {
  const router = useRouter()

  const [selectedBand, setSelectedBand] = useState<string | null>(null)
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<Set<string>>(new Set())

  const handleFocusSelect = (focus: string) => {
    const updated = new Set(selectedFocusAreas)
    updated.has(focus) ? updated.delete(focus) : updated.add(focus)
    setSelectedFocusAreas(updated)
  }

  const handleStart = () => {
    if (!selectedBand) return

    localStorage.setItem('listeningCoachPreferences', JSON.stringify({
      targetBand: selectedBand,
      focusAreas: Array.from(selectedFocusAreas)
    }))

    router.push('/reading/coach/passage1')
  }

  const canStart = selectedBand

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">
            Your IELTS Listening Coach
          </h1>
          <p className="text-lg text-slate-600">
            Let's work together to improve your listening. I'll guide you step by step<br />
            through understanding, analyzing, and mastering listening passages.
          </p>
        </motion.div>

        {/* User Avatar */}
        <div className="flex justify-center mb-12">
          <div className="w-36 h-36 rounded-full bg-slate-400 flex items-center justify-center shadow-lg">
            <User className="w-16 h-16 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Band Selection */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-3">
            What's your target band score?
          </h2>
          <p className="text-center text-slate-600 mb-8">
            This helps me tailor the coaching to your level
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { band: 'Band 6', desc: 'Competent user' },
              { band: 'Band 7', desc: 'Good user' },
              { band: 'Band 8+', desc: 'Very good to expert' }
            ].map(item => (
              <div
                key={item.band}
                onClick={() => setSelectedBand(item.band)}
                className={`cursor-pointer p-8 rounded-xl border-2 text-center transition shadow-sm hover:shadow-md ${
                  selectedBand === item.band
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}
              >
                <h3 className="text-3xl font-bold text-slate-900 mb-2">{item.band}</h3>
                <p className="text-slate-600 mb-3">{item.desc}</p>
                {selectedBand === item.band && (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <div className="bg-emerald-600 rounded-full w-5 h-5 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="font-semibold">Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Focus Area */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-3">
            Any specific area you'd like to focus on?
          </h2>
          <p className="text-center text-slate-600 mb-8">
            Optional – I can emphasize one area during coaching
          </p>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { id: 'note-taking', label: 'Note-taking', icon: BookOpen },
              { id: 'details', label: 'Key Details', icon: Target },
              { id: 'accents', label: 'Accents', icon: Ear },
              { id: 'speed', label: 'Speed', icon: Zap }
            ].map(f => {
              const Icon = f.icon
              const selected = selectedFocusAreas.has(f.id)
              return (
                <div
                  key={f.id}
                  onClick={() => handleFocusSelect(f.id)}
                  className={`cursor-pointer p-8 rounded-xl border-2 text-center transition shadow-sm hover:shadow-md relative ${
                    selected
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  {selected && (
                    <div className="absolute top-4 right-4 bg-emerald-600 rounded-full w-7 h-7 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <Icon className="w-10 h-10 mx-auto mb-3 text-slate-700" strokeWidth={1.5} />
                  <p className="font-semibold text-slate-900">{f.label}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Start Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`px-10 py-4 rounded-xl font-semibold text-base transition shadow-sm ${
              canStart
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Start Coaching Session
          </button>
        </div>

        {/* Coach Mode Benefits */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Info className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 mb-3">
                  Coach Mode Benefits
                </h3>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li>• Get immediate feedback after each answer</li>
                  <li>• Learn strategies for each part of the test</li>
                  <li>• Practice at your own pace with no pressure</li>
                  <li>• Try answers multiple times to improve</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
} 