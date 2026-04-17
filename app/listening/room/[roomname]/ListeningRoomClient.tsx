'use client';

/**
 * ListeningRoomClient
 * ═══════════════════
 * Full IELTS Listening Coach session powered by the ANAM avatar via LiveKit.
 *
 * Architecture mirrors PageClientImpl exactly:
 *   1. Auto-joins LiveKit room (no camera/mic pre-join screen needed for listening)
 *   2. Dispatches "listening-coach" agent
 *   3. Renders ANAM avatar video in the main panel (same AvatarOnlyView logic)
 *   4. Listens on RoomEvent.DataReceived for JSON phase/questions/score messages
 *      from the Python agent and updates the sidebar UI accordingly
 *   5. Student speaks via mic — LiveKit captures → Deepgram STT → OpenAI Realtime
 *      → Mia responds via ANAM lip-synced avatar
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react';

import {
  Room,
  RoomEvent,
  RemoteVideoTrack,
  RemoteParticipant,
  Track,
  RoomConnectOptions,
} from 'livekit-client';

import { useAuth } from '@/components/auth/AuthProvider';
import { CheckCircle2, XCircle, Mic, MicOff, PhoneOff, ChevronRight } from 'lucide-react';

// ─── types ────────────────────────────────────────────────────────────────────

type Phase =
  | 'connecting'
  | 'intro'
  | 'preview'
  | 'passage'
  | 'qa'
  | 'feedback';

type Question = {
  id: number;
  type: 'multiple_choice' | 'fill_blank' | 'short_answer';
  question: string;
  options?: string[];
};

type ScoreResult = {
  score: number;
  total: number;
  results: {
    id: number;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }[];
};

// ─── section meta (for phase label display) ──────────────────────────────────

const SECTION_META: Record<string, { label: string; description: string }> = {
  section1: { label: 'Section 1', description: 'Social Conversation' },
  section2: { label: 'Section 2', description: 'Social Monologue' },
  section3: { label: 'Section 3', description: 'Educational Conversation' },
  section4: { label: 'Section 4', description: 'Academic Lecture' },
};

const PHASE_LABELS: Record<Phase, string> = {
  connecting: 'Connecting…',
  intro: 'Introduction & Strategies',
  preview: 'Question Preview',
  passage: 'Now Listening',
  qa: 'Questions & Answers',
  feedback: 'Feedback & Score',
};

const PHASE_STEPS: Phase[] = ['intro', 'preview', 'passage', 'qa', 'feedback'];

// ─── connection details endpoint (same as Speaking) ──────────────────────────
const CONN_DETAILS_ENDPOINT = '/api/livekit/connection-details';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getDisplayName(user: any): string {
  return (
    user?.full_name ||
    user?.username ||
    user?.name ||
    (user?.email ? String(user.email).split('@')[0] : '') ||
    'Student'
  );
}

// ─── Avatar video component (identical logic to PageClientImpl AvatarOnlyView) ─

function AvatarVideoView({ room }: { room: Room }) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [track, setTrack] = React.useState<RemoteVideoTrack | null>(null);

  const pickParticipant = React.useCallback((): RemoteParticipant | null => {
    const remotes = Array.from(room.remoteParticipants.values());
    return (
      remotes.find((p) => String(p.identity || '').includes('anam-avatar')) ||
      remotes.find((p) => String(p.identity || '').toLowerCase().includes('agent')) ||
      remotes.find((p) => String(p.name || '').toLowerCase().includes('mia')) ||
      remotes[0] ||
      null
    );
  }, [room]);

  const refresh = React.useCallback(() => {
    const p = pickParticipant();
    if (!p) { setTrack(null); return; }

    let found: RemoteVideoTrack | null = null;
    for (const pub of p.trackPublications.values()) {
      const t = pub.track;
      if (!t || t.kind !== Track.Kind.Video) continue;
      if (pub.source === Track.Source.Camera || pub.source === Track.Source.Unknown) {
        found = t as RemoteVideoTrack;
        break;
      }
      if (!found) found = t as RemoteVideoTrack;
    }
    setTrack(found);
  }, [pickParticipant]);

  React.useEffect(() => {
    refresh();
    const events = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
    ];
    events.forEach((e) => room.on(e, refresh));
    return () => { events.forEach((e) => room.off(e, refresh)); };
  }, [room, refresh]);

  React.useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;
    track.attach(el);
    return () => { track.detach(el); };
  }, [track]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden">
      {track ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/60">
          <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-sm">Waiting for Mia…</p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* "Mia" name tag */}
      {track && (
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-xs font-semibold">Mia · IELTS Coach</span>
        </div>
      )}
    </div>
  );
}

// ─── Phase sidebar content ────────────────────────────────────────────────────

function PhaseSidebar({
  phase,
  questions,
  activeQuestionId,
  scoreResult,
  sectionKey,
}: {
  phase: Phase;
  questions: Question[];
  activeQuestionId: number | null;
  scoreResult: ScoreResult | null;
  sectionKey: string;
}) {
  const meta = SECTION_META[sectionKey] || SECTION_META.section1;

  // ── Connecting ──
  if (phase === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-emerald-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <p className="text-slate-600 text-sm text-center">
          Starting your session with Mia…<br />
          <span className="text-slate-400 text-xs">Allow microphone access when prompted</span>
        </p>
      </div>
    );
  }

  // ── Intro ──
  if (phase === 'intro') {
    return (
      <div className="p-5 space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
            Your Session
          </p>
          <p className="text-lg font-bold text-slate-900">{meta.label}</p>
          <p className="text-sm text-slate-600">{meta.description}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Session Flow</p>
          {PHASE_STEPS.map((p, i) => (
            <div key={p} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                p === phase ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm ${p === phase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                {PHASE_LABELS[p]}
              </span>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-800 mb-1">💡 Tip</p>
          <p className="text-sm text-amber-800">
            Mia is talking to you now. Listen carefully — she'll teach you the key
            strategies for this section before the passage begins.
          </p>
        </div>
      </div>
    );
  }

  // ── Preview — show questions read-only ──
  if (phase === 'preview') {
    return (
      <div className="p-5 space-y-4 overflow-y-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
            Question Preview
          </p>
          <p className="text-sm text-amber-800">
            Mia is reading these questions to you. Study them — know what to
            listen for before the passage starts.
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
            Questions loading…
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white border border-slate-200 rounded-lg p-4"
              >
                <p className="text-sm font-semibold text-slate-800 mb-2">
                  <span className="text-emerald-600 mr-1">{i + 1}.</span>
                  {q.question}
                </p>
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-1 pl-4">
                    {q.options.map((opt) => (
                      <div key={opt} className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                {(q.type === 'fill_blank' || q.type === 'short_answer') && (
                  <div className="pl-4">
                    <div className="h-5 w-32 border-b-2 border-slate-300 rounded" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Passage — questions stay visible but greyed with "listening" indicator ──
  if (phase === 'passage') {
    return (
      <div className="p-5 space-y-4 overflow-y-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              className="w-3 h-3 rounded-full bg-blue-500"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
              Now Playing
            </p>
          </div>
          <p className="text-sm text-blue-800">
            Mia is narrating the passage. Focus on listening. Refer to the
            questions below as guides.
          </p>
        </div>

        {questions.length > 0 && (
          <div className="space-y-2 opacity-70">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-700">
                  <span className="text-emerald-600 font-bold mr-1">{i + 1}.</span>
                  {q.question}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Q&A — highlight active question ──
  if (phase === 'qa') {
    return (
      <div className="p-5 space-y-4 overflow-y-auto">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
            Answer Time
          </p>
          <p className="text-sm text-emerald-800">
            Mia is asking each question. Answer by speaking — she'll hear you
            and move to the next one.
          </p>
        </div>

        {questions.length > 0 && (
          <div className="space-y-3">
            {questions.map((q, i) => {
              const isActive = q.id === activeQuestionId;
              return (
                <motion.div
                  key={q.id}
                  animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-slate-200 bg-white opacity-60'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-2 ${isActive ? 'text-emerald-900' : 'text-slate-700'}`}>
                    <span className={`mr-1 font-bold ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {i + 1}.
                    </span>
                    {q.question}
                  </p>
                  {isActive && q.type === 'multiple_choice' && q.options && (
                    <div className="space-y-1 pl-4">
                      {q.options.map((opt) => (
                        <div key={opt} className="flex items-center gap-2 text-xs text-emerald-700">
                          <div className="w-4 h-4 rounded-full border-2 border-emerald-400 flex-shrink-0" />
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {isActive && (
                    <div className="mt-3 flex items-center gap-2 text-emerald-600">
                      <Mic className="w-4 h-4" />
                      <span className="text-xs font-medium">Listening for your answer…</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Feedback — full score breakdown ──
  if (phase === 'feedback') {
    if (!scoreResult) {
      return (
        <div className="p-5 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading results…</p>
        </div>
      );
    }

    const pct = Math.round((scoreResult.score / scoreResult.total) * 100);
    const scoreColor =
      pct >= 75 ? 'from-emerald-600 to-emerald-800' :
      pct >= 50 ? 'from-blue-600 to-blue-800' :
                  'from-slate-600 to-slate-900';

    return (
      <div className="p-5 space-y-4 overflow-y-auto">
        {/* Score banner */}
        <div className={`bg-gradient-to-br ${scoreColor} rounded-2xl p-5 text-white text-center`}>
          <p className="text-sm opacity-80 mb-1">Your Score</p>
          <p className="text-5xl font-bold mb-1">
            {scoreResult.score}/{scoreResult.total}
          </p>
          <p className="text-sm opacity-90">
            {pct}% · {pct >= 75 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'}
          </p>
        </div>

        {/* Per-question results */}
        <div className="space-y-3">
          {scoreResult.results.map((r, i) => {
            const q = questions.find((q) => q.id === r.id);
            return (
              <div
                key={r.id}
                className={`rounded-xl border-2 p-4 ${
                  r.correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {r.correct
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  }
                  <p className="text-sm font-semibold text-slate-800">
                    <span className="text-emerald-600 mr-1">{i + 1}.</span>
                    {q?.question || `Question ${i + 1}`}
                  </p>
                </div>
                {!r.correct && (
                  <div className="pl-7 space-y-0.5 mb-1">
                    <p className="text-xs text-red-700">
                      Your answer: <strong>{r.userAnswer || '(no answer)'}</strong>
                    </p>
                    <p className="text-xs text-emerald-700">
                      Correct: <strong>{r.correctAnswer}</strong>
                    </p>
                  </div>
                )}
                <p className={`text-xs leading-relaxed pl-7 ${r.correct ? 'text-emerald-800' : 'text-red-800'}`}>
                  {r.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ListeningRoomClient({
  roomName,
  sectionKey,
}: {
  roomName: string;
  sectionKey: string;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [connectionDetails, setConnectionDetails] = React.useState<{
    serverUrl: string;
    roomName: string;
    participantToken: string;
    participantName: string;
  } | null>(null);
  const [connError, setConnError] = React.useState<string | null>(null);

  // Phase state (driven by agent data messages)
  const [phase, setPhase] = React.useState<Phase>('connecting');
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [activeQuestionId, setActiveQuestionId] = React.useState<number | null>(null);
  const [scoreResult, setScoreResult] = React.useState<ScoreResult | null>(null);

  // Mic mute UI
  const [micMuted, setMicMuted] = React.useState(false);
  const roomRef = React.useRef<Room | null>(null);

  const agentRequestedRef = React.useRef(false);

  const meta = SECTION_META[sectionKey] || SECTION_META.section1;
  const displayName = loading ? 'Student' : getDisplayName(user);

  // ── 1. Fetch connection details on mount ──
  React.useEffect(() => {
    if (loading) return;

    const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
    url.searchParams.append('roomName', roomName);
    url.searchParams.append('participantName', displayName);

    fetch(url.toString())
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text() || `HTTP ${r.status}`);
        return r.json();
      })
      .then(setConnectionDetails)
      .catch((e) => setConnError(e?.message || 'Failed to get connection details'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, roomName, displayName]);

  // ── 2. Create stable Room instance ──
  const room = React.useMemo(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      }),
    []
  );

  React.useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // ── 3. DataReceived handler — agent drives all phase transitions ──
  React.useEffect(() => {
    const onData = (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));

        if (msg.type === 'phase') {
          setPhase(msg.phase as Phase);
        }

        if (msg.type === 'questions') {
          setQuestions(msg.questions || []);
        }

        if (msg.type === 'highlight') {
          setActiveQuestionId(msg.questionId ?? null);
        }

        if (msg.type === 'score') {
          setScoreResult({
            score: msg.score,
            total: msg.total,
            results: msg.results || [],
          });
          setPhase('feedback');
        }
      } catch {
        // non-JSON data — ignore
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => { room.off(RoomEvent.DataReceived, onData); };
  }, [room]);

  // ── 4. Request agent once connected ──
  const requestAgent = React.useCallback(async () => {
    if (agentRequestedRef.current) return;
    agentRequestedRef.current = true;

    try {
      const r = await fetch('/api/livekit/request-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: roomName,
          agentName: 'listening-coach',   // ← dispatches to agent_listening.py
        }),
      });
      if (!r.ok) console.error('request-agent failed', await r.text());
    } catch (e) {
      console.error('request-agent error', e);
    }
  }, [roomName]);

  // ── 5. Mic toggle ──
  // const toggleMic = () => {
  //   const r = roomRef.current;
  //   if (!r) return;
  //   const enabled = !micMuted;
  //   r.localParticipant?.setMicrophoneEnabled(enabled);
  //   setMicMuted(!enabled);
  // };

  const toggleMic = async () => {
  const r = roomRef.current
  if (!r) return

  // if currently muted => enable mic
  const enable = micMuted
  await r.localParticipant?.setMicrophoneEnabled(enable)
  setMicMuted(!micMuted)
}

  // ── 6. Leave room ──
  const leaveRoom = () => {
    roomRef.current?.disconnect();
    router.push('/listening/coach');
  };

  // ── Progress step index ──
  const stepIndex = PHASE_STEPS.indexOf(phase as any);

  // ── Error state ──
  if (connError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-900 text-white">
        <p className="text-red-400 text-sm">{connError}</p>
        <Link href="/listening/coach" className="text-emerald-400 underline text-sm">
          Back to section picker
        </Link>
      </div>
    );
  }

  // ── Loading ──
  if (!connectionDetails) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-900 text-white">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-emerald-400"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <p className="text-white/60 text-sm">Setting up your session…</p>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <LiveKitRoom
      room={room}
      token={connectionDetails.participantToken}
      serverUrl={connectionDetails.serverUrl}
      connect
      audio={true}
      video={false}
      connectOptions={{ autoSubscribe: true } as RoomConnectOptions}
      onConnected={requestAgent}
      onDisconnected={() => router.push('/listening/coach')}
      className="h-screen w-full bg-slate-950"
    >
      <RoomAudioRenderer />

      <div className="h-screen flex flex-col">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">IELTS Listening Coach</p>
              <p className="text-slate-400 text-xs">{meta.label} · {meta.description}</p>
            </div>
          </div>

          {/* Phase progress */}
          <div className="hidden md:flex items-center gap-2">
            {PHASE_STEPS.map((p, i) => (
              <React.Fragment key={p}>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${
                  stepIndex === i ? 'text-emerald-400' :
                  stepIndex > i  ? 'text-slate-400 line-through' :
                                   'text-slate-600'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    stepIndex > i  ? 'bg-emerald-700 text-emerald-200' :
                    stepIndex === i ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' :
                                     'bg-slate-700 text-slate-500'
                  }`}>
                    {stepIndex > i ? '✓' : i + 1}
                  </div>
                  <span className="hidden lg:inline">{PHASE_LABELS[p]}</span>
                </div>
                {i < PHASE_STEPS.length - 1 && (
                  <ChevronRight className={`w-3 h-3 flex-shrink-0 ${stepIndex > i ? 'text-emerald-600' : 'text-slate-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMic}
              className={`p-2 rounded-lg transition-colors ${
                micMuted
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={leaveRoom}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              title="Leave session"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">

          {/* Left: ANAM avatar video — large, dominant */}
          <div className="flex-1 p-4 min-h-0">
            <AvatarVideoView room={room} />
          </div>

          {/* Right: Phase sidebar */}
          <div className="w-80 xl:w-96 flex-shrink-0 bg-slate-900 border-l border-slate-700 flex flex-col min-h-0">

            {/* Phase banner */}
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="px-5 py-3 border-b border-slate-700 flex-shrink-0"
              >
                <div className="flex items-center gap-2">
                  {phase !== 'connecting' && (
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    {PHASE_LABELS[phase]}
                  </p>
                </div>
                {micMuted && (
                  <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                    <MicOff className="w-3 h-3" /> Mic muted — Mia can't hear you
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <PhaseSidebar
                    phase={phase}
                    questions={questions}
                    activeQuestionId={activeQuestionId}
                    scoreResult={scoreResult}
                    sectionKey={sectionKey}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom: Leave / New session */}
            {phase === 'feedback' && (
              <div className="p-4 border-t border-slate-700 flex gap-2 flex-shrink-0">
                <button
                  onClick={() => router.push('/listening/coach')}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                >
                  New Section
                </button>
                <button
                  onClick={() => router.push('/modules')}
                  className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
                >
                  Modules
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </LiveKitRoom>
  );
}
