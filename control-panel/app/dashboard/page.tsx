'use client'

import { useQuery } from 'react-query'
import { AppLayout } from '@/components/AppLayout'
import { branchesApi, menusApi, apiClient } from '@/lib/api'
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Store,
  Menu as MenuIcon,
  Database,
  Cpu,
} from 'lucide-react'

export default function DashboardPage() {
  // Fetch system health
  const { data: health, isLoading: healthLoading } = useQuery(
    'health',
    async () => {
      const response = await apiClient.get('/health')
      return response.data
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  )

  // Fetch branches
  const { data: branches } = useQuery('branches', branchesApi.getAll)

  // Fetch menus
  const { data: menus } = useQuery('menus', () => menusApi.getAll())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      case 'unhealthy':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <AppLayout
      title="Dashboard"
      description="System overview and health status"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Branches</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {branches?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Menus</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {menus?.filter((m) => m.is_published).length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MenuIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft Menus</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {menus?.filter((m) => !m.is_published).length || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <MenuIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="mt-2 text-lg font-semibold text-green-600">
                {healthLoading ? 'Checking...' : health?.status || 'Unknown'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
        {healthLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : health ? (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(health.status)}
                <div>
                  <p className="font-medium text-gray-900">Overall Status</p>
                  <p className="text-sm text-gray-500">System health check</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  health.status
                )}`}
              >
                {health.status}
              </span>
            </div>

            {/* Services */}
            {health.services && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* STT Service */}
                {health.services.stt && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Cpu className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">STT Service</p>
                        <p className="text-sm text-gray-500">
                          Speech-to-Text
                          {health.services.stt.latency_ms &&
                            ` (${health.services.stt.latency_ms}ms)`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        health.services.stt.status
                      )}`}
                    >
                      {health.services.stt.status}
                    </span>
                  </div>
                )}

                {/* TTS Service */}
                {health.services.tts && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Cpu className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">TTS Service</p>
                        <p className="text-sm text-gray-500">
                          Text-to-Speech
                          {health.services.tts.latency_ms &&
                            ` (${health.services.tts.latency_ms}ms)`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        health.services.tts.status
                      )}`}
                    >
                      {health.services.tts.status}
                    </span>
                  </div>
                )}

                {/* Language Detector */}
                {health.services.language_detector && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Language Detector</p>
                        <p className="text-sm text-gray-500">
                          Default: {health.services.language_detector.default_language}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        health.services.language_detector.status
                      )}`}
                    >
                      {health.services.language_detector.status}
                    </span>
                  </div>
                )}

                {/* Interruption Detector */}
                {health.services.interruption_detector && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Interruption Detector
                        </p>
                        <p className="text-sm text-gray-500">
                          Voice interruption detection
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        health.services.interruption_detector.status
                      )}`}
                    >
                      {health.services.interruption_detector.status}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Unable to fetch health status
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/branches"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Store className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Branches</p>
              <p className="text-sm text-gray-500">Add or edit branches</p>
            </div>
          </a>

          <a
            href="/menus"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <MenuIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Menus</p>
              <p className="text-sm text-gray-500">Create and edit menus</p>
            </div>
          </a>

          <a
            href="/settings"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <Database className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">System Settings</p>
              <p className="text-sm text-gray-500">Configure the system</p>
            </div>
          </a>
        </div>
      </div>
    </AppLayout>
  )
}
