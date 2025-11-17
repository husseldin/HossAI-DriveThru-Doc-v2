'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { AppLayout } from '@/components/AppLayout'
import { branchesApi } from '@/lib/api'
import type { Branch, BranchCreate } from '@/types/api'
import { Plus, Edit, Trash2, MapPin, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { BranchFormModal } from '@/components/branches/BranchFormModal'

export default function BranchesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  // Fetch branches
  const { data: branches, isLoading } = useQuery('branches', branchesApi.getAll)

  // Create mutation
  const createMutation = useMutation(branchesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('branches')
      toast.success('Branch created successfully')
      setIsModalOpen(false)
    },
    onError: () => {
      toast.error('Failed to create branch')
    },
  })

  // Update mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => branchesApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('branches')
        toast.success('Branch updated successfully')
        setEditingBranch(null)
        setIsModalOpen(false)
      },
      onError: () => {
        toast.error('Failed to update branch')
      },
    }
  )

  // Delete mutation
  const deleteMutation = useMutation(branchesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('branches')
      toast.success('Branch deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete branch')
    },
  })

  const handleCreate = () => {
    setEditingBranch(null)
    setIsModalOpen(true)
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSubmit = async (data: BranchCreate) => {
    if (editingBranch) {
      await updateMutation.mutateAsync({ id: editingBranch.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  return (
    <AppLayout
      title="Branch Management"
      description="Manage restaurant branches and locations"
      actions={
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches?.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {branch.name}
                  </h3>
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{branch.location}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  {branch.is_active ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    branch.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {branch.is_active ? 'Active' : 'Inactive'}
                </span>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit branch"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete branch"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Created: {new Date(branch.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {branches?.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No branches
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new branch.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <BranchFormModal
          branch={editingBranch}
          onClose={() => {
            setIsModalOpen(false)
            setEditingBranch(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </AppLayout>
  )
}
