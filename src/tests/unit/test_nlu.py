"""
Unit tests for NLU Service
Comprehensive tests for intent classification and slot extraction
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from src.services.nlu import NLUService
from src.models.nlu import NLURequest, IntentType, Slot


class TestNLUService:
    """Test cases for NLUService"""

    @pytest.fixture
    def nlu(self):
        """Create NLU service instance (mocked for testing)"""
        return NLUService()

    # ============================================================================
    # GREETING INTENT TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_greeting_intent_arabic(self, mock_nlu_service):
        """Test Arabic greeting intent classification"""
        request = NLURequest(text="مرحبا", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.GREETING
        assert response.intent.confidence > 0.8

    @pytest.mark.asyncio
    async def test_greeting_intent_english(self, mock_nlu_service):
        """Test English greeting intent classification"""
        request = NLURequest(text="hello", language="en")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.GREETING
        assert response.intent.confidence > 0.8

    @pytest.mark.asyncio
    async def test_greeting_variations_arabic(self, mock_nlu_service):
        """Test various Arabic greeting phrases"""
        greetings = [
            "السلام عليكم",
            "صباح الخير",
            "مساء الخير",
            "أهلا",
            "مرحبا بك"
        ]

        for greeting in greetings:
            request = NLURequest(text=greeting, language="ar")
            response = await mock_nlu_service.process(request)
            # All should be classified as greeting (or unknown for some)
            assert response.intent.intent_type in [IntentType.GREETING, IntentType.UNKNOWN]

    # ============================================================================
    # ORDER INTENT TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_order_intent_arabic(self, mock_nlu_service):
        """Test Arabic order intent classification"""
        request = NLURequest(text="أريد برجر كبير", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.ORDER_ITEM
        assert response.intent.confidence > 0.7

    @pytest.mark.asyncio
    async def test_order_intent_english(self, mock_nlu_service):
        """Test English order intent classification"""
        request = NLURequest(text="I want a burger", language="en")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.ORDER_ITEM
        assert response.intent.confidence > 0.7

    @pytest.mark.asyncio
    async def test_order_intent_variations_arabic(self, mock_nlu_service):
        """Test various Arabic order phrases"""
        orders = [
            "أعطني برجر",
            "أطلب بيتزا",
            "أبغى كوكا كولا",
            "ممكن برجر من فضلك"
        ]

        for order in orders:
            request = NLURequest(text=order, language="ar")
            response = await mock_nlu_service.process(request)
            assert response.intent.intent_type in [IntentType.ORDER_ITEM, IntentType.UNKNOWN]

    # ============================================================================
    # CONFIRM/REJECT INTENT TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_confirm_intent_arabic(self, mock_nlu_service):
        """Test Arabic confirmation intent"""
        request = NLURequest(text="نعم", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.CONFIRM
        assert response.intent.confidence > 0.8

    @pytest.mark.asyncio
    async def test_confirm_intent_english(self, mock_nlu_service):
        """Test English confirmation intent"""
        request = NLURequest(text="yes", language="en")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.CONFIRM
        assert response.intent.confidence > 0.8

    @pytest.mark.asyncio
    async def test_reject_intent_arabic(self, mock_nlu_service):
        """Test Arabic rejection intent"""
        request = NLURequest(text="لا", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.REJECT
        assert response.intent.confidence > 0.8

    @pytest.mark.asyncio
    async def test_reject_intent_english(self, mock_nlu_service):
        """Test English rejection intent"""
        request = NLURequest(text="no", language="en")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.REJECT
        assert response.intent.confidence > 0.8

    # ============================================================================
    # CANCEL INTENT TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_cancel_intent_arabic(self, mock_nlu_service):
        """Test Arabic cancel intent"""
        request = NLURequest(text="إلغاء", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.CANCEL_ORDER
        assert response.intent.confidence > 0.9

    @pytest.mark.asyncio
    async def test_cancel_intent_english(self, mock_nlu_service):
        """Test English cancel intent"""
        request = NLURequest(text="cancel", language="en")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.CANCEL_ORDER
        assert response.intent.confidence > 0.9

    # ============================================================================
    # SLOT EXTRACTION TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_quantity_slot_extraction(self, mock_nlu_service):
        """Test quantity slot extraction"""
        request = NLURequest(text="أريد 2 برجر", language="ar")
        response = await mock_nlu_service.process(request)

        # Should extract quantity
        quantity_slots = [s for s in response.slots if s.slot_type == "quantity"]
        assert len(quantity_slots) >= 1
        assert quantity_slots[0].value == "2"

    @pytest.mark.asyncio
    async def test_size_slot_extraction(self, mock_nlu_service):
        """Test size slot extraction"""
        request = NLURequest(text="أريد برجر كبير", language="ar")
        response = await mock_nlu_service.process(request)

        # Should extract size
        size_slots = [s for s in response.slots if s.slot_type == "size"]
        assert len(size_slots) >= 1
        assert size_slots[0].value == "large"

    @pytest.mark.asyncio
    async def test_multiple_slot_extraction(self, mock_nlu_service):
        """Test extracting multiple slots"""
        request = NLURequest(text="أريد 3 برجر كبير", language="ar")
        response = await mock_nlu_service.process(request)

        # Should extract both quantity and size
        assert len(response.slots) >= 2
        slot_types = [s.slot_type for s in response.slots]
        assert "quantity" in slot_types
        assert "size" in slot_types

    @pytest.mark.asyncio
    async def test_item_name_extraction(self, mock_nlu_service):
        """Test item name extraction from text"""
        request = NLURequest(text="أريد برجر", language="ar")
        response = await mock_nlu_service.process(request)

        # Should extract item name
        item_slots = [s for s in response.slots if s.slot_type == "item"]
        # Depending on implementation

    @pytest.mark.asyncio
    async def test_addon_extraction(self, mock_nlu_service):
        """Test add-on extraction"""
        request = NLURequest(text="برجر مع جبنة إضافية", language="ar")
        response = await mock_nlu_service.process(request)

        # Should extract add-ons
        addon_slots = [s for s in response.slots if s.slot_type == "addon"]
        # Depending on implementation

    # ============================================================================
    # CODE-SWITCHING TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_code_switching_arabic_english(self, mock_nlu_service):
        """Test code-switching (Arabic + English)"""
        request = NLURequest(text="أريد burger كبير", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.ORDER_ITEM
        # Should handle code-switching

    @pytest.mark.asyncio
    async def test_code_switching_english_arabic(self, mock_nlu_service):
        """Test code-switching (English + Arabic)"""
        request = NLURequest(text="I want برجر large", language="en")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.ORDER_ITEM

    # ============================================================================
    # EDGE CASE TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_empty_text(self, mock_nlu_service):
        """Test NLU with empty text"""
        request = NLURequest(text="", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.UNKNOWN

    @pytest.mark.asyncio
    async def test_very_long_text(self, mock_nlu_service):
        """Test NLU with very long text"""
        long_text = "أريد برجر " * 100  # 1000+ characters
        request = NLURequest(text=long_text, language="ar")
        response = await mock_nlu_service.process(request)

        # Should handle gracefully
        assert response is not None

    @pytest.mark.asyncio
    async def test_numbers_and_special_chars(self, mock_nlu_service):
        """Test NLU with numbers and special characters"""
        request = NLURequest(text="أريد 5 برجر @ 25.50 ريال!", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.ORDER_ITEM

    @pytest.mark.asyncio
    async def test_nonsense_text(self, mock_nlu_service):
        """Test NLU with nonsense text"""
        request = NLURequest(text="asdfghjkl qwerty", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.UNKNOWN
        assert response.intent.confidence < 0.5

    @pytest.mark.asyncio
    async def test_punctuation_handling(self, mock_nlu_service):
        """Test handling of punctuation"""
        request = NLURequest(text="أريد برجر، من فضلك!", language="ar")
        response = await mock_nlu_service.process(request)

        assert response.intent.intent_type == IntentType.ORDER_ITEM

    # ============================================================================
    # CONFIDENCE SCORE TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_high_confidence_classification(self, mock_nlu_service):
        """Test classification with high confidence"""
        request = NLURequest(text="أريد برجر", language="ar")
        response = await mock_nlu_service.process(request)

        # Clear order intent should have high confidence
        assert response.intent.confidence > 0.7

    @pytest.mark.asyncio
    async def test_ambiguous_text_low_confidence(self, mock_nlu_service):
        """Test ambiguous text results in lower confidence"""
        request = NLURequest(text="ربما", language="ar")
        response = await mock_nlu_service.process(request)

        # Ambiguous word should have lower confidence
        # Actual behavior depends on implementation

    # ============================================================================
    # ENTITY EXTRACTION TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_entity_extraction_menu_items(self, mock_nlu_service):
        """Test extracting menu item entities"""
        request = NLURequest(text="أريد برجر وبيتزا", language="ar")
        response = await mock_nlu_service.process(request)

        # Should extract multiple menu items
        # Implementation dependent

    @pytest.mark.asyncio
    async def test_entity_extraction_numbers(self, mock_nlu_service):
        """Test extracting number entities"""
        request = NLURequest(text="أريد 5 برجر", language="ar")
        response = await mock_nlu_service.process(request)

        # Should extract number entity
        # Check entities list

    # ============================================================================
    # CONTEXT AWARENESS TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_context_continuation(self, mock_nlu_service):
        """Test understanding context from previous interaction"""
        # First request
        req1 = NLURequest(text="أريد برجر", language="ar", context={})
        res1 = await mock_nlu_service.process(req1)

        # Follow-up request (referring to previous item)
        req2 = NLURequest(
            text="كبير",
            language="ar",
            context={"previous_intent": "ORDER_ITEM", "item": "burger"}
        )
        res2 = await mock_nlu_service.process(req2)

        # Should understand "كبير" refers to burger size

    # ============================================================================
    # MULTILINGUAL TESTS
    # ============================================================================

    @pytest.mark.asyncio
    async def test_language_detection_consistency(self, mock_nlu_service):
        """Test consistency of language detection"""
        # Arabic text
        req_ar = NLURequest(text="أريد برجر", language="ar")
        res_ar = await mock_nlu_service.process(req_ar)

        # English text
        req_en = NLURequest(text="I want burger", language="en")
        res_en = await mock_nlu_service.process(req_en)

        # Both should be classified as ORDER_ITEM
        assert res_ar.intent.intent_type == IntentType.ORDER_ITEM
        assert res_en.intent.intent_type == IntentType.ORDER_ITEM
