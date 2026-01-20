import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should display dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/.*Dashboard.*/)
    await expect(page.locator('h2')).toContainText('Dashboard')
  })

  test('should display welcome message', async ({ page }) => {
    await expect(page.locator('p')).toContainText('Welcome back')
  })

  test('should display club overview section', async ({ page }) => {
    await expect(page.locator('text=Club Overview').or(page.locator('[class*="ClubOverview"]'))).toBeVisible()
  })

  test('should display financial summary section', async ({ page }) => {
    await expect(page.locator('text=Financial').or(page.locator('[class*="Financial"]'))).toBeVisible()
  })

  test('should display next match section', async ({ page }) => {
    await expect(page.locator('text=Next Match').or(page.locator('[class*="NextMatch"]'))).toBeVisible()
  })

  test('should display notifications section', async ({ page }) => {
    await expect(page.locator('text=Notification').or(page.locator('[class*="Notification"]'))).toBeVisible()
  })

  test('should show loading state initially', async ({ page }) => {
    await page.waitForTimeout(500)
    await page.reload()
    await expect(page.locator('[class*="animate-pulse"]').first()).toBeVisible()
  })

  test('should hide loading state after data loads', async ({ page }) => {
    await page.waitForTimeout(2000)
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0)
  })

  test('should navigate to team page from sidebar', async ({ page }) => {
    await page.click('[class*="Sidebar"] >> text=Team')
    await expect(page).toHaveURL(/.*team/)
  })

  test('should navigate to transfers page from sidebar', async ({ page }) => {
    await page.click('[class*="Sidebar"] >> text=Transfers')
    await expect(page).toHaveURL(/.*transfers/)
  })

  test('should navigate to matches page from sidebar', async ({ page }) => {
    await page.click('[class*="Sidebar"] >> text=Matches')
    await expect(page).toHaveURL(/.*matches/)
  })

  test('should toggle theme', async ({ page }) => {
    const body = page.locator('body')
    const initialTheme = await body.getAttribute('class')
    
    await page.click('[aria-label*="theme" i]')
    await page.waitForTimeout(100)
    
    const newTheme = await body.getAttribute('class')
    expect(initialTheme).not.toBe(newTheme)
  })

  test('should open and close sidebar', async ({ page }) => {
    const sidebar = page.locator('[class*="Sidebar"]').first()
    
    await page.click('[aria-label*="menu" i], [aria-label*="sidebar" i]')
    await expect(sidebar).toBeVisible()
    
    await page.click('[aria-label*="close" i]')
    await expect(sidebar).not.toBeVisible()
  })

  test('should display notification badges if unread', async ({ page }) => {
    await page.waitForTimeout(2000)
    const badges = page.locator('[class*="badge" i], [class*="unread" i]')
    
    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible()
    }
  })
})
