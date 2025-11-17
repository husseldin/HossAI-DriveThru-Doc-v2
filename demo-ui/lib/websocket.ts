import type { WSMessage } from '@/types'

export class VoiceWebSocketClient {
  private ws: WebSocket | null = null
  private clientId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000

  private onMessageCallback?: (message: WSMessage) => void
  private onConnectCallback?: () => void
  private onDisconnectCallback?: () => void
  private onErrorCallback?: (error: string) => void

  constructor(clientId: string) {
    this.clientId = clientId
  }

  connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:46000'
    const url = `${wsUrl}/ws/voice/${this.clientId}`

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.onConnectCallback?.()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          this.onMessageCallback?.(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.onErrorCallback?.('WebSocket connection error')
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.onDisconnectCallback?.()
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      this.onErrorCallback?.('Failed to connect to voice service')
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
      )

      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      this.onErrorCallback?.(
        'Failed to reconnect to voice service after multiple attempts'
      )
    }
  }

  sendAudioChunk(audioData: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'audio_chunk',
          data: audioData,
        })
      )
    } else {
      console.warn('WebSocket not connected, cannot send audio')
    }
  }

  sendControl(command: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'control',
          data: command,
        })
      )
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  onMessage(callback: (message: WSMessage) => void) {
    this.onMessageCallback = callback
  }

  onConnect(callback: () => void) {
    this.onConnectCallback = callback
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback
  }
}

// Utility function to create a unique client ID
export function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
