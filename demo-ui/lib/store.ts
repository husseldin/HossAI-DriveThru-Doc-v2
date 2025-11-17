import { create } from 'zustand'
import type { OrderStore, VoiceStore, WorkflowStore, OrderItem } from '@/types'

// Order Store
export const useOrderStore = create<OrderStore>((set, get) => ({
  items: [],
  total: 0,

  addItem: (item: OrderItem) => {
    set((state) => {
      // Check if item already exists
      const existingIndex = state.items.findIndex((i) => i.id === item.id)

      if (existingIndex >= 0) {
        // Update quantity
        const newItems = [...state.items]
        newItems[existingIndex].quantity += item.quantity
        newItems[existingIndex].total =
          newItems[existingIndex].base_price * newItems[existingIndex].quantity
        return { items: newItems }
      } else {
        // Add new item
        return { items: [...state.items, item] }
      }
    })
    get().calculateTotal()
  },

  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }))
    get().calculateTotal()
  },

  updateItemQuantity: (id: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, quantity, total: item.base_price * quantity }
          : item
      ),
    }))
    get().calculateTotal()
  },

  clearOrder: () => {
    set({ items: [], total: 0 })
  },

  calculateTotal: () => {
    const items = get().items
    const total = items.reduce((sum, item) => {
      const variantTotal = item.variants.reduce(
        (vSum, v) => vSum + v.price_modifier,
        0
      )
      const addonTotal = item.addons.reduce((aSum, a) => aSum + a.price, 0)
      return sum + (item.base_price + variantTotal + addonTotal) * item.quantity
    }, 0)
    set({ total })
  },
}))

// Voice Store
export const useVoiceStore = create<VoiceStore>((set) => ({
  status: 'idle',
  isConnected: false,
  currentTranscript: '',
  lastResponse: '',
  error: null,

  setStatus: (status) => set({ status }),
  setConnected: (connected) => set({ isConnected: connected }),
  setTranscript: (transcript) => set({ currentTranscript: transcript }),
  setResponse: (response) => set({ lastResponse: response }),
  setError: (error) => set({ error }),

  reset: () =>
    set({
      status: 'idle',
      currentTranscript: '',
      lastResponse: '',
      error: null,
    }),
}))

// Workflow Store
export const useWorkflowStore = create<WorkflowStore>((set) => ({
  currentState: 'welcome',
  language: 'ar',

  setCurrentState: (state) => set({ currentState: state }),
  setLanguage: (language) => set({ language }),

  reset: () => set({ currentState: 'welcome', language: 'ar' }),
}))
