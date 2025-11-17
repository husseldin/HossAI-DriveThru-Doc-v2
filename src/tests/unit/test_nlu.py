"""
Unit tests for NLU Service
"""
import pytest
from src.services.nlu import NLUService
from src.models.nlu import NLURequest, IntentType


class TestNLUService:
    """Test cases for NLUService"""

    @pytest.fixture
    def nlu(self):
        """Create NLU service instance"""
        return NLUService()

    @pytest.mark.asyncio
    async def test_greeting_intent_arabic(self, nlu):
        """Test Arabic greeting intent classification"""
        request = NLURequest(text="مرحبا", language="ar")
        response = await nlu.process(request)

        assert response.intent.intent_type == IntentType.GREETING
        assert response.intent.confidence > 0.8

    @pytest.mark.asyncio
    async def test_order_intent_arabic(self, nlu):
        """Test Arabic order intent classification"""
        request = NLURequest(text="أريد برجر كبير", language="ar")
        response = await nlu.process(request)

        assert response.intent.intent_type == IntentType.ORDER_ITEM
        assert response.intent.confidence > 0.7

    @pytest.mark.asyncio
    async def test_cancel_trigger(self, nlu):
        """Test cancel trigger word detection"""
        request = NLURequest(text="إلغاء", language="ar")
        response = await nlu.process(request)

        assert response.intent.intent_type == IntentType.CANCEL_ORDER
        assert response.intent.confidence == 1.0

    @pytest.mark.asyncio
    async def test_slot_extraction(self, nlu):
        """Test slot extraction from text"""
        request = NLURequest(text="أريد 2 برجر كبير", language="ar")
        response = await nlu.process(request)

        # Should extract quantity and size
        assert len(response.slots) > 0
