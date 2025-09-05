'use client'

import Image from 'next/image'
import { Heart, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4">
        
        {/* Logo Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <Image
              src="/InnoHRLogo.jpeg"
              alt="InnoHR"
              width={150}
              height={150}
              className="rounded-full shadow-lg mx-auto mb-4"
            />
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full inline-block">
              <span className="font-semibold">InnoHR Platform</span>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            HR was never as
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> easy </span>
            as now!
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
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
      <div className="max-w-6xl mx-auto px-4 pb-16">
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          
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
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-2xl mx-auto">
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

        {/* Stats Section */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">500+</div>
            <div className="text-blue-100">CVs Analyzed</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">98%</div>
            <div className="text-green-100">Satisfaction Rate</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">24/7</div>
            <div className="text-purple-100">AI Support</div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">100%</div>
            <div className="text-yellow-100">Secure & Private</div>
          </div>
        </div>
      </div>
    </div>
  )
}