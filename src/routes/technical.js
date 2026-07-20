// ─────────────────────────────────────────────────────────────────
//  src/routes/technical.js
//  NEXO — Technical Declaration (≤500 words)
//  Access: http://localhost:3000/technical
// ─────────────────────────────────────────────────────────────────
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXO — Technical Declaration</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif; font-size: 13px; line-height: 1.75; color: #1f2328; background: #fff; }
    .page { max-width: 780px; margin: 0 auto; padding: 40px 48px 60px; }
    .cover { background: #1f2328; color: #fff; border-radius: 10px; padding: 32px 36px; margin-bottom: 32px; }
    .cover-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .ibm { font-size: 24px; font-weight: 800; color: #3b82d4; letter-spacing: -1px; }
    .nexo-title { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
    .nexo-sub { font-size: 11.5px; color: #94a3b8; font-style: italic; margin-top: 2px; }
    .cover-desc { font-size: 12.5px; color: #e2e8f0; line-height: 1.6; margin-bottom: 14px; }
    .cover-meta { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { background: rgba(255,255,255,0.1); border-radius: 4px; padding: 3px 10px; font-size: 11px; color: #c9d1d9; }
    .chip.hl { background: #3b82d4; color: #fff; font-weight: 700; }
    .section { margin-bottom: 26px; }
    h2 { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: #3b82d4; border-bottom: 2px solid #3b82d4; padding-bottom: 4px; margin-bottom: 11px; }
    p { font-size: 13px; margin-bottom: 9px; }
    ul { margin: 0 0 9px 18px; }
    li { font-size: 13px; margin-bottom: 3px; }
    code { font-family: "Courier New", monospace; font-size: 11.5px; background: #f1f5f9; padding: 1px 5px; border-radius: 3px; }
    .stack { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin: 10px 0; }
    .sc { background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 9px 12px; }
    .sc-t { font-size: 11px; font-weight: 700; color: #1f2328; }
    .sc-v { font-size: 11px; color: #3b82d4; font-family: "Courier New", monospace; }
    .ok { background: #f0fdf4; border: 1px solid #86efac; border-left: 4px solid #15803d; border-radius: 6px; padding: 11px 15px; font-size: 12.5px; color: #14532d; margin: 8px 0; }
    .info { background: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #3b82d4; border-radius: 6px; padding: 11px 15px; font-size: 12.5px; color: #0c4a6e; margin: 8px 0; }
    .footer { text-align: center; margin-top: 36px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #94a3b8; }
    @media print {
      .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div class="cover">
    <div class="cover-top">
      <span class="ibm">IBM</span>
      <div>
        <div class="nexo-title">NEXO</div>
        <div class="nexo-sub">Technical Declaration</div>
      </div>
    </div>
    <p class="cover-desc">NEXO is a personal IBM objectives and compliance tracking platform that centralizes data from SuccessFactors, Your Learning and IBM Time Recording into a single real-time dashboard.</p>
    <div class="cover-meta">
      <span class="chip">Sandra Milena Mojica Duarte · 03045693</span>
      <span class="chip">IBM Consulting Colombia</span>
      <span class="chip hl">IBMers Watsonx Challenge 2026</span>
    </div>
  </div>

  <!-- 1. WHAT IT IS -->
  <div class="section">
    <h2>1. What it is</h2>
    <p>NEXO is a Node.js web application that aggregates data from three IBM internal systems to track 11 corporate objectives for a Banda 4 Analista Contable in the R2R/P2P/O2C practice. It shows each objective with a completion percentage, personalized course recommendations, expiry alerts and hours compliance controls — all in one server-rendered HTML dashboard, no front-end framework required.</p>
  </div>

  <!-- 2. STACK -->
  <div class="section">
    <h2>2. Technology Stack</h2>
    <div class="stack">
      <div class="sc"><div class="sc-t">Runtime</div><div class="sc-v">Node.js ≥ 20</div></div>
      <div class="sc"><div class="sc-t">Framework</div><div class="sc-v">Express 4.x</div></div>
      <div class="sc"><div class="sc-t">Auth</div><div class="sc-v">IBM SSO · jose</div></div>
      <div class="sc"><div class="sc-t">HTTP client</div><div class="sc-v">Axios 1.x</div></div>
      <div class="sc"><div class="sc-t">Logging</div><div class="sc-v">Winston 3.x</div></div>
      <div class="sc"><div class="sc-t">Cache</div><div class="sc-v">In-process TTL</div></div>
    </div>
  </div>

  <!-- 3. ARCHITECTURE -->
  <div class="section">
    <h2>3. How it works</h2>
    <p>When a user opens <code>/dashboard</code>, the server calls three IBM APIs in parallel using <code>Promise.allSettled</code>: SuccessFactors (utilization, self-assessment, feedback), Your Learning (hours, badges, mandatory trainings) and IBM Time Recording (timesheet vs. plan). If any API fails, it returns <code>null</code> gracefully — the dashboard never crashes. The engine then builds 11 objective objects, attaches recommended courses filtered by band, practice, language preference and interests, and renders the full HTML in one round-trip. In DEMO mode, realistic simulated data replaces live IBM calls.</p>
  </div>

  <!-- 4. KEY MODULES -->
  <div class="section">
    <h2>4. Key modules</h2>
    <ul>
      <li><code>objectivesEngine.js</code> — aggregates all API data and builds 11 objectives with % and alerts</li>
      <li><code>courseRecommender.js</code> — 30+ courses tagged by band, practice, language and badge type</li>
      <li><code>inProgressCourses.js</code> — tracks active courses with expiry alerts and pace suggestions</li>
      <li><code>demoData.js</code> — realistic demo dataset, active when <code>DEMO=true</code></li>
      <li><code>auth.js</code> — validates IBM SSO JWT via JWKS; skipped in DEMO mode</li>
    </ul>
  </div>

  <!-- 5. SECURITY -->
  <div class="section">
    <h2>5. Security</h2>
    <ul>
      <li><strong>Authentication:</strong> IBM SSO (w3id) OAuth 2.0 / OIDC — JWT verified via JWKS using <code>jose</code></li>
      <li><strong>Headers:</strong> Helmet.js enforces CSP, X-Frame-Options and HSTS on every response</li>
      <li><strong>Rate limiting:</strong> 100 requests / 15 min / IP on all <code>/api</code> routes</li>
      <li><strong>Read-only:</strong> NEXO performs GET requests only — no IBM data is written or modified</li>
      <li><strong>No persistence:</strong> no database; data lives in-process ≤ 300 s and is lost on restart</li>
    </ul>
  </div>

  <!-- 6. AVAILABLE ROUTES -->
  <div class="section">
    <h2>6. Available routes</h2>
    <ul>
      <li><code>GET /dashboard</code> — main objectives dashboard (server-rendered HTML)</li>
      <li><code>GET /api/objectives</code> — objectives data as JSON (JWT-protected; public in DEMO mode)</li>
      <li><code>GET /api/profile</code> — enriched employee profile</li>
      <li><code>GET /resumen</code> — executive summary in Spanish (print → PDF)</li>
      <li><code>GET /resumen/en</code> — executive summary in English (print → PDF)</li>
      <li><code>GET /technical</code> — this document</li>
      <li><code>GET /health</code> — server health check</li>
    </ul>
  </div>

  <!-- 7. STATUS -->
  <div class="section">
    <h2>7. Current status</h2>
    <div class="ok">
      ✅ <strong>Phase 1 complete —</strong> fully functional in DEMO mode: dashboard, course recommender, expiry alerts and hours control all working.<br><br>
      ⏳ <strong>Phase 2 in progress —</strong> IBM IT API key request submitted. Switch <code>DEMO=false</code> in <code>.env</code> once approved to connect to real IBM data.<br><br>
      🔜 <strong>Phase 3 planned —</strong> deploy on IBM central server for team-wide access via IBM SSO.
    </div>
  </div>

  <!-- 8. QUICK START -->
  <div class="section">
    <h2>8. Quick start</h2>
    <div class="info">
      1. Clone the repo and run <code>npm install</code><br>
      2. Copy <code>.env.example</code> → <code>.env</code> and set <code>DEMO=true</code><br>
      3. Run <code>npm run dev</code><br>
      4. Open <code>http://localhost:3000/dashboard</code>
    </div>
  </div>

  <div class="footer">
    NEXO · Technical Declaration · IBM Consulting Colombia · Sandra Milena Mojica Duarte · 03045693 · 2026 · IBMers Watsonx Challenge
  </div>

</div>
</body>
</html>`;
  res.send(html);
});

export default router;
