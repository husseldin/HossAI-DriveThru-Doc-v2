"""
Voice API routes for STT and TTS
"""
import io
from typing import Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import StreamingResponse
import numpy as np
import soundfile as sf

from src.models import (
    TranscriptionResponse,
    TTSRequest,
    TTSResponse,
    LanguageCode,
    HealthCheckResponse
)
from src.services.stt import stt_service
from src.services.tts import tts_service
from src.services.language import language_detector
from src.utils import logger

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])


@router.post("/stt/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    """
    Transcribe audio file to text

    Args:
        audio: Audio file (WAV, MP3, OGG)
        language: Optional language hint ('ar' or 'en')

    Returns:
        TranscriptionResponse with transcribed text
    """
    try:
        # Read audio file
        audio_data = await audio.read()

        # Save to temporary location for processing
        temp_path = f"/tmp/{audio.filename}"
        with open(temp_path, "wb") as f:
            f.write(audio_data)

        # Transcribe
        result = await stt_service.transcribe_file(temp_path, language=language)

        # Detect language if not in original result
        if language is None:
            lang_result = language_detector.detect_language(result.text)
            result.language = lang_result.detected_language

        logger.info(
            "Audio transcribed",
            filename=audio.filename,
            text_length=len(result.text),
            language=result.language.value
        )

        return result

    except Exception as e:
        logger.error("Transcription failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/tts/generate")
async def generate_speech(request: TTSRequest):
    """
    Generate speech from text

    Args:
        request: TTS request with text and configuration

    Returns:
        Audio file as streaming response
    """
    try:
        # Generate speech
        response = await tts_service.generate_speech(request)

        # Create audio buffer
        audio_buffer = io.BytesIO(response.audio_data)
        audio_buffer.seek(0)

        logger.info(
            "Speech generated",
            text_length=len(request.text),
            language=request.language.value,
            duration=response.duration
        )

        # Return as streaming audio response
        return StreamingResponse(
            audio_buffer,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=speech.wav",
                "X-Audio-Duration": str(response.duration),
                "X-Sample-Rate": str(response.sample_rate)
            }
        )

    except Exception as e:
        logger.error("Speech generation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Speech generation failed: {str(e)}")


@router.get("/stt/health", response_model=HealthCheckResponse)
async def stt_health_check():
    """
    Check STT service health

    Returns:
        HealthCheckResponse with service status
    """
    try:
        return await stt_service.health_check()
    except Exception as e:
        logger.error("STT health check failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.get("/tts/health", response_model=HealthCheckResponse)
async def tts_health_check():
    """
    Check TTS service health

    Returns:
        HealthCheckResponse with service status
    """
    try:
        return await tts_service.health_check()
    except Exception as e:
        logger.error("TTS health check failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.post("/tts/cache/clear")
async def clear_tts_cache():
    """
    Clear TTS cache

    Returns:
        Number of items cleared
    """
    try:
        count = tts_service.clear_cache()
        logger.info("TTS cache cleared", count=count)
        return {"message": f"Cleared {count} cached items", "count": count}
    except Exception as e:
        logger.error("Failed to clear TTS cache", error=str(e))
        raise HTTPException(status_code=500, detail=f"Cache clear failed: {str(e)}")


@router.get("/models/info")
async def get_models_info():
    """
    Get information about loaded models

    Returns:
        Model information for STT and TTS
    """
    return {
        "stt": stt_service.get_model_info().dict(),
        "tts": tts_service.get_model_info().dict()
    }
