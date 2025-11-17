import apiClient from '../api-client'
import type { Variant, VariantCreate, VariantUpdate } from '@/types/api'

export const variantsApi = {
  // Get all variants for an item
  getAll: async (itemId?: number): Promise<Variant[]> => {
    const params = itemId ? { item_id: itemId } : {}
    const response = await apiClient.get('/variants', { params })
    return response.data
  },

  // Get single variant
  getById: async (id: number): Promise<Variant> => {
    const response = await apiClient.get(`/variants/${id}`)
    return response.data
  },

  // Create variant
  create: async (data: VariantCreate): Promise<Variant> => {
    const response = await apiClient.post('/variants', data)
    return response.data
  },

  // Update variant
  update: async (id: number, data: VariantUpdate): Promise<Variant> => {
    const response = await apiClient.put(`/variants/${id}`, data)
    return response.data
  },

  // Delete variant
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/variants/${id}`)
  },
}
