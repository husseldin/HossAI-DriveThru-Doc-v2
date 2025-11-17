# AI Drive-Thru Demo UI

Customer-facing voice interface for the AI Drive-Thru ordering system.

## Overview

The Demo UI provides an intuitive voice-first ordering experience for drive-thru customers. It connects to the backend API and uses WebSocket for real-time voice interaction.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **WebSocket**: Native WebSocket API
- **Audio**: Web Audio API + MediaRecorder
- **Notifications**: Sonner

## Project Structure

```
demo-ui/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Welcome/home page
│   ├── order/               # Ordering interface
│   │   └── page.tsx         # Main ordering page with voice
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── VoiceInterface.tsx   # Microphone and TTS controls
│   ├── OrderDisplay.tsx     # Current order summary
│   ├── OrderItem.tsx        # Individual order item
│   └── StatusIndicator.tsx  # System status indicators
├── lib/                     # Utility libraries
│   ├── websocket.ts         # WebSocket client
│   ├── audio.ts             # Audio recording utilities
│   └── store.ts             # Zustand store
└── types/                   # TypeScript types
    └── index.ts            # Type definitions

```

## Features

### Phase 5 Implementation Plan

#### ✅ Core Infrastructure (Complete)
- [x] Next.js 14 project setup
- [x] TypeScript configuration
- [x] Tailwind CSS styling
- [x] Project structure

#### 🚧 Voice Interface (Planned)
- [ ] Microphone button with visual feedback
- [ ] Audio recording (MediaRecorder API)
- [ ] WebSocket connection for audio streaming
- [ ] TTS playback with visual indicator
- [ ] Voice interruption handling
- [ ] Push-to-talk mode
- [ ] Continuous listening mode

#### 🚧 Order Management (Planned)
- [ ] Real-time order display
- [ ] Add items with variants and add-ons
- [ ] Modify existing items
- [ ] Remove items from order
- [ ] Running total calculation
- [ ] Order review screen
- [ ] Order confirmation

#### 🚧 WebSocket Integration (Planned)
- [ ] Connect to `/ws/voice/{client_id}`
- [ ] Send audio chunks (base64 encoded)
- [ ] Receive transcriptions
- [ ] Receive TTS audio responses
- [ ] Handle connection errors
- [ ] Automatic reconnection

#### 🚧 Workflow States (Planned)
- [ ] Welcome state (language selection)
- [ ] Ordering state (voice interaction)
- [ ] Review state (confirm order)
- [ ] Confirmation state (order placed)
- [ ] Thank you state

#### 🚧 UI/UX Features (Planned)
- [ ] Full-screen interface
- [ ] Large, readable text (accessibility)
- [ ] Visual feedback for all states
- [ ] Error messages and recovery
- [ ] Loading indicators
- [ ] Smooth transitions
- [ ] Responsive design

## Setup Instructions

### 1. Install Dependencies

```bash
cd demo-ui
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### 4. Ensure Backend is Running

Make sure the backend API is running:

```bash
# From project root
python main.py
```

## Usage Flow

### Customer Journey

1. **Welcome Screen**
   - Display welcome message
   - Language selection (Arabic/English)
   - "Start Order" button

2. **Voice Ordering**
   - Customer presses microphone button
   - Speaks their order
   - System transcribes and processes
   - TTS responds with confirmation
   - Order builds in real-time

3. **Order Review**
   - Display complete order
   - Show total price
   - Allow modifications
   - Confirm order button

4. **Confirmation**
   - Order number display
   - Estimated time
   - Thank you message

## Technical Implementation

### WebSocket Communication

```typescript
// Connect to voice WebSocket
const ws = new WebSocket(`ws://localhost:8000/ws/voice/${clientId}`)

// Send audio chunk
ws.send(JSON.stringify({
  type: 'audio_chunk',
  data: base64AudioData
}))

// Receive messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  // Handle transcription, TTS, etc.
}
```

### Audio Recording

```typescript
// Request microphone permission
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

// Create MediaRecorder
const mediaRecorder = new MediaRecorder(stream)

// Capture audio chunks
mediaRecorder.ondataavailable = (event) => {
  // Convert to base64 and send via WebSocket
}
```

### State Management

```typescript
// Zustand store
interface OrderState {
  items: OrderItem[]
  total: number
  status: 'idle' | 'listening' | 'processing' | 'speaking'
  addItem: (item: OrderItem) => void
  removeItem: (id: string) => void
  clearOrder: () => void
}
```

## API Integration

### REST Endpoints

- `GET /api/v1/menus/{id}/full` - Get published menu
- `POST /api/v1/nlu/process` - Process customer utterance
- `POST /api/v1/nlu/keywords/match` - Match keywords

### WebSocket Endpoint

- `WS /ws/voice/{client_id}` - Voice interaction

## Design Considerations

### Accessibility
- Large touch targets (min 48x48px)
- High contrast colors
- Clear visual feedback
- Screen reader support
- Keyboard navigation

### Performance
- Audio chunk size: 4KB recommended
- WebSocket reconnection: Exponential backoff
- TTS caching for common phrases
- Lazy loading for menu data

### Error Handling
- Network errors: Display retry button
- Microphone permission denied: Clear instructions
- WebSocket disconnect: Automatic reconnection
- NLU failures: Fallback to keyword matching

## Development Roadmap

### Immediate (MVP)
1. Welcome page with Start button
2. Basic microphone recording
3. WebSocket connection
4. Simple order display
5. Order total calculation

### Short-term
1. TTS playback with visual indicator
2. Order modification (add/remove items)
3. Voice interruption detection
4. Error recovery mechanisms
5. Order review and confirmation

### Long-term
1. Multi-language support (Arabic RTL)
2. Voice authentication
3. Order history
4. Payment integration
5. Receipt generation
6. Analytics and logging

## Testing

### Manual Testing Checklist
- [ ] Microphone permission request
- [ ] Audio recording works
- [ ] WebSocket connects successfully
- [ ] Order displays correctly
- [ ] Total calculates accurately
- [ ] Can modify order
- [ ] Can remove items
- [ ] Confirmation flow works

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Partial (WebSocket limitations)
- Mobile browsers: Requires testing

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### Hosting Options
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Self-hosted with PM2

## Current Status

**Phase 5 Progress**: Infrastructure setup complete

**Completed**:
- ✅ Project structure
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ Package dependencies

**In Progress**:
- 🚧 Voice interface components
- 🚧 WebSocket integration
- 🚧 Order management
- 🚧 Workflow states

**Not Started**:
- ⏳ Full UI implementation
- ⏳ Audio recording
- ⏳ TTS playback
- ⏳ Complete ordering workflow

## Contributing

When implementing features:
1. Follow TypeScript best practices
2. Use Tailwind for all styling
3. Keep components small and focused
4. Add proper error handling
5. Test on multiple browsers
6. Document complex logic

## Notes

- Demo UI runs on port 3001 to avoid conflicts with Control Panel (port 3000)
- WebSocket client ID should be unique per session (use UUID)
- Audio format: WAV, 16kHz, mono recommended
- Maximum order size: 20 items (configurable)
- Session timeout: 5 minutes of inactivity

## License

Same as parent project

---

**Version**: 1.0.0
**Status**: Infrastructure Complete | UI Implementation Pending
**Last Updated**: 2025-11-17
