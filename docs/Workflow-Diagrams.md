# Workflow Diagrams & Voice Interaction Lifecycle

## Document Information

- **Document Version**: 1.0
- **Date**: [Current Date]
- **Status**: Approved
- **Author**: Technical Documentation Team

## 1. Introduction

This document provides comprehensive workflow diagrams for the AI Drive-Thru Demo Application. All diagrams use Mermaid syntax for easy rendering in Markdown viewers and documentation systems.

## 2. App Boot Sequence

### 2.1 System Initialization Flow

```mermaid
flowchart TD
    A[System Start] --> B[Initialize Configuration]
    B --> C[Load Branch Config]
    C --> D[Initialize Cache Manager]
    D --> E[Start Model Preload]
    E --> F{Preload STT Model}
    F -->|Success| G{Preload TTS Model}
    F -->|Failure| ERR1[Error: STT Model Failed]
    G -->|Success| H{Preload LLM Model}
    G -->|Failure| ERR2[Error: TTS Model Failed]
    H -->|Success| I[Warm Up Pipelines]
    H -->|Failure| ERR3[Error: LLM Model Failed]
    I --> J[Run Health Check]
    J --> K{Health Check Pass?}
    K -->|Yes| L[Clean Old Cache]
    K -->|No| ERR4[Error: Health Check Failed]
    L --> M[Prepare NLU Patterns]
    M --> N[Load Menu Data]
    N --> O[System Ready]
    O --> P[Enable User Interaction]

    ERR1 --> RETRY1[Retry with Fallback Model]
    ERR2 --> RETRY2[Retry with Fallback Model]
    ERR3 --> RETRY3[Retry with Fallback Model]
    ERR4 --> RETRY4[Retry Health Check]

    RETRY1 --> F
    RETRY2 --> G
    RETRY3 --> H
    RETRY4 --> J

    style O fill:#90EE90
    style P fill:#90EE90
    style ERR1 fill:#FFB6C1
    style ERR2 fill:#FFB6C1
    style ERR3 fill:#FFB6C1
    style ERR4 fill:#FFB6C1
```

### 2.2 Model Preload Sequence

```mermaid
sequenceDiagram
    participant System
    participant PreloadManager
    participant STTModel
    participant TTSModel
    participant LLMModel
    participant Cache

    System->>PreloadManager: Start Preload
    PreloadManager->>STTModel: Load Model
    STTModel-->>PreloadManager: Model Loaded
    PreloadManager->>STTModel: Warm Up Pipeline
    STTModel-->>PreloadManager: Pipeline Ready

    PreloadManager->>TTSModel: Load Model
    TTSModel-->>PreloadManager: Model Loaded
    PreloadManager->>TTSModel: Warm Up Pipeline
    TTSModel-->>PreloadManager: Pipeline Ready

    PreloadManager->>LLMModel: Load Model
    LLMModel-->>PreloadManager: Model Loaded
    PreloadManager->>LLMModel: Warm Up Pipeline
    LLMModel-->>PreloadManager: Pipeline Ready

    PreloadManager->>Cache: Initialize Cache
    Cache-->>PreloadManager: Cache Ready
    PreloadManager-->>System: All Models Ready
```

## 3. User Interaction Flow

### 3.1 Complete User Interaction Cycle

```mermaid
flowchart TD
    START[User Starts Interaction] --> WELCOME[System Welcome Message]
    WELCOME --> LISTEN[System Listening State]
    LISTEN --> USER_SPEAKS[User Speaks]
    USER_SPEAKS --> STT[STT Processing]
    STT -->|Interrupt Detected| INTERRUPT[Handle Interruption]
    INTERRUPT --> LISTEN
    STT -->|Success| TEXT[Transcribed Text]
    STT -->|Failure| STT_ERR[STT Error Handling]
    STT_ERR --> RETRY_STT[Retry STT]
    RETRY_STT --> STT

    TEXT --> LANG[Language Detection]
    LANG -->|Arabic| AR_CONTEXT[Arabic Context]
    LANG -->|English| EN_CONTEXT[English Context]
    LANG -->|Mixed| MIXED_CONTEXT[Mixed Context]
    LANG -->|Uncertain| PROMPT_LANG[Prompt User for Language]
    PROMPT_LANG --> LISTEN

    AR_CONTEXT --> NLU
    EN_CONTEXT --> NLU
    MIXED_CONTEXT --> NLU

    NLU[NLU Processing] --> INTENT[Intent Classification]
    INTENT -->|Order Intent| ORDER_FLOW[Order Processing Flow]
    INTENT -->|Cancel Intent| CANCEL_FLOW[Cancel Flow]
    INTENT -->|Repeat Intent| REPEAT_FLOW[Repeat Flow]
    INTENT -->|Modify Intent| MODIFY_FLOW[Modify Flow]
    INTENT -->|Uncertain| CLARIFY[Clarification Question]

    ORDER_FLOW --> SLOTS[Slot Extraction]
    SLOTS -->|Complete| CONFIRM[Confirm Order Details]
    SLOTS -->|Incomplete| ASK_MISSING[Ask for Missing Info]
    ASK_MISSING --> LISTEN

    CONFIRM --> USER_RESPONSE{User Response}
    USER_RESPONSE -->|Confirm| ADD_ORDER[Add to Order]
    USER_RESPONSE -->|Modify| MODIFY_FLOW
    USER_RESPONSE -->|Cancel| CANCEL_FLOW

    ADD_ORDER --> CHECK_ADDONS{Has Add-ons?}
    CHECK_ADDONS -->|Yes| ASK_ADDONS[Ask About Add-ons]
    CHECK_ADDONS -->|No| ORDER_ADDED[Item Added to Order]
    ASK_ADDONS --> LISTEN

    ORDER_ADDED --> MORE_ITEMS{More Items?}
    MORE_ITEMS -->|Yes| LISTEN
    MORE_ITEMS -->|No| FINALIZE[Finalize Order]

    FINALIZE --> SUMMARY[Show Order Summary]
    SUMMARY --> TTS_GEN[TTS Generation]
    TTS_GEN --> AUDIO[Play Audio Response]
    AUDIO --> LISTEN

    CANCEL_FLOW --> CANCEL_CONFIRM[Confirm Cancellation]
    REPEAT_FLOW --> REPEAT_LAST[Repeat Last Message]
    MODIFY_FLOW --> MODIFY_ITEM[Modify Item Details]

    style START fill:#87CEEB
    style WELCOME fill:#90EE90
    style LISTEN fill:#FFD700
    style FINALIZE fill:#90EE90
    style SUMMARY fill:#90EE90
```

### 3.2 STT → NLU → LLM → Response Flow

```mermaid
sequenceDiagram
    participant User
    participant Microphone
    participant STTEngine
    participant LanguageDetector
    participant NLUEngine
    participant LLMEngine
    participant WorkflowEngine
    participant TTSEngine
    participant Speaker

    User->>Microphone: Speaks
    Microphone->>STTEngine: Audio Stream
    STTEngine->>STTEngine: Process Audio
    STTEngine-->>LanguageDetector: Transcribed Text

    LanguageDetector->>LanguageDetector: Detect Language
    LanguageDetector-->>NLUEngine: Text + Language

    NLUEngine->>NLUEngine: Extract Intent
    NLUEngine->>NLUEngine: Extract Slots
    NLUEngine->>NLUEngine: Match Keywords
    NLUEngine-->>LLMEngine: Intent + Slots + Context

    LLMEngine->>LLMEngine: Generate Response
    LLMEngine->>LLMEngine: Classify Intent
    LLMEngine->>LLMEngine: Fill Slots
    LLMEngine-->>WorkflowEngine: Response + Intent + Slots

    WorkflowEngine->>WorkflowEngine: Process Workflow
    WorkflowEngine->>WorkflowEngine: Update Order State
    WorkflowEngine-->>TTSEngine: Response Text + Language

    TTSEngine->>TTSEngine: Generate Speech
    TTSEngine-->>Speaker: Audio Stream
    Speaker-->>User: Plays Audio
```

## 4. Interrupt Handling Flow

### 4.1 Voice Interruption Detection and Handling

```mermaid
flowchart TD
    SYSTEM_SPEAKING[System Speaking/TTS Playing] --> MONITOR[Monitor for Interrupt]
    MONITOR --> USER_INPUT{User Input Detected?}
    USER_INPUT -->|No| CONTINUE[Continue TTS]
    CONTINUE --> MONITOR

    USER_INPUT -->|Yes| CHECK_CONFIDENCE{Interrupt Confidence > Threshold?}
    CHECK_CONFIDENCE -->|No| CONTINUE
    CHECK_CONFIDENCE -->|Yes| STOP_TTS[Stop TTS Immediately]

    STOP_TTS --> PROCESS_INTERRUPT[Process Interrupt Input]
    PROCESS_INTERRUPT --> STT_INTERRUPT[STT on Interrupt]
    STT_INTERRUPT --> INTENT_INTERRUPT[Determine Interrupt Intent]

    INTENT_INTERRUPT -->|Cancel| HANDLE_CANCEL[Handle Cancel]
    INTENT_INTERRUPT -->|Correction| HANDLE_CORRECT[Handle Correction]
    INTENT_INTERRUPT -->|New Request| HANDLE_NEW[Handle New Request]
    INTENT_INTERRUPT -->|Unclear| CLARIFY_INTERRUPT[Clarify Interrupt]

    HANDLE_CANCEL --> UPDATE_STATE[Update Workflow State]
    HANDLE_CORRECT --> UPDATE_STATE
    HANDLE_NEW --> UPDATE_STATE
    CLARIFY_INTERRUPT --> UPDATE_STATE

    UPDATE_STATE --> RESPOND[Generate Response]
    RESPOND --> TTS_NEW[Generate New TTS]
    TTS_NEW --> CONTINUE_CONV[Continue Conversation]

    style STOP_TTS fill:#FF6B6B
    style PROCESS_INTERRUPT fill:#FFD700
    style UPDATE_STATE fill:#90EE90
```

### 4.2 Interrupt State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Listening: User Interaction Started
    Listening --> Processing: User Speech Detected
    Processing --> Speaking: Response Generated
    Speaking --> Interrupted: User Interrupt Detected
    Interrupted --> Processing: Process Interrupt
    Speaking --> Listening: Response Complete
    Processing --> Listening: Processing Complete
    Listening --> Idle: Timeout
    Processing --> Error: Processing Failed
    Error --> Listening: Error Recovered
    Interrupted --> Listening: Interrupt Processed
```

## 5. Error Fallback Workflow

### 5.1 Error Handling and Recovery Flow

```mermaid
flowchart TD
    OPERATION[Any System Operation] --> SUCCESS{Operation Success?}
    SUCCESS -->|Yes| CONTINUE[Continue Normal Flow]

    SUCCESS -->|No| ERROR_TYPE{Error Type?}

    ERROR_TYPE -->|STT Error| STT_FALLBACK[STT Fallback]
    ERROR_TYPE -->|TTS Error| TTS_FALLBACK[TTS Fallback]
    ERROR_TYPE -->|NLU Error| NLU_FALLBACK[NLU Fallback]
    ERROR_TYPE -->|Model Error| MODEL_FALLBACK[Model Fallback]
    ERROR_TYPE -->|Network Error| NETWORK_FALLBACK[Network Fallback]

    STT_FALLBACK --> STT_RETRY{Retry Available?}
    STT_RETRY -->|Yes| RETRY_STT[Retry with Same Model]
    STT_RETRY -->|No| ALT_STT[Use Alternative STT Model]
    RETRY_STT --> STT_SUCCESS{Success?}
    ALT_STT --> STT_SUCCESS
    STT_SUCCESS -->|Yes| CONTINUE
    STT_SUCCESS -->|No| USER_NOTIFY_STT[Notify User: Please Repeat]

    TTS_FALLBACK --> TTS_RETRY{Retry Available?}
    TTS_RETRY -->|Yes| RETRY_TTS[Retry TTS Generation]
    TTS_RETRY -->|No| ALT_TTS[Use Alternative TTS Model]
    RETRY_TTS --> TTS_SUCCESS{Success?}
    ALT_TTS --> TTS_SUCCESS
    TTS_SUCCESS -->|Yes| CONTINUE
    TTS_SUCCESS -->|No| TEXT_FALLBACK[Display Text Instead]

    NLU_FALLBACK --> KEYWORD_MATCH[Use Keyword Matching]
    KEYWORD_MATCH --> KEYWORD_SUCCESS{Match Found?}
    KEYWORD_SUCCESS -->|Yes| CONTINUE
    KEYWORD_SUCCESS -->|No| CLARIFY_ERROR[Ask for Clarification]

    MODEL_FALLBACK --> CPU_FALLBACK[Fallback to CPU]
    CPU_FALLBACK --> CPU_SUCCESS{Success?}
    CPU_SUCCESS -->|Yes| CONTINUE
    CPU_SUCCESS -->|No| SIMPLE_MODEL[Use Simpler Model]

    NETWORK_FALLBACK --> LOCAL_ONLY[Use Local Models Only]
    LOCAL_ONLY --> CONTINUE

    USER_NOTIFY_STT --> LISTEN_AGAIN[Wait for User Input]
    TEXT_FALLBACK --> CONTINUE
    CLARIFY_ERROR --> LISTEN_AGAIN
    SIMPLE_MODEL --> CONTINUE
    LISTEN_AGAIN --> OPERATION

    style ERROR_TYPE fill:#FFB6C1
    style CONTINUE fill:#90EE90
    style USER_NOTIFY_STT fill:#FFD700
    style CLARIFY_ERROR fill:#FFD700
```

## 6. Menu & Add-on Logic Flow

### 6.1 Menu Item Selection and Add-on Flow

```mermaid
flowchart TD
    USER_MENTIONS[User Mentions Item] --> KEYWORD_MATCH[Keyword Matching]
    KEYWORD_MATCH --> MATCH_FOUND{Match Found?}
    MATCH_FOUND -->|No| CLARIFY_ITEM[Clarify Item Name]
    CLARIFY_ITEM --> USER_MENTIONS

    MATCH_FOUND -->|Yes| ITEM_IDENTIFIED[Item Identified]
    ITEM_IDENTIFIED --> HAS_VARIANTS{Has Variants?}

    HAS_VARIANTS -->|Yes| CHECK_SIZE{Size Mentioned?}
    CHECK_SIZE -->|No| ASK_SIZE[Ask for Size]
    ASK_SIZE --> USER_RESPONSE_SIZE[User Responds]
    USER_RESPONSE_SIZE --> SIZE_SELECTED[Size Selected]
    CHECK_SIZE -->|Yes| SIZE_SELECTED

    HAS_VARIANTS -->|No| CHECK_ADDONS

    SIZE_SELECTED --> CHECK_ADDONS{Has Add-ons?}
    CHECK_ADDONS -->|No| ADD_TO_ORDER[Add Item to Order]

    CHECK_ADDONS -->|Yes| CHECK_ADDON_LOGIC[Check Add-on Logic]
    CHECK_ADDON_LOGIC --> CONDITIONAL{Add-on Conditional?}

    CONDITIONAL -->|Always Ask| ASK_ADDON1[Ask About Add-on 1]
    CONDITIONAL -->|Conditional| CHECK_CONDITION{Condition Met?}
    CHECK_CONDITION -->|Yes| ASK_ADDON1
    CHECK_CONDITION -->|No| SKIP_ADDON[Skip Add-on]

    ASK_ADDON1 --> USER_RESPONSE_ADDON[User Responds]
    USER_RESPONSE_ADDON --> ADDON_SELECTED{Add-on Selected?}
    ADDON_SELECTED -->|Yes| ADD_ADDON[Add Add-on to Item]
    ADDON_SELECTED -->|No| NEXT_ADDON{More Add-ons?}

    ADD_ADDON --> NEXT_ADDON
    NEXT_ADDON -->|Yes| ASK_ADDON2[Ask About Next Add-on]
    NEXT_ADDON -->|No| ADD_TO_ORDER
    ASK_ADDON2 --> USER_RESPONSE_ADDON
    SKIP_ADDON --> ADD_TO_ORDER

    ADD_TO_ORDER --> CONFIRM_ITEM[Confirm Item Details]
    CONFIRM_ITEM --> TTS_CONFIRM[Generate TTS Confirmation]
    TTS_CONFIRM --> ITEM_ADDED[Item Added Successfully]

    style ITEM_IDENTIFIED fill:#90EE90
    style ADD_TO_ORDER fill:#90EE90
    style ITEM_ADDED fill:#90EE90
    style CLARIFY_ITEM fill:#FFD700
```

### 6.2 Add-on Branching Logic

```mermaid
flowchart LR
    ITEM[Item Selected] --> ADDON1{Add-on 1: Milk?}
    ADDON1 -->|Yes| ADDON2{Add-on 2: Sweetener?}
    ADDON1 -->|No| ADDON3{Add-on 3: Ice?}

    ADDON2 -->|Yes| ADDON4{Add-on 4: Sugar Amount?}
    ADDON2 -->|No| ADDON3

    ADDON4 -->|Yes| COMPLETE1[Item Complete]
    ADDON4 -->|No| COMPLETE1

    ADDON3 -->|Yes| COMPLETE2[Item Complete]
    ADDON3 -->|No| COMPLETE3[Item Complete]

    COMPLETE1 --> FINAL[Finalize Item]
    COMPLETE2 --> FINAL
    COMPLETE3 --> FINAL
```

## 7. Branch Dynamic Routing

### 7.1 Branch Configuration and Routing

```mermaid
flowchart TD
    REQUEST[Incoming Request] --> EXTRACT_BRANCH[Extract Branch ID]
    EXTRACT_BRANCH --> BRANCH_EXISTS{Branch Exists?}

    BRANCH_EXISTS -->|No| DEFAULT_BRANCH[Use Default Branch]
    BRANCH_EXISTS -->|Yes| LOAD_BRANCH_CONFIG[Load Branch Configuration]
    DEFAULT_BRANCH --> LOAD_BRANCH_CONFIG

    LOAD_BRANCH_CONFIG --> BRANCH_MENU[Load Branch Menu]
    BRANCH_MENU --> BRANCH_SETTINGS[Load Branch Settings]
    BRANCH_SETTINGS --> BRANCH_WORKFLOW[Load Branch Workflow Rules]

    BRANCH_WORKFLOW --> APPLY_CONFIG[Apply Branch Configuration]
    APPLY_CONFIG --> ROUTE_REQUEST[Route Request to Branch Handler]

    ROUTE_REQUEST --> PROCESS[Process Request with Branch Config]
    PROCESS --> RESPONSE[Generate Branch-Specific Response]

    style LOAD_BRANCH_CONFIG fill:#87CEEB
    style APPLY_CONFIG fill:#90EE90
    style RESPONSE fill:#90EE90
```

### 7.2 Multi-Branch Architecture

```mermaid
graph TB
    subgraph "System Core"
        API[API Gateway]
        ROUTER[Branch Router]
    end

    subgraph "Branch 1 - Demo"
        B1_CONFIG[Branch 1 Config]
        B1_MENU[Branch 1 Menu]
        B1_WORKFLOW[Branch 1 Workflow]
    end

    subgraph "Branch 2 - Production"
        B2_CONFIG[Branch 2 Config]
        B2_MENU[Branch 2 Menu]
        B2_WORKFLOW[Branch 2 Workflow]
    end

    subgraph "Shared Resources"
        MODELS[AI Models]
        CACHE[Cache Manager]
        LOGS[Logging System]
    end

    API --> ROUTER
    ROUTER -->|branch_id=1| B1_CONFIG
    ROUTER -->|branch_id=2| B2_CONFIG

    B1_CONFIG --> B1_MENU
    B1_CONFIG --> B1_WORKFLOW
    B2_CONFIG --> B2_MENU
    B2_CONFIG --> B2_WORKFLOW

    B1_WORKFLOW --> MODELS
    B2_WORKFLOW --> MODELS
    B1_WORKFLOW --> CACHE
    B2_WORKFLOW --> CACHE
    B1_WORKFLOW --> LOGS
    B2_WORKFLOW --> LOGS
```

## 8. Voice Interaction Lifecycle State Machine

### 8.1 Complete Voice Interaction State Machine

```mermaid
stateDiagram-v2
    [*] --> Initializing
    Initializing --> Preloading: Start Preload
    Preloading --> HealthChecking: Preload Complete
    HealthChecking --> Ready: Health Check Pass
    HealthChecking --> Error: Health Check Fail
    Error --> Preloading: Retry

    Ready --> Welcome: User Interaction Started
    Welcome --> Listening: Welcome Complete

    Listening --> Processing: User Speech Detected
    Processing --> Interrupted: Interrupt Detected
    Processing --> Speaking: Response Ready
    Processing --> Error: Processing Failed

    Interrupted --> Processing: Process Interrupt
    Speaking --> Interrupted: User Interrupts
    Speaking --> Listening: Response Complete
    Speaking --> Completed: Order Finalized

    Listening --> Timeout: No Input Timeout
    Timeout --> Listening: Retry
    Timeout --> Completed: Max Retries

    Error --> Listening: Error Recovered
    Error --> FatalError: Unrecoverable
    FatalError --> [*]

    Completed --> Listening: New Order
    Completed --> [*]: Session End
```

### 8.2 Order State Management

```mermaid
stateDiagram-v2
    [*] --> EmptyOrder
    EmptyOrder --> AddingItem: User Orders Item
    AddingItem --> ItemAdded: Item Confirmed
    AddingItem --> ItemCancelled: User Cancels

    ItemAdded --> AddingItem: User Orders More
    ItemAdded --> ModifyingOrder: User Modifies
    ItemAdded --> ReviewingOrder: User Reviews

    ModifyingOrder --> ItemModified: Modification Complete
    ItemModified --> ReviewingOrder: Continue Review
    ItemModified --> AddingItem: Add More Items

    ReviewingOrder --> ConfirmingOrder: User Confirms
    ReviewingOrder --> ModifyingOrder: User Modifies
    ReviewingOrder --> AddingItem: User Adds More

    ConfirmingOrder --> OrderCompleted: Confirmation Complete
    ItemCancelled --> EmptyOrder: Back to Start

    OrderCompleted --> [*]
```

## 9. Language Detection and Switching Flow

### 9.1 Language Detection Workflow

```mermaid
flowchart TD
    TEXT_INPUT[Text Input from STT] --> FEATURE_EXTRACT[Extract Language Features]
    FEATURE_EXTRACT --> TEXT_ANALYSIS[Text-Based Analysis]
    FEATURE_EXTRACT --> AUDIO_ANALYSIS[Audio-Based Analysis]

    TEXT_ANALYSIS --> ARABIC_SCORE[Arabic Score]
    TEXT_ANALYSIS --> ENGLISH_SCORE[English Score]
    TEXT_ANALYSIS --> MIXED_SCORE[Mixed Score]

    AUDIO_ANALYSIS --> ACCENT_DETECT[Accent Detection]
    ACCENT_DETECT --> ACCENT_SCORE[Accent Score]

    ARABIC_SCORE --> COMBINE[Combine Scores]
    ENGLISH_SCORE --> COMBINE
    MIXED_SCORE --> COMBINE
    ACCENT_SCORE --> COMBINE

    COMBINE --> CONFIDENCE{Confidence > Threshold?}
    CONFIDENCE -->|Yes| HIGH_CONF[High Confidence]
    CONFIDENCE -->|No| LOW_CONF[Low Confidence]

    HIGH_CONF --> CHECK_CODE_SWITCH{Code-Switching Detected?}
    CHECK_CODE_SWITCH -->|Yes| MIXED_LANG[Mixed Language Mode]
    CHECK_CODE_SWITCH -->|No| PRIMARY_LANG[Primary Language]

    LOW_CONF --> PROMPT_USER[Prompt User for Language]
    PROMPT_USER --> USER_CHOICE[User Selects Language]
    USER_CHOICE --> PRIMARY_LANG

    PRIMARY_LANG --> SET_LANG[Set System Language]
    MIXED_LANG --> SET_LANG
    SET_LANG --> CONTINUE[Continue Processing]

    style HIGH_CONF fill:#90EE90
    style PRIMARY_LANG fill:#87CEEB
    style MIXED_LANG fill:#FFD700
    style PROMPT_USER fill:#FFD700
```

## 10. Health Check Flow

### 10.1 Comprehensive Health Check Sequence

```mermaid
sequenceDiagram
    participant System
    participant HealthChecker
    participant STTModel
    participant TTSModel
    participant LLMModel
    participant MenuSystem
    participant Database
    participant Cache
    participant AudioDevices

    System->>HealthChecker: Start Health Check
    HealthChecker->>STTModel: Check STT Model
    STTModel-->>HealthChecker: STT Status

    HealthChecker->>TTSModel: Check TTS Model
    TTSModel-->>HealthChecker: TTS Status

    HealthChecker->>LLMModel: Check LLM Model
    LLMModel-->>HealthChecker: LLM Status

    HealthChecker->>MenuSystem: Check Menu System
    MenuSystem-->>HealthChecker: Menu Status

    HealthChecker->>Database: Check Database
    Database-->>HealthChecker: DB Status

    HealthChecker->>Cache: Check Cache
    Cache-->>HealthChecker: Cache Status

    HealthChecker->>AudioDevices: Check Audio Devices
    AudioDevices-->>HealthChecker: Audio Status

    HealthChecker->>HealthChecker: Aggregate Results
    HealthChecker-->>System: Health Check Result
```

---

**Document Status**: Complete
**Diagram Format**: Mermaid (compatible with GitHub, GitLab, and most Markdown viewers)
