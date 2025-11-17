# AI Drive-Thru Demo Application

## Project Overview

This is a complete AI-powered drive-thru ordering system with full backend implementation. The application demonstrates natural conversational ordering with support for Arabic and English languages, including mixed code-switching. The system features a dynamic menu system, branch-linked configuration, advanced voice interaction capabilities, and NLU-powered intent detection.

## Implementation Status

**✅ Backend Implementation: 100% Complete**
- **Phase 1**: Voice System (STT, TTS, Language Detection, Interruption) - ✅ Complete
- **Phase 2**: Menu System (Dynamic Menu Builder, CRUD APIs) - ✅ Complete
- **Phase 3**: NLU + Intent System (Classification, Slot Extraction) - ✅ Complete

**⏳ Frontend Implementation: Pending**
- **Phase 4**: Control Panel UI (React/Next.js) - 📋 Not Started
- **Phase 5**: Demo UI (Voice Interface, Order Display) - 📋 Not Started
- **Phase 6**: Integration + Stress Testing - 📋 Not Started

### What's Working Now

- 27 REST API endpoints fully operational
- 1 WebSocket endpoint for real-time voice streaming
- PostgreSQL/MySQL database with 7 tables fully integrated
- Redis caching layer operational
- All AI models integrated (Faster Whisper, XTTS v2, Llama 3.1 8B)
- Complete menu management system
- Intent classification and slot extraction
- Bilingual support (Arabic-first with English detection)

### Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -c "from src.database import init_db; init_db()"

# Run the application
python main.py
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## Key Features

- **Multi-Language Support**: Arabic-first with intelligent English detection and mixed code-switching
- **Dynamic Menu System**: Fully configurable menu with categories, items, variants, and add-ons
- **Real-Time Control Panel**: All system configurations editable without code changes
- **Voice Interaction**: Advanced STT/TTS with interruption handling and keyword recognition
- **NLU Engine**: Intent detection, slot filling, and natural language understanding
- **Branch Management**: Support for multiple branches with branch-specific configurations
- **Performance Optimized**: Low-latency local models with GPU acceleration for Mac Studio

## Documentation Index

### Core Documentation

1. **[BRD Level 1 - Business Requirements](docs/BRD-Level-1-Business-Requirements.md)**
   - High-level business requirements, problem statement, success criteria, and KPIs

2. **[BRD Level 2 - Functional Specification](docs/BRD-Level-2-Functional-Specification.md)**
   - Detailed functional and system specifications for all layers and components

3. **[Workflow Diagrams](docs/Workflow-Diagrams.md)**
   - Complete workflow diagrams and voice interaction lifecycle documentation

4. **[UI/UX Specification](docs/UI-UX-Specification.md)**
   - Detailed page-by-page UI/UX specifications for all 15 application pages

5. **[Configuration System Specification](docs/Configuration-System-Specification.md)**
   - Dynamic configuration system architecture and real-time update mechanisms

6. **[Model Recommendations](docs/Model-Recommendations.md)**
   - Detailed analysis and recommendations for STT, TTS, and LLM/NLU models

7. **[Build Phase Plan](docs/Build-Phase-Plan.md)**
   - 6-phase implementation plan with deliverables and acceptance criteria

8. **[Testing Strategy](docs/Testing-Strategy.md)**
   - Comprehensive testing strategy and test cases for all system components

9. **[Implementation Log Template](docs/Implementation-Log-Template.md)**
   - Template for tracking implementation progress and logging changes

10. **[Agent Prompt Template](docs/Agent-Prompt-Template.md)**
    - Template and guidelines for development agents implementing the system

11. **[Implementation Guidelines](docs/Implementation-Guidelines.md)**
    - Comprehensive guidelines and best practices for development agents

12. **[Architecture Overview](docs/Architecture-Overview.md)**
    - System architecture, component interactions, and technology stack

## Quick Start Guide

### For Development Agents

1. **Read the Architecture Overview** to understand the system design
2. **Review the Build Phase Plan** to understand implementation phases
3. **Follow the Implementation Guidelines** for comprehensive development practices
4. **Use the Agent Prompt Template** for task-specific implementation guidance
5. **Use the Implementation Log Template** to track your progress
6. **Reference BRD Level 2** for detailed functional specifications
7. **Use the Testing Strategy** to validate your implementation

### For Project Managers

1. **Review BRD Level 1** for business requirements and success criteria
2. **Check the Build Phase Plan** for project timeline and milestones
3. **Monitor Implementation Logs** for progress tracking

### For System Architects

1. **Study the Architecture Overview** for system design
2. **Review Model Recommendations** for technology choices
3. **Examine Configuration System Specification** for system flexibility
4. **Analyze Workflow Diagrams** for system behavior

## Technology Stack

### Core Technologies
- **STT (Speech-to-Text)**: Faster Whisper / Whisper.cpp with Metal acceleration
- **TTS (Text-to-Speech)**: Coqui XTTS v2 / Bark Small
- **LLM/NLU**: Llama 3.1 8B/14B or Gemma 2 9B
- **Platform**: Mac Studio with GPU acceleration support

### Development Stack
- **Backend**: Python (FastAPI recommended)
- **Frontend**: React/Next.js (recommended for control panel)
- **Real-time Communication**: WebSocket for voice streaming
- **Configuration**: JSON/YAML with hot-reload capability

## System Requirements

- **Hardware**: Mac Studio (or compatible Mac with Metal support)
- **Memory**: Minimum 16GB RAM (32GB recommended)
- **Storage**: 50GB+ for models and cache
- **GPU**: Metal-accelerated GPU for optimal performance

## Architecture Overview

The system is designed with a modular architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  (Control Panel, Demo UI, Voice Interface)               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API Gateway Layer                      │
│         (REST API + WebSocket for Voice)                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Core Service Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   STT    │  │   TTS    │  │   NLU    │             │
│  │  Engine  │  │  Engine  │  │  Engine  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Menu    │  │ Workflow │  │  Cache   │             │
│  │ Manager  │  │  Engine  │  │ Manager  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Configuration & Data Layer                 │
│  (Dynamic Config, Menu Data, Branch Config, Logs)        │
└─────────────────────────────────────────────────────────┘
```

## Development Setup

### Prerequisites

1. Python 3.10+ installed
2. Node.js 18+ (for frontend development)
3. Git for version control
4. Mac Studio or compatible Mac with Metal support

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd HossAI-DriveThru-Doc-v2

# Review documentation
ls docs/

# Start with Architecture Overview
cat docs/Architecture-Overview.md
```

## Implementation Phases

The implementation is divided into 6 phases:

1. **Phase 1**: Voice System (STT, TTS, language switching, interruption) - ✅ **Complete**
2. **Phase 2**: Menu System (dynamic menu builder, items, extras) - ✅ **Complete**
3. **Phase 3**: NLU + Intent System (classification, slot extraction) - ✅ **Complete**
4. **Phase 4**: Control Panel (dynamic configurations) - ⏳ Requires Frontend
5. **Phase 5**: Full Demo UI (microphone, TTS indicator, order summary) - ⏳ Requires Frontend
6. **Phase 6**: Integration + Stress Testing - ⏳ Requires Phases 4-5

See [Build Phase Plan](docs/Build-Phase-Plan.md) for detailed information.
See [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md) for complete implementation details.

## Available API Endpoints

### Voice System APIs (Phase 1)
- `POST /api/v1/stt/transcribe` - Transcribe audio to text
- `POST /api/v1/tts/generate` - Generate speech from text
- `POST /api/v1/language/detect` - Detect language from text
- `GET /api/v1/stt/health` - STT service health check
- `GET /api/v1/tts/health` - TTS service health check
- `GET /api/v1/tts/voices` - List available TTS voices
- `GET /api/v1/models/info` - Get model information
- `WS /ws/voice/{client_id}` - Real-time voice streaming

### Menu System APIs (Phase 2)
- `POST /api/v1/branches` - Create branch
- `GET /api/v1/branches` - List branches
- `GET /api/v1/branches/{id}` - Get branch details
- `POST /api/v1/menus` - Create menu
- `GET /api/v1/menus` - List menus
- `POST /api/v1/menus/{id}/publish` - Publish menu
- `GET /api/v1/menus/{id}/validate` - Validate menu
- `POST /api/v1/categories` - Create category
- `POST /api/v1/items` - Create item
- `GET /api/v1/items/{id}` - Get item details
- `POST /api/v1/variants` - Create variant
- `POST /api/v1/addons` - Create add-on
- `POST /api/v1/keywords` - Create keyword
- `GET /api/v1/menus/{id}/full` - Get full menu with items

### NLU System APIs (Phase 3)
- `POST /api/v1/nlu/process` - Process text for intent and slots
- `POST /api/v1/nlu/keywords/match` - Match keywords from menu
- `GET /api/v1/nlu/health` - NLU service health check

### General APIs
- `GET /` - Root endpoint with API info
- `GET /health` - Overall system health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)

## Key System Behaviors

### Language Logic
- Arabic first by default
- Smart English detection (no full switch for 2-3 words)
- Non-Arabic speaker detection (e.g., Indian accent)
- Auto-switch or user prompt: "Do you prefer Arabic or English?"
- Automatic fallback mechanisms

### Voice Behavior
- Preload all models before user interaction
- Configurable wake/welcome message
- Health check before activation
- Mid-sentence interruption support
- Configurable TTS personality

### Menu System
- Support for N branches
- Fully dynamic menu from Control Panel
- Hierarchy: Category → Items → Variants → Extras/Add-ons
- Arabic + English menu versions
- Keyword mapping per item

## Success Criteria

- **Latency**: STT response < 500ms, TTS generation < 1s
- **Accuracy**: Voice recognition accuracy > 95% for Arabic, > 90% for English
- **Naturalness**: TTS voice naturalness score > 4.0/5.0
- **Uptime**: System availability > 99%
- **Performance**: Support concurrent users with stable streaming

## Contributing

When implementing features:

1. Follow the [Implementation Guidelines](docs/Implementation-Guidelines.md) for best practices
2. Use the [Agent Prompt Template](docs/Agent-Prompt-Template.md) for task structure
3. Update the [Implementation Log](docs/Implementation-Log-Template.md) regularly
4. Follow the [Testing Strategy](docs/Testing-Strategy.md) for quality assurance
5. Reference [BRD Level 2](docs/BRD-Level-2-Functional-Specification.md) for specifications

## License

[Specify license here]

## Contact

[Add contact information]

---

**Last Updated**: 2025-11-17
**Documentation Version**: 1.0
**Implementation Status**: Backend Complete (Phases 1-3) ✅ | Frontend Pending (Phases 4-6) ⏳
**Backend Version**: 1.0.0
