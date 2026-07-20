// ─────────────────────────────────────────────────────────────────
//  src/services/yourLearning.js
//  Your Learning (IBM LMS) API integration.
//  Reads: learning hours, badges, mandatory training status.
// ─────────────────────────────────────────────────────────────────
import { createIBMClient } from "./ibmApiClient.js";
import { cache } from "./cache.js";
import logger from "../middleware/logger.js";
import { differenceInDays, parseISO } from "date-fns";

const YL_BASE = process.env.YOUR_LEARNING_BASE_URL;

/**
 * Fetch total completed learning hours for the current year.
 * Returns: { hoursCompleted: number, targetHours: number }
 */
export async function getLearningHours(bearerToken, userId) {
  const cacheKey = `yl:hours:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(YL_BASE, bearerToken);

  try {
    const res = await client.get(`/learners/${userId}/completions`, {
      params: { period: "CURRENT_YEAR", type: "COURSE" },
    });

    const items = res.data.items ?? [];
    const hoursCompleted = items.reduce((sum, c) => sum + (c.durationHours ?? 0), 0);

    const result = { hoursCompleted: Math.round(hoursCompleted * 10) / 10, targetHours: 40 };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.warn("Could not fetch learning hours from YL", { reason: err.message });
    return { hoursCompleted: 0, targetHours: 40 };
  }
}

/**
 * Fetch badges earned.
 * Returns: { badgesEarned: number, hasGrowthBehavioursBadge: boolean, badges: Array }
 */
export async function getBadges(bearerToken, userId) {
  const cacheKey = `yl:badges:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(YL_BASE, bearerToken);
  const GROWTH_BADGE_ID = "CREDLY-06dd24c7-5946-4ac3-b4aa-fd6c902e0ca6";

  try {
    const res = await client.get(`/learners/${userId}/credentials`, {
      params: { type: "BADGE" },
    });

    const badges = (res.data.items ?? []).map((b) => ({
      id: b.credentialId,
      name: b.name,
      earnedAt: b.completedDate,
    }));

    const result = {
      badgesEarned: badges.length,
      hasGrowthBehavioursBadge: badges.some((b) => b.id === GROWTH_BADGE_ID),
      badges,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.warn("Could not fetch badges from YL", { reason: err.message });
    return { badgesEarned: 0, hasGrowthBehavioursBadge: false, badges: [] };
  }
}

/**
 * Fetch mandatory trainings with their deadlines.
 * Returns: Array<{ id, name, type, dueDate, completedDate, daysUntilDue, status }>
 */
export async function getMandatoryTrainings(bearerToken, userId) {
  const cacheKey = `yl:mandatory:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(YL_BASE, bearerToken);

  try {
    const res = await client.get(`/learners/${userId}/assignments`, {
      params: { mandatory: true, includeCompleted: true },
    });

    const today = new Date();
    const trainings = (res.data.items ?? []).map((t) => {
      const dueDate = t.dueDate ? parseISO(t.dueDate) : null;
      const daysUntilDue = dueDate ? differenceInDays(dueDate, today) : null;
      let status = "UNKNOWN";
      if (t.completedDate) status = "COMPLETED";
      else if (daysUntilDue !== null && daysUntilDue < 0) status = "OVERDUE";
      else if (daysUntilDue !== null && daysUntilDue <= 10) status = "DUE_SOON";
      else status = "PENDING";

      return {
        id: t.assignmentId,
        name: t.title,
        type: t.trainingType, // CORPORATE | CONSULTING | OTHER
        dueDate: t.dueDate ?? null,
        completedDate: t.completedDate ?? null,
        daysUntilDue,
        status,
      };
    });

    cache.set(cacheKey, trainings);
    return trainings;
  } catch (err) {
    logger.warn("Could not fetch mandatory trainings from YL", { reason: err.message });
    return [];
  }
}

/**
 * Fetch learning path progress for R2R/P2P/O2C practice levels.
 * Returns: { entry: { pct: number, completed: boolean }, foundation: { pct: number } }
 */
export async function getPracticeLearningProgress(bearerToken, userId) {
  const cacheKey = `yl:practice:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(YL_BASE, bearerToken);

  try {
    const res = await client.get(`/learners/${userId}/learningpaths`, {
      params: { practice: "R2R_P2P_O2C" },
    });

    const paths = res.data.items ?? [];
    const entryPath = paths.find((p) => p.level === "ENTRY");
    const foundationPath = paths.find((p) => p.level === "FOUNDATION");

    const result = {
      entry: {
        pct: entryPath ? Math.round(entryPath.completionPct) : 0,
        completed: entryPath?.status === "COMPLETED",
      },
      foundation: {
        pct: foundationPath ? Math.round(foundationPath.completionPct) : 0,
        completed: foundationPath?.status === "COMPLETED",
      },
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.warn("Could not fetch practice learning paths from YL", { reason: err.message });
    return {
      entry: { pct: 0, completed: false },
      foundation: { pct: 0, completed: false },
    };
  }
}
