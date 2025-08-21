'use client'

import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800">
      
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/InnoHRLogo.jpeg" // Mets ton logo ici (dans public/)
          alt="InnoHR"
          width={200}
          height={200}
          className="rounded-full shadow-lg"
        />
      </div>

      {/* Subtitle */}
      <p className="mt-4 text-lg md:text-2xl font-medium text-gray-700 text-center max-w-2xl">
        HR was never as easy as now!
      </p>

      {/* Decoration */}
      <div className="mt-10 flex gap-3">
        <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
        <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-150"></span>
        <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-300"></span>
      </div>
    </div>
  )
}
