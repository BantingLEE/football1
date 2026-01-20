#!/bin/bash

echo "Starting Football Manager Development Environment..."
echo ""

docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --parallel
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "Services starting up..."
echo ""
echo "Frontend: http://localhost:3000"
echo "API Gateway: http://localhost:3001"
echo "MongoDB: mongodb://localhost:27017"
echo "Redis: redis://localhost:6379"
echo "RabbitMQ Management: http://localhost:15672"
echo ""
echo "To view logs, run: docker-compose -f docker-compose.dev.yml logs -f"
echo "To stop all services, run: docker-compose -f docker-compose.dev.yml down"
