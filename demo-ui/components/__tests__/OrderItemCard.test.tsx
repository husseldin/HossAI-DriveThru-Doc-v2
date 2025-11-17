/**
 * Tests for OrderItemCard Component
 */
import { render, screen, fireEvent } from '@/__tests__/utils/test-utils'
import { OrderItemCard } from '../OrderItemCard'
import { useOrderStore } from '@/lib/store'
import { createMockOrderItem, createMockVariant, createMockAddOn } from '@/__tests__/utils/test-utils'
import { act } from '@testing-library/react'

describe('OrderItemCard', () => {
  beforeEach(() => {
    act(() => {
      useOrderStore.getState().clearOrder()
    })
  })

  it('renders item name in English', () => {
    const item = createMockOrderItem({ name_en: 'Classic Burger' })

    render(<OrderItemCard item={item} index={0} />)

    expect(screen.getByText('Classic Burger')).toBeInTheDocument()
  })

  it('renders item name in Arabic', () => {
    const item = createMockOrderItem({ name_ar: 'برجر كلاسيك' })

    render(<OrderItemCard item={item} index={0} />)

    expect(screen.getByText('برجر كلاسيك')).toBeInTheDocument()
  })

  it('displays item total price', () => {
    const item = createMockOrderItem({ total: 35.50 })

    render(<OrderItemCard item={item} index={0} />)

    expect(screen.getByText('35.50')).toBeInTheDocument()
  })

  it('displays item quantity', () => {
    const item = createMockOrderItem({ quantity: 3 })

    render(<OrderItemCard item={item} index={0} />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders variants with price modifiers', () => {
    const variant = createMockVariant({
      name_en: 'Large',
      price_modifier: 5.00
    })
    const item = createMockOrderItem({ variants: [variant] })

    render(<OrderItemCard item={item} index={0} />)

    expect(screen.getByText(/Large/)).toBeInTheDocument()
    expect(screen.getByText(/\+\$5\.00/)).toBeInTheDocument()
  })

  it('renders multiple variants', () => {
    const variant1 = createMockVariant({ id: 1, name_en: 'Large', price_modifier: 5.00 })
    const variant2 = createMockVariant({ id: 2, name_en: 'Spicy', price_modifier: 2.00 })
    const item = createMockOrderItem({ variants: [variant1, variant2] })

    render(<OrderItemCard item={item} index={0} />)

    expect(screen.getByText(/Large/)).toBeInTheDocument()
    expect(screen.getByText(/Spicy/)).toBeInTheDocument()
  })

  it('renders add-ons with prices', () => {
    const addon = createMockAddOn({
      name_en: 'Extra Cheese',
      price: 3.00
    })
    const item = createMockOrderItem({ addons: [addon] })

    render(<OrderItemCard item={item} index={0} />)

    expect(screen.getByText(/Extra Cheese/)).toBeInTheDocument()
    expect(screen.getByText(/\$3\.00/)).toBeInTheDocument()
  })

  it('renders multiple add-ons', () => {
    const addon1 = createMockAddOn({ id: 1, name_en: 'Extra Cheese', price: 3.00 })
    const addon2 = createMockAddOn({ id: 2, name_en: 'Bacon', price: 4.00 })
    const item = createMockOrderItem({ addons: [addon1, addon2] })

    render(<OrderItemCard item={item} index={0} />)

    expect(screen.getByText(/Extra Cheese/)).toBeInTheDocument()
    expect(screen.getByText(/Bacon/)).toBeInTheDocument()
  })

  describe('quantity controls', () => {
    it('increases quantity when plus button clicked', () => {
      const item = createMockOrderItem({ id: '1', quantity: 1 })

      act(() => {
        useOrderStore.getState().addItem(item)
      })

      render(<OrderItemCard item={item} index={0} />)

      const plusButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-plus')
      )

      act(() => {
        fireEvent.click(plusButton!)
      })

      const state = useOrderStore.getState()
      expect(state.items[0].quantity).toBe(2)
    })

    it('decreases quantity when minus button clicked', () => {
      const item = createMockOrderItem({ id: '1', quantity: 3 })

      act(() => {
        useOrderStore.getState().addItem(item)
      })

      render(<OrderItemCard item={item} index={0} />)

      const minusButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-minus')
      )

      act(() => {
        fireEvent.click(minusButton!)
      })

      const state = useOrderStore.getState()
      expect(state.items[0].quantity).toBe(2)
    })

    it('removes item when minus clicked at quantity 1', () => {
      const item = createMockOrderItem({ id: '1', quantity: 1 })

      act(() => {
        useOrderStore.getState().addItem(item)
      })

      render(<OrderItemCard item={item} index={0} />)

      const minusButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-minus')
      )

      act(() => {
        fireEvent.click(minusButton!)
      })

      const state = useOrderStore.getState()
      expect(state.items).toHaveLength(0)
    })

    it('removes item when trash button clicked', () => {
      const item = createMockOrderItem({ id: '1' })

      act(() => {
        useOrderStore.getState().addItem(item)
      })

      render(<OrderItemCard item={item} index={0} />)

      const trashButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash')
      )

      act(() => {
        fireEvent.click(trashButton!)
      })

      const state = useOrderStore.getState()
      expect(state.items).toHaveLength(0)
    })
  })

  describe('styling and animations', () => {
    it('applies slide-in animation with delay', () => {
      const item = createMockOrderItem()

      const { container } = render(<OrderItemCard item={item} index={2} />)

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('slide-in')
      expect(card).toHaveStyle({ animationDelay: '0.2s' })
    })

    it('applies correct background styling', () => {
      const item = createMockOrderItem()

      const { container } = render(<OrderItemCard item={item} index={0} />)

      const card = container.firstChild
      expect(card).toHaveClass('bg-white/5')
      expect(card).toHaveClass('rounded-lg')
    })
  })

  describe('edge cases', () => {
    it('handles item with no variants or add-ons', () => {
      const item = createMockOrderItem({
        variants: [],
        addons: []
      })

      render(<OrderItemCard item={item} index={0} />)

      // Should not show variant or addon sections
      expect(screen.queryByText(/\+\$/)).not.toBeInTheDocument()
    })

    it('handles zero price modifier variant', () => {
      const variant = createMockVariant({
        name_en: 'Medium',
        price_modifier: 0
      })
      const item = createMockOrderItem({ variants: [variant] })

      render(<OrderItemCard item={item} index={0} />)

      expect(screen.getByText('Medium')).toBeInTheDocument()
      // Should not show +$0.00
      expect(screen.queryByText(/\+\$0\.00/)).not.toBeInTheDocument()
    })

    it('handles negative price modifier (discount)', () => {
      const variant = createMockVariant({
        name_en: 'Small',
        price_modifier: -2.00
      })
      const item = createMockOrderItem({ variants: [variant] })

      render(<OrderItemCard item={item} index={0} />)

      expect(screen.getByText(/Small/)).toBeInTheDocument()
      expect(screen.getByText(/-\$2\.00/)).toBeInTheDocument()
    })
  })
})
