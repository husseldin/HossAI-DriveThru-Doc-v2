'use client'

import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function AppLayout({ children, title, description, actions }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {(title || actions) && (
          <header className="bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-600">{description}</p>
                )}
              </div>
              {actions && <div>{actions}</div>}
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
