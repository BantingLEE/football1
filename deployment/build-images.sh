# Build script for all services
#!/bin/bash

set -e

SERVICES=(
  "api-gateway"
  "club-service"
  "player-service"
  "match-service"
  "economy-service"
  "youth-service"
  "league-service"
  "message-service"
  "notification-service"
)

IMAGE_PREFIX="football-manager"
TAG="${1:-latest}"

echo "Building Docker images for Football Manager services..."
echo "Tag: ${TAG}"
echo ""

# Build frontend
echo "Building frontend..."
cd frontend
docker build -t ${IMAGE_PREFIX}/frontend:${TAG} -f Dockerfile .
cd ..
echo "✓ Frontend built"
echo ""

# Build all services
for service in "${SERVICES[@]}"; do
  echo "Building ${service}..."
  cd services/${service}
  npm install
  npm run build
  docker build -t ${IMAGE_PREFIX}/${service}:${TAG} -f Dockerfile.k8s . || docker build -t ${IMAGE_PREFIX}/${service}:${TAG} .
  cd ../..
  echo "✓ ${service} built"
  echo ""
done

echo "All images built successfully!"
echo ""
echo "Images:"
echo "- ${IMAGE_PREFIX}/frontend:${TAG}"
for service in "${SERVICES[@]}"; do
  echo "- ${IMAGE_PREFIX}/${service}:${TAG}"
done
