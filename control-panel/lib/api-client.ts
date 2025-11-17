import axios, { AxiosInstance, AxiosError } from 'axios'
import { toast } from 'sonner'

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('auth_token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data as any

      switch (status) {
        case 400:
          toast.error(data.detail || 'Bad request')
          break
        case 401:
          toast.error('Unauthorized. Please login again.')
          // Handle redirect to login if needed
          break
        case 403:
          toast.error('Access forbidden')
          break
        case 404:
          toast.error(data.detail || 'Resource not found')
          break
        case 422:
          toast.error(data.detail || 'Validation error')
          break
        case 500:
          toast.error('Server error. Please try again later.')
          break
        default:
          toast.error(data.detail || 'An error occurred')
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('No response from server. Please check your connection.')
    } else {
      // Error in request setup
      toast.error('Request error: ' + error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
