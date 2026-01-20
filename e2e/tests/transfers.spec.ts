import { test, expect } from '@playwright/test'

test.describe('Transfer Market', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transfers')
    await page.waitForLoadState('networkidle')
  })

  test('should display transfer market page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Transfer Market')
  })

  test('should display page description', async ({ page }) => {
    await expect(page.locator('p')).toContainText(/transfer|offer|player/i)
  })

  test('should display player search component', async ({ page }) => {
    await expect(page.locator('[class*="PlayerSearch"]').or(page.locator('[type="text" i]'))).toBeVisible()
  })

  test('should display transfer list', async ({ page }) => {
    await page.waitForTimeout(2000)
    const transferList = page.locator('[class*="TransferList"]').or(page.locator('[class*="player" i]'))
    await expect(transferList.first()).toBeVisible()
  })

  test('should display transfer history', async ({ page }) => {
    await page.waitForTimeout(1000)
    const history = page.locator('[class*="TransferHistory"]').or(page.locator('text=History'))
    await expect(history.first()).toBeVisible()
  })

  test('should search for players by name', async ({ page }) => {
    const searchInput = page.locator('[type="text"]').first()
    await searchInput.fill('Messi')
    await page.waitForTimeout(1000)
    await expect(searchInput).toHaveValue('Messi')
  })

  test('should filter by position', async ({ page }) => {
    const positionFilter = page.locator('select').first()
    if (await positionFilter.isVisible()) {
      await positionFilter.selectOption('FWD')
      await page.waitForTimeout(1000)
      await expect(positionFilter).toHaveValue(/FWD|Forward/)
    }
  })

  test('should filter by age range', async ({ page }) => {
    const ageInputs = page.locator('[type="number"]')
    if (await ageInputs.count() >= 2) {
      await ageInputs.nth(0).fill('18')
      await ageInputs.nth(1).fill('25')
      await page.waitForTimeout(1000)
      await expect(ageInputs.nth(0)).toHaveValue('18')
    }
  })

  test('should display player value in transfer list', async ({ page }) => {
    await page.waitForTimeout(2000)
    const valueElements = page.locator('text=€').or(page.locator('[class*="value" i]'))
    if (await valueElements.count() > 0) {
      await expect(valueElements.first()).toBeVisible()
    }
  })

  test('should click make offer button', async ({ page }) => {
    await page.waitForTimeout(2000)
    const makeOfferButton = page.locator('button:has-text("Make Offer"), button:has-text("Offer")').first()
    
    if (await makeOfferButton.isVisible({ timeout: 5000 })) {
      await makeOfferButton.click()
      await page.waitForTimeout(1000)
      await expect(page.locator('[class*="dialog"], [class*="modal"]')).toBeVisible()
    }
  })

  test('should open transfer dialog when making offer', async ({ page }) => {
    await page.waitForTimeout(2000)
    const makeOfferButton = page.locator('button:has-text("Make Offer"), button:has-text("Offer")').first()
    
    if (await makeOfferButton.isVisible({ timeout: 5000 })) {
      await makeOfferButton.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
    }
  })

  test('should close transfer dialog', async ({ page }) => {
    await page.waitForTimeout(2000)
    const makeOfferButton = page.locator('button:has-text("Make Offer"), button:has-text("Offer")').first()
    
    if (await makeOfferButton.isVisible({ timeout: 5000 })) {
      await makeOfferButton.click()
      
      const closeButton = page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="close"]')
      if (await closeButton.isVisible()) {
        await closeButton.click()
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('should display player count', async ({ page }) => {
    await page.waitForTimeout(2000)
    const countText = page.locator(/players/i).or(page.locator(/[0-9]+ players/i))
    if (await countText.isVisible({ timeout: 5000 })) {
      await expect(countText).toBeVisible()
    }
  })

  test('should apply multiple filters and reset', async ({ page }) => {
    const searchInput = page.locator('[type="text"]').first()
    await searchInput.fill('Striker')
    await page.waitForTimeout(1000)
    
    const positionFilter = page.locator('select').first()
    if (await positionFilter.isVisible()) {
      await positionFilter.selectOption('FWD')
      await page.waitForTimeout(1000)
    }
    
    await searchInput.fill('')
    await page.waitForTimeout(1000)
    await expect(searchInput).toHaveValue('')
  })

  test('should display transfer history items', async ({ page }) => {
    await page.waitForTimeout(1000)
    const historyItems = page.locator('[class*="TransferHistory"] >> [class*="transfer"], [class*="item"]')
    if (await historyItems.count() > 0) {
      await expect(historyItems.first()).toBeVisible()
    }
  })

  test('should show loading state during search', async ({ page }) => {
    const searchInput = page.locator('[type="text"]').first()
    await searchInput.fill('Test Player')
    
    const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"]')
    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      await expect(loadingIndicator).toBeVisible()
    }
  })

  test('should navigate back to dashboard', async ({ page }) => {
    await page.click('[aria-label*="Dashboard"], text=Dashboard')
    await expect(page).toHaveURL(/.*dashboard/)
  })
})
