// ─────────────────────────────────────────────────────────────────
//  src/middleware/auth.js  –  JWT validation middleware
//  Tokens are issued by IBM SSO (w3id / IBM App ID – OIDC).
//  This middleware validates the bearer token on every /api request.
// ─────────────────────────────────────────────────────────────────
import { createRemoteJWKSet, jwtVerify } from "jose";
import logger from "./logger.js";

// IBM w3id JWKS endpoint – tokens issued by IBM SSO
const JWKS_URI =
  process.env.IBM_JWKS_URI ??
  "https://login.ibm.com/oidc/endpoint/default/jwks";

let jwks;
function getJWKS() {
  if (!jwks) jwks = createRemoteJWKSet(new URL(JWKS_URI));
  return jwks;
}

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: process.env.IBM_TOKEN_ISSUER ?? "https://login.ibm.com/oidc/endpoint/default",
      audience: process.env.IBM_CLIENT_ID,
    });

    // Attach safe user info – never log the raw token
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      band: payload["ibm_band"] ?? payload.band,
    };
    next();
  } catch (err) {
    logger.warn("JWT validation failed", { reason: err.message });
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
