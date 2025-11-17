"""
Structured logging configuration for AI Drive-Thru application
"""
import logging
import sys
from typing import Any
import structlog
from structlog.typing import FilteringBoundLogger

from src.config.settings import settings


def setup_logging() -> FilteringBoundLogger:
    """
    Set up structured logging with structlog

    Returns:
        Configured logger instance
    """
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.log_level.upper()),
    )

    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if not settings.debug
            else structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    return structlog.get_logger()


# Global logger instance
logger = setup_logging()


def log_service_event(
    service_name: str,
    event_type: str,
    message: str,
    **kwargs: Any
) -> None:
    """
    Log a service event with structured data

    Args:
        service_name: Name of the service
        event_type: Type of event (e.g., "startup", "error", "processing")
        message: Log message
        **kwargs: Additional context data
    """
    logger.info(
        message,
        service=service_name,
        event_type=event_type,
        **kwargs
    )


def log_performance_metric(
    component: str,
    metric_name: str,
    value: float,
    unit: str = "ms",
    **kwargs: Any
) -> None:
    """
    Log a performance metric

    Args:
        component: Component name (e.g., "stt", "tts", "nlu")
        metric_name: Metric name (e.g., "latency", "throughput")
        value: Metric value
        unit: Unit of measurement
        **kwargs: Additional context
    """
    logger.info(
        f"{component} {metric_name}: {value}{unit}",
        component=component,
        metric=metric_name,
        value=value,
        unit=unit,
        **kwargs
    )


def log_error(
    component: str,
    error_code: str,
    message: str,
    exception: Exception = None,
    **kwargs: Any
) -> None:
    """
    Log an error with structured data

    Args:
        component: Component name
        error_code: Error code (e.g., "ERR-VOICE-001")
        message: Error message
        exception: Exception object if available
        **kwargs: Additional context
    """
    logger.error(
        message,
        component=component,
        error_code=error_code,
        exception=str(exception) if exception else None,
        **kwargs
    )
