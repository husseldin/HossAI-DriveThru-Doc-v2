'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/AppLayout'
import { itemsApi, variantsApi, addonsApi, keywordsApi } from '@/lib/api'
import { Plus, ArrowLeft, Edit, Trash2, DollarSign, Tag } from 'lucide-react'
import { toast } from 'sonner'
import type { VariantCreate, AddOnCreate, KeywordCreate } from '@/types/api'
import { VariantFormModal } from '@/components/items/VariantFormModal'
import { AddOnFormModal } from '@/components/items/AddOnFormModal'
import { KeywordManager } from '@/components/items/KeywordManager'

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = Number(params.id)
  const queryClient = useQueryClient()

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false)
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<any>(null)
  const [editingAddOn, setEditingAddOn] = useState<any>(null)

  // Fetch item with details
  const { data: item, isLoading } = useQuery(
    ['item', itemId],
    () => itemsApi.getWithDetails(itemId)
  )

  // Variant mutations
  const createVariantMutation = useMutation(variantsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['item', itemId])
      toast.success('Variant created successfully')
      setIsVariantModalOpen(false)
    },
    onError: () => toast.error('Failed to create variant'),
  })

  const updateVariantMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => variantsApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['item', itemId])
        toast.success('Variant updated successfully')
        setEditingVariant(null)
        setIsVariantModalOpen(false)
      },
      onError: () => toast.error('Failed to update variant'),
    }
  )

  const deleteVariantMutation = useMutation(variantsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['item', itemId])
      toast.success('Variant deleted successfully')
    },
    onError: () => toast.error('Failed to delete variant'),
  })

  // Add-on mutations
  const createAddOnMutation = useMutation(addonsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['item', itemId])
      toast.success('Add-on created successfully')
      setIsAddOnModalOpen(false)
    },
    onError: () => toast.error('Failed to create add-on'),
  })

  const updateAddOnMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => addonsApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['item', itemId])
        toast.success('Add-on updated successfully')
        setEditingAddOn(null)
        setIsAddOnModalOpen(false)
      },
      onError: () => toast.error('Failed to update add-on'),
    }
  )

  const deleteAddOnMutation = useMutation(addonsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['item', itemId])
      toast.success('Add-on deleted successfully')
    },
    onError: () => toast.error('Failed to delete add-on'),
  })

  const handleCreateVariant = () => {
    setEditingVariant(null)
    setIsVariantModalOpen(true)
  }

  const handleEditVariant = (variant: any) => {
    setEditingVariant(variant)
    setIsVariantModalOpen(true)
  }

  const handleDeleteVariant = async (id: number) => {
    if (confirm('Are you sure you want to delete this variant?')) {
      await deleteVariantMutation.mutateAsync(id)
    }
  }

  const handleSubmitVariant = async (data: VariantCreate) => {
    if (editingVariant) {
      await updateVariantMutation.mutateAsync({ id: editingVariant.id, data })
    } else {
      await createVariantMutation.mutateAsync({ ...data, item_id: itemId })
    }
  }

  const handleCreateAddOn = () => {
    setEditingAddOn(null)
    setIsAddOnModalOpen(true)
  }

  const handleEditAddOn = (addOn: any) => {
    setEditingAddOn(addOn)
    setIsAddOnModalOpen(true)
  }

  const handleDeleteAddOn = async (id: number) => {
    if (confirm('Are you sure you want to delete this add-on?')) {
      await deleteAddOnMutation.mutateAsync(id)
    }
  }

  const handleSubmitAddOn = async (data: AddOnCreate) => {
    if (editingAddOn) {
      await updateAddOnMutation.mutateAsync({ id: editingAddOn.id, data })
    } else {
      await createAddOnMutation.mutateAsync({ ...data, item_id: itemId })
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

  if (!item) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Item not found</h3>
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
      title={item.name_en}
      description={item.name_ar}
      actions={
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      }
    >
      {/* Item Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Base Price:</span>
            <div className="flex items-center mt-1 text-xl font-bold text-green-600">
              <DollarSign className="h-5 w-5" />
              {item.base_price.toFixed(2)}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span
              className={`mt-1 block inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                item.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Variants:</span>
            <p className="mt-1 text-xl font-semibold">{item.variants?.length || 0}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Add-ons:</span>
            <p className="mt-1 text-xl font-semibold">{item.addons?.length || 0}</p>
          </div>
        </div>
        {item.description_en && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm font-medium text-gray-500">Description:</span>
            <p className="mt-1 text-sm text-gray-900">{item.description_en}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variants Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
            <button
              onClick={handleCreateVariant}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {item.variants && item.variants.length > 0 ? (
              item.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{variant.name_en}</h3>
                        {variant.is_default && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                        {!variant.is_active && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{variant.name_ar}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Type: {variant.variant_type}</span>
                        <span className={`font-medium ${variant.price_modifier >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variant.price_modifier >= 0 ? '+' : ''}{variant.price_modifier.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => handleEditVariant(variant)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No variants yet</p>
            )}
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Add-ons</h2>
            <button
              onClick={handleCreateAddOn}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Add-on
            </button>
          </div>

          <div className="space-y-3">
            {item.addons && item.addons.length > 0 ? (
              item.addons.map((addon) => (
                <div
                  key={addon.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{addon.name_en}</h3>
                        {!addon.is_active && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{addon.name_ar}</p>
                      <div className="mt-2 flex items-center text-sm font-medium text-green-600">
                        +${addon.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => handleEditAddOn(addon)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddOn(addon.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No add-ons yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Keywords Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add keywords to help customers find this item through voice commands
            </p>
          </div>
          <button
            onClick={() => setIsKeywordModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            <Tag className="h-4 w-4 mr-1" />
            Manage Keywords
          </button>
        </div>

        <KeywordManager
          itemId={itemId}
          isOpen={isKeywordModalOpen}
          onClose={() => setIsKeywordModalOpen(false)}
        />
      </div>

      {/* Modals */}
      {isVariantModalOpen && (
        <VariantFormModal
          variant={editingVariant}
          itemId={itemId}
          onClose={() => {
            setIsVariantModalOpen(false)
            setEditingVariant(null)
          }}
          onSubmit={handleSubmitVariant}
        />
      )}

      {isAddOnModalOpen && (
        <AddOnFormModal
          addOn={editingAddOn}
          itemId={itemId}
          onClose={() => {
            setIsAddOnModalOpen(false)
            setEditingAddOn(null)
          }}
          onSubmit={handleSubmitAddOn}
        />
      )}
    </AppLayout>
  )
}
