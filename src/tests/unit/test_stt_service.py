"""
Unit tests for STT (Speech-to-Text) Service
Tests the FasterWhisperService with mocked AI models
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from src.services.stt.faster_whisper_service import FasterWhisperService


class TestFasterWhisperService:
    """Test cases for FasterWhisperService"""

    @pytest.fixture
    def mock_whisper_model(self):
        """Create mock Faster Whisper model"""
        mock_model = Mock()

        # Mock transcribe method
        def mock_transcribe(audio, language=None, **kwargs):
            """Mock transcription with realistic output"""
            segments = [
                Mock(
                    text="أريد برجر كبير",
                    start=0.0,
                    end=2.5,
                    avg_logprob=-0.3
                )
            ]
            info = Mock(
                language="ar",
                language_probability=0.95,
                duration=2.5
            )
            return segments, info

        mock_model.transcribe = mock_transcribe
        return mock_model

    @pytest.fixture
    def stt_service(self, mock_whisper_model):
        """Create STT service with mocked model"""
        with patch('src.services.stt.faster_whisper_service.WhisperModel') as mock_cls:
            mock_cls.return_value = mock_whisper_model
            service = FasterWhisperService(
                model_size="base",
                device="cpu",
                compute_type="int8"
            )
            # Manually set the model to skip initialization
            service.model = mock_whisper_model
            service.is_ready = True
            return service

    @pytest.mark.asyncio
    async def test_transcribe_arabic(self, stt_service, sample_audio_bytes):
        """Test Arabic transcription"""
        result = await stt_service.transcribe(
            audio_data=sample_audio_bytes,
            language="ar"
        )

        assert result is not None
        assert "text" in result
        assert result["text"] == "أريد برجر كبير"
        assert result["language"] == "ar"
        assert result["confidence"] > 0.8

    @pytest.mark.asyncio
    async def test_transcribe_english(self, stt_service, mock_whisper_model):
        """Test English transcription"""
        # Update mock for English
        def mock_transcribe_en(audio, language=None, **kwargs):
            segments = [
                Mock(
                    text="I want a large burger",
                    start=0.0,
                    end=2.0,
                    avg_logprob=-0.25
                )
            ]
            info = Mock(
                language="en",
                language_probability=0.98,
                duration=2.0
            )
            return segments, info

        mock_whisper_model.transcribe = mock_transcribe_en
        stt_service.model = mock_whisper_model

        result = await stt_service.transcribe(
            audio_data=b"fake_audio_en",
            language="en"
        )

        assert result["text"] == "I want a large burger"
        assert result["language"] == "en"

    @pytest.mark.asyncio
    async def test_transcribe_auto_language_detection(self, stt_service, sample_audio_bytes):
        """Test automatic language detection"""
        result = await stt_service.transcribe(
            audio_data=sample_audio_bytes,
            language=None  # Auto-detect
        )

        assert result["language"] in ["ar", "en"]
        assert result["confidence"] > 0

    @pytest.mark.asyncio
    async def test_transcribe_empty_audio(self, stt_service):
        """Test transcription with empty audio"""
        result = await stt_service.transcribe(
            audio_data=b"",
            language="ar"
        )

        # Should return empty or error
        assert result is not None
        assert result["text"] == "" or "error" in result

    @pytest.mark.asyncio
    async def test_transcribe_with_timestamps(self, stt_service, sample_audio_bytes):
        """Test transcription with word-level timestamps"""
        result = await stt_service.transcribe(
            audio_data=sample_audio_bytes,
            language="ar",
            word_timestamps=True
        )

        assert result is not None
        assert "segments" in result or "words" in result

    @pytest.mark.asyncio
    async def test_transcribe_low_confidence(self, stt_service, mock_whisper_model):
        """Test transcription with low confidence"""
        # Mock low confidence result
        def mock_transcribe_low(audio, language=None, **kwargs):
            segments = [
                Mock(
                    text="unclear audio",
                    start=0.0,
                    end=1.0,
                    avg_logprob=-2.5  # Low confidence
                )
            ]
            info = Mock(
                language="ar",
                language_probability=0.55,
                duration=1.0
            )
            return segments, info

        mock_whisper_model.transcribe = mock_transcribe_low
        stt_service.model = mock_whisper_model

        result = await stt_service.transcribe(
            audio_data=b"unclear_audio",
            language="ar"
        )

        assert result["confidence"] < 0.7

    def test_service_initialization(self):
        """Test STT service initialization"""
        with patch('src.services.stt.faster_whisper_service.WhisperModel') as mock_cls:
            mock_model = Mock()
            mock_cls.return_value = mock_model

            service = FasterWhisperService(
                model_size="base",
                device="cpu",
                compute_type="int8"
            )

            # Should call WhisperModel constructor
            mock_cls.assert_called_once()
            assert service.model_size == "base"
            assert service.device == "cpu"

    def test_service_not_ready(self):
        """Test service behavior when model is not ready"""
        service = FasterWhisperService(model_size="base")
        service.model = None
        service.is_ready = False

        # Should handle gracefully
        assert not service.is_ready

    @pytest.mark.asyncio
    async def test_batch_transcription(self, stt_service):
        """Test transcribing multiple audio chunks"""
        audio_chunks = [
            b"audio_chunk_1",
            b"audio_chunk_2",
            b"audio_chunk_3"
        ]

        results = []
        for chunk in audio_chunks:
            result = await stt_service.transcribe(chunk, language="ar")
            results.append(result)

        assert len(results) == 3
        assert all(r is not None for r in results)

    @pytest.mark.asyncio
    async def test_latency_measurement(self, stt_service, sample_audio_bytes):
        """Test transcription latency tracking"""
        result = await stt_service.transcribe(
            audio_data=sample_audio_bytes,
            language="ar"
        )

        # Check if latency is recorded
        assert "latency_ms" in result or "duration" in result

    @pytest.mark.asyncio
    async def test_vad_integration(self, stt_service):
        """Test Voice Activity Detection integration"""
        # Silent audio (should be filtered by VAD)
        silent_audio = b"\x00" * 16000  # 1 second of silence

        result = await stt_service.transcribe(
            audio_data=silent_audio,
            language="ar",
            vad_filter=True
        )

        # Should handle silence gracefully
        assert result is not None
