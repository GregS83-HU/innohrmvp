'use client';

import { Heart, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleProvider';

export default function HomePage() {
  const { t } = useLocale();

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
            {t('home.hero.title')}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}{t('home.hero.titleHighlight')}{' '}
            </span>
            {t('home.hero.titleEnd')}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
            {t('home.hero.subtitle')}
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

          {/* Feature 2 - Happiness Assessment */}
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

          {/* Feature 3 - Team Management */}
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
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {t('home.cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 justify-center">
                {t('home.cta.getStarted')}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => window.location.href = './contact'}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
              >
                {t('home.cta.contactUs')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}