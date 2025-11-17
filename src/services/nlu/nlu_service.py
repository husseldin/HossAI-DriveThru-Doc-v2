"""
NLU Service with Llama 3.1 8B integration
Implements Phase 3 NLU requirements
"""
import time
import re
from typing import Optional, List, Dict, Any, Tuple
import json

try:
    from llama_cpp import Llama
except ImportError:
    Llama = None

from src.config import settings
from src.utils import logger, log_service_event, log_performance_metric
from src.models.nlu import (
    IntentType, SlotType, Intent, Slot, NLURequest, NLUResponse,
    KeywordMatch, TriggerWord
)
from src.models import ServiceStatus


class NLUService:
    """
    NLU Service with Llama 3.1 8B

    Provides:
    - Intent classification (> 92% target)
    - Slot extraction (> 90% target)
    - Entity recognition
    - Context understanding
    - Latency < 200ms target
    """

    def __init__(self):
        self.model: Optional[Llama] = None
        self.model_path = settings.llm_model_path
        self.n_ctx = settings.llm_n_ctx
        self.n_threads = settings.llm_n_threads
        self.status = ServiceStatus.INITIALIZING

        # Trigger words for special actions
        self.trigger_words = {
            "ar": {
                "cancel": ["إلغاء", "ألغي", "أوقف", "لا أريد"],
                "repeat": ["كرر", "أعد", "مرة أخرى", "ماذا قلت"],
                "modify": ["غير", "عدل", "بدل"],
                "help": ["مساعدة", "ساعدني", "لا أفهم"],
                "confirm": ["نعم", "تمام", "صحيح", "موافق"],
                "reject": ["لا", "خطأ", "ليس صحيح"]
            },
            "en": {
                "cancel": ["cancel", "stop", "nevermind", "forget it"],
                "repeat": ["repeat", "again", "what", "pardon"],
                "modify": ["change", "modify", "edit", "update"],
                "help": ["help", "assist", "don't understand"],
                "confirm": ["yes", "yeah", "correct", "right", "okay", "ok"],
                "reject": ["no", "nope", "wrong", "incorrect"]
            }
        }

        log_service_event("nlu", "initialization", "Initializing NLU service")

    async def initialize(self):
        """Initialize Llama model"""
        if Llama is None:
            logger.warning("llama-cpp-python not installed, using rule-based NLU")
            self.status = ServiceStatus.READY
            return

        try:
            start_time = time.time()

            log_service_event("nlu", "loading_model", f"Loading Llama model: {self.model_path}")

            self.model = Llama(
                model_path=self.model_path,
                n_ctx=self.n_ctx,
                n_threads=self.n_threads,
                verbose=False
            )

            load_time_ms = (time.time() - start_time) * 1000
            self.status = ServiceStatus.READY

            log_service_event("nlu", "model_loaded", "Llama model loaded successfully", load_time_ms=load_time_ms)
            log_performance_metric("nlu", "model_load_time", load_time_ms, unit="ms")

        except Exception as e:
            logger.error("Failed to load Llama model, using rule-based fallback", error=str(e))
            self.model = None
            self.status = ServiceStatus.READY  # Still ready with fallback

    async def process(self, request: NLURequest) -> NLUResponse:
        """
        Process text for NLU

        Args:
            request: NLU request with text and context

        Returns:
            NLU response with intent, slots, entities
        """
        start_time = time.time()

        try:
            # Detect trigger words first
            trigger = self._detect_trigger_words(request.text, request.language)
            if trigger:
                intent = self._trigger_to_intent(trigger)
            elif self.model:
                # Use LLM for intent classification
                intent = await self._classify_intent_llm(request.text, request.language, request.context)
            else:
                # Fallback to rule-based
                intent = self._classify_intent_rules(request.text, request.language)

            # Extract slots
            if self.model and intent.intent_type in [IntentType.ORDER_ITEM, IntentType.MODIFY_ORDER]:
                slots = await self._extract_slots_llm(request.text, request.language, intent.intent_type)
            else:
                slots = self._extract_slots_rules(request.text, request.language)

            # Extract entities
            entities = self._extract_entities(request.text, request.language, slots)

            # Calculate processing time
            processing_time_ms = (time.time() - start_time) * 1000

            # Check for clarification need
            needs_clarification = intent.confidence < 0.7 or intent.intent_type == IntentType.UNKNOWN

            log_performance_metric("nlu", "processing_latency", processing_time_ms, unit="ms", intent=intent.intent_type.value)

            # Check latency target
            if processing_time_ms > 200:
                logger.warning(f"NLU latency {processing_time_ms}ms exceeds target 200ms")

            return NLUResponse(
                text=request.text,
                language=request.language,
                intent=intent,
                slots=slots,
                entities=entities,
                matched_keywords=[],  # Populated by keyword service
                processing_time_ms=processing_time_ms,
                needs_clarification=needs_clarification,
                clarification_question=self._generate_clarification(intent, request.language) if needs_clarification else None
            )

        except Exception as e:
            logger.error("NLU processing failed", error=str(e), text=request.text[:100])
            # Return fallback response
            return NLUResponse(
                text=request.text,
                language=request.language,
                intent=Intent(intent_type=IntentType.UNKNOWN, confidence=0.0),
                slots=[],
                entities={},
                matched_keywords=[],
                processing_time_ms=(time.time() - start_time) * 1000,
                needs_clarification=True,
                clarification_question="عفواً، لم أفهم. هل يمكنك إعادة الطلب؟" if request.language == "ar" else "Sorry, I didn't understand. Can you repeat?"
            )

    def _detect_trigger_words(self, text: str, language: str) -> Optional[TriggerWord]:
        """Detect trigger words for special actions"""
        text_lower = text.lower().strip()
        triggers = self.trigger_words.get(language, {})

        for action, words in triggers.items():
            for word in words:
                if word in text_lower:
                    return TriggerWord(trigger=word, action=action, confidence=1.0)
        return None

    def _trigger_to_intent(self, trigger: TriggerWord) -> Intent:
        """Convert trigger word to intent"""
        intent_map = {
            "cancel": IntentType.CANCEL_ORDER,
            "repeat": IntentType.REPEAT,
            "modify": IntentType.MODIFY_ORDER,
            "help": IntentType.HELP,
            "confirm": IntentType.YES,
            "reject": IntentType.NO
        }
        intent_type = intent_map.get(trigger.action, IntentType.UNKNOWN)
        return Intent(intent_type=intent_type, confidence=trigger.confidence)

    async def _classify_intent_llm(self, text: str, language: str, context: Optional[Dict] = None) -> Intent:
        """Classify intent using LLM"""
        if not self.model:
            return self._classify_intent_rules(text, language)

        try:
            prompt = self._build_intent_prompt(text, language, context)

            response = self.model(
                prompt,
                max_tokens=50,
                temperature=0.1,
                stop=["</intent>"]
            )

            result = response['choices'][0]['text'].strip()
            intent_type, confidence = self._parse_intent_response(result)

            return Intent(intent_type=intent_type, confidence=confidence)

        except Exception as e:
            logger.error("LLM intent classification failed", error=str(e))
            return self._classify_intent_rules(text, language)

    def _classify_intent_rules(self, text: str, language: str) -> Intent:
        """Rule-based intent classification (fallback)"""
        text_lower = text.lower()

        # Greetings
        greeting_words_ar = ["مرحبا", "السلام عليكم", "أهلا", "صباح الخير", "مساء الخير"]
        greeting_words_en = ["hello", "hi", "good morning", "good evening"]

        if language == "ar" and any(word in text_lower for word in greeting_words_ar):
            return Intent(intent_type=IntentType.GREETING, confidence=0.95)
        elif language == "en" and any(word in text_lower for word in greeting_words_en):
            return Intent(intent_type=IntentType.GREETING, confidence=0.95)

        # Order words
        order_words_ar = ["أريد", "أطلب", "أحب", "ممكن", "أعطني"]
        order_words_en = ["want", "order", "like", "get", "give me", "i'll have"]

        if language == "ar" and any(word in text_lower for word in order_words_ar):
            return Intent(intent_type=IntentType.ORDER_ITEM, confidence=0.85)
        elif language == "en" and any(word in text_lower for word in order_words_en):
            return Intent(intent_type=IntentType.ORDER_ITEM, confidence=0.85)

        # Price query
        if ("كم" in text_lower or "سعر" in text_lower or "price" in text_lower or "cost" in text_lower):
            return Intent(intent_type=IntentType.QUERY_PRICE, confidence=0.90)

        # Default to order if contains food-related words
        food_words = ["burger", "برجر", "drink", "مشروب", "meal", "وجبة", "combo", "كومبو"]
        if any(word in text_lower for word in food_words):
            return Intent(intent_type=IntentType.ORDER_ITEM, confidence=0.70)

        return Intent(intent_type=IntentType.UNKNOWN, confidence=0.5)

    async def _extract_slots_llm(self, text: str, language: str, intent_type: IntentType) -> List[Slot]:
        """Extract slots using LLM"""
        if not self.model:
            return self._extract_slots_rules(text, language)

        try:
            prompt = self._build_slot_prompt(text, language, intent_type)

            response = self.model(
                prompt,
                max_tokens=100,
                temperature=0.1,
                stop=["</slots>"]
            )

            result = response['choices'][0]['text'].strip()
            return self._parse_slot_response(result)

        except Exception as e:
            logger.error("LLM slot extraction failed", error=str(e))
            return self._extract_slots_rules(text, language)

    def _extract_slots_rules(self, text: str, language: str) -> List[Slot]:
        """Rule-based slot extraction (fallback)"""
        slots = []

        # Extract quantity
        quantity_pattern = r'\b(\d+)\b'
        matches = re.findall(quantity_pattern, text)
        if matches:
            slots.append(Slot(
                slot_type=SlotType.QUANTITY,
                value=matches[0],
                confidence=0.95
            ))

        # Extract size keywords
        size_words = {
            "ar": {"صغير": "small", "وسط": "medium", "كبير": "large"},
            "en": {"small": "small", "medium": "medium", "large": "large"}
        }
        text_lower = text.lower()
        for word, size in size_words.get(language, {}).items():
            if word in text_lower:
                slots.append(Slot(
                    slot_type=SlotType.SIZE,
                    value=size,
                    confidence=0.90
                ))
                break

        return slots

    def _extract_entities(self, text: str, language: str, slots: List[Slot]) -> Dict[str, Any]:
        """Extract entities from text and slots"""
        entities = {}

        for slot in slots:
            if slot.slot_type == SlotType.QUANTITY:
                entities["quantity"] = int(slot.value)
            elif slot.slot_type == SlotType.SIZE:
                entities["size"] = slot.value
            elif slot.slot_type == SlotType.ITEM_NAME:
                entities["item_name"] = slot.value

        return entities

    def _build_intent_prompt(self, text: str, language: str, context: Optional[Dict]) -> str:
        """Build prompt for intent classification"""
        lang_name = "Arabic" if language == "ar" else "English"
        return f"""Classify the intent of this {lang_name} text for a drive-thru restaurant.

Text: "{text}"

Available intents: order_item, modify_order, cancel_order, confirm_order, repeat, help, greeting, farewell, yes, no, query_price, query_availability, unknown

Response format: <intent>intent_type confidence</intent>

<intent>"""

    def _build_slot_prompt(self, text: str, language: str, intent_type: IntentType) -> str:
        """Build prompt for slot extraction"""
        lang_name = "Arabic" if language == "ar" else "English"
        return f"""Extract slots from this {lang_name} text for intent: {intent_type.value}

Text: "{text}"

Available slots: item_name, quantity, size, temperature, addon, category

Response format: <slots>slot_type:value confidence; ...</slots>

<slots>"""

    def _parse_intent_response(self, response: str) -> Tuple[IntentType, float]:
        """Parse LLM intent response"""
        try:
            parts = response.strip().split()
            intent_str = parts[0]
            confidence = float(parts[1]) if len(parts) > 1 else 0.8

            try:
                intent_type = IntentType(intent_str)
            except ValueError:
                intent_type = IntentType.UNKNOWN
                confidence = 0.5

            return intent_type, confidence
        except Exception:
            return IntentType.UNKNOWN, 0.5

    def _parse_slot_response(self, response: str) -> List[Slot]:
        """Parse LLM slot response"""
        slots = []
        try:
            for item in response.split(';'):
                item = item.strip()
                if ':' in item:
                    parts = item.split(':')
                    slot_type_str = parts[0].strip()
                    rest = ':'.join(parts[1:])

                    value_conf = rest.rsplit(' ', 1)
                    value = value_conf[0].strip()
                    confidence = float(value_conf[1]) if len(value_conf) > 1 else 0.8

                    try:
                        slot_type = SlotType(slot_type_str)
                        slots.append(Slot(
                            slot_type=slot_type,
                            value=value,
                            confidence=confidence
                        ))
                    except ValueError:
                        pass
        except Exception as e:
            logger.warning("Failed to parse slot response", error=str(e))

        return slots

    def _generate_clarification(self, intent: Intent, language: str) -> str:
        """Generate clarification question"""
        if language == "ar":
            return "عفواً، لم أفهم طلبك بوضوح. هل يمكنك إعادة الصياغة؟"
        else:
            return "Sorry, I didn't quite understand. Could you rephrase that?"


# Global NLU service instance
nlu_service = NLUService()
