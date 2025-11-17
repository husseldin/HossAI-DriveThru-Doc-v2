'use client'

import { useOrderStore } from '@/lib/store'
import { OrderItemCard } from './OrderItemCard'
import { DollarSign, ShoppingBag } from 'lucide-react'

export function OrderDisplay() {
  const { items, total } = useOrderStore()

  if (items.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
        <ShoppingBag className="w-16 h-16 text-white/50 mx-auto mb-4" />
        <p className="text-white/70 text-lg">
          Your order is empty
          <br />
          <span className="text-sm">Start speaking to add items</span>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <ShoppingBag className="w-6 h-6 mr-2" />
          Your Order
        </h2>
        <span className="text-white/70 text-sm">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Order Items */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {items.map((item, index) => (
          <OrderItemCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-white/20 pt-4 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-white">Total</span>
          <div className="flex items-center text-2xl font-bold text-white">
            <DollarSign className="w-6 h-6" />
            {total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
