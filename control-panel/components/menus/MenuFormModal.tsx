'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Menu, MenuCreate, Branch } from '@/types/api'
import { X } from 'lucide-react'

const menuSchema = z.object({
  branch_id: z.number().min(1, 'Branch is required'),
  name_ar: z.string().min(1, 'Arabic name is required').max(200),
  name_en: z.string().min(1, 'English name is required').max(200),
  is_published: z.boolean().default(false),
})

type MenuFormData = z.infer<typeof menuSchema>

interface MenuFormModalProps {
  menu?: Menu | null
  branches: Branch[]
  onClose: () => void
  onSubmit: (data: MenuCreate) => Promise<void>
}

export function MenuFormModal({ menu, branches, onClose, onSubmit }: MenuFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: menu
      ? {
          branch_id: menu.branch_id,
          name_ar: menu.name_ar,
          name_en: menu.name_en,
          is_published: menu.is_published,
        }
      : {
          branch_id: branches[0]?.id || 0,
          name_ar: '',
          name_en: '',
          is_published: false,
        },
  })

  const onFormSubmit = async (data: MenuFormData) => {
    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {menu ? 'Edit Menu' : 'Create New Menu'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Branch Selection */}
          <div>
            <label
              htmlFor="branch_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Branch *
            </label>
            <select
              {...register('branch_id', { valueAsNumber: true })}
              id="branch_id"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {errors.branch_id && (
              <p className="mt-1 text-sm text-red-600">{errors.branch_id.message}</p>
            )}
          </div>

          {/* Arabic Name */}
          <div>
            <label
              htmlFor="name_ar"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Menu Name (Arabic) *
            </label>
            <input
              {...register('name_ar')}
              type="text"
              id="name_ar"
              dir="rtl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="القائمة الرئيسية"
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
              Menu Name (English) *
            </label>
            <input
              {...register('name_en')}
              type="text"
              id="name_en"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Main Menu"
            />
            {errors.name_en && (
              <p className="mt-1 text-sm text-red-600">{errors.name_en.message}</p>
            )}
          </div>

          {/* Is Published */}
          <div className="flex items-center">
            <input
              {...register('is_published')}
              type="checkbox"
              id="is_published"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
              Publish immediately (will unpublish other menus in this branch)
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
              {isSubmitting ? 'Saving...' : menu ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
