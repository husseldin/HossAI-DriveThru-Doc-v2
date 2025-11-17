# Testing Guide - AI Drive-Thru Demo Application

Comprehensive testing guide for Phase 6 implementation.

## Overview

This project includes extensive testing infrastructure covering:
- Backend (Python/FastAPI)
- Control Panel (Next.js/React)
- Demo UI (Next.js/React)
- End-to-End tests

## Backend Testing (Python/Pytest)

### Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test types
pytest -m unit              # Unit tests only
pytest -m integration       # Integration tests only
pytest -m api               # API tests only
pytest -m websocket         # WebSocket tests only
```

### Test Structure

```
src/tests/
├── conftest.py                      # Shared fixtures and configuration
├── unit/                            # Unit tests (fast, isolated)
│   ├── test_stt_service.py         # STT service tests
│   ├── test_tts_service.py         # TTS service tests
│   ├── test_menu_service.py        # Menu CRUD tests
│   ├── test_nlu.py                 # NLU intent/slot tests
│   ├── test_language_detector.py   # Language detection tests
│   └── test_menu_validation.py     # Menu validation tests
└── integration/                     # Integration tests (multiple components)
    ├── test_voice_workflow.py      # STT → NLU → TTS pipeline
    ├── test_api_endpoints.py       # REST API endpoints
    └── test_websocket.py           # WebSocket voice streaming
```

### Test Markers

```python
@pytest.mark.unit           # Fast, isolated unit tests
@pytest.mark.integration    # Integration tests
@pytest.mark.api            # API endpoint tests
@pytest.mark.websocket      # WebSocket tests
@pytest.mark.slow           # Slow tests (>1s)
@pytest.mark.requires_models  # Requires AI models
@pytest.mark.requires_db    # Requires database
@pytest.mark.requires_redis # Requires Redis
```

### Fixtures Available

#### Database Fixtures
- `test_engine` - Test database engine (SQLite in-memory)
- `db_session` - Fresh database session per test
- `test_client` - FastAPI test client with test DB

#### Sample Data Fixtures
- `sample_branch` - Sample branch
- `sample_menu` - Sample menu
- `sample_category` - Sample category
- `sample_item` - Sample menu item
- `sample_variant` - Sample item variant
- `sample_addon` - Sample add-on
- `sample_keyword` - Sample keyword

#### Mock Service Fixtures
- `mock_stt_service` - Mocked STT service
- `mock_tts_service` - Mocked TTS service
- `mock_nlu_service` - Mocked NLU service

#### Utility Fixtures
- `sample_audio_bytes` - Fake audio data
- `sample_arabic_text` - Sample Arabic text
- `sample_english_text` - Sample English text
- `sample_code_switch_text` - Mixed language text

### Running Specific Tests

```bash
# Run a specific test file
pytest src/tests/unit/test_menu_service.py

# Run a specific test
pytest src/tests/unit/test_menu_service.py::TestMenuService::test_create_branch

# Run tests matching a pattern
pytest -k "menu"

# Run with verbose output
pytest -v

# Run in parallel (faster)
pytest -n auto

# Stop on first failure
pytest -x
```

### Coverage Reports

```bash
# Generate HTML coverage report
pytest --cov=src --cov-report=html

# View report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

Current coverage targets:
- Overall: 70%+
- Services: 80%+
- API: 75%+

## Control Panel Testing (Next.js/React)

### Setup

```bash
cd control-panel

# Install dependencies
npm install

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run CI tests
npm run test:ci
```

### Test Structure

```
control-panel/
├── jest.config.js                 # Jest configuration
├── jest.setup.js                  # Test environment setup
├── __tests__/
│   └── utils/
│       └── test-utils.tsx         # Custom render and helpers
└── components/
    └── __tests__/
        └── *.test.tsx             # Component tests
```

### Writing Component Tests

```typescript
import { render, screen, fireEvent } from '@/__tests__/utils/test-utils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    render(<MyComponent />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Assert expected behavior
  })
})
```

### Test Utilities

#### Mock Data Helpers
- `createMockBranch()` - Create mock branch data
- `createMockMenu()` - Create mock menu data
- `createMockCategory()` - Create mock category data
- `createMockItem()` - Create mock item data
- `createMockVariant()` - Create mock variant data
- `createMockAddOn()` - Create mock add-on data
- `createMockKeyword()` - Create mock keyword data

#### API Mocking
- `mockApiResponse(data, status)` - Mock successful API response
- `mockApiError(message, status)` - Mock API error

#### Form Helpers
- `fillFormField(container, name, value)` - Fill form input

## Demo UI Testing (Next.js/React)

### Setup

```bash
cd demo-ui

# Install dependencies
npm install

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Store Testing (Zustand)

```typescript
import { renderHook, act } from '@testing-library/react'
import { useOrderStore } from '@/lib/store'

describe('useOrderStore', () => {
  it('adds item to order', () => {
    const { result } = renderHook(() => useOrderStore())

    act(() => {
      result.current.addItem(mockItem)
    })

    expect(result.current.items).toHaveLength(1)
  })
})
```

## End-to-End Testing (Playwright)

### Setup

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run E2E tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('complete ordering workflow', async ({ page }) => {
  // Navigate to demo UI
  await page.goto('http://localhost:46002')

  // Select language
  await page.click('text=Start Order')

  // Voice interaction simulation
  // ...

  // Verify order confirmation
  await expect(page.locator('text=Order Confirmed')).toBeVisible()
})
```

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install -r requirements.txt
      - run: pytest --cov=src --cov-report=xml
      - uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd control-panel && npm ci
      - run: cd control-panel && npm run test:ci
```

## Best Practices

### Backend Testing

1. **Use fixtures** for common test data
2. **Mock external services** (AI models, Redis) in unit tests
3. **Use real services** in integration tests when possible
4. **Test error cases** thoroughly
5. **Keep tests fast** - use in-memory DB, mock heavy operations
6. **Test both languages** - Arabic and English

### Frontend Testing

1. **Test user behavior**, not implementation details
2. **Use semantic queries** (getByRole, getByLabelText)
3. **Mock API calls** to avoid flaky tests
4. **Test loading states** and error handling
5. **Test accessibility** (ARIA labels, keyboard navigation)
6. **Avoid snapshot tests** for rapidly changing UI

### General Guidelines

1. **Test names** should describe behavior, not implementation
2. **Arrange-Act-Assert** pattern for clarity
3. **One assertion per test** when possible
4. **DRY** - Use helper functions for common setups
5. **Fail fast** - Stop on first failure in CI
6. **Parallel execution** for speed

## Debugging Tests

### Backend

```bash
# Run with print statements visible
pytest -s

# Run with pdb debugger
pytest --pdb

# Run specific test with full output
pytest -vv src/tests/unit/test_menu_service.py::test_create_branch
```

### Frontend

```typescript
// Use screen.debug() to see rendered output
import { screen } from '@testing-library/react'

it('debugs component', () => {
  render(<MyComponent />)
  screen.debug()  // Prints DOM
})
```

## Test Coverage Goals

| Component | Target | Current |
|-----------|--------|---------|
| Backend Services | 80% | TBD |
| API Endpoints | 90% | TBD |
| Frontend Components | 70% | TBD |
| Stores | 85% | TBD |
| Overall | 75% | TBD |

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Model not loaded"
**Solution**: Ensure you're using mock services in unit tests

**Issue**: WebSocket tests timeout
**Solution**: Increase timeout in test config or use mocks

**Issue**: Frontend tests fail with "Cannot find module"
**Solution**: Check Jest moduleNameMapper in config

**Issue**: Database tests fail
**Solution**: Ensure test DB is properly cleaned between tests

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain coverage targets
4. Update this guide if needed

---

**Note**: This testing infrastructure was implemented in Phase 6 of the project.
