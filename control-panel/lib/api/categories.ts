import apiClient from '../api-client'
import type { Category, CategoryCreate, CategoryUpdate, CategoryWithFullItems } from '@/types/api'

export const categoriesApi = {
  // Get all categories for a menu
  getAll: async (menuId?: number): Promise<Category[]> => {
    const params = menuId ? { menu_id: menuId } : {}
    const response = await apiClient.get('/categories', { params })
    return response.data
  },

  // Get single category
  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data
  },

  // Get category with full items
  getWithItems: async (id: number): Promise<CategoryWithFullItems> => {
    const response = await apiClient.get(`/categories/${id}/items`)
    return response.data
  },

  // Create category
  create: async (data: CategoryCreate): Promise<Category> => {
    const response = await apiClient.post('/categories', data)
    return response.data
  },

  // Update category
  update: async (id: number, data: CategoryUpdate): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, data)
    return response.data
  },

  // Delete category
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
