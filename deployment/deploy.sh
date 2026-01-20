# Kubernetes Deployment Script
#!/bin/bash

set -e

NAMESPACE="football-manager"

echo "=== Football Manager Kubernetes Deployment ==="
echo ""

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed"
    exit 1
fi

# Check cluster connection
echo "Checking cluster connection..."
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Cannot connect to Kubernetes cluster"
    exit 1
fi
echo -e "${GREEN}✓${NC} Connected to cluster"
echo ""

# Create namespace
echo "Creating namespace..."
kubectl apply -f kubernetes/namespace.yaml
echo -e "${GREEN}✓${NC} Namespace created"
echo ""

# Apply secrets (prompt for updates)
echo "Checking secrets..."
read -p "Have you updated the secrets with actual values? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please update kubernetes/secrets/*.yaml with actual values before continuing"
    exit 1
fi

kubectl apply -f kubernetes/secrets/
echo -e "${GREEN}✓${NC} Secrets applied"
echo ""

# Apply configmaps
echo "Applying ConfigMaps..."
kubectl apply -f kubernetes/configmaps/
echo -e "${GREEN}✓${NC} ConfigMaps applied"
echo ""

# Apply PV/PVC
echo "Applying Persistent Volumes..."
kubectl apply -f kubernetes/pv-pvc.yaml
echo -e "${GREEN}✓${NC} Persistent volumes applied"
echo ""

# Apply services
echo "Applying Services..."
kubectl apply -f kubernetes/services/
echo -e "${GREEN}✓${NC} Services applied"
echo ""

# Apply infrastructure deployments
echo "Deploying infrastructure services (MongoDB, Redis, RabbitMQ)..."
kubectl apply -f kubernetes/deployments/mongodb-deployment.yaml
kubectl apply -f kubernetes/deployments/redis-deployment.yaml
kubectl apply -f kubernetes/deployments/rabbitmq-deployment.yaml

echo "Waiting for infrastructure services to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=ready pod -l app=rabbitmq -n ${NAMESPACE} --timeout=300s
echo -e "${GREEN}✓${NC} Infrastructure services ready"
echo ""

# Apply application deployments
echo "Deploying application services..."
kubectl apply -f kubernetes/deployments/

echo "Waiting for application services to be ready..."
kubectl wait --for=condition=available deployment api-gateway -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=available deployment frontend -n ${NAMESPACE} --timeout=300s
echo -e "${GREEN}✓${NC} Application services deployed"
echo ""

# Apply HPA
echo "Applying Horizontal Pod Autoscalers..."
kubectl apply -f kubernetes/hpa/
echo -e "${GREEN}✓${NC} HPA applied"
echo ""

# Apply Ingress
echo "Applying Ingress..."
kubectl apply -f kubernetes/ingress.yaml
echo -e "${GREEN}✓${NC} Ingress applied"
echo ""

# Show status
echo "=== Deployment Status ==="
kubectl get pods -n ${NAMESPACE}
echo ""

# Get service endpoints
echo "=== Service Endpoints ==="
kubectl get services -n ${NAMESPACE}
echo ""

# Show HPA status
echo "=== HPA Status ==="
kubectl get hpa -n ${NAMESPACE}
echo ""

# Run health check
echo "Running health check..."
chmod +x deployment/health-check.sh
./deployment/health-check.sh

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "To access the application:"
if command -v minikube &> /dev/null; then
    echo "  Run: minikube tunnel"
    echo "  Access frontend at: http://<EXTERNAL-IP>"
else
    echo "  Check LoadBalancer or Ingress endpoint above"
fi
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/api-gateway -n ${NAMESPACE}"
echo ""
echo "To scale services:"
echo "  kubectl scale deployment api-gateway --replicas=3 -n ${NAMESPACE}"
