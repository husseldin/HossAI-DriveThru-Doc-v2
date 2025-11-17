"""
Menu Caching Service
Implements MENU-007 requirement - Redis caching for menu data
"""
import json
from typing import Optional, Any
import hashlib

try:
    import redis
except ImportError:
    redis = None

from src.config import settings
from src.utils import logger


class MenuCacheService:
    """
    Menu Caching Service

    Provides Redis-based caching for menu data with TTL
    """

    def __init__(self):
        self.enabled = settings.cache_ttl > 0
        self.ttl = settings.cache_ttl
        self.client: Optional[Any] = None

        if redis is not None and self.enabled:
            try:
                self.client = redis.Redis(
                    host=settings.redis_host,
                    port=settings.redis_port,
                    db=settings.redis_db,
                    password=settings.redis_password if settings.redis_password else None,
                    decode_responses=True
                )
                # Test connection
                self.client.ping()
                logger.info("Redis cache connected", host=settings.redis_host)
            except Exception as e:
                logger.warning("Redis connection failed, caching disabled", error=str(e))
                self.client = None
                self.enabled = False

    def _make_key(self, prefix: str, identifier: Any) -> str:
        """Generate cache key"""
        return f"menu:{prefix}:{identifier}"

    def get(self, prefix: str, identifier: Any) -> Optional[dict]:
        """Get cached data"""
        if not self.enabled or not self.client:
            return None

        try:
            key = self._make_key(prefix, identifier)
            data = self.client.get(key)
            if data:
                logger.debug("Cache hit", key=key)
                return json.loads(data)
            return None
        except Exception as e:
            logger.error("Cache get failed", error=str(e))
            return None

    def set(self, prefix: str, identifier: Any, data: dict, ttl: Optional[int] = None):
        """Set cached data"""
        if not self.enabled or not self.client:
            return

        try:
            key = self._make_key(prefix, identifier)
            ttl = ttl or self.ttl
            self.client.setex(key, ttl, json.dumps(data))
            logger.debug("Cache set", key=key, ttl=ttl)
        except Exception as e:
            logger.error("Cache set failed", error=str(e))

    def delete(self, prefix: str, identifier: Any):
        """Delete cached data"""
        if not self.enabled or not self.client:
            return

        try:
            key = self._make_key(prefix, identifier)
            self.client.delete(key)
            logger.debug("Cache deleted", key=key)
        except Exception as e:
            logger.error("Cache delete failed", error=str(e))

    def clear_pattern(self, pattern: str):
        """Clear all keys matching pattern"""
        if not self.enabled or not self.client:
            return

        try:
            keys = self.client.keys(f"menu:{pattern}:*")
            if keys:
                self.client.delete(*keys)
                logger.info("Cache pattern cleared", pattern=pattern, count=len(keys))
        except Exception as e:
            logger.error("Cache clear pattern failed", error=str(e))


# Global cache instance
menu_cache = MenuCacheService()
