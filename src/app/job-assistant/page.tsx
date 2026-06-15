'use client';

import { useState, useRef, useCallback } from 'react';
import { useLocale } from 'i18n/LocaleProvider';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'analyzing' | 'initial-score' | 'improving' | 'improved-cv' | 'interview-generating' | 'interview' | 'concluding' | 'coaching-report';

interface ScoreBreakdown {
  skillsMatch: { score: number; comment: string };
  experienceMatch: { score: number; comment: string };
  educationMatch: { score: number; comment: string };
  keywordsMatch: { score: number; comment: string };
  overallPresentation: { score: number; comment: string };
}

interface AnalysisResult {
  overallScore: number;
  cvText: string;
  breakdown: ScoreBreakdown;
  topStrengths: string[];
  topGaps: string[];
  summary: string;
}

interface ImprovementResult {
  improvedCvSections: { heading: string; content: string }[];
  newScore: number;
  scoreBreakdown: Record<string, number>;
  keyChanges: string[];
  improvementSummary: string;
  docxBase64: string;
}

interface InterviewQuestion {
  id: number;
  type: string;
  question: string;
  whatWeAssess: string;
  idealAnswerPoints: string[];
  suggestedAnswer: string;
}

interface InterviewData {
  questions: InterviewQuestion[];
  roleTitle: string;
  interviewTips: string[];
}

interface AnswerScore {
  score: number;
  scoreLabel: string;
  strengths: string[];
  improvements: string[];
  quickFeedback: string;
  betterPhrasing: string;
}

interface AnsweredQuestion {
  question: string;
  type: string;
  score: number;
  userAnswer: string;
  feedback: AnswerScore;
  suggestedAnswer: string;
}

interface CoachingReport {
  overallScore: number;
  overallVerdict: string;
  executiveSummary: string;
  performanceByType: Record<string, { avgScore: number; comment: string }>;
  topStrengths: string[];
  criticalImprovements: string[];
  coachingPlan: { area: string; priority: string; advice: string; practiceExercise: string }[];
  interviewReadiness: string;
  encouragingClose: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-400';
  return 'bg-red-400';
}

function typeLabel(type: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    behavioral: t('jobAssistant.questionTypes.behavioral'),
    technical: t('jobAssistant.questionTypes.technical'),
    motivational: t('jobAssistant.questionTypes.motivational'),
    situational: t('jobAssistant.questionTypes.situational'),
  };
  return map[type] || type;
}

function typeBadgeColor(type: string): string {
  const map: Record<string, string> = {
    behavioral: 'bg-blue-100 text-blue-700',
    technical: 'bg-purple-100 text-purple-700',
    motivational: 'bg-amber-100 text-amber-700',
    situational: 'bg-teal-100 text-teal-700',
  };
  return map[type] || 'bg-gray-100 text-gray-700';
}

function priorityColor(priority: string): string {
  if (priority === 'High') return 'text-red-600 bg-red-50 border-red-200';
  if (priority === 'Medium') return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-emerald-600 bg-emerald-50 border-emerald-200';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) {
  const r = size === 'lg' ? 52 : 36;
  const cx = size === 'lg' ? 64 : 44;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={cx * 2} height={cx * 2} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size === 'lg' ? 10 : 7} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
          strokeWidth={size === 'lg' ? 10 : 7}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span className={`absolute font-bold ${size === 'lg' ? 'text-3xl' : 'text-lg'} ${scoreColor(score)}`}>
        {score}
      </span>
    </div>
  );
}

function StepIndicator({ current, t }: { current: Step; t: (key: string) => string }) {
  const steps = [
    { id: 'upload', label: t('jobAssistant.steps.upload') },
    { id: 'score', label: t('jobAssistant.steps.score') },
    { id: 'cv', label: t('jobAssistant.steps.cv') },
    { id: 'interview', label: t('jobAssistant.steps.interview') },
    { id: 'coaching', label: t('jobAssistant.steps.coaching') },
  ];

  const stepMap: Record<Step, number> = {
    upload: 0, analyzing: 0,
    'initial-score': 1,
    improving: 2, 'improved-cv': 2,
    'interview-generating': 3, interview: 3,
    concluding: 4, 'coaching-report': 4,
  };

  const currentIdx = stepMap[current];

  return (
    <div className="flex items-center justify-center gap-0 mb-8 px-2">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all
              ${idx < currentIdx ? 'bg-emerald-500 text-white' : idx === currentIdx ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-gray-200 text-gray-400'}`}>
              {idx < currentIdx ? '✓' : idx + 1}
            </div>
            <span className={`hidden sm:block text-xs mt-1 font-medium ${idx === currentIdx ? 'text-emerald-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
            <span className={`sm:hidden text-[10px] mt-1 font-medium text-center leading-tight max-w-[40px] ${idx === currentIdx ? 'text-emerald-600' : 'text-gray-400'}`}>
              {step.label.split(' ')[0]}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-6 sm:w-12 h-0.5 mb-4 mx-0.5 sm:mx-1 transition-all ${idx < currentIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-gray-500 text-base animate-pulse">{message}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JobAssistantPage() {
  const { t, locale } = useLocale();
  const [step, setStep] = useState<Step>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [improvementResult, setImprovementResult] = useState<ImprovementResult | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [currentScore, setCurrentScore] = useState<AnswerScore | null>(null);
  const [showSuggestedAnswer, setShowSuggestedAnswer] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [coachingReport, setCoachingReport] = useState<CoachingReport | null>(null);

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  interface SpeechRecognitionInstance {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    onresult: ((event: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null;
  }
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isSpeechSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
    const w = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = locale === 'hu' ? 'hu-HU' : locale === 'fr' ? 'fr-FR' : 'en-US';

    let baseText = userAnswer;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        baseText = (baseText ? baseText + ' ' : '') + final.trim();
      }
      setUserAnswer(baseText + (interim ? (baseText ? ' ' : '') + interim : ''));
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isRecording, userAnswer, locale]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setCvFile(file);
      setError('');
    } else {
      setError(t('jobAssistant.errors.uploadCv'));
    }
  }, [t]);

  const handleAnalyze = async () => {
    if (!cvFile) return setError(t('jobAssistant.errors.uploadCv'));
    if (!jobDescription.trim()) return setError(t('jobAssistant.errors.pasteJob'));
    setError('');
    setStep('analyzing');

    try {
      const fd = new FormData();
      fd.append('cv', cvFile);
      fd.append('jobDescription', jobDescription);
      fd.append('locale', locale);

      const res = await fetch('/api/job-assistant/analyze', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('jobAssistant.errors.analysisFailed'));

      setAnalysisResult(data);
      setStep('initial-score');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('jobAssistant.errors.somethingWrong'));
      setStep('upload');
    }
  };

  const handleImprove = async () => {
    if (!analysisResult) return;
    setStep('improving');

    try {
      const res = await fetch('/api/job-assistant/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: analysisResult.cvText, jobDescription, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('jobAssistant.errors.improvementFailed'));

      setImprovementResult(data);
      setStep('improved-cv');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('jobAssistant.errors.somethingWrong'));
      setStep('initial-score');
    }
  };

  const handleDownloadDocx = () => {
    if (!improvementResult?.docxBase64) return;
    const bytes = Uint8Array.from(atob(improvementResult.docxBase64), c => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-cv.docx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateInterview = async () => {
    if (!analysisResult) return;
    setStep('interview-generating');

    try {
      const res = await fetch('/api/job-assistant/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: analysisResult.cvText, jobDescription, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('jobAssistant.errors.interviewFailed'));

      setInterviewData(data);
      setCurrentQuestionIdx(0);
      setAnsweredQuestions([]);
      setUserAnswer('');
      setCurrentScore(null);
      setStep('interview');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('jobAssistant.errors.somethingWrong'));
      setStep('improved-cv');
    }
  };

  const handleScoreAnswer = async () => {
    if (!interviewData || !userAnswer.trim()) return;
    setIsScoring(true);
    setCurrentScore(null);

    const q = interviewData.questions[currentQuestionIdx];
    try {
      const res = await fetch('/api/job-assistant/interview/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          questionType: q.type,
          idealAnswerPoints: q.idealAnswerPoints,
          userAnswer,
          jobDescription,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('jobAssistant.errors.scoringFailed'));
      setCurrentScore(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('jobAssistant.errors.scoringFailed'));
    } finally {
      setIsScoring(false);
    }
  };

  const handleNextQuestion = () => {
    if (!interviewData || !currentScore) return;
    const q = interviewData.questions[currentQuestionIdx];
    setAnsweredQuestions(prev => [...prev, {
      question: q.question,
      type: q.type,
      score: currentScore.score,
      userAnswer,
      feedback: currentScore,
      suggestedAnswer: q.suggestedAnswer,
    }]);

    if (currentQuestionIdx < interviewData.questions.length - 1) {
      setCurrentQuestionIdx(i => i + 1);
      setUserAnswer('');
      setCurrentScore(null);
      setShowSuggestedAnswer(false);
      recognitionRef.current?.stop();
    } else {
      handleConclude([...answeredQuestions, {
        question: q.question,
        type: q.type,
        score: currentScore.score,
        userAnswer,
        feedback: currentScore,
        suggestedAnswer: q.suggestedAnswer,
      }]);
    }
  };

  const handleConclude = async (finalAnswers: AnsweredQuestion[]) => {
    setStep('concluding');
    try {
      const res = await fetch('/api/job-assistant/interview/conclude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answeredQuestions: finalAnswers,
          jobDescription,
          roleTitle: interviewData?.roleTitle,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('jobAssistant.errors.reportFailed'));
      setCoachingReport(data);
      setStep('coaching-report');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('jobAssistant.errors.somethingWrong'));
      setStep('interview');
    }
  };

  const handleRestart = () => {
    setStep('upload');
    setCvFile(null);
    setJobDescription('');
    setAnalysisResult(null);
    setImprovementResult(null);
    setInterviewData(null);
    setAnsweredQuestions([]);
    setCoachingReport(null);
    setCurrentScore(null);
    setUserAnswer('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('jobAssistant.header.title')}</h1>
          <p className="text-gray-500 mt-2">{t('jobAssistant.header.subtitle')}</p>
        </div>

        <StepIndicator current={step} t={t} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* ── STEP: UPLOAD ── */}
        {step === 'upload' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t('jobAssistant.upload.cvLabel')}</label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${isDragging ? 'border-emerald-400 bg-emerald-50' : cvFile ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setCvFile(f); setError(''); } }} />
                {cvFile ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-medium text-emerald-700">{cvFile.name}</p>
                    <p className="text-sm text-gray-400">{(cvFile.size / 1024).toFixed(0)} KB · {t('jobAssistant.upload.clickToChange')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-500">{t('jobAssistant.upload.dropHint')} <span className="text-emerald-600 font-medium">{t('jobAssistant.upload.browse')}</span></p>
                    <p className="text-xs text-gray-400">{t('jobAssistant.upload.pdfOnly')}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t('jobAssistant.upload.jobLabel')}</label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={8}
                placeholder={t('jobAssistant.upload.jobPlaceholder')}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{jobDescription.length} {t('jobAssistant.upload.characters')}</p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!cvFile || !jobDescription.trim()}
              className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {t('jobAssistant.upload.analyzeButton')}
            </button>
          </div>
        )}

        {/* ── STEP: ANALYZING ── */}
        {step === 'analyzing' && <LoadingSpinner message={t('jobAssistant.loading.analyzing')} />}

        {/* ── STEP: INITIAL SCORE ── */}
        {step === 'initial-score' && analysisResult && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('jobAssistant.initialScore.title')}</h2>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 mb-8">
                <div className="flex-shrink-0">
                  <ScoreRing score={analysisResult.overallScore} />
                </div>
                <div className="text-center sm:text-left">
                  <p className={`text-4xl font-bold ${scoreColor(analysisResult.overallScore)}`}>
                    {analysisResult.overallScore}/100
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{analysisResult.summary}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {Object.entries(analysisResult.breakdown).map(([key, val]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 font-medium">{label}</span>
                        <span className={`font-semibold ${scoreColor(val.score)}`}>{val.score}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(val.score)}`}
                          style={{ width: `${val.score}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{val.comment}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">{t('jobAssistant.initialScore.topStrengths')}</p>
                  <ul className="space-y-1">
                    {analysisResult.topStrengths.map((s, i) => (
                      <li key={i} className="text-sm text-emerald-800 flex gap-2"><span>✓</span>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">{t('jobAssistant.initialScore.topGaps')}</p>
                  <ul className="space-y-1">
                    {analysisResult.topGaps.map((g, i) => (
                      <li key={i} className="text-sm text-red-800 flex gap-2"><span>!</span>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleImprove}
                className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex flex-col items-center gap-0.5"
              >
                <span>{t('jobAssistant.initialScore.optimizeButton')}</span>
                <span className="text-xs font-normal opacity-80">{t('jobAssistant.initialScore.optimizeSubtitle')}</span>
              </button>
              <button
                onClick={handleGenerateInterview}
                className="w-full py-3.5 bg-white border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all flex flex-col items-center gap-0.5"
              >
                <span>{t('jobAssistant.initialScore.skipButton')}</span>
                <span className="text-xs font-normal opacity-70">{t('jobAssistant.initialScore.skipSubtitle')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: IMPROVING ── */}
        {step === 'improving' && <LoadingSpinner message={t('jobAssistant.loading.improving')} />}

        {/* ── STEP: IMPROVED CV ── */}
        {step === 'improved-cv' && improvementResult && analysisResult && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('jobAssistant.improvedCv.title')}</h2>

              <div className="flex items-center justify-around mb-6">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{t('jobAssistant.improvedCv.before')}</p>
                  <ScoreRing score={analysisResult.overallScore} size="sm" />
                  <p className={`text-2xl font-bold mt-2 ${scoreColor(analysisResult.overallScore)}`}>
                    {analysisResult.overallScore}
                  </p>
                </div>
                <div className="text-2xl sm:text-3xl text-emerald-400 font-light">→</div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{t('jobAssistant.improvedCv.after')}</p>
                  <ScoreRing score={improvementResult.newScore} size="sm" />
                  <p className={`text-2xl font-bold mt-2 ${scoreColor(improvementResult.newScore)}`}>
                    {improvementResult.newScore}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{t('jobAssistant.improvedCv.gain')}</p>
                  <div className="w-[72px] sm:w-[88px] h-[72px] sm:h-[88px] flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-600">
                      +{improvementResult.newScore - analysisResult.overallScore}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{improvementResult.improvementSummary}</p>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">{t('jobAssistant.improvedCv.keyChanges')}</p>
                <ul className="space-y-1">
                  {improvementResult.keyChanges.map((c, i) => (
                    <li key={i} className="text-sm text-emerald-800 flex gap-2"><span className="text-emerald-500">→</span>{c}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleDownloadDocx}
                className="w-full py-3 bg-white border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('jobAssistant.improvedCv.downloadButton')}
              </button>
            </div>

            <button
              onClick={handleGenerateInterview}
              className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
            >
              {t('jobAssistant.improvedCv.interviewButton')}
            </button>
          </div>
        )}

        {/* ── STEP: INTERVIEW GENERATING ── */}
        {step === 'interview-generating' && <LoadingSpinner message={t('jobAssistant.loading.generatingInterview')} />}

        {/* ── STEP: INTERVIEW ── */}
        {step === 'interview' && interviewData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">
                  {t('jobAssistant.interview.questionOf')
                    .replace('{current}', String(currentQuestionIdx + 1))
                    .replace('{total}', String(interviewData.questions.length))}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeBadgeColor(interviewData.questions[currentQuestionIdx]?.type)}`}>
                  {typeLabel(interviewData.questions[currentQuestionIdx]?.type, t)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestionIdx + 1) / interviewData.questions.length) * 100}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                {t('jobAssistant.interview.whatWeAssess')} {interviewData.questions[currentQuestionIdx]?.whatWeAssess}
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {interviewData.questions[currentQuestionIdx]?.question}
              </h3>

              <div className="relative">
                <textarea
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  rows={6}
                  placeholder={isRecording ? t('jobAssistant.interview.recordingPlaceholder') : t('jobAssistant.interview.answerPlaceholder')}
                  disabled={!!currentScore}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500 transition-all ${
                    isRecording
                      ? 'border-red-300 focus:ring-red-300 bg-red-50/30'
                      : 'border-gray-200 focus:ring-emerald-400'
                  }`}
                />
                {isRecording && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-red-600 font-medium">{t('jobAssistant.interview.recording')}</span>
                  </div>
                )}
              </div>

              {!currentScore && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleScoreAnswer}
                    disabled={!userAnswer.trim() || isScoring || isRecording}
                    className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {isScoring ? t('jobAssistant.interview.scoringButton') : t('jobAssistant.interview.submitButton')}
                  </button>

                  {/* Mic button - only shown on supported browsers */}
                  {isSpeechSupported && (
                    <button
                      onClick={handleToggleRecording}
                      title={isRecording ? t('jobAssistant.interview.stopRecording') : t('jobAssistant.interview.startRecording')}
                      className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                          </svg>
                        </>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setShowSuggestedAnswer(s => !s)}
                    className="px-4 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all text-sm"
                  >
                    {showSuggestedAnswer ? t('jobAssistant.interview.hideHint') : t('jobAssistant.interview.showHint')}
                  </button>
                </div>
              )}

              {showSuggestedAnswer && !currentScore && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-semibold text-amber-700 mb-1">{t('jobAssistant.interview.hintLabel')}</p>
                  <p className="text-sm text-amber-800">{interviewData.questions[currentQuestionIdx]?.suggestedAnswer}</p>
                </div>
              )}
            </div>

            {currentScore && (
              <div className={`rounded-2xl border p-5 sm:p-6 ${scoreBg(currentScore.score)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <ScoreRing score={currentScore.score} size="sm" />
                    <p className={`text-lg sm:text-xl font-bold ${scoreColor(currentScore.score)}`}>
                      {currentScore.score}/100 — {currentScore.scoreLabel}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 sm:mt-0.5">{currentScore.quickFeedback}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 mb-1">{t('jobAssistant.interview.strengthsLabel')}</p>
                    <ul className="space-y-1">
                      {currentScore.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-gray-700">{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-1">{t('jobAssistant.interview.improveLabel')}</p>
                    <ul className="space-y-1">
                      {currentScore.improvements.map((s, i) => (
                        <li key={i} className="text-xs text-gray-700">{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {currentScore.betterPhrasing && (
                  <div className="bg-white/70 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">{t('jobAssistant.interview.betterPhrasing')}</p>
                    <p className="text-xs text-gray-700 italic">&ldquo;{currentScore.betterPhrasing}&rdquo;</p>
                  </div>
                )}

                <div className="bg-white/50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">{t('jobAssistant.interview.suggestedAnswer')}</p>
                  <p className="text-xs text-gray-700">{interviewData.questions[currentQuestionIdx]?.suggestedAnswer}</p>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
                >
                  {currentQuestionIdx < interviewData.questions.length - 1
                    ? t('jobAssistant.interview.nextQuestion')
                    : t('jobAssistant.interview.getReport')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: CONCLUDING ── */}
        {step === 'concluding' && <LoadingSpinner message={t('jobAssistant.loading.generatingReport')} />}

        {/* ── STEP: COACHING REPORT ── */}
        {step === 'coaching-report' && coachingReport && (
          <div className="space-y-6">
            <div className={`rounded-2xl border p-5 sm:p-8 ${scoreBg(coachingReport.overallScore)}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
                <div className="flex-shrink-0 flex justify-center sm:block">
                  <ScoreRing score={coachingReport.overallScore} />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('jobAssistant.coaching.overallScore')}</p>
                  <p className={`text-4xl font-bold ${scoreColor(coachingReport.overallScore)}`}>
                    {coachingReport.overallScore}/100
                  </p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    {coachingReport.overallVerdict} · {coachingReport.interviewReadiness}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{coachingReport.executiveSummary}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('jobAssistant.coaching.performanceTitle')}</h3>
              <div className="space-y-4">
                {Object.entries(coachingReport.performanceByType).map(([type, val]) => (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadgeColor(type)}`}>{typeLabel(type, t)}</span>
                      <span className={`font-semibold ${scoreColor(val.avgScore)}`}>{val.avgScore}/100</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div className={`h-full rounded-full ${scoreBarColor(val.avgScore)}`}
                        style={{ width: `${val.avgScore}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{val.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">{t('jobAssistant.coaching.topStrengths')}</p>
                <ul className="space-y-2">
                  {coachingReport.topStrengths.map((s, i) => (
                    <li key={i} className="text-sm text-emerald-800 flex gap-2"><span>✓</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">{t('jobAssistant.coaching.mustImprove')}</p>
                <ul className="space-y-2">
                  {coachingReport.criticalImprovements.map((s, i) => (
                    <li key={i} className="text-sm text-red-800 flex gap-2"><span>!</span>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('jobAssistant.coaching.coachingPlanTitle')}</h3>
              <div className="space-y-4">
                {coachingReport.coachingPlan.map((item, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium whitespace-nowrap ${priorityColor(item.priority)}`}>
                        {t('jobAssistant.coaching.priority').replace('{level}', item.priority)}
                      </span>
                      <span className="font-semibold text-sm text-gray-800">{item.area}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.advice}</p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                      <p className="text-xs font-semibold text-blue-700 mb-0.5">{t('jobAssistant.coaching.weeklyExercise')}</p>
                      <p className="text-xs text-blue-800">{item.practiceExercise}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('jobAssistant.coaching.reviewTitle')}</h3>
              <div className="space-y-3">
                {answeredQuestions.map((aq, i) => (
                  <details key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                    <summary className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50 gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium self-start ${typeBadgeColor(aq.type)}`}>{typeLabel(aq.type, t)}</span>
                        <span className="text-sm text-gray-700 font-medium leading-snug">{aq.question.substring(0, 60)}...</span>
                      </div>
                      <span className={`text-sm font-bold flex-shrink-0 ${scoreColor(aq.score)}`}>{aq.score}/100</span>
                    </summary>
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">{t('jobAssistant.coaching.yourAnswer')}</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{aq.userAnswer}</p>
                      </div>
                      <p className="text-sm text-gray-600">{aq.feedback.quickFeedback}</p>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">{t('jobAssistant.coaching.suggestedAnswer')}</p>
                        <p className="text-sm text-gray-600 italic bg-emerald-50 rounded-lg p-3">{aq.suggestedAnswer}</p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-5 sm:p-6 text-white text-center">
              <p className="text-base sm:text-lg font-medium">{coachingReport.encouragingClose}</p>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-all"
            >
              {t('jobAssistant.coaching.restartButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}