import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001/api';

const errorRate = new Rate('errors');
const matchResponseTime = new Trend('match_response_time');
const matchesSimulated = new Counter('matches_simulated');

export const options = {
  scenarios: {
    concurrent_matches: {
      executor: 'constant-vus',
      vus: 10,
      duration: '10m',
      startTime: '0s'
    },
    ramping_matches: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 5 },
        { duration: '3m', target: 10 },
        { duration: '3m', target: 10 },
        { duration: '2m', target: 0 }
      ],
      startTime: '0s'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.03'],
    errors: ['rate<0.03']
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

  const authHeaders = {
    ...headers,
    'Authorization': authToken
  };

  const matchRes = http.post(`${BASE_URL}/matches`, JSON.stringify({
    homeClubId: '507f1f77bcf86cd799439011',
    awayClubId: '507f1f77bcf86cd799439012',
    leagueId: '507f1f77bcf86cd799439013',
    scheduledDate: new Date().toISOString()
  }), { headers: authHeaders });

  let matches = [];
  if (matchRes.status === 201) {
    matches.push(matchRes.json('_id'));
  }

  for (let i = 0; i < 10; i++) {
    const res = http.post(`${BASE_URL}/matches`, JSON.stringify({
      homeClubId: `507f1f77bcf86cd799439${String(i).padStart(3, '0')}`,
      awayClubId: `507f1f77bcf86cd799439${String(i + 10).padStart(3, '0')}`,
      leagueId: '507f1f77bcf86cd799439013',
      scheduledDate: new Date().toISOString()
    }), { headers: authHeaders });

    if (res.status === 201) {
      matches.push(res.json('_id'));
    }
  }

  return { token: authToken, matches: matches };
}

export default function(data) {
  const authHeaders = {
    ...headers,
    'Authorization': data.token
  };

  if (data.matches.length === 0) {
    console.log('No matches available for simulation');
    return;
  }

  const matchId = data.matches[Math.floor(Math.random() * data.matches.length)];

  const startRes = http.post(`${BASE_URL}/matches/${matchId}/start`, null, {
    headers: authHeaders
  });

  const startSuccess = check(startRes, {
    'Start match status is 200': (r) => r.status === 200
  });

  if (startSuccess) {
    sleep(1);

    const simRes = http.post(`${BASE_URL}/matches/${matchId}/simulate`, null, {
      headers: authHeaders
    });

    matchResponseTime.add(simRes.timings.duration);

    const simSuccess = check(simRes, {
      'Simulate match status is 200': (r) => r.status === 200,
      'Match has score': (r) => {
        try {
          return r.json('homeScore') !== undefined && r.json('awayScore') !== undefined;
        } catch (e) {
          return false;
        }
      },
      'Simulation time < 2000ms': (r) => r.timings.duration < 2000
    });

    if (simSuccess) {
      matchesSimulated.add(1);
    }

    errorRate.add(!simSuccess);
  } else {
    errorRate.add(!startSuccess);
  }

  sleep(Math.random() * 5 + 2);
}

export function teardown(data) {
  console.log(`Total matches simulated: ${matchesSimulated}`);
}
