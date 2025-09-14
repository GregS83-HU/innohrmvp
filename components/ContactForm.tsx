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
                : "We'd love to hear from you!"}
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
              <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
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
              placeholder="+33 1 23 45 67 89"
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
