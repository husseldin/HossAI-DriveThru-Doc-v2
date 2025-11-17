/**
 * Tests for useVoiceStore
 */
import { renderHook, act } from '@testing-library/react'
import { useVoiceStore } from '@/lib/store'

describe('useVoiceStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useVoiceStore())
    act(() => {
      result.current.reset()
    })
  })

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useVoiceStore())

    expect(result.current.status).toBe('idle')
    expect(result.current.isConnected).toBe(false)
    expect(result.current.currentTranscript).toBe('')
    expect(result.current.lastResponse).toBe('')
    expect(result.current.error).toBeNull()
  })

  describe('setStatus', () => {
    it('updates status to listening', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setStatus('listening')
      })

      expect(result.current.status).toBe('listening')
    })

    it('updates status to processing', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setStatus('processing')
      })

      expect(result.current.status).toBe('processing')
    })

    it('updates status to speaking', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setStatus('speaking')
      })

      expect(result.current.status).toBe('speaking')
    })

    it('updates status to error', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setStatus('error')
      })

      expect(result.current.status).toBe('error')
    })
  })

  describe('setConnected', () => {
    it('sets connection status to true', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setConnected(true)
      })

      expect(result.current.isConnected).toBe(true)
    })

    it('sets connection status to false', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setConnected(true)
        result.current.setConnected(false)
      })

      expect(result.current.isConnected).toBe(false)
    })
  })

  describe('setTranscript', () => {
    it('updates current transcript', () => {
      const { result } = renderHook(() => useVoiceStore())
      const transcript = 'أريد برجر كبير'

      act(() => {
        result.current.setTranscript(transcript)
      })

      expect(result.current.currentTranscript).toBe(transcript)
    })

    it('overwrites previous transcript', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setTranscript('first transcript')
        result.current.setTranscript('second transcript')
      })

      expect(result.current.currentTranscript).toBe('second transcript')
    })

    it('handles empty transcript', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setTranscript('')
      })

      expect(result.current.currentTranscript).toBe('')
    })
  })

  describe('setResponse', () => {
    it('updates last response', () => {
      const { result } = renderHook(() => useVoiceStore())
      const response = 'تم إضافة برجر كبير إلى طلبك'

      act(() => {
        result.current.setResponse(response)
      })

      expect(result.current.lastResponse).toBe(response)
    })

    it('overwrites previous response', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setResponse('first response')
        result.current.setResponse('second response')
      })

      expect(result.current.lastResponse).toBe('second response')
    })
  })

  describe('setError', () => {
    it('sets error message', () => {
      const { result } = renderHook(() => useVoiceStore())
      const error = 'Connection failed'

      act(() => {
        result.current.setError(error)
      })

      expect(result.current.error).toBe(error)
    })

    it('clears error when set to null', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setError('error')
        result.current.setError(null)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('reset', () => {
    it('resets all state to initial values', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setStatus('listening')
        result.current.setConnected(true)
        result.current.setTranscript('test transcript')
        result.current.setResponse('test response')
        result.current.setError('test error')
        result.current.reset()
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.currentTranscript).toBe('')
      expect(result.current.lastResponse).toBe('')
      expect(result.current.error).toBeNull()
      // Note: isConnected is not reset by reset()
    })

    it('does not reset connection status', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setConnected(true)
        result.current.reset()
      })

      expect(result.current.isConnected).toBe(true)
    })
  })

  describe('workflow scenarios', () => {
    it('handles complete voice interaction flow', () => {
      const { result } = renderHook(() => useVoiceStore())

      // Connect
      act(() => {
        result.current.setConnected(true)
      })
      expect(result.current.isConnected).toBe(true)

      // Start listening
      act(() => {
        result.current.setStatus('listening')
      })
      expect(result.current.status).toBe('listening')

      // Processing
      act(() => {
        result.current.setStatus('processing')
        result.current.setTranscript('أريد برجر')
      })
      expect(result.current.status).toBe('processing')
      expect(result.current.currentTranscript).toBe('أريد برجر')

      // Speaking response
      act(() => {
        result.current.setStatus('speaking')
        result.current.setResponse('تم إضافة برجر')
      })
      expect(result.current.status).toBe('speaking')
      expect(result.current.lastResponse).toBe('تم إضافة برجر')

      // Back to idle
      act(() => {
        result.current.setStatus('idle')
      })
      expect(result.current.status).toBe('idle')
    })

    it('handles error scenario', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setStatus('listening')
        result.current.setStatus('error')
        result.current.setError('Microphone access denied')
      })

      expect(result.current.status).toBe('error')
      expect(result.current.error).toBe('Microphone access denied')
    })

    it('handles disconnection and reconnection', () => {
      const { result } = renderHook(() => useVoiceStore())

      act(() => {
        result.current.setConnected(true)
        result.current.setStatus('listening')
      })

      // Disconnect
      act(() => {
        result.current.setConnected(false)
        result.current.setStatus('error')
        result.current.setError('Connection lost')
      })

      expect(result.current.isConnected).toBe(false)
      expect(result.current.status).toBe('error')

      // Reconnect
      act(() => {
        result.current.setConnected(true)
        result.current.reset()
      })

      expect(result.current.isConnected).toBe(true)
      expect(result.current.status).toBe('idle')
      expect(result.current.error).toBeNull()
    })
  })
})
