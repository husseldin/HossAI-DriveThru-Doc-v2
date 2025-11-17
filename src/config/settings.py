"""
Configuration settings for AI Drive-Thru application
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application Settings
    app_name: str = Field(default="AI Drive-Thru Demo", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")

    # Server Settings
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=46000, env="PORT")
    workers: int = Field(default=4, env="WORKERS")

    # Database Settings
    database_url: str = Field(
        default="postgresql://user:password@localhost:46432/drivethru",
        env="DATABASE_URL"
    )
    database_pool_size: int = Field(default=20, env="DATABASE_POOL_SIZE")
    database_max_overflow: int = Field(default=10, env="DATABASE_MAX_OVERFLOW")

    # Redis Cache Settings
    redis_host: str = Field(default="localhost", env="REDIS_HOST")
    redis_port: int = Field(default=46379, env="REDIS_PORT")
    redis_db: int = Field(default=0, env="REDIS_DB")
    redis_password: str = Field(default="", env="REDIS_PASSWORD")
    cache_ttl: int = Field(default=3600, env="CACHE_TTL")

    # Model Paths
    models_cache_dir: str = Field(default="./models_cache", env="MODELS_CACHE_DIR")
    stt_model_path: str = Field(default="base", env="STT_MODEL_PATH")
    tts_model_path: str = Field(
        default="tts_models/multilingual/multi-dataset/xtts_v2",
        env="TTS_MODEL_PATH"
    )
    llm_model_path: str = Field(
        default="./models_cache/llama-3.1-8b-instruct-q4_0.gguf",
        env="LLM_MODEL_PATH"
    )

    # Model Settings
    stt_device: str = Field(default="cpu", env="STT_DEVICE")
    stt_compute_type: str = Field(default="int8", env="STT_COMPUTE_TYPE")
    tts_use_gpu: bool = Field(default=False, env="TTS_USE_GPU")
    llm_n_ctx: int = Field(default=4096, env="LLM_N_CTX")
    llm_n_threads: int = Field(default=8, env="LLM_N_THREADS")

    # Voice Settings
    stt_latency_target: int = Field(default=500, env="STT_LATENCY_TARGET")
    tts_latency_target: int = Field(default=1000, env="TTS_LATENCY_TARGET")
    interruption_detection_ms: int = Field(default=200, env="INTERRUPTION_DETECTION_MS")

    # Language Settings
    default_language: str = Field(default="ar", env="DEFAULT_LANGUAGE")
    supported_languages: str = Field(default="ar,en", env="SUPPORTED_LANGUAGES")
    language_detection_threshold: float = Field(
        default=0.8,
        env="LANGUAGE_DETECTION_THRESHOLD"
    )
    code_switching_enabled: bool = Field(default=True, env="CODE_SWITCHING_ENABLED")

    # Branch Settings
    default_branch_id: int = Field(default=1, env="DEFAULT_BRANCH_ID")
    multi_branch_enabled: bool = Field(default=True, env="MULTI_BRANCH_ENABLED")

    # File Upload
    max_upload_size: int = Field(default=10485760, env="MAX_UPLOAD_SIZE")
    allowed_audio_formats: str = Field(default="wav,mp3,ogg", env="ALLOWED_AUDIO_FORMATS")

    # Security
    secret_key: str = Field(
        default="your-secret-key-here-change-in-production",
        env="SECRET_KEY"
    )
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30,
        env="ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    # CORS Settings
    cors_origins: str = Field(
        default="http://localhost:46001,http://localhost:46002,http://localhost:46000",
        env="CORS_ORIGINS"
    )
    cors_allow_credentials: bool = Field(default=True, env="CORS_ALLOW_CREDENTIALS")

    # Monitoring
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_port: int = Field(default=9090, env="METRICS_PORT")

    # Feature Flags
    enable_voice_interruption: bool = Field(default=True, env="ENABLE_VOICE_INTERRUPTION")
    enable_keyword_matching: bool = Field(default=True, env="ENABLE_KEYWORD_MATCHING")
    enable_tts_caching: bool = Field(default=True, env="ENABLE_TTS_CACHING")
    enable_hot_reload: bool = Field(default=True, env="ENABLE_HOT_RELOAD")

    @property
    def supported_languages_list(self) -> List[str]:
        """Get list of supported languages"""
        return [lang.strip() for lang in self.supported_languages.split(",")]

    @property
    def cors_origins_list(self) -> List[str]:
        """Get list of CORS origins"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def allowed_audio_formats_list(self) -> List[str]:
        """Get list of allowed audio formats"""
        return [fmt.strip() for fmt in self.allowed_audio_formats.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
