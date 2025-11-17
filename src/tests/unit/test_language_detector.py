"""
Unit tests for Language Detection Service
"""
import pytest
from src.services.language import LanguageDetector
from src.models import LanguageCode


class TestLanguageDetector:
    """Test cases for LanguageDetector"""

    @pytest.fixture
    def detector(self):
        """Create language detector instance"""
        return LanguageDetector()

    def test_arabic_detection(self, detector):
        """Test detection of pure Arabic text"""
        text = "مرحبا، كيف يمكنني مساعدتك اليوم؟"
        result = detector.detect_language(text)

        assert result.detected_language == LanguageCode.ARABIC
        assert result.confidence > 0.8
        assert result.is_code_switching is False

    def test_english_detection(self, detector):
        """Test detection of pure English text"""
        text = "Hello, how can I help you today?"
        result = detector.detect_language(text)

        assert result.detected_language == LanguageCode.ENGLISH
        assert result.confidence > 0.7

    def test_code_switching_detection(self, detector):
        """Test detection of code-switching (Arabic + English)"""
        text = "أريد burger مع extra cheese من فضلك"
        result = detector.detect_language(text)

        assert result.is_code_switching is True
        assert result.detected_language in [LanguageCode.ARABIC, LanguageCode.ENGLISH]

    def test_empty_text(self, detector):
        """Test detection with empty text"""
        result = detector.detect_language("")

        assert result.detected_language == detector.default_language
        assert result.confidence == 1.0

    def test_common_english_words_in_arabic_context(self, detector):
        """Test that common English words in Arabic context don't trigger language switch"""
        text = "okay"
        result = detector.detect_language(text, context="مرحبا بك في مطعمنا")

        # Should keep Arabic context
        assert result.detected_language == LanguageCode.ARABIC
        assert result.is_code_switching is True
