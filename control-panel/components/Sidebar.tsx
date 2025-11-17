'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, Menu as MenuIcon, LayoutDashboard, Settings } from 'lucide-react'
import clsx from 'clsx'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Branches', href: '/branches', icon: Store },
  { name: 'Menus', href: '/menus', icon: MenuIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <h1 className="text-white text-xl font-bold">Drive-Thru AI</h1>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <Icon
                  className={clsx(
                    'mr-3 flex-shrink-0 h-6 w-6',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
