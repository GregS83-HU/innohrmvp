'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Send, MessageCircle, Heart, BarChart3, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLocale } from 'i18n/LocaleProvider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  typing?: boolean;
}

interface PermaScores {
  positive?: number;
  engagement?: number;
  relationships?: number;
  meaning?: number;
  accomplishment?: number;
  work_life_balance?: number;
}

interface CreateSessionRequest {
  company_id?: number;
}

const HappinessCheckInner: React.FC = () => {
  const { t, locale } = useLocale();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [permaScores, setPermaScores] = useState<PermaScores>({});
  const [sessionStarted, setSessionStarted] = useState(false);
  const [personalizedAdvice, setPersonalizedAdvice] = useState<string[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Refs for scroll + focus control
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract company info from URL or search params
  useEffect(() => {
    const extractCompanyInfo = async () => {
      try {
        const slugMatch = pathname?.match(/^\/jobs\/([^/]+)/);
        const companySlug = slugMatch ? slugMatch[1] : null;
        const companyIdFromParams = searchParams?.get('company_id');

        if (companyIdFromParams) {
          setCompanyId(companyIdFromParams);
          await fetchCompanyName(companyIdFromParams);
        } else if (companySlug && companySlug !== 'demo') {
          await fetchCompanyFromSlug(companySlug);
        }
      } catch (err) {
        console.error('Error extracting company info:', err);
      }
    };

    extractCompanyInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  const fetchCompanyFromSlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('company')
        .select('id, company_name')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Supabase error fetching company by slug:', error);
        return;
      }

      if (data) {
        setCompanyId(data.id.toString());
        setCompanyName(data.company_name || '');
      }
    } catch (error) {
      console.error('Error fetching company from slug:', error);
    }
  };

  const fetchCompanyName = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('company')
        .select('company_name')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error fetching company name:', error);
        return;
      }

      if (data) {
        setCompanyName(data.company_name || '');
      }
    } catch (error) {
      console.error('Error fetching company name:', error);
    }
  };

  // Create a session and show the welcome message
  const createSession = async () => {
    try {
      const requestBody: CreateSessionRequest = {};
      if (companyId) requestBody.company_id = parseInt(companyId);

      const response = await fetch('/api/happiness/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-lang': locale,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (response.ok) {
        setSessionToken(data.sessionToken);

        const welcomeText = companyName
          ? t('welcome.company', { companyName })
          : t('welcome.default');

        const welcomeMessage: Message = {
          id: 'welcome',
          text: welcomeText,
          isBot: true,
          timestamp: new Date(),
        };

        // Add message to state first so that the container can render it and we can scroll to it.
        setMessages([welcomeMessage]);

        // Mark sessionStarted shortly after welcome rendered.
        setTimeout(() => {
          setSessionStarted(true);
        }, 120);
      } else {
        console.error('Session creation error:', data.error);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Send a user's message to the chat API
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !sessionToken || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date(),
    };

    // Append user message
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Show typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '...',
      isBot: true,
      timestamp: new Date(),
      typing: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/happiness/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken!,
          'x-lang': locale,
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      // Remove typing indicator
      setMessages((prev) => prev.filter((m) => m.id !== 'typing'));

      if (response.ok) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isBot: true,
          timestamp: new Date(),
        };

        // Append bot message after a small delay for nicer pacing
        setTimeout(() => {
          setMessages((prev) => [...prev, botMessage]);
          setCurrentStep(data.step);
          setPermaScores(data.scores || {});
          setIsCompleted(data.completed);

          if (data.completed && data.personalizedAdvice) {
            setPersonalizedAdvice(data.personalizedAdvice);
          }
        }, 600);
      } else {
        console.error('Chat error:', data.error);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      setMessages((prev) => prev.filter((m) => m.id !== 'typing'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputValue.trim()) {
        sendMessage(inputValue);
      }
    }
  };

  const handleSubmit = () => {
    if (!isLoading && inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 8) return '😊';
    if (score >= 6) return '😐';
    return '😔';
  };

  const permaLabels = {
    positive: t('perma.positive'),
    engagement: t('perma.engagement'),
    relationships: t('perma.relationships'),
    meaning: t('perma.meaning'),
    accomplishment: t('perma.accomplishment'),
    work_life_balance: t('perma.work_life_balance'),
  };

  const resetSession = () => {
    setMessages([]);
    setSessionToken(null);
    setCurrentStep(0);
    setIsCompleted(false);
    setPermaScores({});
    setSessionStarted(false);
    setIsLoading(false);
    setInputValue('');
    setPersonalizedAdvice([]);
  };

  // Progress and scores component
  const ProgressSection: React.FC = () => (
    <div className="border-t border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">
          {t('progress.title')}
          {companyName && (
            <span className="text-xs font-normal text-blue-600 ml-2">• {companyName}</span>
          )}
        </h2>
        <div className="text-sm text-gray-500 font-medium">
          {t('progress.step', { currentStep })}
        </div>
      </div>

      <div className="w-full bg-gray-300 rounded-full h-2 mb-3">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.max((currentStep / 12) * 100, 5)}%` }}
        />
      </div>

      {Object.keys(permaScores).length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {Object.entries(permaScores).map(([key, score]) => (
            <div key={key} className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(score)}`}>
              {key.charAt(0).toUpperCase()}: {score}/10
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 text-center">
          {t('progress.permaIntro')}
        </div>
      )}
    </div>
  );

  // --- SCROLL & FOCUS CONTROL EFFECTS ---

  // 1) Ensure the very first bot welcome message is visible (center it) when it's the only message.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (messages.length === 1 && messages[0].isBot) {
      const timer = setTimeout(() => {
        const firstMsg = container.querySelector('[data-message-index="0"]') as HTMLElement | null;
        if (firstMsg) {
          firstMsg.scrollIntoView({ behavior: 'auto', block: 'center' });
        } else {
          container.scrollTop = 0;
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // 2) Auto-scroll to bottom & focus input after bot replies DURING the session,
  //    but only if there's at least one user message (prevents action on the initial welcome).
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (!sessionStarted) return;

    const lastMessage = messages[messages.length - 1];
    const hasUserMessage = messages.some((m) => !m.isBot);

    if (lastMessage && lastMessage.isBot && hasUserMessage) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

      if (isNearBottom) {
        const timer = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          // Focus AFTER scrolling so the browser doesn't jump unexpectedly
          inputRef.current?.focus();
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, sessionStarted]);

  // Render completed view
  if (isCompleted) {
    const avgScore =
      Object.keys(permaScores).length > 0
        ? Math.round((Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length) * 10) / 10
        : 0;

    const endMessage =
      avgScore >= 8
        ? t('completion.excellent')
        : avgScore >= 6.5
        ? t('completion.good')
        : avgScore >= 5
        ? t('completion.improvable')
        : t('completion.poor');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('completion.thankYou')}</h1>
              <p className="text-gray-600 text-lg">
                {t('completion.complete')}
                {companyName && <span className="block mt-2 text-blue-600 font-medium">{t('completion.recordedFor', { companyName })}</span>}
              </p>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">{t('completion.summaryTitle')}</h3>
              <p className="text-blue-700">{endMessage}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-2">{t('completion.overallScore')}</h2>
                <div className="text-4xl font-bold mb-2">{avgScore}/10</div>
                <p className="text-blue-100">{t('completion.happinessLevel')}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('completion.scoreByDomain')}</h3>
                <div className="space-y-2">
                  {Object.entries(permaScores).map(([key, score]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{permaLabels[key as keyof typeof permaLabels]}</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(score)}`}>
                        {getScoreEmoji(score)} {score}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {personalizedAdvice && personalizedAdvice.length > 0 ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  {t('completion.adviceTitle')}
                </h3>
                <p className="text-purple-700 text-sm mb-4">{t('completion.adviceIntro')}</p>
                <div className="space-y-3">
                  {personalizedAdvice.map((advice, index) => (
                    <div key={index} className="bg-white/70 rounded-lg p-4 border border-purple-100 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">{index + 1}</span>
                        <p className="text-gray-700 text-sm leading-relaxed">{advice}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-purple-600">{t('completion.aiTips')}</p>
                </div>
              </div>
            ) : null}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>{t('completion.privacyNote')}</strong>
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={resetSession} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {t('completion.newAssessment')}
              </button>

              <button onClick={() => (window.location.href = companyId ? `/jobs/company-${companyId}` : '/')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                {companyName ? t('completion.backTo', { companyName }) : t('completion.backHome')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render pre-start view
  if (!sessionStarted && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {t('app.title')}
                {companyName && <span className="block text-lg text-blue-600 font-medium mt-2">{t('app.subtitle', { companyName })}</span>}
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                {t('app.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <MessageCircle className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-blue-800">{t('features.conversationalTitle')}</h3>
                <p className="text-sm text-blue-600 text-center">{t('features.conversationalText')}</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-green-800">{t('features.scientificTitle')}</h3>
                <p className="text-sm text-green-600 text-center">{t('features.scientificText')}</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-purple-800">{t('features.quickTitle')}</h3>
                <p className="text-sm text-purple-600 text-center">
                  {t('features.quickText')}
                  <span className="block text-xs mt-1 opacity-80">{t('features.quickSub')}</span>
                </p>
              </div>
            </div>

            <button onClick={createSession} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
              {t('app.startButton')}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              {t('app.noPersonalData')}
              {companyName && ` ${t('app.resultsIncluded', { companyName })}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main chat view (session started)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 2rem)' }}>
          {/* Header */}
          <div className="bg-white border-b p-3">
            <h1 className="text-lg font-bold text-gray-800 text-center">{t('app.header')}</h1>
          </div>

          {/* Scrollable Messages Area - ref attached */}
          <div
            ref={messagesContainerRef}
            className="overflow-y-auto p-4 space-y-4"
            // approximate height calculation: header + progress + input/footer are subtracted
            style={{
              height: `calc(100vh - 2rem - 220px)`,
            }}
          >
            {messages.map((message, index) => (
              <div key={message.id} data-message-index={index} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isBot ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'} ${message.typing ? 'animate-pulse' : ''}`}>
                  {message.typing ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="flex space-x-2 mb-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('app.inputPlaceholder')}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
                // IMPORTANT: do NOT autoFocus here — we control focus from effects
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Section (between chat and footer) */}
            <ProgressSection />

            <p className="text-xs text-gray-500 text-center mt-3">
              {t('app.confidentiality')}
              {companyName && ` ${t('app.aggregate', { companyName })}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HappinessCheck: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">{/* use t in parent if available; simple fallback: */}Loading assessment...</p>
          </div>
        </div>
      }
    >
      <HappinessCheckInner />
    </Suspense>
  );
};

export default HappinessCheck;
