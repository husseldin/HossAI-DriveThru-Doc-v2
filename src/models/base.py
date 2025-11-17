"""
Base data models for AI Drive-Thru application
"""
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class LanguageCode(str, Enum):
    """Supported language codes"""
    ARABIC = "ar"
    ENGLISH = "en"


class TranscriptionResponse(BaseModel):
    """STT transcription response model"""
    text: str = Field(..., description="Transcribed text")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    language: LanguageCode = Field(..., description="Detected language")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = Field(default=None)


class TTSRequest(BaseModel):
    """TTS generation request model"""
    text: str = Field(..., min_length=1, description="Text to convert to speech")
    language: LanguageCode = Field(..., description="Target language")
    voice_config: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Voice configuration (speed, tone, etc.)"
    )


class TTSResponse(BaseModel):
    """TTS generation response model"""
    audio_data: bytes = Field(..., description="Generated audio data")
    duration: float = Field(..., description="Audio duration in seconds")
    sample_rate: int = Field(..., description="Audio sample rate")
    format: str = Field(default="wav", description="Audio format")


class LanguageDetectionResult(BaseModel):
    """Language detection result model"""
    detected_language: LanguageCode
    confidence: float = Field(..., ge=0.0, le=1.0)
    is_code_switching: bool = Field(default=False)
    secondary_language: Optional[LanguageCode] = None
    metadata: Optional[Dict[str, Any]] = None


class VoiceInterruptionEvent(BaseModel):
    """Voice interruption event model"""
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    confidence: float = Field(..., ge=0.0, le=1.0)
    audio_level: float
    interruption_type: str = Field(default="speech")  # speech, noise, silence


class ServiceStatus(str, Enum):
    """Service status enum"""
    INITIALIZING = "initializing"
    READY = "ready"
    PROCESSING = "processing"
    ERROR = "error"
    STOPPED = "stopped"


class HealthCheckResponse(BaseModel):
    """Health check response model"""
    service_name: str
    status: ServiceStatus
    latency_ms: Optional[float] = None
    error_message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Standard error response model"""
    error_code: str
    message: str
    component: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = None


class ModelInfo(BaseModel):
    """Model information model"""
    model_name: str
    model_type: str  # stt, tts, llm
    version: Optional[str] = None
    loaded: bool = False
    load_time_ms: Optional[float] = None
    memory_usage_mb: Optional[float] = None
    device: str = "cpu"
    quantization: Optional[str] = None
