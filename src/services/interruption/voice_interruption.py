"""
Voice Interruption Detection Service
Implements INT-001 requirement from Build Phase Plan
"""
import time
import asyncio
from typing import Optional, Callable, Any
from datetime import datetime
import numpy as np

try:
    import webrtcvad
except ImportError:
    webrtcvad = None

from src.config import settings
from src.utils import logger, log_service_event, log_performance_metric
from src.models import VoiceInterruptionEvent, ServiceStatus


class VoiceInterruptionDetector:
    """
    Voice Interruption Detection Service

    Provides interruption detection with:
    - Fast detection (< 200ms target)
    - Voice Activity Detection (VAD)
    - Configurable sensitivity
    - Real-time audio monitoring
    - Callback support for immediate interruption handling
    """

    def __init__(self):
        self.enabled = settings.enable_voice_interruption
        self.detection_threshold = 0.7  # Configurable threshold
        self.target_latency_ms = settings.interruption_detection_ms
        self.status = ServiceStatus.READY

        # VAD instance
        self.vad: Optional[Any] = None
        if webrtcvad is not None:
            # Aggressiveness mode: 0 (least aggressive) to 3 (most aggressive)
            # Mode 2 is a good balance
            self.vad = webrtcvad.Vad(mode=2)

        # Interruption callbacks
        self.interruption_callbacks = []

        # State tracking
        self.is_speaking = False  # Whether TTS is currently speaking
        self.last_interruption: Optional[datetime] = None

        log_service_event(
            "interruption_detector",
            "initialization",
            "Voice interruption detector initialized",
            enabled=self.enabled,
            threshold=self.detection_threshold,
            has_vad=self.vad is not None
        )

    def register_callback(self, callback: Callable[[VoiceInterruptionEvent], None]) -> None:
        """
        Register callback to be called when interruption is detected

        Args:
            callback: Function to call with VoiceInterruptionEvent
        """
        self.interruption_callbacks.append(callback)
        logger.debug("Interruption callback registered", callback=callback.__name__)

    def set_speaking_state(self, is_speaking: bool) -> None:
        """
        Set whether TTS is currently speaking

        Args:
            is_speaking: True if TTS is actively speaking
        """
        self.is_speaking = is_speaking
        logger.debug("Speaking state changed", is_speaking=is_speaking)

    async def detect_interruption(
        self,
        audio_chunk: bytes,
        sample_rate: int = 16000
    ) -> Optional[VoiceInterruptionEvent]:
        """
        Detect voice interruption from audio chunk

        Args:
            audio_chunk: Raw audio data
            sample_rate: Audio sample rate (default 16000 Hz)

        Returns:
            VoiceInterruptionEvent if interruption detected, None otherwise
        """
        if not self.enabled or not self.is_speaking:
            return None

        start_time = time.time()

        try:
            # Calculate audio level (RMS)
            audio_level = self._calculate_audio_level(audio_chunk)

            # Quick check: if audio level is very low, no interruption
            if audio_level < 0.01:  # Very quiet
                return None

            # Use VAD if available
            if self.vad is not None:
                has_speech = self._detect_speech_with_vad(audio_chunk, sample_rate)
            else:
                # Fallback to simple audio level detection
                has_speech = audio_level > 0.1

            if has_speech:
                latency_ms = (time.time() - start_time) * 1000

                # Create interruption event
                event = VoiceInterruptionEvent(
                    detected_at=datetime.utcnow(),
                    confidence=min(audio_level * 5, 1.0),  # Scale to 0-1
                    audio_level=audio_level,
                    interruption_type="speech"
                )

                log_performance_metric(
                    "interruption_detector",
                    "detection_latency",
                    latency_ms,
                    unit="ms"
                )

                # Check latency requirement
                if latency_ms > self.target_latency_ms:
                    logger.warning(
                        f"Interruption detection latency {latency_ms}ms exceeds target {self.target_latency_ms}ms",
                        latency_ms=latency_ms
                    )

                # Notify callbacks
                await self._notify_callbacks(event)

                self.last_interruption = event.detected_at

                return event

            return None

        except Exception as e:
            logger.error(
                "Interruption detection failed",
                error=str(e)
            )
            return None

    def _calculate_audio_level(self, audio_chunk: bytes) -> float:
        """
        Calculate RMS audio level

        Args:
            audio_chunk: Raw audio bytes

        Returns:
            Audio level (0.0 to 1.0+)
        """
        try:
            # Convert bytes to numpy array (assuming 16-bit PCM)
            audio_array = np.frombuffer(audio_chunk, dtype=np.int16)

            # Calculate RMS
            rms = np.sqrt(np.mean(audio_array.astype(float) ** 2))

            # Normalize to 0-1 range (16-bit audio has max value of 32767)
            normalized_rms = rms / 32767.0

            return float(normalized_rms)

        except Exception as e:
            logger.warning("Failed to calculate audio level", error=str(e))
            return 0.0

    def _detect_speech_with_vad(
        self,
        audio_chunk: bytes,
        sample_rate: int
    ) -> bool:
        """
        Use WebRTC VAD to detect speech

        Args:
            audio_chunk: Raw audio bytes
            sample_rate: Sample rate (must be 8000, 16000, 32000, or 48000)

        Returns:
            True if speech detected
        """
        if self.vad is None:
            return False

        try:
            # WebRTC VAD requires specific frame durations: 10, 20, or 30 ms
            # and specific sample rates: 8000, 16000, 32000, 48000 Hz

            # For simplicity, we'll check if the chunk size matches expected duration
            # Frame duration of 30ms at 16000 Hz = 480 samples = 960 bytes (16-bit)
            expected_length = 960  # 30ms at 16000 Hz

            if len(audio_chunk) < expected_length:
                # Pad with zeros if too short
                audio_chunk = audio_chunk + b'\x00' * (expected_length - len(audio_chunk))
            elif len(audio_chunk) > expected_length:
                # Truncate if too long
                audio_chunk = audio_chunk[:expected_length]

            # Run VAD
            is_speech = self.vad.is_speech(audio_chunk, sample_rate)

            return is_speech

        except Exception as e:
            logger.warning("VAD detection failed", error=str(e))
            return False

    async def _notify_callbacks(self, event: VoiceInterruptionEvent) -> None:
        """Notify all registered callbacks"""
        for callback in self.interruption_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(event)
                else:
                    callback(event)
            except Exception as e:
                logger.error(
                    "Interruption callback failed",
                    callback=callback.__name__,
                    error=str(e)
                )

    async def monitor_audio_stream(
        self,
        audio_stream,
        sample_rate: int = 16000,
        chunk_size: int = 960  # 30ms at 16000 Hz
    ):
        """
        Monitor audio stream for interruptions (generator)

        Args:
            audio_stream: Audio stream iterator
            sample_rate: Sample rate
            chunk_size: Size of audio chunks

        Yields:
            VoiceInterruptionEvent when detected
        """
        try:
            async for audio_chunk in audio_stream:
                event = await self.detect_interruption(audio_chunk, sample_rate)
                if event:
                    yield event

        except Exception as e:
            logger.error(
                "Audio stream monitoring failed",
                error=str(e)
            )

    def get_last_interruption(self) -> Optional[datetime]:
        """Get timestamp of last detected interruption"""
        return self.last_interruption

    def reset(self) -> None:
        """Reset interruption detector state"""
        self.is_speaking = False
        self.last_interruption = None
        log_service_event(
            "interruption_detector",
            "reset",
            "Interruption detector state reset"
        )


# Global interruption detector instance
interruption_detector = VoiceInterruptionDetector()
