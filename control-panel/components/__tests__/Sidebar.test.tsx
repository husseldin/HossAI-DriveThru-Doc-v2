/**
 * Tests for Sidebar Component
 */
import { render, screen } from '@/__tests__/utils/test-utils'
import { Sidebar } from '../Sidebar'

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}))

describe('Sidebar', () => {
  it('renders the application title', () => {
    render(<Sidebar />)
    expect(screen.getByText('Drive-Thru AI')).toBeInTheDocument()
  })

  it('renders all navigation items', () => {
    render(<Sidebar />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Branches')).toBeInTheDocument()
    expect(screen.getByText('Menus')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/dashboard')

    render(<Sidebar />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveClass('bg-gray-800')
    expect(dashboardLink).toHaveClass('text-white')
  })

  it('renders navigation links with correct hrefs', () => {
    render(<Sidebar />)

    const homeLink = screen.getByText('Home').closest('a')
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    const branchesLink = screen.getByText('Branches').closest('a')

    expect(homeLink).toHaveAttribute('href', '/')
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    expect(branchesLink).toHaveAttribute('href', '/branches')
  })

  it('applies hover styles to non-active items', () => {
    render(<Sidebar />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')

    // Non-active items should have hover classes
    expect(dashboardLink).toHaveClass('text-gray-300')
    expect(dashboardLink).toHaveClass('hover:bg-gray-700')
  })
})
