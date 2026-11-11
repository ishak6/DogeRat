"use strict";

const express = require("express");
const path = require("node:path");
const basicAuth = require("express-basic-auth");
const { safeCompare } = basicAuth;
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DASHBOARD_USER = process.env.DASHBOARD_USER;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;

if (!DASHBOARD_USER || !DASHBOARD_PASSWORD || DASHBOARD_PASSWORD.length < 20) {
  console.error("Set DASHBOARD_USER and DASHBOARD_PASSWORD (minimum 20 characters) in the hosting provider environment.");
  process.exit(1);
}

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  referrerPolicy: { policy: "no-referrer" }
}));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "safe-status-dashboard" });
});

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again later." }
}));

app.use(basicAuth({
  authorizer: (username, password) =>
    safeCompare(username, DASHBOARD_USER) && safeCompare(password, DASHBOARD_PASSWORD),
  authorizeAsync: false,
  challenge: true,
  realm: "Safe Status Dashboard"
}));

app.get("/api/status", (_req, res) => {
  const memory = process.memoryUsage();
  res.set("Cache-Control", "no-store");
  res.json({
    service: "Safe Status Dashboard",
    status: "online",
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    memoryBytes: {
      rss: memory.rss,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal
    },
    checkedAt: new Date().toISOString()
  });
});

app.use(express.static(path.join(__dirname, "public"), {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => res.set("Cache-Control", "no-store")
}));

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Safe Status Dashboard listening on port ${PORT}`);
});
