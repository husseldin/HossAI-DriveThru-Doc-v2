'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Variant, VariantCreate, VariantType } from '@/types/api'
import { X } from 'lucide-react'

const variantSchema = z.object({
  name_ar: z.string().min(1, 'Arabic name is required').max(200),
  name_en: z.string().min(1, 'English name is required').max(200),
  variant_type: z.enum(['size', 'style', 'temperature', 'custom']),
  price_modifier: z.number().default(0),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

type VariantFormData = z.infer<typeof variantSchema>

interface VariantFormModalProps {
  variant?: Variant | null
  itemId: number
  onClose: () => void
  onSubmit: (data: VariantCreate) => Promise<void>
}

export function VariantFormModal({
  variant,
  itemId,
  onClose,
  onSubmit,
}: VariantFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: variant
      ? {
          name_ar: variant.name_ar,
          name_en: variant.name_en,
          variant_type: variant.variant_type,
          price_modifier: variant.price_modifier,
          is_default: variant.is_default,
          is_active: variant.is_active,
        }
      : {
          name_ar: '',
          name_en: '',
          variant_type: 'size',
          price_modifier: 0,
          is_default: false,
          is_active: true,
        },
  })

  const onFormSubmit = async (data: VariantFormData) => {
    await onSubmit({ ...data, item_id: itemId } as VariantCreate)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {variant ? 'Edit Variant' : 'Create New Variant'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Variant Type */}
          <div>
            <label
              htmlFor="variant_type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Variant Type *
            </label>
            <select
              {...register('variant_type')}
              id="variant_type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="size">Size (Small, Medium, Large)</option>
              <option value="style">Style (Regular, Spicy, Crispy)</option>
              <option value="temperature">Temperature (Hot, Cold, Iced)</option>
              <option value="custom">Custom</option>
            </select>
            {errors.variant_type && (
              <p className="mt-1 text-sm text-red-600">{errors.variant_type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Arabic Name */}
            <div>
              <label
                htmlFor="name_ar"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name (Arabic) *
              </label>
              <input
                {...register('name_ar')}
                type="text"
                id="name_ar"
                dir="rtl"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="كبير"
              />
              {errors.name_ar && (
                <p className="mt-1 text-sm text-red-600">{errors.name_ar.message}</p>
              )}
            </div>

            {/* English Name */}
            <div>
              <label
                htmlFor="name_en"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name (English) *
              </label>
              <input
                {...register('name_en')}
                type="text"
                id="name_en"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Large"
              />
              {errors.name_en && (
                <p className="mt-1 text-sm text-red-600">{errors.name_en.message}</p>
              )}
            </div>
          </div>

          {/* Price Modifier */}
          <div>
            <label
              htmlFor="price_modifier"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price Modifier
            </label>
            <input
              {...register('price_modifier', { valueAsNumber: true })}
              type="number"
              id="price_modifier"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
            {errors.price_modifier && (
              <p className="mt-1 text-sm text-red-600">{errors.price_modifier.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Amount to add to base price (use negative for discount)
            </p>
          </div>

          {/* Is Default */}
          <div className="flex items-center">
            <input
              {...register('is_default')}
              type="checkbox"
              id="is_default"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
              Set as default variant for this type
            </label>
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <input
              {...register('is_active')}
              type="checkbox"
              id="is_active"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : variant ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
