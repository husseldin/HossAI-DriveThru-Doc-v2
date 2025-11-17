"""API routes module"""
from .voice import router as voice_router
from .menu import router as menu_router
from .nlu import router as nlu_router

__all__ = ["voice_router", "menu_router", "nlu_router"]
