import apiClient from '../api-client'
import type { AddOn, AddOnCreate, AddOnUpdate } from '@/types/api'

export const addonsApi = {
  // Get all addons for an item
  getAll: async (itemId?: number): Promise<AddOn[]> => {
    const params = itemId ? { item_id: itemId } : {}
    const response = await apiClient.get('/addons', { params })
    return response.data
  },

  // Get single addon
  getById: async (id: number): Promise<AddOn> => {
    const response = await apiClient.get(`/addons/${id}`)
    return response.data
  },

  // Create addon
  create: async (data: AddOnCreate): Promise<AddOn> => {
    const response = await apiClient.post('/addons', data)
    return response.data
  },

  // Update addon
  update: async (id: number, data: AddOnUpdate): Promise<AddOn> => {
    const response = await apiClient.put(`/addons/${id}`, data)
    return response.data
  },

  // Delete addon
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/addons/${id}`)
  },
}
