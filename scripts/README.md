# Docker Scripts

This directory contains scripts to manage the Football Manager application using Docker Compose.

## Scripts

### start-dev.sh
Starts the development environment with hot reload enabled.
- Services run with `npm run dev` command
- Source code is mounted for live updates
- Development database: `football_manager_dev`
- Logs are shown in real-time

### start-prod.sh
Starts the production environment.
- Optimized builds with production configurations
- Resource limits and logging configured
- Production database: `football_manager`
- Services restart automatically on failure

## Usage

### Development
```bash
./scripts/start-dev.sh
```

### Production
```bash
./scripts/start-prod.sh
```

## Access URLs

After starting the services:

- Frontend: http://localhost:3000
- API Gateway: http://localhost:3001
- MongoDB: mongodb://localhost:27017
- Redis: redis://localhost:6379
- RabbitMQ Management: http://localhost:15672 (admin/password)

## Useful Commands

### View logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Stop all services
```bash
docker-compose -f docker-compose.dev.yml down
```

### Rebuild specific service
```bash
docker-compose -f docker-compose.dev.yml build <service-name>
docker-compose -f docker-compose.dev.yml up -d <service-name>
```

### Remove all volumes
```bash
docker-compose -f docker-compose.dev.yml down -v
```
