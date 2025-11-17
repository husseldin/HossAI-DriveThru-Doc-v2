import apiClient from '../api-client'
import type { Item, ItemCreate, ItemUpdate, ItemWithDetails } from '@/types/api'

export const itemsApi = {
  // Get all items
  getAll: async (categoryId?: number): Promise<Item[]> => {
    const params = categoryId ? { category_id: categoryId } : {}
    const response = await apiClient.get('/items', { params })
    return response.data
  },

  // Get single item
  getById: async (id: number): Promise<Item> => {
    const response = await apiClient.get(`/items/${id}`)
    return response.data
  },

  // Get item with variants and addons
  getWithDetails: async (id: number): Promise<ItemWithDetails> => {
    const response = await apiClient.get(`/items/${id}/details`)
    return response.data
  },

  // Create item
  create: async (data: ItemCreate): Promise<Item> => {
    const response = await apiClient.post('/items', data)
    return response.data
  },

  // Update item
  update: async (id: number, data: ItemUpdate): Promise<Item> => {
    const response = await apiClient.put(`/items/${id}`, data)
    return response.data
  },

  // Delete item
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/items/${id}`)
  },
}
