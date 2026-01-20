import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001/api';

const errorRate = new Rate('throughput_errors');
const throughputTrend = new Trend('throughput_response_time');
const requestsCounter = new Counter('total_requests');

export const options = {
  scenarios: {
    sustained_throughput: {
      executor: 'constant-arrival-rate',
      rate: 1000 / 60,
      timeUnit: '1s',
      duration: '10m',
      preAllocatedVUs: 100,
      maxVUs: 300
    },
    ramping_throughput: {
      executor: 'ramping-arrival-rate',
      startRate: 100 / 60,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 300,
      stages: [
        { duration: '2m', target: 500 / 60 },
        { duration: '3m', target: 1000 / 60 },
        { duration: '3m', target: 1000 / 60 },
        { duration: '2m', target: 100 / 60 }
      ]
    },
    stress_test: {
      executor: 'constant-arrival-rate',
      rate: 2000 / 60,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 200,
      maxVUs: 500,
      startTime: '10m'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    throughput_errors: ['rate<0.01']
  }
};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${__ENV.AUTH_TOKEN || 'test-token'}`
};

const endpoints = [
  { method: 'GET', path: '/clubs', name: 'Get Clubs' },
  { method: 'GET', path: '/clubs/507f1f77bcf86cd799439011', name: 'Get Single Club' },
  { method: 'GET', path: '/matches', name: 'Get Matches' },
  { method: 'GET', path: '/matches/league/507f1f77bcf86cd799439011', name: 'Get League Matches' },
  { method: 'GET', path: '/matches/507f1f77bcf86cd799439011', name: 'Get Match Details' },
  { method: 'GET', path: '/players', name: 'Get Players' },
  { method: 'GET', path: '/players/club/507f1f77bcf86cd799439011', name: 'Get Club Players' }
];

export default function() {
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  let res;
  const reqStart = new Date().getTime();

  if (endpoint.method === 'GET') {
    res = http.get(`${BASE_URL}${endpoint.path}`, { headers });
  }

  const reqDuration = new Date().getTime() - reqStart;
  throughputTrend.add(reqDuration);
  requestsCounter.add(1);

  const success = check(res, {
    [`${endpoint.name} status is 200`]: (r) => r.status === 200,
    [`${endpoint.name} response time < 300ms`]: () => reqDuration < 300,
    [`${endpoint.name} has data`]: (r) => {
      try {
        return r.json() !== null && r.json() !== undefined;
      } catch (e) {
        return false;
      }
    }
  });

  errorRate.add(!success);

  if (!success) {
    console.log(`Failed request: ${endpoint.method} ${endpoint.path} - Status: ${res.status}`);
  }

  sleep(Math.random() * 0.5);
}
