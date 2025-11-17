'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/AppLayout'
import { menusApi, categoriesApi } from '@/lib/api'
import { Plus, ArrowLeft, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { CategoryCreate } from '@/types/api'
import { CategoryFormModal } from '@/components/categories/CategoryFormModal'

export default function MenuDetailPage() {
  const params = useParams()
  const router = useRouter()
  const menuId = Number(params.id)
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  // Fetch full menu details
  const { data: menu, isLoading } = useQuery(
    ['menu', menuId],
    () => menusApi.getFull(menuId)
  )

  // Create category mutation
  const createMutation = useMutation(categoriesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['menu', menuId])
      toast.success('Category created successfully')
      setIsModalOpen(false)
    },
    onError: () => {
      toast.error('Failed to create category')
    },
  })

  // Update category mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => categoriesApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['menu', menuId])
        toast.success('Category updated successfully')
        setEditingCategory(null)
        setIsModalOpen(false)
      },
      onError: () => {
        toast.error('Failed to update category')
      },
    }
  )

  // Delete category mutation
  const deleteMutation = useMutation(categoriesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['menu', menuId])
      toast.success('Category deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete category')
    },
  })

  const handleCreate = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSubmit = async (data: CategoryCreate) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory.id, data })
    } else {
      await createMutation.mutateAsync({ ...data, menu_id: menuId })
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

  if (!menu) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Menu not found</h3>
          <button
            onClick={() => router.push('/menus')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Menus
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={menu.name_en}
      description={menu.name_ar}
      actions={
        <div className="flex space-x-3">
          <Link
            href="/menus"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      }
    >
      {/* Menu Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span
              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                menu.is_published
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {menu.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Version:</span>
            <span className="ml-2 text-sm text-gray-900">v{menu.version}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Categories:</span>
            <span className="ml-2 text-sm text-gray-900">
              {menu.categories?.length || 0}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Total Items:</span>
            <span className="ml-2 text-sm text-gray-900">
              {menu.categories?.reduce(
                (sum, cat) => sum + (cat.items?.length || 0),
                0
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {menu.categories && menu.categories.length > 0 ? (
          menu.categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name_ar}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{category.name_en}</p>
                  {category.description_en && (
                    <p className="text-sm text-gray-500 mt-2">
                      {category.description_en}
                    </p>
                  )}
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Items: {category.items?.length || 0}</span>
                    <span>Order: {category.display_order}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Link
                    href={`/categories/${category.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="View items"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                    title="Edit category"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No categories
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a category to this menu.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          menuId={menuId}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCategory(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </AppLayout>
  )
}
