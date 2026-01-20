import dotenv from 'dotenv'

const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'CLUB_SERVICE_URL',
  'PLAYER_SERVICE_URL',
  'MATCH_SERVICE_URL',
]

const optionalEnvVars = [
  'PORT',
  'ALLOWED_ORIGINS',
]

interface EnvVar {
  name: string
  required: boolean
  value?: string
  isValid: boolean
  error?: string
}

function validateEnvVar(name: string, required: boolean): EnvVar {
  const value = process.env[name]
  const envVar: EnvVar = { name, required, value, isValid: false }
  
  if (!value) {
    if (required) {
      envVar.error = `Missing required environment variable: ${name}`
      return envVar
    }
    envVar.isValid = true
    return envVar
  }
  
  switch (name) {
    case 'JWT_SECRET':
      if (value.length < 32) {
        envVar.error = `JWT_SECRET must be at least 32 characters, got ${value.length}`
        return envVar
      }
      if (value.includes('your-secret-key') || value.includes('your_jwt_secret') || value.includes('CHANGE_ME')) {
        envVar.error = 'JWT_SECRET is using a placeholder value. Generate a secure random secret before deployment.'
        return envVar
      }
      break
    
    case 'PORT':
      const portNum = parseInt(value, 10)
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        envVar.error = `PORT must be a valid number between 1 and 65535, got: ${value}`
        return envVar
      }
      break
    
    case 'MONGODB_URI':
      if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
        envVar.error = 'MONGODB_URI must be a valid MongoDB connection string'
        return envVar
      }
      break
    
    case 'CLUB_SERVICE_URL':
    case 'PLAYER_SERVICE_URL':
    case 'MATCH_SERVICE_URL':
      try {
        new URL(value)
      } catch {
        envVar.error = `${name} must be a valid URL, got: ${value}`
        return envVar
      }
      break
  }
  
  envVar.isValid = true
  return envVar
}

export function validateEnv(): void {
  const envVars: EnvVar[] = []
  
  const allVars = [
    ...requiredEnvVars.map(name => ({ name, required: true })),
    ...optionalEnvVars.map(name => ({ name, required: false })),
  ]
  
  for (const { name, required } of allVars) {
    envVars.push(validateEnvVar(name, required))
  }
  
  const invalidVars = envVars.filter(v => !v.isValid)
  
  if (invalidVars.length > 0) {
    console.error('Environment variable validation failed:')
    for (const envVar of invalidVars) {
      console.error(`  - ${envVar.name}: ${envVar.error}`)
    }
    console.error('\nFix these issues before starting the application.')
    process.exit(1)
  }
  
  console.log('Environment variables validated successfully.')
}

export function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`)
  }
  return value
}
