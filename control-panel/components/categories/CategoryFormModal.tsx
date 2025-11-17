'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Category, CategoryCreate } from '@/types/api'
import { X } from 'lucide-react'

const categorySchema = z.object({
  name_ar: z.string().min(1, 'Arabic name is required').max(200),
  name_en: z.string().min(1, 'English name is required').max(200),
  description_ar: z.string().max(1000).optional(),
  description_en: z.string().max(1000).optional(),
  display_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormModalProps {
  category?: Category | null
  menuId: number
  onClose: () => void
  onSubmit: (data: CategoryCreate) => Promise<void>
}

export function CategoryFormModal({
  category,
  menuId,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name_ar: category.name_ar,
          name_en: category.name_en,
          description_ar: category.description_ar || '',
          description_en: category.description_en || '',
          display_order: category.display_order,
          is_active: category.is_active,
        }
      : {
          name_ar: '',
          name_en: '',
          description_ar: '',
          description_en: '',
          display_order: 0,
          is_active: true,
        },
  })

  const onFormSubmit = async (data: CategoryFormData) => {
    await onSubmit({ ...data, menu_id: menuId } as CategoryCreate)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Create New Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Arabic Name */}
          <div>
            <label
              htmlFor="name_ar"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category Name (Arabic) *
            </label>
            <input
              {...register('name_ar')}
              type="text"
              id="name_ar"
              dir="rtl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="المشروبات"
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
              Category Name (English) *
            </label>
            <input
              {...register('name_en')}
              type="text"
              id="name_en"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Beverages"
            />
            {errors.name_en && (
              <p className="mt-1 text-sm text-red-600">{errors.name_en.message}</p>
            )}
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
              placeholder="وصف الفئة بالعربية"
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
              placeholder="Category description in English"
            />
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
              {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
