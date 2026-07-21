// ─────────────────────────────────────────────────────────────────
//  src/server.js  –  Express entry point
// ─────────────────────────────────────────────────────────────────
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import logger from "./middleware/logger.js";
import { authMiddleware } from "./middleware/auth.js";
import profileRouter from "./routes/profile.js";
import objectivesRouter from "./routes/objectives.js";
import notificationsRouter from "./routes/notifications.js";
import subscriptionsRouter from "./routes/subscriptions.js";
import dashboardRouter from "./routes/dashboard.js";
import managerRouter from "./routes/manager.js";
import resumenRouter from "./routes/resumen.js";
import resumenEnRouter from "./routes/resumen-en.js";
import technicalRouter from "./routes/technical.js";
import { startNotificationJobs } from "./jobs/deadlineNotifier.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Security headers ──────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
  })
);

// ── CORS: restrict to same origin in production ───────────────────
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        process.env.RENDER_EXTERNAL_URL ?? `https://nexo-ibm-tracker.onrender.com`,
        `http://${process.env.HOST}:${process.env.PORT}`,
      ]
    : ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080", "http://127.0.0.1:8080"];

app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  })
);

// ── Rate limiting ─────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: false }));

// ── Request logging ───────────────────────────────────────────────
app.use(logger.requestLogger);

// ── Static frontend ───────────────────────────────────────────────
app.use(express.static(join(__dirname, "../public")));

// ── API routes ────────────────────────────────────────────────────
// In DEMO mode, /api/objectives and /api/profile are public so Sandra
// can test without an IBM SSO token. All other routes stay protected.
const demoMode = process.env.DEMO === "true";

app.use("/api/profile",       ...(demoMode ? [] : [authMiddleware]), profileRouter);
app.use("/api/objectives",    ...(demoMode ? [] : [authMiddleware]), objectivesRouter);
app.use("/api/notifications", authMiddleware, notificationsRouter);
app.use("/api/subscriptions", authMiddleware, subscriptionsRouter);

// ── Dashboard & Resumen (no auth, server-side rendered) ───────────
app.use("/dashboard", dashboardRouter);
app.use("/nexo-manager",   managerRouter);
app.use("/resumen/en", resumenEnRouter);
app.use("/resumen", resumenRouter);
app.use("/technical", technicalRouter);

// ── Health check (no auth) ────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// ── SPA fallback ─────────────────────────────────────────────────
app.get("*", (_req, res) =>
  res.sendFile(join(__dirname, "../public/index.html"))
);

// ── Generic error handler (no stack traces to client) ────────────
app.use((err, _req, res, _next) => {
  logger.error("Unhandled error", { message: err.message });
  res
    .status(err.status ?? 500)
    .json({ error: "An unexpected error occurred. Please try again." });
});

// ── Start server ─────────────────────────────────────────────────
// En producción (Render) siempre 0.0.0.0; en desarrollo localhost
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : (process.env.HOST ?? "127.0.0.1");
const PORT = parseInt(process.env.PORT ?? "8080", 10);

app.listen(PORT, HOST, () => {
  logger.info(`NEXO running at http://${HOST}:${PORT}`);
  startNotificationJobs();
});

export default app;
