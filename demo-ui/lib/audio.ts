export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private onDataCallback?: (audioData: string) => void

  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
          this.convertToBase64(event.data)
        }
      }

      console.log('AudioRecorder initialized')
    } catch (error) {
      console.error('Failed to initialize audio recorder:', error)
      throw new Error('Microphone permission denied or not available')
    }
  }

  start() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.audioChunks = []
      this.mediaRecorder.start(100) // Collect data every 100ms
      console.log('Recording started')
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
      console.log('Recording stopped')
    }
  }

  pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
      console.log('Recording paused')
    }
  }

  resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
      console.log('Recording resumed')
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  onData(callback: (audioData: string) => void) {
    this.onDataCallback = callback
  }

  private async convertToBase64(blob: Blob) {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      // Remove the data URL prefix
      const base64Data = base64.split(',')[1]
      this.onDataCallback?.(base64Data)
    }
    reader.readAsDataURL(blob)
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
    console.log('AudioRecorder cleaned up')
  }
}

// TTS Audio Player
export class TTSPlayer {
  private audio: HTMLAudioElement | null = null

  play(base64Audio: string) {
    // Stop any currently playing audio
    this.stop()

    // Create audio element
    this.audio = new Audio(`data:audio/wav;base64,${base64Audio}`)

    this.audio.play().catch((error) => {
      console.error('Failed to play TTS audio:', error)
    })
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
  }

  isPlaying(): boolean {
    return this.audio !== null && !this.audio.paused
  }

  onEnded(callback: () => void) {
    if (this.audio) {
      this.audio.onended = callback
    }
  }
}
