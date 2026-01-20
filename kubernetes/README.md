# Kubernetes Manifests

This directory contains all Kubernetes manifests for deploying the Football Manager application.

## Directory Structure

```
kubernetes/
├── namespace.yaml           # Namespace definition
├── configmaps/             # Environment variable configuration
├── secrets/                # Sensitive data (passwords, API keys)
├── services/               # Kubernetes Services (network endpoints)
├── deployments/            # Deployments (pods management)
├── hpa/                    # Horizontal Pod Autoscalers
├── ingress.yaml            # Ingress configuration
├── pv-pvc.yaml             # Persistent Volumes and Claims
└── kustomization.yaml      # Kustomize configuration
```

## Quick Start

### Using Kustomize (Recommended)

```bash
kubectl apply -k kubernetes/
```

### Manual Application

```bash
# Apply all manifests in order
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmaps/
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/pv-pvc.yaml
kubectl apply -f kubernetes/services/
kubectl apply -f kubernetes/deployments/
kubectl apply -f kubernetes/hpa/
kubectl apply -f kubernetes/ingress.yaml
```

## Components

### Namespace
- **Name**: `football-manager`
- All resources are deployed in this namespace

### ConfigMaps
Environment configuration for each service:
- `api-gateway-config`
- `club-service-config`
- `player-service-config`
- `match-service-config`
- `economy-service-config`
- `youth-service-config`
- `league-service-config`
- `message-service-config`
- `notification-service-config`
- `frontend-config`

### Secrets
Sensitive data (must be updated before deployment):
- `mongodb-secret`: MongoDB credentials
- `rabbitmq-secret`: RabbitMQ credentials
- `jwt-secret`: JWT signing secret
- `api-keys-secret`: API keys (OpenAI, etc.)

**IMPORTANT**: Update all `CHANGE_ME` values with actual secrets before deploying.

### Services
Kubernetes services for network communication:
- `api-gateway-service`: Port 3001
- `club-service`: Port 3002
- `player-service`: Port 3003
- `match-service`: Port 3004
- `economy-service`: Port 3005
- `youth-service`: Port 3006
- `league-service`: Port 3007
- `message-service`: Port 3008
- `notification-service`: Port 3009
- `frontend-service`: Port 3000 (LoadBalancer)
- `mongodb-service`: Port 27017
- `redis-service`: Port 6379
- `rabbitmq-service`: Ports 5672 (AMQP), 15672 (Management)

### Deployments
Application and infrastructure deployments with:
- Resource requests and limits
- Liveness and readiness probes
- Rolling update strategy
- Environment variables from ConfigMaps and Secrets

### Horizontal Pod Autoscalers (HPA)
Automatic scaling based on CPU and memory:
- **API Gateway**: 2-10 replicas
- **Services**: 2-5 replicas
- **Frontend**: 2-8 replicas
- **CPU Threshold**: 70%
- **Memory Threshold**: 80%

### Ingress
External access configuration:
- **Ingress Controller**: nginx
- **Host**: `football-manager.local` (update for your domain)
- **Routes**:
  - `/api` → api-gateway-service:3001
  - `/` → frontend-service:3000

### Persistent Volumes
Storage for databases:
- **MongoDB**: 10Gi (read-write-once)
- **Redis**: 5Gi (read-write-once)

Note: Update `pv-pvc.yaml` with your storage class for production.

## Deployment Steps

1. **Update Secrets**
   ```bash
   nano kubernetes/secrets/*.yaml
   # Replace CHANGE_ME with actual values
   ```

2. **Deploy to Kubernetes**
   ```bash
   ./deployment/deploy.sh
   # or
   kubectl apply -k kubernetes/
   ```

3. **Verify Deployment**
   ```bash
   ./deployment/health-check.sh
   # or
   kubectl get pods -n football-manager
   ```

## Resource Limits

### Application Services
- **Requests**: 100m CPU, 128Mi memory
- **Limits**: 500m CPU, 256Mi memory

### Infrastructure Services
- **MongoDB**: 200m-1000m CPU, 256Mi-1Gi memory
- **Redis**: 100m-500m CPU, 64Mi-256Mi memory
- **RabbitMQ**: 100m-500m CPU, 128Mi-512Mi memory

## Health Checks

All services have health checks configured:

### Liveness Probes
- **API Gateway**: `/health` after 30s
- **Services**: `/health` after 30s
- **MongoDB**: `db.adminCommand('ping')`
- **Redis**: `redis-cli ping`
- **RabbitMQ**: `rabbitmq-diagnostics ping`

### Readiness Probes
- **API Gateway**: `/ready` after 10s
- **Services**: `/ready` after 10s
- **Infrastructure**: Same as liveness

## Rolling Updates

All deployments use rolling update strategy:
- **Max Surge**: 1
- **Max Unavailable**: 1

This ensures zero downtime during deployments.

## Scaling

### Manual Scaling
```bash
kubectl scale deployment api-gateway --replicas=5 -n football-manager
```

### Auto-Scaling
```bash
# Check HPA status
kubectl get hpa -n football-manager

# Update HPA
kubectl edit hpa api-gateway-hpa -n football-manager
```

## Troubleshooting

### View Logs
```bash
kubectl logs -f deployment/api-gateway -n football-manager
kubectl logs <pod-name> -n football-manager --previous
```

### Describe Resources
```bash
kubectl describe pod <pod-name> -n football-manager
kubectl describe deployment api-gateway -n football-manager
```

### Port Forwarding
```bash
kubectl port-forward svc/api-gateway-service 3001:3001 -n football-manager
```

### Rollback
```bash
kubectl rollout undo deployment api-gateway -n football-manager
kubectl rollout history deployment api-gateway -n football-manager
```

## Cleanup

```bash
kubectl delete namespace football-manager
# or
kubectl delete -k kubernetes/
```

## Production Checklist

- [ ] Update all secrets with strong passwords
- [ ] Configure appropriate storage class in `pv-pvc.yaml`
- [ ] Update Ingress host with actual domain
- [ ] Configure TLS/SSL for Ingress
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy for MongoDB
- [ ] Review and adjust resource limits based on actual usage
- [ ] Enable RBAC for namespace
- [ ] Configure network policies
- [ ] Set up pod disruption budgets
- [ ] Configure proper node affinity/anti-affinity
