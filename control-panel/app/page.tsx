'use client'

import Link from 'next/link'
import { LayoutDashboard, Store, Menu as MenuIcon, Settings } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Drive-Thru Control Panel
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your branches, menus, and system settings
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Branch Management Card */}
          <Link
            href="/branches"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                →
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Branch Management
            </h2>
            <p className="text-gray-600 text-sm">
              Create and manage restaurant branches, locations, and configurations
            </p>
          </Link>

          {/* Menu Management Card */}
          <Link
            href="/menus"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <MenuIcon className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-gray-400 group-hover:text-green-600 transition-colors">
                →
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Menu Management
            </h2>
            <p className="text-gray-600 text-sm">
              Build and edit menus, categories, items, variants, and add-ons
            </p>
          </Link>

          {/* Dashboard Card */}
          <Link
            href="/dashboard"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <LayoutDashboard className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-gray-400 group-hover:text-purple-600 transition-colors">
                →
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard
            </h2>
            <p className="text-gray-600 text-sm">
              View system overview, statistics, and health status
            </p>
          </Link>

          {/* Settings Card */}
          <Link
            href="/settings"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Settings className="w-8 h-8 text-orange-600" />
              </div>
              <span className="text-gray-400 group-hover:text-orange-600 transition-colors">
                →
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              System Settings
            </h2>
            <p className="text-gray-600 text-sm">
              Configure AI models, voice settings, and system parameters
            </p>
          </Link>
        </div>

        {/* System Status */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Backend API
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Database
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  AI Models
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
