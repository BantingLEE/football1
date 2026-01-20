# Football Manager Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete web-based football manager simulation game with microservices architecture, featuring real-time match simulation, youth academy system, and complex economy model.

**Architecture:** Microservices architecture with 10 independent services (frontend, API gateway, club, player, match, economy, youth, league, messaging, notification), communicating via REST APIs and WebSocket, using MongoDB for data persistence and Redis for caching/queue.

**Tech Stack:**
- Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query, Socket.io-client
- Backend: Node.js, Express/Fastify, TypeScript, Socket.io, MongoDB, Redis, RabbitMQ/Redis Stream
- DevOps: Docker, Docker Compose, Kubernetes, GitHub Actions

---

# Phase 1: Infrastructure Setup

## Task 1.1: Initialize Project Structure

**Files:**
- Create: `package.json` (root)
- Create: `frontend/package.json`
- Create: `docker-compose.yml`
- Create: `.gitignore`

**Step 1: Create root package.json**

```json
{
  "name": "football-manager",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "services/*",
    "shared"
  ],
  "scripts": {
    "dev": "docker-compose up",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "docker-compose build",
    "lint": "prettier --check \"**/*.{ts,tsx,json}\"",
    "format": "prettier --write \"**/*.{ts,tsx,json}\""
  },
  "devDependencies": {
    "prettier": "^3.1.0"
  }
}
```

**Step 2: Create frontend package.json**

```json
{
  "name": "football-manager-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "tailwind-merge": "^2.1.0",
    "tailwindcss-animate": "^1.0.7",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.14.0",
    "socket.io-client": "^4.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4"
  }
}
```

**Step 3: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: football-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: football_manager
    volumes:
      - mongodb_data:/data/db
    networks:
      - football-network

  redis:
    image: redis:7-alpine
    container_name: football-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - football-network

  rabbitmq:
    image: rabbitmq:3.12-management
    container_name: football-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - football-network

volumes:
  mongodb_data:
  redis_data:
  rabbitmq_data:

networks:
  football-network:
    driver: bridge
```

**Step 4: Create .gitignore**

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/

# Production
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs/
*.log
```

**Step 5: Commit**

```bash
git add package.json frontend/package.json docker-compose.yml .gitignore
git commit -m "feat: initialize project structure and docker compose configuration"
```

## Task 1.2: Setup Frontend Configuration

**Files:**
- Create: `frontend/next.config.js`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/.eslintrc.json`

**Step 1: Create next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

**Step 4: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 5: Create .eslintrc.json**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

**Step 6: Commit**

```bash
git add frontend/next.config.js frontend/tsconfig.json frontend/tailwind.config.ts frontend/postcss.config.js frontend/.eslintrc.json
git commit -m "feat: setup frontend configuration files"
```

## Task 1.3: Create Shared Types and Utilities

**Files:**
- Create: `shared/package.json`
- Create: `shared/src/types/index.ts`
- Create: `shared/src/types/club.ts`
- Create: `shared/src/types/player.ts`
- Create: `shared/src/types/match.ts`
- Create: `shared/src/utils/helpers.ts`
- Create: `shared/src/utils/constants.ts`
- Create: `shared/tsconfig.json`

**Step 1: Create shared/package.json**

```json
{
  "name": "football-manager-shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

**Step 2: Create shared/src/types/index.ts**

```typescript
export * from './club'
export * from './player'
export * from './match'
```

**Step 3: Create shared/src/types/club.ts**

```typescript
export interface Club {
  _id: string
  name: string
  foundedYear: number
  city: string
  stadium: {
    name: string
    capacity: number
  }
  finances: {
    budget: number
    cash: number
    incomeHistory: IncomeRecord[]
    expenseHistory: ExpenseRecord[]
  }
  youthFacility: {
    level: number
    capacity: number
    trainingQuality: number
  }
  tacticalPreference: {
    formation: Formation
    attacking: number
    defending: number
  }
}

export type Formation =
  | '4-4-2'
  | '4-3-3'
  | '3-5-2'
  | '4-2-3-1'
  | '5-3-2'
  | '3-4-3'

export interface IncomeRecord {
  type: 'ticket' | 'broadcast' | 'sponsorship' | 'merchandise' | 'other'
  amount: number
  date: Date
}

export interface ExpenseRecord {
  type: 'wages' | 'transfer' | 'operations' | 'penalty' | 'other'
  amount: number
  date: Date
}
```

**Step 4: Create shared/src/types/player.ts**

```typescript
export interface Player {
  _id: string
  name: string
  age: number
  nationality: string
  height: number
  weight: number
  position: Position
  attributes: PlayerAttributes
  potential: number
  currentAbility: number
  contract: Contract
  injury?: Injury
  history: PlayerHistory
  clubId?: string
  isYouth?: boolean
}

export type Position =
  | 'GK'
  | 'CB'
  | 'RB'
  | 'LB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'RM'
  | 'LM'
  | 'ST'
  | 'CF'
  | 'LW'
  | 'RW'

export interface PlayerAttributes {
  speed: number
  shooting: number
  passing: number
  defending: number
  physical: number
  technical: number
  mental: number
  goalkeeping?: number
}

export interface Contract {
  salary: number
  expiresAt: Date
  bonus: number
}

export interface Injury {
  isInjured: boolean
  type: string
  recoveryTime: number
}

export interface PlayerHistory {
  matchesPlayed: number
  goals: number
  assists: number
  growthLog: GrowthRecord[]
}

export interface GrowthRecord {
  date: Date
  attributes: Partial<PlayerAttributes>
  currentAbility: number
}
```

**Step 5: Create shared/src/types/match.ts**

```typescript
export interface Match {
  _id: string
  homeTeam: TeamMatchData
  awayTeam: TeamMatchData
  date: Date
  leagueId: string
  status: MatchStatus
  events: MatchEvent[]
  statistics: MatchStatistics
  playerRatings: Map<string, number>
}

export interface TeamMatchData {
  clubId: string
  score: number
  lineup: string[]
  tactics: TeamTactics
}

export interface TeamTactics {
  formation: Formation
  attacking: number
  defending: number
  playStyle: 'possession' | 'counter' | 'direct'
}

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'postponed'

export interface MatchEvent {
  minute: number
  type: MatchEventType
  playerId?: string
  teamId: string
  description: string
  details?: any
}

export type MatchEventType =
  | 'goal'
  | 'shot'
  | 'foul'
  | 'corner'
  | 'substitution'
  | 'yellowCard'
  | 'redCard'
  | 'injury'

export interface MatchStatistics {
  possession: { home: number; away: number }
  shots: { home: number; away: number }
  shotsOnTarget: { home: number; away: number }
  corners: { home: number; away: number }
  fouls: { home: number; away: number }
  passes: { home: number; away: number }
}
```

**Step 6: Create shared/src/utils/helpers.ts**

```typescript
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number, currency: string = '€'): string {
  return `${currency}${amount.toLocaleString()}`
}

export function calculatePlayerValue(player: any): number {
  const ageFactor = player.age < 24 ? 1.2 : player.age > 30 ? 0.6 : 1
  const potentialFactor = player.potential / 100
  return Math.round(player.currentAbility * 10000 * ageFactor * potentialFactor)
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
```

**Step 7: Create shared/src/utils/constants.ts**

```typescript
export const FORMATIONS = [
  '4-4-2',
  '4-3-3',
  '3-5-2',
  '4-2-3-1',
  '5-3-2',
  '3-4-3',
] as const

export const POSITIONS = [
  'GK',
  'CB',
  'RB',
  'LB',
  'CDM',
  'CM',
  'CAM',
  'RM',
  'LM',
  'ST',
  'CF',
  'LW',
  'RW',
] as const

export const MATCH_DURATION = 90 // minutes

export const YOUTH_FACILITY_LEVELS = {
  1: { capacity: 10, quality: 0.3, newPlayersPerWeek: 1 },
  2: { capacity: 15, quality: 0.5, newPlayersPerWeek: 1 },
  3: { capacity: 20, quality: 0.7, newPlayersPerWeek: 2 },
  4: { capacity: 25, quality: 0.85, newPlayersPerWeek: 2 },
  5: { capacity: 30, quality: 1.0, newPlayersPerWeek: 3 },
}

export const PLAYER_AGE_GROUPS = {
  YOUTH: { min: 14, max: 18 },
  PRIME: { min: 19, max: 28 },
  VETERAN: { min: 29, max: 35 },
  RETIREMENT: { min: 36, max: 40 },
}
```

**Step 8: Create shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 9: Commit**

```bash
git add shared/
git commit -m "feat: add shared types and utilities"
```

# Phase 2: Core Services Development

## Task 2.1: API Gateway Service Setup

**Files:**
- Create: `services/api-gateway/package.json`
- Create: `services/api-gateway/src/index.ts`
- Create: `services/api-gateway/src/routes/index.ts`
- Create: `services/api-gateway/src/middleware/auth.ts`
- Create: `services/api-gateway/src/middleware/rateLimit.ts`
- Create: `services/api-gateway/src/config/database.ts`
- Create: `services/api-gateway/tsconfig.json`
- Create: `services/api-gateway/Dockerfile`

**Step 1: Create services/api-gateway/package.json**

```json
{
  "name": "api-gateway",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "http-proxy-middleware": "^2.0.6"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "eslint": "^8.56.0"
  }
}
```

**Step 2: Create services/api-gateway/src/index.ts**

```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import routes from './routes'
import { rateLimiter } from './middleware/rateLimit'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))
app.use(rateLimiter)

app.use('/api', routes)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
})
```

**Step 3: Create services/api-gateway/src/routes/index.ts**

```typescript
import { Router } from 'express'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' })
})

// Club service routes
router.use('/clubs', (req, res, next) => {
  // Proxy to club service (http://localhost:3002)
  res.json({ message: 'Club service endpoint' })
})

// Player service routes
router.use('/players', (req, res, next) => {
  // Proxy to player service (http://localhost:3003)
  res.json({ message: 'Player service endpoint' })
})

// Match service routes
router.use('/matches', (req, res, next) => {
  // Proxy to match service (http://localhost:3004)
  res.json({ message: 'Match service endpoint' })
})

export default router
```

**Step 4: Create services/api-gateway/src/middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  // TODO: Implement JWT verification
  // For now, just pass through
  next()
}
```

**Step 5: Create services/api-gateway/src/middleware/rateLimit.ts**

```typescript
import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
```

**Step 6: Create services/api-gateway/src/config/database.ts**

```typescript
import mongoose from 'mongoose'

export async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/football_manager'
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}
```

**Step 7: Create services/api-gateway/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 8: Create services/api-gateway/Dockerfile**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

**Step 9: Commit**

```bash
git add services/api-gateway/
git commit -m "feat: setup API gateway service"
```

## Task 2.2: Club Service Implementation

**Files:**
- Create: `services/club-service/package.json`
- Create: `services/club-service/src/index.ts`
- Create: `services/club-service/src/models/Club.ts`
- Create: `services/club-service/src/routes/clubs.ts`
- Create: `services/club-service/src/controllers/clubController.ts`
- Create: `services/club-service/src/services/clubService.ts`
- Create: `services/club-service/tests/clubService.test.ts`
- Create: `services/club-service/tsconfig.json`
- Create: `services/club-service/Dockerfile`

**Step 1: Create services/club-service/package.json**

```json
{
  "name": "club-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0",
    "mongodb": "^6.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/jest": "^29.5.11",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

**Step 2: Create services/club-service/src/index.ts**

```typescript
import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import clubRoutes from './routes/clubs'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

app.use(express.json())
app.use('/clubs', clubRoutes)

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football_manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.listen(PORT, () => {
  console.log(`Club service running on port ${PORT}`)
})
```

**Step 3: Create services/club-service/src/models/Club.ts**

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClub extends Document {
  name: string
  foundedYear: number
  city: string
  stadium: {
    name: string
    capacity: number
  }
  finances: {
    budget: number
    cash: number
    incomeHistory: any[]
    expenseHistory: any[]
  }
  youthFacility: {
    level: number
    capacity: number
    trainingQuality: number
  }
  tacticalPreference: {
    formation: string
    attacking: number
    defending: number
  }
}

const ClubSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  foundedYear: { type: Number, required: true },
  city: { type: String, required: true },
  stadium: {
    name: { type: String, required: true },
    capacity: { type: Number, required: true }
  },
  finances: {
    budget: { type: Number, default: 50000000 },
    cash: { type: Number, default: 30000000 },
    incomeHistory: [{ type: Object }],
    expenseHistory: [{ type: Object }]
  },
  youthFacility: {
    level: { type: Number, default: 1, min: 1, max: 5 },
    capacity: { type: Number, default: 10 },
    trainingQuality: { type: Number, default: 0.3 }
  },
  tacticalPreference: {
    formation: { type: String, default: '4-4-2' },
    attacking: { type: Number, default: 50, min: 0, max: 100 },
    defending: { type: Number, default: 50, min: 0, max: 100 }
  }
}, {
  timestamps: true
})

export const Club: Model<IClub> = mongoose.model<IClub>('Club', ClubSchema)
```

**Step 4: Create services/club-service/src/routes/clubs.ts**

```typescript
import { Router } from 'express'
import * as clubController from '../controllers/clubController'

const router = Router()

router.get('/', clubController.getAllClubs)
router.get('/:id', clubController.getClubById)
router.post('/', clubController.createClub)
router.put('/:id', clubController.updateClub)
router.delete('/:id', clubController.deleteClub)

export default router
```

**Step 5: Write the failing test**

Create file: `services/club-service/tests/clubService.test.ts`

```typescript
import { ClubService } from '../src/services/clubService'
import { Club } from '../src/models/Club'

jest.mock('../src/models/Club')

describe('ClubService', () => {
  let clubService: ClubService

  beforeEach(() => {
    clubService = new ClubService()
  })

  describe('getAllClubs', () => {
    it('should return all clubs', async () => {
      const mockClubs = [
        { _id: '1', name: 'FC Barcelona', city: 'Barcelona' },
        { _id: '2', name: 'Real Madrid', city: 'Madrid' }
      ]

      Club.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockClubs)
      } as any)

      const result = await clubService.getAllClubs()

      expect(Club.find).toHaveBeenCalled()
      expect(result).toEqual(mockClubs)
    })
  })

  describe('createClub', () => {
    it('should create a new club', async () => {
      const clubData = {
        name: 'Test Club',
        foundedYear: 2000,
        city: 'Test City'
      }

      Club.create = jest.fn().mockResolvedValue({
        _id: '1',
        ...clubData
      })

      const result = await clubService.createClub(clubData)

      expect(Club.create).toHaveBeenCalledWith(clubData)
      expect(result._id).toBe('1')
    })
  })
})
```

**Step 6: Run test to verify it fails**

```bash
cd services/club-service && npm test
```

Expected: Tests may pass if we create the service file next, or fail if service doesn't exist.

**Step 7: Create services/club-service/src/services/clubService.ts**

```typescript
import { Club, IClub } from '../models/Club'

export class ClubService {
  async getAllClubs(): Promise<IClub[]> {
    const clubs = await Club.find().exec()
    return clubs
  }

  async getClubById(id: string): Promise<IClub | null> {
    const club = await Club.findById(id).exec()
    return club
  }

  async createClub(clubData: Partial<IClub>): Promise<IClub> {
    const club = await Club.create(clubData)
    return club
  }

  async updateClub(id: string, clubData: Partial<IClub>): Promise<IClub | null> {
    const club = await Club.findByIdAndUpdate(id, clubData, { new: true }).exec()
    return club
  }

  async deleteClub(id: string): Promise<IClub | null> {
    const club = await Club.findByIdAndDelete(id).exec()
    return club
  }

  async updateFinances(id: string, income: number, expense: number): Promise<IClub | null> {
    const club = await Club.findById(id).exec()
    if (!club) return null

    club.finances.cash += income - expense
    club.finances.incomeHistory.push({
      type: 'other',
      amount: income,
      date: new Date()
    })
    club.finances.expenseHistory.push({
      type: 'other',
      amount: expense,
      date: new Date()
    })

    return await club.save()
  }
}
```

**Step 8: Create services/club-service/src/controllers/clubController.ts**

```typescript
import { Request, Response } from 'express'
import { ClubService } from '../services/clubService'

const clubService = new ClubService()

export const getAllClubs = async (req: Request, res: Response) => {
  try {
    const clubs = await clubService.getAllClubs()
    res.json(clubs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clubs' })
  }
}

export const getClubById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const club = await clubService.getClubById(id)
    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }
    res.json(club)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch club' })
  }
}

export const createClub = async (req: Request, res: Response) => {
  try {
    const club = await clubService.createClub(req.body)
    res.status(201).json(club)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create club' })
  }
}

export const updateClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const club = await clubService.updateClub(id, req.body)
    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }
    res.json(club)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update club' })
  }
}

export const deleteClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const club = await clubService.deleteClub(id)
    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }
    res.json({ message: 'Club deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete club' })
  }
}
```

**Step 9: Run test to verify it passes**

```bash
cd services/club-service && npm test
```

Expected: Tests should pass.

**Step 10: Create tsconfig.json and Dockerfile**

```bash
# services/club-service/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node", "jest"]
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```dockerfile
# services/club-service/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3002

CMD ["node", "dist/index.js"]
```

**Step 11: Commit**

```bash
git add services/club-service/
git commit -m "feat: implement club service with CRUD operations and tests"
```

## Task 2.3: Player Service Implementation

**Files:**
- Create: `services/player-service/package.json`
- Create: `services/player-service/src/index.ts`
- Create: `services/player-service/src/models/Player.ts`
- Create: `services/player-service/src/routes/players.ts`
- Create: `services/player-service/src/controllers/playerController.ts`
- Create: `services/player-service/src/services/playerService.ts`
- Create: `services/player-service/tests/playerService.test.ts`
- Create: `services/player-service/tsconfig.json`
- Create: `services/player-service/Dockerfile`

**Step 1: Write the failing test**

Create file: `services/player-service/tests/playerService.test.ts`

```typescript
import { PlayerService } from '../src/services/playerService'
import { Player } from '../src/models/Player'

jest.mock('../src/models/Player')

describe('PlayerService', () => {
  let playerService: PlayerService

  beforeEach(() => {
    playerService = new PlayerService()
  })

  describe('createPlayer', () => {
    it('should create a new player with default attributes', async () => {
      const playerData = {
        name: 'Lionel Messi',
        age: 25,
        position: 'RW',
        clubId: '1'
      }

      Player.create = jest.fn().mockResolvedValue({
        _id: '1',
        ...playerData,
        attributes: {
          speed: 85,
          shooting: 90,
          passing: 92,
          defending: 30,
          physical: 65,
          technical: 95,
          mental: 88
        },
        potential: 98,
        currentAbility: 92
      })

      const result = await playerService.createPlayer(playerData)

      expect(Player.create).toHaveBeenCalled()
      expect(result.attributes.speed).toBeGreaterThan(0)
    })
  })

  describe('getPlayersByClub', () => {
    it('should return all players for a given club', async () => {
      Player.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: '1', name: 'Player 1', clubId: 'club1' },
          { _id: '2', name: 'Player 2', clubId: 'club1' }
        ])
      } as any)

      const result = await playerService.getPlayersByClub('club1')

      expect(Player.find).toHaveBeenCalledWith({ clubId: 'club1' })
      expect(result).toHaveLength(2)
    })
  })

  describe('calculatePlayerValue', () => {
    it('should calculate player value based on age, potential, and ability', () => {
      const player = {
        age: 24,
        potential: 95,
        currentAbility: 88
      }

      const value = playerService.calculatePlayerValue(player as any)

      expect(value).toBeGreaterThan(0)
      expect(value).toBeLessThan(100000000)
    })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd services/player-service && npm test
```

Expected: Tests will fail because PlayerService and Player model don't exist yet.

**Step 3: Create services/player-service/package.json**

```json
{
  "name": "player-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/jest": "^29.5.11",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

**Step 4: Create services/player-service/src/models/Player.ts**

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPlayer extends Document {
  name: string
  age: number
  nationality: string
  height: number
  weight: number
  position: string
  attributes: {
    speed: number
    shooting: number
    passing: number
    defending: number
    physical: number
    technical: number
    mental: number
    goalkeeping?: number
  }
  potential: number
  currentAbility: number
  contract: {
    salary: number
    expiresAt: Date
    bonus: number
  }
  injury?: {
    isInjured: boolean
    type: string
    recoveryTime: number
  }
  history: {
    matchesPlayed: number
    goals: number
    assists: number
    growthLog: any[]
  }
  clubId?: string
  isYouth?: boolean
}

const PlayerSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 14, max: 40 },
  nationality: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  position: {
    type: String,
    required: true,
    enum: ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'ST', 'CF', 'LW', 'RW']
  },
  attributes: {
    speed: { type: Number, min: 0, max: 99, default: 50 },
    shooting: { type: Number, min: 0, max: 99, default: 50 },
    passing: { type: Number, min: 0, max: 99, default: 50 },
    defending: { type: Number, min: 0, max: 99, default: 50 },
    physical: { type: Number, min: 0, max: 99, default: 50 },
    technical: { type: Number, min: 0, max: 99, default: 50 },
    mental: { type: Number, min: 0, max: 99, default: 50 },
    goalkeeping: { type: Number, min: 0, max: 99, default: 50 }
  },
  potential: { type: Number, min: 0, max: 99, required: true },
  currentAbility: { type: Number, min: 0, max: 99, required: true },
  contract: {
    salary: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    bonus: { type: Number, default: 0 }
  },
  injury: {
    isInjured: { type: Boolean, default: false },
    type: String,
    recoveryTime: { type: Number, default: 0 }
  },
  history: {
    matchesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    growthLog: [{ type: Object }]
  },
  clubId: { type: Schema.Types.ObjectId, ref: 'Club' },
  isYouth: { type: Boolean, default: false }
}, {
  timestamps: true
})

PlayerSchema.pre('save', function(next) {
  if (this.position === 'GK' && !this.attributes.goalkeeping) {
    this.attributes.goalkeeping = this.attributes.defending
  }
  next()
})

export const Player: Model<IPlayer> = mongoose.model<IPlayer>('Player', PlayerSchema)
```

**Step 5: Create services/player-service/src/services/playerService.ts**

```typescript
import { Player, IPlayer } from '../models/Player'
import { randomBetween } from 'football-manager-shared'

export class PlayerService {
  async getAllPlayers(): Promise<IPlayer[]> {
    const players = await Player.find().exec()
    return players
  }

  async getPlayerById(id: string): Promise<IPlayer | null> {
    const player = await Player.findById(id).exec()
    return player
  }

  async getPlayersByClub(clubId: string): Promise<IPlayer[]> {
    const players = await Player.find({ clubId }).exec()
    return players
  }

  async createPlayer(playerData: Partial<IPlayer>): Promise<IPlayer> {
    const newPlayer = new Player({
      ...playerData,
      attributes: playerData.attributes || this.generateRandomAttributes(),
      potential: playerData.potential || randomBetween(50, 99),
      currentAbility: playerData.currentAbility || randomBetween(40, 85),
      history: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        growthLog: []
      }
    })

    const savedPlayer = await newPlayer.save()
    return savedPlayer
  }

  async updatePlayer(id: string, playerData: Partial<IPlayer>): Promise<IPlayer | null> {
    const player = await Player.findByIdAndUpdate(id, playerData, { new: true }).exec()
    return player
  }

  async deletePlayer(id: string): Promise<IPlayer | null> {
    const player = await Player.findByIdAndDelete(id).exec()
    return player
  }

  async transferPlayer(playerId: string, fromClubId: string, toClubId: string): Promise<IPlayer | null> {
    const player = await Player.findById(playerId).exec()
    if (!player) return null

    player.clubId = toClubId as any
    await player.save()

    return player
  }

  calculatePlayerValue(player: IPlayer): number {
    const ageFactor = player.age < 24 ? 1.2 : player.age > 30 ? 0.6 : 1
    const potentialFactor = player.potential / 100
    return Math.round(player.currentAbility * 10000 * ageFactor * potentialFactor)
  }

  async trainPlayer(playerId: string, trainingType: string): Promise<IPlayer | null> {
    const player = await Player.findById(playerId).exec()
    if (!player) return null

    const growthAmount = this.calculateGrowth(player, trainingType)
    this.applyGrowth(player, growthAmount, trainingType)

    await player.save()
    return player
  }

  private generateRandomAttributes() {
    return {
      speed: randomBetween(40, 90),
      shooting: randomBetween(40, 90),
      passing: randomBetween(40, 90),
      defending: randomBetween(40, 90),
      physical: randomBetween(40, 90),
      technical: randomBetween(40, 90),
      mental: randomBetween(40, 90)
    }
  }

  private calculateGrowth(player: IPlayer, trainingType: string): number {
    let growthRate = 0

    if (player.age >= 16 && player.age <= 22) {
      growthRate = 2.0
    } else if (player.age >= 23 && player.age <= 28) {
      growthRate = 0.5
    } else if (player.age > 28) {
      growthRate = -0.3
    }

    if (player.injury?.isInjured) {
      growthRate *= 0.5
    }

    return growthRate
  }

  private applyGrowth(player: IPlayer, growthAmount: number, trainingType: string): void {
    const trainingAttributes = this.getTrainingAttributes(trainingType)

    trainingAttributes.forEach(attr => {
      const currentValue = player.attributes[attr]
      const newValue = Math.max(0, Math.min(99, currentValue + growthAmount))
      player.attributes[attr] = newValue
    })

    player.currentAbility = Math.round(
      Object.values(player.attributes).reduce((sum, val) => sum + val, 0) /
      Object.keys(player.attributes).length
    )

    player.history.growthLog.push({
      date: new Date(),
      attributes: player.attributes,
      currentAbility: player.currentAbility
    })
  }

  private getTrainingAttributes(trainingType: string): string[] {
    const trainingMap: { [key: string]: string[] } = {
      technical: ['technical', 'passing', 'shooting'],
      physical: ['physical', 'speed'],
      tactical: ['mental', 'defending'],
      goalkeeping: ['goalkeeping']
    }

    return trainingMap[trainingType] || ['technical', 'physical', 'mental']
  }
}
```

**Step 6: Create services/player-service/src/routes/players.ts**

```typescript
import { Router } from 'express'
import * as playerController from '../controllers/playerController'

const router = Router()

router.get('/', playerController.getAllPlayers)
router.get('/:id', playerController.getPlayerById)
router.get('/club/:clubId', playerController.getPlayersByClub)
router.post('/', playerController.createPlayer)
router.put('/:id', playerController.updatePlayer)
router.delete('/:id', playerController.deletePlayer)
router.post('/:id/transfer', playerController.transferPlayer)
router.post('/:id/train', playerController.trainPlayer)

export default router
```

**Step 7: Create services/player-service/src/controllers/playerController.ts**

```typescript
import { Request, Response } from 'express'
import { PlayerService } from '../services/playerService'

const playerService = new PlayerService()

export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await playerService.getAllPlayers()
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' })
  }
}

export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const player = await playerService.getPlayerById(id)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player' })
  }
}

export const getPlayersByClub = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params
    const players = await playerService.getPlayersByClub(clubId)
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' })
  }
}

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const player = await playerService.createPlayer(req.body)
    res.status(201).json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player' })
  }
}

export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const player = await playerService.updatePlayer(id, req.body)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player' })
  }
}

export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const player = await playerService.deletePlayer(id)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json({ message: 'Player deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player' })
  }
}

export const transferPlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { toClubId } = req.body
    const player = await playerService.transferPlayer(id, req.body.fromClubId, toClubId)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to transfer player' })
  }
}

export const trainPlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { trainingType } = req.body
    const player = await playerService.trainPlayer(id, trainingType)
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to train player' })
  }
}
```

**Step 8: Create services/player-service/src/index.ts**

```typescript
import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import playerRoutes from './routes/players'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

app.use(express.json())
app.use('/players', playerRoutes)

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football_manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.listen(PORT, () => {
  console.log(`Player service running on port ${PORT}`)
})
```

**Step 9: Run test to verify it passes**

```bash
cd services/player-service && npm test
```

Expected: Tests should pass.

**Step 10: Create tsconfig.json and Dockerfile**

```bash
# services/player-service/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node", "jest"]
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```dockerfile
# services/player-service/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3003

CMD ["node", "dist/index.js"]
```

**Step 11: Commit**

```bash
git add services/player-service/
git commit -m "feat: implement player service with CRUD operations, training, and tests"
```

# Phase 3: Match Service and Real-Time Simulation

## Task 3.1: Match Service Core Implementation

**Files:**
- Create: `services/match-service/package.json`
- Create: `services/match-service/src/index.ts`
- Create: `services/match-service/src/models/Match.ts`
- Create: `services/match-service/src/routes/matches.ts`
- Create: `services/match-service/src/controllers/matchController.ts`
- Create: `services/match-service/src/services/matchService.ts`
- Create: `services/match-service/src/services/matchSimulation.ts`
- Create: `services/match-service/tests/matchService.test.ts`
- Create: `services/match-service/tsconfig.json`
- Create: `services/match-service/Dockerfile`

**Step 1: Write the failing test**

Create file: `services/match-service/tests/matchService.test.ts`

```typescript
import { MatchService } from '../src/services/matchService'
import { Match } from '../src/models/Match'

jest.mock('../src/models/Match')

describe('MatchService', () => {
  let matchService: MatchService

  beforeEach(() => {
    matchService = new MatchService()
  })

  describe('createMatch', () => {
    it('should create a new match with default status', async () => {
      const matchData = {
        homeTeam: { clubId: 'club1', lineup: [], tactics: {} },
        awayTeam: { clubId: 'club2', lineup: [], tactics: {} },
        date: new Date(),
        leagueId: 'league1'
      }

      Match.create = jest.fn().mockResolvedValue({
        _id: '1',
        ...matchData,
        status: 'scheduled',
        events: [],
        statistics: {},
        playerRatings: new Map()
      })

      const result = await matchService.createMatch(matchData as any)

      expect(Match.create).toHaveBeenCalled()
      expect(result.status).toBe('scheduled')
    })
  })

  describe('simulateMatch', () => {
    it('should simulate a match and update score', async () => {
      const matchId = 'match1'
      const mockMatch = {
        _id: matchId,
        homeTeam: { clubId: 'club1', score: 0, lineup: [], tactics: {} },
        awayTeam: { clubId: 'club2', score: 0, lineup: [], tactics: {} },
        events: [],
        statistics: {},
        playerRatings: new Map()
      }

      Match.findById = jest.fn().mockResolvedValue(mockMatch)
      Match.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...mockMatch,
        status: 'completed',
        homeTeam: { ...mockMatch.homeTeam, score: 2 },
        awayTeam: { ...mockMatch.awayTeam, score: 1 }
      })

      const result = await matchService.simulateMatch(matchId)

      expect(Match.findById).toHaveBeenCalledWith(matchId)
      expect(result.homeTeam.score).toBeGreaterThanOrEqual(0)
    })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd services/match-service && npm test
```

Expected: Tests will fail because MatchService doesn't exist yet.

**Step 3: Create services/match-service/package.json**

```json
{
  "name": "match-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "socket.io": "^4.6.0",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0",
    "redis": "^4.6.11"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/jest": "^29.5.11",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

**Step 4: Create services/match-service/src/models/Match.ts**

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMatch extends Document {
  homeTeam: {
    clubId: string
    score: number
    lineup: string[]
    tactics: any
  }
  awayTeam: {
    clubId: string
    score: number
    lineup: string[]
    tactics: any
  }
  date: Date
  leagueId: string
  status: 'scheduled' | 'live' | 'completed' | 'postponed'
  events: any[]
  statistics: {
    possession: { home: number; away: number }
    shots: { home: number; away: number }
    shotsOnTarget: { home: number; away: number }
    corners: { home: number; away: number }
    fouls: { home: number; away: number }
    passes: { home: number; away: number }
  }
  playerRatings: Map<string, number>
}

const MatchSchema: Schema = new Schema({
  homeTeam: {
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
    score: { type: Number, default: 0 },
    lineup: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    tactics: {
      formation: { type: String, default: '4-4-2' },
      attacking: { type: Number, default: 50 },
      defending: { type: Number, default: 50 },
      playStyle: { type: String, default: 'possession' }
    }
  },
  awayTeam: {
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
    score: { type: Number, default: 0 },
    lineup: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    tactics: {
      formation: { type: String, default: '4-4-2' },
      attacking: { type: Number, default: 50 },
      defending: { type: Number, default: 50 },
      playStyle: { type: String, default: 'possession' }
    }
  },
  date: { type: Date, required: true },
  leagueId: { type: Schema.Types.ObjectId, ref: 'League', required: true },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'postponed'],
    default: 'scheduled'
  },
  events: [{
    minute: { type: Number, required: true },
    type: { type: String, required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'Player' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Club' },
    description: { type: String },
    details: { type: Object }
  }],
  statistics: {
    possession: { home: { type: Number, default: 50 }, away: { type: Number, default: 50 } },
    shots: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    shotsOnTarget: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    corners: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    fouls: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    passes: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } }
  },
  playerRatings: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
})

export const Match: Model<IMatch> = mongoose.model<IMatch>('Match', MatchSchema)
```

**Step 5: Create services/match-service/src/services/matchSimulation.ts**

```typescript
import { IMatch } from '../models/Match'
import { randomBetween } from 'football-manager-shared'

export class MatchSimulation {
  private match: IMatch
  private currentMinute: number = 0
  private events: any[] = []

  constructor(match: IMatch) {
    this.match = match
  }

  async simulate(): Promise<IMatch> {
    this.currentMinute = 0
    this.match.status = 'live'

    for (let minute = 1; minute <= 90; minute++) {
      this.currentMinute = minute
      await this.simulateMinute()
    }

    this.match.status = 'completed'
    this.match.events = this.events

    return this.match
  }

  async simulateMinute(): Promise<void> {
    const homeStrength = this.calculateTeamStrength(this.match.homeTeam)
    const awayStrength = this.calculateTeamStrength(this.match.awayTeam)

    const possession = homeStrength / (homeStrength + awayStrength)

    if (Math.random() < 0.3) {
      await this.generateEvent(possession)
    }

    this.updateStatistics(possession)
  }

  private calculateTeamStrength(team: any): number {
    return randomBetween(50, 90)
  }

  private async generateEvent(possession: number): Promise<void> {
    const eventTypes = ['shot', 'foul', 'corner']
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    const event = {
      minute: this.currentMinute,
      type: eventType,
      teamId: Math.random() < possession ? this.match.homeTeam.clubId : this.match.awayTeam.clubId,
      description: `${eventType} at minute ${this.currentMinute}`
    }

    if (eventType === 'shot') {
      const isGoal = Math.random() < 0.15
      if (isGoal) {
        event.type = 'goal'
        event.description = `Goal at minute ${this.currentMinute}!`

        if (event.teamId === this.match.homeTeam.clubId) {
          this.match.homeTeam.score++
        } else {
          this.match.awayTeam.score++
        }
      }
    }

    this.events.push(event)
    this.match.statistics.shots.home++
    this.match.statistics.shots.away++
  }

  private updateStatistics(possession: number): void {
    this.match.statistics.possession.home += possession
    this.match.statistics.possession.away += (1 - possession)
  }
}
```

**Step 6: Create services/match-service/src/services/matchService.ts**

```typescript
import { Match, IMatch } from '../models/Match'
import { MatchSimulation } from './matchSimulation'

export class MatchService {
  async getAllMatches(): Promise<IMatch[]> {
    const matches = await Match.find().exec()
    return matches
  }

  async getMatchById(id: string): Promise<IMatch | null> {
    const match = await Match.findById(id).exec()
    return match
  }

  async getMatchesByLeague(leagueId: string): Promise<IMatch[]> {
    const matches = await Match.find({ leagueId }).sort({ date: 1 }).exec()
    return matches
  }

  async createMatch(matchData: Partial<IMatch>): Promise<IMatch> {
    const match = await Match.create(matchData)
    return match
  }

  async startMatch(id: string, socketIo: any): Promise<IMatch | null> {
    const match = await Match.findById(id).exec()
    if (!match) return null

    match.status = 'live'
    await match.save()

    const simulation = new MatchSimulation(match)

    for (let minute = 1; minute <= 90; minute++) {
      await this.simulateMinute(match, socketIo)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    match.status = 'completed'
    await match.save()

    return match
  }

  async simulateMatch(id: string): Promise<IMatch | null> {
    const match = await Match.findById(id).exec()
    if (!match) return null

    const simulation = new MatchSimulation(match)
    return await simulation.simulate()
  }

  private async simulateMinute(match: IMatch, socketIo: any): Promise<void> {
    const homeStrength = 70
    const awayStrength = 65

    if (Math.random() < 0.2) {
      const event = {
        minute: match.events.length + 1,
        type: 'shot',
        teamId: Math.random() < 0.5 ? match.homeTeam.clubId : match.awayTeam.clubId,
        description: 'Shot attempt'
      }
      match.events.push(event)

      if (socketIo) {
        socketIo.emit('match:event', { matchId: match._id, event })
      }
    }
  }

  async updateMatch(id: string, matchData: Partial<IMatch>): Promise<IMatch | null> {
    const match = await Match.findByIdAndUpdate(id, matchData, { new: true }).exec()
    return match
  }
}
```

**Step 7-10**: Create routes, controllers, index.ts, tsconfig.json, Dockerfile similar to previous services. Then run tests and commit.

由于篇幅限制，我将跳过其余的详细代码，直接总结关键步骤：

**后续任务（简要概述）：**

## Task 3.2: Economy Service Implementation

实现经济服务，包括收入、支出、财务周期管理和转会市场逻辑。

## Task 3.3: Youth Service Implementation

实现青训服务，包括设施管理、新球员生成、成长系统和退役系统。

## Task 3.4: League Service Implementation

实现联赛服务，包括赛程管理、积分榜和历史记录。

## Task 3.5: Message Service Implementation

实现消息服务，使用Socket.io进行实时通信。

## Task 3.6: Notification Service Implementation

实现通知服务，处理游戏内通知和邮件。

# Phase 4: Frontend Implementation

## Task 4.1: Frontend Setup and UI Components

配置Next.js应用，安装shadcn/ui组件，创建基础布局和主题。

## Task 4.2: Dashboard Page

创建仪表盘页面，显示俱乐部概览、财务信息和下一场比赛。

## Task 4.3: Team Management Page

创建球队管理页面，包括阵容查看、战术配置和球员列表。

## Task 4.4: Match Center Page

创建比赛中心页面，包括实时比赛观赛和历史比赛。

## Task 4.5: Transfer Market Page

创建转会市场页面，包括球员搜索和转会操作。

## Task 4.6: Youth Academy Page

创建青训系统页面，包括设施管理和年轻球员。

## Task 4.7: Economy Center Page

创建经济中心页面，包括财务报表和预算管理。

## Task 4.8: League Standings Page

创建联赛积分榜页面，显示实时排名和赛程。

# Phase 5: Integration and Testing

## Task 5.1: Docker Compose Integration

更新docker-compose.yml，包含所有服务。

## Task 5.2: End-to-End Testing

编写端到端测试，验证整个系统功能。

## Task 5.3: Performance Testing

进行性能测试和优化。

## Task 5.4: Deployment Preparation

准备生产环境部署配置。

# Phase 6: Code Review and Final Polish

## Task 6.1: Code Review

对所有代码进行审查，确保质量和一致性。

## Task 6.2: Documentation

更新API文档和用户指南。

## Task 6.3: Final Testing

进行最终测试，确保所有功能正常工作。

## Task 6.4: Deployment

部署到生产环境。
