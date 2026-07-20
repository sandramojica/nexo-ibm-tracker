// ─────────────────────────────────────────────────────────────────
//  src/routes/resumen.js
//  NEXO — Documento Ejecutivo en Español (≤500 palabras)
//  Acceso: http://localhost:3000/resumen
// ─────────────────────────────────────────────────────────────────
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXO — Documento Ejecutivo</title>
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

  <div class="lang-switch">🇬🇧 <a href="/resumen/en">Read in English</a></div>

  <!-- PORTADA -->
  <div class="cover">
    <div class="cover-top">
      <span class="ibm">IBM</span>
      <div>
        <div class="nexo-title">NEXO</div>
        <div class="nexo-sub">Tu enlace inteligente con tus objetivos IBM</div>
      </div>
    </div>
    <p class="cover-desc">Plataforma que centraliza objetivos IBM, cursos obligatorios, horas y métricas de cumplimiento en un único panel en tiempo real — para que cada IBMer esté al día sin saltar entre seis herramientas.</p>
    <div class="cover-meta">
      <span class="chip">Sandra Milena Mojica Duarte · 03045693</span>
      <span class="chip">Analista Contable · Banda 4 · IBM Consulting Colombia</span>
      <span class="chip hl">IBMers Watsonx Challenge 2026</span>
    </div>
  </div>

  <!-- 1. EL PROBLEMA -->
  <div class="section">
    <h2>1. El Problema</h2>
    <p>Los IBMers deben gestionar más de seis plataformas para mantenerse en cumplimiento: SuccessFactors, Your Learning, IBM Time Recording, MyScore, Credly y Your Career at IBM. Sin una vista unificada, el equipo gastaba alrededor de <strong>12 horas semanales</strong> navegando herramientas y llevando la trazabilidad en documentos Word — la mayoría del tiempo fuera del horario laboral. Los trainings podían vencerse sin darse cuenta, y nunca quedaba claro qué cursos aplicaban al perfil de cada persona.</p>
  </div>

  <!-- 2. LA SOLUCIÓN -->
  <div class="section">
    <h2>2. La Solución</h2>
    <p><strong>NEXO</strong> es un panel web que consume las APIs internas de IBM y muestra todo en un solo lugar: 11 objetivos corporativos con porcentaje de cumplimiento, recomendaciones de cursos personalizadas, alertas de vencimiento con 8 días de anticipación y control en vivo del plan de horas.</p>
    <div class="ba-grid">
      <div class="ba-card ba-before">
        <div class="ba-title">❌ Antes de NEXO</div>
        <div class="ba-item">→ 6+ herramientas por separado</div>
        <div class="ba-item">→ Trazabilidad manual en Word</div>
        <div class="ba-item">→ Sin orientación de cursos por perfil</div>
        <div class="ba-item">→ Vencimientos descubiertos tarde</div>
        <div class="ba-item">→ ~12 h/semana por persona</div>
      </div>
      <div class="ba-card ba-after">
        <div class="ba-title">✅ Con NEXO</div>
        <div class="ba-item">→ 1 solo panel con todo consolidado</div>
        <div class="ba-item">→ Datos en tiempo real, sin copiar nada</div>
        <div class="ba-item">→ Cursos filtrados por banda y práctica</div>
        <div class="ba-item">→ Alertas 8 días antes del vencimiento</div>
        <div class="ba-item">→ ~2 h/semana por persona</div>
      </div>
    </div>
  </div>

  <!-- 3. IMPACTO -->
  <div class="section">
    <h2>3. Impacto</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-num" style="color:#15803d;">−10 h</div>
        <div class="stat-label">ahorradas por persona por semana</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color:#3b82d4;">6 → 1</div>
        <div class="stat-label">plataformas IBM consolidadas en un panel</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color:#7c5cd8;">11</div>
        <div class="stat-label">objetivos corporativos con seguimiento en tiempo real</div>
      </div>
    </div>
    <p style="font-size:12px;color:#57606a;">* Estimado basado en ~12 h semanales reportadas antes de NEXO. La revisión diaria con el panel toma aproximadamente 15 minutos.</p>
  </div>

  <!-- 4. FUNCIONALIDADES -->
  <div class="section">
    <h2>4. Funcionalidades Principales</h2>
    <ul>
      <li><strong>Dashboard de objetivos</strong> — 11 objetivos IBM con % de cumplimiento y barras de progreso</li>
      <li><strong>Cursos por perfil</strong> — recomendaciones de Your Learning filtradas por banda, práctica, idioma e intereses</li>
      <li><strong>Alertas de vencimiento</strong> — aviso automático 8 días antes de que venza cualquier training obligatorio, con pauta de ritmo diario</li>
      <li><strong>Control de horas</strong> — cruce de My Hours Plan vs. Time Recording, señala exceso o déficit</li>
      <li><strong>Acceso seguro</strong> — IBM SSO (w3id) OAuth 2.0, solo lectura, sin almacenamiento de contraseñas</li>
    </ul>
  </div>

  <!-- 5. HOJA DE RUTA -->
  <div class="section">
    <h2>5. Hoja de Ruta</h2>
    <div class="timeline">
      <div class="tl-item"><div class="tl-phase done">✓ Fase 1 — Completada</div><div class="tl-desc">Demo funcional · 11 objetivos · Recomendador de cursos · Alertas de horas y vencimiento</div></div>
      <div class="tl-item"><div class="tl-phase active">→ Fase 2 — En progreso</div><div class="tl-desc">API keys de IBM IT solicitadas · Se conectarán SuccessFactors, Your Learning y Time Recording con datos reales</div></div>
      <div class="tl-item"><div class="tl-phase pending">○ Fase 3 — Planeada</div><div class="tl-desc">Despliegue en servidor IBM central · Acceso para todo el equipo con IBM SSO</div></div>
      <div class="tl-item"><div class="tl-phase pending">○ Fase 4 — Visión futura</div><div class="tl-desc">Notificaciones push · Reportes automáticos para managers · Extensión a otras prácticas IBM</div></div>
    </div>
  </div>

  <!-- 6. CONCLUSIÓN -->
  <div class="section">
    <h2>6. Conclusión</h2>
    <div class="ok">
      <strong>NEXO</strong> es una respuesta directa a un reto real y cotidiano del equipo IBM Colombia. Al consolidar seis plataformas en un único panel inteligente, reduce la gestión de cumplimiento de 12 a 2 horas semanales, elimina los incumplimientos por olvido y permite que cada IBMer se enfoque en lo que realmente importa: <strong>la operativa y el crecimiento profesional.</strong>
    </div>
  </div>

  <div class="footer">
    NEXO · Documento Ejecutivo · IBM Consulting Colombia · Sandra Milena Mojica Duarte · 03045693 · 2026 · IBMers Watsonx Challenge
  </div>

</div>
</body>
</html>`;
  res.send(html);
});

export default router;
