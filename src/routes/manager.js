// ─────────────────────────────────────────────────────────────────
//  src/routes/manager.js
//  Vista de solo lectura para el manager de Sandra.
//  Reutiliza exactamente el mismo HTML del dashboard.
// ─────────────────────────────────────────────────────────────────
import { Router } from "express";
import { buildDashboardHtml } from "./dashboard.js";

const router = Router();

const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || "002741661";

// ── Auth middleware ───────────────────────────────────────────────
function managerAuth(req, res, next) {
  const cookie = req.headers.cookie || "";
  if (cookie.includes("nexo_manager=1")) return next();
  res.redirect("/nexo-manager/login");
}

// ── Login page ────────────────────────────────────────────────────
router.get("/login", (req, res) => {
  const cookie = req.headers.cookie || "";
  if (cookie.includes("nexo_manager=1")) return res.redirect("/nexo-manager");
  const errorMsg = req.query.error
    ? `<div class="err">Contrase&#241;a incorrecta. Int&#233;ntalo de nuevo.</div>`
    : "";
  const host = req.headers.host; // e.g. 9.67.44.108:3000
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>NEXO – Acceso Manager</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,"Segoe UI",system-ui,sans-serif;background:#f7f8fa;color:#1f2328;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:36px 40px;width:100%;max-width:380px;}
    .logo{font-size:22px;font-weight:800;color:#3b82d4;letter-spacing:-1px;margin-bottom:4px;}
    .sub{font-size:13px;color:#57606a;margin-bottom:24px;}
    label{font-size:12px;font-weight:600;color:#57606a;display:block;margin-bottom:6px;}
    input{width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:10px 12px;font-size:14px;outline:none;margin-bottom:16px;}
    input:focus{border-color:#3b82d4;}
    button{width:100%;background:#1f2328;color:#fff;border:none;border-radius:6px;padding:11px;font-size:14px;font-weight:700;cursor:pointer;}
    .err{background:#fff1f0;border:1px solid #ffa39e;border-radius:6px;padding:8px 12px;font-size:12px;color:#a8071a;margin-bottom:14px;}
    .badge{display:inline-block;background:#7c5cd8;color:#fff;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;margin-bottom:16px;}
  </style>
</head>
<body>
<div class="card">
  <div class="logo">IBM NEXO</div>
  <div class="badge">Vista Manager — Solo Lectura</div>
  <div class="sub">Ingresa la contrase&#241;a para ver el avance de Sandra Milena Mojica Duarte.</div>
  ${errorMsg}
  <form method="POST" action="/nexo-manager/login">
    <label>Contrase&#241;a</label>
    <input type="password" name="password" placeholder="Ingresa la contrase&#241;a" autofocus />
    <button type="submit">Ingresar &#8594;</button>
  </form>
</div>
</body>
</html>`);
});

// ── Login POST ────────────────────────────────────────────────────
router.post("/login", (req, res) => {
  const { password } = req.body || {};
  if (password === MANAGER_PASSWORD) {
    res.setHeader("Set-Cookie", `nexo_manager=1; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`);
    res.redirect(303, "/nexo-manager");
  } else {
    res.redirect(303, "/nexo-manager/login?error=1");
  }
});

// ── Vista principal — idéntica al dashboard ───────────────────────
router.get("/", managerAuth, (_req, res) => {
  // Ruta: /nexo-manager
  res.send(buildDashboardHtml(true));
});

export default router;
