import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001/api';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 200
    },
    spike_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 500,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '1m', target: 200 },
        { duration: '2m', target: 200 },
        { duration: '1m', target: 50 }
      ]
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.05']
  }
};

const headers = {
  'Content-Type': 'application/json'
};

let authToken = '';

export function setup() {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }), { headers });

  if (loginRes.status === 200) {
    authToken = `Bearer ${loginRes.json('token')}`;
  }

  return { token: authToken };
}

export default function(data) {
  const authHeaders = {
    ...headers,
    'Authorization': data.token || authToken
  };

  const endpoints = [
    { method: 'GET', path: '/clubs', name: 'Get All Clubs' },
    { method: 'GET', path: '/clubs/507f1f77bcf86cd799439011', name: 'Get Club by ID' },
    { method: 'GET', path: '/matches', name: 'Get All Matches' },
    { method: 'GET', path: '/matches/league/507f1f77bcf86cd799439011', name: 'Get Matches by League' },
    { method: 'GET', path: '/players', name: 'Get All Players' }
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  let res;
  if (endpoint.method === 'GET') {
    res = http.get(`${BASE_URL}${endpoint.path}`, { headers: authHeaders });
  } else if (endpoint.method === 'POST') {
    res = http.post(`${BASE_URL}${endpoint.path}`, JSON.stringify({
      name: `Test Club ${Date.now()}`,
      budget: 1000000,
      reputation: 75
    }), { headers: authHeaders });
  }

  responseTime.add(res.timings.duration);

  const success = check(res, {
    [`${endpoint.name} status is 200`]: (r) => r.status === 200,
    [`${endpoint.name} response time < 500ms`]: (r) => r.timings.duration < 500
  });

  errorRate.add(!success);

  sleep(Math.random() * 3);
}

export function teardown(data) {
  console.log('Test completed');
}
