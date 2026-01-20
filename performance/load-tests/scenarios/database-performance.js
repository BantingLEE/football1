import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001/api';

const errorRate = new Rate('db_errors');
const queryTime = new Trend('db_query_time');
const queriesExecuted = new Counter('queries_executed');

export const options = {
  scenarios: {
    constant_queries: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '10m',
      preAllocatedVUs: 20,
      maxVUs: 100
    },
    query_spike: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 200,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '2m', target: 10 }
      ]
    },
    stress_queries: {
      executor: 'constant-arrival-rate',
      rate: 200,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 100,
      maxVUs: 300,
      startTime: '10m'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    db_errors: ['rate<0.01'],
    db_query_time: ['p(95)<200']
  }
};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${__ENV.AUTH_TOKEN || 'test-token'}`
};

const complexQueries = [
  {
    path: '/clubs',
    name: 'Get All Clubs with Pagination',
    params: '?page=1&limit=50&sort=name'
  },
  {
    path: '/matches',
    name: 'Get Matches with Filters',
    params: '?status=completed&limit=100'
  },
  {
    path: '/matches/league/507f1f77bcf86cd799439011',
    name: 'Get League Matches',
    params: '?limit=50'
  },
  {
    path: '/players',
    name: 'Get All Players',
    params: '?position=Midfielder&limit=100'
  },
  {
    path: '/players/club/507f1f77bcf86cd799439011',
    name: 'Get Club Players',
    params: '?limit=25&sort=rating'
  }
];

export default function() {
  const query = complexQueries[Math.floor(Math.random() * complexQueries.length)];

  const reqStart = new Date().getTime();
  const res = http.get(`${BASE_URL}${query.path}${query.params}`, { headers });
  const reqDuration = new Date().getTime() - reqStart;

  queryTime.add(reqDuration);
  queriesExecuted.add(1);

  const success = check(res, {
    [`${query.name} status is 200`]: (r) => r.status === 200,
    [`${query.name} response time < 200ms`]: () => reqDuration < 200,
    [`${query.name} has data array`]: (r) => {
      try {
        const data = r.json();
        return Array.isArray(data) || (data.data && Array.isArray(data.data));
      } catch (e) {
        return false;
      }
    },
    [`${query.name} pagination works`]: (r) => {
      try {
        const data = r.json();
        if (data.page !== undefined && data.limit !== undefined) {
          return data.page >= 1 && data.limit > 0;
        }
        return true;
      } catch (e) {
        return false;
      }
    }
  });

  errorRate.add(!success);

  if (!success) {
    console.log(`Failed query: ${query.name} - Duration: ${reqDuration}ms - Status: ${res.status}`);
  }

  sleep(Math.random() * 0.3 + 0.1);
}

export function teardown(data) {
  console.log(`Total queries executed: ${queriesExecuted}`);
}
