// ─────────────────────────────────────────────────────────────────
//  src/routes/resumen-en.js
//  NEXO Executive Summary — English version (≤500 words)
//  Access: http://localhost:3000/resumen/en
// ─────────────────────────────────────────────────────────────────
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXO — Executive Summary</title>
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
    .lang-switch { text-align: right; margin-bottom: 14px; font-size: 12px; }
    .lang-switch a { color: #3b82d4; text-decoration: none; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 3px 10px; }
    .section { margin-bottom: 26px; }
    h2 { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: #3b82d4; border-bottom: 2px solid #3b82d4; padding-bottom: 4px; margin-bottom: 11px; }
    p { font-size: 13px; margin-bottom: 9px; }
    ul { margin: 0 0 9px 18px; }
    li { font-size: 13px; margin-bottom: 4px; }
    .ba-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 10px 0; }
    .ba-card { border-radius: 8px; padding: 14px 16px; }
    .ba-before { background: #fff1f0; border: 1px solid #fca5a5; }
    .ba-after  { background: #f0fdf4; border: 1px solid #86efac; }
    .ba-title  { font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 7px; }
    .ba-before .ba-title { color: #dc2626; }
    .ba-after  .ba-title { color: #15803d; }
    .ba-item { font-size: 12px; padding: 2px 0; }
    .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin: 10px 0; }
    .stat-card { background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; text-align: center; }
    .stat-num { font-size: 24px; font-weight: 800; }
    .stat-label { font-size: 11px; color: #57606a; margin-top: 3px; line-height: 1.4; }
    .timeline { padding-left: 16px; border-left: 2px solid #e5e7eb; }
    .tl-item { position: relative; margin-bottom: 12px; padding-left: 10px; }
    .tl-phase { font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .tl-desc { font-size: 12px; color: #1f2328; }
    .done { color: #15803d; } .active { color: #3b82d4; } .pending { color: #94a3b8; }
    .ok { background: #f0fdf4; border: 1px solid #86efac; border-left: 4px solid #15803d; border-radius: 6px; padding: 12px 16px; font-size: 12.5px; color: #14532d; }
    .footer { text-align: center; margin-top: 36px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #94a3b8; }
    @media print {
      .lang-switch { display: none; }
      .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="page">

  <div class="lang-switch">🇨🇴 <a href="/resumen">Ver en Español</a></div>

  <!-- COVER -->
  <div class="cover">
    <div class="cover-top">
      <span class="ibm">IBM</span>
      <div>
        <div class="nexo-title">NEXO</div>
        <div class="nexo-sub">Your intelligent link to your IBM objectives</div>
      </div>
    </div>
    <p class="cover-desc">A platform that centralizes IBM objectives, mandatory courses, hours and compliance metrics in one real-time dashboard — so every IBMer can stay on track without switching between six tools.</p>
    <div class="cover-meta">
      <span class="chip">Sandra Milena Mojica Duarte · 03045693</span>
      <span class="chip">Accounting Analyst · Band 4 · IBM Consulting Colombia</span>
      <span class="chip hl">IBMers Watsonx Challenge 2026</span>
    </div>
  </div>

  <!-- 1. THE PROBLEM -->
  <div class="section">
    <h2>1. The Problem</h2>
    <p>IBMers must manage over six platforms to stay compliant: SuccessFactors, Your Learning, IBM Time Recording, MyScore, Credly and Your Career at IBM. Without a unified view, the team was spending around <strong>12 hours per week</strong> navigating tools and keeping track in Word documents — mostly outside working hours. Mandatory trainings could expire unnoticed, and it was never clear which courses applied to each person's profile.</p>
  </div>

  <!-- 2. THE SOLUTION -->
  <div class="section">
    <h2>2. The Solution</h2>
    <p><strong>NEXO</strong> is a web dashboard that pulls data from IBM's internal APIs and shows everything in one place: 11 corporate objectives with completion percentages, personalized course recommendations, expiry alerts 8 days in advance, and a live hours-plan compliance check.</p>
    <div class="ba-grid">
      <div class="ba-card ba-before">
        <div class="ba-title">❌ Before NEXO</div>
        <div class="ba-item">→ 6+ platforms to check separately</div>
        <div class="ba-item">→ Manual tracking in Word documents</div>
        <div class="ba-item">→ No profile-based course guidance</div>
        <div class="ba-item">→ Expiries discovered too late</div>
        <div class="ba-item">→ ~12 h/week per person</div>
      </div>
      <div class="ba-card ba-after">
        <div class="ba-title">✅ With NEXO</div>
        <div class="ba-item">→ 1 single dashboard</div>
        <div class="ba-item">→ Real-time data, no manual work</div>
        <div class="ba-item">→ Courses filtered by band and practice</div>
        <div class="ba-item">→ Alerts 8 days before deadline</div>
        <div class="ba-item">→ ~2 h/week per person</div>
      </div>
    </div>
  </div>

  <!-- 3. IMPACT -->
  <div class="section">
    <h2>3. Impact</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-num" style="color:#15803d;">−10 h</div>
        <div class="stat-label">saved per person per week</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color:#3b82d4;">6 → 1</div>
        <div class="stat-label">IBM platforms consolidated into one dashboard</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color:#7c5cd8;">11</div>
        <div class="stat-label">corporate objectives tracked in real time</div>
      </div>
    </div>
    <p style="font-size:12px;color:#57606a;">* Estimate based on ~12 h/week reported before NEXO. Daily review with the dashboard takes approximately 15 minutes.</p>
  </div>

  <!-- 4. KEY FEATURES -->
  <div class="section">
    <h2>4. Key Features</h2>
    <ul>
      <li><strong>Objectives dashboard</strong> — 11 IBM objectives with % completion and progress bars</li>
      <li><strong>Profile-based courses</strong> — recommendations from Your Learning filtered by band, practice, language and interests</li>
      <li><strong>Expiry alerts</strong> — automatic warning 8 days before any mandatory training expires, with a daily pace tip</li>
      <li><strong>Hours control</strong> — My Hours Plan vs. Time Recording cross-check, flags excess or deficit</li>
      <li><strong>Secure access</strong> — IBM SSO (w3id) OAuth 2.0, read-only, no password storage</li>
    </ul>
  </div>

  <!-- 5. ROADMAP -->
  <div class="section">
    <h2>5. Roadmap</h2>
    <div class="timeline">
      <div class="tl-item"><div class="tl-phase done">✓ Phase 1 — Complete</div><div class="tl-desc">Fully functional demo · 11 objectives · Course recommender · Hours and expiry alerts</div></div>
      <div class="tl-item"><div class="tl-phase active">→ Phase 2 — In progress</div><div class="tl-desc">IBM IT API keys requested · Will connect SuccessFactors, Your Learning and Time Recording with live data</div></div>
      <div class="tl-item"><div class="tl-phase pending">○ Phase 3 — Planned</div><div class="tl-desc">Deploy on IBM central server · Team-wide access via IBM SSO</div></div>
      <div class="tl-item"><div class="tl-phase pending">○ Phase 4 — Future</div><div class="tl-desc">Push notifications · Manager reports · Extension to other IBM practices</div></div>
    </div>
  </div>

  <!-- 6. CONCLUSION -->
  <div class="section">
    <h2>6. Conclusion</h2>
    <div class="ok">
      <strong>NEXO</strong> is a direct response to a real, everyday challenge for IBM Colombia teams. By consolidating six platforms into a single intelligent dashboard, it reduces compliance management from 12 to 2 hours per week, eliminates missed deadlines, and lets every IBMer focus on what actually matters: <strong>delivery and professional growth.</strong>
    </div>
  </div>

  <div class="footer">
    NEXO · Executive Summary · IBM Consulting Colombia · Sandra Milena Mojica Duarte · 03045693 · 2026 · IBMers Watsonx Challenge
  </div>

</div>
</body>
</html>`;
  res.send(html);
});

export default router;
