# AI Drive-Thru Demo Application - Documentation Package

## Project Overview

This repository contains comprehensive documentation for a full AI Drive-Thru Demo Application designed to demonstrate natural conversational ordering with support for Arabic and English languages, including mixed code-switching. The system features a dynamic menu system, branch-linked configuration, real-time control panel, and advanced voice interaction capabilities.

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

11. **[Architecture Overview](docs/Architecture-Overview.md)**
    - System architecture, component interactions, and technology stack

## Quick Start Guide

### For Development Agents

1. **Read the Architecture Overview** to understand the system design
2. **Review the Build Phase Plan** to understand implementation phases
3. **Follow the Agent Prompt Template** for implementation guidelines
4. **Use the Implementation Log Template** to track your progress
5. **Reference BRD Level 2** for detailed functional specifications
6. **Use the Testing Strategy** to validate your implementation

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

1. **Phase 1**: Voice System (STT, TTS, language switching, interruption)
2. **Phase 2**: Menu System (dynamic menu builder, items, extras)
3. **Phase 3**: NLU + Intent System (classification, slot extraction)
4. **Phase 4**: Control Panel (dynamic configurations)
5. **Phase 5**: Full Demo UI (microphone, TTS indicator, order summary)
6. **Phase 6**: Integration + Stress Testing

See [Build Phase Plan](docs/Build-Phase-Plan.md) for detailed information.

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

1. Follow the [Agent Prompt Template](docs/Agent-Prompt-Template.md)
2. Update the [Implementation Log](docs/Implementation-Log-Template.md)
3. Follow the [Testing Strategy](docs/Testing-Strategy.md)
4. Reference [BRD Level 2](docs/BRD-Level-2-Functional-Specification.md) for specifications

## License

[Specify license here]

## Contact

[Add contact information]

---

**Last Updated**: [Date]
**Documentation Version**: 1.0
**Status**: Ready for Implementation
