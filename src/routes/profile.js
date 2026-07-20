// ─────────────────────────────────────────────────────────────────
//  src/routes/profile.js
//  Returns the enriched employee profile.
//  Priority: SuccessFactors (when available) → env fallback → JWT
// ─────────────────────────────────────────────────────────────────
import { Router } from "express";
import { getSFProfile } from "../services/successFactors.js";
import logger from "../middleware/logger.js";

const router = Router();

/** Build profile from .env fallback values (when SF is unreachable) */
function envFallbackProfile(user) {
  return {
    userId:         user?.id                              ?? process.env.USER_ID            ?? "—",
    name:           user?.name                            ?? process.env.USER_NAME           ?? "—",
    email:          user?.email                           ?? process.env.USER_EMAIL          ?? "—",
    band:           user?.band                            ?? process.env.USER_BAND           ?? "—",
    role:           process.env.USER_ROLE                 ?? "—",
    profession:     process.env.USER_PROFESSION           ?? "—",
    practice:       process.env.USER_PRACTICE             ?? "—",
    specialization: process.env.USER_SPECIALIZATION       ?? "—",
    source:         "env",
  };
}

router.get("/", async (req, res) => {
  const authHeader = req.headers.authorization ?? "";
  const token      = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userId     = req.user?.id;

  // Attempt to enrich from SuccessFactors; fall back to env on any error
  if (token && userId && process.env.SF_BASE_URL && process.env.SF_BASE_URL !== "https://apisalesdemo2.successfactors.eu/odata/v2") {
    try {
      const sfProfile = await getSFProfile(token, userId);
      return res.json({
        ...sfProfile,
        role:           process.env.USER_ROLE           ?? "—",
        profession:     process.env.USER_PROFESSION     ?? "—",
        practice:       process.env.USER_PRACTICE       ?? "—",
        specialization: process.env.USER_SPECIALIZATION ?? "—",
        source:         "successfactors",
      });
    } catch (err) {
      logger.warn("SF profile unavailable, using env fallback", { reason: err.message });
    }
  }

  return res.json(envFallbackProfile(req.user));
});

export default router;
