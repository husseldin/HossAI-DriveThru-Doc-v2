'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AddOn, AddOnCreate } from '@/types/api'
import { X } from 'lucide-react'

const addOnSchema = z.object({
  name_ar: z.string().min(1, 'Arabic name is required').max(200),
  name_en: z.string().min(1, 'English name is required').max(200),
  price: z.number().min(0, 'Price must be positive'),
  is_active: z.boolean().default(true),
})

type AddOnFormData = z.infer<typeof addOnSchema>

interface AddOnFormModalProps {
  addOn?: AddOn | null
  itemId: number
  onClose: () => void
  onSubmit: (data: AddOnCreate) => Promise<void>
}

export function AddOnFormModal({
  addOn,
  itemId,
  onClose,
  onSubmit,
}: AddOnFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddOnFormData>({
    resolver: zodResolver(addOnSchema),
    defaultValues: addOn
      ? {
          name_ar: addOn.name_ar,
          name_en: addOn.name_en,
          price: addOn.price,
          is_active: addOn.is_active,
        }
      : {
          name_ar: '',
          name_en: '',
          price: 0,
          is_active: true,
        },
  })

  const onFormSubmit = async (data: AddOnFormData) => {
    await onSubmit({ ...data, item_id: itemId } as AddOnCreate)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {addOn ? 'Edit Add-on' : 'Create New Add-on'}
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
                Add-on Name (Arabic) *
              </label>
              <input
                {...register('name_ar')}
                type="text"
                id="name_ar"
                dir="rtl"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="جبن إضافي"
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
                Add-on Name (English) *
              </label>
              <input
                {...register('name_en')}
                type="text"
                id="name_en"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Extra Cheese"
              />
              {errors.name_en && (
                <p className="mt-1 text-sm text-red-600">{errors.name_en.message}</p>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price *
            </label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              id="price"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="1.50"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Additional cost for this add-on
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : addOn ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
