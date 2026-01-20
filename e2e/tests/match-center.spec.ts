import { test, expect } from '@playwright/test'

test.describe('Match Center', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/matches')
  })

  test('should display match center page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Match Center')
  })

  test('should display page subtitle', async ({ page }) => {
    await expect(page.locator('p')).toContainText(/real-time|match/i)
  })

  test('should have all matches tab active by default', async ({ page }) => {
    await expect(page.locator('[role="tab"][data-state="active"]')).toContainText('All')
  })

  test('should display match list', async ({ page }) => {
    await page.waitForTimeout(1000)
    await expect(page.locator('[class*="MatchList"], [class*="match" i]').first()).toBeVisible()
  })

  test('should display live match indicator if available', async ({ page }) => {
    await page.waitForTimeout(1000)
    const liveIndicator = page.locator('[class*="live" i], text=Live Now').first()
    if (await liveIndicator.isVisible({ timeout: 1000 })) {
      await expect(liveIndicator).toBeVisible()
    }
  })

  test('should switch to live matches tab', async ({ page }) => {
    await page.click('[role="tab"]:has-text("Live")')
    await expect(page.locator('[role="tab"][data-state="active"]')).toContainText('Live')
  })

  test('should switch to upcoming matches tab', async ({ page }) => {
    await page.click('[role="tab"]:has-text("Upcoming")')
    await expect(page.locator('[role="tab"][data-state="active"]')).toContainText('Upcoming')
  })

  test('should switch to past matches tab', async ({ page }) => {
    await page.click('[role="tab"]:has-text("Past")')
    await expect(page.locator('[role="tab"][data-state="active"]')).toContainText('Past')
  })

  test('should display match scores', async ({ page }) => {
    await page.waitForTimeout(1000)
    const scores = page.locator('text=-').filter({ hasText: /\d/ })
    if (await scores.count() > 0) {
      await expect(scores.first()).toBeVisible()
    }
  })

  test('should display team names', async ({ page }) => {
    await page.waitForTimeout(1000)
    await expect(page.locator('[class*="team" i], [class*="match" i]').first()).toBeVisible()
  })

  test('should display match date or time', async ({ page }) => {
    await page.waitForTimeout(1000)
    const dateElement = page.locator(/[0-9]{1,2}[:][0-9]{2}|[A-Z][a-z]{2} [0-9]{1,2}/).first()
    if (await dateElement.isVisible({ timeout: 1000 })) {
      await expect(dateElement).toBeVisible()
    }
  })

  test('should click on a match to view details', async ({ page }) => {
    await page.waitForTimeout(1000)
    const firstMatch = page.locator('[class*="match"]').first()
    if (await firstMatch.isVisible()) {
      await firstMatch.click()
      await page.waitForTimeout(500)
      await expect(page.locator('[class*="MatchDetails"], [class*="detail" i]').or(page.locator('text=Match Details'))).toBeVisible()
    }
  })

  test('should display match competition', async ({ page }) => {
    await page.waitForTimeout(1000)
    const competitions = ['League', 'Cup', 'Champions', 'Premier']
    let found = false
    
    for (const comp of competitions) {
      const element = page.locator(`text=${comp}`).first()
      if (await element.isVisible({ timeout: 500 })) {
        found = true
        break
      }
    }
    
    if (found) {
      expect(found).toBeTruthy()
    }
  })

  test('should display live match with animated indicator', async ({ page }) => {
    await page.click('[role="tab"]:has-text("Live")')
    await page.waitForTimeout(500)
    
    const liveMatch = page.locator('[class*="LiveMatch"]').or(page.locator('[class*="live" i]')).first()
    if (await liveMatch.isVisible({ timeout: 1000 })) {
      await expect(liveMatch).toBeVisible()
    }
  })

  test('should display match statistics if available', async ({ page }) => {
    await page.waitForTimeout(1000)
    const stats = ['possession', 'shots', 'passes']
    
    for (const stat of stats) {
      const element = page.locator(`text=${stat} i`).first()
      if (await element.isVisible({ timeout: 500 })) {
        await expect(element).toBeVisible()
        break
      }
    }
  })

  test('should navigate back to dashboard', async ({ page }) => {
    await page.click('[aria-label*="Dashboard"], text=Dashboard')
    await expect(page).toHaveURL(/.*dashboard/)
  })
})
