'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Branch, BranchCreate } from '@/types/api'
import { X } from 'lucide-react'

const branchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  location: z.string().min(1, 'Location is required').max(500, 'Location is too long'),
  is_active: z.boolean().default(true),
})

type BranchFormData = z.infer<typeof branchSchema>

interface BranchFormModalProps {
  branch?: Branch | null
  onClose: () => void
  onSubmit: (data: BranchCreate) => Promise<void>
}

export function BranchFormModal({ branch, onClose, onSubmit }: BranchFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: branch
      ? {
          name: branch.name,
          location: branch.location,
          is_active: branch.is_active,
        }
      : {
          name: '',
          location: '',
          is_active: true,
        },
  })

  const onFormSubmit = async (data: BranchFormData) => {
    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {branch ? 'Edit Branch' : 'Create New Branch'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Branch Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Downtown Branch"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Location Field */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location *
            </label>
            <input
              {...register('location')}
              type="text"
              id="location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 123 Main St, City"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Is Active Field */}
          <div className="flex items-center">
            <input
              {...register('is_active')}
              type="checkbox"
              id="is_active"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-gray-700"
            >
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
              {isSubmitting ? 'Saving...' : branch ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
