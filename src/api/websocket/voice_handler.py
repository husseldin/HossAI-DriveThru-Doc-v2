"""
WebSocket handler for real-time voice interaction
"""
import asyncio
import json
from typing import Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
import numpy as np

from src.services.stt import stt_service
from src.services.tts import tts_service
from src.services.language import language_detector
from src.services.interruption import interruption_detector
from src.models import TTSRequest, LanguageCode, VoiceInterruptionEvent
from src.utils import logger


class VoiceWebSocketHandler:
    """
    WebSocket handler for real-time voice interaction

    Handles:
    - Real-time STT streaming
    - Real-time TTS streaming
    - Voice interruption detection
    - Bidirectional audio streaming
    """

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """
        Accept WebSocket connection

        Args:
            websocket: WebSocket connection
            client_id: Unique client identifier
        """
        await websocket.accept()
        self.active_connections[client_id] = websocket

        logger.info(
            "WebSocket connected",
            client_id=client_id,
            active_connections=len(self.active_connections)
        )

    def disconnect(self, client_id: str):
        """
        Disconnect WebSocket

        Args:
            client_id: Client identifier
        """
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(
                "WebSocket disconnected",
                client_id=client_id,
                active_connections=len(self.active_connections)
            )

    async def handle_voice_stream(self, websocket: WebSocket, client_id: str):
        """
        Handle real-time voice streaming

        Args:
            websocket: WebSocket connection
            client_id: Client identifier

        Message Format (from client):
        {
            "type": "audio" | "config" | "stop",
            "data": base64_encoded_audio | config_object,
            "language": "ar" | "en" (optional)
        }

        Message Format (to client):
        {
            "type": "transcription" | "speech" | "interruption" | "error",
            "data": {...}
        }
        """
        try:
            await self.connect(websocket, client_id)

            # Register interruption callback
            async def on_interruption(event: VoiceInterruptionEvent):
                await self.send_message(websocket, {
                    "type": "interruption",
                    "data": {
                        "detected_at": event.detected_at.isoformat(),
                        "confidence": event.confidence,
                        "audio_level": event.audio_level
                    }
                })

            interruption_detector.register_callback(on_interruption)

            # Main message loop
            while True:
                # Receive message from client
                message = await websocket.receive()

                if "bytes" in message:
                    # Binary audio data
                    audio_data = message["bytes"]
                    await self.process_audio_chunk(
                        websocket,
                        audio_data,
                        client_id
                    )

                elif "text" in message:
                    # JSON message
                    data = json.loads(message["text"])
                    await self.process_text_message(
                        websocket,
                        data,
                        client_id
                    )

        except WebSocketDisconnect:
            logger.info("Client disconnected", client_id=client_id)
            self.disconnect(client_id)

        except Exception as e:
            logger.error(
                "WebSocket error",
                client_id=client_id,
                error=str(e)
            )
            await self.send_error(websocket, str(e))
            self.disconnect(client_id)

    async def process_audio_chunk(
        self,
        websocket: WebSocket,
        audio_data: bytes,
        client_id: str
    ):
        """
        Process audio chunk for STT

        Args:
            websocket: WebSocket connection
            audio_data: Raw audio bytes
            client_id: Client identifier
        """
        try:
            # Convert audio bytes to numpy array
            # Assuming 16-bit PCM, 16kHz
            audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32)
            audio_array = audio_array / 32768.0  # Normalize to [-1, 1]

            # Transcribe audio
            result = await stt_service.transcribe(audio_array, sample_rate=16000)

            # Detect language
            lang_result = language_detector.detect_language(result.text)

            # Send transcription result
            await self.send_message(websocket, {
                "type": "transcription",
                "data": {
                    "text": result.text,
                    "confidence": result.confidence,
                    "language": lang_result.detected_language.value,
                    "is_code_switching": lang_result.is_code_switching
                }
            })

            # Check for interruption if TTS is speaking
            if interruption_detector.is_speaking:
                interruption = await interruption_detector.detect_interruption(
                    audio_data,
                    sample_rate=16000
                )
                if interruption:
                    # Interruption will be handled by callback
                    pass

        except Exception as e:
            logger.error("Audio processing failed", client_id=client_id, error=str(e))
            await self.send_error(websocket, f"Audio processing failed: {str(e)}")

    async def process_text_message(
        self,
        websocket: WebSocket,
        data: Dict[str, Any],
        client_id: str
    ):
        """
        Process text message from client

        Args:
            websocket: WebSocket connection
            data: Message data
            client_id: Client identifier
        """
        msg_type = data.get("type")

        if msg_type == "tts_request":
            # Generate TTS
            await self.handle_tts_request(websocket, data, client_id)

        elif msg_type == "config":
            # Update configuration
            logger.info("Configuration updated", client_id=client_id, config=data.get("data"))
            await self.send_message(websocket, {
                "type": "config_ack",
                "data": {"status": "ok"}
            })

        elif msg_type == "stop":
            # Stop current operation
            interruption_detector.set_speaking_state(False)
            await self.send_message(websocket, {
                "type": "stop_ack",
                "data": {"status": "stopped"}
            })

        else:
            logger.warning("Unknown message type", type=msg_type, client_id=client_id)

    async def handle_tts_request(
        self,
        websocket: WebSocket,
        data: Dict[str, Any],
        client_id: str
    ):
        """
        Handle TTS generation request

        Args:
            websocket: WebSocket connection
            data: Request data
            client_id: Client identifier
        """
        try:
            text = data.get("text")
            language = data.get("language", "ar")
            voice_config = data.get("voice_config")

            if not text:
                await self.send_error(websocket, "Text is required")
                return

            # Create TTS request
            request = TTSRequest(
                text=text,
                language=LanguageCode(language),
                voice_config=voice_config
            )

            # Set speaking state for interruption detection
            interruption_detector.set_speaking_state(True)

            # Generate speech
            response = await tts_service.generate_speech(request)

            # Send audio data
            await websocket.send_bytes(response.audio_data)

            # Send metadata
            await self.send_message(websocket, {
                "type": "tts_complete",
                "data": {
                    "duration": response.duration,
                    "sample_rate": response.sample_rate,
                    "format": response.format
                }
            })

            # Reset speaking state
            interruption_detector.set_speaking_state(False)

        except Exception as e:
            logger.error("TTS request failed", client_id=client_id, error=str(e))
            await self.send_error(websocket, f"TTS failed: {str(e)}")
            interruption_detector.set_speaking_state(False)

    async def send_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """
        Send JSON message to client

        Args:
            websocket: WebSocket connection
            message: Message to send
        """
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error("Failed to send message", error=str(e))

    async def send_error(self, websocket: WebSocket, error: str):
        """
        Send error message to client

        Args:
            websocket: WebSocket connection
            error: Error message
        """
        await self.send_message(websocket, {
            "type": "error",
            "data": {"message": error}
        })


# Global WebSocket handler instance
ws_handler = VoiceWebSocketHandler()
