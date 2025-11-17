'use client'

import { useRouter } from 'next/navigation'
import { useWorkflowStore } from '@/lib/store'
import { Mic, Globe } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const { setLanguage, setCurrentState } = useWorkflowStore()

  const handleStart = (language: 'ar' | 'en') => {
    setLanguage(language)
    setCurrentState('ordering')
    router.push('/order')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Mic className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 fade-in">
          Welcome to AI Drive-Thru
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12 fade-in">
          Order with your voice in Arabic or English
        </p>

        {/* Language Selection */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
          {/* Arabic Button */}
          <button
            onClick={() => handleStart('ar')}
            className="group relative px-12 py-8 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <Globe className="w-12 h-12 text-white mb-4" />
              <span className="text-3xl font-bold text-white mb-2">ابدأ الطلب</span>
              <span className="text-lg text-white/80">Arabic</span>
            </div>
          </button>

          {/* English Button */}
          <button
            onClick={() => handleStart('en')}
            className="group relative px-12 py-8 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <Globe className="w-12 h-12 text-white mb-4" />
              <span className="text-3xl font-bold text-white mb-2">Start Order</span>
              <span className="text-lg text-white/80">English</span>
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Voice Ordering</h3>
            <p className="text-white/70 text-sm">
              Simply speak your order naturally
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Bilingual</h3>
            <p className="text-white/70 text-sm">
              Arabic and English supported
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Fast & Easy</h3>
            <p className="text-white/70 text-sm">
              Quick ordering with AI assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
