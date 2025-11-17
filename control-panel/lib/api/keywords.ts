import apiClient from '../api-client'
import type { Keyword, KeywordCreate } from '@/types/api'

export const keywordsApi = {
  // Get all keywords for an item
  getAll: async (itemId?: number): Promise<Keyword[]> => {
    const params = itemId ? { item_id: itemId } : {}
    const response = await apiClient.get('/keywords', { params })
    return response.data
  },

  // Get single keyword
  getById: async (id: number): Promise<Keyword> => {
    const response = await apiClient.get(`/keywords/${id}`)
    return response.data
  },

  // Create keyword
  create: async (data: KeywordCreate): Promise<Keyword> => {
    const response = await apiClient.post('/keywords', data)
    return response.data
  },

  // Delete keyword
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/keywords/${id}`)
  },
}
