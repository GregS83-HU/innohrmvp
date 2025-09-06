'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Heart, BarChart3, CheckCircle, ArrowLeft } from 'lucide-react';

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

const HappinessCheck = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [permaScores, setPermaScores] = useState<PermaScores>({});
  const [sessionStarted, setSessionStarted] = useState(false);
  const [personalizedAdvice, setPersonalizedAdvice] = useState<string[]>([]); // <-- ajouté ici

  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createSession = async () => {
    try {
      const response = await fetch('/api/happiness/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (response.ok) {
        setSessionToken(data.sessionToken);
        setSessionStarted(true);
        
        // Message de bienvenue
        const welcomeMessage: Message = {
          id: 'welcome',
          text: "Bonjour ! 😊 Je suis là pour vous aider à évaluer votre bien-être au travail. Cette évaluation est complètement anonyme et confidentielle. Nous allons discuter pendant quelques minutes de différents aspects de votre vie professionnelle. Êtes-vous prêt(e) à commencer ?",
          isBot: true,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setMessages([welcomeMessage]);
        }, 500);
      } else {
        console.error('Erreur création session:', data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
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

    // Message de typing
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
      
      // Retirer le message de typing
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
        }, 1000);
        
      } else {
        console.error('Erreur chat:', data.error);
        setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      }
    } catch (error) {
      console.error('Erreur:', error);
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
    positive: 'Émotions positives',
    engagement: 'Engagement',
    relationships: 'Relations',
    meaning: 'Sens du travail',
    accomplishment: 'Accomplissement',
    work_life_balance: 'Équilibre vie pro/perso'
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
  };

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
                Merci pour votre participation ! 🎉
              </h1>
              <p className="text-gray-600 text-lg">
                Votre évaluation de bien-être au travail est terminée.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-2">Score global</h2>
                <div className="text-4xl font-bold mb-2">{avgScore}/10</div>
                <p className="text-blue-100">Votre niveau de bonheur au travail</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Détail par domaine</h3>
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

            {/* Section Conseils Personnalisés */}
            {personalizedAdvice.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Vos conseils personnalisés
                </h3>
                <p className="text-purple-700 text-sm mb-4">
                  Basés sur votre profil de bien-être, voici 3 conseils sur mesure pour vous épanouir davantage :
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
                    ✨ Conseils générés par IA spécialement pour vous
                  </p>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Confidentialité :</strong> Vos réponses sont complètement anonymes et contribuent à améliorer le bien-être général dans l'entreprise.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetSession}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Nouvelle évaluation
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retour à l'accueil
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
                Évaluation du Bien-être au Travail
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Prenez quelques minutes pour évaluer votre bonheur et bien-être professionnel. 
                Cette évaluation est <strong>100% anonyme</strong> et confidentielle.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <MessageCircle className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-blue-800">Conversationnel</h3>
                <p className="text-sm text-blue-600 text-center">Discussion naturelle et bienveillante</p>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-green-800">Scientifique</h3>
                <p className="text-sm text-green-600 text-center">Basé sur le modèle PERMA-W</p>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-purple-800">Rapide</h3>
                <p className="text-sm text-purple-600 text-center">5-10 minutes maximum</p>
              </div>
            </div>

            <button
              onClick={createSession}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Commencer l'évaluation
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Aucune donnée personnelle n'est collectée • Résultats agrégés anonymes uniquement
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header avec progression */}
        <div className="bg-white rounded-t-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Happy Check 😊</h1>
            <div className="text-sm text-gray-500">
              Étape {currentStep}/12
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(currentStep / 12 * 100, 100)}%` }}
            />
          </div>

          {/* Scores PERMA actuels */}
          {Object.keys(permaScores).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(permaScores).map(([key, score]) => (
                <div key={key} className={`px-2 py-1 rounded text-xs ${getScoreColor(score)}`}>
                  {key.charAt(0).toUpperCase()}: {score}/10
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zone de chat */}
        <div className="bg-white shadow-lg h-96 flex flex-col">
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

          {/* Input de message */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre réponse..."
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

        <div className="bg-white rounded-b-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 text-center">
            💬 Conversation confidentielle et anonyme • Vos données ne sont pas stockées personnellement
          </p>
        </div>
      </div>
    </div>
  );
};

export default HappinessCheck;