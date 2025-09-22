# Codebase Complete - innohrmvp
**Généré le:** Sun Sep 21 05:48:39 CEST 2025
**Objectif:** Documentation technique automatisée via IA

---


## `package.json`

```json
{
  "name": "innohrmvp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/supabase-js": "^2.53.0",
    "@vercel/analytics": "^1.5.0",
    "@vercel/speed-insights": "^1.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "file-saver": "^2.0.5",
    "framer-motion": "^12.23.12",
    "jszip": "^3.10.1",
    "lucide-react": "^0.539.0",
    "next": "^15.5.2",
    "openai": "^5.11.0",
    "patch-package": "^8.0.0",
    "pdf-parse": "^1.1.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-icons": "^5.5.0",
    "recharts": "^3.1.2",
    "tailwind-merge": "^3.3.1",
    "tesseract.js": "^6.0.1",
    "tesseract.js-node": "^0.1.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/pdf-parse": "^1.1.5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/tesseract.js": "^0.0.2",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "snyk": "^1.1299.0",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.3.7",
    "typescript": "^5"
  }
}
```

---


## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": "src",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---


## `./components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

---


## `./components/ContactForm.tsx`

```tsx
'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X, Send, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'demo' | 'logo' | 'other';
  slug: string; // slug for redirect
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName: string;
  comment: string;
  gdprConsent: boolean;
  marketingConsent: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  comment?: string;
  gdprConsent?: string;
  marketingConsent?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ isOpen, onClose, trigger = 'other', slug }) => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    companyName: '',
    comment: '',
    gdprConsent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleClose = () => {
    onClose();
    router.push(`/jobs/${slug}/Home`);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.gdprConsent) newErrors.gdprConsent = 'GDPR consent is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{8,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          trigger,
          submittedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setSubmitStatus('success');

      // Reset form and redirect immediately
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        companyName: '',
        comment: '',
        gdprConsent: false,
        marketingConsent: false,
      });

      onClose();
      router.push(`/jobs/${slug}/Home`);
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
            <p className="text-gray-600 text-sm mt-1">
              {trigger === 'demo'
                ? 'Interested in our workplace well-being solutions?'
                : "We&apos;d love to hear from you!"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success / Error Messages */}
        {submitStatus === 'success' && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-green-800 font-medium">Thank you!</h3>
              <p className="text-green-700 text-sm">We&apos;ll get back to you within 24 hours.</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Submission failed</h3>
              <p className="text-red-700 text-sm">Please try again later.</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`${inputClasses} ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                disabled={isSubmitting}
              />
              {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`${inputClasses} ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                disabled={isSubmitting}
              />
              {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`${inputClasses} ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`${inputClasses} ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="+36 30 123 4567"
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={`${inputClasses} ${errors.companyName ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isSubmitting}
            />
            {errors.companyName && <p className="text-red-600 text-xs mt-1">{errors.companyName}</p>}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Message / Comment</label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              rows={4}
              className={inputClasses}
              disabled={isSubmitting}
            />
          </div>

          {/* GDPR Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Data Protection & Privacy</span>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.gdprConsent}
                onChange={(e) => handleInputChange('gdprConsent', e.target.checked)}
                className={`mt-0.5 w-4 h-4 text-blue-600 border-2 rounded focus:ring-blue-500 ${
                  errors.gdprConsent ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              <div className="text-xs text-gray-700 leading-relaxed">
                <strong>I consent to the processing of my personal data *</strong><br />
                My data will be used to respond to my inquiry and may be stored for legitimate business purposes.
              </div>
            </label>
            {errors.gdprConsent && <p className="text-red-600 text-xs">{errors.gdprConsent}</p>}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.marketingConsent}
                onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <div className="text-xs text-gray-700 leading-relaxed">
                <strong>Marketing Communications (Optional)</strong><br />
                I would like to receive updates about products, services, and industry insights.
              </div>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : submitStatus === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? 'Sending...' : submitStatus === 'success' ? 'Message Sent!' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
```

---


## `./components/HappinessCheck.tsx`

```tsx
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

interface CreateSessionRequest {
  company_id?: number;
}

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

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract company info from URL or search params
  useEffect(() => {
    const extractCompanyInfo = async () => {
      const slugMatch = pathname?.match(/^\/jobs\/([^/]+)/);
      const companySlug = slugMatch ? slugMatch[1] : null;
      const companyIdFromParams = searchParams?.get('company_id');

      if (companyIdFromParams) {
        setCompanyId(companyIdFromParams);
        await fetchCompanyName(companyIdFromParams);
      } else if (companySlug && companySlug !== 'demo') {
        await fetchCompanyFromSlug(companySlug);
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

  // Create a session and show the welcome message
  const createSession = async () => {
    try {
      const requestBody: CreateSessionRequest = {};
      if (companyId) requestBody.company_id = parseInt(companyId);

      const response = await fetch('/api/happiness/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (response.ok) {
        setSessionToken(data.sessionToken);

        const welcomeText = companyName
          ? `Hello! 😊 I'm here to help you assess your workplace well-being at ${companyName}. This evaluation is completely anonymous and confidential. We'll discuss various aspects of your work life for a few minutes. Are you ready to start?`
          : "Hello! 😊 I'm here to help you assess your workplace well-being. This evaluation is completely anonymous and confidential. We'll discuss various aspects of your work life for a few minutes. Are you ready to start?";

        const welcomeMessage: Message = {
          id: 'welcome',
          text: welcomeText,
          isBot: true,
          timestamp: new Date(),
        };

        // Add message to state first so that the container can render it and we can scroll to it.
        setMessages([welcomeMessage]);

        // We mark sessionStarted shortly after the welcome message is rendered.
        // This small delay helps avoid race conditions with scroll/focus effects.
        setTimeout(() => {
          setSessionStarted(true);
        }, 120);
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
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      // Remove typing
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
      console.error('Error:', error);
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
    positive: 'Positive Emotions',
    engagement: 'Engagement',
    relationships: 'Relationships',
    meaning: 'Work Meaning',
    accomplishment: 'Accomplishment',
    work_life_balance: 'Work-Life Balance',
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
  const ProgressSection = () => (
    <div className="border-t border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">
          Happy Check Progress
          {companyName && (
            <span className="text-xs font-normal text-blue-600 ml-2">• {companyName}</span>
          )}
        </h2>
        <div className="text-sm text-gray-500 font-medium">Step {currentStep}/12</div>
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
          PERMA scores will appear as you progress through the assessment
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

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank you for your participation! 🎉</h1>
              <p className="text-gray-600 text-lg">
                Your workplace well-being assessment is now complete.
                {companyName && <span className="block mt-2 text-blue-600 font-medium">Results recorded for {companyName}</span>}
              </p>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Well-being Summary</h3>
              <p className="text-blue-700">
                {avgScore >= 8
                  ? "Fantastic! Your workplace well-being is shining positively. Keep cultivating this great energy! 🌟"
                  : avgScore >= 6.5
                  ? "Very good! You have solid foundations for your professional well-being. A few tweaks can make you shine even more! ✨"
                  : avgScore >= 5
                  ? "Your situation has good potential for improvement. The tips below will help you reach new heights! 🚀"
                  : "Thank you for your honesty. Your answers show real challenges, but remember that everything can improve with the right strategies and support. 💙"}
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
                  Your Personalized Advice
                </h3>
                <p className="text-purple-700 text-sm mb-4">Based on your well-being profile, here are 3 tailored tips to help you thrive:</p>
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
                  <p className="text-xs text-purple-600">✨ AI-generated tips tailored for you</p>
                </div>
              </div>
            ) : null}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Privacy:</strong> Your responses are fully anonymous and help improve overall workplace well-being.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={resetSession} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Start a New Assessment
              </button>

              <button onClick={() => (window.location.href = companyId ? `/jobs/company-${companyId}` : '/')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Back to {companyName || 'Home'}
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
                Workplace Well-Being Assessment
                {companyName && <span className="block text-lg text-blue-600 font-medium mt-2">for {companyName}</span>}
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Take a few minutes to evaluate your happiness and professional well-being. This assessment is <strong>100% anonymous</strong> and confidential.
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

            <button onClick={createSession} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
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

  // Main chat view (session started)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 2rem)' }}>
          {/* Header */}
          <div className="bg-white border-b p-3">
            <h1 className="text-lg font-bold text-gray-800 text-center">Happy Check 😊</h1>
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
                placeholder="Type your response..."
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

            <p className="text-xs text-gray-500 text-center">
              💬 Confidential and anonymous conversation • Your data is not stored personally
              {companyName && ` • Aggregate insights help improve ${companyName}'s workplace wellness`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HappinessCheck = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading assessment...</p>
          </div>
        </div>
      }
    >
      <HappinessCheckInner />
    </Suspense>
  );
};

export default HappinessCheck;
```

---


## `./lib/ocr.ts`

```ts
// lib/ocr.ts
import Tesseract from "tesseract.js";
import fs from "fs";

export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const { data } = await Tesseract.recognize(buffer, "eng", {
    logger: m => console.log("OCR:", m.status, m.progress),
  });
  return data.text;
}
```

---


## `./lib/parsePdf.ts`

```ts
import pdfParse from 'pdf-parse'

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(Buffer.from(buffer)) // important : pas de "new Buffer()"
    return data.text || ''
  } catch (err) {
    console.error('Erreur parsePdfBuffer:', err)
    return '' // fallback si le PDF est illisible
  }
}
```

---


## `./lib/parsePdfSafe.ts`

```ts
// src/lib/pdfParseSafe.ts
// ⛔️ Attention : pas d'import depuis 'pdf-parse' (le root), sinon mode debug déclenché

//const pdfParse = require('pdf-parse/lib/pdf-parse')
/*import pdfParse from 'pdf-parse'
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  return data.text
}*/


// ⚠️ Ne pas utiliser l'import global, cela déclenche le mode debug
// ⛔️ import pdfParse from 'pdf-parse'
// ✅ Utiliser une importation dynamique uniquement à l'exécution

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // L'import dynamique empêche le déclenchement de code en dehors de l'appel
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}
```

---


## `./lib/supabaseClient.ts`

```ts
/*'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient() */

'use client'

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
      },
    },
  }
)
```

---


## `./lib/supabaseServerClient.ts`

```ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createServerClient() {
  return createServerComponentClient({ cookies: () => cookies() }) // ⬅️ bien une fonction !
}
```

---


## `./next-env.d.ts`

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

---


## `./next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

---


## `./package.json`

```json
{
  "name": "innohrmvp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/supabase-js": "^2.53.0",
    "@vercel/analytics": "^1.5.0",
    "@vercel/speed-insights": "^1.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "file-saver": "^2.0.5",
    "framer-motion": "^12.23.12",
    "jszip": "^3.10.1",
    "lucide-react": "^0.539.0",
    "next": "^15.5.2",
    "openai": "^5.11.0",
    "patch-package": "^8.0.0",
    "pdf-parse": "^1.1.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-icons": "^5.5.0",
    "recharts": "^3.1.2",
    "tailwind-merge": "^3.3.1",
    "tesseract.js": "^6.0.1",
    "tesseract.js-node": "^0.1.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/pdf-parse": "^1.1.5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/tesseract.js": "^0.0.2",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "snyk": "^1.1299.0",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.3.7",
    "typescript": "^5"
  }
}
```

---


## `./src/app/AnalyseSummary.tsx`

```tsx
// src/components/AnalyseSummary.tsx
'use client'
import { useRouter } from 'next/navigation'

interface Props {
  positionId: string
  candidates: { score: number }[]
}

export default function AnalyseSummary({ positionId, candidates }: Props) {
  const router = useRouter()
  const matchedCandidates = candidates.filter(c => c.score >= 5).length
  const totalCandidates = candidates.length

  return (
    <div className="p-4 mt-4 border rounded shadow bg-white">
      <p>
        Analyse terminée : {matchedCandidates} candidats correspondent à cette position sur {totalCandidates}.
      </p>
      <button
        onClick={() => router.push(`/stats?positionId=${positionId}`)}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Voir détails
      </button>
    </div>
  )
}
```

---


## `./src/app/ClientProvider.tsx`

```tsx
'use client'

import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}
```

---


## `./src/app/Header.tsx`

```tsx
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import { Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown, User, LogOut, Clock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Move HappyCheckMenuItem outside to prevent re-creation
const HappyCheckMenuItem = ({ 
  href, 
  children, 
  className,
  onClick,
  canAccessHappyCheck,
  isDemoExpired = false
}: { 
  href: string; 
  children: React.ReactNode; 
  className: string;
  onClick?: () => void;
  canAccessHappyCheck: boolean | null;
  isDemoExpired?: boolean;
}) => {
  const isDisabled = canAccessHappyCheck === false || isDemoExpired;
  const isLoading = canAccessHappyCheck === null && !isDemoExpired;
  
  if (isLoading) {
    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-wait relative`}>
        {children}
        <div className="absolute inset-0 bg-gray-200 opacity-20 rounded-xl"></div>
      </div>
    );
  }
  
  if (isDisabled) {
    const tooltipMessage = isDemoExpired 
      ? "Demo expired - Contact us to continue" 
      : "Not available in your forfait";
      
    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-not-allowed relative group`}>
        {children}
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {tooltipMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
};

// New component for regular menu items that can be disabled during demo expiration
const DemoAwareMenuItem = ({ 
  href, 
  children, 
  className,
  onClick,
  isDemoExpired = false,
  isContactUs = false
}: { 
  href: string; 
  children: React.ReactNode; 
  className: string;
  onClick?: () => void;
  isDemoExpired?: boolean;
  isContactUs?: boolean;
}) => {
  // Contact Us is never disabled
  const isDisabled = isDemoExpired && !isContactUs;
  
  if (isDisabled) {
    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-not-allowed relative group`}>
        {children}
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Demo expired - Contact us to continue
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
};

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHRToolsMenuOpen, setIsHRToolsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ firstname: string; lastname: string } | null>(null);
  const [error, setError] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyForfait, setCompanyForfait] = useState<string | null>(null);
  const [canAccessHappyCheck, setCanAccessHappyCheck] = useState<boolean | null>(null);

  const [demoTimeLeft, setDemoTimeLeft] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDemoExpired, setIsDemoExpired] = useState(false);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expirationHandledRef = useRef(false);
  const happyCheckAccessChecked = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const hrToolsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Memoized values
  const slugMatch = useMemo(() => pathname.match(/^\/jobs\/([^/]+)/), [pathname]);
  const companySlug = useMemo(() => slugMatch ? slugMatch[1] : null, [slugMatch]);

  const buttonBaseClasses = useMemo(() => 
    'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md whitespace-nowrap',
    []
  );

  // Memoized link builder
  const buildLink = useCallback((basePath: string) => {
    const query = companyId ? `?company_id=${companyId}` : '';
    if (companySlug) {
      if (basePath === '/') return `/jobs/${companySlug}${query}`;
      return `/jobs/${companySlug}${basePath}${query}`;
    }
    return `${basePath}${query}`;
  }, [companyId, companySlug]);

  // Memoized forfait badge
  const forfaitBadge = useMemo(() => {
    switch (companyForfait) {
      case 'Free':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div> Free
          </span>
        );
      case 'Momentum':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 shadow-md">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div> Momentum
          </span>
        );
      case 'Infinity':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-yellow-900 shadow-lg ring-1 ring-yellow-400">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-md"></div> Infinity
          </span>
        );
      default:
        return null;
    }
  }, [companyForfait]);

  // Memoized format time function
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoized links
  const happyCheckLink = useMemo(() => buildLink('/happiness-check'), [buildLink]);
  const uploadCertificateLink = useMemo(() => buildLink('/medical-certificate/upload'), [buildLink]);

  // Check happy check access
  const checkHappyCheckAccess = useCallback(async () => {
    if (!companyId || happyCheckAccessChecked.current) return;
    
    console.log('🔍 Checking happy check access for company_id:', companyId);
    happyCheckAccessChecked.current = true;
    
    try {
      const { data, error } = await supabase.rpc('can_access_happy_check', { p_company_id: companyId })
      
      if (error) {
        console.log('❌ There is an error, setting access to false');
        setCanAccessHappyCheck(false);
        return;
      }
      
      if (data === null || data === undefined) {
        console.log('❌ Data is null/undefined, setting access to false');
        setCanAccessHappyCheck(false);
        return;
      }
      
      // Handle different possible return formats
      let hasAccess = false;
      
      if (typeof data === 'boolean') {
        hasAccess = data;
      } else if (typeof data === 'string') {
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        hasAccess = data === 1;
      } else if (typeof data === 'object' && data !== null) {
        // Sometimes Supabase functions return objects, check if there's a result property
        hasAccess = data.result === true || data.result === 'true' || 
                   data.can_access === true || data.can_access === 'true' ||
                   data[0] === true || data[0] === 'true' || // Sometimes it's an array
                   data === true; // Sometimes the object itself is the boolean
        
      }
            setCanAccessHappyCheck(hasAccess);
      
    } catch (error) {
      console.error('💥 Catch block error:', error);
      setCanAccessHappyCheck(false);
    }
  }, [companyId]);

  // Demo slug effect
  useEffect(() => {
    if (companySlug === 'demo') {
      setLogin('demo@hrinno.hu');
      setPassword('demo');
    }
  }, [companySlug]);

  // Demo expiration handler
  const handleDemoExpiration = useCallback(async () => {
    if (expirationHandledRef.current) return;
    expirationHandledRef.current = true;
    
    // Set demo as expired and show the expired state briefly
    setIsDemoExpired(true);
    setDemoTimeLeft(0);
    
    localStorage.removeItem('demo_start_time');
    localStorage.removeItem('demo_mode_active');

    if (user) {
      try {
        await supabase.auth.signOut();
        setUser(null);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }

    // Give user 3 seconds to see the expired state, then redirect to feedback
    setTimeout(() => {
      if (companySlug === 'demo') {
        router.push(`/jobs/demo/feedback`);
      } else {
        window.location.href = 'https://www.linkedin.com/in/grégory-saussez';
      }
    }, 2000); // Reduced to 3 seconds for better UX
  }, [user, companySlug, router]);

  // Demo timer effect - Demo duration
  useEffect(() => {
    const DEMO_DURATION = 20 * 60 * 1000;
    const DEMO_START_KEY = 'demo_start_time';
    const DEMO_MODE_KEY = 'demo_mode_active';

    if (companySlug === 'demo') {
      localStorage.setItem(DEMO_MODE_KEY, 'true');

      let demoStartTime = localStorage.getItem(DEMO_START_KEY);
      if (!demoStartTime) {
        demoStartTime = Date.now().toString();
        localStorage.setItem(DEMO_START_KEY, demoStartTime);
      }
    }

    const isDemoActive = companySlug === 'demo' || localStorage.getItem(DEMO_MODE_KEY) === 'true';

    if (isDemoActive) {
      const demoStartTime = localStorage.getItem(DEMO_START_KEY);
      if (!demoStartTime) {
        localStorage.removeItem(DEMO_MODE_KEY);
        setIsDemoMode(false);
        setDemoTimeLeft(null);
        setIsDemoExpired(false);
        return;
      }

      const startTime = parseInt(demoStartTime);
      const elapsed = Date.now() - startTime;
      const remaining = DEMO_DURATION - elapsed;

      if (remaining <= 0) {
        handleDemoExpiration();
        return;
      }

      setIsDemoMode(true);
      setIsDemoExpired(false);
      setDemoTimeLeft(Math.ceil(remaining / 1000));

      demoTimerRef.current = setInterval(() => {
        const currentElapsed = Date.now() - startTime;
        const currentRemaining = DEMO_DURATION - currentElapsed;

        if (currentRemaining <= 0) {
          handleDemoExpiration();
          return;
        }

        setDemoTimeLeft(Math.ceil(currentRemaining / 1000));
      }, 1000);

      return () => {
        if (demoTimerRef.current) clearInterval(demoTimerRef.current);
      };
    } else {
      setIsDemoMode(false);
      setIsDemoExpired(false);
      setDemoTimeLeft(null);
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    }
  }, [companySlug, user, handleDemoExpiration]);

  // Fetch functions
  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('user_firstname, user_lastname')
      .eq('id', userId)
      .single();
    if (data) setUser({ firstname: data.user_firstname, lastname: data.user_lastname });
  }, []);

  const fetchUserCompanyId = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();
    if (!error && data?.company_id) setCompanyId(data.company_id);
  }, []);

  const fetchCompanyLogoAndId = useCallback(async (slug: string) => {
    const { data } = await supabase
      .from('company')
      .select('company_logo, id, forfait')
      .eq('slug', slug)
      .single();
    setCompanyLogo(data?.company_logo || null);
    setCompanyId(data?.id || null);
    setCompanyForfait(data?.forfait || null);
  }, []);

  // Auth and company data effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const uid = data.session.user.id;
        fetchUserProfile(uid);
        fetchUserCompanyId(uid);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        fetchUserProfile(uid);
        fetchUserCompanyId(uid);
      } else {
        setUser(null);
        if (companySlug) fetchCompanyLogoAndId(companySlug);
      }
    });

    if (companySlug) fetchCompanyLogoAndId(companySlug);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [companySlug, fetchUserProfile, fetchUserCompanyId, fetchCompanyLogoAndId]);

  // Happy check access effect
  useEffect(() => {
    if (companyId) {
      // Reset cache when companyId changes
      happyCheckAccessChecked.current = false;
      setCanAccessHappyCheck(null); // Set to loading state
      checkHappyCheckAccess();
    }
  }, [companyId, checkHappyCheckAccess]);

  // Click outside effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hrToolsMenuRef.current && !hrToolsMenuRef.current.contains(event.target as Node)) {
        setIsHRToolsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Event handlers
  const handleLogin = useCallback(async () => {
    // Disable login if demo is expired
    if (isDemoExpired) return;
    
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: login,
      password,
    });
    if (error) {
      setError('Invalid email or password!');
      return;
    }
    if (data.user) {
      fetchUserProfile(data.user.id);
      fetchUserCompanyId(data.user.id);
      setIsLoginOpen(false);
      const homeUrl = companySlug ? `/jobs/${companySlug}` : '/';
      router.push(homeUrl);
    }
  }, [login, password, companySlug, router, fetchUserProfile, fetchUserCompanyId, isDemoExpired]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    const homeUrl = companySlug ? `/jobs/${companySlug}` : '/';
    router.push(homeUrl);
  }, [companySlug, router]);

  // Modified timer display color based on expiration
  const timerBarColor = isDemoExpired 
    ? 'bg-gradient-to-r from-red-600 to-red-700' 
    : demoTimeLeft && demoTimeLeft < 300 // Less than 5 minutes
    ? 'bg-gradient-to-r from-red-400 to-orange-500'
    : 'bg-gradient-to-r from-orange-400 to-red-500';

  const timerMessage = isDemoExpired 
    ? 'Demo Expired - Contact us to continue'
    : `Demonstration Mode - Remaining time: ${demoTimeLeft ? formatTime(demoTimeLeft) : '00:00'}`;

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        {(isDemoMode || isDemoExpired) && (
          <div className={`${timerBarColor} text-white px-4 py-2`}>
            <div className="max-w-8xl mx-auto flex items-center justify-center gap-3">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {timerMessage}
              </span>
              {!isDemoExpired && (
                <div className="hidden sm:block text-xs opacity-90">
                  The application will close automatically at the end of the timer
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full px-4 sm:px-6 lg:px-9 py-4">
          <div className="flex items-center justify-between w-full max-w-8xl mx-auto">
            {/* Logo section */}
            <div className="flex-shrink-0 flex flex-col items-start gap-1 -ml-2">
              <Link href={companySlug === 'demo' ? `/jobs/demo/contact` : buildLink('/')}>
                <img
                  src={companySlug && companyLogo ? companyLogo : '/HRInnoLogo.jpeg'}
                  alt="Logo"
                  className="h-10 sm:h-12 object-contain"
                />
              </Link>
              {forfaitBadge}
            </div>

            {/* Desktop Navigation - hidden on tablet and mobile */}
            <nav className="hidden xl:flex items-center gap-2 flex-1 justify-center mx-8">
              <DemoAwareMenuItem 
                href={buildLink('/openedpositions')}
                className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700`}
                isDemoExpired={isDemoExpired}
              >
                <Briefcase className="w-4 h-4" /> {user ? 'Your Available Positions' : 'Available Positions'}
              </DemoAwareMenuItem>

              {user && (
                <DemoAwareMenuItem 
                  href={buildLink('/openedpositions/new')}
                  className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700`}
                  isDemoExpired={isDemoExpired}
                >
                  <Plus className="w-4 h-4" /> Create Position
                </DemoAwareMenuItem>
              )}

              {companyId && (
                <HappyCheckMenuItem 
                  href={happyCheckLink}
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700`}
                  canAccessHappyCheck={canAccessHappyCheck}
                  isDemoExpired={isDemoExpired}
                >
                  <Smile className="w-4 h-4" /> Happy Check
                </HappyCheckMenuItem>
              )}

              {user && (
                <div className="relative" ref={hrToolsMenuRef}>
                  {isDemoExpired ? (
                    <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                      <Heart className="w-4 h-4" /> HR Tools
                      <ChevronDown className="w-3 h-3" />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Demo expired - Contact us to continue
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setIsHRToolsMenuOpen(!isHRToolsMenuOpen)} className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700`}>
                        <Heart className="w-4 h-4" /> HR Tools
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isHRToolsMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isHRToolsMenuOpen && (
                        <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Outils RH</p>
                          </div>

                          <Link href={buildLink('/openedpositions/analytics')} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}>
                            <BarChart3 className="w-4 h-4" /> Recruitment Dashboard
                           </Link>

                          <HappyCheckMenuItem
                            href={buildLink('/happiness-dashboard')}
                            className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}
                            onClick={() => setIsHRToolsMenuOpen(false)}
                            canAccessHappyCheck={canAccessHappyCheck}
                          >
                            <BarChart3 className="w-4 h-4" /> Happiness Dashboard
                          </HappyCheckMenuItem>

                          <Link href={buildLink('/medical-certificate/list')} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}>
                            <Stethoscope className="w-4 h-4" /> List of Certificates
                          </Link>

                          <Link href={buildLink('/medical-certificate/download')} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3`}>
                            <Stethoscope className="w-4 h-4" /> Certificates Download
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {!user && companyId && (
                <DemoAwareMenuItem 
                  href={uploadCertificateLink}
                  className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700`}
                  isDemoExpired={isDemoExpired}
                >
                  <Stethoscope className="w-4 h-4" /> Upload Certificate
                </DemoAwareMenuItem>
              )}
            </nav>

            {/* Right section - User area and mobile menu */}
            <div className="flex items-center gap-3 -mr-2">
              {/* Demo timer for tablet/mobile */}
              {(isDemoMode || isDemoExpired) && (
                <div className={`xl:hidden flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${
                  isDemoExpired 
                    ? 'bg-red-100 text-red-800' 
                    : demoTimeLeft && demoTimeLeft < 300 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  <Clock className="w-3 h-3" />
                  {isDemoExpired ? 'EXPIRED' : (demoTimeLeft ? formatTime(demoTimeLeft) : '00:00')}
                </div>
              )}

              {/* Contact Us button for demo - positioned in right section */}
              {companySlug === 'demo' && (
                <DemoAwareMenuItem
                  href={`/jobs/demo/contact`}
                  className={`${buttonBaseClasses} bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hidden sm:flex`}
                  isDemoExpired={isDemoExpired}
                  isContactUs={true}
                >
                  <User className="w-4 h-4" /> Contact Us
                </DemoAwareMenuItem>
              )}

              {/* Desktop user area */}
              <div className="hidden xl:flex items-center gap-3">
                {companySlug === 'demo' && !user && !isDemoExpired && (
                  <div className="text-blue-700 font-medium text-sm">
                    Login for employer view →
                  </div>
                )}

                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    {isDemoExpired ? (
                      <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="max-w-32 truncate">{user.firstname} {user.lastname}</span>
                        <ChevronDown className="w-3 h-3" />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          Demo expired - Contact us to continue
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`${buttonBaseClasses} bg-gray-50 hover:bg-gray-100 text-gray-700`}>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="max-w-32 truncate">{user.firstname} {user.lastname}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isUserMenuOpen && (
                          <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <p className="text-sm text-gray-600">Connected as</p>
                              <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                            </div>
                            <button onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} className={`${buttonBaseClasses} bg-white hover:bg-red-50 text-red-600 w-full px-4 py-3 text-left`}>
                              <LogOut className="w-4 h-4" /> Logout
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsLoginOpen(true)} 
                    className={`${buttonBaseClasses} ${
                      isDemoExpired 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={isDemoExpired}
                  >
                    <User className="w-4 h-4" /> Login
                  </button>
                )}
              </div>

              {/* Mobile/Tablet menu button */}
              <button 
                className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <DemoAwareMenuItem 
                href={buildLink('/openedpositions')} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700 w-full justify-start`}
                isDemoExpired={isDemoExpired}
              >
                <Briefcase className="w-4 h-4" /> {user ? 'Your Available Positions' : 'Available Positions'}
              </DemoAwareMenuItem>

              {user && (
                <DemoAwareMenuItem 
                  href={buildLink('/openedpositions/new')} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700 w-full justify-start`}
                  isDemoExpired={isDemoExpired}
                >
                  <Plus className="w-4 h-4" /> Create Position
                </DemoAwareMenuItem>
              )}

              {companyId && (
                <HappyCheckMenuItem 
                  href={happyCheckLink}
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700 w-full justify-start`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  canAccessHappyCheck={canAccessHappyCheck}
                  isDemoExpired={isDemoExpired}
                >
                  <Smile className="w-4 h-4" /> Happy Check
                </HappyCheckMenuItem>
              )}

              {user && (
                <>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outils RH</p>
                  </div>

                  <DemoAwareMenuItem 
                    href={buildLink('/openedpositions/analytics')} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <BarChart3 className="w-4 h-4" /> Recruitment Dashboard
                  </DemoAwareMenuItem>

                  <HappyCheckMenuItem
                    href={buildLink('/happiness-dashboard')}
                    className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full justify-start`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    canAccessHappyCheck={canAccessHappyCheck}
                    isDemoExpired={isDemoExpired}
                  >
                    <BarChart3 className="w-4 h-4" /> Happiness Dashboard
                  </HappyCheckMenuItem>

                  <DemoAwareMenuItem 
                    href={buildLink('/medical-certificate/list')} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <Stethoscope className="w-4 h-4" /> List of Certificates
                  </DemoAwareMenuItem>
                  
                  <DemoAwareMenuItem 
                    href={buildLink('/medical-certificate/download')} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <Stethoscope className="w-4 h-4" /> Certificates Download
                  </DemoAwareMenuItem>
                  
                  {!isDemoExpired && (
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className={`${buttonBaseClasses} bg-white hover:bg-red-50 text-red-600 w-full justify-start`}>
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  )}
                </>
              )}

              {!user && companyId && (
                <DemoAwareMenuItem 
                  href={uploadCertificateLink} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700 w-full justify-start`}
                  isDemoExpired={isDemoExpired}
                >
                  <Stethoscope className="w-4 h-4" /> Upload Certificate
                </DemoAwareMenuItem>
              )}

              {companySlug === 'demo' && (
                <DemoAwareMenuItem
                  href={`/jobs/demo/contact`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${buttonBaseClasses} bg-indigo-50 hover:bg-indigo-100 text-indigo-700 w-full justify-start`}
                  isDemoExpired={isDemoExpired}
                  isContactUs={true}
                >
                  <User className="w-4 h-4" /> Contact Us
                </DemoAwareMenuItem>
              )}

              {!user && !isDemoExpired && (
                <div className="relative border-t border-gray-200 pt-2">
                  {companySlug === 'demo' && (
                    <div className="text-center mb-2 text-blue-700 font-medium text-sm">
                      → Login for employer view
                    </div>
                  )}
                  <button onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} className={`${buttonBaseClasses} bg-blue-600 hover:bg-blue-700 text-white w-full justify-center`}>
                    <User className="w-4 h-4" /> Login
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {isLoginOpen && !isDemoExpired && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
              <p className="text-gray-600 mt-1">Connect to your account</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" placeholder="votre@email.com" value={login} onChange={(e) => setLogin(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"/>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-700 text-sm">{error}</p></div>}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={() => setIsLoginOpen(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
              <button onClick={handleLogin} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Connect</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---


## `./src/app/Home/page.tsx`

```tsx
'use client'

import { Heart, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 w-full">
        
        {/* Logo Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <img
              src="/HRInnoLogo.jpeg"
              alt="InnoHR"
              width="450"
              height="450"
              className="rounded-full shadow-lg mx-auto mb-4"
            />
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12 max-w-6xl w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            HR was never as
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> easy </span>
            as now!
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
            Revolutionize your human resources with AI-powered tools for recruitment, 
            employee wellness, and workplace happiness assessment.
          </p>

          {/* Animated Decoration */}
          <div className="flex justify-center gap-3 mb-8">
            <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-150"></span>
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-300"></span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full px-4 pb-16">
        
        {/* Features Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          
          {/* Feature 1 - CV Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">AI CV Analysis</h3>
              <p className="text-gray-600 mb-4">
                Intelligent resume screening with detailed compatibility scoring and automated candidate evaluation.
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Smart Matching</span>
              </div>
            </div>
          </div>

          {/* Feature 2 - Happiness Assessment */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Workplace Wellness</h3>
              <p className="text-gray-600 mb-4">
                Anonymous employee happiness assessment based on the scientific PERMA-W model for better workplace culture.
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Anonymous & Secure</span>
              </div>
            </div>
          </div>

          {/* Feature 3 - Team Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Recruitment</h3>
              <p className="text-gray-600 mb-4">
                Streamlined hiring process with position management, applicant tracking, and detailed analytics dashboard.
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Full Pipeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Ready to Transform Your HR?
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Join the future of human resources with our AI-powered platform. 
              Start optimizing your recruitment and employee wellness today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 justify-center">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto mt-16 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfect Plan</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Scale your HR operations with flexible pricing plans designed to grow with your business
            </p>
          </div>

          {/* Mobile-First Responsive Pricing Cards */}
          <div className="block md:hidden space-y-6">
            {/* Mobile Card Layout */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Free</h3>
                <p className="text-3xl font-bold text-gray-900">Free</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">AI CV Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Opened positions</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Database Analyser</span>
                  <span className="text-red-500 font-bold">✕</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check</span>
                  <span className="text-red-500 font-bold">✕</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Medical uploads/month</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Recruitment Dashboard</span>
                  <span className="text-red-500 font-bold">✕</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check Dashboard</span>
                  <span className="text-red-500 font-bold">✕</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Certificate Management</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 shadow-xl border-2 border-blue-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-2">Momentum</h3>
                <p className="text-3xl font-bold text-blue-900">20 000 HUF</p>
                <p className="text-blue-600">/month</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">AI CV Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Opened positions</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Database Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Medical uploads/month</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Recruitment Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Certificate Management</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-xl border border-yellow-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-yellow-800 mb-2">Infinity</h3>
                <p className="text-3xl font-bold text-yellow-900">45 000 HUF</p>
                <p className="text-yellow-700">/month</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">AI CV Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Opened positions</span>
                  <span className="font-semibold">30</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Database Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Medical uploads/month</span>
                  <span className="font-semibold">20</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Recruitment Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Certificate Management</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 shadow-xl text-white">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Custom</h3>
                <p className="text-2xl font-semibold">Contact Us</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">AI CV Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Opened positions</span>
                  <span className="font-semibold text-white">∞</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Database Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Happy Check</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Medical uploads/month</span>
                  <span className="font-semibold text-white">∞</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Recruitment Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Happy Check Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Certificate Management</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-4 shadow-xl border border-blue-100">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b-2 border-blue-200">
                    <th className="text-left py-6 px-3 font-semibold text-gray-700 text-lg w-1/5">Features</th>
                    <th className="text-center py-6 px-3 w-1/5">
                      <div className="bg-gray-200 text-gray-800 rounded-lg p-4 shadow-md h-32 flex flex-col justify-center">
                        <h3 className="font-bold text-2xl mb-2">Free</h3>
                        <p className="text-2xl font-bold">Free</p>
                      </div>
                    </th>
                    <th className="text-center py-6 px-3 w-1/5 relative">
                      <div className="bg-blue-100 text-blue-800 rounded-lg p-4 shadow-md h-32 flex flex-col justify-center relative">
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <span className="bg-yellow-400 text-blue-900 text-xs font-bold px-2 py-1 rounded-full">POPULAR</span>
                        </div>
                        <h3 className="font-bold text-2xl mb-1">Momentum</h3>
                        <p className="text-2xl font-bold">20 000 HUF</p>
                        <p className="text-blue-600 text-sm">/month</p>
                      </div>
                    </th>
                    <th className="text-center py-6 px-3 w-1/5">
                      <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-yellow-900 rounded-lg p-4 shadow-md h-32 flex flex-col justify-center">
                        <h3 className="font-bold text-2xl mb-1">Infinity</h3>
                        <p className="text-2xl font-bold">45 000 HUF</p>
                        <p className="text-yellow-800 text-sm">/month</p>
                      </div>
                    </th>
                    <th className="text-center py-6 px-3 w-1/5">
                      <div className="bg-gradient-to-b from-gray-700 to-gray-800 text-white rounded-lg p-4 shadow-md h-32 flex flex-col justify-center">
                        <h3 className="font-bold text-2xl mb-1">Custom</h3>
                        <p className="text-lg font-semibold">Contact Us</p>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-700">AI CV Analyser</td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-700">Number of opened positions</td>
                    <td className="py-4 px-3 text-center font-semibold text-gray-800">3</td>
                    <td className="py-4 px-3 text-center font-semibold text-gray-800">5</td>
                    <td className="py-4 px-3 text-center font-semibold text-gray-800">30</td>
                    <td className="py-4 px-3 text-center font-semibold text-gray-800">∞</td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-700">Database Analyser for new position</td>
                    <td className="py-4 px-3 text-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-red-500 font-bold text-sm">✕</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-700">Happy Check</td>
                    <td className="py-4 px-3 text-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-red-500 font-bold text-sm">✕</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-700">Medical Certificate uploads/month</td>
                    <td className="py-4 px-3 text-center font-semibold text-gray-800">3</td>
                    <td className="py-4 px-3 text-center font-semibold text-gray-800">5</td>
                    <td className="py-4 px-3 text-center font-semibold text-gray-800">20</td>
                    <td className="py-4 px-3 text-center font-semibold text-gray-800">∞</td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-700">Recruitment Dashboard</td>
                    <td className="py-4 px-3 text-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-red-500 font-bold text-sm">✕</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-700">Happy Check Dashboard</td>
                    <td className="py-4 px-3 text-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-red-500 font-bold text-sm">✕</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-700">Certificate Management</td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-3 text-center"><CheckCircle className="w-6 h-6 text-green-500 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-2">500+</div>
            <div className="text-blue-100 text-sm md:text-base">CVs Analyzed</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-2">98%</div>
            <div className="text-green-100 text-sm md:text-base">Satisfaction Rate</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-2">24/7</div>
            <div className="text-purple-100 text-sm md:text-base">AI Support</div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-2">100%</div>
            <div className="text-yellow-100 text-sm md:text-base">Secure & Private</div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---


## `./src/app/api/analyse-cv/route.ts`

```ts
// src/app/api/analyse-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parsePdfBuffer } from '../../../../lib/parsePdfSafe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Optimized API call with faster model and timeout
async function callOpenRouterAPI(prompt: string, context = '', model = 'openai/gpt-3.5-turbo') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

  try {
    console.log(`Making API call for ${context} with model ${model}...`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
        'X-Title': 'CV Analysis App',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1500, // Reduced from 2000 for faster processing
      }),
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log(`API response for ${context} (status: ${response.status}):`, responseText.substring(0, 500) + '...');

    if (!response.ok) {
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
        throw new Error(`API returned HTML error page for ${context}. Check API key and endpoint status.`);
      }
      throw new Error(`API call failed for ${context}: ${response.status} ${response.statusText}`);
    }

    let completion;
    try {
      completion = JSON.parse(responseText);
    } catch {
      throw new Error(`API returned invalid JSON for ${context}`);
    }

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error(`Invalid API response structure for ${context}`);
    }

    return completion.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Error in callOpenRouterAPI for ${context}:`, error);
    throw error;
  }
}

// Fallback API call with different model
async function callFallbackAPI(prompt: string, context = '') {
  try {
    console.log(`Making fallback API call for ${context} with Claude Haiku...`);
    
    // Try Claude Haiku first (fast and reliable)
    return await callOpenRouterAPI(prompt, context, 'anthropic/claude-3-haiku');
  } catch {
    console.log(`Claude Haiku failed, trying Mistral Small for ${context}...`);
    
    // Then try Mistral Small (faster than 7b-instruct)
    return await callOpenRouterAPI(prompt, context, 'mistralai/mistral-small');
  }
}

// Robust JSON extraction
function extractAndParseJSON(rawResponse: string, context = '') {
  const trimmed = rawResponse.trim();
   console.log("Raw AI answer", rawResponse)
  try {
    return JSON.parse(trimmed);
  } catch {}

  // Extract first complete JSON object
  const match = trimmed.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
  if (!match) {
    console.error(`No JSON found in ${context} response:`, rawResponse);
    throw new Error(`No valid JSON found in ${context} response`);
  }

  try {
    return JSON.parse(match[0]);
  } catch (parseError) {
    console.error(`Invalid JSON in ${context} response:`, match[0]);
    throw new Error(`Invalid JSON structure in ${context} response`);
  }
}

// Sanitize filenames
function sanitizeFileName(filename: string) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const positionId = formData.get('positionId') as string;
    const source = formData.get('source') as string || 'Candidate Upload';

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Fichier PDF requis.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Optimize PDF parsing with length limit
    const MAX_CV_LENGTH = 8000; // Limit CV text for faster processing
    const fullCvText = await parsePdfBuffer(buffer);
    const cvText = fullCvText.length > MAX_CV_LENGTH 
      ? fullCvText.substring(0, MAX_CV_LENGTH) + '...[truncated]'
      : fullCvText;

    // Start file upload in parallel
    const safeFileName = sanitizeFileName(file.name);
    const filePath = `cvs/${Date.now()}_${safeFileName}`;
    
    const uploadPromise = supabase.storage
      .from('cvs')
      .upload(filePath, buffer, { contentType: 'application/pdf' });

    // Optimized prompts for faster processing
    const hrPrompt = `
Analyze this CV against the job requirements. Respond with JSON only.

CV: ${cvText}

Job Requirements: ${jobDescription}

Score strictly: 9-10 perfect match, 7-8 strong fit, 5-6 marginal, <5 unsuitable.

Required JSON format:
{
  "score": number,
  "analysis": "brief analysis focusing on key strengths, gaps, and fit assessment",
  "candidat_firstname": "string",
  "candidat_lastname": "string",
  "candidat_email": "string", 
  "candidat_phone": "string"
}

Be critical in scoring. Missing core requirements should significantly lower the score.
Analysis should be in perfect English.
`;

    const candidateFeedbackPrompt = `
You are a career consultant. Provide constructive feedback for this candidate.

CV: ${cvText}
Position: ${jobDescription}

Structure your feedback EXACTLY like this with clear paragraphs separated by double line breaks (\\n\\n):

1. Personal greeting using their first and last name from CV
2. Strengths paragraph highlighting relevant experience and skills
3. Development areas paragraph with specific improvement suggestions  
4. Career advice paragraph mentioning alternative suitable roles
5. Next steps paragraph with actionable recommendations

IMPORTANT: Each section must be a separate paragraph with \\n\\n between them.

Example format:
"Dear [First Name] [Last Name],\\n\\nYour strengths include...\\n\\nFor development, I recommend...\\n\\nRegarding your career path...\\n\\nYour next steps should focus on..."

Respond with JSON only:
{
  "feedback": "comprehensive feedback message with proper paragraph formatting using \\n\\n separators"
}

Keep tone kind, professional, encouraging, and actionable.
`;

    // === PARALLEL AI PROCESSING ===
    console.log('Starting parallel AI analysis...');
    
    const aiPromises = [
      // HR Analysis with fallback
      callOpenRouterAPI(hrPrompt, 'HR analysis')
        .catch(() => callFallbackAPI(hrPrompt, 'HR analysis')),
      
      // Candidate Feedback with fallback  
      callOpenRouterAPI(candidateFeedbackPrompt, 'candidate feedback')
        .catch(() => callFallbackAPI(candidateFeedbackPrompt, 'candidate feedback'))
    ];

    // Wait for both AI calls to complete
    const [hrRawResponse, candidateRawResponse] = await Promise.all(aiPromises);

    console.log('Both AI analyses completed');

    // Parse responses
    const hrData = extractAndParseJSON(hrRawResponse, 'HR analysis');
    const { score, analysis, candidat_firstname, candidat_lastname, candidat_email, candidat_phone } = hrData;

    const candidateData = extractAndParseJSON(candidateRawResponse, 'candidate feedback');
    const { feedback } = candidateData;

    // Wait for file upload to complete
    const { error: uploadError } = await uploadPromise;

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Échec upload CV' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from('cvs').getPublicUrl(filePath);
    const cvFileUrl = publicUrlData.publicUrl;

    // === Database Operations ===
    const { data: candidate, error: insertError } = await supabase
      .from('candidats')
      .insert({
        candidat_firstname,
        candidat_lastname,
        cv_text: fullCvText, // Store full text in database
        cv_file: cvFileUrl,
        candidat_email,
        candidat_phone
      })
      .select()
      .single();

    if (insertError || !candidate) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ error: 'Échec enregistrement candidat' }, { status: 500 });
    }

    const { error: relationError } = await supabase
      .from('position_to_candidat')
      .insert({
        position_id: positionId,
        candidat_id: candidate.id,
        candidat_score: score,
        candidat_ai_analyse: analysis,
        source
      });

    if (relationError) {
      console.error('Relation insert error:', relationError);
      return NextResponse.json({ error: 'Échec liaison position/candidat' }, { status: 500 });
    }

    return NextResponse.json({
      score,
      analysis,
      candidateFeedback: feedback
    });

  } catch (aiError: unknown) {
    console.error('AI processing error:', aiError);
    const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI processing error';
    return NextResponse.json({ error: `AI processing failed: ${errorMessage}` }, { status: 500 });
  }
}
```

---


## `./src/app/api/analyse-massive/route.ts`

```ts
// src/app/api/analyse-massive/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Fonction pour analyser un CV via l'IA
async function analyseCvWithAi(cvText: string, jobDescription: string, jobDescriptionDetailed: string) {
  const prompt = `
Tu es un expert RH. Voici un CV :

${cvText}

Voici la description détaillée du poste ciblé:

${jobDescription}

Analyze the CV only against the provided job description with extreme rigor.
Do not guess, assume, or infer any skill, experience, or qualification that is not explicitly written in the CV.
Be critical: even a single missing core requirement should significantly lower the score.
If the CV shows little or no direct relevance, the score must be 3 or lower.
Avoid “benefit of the doubt” scoring.

Your output must strictly follow this structure:

Profile Summary – short and factual, based only on what is explicitly written in the CV.

Direct Skill Matches – list only the job-relevant skills that are directly evidenced in the CV.

Critical Missing Requirements – list each key requirement from the job description that is missing or insufficient in the CV.

Alternative Suitable Roles – suggest other roles the candidate may fit based on their actual CV content.

Final Verdict – clear and decisive statement on whether this candidate should be considered.

Scoring Rules (Extremely Strict):

9–10 → Perfect fit: all key requirements explicitly met with proven, recent experience.

7–8 → Strong potential: almost all requirements met; only minor gaps.

5–6 → Marginal: some relevant experience but several major gaps. Unlikely to succeed without major upskilling.

Below 5 → Not suitable: lacks multiple essential requirements or background is in a different field.

Mandatory principles:

Never award a score above 5 unless the CV matches at least 80% of the core requirements.

When in doubt, choose the lower score.

Always provide concrete examples from the CV to justify the score.

Keep tone professional, concise, and free from speculation.

Répond uniquement avec un JSON strictement valide, au format :
{
  "score": number,
  "analysis": string
}
IMPORTANT : Ne réponds avec rien d'autre que ce JSON.

La réponse doit etre en anglais parfait
`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const completion = await res.json()
  const rawResponse = completion.choices?.[0]?.message?.content ?? ''
  const match = rawResponse.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Réponse JSON IA invalide')
  return JSON.parse(match[0])
}

// SSE handler
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const position_id_str = url.searchParams.get('position_id')
  const user_id = url.searchParams.get('user_id')

  if (!position_id_str) {
    return new Response(JSON.stringify({ error: 'position_id requis' }), { status: 400 })
  }
  if (!user_id) {
    return new Response(JSON.stringify({ error: 'user_id requis' }), { status: 400 })
  }

  const positionId = Number(position_id_str)
  if (isNaN(positionId)) {
    return new Response(JSON.stringify({ error: 'position_id invalide' }), { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { data: position, error: posErr } = await supabase
          .from('openedpositions')
          .select('*')
          .eq('id', positionId)
          .single()

        if (posErr || !position) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Position non trouvée' })}\n\n`))
          controller.close()
          return
        }

        // ✅ Appel RPC avec user_id passé dans l’URL
        const { data: candidats, error: candErr } = await supabase
          .rpc('get_company_candidates', { user_uuid: user_id })
        
        if (candErr) {
          console.error('Erreur RPC get_company_candidates:', candErr)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Impossible de récupérer les candidats' })}\n\n`))
          controller.close()
          return
        }

        if (!candidats || candidats.length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', matched: 0, total: 0 })}\n\n`))
          controller.close()
          return
        }

        let matched = 0
        for (let i = 0; i < candidats.length; i++) {
          const candidat = candidats[i]
          try {
            const { score, analysis } = await analyseCvWithAi(
              candidat.cv_text,
              position.position_description,
              position.position_description_detailed
            )

            if (score >= 7) {
              
            matched++ 

            await supabase.from('position_to_candidat').upsert({
              position_id: positionId,
              candidat_id: candidat.id,
              candidat_score: score,
              candidat_ai_analyse: analysis,
              source: 'Analyse from Database',
            })}
          } catch (err) {
            console.error(`Erreur analyse CV ${candidat.id}:`, err)
          }

          const progress = Math.floor(((i + 1) / candidats.length) * 100)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', progress })}\n\n`))
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', matched, total: candidats.length })}\n\n`))
        controller.close()
      } catch (err) {
        console.error(err)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Erreur serveur.' })}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}
```

---


## `./src/app/api/close/route.ts`

```ts
import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'

export async function POST(request: Request) {
  try {
    const { positionId } = await request.json()

    if (!positionId) {
      return NextResponse.json({ error: 'positionId is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    console.log("ID to close:",positionId)

    const {data, error } = await supabase
      .from('openedpositions')
      .update({ position_end_date: new Date().toISOString() })
      .eq('id', positionId)
      .select();

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Rows Updated:", data)

    return NextResponse.json({ message: 'Position closed' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
```

---


## `./src/app/api/contact/route.ts`

```ts
// /app/api/contact/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for server-side operations
);

// -------------------
// Rate Limiting Setup
// -------------------
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

function getRateLimitKey(ip: string, email: string): string {
  return `${ip}-${email}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const requests = rateLimitStore.get(key) || [];

  // Remove outdated requests
  const recentRequests = requests.filter((ts) => now - ts < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) return true;

  // Update store
  recentRequests.push(now);
  rateLimitStore.set(key, recentRequests);

  return false;
}

// -------------------
// Helpers
// -------------------
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp;
  return 'unknown';
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  if (!phone) return true; // optional
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{8,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function sanitizeInput(input: string): string {
  return input.trim().substring(0, 1000); // max 1000 chars
}

// -------------------
// POST Handler
// -------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      phone,
      email,
      companyName,
      comment,
      gdprConsent,
      marketingConsent,
      trigger,
      submittedAt,
      userAgent
    } = body;

    // 1. Required fields
    if (!firstName || !lastName || !email || !companyName || !gdprConsent) {
      return NextResponse.json(
        { error: 'Missing required fields or GDPR consent' },
        { status: 400 }
      );
    }

    // 2. Email & phone validation
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (phone && !validatePhone(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // 3. Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitKey = getRateLimitKey(clientIP, email);
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 4. Sanitize inputs
    const sanitizedData = {
      first_name: sanitizeInput(firstName),
      last_name: sanitizeInput(lastName),
      email: sanitizeInput(email.toLowerCase()),
      phone: phone ? sanitizeInput(phone) : null,
      company_name: sanitizeInput(companyName),
      comment: comment ? sanitizeInput(comment) : null,
      gdpr_consent: Boolean(gdprConsent),
      marketing_consent: Boolean(marketingConsent),
      trigger: trigger || 'other',
      ip_address: clientIP,
      user_agent: userAgent || '',
      submitted_at: submittedAt || new Date().toISOString(),
      processed_at: new Date().toISOString(),
      status: 'new'
    };

    // 5. Save to Supabase
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([sanitizedData])
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save contact information' }, { status: 500 });
    }

    console.log(
      `New contact submission: ID ${data.id}, Email: ${sanitizedData.email}, Company: ${sanitizedData.company_name}`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Contact information received successfully',
        submissionId: data.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---


## `./src/app/api/feedback/route.ts`

```ts
// app/api/feedback/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse,NextRequest } from 'next/server'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for server-side operations
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rating, comment } = body

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating is required and must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get client IP for tracking (optional)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('demo_feedback')
      .insert({
        rating: parseInt(rating),
        comment: comment || null,
        ip_address: ip,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Feedback submitted successfully', data },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Optional: Get all feedback (for admin purposes)
    const { data, error } = await supabase
      .from('demo_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---


## `./src/app/api/happiness/chat/route.ts`

```ts
// src/app/api/happiness/chat/route.ts (friendly AI version)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface PermaScores {
  positive?: number;
  engagement?: number;
  relationships?: number;
  meaning?: number;
  accomplishment?: number;
  work_life_balance?: number;
}

// Structured questions based on the PERMA-W model
const permaQuestions = [
  {
    step: 1,
    dimension: 'positive',
    question: "To start, how would you describe your overall mood at work this week? How do you usually feel when arriving in the morning?"
  },
  {
    step: 2,
    dimension: 'positive', 
    question: "Can you tell me about a recent moment at work where you felt joy or genuine pleasure? Please give a concrete example."
  },
  {
    step: 3,
    dimension: 'engagement',
    question: "Describe a recent time when you were fully absorbed in your work—where time seemed to fly by."
  },
  {
    step: 4,
    dimension: 'engagement',
    question: "To what extent do you feel your skills and talents are being well utilized in your current role?"
  },
  {
    step: 5,
    dimension: 'relationships',
    question: "How would you describe the quality of your relationships with colleagues? Do you feel you have people you can rely on at work?"
  },
  {
    step: 6,
    dimension: 'relationships',
    question: "Do you feel heard and valued by your manager and team?"
  },
  {
    step: 7,
    dimension: 'meaning',
    question: "In what ways does your work feel meaningful to you? How do you feel you contribute to something bigger?"
  },
  {
    step: 8,
    dimension: 'meaning',
    question: "Do your personal values align with those of your organization? Can you give an example?"
  },
  {
    step: 9,
    dimension: 'accomplishment',
    question: "Which achievements from the past months are you most proud of?"
  },
  {
    step: 10,
    dimension: 'accomplishment',
    question: "How do you see your professional growth? Do you feel you are reaching your goals?"
  },
  {
    step: 11,
    dimension: 'work_life_balance',
    question: "How do you manage the balance between your work and personal life? Are you able to disconnect and recharge?"
  },
  {
    step: 12,
    dimension: 'work_life_balance',
    question: "Finally, is there anything you would like to change about your current work situation?"
  }
];

// Friendly AI scoring function
async function analyzeResponseWithAI(response: string, dimension: string, questionText: string): Promise<number> {
  try {
    const prompt = `You are an experienced and empathetic workplace psychologist. Analyze this response to a question about professional well-being.

EVALUATED DIMENSION: ${dimension}
QUESTION ASKED: "${questionText}"
EMPLOYEE RESPONSE: "${response}"

Give a score from 1 to 10, being kind but realistic, based on this scale:

9-10: Excellent - Very fulfilled, positive, proactive in this dimension
7-8: Good - Satisfactory with identifiable positive aspects
5-6: Fair - Acceptable situation, some normal challenges
3-4: Developing - Challenges exist but not alarming
1-2: Difficult - Concerning situation needing attention

KIND PRINCIPLES:
- Value expressed efforts and positive intentions
- Acknowledge that temporary challenges are normal at work
- Self-reflection and honesty are positive signs
- Do not penalize vulnerability or natural emotions
- Consider the professional context as inherently improvable
- Words like "fairly good", "okay", "acceptable" deserve 6-7/10
- Absence of major issues = minimum 5-6/10
- Long and thoughtful responses are valued

Respond ONLY with a decimal number (e.g., 6.5):`;

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 50
      }),
    });

    const completion = await aiResponse.json();
    const scoreText = completion.choices?.[0]?.message?.content?.trim() || '6';
    
    const scoreMatch = scoreText.match(/(\d+\.?\d*)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 6;
    
    let finalScore = isNaN(score) ? 6 : Math.min(10, Math.max(1, score));
    
    if (finalScore < 4 && response.length > 50 && !response.toLowerCase().includes('terrible') && !response.toLowerCase().includes('horrible')) {
      finalScore = Math.max(4, finalScore);
    }
    
    console.log(`AI Scoring - Dimension: ${dimension}, Response: "${response.substring(0, 100)}...", Score: ${finalScore}`);
    
    return finalScore;
    
  } catch (error) {
    console.error('AI scoring error:', error);
    
    const lowerResponse = response.toLowerCase();
    const positiveIndicators = ['good', 'well', 'happy', 'satisfied', 'motivated', 'pleasure', 'team', 'goals', 'progress'];
    const negativeIndicators = ['bad', 'terrible', 'horrible', 'hate', 'impossible', 'never', 'none'];
    
    let fallbackScore = 6;
    
    if (response.length > 100) fallbackScore += 0.5;
    if (response.length > 200) fallbackScore += 0.5;
    
    const positiveCount = positiveIndicators.filter(word => lowerResponse.includes(word)).length;
    const negativeCount = negativeIndicators.filter(word => lowerResponse.includes(word)).length;
    
    fallbackScore += positiveCount * 0.5;
    fallbackScore -= negativeCount * 0.8;
    
    return Math.min(10, Math.max(3, Math.round(fallbackScore * 2) / 2));
  }
}

// Generate personalized advice
async function generatePersonalizedAdvice(permaScores: PermaScores, sessionId: string): Promise<string[]> {
  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('message_text, step_number')
      .eq('session_id', sessionId)
      .eq('is_bot_message', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    }

    const sortedScores = Object.entries(permaScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3);

    const contextResponses = messages && messages.length > 0 
      ? messages.slice(0, 6).map(m => m.message_text).join(' ') 
      : '';

    const avgScore = Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length;

    const prompt = `You are an expert and empathetic workplace well-being coach. 

USER PROFILE:
- Average score: ${avgScore.toFixed(1)}/10
${Object.entries(permaScores).map(([dim, score]) => `- ${dim}: ${score}/10`).join('\n')}

PRIORITY AREAS (lowest scores):
${sortedScores.map(([dim, score]) => `- ${dim}: ${score}/10`).join('\n')}

CONTEXT (sample responses): "${contextResponses.substring(0, 400)}..."

TASK: Create 3 short, encouraging, actionable tips (max 4 lines each).

TONE: ${avgScore >= 7 ? 'Encouraging and optimizing' : avgScore >= 5 ? 'Supportive and constructive' : 'Kind and reassuring'}

RULES:
✅ Casual and friendly tone
✅ Practical and achievable tips
✅ Focus on weak areas BUT stay positive
✅ Max 4-5 lines per tip
✅ Start with an appropriate emoji
✅ Avoid medical/clinical terms
✅ Highlight what already works

EXACT FORMAT:
1. [emoji] [short actionable tip]
2. [emoji] [short actionable tip]
3. [emoji] [short actionable tip]

Respond ONLY with the 3 numbered tips and in a proper English`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 600
      }),
    });

    const completion = await response.json();
    const aiResponse = completion.choices?.[0]?.message?.content ?? '';
    
    const adviceLines = aiResponse
      .split('\n')
      .filter((line: string) => /^\d+\.\s/.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    while (adviceLines.length < 3) {
      const fallbackAdvice = avgScore >= 7 
        ? "🚀 Keep up the great work! Share your best practices with colleagues"
        : avgScore >= 5
        ? "💡 Identify one small thing to improve this week and go for it"
        : "🌱 Remember that every small step counts; you're not alone in this journey";
      
      adviceLines.push(fallbackAdvice);
    }

    console.log('Generated advice:', adviceLines);
    return adviceLines;

  } catch (error) {
    console.error('Advice generation error:', error);
    
    const avgScore = Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length;
    
    if (avgScore >= 7) {
      return [
        "🎯 You're on the right track! Keep nurturing what makes you happy at work",
        "🤝 Share your positive energy with colleagues—it can do wonders",
        "📈 Use this momentum to set a new stimulating challenge"
      ];
    } else if (avgScore >= 5) {
      return [
        "🌱 Pick one aspect of your work to improve and start small",
        "☕ Take time to chat with colleagues; relationships often make the difference",
        "⏸️ Give yourself real breaks during the day; your brain needs to rest"
      ];
    } else {
      return [
        "🫂 Remember, you are not alone—feel free to share your struggles",
        "🎯 Set very simple goals to gradually regain confidence",
        "🌅 Each new day is a chance to see things differently"
      ];
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    
    const sessionToken = request.headers.get('x-session-token');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing session token' },
        { status: 401 }
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from('happiness_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();
    
    if (sessionError || !session) {
      console.error('Session fetch error:', sessionError);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.timeout_at && new Date() > new Date(session.timeout_at)) {
      await supabase
        .from('happiness_sessions')
        .update({ 
          status: 'timeout',
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionToken);
      
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'This assessment has already been completed' },
        { status: 400 }
      );
    }

    let currentStep = session.current_step || 0;
    let permaScores: PermaScores = {};
    
    if (session.perma_scores) {
      try {
        permaScores = typeof session.perma_scores === 'string' 
          ? JSON.parse(session.perma_scores) 
          : session.perma_scores;
      } catch (e) {
        console.error('Error parsing existing scores:', e);
        permaScores = {};
      }
    }
    
    if (currentStep > 0 && currentStep <= permaQuestions.length) {
      const currentQuestion = permaQuestions[currentStep - 1];
      
      const score = await analyzeResponseWithAI(
        message, 
        currentQuestion.dimension, 
        currentQuestion.question
      );
      
      permaScores = {
        ...permaScores,
        [currentQuestion.dimension]: score
      };
      
      console.log(`Step ${currentStep}: AI Score for ${currentQuestion.dimension}: ${score}`);
    }

    currentStep += 1;

    let response: string;
    let completed = false;
    let personalizedAdvice: string[] = [];

    if (currentStep <= permaQuestions.length) {
      const nextQuestion = permaQuestions[currentStep - 1];
      response = nextQuestion.question;
    } else {
      completed = true;
      
      const avgScore = Object.keys(permaScores).length > 0 
        ? Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length
        : 6;

      // FIX : Génération des conseils personnalisés
      personalizedAdvice = await generatePersonalizedAdvice(permaScores, session.id);
      console.log('Conseils générés dans route:', personalizedAdvice);

      let endMessage = "";
      if (avgScore >= 8) {
        endMessage = "Fantastic! Your workplace well-being is shining positively. Keep cultivating this great energy! 🌟";
      } else if (avgScore >= 6.5) {
        endMessage = "Very good! You have solid foundations for your professional well-being. A few tweaks can make you shine even more! ✨";
      } else if (avgScore >= 5) {
        endMessage = "Your situation has good potential for improvement. The tips below will help you reach new heights! 🚀";
      } else {
        endMessage = "Thank you for your honesty. Your answers show real challenges, but remember that everything can improve with the right strategies and support. 💙";
      }

      response = `Thank you for sharing your sincere thoughts! 🎉

Your well-being assessment is now complete. Here's a summary of your results:

**Overall workplace well-being score: ${Math.round(avgScore * 10) / 10}/10**

${endMessage}

This assessment is completely anonymous and designed to support overall employee well-being within the company.`;
    }

    const updateData: {
      current_step: number;
      status: 'completed' | 'in_progress';
      last_activity: string;
      perma_scores?: PermaScores;
      completed_at?: string;
      overall_happiness_score?: number;
    } = {
      current_step: currentStep,
      status: completed ? 'completed' : 'in_progress',
      last_activity: new Date().toISOString()
    };

    if (permaScores && Object.keys(permaScores).length > 0) {
      updateData.perma_scores = permaScores;
    }

    if (completed) {
      updateData.completed_at = new Date().toISOString();
      const avgScore = Object.keys(permaScores).length > 0 
        ? Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length
        : 6;
      updateData.overall_happiness_score = Math.round(avgScore);
    }

    console.log('Session update:', { sessionId: session.id, currentStep, scores: permaScores });

    const { error: updateError } = await supabase
      .from('happiness_sessions')
      .update(updateData)
      .eq('session_token', sessionToken);

    if (updateError) {
      console.error('Session update error:', updateError);
      return NextResponse.json(
        { error: 'Session update error' },
        { status: 500 }
      );
    }

    await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: session.id,
          message_text: message,
          is_bot_message: false,
          step_number: currentStep - 1,
          message_type: currentStep <= permaQuestions.length ? 'question' : 'completion'
        },
        {
          session_id: session.id,
          message_text: response,
          is_bot_message: true,
          step_number: currentStep,
          message_type: completed ? 'completion' : 'question'
        }
      ]);

    // FIX : Retourner les conseils personnalisés dans la réponse
    const sessionUpdate = {
      response,
      step: currentStep,
      completed,
      scores: permaScores,
      personalizedAdvice: completed ? personalizedAdvice : undefined
    };

    console.log('Réponse envoyée au frontend:', sessionUpdate);
    return NextResponse.json(sessionUpdate);

  } catch (error) {
    console.error('Error in POST /api/happiness/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }}
```

---


## `./src/app/api/happiness/dashboard/route.ts`

```ts


// src/app/api/happiness/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // This endpoint should be protected by your auth system
    // Add your authentication check here
    
    const url = new URL(req.url)

    const days = parseInt(url.searchParams.get('days') || '30', 10)
    const user_id = url.searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'user_id manquant' }, { status: 400 })
    }



    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    //Get company from session.user

    // Récupère le company_id
    const { data: company, error: companyError } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', user_id)
      .single()

    // Get recent metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('happiness_daily_metrics')
      .select('*')
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: false })

    if (metricsError) {
      console.error('Metrics error:', metricsError)
      return NextResponse.json({ error: 'Erreur récupération métriques' }, { status: 500 })
    }

    // Get current period stats
    const { data: currentStats, error: statsError } = await supabase
      .from('happiness_sessions')
      .select('overall_happiness_score, perma_scores, status, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed')

    if (statsError) {
      console.error('Stats error:', statsError)
      return NextResponse.json({ error: 'Erreur récupération statistiques' }, { status: 500 })
    }

    // Calculate summary stats
    const totalSessions = currentStats?.length || 0
    const avgHappiness = totalSessions > 0 
      ? currentStats.reduce((sum, s) => sum + (s.overall_happiness_score || 0), 0) / totalSessions
      : 0

    // Calculate PERMA averages
    const permaAverages = totalSessions > 0 ? {
      positive: currentStats.reduce((sum, s) => sum + (s.perma_scores?.positive || 0), 0) / totalSessions,
      engagement: currentStats.reduce((sum, s) => sum + (s.perma_scores?.engagement || 0), 0) / totalSessions,
      relationships: currentStats.reduce((sum, s) => sum + (s.perma_scores?.relationships || 0), 0) / totalSessions,
      meaning: currentStats.reduce((sum, s) => sum + (s.perma_scores?.meaning || 0), 0) / totalSessions,
      accomplishment: currentStats.reduce((sum, s) => sum + (s.perma_scores?.accomplishment || 0), 0) / totalSessions,
      work_life_balance: currentStats.reduce((sum, s) => sum + (s.perma_scores?.work_life_balance || 0), 0) / totalSessions
    } : {}

    // Find areas for improvement (lowest scores)
    const sortedPerma = Object.entries(permaAverages)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2)

    return NextResponse.json({
      summary: {
        totalSessions,
        avgHappiness: Math.round(avgHappiness * 10) / 10,
        participationTrend: metrics?.length > 1 ? 
          (metrics[0]?.total_sessions_completed || 0) - (metrics[1]?.total_sessions_completed || 0) : 0
      },
      permaAverages,
      areasForImprovement: sortedPerma.map(([key, value]) => ({
        area: key,
        score: Math.round(value * 10) / 10
      })),
      dailyMetrics: metrics || [],
      period: `${days} derniers jours`
    })

  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

---


## `./src/app/api/happiness/session/route.ts`

```ts
// src/app/api/happiness/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes, createHash } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Interface pour le body de la requête
interface CreateSessionRequestBody {
  company_id?: number;
}

// Interface pour les données de session
interface SessionData {
  session_token: string;
  ip_hash: string;
  user_agent_hash: string;
  status: string;
  company_id?: number;
}

function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'default_salt').digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateSessionRequestBody = await req.json()
    const { company_id } = body // Extract company_id from request body
    
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const sessionToken = generateSessionToken()
    const ipHash = hashIP(ip)
    const userAgentHash = hashIP(userAgent)

    // Check for recent sessions from same IP (optional cooldown)
    const { data: recentSessions } = await supabase
      .from('happiness_sessions')
      .select('created_at')
      .eq('ip_hash', ipHash)
      //.gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // 2 hours cooldown
      .gte('created_at', new Date(Date.now()).toISOString())
      .eq('status', 'completed')

    if (recentSessions && recentSessions.length > 0) {
      return NextResponse.json({
        error: 'Une évaluation récente a déjà été effectuée. Merci de réessayer plus tard.'
      }, { status: 429 })
    }

    // Prepare session data
    const sessionData: SessionData = {
      session_token: sessionToken,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      status: 'created'
    }

    // Add company_id if provided
    if (company_id) {
      sessionData.company_id = company_id
    }

    const { data: session, error } = await supabase
      .from('happiness_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('Session creation error:', error)
      return NextResponse.json({ error: 'Erreur création session' }, { status: 500 })
    }

    return NextResponse.json({
      sessionToken,
      sessionId: session.id,
      message: 'Session créée avec succès',
      company_id: session.company_id // Return company_id in response for confirmation
    })

  } catch (err) {
    console.error('Session creation error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.headers.get('x-session-token')
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Token session requis' }, { status: 401 })
    }

    const { data: session, error } = await supabase
      .from('happiness_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Check if session is expired
    if (new Date() > new Date(session.timeout_at)) {
      await supabase
        .from('happiness_sessions')
        .update({ status: 'timeout' })
        .eq('session_token', sessionToken)
      
      return NextResponse.json({ error: 'Session expirée' }, { status: 410 })
    }

    return NextResponse.json({ session })

  } catch (err) {
    console.error('Session retrieval error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

---


## `./src/app/api/medical-certificates/confirm/route.ts`

```ts
// /api/medical-certificates/confirm/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const employee_name = formData.get('employee_name') as string | null
    const absenceDateStart = formData.get('absenceDateStart') as string | null
    const absenceDateEnd = formData.get('absenceDateEnd') as string | null
    const employee_comment = formData.get('comment') as string | null
    const file = formData.get('file') as File | null
    const company_id = formData.get('company_id') as string | null

    // 🔹 DEBUG: Log des valeurs reçues
    console.log('=== DEBUG CONFIRM ROUTE ===')
    console.log('employee_name:', employee_name)
    console.log('absenceDateStart:', absenceDateStart)
    console.log('absenceDateEnd:', absenceDateEnd)
    console.log('employee_comment:', employee_comment)
    console.log('company_id (raw):', company_id)
    console.log('company_id type:', typeof company_id)
    console.log('=========================')

    if (!company_id) {
      console.error('❌ company_id is missing or null')
      return NextResponse.json(
        { error: 'Missing company_id' },
        { status: 400 }
      )
    }

    if (!file) {
      console.error('❌ file is missing or null')
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // 🔹 Validation et conversion du company_id
    const companyIdNumber = parseInt(company_id, 10)
    if (isNaN(companyIdNumber)) {
      console.error('❌ company_id cannot be converted to number:', company_id)
      return NextResponse.json(
        { error: 'Invalid company_id format' },
        { status: 400 }
      )
    }

    console.log('✅ company_id converted to number:', companyIdNumber)

    // 🔹 Upload fichier dans Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filePath = `certificates/${company_id}/${Date.now()}-${file.name}` // Inclure company_id dans le chemin

    const { error: uploadError } = await supabase.storage
      .from('medical-certificates')
      .upload(filePath, fileBuffer, { contentType: file.type })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Error uploading file' },
        { status: 500 }
      )
    }

    console.log('✅ File uploaded successfully:', filePath)

    // 🔹 Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('medical-certificates')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl
    console.log('✅ Public URL generated:', publicUrl)

    // 🔹 Préparer les données pour l'insertion
    const insertData = {
      employee_name,
      absence_start_date: absenceDateStart,
      absence_end_date: absenceDateEnd,
      employee_comment,
      certificate_file: publicUrl,
      company_id: companyIdNumber,
    }

    console.log('📝 Data to insert:', JSON.stringify(insertData, null, 2))

    // 🔹 Insérer les métadonnées en base
    const { data: insertedData, error: dbError } = await supabase
      .from('medical_certificates')
      .insert([insertData])
      .select() // Récupérer les données insérées pour vérification

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json(
        { error: 'Error inserting into database', details: dbError.message },
        { status: 500 }
      )
    }

    console.log('✅ Data inserted successfully:', insertedData)

    return NextResponse.json({ 
      message: 'Certificate saved successfully!',
      insertedData // Temporaire pour debugging
    })
  } catch (e) {
    console.error('❌ Server error:', e)
    return NextResponse.json(
      { error: 'Server error', details: (e as Error).message },
      { status: 500 }
    )
  }
}
```

---


## `./src/app/api/medical-certificates/upload/route.ts`

```ts
// src/app/api/medical-certificates/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Analytics } from "@vercel/analytics/next"

export const dynamic = "force-dynamic"; // évite le cache
export const maxDuration = 60; // Vercel: laisse le temps à l'OCR

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OCR.Space renvoie ce type de structure
type OCRSpaceResponse = {
  OCRExitCode: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  ParsedResults?: Array<{
    ParsedText?: string;
    ErrorMessage?: string | string[];
  }>;
};

type CertificateData = {
  employee_name: string;
  sickness_start_date: string;
  sickness_end_date: string;
  raw?: string;
};

function sanitizeFileName(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

// Tente d'extraire un JSON depuis un texte (au cas où le LLM renvoie du texte autour)
function safeExtractJson(text: string): CertificateData | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return {
      employee_name: parsed.employee_name ?? "not recognised",
      sickness_start_date: parsed.sickness_start_date ?? "not recognised",
      sickness_end_date: parsed.sickness_end_date ?? "not recognised",
      raw: text,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OCRSPACE_API_KEY) {
      return NextResponse.json({ error: "Missing OCRSPACE_API_KEY" }, { status: 500 });
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("company_id") as string | null; // AJOUT: récupération du company_id

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Détection type fichier
    const fileType = file.type;
    const isPdf = fileType === "application/pdf";
    const isImage = fileType.startsWith("image/");

    if (!isPdf && !isImage) {
      return NextResponse.json({ error: "File must be an image or PDF" }, { status: 400 });
    }

    // 1) Upload dans Supabase Storage avec le company_id dans le chemin
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = sanitizeFileName(file.name);
    const filePath = `uploads/${companyId}/${Date.now()}_${safeName}`; // MODIFICATION: inclure company_id dans le chemin

    const { error: uploadError } = await supabase.storage
      .from("medical-certificates")
      .upload(filePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabase
      .storage.from("medical-certificates")
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl ?? null;

    const { data: signed, error: signErr } = await supabase
      .storage.from("medical-certificates")
      .createSignedUrl(filePath, 60 * 5);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: "Could not create signed URL for OCR" }, { status: 500 });
    }

    // 2) Appel OCR.Space
    const params = new URLSearchParams();
    params.set("url", signed.signedUrl);
    params.set("language", "hun");
    params.set("detectOrientation", "true");
    params.set("isOverlayRequired", "false");
    params.set("isTable", "true");
    params.set("scale", "true");
    params.set("OCREngine", "1");

    if (isPdf) {
      params.set("filetype", "pdf"); // OCR.Space gère les PDF
    }

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCRSPACE_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const ocrJson = (await ocrRes.json()) as OCRSpaceResponse;

    if (!ocrRes.ok || !ocrJson || ocrJson.OCRExitCode !== 1 || ocrJson.IsErroredOnProcessing) {
      const msg =
        (Array.isArray(ocrJson?.ErrorMessage) ? ocrJson.ErrorMessage.join("; ") : ocrJson?.ErrorMessage) ||
        "OCR failed";
      return NextResponse.json({ error: `OCR error: ${msg}` }, { status: 502 });
    }

    const rawText =
      (ocrJson.ParsedResults ?? [])
        .map((r) => r?.ParsedText ?? "")
        .join("\n")
        .trim() || "";

//console.log("Raw PDF:", rawText)

    // 3) Extraction JSON via OpenRouter
    const extractPrompt = `
You will receive raw OCR text from a Hungarian medical certificate. Be Careful, the language of the certificate may vary.
I would like to return from this raw text: 
The name (in the file it will first name and last name together), the starting date of sickness, the end date of sickness
Extract the following fields and return STRICT JSON, nothing else:
{
  "employee_name": string | null,
  "sickness_start_date": "YYYY-MM-DD" | null,
  "sickness_end_date": "YYYY-MM-DD" | null
}
Rules:
- If a field is missing, set it to "not recognised".
- Try to normalize dates to YYYY-MM-DD if possible.
- Do not include any explanation. Only output JSON.

OCR TEXT:
---
${rawText}
---`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: extractPrompt }],
        temperature: 0.1,
      }),
    });

    const aiJson = await aiRes.json();
    const candidateText = aiJson?.choices?.[0]?.message?.content ?? "";
    let structured: CertificateData | null = safeExtractJson(candidateText);
    console.log("JSON from AI:", candidateText)

    if (!structured) {
      structured = {
        employee_name: "not recognised",
        sickness_start_date: "not recognised",
        sickness_end_date: "not recognised",
        raw: candidateText || null,
      };
    }

    return NextResponse.json({
      success: true,
      company_id: companyId, // AJOUT: retourner le company_id dans la réponse
      storage_path: filePath,
      signed_url: signed.signedUrl,
      public_url: publicUrl,
      raw_text: rawText,
      extracted_data: structured,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: (err as Error)?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
```

---


## `./src/app/api/new-position/route.ts`

```ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, position_name, position_description, position_description_detailed, position_start_date } = body

    if (!user_id || !position_name || !position_description || !position_description_detailed || !position_start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerComponentClient({ cookies })

    const { data: company, error: companyError } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', user_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: companyError?.message || 'Company not found' }, { status: 400 })
    }

    // Ici on utilise .insert(...).select() pour récupérer l'ID
    const { data: insertedData, error: insertError } = await supabase
      .from('openedpositions')
      .insert([
        {
          position_name,
          position_description,
          position_description_detailed,
          position_start_date,
          user_id,
          company_id: company.company_id,
        },
      ])
      .select() // ← important pour récupérer les champs insérés

    if (insertError || !insertedData || insertedData.length === 0) {
      return NextResponse.json({ error: insertError?.message || 'Failed to create position' }, { status: 500 })
    }

    // On renvoie l'ID de la position créée
    return NextResponse.json({ message: 'Position created successfully', id: insertedData[0].id })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
```

---


## `./src/app/api/positions-private/route.ts`

```ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') // Doit matcher ton param dans l'URL
  const now = new Date().toISOString();


  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = createServerComponentClient({ cookies: () => cookies() })

  // Récupérer le company_id de l'utilisateur
  const { data: companyLink, error: errorCompany } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', userId)
    .single(); // on attend un seul enregistrement

  if (errorCompany) {
    return NextResponse.json({ error: errorCompany.message }, { status: 500 })
  }

  if (!companyLink) {
    return NextResponse.json({ positions: [] })
  }

  // Récupérer les positions liées à cette compagnie
  const { data: positions, error: errorPositions } = await supabase
    .from('openedpositions')
    .select(`*, company:company_id (company_logo)`)
    .eq('company_id', companyLink.company_id)
    .or(`position_end_date.is.null,position_end_date.gt.${now}`)

  if (errorPositions) {
    return NextResponse.json({ error: errorPositions.message }, { status: 500 })
  }

  return NextResponse.json({ positions: positions || [] })
}
```

---


## `./src/app/api/positions-public/route.ts`

```ts
import { NextResponse } from "next/server"
import { createServerClient } from "../../../../lib/supabaseServerClient"

export async function GET(req: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    console.log("slug", slug)

    let query = supabase
      .from("openedpositions")
      .select(
        `
        id,
        position_name,
        position_description,
        position_description_detailed,
        company:company(
          company_logo,
          slug
        )
      `
      )
      

    // ⚡ Filtre par slug si fourni
    if (slug) {
      query = query.eq("company.slug", slug)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ positions: data }, { status: 200 })
  } catch (e) {
    console.error("API error:", e)
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    )
  }
}
```

---


## `./src/app/api/positions/analytics.ts`

```ts
// app/api/positions/analytics/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CandidatData {
  candidat_firstname?: string;
  candidat_lastname?: string;
}

interface PositionToCandidatItem {
  created_at: string;
  candidat_score: number | null;
  source: string;
  candidats: CandidatData | null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const position_id = url.searchParams.get('position_id')
  const user_id = url.searchParams.get('user_id')
  const period = url.searchParams.get('period')

  if (!position_id) {
    return new Response(JSON.stringify({ error: 'position_id requis' }), { status: 400 })
  }
  if (!user_id) {
    return new Response(JSON.stringify({ error: 'user_id requis' }), { status: 400 })
  }

  try {
    // Vérifier que la position existe
    const { data: position, error: posErr } = await supabase
      .from('openedpositions')
      .select('*')
      .eq('id', position_id)
      .single()

    if (posErr || !position) {
      return new Response(JSON.stringify({ error: 'Position non trouvée' }), { status: 404 })
    }

    // Construire la requête pour les candidats de cette position
    let query = supabase
      .from('position_to_candidat')
      .select(`
        created_at,
        candidat_score,
        source,
        candidats (
          candidat_firstname,
          candidat_lastname
        )
      `)
      .eq('position_id', position_id)

    // Appliquer le filtre temporel si spécifié
    if (period && period !== 'all') {
      const days = parseInt(period.replace('d', ''))
      if (!isNaN(days)) {
        const filterDate = new Date()
        filterDate.setDate(filterDate.getDate() - days)
        query = query.gte('created_at', filterDate.toISOString())
      }
    }

    const { data: candidateData, error: candidateError } = await query

    if (candidateError) {
      console.error('Erreur lors de la récupération des candidats:', candidateError)
      return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des candidats' }), { status: 500 })
    }

    // Formater les données avec typage correct
    const formattedCandidates = (candidateData as PositionToCandidatItem[])?.map(item => ({
      created_at: item.created_at,
      candidat_score: item.candidat_score,
      source: item.source || 'upload manuel',
      candidat_firstname: item.candidats?.candidat_firstname || '',
      candidat_lastname: item.candidats?.candidat_lastname || ''
    })) || []

    return new Response(JSON.stringify({ 
      candidates: formattedCandidates,
      position: position
    }), { status: 200 })

  } catch (err) {
    console.error('Erreur API:', err)
    return new Response(JSON.stringify({ error: 'Erreur serveur interne' }), { status: 500 })
  }
}
```

---


## `./src/app/api/positions/list.ts`

```ts
// pages/api/positions/list.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabaseClient';

interface Position {
  id: number;
  position_name: string;
  position_start_date: string;
  position_end_date: string | null;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérification de l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Récupérer l'ID de la compagnie via la fonction get_company_candidates
    // Note: Nous utilisons cette fonction pour obtenir l'ID de la compagnie
    const { data: companyData, error: companyError } = await supabase
      .rpc('get_company_candidates', { 
        user_id_param: user_id as string 
      });

    if (companyError) {
      console.error('Error getting company:', companyError);
      return res.status(403).json({ error: 'No company associated with user' });
    }

    // Extraire l'ID de la compagnie (assuming the function returns company info)
    // Vous devrez adapter cette partie selon le retour exact de votre fonction
    const companyId = companyData?.[0]?.company_id;
    
    if (!companyId) {
      return res.status(403).json({ error: 'No company found for user' });
    }

    // Récupérer les positions de la compagnie
    const { data: positions, error: positionsError } = await supabase
      .from('openedpositions')
      .select('id, position_name, position_start_date, position_end_date, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (positionsError) {
      console.error('Error fetching positions:', positionsError);
      return res.status(500).json({ error: 'Error fetching positions' });
    }

    return res.status(200).json({
      positions: positions || []
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---


## `./src/app/api/recruitment-step/route.ts`

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  console.log("user:", user_id)

  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data, error } = await supabase
      .rpc('get_recruitment_steps_for_user', { user_id })

    if (error) {
      console.error('Supabase RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.error('Supabase RPC returned no data')
      return NextResponse.json({ error: 'No data returned' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Unexpected error:', error.message)
    } else {
      console.error('Unexpected error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---


## `./src/app/api/stats/route/[positionId]/route.ts`

```ts
// src/app/api/stats/[positionId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // On utilise la service key pour lecture complète
)

/*
export async function GET(
  request: Request,
  { params }: { params: { positionId: string } }
) {
  const { positionId } = params */

  export async function GET(request: Request) {
  const url = new URL(request.url)
  const segments = url.pathname.split('/')
  const positionId = segments[segments.length - 1]

  if (!positionId) {
    return NextResponse.json({ error: 'Position ID manquant' }, { status: 400 })
  }


  const { data, error } = await supabase
    .from('position_to_candidat')
    .select(`
      candidat_score,
      candidat_ai_analyse,
      source,
      candidat_id,
      candidat_comment,
      candidat_next_step,
      source,
      candidats (
        candidat_firstname,
        candidat_lastname,
        cv_text,
        cv_file, 
        created_at
      )
    `)
    .eq('position_id', positionId)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur récupération stats' }, { status: 500 })
  }

  return NextResponse.json({ candidates: data })
}
```

---


## `./src/app/api/update-comment/route.ts`

```ts
import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { candidat_id, comment } = await request.json()

  if (!candidat_id) {
    return NextResponse.json({ error: 'Missing candidat_id' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('position_to_candidat')
    .update({ candidat_comment: comment })
    .eq('candidat_id', candidat_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Comment updated successfully' })
}
```

---


## `./src/app/api/update-next-step/route.ts`

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { candidat_id, step_id } = await request.json()  // Changed from step_name to step_id

    if (!candidat_id) {
      return NextResponse.json({ error: 'candidat_id manquant' }, { status: 400 })
    }

    const { error } = await supabase
      .from('position_to_candidat')
      .update({ candidat_next_step: step_id === null ? null : step_id })  // Use step_id instead
      .eq('candidat_id', candidat_id)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Mise à jour réussie' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

---


## `./src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.15s ease-out forwards;
}
```

---


## `./src/app/jobs/[slug]/Home/page.tsx`

```tsx
'use client'

import { Heart, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 w-full">
        
        {/* Logo Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <img
              src="/HRInnoLogo.jpeg"
              alt="InnoHR"
              width="450"
              height="450"
              className="rounded-full shadow-lg mx-auto mb-4"
            />
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12 max-w-6xl w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            HR was never as
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> easy </span>
            as now!
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
            Revolutionize your human resources with AI-powered tools for recruitment, 
            employee wellness, and workplace happiness assessment.
          </p>

          {/* Animated Decoration */}
          <div className="flex justify-center gap-3 mb-8">
            <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-150"></span>
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-300"></span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full px-4 pb-16">
        
        {/* Features Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          
          {/* Feature 1 - CV Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">AI CV Analysis</h3>
              <p className="text-gray-600 mb-4">
                Intelligent resume screening with detailed compatibility scoring and automated candidate evaluation.
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Smart Matching</span>
              </div>
            </div>
          </div>

          {/* Feature 2 - Happiness Assessment */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Workplace Wellness</h3>
              <p className="text-gray-600 mb-4">
                Anonymous employee happiness assessment based on the scientific PERMA-W model for better workplace culture.
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Anonymous & Secure</span>
              </div>
            </div>
          </div>

          {/* Feature 3 - Team Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">HR Team powered</h3>
              <p className="text-gray-600 mb-4">
                Streamlined hiring process with position management, applicant tracking, candidates database AI analyze and detailed analytics dashboard.
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Full Pipeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Ready to Transform Your HR?
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Join the future of human resources with our AI-powered platform. 
              Start optimizing your recruitment and employee wellness today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 justify-center">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => window.location.href = 'http://localhost:3000/jobs/demo/contact'}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto mt-16 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfect Plan</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Scale your HR operations with flexible pricing plans designed to grow with your business
            </p>
          </div>

          {/* Mobile-First Responsive Pricing Cards */}
          <div className="block md:hidden space-y-6">
            {/* Mobile Card Layout */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Free</h3>
                <p className="text-3xl font-bold text-gray-900">Free</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">AI CV Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Opened positions</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Database Analyser</span>
                  <span className="text-red-500 font-bold">✕</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check</span>
                  <span className="text-red-500 font-bold">✕</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Medical uploads/month</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Recruitment Dashboard</span>
                  <span className="text-red-500 font-bold">✕</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check Dashboard</span>
                  <span className="text-red-500 font-bold">✕</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Certificate Management</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 shadow-xl border-2 border-blue-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-2">Momentum</h3>
                <p className="text-3xl font-bold text-blue-900">20 000 HUF</p>
                <p className="text-blue-600">/month</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">AI CV Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Opened positions</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Database Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Medical uploads/month</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Recruitment Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Certificate Management</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-xl border border-yellow-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-yellow-800 mb-2">Infinity</h3>
                <p className="text-3xl font-bold text-yellow-900">45 000 HUF</p>
                <p className="text-yellow-700">/month</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">AI CV Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Opened positions</span>
                  <span className="font-semibold">30</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Database Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Medical uploads/month</span>
                  <span className="font-semibold">20</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Recruitment Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Happy Check Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Certificate Management</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 shadow-xl text-white cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105" onClick={() => window.location.href = 'http://localhost:3000/jobs/demo/contact'}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Custom</h3>
                <p className="text-2xl font-semibold">Contact Us</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">AI CV Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Opened positions</span>
                  <span className="font-semibold text-white">∞</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Database Analyser</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Happy Check</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Medical uploads/month</span>
                  <span className="font-semibold text-white">∞</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Recruitment Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Happy Check Dashboard</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Certificate Management</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-2 lg:p-4 shadow-xl border border-blue-100">
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b-2 border-blue-200">
                    <th className="text-left py-4 lg:py-6 px-1 lg:px-3 font-semibold text-gray-700 text-sm lg:text-lg w-1/5">Features</th>
                    <th className="text-center py-4 lg:py-6 px-1 lg:px-3 w-1/5">
                      <div className="bg-gray-200 text-gray-800 rounded-lg p-2 lg:p-4 shadow-md h-28 lg:h-32 flex flex-col justify-center mx-auto">
                        <h3 className="font-bold text-lg lg:text-2xl mb-1 lg:mb-2">Free</h3>
                        <p className="text-lg lg:text-2xl font-bold">Free</p>
                      </div>
                    </th>
                    <th className="text-center py-4 lg:py-6 px-1 lg:px-3 w-1/5 relative">
                      <div className="bg-blue-100 text-blue-800 rounded-lg p-2 lg:p-4 shadow-md h-28 lg:h-32 flex flex-col justify-center relative mx-auto">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <span className="bg-yellow-400 text-blue-900 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">POPULAR</span>
                        </div>
                        <h3 className="font-bold text-lg lg:text-2xl mb-1 mt-2">Momentum</h3>
                        <p className="text-sm lg:text-xl font-bold">20 000 HUF</p>
                        <p className="text-blue-600 text-xs lg:text-sm">/month</p>
                      </div>
                    </th>
                    <th className="text-center py-4 lg:py-6 px-1 lg:px-3 w-1/5">
                      <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-yellow-900 rounded-lg p-2 lg:p-4 shadow-md h-28 lg:h-32 flex flex-col justify-center mx-auto">
                        <h3 className="font-bold text-lg lg:text-2xl mb-1">Infinity</h3>
                        <p className="text-sm lg:text-xl font-bold">45 000 HUF</p>
                        <p className="text-yellow-800 text-xs lg:text-sm">/month</p>
                      </div>
                    </th>
                    <th className="text-center py-4 lg:py-6 px-1 lg:px-3 w-1/5">
                      <div className="bg-gradient-to-b from-gray-700 to-gray-800 text-white rounded-lg p-2 lg:p-4 shadow-md h-28 lg:h-32 flex flex-col justify-center mx-auto cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105" onClick={() => window.location.href = 'http://localhost:3000/jobs/demo/contact'}>
                        <h3 className="font-bold text-lg lg:text-2xl mb-1">Custom</h3>
                        <p className="text-sm lg:text-lg font-semibold">Contact Us</p>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-3 lg:py-4 px-1 lg:px-3 font-medium text-gray-700 text-xs lg:text-base">AI CV Analyser</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-3 lg:py-4 px-1 lg:px-3 font-medium text-gray-700 text-xs lg:text-base">Number of opened positions</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center font-semibold text-gray-800 text-sm lg:text-base">3</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center font-semibold text-gray-800 text-sm lg:text-base">5</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center font-semibold text-gray-800 text-sm lg:text-base">10</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center font-semibold text-gray-800 text-sm lg:text-base">Custom</td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-3 lg:py-4 px-1 lg:px-3 font-medium text-gray-700 text-xs lg:text-base">Database Analyser for new position</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center">
                      <div className="w-4 h-4 lg:w-6 lg:h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-red-500 font-bold text-xs lg:text-sm">✕</span>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-3 lg:py-4 px-1 lg:px-3 font-medium text-gray-700 text-xs lg:text-base">Happy Check</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center">
                      <div className="w-4 h-4 lg:w-6 lg:h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-red-500 font-bold text-xs lg:text-sm">✕</span>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-3 lg:py-4 px-1 lg:px-3 font-medium text-gray-700 text-xs lg:text-base">Medical Certificate uploads/month</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center font-semibold text-gray-800 text-sm lg:text-base">5</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center font-semibold text-gray-800 text-sm lg:text-base">10</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center font-semibold text-gray-800 text-sm lg:text-base">20</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center font-semibold text-gray-800 text-sm lg:text-base">Custom</td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-3 lg:py-4 px-1 lg:px-3 font-medium text-gray-700 text-xs lg:text-base">Recruitment Dashboard</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center">
                      <div className="w-4 h-4 lg:w-6 lg:h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-red-500 font-bold text-xs lg:text-sm">✕</span>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-3 lg:py-4 px-1 lg:px-3 font-medium text-gray-700 text-xs lg:text-base">Happy Check Dashboard</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center">
                      <div className="w-4 h-4 lg:w-6 lg:h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-red-500 font-bold text-xs lg:text-sm">✕</span>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-3 lg:py-4 px-1 lg:px-3 font-medium text-gray-700 text-xs lg:text-base">Certificate Management</td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                    <td className="py-3 lg:py-4 px-1 lg:px-3 text-center"><CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-500 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-2">500+</div>
            <div className="text-blue-100 text-sm md:text-base">CVs Analyzed</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-2">98%</div>
            <div className="text-green-100 text-sm md:text-base">Satisfaction Rate</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-2">24/7</div>
            <div className="text-purple-100 text-sm md:text-base">AI Support</div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-2">100%</div>
            <div className="text-yellow-100 text-sm md:text-base">Secure & Private</div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---


## `./src/app/jobs/[slug]/contact/page.tsx`

```tsx
'use client';

import ContactForm from '../../../../../components/ContactForm';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ContactPage() {
  const [isOpen, setIsOpen] = useState(true);
  const params = useParams();
    const slug = typeof params.slug === 'string' ? params.slug : '';

  return (
    <ContactForm
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={slug === 'demo' ? 'demo' : 'other'}
      slug={slug} // <-- pass slug here for redirection
    />
  );
}
```

---


## `./src/app/jobs/[slug]/cv-analyse/CVAnalyseClient.tsx`

```tsx
'use client'

import { useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertCircle, User, Brain, BarChart3, Shield, MessageSquare, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CVAnalyseClient({
  positionName,
  jobDescription,
  jobDescriptionDetailed,
  positionId,
  gdpr_file_url,
  companyName,
}: {
  positionName: string
  jobDescription: string
  jobDescriptionDetailed: string
  positionId: string
  gdpr_file_url: string
  companyName: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isDemo = pathname.includes('/demo/')
  
  // Extract company slug from pathname for back navigation
  const companySlug = pathname.split('/')[2] // /jobs/[slug]/cv-analyse
  
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState('')
  const [candidateFeedback, setCandidateFeedback] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gdprAccepted, setGdprAccepted] = useState(false)
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Handle back navigation - simulate browser back button
  const handleBackToPositions = useCallback(() => {
    router.back()
  }, [router])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !gdprAccepted || analysisCompleted) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobDescription', jobDescription)
    formData.append('jobDescriptionDetailed', jobDescriptionDetailed)
    formData.append('positionId', positionId)

    setLoading(true)
    setError('')
    setAnalysis('')
    setCandidateFeedback('')
    setScore(null)
    setShowSuccessMessage(false)

    try {
      const res = await fetch('/api/analyse-cv', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Server error.')
      }

      setAnalysis(data.analysis)
      setCandidateFeedback(data.candidateFeedback)
      setScore(data.score)
      setAnalysisCompleted(true)
      
      // Show success message with animation delay
      setTimeout(() => {
        setShowSuccessMessage(true)
      }, 100)
    } catch (err: unknown) {
      // Log technical error to console for debugging
      console.error('CV Analysis Error:', err)
      
      // Clear file selection to force re-upload
      setFile(null)
      setGdprAccepted(false)
      
      // Show user-friendly error message
      setError('Unfortunately, we are not able to read your CV. Can you try to upload a new one?')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 5) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreMessage = (score: number) => {
    if (score < 5) {
      return {
        text: "Thank you for your application. Unfortunately, your resume does not sufficiently match the position. Explore our other openings.",
        color: "text-red-600"
      }
    } else if (score >= 5 && score < 8) {
      return {
        text: "Your CV partially matches the position. Our HR specialist will analyse it.",
        color: "text-orange-600"
      }
    } else {
      return {
        text: "Thank you for your application! Your resume is a good match. A member of HR will contact you shortly.",
        color: "text-green-600"
      }
    }
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        
        {/* Back Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToPositions}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to positions</span>
          </button>
        </div>
        
        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              AI CV Analysis
            </h1>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg inline-block mb-2">
              <span className="font-semibold text-sm sm:text-base">{positionName}</span>
            </div>
            {companyName && (
              <p className="text-gray-600 text-sm sm:text-base">at {companyName}</p>
            )}
          </div>
        </div>

        {/* Position Description */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Position Description</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{jobDescriptionDetailed}</p>
        </div>

        {/* Demo CVs Download Block */}
        {isDemo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Download our fake CVs</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <a
                href="/fake_cv_software_engineer.pdf"
                download
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Fake Software Engineer</span>
              </a>
              
              <a
                href="/fake_cv_marketing_expert.pdf"
                download
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Fake Marketing Expert</span>
              </a>
            </div>
            
            <p className="text-sm text-gray-700 text-center">
              We strongly advice you to use our fake CV in the demo. If you would like to use a real one, please note that all the demo data including CVs are deleted each night at 2AM.
            </p>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
            
            {/* Important Notice */}
            {!analysisCompleted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-yellow-800 font-medium text-sm sm:text-base">
                    Please ensure that you have your phone number and email address in your CV
                  </p>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
                analysisCompleted 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="cv-upload"
                  disabled={analysisCompleted}
                />
                <label
                  htmlFor="cv-upload"
                  className={analysisCompleted ? 'cursor-not-allowed' : 'cursor-pointer'}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                      <span className="text-green-600 font-semibold text-sm sm:text-base break-all px-2">{file.name}</span>
                      {!analysisCompleted && (
                        <span className="text-xs sm:text-sm text-gray-500">Click to change file</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                      <span className={`font-semibold text-sm sm:text-base ${analysisCompleted ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}>
                        Click here to select your CV
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">(PDF only)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* GDPR Checkbox */}
            {file && !analysisCompleted && gdpr_file_url && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="gdpr"
                    type="checkbox"
                    checked={gdprAccepted}
                    onChange={(e) => setGdprAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                    disabled={analysisCompleted}
                  />
                  <label htmlFor="gdpr" className="text-xs sm:text-sm text-gray-700 flex-1">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Please read and accept our{' '}
                    <a
                      href={gdpr_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-700"
                    >
                      GDPR policy
                    </a>
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || (gdpr_file_url && !gdprAccepted) || loading || analysisCompleted}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-white text-base sm:text-lg transition-all shadow-md hover:shadow-lg transform ${
                loading || !file || (gdpr_file_url && !gdprAccepted) || analysisCompleted
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
              }`}
            >
              {analysisCompleted ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analysis Completed
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Analysis running...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analyze your CV
                </div>
              )}
            </button>

            {/* Success Message - Now positioned below the button */}
            {showSuccessMessage && analysisCompleted && (
              <div className={`transition-all duration-500 ease-out transform ${
                showSuccessMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800 font-medium text-sm sm:text-base">
                      Analysis completed successfully! Your CV has been processed and saved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-700 text-sm sm:text-base">Upload Error</h3>
                <p className="text-red-600 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {score !== null && candidateFeedback && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            
            {/* Score Card */}
            <div className={`rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 border-2 ${getScoreColor(score)}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-semibold">Your Score</h2>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-center sm:text-right">
                  {score}/10
                </div>
              </div>
              
              <div className={`p-3 sm:p-4 rounded-lg border ${getScoreMessage(score).color.replace('text-', 'border-').replace('-600', '-200')} bg-white`}>
                <p className={`font-semibold text-sm sm:text-base ${getScoreMessage(score).color}`}>
                  {getScoreMessage(score).text}
                </p>
              </div>
            </div>

            {/* Candidate Feedback */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Personalized Feedback</h2>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {candidateFeedback}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  )
}
```

---


## `./src/app/jobs/[slug]/cv-analyse/page.tsx`

```tsx
// src/app/jobs/[slug]/cv-analyse/page.tsx
import CVAnalyseClient from './CVAnalyseClient';
import { createClient } from '@supabase/supabase-js';
import { Analytics } from "@vercel/analytics/next"
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

type Params = {
  id?: string | string[];
};

type PositionData = {
  id: number;
  position_name: string;
  position_description: string;
  position_description_detailed: string;
  company_id: number;
  company: {
    company_name: string;
    slug: string;
    gdpr_file_url: string | null;
  } | null;
};

// Type pour la réponse brute de Supabase (peut être objet ou tableau)
type SupabaseCompany = {
  company_name: string;
  slug: string;
  gdpr_file_url: string | null;
};

type RawSupabaseResponse = {
  id: number;
  position_name: string;
  position_description: string;
  position_description_detailed: string;
  company_id: number;
  company: SupabaseCompany | SupabaseCompany[] | null;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const positionId = Array.isArray(searchParamsResolved?.id) 
    ? searchParamsResolved.id[0] 
    : searchParamsResolved?.id;

  if (positionId) {
    try {
      const position = await fetchPositionData(positionId, slug);
      if (position) {
        return {
          title: `Apply for ${position.position_name} | ${position.company?.company_name || slug}`,
          description: `Apply for the ${position.position_name} position. ${position.position_description}`,
          openGraph: {
            title: `Apply for ${position.position_name}`,
            description: position.position_description,
          },
        };
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
    }
  }

  return {
    title: `Apply for Position | ${slug}`,
    description: `Submit your CV for analysis and application.`,
  };
}

// Cached data fetching function
async function fetchPositionData(positionId: string, companySlug: string): Promise<PositionData | null> {
  try {
    console.log('Fetching position data for:', { positionId, companySlug });

    // Single query with join to get all needed data
    const { data: position, error } = await supabase
      .from('openedpositions')
      .select(`
        id,
        position_name,
        position_description,
        position_description_detailed,
        company_id,
        company:company_id (
          company_name,
          slug,
          gdpr_file_url
        )
      `)
      .eq('id', positionId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    console.log('Raw position data:', position);

    // Cast to our raw response type to handle TypeScript properly
    const rawPosition = position as RawSupabaseResponse;

    // Normalize company data - handle both object and array cases
    let company: SupabaseCompany | null = null;
    
    if (rawPosition.company) {
      if (Array.isArray(rawPosition.company)) {
        // If it's an array, take the first element
        company = rawPosition.company.length > 0 ? rawPosition.company[0] : null;
      } else {
        // If it's an object, use it directly
        company = rawPosition.company;
      }
    }


    // Return the properly typed data
    const transformedPosition: PositionData = {
      id: rawPosition.id,
      position_name: rawPosition.position_name,
      position_description: rawPosition.position_description,
      position_description_detailed: rawPosition.position_description_detailed,
      company_id: rawPosition.company_id,
      company: company
    };

    return transformedPosition;
  } catch (error) {
    console.error('Error fetching position data:', error);
    return null;
  }
}

export default async function CVAnalysePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Params>;
}) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  
  const positionId = Array.isArray(searchParamsResolved?.id) 
    ? searchParamsResolved.id[0] 
    : searchParamsResolved?.id;

  // If no position ID provided, show error
  if (!positionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid Application Link</h1>
          <p className="text-gray-600 mb-4">
            The application link appears to be incomplete or invalid.
          </p>
          <a
            href={`/jobs/${slug}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Positions
          </a>
        </div>
      </div>
    );
  }

  // Fetch position data with caching
  const position = await fetchPositionData(positionId, slug);

  // If position not found or doesn't belong to company, show error
  if (!position) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Position Not Found</h1>
          <p className="text-gray-600 mb-4">
            The position you&apos;re trying to apply for doesn&apos;t exist or is no longer available.
          </p>
          <a
            href={`/jobs/${slug}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Positions
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <CVAnalyseClient
        positionName={position.position_name}
        jobDescription={position.position_description}
        jobDescriptionDetailed={position.position_description_detailed}
        positionId={position.id.toString()}
        gdpr_file_url={position.company?.gdpr_file_url || ''}
        companyName={position.company?.company_name || ''}
      />
      <Analytics />
    </>
  );
}

// Add this to your Next.js config for ISR caching
export const revalidate = 300; // Revalidate every 5 minutes
```

---


## `./src/app/jobs/[slug]/feedback/FeedbackPage.tsx`

```tsx
// app/feedback/FeedbackPage.js
'use client'

import { useState } from 'react'
import { Star, MessageSquare, Send, Phone, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FeedbackPage() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

       setIsSubmitted(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to submit feedback. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactUs = () => {
    router.push('/jobs/demo/contact')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Thank You!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your time and input!
          </p>
          
          <div className="space-y-3">
            
            <button
              onClick={handleContactUs}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Contact Us
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            How was your demo experience?
          </h1>
          
          <p className="text-gray-600">
            Your feedback helps us improve our platform and better serve our users.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Star Rating */}
          <div className="text-center">
            <div className="block text-lg font-semibold text-gray-700 mb-4">
              Rate your experience *
            </div>
            
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {rating > 0 && (
              <p className="text-sm text-gray-500">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Comment Box */}
          <div>
            <div className="block text-lg font-semibold text-gray-700 mb-3">
              Additional Comments
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell us more about your experience... (optional)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---


## `./src/app/jobs/[slug]/feedback/page.tsx`

```tsx
// app/feedback/page.js
import FeedbackPage from './FeedbackPage'

export const metadata = {
  title: 'Demo Feedback | InnoHR',
  description: 'Share your experience with our HR platform demo',
}

export default function Page() {
  return <FeedbackPage />
}
```

---


## `./src/app/jobs/[slug]/happiness-check/page.tsx`

```tsx
// app/jobs/[slug]/happiness-check/page.tsx
import HappinessCheck from '../../../../../components/HappinessCheck';

export default function CompanyHappinessCheckPage() {
  return <HappinessCheck />;
}
```

---


## `./src/app/jobs/[slug]/happiness-dashboard/page.tsx`

```tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  BarChart3, 
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  ChevronDown,
  Smile,
  Meh,
  Frown,
  Lock,
  LogIn
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface DashboardData {
  summary: {
    totalSessions: number;
    avgHappiness: number;
    participationTrend: number;
  };
  permaAverages: {
    positive: number;
    engagement: number;
    relationships: number;
    meaning: number;
    accomplishment: number;
    work_life_balance: number;
  };
  areasForImprovement: Array<{
    area: string;
    score: number;
  }>;
  
  period: string;
  companyId?: number;
  companyName?: string;
}

const HRDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const session = useSession()
  const supabase = useSupabaseClient()

  const fetchData = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      const userId = session.user.id
      
      const response = await fetch(`/api/happiness/dashboard?days=${selectedPeriod}&user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${currentSession?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated - please log in again');
        } else if (response.status === 403) {
          throw new Error('Access denied - no company associated with your account');
        }
        throw new Error('Error loading data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, session, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getHappinessLevel = (score: number) => {
    if (score >= 8) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', icon: Smile };
    if (score >= 6) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Meh };
    return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50', icon: Frown };
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const permaLabels = {
    positive: 'Positive Emotions',
    engagement: 'Engagement',
    relationships: 'Relationships',
    meaning: 'Work Meaning',
    accomplishment: 'Accomplishment',
    work_life_balance: 'Work-Life Balance'
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const recommendations = {
    positive: "Organize team events, celebrate successes, improve recognition",
    engagement: "Offer challenging projects, skill development, increased autonomy",
    relationships: "Team building, communication training, collaboration spaces",
    meaning: "Clarify mission, show impact, align with personal values",
    accomplishment: "Clear goals, regular feedback, growth opportunities",
    work_life_balance: "Flexible hours, remote work, disconnection policies"
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to access the HR dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <LogIn className="w-4 h-4" />
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Error</span>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const happinessLevel = getHappinessLevel(data.summary.avgHappiness);
  const HappinessIcon = happinessLevel.icon;


  const permaData = Object.entries(data.permaAverages).map(([key, value]) => ({
    dimension: permaLabels[key as keyof typeof permaLabels],
    score: value,
    fullMark: 10
  }));

  const pieData = Object.entries(data.permaAverages).map(([key, value], index) => ({
    name: permaLabels[key as keyof typeof permaLabels],
    value: value,
    color: colors[index]
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                HR Wellbeing Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Anonymous workplace happiness analytics • {data.period}
              </p>
              {data.companyName && (
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {data.companyName}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Period Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  {selectedPeriod} days
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {['7', '30', '90', '365'].map(period => (
                      <button
                        key={period}
                        onClick={() => {
                          setSelectedPeriod(period);
                          setIsFilterOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {period} days
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Average Score */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.avgHappiness}/10</p>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${happinessLevel.bg} ${happinessLevel.color} mt-2`}>
                  <HappinessIcon className="w-3 h-3" />
                  {happinessLevel.label}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Participations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Participations</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.totalSessions}</p>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(data.summary.participationTrend)}
                  <span className="text-xs text-gray-600">
                    {data.summary.participationTrend > 0 ? '+' : ''}{data.summary.participationTrend}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Strongest Area */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Strongest Area</p>
                <p className="text-sm font-semibold text-gray-900">
                  {Object.entries(data.permaAverages).sort(([,a],[,b])=>b-a)[0]
                    ? permaLabels[Object.entries(data.permaAverages).sort(([,a],[,b])=>b-a)[0][0] as keyof typeof permaLabels]
                    : 'N/A'}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {Object.entries(data.permaAverages).sort(([,a],[,b])=>b-a)[0]?.[1].toFixed(1) || 'N/A'}/10
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Area for Improvement */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Area for Improvement</p>
                <p className="text-sm font-semibold text-gray-900">
                  {data.areasForImprovement[0]
                    ? permaLabels[data.areasForImprovement[0].area as keyof typeof permaLabels]
                    : 'N/A'}
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {data.areasForImprovement[0]?.score.toFixed(1) || 'N/A'}/10
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
         

          {/* PERMA Radar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PERMA-W Analysis</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={permaData}>
                  <PolarGrid stroke="#e5e7eb"/>
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize:11 }}/>
                  <PolarRadiusAxis angle={90} domain={[0,10]} tick={{ fontSize:10 }} tickCount={6}/>
                  <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} dot={{ fill:'#3B82F6', strokeWidth:2, r:4 }}/>
                  <Tooltip formatter={(value:number)=>[value?.toFixed(1),'Score']} contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px'}}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* PERMA Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Domain Distribution</h3>
            <div className="h-50">
              <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={40} 
                  outerRadius={80} 
                  paddingAngle={2} 
                  dataKey="value" 
                  label={({ name, value }) => `${name}\n${value?.toFixed(1)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value?.toFixed(1), 'Score']} />
              </PieChart>
              </ResponsiveContainer>  
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          

          {/* Domain Comparison */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={permaData} margin={{ left:20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="dimension" stroke="#6b7280" fontSize={11} angle={-45} textAnchor="end" height={80}/>
                  <YAxis domain={[0,10]} stroke="#6b7280" fontSize={12}/>
                  <Tooltip formatter={(value:number)=>[value?.toFixed(1),'Score']} contentStyle={{backgroundColor:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px'}}/>
                  <Bar dataKey="score" radius={[4,4,0,0]}>
                    {permaData.map((entry,index)=><Cell key={`cell-${index}`} fill={colors[index]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.areasForImprovement.slice(0,3).map((area)=>(
              <div key={area.area} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600"/>
                  <h4 className="font-semibold text-red-800">{permaLabels[area.area as keyof typeof permaLabels]}</h4>
                  <span className="text-sm text-red-600">({area.score.toFixed(1)}/10)</span>
                </div>
                <p className="text-sm text-red-700">{recommendations[area.area as keyof typeof recommendations]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              <strong>Privacy:</strong> All data is fully anonymized. No personal information is stored or displayed.
            </p>
            <p className="text-xs text-gray-500 mt-1">Last update: {new Date().toLocaleString('en-US')}</p>
            {data.companyName && (
              <p className="text-xs text-blue-600 mt-1">Data filtered for: {data.companyName}</p>
            )}
          </div>
          <button
            onClick={()=>alert('Export functionality to be implemented')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4"/>
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
```

---


## `./src/app/jobs/[slug]/medical-certificate/download/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Download, Search, Calendar, FileText, Users, AlertCircle, CheckCircle, User, Clock } from 'lucide-react';

// Define the type for one row of medical_certificates
interface MedicalCertificate {
  id: number;
  employee_name: string | null;
  absence_start_date: string | null;
  absence_end_date: string | null;
  hr_comment: string | null;
  treated: boolean;
  certificate_file: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CertificateDownloadPage() {
  // today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noResults, setNoResults] = useState(false);

  const fetchCertificates = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    setError('');
    setNoResults(false);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('medical_certificates')
        .select(
          'id, employee_name, absence_start_date, absence_end_date, hr_comment, treated, certificate_file'
        )
        .gte('absence_start_date', startDate)
        .lte('absence_end_date', endDate);

      if (error) throw error;

      if (!data || data.length === 0) {
        setNoResults(true);
        setCertificates([]);
      } else {
        setCertificates(data);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch today's certificates when the page loads
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (certificates.length === 0) {
      setError('No certificates to download.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1) Create Excel
      const worksheet = XLSX.utils.json_to_sheet(
        certificates.map((c) => ({
          Employee: c.employee_name ?? '',
          AbsenceStart: c.absence_start_date ?? '',
          AbsenceEnd: c.absence_end_date ?? '',
          HRComment: c.hr_comment ?? '',
          Treated: c.treated ? 'Yes' : 'No',
          FileURL: c.certificate_file ?? '',
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // 2) Create ZIP
      const zip = new JSZip();
      zip.file('certificates.xlsx', excelBuffer);

      // 3) Download files directly from public URL
      for (const c of certificates) {
        if (!c.certificate_file) continue;

        try {
          const response = await fetch(c.certificate_file);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();

          const filename = decodeURIComponent(
            c.certificate_file.split('/').pop() || `certificate_${c.id}`
          );

          zip.file(filename, blob);
        } catch (err) {
          console.warn(`❌ Failed to fetch ${c.certificate_file}`, err);
        }
      }

      // 4) Generate final ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, `medical_certificates_${startDate}_${endDate}.zip`);
    } catch (e) {
      console.error(e);
      setError('Failed to generate download.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    } catch {
      return dateString
    }
  }

  // Calculate stats
  const treatedCount = certificates.filter(cert => cert.treated).length;
  const pendingCount = certificates.filter(cert => !cert.treated).length;
  const uniqueEmployeesCount = new Set(certificates.map(c => c.employee_name)).size;

  if (loading && certificates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <Download className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Download Medical Certificates
            </h1>
            <div className="flex items-center justify-center gap-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">{certificates.length}</span>
                <span>total certificates</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{pendingCount}</span>
                <span>pending</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">{treatedCount}</span>
                <span>treated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selection and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={fetchCertificates}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
              
              {certificates.length > 0 && (
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download ZIP
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {noResults && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="font-medium text-yellow-800">
                No certificate found for the selected dates.
              </p>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1000px' }}>
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Employee Name
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    End Date
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    HR Comment
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-700 w-24">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {certificates.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No certificates found</h3>
                      <p className="text-gray-500">
                        {noResults ? 'Try adjusting your date range.' : 'Select a date range and click search to view medical certificates.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr 
                      key={cert.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !cert.treated ? 'bg-yellow-25' : ''
                      }`}
                    >
                      <td className="px-4 py-4 font-medium text-gray-800 w-40">
                        <div className="truncate" title={cert.employee_name || ''}>
                          {cert.employee_name || '—'}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatDate(cert.absence_start_date)}
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatDate(cert.absence_end_date)}
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-40">
                        <div className="truncate" title={cert.hr_comment || ''}>
                          {cert.hr_comment || '—'}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-center w-24">
                        {cert.treated ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 border-green-500 rounded border-2">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-white border-gray-300 hover:border-gray-400 rounded border-2 mx-auto"></div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---


## `./src/app/jobs/[slug]/medical-certificate/list/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import * as Popover from '@radix-ui/react-popover'
import { Search, FileText, User, Calendar, MessageCircle, CheckCircle, Clock, Filter, Eye, Upload } from 'lucide-react'

type MedicalCertificate = {
  id: number
  employee_name: string
  certificate_file: string
  absence_start_date: string
  absence_end_date: string
  employee_comment: string | null
  created_at: string
  treated: boolean
  treatment_date: string | null
  document_url?: string
  company_id?: number
}

export default function MedicalCertificatesPage() {
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [showAll, setShowAll] = useState<boolean>(false)
  const [companyId, setCompanyId] = useState<number | null>(null)

  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!session) return

    const fetchCompanyIdAndCertificates = async () => {
      setLoading(true)
      try {
        const { data: userProfile, error: userError } = await supabase
          .from('company_to_users')
          .select('company_id')
          .eq('user_id', session.user.id)
          .single()

        if (userError) {
          console.error('Erreur récupération company_id:', userError.message)
          setCertificates([])
          setLoading(false)
          return
        }

        if (!userProfile || !userProfile.company_id) {
          console.warn('Utilisateur sans company_id')
          setCertificates([])
          setLoading(false)
          return
        }

        const currentCompanyId = userProfile.company_id
        setCompanyId(currentCompanyId)

        const { data, error } = await supabase
          .from('medical_certificates')
          .select('*')
          .eq('company_id', currentCompanyId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur chargement certificats:', error.message)
          setCertificates([])
          return
        }

        const certificatesWithUrl: MedicalCertificate[] = (data || []).map(
          (cert: MedicalCertificate) => ({
            ...cert,
            document_url: cert.certificate_file,
            treated: !!cert.treated,
            treatment_date: cert.treatment_date,
          })
        )

        setCertificates(certificatesWithUrl)
      } catch (err) {
        console.error('Erreur réseau', err)
        setCertificates([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyIdAndCertificates()
  }, [session, supabase])

  const handleCheckboxChange = async (certId: number, newValue: boolean) => {
    try {
      const treatmentDate = newValue ? new Date().toISOString() : null

      const { data, error } = await supabase
        .from('medical_certificates')
        .update({ 
          treated: newValue,
          treatment_date: treatmentDate
        })
        .eq('id', certId)
        .select()

      if (error) {
        console.error('Erreur mise à jour traité:', error.message)
        alert('Erreur lors de la mise à jour')
      } else {
        setCertificates((prev) =>
          prev.map((cert) =>
            cert.id === certId 
              ? { 
                  ...cert, 
                  treated: newValue,
                  treatment_date: treatmentDate
                } 
              : cert
          )
        )
      }
    } catch (err) {
      console.error('Erreur réseau lors de update treated:', err)
      alert('Erreur réseau lors de la mise à jour')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatSimpleDate = (dateString: string | null) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    } catch {
      return dateString
    }
  }

  const filteredCertificates = certificates
    .filter((cert) =>
      cert.employee_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((cert) => (showAll ? true : !cert.treated))

  const treatedCount = certificates.filter(cert => cert.treated).length
  const pendingCount = certificates.filter(cert => !cert.treated).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Medical Certificates
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">{certificates.length}</span>
                <span>total certificates</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{pendingCount}</span>
                <span>pending</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">{treatedCount}</span>
                <span>treated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by employee name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
                showAll 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              {showAll ? 'Hide treated' : 'Show all certificates'}
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1100px' }}>
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Employee Name
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    End Date
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    Certificate
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-32">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Date
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Comment
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-700 w-24">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 w-40">
                    Treatment Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No certificates found</h3>
                      <p className="text-gray-500">
                        {search ? 'Try adjusting your search terms.' : 'No medical certificates match your current filters.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map((cert, index) => (
                    <tr 
                      key={cert.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !cert.treated ? 'bg-yellow-25' : ''
                      }`}
                    >
                      <td className="px-4 py-4 font-medium text-gray-800 w-40">
                        <div className="truncate" title={cert.employee_name}>
                          {cert.employee_name}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatSimpleDate(cert.absence_start_date)}
                      </td>
                      
                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatSimpleDate(cert.absence_end_date)}
                      </td>
                      
                      <td className="px-4 py-4 w-32">
                        {cert.document_url ? (
                          <a
                            href={cert.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-700 w-32">
                        {formatSimpleDate(cert.created_at)}
                      </td>
                      
                      <td className="px-4 py-4 w-40">
                        {cert.employee_comment ? (
                          <Popover.Root>
                            <Popover.Trigger asChild>
                              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" aria-label="View comment">
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content 
                                side="top" 
                                align="center" 
                                sideOffset={5}
                                className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
                                style={{ 
                                  maxWidth: 'min(400px, 90vw)',
                                  maxHeight: '60vh',
                                  overflowY: 'auto'
                                }}
                              >
                                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {cert.employee_comment}
                                </div>
                                <Popover.Arrow className="fill-white stroke-gray-200" />
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-4 text-center w-24">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cert.treated}
                            onChange={(e) => handleCheckboxChange(cert.id, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`relative w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            cert.treated 
                              ? 'bg-green-500 border-green-500' 
                              : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}>
                            {cert.treated && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </td>
                      
                      <td className="px-4 py-4 w-40">
                        <span className={cert.treated ? 'text-green-700 font-medium' : 'text-gray-500'}>
                          {formatDate(cert.treatment_date)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---


## `./src/app/jobs/[slug]/medical-certificate/upload/UploadCertificateClient.tsx`

```tsx
'use client';

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Upload, FileText, User, Calendar, Stethoscope, MessageCircle, Check, X, AlertTriangle, CheckCircle } from 'lucide-react';

type UploadCertificateClientProps = {
  companyId: string;
};

export default function UploadCertificateClient({ companyId }: UploadCertificateClientProps) {
  
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  
  // Check if 'demo' is anywhere in the path segments
  const isDemo = segments.includes('demo');
  
  // Alternative approach - check if the URL contains /jobs/demo/
  const isDemoAlt = pathname.includes('/jobs/demo/');
  
  console.log("Pathname:", pathname);
  console.log("Segments:", segments);
  console.log("Is Demo (includes):", isDemo);
  console.log("Is Demo (alt):", isDemoAlt);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    employee_name?: string;
    absenceDateStart?: string;
    absenceDateEnd?: string;
  } | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for manual input when processing fails
  const [manualData, setManualData] = useState({
    employee_name: '',
    absenceDateStart: '',
    absenceDateEnd: '',
    doctor_name: ''
  });

  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const handleFileChange = (file: File | null) => {
    setError('');
    if (!file) return setFile(null);
    if (file.size > MAX_SIZE) {
      setError('File is too large. Maximum allowed size is 1MB.');
      setFile(null);
    } else {
      setFile(file);
    }
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a file');
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company_id', companyId);

      const res = await fetch('/api/medical-certificates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const extracted = data.extracted_data || {};
      const resultData = {
        employee_name: extracted.employee_name,
        absenceDateStart: extracted.sickness_start_date,
        absenceDateEnd: extracted.sickness_end_date,
        doctor_name: extracted.doctor_name,
      };
      
      setResult(resultData);
      
      // Initialize manual data with empty strings for non-recognised fields
      setManualData({
        employee_name: isFieldUnrecognised(resultData.employee_name) ? '' : resultData.employee_name || '',
        absenceDateStart: isFieldUnrecognised(resultData.absenceDateStart) ? '' : resultData.absenceDateStart || '',
        absenceDateEnd: isFieldUnrecognised(resultData.absenceDateEnd) ? '' : resultData.absenceDateEnd || '',
        doctor_name: isFieldUnrecognised(resultData.doctor_name) ? '' : resultData.doctor_name || '',
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFieldUnrecognised = (value?: string) => {
    return value && ['non recognised', 'not recognised'].includes(value.trim().toLowerCase());
  };

  const handleConfirm = async () => {
    if (!result || !file) return setError('Cannot save: missing file or extracted data.');

    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Use manual data for unrecognised fields, otherwise use result data
      formData.append('employee_name', isFieldUnrecognised(result.employee_name) ? manualData.employee_name : (result.employee_name || ''));
      formData.append('absenceDateStart', isFieldUnrecognised(result.absenceDateStart) ? manualData.absenceDateStart : (result.absenceDateStart || ''));
      formData.append('absenceDateEnd', isFieldUnrecognised(result.absenceDateEnd) ? manualData.absenceDateEnd : (result.absenceDateEnd || ''));
     // formData.append('doctor_name', isFieldUnrecognised(result.doctor_name) ? manualData.doctor_name : (result.doctor_name || ''));
      
      formData.append('comment', comment || '');
      formData.append('file', file);
      formData.append('company_id', companyId);

      const res = await fetch('/api/medical-certificates/confirm', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setSuccessMessage(data.message || 'Certificate saved successfully!');
      setResult(null);
      setFile(null);
      setComment('');
      setManualData({
        employee_name: '',
        absenceDateStart: '',
        absenceDateEnd: '',
        doctor_name: ''
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setResult(null);
    setFile(null);
    setComment('');
    setSuccessMessage('');
    setError('');
    setManualData({
      employee_name: '',
      absenceDateStart: '',
      absenceDateEnd: '',
      doctor_name: ''
    });
  };

  const hasUnrecognised =
    result &&
    [result.employee_name, result.absenceDateStart, result.absenceDateEnd].some(
      (val) => val && ['non recognised', 'not recognised'].includes(val.trim().toLowerCase())
    );

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Upload Medical Certificate
            </h1>
            <p className="text-gray-600">Upload your medical certificate for automatic processing</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Demo block */}
        {isDemo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col gap-3">
              <a
                href="/fake_medical_certificate.pdf"
                download
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <FileText className="w-5 h-5" />
                Download fake certificate
              </a>
              <p className="text-sm text-gray-700">
                We strongly recommend to use our fake medical certificate during the demo. If you want to use your own file, please note that all the data will be deleted from our demo system each night at 1 am.
              </p>
            </div>
          </div>
        )}

        {/* Processing Failed Warning - Now displayed before the form */}
        {result && hasUnrecognised && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Processing Failed</h3>
            </div>
            <p className="text-red-700">
              Some information could not be recognized automatically, please fulfill the form below with the missing information. Your document will be automatically sent to the HR department.
            </p>
          </div>
        )}

        {/* Upload Form */}
        {!result && !successMessage && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpload();
                }}
                className="space-y-6"
              >
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Certificate File
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
                      file 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                      className="hidden"
                      id="certificate-upload"
                    />
                    <label htmlFor="certificate-upload" className="block cursor-pointer">
                      {file ? (
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="font-medium text-green-800 text-sm sm:text-base break-all">{file.name}</span>
                        </div>
                      ) : (
                        <div>
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-blue-600 font-medium hover:text-blue-700 text-sm sm:text-base">
                            Click here to select your file
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            PDF or Image • Maximum 1MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Upload Button */}
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload & Process
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results - Now includes manual form when processing fails */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-6">
                <FileText className="w-6 h-6" />
                {hasUnrecognised ? 'Certificate Details - Please Complete Missing Information' : 'Extracted Certificate Details'}
              </h2>

              <div className="grid gap-4 mb-6">
                {/* Employee Name */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <label className="font-medium text-gray-700">Employee Name</label>
                  </div>
                  {isFieldUnrecognised(result.employee_name) ? (
                    <input
                      type="text"
                      value={manualData.employee_name}
                      onChange={(e) => setManualData({...manualData, employee_name: e.target.value})}
                      placeholder="Enter employee name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{result.employee_name || '—'}</p>
                  )}
                </div>

                {/* Start and End Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <label className="font-medium text-gray-700">Start Date</label>
                    </div>
                    {isFieldUnrecognised(result.absenceDateStart) ? (
                      <input
                        type="date"
                        value={manualData.absenceDateStart}
                        onChange={(e) => setManualData({...manualData, absenceDateStart: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{result.absenceDateStart || '—'}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <label className="font-medium text-gray-700">End Date</label>
                    </div>
                    {isFieldUnrecognised(result.absenceDateEnd) ? (
                      <input
                        type="date"
                        value={manualData.absenceDateEnd}
                        onChange={(e) => setManualData({...manualData, absenceDateEnd: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{result.absenceDateEnd || '—'}</p>
                    )}
                  </div>
                </div>

               
              </div>

              {/* Comment field - always displayed */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <MessageCircle className="w-4 h-4" />
                  Additional Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any additional information or comments..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {hasUnrecognised ? (
                  <>
                
                    <button
                      onClick={handleConfirm}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Confirm & Save
                        </>
                      )}
                    </button>
                    {/* When processing failed - show Try Again, Confirm & Save buttons */}
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <Upload className="w-5 h-5" />
                      Try Again
                    </button>
                  </>
                ) : (
                  <>
                    {/* When processing succeeded - show original buttons */}
                    <button
                      onClick={handleConfirm}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Confirm & Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

---


## `./src/app/jobs/[slug]/medical-certificate/upload/page.tsx`

```tsx
// src/app/medical-certificate/upload/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import UploadCertificateClient from './UploadCertificateClient';

// Initialize Supabase client (adjust these values according to your setup)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function UploadCertificatePageContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company_id');
  const [canAddCertificate, setCanAddCertificate] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const certificateAccessChecked = useRef(false);

  // Check if user can add medical certificate
  const checkCertificateAccess = useCallback(async () => {
    console.log('🎯 checkCertificateAccess called with:', {
      companyId,
      alreadyChecked: certificateAccessChecked.current
    });
    
    if (!companyId) {
      console.log('❌ No companyId available, cannot check access');
      setIsLoading(false);
      return;
    }
    
    if (certificateAccessChecked.current) {
      console.log('❌ Access already checked, skipping');
      return;
    }
    
    console.log('🔍 Checking certificate access for company_id:', companyId);
    certificateAccessChecked.current = true;
    
    try {
      console.log('📞 Calling supabase.rpc with params:', { p_company_id: companyId });
      
      const { data, error } = await supabase.rpc('can_add_medical_certificate', { p_company_id: companyId });
      
      console.log('📨 RPC Response:', { data, error, dataType: typeof data });
      
      if (error) {
        console.log('❌ RPC Error:', error);
        setCanAddCertificate(false);
        setIsLoading(false);
        return;
      }
      
      if (data === null || data === undefined) {
        console.log('❌ Data is null/undefined, setting access to false');
        setCanAddCertificate(false);
        setIsLoading(false);
        return;
      }
      
      // Handle different possible return formats
      let hasAccess = false;
      
      if (typeof data === 'boolean') {
        console.log('🔧 Data is boolean:', data);
        hasAccess = data;
      } else if (typeof data === 'string') {
        console.log('🔧 Data is string:', data);
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        console.log('🔧 Data is number:', data);
        hasAccess = data === 1;
      } else if (typeof data === 'object' && data !== null) {
        console.log('🔧 Data is object:', data);
        // Sometimes Supabase functions return objects, check if there's a result property
        hasAccess = data.result === true || data.result === 'true' || 
                   data.can_access === true || data.can_access === 'true' ||
                   data[0] === true || data[0] === 'true' || // Sometimes it's an array
                   data === true; // Sometimes the object itself is the boolean
      }
      
      console.log('✅ Final access decision:', hasAccess);
      setCanAddCertificate(hasAccess);
      setIsLoading(false);
      
    } catch (error) {
      console.error('💥 Catch block error:', error);
      setCanAddCertificate(false);
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    checkCertificateAccess();
  }, [checkCertificateAccess]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Show error if no company ID
  if (!companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-700 mb-4">
            Aucun ID d&apos;entreprise fourni. Veuillez accéder à cette page via le lien approprié.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Show plan limit reached message if access is denied
  if (canAddCertificate === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Limite du plan atteinte</h1>
          <p className="text-gray-700 mb-6">
            Your company&apos;s plan limit has been reached. To continue, please reach out to your company administrator.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  // Show the upload component if access is granted
  return <UploadCertificateClient companyId={companyId} />;
}

export default function UploadCertificatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <UploadCertificatePageContent />
    </Suspense>
  );
}
```

---


## `./src/app/jobs/[slug]/openedpositions/PositionList.tsx`

```tsx
'use client'

import Link from "next/link"
import { useSession } from "@supabase/auth-helpers-react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Search, Briefcase, BarChart3, X, Building2, FileText, Copy, Workflow } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Position = {
  id: number
  position_name: string
  position_description: string
  position_description_detailed: string
  company?: {
    company_logo?: string
    company_name?: string
    slug?: string
  }
}

type Props = {
  initialPositions?: Position[]
  companySlug?: string
}

// Simple Snackbar component
function Snackbar({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up z-50">
      {message}
    </div>
  )
}

export default function PositionsList({ initialPositions = [], companySlug }: Props) {
  const router = useRouter()
  const session = useSession()
  const isLoggedIn = !!session?.user
  const userId = session?.user?.id

  const [positions, setPositions] = useState<Position[]>(initialPositions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingClose, setLoadingClose] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

  // Redirect to 404 if no slug
  useEffect(() => {
    if (!companySlug) {
      router.replace('/404')
    }
  }, [companySlug, router])

  // Memoized filtered positions for better performance
  const filteredPositions = useMemo(() => {
    return positions.filter(
      (p) =>
        (!companySlug || p.company?.slug === companySlug) &&
        (p.position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.position_description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [positions, companySlug, searchTerm])

  useEffect(() => {
    if (!companySlug) return
    if (initialPositions.length > 0) return
    if (isLoggedIn && !userId) return

    async function fetchPositions() {
      setLoading(true)
      setError(null)
      try {
        let url = ""

        if (companySlug) {
          url = `/api/positions-public?slug=${encodeURIComponent(companySlug)}`
        } else if (isLoggedIn && userId) {
          url = `/api/positions-private?userId=${encodeURIComponent(userId)}`
        } else {
          url = `/api/positions-public`
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error("Erreur lors du chargement des positions")
        const data = await res.json()
        setPositions(data.positions || [])
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchPositions()
  }, [companySlug, isLoggedIn, userId, initialPositions.length])

  const handleClose = useCallback(async (positionId: number) => {
    if (!confirm("Do you really want to close this position?")) return
    setLoadingClose(positionId)
    try {
      const res = await fetch("/api/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSnackbarMessage("Error closing position: " + (data.error || "Erreur inconnue"))
        setLoadingClose(null)
        return
      }
      setSnackbarMessage("Position closed successfully")
      setPositions((prev) => prev.filter((p) => p.id !== positionId))
    } catch (e) {
      setSnackbarMessage("Error closing position: " + (e as Error).message)
    }
    setLoadingClose(null)
  }, [])

  // Memoized link generators for better performance
  const getApplyLink = useCallback((position: Position) => {
  if (!companySlug) return null
  // Only pass the position ID - much cleaner URL!
  return `/jobs/${companySlug}/cv-analyse?id=${position.id}`
}, [companySlug])

  const getStatsLink = useCallback((position: Position) => {
    if (!companySlug) return null
    return `/jobs/${companySlug}/stats?positionId=${position.id}`
  }, [companySlug])

  const getPublicLink = useCallback((position: Position) => {
  if (!companySlug) return null
  const url = new URL(
    `/jobs/${companySlug}/cv-analyse?id=${position.id}`,
    window.location.origin
  )
  return url.toString()
}, [companySlug])

  const handleCopyLink = useCallback(async (position: Position) => {
    const link = getPublicLink(position)
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setSnackbarMessage("Link copied to clipboard!")
    } catch (err) {
      setSnackbarMessage("Failed to copy link: " + (err as Error).message)
    }
  }, [getPublicLink])



  // Hide snackbar after 3 seconds
  useEffect(() => {
    if (snackbarMessage) {
      const timer = setTimeout(() => setSnackbarMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [snackbarMessage])

  if (!companySlug) {
    return null // Already redirecting to 404
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading positions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Available Positions
            </h1>
            {/* Updated position counter - now looks like an info badge, not a button */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base">
              <span className="font-semibold">{filteredPositions.length}</span>
              <span>positions available</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>


        </div>

        {/* No Results */}
        {filteredPositions.length === 0 && (
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No positions available</h2>
              <p className="text-gray-500 text-sm sm:text-base">Check back later for new opportunities!</p>
            </div>
          </div>
        )}

        {/* Positions List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredPositions.map((position) => (
            <div
              key={position.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] sm:hover:scale-[1.02]"
            >
              <div className="p-4 sm:p-6">
                {/* Header with responsive layout */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                  <div className="flex-1 min-w-0"> {/* min-w-0 allows text truncation */}
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 break-words">
                      {position.position_name}
                    </h2>
                    {position.company?.company_name && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="text-sm sm:text-base truncate">{position.company.company_name}</span>
                      </div>
                    )}
                  </div>
                  {position.company?.company_logo && (
                    <div className="flex-shrink-0 self-start sm:ml-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg p-2 sm:p-3 border">
                        <img
                          src={position.company.company_logo}
                          alt="Company logo"
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                  {position.position_description}
                </p>

                {/* Actions - Responsive button layout */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {!isLoggedIn && companySlug && (
                    <Link
                      href={getApplyLink(position)!}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      Apply
                    </Link>
                  )}

                  {isLoggedIn && companySlug && (
                    <>
                      {/* Board */}
                      <Link
                        href={getStatsLink(position)!}
                        className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                      >
                        <Workflow className="w-4 h-4 sm:w-5 sm:h-5" />
                        Treatment
                      </Link>

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink(position)}
                        className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                      >
                        <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                        Copy Link
                      </button>

                      {/* Close */}
                      <button
                        onClick={() => handleClose(position.id)}
                        disabled={loadingClose === position.id}
                        className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                      >
                        {loadingClose === position.id ? (
                          <>
                            <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="hidden sm:inline">Closing...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            Close
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Snackbar */}
      {snackbarMessage && <Snackbar message={snackbarMessage} />}
    </div>
  )
}
```

---


## `./src/app/jobs/[slug]/openedpositions/analytics/page.tsx`

```tsx
'use client'

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieLabelRenderProps
} from 'recharts';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

interface Position {
  id: number;
  position_name: string;
  position_start_date: string;
  position_end_date: string | null;
  created_at: string;
}

interface PositionCandidate {
  created_at: string;
  candidat_score: number | null;
  source: string;
  candidat_firstname: string;
  candidat_lastname: string;
}

interface AnalyticsData {
  totalCandidates: number;
  averageScore: number;
  medianScore: number;
  daysOpen: number;
  candidatesPerDay: number;
  timelineData: Array<{ date: string; candidates: number; avgScore: number }>;
  scoreDistribution: Array<{ score: string; count: number }>;
  sourceDistribution: Array<{ name: string; value: number; avgScore: number }>;
}

type SupabaseCandidateRow = {
  created_at: string;
  candidat_score: number | null;
  source: string | null;
  candidats: {
    candidat_firstname: string | null;
    candidat_lastname: string | null;
  } | null;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const TIME_FILTERS = ['7d', '30d', '90d', 'all'] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;

  // Type guard for objects with a message string
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return 'An error occurred';
  }
}

const PositionAnalytics: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [candidates, setCandidates] = useState<PositionCandidate[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const supabase = useSupabaseClient()

  useEffect(() => {
    loadPositions();
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      loadCandidates();
    }
  }, [selectedPosition, timeFilter]);

  const loadPositions = async () => {
    try {
      if (!session?.user) {
        setError('User not logged in');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', session.user.id)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error('Unable to retrieve user company');

      const userCompanyId = userData.company_id;

      const { data, error } = await supabase
        .from('openedpositions')
        .select('id, position_name, position_start_date, position_end_date, created_at')
        .eq('company_id', userCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message || 'Unknown error while loading positions');

      if (!data || data.length === 0) {
        setPositions([]);
        setError('No positions found for this company.');
        return;
      }

      setPositions(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading positions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const loadCandidates = async () => {
    if (!selectedPosition) return;

    setLoading(true);
    try {
      let query = supabase
        .from('position_to_candidat')
        .select(`
          created_at,
          candidat_score,
          source,
          candidats (
            candidat_firstname,
            candidat_lastname
          )
        `)
        .eq('position_id', selectedPosition.id);

      if (timeFilter !== 'all') {
        const days = parseInt(timeFilter.replace('d', ''), 10);
        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - days);
        query = query.gte('created_at', filterDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedCandidates: PositionCandidate[] = ((data as unknown) as SupabaseCandidateRow[]).map(
        (item) => {
          const candidat = item.candidats ? item.candidats : { candidat_firstname: null, candidat_lastname: null };
          return {
            created_at: item.created_at,
            candidat_score: item.candidat_score,
            source: item.source ?? 'Not specified',
            candidat_firstname: candidat.candidat_firstname ?? '',
            candidat_lastname: candidat.candidat_lastname ?? ''
          };
        }
      );

      setCandidates(formattedCandidates);
      setError(null);
      generateAnalytics(formattedCandidates);
    } catch (err: unknown) {
      console.error('Error loading candidates:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = (candidateData: PositionCandidate[]) => {
    if (!selectedPosition || candidateData.length === 0) {
      setAnalytics(null);
      return;
    }

    const validScores = candidateData
      .filter((c) => c.candidat_score !== null)
      .map((c) => c.candidat_score!);
    const totalCandidates = candidateData.length;
    const averageScore =
      validScores.length > 0
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length
        : 0;

    const sortedScores = [...validScores].sort((a, b) => a - b);
    const medianScore =
      sortedScores.length > 0
        ? sortedScores.length % 2 === 0
          ? (sortedScores[sortedScores.length / 2 - 1] +
              sortedScores[sortedScores.length / 2]) /
            2
          : sortedScores[Math.floor(sortedScores.length / 2)]
        : 0;

    const startDate = new Date(selectedPosition.position_start_date);
    const endDate = selectedPosition.position_end_date
      ? new Date(selectedPosition.position_end_date)
      : new Date();
    const daysOpen = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const candidatesPerDay = totalCandidates / daysOpen;

    const timelineMap = new Map<string, { candidates: number; scores: number[] }>();
    candidateData.forEach((candidate) => {
      const date = new Date(candidate.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!timelineMap.has(weekKey)) {
        timelineMap.set(weekKey, { candidates: 0, scores: [] });
      }

      const weekData = timelineMap.get(weekKey)!;
      weekData.candidates++;
      if (candidate.candidat_score !== null) {
        weekData.scores.push(candidate.candidat_score);
      }
    });

    const timelineData = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit'
        }),
        candidates: data.candidates,
        avgScore:
          data.scores.length > 0
            ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const scoreDistribution = Array.from({ length: 10 }, (_, i) => {
      const score = i + 1;
      const count = validScores.filter((s) => s === score).length;
      return { score: score.toString(), count };
    });

    const sourceMap = new Map<string, { count: number; scores: number[] }>();
    candidateData.forEach((candidate) => {
      const source = candidate.source || 'Not specified';
      if (!sourceMap.has(source)) {
        sourceMap.set(source, { count: 0, scores: [] });
      }
      sourceMap.get(source)!.count++;
      if (candidate.candidat_score !== null) {
        sourceMap.get(source)!.scores.push(candidate.candidat_score);
      }
    });

    const sourceDistribution = Array.from(sourceMap.entries()).map(([name, data]) => ({
      name,
      value: data.count,
      avgScore:
        data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : 0
    }));

    setAnalytics({
      totalCandidates,
      averageScore: Math.round(averageScore * 10) / 10,
      medianScore: Math.round(medianScore * 10) / 10,
      daysOpen,
      candidatesPerDay: Math.round(candidatesPerDay * 10) / 10,
      timelineData,
      scoreDistribution,
      sourceDistribution
    });
  };

  const isPositionOpen = (position: Position) => {
    return !position.position_end_date || new Date(position.position_end_date) > new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header and selection */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Position Analytics</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <label htmlFor="position-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select a position
            </label>
            <select
              id="position-select"
              value={selectedPosition?.id ?? ''}
              onChange={(e) => {
                const pos = positions.find(p => p.id === parseInt(e.target.value, 10));
                setSelectedPosition(pos ?? null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a position...</option>
              {positions.map(p => (
                <option key={p.id} value={p.id}>
                  {p.position_name} {isPositionOpen(p) ? ' (🟢 Open)' : ' (🔴 Closed)'}
                </option>
              ))}
            </select>

            {selectedPosition && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Period:</span>
                {TIME_FILTERS.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      timeFilter === filter
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter === '7d' ? 'Last 7 days'
                      : filter === '30d' ? 'Last 30 days'
                      : filter === '90d' ? 'Last 90 days'
                      : "Since opening"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={selectedPosition ? loadCandidates : loadPositions}
              className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        ) : !selectedPosition ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Position</h3>
            <p className="text-gray-500">Choose a position to see its detailed analytics.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : !analytics ? (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">This position has no applications yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalCandidates}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}/10</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Median Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.medianScore}/10</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications/Day</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.candidatesPerDay}</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="candidates"
                      stroke="#3B82F6"
                      fill="#93C5FD"
                      name="Applications"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Score Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" name="Number of Candidates" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Source Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution by Source</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
  data={analytics.sourceDistribution}
  cx="50%"
  cy="50%"
  labelLine={false}
  label={(props: PieLabelRenderProps) => {
    const name = props.name ?? 'Unknown';
    // Coerce percent to number and fallback to 0
    const percent = typeof props.percent === 'number' ? props.percent : 0;
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  }}
  outerRadius={80}
  fill="#8884d8"
  dataKey="value"
>
                      {analytics.sourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Average Score Over Time */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Average Score Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Average Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Source Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Source Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Number of Candidates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.sourceDistribution.map((source) => (
                      <tr key={source.name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {source.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {source.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {source.avgScore.toFixed(1)}/10
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {((source.value / analytics.totalCandidates) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionAnalytics;
```

---


## `./src/app/jobs/[slug]/openedpositions/new/page.tsx`

```tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Calendar, FileText, Briefcase, BarChart3, CheckCircle, AlertCircle, Activity, Lock } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewOpenedPositionPage() {
  const router = useRouter()
  const session = useSession()

  const [positionName, setPositionName] = useState('')
  const [positionDescription, setPositionDescription] = useState('')
  const [positionDescriptionDetailed, setPositionDescriptionDetailed] = useState('')
  const [positionStartDate, setPositionStartDate] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [positionId, setPositionId] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{ matched: number; total: number } | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [canCreatePosition, setCanCreatePosition] = useState<boolean | null>(null)
  const positionAccessChecked = useRef(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  // Fetch user's company_id
  const fetchUserCompanyId = useCallback(async (userId: string) => {
    console.log('👤 Starting to fetch company_id for userId:', userId);
    
    try {
      const { data, error } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Fetch company_id response:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching company_id:', error);
        return;
      }
      
      if (data?.company_id) {
        console.log('✅ Company ID found:', data.company_id);
        setCompanyId(data.company_id);
      } else {
        console.log('⚠️ No company_id found in user data:', data);
      }
    } catch (error) {
      console.error('💥 Catch block error in fetchUserCompanyId:', error);
    }
  }, []);

  // Check if user can create new position
  const checkPositionCreationAccess = useCallback(async () => {
    console.log('🎯 checkPositionCreationAccess called with:', {
      companyId,
      alreadyChecked: positionAccessChecked.current
    });
    
    if (!companyId) {
      console.log('❌ No companyId available, cannot check access');
      return;
    }
    
    if (positionAccessChecked.current) {
      console.log('❌ Access already checked, skipping');
      return;
    }
    
    console.log('🔍 Checking position creation access for company_id:', companyId);
    positionAccessChecked.current = true;
    
    try {
      console.log('📞 Calling supabase.rpc with params:', { p_company_id: companyId });
      
      const { data, error } = await supabase.rpc('can_open_new_position', { p_company_id: companyId })
      
      console.log('📨 RPC Response:', { data, error, dataType: typeof data });
      
      if (error) {
        console.log('❌ RPC Error:', error);
        setCanCreatePosition(false);
        return;
      }
      
      if (data === null || data === undefined) {
        console.log('❌ Data is null/undefined, setting access to false');
        setCanCreatePosition(false);
        return;
      }
      
      // Handle different possible return formats
      let hasAccess = false;
      
      if (typeof data === 'boolean') {
        console.log('🔧 Data is boolean:', data);
        hasAccess = data;
      } else if (typeof data === 'string') {
        console.log('🔧 Data is string:', data);
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        console.log('🔧 Data is number:', data);
        hasAccess = data === 1;
      } else if (typeof data === 'object' && data !== null) {
        console.log('🔧 Data is object:', data);
        // Sometimes Supabase functions return objects, check if there's a result property
        hasAccess = data.result === true || data.result === 'true' || 
                   data.can_access === true || data.can_access === 'true' ||
                   data[0] === true || data[0] === 'true' || // Sometimes it's an array
                   data === true; // Sometimes the object itself is the boolean
      }
      
      console.log('✅ Final access decision:', hasAccess);
      setCanCreatePosition(hasAccess);
      
    } catch (error) {
      console.error('💥 Catch block error:', error);
      setCanCreatePosition(false);
    }
  }, [companyId]);

  // Initialize user data and check access
  useEffect(() => {
    console.log('🚀 useEffect for session triggered:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (session?.user?.id) {
      console.log('✅ Valid session found, fetching company ID...');
      fetchUserCompanyId(session.user.id);
    } else {
      console.log('❌ No valid session or user ID');
    }
  }, [session?.user?.id, fetchUserCompanyId]);

  // Check access when companyId is available
  useEffect(() => {
    console.log('🎯 useEffect for companyId triggered:', {
      companyId,
      canCreatePosition,
      accessChecked: positionAccessChecked.current
    });
    
    if (companyId) {
      console.log('✅ Company ID available, checking access...');
      checkPositionCreationAccess();
    } else {
      console.log('❌ No company ID yet');
    }
  }, [companyId, checkPositionCreationAccess]);

  if (!session || canCreatePosition === null) {
    console.log('🔄 Loading state:', {
      hasSession: !!session,
      canCreatePosition,
      companyId,
      accessChecked: positionAccessChecked.current
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!session ? 'Loading user info...' : 'Checking position limits...'}
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Debug: Session: {!!session ? 'Yes' : 'No'} | CompanyID: {companyId || 'None'} | Access: {String(canCreatePosition)}
          </div>
        </div>
      </div>
    )
  }

  const userId = session.user.id

  // Création de la position
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setAnalysisResult(null)

    setLoading(true)

    try {
      const res = await fetch('/api/new-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          id: positionId,
          position_name: positionName,
          position_description: positionDescription,
          position_description_detailed: positionDescriptionDetailed,
          position_start_date: positionStartDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: `${data.error || 'Error creating position'}`, type: 'error' })
      } else {
        setMessage({ text: 'New position successfully created', type: 'success' })
        setPositionId(data.id) // récupère l'ID pour lancer l'analyse
        setPositionName('')
        setPositionDescription('')
        setPositionDescriptionDetailed('')
        setPositionStartDate('')
      }
    } catch (error) {
      setMessage({ text: `Unexpected error: ${(error as Error).message}`, type: 'error' })
    }

    setLoading(false)
  }

  // Lancement de l'analyse massive avec progression
  const handleAnalyseMassive = async () => {
    if (!positionId) return

    setAnalysisLoading(true)
    setAnalysisResult(null)
    setMessage(null)
    setProgress(0)

    try {
      // On utilise EventSource pour suivre la progression (Server-Sent Events)
      const es = new EventSource(`/api/analyse-massive?position_id=${positionId}&user_id=${userId}`)

      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'progress') {
          setProgress(data.progress) // 0-100%
        } else if (data.type === 'done') {
          setAnalysisResult({ matched: data.matched, total: data.total })
          setMessage({
            text: `Analyse completed: ${data.matched} / ${data.total} candidates are corresponding`,
            type: 'success',
          })
          setAnalysisLoading(false)
          es.close()
        } else if (data.type === 'error') {
          setMessage({ text: `${data.error}`, type: 'error' })
          setAnalysisLoading(false)
          es.close()
        }
      }

      es.onerror = (err) => {
        console.error('SSE error:', err)
        setMessage({ text: 'Unexpected server error during analysis', type: 'error' })
        setAnalysisLoading(false)
        es.close()
      }
    } catch (error) {
      setMessage({ text: `Unexpected error: ${(error as Error).message}`, type: 'error' })
      setAnalysisLoading(false)
    }
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Plus className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Create a New Position
            </h1>
            <p className="text-gray-600">Fill out the form below to create a new job position</p>
          </div>
        </div>

        {/* Position Limit Reached Message */}
        {canCreatePosition === false && (
          <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                Position Limit Reached
              </h3>
              <p className="text-red-700 mb-6">
                Sorry, you have reached the limit of your forfait. To create more positions, please upgrade your plan.
              </p>
              <button 
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-8 rounded-lg font-medium hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                onClick={() => {
                  // Add your upgrade logic here
                  // For example: router.push('/upgrade') or open upgrade modal
                  console.log('Redirect to upgrade page')
                }}
              >
                Upgrade Your Plan
              </button>
            </div>
          </div>
        )}

        {/* Main Form - Only show if user can create position */}
        {canCreatePosition === true && (
          <>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Position Name */}
                  <div>
                    <label htmlFor="positionName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Briefcase className="w-4 h-4" />
                      Position Name
                    </label>
                    <input
                      id="positionName"
                      type="text"
                      value={positionName}
                      onChange={(e) => setPositionName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g. Senior Software Developer"
                    />
                  </div>

                  {/* Position Description */}
                  <div>
                    <label htmlFor="positionDescription" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <FileText className="w-4 h-4" />
                      Position Description (for display)
                    </label>
                    <textarea
                      id="positionDescription"
                      value={positionDescription}
                      onChange={(e) => setPositionDescription(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={4}
                      placeholder="Brief description that will be shown to candidates..."
                    />
                  </div>

                  {/* Position Description Detailed */}
                  <div>
                    <label htmlFor="positionDescriptionDetailed" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Activity className="w-4 h-4" />
                      Position Description Detailed (For AI analyse)
                    </label>
                    <textarea
                      id="positionDescriptionDetailed"
                      value={positionDescriptionDetailed}
                      onChange={(e) => setPositionDescriptionDetailed(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={4}
                      placeholder="Detailed requirements, skills, and qualifications for AI matching..."
                    />
                  </div>

                  {/* Starting Date */}
                  <div>
                    <label htmlFor="positionStartDate" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Calendar className="w-4 h-4" />
                      Starting Date
                    </label>
                    <input
                      id="positionStartDate"
                      type="date"
                      value={positionStartDate}
                      onChange={(e) => setPositionStartDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Position
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Messages - Now positioned right after the form */}
            {message && (
              <div className={`rounded-2xl p-4 sm:p-6 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Section */}
            {positionId && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                    <Activity className="w-5 h-5" />
                    Candidate Analysis
                  </h3>
                  
                  <button
                    onClick={handleAnalyseMassive}
                    disabled={analysisLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                  >
                    {analysisLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Analyse running...
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
                        Launch analyse on the database
                      </>
                    )}
                  </button>

                  {/* Progress Bar */}
                  {analysisLoading && (
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Results & Action */}
            {analysisResult && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                    <BarChart3 className="w-5 h-5" />
                    Analysis Results
                  </h3>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {analysisResult.matched} / {analysisResult.total}
                      </div>
                      <p className="text-gray-600">Matching candidates found</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Take the slug part from current pathname, e.g. /jobs/demo/openedpositions/new
                      const basePath = pathname.split('/openedpositions')[0] // /jobs/demo
                      router.push(`${basePath}/stats?positionId=${positionId}`)
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    <BarChart3 className="w-5 h-5" />
                    View Details
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
```

---


## `./src/app/jobs/[slug]/openedpositions/page.tsx`

```tsx
// src/app/jobs/[slug]/page.tsx
import PositionsList from "./PositionList";
import { Analytics } from "@vercel/analytics/next"
import { Metadata } from 'next'

type Position = {
  id: number;
  position_name: string;
  position_description: string;
  position_description_detailed: string;
  company?: {
    company_logo?: string;
    company_name?: string;
    slug?: string;
  };
};

type ApiResponse = { positions?: Position[] };

// Generate dynamic metadata for better SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: `Jobs at ${slug} | Job Board`,
    description: `Browse available positions at ${slug}. Find your next career opportunity.`,
    openGraph: {
      title: `Jobs at ${slug}`,
      description: `Browse available positions at ${slug}`,
    },
  }
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  let positions: Position[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/positions-public?slug=${slug}`, {
      // Use revalidation instead of no-store for better performance
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });
    
    if (!res.ok) {
      console.error('Failed to fetch positions:', res.status, res.statusText);
      // Don't throw here, just use empty array
    } else {
      const data: ApiResponse = await res.json();
      positions = data.positions ?? [];
    }
  } catch (err) {
    console.error('Error fetching positions:', err);
    // Continue with empty array
  }

  return (
    <>
      {/* Remove the main wrapper with fixed max-width and padding */}
      <PositionsList initialPositions={positions} companySlug={slug} />
      <Analytics />
    </>
  );
}
```

---


## `./src/app/jobs/[slug]/page.tsx`

```tsx
import Home from './../../jobs/[slug]/Home/page'

export default function HomePage() {
  return (
    <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Home />
    </main>
  )
}
```

---


## `./src/app/jobs/[slug]/stats/StatsTable.tsx`

```tsx
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Users, FileText, Mail, Phone, Edit3, Save, XCircle, Eye, EyeOff, Workflow } from 'lucide-react'

type Candidat = {
  candidat_firstname: string
  candidat_lastname: string
  cv_file?: string
  created_at: string
  candidat_email: string
  candidat_phone: string
}

type Row = {
  candidat_score: number | null
  candidat_ai_analyse: string | null
  candidat_id: number
  candidat_comment: string | null
  candidat_next_step: string | null
  source: string | null
  candidats?: Candidat | null
}

type RecruitmentStep = {
  step_id: string
  step_name: string
}

function Card({ row, onClick }: { row: Row; onClick: (row: Row) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.candidat_id.toString(),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Get color based on score
  const getScoreColor = (score: number | null) => {
    if (score === null || score === undefined) return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    if (score >= 8) return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' }
    if (score >= 6) return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' }
    return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
  }

  const getScoreBadgeColor = (score: number | null) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-700'
    if (score >= 8) return 'bg-green-100 text-green-700'
    if (score >= 6) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  const scoreColors = getScoreColor(row.candidat_score)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        if (!isDragging) onClick(row)
      }}
      className={`${scoreColors.bg} rounded-lg shadow-sm border ${scoreColors.border} p-3 cursor-pointer hover:shadow-md transition-all select-none mb-2 group touch-manipulation`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className={`font-medium ${scoreColors.text} text-sm leading-tight`}>
            {row.candidats?.candidat_firstname ?? '—'} {row.candidats?.candidat_lastname ?? ''}
          </p>
          <p className="text-xs text-gray-500">ID: {row.candidat_id}</p>
        </div>
        {row.candidat_score !== null && (
          <span className={`${getScoreBadgeColor(row.candidat_score)} text-xs px-2 py-1 rounded-full font-medium`}>
            {row.candidat_score}
          </span>
        )}
      </div>

      {/* Candidate email & phone */}
      <div className="space-y-1 mb-2">
        {row.candidats?.candidat_email && (
          <a
            href={`mailto:${row.candidats.candidat_email}`}
            className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-3 h-3" /> {row.candidats.candidat_email}
          </a>
        )}
        {row.candidats?.candidat_phone && (
          <a
            href={`tel:${row.candidats.candidat_phone}`}
            className="flex items-center gap-1 text-green-600 hover:underline text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="w-3 h-3" /> {row.candidats.candidat_phone}
          </a>
        )}
      </div>

      {row.candidat_comment && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {row.candidat_comment}
        </p>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {row.candidats?.created_at ? new Date(row.candidats.created_at).toLocaleDateString('en-GB') : '—'}
        </span>
        {row.candidats?.cv_file && (
          <a
            href={row.candidats.cv_file}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 hover:underline text-xs transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="w-3 h-3" />
            <span>CV</span>
          </a>
        )}
      </div>
    </div>
  )
}

// Droppable column with useDroppable hook
function Column({ 
  columnId, 
  columnName, 
  rows, 
  onCardClick,
  isRejectedColumn = false,
  showRejected = true
}: { 
  columnId: string
  columnName: string
  rows: Row[]
  onCardClick: (row: Row) => void
  isRejectedColumn?: boolean
  showRejected?: boolean
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
  })

  const isRejected = columnName.toLowerCase() === "rejected"
  const baseBg = isRejected ? "bg-red-100" : "bg-gray-100"
  const badgeBg = isRejected ? "bg-red-200 text-red-700" : "bg-gray-200 text-gray-600"
  const titleColor = isRejected ? "text-red-700" : "text-gray-700"

  // Filter out rejected candidates if showRejected is false
  const displayRows = isRejectedColumn && !showRejected ? [] : rows
  const actualCount = rows.length

  return (
    <div
      ref={setNodeRef}
      className={`${baseBg} rounded-lg p-3 w-72 flex-shrink-0 min-h-[400px] flex flex-col transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className={`text-sm font-semibold ${titleColor} uppercase tracking-wide`}>
          {columnName}
        </h2>
        <span className={`${badgeBg} text-xs px-2 py-1 rounded-full font-medium`}>
          {actualCount}
        </span>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <SortableContext items={displayRows.map(r => r.candidat_id.toString())} strategy={verticalListSortingStrategy}>
          {displayRows.map(row => (
            <Card key={row.candidat_id} row={row} onClick={onCardClick} />
          ))}
        </SortableContext>
        
        {displayRows.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            {isRejectedColumn && !showRejected ? (
              <p className="text-gray-500 text-sm italic">Rejected candidates hidden</p>
            ) : (
              <p className="text-gray-500 text-sm italic">Drop candidates here</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrelloBoard({ rows: initialRows }: { rows: Row[] }) {
  const session = useSession()
  const [steps, setSteps] = useState<RecruitmentStep[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState<Row | null>(null)
  const [draggingRow, setDraggingRow] = useState<Row | null>(null)
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null)
  const [currentMousePosition, setCurrentMousePosition] = useState({ x: 0, y: 0 })
  
  // New state for show/hide rejected candidates
  const [showRejected, setShowRejected] = useState(false)
  
  // New states for comment editing
  const [isEditingComment, setIsEditingComment] = useState(false)
  const [editedComment, setEditedComment] = useState('')
  const [isSavingComment, setIsSavingComment] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  // Auto-scroll functionality for smooth column transitions
  const handleAutoScroll = (clientX: number) => {
    if (!scrollContainer || !isDragging) return

    const containerRect = scrollContainer.getBoundingClientRect()
    const scrollThreshold = 100
    const maxScrollSpeed = 8
    const minScrollSpeed = 1
    
    let scrollSpeed = 0
    
    if (clientX - containerRect.left < scrollThreshold) {
      const distanceFromEdge = clientX - containerRect.left
      const speedMultiplier = Math.max(0, (scrollThreshold - distanceFromEdge) / scrollThreshold)
      scrollSpeed = -(minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * speedMultiplier)
    } else if (containerRect.right - clientX < scrollThreshold) {
      const distanceFromEdge = containerRect.right - clientX
      const speedMultiplier = Math.max(0, (scrollThreshold - distanceFromEdge) / scrollThreshold)
      scrollSpeed = minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * speedMultiplier
    }

    if (scrollSpeed !== 0) {
      scrollContainer.scrollLeft += scrollSpeed
    }
  }

  const clearAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval)
      setAutoScrollInterval(null)
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX: number
      if (e instanceof MouseEvent) {
        clientX = e.clientX
      } else {
        clientX = e.touches[0]?.clientX || 0
      }
      setCurrentMousePosition({ x: clientX, y: 0 })
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove)

    const interval = setInterval(() => {
      handleAutoScroll(currentMousePosition.x)
    }, 16)
    
    setAutoScrollInterval(interval)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      clearInterval(interval)
    }
  }, [isDragging, scrollContainer, currentMousePosition.x])

  useEffect(() => {
    if (!session?.user?.id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const resSteps = await fetch(`/api/recruitment-step?user_id=${session.user.id}`)
        const stepsData = await resSteps.json()
        setSteps(stepsData)

        // Normalize next_step values so that 0, '0', 'NULL', null, undefined all become null
        const normalizedRows = initialRows.map(r => {
          const raw = r.candidat_next_step
          const rawStr = raw === null || raw === undefined ? '' : String(raw).trim().toLowerCase()
          const isNullish = raw === null || raw === undefined || rawStr === '' || rawStr === '0' || rawStr === 'null'
          return {
            ...r,
            candidat_next_step: isNullish ? null : String(r.candidat_next_step),
          }
        })
        
        setRows(normalizedRows)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session, initialRows])

  const handleStepChange = async (candidat_id: number, step_id: string | null) => {
    const originalRows = [...rows]
    
    setRows(prev =>
      prev.map(r => (r.candidat_id === candidat_id ? { 
        ...r, 
        candidat_next_step: step_id === 'unassigned' || step_id === null ? null : step_id 
      } : r))
    )

    try {
      const response = await fetch('/api/update-next-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidat_id, 
          step_id: step_id === 'unassigned' || step_id === null ? null : Number(step_id)
        }),
      })

      if (!response.ok) throw new Error('Failed to update step')
    } catch (err) {
      console.error('Error updating step:', err)
      setRows(originalRows)
      alert("Erreur lors de la mise à jour de l'étape")
    }
  }

  // New function to handle comment updates
  const handleCommentUpdate = async () => {
    if (!selectedCandidate) return
    
    setIsSavingComment(true)
    const originalRows = [...rows]
    
    // Optimistically update the UI
    setRows(prev =>
      prev.map(r => (r.candidat_id === selectedCandidate.candidat_id ? { 
        ...r, 
        candidat_comment: editedComment 
      } : r))
    )
    
    setSelectedCandidate(prev => prev ? {
      ...prev,
      candidat_comment: editedComment
    } : null)

    try {
      const response = await fetch('/api/update-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidat_id: selectedCandidate.candidat_id, 
          comment: editedComment 
        }),
      })

      if (!response.ok) throw new Error('Failed to update comment')
      
      setIsEditingComment(false)
    } catch (err) {
      console.error('Error updating comment:', err)
      // Revert changes on error
      setRows(originalRows)
      setSelectedCandidate(originalRows.find(r => r.candidat_id === selectedCandidate.candidat_id) || null)
      alert("Erreur lors de la mise à jour du commentaire")
    } finally {
      setIsSavingComment(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const row = rows.find(r => r.candidat_id.toString() === active.id) || null
    setDraggingRow(row)
    setIsDragging(true)
    
    const scrollElement = document.querySelector('#scroll-container') as HTMLElement
    if (scrollElement) {
      setScrollContainer(scrollElement)
      // hide native scrolling while dragging to prevent jitter; restore on drag end
      scrollElement.style.overflowX = 'hidden'
      scrollElement.style.touchAction = 'none'
    }
  }

  const findColumnForElement = (elementId: string): string | null => {
    const columns = [{ step_id: 'unassigned', step_name: 'Unassigned' }, ...steps]
    if (columns.some(col => col.step_id === elementId)) return elementId

    const candidateId = Number(elementId)
    const candidate = rows.find(r => r.candidat_id === candidateId)
    return candidate ? (candidate.candidat_next_step ?? 'unassigned') : null
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingRow(null)
    setIsDragging(false)
    clearAutoScroll()
    
    if (scrollContainer) {
      scrollContainer.style.overflowX = 'auto'
      scrollContainer.style.touchAction = 'auto'
      setScrollContainer(null)
    }
    
    const { active, over } = event
    if (!over || !active) return

    const activeId = Number(active.id)
    const currentRow = rows.find(r => r.candidat_id === activeId)
    if (!currentRow) return

    const targetColumnId = findColumnForElement(over.id as string)
    if (targetColumnId === null) return

    const newStepId: string | null = targetColumnId === 'unassigned' ? null : targetColumnId
    if (currentRow.candidat_next_step !== newStepId) {
      handleStepChange(activeId, newStepId)
    }
  }

  const getRowsByStepId = (stepId: string | null) => {
    // treat 'unassigned' and null as the same bucket
    if (stepId === 'unassigned' || stepId === null) {
      return rows.filter(r => {
        const s = r.candidat_next_step
        return s === null || s === undefined || String(s).toLowerCase() === 'null' || String(s) === '0'
      })
    }

    return rows.filter(r => String(r.candidat_next_step) === String(stepId))
  }

  const getStepName = (stepId: string | null) => {
    if (!stepId || stepId === '0') return 'Unassigned'
    const stepIdStr = String(stepId)
    const foundStep = steps.find(s => String(s.step_id) === stepIdStr)
    return foundStep?.step_name ?? 'Unknown'
  }

  const handleCandidateClick = (row: Row) => {
    setSelectedCandidate(row)
    setEditedComment(row.candidat_comment || '')
    setIsEditingComment(false)
  }

  const handleCloseModal = () => {
    setSelectedCandidate(null)
    setIsEditingComment(false)
    setEditedComment('')
  }

  const startEditingComment = () => {
    setIsEditingComment(true)
    setEditedComment(selectedCandidate?.candidat_comment || '')
  }

  const cancelEditingComment = () => {
    setIsEditingComment(false)
    setEditedComment(selectedCandidate?.candidat_comment || '')
  }

  // Helper function to check if a candidate is rejected
  const isRejectedCandidate = (row: Row) => {
    return String(row.candidat_next_step) === '1'
  }

  // Get count of non-rejected candidates for display
  const nonRejectedCandidatesCount = rows.filter(row => !isRejectedCandidate(row)).length
  const rejectedCandidatesCount = rows.filter(row => isRejectedCandidate(row)).length

  if (loading || steps.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading board...</p>
        </div>
      </div>
    )
  }

  const columns = [{ step_id: 'unassigned', step_name: 'Unassigned' }, ...steps]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full">
        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <Workflow className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 flex-shrink-0" />
                <div className="text-center">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Recruitment Treatment</h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your candidates by dragging cards between steps.</p>
                </div>
              </div>

              {/* Candidates count and rejected toggle */}
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold text-lg">{showRejected ? rows.length : nonRejectedCandidatesCount}</span>
                  <span>candidates</span>
                  {!showRejected && rejectedCandidatesCount > 0 && (
                    <span className="text-blue-100 text-sm">({rejectedCandidatesCount} hidden)</span>
                  )}
                </div>
                
                {/* Show/Hide Rejected Button */}
                {rejectedCandidatesCount > 0 && (
                  <button
                    onClick={() => setShowRejected(!showRejected)}
                    className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full transition-colors duration-200 text-sm font-medium"
                  >
                    {showRejected ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide Rejected</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Show Rejected</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          {/* Full-width horizontal scroll container */}
          <div
            id="scroll-container"
            style={{ 
              overflowX: 'auto', 
              overflowY: 'hidden', 
              WebkitOverflowScrolling: 'touch', 
              scrollbarGutter: 'stable'
            }}
            className="flex gap-4 pb-4 px-4 sm:px-6 w-full items-start"
          >
            {columns.map(col => {
              const columnRows = col.step_id === 'unassigned'
                ? getRowsByStepId('unassigned')
                : getRowsByStepId(col.step_id)

              const isRejectedColumn = col.step_name.toLowerCase() === 'rejected'

              return (
                <Column
                  key={col.step_id}
                  columnId={col.step_id}
                  columnName={col.step_name}
                  rows={columnRows}
                  onCardClick={handleCandidateClick}
                  isRejectedColumn={isRejectedColumn}
                  showRejected={showRejected}
                />
              )
            })}
          </div>

          <DragOverlay>
            {draggingRow && (
              <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 p-3 cursor-grabbing w-72 transform rotate-3 z-50">
                <p className="font-medium text-gray-800 text-sm">
                  {draggingRow.candidats?.candidat_firstname} #{draggingRow.candidat_id}
                </p>
                <p className="text-xs text-gray-500 mt-1">Score: {draggingRow.candidat_score ?? '—'}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Enhanced Candidate Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedCandidate.candidats?.candidat_firstname ?? '—'}{' '}
                      {selectedCandidate.candidats?.candidat_lastname ?? ''}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">Candidate ID: {selectedCandidate.candidat_id}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                      {selectedCandidate.candidats?.candidat_email ? (
                        <a
                          href={`mailto:${selectedCandidate.candidats.candidat_email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                        >
                          {selectedCandidate.candidats.candidat_email}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                      {selectedCandidate.candidats?.candidat_phone ? (
                        <a
                          href={`tel:${selectedCandidate.candidats.candidat_phone}`}
                          className="text-green-600 hover:text-green-800 hover:underline transition-colors font-medium"
                        >
                          {selectedCandidate.candidats.candidat_phone}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </div>
                  </div>

                  {/* CV File */}
                  {selectedCandidate.candidats?.cv_file && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">CV File</p>
                        <a
                          href={selectedCandidate.candidats.cv_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 hover:underline transition-colors font-medium"
                        >
                          View CV
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Source */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Source</p>
                      <p className="text-gray-800 font-medium">{selectedCandidate.source ?? 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">Score</h3>
                  <p className="text-2xl font-bold text-blue-900">{selectedCandidate.candidat_score ?? 'Not scored'}</p>
                </div>
                
                {/* Enhanced Comment Section with Edit Functionality */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Comment</h3>
                    {!isEditingComment && (
                      <button
                        onClick={startEditingComment}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-xs">Edit</span>
                      </button>
                    )}
                  </div>
                  
                  {isEditingComment ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Add your comment here..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCommentUpdate}
                          disabled={isSavingComment}
                          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          <Save className="w-4 h-4" />
                          {isSavingComment ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditingComment}
                          disabled={isSavingComment}
                          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedCandidate.candidat_comment || 'No comments yet'}</p>
                  )}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">AI Analysis</h3>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedCandidate.candidat_ai_analyse ?? 'No AI analysis available'}</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-orange-800 mb-2">Next Step</h3>
                  <p className="text-gray-800">{getStepName(selectedCandidate.candidat_next_step)}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Small stylesheet to improve scrollbar appearance in browsers that support it. Note: OS settings can still hide scrollbars (macOS overlay scrollbars). */}
      <style>{`
        #scroll-container::-webkit-scrollbar { height: 10px; }
        #scroll-container::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.6); border-radius: 6px; }
        #scroll-container::-webkit-scrollbar-track { background: rgba(229,231,235,0.4); }
        /* Reserve the scrollbar gutter so the layout doesn't jump when it appears */
        #scroll-container { scrollbar-gutter: stable; }
      `}</style>
    </div>
  )
}
```

---


## `./src/app/jobs/[slug]/stats/page.tsx`

```tsx
import { createServerClient } from '../../../../../lib/supabaseServerClient'
import StatsTable from './StatsTable'
import { Analytics } from "@vercel/analytics/next"

type Candidat = {
  candidat_firstname: string
  candidat_lastname: string
  cv_text: string
  cv_file: string
  created_at: string
  candidat_email: string
  candidat_phone: string
}

type PositionToCandidatRow = {
  candidat_score: number | null
  candidat_ai_analyse: string | null
  candidat_id: number
  candidat_comment: string | null
  candidat_next_step: string | null
  source: string | null
  candidats: Candidat | null
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ positionId?: string }>
}) {
  const params = await searchParams
  const positionId = params.positionId

  if (!positionId) {
    return <p>Identifiant de la position manquant.</p>
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('position_to_candidat')
    .select(`
      candidat_score,
      candidat_ai_analyse,
      candidat_id,
      candidat_comment,
      candidat_next_step,
      source,
      candidats (
        candidat_firstname,
        candidat_lastname,
        cv_text,
        cv_file,
        created_at,
        candidat_email,
        candidat_phone
      )
    `)
    .eq('position_id', Number(positionId)) as {
      data: PositionToCandidatRow[] | null
      error: unknown
    }

  if (error) {
    console.error(error)
    return <p>Error in the loading of the stats.</p>
  }

  if (!data || data.length === 0) {
    return <p>No candidate for this position</p>
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-6">
      <StatsTable rows={data} />
    </main>
  )
}
```

---


## `./src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "./Header";
import ClientProvider from "./ClientProvider";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "InnoHR",
  description: "HR was never as easy as NOW",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ClientProvider>
          <Header />
          <main style={{ padding: '2rem' }}>{children}</main>
        </ClientProvider>
      </body>
    </html>
  );
}
```

---


## `./src/app/page.tsx`

```tsx
import Home from './../app/jobs/[slug]/Home/page'

export default function HomePage() {
  return (
    <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Home />
    </main>
  )
}
```

---


## `./src/src/components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

---


## `./src/src/components/ui/dropdown-menu.tsx`

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
```

---


## `./src/src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---


## `./tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": "src",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---


---

# Statistiques
- **Nombre total de fichiers:** 62
- **Taille du fichier:** 464K
- **Date d'extraction:** Sun Sep 21 05:48:40 CEST 2025

# Instructions pour l'IA
Ce fichier contient la codebase complète du projet innohrmvp. 

**Objectifs de documentation:**
1. Analyser l'architecture globale
2. Identifier les composants principaux
3. Documenter les flux de données
4. Créer un guide technique complet
5. Suggérer des améliorations

**Structure attendue de la documentation:**
- Vue d'ensemble de l'architecture
- Guide d'installation et setup
- Documentation des composants
- API et routes
- Base de données (si applicable)
- Déploiement et configuration

