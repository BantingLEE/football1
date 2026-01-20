import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('Starting E2E test teardown...')
  
  try {
    const fs = await import('fs')
    if (fs.existsSync('auth.json')) {
      fs.unlinkSync('auth.json')
      console.log('Auth state file removed')
    }
  } catch (error) {
    console.error('Teardown failed:', error)
  }
  
  console.log('E2E test teardown complete')
}

export default globalTeardown
