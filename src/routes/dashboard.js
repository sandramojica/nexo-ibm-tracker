// ─────────────────────────────────────────────────────────────────
//  src/routes/dashboard.js
//  Server-side rendered HTML dashboard — no fetch/JS needed.
//  Works directly at http://localhost:3000/dashboard
// ─────────────────────────────────────────────────────────────────
import { Router } from "express";
import { getDemoDashboard, getDemoProfile } from "../services/demoData.js";
import { getCoursesFor } from "../services/courseRecommender.js";
import { getDemoInProgressCourses } from "../services/inProgressCourses.js";

const router = Router();

function pctColor(p) {
  if (p >= 95) return "#15803d";
  if (p >= 70) return "#b45309";
  return "#dc2626";
}
function fillColor(p) {
  if (p >= 95) return "#16a34a";
  if (p >= 70) return "#d97706";
  return "#dc2626";
}

function renderObjective(o, linkedCourses = []) {
  const color = pctColor(o.pct);
  const fill  = fillColor(o.pct);

  const tools = (o.tools || [])
    .map(t => `<a href="${t.url}" target="_blank" style="font-size:11px;background:#f7f8fa;border:1px solid #e5e7eb;border-radius:4px;padding:2px 8px;color:#3b82d4;text-decoration:none;margin-right:4px;">${t.label}</a>`)
    .join("");

  const suggestions = (o.suggestions || [])
    .map(s => `<div style="font-size:12px;padding:2px 0;display:flex;gap:6px;"><span style="color:#3b82d4;">•</span>${s}</div>`)
    .join("");

  const recommendedCoursesHtml = (o.recommendedCourses || []).length > 0
    ? (() => {
        const all  = o.recommendedCourses;
        const top5 = all.slice(0, 5);
        const rest = all.slice(5);
        const renderRow = c =>
          `<div style="font-size:12px;padding:3px 0;">
            <a href="${c.url}" target="_blank" style="color:#3b82d4;text-decoration:none;">${c.displayName || c.nameEs || c.name}</a>
            <span style="font-size:10px;color:#57606a;background:#e5e7eb;border-radius:3px;padding:1px 5px;margin-left:4px;">${c.hours} h</span>
          </div>`;
        return `<div style="margin-top:10px;">
          <div style="font-size:11px;font-weight:700;color:#7c5cd8;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px;">&#128218; Cursos recomendados para tu perfil</div>
          ${top5.map(renderRow).join("")}
          ${rest.length > 0 ? `
          <details style="margin-top:6px;">
            <summary style="cursor:pointer;display:inline-block;background:#7c5cd8;color:#fff;border-radius:6px;padding:5px 14px;font-size:11px;font-weight:700;list-style:none;user-select:none;">
              &#43; Ver ${rest.length} cursos m&#225;s
            </summary>
            <div style="margin-top:6px;padding-left:4px;">
              ${rest.map(renderRow).join("")}
            </div>
          </details>` : ""}
        </div>`;
      })()
    : "";

  // Cursos en progreso vinculados a este objetivo
  const linkedCoursesHtml = linkedCourses.length > 0
    ? `<div style="margin-top:10px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
        <div style="font-size:11px;font-weight:700;background:#f0f9ff;border-bottom:1px solid #e5e7eb;padding:7px 12px;color:#0369a1;text-transform:uppercase;letter-spacing:.04em;">
          🎓 Cursos en progreso relacionados con este objetivo
        </div>
        ${linkedCourses.map(c => {
          const barColor = c.alert.level === "OVERDUE" || c.alert.level === "CRITICAL" ? "#dc2626"
                         : c.alert.level === "WARNING" ? "#d97706" : "#16a34a";
          const mandBadge = c.mandatory
            ? `<span style="font-size:10px;background:#dc2626;color:#fff;border-radius:3px;padding:1px 5px;margin-left:4px;">MAND</span>`
            : `<span style="font-size:10px;background:#3b82d4;color:#fff;border-radius:3px;padding:1px 5px;margin-left:4px;">OPC</span>`;
          const alertStyle = c.alert.level === "OVERDUE" || c.alert.level === "CRITICAL"
            ? "color:#a8071a;font-size:11px;"
            : c.alert.level === "WARNING" ? "color:#874d00;font-size:11px;" : "color:#15803d;font-size:11px;";
          return `
            <div style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
                <span style="font-size:12px;font-weight:600;">
                  <a href="${c.url}" target="_blank" style="color:#1f2328;text-decoration:none;">${c.nameEs || c.name}</a>
                  ${mandBadge}
                </span>
                <span style="font-size:13px;font-weight:700;color:${barColor};">${c.progressPct}%</span>
              </div>
              <div style="height:5px;background:#e5e7eb;border-radius:3px;margin-bottom:5px;overflow:hidden;">
                <div style="height:100%;width:${c.progressPct}%;background:${barColor};border-radius:3px;"></div>
              </div>
              <div style="${alertStyle}">
                ${c.alert.level === "OVERDUE" || c.alert.level === "CRITICAL" ? `<span class="blink-red" style="display:inline;font-size:18px;">🚨</span> ` : ""}${c.alert.message}
              </div>
              ${c.paceSuggestion ? `<div style="font-size:11px;color:#57606a;margin-top:3px;">
                <span class="blink-bulb" style="display:inline;font-size:18px;">💡</span> ${c.paceSuggestion}
              </div>` : ""}
            </div>`;
        }).join("")}
      </div>`
    : "";

  const alert = o.hoursAlert
    ? `<div class="${o.hoursAlert.level === "CRITICAL" ? "blink-red" : o.hoursAlert.level === "WARNING" ? "blink-yellow" : ""}"
          style="border-radius:5px;padding:8px 12px;margin-top:8px;font-size:12px;font-weight:600;
          ${o.hoursAlert.level === "CRITICAL" ? "background:#fff1f0;border:1px solid #ffa39e;color:#a8071a;" :
            o.hoursAlert.level === "WARNING"  ? "background:#fffbe6;border:1px solid #ffe58f;color:#874d00;" :
                                                "background:#f0fdf4;border:1px solid #86efac;color:#15803d;"}">
        ${o.hoursAlert.level === "CRITICAL" ? `<span class="blink-red" style="display:inline;font-size:18px;">🚨</span> ` : ""}⏱ ${o.hoursAlert.message}
      </div>`
    : "";

  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:10px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;">
        <span style="font-size:11px;font-weight:700;color:#3b82d4;background:#eff6ff;border-radius:4px;padding:2px 6px;white-space:nowrap;">Goal ${o.id}</span>
        <span style="font-size:13px;font-weight:800;flex:1;color:#1f2328;">${o.title}</span>
        <span style="font-size:18px;font-weight:700;white-space:nowrap;color:${color};">${o.pct}%</span>
      </div>
      <div style="height:6px;background:#e5e7eb;border-radius:3px;margin-bottom:10px;overflow:hidden;">
        <div style="height:100%;width:${o.pct}%;background:${fill};border-radius:3px;"></div>
      </div>
      <div style="font-size:11px;color:#57606a;margin-bottom:8px;">${o.target}</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
        <div style="display:flex;gap:6px;flex-wrap:wrap;flex:1;">${tools}</div>
        <a href="${process.env.BOX_FOLDER_URL || '#'}" target="_blank" rel="noopener noreferrer"
           style="display:inline-flex;align-items:center;gap:5px;background:#0061d5;color:#fff;text-decoration:none;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:700;white-space:nowrap;">
          &#128193; Para Manager
        </a>
      </div>
      ${alert}
      ${linkedCoursesHtml}
      ${suggestions ? `<div style="background:#f7f8fa;border-radius:6px;padding:10px 12px;margin-top:8px;">
        <div style="font-size:11px;font-weight:700;color:#57606a;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em;">Sugerencias</div>
        ${suggestions}
      </div>` : ""}
      ${recommendedCoursesHtml}
      ${o.holidayTimeGuide ? renderHolidayTimeGuide(o.holidayTimeGuide) : ""}
    </div>`;
}

// ── Renderiza el panel de festivos 2026 + guía de códigos Time ────
function renderHolidayTimeGuide(guide) {
  const MONTHS_ES      = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const MONTHS_SHORT   = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const DAYS_HEADER    = ["L","M","M","J","V","S","D"];
  const DAYS_ES        = ["dom","lun","mar","mié","jue","vie","sáb"];

  const today    = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Alerta semana actual
  const dow       = today.getDay();
  const monOffset = dow === 0 ? -6 : 1 - dow;
  const weekMon   = new Date(today); weekMon.setDate(today.getDate() + monOffset);
  const weekSun   = new Date(weekMon); weekSun.setDate(weekMon.getDate() + 6);
  const thisWeek  = guide.holidays.filter(h => h.date >= weekMon.toISOString().slice(0,10) && h.date <= weekSun.toISOString().slice(0,10));

  const weekAlert = thisWeek.length > 0
    ? `<div style="background:#fef9c3;border:2px solid #facc15;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#713f12;display:flex;align-items:center;gap:8px;">
        <span style="font-size:20px;">&#127881;</span>
        <div><strong>&#161;Esta semana hay festivo${thisWeek.length > 1 ? "s" : ""} en Colombia!</strong><br>
        ${thisWeek.map(h => `<span style="font-weight:600;">${DAYS_ES[new Date(h.date+"T00:00:00").getDay()]} ${new Date(h.date+"T00:00:00").getDate()} de ${MONTHS_ES[new Date(h.date+"T00:00:00").getMonth()]} — ${h.name}</span>`).join("<br>")}
        <span style="display:block;margin-top:3px;opacity:.8;">Recuerda registrar en Time con los c&#243;digos correctos.</span></div>
      </div>`
    : "";

  // Agrupar festivos por mes
  const byMonth = {};
  guide.holidays.forEach(h => {
    const m = parseInt(h.date.slice(5,7)) - 1;
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(h);
  });

  // Colores por tipo
  const MONTH_COLORS = [
    "#3b82d4","#7c3aed","#15803d","#b45309",
    "#dc2626","#0369a1","#7c3aed","#15803d",
    "#b45309","#dc2626","#3b82d4","#7c5cd8"
  ];

  // Renderiza un mini-calendario de un mes
  function renderMonthCalendar(monthIdx, holidays) {
    const year  = 2026;
    const color = MONTH_COLORS[monthIdx];
    const firstDay = new Date(year, monthIdx, 1);
    // lunes=0 … domingo=6
    let startCol = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const holidayDays = new Set(holidays.map(h => parseInt(h.date.slice(8))));
    const holidayMap  = {};
    holidays.forEach(h => { holidayMap[parseInt(h.date.slice(8))] = h; });

    // Construir tabla directamente con arrays de celdas por fila
    const allCells = [];
    // Celdas vacías al inicio
    for (let i = 0; i < startCol; i++) {
      allCells.push(`<td style="padding:1px;"></td>`);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr   = `${year}-${String(monthIdx+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const isHoliday = holidayDays.has(d);
      const isPast    = dateStr < todayStr;
      const isToday   = dateStr === todayStr;
      const h         = holidayMap[d];
      const bg        = isHoliday ? color : isToday ? "#f0f9ff" : "transparent";
      const txtColor  = isHoliday ? "#fff" : isToday ? "#1d4ed8" : isPast ? "#d1d5db" : "#1f2328";
      const fw        = (isHoliday || isToday) ? "bold" : "normal";
      const opacity   = (isPast && !isHoliday) ? "0.4" : "1";
      const titleAttr = isHoliday ? ` title="${h.name.replace(/"/g, "&quot;")}${h.moved ? " (trasladado)" : ""}"` : "";
      allCells.push(
        `<td${titleAttr} style="padding:1px;text-align:center;">` +
        `<span style="display:inline-block;width:26px;height:26px;line-height:26px;border-radius:50%;` +
        `font-size:11px;font-weight:${fw};background:${bg};color:${txtColor};opacity:${opacity};` +
        `${isToday ? "border:2px solid #3b82d4;" : ""}` +
        `${isHoliday ? "cursor:help;" : ""}` +
        `">${d}</span></td>`
      );
    }

    // Agrupar en filas de 7
    const headerRow = `<tr>${DAYS_HEADER.map(d =>
      `<th style="text-align:center;font-size:9px;font-weight:700;color:#94a3b8;padding:2px 1px;">${d}</th>`
    ).join("")}</tr>`;
    let tableRows = headerRow;
    for (let i = 0; i < allCells.length; i += 7) {
      const slice = allCells.slice(i, i + 7);
      while (slice.length < 7) slice.push(`<td></td>`);
      tableRows += `<tr>${slice.join("")}</tr>`;
    }

    const futureHolidays = holidays.filter(h => h.date >= todayStr);
    const holidayList = futureHolidays.map(h => {
      const d   = new Date(h.date + "T00:00:00");
      const num = String(d.getDate()).padStart(2,"0");
      return `<tr><td colspan="2" style="padding:3px 0;font-size:10px;">` +
        `<span style="background:${color};color:#fff;border-radius:3px;padding:1px 5px;font-weight:700;margin-right:5px;">${num} ${MONTHS_SHORT[monthIdx]}</span>` +
        `${h.name}${h.moved ? " (lunes)" : ""}` +
        `</td></tr>`;
    }).join("");

    return (
      `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">` +
      `<div style="background:${color};color:#fff;padding:8px 12px;font-size:12px;font-weight:700;text-align:center;">` +
      `${MONTHS_ES[monthIdx]} 2026` +
      `<span style="font-size:10px;font-weight:normal;opacity:.85;margin-left:6px;">${futureHolidays.length} festivo${futureHolidays.length > 1 ? "s" : ""}</span>` +
      `</div>` +
      `<div style="padding:10px;">` +
      `<table style="border-collapse:collapse;width:100%;">` +
      tableRows +
      `</table>` +
      (holidayList ? `<table style="border-collapse:collapse;width:100%;margin-top:6px;border-top:1px solid #f0f0f0;padding-top:6px;">${holidayList}</table>` : "") +
      `</div>` +
      `</div>`
    );
  }

  const currentMonth = today.getMonth();
  const calendarMonth = currentMonth;
  const currentCalendar = renderMonthCalendar(currentMonth, byMonth[currentMonth] || []);

  // Códigos Time
  const codeRows = guide.codes.map(c => {
    const accCell = c.accountIdOverride
      ? `<span style="font-size:11px;color:#57606a;font-style:italic;">${c.accountIdOverride}</span>`
      : `<span style="font-size:11px;font-weight:700;color:#3b82d4;background:#eff6ff;border-radius:3px;padding:1px 6px;">${guide.accountId}</span>`;
    return `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:12px;">${c.concept}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:11px;text-align:center;">${accCell}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:12px;font-weight:500;">${c.activity}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:11px;color:#57606a;">${c.sap}</td>
    </tr>`;
  }).join("");

  // Próximos festivos (los 3 siguientes)
  const upcoming = guide.holidays.filter(h => h.date >= todayStr).slice(0, 3);
  const upcomingHtml = upcoming.map(h => {
    const d    = new Date(h.date + "T00:00:00");
    const diff = Math.round((d - today) / 86400000);
    const color = diff <= 7 ? "#dc2626" : diff <= 30 ? "#b45309" : "#15803d";
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;">
      <span style="background:${color};color:#fff;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;white-space:nowrap;">
        ${diff === 0 ? "&#161;HOY!" : diff === 1 ? "Ma&#241;ana" : "En " + diff + " d&#237;as"}
      </span>
      <span style="font-size:12px;font-weight:600;color:#1f2328;">${h.name}</span>
      <span style="font-size:11px;color:#57606a;margin-left:auto;white-space:nowrap;">${String(d.getDate()).padStart(2,"0")} ${MONTHS_SHORT[d.getMonth()]}</span>
    </div>`;
  }).join("");

  return `
    <div style="margin-top:14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">

      <!-- Cabecera -->
      <div style="background:#1f2328;color:#fff;padding:12px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span style="font-size:14px;font-weight:700;">&#128197; Festivos Colombia 2026</span>
        <span style="margin-left:auto;font-size:11px;background:#3b82d4;border-radius:4px;padding:3px 10px;font-weight:600;white-space:nowrap;">Account ID: ${guide.accountId}</span>
      </div>

      <div style="padding:14px 16px;">

        <!-- Alerta semana -->
        ${weekAlert}

        <!-- Próximos festivos -->
        ${upcoming.length > 0 ? `
        <div style="background:#f7f8fa;border-radius:8px;padding:10px 12px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#57606a;margin-bottom:8px;">&#9201; Pr&#243;ximos festivos</div>
          ${upcomingHtml}
        </div>` : ""}

        <!-- Calendario mes actual -->
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#57606a;margin-bottom:10px;">&#128198; Calendario — ${MONTHS_ES[calendarMonth]} 2026</div>
        <div style="margin-bottom:16px;">${currentCalendar}</div>

        <!-- Guía de códigos Time -->
        <div style="border-top:1px solid #e5e7eb;padding-top:14px;margin-top:4px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#57606a;margin-bottom:8px;">&#128203; C&#243;digos TIME — c&#243;mo registrar cada ausencia</div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;min-width:480px;">
              <thead>
                <tr style="background:#f7f8fa;">
                  <th style="padding:6px 8px;font-size:11px;font-weight:700;color:#57606a;text-align:left;border-bottom:1px solid #e5e7eb;">Concepto</th>
                  <th style="padding:6px 8px;font-size:11px;font-weight:700;color:#57606a;text-align:center;border-bottom:1px solid #e5e7eb;">Account ID</th>
                  <th style="padding:6px 8px;font-size:11px;font-weight:700;color:#57606a;text-align:left;border-bottom:1px solid #e5e7eb;">Activity (TIME)</th>
                  <th style="padding:6px 8px;font-size:11px;font-weight:700;color:#57606a;text-align:left;border-bottom:1px solid #e5e7eb;">SAP SF</th>
                </tr>
              </thead>
              <tbody>${codeRows}</tbody>
            </table>
          </div>
          <div style="font-size:11px;color:#57606a;font-style:italic;padding:8px 0 6px;">${guide.note}</div>
        </div>

        <!-- Tip lunes -->
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 14px;margin-top:8px;">
          <div style="font-size:12px;color:#15803d;font-weight:700;">&#128161; Sugerencia cada lunes</div>
          <div style="font-size:12px;color:#1f2328;margin-top:4px;line-height:1.7;">
            Revisa si la semana tiene festivo.<br>
            <strong>Descansas el festivo &#8594;</strong> reg&#237;stralo como <em>Designed Holiday</em> (Account ID: <strong>${guide.accountId}</strong>).<br>
            <strong>Trabajas el festivo &#8594;</strong> registra horas normales en tu proyecto; el d&#237;a compensatorio como <em>Paid Time Not Worked – Additional Time Off Paid</em> con aprobaci&#243;n del Manager.
          </div>
        </div>

      </div>
    </div>`;
}

export function buildDashboardHtml(isManager = false) {
  const objectives      = getDemoDashboard();
  const profile         = getDemoProfile();
  const inProgress      = getDemoInProgressCourses();
  const mandatory       = inProgress.filter(c => c.mandatory);
  const optional        = inProgress.filter(c => !c.mandatory);

  // Index: objectiveId → courses in progress that support it
  const coursesByObjective = {};
  inProgress.forEach(c => {
    (c.objectiveIds || []).forEach(oid => {
      if (!coursesByObjective[oid]) coursesByObjective[oid] = [];
      coursesByObjective[oid].push(c);
    });
  });

  // Personal development courses based on Sandra's preferences
  const interestCourses = getCoursesFor(
    profile.specialization,
    "ENTRY",
    profile.band,
    {
      lang:      process.env.USER_LEARNING_LANG ?? "en",
      interests: (process.env.USER_INTERESTS ?? "english,soft-skills,communication,programming,automation,badges")
                   .split(",").map(s => s.trim()).filter(Boolean),
    }
  );

  const groups = {};
  objectives.forEach(o => {
    if (!groups[o.group]) groups[o.group] = [];
    groups[o.group].push(o);
  });

  const onMeta = objectives.filter(o => o.pct >= 95).length;
  const attn   = objectives.filter(o => o.pct < 70).length;

  // ── Personal development section HTML ──────────────────────────
  const badgeCourses   = interestCourses.filter(c => c.hasBadge);
  const noBadgeCourses = interestCourses.filter(c => !c.hasBadge);

  function renderCourseRow(c) {
    const badge = c.hasBadge
      ? `<span style="font-size:10px;background:#7c5cd8;color:#fff;border-radius:3px;padding:1px 5px;margin-left:4px;">🏅 Insignia</span>`
      : "";
    const lang = c.lang === "en"
      ? `<span style="font-size:10px;background:#dbeafe;color:#1d4ed8;border-radius:3px;padding:1px 5px;margin-left:4px;">🇬🇧 EN</span>`
      : c.lang === "both"
      ? `<span style="font-size:10px;background:#dcfce7;color:#15803d;border-radius:3px;padding:1px 5px;margin-left:4px;">ES/EN</span>`
      : `<span style="font-size:10px;background:#dcfce7;color:#15803d;border-radius:3px;padding:1px 5px;margin-left:4px;">🇨🇴 ES</span>`;
    return `<div style="padding:6px 0;border-bottom:1px solid #f0f0f0;display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;">
      <a href="${c.url}" target="_blank" style="color:#3b82d4;text-decoration:none;font-size:13px;font-weight:500;">${c.displayName || c.nameEs || c.name}</a>
      ${badge}${lang}
      <span style="font-size:11px;color:#57606a;background:#f0f0f0;border-radius:3px;padding:1px 5px;margin-left:2px;">${c.hours} h</span>
    </div>`;
  }

  // Top 5: primero badges, luego el resto, máx 5 en total
  const top5 = [...badgeCourses, ...noBadgeCourses].slice(0, 5);
  const allCourses = [...badgeCourses, ...noBadgeCourses];

  const personalDevSection = `
    <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#57606a;margin:24px 0 8px;border-left:3px solid #7c5cd8;padding-left:8px;">
      Desarrollo Personal — Cursos Recomendados para ti
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:10px;">
      <div style="font-size:12px;color:#57606a;margin-bottom:12px;">
        Basado en tu perfil: <strong>Contadora P&#250;blica · Banda 4 · Idioma meta: Ingl&#233;s</strong><br>
        Intereses: Ingl&#233;s · Habilidades Blandas · Comunicaci&#243;n · Programaci&#243;n · Automatizaci&#243;n · Insignias
      </div>

      <div style="font-size:11px;font-weight:700;color:#7c5cd8;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">&#11088; Top 5 — m&#225;s aplicables a tu perfil</div>
      ${top5.map(renderCourseRow).join("")}

      ${allCourses.length > 5 ? `
      <details style="margin-top:10px;">
        <summary style="cursor:pointer;display:inline-block;background:#7c5cd8;color:#fff;border-radius:6px;padding:6px 16px;font-size:12px;font-weight:700;list-style:none;user-select:none;">
          &#43; Ver ${allCourses.length - 5} cursos m&#225;s
        </summary>
        <div style="margin-top:8px;padding-left:4px;">
          ${allCourses.slice(5).map(renderCourseRow).join("")}
        </div>
      </details>` : ""}
    </div>`;

  // ── In-progress courses section ──────────────────────────────
  function alertStyle(level) {
    if (level === "OVERDUE")  return "background:#fff1f0;border:1px solid #ffa39e;color:#a8071a;";
    if (level === "CRITICAL") return "background:#fff1f0;border:1px solid #ffa39e;color:#a8071a;";
    if (level === "WARNING")  return "background:#fffbe6;border:1px solid #ffe58f;color:#874d00;";
    return "background:#f0fdf4;border:1px solid #86efac;color:#15803d;";
  }

  function renderInProgressCard(c) {
    const barColor = c.alert.level === "OVERDUE" || c.alert.level === "CRITICAL" ? "#dc2626"
                   : c.alert.level === "WARNING" ? "#d97706" : "#16a34a";
    const mandBadge = c.mandatory
      ? `<span style="font-size:10px;background:#dc2626;color:#fff;border-radius:3px;padding:1px 6px;margin-left:6px;">MANDATORIO</span>`
      : `<span style="font-size:10px;background:#3b82d4;color:#fff;border-radius:3px;padding:1px 6px;margin-left:6px;">OPCIONAL</span>`;
    return `
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-bottom:8px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;">
          <div style="flex:1;">
            <a href="${c.url}" target="_blank" style="font-size:13px;font-weight:600;color:#1f2328;text-decoration:none;">${c.nameEs || c.name}</a>
            ${mandBadge}
          </div>
          <span style="font-size:16px;font-weight:700;color:${barColor};white-space:nowrap;">${c.progressPct}%</span>
        </div>

        <!-- Progress bar -->
        <div style="height:8px;background:#e5e7eb;border-radius:4px;margin-bottom:8px;overflow:hidden;">
          <div style="height:100%;width:${c.progressPct}%;background:${barColor};border-radius:4px;"></div>
        </div>

        <!-- Alert -->
        <div class="${c.alert.level === "CRITICAL" || c.alert.level === "OVERDUE" ? "blink-red" : c.alert.level === "WARNING" ? "blink-yellow" : ""}"
             style="border-radius:5px;padding:6px 10px;font-size:12px;margin-bottom:6px;${alertStyle(c.alert.level)}">
          ${c.alert.level === "CRITICAL" || c.alert.level === "OVERDUE" ? `<span class="blink-red" style="display:inline;font-size:18px;">🚨</span> ` : ""}${c.alert.message}
        </div>

        <!-- Pace suggestion -->
        ${c.paceSuggestion ? `
        <div style="background:#f7f8fa;border-radius:5px;padding:7px 10px;font-size:12px;color:#1f2328;margin-top:4px;">
          <span class="blink-bulb" style="display:inline;font-size:18px;">💡</span> ${c.paceSuggestion}
        </div>` : ""}
      </div>`;
  }

  // Alerta global de cursos urgentes en el resumen
  const criticalCount = inProgress.filter(c => c.alert.level === "CRITICAL" || c.alert.level === "OVERDUE").length;
  const globalAlert = criticalCount > 0
    ? `<div class="blink-red" style="background:#fff1f0;border:1px solid #ffa39e;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:13px;color:#a8071a;display:flex;align-items:center;gap:8px;">
        <span class="blink-red" style="display:inline;font-size:22px;">🚨</span> <strong>${criticalCount} curso${criticalCount > 1 ? "s" : ""} urgente${criticalCount > 1 ? "s" : ""}</strong> — vence${criticalCount > 1 ? "n" : ""} en menos de 8 días. Encuéntralos dentro de cada objetivo marcado en rojo.
      </div>`
    : "";

  // Cursos sin objetivo asignado → van al final
  const unlinkedCourses = inProgress.filter(c => !c.objectiveIds || c.objectiveIds.length === 0);
  const unlinkedMandatory = unlinkedCourses.filter(c => c.mandatory);
  const unlinkedOptional  = unlinkedCourses.filter(c => !c.mandatory);

  const unlinkedSection = unlinkedCourses.length > 0 ? `
    <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#57606a;margin:24px 0 8px;border-left:3px solid #94a3b8;padding-left:8px;">
      Cursos sin objetivo asignado
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-bottom:10px;">
      <div style="font-size:12px;color:#57606a;margin-bottom:10px;">
        Estos cursos no están vinculados a ningún objetivo. Puedes asignarlos editando el archivo de configuración.
      </div>
      ${unlinkedMandatory.length > 0 ? `
        <div style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;margin-bottom:6px;">⚠️ Mandatorios</div>
        ${unlinkedMandatory.map(renderInProgressCard).join("")}
      ` : ""}
      ${unlinkedOptional.length > 0 ? `
        <div style="font-size:11px;font-weight:700;color:#3b82d4;text-transform:uppercase;margin:10px 0 6px;">📘 Opcionales</div>
        ${unlinkedOptional.map(renderInProgressCard).join("")}
      ` : ""}
    </div>` : "";

  // Build body: alerta global + objetivos con cursos dentro + sin objetivo al final
  let body = globalAlert;
  for (const [group, items] of Object.entries(groups)) {
    body += `<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#57606a;margin:20px 0 8px;border-left:3px solid #3b82d4;padding-left:8px;">${group}</div>`;
    items.forEach(o => {
      const linked = coursesByObjective[o.id] || [];
      body += renderObjective(o, linked);
    });
  }
  body += unlinkedSection;
  body += personalDevSection;

  const badgeLabel = isManager
    ? `<span style="background:#7c5cd8;color:#fff;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;margin-left:auto;">VISTA MANAGER</span>`
    : `<span style="background:#7c5cd8;color:#fff;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;margin-left:auto;">DEMO</span>`;

  const managerBanner = isManager
    ? `<div style="background:#fffbe6;border:1px solid #ffe58f;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#874d00;display:flex;align-items:center;gap:8px;">
        &#128274; <strong>Vista de solo lectura.</strong> Esta p&#225;gina es exclusiva para tu manager. No se pueden realizar cambios desde aqu&#237;.
       </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>IBM Objectives Tracker</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,"Segoe UI",system-ui,sans-serif;background:#f7f8fa;color:#1f2328;}
    @keyframes blink-red {
      0%,100% { opacity:1; box-shadow:0 0 8px 3px rgba(220,38,38,0.9); }
      50%      { opacity:0; box-shadow:none; }
    }
    @keyframes blink-yellow {
      0%,100% { opacity:1; box-shadow:0 0 6px 2px rgba(234,179,8,0.7); }
      50%      { opacity:0; box-shadow:none; }
    }
    .blink-red    { animation: blink-red    0.8s step-start infinite; }
    .blink-yellow { animation: blink-yellow 1.6s step-start -1.2s infinite; }
    .blink-bulb   { animation: blink-yellow 1.6s step-start -2.0s infinite; }
  </style>
</head>
<body>
<div style="max-width:760px;margin:0 auto;padding:24px 16px 48px;">

  <div style="background:#1f2328;color:#fff;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <span style="font-size:22px;font-weight:700;color:#3b82d4;letter-spacing:-1px;">IBM</span>
      <h1 style="font-size:17px;font-weight:600;">NEXO</h1>
      <span style="font-size:11px;color:#94a3b8;margin-left:2px;font-style:italic;">Tu enlace con tus objetivos IBM</span>
      ${badgeLabel}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
      <span style="background:rgba(255,255,255,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c9d1d9;">${profile.name}</span>
      <span style="background:rgba(255,255,255,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c9d1d9;">${profile.role} · Banda ${profile.band}</span>
      <span style="background:rgba(255,255,255,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c9d1d9;">${profile.profession}</span>
      <span style="background:rgba(255,255,255,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c9d1d9;">${profile.practice} · ${profile.specialization}</span>
    </div>
  </div>

  ${managerBanner}

  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#3b82d4;">${objectives.length}</div>
      <div style="font-size:11px;color:#57606a;margin-top:2px;">Objetivos totales</div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#15803d;">${onMeta}</div>
      <div style="font-size:11px;color:#57606a;margin-top:2px;">En meta (≥95%)</div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#dc2626;">${attn}</div>
      <div style="font-size:11px;color:#57606a;margin-top:2px;">Requieren atención</div>
    </div>
  </div>

  <div style="margin-bottom:20px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#57606a;margin-bottom:10px;border-left:3px solid #3b82d4;padding-left:8px;">Acceso R&#225;pido a Plataformas IBM</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
      ${[
        { icon:"&#128218;", name:"Your Learning",    desc:"Cursos, badges y trainings",          bg:"#1d4ed8", url:"https://yourlearning.ibm.com" },
        { icon:"&#127919;", name:"SuccessFactors",   desc:"Objetivos, feedback y reflections",   bg:"#15803d", url:"https://sf-wz-prd-p2-4snxii8t.workzonehr.cfapps.us10.hana.ondemand.com/site#workzone-home" },
        { icon:"&#9203;",   name:"Time Recording",   desc:"Registro de horas y timesheets",      bg:"#7c3aed", url:"https://time.ibm.com/week" },
        { icon:"&#128202;", name:"My Hours Plan",    desc:"Asignaci&#243;n y utilizaci&#243;n",  bg:"#b45309", url:"https://w3.ibm.com/services/tools/mysa/app/#/login" },
      ].map(b => isManager
        ? `<div style="display:block;border-radius:8px;padding:14px 12px;text-align:center;color:#fff;background:${b.bg};opacity:0.75;cursor:default;">
            <span style="font-size:22px;display:block;margin-bottom:4px;">${b.icon}</span>
            <span style="font-size:13px;font-weight:700;display:block;">${b.name}</span>
            <span style="font-size:10px;opacity:.8;display:block;margin-top:2px;line-height:1.3;">${b.desc}</span>
           </div>`
        : `<a href="${b.url}" target="_blank" rel="noopener noreferrer"
              style="display:block;text-decoration:none;border-radius:8px;padding:14px 12px;text-align:center;color:#fff;background:${b.bg};">
            <span style="font-size:22px;display:block;margin-bottom:4px;">${b.icon}</span>
            <span style="font-size:13px;font-weight:700;display:block;">${b.name}</span>
            <span style="font-size:10px;opacity:.8;display:block;margin-top:2px;line-height:1.3;">${b.desc}</span>
            <span style="display:inline-block;margin-top:8px;font-size:11px;font-weight:700;background:rgba(255,255,255,0.2);border-radius:20px;padding:2px 10px;">Ir ahora &#8594;</span>
           </a>`
      ).join("")}
    </div>
  </div>

  ${body}

  <div style="text-align:center;margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#57606a;">Made with IBM Bob</div>
</div>
</body>
</html>`;

  return html;
}

router.get("/", (_req, res) => {
  res.send(buildDashboardHtml(false));
});

export default router;
