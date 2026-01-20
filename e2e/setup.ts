import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('Starting E2E test setup...')
  
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000')
    
    await page.evaluate(() => {
      localStorage.setItem('clubId', 'test-club-123')
      localStorage.setItem('authToken', 'test-auth-token')
      localStorage.setItem('userId', 'test-user-123')
    })
    
    await context.storageState({ path: 'auth.json' })
    console.log('Auth state saved to auth.json')
  } catch (error) {
    console.error('Setup failed:', error)
  }
  
  await browser.close()
  console.log('E2E test setup complete')
}

export default globalSetup
