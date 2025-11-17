'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/AppLayout'
import { categoriesApi, itemsApi } from '@/lib/api'
import { Plus, ArrowLeft, Edit, Trash2, DollarSign, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { ItemCreate } from '@/types/api'
import { ItemFormModal } from '@/components/items/ItemFormModal'

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = Number(params.id)
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Fetch category with items
  const { data: category, isLoading } = useQuery(
    ['category', categoryId],
    () => categoriesApi.getWithItems(categoryId)
  )

  // Create item mutation
  const createMutation = useMutation(itemsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['category', categoryId])
      toast.success('Item created successfully')
      setIsModalOpen(false)
    },
    onError: () => {
      toast.error('Failed to create item')
    },
  })

  // Update item mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => itemsApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['category', categoryId])
        toast.success('Item updated successfully')
        setEditingItem(null)
        setIsModalOpen(false)
      },
      onError: () => {
        toast.error('Failed to update item')
      },
    }
  )

  // Delete item mutation
  const deleteMutation = useMutation(itemsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['category', categoryId])
      toast.success('Item deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete item')
    },
  })

  const handleCreate = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item? This will also delete all variants and add-ons.')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSubmit = async (data: ItemCreate) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data })
    } else {
      await createMutation.mutateAsync({ ...data, category_id: categoryId })
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (!category) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Category not found</h3>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={category.name_en}
      description={category.name_ar}
      actions={
        <div className="flex space-x-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      }
    >
      {/* Category Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span
              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                category.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {category.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Display Order:</span>
            <span className="ml-2 text-sm text-gray-900">{category.display_order}</span>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-500">Description:</span>
            <p className="mt-1 text-sm text-gray-900">
              {category.description_en || 'No description'}
            </p>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.items && category.items.length > 0 ? (
          category.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Item Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name_en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                )}
              </div>

              {/* Item Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name_ar}
                    </h3>
                    <p className="text-sm text-gray-600">{item.name_en}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {item.description_en && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {item.description_en}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center text-lg font-bold text-green-600">
                    <DollarSign className="h-5 w-5" />
                    {item.base_price.toFixed(2)}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/items/${item.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Manage variants & add-ons"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                      title="Edit item"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Order: {item.display_order}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow-md">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding an item to this category.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ItemFormModal
          item={editingItem}
          categoryId={categoryId}
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </AppLayout>
  )
}
