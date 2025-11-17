/**
 * Tests for useWorkflowStore
 */
import { renderHook, act } from '@testing-library/react'
import { useWorkflowStore } from '@/lib/store'

describe('useWorkflowStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { result } = renderHook(() => useWorkflowStore())
    act(() => {
      result.current.setCurrentState('welcome')
      result.current.setLanguage('ar')
    })
  })

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useWorkflowStore())

    expect(result.current.currentState).toBe('welcome')
    expect(result.current.language).toBe('ar')
  })

  describe('setCurrentState', () => {
    it('updates to ordering state', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setCurrentState('ordering')
      })

      expect(result.current.currentState).toBe('ordering')
    })

    it('updates to review state', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setCurrentState('review')
      })

      expect(result.current.currentState).toBe('review')
    })

    it('updates to confirmation state', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setCurrentState('confirmation')
      })

      expect(result.current.currentState).toBe('confirmation')
    })

    it('can return to welcome state', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setCurrentState('ordering')
        result.current.setCurrentState('welcome')
      })

      expect(result.current.currentState).toBe('welcome')
    })
  })

  describe('setLanguage', () => {
    it('sets language to English', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setLanguage('en')
      })

      expect(result.current.language).toBe('en')
    })

    it('sets language to Arabic', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setLanguage('en')
        result.current.setLanguage('ar')
      })

      expect(result.current.language).toBe('ar')
    })

    it('language persists across state changes', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setLanguage('en')
        result.current.setCurrentState('ordering')
      })

      expect(result.current.language).toBe('en')
      expect(result.current.currentState).toBe('ordering')
    })
  })

  describe('workflow scenarios', () => {
    it('handles complete ordering workflow in Arabic', () => {
      const { result } = renderHook(() => useWorkflowStore())

      // Start at welcome
      expect(result.current.currentState).toBe('welcome')
      expect(result.current.language).toBe('ar')

      // Select language and start ordering
      act(() => {
        result.current.setLanguage('ar')
        result.current.setCurrentState('ordering')
      })

      expect(result.current.currentState).toBe('ordering')
      expect(result.current.language).toBe('ar')

      // Review order
      act(() => {
        result.current.setCurrentState('review')
      })

      expect(result.current.currentState).toBe('review')

      // Confirm order
      act(() => {
        result.current.setCurrentState('confirmation')
      })

      expect(result.current.currentState).toBe('confirmation')
    })

    it('handles complete ordering workflow in English', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setLanguage('en')
        result.current.setCurrentState('ordering')
        result.current.setCurrentState('review')
        result.current.setCurrentState('confirmation')
      })

      expect(result.current.currentState).toBe('confirmation')
      expect(result.current.language).toBe('en')
    })

    it('handles order cancellation and restart', () => {
      const { result } = renderHook(() => useWorkflowStore())

      // Start ordering
      act(() => {
        result.current.setLanguage('en')
        result.current.setCurrentState('ordering')
      })

      // Cancel and return to welcome
      act(() => {
        result.current.setCurrentState('welcome')
        result.current.setLanguage('ar')  // Reset to default language
      })

      expect(result.current.currentState).toBe('welcome')
      expect(result.current.language).toBe('ar')
    })

    it('handles going back from review to ordering', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setCurrentState('ordering')
        result.current.setCurrentState('review')
        result.current.setCurrentState('ordering')  // Go back
      })

      expect(result.current.currentState).toBe('ordering')
    })

    it('maintains language when switching states', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setLanguage('en')
      })

      const states = ['ordering', 'review', 'confirmation', 'welcome']
      states.forEach(state => {
        act(() => {
          result.current.setCurrentState(state as any)
        })
        expect(result.current.language).toBe('en')
      })
    })
  })

  describe('edge cases', () => {
    it('handles rapid state changes', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setCurrentState('ordering')
        result.current.setCurrentState('review')
        result.current.setCurrentState('ordering')
        result.current.setCurrentState('review')
        result.current.setCurrentState('confirmation')
      })

      expect(result.current.currentState).toBe('confirmation')
    })

    it('handles language switching during ordering', () => {
      const { result } = renderHook(() => useWorkflowStore())

      act(() => {
        result.current.setCurrentState('ordering')
        result.current.setLanguage('en')
        result.current.setLanguage('ar')
        result.current.setLanguage('en')
      })

      expect(result.current.language).toBe('en')
      expect(result.current.currentState).toBe('ordering')
    })
  })
})
