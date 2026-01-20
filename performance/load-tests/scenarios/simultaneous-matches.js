import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001/api';

const errorRate = new Rate('match_errors');
const matchSimulationTime = new Trend('match_simulation_time');

export const options = {
  scenarios: {
    simultaneous_matches: {
      executor: 'constant-vus',
      vus: 10,
      duration: '15m',
      startTime: '0s'
    },
    ramping_matches: {
      executor: 'ramping-vus',
      startVUs: 2,
      stages: [
        { duration: '3m', target: 5 },
        { duration: '5m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 2 }
      ],
      startTime: '0s'
    },
    match_stress: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m',
      startTime: '15m'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    http_req_failed: ['rate<0.03'],
    match_errors: ['rate<0.03'],
    match_simulation_time: ['p(95)<3000']
  }
};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${__ENV.AUTH_TOKEN || 'test-token'}`
};

export function setup() {
  const authHeaders = {
    ...headers
  };

  const matchIds = [];

  for (let i = 0; i < 20; i++) {
    const matchRes = http.post(`${BASE_URL}/matches`, JSON.stringify({
      homeClubId: `507f1f77bcf86cd799439${String(i).padStart(3, '0')}`,
      awayClubId: `507f1f77bcf86cd799439${String(i + 20).padStart(3, '0')}`,
      leagueId: '507f1f77bcf86cd799439013',
      scheduledDate: new Date().toISOString()
    }), { headers: authHeaders });

    if (matchRes.status === 201) {
      matchIds.push(matchRes.json('_id'));
    }
  }

  return { matchIds: matchIds };
}

export default function(data) {
  if (data.matchIds.length === 0) {
    console.log('No match IDs available');
    return;
  }

  const matchId = data.matchIds[Math.floor(Math.random() * data.matchIds.length)];

  const startRes = http.post(`${BASE_URL}/matches/${matchId}/start`, null, {
    headers: headers
  });

  if (startRes.status === 200) {
    sleep(0.5);

    const simStart = new Date().getTime();
    const simRes = http.post(`${BASE_URL}/matches/${matchId}/simulate`, null, {
      headers: headers
    });
    const simDuration = new Date().getTime() - simStart;

    matchSimulationTime.add(simDuration);

    const success = check(simRes, {
      'Simulation status is 200': (r) => r.status === 200,
      'Simulation has homeScore': (r) => r.json('homeScore') !== undefined,
      'Simulation has awayScore': (r) => r.json('awayScore') !== undefined,
      'Simulation has events': (r) => r.json('events') !== undefined,
      'Simulation time < 3000ms': () => simDuration < 3000,
      'Scores are valid': (r) => {
        const home = r.json('homeScore');
        const away = r.json('awayScore');
        return typeof home === 'number' && typeof away === 'number' && home >= 0 && away >= 0;
      }
    });

    errorRate.add(!success);

    if (success) {
      console.log(`Match ${matchId} simulated - Score: ${simRes.json('homeScore')}-${simRes.json('awayScore')} - Time: ${simDuration}ms`);
    }
  } else {
    errorRate.add(1);
    console.log(`Failed to start match ${matchId}`);
  }

  sleep(Math.random() * 5 + 3);
}
