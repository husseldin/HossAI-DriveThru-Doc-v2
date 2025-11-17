"""
AI Drive-Thru Demo Application - Main Entry Point
Version: 1.0.0
Phase 1: Voice System ✅
Phase 2: Menu System ✅
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import settings
from src.utils import logger, log_service_event
from src.api.routes import voice_router, menu_router
from src.api.websocket import ws_handler
from src.services.stt import stt_service
from src.services.tts import tts_service
from src.services.language import language_detector
from src.services.interruption import interruption_detector
from src.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup
    log_service_event(
        "application",
        "startup",
        f"Starting {settings.app_name} v{settings.app_version}",
        environment=settings.environment,
        debug=settings.debug
    )

    try:
        # Initialize database
        logger.info("Initializing database...")
        init_db()

        # Initialize STT service
        logger.info("Initializing STT service...")
        await stt_service.initialize()

        # Initialize TTS service
        logger.info("Initializing TTS service...")
        await tts_service.initialize()

        # Perform health checks
        logger.info("Performing health checks...")
        stt_health = await stt_service.health_check()
        tts_health = await tts_service.health_check()

        logger.info(
            "Services initialized",
            stt_status=stt_health.status.value,
            tts_status=tts_health.status.value
        )

        log_service_event(
            "application",
            "ready",
            "Application started successfully and ready to accept requests"
        )

    except Exception as e:
        logger.error("Failed to initialize services", error=str(e))
        raise

    yield

    # Shutdown
    log_service_event(
        "application",
        "shutdown",
        "Shutting down application"
    )

    try:
        # Shutdown services
        await stt_service.shutdown()
        await tts_service.shutdown()

        logger.info("Services shut down successfully")

    except Exception as e:
        logger.error("Error during shutdown", error=str(e))


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered drive-thru ordering system with Arabic and English support",
    lifespan=lifespan,
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(voice_router)
app.include_router(menu_router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "application": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "environment": settings.environment,
        "documentation": "/docs"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Overall application health check

    Returns:
        Health status for all services
    """
    try:
        stt_health = await stt_service.health_check()
        tts_health = await tts_service.health_check()

        return {
            "status": "healthy",
            "services": {
                "stt": stt_health.dict(),
                "tts": tts_health.dict(),
                "language_detector": {
                    "status": language_detector.status.value,
                    "default_language": language_detector.default_language.value
                },
                "interruption_detector": {
                    "status": interruption_detector.status.value,
                    "enabled": interruption_detector.enabled
                }
            }
        }

    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )


# WebSocket endpoint for real-time voice interaction
@app.websocket("/ws/voice/{client_id}")
async def voice_websocket(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint for real-time voice interaction

    Args:
        websocket: WebSocket connection
        client_id: Unique client identifier
    """
    await ws_handler.handle_voice_stream(websocket, client_id)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(
        "Unhandled exception",
        path=request.url.path,
        method=request.method,
        error=str(exc)
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn

    log_service_event(
        "application",
        "start",
        f"Starting {settings.app_name} on {settings.host}:{settings.port}"
    )

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        workers=1 if settings.debug else settings.workers,
        log_level=settings.log_level.lower()
    )
