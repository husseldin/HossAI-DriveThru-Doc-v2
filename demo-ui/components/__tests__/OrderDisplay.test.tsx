/**
 * Tests for OrderDisplay Component
 */
import { render, screen } from '@/__tests__/utils/test-utils'
import { OrderDisplay } from '../OrderDisplay'
import { useOrderStore } from '@/lib/store'
import { createMockOrderItem } from '@/__tests__/utils/test-utils'
import { act } from '@testing-library/react'

describe('OrderDisplay', () => {
  beforeEach(() => {
    // Clear store before each test
    act(() => {
      useOrderStore.getState().clearOrder()
    })
  })

  it('renders empty state when no items', () => {
    render(<OrderDisplay />)

    expect(screen.getByText('Your order is empty')).toBeInTheDocument()
    expect(screen.getByText('Start speaking to add items')).toBeInTheDocument()
  })

  it('displays empty state icon', () => {
    const { container } = render(<OrderDisplay />)

    // Check for ShoppingBag icon in empty state
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders order items when items exist', () => {
    const mockItem = createMockOrderItem({
      name_en: 'Test Burger',
      name_ar: 'برجر تجريبي',
    })

    act(() => {
      useOrderStore.getState().addItem(mockItem)
    })

    render(<OrderDisplay />)

    expect(screen.getByText('Your Order')).toBeInTheDocument()
    expect(screen.queryByText('Your order is empty')).not.toBeInTheDocument()
  })

  it('displays correct item count for single item', () => {
    const mockItem = createMockOrderItem()

    act(() => {
      useOrderStore.getState().addItem(mockItem)
    })

    render(<OrderDisplay />)

    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('displays correct item count for multiple items', () => {
    const item1 = createMockOrderItem({ id: '1' })
    const item2 = createMockOrderItem({ id: '2' })

    act(() => {
      useOrderStore.getState().addItem(item1)
      useOrderStore.getState().addItem(item2)
    })

    render(<OrderDisplay />)

    expect(screen.getByText('2 items')).toBeInTheDocument()
  })

  it('displays total price', () => {
    const mockItem = createMockOrderItem({
      base_price: 25.00,
      quantity: 2,
      total: 50.00,
    })

    act(() => {
      useOrderStore.getState().addItem(mockItem)
      useOrderStore.getState().calculateTotal()
    })

    render(<OrderDisplay />)

    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('50.00')).toBeInTheDocument()
  })

  it('updates when items are added', () => {
    const { rerender } = render(<OrderDisplay />)

    expect(screen.getByText('Your order is empty')).toBeInTheDocument()

    act(() => {
      useOrderStore.getState().addItem(createMockOrderItem())
    })

    rerender(<OrderDisplay />)

    expect(screen.queryByText('Your order is empty')).not.toBeInTheDocument()
    expect(screen.getByText('Your Order')).toBeInTheDocument()
  })

  it('updates total when items are removed', () => {
    const item = createMockOrderItem({ id: '1', base_price: 25.00, total: 25.00 })

    act(() => {
      useOrderStore.getState().addItem(item)
      useOrderStore.getState().calculateTotal()
    })

    const { rerender } = render(<OrderDisplay />)

    expect(screen.getByText('25.00')).toBeInTheDocument()

    act(() => {
      useOrderStore.getState().removeItem('1')
    })

    rerender(<OrderDisplay />)

    expect(screen.getByText('Your order is empty')).toBeInTheDocument()
  })

  it('renders with correct styling classes', () => {
    const { container } = render(<OrderDisplay />)

    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('bg-white/10')
    expect(mainDiv).toHaveClass('backdrop-blur-md')
    expect(mainDiv).toHaveClass('rounded-2xl')
  })

  it('shows scrollable area for many items', () => {
    // Add many items
    for (let i = 0; i < 10; i++) {
      act(() => {
        useOrderStore.getState().addItem(createMockOrderItem({ id: `${i}` }))
      })
    }

    const { container } = render(<OrderDisplay />)

    const scrollArea = container.querySelector('.overflow-y-auto')
    expect(scrollArea).toBeInTheDocument()
    expect(scrollArea).toHaveClass('max-h-[400px]')
  })
})
