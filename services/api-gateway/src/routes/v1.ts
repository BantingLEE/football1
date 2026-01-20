import { Router } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const CLUB_SERVICE_URL =
  process.env.CLUB_SERVICE_URL || "http://localhost:3002";
const PLAYER_SERVICE_URL =
  process.env.PLAYER_SERVICE_URL || "http://localhost:3003";
const MATCH_SERVICE_URL =
  process.env.MATCH_SERVICE_URL || "http://localhost:3004";
const ECONOMY_SERVICE_URL =
  process.env.ECONOMY_SERVICE_URL || "http://localhost:3005";
const LEAGUE_SERVICE_URL =
  process.env.LEAGUE_SERVICE_URL || "http://localhost:3006";
const YOUTH_SERVICE_URL =
  process.env.YOUTH_SERVICE_URL || "http://localhost:3007";
const MESSAGE_SERVICE_URL =
  process.env.MESSAGE_SERVICE_URL || "http://localhost:3008";
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3009";

const proxyOptions: Options = {
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq: any, req: any, res: any) => {
    proxyReq.setHeader("API-Version", req.apiVersion || "1.0.0");
  },
  onError: (err, req, res) => {
    console.error(`Proxy error for ${req.path}: ${err.message}`);
    if (!res.headersSent) {
      res
        .status(503)
        .json({ error: "Service unavailable", message: err.message });
    }
  },
};

router.use(
  "/clubs",
  authMiddleware,
  createProxyMiddleware({
    ...proxyOptions,
    target: CLUB_SERVICE_URL,
    pathRewrite: { "^/api/v1/clubs": "/clubs" },
  }),
);

router.use(
  "/players",
  authMiddleware,
  createProxyMiddleware({
    ...proxyOptions,
    target: PLAYER_SERVICE_URL,
    pathRewrite: { "^/api/v1/players": "/players" },
  }),
);

router.use(
  "/matches",
  authMiddleware,
  createProxyMiddleware({
    ...proxyOptions,
    target: MATCH_SERVICE_URL,
    pathRewrite: { "^/api/v1/matches": "/matches" },
  }),
);

router.use(
  "/economy",
  authMiddleware,
  createProxyMiddleware({
    ...proxyOptions,
    target: ECONOMY_SERVICE_URL,
    pathRewrite: { "^/api/v1/economy": "/economy" },
  }),
);

router.use(
  "/leagues",
  authMiddleware,
  createProxyMiddleware({
    ...proxyOptions,
    target: LEAGUE_SERVICE_URL,
    pathRewrite: { "^/api/v1/leagues": "/leagues" },
  }),
);

router.use(
  "/youth",
  authMiddleware,
  createProxyMiddleware({
    ...proxyOptions,
    target: YOUTH_SERVICE_URL,
    pathRewrite: { "^/api/v1/youth": "/youth" },
  }),
);

router.use(
  "/messages",
  authMiddleware,
  createProxyMiddleware({
    ...proxyOptions,
    target: MESSAGE_SERVICE_URL,
    pathRewrite: { "^/api/v1/messages": "/messages" },
  }),
);

router.use(
  "/notifications",
  authMiddleware,
  createProxyMiddleware({
    ...proxyOptions,
    target: NOTIFICATION_SERVICE_URL,
    pathRewrite: { "^/api/v1/notifications": "/notifications" },
  }),
);

export default router;
