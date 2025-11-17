"""
Speech-to-Text (STT) Service using Faster Whisper
Implements STT-001 to STT-003 requirements from Build Phase Plan
"""
import time
import asyncio
from typing import Optional, Tuple
from pathlib import Path
import numpy as np

try:
    from faster_whisper import WhisperModel
except ImportError:
    WhisperModel = None

from src.config import settings
from src.utils import logger, log_service_event, log_performance_metric, log_error
from src.models import (
    TranscriptionResponse,
    LanguageCode,
    ServiceStatus,
    HealthCheckResponse,
    ModelInfo
)


class FasterWhisperService:
    """
    Faster Whisper STT Service

    Provides speech-to-text conversion with:
    - Low latency (< 500ms target)
    - Arabic and English support
    - Metal acceleration on Mac Studio
    - Real-time audio streaming support
    """

    def __init__(self):
        self.model: Optional[WhisperModel] = None
        self.model_size = settings.stt_model_path
        self.device = settings.stt_device
        self.compute_type = settings.stt_compute_type
        self.status = ServiceStatus.INITIALIZING
        self.load_time_ms: Optional[float] = None

        log_service_event(
            "stt",
            "initialization",
            "Initializing Faster Whisper STT service",
            model_size=self.model_size,
            device=self.device,
            compute_type=self.compute_type
        )

    async def initialize(self) -> None:
        """
        Initialize and load the Faster Whisper model

        Raises:
            RuntimeError: If faster-whisper package is not installed
            Exception: If model loading fails
        """
        if WhisperModel is None:
            error_msg = "faster-whisper package not installed"
            log_error("stt", "ERR-VOICE-002", error_msg)
            self.status = ServiceStatus.ERROR
            raise RuntimeError(error_msg)

        try:
            start_time = time.time()

            # Create models cache directory if it doesn't exist
            models_dir = Path(settings.models_cache_dir)
            models_dir.mkdir(parents=True, exist_ok=True)

            log_service_event(
                "stt",
                "loading_model",
                f"Loading Faster Whisper model: {self.model_size}"
            )

            # Load model with specified configuration
            self.model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type,
                download_root=str(models_dir),
                num_workers=4  # Optimize for Mac Studio
            )

            self.load_time_ms = (time.time() - start_time) * 1000
            self.status = ServiceStatus.READY

            log_service_event(
                "stt",
                "model_loaded",
                f"Faster Whisper model loaded successfully",
                load_time_ms=self.load_time_ms,
                model_size=self.model_size
            )

            log_performance_metric(
                "stt",
                "model_load_time",
                self.load_time_ms,
                unit="ms"
            )

        except Exception as e:
            self.status = ServiceStatus.ERROR
            log_error(
                "stt",
                "ERR-VOICE-002",
                "Failed to load Faster Whisper model",
                exception=e
            )
            raise

    async def transcribe(
        self,
        audio_data: np.ndarray,
        language: Optional[str] = None,
        sample_rate: int = 16000
    ) -> TranscriptionResponse:
        """
        Transcribe audio to text

        Args:
            audio_data: Audio data as numpy array
            language: Optional language hint ('ar' or 'en')
            sample_rate: Audio sample rate (default 16000)

        Returns:
            TranscriptionResponse with transcribed text and metadata

        Raises:
            RuntimeError: If model not initialized
            Exception: If transcription fails
        """
        if self.model is None or self.status != ServiceStatus.READY:
            error_msg = "STT model not initialized"
            log_error("stt", "ERR-VOICE-002", error_msg)
            raise RuntimeError(error_msg)

        try:
            start_time = time.time()
            self.status = ServiceStatus.PROCESSING

            # Run transcription in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            segments, info = await loop.run_in_executor(
                None,
                lambda: self.model.transcribe(
                    audio_data,
                    language=language,
                    beam_size=5,
                    vad_filter=True,  # Voice Activity Detection
                    vad_parameters=dict(
                        threshold=0.5,
                        min_speech_duration_ms=250,
                        min_silence_duration_ms=100
                    )
                )
            )

            # Combine all segments into full transcript
            full_text = " ".join([segment.text for segment in segments])

            # Calculate latency
            latency_ms = (time.time() - start_time) * 1000

            # Determine detected language
            detected_lang = LanguageCode.ARABIC if info.language == "ar" else LanguageCode.ENGLISH

            # Get average confidence from segments
            avg_confidence = np.mean([segment.avg_logprob for segment in segments])
            # Convert logprob to confidence score (approximate)
            confidence = min(1.0, max(0.0, (avg_confidence + 1.0)))

            self.status = ServiceStatus.READY

            log_performance_metric(
                "stt",
                "transcription_latency",
                latency_ms,
                unit="ms",
                text_length=len(full_text),
                audio_duration=info.duration if hasattr(info, 'duration') else None
            )

            # Check if latency meets requirements (< 500ms)
            if latency_ms > settings.stt_latency_target:
                logger.warning(
                    f"STT latency {latency_ms}ms exceeds target {settings.stt_latency_target}ms",
                    latency_ms=latency_ms,
                    target_ms=settings.stt_latency_target
                )

            return TranscriptionResponse(
                text=full_text.strip(),
                confidence=confidence,
                language=detected_lang,
                metadata={
                    "latency_ms": latency_ms,
                    "audio_duration": info.duration if hasattr(info, 'duration') else None,
                    "language_probability": info.language_probability,
                    "num_segments": len(list(segments))
                }
            )

        except Exception as e:
            self.status = ServiceStatus.ERROR
            log_error(
                "stt",
                "ERR-VOICE-003",
                "STT transcription failed",
                exception=e
            )
            self.status = ServiceStatus.READY  # Reset to ready for retry
            raise

    async def transcribe_file(
        self,
        audio_file_path: str,
        language: Optional[str] = None
    ) -> TranscriptionResponse:
        """
        Transcribe audio from file

        Args:
            audio_file_path: Path to audio file
            language: Optional language hint

        Returns:
            TranscriptionResponse with transcribed text
        """
        if self.model is None or self.status != ServiceStatus.READY:
            raise RuntimeError("STT model not initialized")

        try:
            start_time = time.time()
            self.status = ServiceStatus.PROCESSING

            # Run transcription in thread pool
            loop = asyncio.get_event_loop()
            segments, info = await loop.run_in_executor(
                None,
                lambda: self.model.transcribe(
                    audio_file_path,
                    language=language,
                    beam_size=5,
                    vad_filter=True
                )
            )

            full_text = " ".join([segment.text for segment in segments])
            latency_ms = (time.time() - start_time) * 1000

            detected_lang = LanguageCode.ARABIC if info.language == "ar" else LanguageCode.ENGLISH

            # Approximate confidence from logprobs
            avg_confidence = np.mean([segment.avg_logprob for segment in segments])
            confidence = min(1.0, max(0.0, (avg_confidence + 1.0)))

            self.status = ServiceStatus.READY

            log_performance_metric(
                "stt",
                "file_transcription_latency",
                latency_ms,
                unit="ms"
            )

            return TranscriptionResponse(
                text=full_text.strip(),
                confidence=confidence,
                language=detected_lang,
                metadata={
                    "latency_ms": latency_ms,
                    "audio_duration": info.duration if hasattr(info, 'duration') else None,
                    "language_probability": info.language_probability,
                }
            )

        except Exception as e:
            self.status = ServiceStatus.ERROR
            log_error("stt", "ERR-VOICE-003", "File transcription failed", exception=e)
            self.status = ServiceStatus.READY
            raise

    async def health_check(self) -> HealthCheckResponse:
        """
        Perform health check on STT service

        Returns:
            HealthCheckResponse with service status
        """
        try:
            if self.model is None:
                return HealthCheckResponse(
                    service_name="stt",
                    status=ServiceStatus.ERROR,
                    error_message="Model not loaded"
                )

            # Perform quick test transcription
            start_time = time.time()
            # Create silent audio for test (1 second of silence)
            test_audio = np.zeros(16000, dtype=np.float32)

            # Run quick test
            await self.transcribe(test_audio, sample_rate=16000)

            latency_ms = (time.time() - start_time) * 1000

            return HealthCheckResponse(
                service_name="stt",
                status=self.status,
                latency_ms=latency_ms,
                metadata={
                    "model_size": self.model_size,
                    "device": self.device,
                    "load_time_ms": self.load_time_ms
                }
            )

        except Exception as e:
            log_error("stt", "HEALTH-001", "Health check failed", exception=e)
            return HealthCheckResponse(
                service_name="stt",
                status=ServiceStatus.ERROR,
                error_message=str(e)
            )

    def get_model_info(self) -> ModelInfo:
        """
        Get information about the loaded model

        Returns:
            ModelInfo with model details
        """
        return ModelInfo(
            model_name=f"faster-whisper-{self.model_size}",
            model_type="stt",
            loaded=(self.model is not None),
            load_time_ms=self.load_time_ms,
            device=self.device,
            quantization=self.compute_type
        )

    async def shutdown(self) -> None:
        """Shutdown the STT service"""
        log_service_event("stt", "shutdown", "Shutting down STT service")
        self.model = None
        self.status = ServiceStatus.STOPPED


# Global STT service instance
stt_service = FasterWhisperService()
