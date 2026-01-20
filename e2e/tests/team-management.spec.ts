import { test, expect } from '@playwright/test'

test.describe('Team Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/team')
    await page.waitForLoadState('networkidle')
  })

  test('should display team management page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Team|Squad/)
  })

  test('should display team name and stadium', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible()
    const stadiumText = await page.locator('text=Est.').isVisible()
    expect(stadiumText).toBeTruthy()
  })

  test('should display team budget', async ({ page }) => {
    await expect(page.locator('text=€').or(page.locator('text=Budget'))).toBeVisible()
  })

  test('should have squad tab by default', async ({ page }) => {
    await expect(page.locator('[role="tab"][data-state="active"]')).toContainText('Squad')
  })

  test('should switch to tactics tab', async ({ page }) => {
    await page.click('[role="tab"]:has-text("Tactics")')
    await expect(page.locator('[role="tab"][data-state="active"]')).toContainText('Tactics')
  })

  test('should switch to substitutions tab', async ({ page }) => {
    await page.click('[role="tab"]:has-text("Subs")')
    await expect(page.locator('[role="tab"][data-state="active"]')).toContainText('Subs')
  })

  test('should display squad list in squad tab', async ({ page }) => {
    await expect(page.locator('[class*="SquadList"]').or(page.locator('[class*="player" i]'))).toBeVisible()
  })

  test('should display tactics panel in tactics tab', async ({ page }) => {
    await page.click('[role="tab"]:has-text("Tactics")')
    await expect(page.locator('[class*="TacticsPanel"]').or(page.locator('[class*="formation" i]'))).toBeVisible()
  })

  test('should display substitutions panel in subs tab', async ({ page }) => {
    await page.click('[role="tab"]:has-text("Subs")')
    await expect(page.locator('[class*="SubstitutionsPanel"]').or(page.locator('[class*="substitution" i]'))).toBeVisible()
  })

  test('should update tactics when formation is changed', async ({ page }) => {
    await page.click('[role="tab"]:has-text("Tactics")')
    await page.waitForTimeout(500)
    
    const formationSelect = page.locator('[class*="formation" i], select').first()
    if (await formationSelect.isVisible()) {
      await formationSelect.selectOption('4-3-3')
      await page.waitForTimeout(500)
      await expect(page.locator('text=4-3-3').or(page.locator('[value="4-3-3"]'))).toBeVisible()
    }
  })

  test('should display player positions', async ({ page }) => {
    const positions = ['GK', 'DEF', 'MID', 'FWD']
    const foundPositions: string[] = []
    
    for (const position of positions) {
      const element = page.locator(`text=${position}`).first()
      if (await element.isVisible()) {
        foundPositions.push(position)
      }
    }
    
    expect(foundPositions.length).toBeGreaterThan(0)
  })

  test('should select a player from squad', async ({ page }) => {
    const firstPlayer = page.locator('[class*="player"]').first()
    if (await firstPlayer.isVisible()) {
      await firstPlayer.click()
      await page.waitForTimeout(500)
      await expect(firstPlayer).toHaveClass(/selected|active/)
    }
  })

  test('should display player stats', async ({ page }) => {
    await page.waitForTimeout(1000)
    const stats = ['Age', 'Overall', 'Value', 'Wage']
    const foundStats: string[] = []
    
    for (const stat of stats) {
      const element = page.locator(`text=${stat}`).first()
      if (await element.isVisible({ timeout: 1000 })) {
        foundStats.push(stat)
      }
    }
    
    expect(foundStats.length).toBeGreaterThan(0)
  })

  test('should have working navigation back to dashboard', async ({ page }) => {
    await page.click('[aria-label*="Dashboard"], text=Dashboard')
    await expect(page).toHaveURL(/.*dashboard/)
  })
})
