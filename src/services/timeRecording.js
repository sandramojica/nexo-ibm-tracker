// ─────────────────────────────────────────────────────────────────
//  src/services/timeRecording.js
//  IBM Time Recording API integration.
//  Reads: weekly timesheet status, hours plan vs actual.
// ─────────────────────────────────────────────────────────────────
import { createIBMClient } from "./ibmApiClient.js";
import { cache } from "./cache.js";
import logger from "../middleware/logger.js";
import { startOfWeek, endOfWeek, format, eachWeekOfInterval, startOfYear } from "date-fns";

const TIME_BASE = process.env.TIME_API_BASE_URL;

/**
 * Fetch weekly timesheet compliance for the current year.
 * Returns: { totalWeeks: number, submittedWeeks: number, compliancePct: number, currentWeekSubmitted: boolean }
 */
export async function getTimesheetCompliance(bearerToken, userId) {
  const cacheKey = `time:compliance:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(TIME_BASE, bearerToken);

  try {
    const yearStart = startOfYear(new Date());
    const today = new Date();

    const res = await client.get(`/timesheets/${userId}`, {
      params: {
        from: format(yearStart, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      },
    });

    const timesheets = res.data.timesheets ?? [];
    const submittedWeekStarts = new Set(
      timesheets
        .filter((t) => t.status === "SUBMITTED" || t.status === "APPROVED")
        .map((t) => t.weekStart)
    );

    const allWeeks = eachWeekOfInterval({ start: yearStart, end: today });
    const totalWeeks = allWeeks.length;
    const submittedWeeks = allWeeks.filter((w) =>
      submittedWeekStarts.has(format(w, "yyyy-MM-dd"))
    ).length;

    const currentWeekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const currentWeekSubmitted = submittedWeekStarts.has(currentWeekStart);

    const result = {
      totalWeeks,
      submittedWeeks,
      compliancePct: totalWeeks > 0 ? Math.round((submittedWeeks / totalWeeks) * 100) : 0,
      currentWeekSubmitted,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.warn("Could not fetch timesheet compliance from Time", { reason: err.message });
    return { totalWeeks: 0, submittedWeeks: 0, compliancePct: 0, currentWeekSubmitted: false };
  }
}

/**
 * Fetch hours plan vs actual for the current month.
 * Returns: { planned: number, actual: number, utilizationPct: number }
 */
export async function getHoursPlan(bearerToken, userId) {
  const cacheKey = `time:hoursplan:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const client = createIBMClient(TIME_BASE, bearerToken);

  try {
    const now = new Date();
    const res = await client.get(`/hoursplan/${userId}`, {
      params: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    });

    const plan = res.data;
    const result = {
      planned: plan.plannedHours ?? 0,
      actual: plan.actualHours ?? 0,
      utilizationPct:
        plan.plannedHours > 0
          ? Math.round((plan.actualHours / plan.plannedHours) * 100)
          : 0,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.warn("Could not fetch hours plan from Time", { reason: err.message });
    return { planned: 0, actual: 0, utilizationPct: 0 };
  }
}
