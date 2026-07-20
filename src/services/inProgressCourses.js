// ─────────────────────────────────────────────────────────────────
//  src/services/inProgressCourses.js
//  Manages courses currently in progress for the employee.
//  Sources:
//    - DEMO mode  → static list defined here (manual entry)
//    - Real mode  → fetched from Your Learning API
//  Each course has: mandatory flag, due date, progress %, alert level
// ─────────────────────────────────────────────────────────────────
import { differenceInDays, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

const ALERT_DAYS = 8; // alert this many days before due date

/**
 * Compute alert level for a course based on due date and completion.
 * @returns {{ level: "OK"|"WARNING"|"CRITICAL"|"OVERDUE", message: string, daysLeft: number|null }}
 */
export function computeCourseAlert(dueDateStr, progressPct) {
  if (!dueDateStr) return { level: "OK", message: "Sin fecha de vencimiento.", daysLeft: null };
  if (progressPct >= 100) return { level: "OK", message: "Curso completado. ✓", daysLeft: null };

  const today   = new Date();
  const dueDate = parseISO(dueDateStr);
  const daysLeft = differenceInDays(dueDate, today);
  const dueFmt  = format(dueDate, "d 'de' MMMM yyyy", { locale: es });

  if (daysLeft < 0)
    return { level: "OVERDUE", message: `⛔ Vencido hace ${Math.abs(daysLeft)} día(s). Complétalo inmediatamente.`, daysLeft };
  if (daysLeft <= ALERT_DAYS)
    return { level: "CRITICAL", message: `🔴 Vence en ${daysLeft} día(s) (${dueFmt}). ¡Prioridad alta!`, daysLeft };
  if (daysLeft <= ALERT_DAYS * 3)
    return { level: "WARNING", message: `⚠️ Vence el ${dueFmt} (${daysLeft} días). Planifica tiempo esta semana.`, daysLeft };
  return { level: "OK", message: `Vence el ${dueFmt} (${daysLeft} días). Vas bien.`, daysLeft };
}

/**
 * Build completion pace suggestion based on progress and days left.
 */
export function buildPaceSuggestion(course) {
  const { progressPct, dueDate, estimatedHours, name } = course;
  if (progressPct >= 100) return null;
  if (!dueDate) return `Continúa avanzando en "${name}". Dedica al menos 1 h por sesión.`;

  const today    = new Date();
  const daysLeft = differenceInDays(parseISO(dueDate), today);
  if (daysLeft <= 0) return `⛔ "${name}" está vencido. Complétalo hoy mismo.`;

  const pctLeft   = 100 - progressPct;
  const hoursLeft = estimatedHours ? Math.round((pctLeft / 100) * estimatedHours * 10) / 10 : null;

  if (hoursLeft !== null) {
    const hrsPerDay = Math.ceil((hoursLeft / daysLeft) * 10) / 10;
    if (hrsPerDay <= 0.5)
      return `"${name}": faltan ~${hoursLeft} h. Con 30 min/día lo terminas antes del vencimiento. ✓`;
    if (hrsPerDay <= 1)
      return `"${name}": dedica ~1 h/día para completarlo a tiempo (${hoursLeft} h restantes en ${daysLeft} días).`;
    return `"${name}": necesitas ~${hrsPerDay} h/día para terminar a tiempo. Considera bloquearlo en tu calendario.`;
  }
  return `"${name}": llevas ${progressPct}% — sigue avanzando para terminarlo antes del ${format(parseISO(dueDate), "d MMM", { locale: es })}.`;
}

/**
 * Demo in-progress courses for Sandra · Analista Contable · Banda 4
 * Ficticios pero realistas — reemplazar con API de Your Learning
 * cuando lleguen las keys de IBM IT.
 *
 * Campos:
 *   id, name, nameEs, url, progressPct, estimatedHours,
 *   mandatory (true|false), dueDate (ISO string|null),
 *   practice, interests[]
 */
export function getDemoInProgressCourses() {
  const courses = [

    // ── MANDATORIOS (5) ──────────────────────────────────────────
    {
      id:             "MAND-001",
      name:           "IBM Business Conduct Guidelines 2025",
      nameEs:         "Pautas de Conducta Empresarial IBM 2025",
      url:            "https://yourlearning.ibm.com/activity/ILC-BCG2025",
      progressPct:    60,
      estimatedHours: 2,
      mandatory:      true,
      dueDate:        getFutureDate(6),
      practice:       "ALL",
      interests:      [],
      objectiveIds:   ["3G"],            // Documentar objetivos y Reflections
    },
    {
      id:             "MAND-002",
      name:           "Data Privacy & Information Security Annual Training",
      nameEs:         "Privacidad de Datos y Seguridad de la Información – Anual",
      url:            "https://yourlearning.ibm.com/activity/ILC-DPSEC2025",
      progressPct:    30,
      estimatedHours: 3,
      mandatory:      true,
      dueDate:        getFutureDate(18),
      practice:       "ALL",
      interests:      [],
      objectiveIds:   ["2B"],            // Trainings Corporativos mandatorios
    },
    {
      id:             "MAND-003",
      name:           "IBM Consulting Essentials – Banda 4",
      nameEs:         "Fundamentos de IBM Consulting – Banda 4",
      url:            "https://yourlearning.ibm.com/activity/ILC-CONSESS-B4",
      progressPct:    75,
      estimatedHours: 4,
      mandatory:      true,
      dueDate:        getFutureDate(40),
      practice:       "Consulting",
      interests:      [],
      objectiveIds:   ["2C"],            // Trainings Consulting mandatorios
    },
    {
      id:             "MAND-004",
      name:           "Anti-Bribery & Corruption Compliance",
      nameEs:         "Cumplimiento Antisoborno y Anticorrupción",
      url:            "https://yourlearning.ibm.com/activity/ILC-ABC2025",
      progressPct:    5,
      estimatedHours: 2,
      mandatory:      true,
      dueDate:        getFutureDate(7),
      practice:       "ALL",
      interests:      [],
      objectiveIds:   ["2B"],            // Trainings Corporativos mandatorios
    },
    {
      id:             "MAND-005",
      name:           "Accessibility in IBM – Annual Certification",
      nameEs:         "Accesibilidad en IBM – Certificación Anual",
      url:            "https://yourlearning.ibm.com/activity/ILC-ACC2025",
      progressPct:    45,
      estimatedHours: 2,
      mandatory:      true,
      dueDate:        getFutureDate(55),
      practice:       "ALL",
      interests:      [],
      objectiveIds:   ["2B"],            // Trainings Corporativos mandatorios
    },

    // ── OPCIONALES (5) ───────────────────────────────────────────
    {
      id:             "OPT-001",
      name:           "Business English for Finance Professionals",
      nameEs:         "Inglés de Negocios para Profesionales de Finanzas",
      url:            "https://yourlearning.ibm.com/activity/ILC-BIZEN101",
      progressPct:    20,
      estimatedHours: 6,
      mandatory:      false,
      dueDate:        null,
      practice:       null,
      interests:      ["english", "communication"],
      objectiveIds:   ["2G"],            // 40 horas de educación
    },
    {
      id:             "OPT-002",
      name:           "Python for Data Analysis – Finance Focus",
      nameEs:         "Python para Análisis de Datos – Enfoque Financiero",
      url:            "https://yourlearning.ibm.com/activity/ILC-PY-FIN101",
      progressPct:    10,
      estimatedHours: 8,
      mandatory:      false,
      dueDate:        null,
      practice:       null,
      interests:      ["programming", "automation"],
      objectiveIds:   ["2G"],            // 40 horas de educación
    },
    {
      id:             "OPT-003",
      name:           "Financial Closing & Reporting Fundamentals",
      nameEs:         "Fundamentos de Cierre Financiero y Reportes",
      url:            "https://yourlearning.ibm.com/activity/ILC-FINCLOSE101",
      progressPct:    50,
      estimatedHours: 4,
      mandatory:      false,
      dueDate:        getFutureDate(5),
      practice:       "R2R",
      interests:      [],
      objectiveIds:   ["2D", "2G"],      // Entry R2R + 40 horas
    },
    {
      id:             "OPT-004",
      name:           "IBM RPA – Robotic Process Automation Essentials",
      nameEs:         "IBM RPA – Fundamentos de Automatización de Procesos",
      url:            "https://yourlearning.ibm.com/activity/ILC-RPA101",
      progressPct:    35,
      estimatedHours: 6,
      mandatory:      false,
      dueDate:        null,
      practice:       null,
      interests:      ["automation", "programming"],
      objectiveIds:   ["2G"],            // 40 horas de educación
    },
    {
      id:             "OPT-005",
      name:           "Agile Explorer",
      nameEs:         "Agile Explorer – Metodologías Ágiles",
      url:            "https://yourlearning.ibm.com/activity/ILC-AGILE-EXPL",
      progressPct:    65,
      estimatedHours: 3,
      mandatory:      false,
      dueDate:        null,
      practice:       null,
      interests:      ["soft-skills", "badges"],
      objectiveIds:   ["2F", "2G"],      // Growth Badge + 40 horas
    },
  ];

  // Enrich each course with alert and pace suggestion
  return courses.map(c => ({
    ...c,
    alert:          computeCourseAlert(c.dueDate, c.progressPct),
    paceSuggestion: buildPaceSuggestion(c),
  }));
}

/** Helper: returns an ISO date string N days from today */
function getFutureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}
