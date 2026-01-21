# Football Manager API Documentation

This directory contains the OpenAPI/Swagger specification for the Football Manager API.

## Files

- `openapi.yaml` - Complete OpenAPI 3.0.3 specification for all endpoints
- `README.md` - This file

## Accessing the Documentation

### Swagger UI
When running the API Gateway locally, access the interactive Swagger UI at:
```
http://localhost:3001/api-docs
```

### OpenAPI Specification
Download the raw OpenAPI specification at:
```
http://localhost:3001/openapi.yaml
```

## API Overview

The Football Manager API provides endpoints for managing:

### Clubs
- Get all clubs
- Get club by ID
- Create new club
- Update club
- Delete club
- Update club finances

### Players
- Get all players
- Get player by ID
- Get players by club
- Create new player
- Update player
- Delete player
- Transfer player
- Train player

### Matches
- Get all matches
- Get match by ID
- Get matches by league
- Create new match
- Update match
- Start match (real-time simulation)
- Simulate match (instant)

### Leagues
- Get all leagues
- Get league by ID
- Create new league
- Update league
- Delete league
- Get league standings
- Get league schedule
- Generate league schedule
- Process promotion/relegation

### Economy
- Calculate weekly income
- Calculate weekly expenses
- Update budget
- Get financial report
- Get financial records
- Create financial record
- Process transfer
- Get transfer list

### Youth
- Generate youth players
- Upgrade facility
- Get youth players
- Promote to first team
- Train youth player
- Retire old players
- Get facility capacity

### Notifications
- Create notification
- Get user notifications
- Mark as read
- Mark all as read
- Delete notification
- Send email notification
- Batch create notifications

### Messages
- Health check
- Broadcast to room
- Send to user

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Common Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

The API implements rate limiting to prevent abuse. The default rate limit is configured in the API Gateway middleware.

## Generating Client SDKs

You can use the OpenAPI specification to generate client SDKs in various languages:

```bash
# Using OpenAPI Generator
openapi-generator-cli generate -i openapi.yaml -g javascript -o ./client-sdk

# Using Swagger Codegen
swagger-codegen generate -i openapi.yaml -l javascript -o ./client-sdk
```

## Contributing

When adding new endpoints, please update the `openapi.yaml` file with the appropriate documentation including:
- Endpoint path and method
- Request/response schemas
- Example requests/responses
- Authentication requirements
- Error responses
