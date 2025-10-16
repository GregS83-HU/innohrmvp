'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Star, MessageSquare, Send, Phone, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'i18n/LocaleProvider';

const FeedbackPage: React.FC = () => {
  const { t } = useLocale();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t('feedback.errors.selectRating'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(t('feedback.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactUs = () => router.push('/jobs/demo/contact');

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('feedback.success.title')}
          </h1>

          <p className="text-gray-600 mb-6">
            {t('feedback.success.subtitle')}
          </p>

          <button
            onClick={handleContactUs}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            {t('feedback.success.contactUs')}
          </button>
        </div>
      </div>
    );
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
            {t('feedback.header.title')}
          </h1>

          <p className="text-gray-600">
            {t('feedback.header.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <div className="block text-lg font-semibold text-gray-700 mb-4">
              {t('feedback.rating.label')}
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
                {rating === 1 && t('feedback.rating.labels.poor')}
                {rating === 2 && t('feedback.rating.labels.fair')}
                {rating === 3 && t('feedback.rating.labels.good')}
                {rating === 4 && t('feedback.rating.labels.veryGood')}
                {rating === 5 && t('feedback.rating.labels.excellent')}
              </p>
            )}
          </div>

          {/* Comment Box */}
          <div>
            <div className="block text-lg font-semibold text-gray-700 mb-3">
              {t('feedback.comment.label')}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('feedback.comment.placeholder')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 {t('feedback.comment.characters')}
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
                {t('feedback.submit.submitting')}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {t('feedback.submit.button')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
