/**
 * E2E Test: Complete Ordering Workflow
 * Tests the entire user journey from welcome to order confirmation
 */
import { test, expect } from '@playwright/test'

test.describe('Complete Ordering Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo UI
    await page.goto('/')
  })

  test('should complete order flow in Arabic', async ({ page }) => {
    // Step 1: Welcome page
    await expect(page.locator('h1')).toContainText('مرحباً بك')

    // Step 2: Select Arabic language
    await page.click('text=ابدأ الطلب')

    // Should navigate to ordering page
    await expect(page).toHaveURL('/order')

    // Step 3: Ordering page should be visible
    await expect(page.locator('h1')).toContainText('قم بطلبك الآن')

    // Voice interface should be present
    const micButton = page.locator('[data-testid="mic-button"]').or(page.locator('button:has-text("🎤")'))
    await expect(micButton.first()).toBeVisible({ timeout: 10000 })

    // Order display should show empty state
    await expect(page.locator('text=Your order is empty')).toBeVisible()

    // Note: Cannot actually test voice interaction without mocking
    // In a real test, you would mock the WebSocket and audio APIs
  })

  test('should complete order flow in English', async ({ page }) => {
    // Step 1: Select English language
    await page.click('text=Start Order')

    // Should navigate to ordering page
    await expect(page).toHaveURL('/order')

    // Step 2: Ordering page should be visible with English text
    await expect(page.locator('h1')).toContainText('Place Your Order')

    // Voice interface should be present
    await expect(page.locator('[data-testid="voice-interface"]').or(page.locator('.mic-button'))).toBeVisible({ timeout: 10000 })
  })

  test('should handle back navigation from ordering page', async ({ page }) => {
    // Go to ordering page
    await page.click('text=Start Order')
    await expect(page).toHaveURL('/order')

    // Click back button
    await page.click('text=Back').catch(() => {
      // Fallback: click any back arrow or link
      return page.goBack()
    })

    // Should return to welcome page
    await expect(page).toHaveURL('/')
  })

  test('should show confirmation page with order number', async ({ page }) => {
    // Navigate directly to confirmation page with order number
    await page.goto('/confirmation?order=123')

    // Should show confirmation message
    await expect(page.locator('h1')).toContainText('Order Confirmed')

    // Should show order number
    await expect(page.locator('text=#123')).toBeVisible()

    // Should show estimated time
    await expect(page.locator('text=Estimated Preparation Time')).toBeVisible()
    await expect(page.locator('text=5-7 minutes')).toBeVisible()

    // Should show instructions
    await expect(page.locator('text=Please proceed to the pickup window')).toBeVisible()

    // Should have return home button
    await expect(page.locator('text=Return to Home')).toBeVisible()
  })

  test('should auto-redirect from confirmation after countdown', async ({ page }) => {
    // Navigate to confirmation page
    await page.goto('/confirmation?order=456')

    // Check countdown is visible
    await expect(page.locator('text=Returning to home in')).toBeVisible()

    // Wait for redirect (10 seconds + buffer)
    await page.waitForURL('/', { timeout: 12000 })

    // Should be back at welcome page
    await expect(page.locator('h1')).toContainText('مرحباً بك')
  })

  test('should return home immediately when button clicked', async ({ page }) => {
    // Navigate to confirmation page
    await page.goto('/confirmation?order=789')

    // Click return home button
    await page.click('text=Return to Home')

    // Should immediately navigate to home
    await expect(page).toHaveURL('/')
  })
})

test.describe('Ordering Page Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('text=Start Order')
  })

  test('should display empty order state', async ({ page }) => {
    await expect(page.locator('text=Your order is empty')).toBeVisible()
    await expect(page.locator('text=Start speaking to add items')).toBeVisible()
  })

  test('should show help text based on language', async ({ page }) => {
    // English version
    await expect(page.locator('text=Speak clearly and mention the items you want to order')).toBeVisible()
  })

  test('should handle review order button when order is empty', async ({ page }) => {
    // Review button should not be visible when order is empty
    const reviewButton = page.locator('text=Review Order')
    await expect(reviewButton).not.toBeVisible()
  })
})

test.describe('Welcome Page', () => {
  test('should display welcome message', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toContainText('مرحباً بك')
    await expect(page.locator('h1')).toContainText('Welcome')
  })

  test('should display language selection buttons', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('text=ابدأ الطلب')).toBeVisible()
    await expect(page.locator('text=Start Order')).toBeVisible()
  })

  test('should display feature highlights', async ({ page }) => {
    await page.goto('/')

    // Check for feature cards
    const featureCards = page.locator('[class*="grid"]').locator('[class*="rounded"]')
    await expect(featureCards.first()).toBeVisible()
  })

  test('should have gradient background', async ({ page }) => {
    await page.goto('/')

    const background = page.locator('body')
    await expect(background).toHaveCSS('background', /gradient/i)
  })
})

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Elements should still be visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=ابدأ الطلب')).toBeVisible()
    await expect(page.locator('text=Start Order')).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.locator('h1')).toBeVisible()
  })

  test('should be responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('should have clickable buttons', async ({ page }) => {
    await page.goto('/')

    const buttons = page.locator('button')
    await expect(buttons.first()).toBeEnabled()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Tab through elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should be able to activate with Enter
    await page.keyboard.press('Enter')

    // Should navigate
    await expect(page).toHaveURL('/order')
  })
})

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page')

    // Next.js should show 404 page
    await expect(page.locator('text=404')).toBeVisible({ timeout: 5000 })
  })

  test('should handle navigation errors', async ({ page }) => {
    await page.goto('/')

    // Try to navigate to invalid URL
    await page.evaluate(() => {
      window.history.pushState({}, '', '/invalid')
    })

    // App should handle gracefully
  })
})
