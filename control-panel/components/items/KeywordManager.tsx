'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { keywordsApi } from '@/lib/api'
import { Plus, Trash2, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { KeywordCreate } from '@/types/api'

const keywordSchema = z.object({
  keyword_ar: z.string().min(1, 'Arabic keyword is required').max(100),
  keyword_en: z.string().min(1, 'English keyword is required').max(100),
})

type KeywordFormData = z.infer<typeof keywordSchema>

interface KeywordManagerProps {
  itemId: number
  isOpen: boolean
  onClose: () => void
}

export function KeywordManager({ itemId, isOpen, onClose }: KeywordManagerProps) {
  const queryClient = useQueryClient()

  // Fetch keywords for this item
  const { data: keywords, isLoading } = useQuery(
    ['keywords', itemId],
    () => keywordsApi.getAll(itemId),
    {
      enabled: isOpen,
    }
  )

  // Form for adding new keywords
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KeywordFormData>({
    resolver: zodResolver(keywordSchema),
    defaultValues: {
      keyword_ar: '',
      keyword_en: '',
    },
  })

  // Create keyword mutation
  const createMutation = useMutation(keywordsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['keywords', itemId])
      queryClient.invalidateQueries(['item', itemId])
      toast.success('Keyword added successfully')
      reset()
    },
    onError: () => {
      toast.error('Failed to add keyword')
    },
  })

  // Delete keyword mutation
  const deleteMutation = useMutation(keywordsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['keywords', itemId])
      queryClient.invalidateQueries(['item', itemId])
      toast.success('Keyword deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete keyword')
    },
  })

  const handleAddKeyword = async (data: KeywordFormData) => {
    await createMutation.mutateAsync({
      ...data,
      item_id: itemId,
    } as KeywordCreate)
  }

  const handleDeleteKeyword = async (id: number) => {
    if (confirm('Are you sure you want to delete this keyword?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white my-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Keywords</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add keywords to help customers find this item through voice commands
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add New Keyword Form */}
        <form onSubmit={handleSubmit(handleAddKeyword)} className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Keyword</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  {...register('keyword_ar')}
                  type="text"
                  dir="rtl"
                  placeholder="الكلمة المفتاحية بالعربية"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {errors.keyword_ar && (
                  <p className="mt-1 text-xs text-red-600">{errors.keyword_ar.message}</p>
                )}
              </div>
              <div>
                <input
                  {...register('keyword_en')}
                  type="text"
                  placeholder="Keyword in English"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {errors.keyword_en && (
                  <p className="mt-1 text-xs text-red-600">{errors.keyword_en.message}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Adding...' : 'Add Keyword'}
            </button>
          </div>
        </form>

        {/* Existing Keywords List */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Current Keywords ({keywords?.length || 0})
          </h4>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : keywords && keywords.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {keywords.map((keyword) => (
                <div
                  key={keyword.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Tag className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {keyword.keyword_en}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-sm text-gray-700" dir="rtl">
                          {keyword.keyword_ar}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Added {new Date(keyword.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteKeyword(keyword.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete keyword"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Tag className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No keywords yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Add keywords to make this item easier to find via voice
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
