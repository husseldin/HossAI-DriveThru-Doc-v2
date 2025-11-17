/**
 * Test Utilities for Demo UI
 */
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Simple wrapper (no providers needed for Demo UI currently)
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

/**
 * Mock OrderItem data
 */
export function createMockOrderItem(overrides = {}) {
  return {
    id: '1',
    name_ar: 'برجر كلاسيك',
    name_en: 'Classic Burger',
    base_price: 25.00,
    quantity: 1,
    variants: [],
    addons: [],
    total: 25.00,
    ...overrides,
  }
}

/**
 * Mock Variant data
 */
export function createMockVariant(overrides = {}) {
  return {
    id: 1,
    name_ar: 'كبير',
    name_en: 'Large',
    price_modifier: 5.00,
    ...overrides,
  }
}

/**
 * Mock AddOn data
 */
export function createMockAddOn(overrides = {}) {
  return {
    id: 1,
    name_ar: 'جبنة إضافية',
    name_en: 'Extra Cheese',
    price: 3.00,
    ...overrides,
  }
}

/**
 * Mock WebSocket message
 */
export function createMockWSMessage(type: string, data: any = {}) {
  return {
    type,
    ...data,
  }
}

/**
 * Mock audio blob
 */
export function createMockAudioBlob() {
  return new Blob(['fake audio data'], { type: 'audio/webm' })
}

/**
 * Wait for async updates
 */
export async function waitForAsync() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Mock MediaRecorder
 */
export function mockMediaRecorder() {
  const mediaRecorder = {
    start: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    state: 'inactive',
    ondataavailable: null as any,
    onstop: null as any,
    onerror: null as any,
  }

  global.MediaRecorder = jest.fn().mockImplementation(() => mediaRecorder) as any

  return mediaRecorder
}

/**
 * Mock WebSocket
 */
export function mockWebSocket() {
  const ws = {
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readyState: 1,
    onopen: null as any,
    onmessage: null as any,
    onerror: null as any,
    onclose: null as any,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  }

  global.WebSocket = jest.fn().mockImplementation(() => ws) as any

  return ws
}

/**
 * Simulate WebSocket message
 */
export function simulateWSMessage(ws: any, data: any) {
  if (ws.onmessage) {
    ws.onmessage({ data: JSON.stringify(data) })
  }
}

/**
 * Simulate MediaRecorder data
 */
export function simulateMediaRecorderData(recorder: any, blob: Blob) {
  if (recorder.ondataavailable) {
    recorder.ondataavailable({ data: blob })
  }
}
