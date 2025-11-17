'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { AppLayout } from '@/components/AppLayout'
import { menusApi, branchesApi } from '@/lib/api'
import type { Menu, MenuCreate } from '@/types/api'
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { MenuFormModal } from '@/components/menus/MenuFormModal'

export default function MenusPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>()

  // Fetch menus
  const { data: menus, isLoading } = useQuery(
    ['menus', selectedBranch],
    () => menusApi.getAll(selectedBranch)
  )

  // Fetch branches for filter
  const { data: branches } = useQuery('branches', branchesApi.getAll)

  // Create mutation
  const createMutation = useMutation(menusApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('menus')
      toast.success('Menu created successfully')
      setIsModalOpen(false)
    },
    onError: () => {
      toast.error('Failed to create menu')
    },
  })

  // Update mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => menusApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('menus')
        toast.success('Menu updated successfully')
        setEditingMenu(null)
        setIsModalOpen(false)
      },
      onError: () => {
        toast.error('Failed to update menu')
      },
    }
  )

  // Delete mutation
  const deleteMutation = useMutation(menusApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('menus')
      toast.success('Menu deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete menu')
    },
  })

  // Publish mutation
  const publishMutation = useMutation(menusApi.publish, {
    onSuccess: () => {
      queryClient.invalidateQueries('menus')
      toast.success('Menu published successfully')
    },
    onError: () => {
      toast.error('Failed to publish menu')
    },
  })

  // Validate mutation
  const validateMutation = useMutation(menusApi.validate, {
    onSuccess: (result) => {
      if (result.valid) {
        toast.success('Menu is valid')
      } else {
        toast.error(`Menu has ${result.errors.length} errors`)
      }
    },
    onError: () => {
      toast.error('Failed to validate menu')
    },
  })

  const handleCreate = () => {
    setEditingMenu(null)
    setIsModalOpen(true)
  }

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this menu?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handlePublish = async (id: number) => {
    if (confirm('Publishing this menu will unpublish all other menus in this branch. Continue?')) {
      await publishMutation.mutateAsync(id)
    }
  }

  const handleValidate = async (id: number) => {
    await validateMutation.mutateAsync(id)
  }

  const handleSubmit = async (data: MenuCreate) => {
    if (editingMenu) {
      await updateMutation.mutateAsync({ id: editingMenu.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const getBranchName = (branchId: number) => {
    return branches?.find((b) => b.id === branchId)?.name || 'Unknown'
  }

  return (
    <AppLayout
      title="Menu Management"
      description="Manage menus, categories, and items"
      actions={
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Menu
        </button>
      }
    >
      {/* Branch Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Branch
        </label>
        <select
          value={selectedBranch || ''}
          onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : undefined)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">All Branches</option>
          {branches?.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {menus?.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {menu.name_ar}
                    </h3>
                    {menu.is_published && (
                      <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{menu.name_en}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Branch: {getBranchName(menu.branch_id)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    menu.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {menu.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-gray-500">v{menu.version}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/menus/${menu.id}`}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Link>
                <button
                  onClick={() => handleValidate(menu.id)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-md hover:bg-yellow-100"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Validate
                </button>
                {!menu.is_published && (
                  <button
                    onClick={() => handlePublish(menu.id)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Publish
                  </button>
                )}
                <button
                  onClick={() => handleEdit(menu)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(menu.id)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                Created: {new Date(menu.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {menus?.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No menus</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new menu.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Menu
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <MenuFormModal
          menu={editingMenu}
          branches={branches || []}
          onClose={() => {
            setIsModalOpen(false)
            setEditingMenu(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </AppLayout>
  )
}
