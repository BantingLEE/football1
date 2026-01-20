#!/bin/bash

set -e

NAMESPACE="football-manager"
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
  "frontend"
)

INFRA_SERVICES=(
  "mongodb"
  "redis"
  "rabbitmq"
)

echo "=== Football Manager Health Check Script ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service_health() {
  local service=$1
  local namespace=$2
  
  echo -n "Checking ${service}... "
  
  # Check if deployment exists
  if ! kubectl get deployment ${service} -n ${namespace} &> /dev/null; then
    echo -e "${RED}NOT FOUND${NC}"
    return 1
  fi
  
  # Get ready replicas
  local ready_replicas=$(kubectl get deployment ${service} -n ${namespace} -o jsonpath='{.status.readyReplicas}')
  local desired_replicas=$(kubectl get deployment ${service} -n ${namespace} -o jsonpath='{.spec.replicas}')
  
  if [ "${ready_replicas}" = "${desired_replicas}" ]; then
    echo -e "${GREEN}OK${NC} (${ready_replicas}/${desired_replicas} ready)"
    return 0
  else
    echo -e "${YELLOW}NOT READY${NC} (${ready_replicas}/${desired_replicas} ready)"
    return 1
  fi
}

# Function to check pod status
check_pods() {
  local service=$1
  local namespace=$2
  
  local pods=$(kubectl get pods -n ${namespace} -l app=${service} -o jsonpath='{.items[*].metadata.name}')
  
  if [ -z "$pods" ]; then
    echo -e "  ${RED}No pods found${NC}"
    return 1
  fi
  
  for pod in $pods; do
    local status=$(kubectl get pod ${pod} -n ${namespace} -o jsonpath='{.status.phase}')
    local restarts=$(kubectl get pod ${pod} -n ${namespace} -o jsonpath='{.status.containerStatuses[0].restartCount}')
    
    if [ "$status" = "Running" ]; then
      if [ "$restarts" -eq "0" ]; then
        echo -e "  ${GREEN}✓${NC} ${pod} (Running, 0 restarts)"
      elif [ "$restarts" -lt "5" ]; then
        echo -e "  ${YELLOW}⚠${NC} ${pod} (Running, ${restarts} restarts)"
      else
        echo -e "  ${RED}✗${NC} ${pod} (Running, ${restarts} restarts)"
      fi
    else
      echo -e "  ${RED}✗${NC} ${pod} (${status})"
    fi
  done
}

# Function to check service endpoint
check_endpoint() {
  local service=$1
  local namespace=$2
  local port=$3
  
  echo -n "  Checking endpoint... "
  
  # Get the service
  if ! kubectl get svc ${service} -n ${namespace} &> /dev/null; then
    echo -e "${RED}NOT FOUND${NC}"
    return 1
  fi
  
  # Check if service has endpoints
  local endpoints=$(kubectl get endpoints ${service} -n ${namespace} -o jsonpath='{.subsets[*].addresses[*].ip}')
  
  if [ -z "$endpoints" ]; then
    echo -e "${RED}NO ENDPOINTS${NC}"
    return 1
  fi
  
  echo -e "${GREEN}OK${NC}"
}

# Check if namespace exists
echo "Checking namespace..."
if ! kubectl get namespace ${NAMESPACE} &> /dev/null; then
  echo -e "${RED}Namespace ${NAMESPACE} not found${NC}"
  exit 1
fi
echo -e "${GREEN}Namespace ${NAMESPACE} found${NC}"
echo ""

# Check infrastructure services
echo "=== Infrastructure Services ==="
for service in "${INFRA_SERVICES[@]}"; do
  check_service_health ${service} ${NAMESPACE}
  check_pods ${service} ${NAMESPACE}
  echo ""
done

# Check application services
echo "=== Application Services ==="
for service in "${SERVICES[@]}"; do
  check_service_health ${service} ${NAMESPACE}
  check_pods ${service} ${NAMESPACE}
  echo ""
done

# Check HPA status
echo "=== Horizontal Pod Autoscalers ==="
kubectl get hpa -n ${NAMESPACE}
echo ""

# Check resource usage
echo "=== Resource Usage ==="
kubectl top pods -n ${NAMESPACE} 2>/dev/null || echo "Metrics server not available"
echo ""

# Check events for namespace
echo "=== Recent Events (Last Hour) ==="
kubectl get events -n ${NAMESPACE} --field-selector type=Warning --sort-by='.lastTimestamp' | tail -10
echo ""

# Summary
echo "=== Summary ==="
TOTAL_SERVICES=$((${#SERVICES[@]} + ${#INFRA_SERVICES[@]}))
READY_COUNT=0

for service in "${INFRA_SERVICES[@]}"; do
  local ready_replicas=$(kubectl get deployment ${service} -n ${NAMESPACE} -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  local desired_replicas=$(kubectl get deployment ${service} -n ${NAMESPACE} -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")
  if [ "${ready_replicas}" = "${desired_replicas}" ]; then
    READY_COUNT=$((READY_COUNT + 1))
  fi
done

for service in "${SERVICES[@]}"; do
  local ready_replicas=$(kubectl get deployment ${service} -n ${NAMESPACE} -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  local desired_replicas=$(kubectl get deployment ${service} -n ${NAMESPACE} -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "2")
  if [ "${ready_replicas}" = "${desired_replicas}" ]; then
    READY_COUNT=$((READY_COUNT + 1))
  fi
done

echo "Services Ready: ${READY_COUNT}/${TOTAL_SERVICES}"

if [ ${READY_COUNT} -eq ${TOTAL_SERVICES} ]; then
  echo -e "${GREEN}All services are healthy!${NC}"
  exit 0
else
  echo -e "${YELLOW}Some services are not ready. Check the output above for details.${NC}"
  exit 1
fi
