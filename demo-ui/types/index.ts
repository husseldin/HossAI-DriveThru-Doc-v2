// Order Types
export interface OrderItem {
  id: string
  name_ar: string
  name_en: string
  base_price: number
  quantity: number
  variants: OrderVariant[]
  addons: OrderAddOn[]
  total: number
}

export interface OrderVariant {
  id: number
  name_ar: string
  name_en: string
  price_modifier: number
}

export interface OrderAddOn {
  id: number
  name_ar: string
  name_en: string
  price: number
}

export interface Order {
  items: OrderItem[]
  total: number
  created_at: string
}

// Voice Types
export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

export interface VoiceState {
  status: VoiceStatus
  isConnected: boolean
  currentTranscript: string
  lastResponse: string
  error: string | null
}

// WebSocket Message Types
export interface WSMessage {
  type: 'audio_chunk' | 'transcription' | 'tts_audio' | 'control' | 'error'
  data?: any
  text?: string
  language?: string
  audio?: string
  error?: string
}

// Workflow Types
export type WorkflowState = 'welcome' | 'ordering' | 'review' | 'confirmed' | 'thankyou'

// NLU Types
export interface NLUIntent {
  intent_type: string
  confidence: number
  slots: NLUSlot[]
}

export interface NLUSlot {
  slot_type: string
  value: string
  confidence: number
}

// Menu Types (simplified for demo)
export interface MenuItem {
  id: number
  name_ar: string
  name_en: string
  base_price: number
  category: string
}

// Store Types
export interface OrderStore {
  items: OrderItem[]
  total: number
  addItem: (item: OrderItem) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  clearOrder: () => void
  calculateTotal: () => void
}

export interface VoiceStore {
  status: VoiceStatus
  isConnected: boolean
  currentTranscript: string
  lastResponse: string
  error: string | null
  setStatus: (status: VoiceStatus) => void
  setConnected: (connected: boolean) => void
  setTranscript: (transcript: string) => void
  setResponse: (response: string) => void
  setError: (error: string | null) => void
  reset: () => void
}

export interface WorkflowStore {
  currentState: WorkflowState
  language: 'ar' | 'en'
  setCurrentState: (state: WorkflowState) => void
  setLanguage: (language: 'ar' | 'en') => void
  reset: () => void
}
