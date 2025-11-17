'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Home } from 'lucide-react'

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || '000'
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce-slow">
            <CheckCircle className="w-20 h-20 text-green-400" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 fade-in">
          Order Confirmed!
        </h1>

        <p className="text-2xl text-white/90 mb-8 fade-in">
          Thank you for your order
        </p>

        {/* Order Number */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
          <p className="text-white/70 text-lg mb-2">Your Order Number</p>
          <p className="text-6xl font-bold text-white">#{orderNumber}</p>
        </div>

        {/* Estimated Time */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8">
          <p className="text-white/70 mb-2">Estimated Preparation Time</p>
          <p className="text-3xl font-semibold text-white">5-7 minutes</p>
        </div>

        {/* Instructions */}
        <div className="text-white/80 space-y-2 mb-8">
          <p>Please proceed to the pickup window</p>
          <p>Have your order number ready</p>
        </div>

        {/* Home Button */}
        <button
          onClick={handleGoHome}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors flex items-center space-x-3 mx-auto"
        >
          <Home className="w-6 h-6" />
          <span>Return to Home</span>
        </button>

        {/* Auto Redirect */}
        <p className="text-white/50 text-sm mt-8">
          Returning to home in {countdown} seconds...
        </p>
      </div>
    </div>
  )
}
