'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Item, ItemCreate } from '@/types/api'
import { X } from 'lucide-react'

const itemSchema = z.object({
  name_ar: z.string().min(1, 'Arabic name is required').max(200),
  name_en: z.string().min(1, 'English name is required').max(200),
  description_ar: z.string().max(1000).optional(),
  description_en: z.string().max(1000).optional(),
  base_price: z.number().min(0, 'Price must be positive'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  display_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
})

type ItemFormData = z.infer<typeof itemSchema>

interface ItemFormModalProps {
  item?: Item | null
  categoryId: number
  onClose: () => void
  onSubmit: (data: ItemCreate) => Promise<void>
}

export function ItemFormModal({
  item,
  categoryId,
  onClose,
  onSubmit,
}: ItemFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: item
      ? {
          name_ar: item.name_ar,
          name_en: item.name_en,
          description_ar: item.description_ar || '',
          description_en: item.description_en || '',
          base_price: item.base_price,
          image_url: item.image_url || '',
          display_order: item.display_order,
          is_active: item.is_active,
        }
      : {
          name_ar: '',
          name_en: '',
          description_ar: '',
          description_en: '',
          base_price: 0,
          image_url: '',
          display_order: 0,
          is_active: true,
        },
  })

  const onFormSubmit = async (data: ItemFormData) => {
    // Convert empty string to undefined for optional fields
    const submitData = {
      ...data,
      category_id: categoryId,
      description_ar: data.description_ar || undefined,
      description_en: data.description_en || undefined,
      image_url: data.image_url || undefined,
    } as ItemCreate
    await onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white my-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {item ? 'Edit Item' : 'Create New Item'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Arabic Name */}
            <div>
              <label
                htmlFor="name_ar"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Item Name (Arabic) *
              </label>
              <input
                {...register('name_ar')}
                type="text"
                id="name_ar"
                dir="rtl"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="برجر لحم"
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
                Item Name (English) *
              </label>
              <input
                {...register('name_en')}
                type="text"
                id="name_en"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Beef Burger"
              />
              {errors.name_en && (
                <p className="mt-1 text-sm text-red-600">{errors.name_en.message}</p>
              )}
            </div>
          </div>

          {/* Arabic Description */}
          <div>
            <label
              htmlFor="description_ar"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Arabic)
            </label>
            <textarea
              {...register('description_ar')}
              id="description_ar"
              dir="rtl"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="وصف العنصر بالعربية"
            />
          </div>

          {/* English Description */}
          <div>
            <label
              htmlFor="description_en"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (English)
            </label>
            <textarea
              {...register('description_en')}
              id="description_en"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Item description in English"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Base Price */}
            <div>
              <label
                htmlFor="base_price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Base Price *
              </label>
              <input
                {...register('base_price', { valueAsNumber: true })}
                type="number"
                id="base_price"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="9.99"
              />
              {errors.base_price && (
                <p className="mt-1 text-sm text-red-600">{errors.base_price.message}</p>
              )}
            </div>

            {/* Display Order */}
            <div>
              <label
                htmlFor="display_order"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Display Order
              </label>
              <input
                {...register('display_order', { valueAsNumber: true })}
                type="number"
                id="display_order"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Lower numbers appear first
              </p>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label
              htmlFor="image_url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image URL
            </label>
            <input
              {...register('image_url')}
              type="url"
              id="image_url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {errors.image_url && (
              <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Optional: Enter a URL to an image of this item
            </p>
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
              {isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
