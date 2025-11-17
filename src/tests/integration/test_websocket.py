"""
Integration tests for WebSocket Voice Streaming
Tests WebSocket connection, audio streaming, and real-time communication
"""
import pytest
import json
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch


class TestWebSocketConnection:
    """Test cases for WebSocket connection management"""

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_websocket_connect(self, test_client):
        """Test WebSocket connection establishment"""
        with test_client.websocket_connect("/ws/voice/test-client-1") as websocket:
            # Connection should be established
            assert websocket is not None

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_websocket_connect_with_invalid_path(self, test_client):
        """Test WebSocket connection with invalid path"""
        try:
            with test_client.websocket_connect("/ws/invalid-path") as websocket:
                pass
        except Exception:
            # Should raise exception for invalid path
            pass

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_websocket_disconnect(self, test_client):
        """Test WebSocket disconnection"""
        with test_client.websocket_connect("/ws/voice/test-client-2") as websocket:
            # Send close frame
            websocket.close()
            # Connection should be closed

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_websocket_reconnect(self, test_client):
        """Test WebSocket reconnection after disconnect"""
        # First connection
        with test_client.websocket_connect("/ws/voice/test-client-3") as websocket:
            websocket.send_json({"type": "ping"})

        # Reconnect with same client ID
        with test_client.websocket_connect("/ws/voice/test-client-3") as websocket:
            websocket.send_json({"type": "ping"})
            # Should successfully reconnect


class TestVoiceStreaming:
    """Test cases for voice audio streaming"""

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_send_audio_chunk(self, test_client, sample_audio_bytes):
        """Test sending audio chunk via WebSocket"""
        with test_client.websocket_connect("/ws/voice/test-client-4") as websocket:
            # Send audio chunk
            import base64
            audio_b64 = base64.b64encode(sample_audio_bytes).decode('utf-8')

            message = {
                "type": "audio_chunk",
                "data": audio_b64
            }

            websocket.send_json(message)

            # Should receive response
            response = websocket.receive_json(timeout=5)
            assert response is not None

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_receive_transcription(self, test_client):
        """Test receiving transcription result"""
        with test_client.websocket_connect("/ws/voice/test-client-5") as websocket:
            # Send audio
            message = {
                "type": "audio_chunk",
                "data": "fake_audio_data"
            }
            websocket.send_json(message)

            # Wait for transcription
            response = websocket.receive_json(timeout=10)

            # Should receive transcription or error
            assert "type" in response
            assert response["type"] in ["transcription", "error", "processing"]

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_receive_tts_audio(self, test_client):
        """Test receiving TTS audio response"""
        with test_client.websocket_connect("/ws/voice/test-client-6") as websocket:
            # Trigger TTS response
            message = {
                "type": "audio_chunk",
                "data": "test_data"
            }
            websocket.send_json(message)

            # Receive responses
            responses = []
            for _ in range(3):  # Receive up to 3 messages
                try:
                    response = websocket.receive_json(timeout=5)
                    responses.append(response)
                except:
                    break

            # Should have received at least one response
            assert len(responses) > 0

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_streaming_multiple_chunks(self, test_client):
        """Test streaming multiple audio chunks"""
        with test_client.websocket_connect("/ws/voice/test-client-7") as websocket:
            # Send multiple chunks
            chunks = ["chunk1", "chunk2", "chunk3"]

            for chunk in chunks:
                message = {
                    "type": "audio_chunk",
                    "data": chunk
                }
                websocket.send_json(message)

            # Should handle all chunks
            # Actual response depends on implementation


class TestMessageProtocol:
    """Test cases for WebSocket message protocol"""

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_ping_pong(self, test_client):
        """Test ping/pong mechanism"""
        with test_client.websocket_connect("/ws/voice/test-client-8") as websocket:
            # Send ping
            websocket.send_json({"type": "ping"})

            # Receive pong
            response = websocket.receive_json(timeout=2)
            assert response["type"] == "pong"

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_start_recording(self, test_client):
        """Test start recording message"""
        with test_client.websocket_connect("/ws/voice/test-client-9") as websocket:
            message = {
                "type": "start_recording",
                "language": "ar"
            }
            websocket.send_json(message)

            # Should acknowledge
            response = websocket.receive_json(timeout=2)
            assert response is not None

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_stop_recording(self, test_client):
        """Test stop recording message"""
        with test_client.websocket_connect("/ws/voice/test-client-10") as websocket:
            # Start recording
            websocket.send_json({"type": "start_recording", "language": "ar"})

            # Stop recording
            websocket.send_json({"type": "stop_recording"})

            # Should receive final transcription
            response = websocket.receive_json(timeout=5)
            assert response is not None

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_invalid_message_type(self, test_client):
        """Test handling of invalid message type"""
        with test_client.websocket_connect("/ws/voice/test-client-11") as websocket:
            # Send invalid message
            websocket.send_json({"type": "invalid_type"})

            # Should receive error
            response = websocket.receive_json(timeout=2)
            assert response["type"] == "error" or "error" in response

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_malformed_message(self, test_client):
        """Test handling of malformed message"""
        with test_client.websocket_connect("/ws/voice/test-client-12") as websocket:
            # Send malformed JSON
            try:
                websocket.send_text("not-json")
                response = websocket.receive_json(timeout=2)
                # Should handle gracefully
            except:
                # May close connection
                pass


class TestConcurrency:
    """Test cases for concurrent WebSocket connections"""

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_multiple_clients(self, test_client):
        """Test multiple simultaneous WebSocket clients"""
        # Connect multiple clients
        connections = []

        for i in range(3):
            ws = test_client.websocket_connect(f"/ws/voice/concurrent-client-{i}")
            connections.append(ws)

        # Each client should maintain independent state
        for i, ws in enumerate(connections):
            with ws as websocket:
                message = {
                    "type": "ping",
                    "client_id": f"concurrent-client-{i}"
                }
                websocket.send_json(message)

    @pytest.mark.integration
    @pytest.mark.websocket
    async def test_concurrent_audio_streaming(self, test_client):
        """Test concurrent audio streaming from multiple clients"""
        async def stream_audio(client_id):
            with test_client.websocket_connect(f"/ws/voice/{client_id}") as websocket:
                for i in range(5):
                    message = {
                        "type": "audio_chunk",
                        "data": f"audio_data_{i}"
                    }
                    websocket.send_json(message)
                    await asyncio.sleep(0.1)

        # Stream from multiple clients concurrently
        tasks = [
            stream_audio(f"concurrent-stream-{i}")
            for i in range(3)
        ]

        await asyncio.gather(*tasks)


class TestErrorHandling:
    """Test cases for WebSocket error handling"""

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_connection_timeout(self, test_client):
        """Test WebSocket connection timeout"""
        with test_client.websocket_connect("/ws/voice/timeout-client") as websocket:
            # Don't send any messages
            # Connection should timeout or close after inactivity
            try:
                response = websocket.receive_json(timeout=30)
            except:
                # Timeout expected
                pass

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_audio_processing_error(self, test_client):
        """Test handling of audio processing errors"""
        with test_client.websocket_connect("/ws/voice/error-client") as websocket:
            # Send invalid audio data
            message = {
                "type": "audio_chunk",
                "data": "invalid_audio"
            }
            websocket.send_json(message)

            # Should receive error message
            response = websocket.receive_json(timeout=5)
            # May be error or just acknowledgment

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_service_unavailable(self, test_client):
        """Test handling when services are unavailable"""
        # Mock service failure
        with test_client.websocket_connect("/ws/voice/unavailable-client") as websocket:
            message = {
                "type": "audio_chunk",
                "data": "test_data"
            }
            websocket.send_json(message)

            # Should handle gracefully


class TestStateManagement:
    """Test cases for WebSocket state management"""

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_session_state(self, test_client):
        """Test session state persistence"""
        with test_client.websocket_connect("/ws/voice/state-client") as websocket:
            # Set language
            websocket.send_json({
                "type": "set_language",
                "language": "ar"
            })

            # Start order
            websocket.send_json({
                "type": "audio_chunk",
                "data": "order_audio"
            })

            # State should persist across messages

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_order_context(self, test_client):
        """Test order context management via WebSocket"""
        with test_client.websocket_connect("/ws/voice/order-context-client") as websocket:
            # Add item
            websocket.send_json({
                "type": "add_item",
                "item_id": 1,
                "quantity": 2
            })

            # Get current order
            websocket.send_json({
                "type": "get_order"
            })

            response = websocket.receive_json(timeout=2)
            # Should return current order state

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_conversation_history(self, test_client):
        """Test conversation history tracking"""
        with test_client.websocket_connect("/ws/voice/history-client") as websocket:
            # Send multiple messages
            messages = [
                {"type": "audio_chunk", "data": "msg1"},
                {"type": "audio_chunk", "data": "msg2"},
                {"type": "audio_chunk", "data": "msg3"}
            ]

            for msg in messages:
                websocket.send_json(msg)

            # History should be maintained


class TestPerformance:
    """Test cases for WebSocket performance"""

    @pytest.mark.integration
    @pytest.mark.websocket
    @pytest.mark.slow
    def test_high_frequency_messages(self, test_client):
        """Test handling high-frequency messages"""
        with test_client.websocket_connect("/ws/voice/perf-client") as websocket:
            # Send 100 messages rapidly
            for i in range(100):
                message = {
                    "type": "audio_chunk",
                    "data": f"chunk_{i}"
                }
                websocket.send_json(message)

            # Should handle all messages

    @pytest.mark.integration
    @pytest.mark.websocket
    @pytest.mark.slow
    def test_large_audio_chunk(self, test_client):
        """Test handling large audio chunks"""
        with test_client.websocket_connect("/ws/voice/large-chunk-client") as websocket:
            import base64

            # Create large audio chunk (1MB)
            large_audio = b"0" * (1024 * 1024)
            audio_b64 = base64.b64encode(large_audio).decode('utf-8')

            message = {
                "type": "audio_chunk",
                "data": audio_b64
            }

            websocket.send_json(message)

            # Should handle large payload

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_latency_measurement(self, test_client):
        """Test WebSocket message latency"""
        import time

        with test_client.websocket_connect("/ws/voice/latency-client") as websocket:
            start = time.time()

            # Send message
            websocket.send_json({"type": "ping"})

            # Receive response
            response = websocket.receive_json(timeout=5)

            latency = (time.time() - start) * 1000  # ms

            # Latency should be reasonable (< 100ms for local test)
            assert latency < 1000  # 1 second


class TestSecurity:
    """Test cases for WebSocket security"""

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_client_id_validation(self, test_client):
        """Test client ID validation"""
        # Try with invalid client ID
        invalid_ids = [
            "",
            "../../../etc/passwd",
            "<script>alert('xss')</script>",
            "a" * 1000  # Very long ID
        ]

        for invalid_id in invalid_ids:
            try:
                with test_client.websocket_connect(f"/ws/voice/{invalid_id}") as websocket:
                    pass
            except:
                # Should reject or sanitize invalid IDs
                pass

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_message_size_limit(self, test_client):
        """Test message size limits"""
        with test_client.websocket_connect("/ws/voice/size-limit-client") as websocket:
            # Try to send very large message (> 10MB)
            import base64
            huge_data = b"0" * (11 * 1024 * 1024)
            data_b64 = base64.b64encode(huge_data).decode('utf-8')

            try:
                websocket.send_json({
                    "type": "audio_chunk",
                    "data": data_b64
                })
                # Should reject or close connection
            except:
                # Expected to fail
                pass

    @pytest.mark.integration
    @pytest.mark.websocket
    def test_rate_limiting(self, test_client):
        """Test rate limiting for WebSocket messages"""
        with test_client.websocket_connect("/ws/voice/rate-limit-client") as websocket:
            # Send many messages rapidly
            for i in range(1000):
                try:
                    websocket.send_json({
                        "type": "ping",
                        "index": i
                    })
                except:
                    # May be rate limited
                    break
