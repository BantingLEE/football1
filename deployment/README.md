# Deployment Guide

This guide explains how to deploy the Football Manager application to Kubernetes.

## Prerequisites

- Kubernetes cluster (v1.25+)
- kubectl configured with cluster access
- Docker installed
- Helm (optional, for Ingress Controller)
- GitHub Container Registry access or private registry

## Infrastructure Components

### Services

The application consists of the following microservices:

- **api-gateway** (Port 3001): API gateway and reverse proxy
- **club-service** (Port 3002): Club management service
- **player-service** (Port 3003): Player management service
- **match-service** (Port 3004): Match simulation service
- **economy-service** (Port 3005): Economy and finance service
- **youth-service** (Port 3006): Youth academy service
- **league-service** (Port 3007): League management service
- **message-service** (Port 3008): Messaging service
- **notification-service** (Port 3009): Notification service
- **frontend** (Port 3000): Next.js frontend application

### Infrastructure Services

- **MongoDB** (Port 27017): Document database
- **Redis** (Port 6379): Caching and session storage
- **RabbitMQ** (Port 5672, 15672): Message broker for async tasks

## Local Development

### Using Docker Compose

```bash
# Copy environment file
cp .env.example .env

# Update .env with your values
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl apply -f kubernetes/namespace.yaml
```

### 2. Create Secrets

Before deploying, update the secret files with your actual values:

```bash
# Edit secrets
nano kubernetes/secrets/mongodb-secret.yaml
nano kubernetes/secrets/rabbitmq-secret.yaml
nano kubernetes/secrets/jwt-secret.yaml
nano kubernetes/secrets/api-keys-secret.yaml

# Apply secrets
kubectl apply -f kubernetes/secrets/
```

**Important:** Replace `CHANGE_ME` with secure, randomly generated passwords and keys.

### 3. Create ConfigMaps

```bash
kubectl apply -f kubernetes/configmaps/
```

### 4. Create Persistent Volumes

For production, update `kubernetes/pv-pvc.yaml` with your actual storage class:

```bash
kubectl apply -f kubernetes/pv-pvc.yaml
```

### 5. Deploy Infrastructure Services

```bash
kubectl apply -f kubernetes/services/mongodb-service.yaml
kubectl apply -f kubernetes/services/redis-service.yaml
kubectl apply -f kubernetes/services/rabbitmq-service.yaml

kubectl apply -f kubernetes/deployments/mongodb-deployment.yaml
kubectl apply -f kubernetes/deployments/redis-deployment.yaml
kubectl apply -f kubernetes/deployments/rabbitmq-deployment.yaml
```

Wait for infrastructure services to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=mongodb -n football-manager --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n football-manager --timeout=300s
kubectl wait --for=condition=ready pod -l app=rabbitmq -n football-manager --timeout=300s
```

### 6. Deploy Application Services

```bash
# Deploy all services
kubectl apply -f kubernetes/services/
kubectl apply -f kubernetes/deployments/

# Deploy HPA
kubectl apply -f kubernetes/hpa/

# Deploy Ingress
kubectl apply -f kubernetes/ingress.yaml
```

### 7. Verify Deployment

```bash
# Check all pods
kubectl get pods -n football-manager

# Check services
kubectl get services -n football-manager

# Check HPA status
kubectl get hpa -n football-manager

# View logs
kubectl logs -f deployment/api-gateway -n football-manager
```

### 8. Access Application

If using LoadBalancer:

```bash
kubectl get svc frontend-service -n football-manager
```

If using Ingress:

```bash
# Add entry to /etc/hosts
echo "<INGRESS_IP> football-manager.local" | sudo tee -a /etc/hosts

# Access at http://football-manager.local
```

## CI/CD Pipeline

### Setup GitHub Actions

1. Fork/clone the repository
2. Enable GitHub Actions in repository settings
3. Configure secrets:
   - `KUBE_CONFIG`: Base64-encoded kubeconfig file
   - `GITHUB_TOKEN`: Automatically provided by GitHub

### Deployment Workflow

The CI/CD pipeline includes:

1. **CI Workflow** (runs on PR and push)
   - Linting and type checking
   - Running tests
   - Security scanning with Trivy

2. **Deploy Workflow** (runs on push to main)
   - Building Docker images for all services
   - Pushing images to registry
   - Deploying to Kubernetes
   - Health checks
   - Automatic rollback on failure

### Manual Deployment

```bash
# Trigger deployment manually
gh workflow run deploy.yml
```

## Health Checks

Run the health check script to verify all services:

```bash
chmod +x deployment/health-check.sh
./deployment/health-check.sh
```

## Scaling

### Manual Scaling

```bash
# Scale specific service
kubectl scale deployment api-gateway --replicas=5 -n football-manager

# Scale all services
kubectl scale deployment --all --replicas=3 -n football-manager
```

### Auto-Scaling

HPA is configured for all services:
- **Minimum replicas**: 2
- **Maximum replicas**: 5-10 (depending on service)
- **CPU threshold**: 70%
- **Memory threshold**: 80%

Update HPA settings:

```bash
kubectl edit hpa api-gateway-hpa -n football-manager
```

## Monitoring and Logs

### View Logs

```bash
# All pods in namespace
kubectl logs -l app=api-gateway -n football-manager

# Specific pod
kubectl logs <pod-name> -n football-manager

# Follow logs
kubectl logs -f deployment/api-gateway -n football-manager

# Previous pod (if rolled out)
kubectl logs <pod-name> --previous -n football-manager
```

### Port Forwarding (Debugging)

```bash
# Forward API Gateway
kubectl port-forward svc/api-gateway-service 3001:3001 -n football-manager

# Forward MongoDB
kubectl port-forward svc/mongodb-service 27017:27017 -n football-manager

# Forward RabbitMQ Management
kubectl port-forward svc/rabbitmq-service 15672:15672 -n football-manager
```

## Troubleshooting

### Common Issues

**Pods stuck in Pending state:**
```bash
kubectl describe pod <pod-name> -n football-manager
# Check resource requests and node capacity
```

**Container restarts:**
```bash
kubectl logs <pod-name> -n football-manager --previous
# Check for application errors, missing environment variables
```

**DNS resolution issues:**
```bash
kubectl run test --image=busybox -it --rm --restart=Never -- nslookup api-gateway-service.football-manager.svc.cluster.local
```

**Persistent volume issues:**
```bash
kubectl describe pv mongodb-pv
kubectl describe pvc mongodb-pvc -n football-manager
```

### Rollback

```bash
# Rollback to previous revision
kubectl rollout undo deployment api-gateway -n football-manager

# Rollback to specific revision
kubectl rollout undo deployment api-gateway -n football-manager --to-revision=2

# View rollout history
kubectl rollout history deployment api-gateway -n football-manager
```

## Maintenance

### Update ConfigMaps

```bash
# Edit config
kubectl edit configmap api-gateway-config -n football-manager

# Force pod restart to pick up changes
kubectl rollout restart deployment api-gateway -n football-manager
```

### Update Secrets

```bash
# Create new secret file
kubectl apply -f kubernetes/secrets/mongodb-secret.yaml

# Force pod restart
kubectl rollout restart deployment club-service -n football-manager
```

### Drain Node (Maintenance)

```bash
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# After maintenance
kubectl uncordon <node-name>
```

## Production Recommendations

1. **Security**
   - Use strong passwords in secrets
   - Enable RBAC
   - Use network policies
   - Enable Pod Security Policies
   - Use image scanning

2. **High Availability**
   - Use StatefulSets for databases with proper replication
   - Deploy across multiple availability zones
   - Configure pod disruption budgets

3. **Monitoring**
   - Install Prometheus and Grafana
   - Set up alerts for pod restarts, high CPU/memory
   - Monitor HPA scaling events

4. **Backup**
   - Regular MongoDB backups
   - Backup Redis snapshots
   - Document disaster recovery procedures

5. **Performance**
   - Tune resource requests/limits based on actual usage
   - Configure horizontal pod autoscaling thresholds
   - Use proper node affinity/anti-affinity

## Cleanup

```bash
# Delete all resources
kubectl delete namespace football-manager

# Or delete individual resources
kubectl delete -f kubernetes/
```

## Support

For issues or questions, please check:
- Kubernetes logs: `kubectl logs`
- Service health: `./deployment/health-check.sh`
- Documentation: See `docs/` directory
