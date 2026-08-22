'use client';

import { Heart, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle, FileSearch, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '../i18n/LocaleProvider';

// Public marketing homepage (no company slug). Leads with the free Job
// Assistant as the primary hook, candidates need no account. The full HR
// platform is introduced below as what a company gets once it signs up.
// This is distinct from src/app/jobs/[slug]/Home/page.tsx, which is the
// private SaaS entry point for a specific already-onboarded company.
export default function HomePage() {
  const { t } = useLocale();

  return (
    <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-100 -mx-8 -my-8 px-4">

        {/* Hero Section - leads with the free Job Assistant */}
        <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 w-full">

          <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {t('home.hero.eyebrow')}
          </div>

          {/* Main Title */}
          <div className="text-center mb-8 max-w-4xl w-full">
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              {t('home.hero.title')}
              <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                {' '}{t('home.hero.titleHighlight')}{' '}
              </span>
              {t('home.hero.titleEnd')}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/job-assistant"
                className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-accent-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg"
              >
                <FileSearch className="w-5 h-5" />
                {t('home.hero.cta')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500">{t('home.hero.ctaNote')}</p>
            </div>
          </div>
        </div>

        {/* For Employers Section */}
        <div className="w-full px-4 pb-16">
          <div className="max-w-5xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Briefcase className="w-4 h-4" />
              {t('home.forEmployers.eyebrow')}
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {t('home.forEmployers.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.forEmployers.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-10">

            {/* Feature 1 - Recruitment pipeline */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {t('home.features.cvAnalysis.title')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('home.features.cvAnalysis.description')}
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('home.features.cvAnalysis.badge')}</span>
                </div>
              </div>
            </div>

            {/* Feature 2 - Time & attendance tracking */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {t('home.features.teamManagement.title')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('home.features.teamManagement.description')}
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('home.features.teamManagement.badge')}</span>
                </div>
              </div>
            </div>

            {/* Feature 3 - Wellbeing */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {t('home.features.wellness.title')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('home.features.wellness.description')}
                </p>
                <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('home.features.wellness.badge')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border-2 border-brand-600 text-brand-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-50 transition-all"
            >
              {t('home.forEmployers.cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
