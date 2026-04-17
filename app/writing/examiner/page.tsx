'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PrimaryButton from '@/components/ui/PrimaryButton';
import FeedbackAvatarModal from '@/components/ui/FeedbackAvatarModal';

type TaskType = 'task1' | 'task2';

type EvaluationCriterion = {
  name: string;
  score: number;
  description: string;
  color?: string;
};

type FeedbackAI = {
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  nextSteps?: string[];
  bandAdvice?: string;
};

type Evaluation = {
  overallScore: number;
  criteria: EvaluationCriterion[];
  examinerComments?: string[];
  feedbackAi?: FeedbackAI | null;
};

type ChartSpec =
  | {
      type: 'bar' | 'line';
      title?: string;
      yLabel?: string;
      categories: string[];
      series: { name: string; values: number[] }[];
    }
  | {
      type: 'pie';
      title?: string;
      labels: string[];
      values: number[];
    }
  | {
      type: 'table';
      title?: string;
      columns: string[];
      rows: (string | number)[][];
    }
  | {
      type: 'map';
      title?: string;
      unit?: string;
      regions: { name: string; value: number }[];
    };

type WritingQuestionPayload = {
  taskType: 'task1' | 'task2';
  title: string;
  question: string;
  instructions: string[];
  minWords: number;
  imageDescription?: string | null;
  chart?: ChartSpec | null;
  chartSvg?: string | null;
};

function safeJsonParse<T = any>(txt: string | null): T | null {
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function getDisplayName(): string {
  if (typeof window === 'undefined') return 'anonymous';

  const direct =
    localStorage.getItem('full_name') ||
    localStorage.getItem('username') ||
    localStorage.getItem('name');

  if (direct && direct.trim()) return direct.trim();

  const userObj =
    safeJsonParse<any>(localStorage.getItem('user')) ||
    safeJsonParse<any>(localStorage.getItem('authUser')) ||
    safeJsonParse<any>(localStorage.getItem('profile'));

  const candidate =
    userObj?.full_name ||
    userObj?.name ||
    userObj?.username ||
    userObj?.user?.full_name ||
    userObj?.user?.name ||
    userObj?.user?.username;

  if (candidate && String(candidate).trim()) return String(candidate).trim();

  const email = localStorage.getItem('email') || userObj?.email || 'anonymous';
  return String(email).split('@')[0];
}

function getUserId(): string {
  if (typeof window === 'undefined') return 'anonymous';

  const direct = localStorage.getItem('userId');
  if (direct && direct.trim()) return direct.trim();

  const userObj =
    safeJsonParse<any>(localStorage.getItem('user')) ||
    safeJsonParse<any>(localStorage.getItem('authUser')) ||
    safeJsonParse<any>(localStorage.getItem('profile'));

  const candidate =
    userObj?.email ||
    userObj?.username ||
    userObj?.name ||
    userObj?.user?.email ||
    userObj?.user?.username;

  const plain =
    localStorage.getItem('email') ||
    localStorage.getItem('username') ||
    localStorage.getItem('name');

  const v = (candidate || plain || 'anonymous').toString().trim();
  return v.length ? v : 'anonymous';
}

export default function WritingExaminerPage() {
  const [currentTask, setCurrentTask] = useState<TaskType>('task1');

  const [essay, setEssay] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [feedbackComments, setFeedbackComments] = useState<string>('');

  const [task1Question, setTask1Question] = useState<WritingQuestionPayload | null>(null);
  const [task2Question, setTask2Question] = useState<WritingQuestionPayload | null>(null);

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [feedbackIframeKey, setFeedbackIframeKey] = useState(0);
  const [mountIframe, setMountIframe] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

  const normalize = (raw: any, task: TaskType): WritingQuestionPayload => {
    const defaultInstructions =
      task === 'task1'
        ? [
            'Summarize the information by selecting and reporting the main features',
            'Make comparisons where relevant',
            'Write at least 150 words',
            'You should spend about 20 minutes on this task',
          ]
        : [
            'Give reasons for your answer and include any relevant examples from your own knowledge or experience',
            'Write at least 250 words',
            'You should spend about 40 minutes on this task',
          ];

    return {
      taskType: task,
      title: (raw?.title ?? (task === 'task1' ? 'IELTS Writing Task 1' : 'IELTS Writing Task 2')).toString(),
      question: (raw?.question ?? raw?.prompt ?? '').toString(),
      instructions: Array.isArray(raw?.instructions) ? raw.instructions : defaultInstructions,
      minWords: Number(raw?.minWords ?? (task === 'task1' ? 150 : 250)),
      imageDescription: (raw?.imageDescription ?? raw?.diagramAlt ?? null) as string | null,
      chartSvg: (raw?.chartSvg ?? raw?.diagramSvg ?? null) as string | null,
      chart: (raw?.chart ?? null) as ChartSpec | null,
    };
  };

  const fetchQuestion = async (task: TaskType) => {
    setIsLoadingQuestion(true);
    setQuestionError(null);

    try {
      const res = await fetch(`${backendUrl}/writing/question?taskType=${task}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed to fetch question: ${res.status}`);
      }

      const raw = await res.json();
      const q = normalize(raw, task);

      if (!q.question || !q.question.trim()) {
        throw new Error('Backend returned an empty question. Check /writing/question output.');
      }

      if (task === 'task1') setTask1Question(q);
      else setTask2Question(q);
    } catch (e: any) {
      setQuestionError(e?.message || 'Failed to fetch question.');
      if (task === 'task1') setTask1Question(null);
      else setTask2Question(null);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('writing:lastTask');
    if (saved === 'task1' || saved === 'task2') {
      setCurrentTask(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('writing:lastTask', currentTask);
    }
    fetchQuestion(currentTask);
  }, [currentTask]);

  const currentTaskDetails: WritingQuestionPayload | null = useMemo(() => {
    return currentTask === 'task1' ? task1Question : task2Question;
  }, [currentTask, task1Question, task2Question]);

  const minWords = currentTaskDetails?.minWords ?? (currentTask === 'task1' ? 150 : 250);
  const wordCount = essay.trim().split(/\s+/).filter((w) => w.length > 0).length;

  const criteriaColor = (name: string) => {
    const map: Record<string, string> = {
      'Task Achievement': 'bg-blue-50 border-blue-200 text-blue-900',
      'Task Response': 'bg-blue-50 border-blue-200 text-blue-900',
      'Coherence and Cohesion': 'bg-emerald-50 border-emerald-200 text-emerald-900',
      'Lexical Resource': 'bg-purple-50 border-purple-200 text-purple-900',
      'Grammatical Range and Accuracy': 'bg-amber-50 border-amber-200 text-amber-900',
    };
    return map[name] || 'bg-slate-50 border-slate-200 text-slate-900';
  };

  const handleSubmit = async () => {
    const wc = wordCount;
    if (wc < minWords) return;
    if (!currentTaskDetails?.question) return;

    setIsSubmitted(true);
    setIsScoring(true);
    setScoreError(null);
    setEvaluation(null);

    try {
      const res = await fetch(`${backendUrl}/writing/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getUserId(),
          displayName: getDisplayName(),
          taskType: currentTask,
          question: currentTaskDetails.question,
          essay,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Scoring failed: ${res.status}`);
      }

      const data = await res.json();

      const criteria = (data.criteria || []).map((c: any) => ({
        name: String(c.name || ''),
        score: Number(c.score),
        description: String(c.description || ''),
        color: criteriaColor(String(c.name || '')),
      }));

      setEvaluation({
        overallScore: Number(data.overallScore),
        criteria,
        examinerComments: Array.isArray(data.examinerComments) ? data.examinerComments : undefined,
        feedbackAi: data?.feedback_ai
          ? {
              summary: data.feedback_ai.summary,
              strengths: Array.isArray(data.feedback_ai.strengths) ? data.feedback_ai.strengths : [],
              weaknesses: Array.isArray(data.feedback_ai.weaknesses) ? data.feedback_ai.weaknesses : [],
              nextSteps: Array.isArray(data.feedback_ai.nextSteps) ? data.feedback_ai.nextSteps : [],
              bandAdvice: data.feedback_ai.bandAdvice,
            }
          : null,
      });
    } catch (e: any) {
      setScoreError(e?.message || 'Failed to score your writing.');
    } finally {
      setIsScoring(false);
    }
  };

  const handleTaskSelection = (task: TaskType) => {
    setCurrentTask(task);
    setEssay('');
    setIsSubmitted(false);
    setEvaluation(null);
    setScoreError(null);
    setQuestionError(null);
    setFeedbackComments('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Examiner Mode
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">IELTS Writing</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Complete a realistic IELTS Writing task and receive band-style scoring with criterion-level feedback.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleTaskSelection('task1')}
              className={`rounded-xl px-5 py-3 font-semibold transition ${
                currentTask === 'task1'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Task 1
            </button>
            <button
              onClick={() => handleTaskSelection('task2')}
              className={`rounded-xl px-5 py-3 font-semibold transition ${
                currentTask === 'task2'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Task 2
            </button>
          </div>
        </motion.div>

        {!isSubmitted ? (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {currentTaskDetails?.title || (currentTask === 'task1' ? 'Task 1' : 'Task 2')}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">Question Prompt</h2>
                </div>

                <PrimaryButton
                  onClick={() => fetchQuestion(currentTask)}
                  variant="secondary"
                  className="whitespace-nowrap"
                >
                  New Question
                </PrimaryButton>
              </div>

              {questionError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
                  <div className="font-semibold mb-1">Question failed to load</div>
                  <div className="text-sm whitespace-pre-wrap">{questionError}</div>
                </div>
              )}

              {isLoadingQuestion ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                  Generating your IELTS writing question...
                </div>
              ) : currentTaskDetails ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-slate-800 leading-8">{currentTaskDetails.question}</p>
                  </div>

                  {currentTask === 'task1' && (
                    <div className="space-y-4">
                      {currentTaskDetails.chartSvg ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 overflow-x-auto">
                          <div
                            className="min-w-[760px]"
                            dangerouslySetInnerHTML={{ __html: currentTaskDetails.chartSvg }}
                          />
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <p className="text-sm text-slate-700 italic">
                            {isLoadingQuestion ? 'Generating diagram…' : 'No diagram generated.'}
                          </p>
                        </div>
                      )}

                      {currentTaskDetails.imageDescription && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <p className="text-sm text-slate-700 italic">{currentTaskDetails.imageDescription}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`border rounded-lg p-4 ${
                      currentTask === 'task1'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <p
                      className={`font-semibold mb-2 ${
                        currentTask === 'task1' ? 'text-blue-900' : 'text-emerald-900'
                      }`}
                    >
                      Instructions:
                    </p>
                    <ul className="space-y-2">
                      {(currentTaskDetails.instructions ?? []).map((instruction, index) => (
                        <li
                          key={index}
                          className={`flex items-start gap-2 text-sm ${
                            currentTask === 'task1' ? 'text-blue-800' : 'text-emerald-800'
                          }`}
                        >
                          <span
                            className={`font-bold mt-0.5 ${
                              currentTask === 'task1' ? 'text-blue-600' : 'text-emerald-600'
                            }`}
                          >
                            •
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Your Response</h3>
                <div className="text-right">
                  <span className={`text-sm font-medium ${wordCount >= minWords ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {wordCount} / {minWords} words minimum {wordCount >= minWords && '✓'}
                  </span>
                </div>
              </div>

              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder={`Write your ${currentTask === 'task1' ? 'report' : 'essay'} here. You must write at least ${minWords} words.`}
                className="w-full h-96 p-6 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-slate-800 leading-relaxed font-mono text-sm"
                disabled={isSubmitted}
              />

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <PrimaryButton
                  onClick={handleSubmit}
                  disabled={wordCount < minWords || !currentTaskDetails?.question}
                  className={`flex-1 ${currentTask === 'task1' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {wordCount < minWords ? `Write ${minWords - wordCount} more words to submit` : 'Submit for Evaluation'}
                </PrimaryButton>

                {essay.length > 0 && !isSubmitted && (
                  <PrimaryButton onClick={() => setEssay('')} variant="ghost">
                    Clear
                  </PrimaryButton>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row gap-4">
              <Link href="/writing/coach" className="flex-1">
                <PrimaryButton variant="secondary" className="w-full">
                  Try Coach Mode
                </PrimaryButton>
              </Link>
              <Link href="/modules" className="flex-1">
                <PrimaryButton variant="ghost" className="w-full">
                  Back to Modules
                </PrimaryButton>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl shadow-2xl p-8 text-white text-center bg-gradient-to-br from-slate-700 to-slate-900"
            >
              <p className="text-lg font-medium mb-2 opacity-90">Overall Band Score</p>
              <div className="text-7xl font-bold mb-2">
                {evaluation ? evaluation.overallScore : isScoring ? 'Scoring…' : '-'}
              </div>
              <p className="text-lg opacity-90">out of 9.0</p>
            </motion.div>

            {scoreError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
                <div className="font-semibold mb-1">Scoring failed</div>
                <div className="text-sm whitespace-pre-wrap">{scoreError}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(evaluation?.criteria || []).map((criterion) => (
                <div key={criterion.name} className={`${criterion.color} rounded-xl p-6 border-2`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{criterion.name}</h3>
                    <span className="text-3xl font-bold">{criterion.score}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{criterion.description}</p>
                </div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row gap-4">
              <PrimaryButton
                onClick={() => {
                  setEssay('');
                  setIsSubmitted(false);
                  setEvaluation(null);
                  setFeedbackComments('');
                  fetchQuestion(currentTask);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800"
              >
                Practice Again
              </PrimaryButton>

              <FeedbackAvatarModal
                label="Feedback"
                comments={feedbackComments}
                setComments={setFeedbackComments}
                buttonClassName="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                writingFeedback={
                  evaluation && currentTaskDetails?.question
                    ? {
                        taskType: currentTask,
                        question: currentTaskDetails.question,
                        essay,
                        overallScore: evaluation.overallScore,
                        criteria: evaluation.criteria.map((c) => ({
                          name: c.name,
                          score: c.score,
                          description: c.description,
                        })),
                        feedbackAi: evaluation.feedbackAi || null,
                      }
                    : null
                }
                onOpen={() => {
                  try {
                    if (evaluation && currentTaskDetails?.question) {
                      const payload = {
                        taskType: currentTask,
                        question: currentTaskDetails.question,
                        essay,
                        evaluation,
                        ts: Date.now(),
                      };
                      localStorage.setItem('writing_feedback_context', JSON.stringify(payload));
                    } else {
                      localStorage.removeItem('writing_feedback_context');
                    }
                  } catch {
                    // ignore storage errors
                  }

                  setMountIframe(true);
                }}
                onStop={() => {
                  setMountIframe(false);
                  setFeedbackIframeKey((k) => k + 1);
                }}
                AvatarSlot={
                  mountIframe ? (
                    <iframe
                      key={feedbackIframeKey}
                      src="/livekit/room/feedback?hq=false&codec=vp9&embed=true"
                      className="h-[540px] w-full rounded-2xl border border-slate-200"
                      allow="camera; microphone; autoplay; clipboard-read; clipboard-write"
                    />
                  ) : (
                    <div className="h-[540px] w-full grid place-items-center text-slate-500">
                      Click Feedback to start avatar…
                    </div>
                  )
                }
              />

              <Link href="/modules" className="flex-1">
                <PrimaryButton variant="ghost" className="w-full">
                  Back to Modules
                </PrimaryButton>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}