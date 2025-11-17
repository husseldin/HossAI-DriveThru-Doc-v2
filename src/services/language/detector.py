"""
Language Detection Service
Implements LANG-001 to LANG-005 requirements from Build Phase Plan
"""
import time
from typing import Optional, Dict, List
import re

try:
    from langdetect import detect, detect_langs
    from langdetect.lang_detect_exception import LangDetectException
except ImportError:
    detect = None
    detect_langs = None
    LangDetectException = Exception

from src.config import settings
from src.utils import logger, log_service_event, log_performance_metric
from src.models import LanguageCode, LanguageDetectionResult, ServiceStatus


class LanguageDetector:
    """
    Language Detection Service

    Provides language detection with:
    - Arabic-first default behavior
    - Smart code-switching detection
    - English language detection
    - Non-Arabic speaker detection (accent-based)
    - Configurable confidence thresholds
    """

    def __init__(self):
        self.default_language = LanguageCode(settings.default_language)
        self.threshold = settings.language_detection_threshold
        self.code_switching_enabled = settings.code_switching_enabled
        self.status = ServiceStatus.READY

        # Patterns for detecting code-switching
        self.arabic_pattern = re.compile(r'[\u0600-\u06FF]+')
        self.english_pattern = re.compile(r'[a-zA-Z]+')

        # Common English words that might appear in Arabic speech
        self.common_english_words = {
            'okay', 'ok', 'yes', 'no', 'hello', 'hi', 'bye',
            'burger', 'pizza', 'coffee', 'tea', 'combo', 'deal',
            'large', 'medium', 'small', 'extra', 'double'
        }

        log_service_event(
            "language_detector",
            "initialization",
            "Language detector initialized",
            default_language=self.default_language.value,
            threshold=self.threshold
        )

    def detect_language(
        self,
        text: str,
        context: Optional[str] = None
    ) -> LanguageDetectionResult:
        """
        Detect language from text

        Args:
            text: Text to analyze
            context: Optional context from previous interactions

        Returns:
            LanguageDetectionResult with detected language and confidence

        Logic:
        - Default to Arabic if uncertain
        - Don't switch for 2-3 English words in Arabic context
        - Detect full English sentences
        - Handle code-switching
        """
        if not text or not text.strip():
            return LanguageDetectionResult(
                detected_language=self.default_language,
                confidence=1.0,
                is_code_switching=False
            )

        start_time = time.time()

        try:
            # Quick check for script type
            has_arabic = bool(self.arabic_pattern.search(text))
            has_english = bool(self.english_pattern.search(text))

            # If only Arabic script, return Arabic
            if has_arabic and not has_english:
                return self._create_result(
                    LanguageCode.ARABIC,
                    1.0,
                    False,
                    time.time() - start_time
                )

            # If only English script, check word count for code-switching
            if has_english and not has_arabic:
                words = text.lower().split()

                # Check if these are common English words in Arabic context
                if context and self._is_arabic_context(context):
                    # Count how many words are common English words
                    common_word_count = sum(
                        1 for word in words if word in self.common_english_words
                    )

                    # If most words are common English words and text is short, treat as code-switching
                    if len(words) <= 3 or common_word_count > len(words) * 0.5:
                        return self._create_result(
                            LanguageCode.ARABIC,  # Keep Arabic context
                            0.8,
                            True,  # Code-switching detected
                            time.time() - start_time,
                            secondary_language=LanguageCode.ENGLISH
                        )

                # Otherwise, it's English
                return self._detect_with_langdetect(text, start_time)

            # Both Arabic and English scripts present - code-switching
            if has_arabic and has_english:
                # Determine primary language by character count
                arabic_chars = len(self.arabic_pattern.findall(text))
                english_chars = len(self.english_pattern.findall(text))

                primary_lang = (
                    LanguageCode.ARABIC if arabic_chars > english_chars
                    else LanguageCode.ENGLISH
                )
                secondary_lang = (
                    LanguageCode.ENGLISH if primary_lang == LanguageCode.ARABIC
                    else LanguageCode.ARABIC
                )

                return self._create_result(
                    primary_lang,
                    0.85,
                    True,
                    time.time() - start_time,
                    secondary_language=secondary_lang
                )

            # Fallback to langdetect library if available
            return self._detect_with_langdetect(text, start_time)

        except Exception as e:
            logger.warning(
                "Language detection failed, using default",
                error=str(e),
                text_length=len(text)
            )
            return self._create_result(
                self.default_language,
                0.5,
                False,
                time.time() - start_time
            )

    def _detect_with_langdetect(
        self,
        text: str,
        start_time: float
    ) -> LanguageDetectionResult:
        """Use langdetect library for language detection"""
        if detect is None:
            # Fallback to default if library not available
            return self._create_result(
                self.default_language,
                0.5,
                False,
                time.time() - start_time
            )

        try:
            # Get language probabilities
            lang_probs = detect_langs(text)

            # Find Arabic and English probabilities
            ar_prob = next((lp.prob for lp in lang_probs if lp.lang == 'ar'), 0.0)
            en_prob = next((lp.prob for lp in lang_probs if lp.lang == 'en'), 0.0)

            # Determine primary language
            if ar_prob > en_prob and ar_prob > self.threshold:
                primary_lang = LanguageCode.ARABIC
                confidence = ar_prob
            elif en_prob > ar_prob and en_prob > self.threshold:
                primary_lang = LanguageCode.ENGLISH
                confidence = en_prob
            else:
                # Default to Arabic if uncertain
                primary_lang = self.default_language
                confidence = max(ar_prob, en_prob, 0.5)

            # Check for code-switching
            is_code_switching = (
                ar_prob > 0.2 and en_prob > 0.2 and
                self.code_switching_enabled
            )

            secondary_lang = None
            if is_code_switching:
                secondary_lang = (
                    LanguageCode.ENGLISH if primary_lang == LanguageCode.ARABIC
                    else LanguageCode.ARABIC
                )

            return self._create_result(
                primary_lang,
                confidence,
                is_code_switching,
                time.time() - start_time,
                secondary_language=secondary_lang,
                metadata={
                    'ar_probability': ar_prob,
                    'en_probability': en_prob
                }
            )

        except LangDetectException as e:
            logger.warning("langdetect failed", error=str(e))
            return self._create_result(
                self.default_language,
                0.5,
                False,
                time.time() - start_time
            )

    def _is_arabic_context(self, context: str) -> bool:
        """Check if context is primarily Arabic"""
        if not context:
            return False

        arabic_chars = len(self.arabic_pattern.findall(context))
        total_chars = len(context.strip())

        return arabic_chars / max(total_chars, 1) > 0.5

    def _create_result(
        self,
        language: LanguageCode,
        confidence: float,
        is_code_switching: bool,
        processing_time: float,
        secondary_language: Optional[LanguageCode] = None,
        metadata: Optional[Dict] = None
    ) -> LanguageDetectionResult:
        """Create language detection result with logging"""
        latency_ms = processing_time * 1000

        log_performance_metric(
            "language_detector",
            "detection_latency",
            latency_ms,
            unit="ms",
            detected_language=language.value,
            is_code_switching=is_code_switching
        )

        result_metadata = metadata or {}
        result_metadata['latency_ms'] = latency_ms

        return LanguageDetectionResult(
            detected_language=language,
            confidence=confidence,
            is_code_switching=is_code_switching,
            secondary_language=secondary_language,
            metadata=result_metadata
        )

    def should_switch_language(
        self,
        current_language: LanguageCode,
        detected_language: LanguageCode,
        confidence: float,
        conversation_turns: int = 0
    ) -> bool:
        """
        Determine if language should be switched

        Args:
            current_language: Current conversation language
            detected_language: Newly detected language
            confidence: Detection confidence
            conversation_turns: Number of conversation turns

        Returns:
            True if language should be switched

        Logic:
        - Don't switch if confidence is low
        - Don't switch for single turn (might be code-switching)
        - Switch if detected language is consistent for 2+ turns
        """
        # Don't switch if confidence is below threshold
        if confidence < self.threshold:
            return False

        # Don't switch if languages are the same
        if current_language == detected_language:
            return False

        # For first turn or low conversation count, require higher confidence
        if conversation_turns < 2:
            return confidence > 0.9

        # For established conversation, switch with normal confidence
        return True

    def get_language_prompt(self, detected_language: LanguageCode) -> Optional[str]:
        """
        Get prompt to ask user for language preference

        Args:
            detected_language: Detected language

        Returns:
            Bilingual prompt asking for language preference
        """
        if detected_language == LanguageCode.ENGLISH:
            return "هل تفضل العربية أم الإنجليزية؟ / Do you prefer Arabic or English?"
        return None


# Global language detector instance
language_detector = LanguageDetector()
