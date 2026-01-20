# End-to-End Tests

This directory contains E2E tests for the Football Manager application.

## Structure

```
e2e/
├── tests/
│   ├── dashboard.spec.ts           # Dashboard page E2E tests
│   ├── team-management.spec.ts      # Team management E2E tests
│   ├── match-center.spec.ts         # Match center E2E tests
│   ├── transfers.spec.ts            # Transfer market E2E tests
│   └── api/
│       ├── club-api.spec.ts         # Club API E2E tests
│       ├── player-api.spec.ts       # Player API E2E tests
│       └── match-api.spec.ts        # Match API E2E tests
├── playwright.config.ts             # Playwright configuration
├── jest.config.js                   # Jest configuration for API tests
├── package.json                     # E2E dependencies
├── setup.ts                         # Test setup
└── teardown.ts                      # Test teardown
```

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Frontend E2E Tests (Playwright)

Run all frontend E2E tests:
```bash
npm run test
```

Run tests in headed mode:
```bash
npm run test:headed
```

Run tests with UI:
```bash
npm run test:ui
```

Debug tests:
```bash
npm run test:debug
```

View test report:
```bash
npm run report
```

### API E2E Tests (Jest + Supertest)

Run all API E2E tests:
```bash
npm run test:api
```

## Environment Variables

Create a `.env` file in the root directory:

```
BASE_URL=http://localhost:3000
API_URL=http://localhost:3001/api
CLUB_SERVICE_URL=http://localhost:3002
PLAYER_SERVICE_URL=http://localhost:3003
MATCH_SERVICE_URL=http://localhost:3004
```

## Test Coverage

### Frontend Tests
- Dashboard page loading and data display
- Team management (squad, tactics, substitutions)
- Match center (live, upcoming, past matches)
- Transfer market (search, filters, offers)

### API Tests
- Club CRUD operations
- Player CRUD operations
- Match management and simulation
- Authentication and authorization
- Error handling

## CI/CD Integration

The tests are configured to run in CI environments with:
- Headless browser execution
- Parallel test execution
- Automatic retry on failure
- Video and screenshot capture on failure
- HTML test report generation

## Troubleshooting

### Port already in use
If the port is already in use, set the `PORT` environment variable:
```bash
PORT=3001 npm run test
```

### Browser installation fails
Install Playwright browsers manually:
```bash
npx playwright install --with-deps
```

### Timeout errors
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 120000,
```
