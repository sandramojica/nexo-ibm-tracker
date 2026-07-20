// ─────────────────────────────────────────────────────────────────
//  src/middleware/logger.js  –  Structured Winston logger
//  NEVER log passwords, tokens, PII, or sensitive request data.
// ─────────────────────────────────────────────────────────────────
import { createLogger, format, transports } from "winston";

const { combine, timestamp, json, colorize, printf } = format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), json());

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

/** Express middleware – logs method, path and status without headers/body */
logger.requestLogger = (req, res, next) => {
  res.on("finish", () => {
    logger.info("HTTP", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
    });
  });
  next();
};

export default logger;
