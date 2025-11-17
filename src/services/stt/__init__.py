"""STT (Speech-to-Text) service module"""
from .faster_whisper_service import FasterWhisperService, stt_service

__all__ = ["FasterWhisperService", "stt_service"]
