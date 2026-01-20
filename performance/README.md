# Performance Testing Suite

This directory contains load testing scripts and scenarios for the Football Manager application using k6.

## Directory Structure

```
performance/
├── load-tests/
│   ├── api-load-test.js              # General API load testing
│   ├── match-simulation-test.js     # Match simulation load testing
│   ├── websocket-load-test.js       # WebSocket connection load testing
│   └── scenarios/
│       ├── concurrent-login.js      # Concurrent user login test (100 users)
│       ├── api-throughput.js        # API endpoints throughput (1000 req/min)
│       ├── database-performance.js  # Database query performance
│       └── simultaneous-matches.js  # Match simulation load (10 simultaneous matches)
├── scripts/
│   └── run-load-tests.sh            # Script to run all load tests
└── reports/                          # Directory for test reports
```

## Prerequisites

1. **Install k6**: Follow instructions at https://k6.io/docs/getting-started/installation/

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Ensure services are running** on:
   - API Gateway: http://localhost:3001
   - MongoDB: localhost:27017
   - Redis: localhost:6379
   - RabbitMQ: localhost:5672

## Environment Variables

Configure environment variables before running tests:

```bash
export API_BASE_URL="http://localhost:3001/api"
export WS_BASE_URL="ws://localhost:3001"
export AUTH_TOKEN="your-auth-token"
```

## Running Tests

### Interactive Mode

Run the script without arguments to see a menu:

```bash
./performance/scripts/run-load-tests.sh
```

### Command Line Mode

Run specific tests:

```bash
# Run all tests
./performance/scripts/run-load-tests.sh all

# Run API load test
./performance/scripts/run-load-tests.sh api

# Run match simulation test
./performance/scripts/run-load-tests.sh match

# Run WebSocket load test
./performance/scripts/run-load-tests.sh websocket
```

### Run Individual Tests

You can also run individual k6 test files directly:

```bash
cd performance/load-tests

k6 run api-load-test.js
k6 run match-simulation-test.js
k6 run websocket-load-test.js
k6 run scenarios/concurrent-login.js
k6 run scenarios/api-throughput.js
k6 run scenarios/database-performance.js
k6 run scenarios/simultaneous-matches.js
```

## Test Scenarios

### 1. Concurrent User Login (100 users)
- **File**: `scenarios/concurrent-login.js`
- **Objective**: Test concurrent user registration and login
- **Metrics**: Login success rate, response time, error rate
- **Thresholds**: p(95) < 1000ms, error rate < 2%

### 2. API Endpoints Throughput (1000 req/min)
- **File**: `scenarios/api-throughput.js`
- **Objective**: Sustained API throughput testing
- **Metrics**: Requests per minute, response time, error rate
- **Thresholds**: p(95) < 300ms, error rate < 1%

### 3. Match Simulation Load (10 simultaneous matches)
- **File**: `scenarios/simultaneous-matches.js`
- **Objective**: Test concurrent match simulations
- **Metrics**: Simulation time, success rate, resource utilization
- **Thresholds**: p(95) < 3000ms, error rate < 3%

### 4. WebSocket Connections (50 concurrent connections)
- **File**: `websocket-load-test.js`
- **Objective**: Test WebSocket connection stability and message handling
- **Metrics**: Connection time, message latency, active connections
- **Thresholds**: Connection time p(95) < 1000ms, error rate < 5%

### 5. Database Query Performance
- **File**: `scenarios/database-performance.js`
- **Objective**: Test complex database queries under load
- **Metrics**: Query response time, pagination performance, error rate
- **Thresholds**: p(95) < 200ms, error rate < 1%

## Test Reports

After running tests, reports are generated in `performance/reports/`:

- **JSON Reports**: Detailed metrics in JSON format
- **HTML Reports**: Visual representation of test results
- **Summary**: `summary_<timestamp>.txt` with overall test results

Example:
```
performance/reports/
├── api-load-test_20240120_143022.json
├── api-load-test_20240120_143022.html
├── match-simulation-test_20240120_143055.json
├── match-simulation-test_20240120_143055.html
└── summary_20240120_143130.txt
```

## Understanding Results

### Key Metrics

- **VUs (Virtual Users)**: Number of concurrent simulated users
- **RPS (Requests Per Second)**: Throughput of API requests
- **Response Time**: Time taken for server to respond
- **Error Rate**: Percentage of failed requests
- **p(95)**: 95th percentile response time (95% of requests are faster)
- **p(99)**: 99th percentile response time

### Thresholds

Each test has defined thresholds for:
- Response time percentiles
- Error rates
- Custom metrics

Tests will fail if thresholds are not met.

## Customizing Tests

### Modify Load Levels

Edit the `options` object in each test file:

```javascript
export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 100,  // Change this
      timeUnit: '1s',
      duration: '5m'
    }
  }
};
```

### Add New Endpoints

Add to the endpoints array in test files:

```javascript
const endpoints = [
  { method: 'GET', path: '/new-endpoint', name: 'New Endpoint' }
];
```

### Modify Thresholds

Update the thresholds object:

```javascript
thresholds: {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.05']
}
```

## Troubleshooting

### k6 not found
```bash
# Install k6
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6

# Or download from https://k6.io
```

### API not responding
- Ensure all services are running: `docker-compose ps`
- Check API Gateway logs: `docker-compose logs api-gateway`
- Verify port 3001 is not in use

### WebSocket connection fails
- Verify WebSocket endpoint is accessible
- Check if authentication token is valid
- Ensure no firewall is blocking the connection

### Tests timeout
- Increase test duration in options
- Check system resources (CPU, RAM)
- Review application logs for bottlenecks

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Performance Tests
  run: |
    export API_BASE_URL=${{ secrets.API_BASE_URL }}
    export AUTH_TOKEN=${{ secrets.AUTH_TOKEN }}
    ./performance/scripts/run-load-tests.sh all
  continue-on-error: true
```

## Best Practices

1. **Run tests in a staging environment** before production
2. **Monitor system resources** during tests (CPU, RAM, Network)
3. **Start with low load** and gradually increase
4. **Compare results** over time to detect performance regressions
5. **Use realistic data** for accurate testing
6. **Document baseline metrics** for comparison

## Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/test-automation/)
