import { SharedArray } from 'k6/data';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

export const options = {
  scenarios: {
    smoke_test: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      startTime: '0s',
      gracefulStop: '5s'
    },
    load_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 }
      ],
      startTime: '30s',
      gracefulStop: '10s'
    },
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 0 }
      ],
      startTime: '9m',
      gracefulStop: '15s'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['count>100']
  }
};

export const params = {
  timeout: '30s',
  headers: {
    'Content-Type': 'application/json'
  }
};

export const endpoints = {
  clubs: '/clubs',
  players: '/players',
  matches: '/matches',
  leagues: '/leagues',
  economy: '/economy',
  notifications: '/notifications'
};

export const checkSuccess = (response, checks) => {
  const result = check(response, checks);
  return result;
};

export const sleepBetween = (min, max) => {
  sleep(Math.random() * (max - min) + min);
};

export const metrics = {
  successRate: new Rate('success_rate'),
  errorRate: new Rate('error_rate'),
  responseTime: new Trend('response_time'),
  requestCount: new Counter('request_count'),
  activeConnections: new Gauge('active_connections')
};
