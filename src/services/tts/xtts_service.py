"""
Text-to-Speech (TTS) Service using Coqui XTTS v2
Implements TTS-001 to TTS-002 requirements from Build Phase Plan
"""
import time
import asyncio
import io
import hashlib
from typing import Optional, Dict, Any
from pathlib import Path
import numpy as np

try:
    from TTS.api import TTS
except ImportError:
    TTS = None

from src.config import settings
from src.utils import logger, log_service_event, log_performance_metric, log_error
from src.models import (
    TTSRequest,
    TTSResponse,
    LanguageCode,
    ServiceStatus,
    HealthCheckResponse,
    ModelInfo
)


class XTTSService:
    """
    Coqui XTTS v2 TTS Service

    Provides text-to-speech conversion with:
    - Low latency (< 1s target)
    - Arabic and English support
    - High-quality, natural-sounding speech
    - Voice cloning capabilities
    - TTS output caching
    """

    def __init__(self):
        self.model: Optional[TTS] = None
        self.model_name = settings.tts_model_path
        self.use_gpu = settings.tts_use_gpu
        self.status = ServiceStatus.INITIALIZING
        self.load_time_ms: Optional[float] = None
        self.cache: Dict[str, bytes] = {}  # In-memory cache for TTS outputs
        self.cache_enabled = settings.enable_tts_caching

        log_service_event(
            "tts",
            "initialization",
            "Initializing Coqui XTTS v2 TTS service",
            model_name=self.model_name,
            use_gpu=self.use_gpu,
            cache_enabled=self.cache_enabled
        )

    async def initialize(self) -> None:
        """
        Initialize and load the XTTS v2 model

        Raises:
            RuntimeError: If TTS package is not installed
            Exception: If model loading fails
        """
        if TTS is None:
            error_msg = "TTS package not installed"
            log_error("tts", "ERR-VOICE-002", error_msg)
            self.status = ServiceStatus.ERROR
            raise RuntimeError(error_msg)

        try:
            start_time = time.time()

            # Create models cache directory if it doesn't exist
            models_dir = Path(settings.models_cache_dir)
            models_dir.mkdir(parents=True, exist_ok=True)

            log_service_event(
                "tts",
                "loading_model",
                f"Loading Coqui XTTS v2 model: {self.model_name}"
            )

            # Load XTTS v2 model
            self.model = TTS(
                model_name=self.model_name,
                progress_bar=False,
                gpu=self.use_gpu
            )

            self.load_time_ms = (time.time() - start_time) * 1000
            self.status = ServiceStatus.READY

            log_service_event(
                "tts",
                "model_loaded",
                f"XTTS v2 model loaded successfully",
                load_time_ms=self.load_time_ms
            )

            log_performance_metric(
                "tts",
                "model_load_time",
                self.load_time_ms,
                unit="ms"
            )

        except Exception as e:
            self.status = ServiceStatus.ERROR
            log_error(
                "tts",
                "ERR-VOICE-002",
                "Failed to load XTTS v2 model",
                exception=e
            )
            raise

    def _generate_cache_key(
        self,
        text: str,
        language: str,
        voice_config: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate cache key for TTS request"""
        cache_data = f"{text}:{language}:{str(voice_config)}"
        return hashlib.md5(cache_data.encode()).hexdigest()

    async def generate_speech(
        self,
        tts_request: TTSRequest
    ) -> TTSResponse:
        """
        Generate speech from text

        Args:
            tts_request: TTS request with text and configuration

        Returns:
            TTSResponse with generated audio

        Raises:
            RuntimeError: If model not initialized
            Exception: If speech generation fails
        """
        if self.model is None or self.status != ServiceStatus.READY:
            error_msg = "TTS model not initialized"
            log_error("tts", "ERR-VOICE-002", error_msg)
            raise RuntimeError(error_msg)

        # Check cache first
        if self.cache_enabled:
            cache_key = self._generate_cache_key(
                tts_request.text,
                tts_request.language.value,
                tts_request.voice_config
            )
            if cache_key in self.cache:
                logger.debug(
                    "TTS cache hit",
                    cache_key=cache_key,
                    text_length=len(tts_request.text)
                )
                return TTSResponse(
                    audio_data=self.cache[cache_key],
                    duration=0.0,  # Duration not tracked for cached responses
                    sample_rate=22050,
                    format="wav"
                )

        try:
            start_time = time.time()
            self.status = ServiceStatus.PROCESSING

            # Extract voice configuration
            voice_config = tts_request.voice_config or {}
            speed = voice_config.get("speed", 1.0)

            # Convert language code to full name
            language = "Arabic" if tts_request.language == LanguageCode.ARABIC else "English"

            # Generate speech in thread pool to avoid blocking
            loop = asyncio.get_event_loop()

            # Create temporary file for output
            temp_output = io.BytesIO()

            # Run TTS generation
            await loop.run_in_executor(
                None,
                lambda: self.model.tts_to_file(
                    text=tts_request.text,
                    file_path=temp_output,
                    speaker_wav=voice_config.get("speaker_wav"),
                    language=tts_request.language.value,
                    speed=speed
                )
            )

            # Get audio data
            audio_data = temp_output.getvalue()

            # Calculate latency
            latency_ms = (time.time() - start_time) * 1000

            # Estimate duration (rough approximation)
            # Typical speech rate is ~150 words per minute
            word_count = len(tts_request.text.split())
            estimated_duration = (word_count / 150.0) * 60.0 / speed

            self.status = ServiceStatus.READY

            log_performance_metric(
                "tts",
                "generation_latency",
                latency_ms,
                unit="ms",
                text_length=len(tts_request.text),
                word_count=word_count,
                language=tts_request.language.value
            )

            # Check if latency meets requirements (< 1000ms)
            if latency_ms > settings.tts_latency_target:
                logger.warning(
                    f"TTS latency {latency_ms}ms exceeds target {settings.tts_latency_target}ms",
                    latency_ms=latency_ms,
                    target_ms=settings.tts_latency_target
                )

            # Cache the result if caching is enabled
            if self.cache_enabled and len(self.cache) < 1000:  # Limit cache size
                cache_key = self._generate_cache_key(
                    tts_request.text,
                    tts_request.language.value,
                    tts_request.voice_config
                )
                self.cache[cache_key] = audio_data
                logger.debug("TTS response cached", cache_key=cache_key)

            return TTSResponse(
                audio_data=audio_data,
                duration=estimated_duration,
                sample_rate=22050,  # XTTS v2 default sample rate
                format="wav"
            )

        except Exception as e:
            self.status = ServiceStatus.ERROR
            log_error(
                "tts",
                "ERR-VOICE-004",
                "TTS generation failed",
                exception=e,
                text=tts_request.text[:100]  # Log first 100 chars
            )
            self.status = ServiceStatus.READY  # Reset to ready for retry
            raise

    async def generate_speech_streaming(
        self,
        text: str,
        language: LanguageCode,
        voice_config: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Generate speech with streaming (placeholder for future implementation)

        Args:
            text: Text to convert to speech
            language: Target language
            voice_config: Optional voice configuration

        Returns:
            Audio data as bytes

        Note:
            Streaming implementation would yield chunks of audio data
            Current implementation returns complete audio
        """
        request = TTSRequest(
            text=text,
            language=language,
            voice_config=voice_config
        )
        response = await self.generate_speech(request)
        return response.audio_data

    def clear_cache(self) -> int:
        """
        Clear TTS cache

        Returns:
            Number of cached items cleared
        """
        cache_size = len(self.cache)
        self.cache.clear()
        log_service_event(
            "tts",
            "cache_cleared",
            f"Cleared {cache_size} cached TTS responses"
        )
        return cache_size

    async def health_check(self) -> HealthCheckResponse:
        """
        Perform health check on TTS service

        Returns:
            HealthCheckResponse with service status
        """
        try:
            if self.model is None:
                return HealthCheckResponse(
                    service_name="tts",
                    status=ServiceStatus.ERROR,
                    error_message="Model not loaded"
                )

            # Perform quick test generation
            start_time = time.time()
            test_request = TTSRequest(
                text="مرحبا",  # "Hello" in Arabic
                language=LanguageCode.ARABIC
            )

            await self.generate_speech(test_request)

            latency_ms = (time.time() - start_time) * 1000

            return HealthCheckResponse(
                service_name="tts",
                status=self.status,
                latency_ms=latency_ms,
                metadata={
                    "model_name": self.model_name,
                    "use_gpu": self.use_gpu,
                    "load_time_ms": self.load_time_ms,
                    "cache_size": len(self.cache)
                }
            )

        except Exception as e:
            log_error("tts", "HEALTH-001", "Health check failed", exception=e)
            return HealthCheckResponse(
                service_name="tts",
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
            model_name=self.model_name,
            model_type="tts",
            loaded=(self.model is not None),
            load_time_ms=self.load_time_ms,
            device="cuda" if self.use_gpu else "cpu"
        )

    async def shutdown(self) -> None:
        """Shutdown the TTS service"""
        log_service_event("tts", "shutdown", "Shutting down TTS service")
        self.clear_cache()
        self.model = None
        self.status = ServiceStatus.STOPPED


# Global TTS service instance
tts_service = XTTSService()
