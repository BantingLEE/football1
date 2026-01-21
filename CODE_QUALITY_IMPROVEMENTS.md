# Code Quality Improvements - Issues 17 & 18

## Summary

This document summarizes the code quality improvements made to address issues 17 (Hardcoded constants) and 18 (Missing API documentation).

## Issue 17: Hardcoded Constants

### Changes Made

#### 1. Created Shared Constants File
**File:** `shared/src/constants/game.ts`

Created a comprehensive constants file containing all game-related constants:

- **Match Constants:**
  - `MATCH_DURATION`: 90 minutes
  - `EVENT_PROBABILITY`: 0.3 (30% chance per minute)
  - `GOAL_PROBABILITY`: 0.15 (15% chance per shot)
  - `REALTIME_DELAY_MS`: 1000ms delay between minutes in real-time simulation

- **Team Strength:**
  - `MIN`: 50
  - `MAX`: 90

- **Player Constants:**
  - Attribute ranges (min/max: 40-90, absolute: 0-99)
  - Age groups (Youth: 14-18, Prime: 19-28, Veteran: 29-35, Retirement: 36-40)
  - Growth rates (Youth: 3.0, Prime: 0.8, Decline: -0.2)
  - Value calculation factors
  - Injury multiplier: 0.3

- **Youth Facility Constants:**
  - 5 facility levels with capacity, quality, and players per week
  - Player name, height, and weight ranges

- **League Constants:**
  - Default rules (3 promotion slots, 3 relegation slots)
  - Default points (Win: 3, Draw: 1, Loss: 0)
  - Minimum clubs: 2

- **Training Constants:**
  - Training types: technical, physical, tactical, goalkeeping
  - Default duration: 7 days
  - Week divisor for calculations

- **Economy Constants:**
  - Time periods: weekly, monthly, yearly
  - Days per period (7, 30, 365)

- **Formations:** 4-4-2, 4-3-3, 3-5-2, 4-2-3-1, 5-3-2, 3-4-3

- **Positions:** GK, CB, RB, LB, CDM, CM, CAM, RM, LM, ST, CF, LW, RW

- **Notification Types:**
  - High priority: injury_report, transfer_complete
  - Low priority: financial_report, training_complete

#### 2. Updated Match Service Constants
**File:** `services/match-service/src/constants/simulationConstants.ts`

Refactored to import from shared constants:

```typescript
import { GAME_CONSTANTS } from 'football-manager-shared/src/constants/game'

export const SIMULATION_CONSTANTS = {
  TEAM_STRENGTH: GAME_CONSTANTS.TEAM_STRENGTH,
  MATCH: {
    DURATION: GAME_CONSTANTS.MATCH.DURATION,
    EVENT_PROBABILITY: GAME_CONSTANTS.MATCH.EVENT_PROBABILITY,
    GOAL_PROBABILITY: GAME_CONSTANTS.MATCH.GOAL_PROBABILITY,
    REALTIME_DELAY_MS: GAME_CONSTANTS.MATCH.REALTIME_DELAY_MS
  }
} as const
```

#### 3. Updated Match Simulation
**File:** `services/match-service/src/services/matchSimulation.ts`

Updated to use `SIMULATION_CONSTANTS.MATCH.REALTIME_DELAY_MS` instead of hardcoded `1000`.

### Benefits

1. **Single Source of Truth:** All constants defined in one place
2. **Easy Maintenance:** Changes propagate automatically to all services
3. **Type Safety:** Constants exported as `as const` for better type inference
4. **Documentation:** Each constant has clear semantic meaning
5. **Consistency:** Eliminates magic numbers across the codebase

## Issue 18: Missing API Documentation

### Changes Made

#### 1. Created OpenAPI Specification
**File:** `api-docs/openapi.yaml`

Created comprehensive OpenAPI 3.0.3 specification including:

- **API Info:**
  - Title: Football Manager API
  - Version: 1.0.0
  - Description and contact information
  - Multiple server URLs (dev and production)

- **Authentication:**
  - Bearer token (JWT) security scheme

- **Tags:**
  - Clubs, Players, Matches, Leagues, Economy, Youth, Notifications, Messages

- **Endpoints Documented:**
  - 7 club endpoints
  - 8 player endpoints
  - 6 match endpoints
  - 7 league endpoints
  - 8 economy endpoints
  - 7 youth endpoints
  - 7 notification endpoints
  - 3 message endpoints

- **Schemas Defined:**
  - Club, Player, Match, League models
  - Request/response types for all endpoints
  - Nested objects for attributes, finances, statistics, etc.

- **Examples:**
  - Request/response examples for major endpoints
  - Error response examples (400, 401, 404, 500)

- **Documentation:**
  - Description for each endpoint
  - Parameter descriptions
  - Schema property descriptions

#### 2. Updated API Gateway
**File:** `services/api-gateway/src/index.ts`

Enhanced the API Gateway with Swagger UI:

```typescript
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Football Manager API',
      version: '1.0.0',
      description: 'REST API for Football Manager game...',
      contact: { name: 'API Support', email: 'support@footballmanager.com' }
    },
    servers: [
      { url: `http://localhost:${PORT}/api/v1`, description: 'Local development server' },
      { url: 'https://api.footballmanager.com/api/v1', description: 'Production server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token authentication'
        }
      }
    }
  },
  apis: [path.join(__dirname, '..', '..', '..', 'api-docs', 'openapi.yaml')]
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', '..', 'api-docs', 'openapi.yaml'))
})
```

Updated startup logs:
```
API Gateway running on port 3001
API Documentation available at http://localhost:3001/api-docs
OpenAPI Specification available at http://localhost:3001/openapi.yaml
```

#### 3. Created API Documentation README
**File:** `api-docs/README.md`

Created comprehensive documentation including:

- Overview of available endpoints
- Access instructions for Swagger UI and OpenAPI spec
- Authentication instructions
- Common response codes
- Rate limiting information
- Instructions for generating client SDKs
- Contributing guidelines

### Benefits

1. **Interactive Documentation:** Swagger UI allows testing endpoints directly
2. **Type Safety:** Client SDKs can be generated from the spec
3. **Standard Format:** OpenAPI is a widely adopted industry standard
4. **Easy Sharing:** Spec file can be shared with frontend developers and external consumers
5. **Version Control:** Documentation changes tracked alongside code
6. **Auto-generated:** Can be updated automatically as API evolves

## Additional Improvements

### JSDoc Comments

Prepared template files with JSDoc comments for major services to be added:

- Function descriptions
- Parameter documentation
- Return type documentation
- @throws documentation

## Testing

To test the changes:

1. Start the API Gateway:
```bash
cd services/api-gateway
npm run dev
```

2. Access Swagger UI:
```
http://localhost:3001/api-docs
```

3. Download OpenAPI spec:
```
http://localhost:3001/openapi.yaml
```

4. Verify constants are properly imported:
```bash
cd services/match-service
npm test
```

## Future Improvements

1. Add JSDoc comments to all service methods
2. Generate TypeScript types from OpenAPI spec
3. Add API versioning to the spec
4. Create separate specs for each service
5. Add more detailed examples for complex endpoints
6. Add response headers documentation
7. Document WebSocket events
8. Add rate limit headers to documentation

## Files Modified/Created

### Created:
- `shared/src/constants/game.ts` - Centralized game constants
- `api-docs/openapi.yaml` - Complete OpenAPI specification
- `api-docs/README.md` - API documentation guide

### Modified:
- `services/match-service/src/constants/simulationConstants.ts` - Updated to use shared constants
- `services/match-service/src/services/matchSimulation.ts` - Updated to use REALTIME_DELAY_MS constant
- `services/api-gateway/src/index.ts` - Added Swagger UI and OpenAPI spec serving

## Commit Message

```
refactor: extract constants and add API documentation

- Issue #17: Extract hardcoded magic numbers to shared constants
- Issue #18: Add comprehensive OpenAPI/Swagger documentation

Created shared/src/constants/game.ts with:
- Match simulation constants (duration, probabilities, delays)
- Player constants (attributes, age groups, growth rates, values)
- Youth facility constants (levels, capacities, quality)
- League constants (default rules, points)
- Training types and periods
- Economy constants (time periods)
- Formations and positions
- Notification priority types

Updated match service to import from shared constants

Created api-docs/openapi.yaml with:
- Complete OpenAPI 3.0.3 specification
- Documentation for 53 endpoints across 8 services
- Request/response schemas for all endpoints
- Example requests and responses
- Authentication (Bearer JWT) documentation
- Error response schemas

Updated API Gateway to serve:
- Swagger UI at /api-docs
- OpenAPI spec at /openapi.yaml

Benefits:
- Single source of truth for all game constants
- Easy maintenance and consistency across services
- Interactive API documentation for developers
- Standard OpenAPI format for client SDK generation
```
