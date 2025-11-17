'use client'

import { useOrderStore } from '@/lib/store'
import type { OrderItem } from '@/types'
import { Minus, Plus, Trash2, DollarSign } from 'lucide-react'

interface OrderItemCardProps {
  item: OrderItem
  index: number
}

export function OrderItemCard({ item, index }: OrderItemCardProps) {
  const { updateItemQuantity, removeItem } = useOrderStore()

  const handleIncrement = () => {
    updateItemQuantity(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateItemQuantity(item.id, item.quantity - 1)
    } else {
      removeItem(item.id)
    }
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  return (
    <div
      className="bg-white/5 rounded-lg p-4 slide-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Item Name */}
          <h3 className="text-lg font-semibold text-white">{item.name_en}</h3>
          <p className="text-sm text-white/70 mb-2" dir="rtl">
            {item.name_ar}
          </p>

          {/* Variants */}
          {item.variants.length > 0 && (
            <div className="mb-2">
              {item.variants.map((variant) => (
                <span
                  key={variant.id}
                  className="inline-block text-xs bg-blue-500/30 text-blue-100 px-2 py-1 rounded mr-2 mb-1"
                >
                  {variant.name_en}
                  {variant.price_modifier !== 0 && (
                    <span className="ml-1">
                      ({variant.price_modifier > 0 ? '+' : ''}$
                      {variant.price_modifier.toFixed(2)})
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Add-ons */}
          {item.addons.length > 0 && (
            <div className="mb-2">
              {item.addons.map((addon) => (
                <span
                  key={addon.id}
                  className="inline-block text-xs bg-green-500/30 text-green-100 px-2 py-1 rounded mr-2 mb-1"
                >
                  + {addon.name_en} (${addon.price.toFixed(2)})
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center text-white font-semibold mt-2">
            <DollarSign className="w-4 h-4" />
            <span>{item.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-end space-y-2 ml-4">
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-semibold px-3">{item.quantity}</span>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <button
            onClick={handleRemove}
            className="text-red-300 hover:text-red-200 transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
