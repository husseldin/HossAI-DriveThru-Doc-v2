/**
 * Test Utilities for Control Panel
 * Custom render functions and test helpers
 */
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

// Create a custom render function that includes providers
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries in tests
        retry: false,
        // Disable caching in tests
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Custom matchers and helpers

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingToFinish() {
  const { waitForElementToBeRemoved } = await import('@testing-library/react')
  await waitForElementToBeRemoved(
    () => document.querySelector('[data-testid="loading"]'),
    { timeout: 3000 }
  ).catch(() => {
    // Ignore if loading element not found
  })
}

/**
 * Fill form field
 */
export function fillFormField(container: HTMLElement, labelText: string, value: string) {
  const input = container.querySelector(`input[name="${labelText}"]`) as HTMLInputElement
  if (input) {
    input.value = value
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

/**
 * Mock API response
 */
export function mockApiResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  } as Response)
}

/**
 * Mock API error
 */
export function mockApiError(message: string, status = 500) {
  return Promise.reject({
    response: {
      data: { detail: message },
      status,
    },
  })
}

/**
 * Create mock branch data
 */
export function createMockBranch(overrides = {}) {
  return {
    id: 1,
    name_ar: 'الفرع الرئيسي',
    name_en: 'Main Branch',
    code: 'MAIN001',
    location: 'Riyadh',
    phone: '+966123456789',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create mock menu data
 */
export function createMockMenu(overrides = {}) {
  return {
    id: 1,
    branch_id: 1,
    name_ar: 'القائمة الرئيسية',
    name_en: 'Main Menu',
    description_ar: 'قائمة الطعام الرئيسية',
    description_en: 'Main food menu',
    active: true,
    published: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create mock category data
 */
export function createMockCategory(overrides = {}) {
  return {
    id: 1,
    menu_id: 1,
    name_ar: 'برجر',
    name_en: 'Burgers',
    description_ar: 'تشكيلة من البرجر',
    description_en: 'Burger selection',
    display_order: 1,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create mock item data
 */
export function createMockItem(overrides = {}) {
  return {
    id: 1,
    category_id: 1,
    name_ar: 'برجر كلاسيك',
    name_en: 'Classic Burger',
    description_ar: 'برجر لحم بقري',
    description_en: 'Beef burger',
    base_price: 25.00,
    image_url: 'https://example.com/burger.jpg',
    preparation_time: 10,
    calories: 500,
    available: true,
    display_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create mock variant data
 */
export function createMockVariant(overrides = {}) {
  return {
    id: 1,
    item_id: 1,
    variant_type: 'size',
    name_ar: 'كبير',
    name_en: 'Large',
    price_modifier: 5.00,
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create mock addon data
 */
export function createMockAddOn(overrides = {}) {
  return {
    id: 1,
    item_id: 1,
    name_ar: 'جبنة إضافية',
    name_en: 'Extra Cheese',
    price: 3.00,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create mock keyword data
 */
export function createMockKeyword(overrides = {}) {
  return {
    id: 1,
    item_id: 1,
    keyword_ar: 'برجر',
    keyword_en: 'burger',
    weight: 1.0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}
