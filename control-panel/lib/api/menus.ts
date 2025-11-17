import apiClient from '../api-client'
import type {
  Menu,
  MenuCreate,
  MenuUpdate,
  FullMenuResponse,
  MenuValidationResult
} from '@/types/api'

export const menusApi = {
  // Get all menus
  getAll: async (branchId?: number): Promise<Menu[]> => {
    const params = branchId ? { branch_id: branchId } : {}
    const response = await apiClient.get('/menus', { params })
    return response.data
  },

  // Get single menu
  getById: async (id: number): Promise<Menu> => {
    const response = await apiClient.get(`/menus/${id}`)
    return response.data
  },

  // Get full menu with all details
  getFull: async (id: number): Promise<FullMenuResponse> => {
    const response = await apiClient.get(`/menus/${id}/full`)
    return response.data
  },

  // Create menu
  create: async (data: MenuCreate): Promise<Menu> => {
    const response = await apiClient.post('/menus', data)
    return response.data
  },

  // Update menu
  update: async (id: number, data: MenuUpdate): Promise<Menu> => {
    const response = await apiClient.put(`/menus/${id}`, data)
    return response.data
  },

  // Delete menu
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/menus/${id}`)
  },

  // Validate menu
  validate: async (id: number): Promise<MenuValidationResult> => {
    const response = await apiClient.get(`/menus/${id}/validate`)
    return response.data
  },

  // Publish menu
  publish: async (id: number): Promise<Menu> => {
    const response = await apiClient.post(`/menus/${id}/publish`)
    return response.data
  },
}
