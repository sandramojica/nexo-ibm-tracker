// ─────────────────────────────────────────────────────────────────
//  src/services/successFactors.js
//  SuccessFactors OData v2 API integration.
//  Reads: employee profile, utilization, goal completion.
// ─────────────────────────────────────────────────────────────────
import { createIBMClient } from "./ibmApiClient.js";
import { cache } from "./cache.js";
import logger from "../middleware/logger.js";

const SF_BASE = process.env.SF_BASE_URL;
const SF_COMPANY = process.env.SF_COMPANY_ID;

/**
 * Fetch the authenticated employee's SF profile.
 * Returns: { userId, name, band, manager, teamLeader, email }
 */
export async function getSFProfile(bearerToken, userId) {
  const cacheKey = `sf:profile:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(SF_BASE, bearerToken);
  const res = await client.get(`/User('${userId}')`, {
    params: {
      companyId: SF_COMPANY,
      $select: "userId,firstName,lastName,email,department,division,manager,custom01",
      $format: "json",
    },
  });

  const d = res.data.d;
  const profile = {
    userId: d.userId,
    name: `${d.firstName} ${d.lastName}`,
    email: d.email,
    band: d.custom01 ?? d.division ?? "—",     // IBM band stored in custom field
    manager: d.manager?.displayName ?? "—",
    department: d.department ?? "—",
  };

  cache.set(cacheKey, profile);
  return profile;
}

/**
 * Fetch utilization percentage from SuccessFactors performance goals.
 * Returns: { utilizationPct: number, targetPct: number }
 */
export async function getUtilization(bearerToken, userId) {
  const cacheKey = `sf:utilization:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(SF_BASE, bearerToken);

  try {
    const res = await client.get(`/GoalPlanContent`, {
      params: {
        companyId: SF_COMPANY,
        $filter: `userId eq '${userId}' and planId eq 'UTILIZATION'`,
        $select: "metricLookupId,currentValue,targetValue",
        $format: "json",
      },
    });

    const goals = res.data.d?.results ?? [];
    const utilGoal = goals.find((g) => g.metricLookupId?.includes("UTIL"));

    const result = {
      utilizationPct: utilGoal
        ? Math.round((parseFloat(utilGoal.currentValue) / parseFloat(utilGoal.targetValue)) * 100)
        : 0,
      targetPct: 95,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.warn("Could not fetch utilization from SF", { reason: err.message });
    return { utilizationPct: 0, targetPct: 95 };
  }
}

/**
 * Fetch self-assessment completion status from SuccessFactors.
 * Returns: { s1Completed: boolean, s2Completed: boolean }
 */
export async function getSelfAssessmentStatus(bearerToken, userId) {
  const cacheKey = `sf:selfassess:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(SF_BASE, bearerToken);

  try {
    const year = new Date().getFullYear();
    const res = await client.get(`/PerformanceReview`, {
      params: {
        companyId: SF_COMPANY,
        $filter: `userId eq '${userId}' and reviewYear eq ${year}`,
        $select: "reviewId,status,reviewPeriod",
        $format: "json",
      },
    });

    const reviews = res.data.d?.results ?? [];
    const s1 = reviews.find((r) => r.reviewPeriod === "H1");
    const s2 = reviews.find((r) => r.reviewPeriod === "H2");

    const result = {
      s1Completed: s1?.status === "COMPLETED",
      s2Completed: s2?.status === "COMPLETED",
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.warn("Could not fetch self-assessment from SF", { reason: err.message });
    return { s1Completed: false, s2Completed: false };
  }
}

/**
 * Fetch Reflections (check-in) completion status.
 * Returns: { s1Completed: boolean, s2Completed: boolean }
 */
export async function getReflectionsStatus(bearerToken, userId) {
  const cacheKey = `sf:reflections:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(SF_BASE, bearerToken);

  try {
    const res = await client.get(`/ContinuousFeedback`, {
      params: {
        companyId: SF_COMPANY,
        $filter: `userId eq '${userId}' and type eq 'REFLECTION'`,
        $select: "id,status,period,createdDate",
        $format: "json",
        $orderby: "createdDate desc",
      },
    });

    const reflections = res.data.d?.results ?? [];
    const currentYear = new Date().getFullYear().toString();
    const thisYear = reflections.filter((r) => r.createdDate?.startsWith(currentYear));

    const result = {
      s1Completed: thisYear.some((r) => r.period === "H1" && r.status === "COMPLETED"),
      s2Completed: thisYear.some((r) => r.period === "H2" && r.status === "COMPLETED"),
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.warn("Could not fetch reflections from SF", { reason: err.message });
    return { s1Completed: false, s2Completed: false };
  }
}

/**
 * Fetch feedback request/given counts for the current semester.
 * Returns: { requested: number, received: number, answered: number }
 */
export async function getFeedbackStatus(bearerToken, userId) {
  const cacheKey = `sf:feedback:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(SF_BASE, bearerToken);

  try {
    // Semester start: Jan 1 or Jul 1
    const now = new Date();
    const semesterStart = new Date(
      now.getFullYear(),
      now.getMonth() < 6 ? 0 : 6,
      1
    ).toISOString();

    const res = await client.get(`/ContinuousFeedback`, {
      params: {
        companyId: SF_COMPANY,
        $filter: `(fromUserId eq '${userId}' or toUserId eq '${userId}') and createdDate ge datetime'${semesterStart}'`,
        $select: "id,status,fromUserId,toUserId",
        $format: "json",
      },
    });

    const all = res.data.d?.results ?? [];
    const result = {
      requested: all.filter((f) => f.fromUserId === userId).length,
      received:  all.filter((f) => f.toUserId === userId).length,
      answered:  all.filter((f) => f.toUserId === userId && f.status === "COMPLETED").length,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.warn("Could not fetch feedback from SF", { reason: err.message });
    return { requested: 0, received: 0, answered: 0 };
  }
}
