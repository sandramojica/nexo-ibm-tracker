// ─────────────────────────────────────────────────────────────────
//  src/services/ibmApiClient.js
//  Shared Axios instance for all IBM internal APIs.
//  Injects the caller's OAuth bearer token on every request.
//  TLS 1.2+ is enforced via Node's built-in TLS (default ≥ Node 20).
// ─────────────────────────────────────────────────────────────────
import axios from "axios";
import logger from "../middleware/logger.js";

/** Creates a pre-configured Axios instance for an IBM API base URL */
export function createIBMClient(baseURL, bearerToken) {
  const client = axios.create({
    baseURL,
    timeout: 15_000, // 15 s – avoid hanging requests
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Response interceptor: log errors without leaking tokens or bodies
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      logger.error("IBM API request failed", {
        url: error.config?.url,
        status: error.response?.status,
        // Never log headers or request body — may contain tokens / PII
      });
      return Promise.reject(new Error(`IBM API error: ${error.response?.status ?? "network"}`));
    }
  );

  return client;
}
