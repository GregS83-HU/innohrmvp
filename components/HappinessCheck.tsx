'use client'

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Send, MessageCircle, Heart, BarChart3, CheckCircle, ArrowLeft } from 'lucide-react';

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

// Interface pour le body de la requête de création de session
interface CreateSessionRequest {
  company_id?: number;
}

// Composant interne qui utilise useSearchParams
const HappinessCheckInner = () => {
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract company info from URL or search params
  useEffect(() => {
    const extractCompanyInfo = async () => {
      // Method 1: From URL slug pattern /jobs/{slug}/happiness-check or similar
      const slugMatch = pathname.match(/^\/jobs\/([^/]+)/);
      const companySlug = slugMatch ? slugMatch[1] : null;
      
      // Method 2: From search params ?company_id=xxx
      const companyIdFromParams = searchParams.get('company_id');
      
      if (companyIdFromParams) {
        // Direct company_id from params
        setCompanyId(companyIdFromParams);
        // Optionally fetch company name
        await fetchCompanyName(companyIdFromParams);
      } else if (companySlug && companySlug !== 'demo') {
        // Get company_id from slug
        await fetchCompanyFromSlug(companySlug);
      }
    };

    extractCompanyInfo();
  }, [pathname, searchParams]);

  const fetchCompanyFromSlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('company')
        .select('id, company_name')
        .eq('slug', slug)
        .single();
      
      if (data && !error) {
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
      
      if (data && !error) {
        setCompanyName(data.company_name || '');
      }
    } catch (error) {
      console.error('Error fetching company name:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input after bot response
  useEffect(() => {
    if (!isLoading && sessionStarted) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, sessionStarted, messages]);

  const createSession = async () => {
    try {
      const requestBody: CreateSessionRequest = {};
      
      // Include company_id if available
      if (companyId) {
        requestBody.company_id = parseInt(companyId);
      }

      const response = await fetch('/api/happiness/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      if (response.ok) {
        setSessionToken(data.sessionToken);
        setSessionStarted(true);
        
        // Welcome message with company context if available
        const welcomeText = companyName 
          ? `Hello! 😊 I'm here to help you assess your workplace well-being at ${companyName}. This evaluation is completely anonymous and confidential. We'll discuss various aspects of your work life for a few minutes. Are you ready to start?`
          : "Hello! 😊 I'm here to help you assess your workplace well-being. This evaluation is completely anonymous and confidential. We'll discuss various aspects of your work life for a few minutes. Are you ready to start?";
        
        const welcomeMessage: Message = {
          id: 'welcome',
          text: welcomeText,
          isBot: true,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setMessages([welcomeMessage]);
        }, 500);
      } else {
        console.error('Session creation error:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !sessionToken || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Typing message
    const typingMessage: Message = {
      id: 'typing',
      text: '...',
      isBot: true,
      timestamp: new Date(),
      typing: true
    };
    
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/happiness/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken
        },
        body: JSON.stringify({ message: messageText })
      });

      const data = await response.json();
      
      // Remove typing message
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      if (response.ok) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isBot: true,
          timestamp: new Date()
        };

        setTimeout(() => {
          setMessages(prev => [...prev, botMessage]);
          setCurrentStep(data.step);
          setPermaScores(data.scores || {});
          setIsCompleted(data.completed);
          
          if (data.completed && data.personalizedAdvice) {
            setPersonalizedAdvice(data.personalizedAdvice);
          }
        }, 1000);
        
      } else {
        console.error('Chat error:', data.error);
        setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
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
    positive: 'Positive Emotions',
    engagement: 'Engagement',
    relationships: 'Relationships',
    meaning: 'Work Meaning',
    accomplishment: 'Accomplishment',
    work_life_balance: 'Work-Life Balance'
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

  // Sticky header component for chat view
  const StickyHeader = () => (
    <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            Happy Check 😊
            {companyName && (
              <span className="text-sm font-normal text-blue-600 block">
                {companyName}
              </span>
            )}
          </h1>
          <div className="text-sm text-gray-500">
            Step {currentStep}/12
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(currentStep / 12 * 100, 100)}%` }}
          />
        </div>

        {/* Current PERMA scores */}
        {Object.keys(permaScores).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(permaScores).map(([key, score]) => (
              <div key={key} className={`px-2 py-1 rounded text-xs ${getScoreColor(score)}`}>
                {key.charAt(0).toUpperCase()}: {score}/10
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isCompleted) {
    const avgScore = Object.keys(permaScores).length > 0 
      ? Math.round(Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length * 10) / 10
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Thank you for your participation! 🎉
              </h1>
              <p className="text-gray-600 text-lg">
                Your workplace well-being assessment is now complete.
                {companyName && (
                  <span className="block mt-2 text-blue-600 font-medium">
                    Results recorded for {companyName}
                  </span>
                )}
              </p>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Your Well-being Summary
              </h3>
              <p className="text-blue-700">
                {avgScore >= 8
                  ? "Fantastic! Your workplace well-being is shining positively. Keep cultivating this great energy! 🌟"
                  : avgScore >= 6.5
                  ? "Very good! You have solid foundations for your professional well-being. A few tweaks can make you shine even more! ✨"
                  : avgScore >= 5
                  ? "Your situation has good potential for improvement. The tips below will help you reach new heights! 🚀"
                  : "Thank you for your honesty. Your answers show real challenges, but remember that everything can improve with the right strategies and support. 💙"
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-2">Overall Score</h2>
                <div className="text-4xl font-bold mb-2">{avgScore}/10</div>
                <p className="text-blue-100">Your workplace happiness level</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Score by domain</h3>
                <div className="space-y-2">
                  {Object.entries(permaScores).map(([key, score]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {permaLabels[key as keyof typeof permaLabels]}
                      </span>
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
                  Your Personalized Advice
                </h3>
                <p className="text-purple-700 text-sm mb-4">
                  Based on your well-being profile, here are 3 tailored tips to help you thrive:
                </p>
                <div className="space-y-3">
                  {personalizedAdvice.map((advice, index) => (
                    <div 
                      key={index} 
                      className="bg-white/70 rounded-lg p-4 border border-purple-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {advice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-purple-600">
                    ✨ AI-generated tips tailored for you
                  </p>
                </div>
              </div>
            ) : null}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Privacy:</strong> Your responses are fully anonymous and help improve overall workplace well-being.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetSession}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Start a New Assessment
              </button>
              
              <button
                onClick={() => window.location.href = companyId ? `/jobs/company-${companyId}` : '/'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to {companyName || 'Home'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Workplace Well-Being Assessment
                {companyName && (
                  <span className="block text-lg text-blue-600 font-medium mt-2">
                    for {companyName}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Take a few minutes to evaluate your happiness and professional well-being. 
                This assessment is <strong>100% anonymous</strong> and confidential.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <MessageCircle className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-blue-800">Conversational</h3>
                <p className="text-sm text-blue-600 text-center">Natural and supportive discussion</p>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-green-800">Scientific</h3>
                <p className="text-sm text-green-600 text-center">Based on the PERMA-W model</p>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-purple-800">Quick</h3>
                <p className="text-sm text-purple-600 text-center">
                  5-10 minutes maximum
                  <span className="block text-xs mt-1 opacity-80">in only 12 questions</span>
                </p>
              </div>
            </div>

            <button
              onClick={createSession}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Start the Assessment
            </button>

            <p className="text-xs text-gray-500 mt-4">
              No personal data is collected • Only anonymous aggregated results
              {companyName && ` • Results will be included in ${companyName}'s wellness insights`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
        {/* Sticky Header with progress - always visible */}
        <StickyHeader />

        {/* Chat area - flex grow to fill remaining space */}
        <div className="bg-white shadow-lg flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-600 text-white'
                  } ${message.typing ? 'animate-pulse' : ''}`}
                >
                  {message.typing ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input - fixed at bottom */}
          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white p-3 shadow-sm flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            💬 Confidential and anonymous conversation • Your data is not stored personally
            {companyName && ` • Aggregate insights help improve ${companyName}'s workplace wellness`}
          </p>
        </div>
      </div>
    </div>
  );
};

// Composant principal avec Suspense boundary
const HappinessCheck = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    }>
      <HappinessCheckInner />
    </Suspense>
  );
};

export default HappinessCheck;