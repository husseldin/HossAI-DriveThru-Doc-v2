'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { useVoiceStore } from '@/lib/store'
import { AudioRecorder, TTSPlayer } from '@/lib/audio'
import { VoiceWebSocketClient, generateClientId } from '@/lib/websocket'
import { toast } from 'sonner'
import type { WSMessage } from '@/types'

interface VoiceInterfaceProps {
  onTranscript?: (text: string) => void
  onResponse?: (text: string) => void
}

export function VoiceInterface({ onTranscript, onResponse }: VoiceInterfaceProps) {
  const {
    status,
    isConnected,
    currentTranscript,
    lastResponse,
    setStatus,
    setConnected,
    setTranscript,
    setResponse,
    setError,
  } = useVoiceStore()

  const [isInitialized, setIsInitialized] = useState(false)
  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  const ttsPlayerRef = useRef<TTSPlayer | null>(null)
  const wsClientRef = useRef<VoiceWebSocketClient | null>(null)

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize audio recorder
        const recorder = new AudioRecorder()
        await recorder.initialize()
        audioRecorderRef.current = recorder

        // Initialize TTS player
        ttsPlayerRef.current = new TTSPlayer()

        // Initialize WebSocket
        const clientId = generateClientId()
        const wsClient = new VoiceWebSocketClient(clientId)

        wsClient.onConnect(() => {
          setConnected(true)
          console.log('Voice WebSocket connected')
        })

        wsClient.onDisconnect(() => {
          setConnected(false)
          console.log('Voice WebSocket disconnected')
        })

        wsClient.onError((error) => {
          setError(error)
          toast.error(error)
        })

        wsClient.onMessage((message: WSMessage) => {
          handleWSMessage(message)
        })

        wsClient.connect()
        wsClientRef.current = wsClient

        // Set up audio data callback
        recorder.onData((audioData) => {
          if (wsClient.isConnected()) {
            wsClient.sendAudioChunk(audioData)
          }
        })

        setIsInitialized(true)
        toast.success('Voice interface ready')
      } catch (error) {
        console.error('Failed to initialize voice interface:', error)
        setError('Failed to initialize microphone or voice connection')
        toast.error('Failed to initialize voice interface')
      }
    }

    init()

    // Cleanup on unmount
    return () => {
      audioRecorderRef.current?.cleanup()
      wsClientRef.current?.disconnect()
    }
  }, [])

  const handleWSMessage = (message: WSMessage) => {
    switch (message.type) {
      case 'transcription':
        if (message.text) {
          setTranscript(message.text)
          onTranscript?.(message.text)
          setStatus('processing')
        }
        break

      case 'tts_audio':
        if (message.audio) {
          setStatus('speaking')
          ttsPlayerRef.current?.play(message.audio)
          ttsPlayerRef.current?.onEnded(() => {
            setStatus('idle')
          })
        }
        if (message.text) {
          setResponse(message.text)
          onResponse?.(message.text)
        }
        break

      case 'error':
        setError(message.error || 'Unknown error')
        toast.error(message.error || 'Voice processing error')
        setStatus('error')
        break
    }
  }

  const toggleRecording = () => {
    if (!isInitialized) {
      toast.error('Voice interface not ready')
      return
    }

    if (!isConnected) {
      toast.error('Not connected to voice service')
      return
    }

    const recorder = audioRecorderRef.current
    if (!recorder) return

    if (recorder.isRecording()) {
      recorder.stop()
      setStatus('processing')
    } else {
      recorder.start()
      setStatus('listening')
      setTranscript('')
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'bg-red-500'
      case 'processing':
        return 'bg-yellow-500'
      case 'speaking':
        return 'bg-blue-500'
      case 'error':
        return 'bg-red-600'
      default:
        return 'bg-green-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening...'
      case 'processing':
        return 'Processing...'
      case 'speaking':
        return 'Speaking...'
      case 'error':
        return 'Error'
      default:
        return 'Ready'
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Microphone Button */}
      <div className="relative">
        <button
          onClick={toggleRecording}
          disabled={!isInitialized || !isConnected}
          className={`
            relative w-32 h-32 rounded-full flex items-center justify-center
            transition-all duration-300 transform hover:scale-110
            disabled:opacity-50 disabled:cursor-not-allowed
            ${getStatusColor()}
            ${status === 'listening' ? 'mic-active' : ''}
          `}
        >
          {status === 'listening' ? (
            <MicOff className="w-16 h-16 text-white" />
          ) : status === 'speaking' ? (
            <Volume2 className="w-16 h-16 text-white animate-pulse" />
          ) : (
            <Mic className="w-16 h-16 text-white" />
          )}
        </button>

        {/* Pulse ring for listening state */}
        {status === 'listening' && (
          <div className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping"></div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p className="text-2xl font-semibold text-white mb-2">
          {getStatusText()}
        </p>
        {!isConnected && (
          <p className="text-sm text-red-300">Connecting to voice service...</p>
        )}
      </div>

      {/* Current Transcript */}
      {currentTranscript && (
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-lg p-6 fade-in">
          <p className="text-sm text-white/70 mb-2">You said:</p>
          <p className="text-lg text-white">{currentTranscript}</p>
        </div>
      )}

      {/* Last Response */}
      {lastResponse && (
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-lg p-6 fade-in">
          <p className="text-sm text-white/70 mb-2">Assistant:</p>
          <p className="text-lg text-white">{lastResponse}</p>
        </div>
      )}

      {/* Instructions */}
      {status === 'idle' && (
        <div className="text-center text-white/80 max-w-md">
          <p className="text-sm">
            Press the microphone button and speak your order.
            <br />
            Press again to stop recording.
          </p>
        </div>
      )}
    </div>
  )
}
