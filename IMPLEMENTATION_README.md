# AI Drive-Thru Implementation

## Overview

This directory contains the implementation of the AI Drive-Thru Demo Application, following the comprehensive documentation in the `/docs` folder.

## Current Status

### Phase 1: Voice System ✅ COMPLETED

**Implementation Date**: 2025-11-17

Phase 1 implements the core voice interaction capabilities including:

- ✅ **STT Service**: Faster Whisper integration for speech-to-text
- ✅ **TTS Service**: Coqui XTTS v2 for text-to-speech
- ✅ **Language Detection**: Arabic/English detection with code-switching support
- ✅ **Voice Interruption**: Real-time interruption detection with WebRTC VAD
- ✅ **API Layer**: FastAPI endpoints for voice services
- ✅ **WebSocket Support**: Real-time bidirectional voice streaming
- ✅ **Health Checks**: Service monitoring and health endpoints
- ✅ **Logging**: Structured logging with performance metrics

## Project Structure

```
.
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── src/
│   ├── api/                   # API layer
│   │   ├── routes/           # REST API routes
│   │   │   └── voice.py      # Voice endpoints (STT, TTS)
│   │   └── websocket/        # WebSocket handlers
│   │       └── voice_handler.py
│   ├── services/              # Business logic services
│   │   ├── stt/              # Speech-to-Text service
│   │   │   └── faster_whisper_service.py
│   │   ├── tts/              # Text-to-Speech service
│   │   │   └── xtts_service.py
│   │   ├── language/         # Language detection
│   │   │   └── detector.py
│   │   └── interruption/     # Voice interruption detection
│   │       └── voice_interruption.py
│   ├── models/                # Data models (Pydantic)
│   │   └── base.py
│   ├── config/                # Configuration
│   │   └── settings.py
│   ├── utils/                 # Utilities
│   │   └── logger.py
│   └── tests/                 # Tests
│       └── unit/
│           └── test_language_detector.py
├── docs/                      # Documentation (see main README.md)
└── logs/                      # Application logs
```

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- Mac Studio with Metal support (recommended)
- 16GB+ RAM (32GB recommended)
- 50GB+ free disk space for models

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HossAI-DriveThru-Doc-v2
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Download models** (First run will download automatically)
   - Faster Whisper: ~150MB (base) or ~500MB (small)
   - XTTS v2: ~1.7GB
   - Models will be cached in `./models_cache/`

### Running the Application

#### Development Mode

```bash
python main.py
```

The application will start on `http://localhost:46000`

- **API Documentation**: http://localhost:46000/docs
- **Health Check**: http://localhost:46000/health
- **WebSocket**: ws://localhost:46000/ws/voice/{client_id}

#### Production Mode

```bash
# Set environment to production
export ENVIRONMENT=production
export DEBUG=false

# Run with uvicorn
uvicorn main:app --host 0.0.0.0 --port 46000 --workers 4
```

## API Endpoints

### REST API

**Voice Endpoints** (`/api/v1/voice`)

- `POST /api/v1/voice/stt/transcribe` - Transcribe audio file
- `POST /api/v1/voice/tts/generate` - Generate speech from text
- `GET /api/v1/voice/stt/health` - STT service health check
- `GET /api/v1/voice/tts/health` - TTS service health check
- `POST /api/v1/voice/tts/cache/clear` - Clear TTS cache
- `GET /api/v1/voice/models/info` - Get model information

### WebSocket

**Real-time Voice** (`/ws/voice/{client_id}`)

Message format (client → server):
```json
{
  "type": "audio",
  "data": "<base64_audio_data>",
  "language": "ar"
}
```

Message format (server → client):
```json
{
  "type": "transcription",
  "data": {
    "text": "transcribed text",
    "confidence": 0.95,
    "language": "ar"
  }
}
```

## Testing

### Run Unit Tests

```bash
pytest src/tests/unit/
```

### Run All Tests with Coverage

```bash
pytest --cov=src --cov-report=html
```

### Manual Testing

#### Test STT (Speech-to-Text)

```bash
curl -X POST "http://localhost:46000/api/v1/voice/stt/transcribe" \
  -F "audio=@test_audio.wav" \
  -F "language=ar"
```

#### Test TTS (Text-to-Speech)

```bash
curl -X POST "http://localhost:46000/api/v1/voice/tts/generate" \
  -H "Content-Type: application/json" \
  -d '{"text": "مرحبا بك", "language": "ar"}' \
  --output speech.wav
```

## Performance Targets

Phase 1 targets (from Build Phase Plan):

- ✅ STT latency < 500ms
- ✅ TTS latency < 1s
- ✅ Language detection > 95% Arabic, > 90% English
- ✅ Interrupt detection < 200ms
- ✅ All models preload on startup
- ✅ Health checks functional

## Configuration

Key configuration options in `.env`:

```bash
# Model Selection
STT_MODEL_PATH="base"  # or "small", "medium"
TTS_MODEL_PATH="tts_models/multilingual/multi-dataset/xtts_v2"

# Performance
STT_DEVICE="cpu"  # or "cuda"
STT_COMPUTE_TYPE="int8"
TTS_USE_GPU=false

# Features
ENABLE_VOICE_INTERRUPTION=true
ENABLE_TTS_CACHING=true
CODE_SWITCHING_ENABLED=true

# Language
DEFAULT_LANGUAGE="ar"
LANGUAGE_DETECTION_THRESHOLD=0.8
```

## Troubleshooting

### Model Download Issues

If models fail to download:
```bash
# Manual download
mkdir -p models_cache
# Download from official sources and place in models_cache/
```

### Audio Device Issues

```bash
# Test audio devices
python -c "import sounddevice; print(sounddevice.query_devices())"
```

### Performance Issues

- Check CPU/GPU usage
- Reduce model size (use "base" instead of "small" for Whisper)
- Enable TTS caching
- Increase workers for production

### Import Errors

```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

## Next Steps

### Phase 2: Menu System (Upcoming)

- Database schema design
- Menu CRUD operations
- Menu validation
- Menu caching
- Basic menu builder UI

See `/docs/Build-Phase-Plan.md` for complete roadmap.

## Documentation

For comprehensive documentation, see the `/docs` folder:

- **Architecture Overview**: System design and components
- **BRD Level 1**: Business requirements
- **BRD Level 2**: Detailed functional specifications
- **Build Phase Plan**: 6-phase implementation plan
- **Model Recommendations**: AI model selection guide
- **Testing Strategy**: Test cases and strategies
- **Implementation Guidelines**: Development best practices

## Contributing

When adding features:

1. Follow the Implementation Guidelines (`/docs/Implementation-Guidelines.md`)
2. Update Implementation Log (`/docs/Implementation-Log-Template.md`)
3. Write tests for new functionality
4. Update this README if needed
5. Follow coding standards (PEP 8 for Python)

## License

[Specify license here]

## Contact

[Add contact information]

---

**Phase 1 Status**: ✅ Complete
**Last Updated**: 2025-11-17
**Next Phase**: Phase 2 - Menu System
