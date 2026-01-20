import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001/api';

const errorRate = new Rate('login_errors');
const loginTime = new Trend('login_time');

export const options = {
  scenarios: {
    concurrent_logins: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 200
    },
    login_spike: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 200,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '2m', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 20 }
      ]
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.02'],
    login_errors: ['rate<0.02'],
    login_time: ['p(95)<1000']
  }
};

const headers = {
  'Content-Type': 'application/json'
};

export default function() {
  const userData = {
    email: `user${Math.floor(Math.random() * 10000)}@example.com`,
    password: 'password123'
  };

  const registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify(userData), { headers });

  if (registerRes.status === 201 || registerRes.status === 409) {
    const loginStart = new Date().getTime();
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: userData.email,
      password: userData.password
    }), { headers });

    const loginDuration = new Date().getTime() - loginStart;
    loginTime.add(loginDuration);

    const success = check(loginRes, {
      'Login status is 200': (r) => r.status === 200,
      'Login has token': (r) => r.json('token') !== undefined,
      'Login has user': (r) => r.json('user') !== undefined,
      'Login time < 1000ms': () => loginDuration < 1000
    });

    errorRate.add(!success);

    if (success) {
      const token = loginRes.json('token');
      const authHeaders = {
        ...headers,
        'Authorization': `Bearer ${token}`
      };

      http.get(`${BASE_URL}/clubs`, { headers: authHeaders });
      http.get(`${BASE_URL}/matches`, { headers: authHeaders });

      sleep(1);
    }
  } else {
    errorRate.add(1);
  }

  sleep(Math.random() * 2);
}
