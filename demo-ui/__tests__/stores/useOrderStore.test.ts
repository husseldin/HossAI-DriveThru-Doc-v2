/**
 * Tests for useOrderStore
 */
import { renderHook, act } from '@testing-library/react'
import { useOrderStore } from '@/lib/store'
import { createMockOrderItem, createMockVariant, createMockAddOn } from '../utils/test-utils'

describe('useOrderStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useOrderStore())
    act(() => {
      result.current.clearOrder()
    })
  })

  describe('addItem', () => {
    it('adds a new item to the order', () => {
      const { result } = renderHook(() => useOrderStore())
      const mockItem = createMockOrderItem()

      act(() => {
        result.current.addItem(mockItem)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0]).toEqual(mockItem)
      expect(result.current.total).toBe(25.00)
    })

    it('increases quantity when adding same item', () => {
      const { result } = renderHook(() => useOrderStore())
      const mockItem = createMockOrderItem({ id: '1', quantity: 1 })

      act(() => {
        result.current.addItem(mockItem)
        result.current.addItem({ ...mockItem, quantity: 2 })
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(3)
    })

    it('adds multiple different items', () => {
      const { result } = renderHook(() => useOrderStore())
      const item1 = createMockOrderItem({ id: '1', name_en: 'Burger' })
      const item2 = createMockOrderItem({ id: '2', name_en: 'Pizza', base_price: 30.00, total: 30.00 })

      act(() => {
        result.current.addItem(item1)
        result.current.addItem(item2)
      })

      expect(result.current.items).toHaveLength(2)
      expect(result.current.total).toBe(55.00)
    })
  })

  describe('removeItem', () => {
    it('removes an item from the order', () => {
      const { result } = renderHook(() => useOrderStore())
      const mockItem = createMockOrderItem({ id: '1' })

      act(() => {
        result.current.addItem(mockItem)
        result.current.removeItem('1')
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.total).toBe(0)
    })

    it('only removes the specified item', () => {
      const { result } = renderHook(() => useOrderStore())
      const item1 = createMockOrderItem({ id: '1' })
      const item2 = createMockOrderItem({ id: '2', base_price: 30.00, total: 30.00 })

      act(() => {
        result.current.addItem(item1)
        result.current.addItem(item2)
        result.current.removeItem('1')
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].id).toBe('2')
      expect(result.current.total).toBe(30.00)
    })
  })

  describe('updateItemQuantity', () => {
    it('updates item quantity', () => {
      const { result } = renderHook(() => useOrderStore())
      const mockItem = createMockOrderItem({ id: '1', base_price: 25.00 })

      act(() => {
        result.current.addItem(mockItem)
        result.current.updateItemQuantity('1', 3)
      })

      expect(result.current.items[0].quantity).toBe(3)
      expect(result.current.items[0].total).toBe(75.00)
      expect(result.current.total).toBe(75.00)
    })

    it('removes item when quantity is 0', () => {
      const { result } = renderHook(() => useOrderStore())
      const mockItem = createMockOrderItem({ id: '1' })

      act(() => {
        result.current.addItem(mockItem)
        result.current.updateItemQuantity('1', 0)
      })

      expect(result.current.items).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      const { result } = renderHook(() => useOrderStore())
      const mockItem = createMockOrderItem({ id: '1' })

      act(() => {
        result.current.addItem(mockItem)
        result.current.updateItemQuantity('1', -1)
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('clearOrder', () => {
    it('clears all items and resets total', () => {
      const { result } = renderHook(() => useOrderStore())
      const item1 = createMockOrderItem({ id: '1' })
      const item2 = createMockOrderItem({ id: '2' })

      act(() => {
        result.current.addItem(item1)
        result.current.addItem(item2)
        result.current.clearOrder()
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.total).toBe(0)
    })
  })

  describe('calculateTotal', () => {
    it('calculates total with variants', () => {
      const { result } = renderHook(() => useOrderStore())
      const variant = createMockVariant({ price_modifier: 5.00 })
      const mockItem = createMockOrderItem({
        id: '1',
        base_price: 25.00,
        quantity: 1,
        variants: [variant],
        total: 30.00
      })

      act(() => {
        result.current.addItem(mockItem)
      })

      expect(result.current.total).toBe(30.00)
    })

    it('calculates total with add-ons', () => {
      const { result } = renderHook(() => useOrderStore())
      const addon = createMockAddOn({ price: 3.00 })
      const mockItem = createMockOrderItem({
        id: '1',
        base_price: 25.00,
        quantity: 1,
        addons: [addon],
        total: 28.00
      })

      act(() => {
        result.current.addItem(mockItem)
      })

      expect(result.current.total).toBe(28.00)
    })

    it('calculates total with variants, add-ons, and quantity', () => {
      const { result } = renderHook(() => useOrderStore())
      const variant = createMockVariant({ price_modifier: 5.00 })
      const addon = createMockAddOn({ price: 3.00 })
      const mockItem = createMockOrderItem({
        id: '1',
        base_price: 25.00,
        quantity: 2,
        variants: [variant],
        addons: [addon],
        total: 66.00  // (25 + 5 + 3) * 2
      })

      act(() => {
        result.current.addItem(mockItem)
      })

      expect(result.current.total).toBe(66.00)
    })

    it('calculates total with multiple variants and add-ons', () => {
      const { result } = renderHook(() => useOrderStore())
      const variant1 = createMockVariant({ id: 1, price_modifier: 5.00 })
      const variant2 = createMockVariant({ id: 2, price_modifier: 2.00 })
      const addon1 = createMockAddOn({ id: 1, price: 3.00 })
      const addon2 = createMockAddOn({ id: 2, price: 2.50 })

      const mockItem = createMockOrderItem({
        id: '1',
        base_price: 25.00,
        quantity: 1,
        variants: [variant1, variant2],
        addons: [addon1, addon2],
        total: 37.50  // 25 + 5 + 2 + 3 + 2.5
      })

      act(() => {
        result.current.addItem(mockItem)
      })

      expect(result.current.total).toBe(37.50)
    })
  })

  describe('edge cases', () => {
    it('handles empty order', () => {
      const { result } = renderHook(() => useOrderStore())

      expect(result.current.items).toHaveLength(0)
      expect(result.current.total).toBe(0)
    })

    it('handles item with zero price', () => {
      const { result } = renderHook(() => useOrderStore())
      const mockItem = createMockOrderItem({ base_price: 0, total: 0 })

      act(() => {
        result.current.addItem(mockItem)
      })

      expect(result.current.total).toBe(0)
    })
  })
})
