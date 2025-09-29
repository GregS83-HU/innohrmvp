# Codebase Complete - innohrmvp
**Généré le:** Sun Sep 28 05:47:47 CEST 2025
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
    "postinstall": "patch-package",
    "lint": "next lint"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@stripe/react-stripe-js": "^4.0.2",
    "@stripe/stripe-js": "^7.9.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/supabase-js": "^2.53.0",
    "@vercel/analytics": "^1.5.0",
    "@vercel/speed-insights": "^1.2.0",
    "canvas": "^3.2.0",
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
    "stripe": "^18.5.0",
    "tailwind-merge": "^3.3.1",
    "tesseract.js": "^6.0.1",
    "tesseract.js-node": "^0.1.0",
    "uuid": "^13.0.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/pdf-parse": "^1.1.5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/stripe-v3": "^3.1.33",
    "@types/tesseract.js": "^0.0.2",
    "@types/uuid": "^10.0.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "postcss": "^8.5.6",
    "snyk": "^1.1299.0",
    "tailwindcss": "^4.1.13",
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
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "lib/parsePdfSimple.cjs"],
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


## `./components/AddUserModal.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, X, CheckCircle, Loader2 } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
}

export const AddUserModal = ({ isOpen, onClose, onSuccess, companyId }: AddUserModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  useEffect(() => {
    if (isOpen && !formData.password) {
      const newPassword = generatePassword();
      setFormData(prev => ({ ...prev, password: newPassword }));
    }
  }, [isOpen, formData.password]);

  // Submit user creation via API route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/users-creation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, companyId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setSuccess(`User created successfully! Temporary password: ${formData.password}`);

      setTimeout(() => {
        setFormData({ email: '', firstName: '', lastName: '', password: '' });
        setSuccess(null);
        onClose();
        onSuccess();
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy password');
    }
  };

  const regeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
          <button onClick={onClose} disabled={loading}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">{success}</p>
            <div className="bg-white rounded border p-3 mb-4">
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Password:</strong> {formData.password}</p>
              <button onClick={copyPassword} className="mt-2 text-blue-600 text-xs">
                {copied ? 'Copied!' : 'Copy credentials'}
              </button>
            </div>
            <p className="text-xs text-gray-500">This window will close automatically</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border rounded-lg"
              disabled={loading}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="First Name"
                value={formData.firstName}
                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={loading}
              />
              <input
                type="text"
                required
                placeholder="Last Name"
                value={formData.lastName}
                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={loading}
              />
            </div>
            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={loading}
              />
              <div className="flex justify-between mt-2">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                <button type="button" onClick={regeneratePassword} className="text-xs text-blue-600">
                  Regenerate Password
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
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


## `./components/Header.tsx`

```tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import { 
  Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown, 
  User, LogOut, Clock, CreditCard, UserCog, TicketPlus
} from 'lucide-react';
import { useHeaderLogic } from '../hooks/useHeaderLogic';
import { 
  LoginModal, HappyCheckMenuItem, DemoAwareMenuItem, DemoTimer, ForfaitBadge 
} from './header/';
import NotificationComponent from './NotificationComponent';

export default function Header() {
  const {
    // State
    isLoginOpen, setIsLoginOpen,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isHRToolsMenuOpen, setIsHRToolsMenuOpen,
    isAccountMenuOpen, setIsAccountMenuOpen,
    isUserMenuOpen, setIsUserMenuOpen,
    login, setLogin,
    password, setPassword,
    user,
    error,
    companyLogo,
    companyId,
    companyForfait,
    canAccessHappyCheck,
    demoTimeLeft,
    isDemoMode,
    isDemoExpired,
    
    // Refs
    hrToolsMenuRef,
    accountMenuRef,
    userMenuRef,
    
    // Computed values
    companySlug,
    buildLink,
    
    // Functions
    handleLogin,
    handleLogout,
    formatTime,
  } = useHeaderLogic();

  // Memoized values
  const buttonBaseClasses = useMemo(() => 
    'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md whitespace-nowrap',
    []
  );

  const happyCheckLink = useMemo(() => buildLink('/happiness-check'), [buildLink]);
  const uploadCertificateLink = useMemo(() => buildLink('/medical-certificate/upload'), [buildLink]);
  const manageSubscriptionLink = useMemo(() => buildLink('/subscription'), [buildLink]);
  const manageUsersLink = useMemo(() => buildLink('/users-creation'), [buildLink]);
  const manageticketsLink = useMemo(() => buildLink('/tickets'), [buildLink]);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <DemoTimer 
          isDemoMode={isDemoMode}
          isDemoExpired={isDemoExpired}
          demoTimeLeft={demoTimeLeft}
          formatTime={formatTime}
        />

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
              <ForfaitBadge companyForfait={companyForfait} />
            </div>

            {/* Desktop Navigation */}
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

              {/* HR Tools Dropdown */}
              {user && (
                <div className="relative" ref={hrToolsMenuRef}>
                  {isDemoExpired ? (
                    <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                      <Heart className="w-4 h-4" /> HR Tools
                      <ChevronDown className="w-3 h-3" />
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

              {/* Manage Account */}
              {user && companySlug !== 'demo' && (
                <div className="relative" ref={accountMenuRef}>
                  {isDemoExpired ? (
                    <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                      <User className="w-4 h-4" /> Manage Account
                      <ChevronDown className="w-3 h-3" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Demo expired - Contact us to continue
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700`}>
                        <User className="w-4 h-4" /> Manage Account
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isAccountMenuOpen && (
                        <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Account Management</p>
                          </div>

                          <Link 
                            href={manageSubscriptionLink} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <CreditCard className="w-4 h-4" /> Manage Subscription
                          </Link>

                          <Link 
                            href={manageUsersLink} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <UserCog className="w-4 h-4" /> Manage your users
                          </Link>

                          <Link 
                            href={manageticketsLink} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <TicketPlus className="w-4 h-4" /> Support Tickets
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

            {/* Right section - Notifications + User Area + Mobile Menu */}
            <div className="flex items-center gap-3 -mr-2">
              {/* Notifications (only for logged in users) */}
              {user && (
                <NotificationComponent
                  currentUser={user}
                  isHrinnoAdmin={user?.is_admin === true}
                  companySlug={companySlug}
                />
              )}

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

              {/* Contact Us (demo only) */}
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
                    className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <BarChart3 className="w-4 h-4" /> Recruitment Dashboard
                  </DemoAwareMenuItem>

                  <HappyCheckMenuItem
                    href={buildLink('/happiness-dashboard')}
                    className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    canAccessHappyCheck={canAccessHappyCheck}
                  >
                    <BarChart3 className="w-4 h-4" /> Happiness Dashboard
                  </HappyCheckMenuItem>

                  <DemoAwareMenuItem 
                    href={buildLink('/medical-certificate/list')} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <Stethoscope className="w-4 h-4" /> List of Certificates
                  </DemoAwareMenuItem>

                  <DemoAwareMenuItem 
                    href={buildLink('/medical-certificate/download')} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <Stethoscope className="w-4 h-4" /> Certificates Download
                  </DemoAwareMenuItem>
                </>
              )}

              {user && companySlug !== 'demo' && (
                <>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Management</p>
                  </div>

                  <DemoAwareMenuItem 
                    href={manageSubscriptionLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <CreditCard className="w-4 h-4" /> Manage Subscription
                  </DemoAwareMenuItem>

                  <DemoAwareMenuItem 
                    href={manageUsersLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <UserCog className="w-4 h-4" /> Manage your users
                  </DemoAwareMenuItem>

                  <DemoAwareMenuItem 
                    href={manageticketsLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <TicketPlus className="w-4 h-4" /> Support Tickets
                  </DemoAwareMenuItem>
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

              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className={`${buttonBaseClasses} bg-white hover:bg-red-50 text-red-600 w-full justify-start`}>
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                ) : (
                  <button 
                    onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} 
                    className={`${buttonBaseClasses} ${
                      isDemoExpired 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } w-full justify-start`}
                    disabled={isDemoExpired}
                  >
                    <User className="w-4 h-4" /> Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        login={login}
        setLogin={setLogin}
        password={password}
        setPassword={setPassword}
        onLogin={handleLogin}
        error={error}
        isDemoExpired={isDemoExpired}
      />
    </>
  );
}
```

---


## `./components/NotificationComponent.tsx`

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bell, X, MessageSquare, Ticket, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NotificationData {
  id: string;
  type: 'ticket_created' | 'ticket_status_changed' | 'ticket_message';
  title: string;
  message: string;
  ticket_id?: string;
  created_at: string;
  read: boolean;
}

interface NotificationComponentProps {
  currentUser: { id: string } | null;
  companySlug: string | null;
}

export default function NotificationComponent({
  currentUser,
  companySlug
}: NotificationComponentProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [toasts, setToasts] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const subscriptionsRef = useRef<any[]>([]);

  const isHrinnoAdmin = companySlug === 'hrinno' || companySlug === 'innohr';
  
  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  // 🔔 Add a notification
  const addNotification = (
    type: NotificationData['type'], 
    title: string, 
    message: string, 
    ticketId?: string
  ) => {
    const notification: NotificationData = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      ticket_id: ticketId,
      created_at: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);

    // Also add toast with auto-remove after 3s
    setToasts(prev => {
      const newToasts = [notification, ...prev];
      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== notification.id));
      }, 3000);
      return newToasts;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: NotificationData) => {
    markAsRead(notification.id);
    if (notification.ticket_id) {
      router.push(`/jobs/${companySlug}/tickets/${notification.ticket_id}`);
    }
    setShowNotifications(false);
  };

  const formatTime = (dateString: string) => {
    const diffInMinutes = (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60);
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'ticket_created': return <Ticket className="w-5 h-5 text-blue-600" />;
      case 'ticket_message': return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'ticket_status_changed': return <Check className="w-5 h-5 text-orange-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('user_id, user_name, title')
        .eq('id', ticketId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      return null;
    }
  };

  // 🟢 Setup Supabase subscriptions
  useEffect(() => {
    if (!currentUser) return;

    // Clean up existing subscriptions
    subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    subscriptionsRef.current = [];

    if (isHrinnoAdmin) {
      // 👑 SUPER ADMIN SUBSCRIPTIONS
      const ticketSub = supabase
        .channel(`admin_tickets_${currentUser.id}_${Date.now()}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets'
        }, (payload) => {
          const ticket = payload.new as any;
          if (ticket.user_id === currentUser.id) return; // skip own ticket
          
          addNotification(
            'ticket_created',
            'New Ticket Created',
            `${ticket.user_name} created: "${ticket.title}"`,
            ticket.id
          );
        })
        .subscribe();

      const messageSub = supabase
        .channel(`admin_messages_${currentUser.id}_${Date.now()}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages'
        }, async (payload) => {
           console.log('💬 Admin received message payload:', payload); // 👈 ADD THIS
          const message = payload.new as any;
          if (message.sender_type === 'admin') return; // skip admin messages

          const ticket = await fetchTicketDetails(message.ticket_id);
          if (!ticket) return;

          addNotification(
            'ticket_message',
            'New Message',
            `${message.sender_name} sent a message in "${ticket.title}"`,
            message.ticket_id
          );
        })
        .subscribe((status) => {
    console.log('📡 Admin messages subscription state:', status); // 👈 ADD
  });

      subscriptionsRef.current = [ticketSub, messageSub];
    } else {
      // 👤 NORMAL USER SUBSCRIPTIONS
      const messageSub = supabase
        .channel(`user_messages_${currentUser.id}_${Date.now()}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages'
        }, async (payload) => {
          console.log('🔄 User received status update payload:', payload); // 👈 ADD THIS
          const message = payload.new as any;
          if (message.sender_type !== 'admin' || message.sender_id === currentUser.id) return;

          const ticket = await fetchTicketDetails(message.ticket_id);
          if (!ticket || ticket.user_id !== currentUser.id) return;

          addNotification(
            'ticket_message',
            'Support Response',
            `Support replied in "${ticket.title}"`,
            message.ticket_id
          );
        })
        .subscribe();

      const statusSub = supabase
        .channel(`user_status_${currentUser.id}_${Date.now()}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets'
        }, (payload) => {
          const oldTicket = payload.old as any;
          const newTicket = payload.new as any;

          if (newTicket.user_id === currentUser.id) {
  addNotification(
    'ticket_status_changed',
    'Ticket Status Updated',
    `Your ticket "${newTicket.title}" status changed to: ${newTicket.status}`,
    newTicket.id
  );
}

        })
        .subscribe((status) => {
    console.log('📡 User status subscription state:', status); // 👈 ADD
  });

      subscriptionsRef.current = [messageSub, statusSub];
    }

    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [currentUser?.id ?? "", isHrinnoAdmin, companySlug]);

  // 🔧 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('#notifications-container')) {
        setShowNotifications(false);
      }
    };
    
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <div className="relative" id="notifications-container">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <div 
                    key={n.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {n.title}
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            n.type === 'ticket_created' ? 'bg-blue-100 text-blue-800' :
                            n.type === 'ticket_status_changed' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {n.type === 'ticket_created' ? 'New Ticket' :
                             n.type === 'ticket_status_changed' ? 'Status Change' :
                             'New Message'}
                          </span>
                        </p>
                        <p className={`text-sm mt-1 ${!n.read ? 'text-gray-600' : 'text-gray-500'}`}>{n.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTime(n.created_at)}</p>
                      </div>
                      <button 
                        onClick={e => { 
                          e.stopPropagation(); 
                          removeNotification(n.id); 
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <button 
                onClick={() => setNotifications([])}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.slice(0, 3).map(n => (
          <div 
            key={`toast-${n.id}`}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => {
              handleNotificationClick(n);
              setToasts(prev => prev.filter(t => t.id !== n.id));
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{getNotificationIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
              </div>
              <button 
                onClick={e => { 
                  e.stopPropagation(); 
                  removeNotification(n.id);
                  setToasts(prev => prev.filter(t => t.id !== n.id));
                }}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---


## `./components/header/DemoTimer.tsx`

```tsx
// components/Header/DemoTimer.tsx
import React from 'react';
import { Clock } from 'lucide-react';

interface DemoTimerProps {
  isDemoMode: boolean;
  isDemoExpired: boolean;
  demoTimeLeft: number | null;
  formatTime: (seconds: number) => string;
}

export const DemoTimer: React.FC<DemoTimerProps> = ({
  isDemoMode,
  isDemoExpired,
  demoTimeLeft,
  formatTime
}) => {
  if (!isDemoMode && !isDemoExpired) return null;

  const timerBarColor = isDemoExpired 
    ? 'bg-gradient-to-r from-red-600 to-red-700' 
    : demoTimeLeft && demoTimeLeft < 300 // Less than 5 minutes
    ? 'bg-gradient-to-r from-red-400 to-orange-500'
    : 'bg-gradient-to-r from-orange-400 to-red-500';

  const timerMessage = isDemoExpired 
    ? 'Demo Expired - Contact us to continue'
    : `Demonstration Mode - Remaining time: ${demoTimeLeft ? formatTime(demoTimeLeft) : '00:00'}`;

  return (
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
  );
};
```

---


## `./components/header/ForfaitBadge.tsx`

```tsx
// components/Header/ForfaitBadge.tsx
import React from 'react';

interface ForfaitBadgeProps {
  companyForfait: string | null;
}

export const ForfaitBadge: React.FC<ForfaitBadgeProps> = ({ companyForfait }) => {
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
};
```

---


## `./components/header/LoginModal.tsx`

```tsx
// components/Header/LoginModal.tsx
import React from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  login: string;
  setLogin: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  onLogin: () => void;
  isDemoExpired: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  login,
  setLogin,
  password,
  setPassword,
  error,
  onLogin,
  isDemoExpired
}) => {
  if (!isOpen || isDemoExpired) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
          <p className="text-gray-600 mt-1">Connect to your account</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              value={login} 
              onChange={(e) => setLogin(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onLogin} 
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};
```

---


## `./components/header/MenuItem.tsx`

```tsx
// components/Header/MenuItem.tsx
import React from 'react';
import Link from 'next/link';

// HappyCheckMenuItem for items that require happy check access
export const HappyCheckMenuItem = ({ 
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

// DemoAwareMenuItem for regular menu items that can be disabled during demo expiration
export const DemoAwareMenuItem = ({ 
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
```

---


## `./components/header/index.tsx`

```tsx
export { LoginModal } from './LoginModal';
export { HappyCheckMenuItem, DemoAwareMenuItem } from './MenuItem';
export { DemoTimer } from './DemoTimer';
export { ForfaitBadge } from './ForfaitBadge';
```

---


## `./hooks/useHeaderLogic.ts`

```ts
// hooks/useHeaderLogic.ts
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { RefObject } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  firstname: string;
  lastname: string;
  is_admin: boolean;
}

interface UseHeaderLogicReturn {
  isLoginOpen: boolean;
  setIsLoginOpen: (val: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  isHRToolsMenuOpen: boolean;
  setIsHRToolsMenuOpen: (val: boolean) => void;
  isAccountMenuOpen: boolean;
  setIsAccountMenuOpen: (val: boolean) => void;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (val: boolean) => void;
  login: string;
  setLogin: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  user: User | null;
  error: string;
  companyLogo: string | null;
  companyId: string | null;
  companyForfait: string | null;
  canAccessHappyCheck: boolean | null;
  demoTimeLeft: number | null;
  isDemoMode: boolean;
  isDemoExpired: boolean;

  hrToolsMenuRef: RefObject<HTMLDivElement | null>;
  accountMenuRef: RefObject<HTMLDivElement | null>;
  userMenuRef: RefObject<HTMLDivElement | null>;

  companySlug: string | null;
  buildLink: (basePath: string) => string;

  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  formatTime: (seconds: number) => string;
}

export const useHeaderLogic = () : UseHeaderLogicReturn => {
  // All state management
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHRToolsMenuOpen, setIsHRToolsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ id: string; firstname: string; lastname: string; is_admin:boolean} | null>(null);
  const [error, setError] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyForfait, setCompanyForfait] = useState<string | null>(null);
  const [canAccessHappyCheck, setCanAccessHappyCheck] = useState<boolean | null>(null);
  const [demoTimeLeft, setDemoTimeLeft] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDemoExpired, setIsDemoExpired] = useState(false);

  // Refs
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expirationHandledRef = useRef(false);
  const happyCheckAccessChecked = useRef(false);
  const hrToolsMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Computed values
  const slugMatch = useMemo(() => pathname.match(/^\/jobs\/([^/]+)/), [pathname]);
  const companySlug = useMemo(() => slugMatch ? slugMatch[1] : null, [slugMatch]);

  const buildLink = useCallback((basePath: string) => {
    const query = companyId ? `?company_id=${companyId}` : '';
    if (!companySlug) return '/404';
    if (basePath === '/') return `/jobs/${companySlug}${query}`;
    return `/jobs/${companySlug}${basePath}${query}`;
  }, [companyId, companySlug]);

  // Fetch functions
  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('id, user_firstname, user_lastname, is_admin')
      .eq('id', userId)
      .single();
    if (data) setUser({ id: data.id, firstname: data.user_firstname, lastname: data.user_lastname, is_admin: data.is_admin });
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

  const checkHappyCheckAccess = useCallback(async () => {
    if (!companyId || happyCheckAccessChecked.current) return;
    
    happyCheckAccessChecked.current = true;
    
    try {
      const { data, error } = await supabase.rpc('can_access_happy_check', { p_company_id: companyId })
      
      if (error) {
        setCanAccessHappyCheck(false);
        return;
      }
      
      if (data === null || data === undefined) {
        setCanAccessHappyCheck(false);
        return;
      }
      
      let hasAccess = false;
      
      if (typeof data === 'boolean') {
        hasAccess = data;
      } else if (typeof data === 'string') {
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        hasAccess = data === 1;
      } else if (typeof data === 'object' && data !== null) {
        hasAccess = data.result === true || data.result === 'true' || 
                   data.can_access === true || data.can_access === 'true' ||
                   data[0] === true || data[0] === 'true' ||
                   data === true;
      }
            
      setCanAccessHappyCheck(hasAccess);
      
    } catch (error) {
      console.error('Error checking happy check access:', error);
      setCanAccessHappyCheck(false);
    }
  }, [companyId]);

  // Demo expiration handler
  // Demo expiration handler
const handleDemoExpiration = useCallback(async () => {
  if (expirationHandledRef.current) return;
  expirationHandledRef.current = true;

  setIsDemoExpired(true);
  setIsDemoMode(false);
  setDemoTimeLeft(0);

  // Clear any saved demo info
  localStorage.removeItem('demo_start_time');
  localStorage.removeItem('demo_mode_active');

  // Log out the user if logged in
  if (user) {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Optional: redirect after demo expired
  if (companySlug === 'demo') {
    setTimeout(() => router.push(`/jobs/demo/feedback`), 2000);
  }
}, [user, companySlug, router]);

// Demo timer effect
useEffect(() => {
  if (companySlug !== 'demo') {
    // Not demo: clean up
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    setIsDemoMode(false);
    setIsDemoExpired(false);
    setDemoTimeLeft(null);
    return;
  }

  const DEMO_DURATION = 20 * 60 * 1000; // 20 minutes
  const DEMO_START_KEY = 'demo_start_time';

  // Initialize demo start time
  let demoStartTime = localStorage.getItem(DEMO_START_KEY);
  if (!demoStartTime) {
    demoStartTime = Date.now().toString();
    localStorage.setItem(DEMO_START_KEY, demoStartTime);
    localStorage.setItem('demo_mode_active', 'true');
  }

  const startTime = parseInt(demoStartTime, 10);
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
      clearInterval(demoTimerRef.current!);
      handleDemoExpiration();
      return;
    }

    setDemoTimeLeft(Math.ceil(currentRemaining / 1000));
  }, 1000);

  return () => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
  };
}, [companySlug, handleDemoExpiration]);


  // Auth handlers
  const handleLogin = useCallback(async () => {
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

  // Utility functions
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Effects
  useEffect(() => {
    if (companySlug === 'demo') {
      setLogin('demo@hrinno.hu');
      setPassword('demo');
    }
  }, [companySlug]);

  useEffect(() => {
    const DEMO_DURATION = 20 * 60 * 1000; // 20 minutes
    const DEMO_START_KEY = 'demo_start_time';
    const DEMO_MODE_KEY = 'demo_mode_active';

    const isDemoActive = companySlug === 'demo';

    if (isDemoActive) {
      let demoStartTime = localStorage.getItem(DEMO_START_KEY);
      if (!demoStartTime) {
        demoStartTime = Date.now().toString();
        localStorage.setItem(DEMO_START_KEY, demoStartTime);
        localStorage.setItem(DEMO_MODE_KEY, 'true');
      }

      const startTime = parseInt(demoStartTime, 10);
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

    } else {
      localStorage.removeItem(DEMO_START_KEY);
      localStorage.removeItem(DEMO_MODE_KEY);
      setIsDemoMode(false);
      setIsDemoExpired(false);
      setDemoTimeLeft(null);
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    }

    return () => {
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    };
  }, [companySlug, handleDemoExpiration]);

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

  useEffect(() => {
    if (companyId) {
      happyCheckAccessChecked.current = false;
      setCanAccessHappyCheck(null);
      checkHappyCheckAccess();
    }
  }, [companyId, checkHappyCheckAccess]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hrToolsMenuRef.current && !hrToolsMenuRef.current.contains(event.target as Node)) {
        setIsHRToolsMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    // State
    isLoginOpen, setIsLoginOpen,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isHRToolsMenuOpen, setIsHRToolsMenuOpen,
    isAccountMenuOpen, setIsAccountMenuOpen,
    isUserMenuOpen, setIsUserMenuOpen,
    login, setLogin,
    password, setPassword,
    user,
    error,
    companyLogo,
    companyId,
    companyForfait,
    canAccessHappyCheck,
    demoTimeLeft,
    isDemoMode,
    isDemoExpired,
    
    // Refs
    hrToolsMenuRef,
    accountMenuRef,
    userMenuRef,
    
    // Computed values
    companySlug,
    buildLink,
    
    // Functions
    handleLogin,
    handleLogout,
    formatTime,
  };
};
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
import pdfParse from 'pdf-parse';

process.env.DEBUG= 'false';
process.env.NODE_DEBUG = '';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Just parse the buffer without accessing filesystem
  const data = await pdfParse(buffer);
  return data.text;
}
```

---


## `./lib/parsePdfSafe.ts`

```ts
// lib/parsePdfSafe.ts

/**
 * Simple, reliable PDF parsing using pdf-parse with fallback
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  console.log("Starting PDF parsing, buffer size:", buffer.length);
  
  // Try pdf-parse first
  try {
    const pdfParse = (await import('pdf-parse')).default;
    
    // Simple timeout wrapper
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('PDF parsing timeout')), 15000);
    });
    
    const parsePromise = pdfParse(buffer);
    
    const pdfData = await Promise.race([parsePromise, timeoutPromise]);
    clearTimeout(timeoutId!);
    
    // Type the pdf-parse result properly
    const pdfResult = pdfData as { text: string; numpages: number };
    const extractedText = pdfResult.text?.trim() || '';
    
    if (extractedText.length > 0) {
      const limitedText = extractedText.length > 10000 
        ? extractedText.substring(0, 10000) + '...[truncated]'
        : extractedText;
        
      console.log(`pdf-parse successful - ${limitedText.length} characters`);
      return limitedText;
    }
    
    throw new Error("No text content found");

  } catch (error) {
    console.error('pdf-parse failed:', error);
    
    // Fallback: Manual text extraction
    try {
      const result = extractTextFromPdfBuffer(buffer);
      if (result.length > 20) {
        console.log(`Fallback extraction successful - ${result.length} characters`);
        return result;
      }
    } catch (fallbackError) {
      console.error('Fallback extraction failed:', fallbackError);
    }
    
    // Final fallback message
    return `CV téléchargé avec succès (${Math.round(buffer.length / 1024)} Ko)

⚠️ Extraction automatique du texte indisponible

Le fichier PDF a été sauvegardé et est accessible à l'équipe de recrutement.

Solutions pour le candidat:
• Télécharger le CV au format .txt ou .docx
• Copier-coller le contenu dans le formulaire
• Ajouter les informations clés dans la description

Statut: Fichier uploadé ✓ Sauvegardé ✓ Prêt pour révision manuelle ✓`;
  }
}

/**
 * Manual PDF text extraction fallback
 */
function extractTextFromPdfBuffer(buffer: Buffer): string {
  const pdfContent = buffer.toString('binary');
  let extractedText = '';
  
  // Look for text objects (fixed regex for older ES versions)
  const textRegex = /BT\s+([\s\S]*?)\s+ET/g;
  const matches = pdfContent.match(textRegex);
  
  if (matches) {
    for (const match of matches) {
      // Extract text from Tj operations
      const tjRegex = /\((.*?)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(match)) !== null) {
        const text = tjMatch[1]
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .trim();
        if (text.length > 1) {
          extractedText += text + ' ';
        }
      }
    }
  }
  
  // Clean up
  extractedText = extractedText
    .replace(/\s+/g, ' ')
    .trim();
  
  // If manual extraction fails, try basic ASCII
  if (extractedText.length < 20) {
    const asciiText = buffer
      .toString('utf8')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (asciiText.length > 50) {
      return asciiText.substring(0, 3000);
    }
  }
  
  return extractedText;
}

export default parsePdfBuffer;
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
   serverExternalPackages: ['pdf-parse'],
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
    "postinstall": "patch-package",
    "lint": "next lint"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@stripe/react-stripe-js": "^4.0.2",
    "@stripe/stripe-js": "^7.9.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/supabase-js": "^2.53.0",
    "@vercel/analytics": "^1.5.0",
    "@vercel/speed-insights": "^1.2.0",
    "canvas": "^3.2.0",
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
    "stripe": "^18.5.0",
    "tailwind-merge": "^3.3.1",
    "tesseract.js": "^6.0.1",
    "tesseract.js-node": "^0.1.0",
    "uuid": "^13.0.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/pdf-parse": "^1.1.5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/stripe-v3": "^3.1.33",
    "@types/tesseract.js": "^0.0.2",
    "@types/uuid": "^10.0.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "postcss": "^8.5.6",
    "snyk": "^1.1299.0",
    "tailwindcss": "^4.1.13",
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
import { Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown, User, LogOut, Clock, CreditCard } from 'lucide-react';

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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
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
  const accountMenuRef = useRef<HTMLDivElement>(null);
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
    if (!companySlug) return '/404'; // Not possible to not have slug
      if (basePath === '/') return `/jobs/${companySlug}${query}`;
      return `/jobs/${companySlug}${basePath}${query}`;
    
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
  const manageSubscriptionLink = useMemo(() => buildLink('/subscription'), [buildLink]);

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
      } 
    }, 2000); // Reduced to 3 seconds for better UX
  }, [user, companySlug, router]);

  // Demo timer effect - Demo duration
  useEffect(() => {
  const DEMO_DURATION = 20 * 60 * 1000; // 20 minutes
  const DEMO_START_KEY = 'demo_start_time';
  const DEMO_MODE_KEY = 'demo_mode_active';

  // Mode demo uniquement si le slug est "demo"
  const isDemoActive = companySlug === 'demo';

  if (isDemoActive) {
    // Activer la demo et initialiser le timer si pas déjà fait
    let demoStartTime = localStorage.getItem(DEMO_START_KEY);
    if (!demoStartTime) {
      demoStartTime = Date.now().toString();
      localStorage.setItem(DEMO_START_KEY, demoStartTime);
      localStorage.setItem(DEMO_MODE_KEY, 'true');
    }

    const startTime = parseInt(demoStartTime, 10);
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

  } else {
    // Mode normal : on désactive tout
    localStorage.removeItem(DEMO_START_KEY);
    localStorage.removeItem(DEMO_MODE_KEY);
    setIsDemoMode(false);
    setIsDemoExpired(false);
    setDemoTimeLeft(null);
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
  }

  // Nettoyage de l'interval
  return () => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
  };
}, [companySlug, handleDemoExpiration]);


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
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
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

              {/* New Manage Account Menu */}
              {user && companySlug !== 'demo' && (
                <div className="relative" ref={accountMenuRef}>
                  {isDemoExpired ? (
                    <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                      <User className="w-4 h-4" /> Manage Account
                      <ChevronDown className="w-3 h-3" />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Demo expired - Contact us to continue
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700`}>
                        <User className="w-4 h-4" /> Manage Account
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isAccountMenuOpen && (
                        <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Account Management</p>
                          </div>

                          <Link 
                            href={manageSubscriptionLink} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <CreditCard className="w-4 h-4" /> Manage Subscription
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
                  
                  {/* Account Management Section for Mobile */}
                  {companySlug !== 'demo' && (
                    <>
                      <div className="px-4 py-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Management</p>
                      </div>

                      <DemoAwareMenuItem 
                        href={manageSubscriptionLink} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full justify-start`}
                        isDemoExpired={isDemoExpired}
                      >
                        <CreditCard className="w-4 h-4" /> Manage Subscription
                      </DemoAwareMenuItem>
                    </>
                  )}
                  
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
      </div>
    </div>
  )
}
```

---


## `./src/app/api/analyse-cv/route.ts`

```ts
  // src/app/api/analyse-cv/route.ts
  export const runtime = "nodejs";
  import { NextRequest, NextResponse } from 'next/server';
  import parsePdfBuffer from '../../../../lib/parsePdfSafe';
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
      //console.log(`Making API call for ${context} with model ${model}...`);

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
     // console.log(`API response for ${context} (status: ${response.status}):`, responseText.substring(0, 500) + '...');

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
     // console.log(`Making fallback API call for ${context} with Claude Haiku...`);
      
      // Try Claude Haiku first (fast and reliable)
      return await callOpenRouterAPI(prompt, context, 'anthropic/claude-3-haiku');
    } catch {
     // console.log(`Claude Haiku failed, trying Mistral Small for ${context}...`);
      
      // Then try Mistral Small (faster than 7b-instruct)
      return await callOpenRouterAPI(prompt, context, 'mistralai/mistral-small');
    }
  }

  // Robust JSON extraction
  function extractAndParseJSON(rawResponse: string, context = '') {
    const trimmed = rawResponse.trim();
    //console.log("Raw AI answer", rawResponse)
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

    // Convert File to Buffer (parsePdfBuffer expects Buffer, not Uint8Array)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF - use the correct function name and parameter type
    const fullCvText = await parsePdfBuffer(buffer);
    console.log("Parsed CV length:", fullCvText.length);
    
    // Optimize PDF text length for faster processing
    const MAX_CV_LENGTH = 8000;
    const cvText = fullCvText.length > MAX_CV_LENGTH 
      ? fullCvText.substring(0, MAX_CV_LENGTH) + '...[truncated]'
      : fullCvText;

    // Start file upload in parallel
    const safeFileName = sanitizeFileName(file.name);
    const filePath = `cvs/${Date.now()}_${safeFileName}`;
    
    // Upload the buffer, not uint8Array
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
    "analysis": "brief analysis focusing on key strengths, gaps, and fit assessment. Please finish by 3 key questions that the recruiter should ask during the first interview to confirm the match between the candidate and the position",
    "candidat_firstname": "string",
    "candidat_lastname": "string",
    "candidat_email": "string", 
    "candidat_phone": "string"
  }

  Be critical in scoring. Missing core requirements should significantly lower the score.
  Analysis should be in perfect English
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
      //console.log('Starting parallel AI analysis...');
      
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

      //console.log('Both AI analyses completed');

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
          candidat_next_step: score < 5 ? "1" : "0",  // 👈 add this line
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

Please finish your analisis with 3 key questions that the recruiter should ask during the first interview to confirm the match between the candidate and the position

Répond uniquement avec un JSON strictement valide, au format :
{
  "score": number,
  "analysis": string
}
IMPORTANT : Ne réponds avec rien d'autre que ce JSON.

Analysis should be in perfect English.

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


## `./src/app/api/notifications/email/route.ts`

```ts
// app/api/notifications/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email templates
const emailTemplates = {
  newTicket: {
    subject: 'New Support Ticket Created - #{ticketId}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">New Support Ticket</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">{{title}}</h2>
          <p style="color: #475569;"><strong>From:</strong> {{userEmail}} ({{userName}})</p>
          <p style="color: #475569;"><strong>Priority:</strong> {{priority}}</p>
          <p style="color: #475569;"><strong>Category:</strong> {{category}}</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <p style="color: #374151; margin: 0;">{{description}}</p>
          </div>
          <a href="{{ticketUrl}}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Ticket
          </a>
        </div>
      </div>
    `
  },
  newMessage: {
    subject: 'New Reply on Ticket #{ticketId} - {{title}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">New Message</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">{{title}}</h2>
          <p style="color: #475569;"><strong>From:</strong> {{senderName}} ({{senderType}})</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
            <p style="color: #374151; margin: 0; white-space: pre-wrap;">{{message}}</p>
          </div>
          <a href="{{ticketUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Conversation
          </a>
        </div>
      </div>
    `
  },
  statusUpdate: {
    subject: 'Ticket Status Updated - #{ticketId}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #3b82f6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Ticket Status Update</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">{{title}}</h2>
          <p style="color: #475569;">Your ticket status has been updated:</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; text-align: center;">
            <p style="color: #374151; margin: 0; font-size: 18px; font-weight: bold;">{{status}}</p>
          </div>
          <a href="{{ticketUrl}}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Ticket
          </a>
        </div>
      </div>
    `
  }
};

// Mock email service
async function sendEmail(to: string, subject: string, html: string) {
  console.log('Sending email:', { to, subject, html });
  return { success: true };
}

export async function POST(req: NextRequest) {
  try {
    const { type, recipientEmail, ticketData, messageData, companySlug } = await req.json();

    if (!type || !recipientEmail || !ticketData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/tickets/${ticketData.id}`;

    let template;
    let replacements: Record<string, string> = {};

    switch (type) {
      case 'new_ticket':
        template = emailTemplates.newTicket;
        replacements = {
          ticketId: ticketData.id,
          title: ticketData.title,
          userEmail: ticketData.user_email,
          userName: ticketData.user_name,
          priority: ticketData.priority,
          category: ticketData.category || 'General',
          description: ticketData.description,
          ticketUrl
        };
        break;

      case 'new_message':
        template = emailTemplates.newMessage;
        replacements = {
          ticketId: ticketData.id,
          title: ticketData.title,
          senderName: messageData.sender_name,
          senderType: messageData.sender_type === 'admin' ? 'Support Team' : 'User',
          message: messageData.message,
          ticketUrl
        };
        break;

      case 'status_update':
        template = emailTemplates.statusUpdate;
        replacements = {
          ticketId: ticketData.id,
          title: ticketData.title,
          status: ticketData.status.replace('_', ' ').toUpperCase(),
          ticketUrl
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Replace template variables
    let subject = template.subject;
    let html = template.html;
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
    });

    await sendEmail(recipientEmail, subject, html);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send email notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---


## `./src/app/api/notifications/email/types.ts`

```ts
// app/types.ts

export interface TicketData {
  id: string;
  title: string;
  user_email: string;
  user_name: string;
  priority: string;
  category?: string;
  description: string;
  status?: string;
}

export interface MessageData {
  sender_name: string;
  sender_type: 'user' | 'admin';
  message: string;
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


## `./src/app/api/stripe/create-portal-session/route.ts`

```ts
import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { company_id, return_url } = await request.json()

    if (!company_id) return NextResponse.json({ error: "Missing company_id" }, { status: 400 })

    console.log("create-portal-session company_id:", company_id, "return_url:", return_url)

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    )

    // Load company
    const { data: company, error: companyError } = await supabase
      .from("company")
      .select("stripe_customer_id")
      .eq("id", company_id)
      .single()

    if (companyError || !company) {
      console.error("Supabase error:", companyError)
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (!company.stripe_customer_id) {
      return NextResponse.json({ error: "Company does not have a Stripe customer ID" }, { status: 400 })
    }

    // Create Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: return_url || process.env.NEXT_PUBLIC_APP_ORIGIN || "https://yourapp.com",
    })

    console.log("Stripe portal session created:", session.id)
    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
  console.error("Stripe portal error:", err)

  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  return NextResponse.json({ error: "Unknown error" }, { status: 400 })
}
}
```

---


## `./src/app/api/stripe/create-subscription/route.ts`

```ts
// api/stripe/create-subscription/route.ts
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { company_id, price_id, return_url } = await req.json()

    if (!company_id || !price_id || !return_url) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Fetch company and create Stripe customer if needed
    const { data: company } = await supabase
      .from('company')
      .select('stripe_customer_id')
      .eq('id', company_id)
      .single()

    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    let customerId = company.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { company_id } })
      customerId = customer.id
      await supabase.from('company').update({ stripe_customer_id: customerId }).eq('id', company_id)
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${return_url}${return_url.includes('?') ? '&' : '?'}success=true`,
      cancel_url: `${return_url}${return_url.includes('?') ? '&' : '?'}canceled=true`,
      metadata: {
      company_id: company_id.toString(),
  }
    })

    //return NextResponse.json({ url: session.url })
    return NextResponse.json({ sessionId: session.id })
  } catch (err: unknown) {
    console.error("Stripe checkout creation error:", err)

    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
```

---


## `./src/app/api/stripe/prices/route.ts`

```ts
import Stripe from "stripe"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const runtime = "nodejs"

export async function GET() {
  try {
    const prices = await stripe.prices.list({ active: true, limit: 10, expand: ["data.product"] })

    const formatted = prices.data.map(p => ({
      id: p.id,
      name: (p.product as Stripe.Product).name,
      price: p.unit_amount ?? 0,
    }))

    return NextResponse.json({ prices: formatted })
 } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 })
  }
}
```

---


## `./src/app/api/stripe/subscription-cancel/route.ts`

```ts
import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { company_id } = await req.json()
  if (!company_id) return NextResponse.json({ error: "Missing company_id" }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1) Get the company's current subscription
  const { data: company } = await supabase
    .from("company")
    .select("stripe_subscription_id")
    .eq("id", company_id)
    .single()

  if (!company?.stripe_subscription_id) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
  }

  // 2) Cancel the subscription immediately
  try {
    const canceledSubscription = await stripe.subscriptions.cancel(company.stripe_subscription_id)

    // 3) Update Supabase
    await supabase.from("company").update({
      stripe_subscription_id: null,
      forfait: null,
    }).eq("id", company_id)

    return NextResponse.json({
      canceled: true,
      canceled_at: canceledSubscription.canceled_at,
    })
  } catch (err: unknown) {
  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
}
}
```

---


## `./src/app/api/stripe/subscription/route.ts`

```ts
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const company_id = url.searchParams.get("company_id")
    
    if (!company_id) {
      return NextResponse.json({ error: "Missing company_id" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: company, error: supabaseError } = await supabase
      .from("company")
      .select("forfait, stripe_subscription_id")
      .eq("id", company_id)
      .single()

    if (supabaseError) {
      console.error("Supabase error:", supabaseError)
      return NextResponse.json({ error: supabaseError.message }, { status: 500 })
    }

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    let status: "Active" | "Pending" | "Inactive" = "Inactive"

    if (company.forfait) {
      status = company.stripe_subscription_id ? "Active" : "Pending"
    }

    return NextResponse.json({
      subscription: {
        plan: company.forfait || "None",
        status,
      }
    })

  } catch (error) {
    console.error("Unexpected error in subscription endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
```

---


## `./src/app/api/stripe/webhook/route.ts`

```ts
// app/api/stripe/webhook/route.ts

import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("❌ Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  console.error("❌ Webhook signature verification failed with unknown error:", err)
  return NextResponse.json({ error: "Webhook Error: Unknown error" }, { status: 400 })
}

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ✅ Handle checkout completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const subscriptionId = session.subscription as string
    const customerId = session.customer as string
    const companyId = session.metadata?.company_id

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0].price.id

    const { data: forfait } = await supabase
      .from("forfait")
      .select("id, forfait_name")
      .eq("stripe_price_id", priceId)
      .single()

    if (companyId && forfait) {
      await supabase
        .from("company")
        .update({
          forfait: forfait.forfait_name,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
        })
        .eq("id", companyId)

      console.log(`✅ Company ${companyId} subscribed to ${forfait.forfait_name}`)
    }
  }

  // ✅ Handle successful payments
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null
    }

    if (!invoice.subscription) {
      console.log("ℹ️ Invoice without subscription, skipping")
      return NextResponse.json({ received: true })
    }

    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription.id

    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id

    if (!customerId) {
      console.log("ℹ️ No customer found for invoice")
      return NextResponse.json({ received: true })
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0].price.id

    // Find company via Stripe customer metadata or DB
    let companyId: string | null = null
    const customer = await stripe.customers.retrieve(customerId)

    if (!customer.deleted) {
      companyId = customer.metadata?.company_id || null
    }

    if (!companyId) {
      const { data: company } = await supabase
        .from("company")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (company) companyId = company.id.toString()
    }

    // Find plan by Stripe price_id
    const { data: forfait } = await supabase
      .from("forfait")
      .select("forfait_name")
      .eq("stripe_price_id", priceId)
      .single()

    if (companyId && forfait) {
      await supabase
        .from("company")
        .update({
          forfait: forfait.forfait_name,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
        })
        .eq("id", companyId)

      console.log(`✅ Updated company ${companyId} to plan: ${forfait.forfait_name}`)
    }
  }

  // ✅ Handle failed payments → reset to Free
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice

    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id

    if (!customerId) return NextResponse.json({ received: true })

    const customer = await stripe.customers.retrieve(customerId)

    let companyId: string | null = null
    if (!customer.deleted) {
      companyId = customer.metadata?.company_id || null
    }

    if (!companyId) {
      const { data: company } = await supabase
        .from("company")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (company) companyId = company.id.toString()
    }

    if (companyId) {
      await supabase
        .from("company")
        .update({ forfait: "Free" })
        .eq("id", companyId)

      console.log(`⚠️ Reset company ${companyId} to Free due to payment failure`)
    }
  }

  return NextResponse.json({ received: true })
}
```

---


## `./src/app/api/tickets/upload/route.ts`

```ts
// app/api/tickets/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CompanyUser {
  user_id: string;
}

interface Ticket {
  id: string;
  user_id: string;
  company: {
    company_to_users: CompanyUser[];
  };
}

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const ticketId = formData.get('ticketId') as string;

    if (!file || !ticketId) {
      return NextResponse.json({ error: 'Missing file or ticketId' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Verify user has access to this ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        company:company_id(
          company_to_users(user_id)
        )
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user has access to this ticket
    const hasAccess = ticket.user_id === user.id || 
    ticket.company.company_to_users.some((cu: CompanyUser) => cu.user_id === user.id);


    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate unique filename
    const fileName = `${user.id}/${ticketId}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // Save attachment record to database
    const { data: attachmentData, error: dbError } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('ticket-attachments')
        .remove([uploadData.path]);
      throw dbError;
    }

    return NextResponse.json({ 
      success: true, 
      attachment: attachmentData 
    });

  } catch (error: unknown) {
    console.error('File upload error:', error);
    return NextResponse.json(
       { error: error instanceof Error ? error.message : 'Failed to upload file' },
       { status: 500 }
    );
  }
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


## `./src/app/api/users-creation/route.ts`

```ts
// app/api/users-creation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, companyId } = body;

    // 1️⃣ Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user account');
    }

    const userId = authData.user.id;

    // 2️⃣ Insert into users table
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      user_firstname: firstName,
      user_lastname: lastName,
      is_admin: false,
    });

    if (userError) {
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(userError.message || 'Failed to create user profile');
    }

    // 3️⃣ Link user to company
    const { error: linkError } = await supabase.from('company_to_users').insert({
      user_id: userId,
      company_id: parseInt(companyId, 10),
    });

    if (linkError) {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('users').delete().eq('id', userId);
      throw new Error(linkError.message || 'Failed to link user to company');
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: unknown) {
    console.error('Error creating user:', err);

    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 400 });
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
    //console.log('Fetching position data for:', { positionId, companySlug });

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

    //console.log('Raw position data:', position);

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
import { Users, FileText, Mail, Phone, Edit3, Save, XCircle, Eye, EyeOff, Workflow, Check } from 'lucide-react'

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

function Card({ 
  row, 
  onClick, 
  isSelected, 
  onToggleSelection 
}: { 
  row: Row
  onClick: (row: Row) => void
  isSelected: boolean
  onToggleSelection: (candidateId: number, event: React.MouseEvent) => void
}) {
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

  // Modify styling for selected cards
  const cardClasses = `
    ${scoreColors.bg} rounded-lg shadow-sm border 
    ${isSelected 
      ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
      : scoreColors.border
    } 
    p-3 cursor-pointer hover:shadow-md transition-all select-none mb-2 group touch-manipulation relative
  `

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        if (!isDragging) {
          // Check if Ctrl (Windows) or Cmd (Mac) is pressed
          if (e.ctrlKey || e.metaKey) {
            onToggleSelection(row.candidat_id, e)
          } else {
            onClick(row)
          }
        }
      }}
      className={cardClasses}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div>
          <p className={`font-medium ${isSelected ? 'text-blue-800' : scoreColors.text} text-sm leading-tight`}>
            {row.candidats?.candidat_firstname ?? '—'} {row.candidats?.candidat_lastname ?? ''}
          </p>
          <p className="text-xs text-gray-500">ID: {row.candidat_id}</p>
        </div>
        {row.candidat_score !== null && (
          <span className={`${getScoreBadgeColor(row.candidat_score)} text-xs px-2 py-1 rounded-full font-medium ${isSelected ? 'ml-6' : ''}`}>
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
  showRejected = true,
  selectedCandidates,
  onToggleSelection,
  onSelectAll,
  onDeselectAll
}: { 
  columnId: string
  columnName: string
  rows: Row[]
  onCardClick: (row: Row) => void
  isRejectedColumn?: boolean
  showRejected?: boolean
  selectedCandidates: Set<number>
  onToggleSelection: (candidateId: number, event: React.MouseEvent) => void
  onSelectAll: (columnId: string) => void
  onDeselectAll: (columnId: string) => void
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

  // Count selected candidates in this column
  const selectedInColumn = displayRows.filter(row => selectedCandidates.has(row.candidat_id)).length
  const allSelected = displayRows.length > 0 && selectedInColumn === displayRows.length
  const someSelected = selectedInColumn > 0 && selectedInColumn < displayRows.length

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
        <div className="flex items-center gap-2">
          <span className={`${badgeBg} text-xs px-2 py-1 rounded-full font-medium`}>
            {actualCount}
          </span>
          {selectedInColumn > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {selectedInColumn} selected
            </span>
          )}
        </div>
      </div>

      {/* Column selection controls */}
      {displayRows.length > 0 && (
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => onSelectAll(columnId)}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            disabled={allSelected}
          >
            All
          </button>
          <button
            onClick={() => onDeselectAll(columnId)}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            disabled={selectedInColumn === 0}
          >
            None
          </button>
        </div>
      )}
      
      <div className="flex-1 min-h-[300px]">
        <SortableContext items={displayRows.map(r => r.candidat_id.toString())} strategy={verticalListSortingStrategy}>
          {displayRows.map(row => (
            <Card 
              key={row.candidat_id} 
              row={row} 
              onClick={onCardClick}
              isSelected={selectedCandidates.has(row.candidat_id)}
              onToggleSelection={onToggleSelection}
            />
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

  // NEW: Multi-selection state
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set())
  const [draggingMultiple, setDraggingMultiple] = useState<Row[]>([])

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

  // NEW: Multi-selection handlers
  const handleToggleSelection = (candidateId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedCandidates(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(candidateId)) {
        newSelection.delete(candidateId)
      } else {
        newSelection.add(candidateId)
      }
      return newSelection
    })
  }

  const handleSelectAllInColumn = (columnId: string) => {
    const columnRows = columnId === 'unassigned' 
      ? getRowsByStepId('unassigned')
      : getRowsByStepId(columnId)
    
    setSelectedCandidates(prev => {
      const newSelection = new Set(prev)
      columnRows.forEach(row => newSelection.add(row.candidat_id))
      return newSelection
    })
  }

  const handleDeselectAllInColumn = (columnId: string) => {
    const columnRows = columnId === 'unassigned' 
      ? getRowsByStepId('unassigned')
      : getRowsByStepId(columnId)
    
    setSelectedCandidates(prev => {
      const newSelection = new Set(prev)
      columnRows.forEach(row => newSelection.delete(row.candidat_id))
      return newSelection
    })
  }

  const clearAllSelections = () => {
    setSelectedCandidates(new Set())
  }

  // NEW: Handle batch step changes for multiple candidates
  const handleBatchStepChange = async (candidateIds: number[], step_id: string | null) => {
    const originalRows = [...rows]
    
    // Optimistically update UI for all selected candidates
    setRows(prev =>
      prev.map(r => candidateIds.includes(r.candidat_id) ? { 
        ...r, 
        candidat_next_step: step_id === 'unassigned' || step_id === null ? null : step_id 
      } : r)
    )

    try {
      // Make API calls for each candidate (you might want to create a batch API endpoint)
      await Promise.all(candidateIds.map(candidateId => 
        fetch('/api/update-next-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            candidat_id: candidateId, 
            step_id: step_id === 'unassigned' || step_id === null ? null : Number(step_id)
          }),
        })
      ))

      // Clear selections after successful batch update
      setSelectedCandidates(new Set())
    } catch (err) {
      console.error('Error updating steps:', err)
      setRows(originalRows)
      alert("Erreur lors de la mise à jour des étapes")
    }
  }

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

  // Comment update handler (unchanged)
  const handleCommentUpdate = async () => {
    if (!selectedCandidate) return
    
    setIsSavingComment(true)
    const originalRows = [...rows]
    
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
      setRows(originalRows)
      setSelectedCandidate(originalRows.find(r => r.candidat_id === selectedCandidate.candidat_id) || null)
      alert("Erreur lors de la mise à jour du commentaire")
    } finally {
      setIsSavingComment(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedCandidateId = Number(active.id)
    const row = rows.find(r => r.candidat_id === draggedCandidateId) || null
    
    // NEW: Check if dragging a selected candidate or multiple candidates
    if (selectedCandidates.has(draggedCandidateId) && selectedCandidates.size > 1) {
      // Multi-drag: get all selected rows
      const selectedRows = rows.filter(r => selectedCandidates.has(r.candidat_id))
      setDraggingMultiple(selectedRows)
      setDraggingRow(row) // Keep the main dragged row for overlay
    } else {
      // Single drag: clear selections and drag only this card
      setSelectedCandidates(new Set())
      setDraggingMultiple([])
      setDraggingRow(row)
    }
    
    setIsDragging(true)
    
    const scrollElement = document.querySelector('#scroll-container') as HTMLElement
    if (scrollElement) {
      setScrollContainer(scrollElement)
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
    const multiDragActive = draggingMultiple.length > 0
    
    setDraggingRow(null)
    setDraggingMultiple([])
    setIsDragging(false)
    clearAutoScroll()
    
    if (scrollContainer) {
      scrollContainer.style.overflowX = 'auto'
      scrollContainer.style.touchAction = 'auto'
      setScrollContainer(null)
    }
    
    const { active, over } = event
    if (!over || !active) return

    const targetColumnId = findColumnForElement(over.id as string)
    if (targetColumnId === null) return

    const newStepId: string | null = targetColumnId === 'unassigned' ? null : targetColumnId
    
    if (multiDragActive) {
      // NEW: Handle multiple candidates drag
      const candidateIds = draggingMultiple.map(r => r.candidat_id)
      
      // Check if any candidate needs to be moved
      const needsUpdate = draggingMultiple.some(row => row.candidat_next_step !== newStepId)
      
      if (needsUpdate) {
        handleBatchStepChange(candidateIds, newStepId)
      }
    } else {
      // Handle single candidate drag
      const activeId = Number(active.id)
      const currentRow = rows.find(r => r.candidat_id === activeId)
      if (!currentRow) return

      if (currentRow.candidat_next_step !== newStepId) {
        handleStepChange(activeId, newStepId)
      }
    }
  }

  const getRowsByStepId = (stepId: string | null) => {
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
    // Clear selections when opening modal to avoid confusion
    setSelectedCandidates(new Set())
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

  const isRejectedCandidate = (row: Row) => {
    return String(row.candidat_next_step) === '1'
  }

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
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your candidates by dragging cards between steps. Hold Ctrl/Cmd + click to select multiple.</p>
                </div>
              </div>

              {/* Candidates count and controls */}
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold text-lg">{showRejected ? rows.length : nonRejectedCandidatesCount}</span>
                  <span>candidates</span>
                  {!showRejected && rejectedCandidatesCount > 0 && (
                    <span className="text-blue-100 text-sm">({rejectedCandidatesCount} hidden)</span>
                  )}
                </div>

                {/* NEW: Selection info and clear button */}
                {selectedCandidates.size > 0 && (
                  <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">{selectedCandidates.size} selected</span>
                    <button
                      onClick={clearAllSelections}
                      className="ml-2 text-blue-200 hover:text-white transition-colors"
                      title="Clear selection"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
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
                  selectedCandidates={selectedCandidates}
                  onToggleSelection={handleToggleSelection}
                  onSelectAll={handleSelectAllInColumn}
                  onDeselectAll={handleDeselectAllInColumn}
                />
              )
            })}
          </div>

          <DragOverlay>
            {draggingRow && (
              <div className="relative">
                {/* Main dragging card */}
                <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 p-3 cursor-grabbing w-72 transform rotate-3 z-50">
                  <p className="font-medium text-gray-800 text-sm">
                    {draggingRow.candidats?.candidat_firstname} #{draggingRow.candidat_id}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Score: {draggingRow.candidat_score ?? '—'}</p>
                </div>
                
                {/* NEW: Multi-drag indicator */}
                {draggingMultiple.length > 1 && (
                  <>
                    {/* Shadow cards to show multiple items being dragged */}
                    <div className="absolute top-1 left-1 bg-blue-100 rounded-lg shadow-md border border-blue-200 p-3 w-72 transform rotate-2 -z-10">
                      <div className="h-4 bg-blue-200 rounded mb-2"></div>
                      <div className="h-3 bg-blue-150 rounded"></div>
                    </div>
                    <div className="absolute top-2 left-2 bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-3 w-72 transform rotate-1 -z-20">
                      <div className="h-4 bg-blue-100 rounded mb-2"></div>
                      <div className="h-3 bg-blue-75 rounded"></div>
                    </div>
                    
                    {/* Counter badge */}
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-60">
                      {draggingMultiple.length}
                    </div>
                  </>
                )}
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

      {/* Small stylesheet to improve scrollbar appearance */}
      <style>{`
        #scroll-container::-webkit-scrollbar { height: 10px; }
        #scroll-container::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.6); border-radius: 6px; }
        #scroll-container::-webkit-scrollbar-track { background: rgba(229,231,235,0.4); }
        #scroll-container { scrollbar-gutter: stable; }
        
        /* Animation for selected cards */
        .animate-pulse-blue {
          animation: pulse-blue 2s infinite;
        }
        
        @keyframes pulse-blue {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  )
}
```

---


## `./src/app/jobs/[slug]/stats/page.tsx`

```tsx
import { createServerClient } from '../../../../../lib/supabaseServerClient'
//import StatsTable from './StatsTable'
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


## `./src/app/jobs/[slug]/subscription/page.tsx`

```tsx
'use client'

import { useEffect, useState, useCallback } from "react"
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@supabase/auth-helpers-react'
import { useSearchParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Check, X, Star, Zap, Shield, Crown } from 'lucide-react'
import { loadStripe } from "@stripe/stripe-js"


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Plan = { 
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  priceId?: string | null
}

type Subscription = { 
  plan: string
  status: string 
}

type Toast = { 
  id: string
  message: string
  type: 'success' | 'error' 
}

// Define proper types for database objects
interface ForfaitData {
  id: number
  forfait_name?: string
  description?: string
  max_opened_position?: number
  max_medical_certificates?: number
  access_happy_check?: boolean
  stripe_price_id?: string | null
}

interface StripePriceData {
  id: string
  name: string
  price?: number
}

export default function ManageSubscription() {
  const session = useSession()
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

  const addToast = (message: string, type: 'success' | 'error' = 'error') => {
    const id = uuidv4()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  const fetchUserCompanyId = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', userId)
        .single()
      
      if (error || !data?.company_id) {
        addToast("Failed to fetch company information.")
        return
      }

      setCompanyId(data.company_id.toString())

      const { data: companyData, error: compErr } = await supabase
        .from('company')
        .select('forfait')
        .eq('id', data.company_id)
        .single()

      if (compErr) {
        addToast('Failed to fetch company details')
        return
      }

      if (companyData?.forfait) setCurrentPlan(companyData.forfait)
    } catch (err) {
      console.error('Error fetching company ID:', err)
      addToast("Unexpected error fetching company information.")
    } finally {
      setLoadingSubscription(false)
    }
  }, [])

  const getCompanyIdFromUrl = useCallback(() => {
    const companyIdParam = searchParams.get('company_id')
    if (companyIdParam) return companyIdParam
    
    const pathname = window.location.pathname
    const companyMatch = pathname.match(/\/company\/(\d+)\//)
    if (companyMatch) return companyMatch[1]
    
    return null
  }, [searchParams])

  const fetchCompanyDetails = useCallback(async (companyId: string) => {
    try {
      const { data: companyData, error: compErr } = await supabase
        .from('company')
        .select('forfait')
        .eq('id', companyId)
        .single()

      if (compErr) {
        addToast('Failed to fetch company details')
        return
      }

      if (companyData?.forfait) setCurrentPlan(companyData.forfait)
    } catch (err) {
      console.error('Error fetching company details:', err)
      addToast("Unexpected error fetching company information.")
    } finally {
      setLoadingSubscription(false)
    }
  }, [])

  const generateDescription = (forfait: ForfaitData) => {
    const features: string[] = []
    if (forfait.max_opened_position) features.push(`${forfait.max_opened_position} positions`)
    if (forfait.max_medical_certificates) features.push(`${forfait.max_medical_certificates} certificates`)
    if (forfait.access_happy_check) features.push('Happy Check access')
    return features.length > 0 ? `Perfect for businesses needing ${features.join(', ')}` : 'A great plan for your business needs'
  }

  const generateFeatures = (forfait: ForfaitData) => {
    const features: string[] = []
    if (forfait.max_opened_position) features.push(forfait.max_opened_position === 999999 ? 'Unlimited open positions' : `Up to ${forfait.max_opened_position} open positions`)
    if (forfait.max_medical_certificates) features.push(forfait.max_medical_certificates === 999999 ? 'Unlimited medical certificates' : `Up to ${forfait.max_medical_certificates} medical certificates`)
    if (forfait.access_happy_check) features.push('Happy Check feature included')
    features.push('Email support', 'Basic analytics', 'Secure data storage')
    return features
  }

  const fetchStripePrices = useCallback(async (plansToUpdate: Plan[]) => {
    const paidPlans = plansToUpdate.filter(plan => plan.priceId !== null)
    
    if (paidPlans.length === 0) {
      // All plans are free, no need to call Stripe
      return
    }

    try {
      const res = await fetch('/api/stripe/prices')
      if (!res.ok) {
        addToast("Failed to load pricing from Stripe. Paid plans are temporarily unavailable.", "error")
        // Only show free plans when Stripe fails
        const freePlansOnly = plansToUpdate.filter(plan => plan.priceId === null)
        setPlans(freePlansOnly)
        return
      }
      
      const data = await res.json()
      if (!data.prices || !Array.isArray(data.prices)) {
        addToast("Invalid pricing data from Stripe. Paid plans are temporarily unavailable.", "error")
        // Only show free plans when Stripe data is invalid
        const freePlansOnly = plansToUpdate.filter(plan => plan.priceId === null)
        setPlans(freePlansOnly)
        return
      }

      let hasStripePricingIssues = false
      const updatedPlans = plansToUpdate
        .map(plan => {
          // If it's a free plan (no stripe_price_id), keep it as is
          if (plan.priceId === null) {
            return plan
          }
          
          // For paid plans, find the price in Stripe data
          const stripePrice = data.prices.find((p: StripePriceData) => p.id === plan.priceId)
          if (stripePrice && typeof stripePrice.price === 'number') {
            return { ...plan, price: stripePrice.price }
          } else {
            // Stripe price not found or invalid for this paid plan
            hasStripePricingIssues = true
            return null
          }
        })
        .filter(plan => plan !== null) as Plan[]

      if (hasStripePricingIssues) {
        addToast("Some paid plans are temporarily unavailable due to pricing issues.", "error")
      }
      
      setPlans(updatedPlans)
    } catch (err) {
      console.error("Error fetching Stripe prices:", err)
      addToast("Could not connect to Stripe. Paid plans are temporarily unavailable.", "error")
      // Only show free plans when Stripe connection fails
      const freePlansOnly = plansToUpdate.filter(plan => plan.priceId === null)
      setPlans(freePlansOnly)
    }
  }, [])

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true)
    try {
      const { data: forfaits, error } = await supabase
        .from('forfait')
        .select('*')
        .order('id')

      if (error) {
        addToast("Failed to fetch plans")
        return
      }

      if (forfaits) {
        const formattedPlans: Plan[] = forfaits.map((forfait: ForfaitData, index: number) => ({
          id: forfait.id?.toString() || `forfait_${forfait.id}`,
          name: forfait.forfait_name || `Plan ${forfait.id}`,
          price: 0, // Will be updated from Stripe for paid plans
          description: forfait.description || generateDescription(forfait),
          features: generateFeatures(forfait),
          popular: index === 1,
          priceId: forfait.stripe_price_id || null // Use stripe_price_id from database
        }))
        setPlans(formattedPlans)
        await fetchStripePrices(formattedPlans)
      }
    } catch (err) {
      console.error(err)
      addToast("Failed to fetch plans")
    } finally {
      setLoadingPlans(false)
    }
  }, [fetchStripePrices])

  const handleSubscribe = async (plan: Plan) => {
  if (!companyId) return addToast("Company information not available.", "error")

  if (plan.priceId === null) {
    addToast("This is a free plan. No subscription needed.", "success")
    return
  }

  if (plan.price === 0 && plan.priceId !== null) {
    addToast("This plan is temporarily unavailable due to pricing issues.", "error")
    return
  }

  try {
    const res = await fetch('/api/stripe/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: companyId,
        price_id: plan.priceId,
        return_url: window.location.origin // better than href
      }),
    })

    const data = await res.json()
    if (data.sessionId) {
      const stripe = await stripePromise
      if (!stripe) throw new Error("Stripe failed to load")
      await stripe.redirectToCheckout({ sessionId: data.sessionId })
    } else {
      addToast(data.error || "Unable to start checkout", "error")
    }
  } catch (err) {
    console.error(err)
    addToast("Unexpected error starting checkout", "error")
  }
}

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter': return <Zap className="w-8 h-8 text-blue-600" />
      case 'professional': return <Star className="w-8 h-8 text-purple-600" />
      case 'enterprise': return <Crown className="w-8 h-8 text-yellow-600" />
      default: return <Shield className="w-8 h-8 text-gray-600" />
    }
  }

  const formatPrice = (price: number) => price === 0 ? 'Free' : (price/100).toLocaleString()

  useEffect(() => {
    if (session?.user?.id) fetchUserCompanyId(session.user.id)
    else {
      const urlCompanyId = getCompanyIdFromUrl()
      if (urlCompanyId) fetchCompanyDetails(urlCompanyId)
      else setLoadingSubscription(false)
    }
    fetchPlans()
  }, [session?.user?.id, fetchUserCompanyId, getCompanyIdFromUrl, fetchCompanyDetails, fetchPlans])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Choose the perfect plan for your business needs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loadingSubscription ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-12 animate-pulse h-32" />
        ) : currentPlan ? (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg p-6 mb-12 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Current Subscription</h2>
                <p className="text-lg">
                  <span className="font-bold">{currentPlan}</span> Plan
                  <span className="ml-4 px-3 py-1 bg-white/20 rounded-full text-sm">Active</span>
                </p>
              </div>
              <Shield className="w-12 h-12 text-white/80" />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl shadow-lg p-6 mb-12 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
                <p className="text-lg">Choose a plan to get started</p>
              </div>
              <Shield className="w-12 h-12 text-white/80" />
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {loadingPlans ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse h-64" />)}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Available</h3>
              <p className="text-gray-600">Unable to load pricing information. Please try again later.</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.name.toLowerCase() === currentPlan?.toLowerCase() ? 'ring-2 ring-green-500 scale-105 bg-green-50' : ''}`}>
                {plan.name.toLowerCase() === currentPlan?.toLowerCase() && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-green-600 to-green-500 text-white px-4 py-1 text-sm font-semibold">Current Plan</div>
                )}
                <div className="p-8">
                  <div className="flex items-center mb-4">{getPlanIcon(plan.name)}<h3 className="text-2xl font-bold text-gray-900 ml-3">{plan.name}</h3></div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-8">
                    {plan.price === 0 ? <span className="text-4xl font-bold text-green-600">Free</span> : <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>}
                    {plan.price !== 0 && <span className="text-gray-600"> HUF/month</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => <li key={idx} className="flex items-center text-gray-700"><Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />{feature}</li>)}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      // Free plan button
                      plan.priceId === null 
                        ? 'bg-green-100 text-green-800 cursor-default' 
                        // Paid plan with pricing issues
                        : (plan.price === 0 && plan.priceId !== null)
                        ? 'bg-red-100 text-red-800 cursor-not-allowed'
                        // Current plan
                        : plan.name.toLowerCase() === currentPlan?.toLowerCase() 
                        ? 'bg-blue-100 text-blue-800' 
                        // Available paid plan
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                    disabled={plan.price === 0 && plan.priceId !== null}
                  >
                    {plan.priceId === null 
                      ? 'Free Plan' 
                      : (plan.price === 0 && plan.priceId !== null)
                      ? 'Temporarily Unavailable'
                      : plan.name.toLowerCase() === currentPlan?.toLowerCase()
                      ? 'Current Plan'
                      : `Subscribe to ${plan.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 flex flex-col gap-2 z-40">
        {toasts.map(t => (
          <div key={t.id} className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all ${t.type === 'error' ? 'bg-red-500' : 'bg-green-500'} animate-in slide-in-from-right`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---


## `./src/app/jobs/[slug]/tickets/[ticketId]/page.tsx`

```tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  User,
  Clock,
  Paperclip,
  Download,
  Settings,
  Building,
  MessageSquare,
  Shield
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TicketData {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  company_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  company: {
    company_name: string;
    slug: string;
  };
}

interface MessageData {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'admin';
  sender_id: string | null;
  sender_email: string | null;
  sender_name: string | null;
  message: string;
  created_at: string;
}

interface AttachmentData {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface UserData {
  auth_id: string;
  auth_email: string;
  user_firstname: string | null;
  user_lastname: string | null;
  is_admin: boolean;
  company: {
    id: string;
    slug: string;
    company_name: string;
  } | null;
  company_id: string;
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusButtonColors = {
  open: 'bg-blue-600 hover:bg-blue-700 text-white',
  in_progress: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  resolved: 'bg-green-600 hover:bg-green-700 text-white',
  closed: 'bg-gray-600 hover:bg-gray-700 text-white'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

export default function TicketDetailPage() {
  const params = useParams<{ slug: string; ticketId: string }>();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isHrinnoAdmin, setIsHrinnoAdmin] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCurrentUser = useCallback(async (): Promise<UserData | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${params.slug}/login`);
        return null;
      }
      
      console.log("Auth User:", user.id, user.email);
      
      // Debug: First check if the user exists in company_to_users table
      const { data: debugCompanyUser, error: debugError } = await supabase
        .from('company_to_users')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('Debug - Raw company_to_users data:', debugCompanyUser);
      console.log('Debug - company_to_users error:', debugError);
      
      // Alternative approach: Get company_to_users data first, then get company data separately
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_to_users')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
       
      if (companyUserError) {
        console.error('Company user error:', companyUserError);
        setError('User company association not found');
        return null;
      }

      if (!companyUserData) {
        console.error('No company association found for user:', user.id);
        setError('User is not associated with any company');
        return null;
      }

      console.log('Company user data:', companyUserData);

      // Get company data separately
      let companyData = null;
      if (companyUserData.company_id) {
        const { data: company, error: companyError } = await supabase
          .from('company')
          .select('id, slug, company_name')
          .eq('id', companyUserData.company_id)
          .single();
        
        if (companyError) {
          console.error('Company fetch error:', companyError);
          // Continue without company data - it's not critical for sending messages
        } else {
          companyData = company;
        }
      }

      // Then get the user profile data
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('users')
        .select('id, user_firstname, user_lastname, is_admin')
        .eq('id', user.id)
        .single();

      if (userProfileError) {
        console.error('User profile error:', userProfileError);
        setError('User profile not found');
        return null;
      }

      // Combine all user data
      const mergedUser: UserData = {
        auth_id: user.id,
        auth_email: user.email || '',
        user_firstname: userProfileData.user_firstname,
        user_lastname: userProfileData.user_lastname,
        is_admin: userProfileData.is_admin,
        company: companyData,
        company_id: companyUserData.company_id
      };

      console.log("Merged User Data:", mergedUser);
      
      setCurrentUser(mergedUser);
      
      // Fix the admin check - you mentioned 'innohr' not 'hrinno'
      setIsHrinnoAdmin(companyData?.slug === 'hrinno' || companyData?.slug === 'innohr');
      return mergedUser;
    } catch (err) {
      console.error('Failed to load user data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);
      return null;
    }
  }, [params.slug, router]);

  const fetchTicket = useCallback(async (): Promise<TicketData | null> => {
    try {
      const { data, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', params.ticketId)
        .maybeSingle();

      if (ticketError || !data) {
        setError('Ticket not found');
        return null;
      }

      setTicket(data as TicketData);
      return data as TicketData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load ticket';
      setError(errorMessage);
      return null;
    }
  }, [params.ticketId]);

  const fetchMessages = useCallback(async (): Promise<MessageData[] | null> => {
    try {
      const { data, error: messagesError } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', params.ticketId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(data || []);
      return data;
    } catch (err) {
      console.error('Failed to load messages:', err);
      return [];
    }
  }, [params.ticketId]);

  const fetchAttachments = useCallback(async (): Promise<AttachmentData[] | null> => {
    try {
      const { data, error: attachmentsError } = await supabase
        .from('ticket_attachments')
        .select('*')
        .eq('ticket_id', params.ticketId)
        .order('uploaded_at', { ascending: true });

      if (attachmentsError) throw attachmentsError;
      setAttachments(data || []);
      return data;
    } catch (err) {
      console.error('Failed to load attachments:', err);
      return [];
    }
  }, [params.ticketId]);

  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || !currentUser) {
      console.log("Cannot send message:", { 
        hasMessage: !!newMessage.trim(), 
        hasCurrentUser: !!currentUser 
      });
      return;
    }

    setSendingMessage(true);

    try {
      const senderName = `${currentUser.user_firstname || ''} ${currentUser.user_lastname || ''}`.trim();

      const messageData = {
        ticket_id: params.ticketId,
        sender_type: isHrinnoAdmin ? 'admin' as const : 'user' as const,
        sender_id: currentUser.auth_id,
        sender_email: currentUser.auth_email,
        sender_name: senderName || 'Unknown User',
        message: newMessage.trim(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

    //  setMessages(prev => [...prev, data as MessageData]);
      setNewMessage('');
      scrollToBottom();

    } catch (err) {
      console.error("Send message error:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      console.error("Error type:", typeof err);
      console.error("Error constructor:", err?.constructor?.name);
  
  const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
  setError(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  const updateTicketStatus = async (newStatus: string): Promise<void> => {
    if (!isHrinnoAdmin || !ticket) return;
    setUpdatingStatus(true);
    
    try {
      const updateData: Partial<TicketData> = { 
        status: newStatus as TicketData['status']
      };
      
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticket.id);

      if (error) throw error;

      setTicket(prev => prev ? { 
        ...prev, 
        status: newStatus as TicketData['status'], 
        resolved_at: updateData.resolved_at || prev.resolved_at 
      } : null);
      setShowStatusModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket status';
      setError(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const downloadAttachment = async (attachment: AttachmentData): Promise<void> => {
    try {
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file';
      setError(errorMessage);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    const initializeData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      const userData = await fetchCurrentUser();
      if (!userData) {
        setLoading(false);
        return;
      }

      await Promise.all([fetchTicket(), fetchMessages(), fetchAttachments()]);
      setLoading(false);
    };
    initializeData();
  }, [fetchCurrentUser, fetchTicket, fetchMessages, fetchAttachments]);

  useEffect(() => {
    if (!currentUser || !params.ticketId) return;

    const messagesSubscription = supabase
      .channel('ticket_messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${params.ticketId}` },
        (payload) => setMessages(prev => [...prev, payload.new as MessageData])
      )
      .subscribe();

    const ticketSubscription = supabase
      .channel('ticket_updates')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tickets', filter: `id=eq.${params.ticketId}` },
        (payload) => setTicket(prev => prev ? { ...prev, ...payload.new } : null)
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      ticketSubscription.unsubscribe();
    };
  }, [currentUser, params.ticketId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-center">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
                    <p className="text-gray-600 text-sm sm:text-base">{ticket.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{ticket.user_name}</span>
                  </div>
                  {isHrinnoAdmin && (
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{ticket.company?.company_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Created {formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                    {ticket.priority} priority
                  </span>
                  {ticket.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {ticket.category}
                    </span>
                  )}
                </div>

                {isHrinnoAdmin && (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Update Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Messages */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[600px] flex flex-col">
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Conversation</h3>
                <p className="text-sm text-gray-500">{messages.length} messages</p>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${message.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender_type === 'admin' ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span className="text-xs font-medium opacity-75">{message.sender_name}</span>
                          <span className="text-xs opacity-60">{formatDate(message.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 p-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Attachments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col h-[600px]">
              <h3 className="font-semibold text-gray-900 mb-4">Attachments</h3>
              <div className="flex-1 overflow-y-auto space-y-3">
                {attachments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center mt-12">No attachments</p>
                ) : (
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => downloadAttachment(attachment)}
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 truncate max-w-[120px]">{attachment.file_name}</span>
                          <span className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</span>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-gray-400" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80">
            <h3 className="font-semibold text-gray-900 mb-4">Update Ticket Status</h3>
            <div className="flex flex-col gap-2">
              {(['open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => updateTicketStatus(status)}
                  disabled={updatingStatus}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusButtonColors[status]}`}
                >
                  {updatingStatus ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    status.replace('_', ' ').toUpperCase()
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              disabled={updatingStatus}
              className="mt-4 w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---


## `./src/app/jobs/[slug]/tickets/create/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Ticket,
  ArrowLeft,
  Upload,
  X,
  FileText,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AttachmentFile extends File {
  id: string;
}

export default function CreateTicketPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const companySlug = params.slug;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: ''
  });
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
 
  
  interface User {
  id: string;
  email: string;
  user_firstname: string;
  user_lastname: string;
  //[key: string]: unknown; // optional for extra fields
}

const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Categories for the dropdown
  const categories = [
    'Technical Support',
    'Bug Report',
    'Feature Request',
    'Account Issue',
    'Billing',
    'General Inquiry',
    'Other'
  ];

  // Fetch company ID and current user
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/jobs/${companySlug}/login`);
          return;
        }

        // Get user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          setError('User not found');
          return;
        }

        setCurrentUser(userData);

        // Get company ID
        const { data: companyData, error: companyError } = await supabase
          .from('company')
          .select('id')
          .eq('slug', companySlug)
          .single();

        if (companyError || !companyData) {
          setError('Company not found');
          return;
        }

        setCompanyId(companyData.id.toString());
      } catch (_err) {
        setError('Failed to load initial data');
      }
    };

    fetchInitialData();
  }, [companySlug, router]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: AttachmentFile[] = [];

    files.forEach((file) => {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }

      // Add unique ID to file
      const fileWithId = Object.assign(file, { id: Math.random().toString(36).substr(2, 9) });
      validFiles.push(fileWithId);
    });

    setAttachments(prev => [...prev, ...validFiles]);
    // Clear the input
    event.target.value = '';
  };

  // Remove attachment
  const removeAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  // Upload files to Supabase Storage
  const uploadFiles = async (ticketId: string) => {
    const uploadPromises = attachments.map(async (file) => {
            if (!currentUser) {
        setError('User not loaded');
        return;
      }
      const fileName = `${currentUser.id}/${ticketId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, file);

      if (error) throw error;

      // Save attachment record to database
      const { error: dbError } = await supabase
        .from('ticket_attachments')
        .insert({
          ticket_id: ticketId,
          file_name: file.name,
          file_path: data.path,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: currentUser.id
        });

      if (dbError) throw dbError;
    });

    await Promise.all(uploadPromises);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Create ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category || null,
          company_id: companyId,
          user_id: currentUser.id,
          user_email: currentUser.email,
          user_name: `${currentUser.user_firstname} ${currentUser.user_lastname}`
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Upload attachments if any
      if (attachments.length > 0) {
        await uploadFiles(ticketData.id);
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/jobs/${companySlug}/tickets`);
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('Failed to create ticket');
  }
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Ticket Created Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your support ticket has been submitted and our team will respond soon.
          </p>
          <div className="animate-pulse text-blue-600">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Create Support Ticket
              </h1>
              <p className="text-gray-600">Describe your issue and we&apos;ll help you resolve it</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Error</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Priority and Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="priority" className="block text-sm font-semibold text-gray-900 mb-2">
                    Priority *
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Attachments <span className="font-normal text-gray-500">(Max 5MB per file)</span>
                </label>
                
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="*/*"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop files here
                    </p>
                  </label>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.description}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---


## `./src/app/jobs/[slug]/tickets/page.tsx`

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Ticket,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Clock,
  User,
  Building,
  ArrowUpCircle,
  Calendar,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { useDynamicRouteParams } from 'next/dist/server/app-render/dynamic-rendering';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TicketData {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  company_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  company?: {
    name: string;
    slug: string;
  } | null;
  ticket_messages?: { count: number }[];
  ticket_attachments?: { count: number }[];
  message_count: number;
  attachment_count: number;
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

export default function TicketsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const companySlug = params.slug;

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  
  interface UserData {
  id: string;
  email: string;
  user_firstname: string;
  user_lastname: string;
  company_to_users?: {
    company_id: string;
    company?: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}
const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  
  const [isHrinnoAdmin, setIsHrinnoAdmin] = useState(false);

  // Fetch current user and determine access level
  const fetchCurrentUser = useCallback(async () => {

    // 🚩 reset before anything else
      setIsHrinnoAdmin(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/jobs/${companySlug}/login`);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          company_to_users!inner(
            company!inner(id, slug, company_name)
          )
        `)
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        setError('User not found');
        return;
      }
      console.log('userData', JSON.stringify(userData, null, 2));
      setCurrentUser(userData);

      const userCompany = userData.company_to_users?.[0]?.company;
      setIsHrinnoAdmin(
      ['hrinno', 'innohr'].includes(userCompany?.slug ?? '')
     
      
);
      
    } catch (_err) {
      setError('Failed to load user data');
    }
  }, [companySlug, router]);

  // Fetch tickets based on user access level
  const fetchTickets = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // First, get tickets with company info
      let ticketsQuery = supabase
        .from('tickets')
        .select(`
          *,
          company:company_id(id,slug,name:company_name)
        `)
        .order('created_at', { ascending: false });
      console.log("Admin?:",isHrinnoAdmin)
      
      
      // If not hrinno admin, filter by company
      if (!isHrinnoAdmin) {
        const userCompanyId = currentUser.company_to_users?.[0]?.company?.id;
        console.log("Company_id:",userCompanyId)
        if (userCompanyId) {
          ticketsQuery = ticketsQuery.eq('company_id', userCompanyId);
        }
      }

      const { data: ticketsData, error: fetchError } = await ticketsQuery;

      if (fetchError) throw fetchError;

      if (!ticketsData || ticketsData.length === 0) {
        setTickets([]);
        return;
      }

      // Get message counts for all tickets
      const ticketIds = ticketsData.map(t => t.id);
      
      const { data: messageCounts } = await supabase
        .from('ticket_messages')
        .select('ticket_id')
        .in('ticket_id', ticketIds);

      const { data: attachmentCounts } = await supabase
        .from('ticket_attachments')
        .select('ticket_id')
        .in('ticket_id', ticketIds);

      // Count messages and attachments per ticket
      const messageCountMap: { [key: string]: number } = {};
      const attachmentCountMap: { [key: string]: number } = {};

      messageCounts?.forEach(msg => {
        messageCountMap[msg.ticket_id] = (messageCountMap[msg.ticket_id] || 0) + 1;
      });

      attachmentCounts?.forEach(att => {
        attachmentCountMap[att.ticket_id] = (attachmentCountMap[att.ticket_id] || 0) + 1;
      });

      // Process the tickets with counts
      const processedTickets: TicketData[] = ticketsData.map(ticket => ({
        ...ticket,
        message_count: messageCountMap[ticket.id] || 0,
        attachment_count: attachmentCountMap[ticket.id] || 0
      }));

      setTickets(processedTickets);
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('Failed to fetch tickets');
  }
} finally {
      setLoading(false);
    }
  }, [currentUser, isHrinnoAdmin]);

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = !searchTerm || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Effects
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchTickets();
    }
  }, [currentUser, fetchTickets]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Loading state
  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-center">Loading tickets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isHrinnoAdmin ? 'All Support Tickets' : 'Support Tickets'}
                </h1>
                <p className="text-gray-600">
                  {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                  {isHrinnoAdmin && ' across all companies'}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/jobs/${companySlug}/tickets/create`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Ticket</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
                <div className="flex items-center gap-2 min-w-fit">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 min-w-fit">
                  <ArrowUpCircle className="w-4 h-4 text-gray-500" />
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Content */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No tickets found'
                : 'No tickets yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first support ticket to get started.'}
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <button
                onClick={() => router.push(`/jobs/${companySlug}/tickets/create`)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Create First Ticket
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Priority
                      </th>
                      {isHrinnoAdmin && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Company
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => router.push(`/jobs/${companySlug}/tickets/${ticket.id}`)}
                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {ticket.title}
                            </h4>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {ticket.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[ticket.status]}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        {isHrinnoAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {ticket.company?.name || 'Unknown'}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ticket.user_name}</p>
                              <p className="text-xs text-gray-500">{ticket.user_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(ticket.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {ticket.message_count > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MessageSquare className="w-3 h-3" />
                                {ticket.message_count}
                              </div>
                            )}
                            {ticket.attachment_count > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Paperclip className="w-3 h-3" />
                                {ticket.attachment_count}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => router.push(`/jobs/${companySlug}/tickets/${ticket.id}`)}
                  className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {ticket.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="ml-3 flex flex-col gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="truncate">{ticket.user_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>

                  {isHrinnoAdmin && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{ticket.company?.name || 'Unknown Company'}</span>
                    </div>
                  )}

                  {(ticket.message_count > 0 || ticket.attachment_count > 0) && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {ticket.message_count > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.message_count} message{ticket.message_count !== 1 ? 's' : ''}
                        </div>
                      )}
                      {ticket.attachment_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {ticket.attachment_count} file{ticket.attachment_count !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

---


## `./src/app/jobs/[slug]/users/page.tsx`

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Users,
  Plus,
  Loader2,
  AlertCircle,
  Mail,
  Shield,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { AddUserModal } from '../../../../../components/AddUserModal'; // adjust path if needed

// ✅ Define a strong type for company users
interface CompanyUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CompanyUsersPage() {
  const params = useParams<{ slug: string }>();
  const companySlug = params.slug;

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // ✅ Fetch company ID by slug
  const fetchCompanyId = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('company')
        .select('id')
        .eq('slug', companySlug)
        .single();

      if (error || !data?.id) {
        setError('Company not found');
        setLoading(false);
        return;
      }
      setCompanyId(data.id.toString());
    } catch {
      setError('Error fetching company ID');
      setLoading(false);
    }
  }, [companySlug]);

  // ✅ Fetch company users via RPC
  const fetchCompanyUsers = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_company_users', {
        company_id_input: companyId,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setUsers(Array.isArray(data) ? (data as CompanyUser[]) : []);
    } catch {
      setError('Unexpected error fetching users');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // ✅ Filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && user.is_admin) ||
      (roleFilter === 'user' && !user.is_admin);

    return matchesSearch && matchesRole;
  });

  // ✅ Effects
  useEffect(() => {
    fetchCompanyId();
  }, [fetchCompanyId]);

  useEffect(() => {
    if (companyId) fetchCompanyUsers();
  }, [companyId, fetchCompanyUsers]);

  // ✅ Loading state
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-center">Loading users...</p>
        </div>
      </div>
    );

  // ✅ Error state
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  // ✅ Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Company Users
                </h1>
                <p className="text-gray-600">{users.length} team members</p>
              </div>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2 min-w-fit">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value as 'all' | 'admin' | 'user')
                  }
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Content */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || roleFilter !== 'all'
                ? 'No users found'
                : 'No users yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first team member.'}
            </p>
            {!searchTerm && roleFilter === 'all' && (
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Add First User
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.user_id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.first_name?.[0]}
                                {user.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_admin ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200">
                              <Shield className="w-3 h-3 mr-1" /> User
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {user.first_name} {user.last_name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                        {user.is_admin ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 flex-shrink-0">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200 flex-shrink-0">
                            <Shield className="w-3 h-3 mr-1" /> User
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={fetchCompanyUsers}
        companyId={companyId || ''}
      />
    </div>
  );
}
```

---


## `./src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";
//import Header from "./Header";
import Header from "../../components/Header"
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


## `./src/app/lib/notifications.ts`

```ts
// app/lib/notifications.ts

import { TicketData, MessageData } from '../api/notifications/email/types'; // import your types

export async function sendTicketNotification(
  type: 'new_ticket' | 'new_message' | 'status_update',
  ticketData: TicketData,
  recipientEmail: string,
  companySlug: string,
  messageData?: MessageData
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ticketData, recipientEmail, companySlug, messageData })
  });

  if (!response.ok) {
    throw new Error('Failed to send email notification');
  }

  return response.json();
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
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "lib/parsePdfSimple.cjs"],
  "exclude": ["node_modules"]
}
```

---


## `./vercel.json`

```json
{
  "functions": {
    "app/api/analyse-cv/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "build": {
    "env": {
      "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true",
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

---


---

# Statistiques
- **Nombre total de fichiers:** 88
- **Taille du fichier:** 648K
- **Date d'extraction:** Sun Sep 28 05:47:47 CEST 2025

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

