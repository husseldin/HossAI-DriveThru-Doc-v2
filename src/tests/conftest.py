"""
Pytest Configuration and Fixtures
Provides shared fixtures for all tests
"""
import asyncio
import os
from typing import AsyncGenerator, Generator
from unittest.mock import MagicMock, AsyncMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from src.database import Base, get_db
from src.main import app
from src.models import Branch, Menu, Category, Item, Variant, AddOn, Keyword
from src.services.voice.stt import STTService
from src.services.voice.tts import TTSService
from src.services.nlu import NLUService
from src.models.nlu import NLUResponse, Intent, IntentType, Slot


# ============================================================================
# DATABASE FIXTURES
# ============================================================================

# Test database URL (in-memory SQLite for fast tests)
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine"""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    # Create all tables
    Base.metadata.create_all(bind=engine)

    yield engine

    # Drop all tables after tests
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(test_engine) -> Generator[Session, None, None]:
    """Create a fresh database session for each test"""
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )

    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(scope="function")
def test_client(db_session) -> Generator[TestClient, None, None]:
    """Create FastAPI test client with test database"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


# ============================================================================
# SAMPLE DATA FIXTURES
# ============================================================================

@pytest.fixture
def sample_branch(db_session) -> Branch:
    """Create a sample branch"""
    branch = Branch(
        name_ar="الفرع الرئيسي",
        name_en="Main Branch",
        location="Riyadh",
        phone="+966123456789",
        is_active=True
    )
    db_session.add(branch)
    db_session.commit()
    db_session.refresh(branch)
    return branch


@pytest.fixture
def sample_menu(db_session, sample_branch) -> Menu:
    """Create a sample menu"""
    menu = Menu(
        branch_id=sample_branch.id,
        name_ar="القائمة الرئيسية",
        name_en="Main Menu",
        is_active=True
    )
    db_session.add(menu)
    db_session.commit()
    db_session.refresh(menu)
    return menu


@pytest.fixture
def sample_category(db_session, sample_menu) -> Category:
    """Create a sample category"""
    category = Category(
        menu_id=sample_menu.id,
        name_ar="برجر",
        name_en="Burgers",
        description_ar="تشكيلة من البرجر اللذيذ",
        description_en="Delicious burger selection",
        display_order=1,
        is_active=True
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


@pytest.fixture
def sample_item(db_session, sample_category) -> Item:
    """Create a sample item"""
    item = Item(
        category_id=sample_category.id,
        name_ar="برجر كلاسيك",
        name_en="Classic Burger",
        description_ar="برجر لحم بقري مع الخضار",
        description_en="Beef burger with vegetables",
        base_price=25.00,
        preparation_time=10,
        is_available=True,
        display_order=1
    )
    db_session.add(item)
    db_session.commit()
    db_session.refresh(item)
    return item


@pytest.fixture
def sample_variant(db_session, sample_item) -> Variant:
    """Create a sample variant"""
    variant = Variant(
        item_id=sample_item.id,
        variant_type="size",
        name_ar="كبير",
        name_en="Large",
        price_modifier=5.00,
        is_default=False
    )
    db_session.add(variant)
    db_session.commit()
    db_session.refresh(variant)
    return variant


@pytest.fixture
def sample_addon(db_session, sample_item) -> AddOn:
    """Create a sample add-on"""
    addon = AddOn(
        item_id=sample_item.id,
        name_ar="جبنة إضافية",
        name_en="Extra Cheese",
        price=3.00
    )
    db_session.add(addon)
    db_session.commit()
    db_session.refresh(addon)
    return addon


@pytest.fixture
def sample_keyword(db_session, sample_item) -> Keyword:
    """Create a sample keyword"""
    keyword = Keyword(
        item_id=sample_item.id,
        keyword_ar="برجر",
        keyword_en="burger",
        weight=1.0
    )
    db_session.add(keyword)
    db_session.commit()
    db_session.refresh(keyword)
    return keyword


# ============================================================================
# MOCK SERVICE FIXTURES
# ============================================================================

@pytest.fixture
def mock_stt_service() -> MagicMock:
    """Create mock STT service"""
    mock = AsyncMock(spec=STTService)

    async def mock_transcribe(audio_data: bytes, language: str = "ar"):
        # Simulate transcription
        if len(audio_data) > 0:
            return "أريد برجر كبير"
        return ""

    mock.transcribe = mock_transcribe
    mock.is_ready = True
    return mock


@pytest.fixture
def mock_tts_service() -> MagicMock:
    """Create mock TTS service"""
    mock = AsyncMock(spec=TTSService)

    async def mock_synthesize(text: str, language: str = "ar"):
        # Simulate synthesis - return fake audio bytes
        return b"fake_audio_data" * 100

    mock.synthesize = mock_synthesize
    mock.is_ready = True
    return mock


@pytest.fixture
def mock_nlu_service() -> MagicMock:
    """Create mock NLU service"""
    mock = AsyncMock(spec=NLUService)

    async def mock_process(request):
        # Simulate NLU processing
        text = request.text.lower()

        # Determine intent based on text
        if "مرحبا" in text or "hello" in text:
            intent_type = IntentType.GREETING
        elif "برجر" in text or "burger" in text:
            intent_type = IntentType.ORDER_ITEM
        elif "نعم" in text or "yes" in text:
            intent_type = IntentType.CONFIRM
        elif "لا" in text or "no" in text:
            intent_type = IntentType.REJECT
        elif "إلغاء" in text or "cancel" in text:
            intent_type = IntentType.CANCEL_ORDER
        else:
            intent_type = IntentType.UNKNOWN

        # Extract basic slots
        slots = []
        if "كبير" in text or "large" in text:
            slots.append(Slot(slot_type="size", value="large", confidence=0.9))
        if "2" in text or "اثنين" in text:
            slots.append(Slot(slot_type="quantity", value="2", confidence=0.95))

        return NLUResponse(
            intent=Intent(
                intent_type=intent_type,
                confidence=0.85
            ),
            slots=slots,
            entities=[],
            raw_text=text
        )

    mock.process = mock_process
    mock.is_ready = True
    return mock


# ============================================================================
# ASYNC FIXTURES
# ============================================================================

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ============================================================================
# ENVIRONMENT FIXTURES
# ============================================================================

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup test environment variables"""
    os.environ["TESTING"] = "1"
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
    os.environ["REDIS_URL"] = "redis://localhost:6379/1"  # Test Redis DB

    yield

    # Cleanup
    os.environ.pop("TESTING", None)


# ============================================================================
# UTILITY FIXTURES
# ============================================================================

@pytest.fixture
def sample_audio_bytes() -> bytes:
    """Generate sample audio bytes for testing"""
    # Create fake audio data (100KB)
    return b"\x00\x01\x02\x03" * 25000


@pytest.fixture
def sample_arabic_text() -> str:
    """Sample Arabic text for testing"""
    return "أريد برجر كبير مع جبنة إضافية من فضلك"


@pytest.fixture
def sample_english_text() -> str:
    """Sample English text for testing"""
    return "I want a large burger with extra cheese please"


@pytest.fixture
def sample_code_switch_text() -> str:
    """Sample code-switching text for testing"""
    return "أريد burger كبير مع extra cheese"
