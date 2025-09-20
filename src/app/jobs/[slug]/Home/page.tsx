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