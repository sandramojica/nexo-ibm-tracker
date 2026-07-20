// ─────────────────────────────────────────────────────────────────
//  src/routes/objectives.js
//  Returns the full objectives dashboard.
//  - DEMO=true  → returns simulated data (no VPN/credentials needed)
//  - DEMO=false → calls buildObjectivesDashboard() with real IBM APIs
// ─────────────────────────────────────────────────────────────────
import { Router } from "express";
import { buildObjectivesDashboard } from "../services/objectivesEngine.js";
import { getDemoDashboard } from "../services/demoData.js";
import logger from "../middleware/logger.js";

const router = Router();

router.get("/", async (req, res) => {
  // ── Demo mode: return simulated data without calling IBM APIs ──
  if (process.env.DEMO === "true") {
    logger.info("Objectives served in DEMO mode");
    return res.json({ demo: true, objectives: getDemoDashboard() });
  }

  // ── Real mode: call the objectives engine ─────────────────────
  const authHeader = req.headers.authorization ?? "";
  const token      = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userId     = req.user?.id;

  if (!token || !userId) {
    return res.status(401).json({ error: "Authentication required." });
  }

  // Build enriched profile from JWT + env fallback
  const userProfile = {
    band:           req.user?.band           ?? process.env.USER_BAND           ?? "4",
    practice:       process.env.USER_PRACTICE      ?? "Consulting",
    specialization: process.env.USER_SPECIALIZATION ?? "R2R/P2P/O2C",
  };

  try {
    const objectives = await buildObjectivesDashboard(token, userId, userProfile);
    return res.json({ demo: false, objectives });
  } catch (err) {
    logger.error("Failed to build objectives dashboard", { reason: err.message });
    return res.status(500).json({ error: "No se pudo generar el dashboard de objetivos." });
  }
});

export default router;
