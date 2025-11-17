import apiClient from '../api-client'
import type { Branch, BranchCreate, BranchUpdate } from '@/types/api'

export const branchesApi = {
  // Get all branches
  getAll: async (): Promise<Branch[]> => {
    const response = await apiClient.get('/branches')
    return response.data
  },

  // Get single branch
  getById: async (id: number): Promise<Branch> => {
    const response = await apiClient.get(`/branches/${id}`)
    return response.data
  },

  // Create branch
  create: async (data: BranchCreate): Promise<Branch> => {
    const response = await apiClient.post('/branches', data)
    return response.data
  },

  // Update branch
  update: async (id: number, data: BranchUpdate): Promise<Branch> => {
    const response = await apiClient.put(`/branches/${id}`, data)
    return response.data
  },

  // Delete branch
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/branches/${id}`)
  },
}
