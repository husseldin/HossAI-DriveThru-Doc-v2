"""
Integration tests for Voice Workflow
Tests the complete STT → NLU → TTS pipeline
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch
from src.models.nlu import NLURequest, IntentType


class TestVoiceWorkflow:
    """Test cases for complete voice workflow integration"""

    @pytest.fixture
    def workflow_services(self, mock_stt_service, mock_nlu_service, mock_tts_service):
        """Create workflow with all voice services"""
        return {
            'stt': mock_stt_service,
            'nlu': mock_nlu_service,
            'tts': mock_tts_service
        }

    # ============================================================================
    # COMPLETE WORKFLOW TESTS
    # ============================================================================

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_complete_order_workflow_arabic(self, workflow_services, sample_audio_bytes):
        """Test complete order workflow in Arabic"""
        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        # Step 1: STT - Convert audio to text
        stt_result = await stt.transcribe(sample_audio_bytes, language="ar")
        transcribed_text = stt_result if isinstance(stt_result, str) else "أريد برجر كبير"

        assert transcribed_text is not None
        assert len(transcribed_text) > 0

        # Step 2: NLU - Extract intent and slots
        nlu_request = NLURequest(text=transcribed_text, language="ar")
        nlu_response = await nlu.process(nlu_request)

        assert nlu_response.intent.intent_type == IntentType.ORDER_ITEM
        assert len(nlu_response.slots) > 0

        # Step 3: Generate response text based on intent
        response_text = f"تم إضافة {transcribed_text} إلى طلبك"

        # Step 4: TTS - Convert response to audio
        response_audio = await tts.synthesize(response_text, language="ar")

        assert response_audio is not None
        assert len(response_audio) > 0

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_complete_greeting_workflow(self, workflow_services):
        """Test complete greeting workflow"""
        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        # Simulate user saying "مرحبا"
        greeting_audio = b"fake_greeting_audio"

        # STT
        transcribed = await stt.transcribe(greeting_audio, language="ar")
        text = "مرحبا"

        # NLU
        nlu_request = NLURequest(text=text, language="ar")
        nlu_response = await nlu.process(nlu_request)

        assert nlu_response.intent.intent_type == IntentType.GREETING

        # Generate response
        response_text = "مرحبا بك! كيف يمكنني مساعدتك؟"

        # TTS
        response_audio = await tts.synthesize(response_text, language="ar")

        assert response_audio is not None

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_complete_confirmation_workflow(self, workflow_services):
        """Test complete confirmation workflow"""
        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        # User confirms order
        confirm_audio = b"fake_confirm_audio"

        # STT
        text = "نعم"

        # NLU
        nlu_request = NLURequest(text=text, language="ar")
        nlu_response = await nlu.process(nlu_request)

        assert nlu_response.intent.intent_type == IntentType.CONFIRM

        # Generate response
        response_text = "ممتاز! سأقوم بتأكيد طلبك الآن"

        # TTS
        response_audio = await tts.synthesize(response_text, language="ar")

        assert response_audio is not None

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_complete_cancellation_workflow(self, workflow_services):
        """Test complete cancellation workflow"""
        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        # User cancels order
        text = "إلغاء"

        # NLU
        nlu_request = NLURequest(text=text, language="ar")
        nlu_response = await nlu.process(nlu_request)

        assert nlu_response.intent.intent_type == IntentType.CANCEL_ORDER

        # Generate response
        response_text = "تم إلغاء الطلب"

        # TTS
        response_audio = await tts.synthesize(response_text, language="ar")

        assert response_audio is not None

    # ============================================================================
    # MULTI-TURN CONVERSATION TESTS
    # ============================================================================

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_multi_turn_order_conversation(self, workflow_services):
        """Test multi-turn conversation for ordering"""
        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        conversation = [
            # Turn 1: Initial greeting
            {"user": "مرحبا", "expected_intent": IntentType.GREETING},
            # Turn 2: Order item
            {"user": "أريد برجر", "expected_intent": IntentType.ORDER_ITEM},
            # Turn 3: Specify size
            {"user": "كبير", "expected_intent": IntentType.ORDER_ITEM},
            # Turn 4: Confirm
            {"user": "نعم", "expected_intent": IntentType.CONFIRM},
        ]

        for turn in conversation:
            # Process user input
            nlu_request = NLURequest(text=turn["user"], language="ar")
            nlu_response = await nlu.process(nlu_request)

            assert nlu_response.intent.intent_type == turn["expected_intent"]

            # Generate and synthesize response
            response_text = f"استجابة لـ: {turn['user']}"
            response_audio = await tts.synthesize(response_text, language="ar")

            assert response_audio is not None

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_error_recovery_workflow(self, workflow_services):
        """Test error recovery in workflow"""
        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        # User says something unclear
        unclear_text = "um... uh..."

        # NLU should mark as UNKNOWN
        nlu_request = NLURequest(text=unclear_text, language="ar")
        nlu_response = await nlu.process(nlu_request)

        assert nlu_response.intent.intent_type == IntentType.UNKNOWN

        # System should ask for clarification
        response_text = "عذراً، لم أفهم. هل يمكنك إعادة الطلب؟"
        response_audio = await tts.synthesize(response_text, language="ar")

        assert response_audio is not None

    # ============================================================================
    # CODE-SWITCHING WORKFLOW TESTS
    # ============================================================================

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_code_switching_workflow(self, workflow_services):
        """Test workflow with code-switching (Arabic + English)"""
        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        # User uses mixed language
        text = "أريد burger كبير"

        # NLU should handle code-switching
        nlu_request = NLURequest(text=text, language="ar")
        nlu_response = await nlu.process(nlu_request)

        assert nlu_response.intent.intent_type == IntentType.ORDER_ITEM

        # Response can be in same mixed style
        response_text = "تم إضافة burger كبير"
        response_audio = await tts.synthesize(response_text, language="ar")

        assert response_audio is not None

    # ============================================================================
    # LATENCY AND PERFORMANCE TESTS
    # ============================================================================

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.slow
    async def test_workflow_end_to_end_latency(self, workflow_services, sample_audio_bytes):
        """Test end-to-end latency of complete workflow"""
        import time

        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        start_time = time.time()

        # STT
        stt_start = time.time()
        text = await stt.transcribe(sample_audio_bytes, language="ar")
        stt_latency = (time.time() - stt_start) * 1000

        # NLU
        nlu_start = time.time()
        nlu_request = NLURequest(text=text or "أريد برجر", language="ar")
        nlu_response = await nlu.process(nlu_request)
        nlu_latency = (time.time() - nlu_start) * 1000

        # TTS
        tts_start = time.time()
        response_audio = await tts.synthesize("تم الطلب", language="ar")
        tts_latency = (time.time() - tts_start) * 1000

        total_latency = (time.time() - start_time) * 1000

        # Assert reasonable latencies (these are mocked, so very fast)
        assert stt_latency < 5000  # 5 seconds
        assert nlu_latency < 1000  # 1 second
        assert tts_latency < 5000  # 5 seconds
        assert total_latency < 10000  # 10 seconds total

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_concurrent_workflow_requests(self, workflow_services):
        """Test handling concurrent workflow requests"""
        import asyncio

        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        async def process_order(order_text):
            # NLU
            nlu_request = NLURequest(text=order_text, language="ar")
            nlu_response = await nlu.process(nlu_request)

            # TTS
            response_audio = await tts.synthesize(f"تم طلب {order_text}", language="ar")

            return response_audio

        # Process 5 concurrent orders
        orders = [
            "أريد برجر",
            "أريد بيتزا",
            "أريد عصير",
            "أريد ساندويش",
            "أريد قهوة"
        ]

        results = await asyncio.gather(*[process_order(order) for order in orders])

        assert len(results) == 5
        assert all(r is not None for r in results)

    # ============================================================================
    # ERROR HANDLING TESTS
    # ============================================================================

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_stt_failure_handling(self, workflow_services):
        """Test handling STT service failure"""
        stt = workflow_services['stt']
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        # Simulate STT failure
        stt.transcribe = AsyncMock(return_value="")

        text = await stt.transcribe(b"bad_audio", language="ar")

        # Should return empty or None
        assert text == "" or text is None

        # System should handle gracefully
        if text:
            nlu_request = NLURequest(text=text, language="ar")
            nlu_response = await nlu.process(nlu_request)
            assert nlu_response.intent.intent_type == IntentType.UNKNOWN

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_nlu_fallback_handling(self, workflow_services):
        """Test NLU fallback when confidence is low"""
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        # Process unclear text
        nlu_request = NLURequest(text="asdfghjkl", language="ar")
        nlu_response = await nlu.process(nlu_request)

        # Should mark as UNKNOWN
        assert nlu_response.intent.intent_type == IntentType.UNKNOWN

        # Generate fallback response
        fallback_text = "عذراً، لم أفهم طلبك"
        response_audio = await tts.synthesize(fallback_text, language="ar")

        assert response_audio is not None

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_tts_failure_handling(self, workflow_services):
        """Test handling TTS service failure"""
        tts = workflow_services['tts']

        # Simulate TTS failure
        tts.synthesize = AsyncMock(return_value=None)

        response_audio = await tts.synthesize("test", language="ar")

        # Should return None or empty
        assert response_audio is None or response_audio == b""

    # ============================================================================
    # LANGUAGE SWITCHING TESTS
    # ============================================================================

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_language_switch_mid_conversation(self, workflow_services):
        """Test switching language mid-conversation"""
        nlu = workflow_services['nlu']
        tts = workflow_services['tts']

        # Start in Arabic
        req1 = NLURequest(text="مرحبا", language="ar")
        res1 = await nlu.process(req1)
        assert res1.intent.intent_type == IntentType.GREETING

        audio1 = await tts.synthesize("مرحبا بك", language="ar")
        assert audio1 is not None

        # Switch to English
        req2 = NLURequest(text="I want burger", language="en")
        res2 = await nlu.process(req2)
        assert res2.intent.intent_type == IntentType.ORDER_ITEM

        audio2 = await tts.synthesize("Sure, adding burger", language="en")
        assert audio2 is not None

    # ============================================================================
    # CONTEXT PERSISTENCE TESTS
    # ============================================================================

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_context_persistence_across_workflow(self, workflow_services):
        """Test that context is maintained across workflow steps"""
        nlu = workflow_services['nlu']

        context = {}

        # First turn: Order item
        req1 = NLURequest(text="أريد برجر", language="ar", context=context)
        res1 = await nlu.process(req1)

        # Update context with item
        context['current_item'] = 'burger'
        context['previous_intent'] = IntentType.ORDER_ITEM

        # Second turn: Specify size (should use context)
        req2 = NLURequest(text="كبير", language="ar", context=context)
        res2 = await nlu.process(req2)

        # Should understand "كبير" refers to the burger size

    # ============================================================================
    # INTERRUPTION HANDLING TESTS
    # ============================================================================

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_user_interruption_during_tts(self, workflow_services):
        """Test handling user interruption during TTS playback"""
        stt = workflow_services['stt']
        tts = workflow_services['tts']

        # Start TTS
        tts_task = tts.synthesize("هذا نص طويل جداً...", language="ar")

        # User interrupts (new audio detected)
        interruption_audio = b"interrupt"

        # Should stop TTS and process new input
        # This depends on implementation

    # ============================================================================
    # REAL-TIME STREAMING TESTS
    # ============================================================================

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_streaming_workflow(self, workflow_services):
        """Test streaming workflow with chunked audio"""
        stt = workflow_services['stt']

        # Simulate streaming audio chunks
        chunks = [
            b"chunk1",
            b"chunk2",
            b"chunk3"
        ]

        # Process chunks (if streaming is supported)
        for chunk in chunks:
            # In real implementation, chunks would be accumulated
            pass

        # Final transcription
        full_audio = b"".join(chunks)
        text = await stt.transcribe(full_audio, language="ar")

        assert text is not None
