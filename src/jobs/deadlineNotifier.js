// ─────────────────────────────────────────────────────────────────
//  src/jobs/deadlineNotifier.js  –  Stub cron job for smoke-test
// ─────────────────────────────────────────────────────────────────
import logger from "../middleware/logger.js";

export function startNotificationJobs() {
  logger.info("Notification jobs initialized (stub – no cron scheduled in dev).");
}
