'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VoiceInterface } from '@/components/VoiceInterface'
import { OrderDisplay } from '@/components/OrderDisplay'
import { useOrderStore, useWorkflowStore } from '@/lib/store'
import { ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function OrderPage() {
  const router = useRouter()
  const { items, total, clearOrder } = useOrderStore()
  const { language } = useWorkflowStore()
  const [showReview, setShowReview] = useState(false)

  const handleTranscript = (text: string) => {
    console.log('Transcript:', text)
    // Here you could process the transcript to add items to order
    // For now, this is handled by the backend NLU
  }

  const handleResponse = (text: string) => {
    console.log('Response:', text)
    // The response from the AI is displayed in the VoiceInterface component
  }

  const handleBack = () => {
    if (items.length > 0) {
      if (confirm('Are you sure you want to cancel your order?')) {
        clearOrder()
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }

  const handleReview = () => {
    if (items.length === 0) {
      toast.error('Please add items to your order first')
      return
    }
    setShowReview(true)
  }

  const handleConfirmOrder = () => {
    if (items.length === 0) {
      toast.error('Cannot place empty order')
      return
    }

    // Here you would send the order to the backend
    toast.success('Order placed successfully!')

    // Simulate order number
    const orderNumber = Math.floor(Math.random() * 1000) + 1

    // Clear order and show confirmation
    setTimeout(() => {
      clearOrder()
      router.push(`/confirmation?order=${orderNumber}`)
    }, 1000)
  }

  if (showReview) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowReview(false)}
              className="flex items-center text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 mr-2" />
              <span className="text-lg">Back to Order</span>
            </button>
            <h1 className="text-3xl font-bold text-white">Review Your Order</h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>

          {/* Order Review */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white/5 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-white/70 text-sm">×{item.quantity}</span>
                      <h3 className="text-lg font-semibold text-white">{item.name_en}</h3>
                    </div>

                    {item.variants.length > 0 && (
                      <div className="ml-8 mb-2">
                        {item.variants.map((variant) => (
                          <span
                            key={variant.id}
                            className="text-sm text-white/70"
                          >
                            • {variant.name_en}
                            {variant.price_modifier !== 0 && ` (+$${variant.price_modifier.toFixed(2)})`}
                            <br />
                          </span>
                        ))}
                      </div>
                    )}

                    {item.addons.length > 0 && (
                      <div className="ml-8">
                        {item.addons.map((addon) => (
                          <span
                            key={addon.id}
                            className="text-sm text-white/70"
                          >
                            • {addon.name_en} (+${addon.price.toFixed(2)})
                            <br />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-semibold text-white">
                      ${item.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="border-t border-white/20 pt-6 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-white">Total</span>
                <span className="text-3xl font-bold text-white">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmOrder}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-8 rounded-xl text-2xl transition-colors flex items-center justify-center space-x-3"
          >
            <Check className="w-8 h-8" />
            <span>Confirm Order</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            <span className="text-lg">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">
            {language === 'ar' ? 'قم بطلبك الآن' : 'Place Your Order'}
          </h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Voice Interface */}
          <div>
            <VoiceInterface
              onTranscript={handleTranscript}
              onResponse={handleResponse}
            />
          </div>

          {/* Right Column - Order Display */}
          <div>
            <OrderDisplay />

            {/* Review Order Button */}
            {items.length > 0 && (
              <button
                onClick={handleReview}
                className="w-full mt-6 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors"
              >
                Review Order →
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-white/70">
            {language === 'ar' ? (
              <>تحدث بوضوح واذكر اسم المنتج الذي تريد طلبه</>
            ) : (
              <>Speak clearly and mention the items you want to order</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
