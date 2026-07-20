// ─────────────────────────────────────────────────────────────────
//  src/services/objectivesEngine.js
//  Aggregates data from all IBM APIs into objective completion %.
//  Each objective maps to specific API data points.
// ─────────────────────────────────────────────────────────────────
import { getUtilization, getSelfAssessmentStatus, getFeedbackStatus, getReflectionsStatus } from "./successFactors.js";
import { getLearningHours, getBadges, getMandatoryTrainings, getPracticeLearningProgress } from "./yourLearning.js";
import { getTimesheetCompliance, getHoursPlan } from "./timeRecording.js";
import { getCoursesFor } from "./courseRecommender.js";

/**
 * Build the full objectives dashboard for a given user.
 * @param {string} bearerToken  - OAuth token from the authenticated session
 * @param {string} userId       - SF userId (sub from JWT)
 * @param {object} userProfile  - Enriched profile { band, practice, specialization, ... }
 * @returns {Promise<Array>}    - Array of objective objects with pct, status, suggestions
 */
export async function buildObjectivesDashboard(bearerToken, userId, userProfile = {}) {
  // Fetch all data sources in parallel
  const [
    utilization,
    selfAssess,
    feedback,
    reflections,
    learningHours,
    badges,
    trainings,
    practiceProgress,
    timesheet,
    hoursPlan,
  ] = await Promise.allSettled([
    getUtilization(bearerToken, userId),
    getSelfAssessmentStatus(bearerToken, userId),
    getFeedbackStatus(bearerToken, userId),
    getReflectionsStatus(bearerToken, userId),
    getLearningHours(bearerToken, userId),
    getBadges(bearerToken, userId),
    getMandatoryTrainings(bearerToken, userId),
    getPracticeLearningProgress(bearerToken, userId),
    getTimesheetCompliance(bearerToken, userId),
    getHoursPlan(bearerToken, userId),
  ]).then((results) => results.map((r) => (r.status === "fulfilled" ? r.value : null)));

  // Safe extractors
  const util   = utilization   ?? { utilizationPct: 0, targetPct: 95 };
  const sa     = selfAssess    ?? { s1Completed: false, s2Completed: false };
  const fb     = feedback      ?? { requested: 0, received: 0, answered: 0 };
  const ref    = reflections   ?? { s1Completed: false, s2Completed: false };
  const hours  = learningHours ?? { hoursCompleted: 0, targetHours: 40 };
  const bdg    = badges        ?? { badgesEarned: 0, hasGrowthBehavioursBadge: false, badges: [] };
  const tr     = trainings     ?? [];
  const pp     = practiceProgress ?? { entry: { pct: 0 }, foundation: { pct: 0 } };
  const ts     = timesheet     ?? { compliancePct: 0, currentWeekSubmitted: false };
  const hp     = hoursPlan     ?? { planned: 0, actual: 0, utilizationPct: 0 };

  // Profile helpers
  const band           = String(userProfile.band           ?? process.env.USER_BAND           ?? "4");
  const practice       = userProfile.practice              ?? process.env.USER_PRACTICE        ?? "Consulting";
  const specialization = userProfile.specialization        ?? process.env.USER_SPECIALIZATION  ?? "R2R/P2P/O2C";

  const corporateTrainings = tr.filter((t) => t.type === "CORPORATE");
  const consultingTrainings = tr.filter((t) => t.type === "CONSULTING");

  function trainingCompliancePct(list) {
    if (list.length === 0) return 100;
    const onTime = list.filter((t) => {
      if (t.completedDate && t.dueDate) {
        const completed = new Date(t.completedDate);
        const due = new Date(t.dueDate);
        const msInDay = 86_400_000;
        return due - completed >= 5 * msInDay; // completed 5+ days before due
      }
      return false;
    });
    return Math.round((onTime.length / list.length) * 100);
  }

  const semesterPct = (s1, s2) => {
    const done = [s1, s2].filter(Boolean).length;
    return Math.round((done / 2) * 100);
  };

  // ── Objective definitions ───────────────────────────────────────
  return [
    // GROUP 1
    {
      id: "1A",
      group: "Utilización Personal",
      title: "Alcanzar mínimo 95% de utilización personal (MyScore)",
      pct: Math.min(util.utilizationPct, 100),
      target: `${util.utilizationPct}% / meta 95%`,
      tools: [
        { label: "MyScore", url: "https://w3.ibm.com/myscore" },
        { label: "SuccessFactors", url: "https://w3.ibm.com/successfactors" },
        { label: "Time – My Hours Plan", url: "https://w3.ibm.com/time" },
      ],
      suggestions: buildUtilizationSuggestions(util),
      raw: { util },
    },

    // GROUP 2
    {
      id: "2A",
      group: "Desarrollo y Aprendizaje",
      title: "Autoevaluación semestral de competencias (Your Career)",
      pct: semesterPct(sa.s1Completed, sa.s2Completed),
      target: `S1: ${sa.s1Completed ? "✓" : "Pendiente"} · S2: ${sa.s2Completed ? "✓" : "Pendiente"}`,
      tools: [{ label: "Your Career at IBM", url: "https://w3.ibm.com/careers/your-career-at-ibm" }],
      suggestions: buildSelfAssessSuggestions(sa),
      raw: { sa },
    },
    {
      id: "2B",
      group: "Desarrollo y Aprendizaje",
      title: "Trainings Corporativos mandatorios (5 días antes del vencimiento)",
      pct: trainingCompliancePct(corporateTrainings),
      target: `${corporateTrainings.filter((t) => t.status === "COMPLETED").length} / ${corporateTrainings.length} completados a tiempo`,
      tools: [
        { label: "Your Learning", url: "https://yourlearning.ibm.com" },
        { label: "SuccessFactors Learning", url: "https://w3.ibm.com/successfactors" },
      ],
      suggestions: buildTrainingSuggestions(corporateTrainings, "Corporativos"),
      raw: { trainings: corporateTrainings },
    },
    {
      id: "2C",
      group: "Desarrollo y Aprendizaje",
      title: "Trainings de Consulting mandatorios (5 días antes del vencimiento)",
      pct: trainingCompliancePct(consultingTrainings),
      target: `${consultingTrainings.filter((t) => t.status === "COMPLETED").length} / ${consultingTrainings.length} completados a tiempo`,
      tools: [{ label: "Your Learning", url: "https://yourlearning.ibm.com" }],
      suggestions: buildTrainingSuggestions(consultingTrainings, "Consulting"),
      raw: { trainings: consultingTrainings },
    },
    {
      id: "2D",
      group: "Desarrollo y Aprendizaje",
      title: "Estándares de aprendizaje – nivel Entry (R2R/P2P/O2C)",
      pct: pp.entry.pct,
      target: pp.entry.completed ? "Completado ✓" : `${pp.entry.pct}% hacia Entry`,
      tools: [
        { label: "Your Learning", url: "https://yourlearning.ibm.com" },
        { label: "Your Career at IBM", url: "https://w3.ibm.com/careers/your-career-at-ibm" },
      ],
      suggestions: buildEntryCourseSuggestions(pp, specialization, band),
      recommendedCourses: pp.entry.completed ? [] : getCoursesFor(specialization, "ENTRY", band),
      raw: { pp },
    },
    {
      id: "2E",
      group: "Desarrollo y Aprendizaje",
      title: "Progreso hacia nivel Foundation – rol primario",
      pct: pp.foundation.pct,
      target: pp.foundation.completed ? "Completado ✓" : `${pp.foundation.pct}% hacia Foundation`,
      tools: [{ label: "Your Learning", url: "https://yourlearning.ibm.com" }],
      suggestions: buildFoundationCourseSuggestions(pp, specialization, band),
      recommendedCourses: pp.entry.completed ? getCoursesFor(specialization, "FOUNDATION", band) : [],
      raw: { pp },
    },
    {
      id: "2F",
      group: "Desarrollo y Aprendizaje",
      title: "Obtener IBM Growth Behaviours Badge",
      pct: bdg.hasGrowthBehavioursBadge ? 100 : 0,
      target: bdg.hasGrowthBehavioursBadge ? "Badge obtenido ✓" : "Pendiente",
      tools: [
        { label: "Credly – Growth Behaviours", url: "https://yourlearning.ibm.com/credential/CREDLY-06dd24c7-5946-4ac3-b4aa-fd6c902e0ca6" },
        { label: "Your Learning", url: "https://yourlearning.ibm.com" },
      ],
      suggestions: bdg.hasGrowthBehavioursBadge
        ? ["Badge obtenido. Compártelo en tu perfil IBM y LinkedIn."]
        : ["Accede al enlace Credly y completa el módulo de Growth Behaviours (~2 h) esta semana."],
      raw: { bdg },
    },
    {
      id: "2G",
      group: "Desarrollo y Aprendizaje",
      title: "40 horas de educación + 1 badge antes del 1° dic 2026",
      pct: Math.round(Math.min((hours.hoursCompleted / 40) * 100, 100)),
      target: `${hours.hoursCompleted} / 40 h completadas · ${bdg.badgesEarned} badge(s)`,
      tools: [{ label: "Your Learning", url: "https://yourlearning.ibm.com" }],
      suggestions: buildLearningHoursSuggestions(hours, bdg),
      recommendedCourses: getCoursesFor(specialization, "ENTRY", band).slice(0, 3),
      raw: { hours, bdg },
    },

    // GROUP 3
    {
      id: "3B",
      group: "Gestión Personal y Administrativa",
      title: "Registro de horas en Time semanalmente",
      pct: ts.compliancePct,
      target: `${ts.submittedWeeks ?? 0} / ${ts.totalWeeks ?? 0} semanas registradas`,
      tools: [
        { label: "Time – IBM", url: "https://w3.ibm.com/time" },
        { label: "My Hours Plan", url: "https://w3.ibm.com/time/hoursplan" },
      ],
      suggestions: buildTimesheetSuggestions(ts, hp),
      hoursAlert: buildHoursAlert(ts, hp),
      raw: { ts, hp },
    },
    {
      id: "3D",
      group: "Gestión Personal y Administrativa",
      title: "Solicitar mínimo 6 retroalimentaciones por semestre",
      pct: Math.min(Math.round((fb.requested / 6) * 100), 100),
      target: `${fb.requested} / 6 solicitadas este semestre`,
      tools: [
        { label: "SuccessFactors", url: "https://w3.ibm.com/successfactors" },
        { label: "Your Career at IBM", url: "https://w3.ibm.com/careers/your-career-at-ibm" },
      ],
      suggestions: buildFeedbackSuggestions(fb),
      raw: { fb },
    },
    {
      id: "3F",
      group: "Gestión Personal y Administrativa",
      title: "Atender 100% de solicitudes de retroalimentación recibidas",
      pct: fb.received > 0 ? Math.round((fb.answered / fb.received) * 100) : 100,
      target: `${fb.answered} / ${fb.received} atendidas`,
      tools: [{ label: "SuccessFactors", url: "https://w3.ibm.com/successfactors" }],
      suggestions:
        fb.received > fb.answered
          ? [`Tienes ${fb.received - fb.answered} solicitud(es) de feedback sin responder. Respóndelas en SuccessFactors esta semana.`]
          : ["Sin solicitudes pendientes de responder. ¡Excelente!"],
      raw: { fb },
    },
    {
      id: "3G",
      group: "Gestión Personal y Administrativa",
      title: "Documentar objetivos y Reflections en tiempo y forma",
      pct: semesterPct(ref.s1Completed, ref.s2Completed),
      target: `S1: ${ref.s1Completed ? "✓" : "Pendiente"} · S2: ${ref.s2Completed ? "✓" : "Pendiente"}`,
      tools: [{ label: "SuccessFactors", url: "https://w3.ibm.com/successfactors" }],
      suggestions: buildReflectionsSuggestions(ref),
      raw: { ref },
    },
  ];
}

// ── Suggestion builders ───────────────────────────────────────────

function buildUtilizationSuggestions(util) {
  const pct = util.utilizationPct;
  if (pct >= 95) return ["Utilización en meta. Sigue registrando horas semanalmente en Time."];
  if (pct >= 85) return [
    `Utilización actual: ${pct}%. Necesitas ${95 - pct}% más para alcanzar la meta.`,
    "Revisa tu Hours Plan en Time cada lunes y confirma que tienes horas asignadas toda la semana.",
    "Habla con tu manager sobre asignación de proyecto si tienes días libres.",
  ];
  return [
    `Utilización en ${pct}% – muy por debajo del 95%. Requiere atención inmediata.`,
    "Contacta a tu Practice Lead para solicitar asignación a proyecto activo.",
    "Revisa en MyScore si hay discrepancias entre horas planificadas y registradas.",
  ];
}

function buildSelfAssessSuggestions(sa) {
  if (sa.s1Completed && sa.s2Completed) return ["Autoevaluaciones S1 y S2 completadas. ✓"];
  const tips = [];
  if (!sa.s1Completed) tips.push("S1 pendiente: agenda 1 h antes del 15 de junio para completar la autoevaluación en Your Career.");
  if (!sa.s2Completed) tips.push("S2 pendiente: programa la autoevaluación de fin de año antes del 15 de diciembre.");
  tips.push("Revisa las competencias de tu banda antes de autoevaluarte para calibrar bien el nivel.");
  return tips;
}

function buildTrainingSuggestions(list, type) {
  const overdue  = list.filter((t) => t.status === "OVERDUE");
  const dueSoon  = list.filter((t) => t.status === "DUE_SOON");
  const tips = [];
  if (overdue.length > 0)
    tips.push(`⚠ ${overdue.length} training(s) ${type} VENCIDO(S): ${overdue.map((t) => t.name).join(", ")}. Complétalo(s) inmediatamente.`);
  if (dueSoon.length > 0)
    tips.push(`${dueSoon.length} training(s) vence(n) en los próximos 10 días: ${dueSoon.map((t) => `${t.name} (${t.daysUntilDue} días)`).join(", ")}.`);
  if (overdue.length === 0 && dueSoon.length === 0)
    tips.push(`Todos los trainings ${type} están al día. Continúa revisando Your Learning semanalmente.`);
  tips.push("Dedica al menos 1 h por semana a trainings mandatorios.");
  return tips;
}

function buildLearningHoursSuggestions(hours, bdg) {
  const tips = [];
  const remaining = Math.max(0, 40 - hours.hoursCompleted);
  if (remaining > 0) tips.push(`Faltan ${remaining.toFixed(1)} horas para alcanzar las 40 h. Dedica 2 h/semana en Your Learning.`);
  else tips.push("Meta de 40 horas alcanzada. ✓");
  if (!bdg.hasGrowthBehavioursBadge) tips.push("Aún no tienes el Growth Behaviours Badge. Complétalo en Credly.");
  if (bdg.badgesEarned === 0) tips.push("Obtén al menos 1 badge antes del 1 de diciembre de 2026.");
  return tips;
}

function buildTimesheetSuggestions(ts, hp = {}) {
  const tips = [];
  if (!ts.currentWeekSubmitted) tips.push("⚠ No has registrado las horas de esta semana en Time. Hazlo hoy antes de las 5 PM.");
  if (ts.compliancePct < 90) tips.push(`Compliance de timesheets: ${ts.compliancePct}%. Configura un recordatorio recurrente los viernes a las 4 PM.`);
  else tips.push("Registro de horas al día. Mantén el hábito semanal.");
  // Hours Plan vs actual
  if (hp.planned > 0) {
    const diff = hp.actual - hp.planned;
    if (diff > hp.planned * 0.25)
      tips.push(`⚠ Tienes ${diff.toFixed(1)} horas extra sobre tu plan mensual. Habla con tu manager para reubicarlas o justificarlas en Time.`);
    else if (diff > hp.planned * 0.10)
      tips.push(`Llevas ${diff.toFixed(1)} h sobre tu Hours Plan. Revisa si hay horas en proyectos incorrectos.`);
    else if (diff < -(hp.planned * 0.10))
      tips.push(`Tienes ${Math.abs(diff).toFixed(1)} h menos que tu plan mensual. Asegúrate de registrar todas las horas trabajadas.`);
  }
  return tips;
}

/** Builds a structured hours alert object for objective 3B */
function buildHoursAlert(ts, hp) {
  if (!hp || hp.planned === 0) return { level: "OK", message: "Sin datos de Hours Plan disponibles." };
  const diff = hp.actual - hp.planned;
  const ratio = diff / hp.planned;
  if (!ts.currentWeekSubmitted)
    return { level: "CRITICAL", message: "No has enviado el timesheet de esta semana. Regístralo hoy en Time." };
  if (ratio > 0.25)
    return { level: "CRITICAL", message: `Exceso de ${diff.toFixed(1)} h sobre tu plan mensual (${hp.planned} h planeadas, ${hp.actual} h registradas). Contacta a tu manager.` };
  if (ratio > 0.10)
    return { level: "WARNING", message: `${diff.toFixed(1)} h sobre tu Hours Plan. Verifica la distribución en Time.` };
  if (ratio < -0.10)
    return { level: "WARNING", message: `Déficit de ${Math.abs(diff).toFixed(1)} h vs tu plan. Asegúrate de registrar todas las horas.` };
  return { level: "OK", message: `Horas registradas (${hp.actual} h) alineadas con tu plan mensual (${hp.planned} h). ✓` };
}

/** Course suggestions for objective 2D (Entry level) */
function buildEntryCourseSuggestions(pp, specialization, band) {
  if (pp.entry.completed) return ["Nivel Entry alcanzado. Avanza hacia Foundation (objetivo 2E)."];
  const courses = getCoursesFor(specialization, "ENTRY", band);
  const tips = [`Para alcanzar el nivel Entry en ${specialization}, completa estos cursos en Your Learning:`];
  courses.slice(0, 3).forEach((c) => tips.push(`→ "${c.displayName || c.name}" (~${c.hours} h) – ${c.url}`));
  tips.push("Revisa también tu learning path en Your Career at IBM para confirmar los requerimientos de tu banda.");
  return tips;
}

/** Course suggestions for objective 2E (Foundation level) */
function buildFoundationCourseSuggestions(pp, specialization, band) {
  if (!pp.entry.completed) return ["Completa primero el nivel Entry antes de avanzar a Foundation."];
  if (pp.foundation.completed) return ["Nivel Foundation alcanzado. ✓ Comparte tu logro con tu manager."];
  const courses = getCoursesFor(specialization, "FOUNDATION", band);
  const tips = [`Entry completado. Ahora avanza a Foundation con estos cursos:`];
  courses.slice(0, 3).forEach((c) => tips.push(`→ "${c.displayName || c.name}" (~${c.hours} h) – ${c.url}`));
  return tips;
}

function buildFeedbackSuggestions(fb) {
  const remaining = Math.max(0, 6 - fb.requested);
  const tips = [];
  if (remaining > 0) tips.push(`Faltan ${remaining} solicitudes de feedback por enviar este semestre. Usa SuccessFactors para enviarlas.`);
  tips.push("Incluye siempre al Manager y Team Leader entre los evaluadores.");
  tips.push("Solicita feedback al finalizar cada entregable o proyecto relevante.");
  return tips;
}

function buildReflectionsSuggestions(ref) {
  const tips = [];
  if (!ref.s1Completed) tips.push("Reflection S1 pendiente. Documenta tus logros del semestre en SuccessFactors usando metodología STAR.");
  if (!ref.s2Completed) tips.push("Reflection S2 pendiente. Programa la redacción 2 semanas antes del cierre de año.");
  if (ref.s1Completed && ref.s2Completed) tips.push("Reflections S1 y S2 completadas. ✓");
  return tips;
}
