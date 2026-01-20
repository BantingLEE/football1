import ws from 'k6/ws';
import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.WS_BASE_URL || 'ws://localhost:3001';

const errorRate = new Rate('errors');
const connectionTime = new Trend('connection_time');
const messageLatency = new Trend('message_latency');
const activeConnections = new Counter('active_connections');
const messagesReceived = new Counter('messages_received');
const messagesSent = new Counter('messages_sent');

export const options = {
  scenarios: {
    constant_connections: {
      executor: 'constant-vus',
      vus: 50,
      duration: '10m',
      gracefulStop: '30s'
    },
    spike_connections: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 25 },
        { duration: '2m', target: 50 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 }
      ],
      gracefulStop: '30s'
    },
    sustained_load: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30m',
      gracefulStop: '1m'
    }
  },
  thresholds: {
    ws_connecting: ['p(95)<1000'],
    ws_session_duration: ['p(95)>60000'],
    errors: ['rate<0.05']
  }
};

let connectionId = 0;

export function setup() {
  return { connectionCounter: 0 };
}

export default function(data) {
  const myConnectionId = ++data.connectionCounter;
  const token = __ENV.AUTH_TOKEN || 'test-token';

  const url = `${BASE_URL}/ws?token=${token}`;

  const res = ws.connect(url, {}, function(socket) {
    const connectStart = new Date().getTime();
    activeConnections.add(1);

    socket.on('open', () => {
      const connectTime = new Date().getTime() - connectStart;
      connectionTime.add(connectTime);

      console.log(`Connection ${myConnectionId} established`);

      socket.send(JSON.stringify({
        type: 'subscribe',
        channel: 'matches',
        matchId: '507f1f77bcf86cd799439011'
      }));

      messagesSent.add(1);

      const pingInterval = setInterval(() => {
        try {
          socket.send(JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
          }));
          messagesSent.add(1);
        } catch (e) {
          clearInterval(pingInterval);
        }
      }, 30000);

      socket.on('message', (message) => {
        messagesReceived.add(1);

        try {
          const data = JSON.parse(message);

          if (data.type === 'pong') {
            const sendTime = new Date(data.timestamp).getTime();
            const receiveTime = new Date().getTime();
            messageLatency.add(receiveTime - sendTime);
          } else if (data.type === 'match_update') {
            check(data, {
              'Match update has matchId': (d) => d.matchId !== undefined,
              'Match update has score': (d) => d.homeScore !== undefined && d.awayScore !== undefined
            });
          }
        } catch (e) {
          errorRate.add(1);
        }
      });

      socket.on('close', () => {
        console.log(`Connection ${myConnectionId} closed`);
        clearInterval(pingInterval);
        activeConnections.add(-1);
      });

      socket.on('error', (e) => {
        console.error(`Connection ${myConnectionId} error:`, e);
        errorRate.add(1);
      });

      socket.setTimeout(() => {
        socket.close();
      }, 300000);

      setInterval(() => {
        try {
          socket.send(JSON.stringify({
            type: 'get_status',
            connectionId: myConnectionId
          }));
          messagesSent.add(1);
        } catch (e) {
        }
      }, 60000);

    });
  });

  check(res, {
    'WebSocket connection successful': (r) => r && r.status === 101,
    'Connection established': (r) => r && r.status === 101
  });

  sleep(1);
}

export function teardown(data) {
  console.log(`Active connections at end: ${activeConnections}`);
  console.log(`Total messages sent: ${messagesSent}`);
  console.log(`Total messages received: ${messagesReceived}`);
}
