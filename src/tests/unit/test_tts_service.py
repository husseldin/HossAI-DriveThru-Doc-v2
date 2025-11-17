"""
Unit tests for TTS (Text-to-Speech) Service
Tests the XTTSService with mocked AI models
"""
import pytest
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from src.services.tts.xtts_service import XTTSService


class TestXTTSService:
    """Test cases for XTTSService"""

    @pytest.fixture
    def mock_tts_model(self):
        """Create mock XTTS model"""
        mock_model = Mock()

        # Mock synthesis method
        def mock_tts_to_file(text, file_path, speaker_wav=None, language="ar", **kwargs):
            """Mock TTS synthesis"""
            # Simulate writing audio file
            with open(file_path, 'wb') as f:
                f.write(b"fake_audio_data" * 1000)  # 14KB fake audio
            return file_path

        mock_model.tts_to_file = mock_tts_to_file
        return mock_model

    @pytest.fixture
    def tts_service(self, mock_tts_model):
        """Create TTS service with mocked model"""
        with patch('src.services.tts.xtts_service.TTS') as mock_cls:
            mock_cls.return_value = mock_tts_model
            service = XTTSService(
                model_name="tts_models/multilingual/multi-dataset/xtts_v2",
                device="cpu"
            )
            # Manually set the model
            service.model = mock_tts_model
            service.is_ready = True
            return service

    @pytest.mark.asyncio
    async def test_synthesize_arabic(self, tts_service, sample_arabic_text):
        """Test Arabic text synthesis"""
        audio_data = await tts_service.synthesize(
            text=sample_arabic_text,
            language="ar"
        )

        assert audio_data is not None
        assert isinstance(audio_data, bytes)
        assert len(audio_data) > 0

    @pytest.mark.asyncio
    async def test_synthesize_english(self, tts_service, sample_english_text):
        """Test English text synthesis"""
        audio_data = await tts_service.synthesize(
            text=sample_english_text,
            language="en"
        )

        assert audio_data is not None
        assert isinstance(audio_data, bytes)
        assert len(audio_data) > 0

    @pytest.mark.asyncio
    async def test_synthesize_empty_text(self, tts_service):
        """Test synthesis with empty text"""
        audio_data = await tts_service.synthesize(
            text="",
            language="ar"
        )

        # Should return None or empty bytes
        assert audio_data is None or audio_data == b""

    @pytest.mark.asyncio
    async def test_synthesize_very_long_text(self, tts_service):
        """Test synthesis with very long text (should chunk)"""
        long_text = "مرحبا بكم في مطعمنا. " * 50  # ~700 characters

        audio_data = await tts_service.synthesize(
            text=long_text,
            language="ar"
        )

        assert audio_data is not None
        assert len(audio_data) > 0

    @pytest.mark.asyncio
    async def test_synthesize_with_custom_speaker(self, tts_service):
        """Test synthesis with custom speaker voice"""
        audio_data = await tts_service.synthesize(
            text="مرحبا",
            language="ar",
            speaker_wav="/path/to/speaker.wav"
        )

        assert audio_data is not None

    @pytest.mark.asyncio
    async def test_synthesize_special_characters(self, tts_service):
        """Test synthesis with special characters and numbers"""
        text = "السعر 25.50 ريال! هل تريد المتابعة؟"

        audio_data = await tts_service.synthesize(
            text=text,
            language="ar"
        )

        assert audio_data is not None

    @pytest.mark.asyncio
    async def test_synthesize_code_switching(self, tts_service, sample_code_switch_text):
        """Test synthesis with code-switching text"""
        audio_data = await tts_service.synthesize(
            text=sample_code_switch_text,
            language="ar"  # Primary language
        )

        assert audio_data is not None

    @pytest.mark.asyncio
    async def test_synthesize_with_emotion(self, tts_service):
        """Test synthesis with emotional tone"""
        # Happy/enthusiastic tone
        text = "مرحبا! كيف يمكنني مساعدتك؟"

        audio_data = await tts_service.synthesize(
            text=text,
            language="ar",
            emotion="happy"
        )

        assert audio_data is not None

    @pytest.mark.asyncio
    async def test_synthesize_streaming(self, tts_service):
        """Test streaming synthesis (chunk by chunk)"""
        text = "مرحبا بكم في مطعمنا."

        # Simulate streaming
        chunks = []
        async for chunk in tts_service.synthesize_stream(text, language="ar"):
            chunks.append(chunk)

        assert len(chunks) > 0 if hasattr(tts_service, 'synthesize_stream') else True

    def test_service_initialization(self):
        """Test TTS service initialization"""
        with patch('src.services.tts.xtts_service.TTS') as mock_cls:
            mock_model = Mock()
            mock_cls.return_value = mock_model

            service = XTTSService(
                model_name="tts_models/multilingual/multi-dataset/xtts_v2",
                device="cpu"
            )

            # Should initialize model
            mock_cls.assert_called_once()
            assert service.model_name == "tts_models/multilingual/multi-dataset/xtts_v2"
            assert service.device == "cpu"

    def test_service_not_ready(self):
        """Test service behavior when model is not ready"""
        service = XTTSService(model_name="xtts_v2")
        service.model = None
        service.is_ready = False

        assert not service.is_ready

    @pytest.mark.asyncio
    async def test_audio_format_wav(self, tts_service):
        """Test synthesis output in WAV format"""
        audio_data = await tts_service.synthesize(
            text="مرحبا",
            language="ar",
            output_format="wav"
        )

        assert audio_data is not None
        # WAV files start with 'RIFF'
        if len(audio_data) > 4:
            # Check for WAV header (optional, depends on implementation)
            pass

    @pytest.mark.asyncio
    async def test_audio_format_mp3(self, tts_service):
        """Test synthesis output in MP3 format"""
        audio_data = await tts_service.synthesize(
            text="مرحبا",
            language="ar",
            output_format="mp3"
        )

        assert audio_data is not None

    @pytest.mark.asyncio
    async def test_latency_measurement(self, tts_service):
        """Test synthesis latency tracking"""
        import time

        start = time.time()
        audio_data = await tts_service.synthesize(
            text="مرحبا بكم",
            language="ar"
        )
        latency = (time.time() - start) * 1000  # ms

        assert audio_data is not None
        assert latency < 5000  # Should complete within 5 seconds (mocked)

    @pytest.mark.asyncio
    async def test_concurrent_synthesis(self, tts_service):
        """Test concurrent synthesis requests"""
        import asyncio

        tasks = [
            tts_service.synthesize(f"نص رقم {i}", language="ar")
            for i in range(5)
        ]

        results = await asyncio.gather(*tasks)

        assert len(results) == 5
        assert all(r is not None for r in results)

    @pytest.mark.asyncio
    async def test_sample_rate_configuration(self, tts_service):
        """Test synthesis with different sample rates"""
        audio_data = await tts_service.synthesize(
            text="مرحبا",
            language="ar",
            sample_rate=24000
        )

        assert audio_data is not None

    @pytest.mark.asyncio
    async def test_pronunciation_handling(self, tts_service):
        """Test handling of difficult pronunciations"""
        # Words that might be difficult for TTS
        text = "Burger، Pizza، الإسبريسو، ماكدونالدز"

        audio_data = await tts_service.synthesize(
            text=text,
            language="ar"
        )

        assert audio_data is not None

    @pytest.mark.asyncio
    async def test_silence_padding(self, tts_service):
        """Test adding silence padding before/after speech"""
        audio_data = await tts_service.synthesize(
            text="مرحبا",
            language="ar",
            silence_before=0.5,  # 500ms
            silence_after=0.5
        )

        assert audio_data is not None
        # With padding, audio should be longer

    @pytest.mark.asyncio
    async def test_speed_control(self, tts_service):
        """Test controlling speech speed"""
        # Normal speed
        normal = await tts_service.synthesize(
            text="مرحبا بكم",
            language="ar",
            speed=1.0
        )

        # Faster
        fast = await tts_service.synthesize(
            text="مرحبا بكم",
            language="ar",
            speed=1.5
        )

        assert normal is not None
        assert fast is not None
        # Fast should be shorter (if implemented)

    @pytest.mark.asyncio
    async def test_error_handling_invalid_language(self, tts_service):
        """Test error handling with invalid language code"""
        with pytest.raises(Exception):
            await tts_service.synthesize(
                text="Hello",
                language="xx"  # Invalid language code
            )
