// ─────────────────────────────────────────────────────────────────
//  src/services/demoData.js
//  Simulated dashboard data for Sandra · Analista Contable · Banda 4
//  Used when DEMO=true in .env — no IBM VPN or credentials needed.
// ─────────────────────────────────────────────────────────────────
import { getCoursesFor } from "./courseRecommender.js";
import { getColombiaHolidays } from "./colombiaHolidays.js";

const SPECIALIZATION = "R2R/P2P/O2C";
const BAND = "4";

export function getDemoDashboard() {
  const entryCourses      = getCoursesFor(SPECIALIZATION, "ENTRY", BAND);
  const foundationCourses = getCoursesFor(SPECIALIZATION, "FOUNDATION", BAND);

  return [
    // ── GROUP 1 ──────────────────────────────────────────────────
    {
      id: "1A",
      group: "Utilización Personal",
      title: "Alcanzar mínimo 95% de utilización personal (MyScore)",
      pct: 82,
      target: "82% / meta 95%",
      tools: [
        { label: "MyScore", url: "https://w3.ibm.com/myscore" },
        { label: "SuccessFactors", url: "https://w3.ibm.com/successfactors" },
        { label: "Time – My Hours Plan", url: "https://w3.ibm.com/time" },
      ],
      suggestions: [
        "Utilización actual: 82%. Necesitas 13% más para alcanzar la meta.",
        "Revisa tu Hours Plan en Time cada lunes y confirma que tienes horas asignadas toda la semana.",
        "Habla con tu manager sobre asignación de proyecto si tienes días libres.",
      ],
      hoursAlert: null,
      recommendedCourses: [],
    },

    // ── GROUP 2 ──────────────────────────────────────────────────
    {
      id: "2A",
      group: "Desarrollo y Aprendizaje",
      title: "Autoevaluación semestral de competencias (Your Career)",
      pct: 50,
      target: "S1: ✓ · S2: Pendiente",
      tools: [{ label: "Your Career at IBM", url: "https://w3.ibm.com/careers/your-career-at-ibm" }],
      suggestions: [
        "S2 pendiente: programa la autoevaluación de fin de año antes del 15 de diciembre.",
        "Revisa las competencias de tu banda antes de autoevaluarte para calibrar bien el nivel.",
      ],
      hoursAlert: null,
      recommendedCourses: [],
    },
    {
      id: "2B",
      group: "Desarrollo y Aprendizaje",
      title: "Trainings Corporativos mandatorios (5 días antes del vencimiento)",
      pct: 100,
      target: "3 / 3 completados a tiempo",
      tools: [
        { label: "Your Learning", url: "https://yourlearning.ibm.com" },
        { label: "SuccessFactors Learning", url: "https://w3.ibm.com/successfactors" },
      ],
      suggestions: [
        "Todos los trainings Corporativos están al día. Continúa revisando Your Learning semanalmente.",
        "Dedica al menos 1 h por semana a trainings mandatorios.",
      ],
      hoursAlert: null,
      recommendedCourses: [],
    },
    {
      id: "2C",
      group: "Desarrollo y Aprendizaje",
      title: "Trainings de Consulting mandatorios (5 días antes del vencimiento)",
      pct: 67,
      target: "2 / 3 completados a tiempo",
      tools: [{ label: "Your Learning", url: "https://yourlearning.ibm.com" }],
      suggestions: [
        "1 training Consulting vence en los próximos 10 días: IBM Consulting Essentials (7 días).",
        "Dedica al menos 1 h por semana a trainings mandatorios.",
      ],
      hoursAlert: null,
      recommendedCourses: [],
    },
    {
      id: "2D",
      group: "Desarrollo y Aprendizaje",
      title: "Estándares de aprendizaje – nivel Entry (R2R/P2P/O2C)",
      pct: 40,
      target: "40% hacia Entry",
      tools: [
        { label: "Your Learning", url: "https://yourlearning.ibm.com" },
        { label: "Your Career at IBM", url: "https://w3.ibm.com/careers/your-career-at-ibm" },
      ],
      suggestions: [
        `Para alcanzar el nivel Entry en ${SPECIALIZATION}, completa estos cursos en Your Learning:`,
        ...entryCourses.slice(0, 3).map((c) => `→ "${c.name}" (~${c.hours} h) – ${c.url}`),
        "Revisa también tu learning path en Your Career at IBM para confirmar los requerimientos de tu banda.",
      ],
      hoursAlert: null,
      recommendedCourses: entryCourses,
    },
    {
      id: "2E",
      group: "Desarrollo y Aprendizaje",
      title: "Progreso hacia nivel Foundation – rol primario",
      pct: 0,
      target: "0% hacia Foundation",
      tools: [{ label: "Your Learning", url: "https://yourlearning.ibm.com" }],
      suggestions: ["Completa primero el nivel Entry antes de avanzar a Foundation."],
      hoursAlert: null,
      recommendedCourses: [],
    },
    {
      id: "2F",
      group: "Desarrollo y Aprendizaje",
      title: "Obtener IBM Growth Behaviours Badge",
      pct: 0,
      target: "Pendiente",
      tools: [
        { label: "Credly – Growth Behaviours", url: "https://yourlearning.ibm.com/credential/CREDLY-06dd24c7-5946-4ac3-b4aa-fd6c902e0ca6" },
        { label: "Your Learning", url: "https://yourlearning.ibm.com" },
      ],
      suggestions: ["Accede al enlace Credly y completa el módulo de Growth Behaviours (~2 h) esta semana."],
      hoursAlert: null,
      recommendedCourses: [],
    },
    {
      id: "2G",
      group: "Desarrollo y Aprendizaje",
      title: "40 horas de educación + 1 badge antes del 1° dic 2026",
      pct: 38,
      target: "15.2 / 40 h completadas · 0 badge(s)",
      tools: [{ label: "Your Learning", url: "https://yourlearning.ibm.com" }],
      suggestions: [
        "Faltan 24.8 horas para alcanzar las 40 h. Dedica 2 h/semana en Your Learning.",
        "Aún no tienes el Growth Behaviours Badge. Complétalo en Credly.",
        "Obtén al menos 1 badge antes del 1 de diciembre de 2026.",
      ],
      hoursAlert: null,
      recommendedCourses: entryCourses.slice(0, 3),
    },

    // ── GROUP 3 ──────────────────────────────────────────────────
    {
      id: "3B",
      group: "Gestión Personal y Administrativa",
      title: "Registro de horas en Time semanalmente",
      pct: 88,
      target: "19 / 22 semanas registradas",
      tools: [
        { label: "Time – IBM", url: "https://w3.ibm.com/time" },
        { label: "My Hours Plan", url: "https://w3.ibm.com/time/hoursplan" },
      ],
      suggestions: [
        "⚠ No has registrado las horas de esta semana en Time. Hazlo hoy antes de las 5 PM.",
        "Compliance de timesheets: 88%. Configura un recordatorio recurrente los viernes a las 4 PM.",
        "⚠ Tienes 18.5 horas extra sobre tu plan mensual. Habla con tu manager para reubicarlas o justificarlas en Time.",
      ],
      hoursAlert: {
        level: "CRITICAL",
        message: "No has enviado el timesheet de esta semana. Regístralo hoy en Time.",
      },
      recommendedCourses: [],
      // ── Calendario festivos 2026 + guía de códigos Time ──────────
      holidayTimeGuide: {
        accountId: "M.00556",
        note: "* Additional Time Off Paid NO aplica cuando el registro son horas menores a un día completo.",
        holidays: getColombiaHolidays(2026),
        codes: [
          { concept: "Día de vacaciones del empleado",                                                                          activity: "Vacation",                                    sap: "Vacation / Vacaciones",                                                                       accountIdOverride: null },
          { concept: "Día festivo en Colombia que el empleado descansa",                                                        activity: "Designed Holiday",                            sap: "Non Working Day / Día no laborable",                                                          accountIdOverride: null },
          { concept: "Incapacidad Médica",                                                                                      activity: "Illness",                                     sap: "Short Sick Leave / Long Sick Leave / Enfermedad",                                             accountIdOverride: null },
          { concept: "Día Familia",                                                                                             activity: "Paid Time Not Worked",                        sap: "Family Day Off / Día libre en familia",                                                       accountIdOverride: null },
          { concept: "Día Cumpleaños",                                                                                          activity: "Paid Time Not Worked",                        sap: "Birthday / Cumpleaños",                                                                       accountIdOverride: null },
          { concept: "Licencias por fallecimiento de un familiar",                                                             activity: "Paid Time Not Worked",                        sap: "Compassionate / Motivos familiares",                                                          accountIdOverride: null },
          { concept: "Licencia de Maternidad",                                                                                  activity: "Parenting Time Off",                          sap: "Maternity Leave / Permiso por maternidad",                                                    accountIdOverride: null },
          { concept: "Licencia de Paternidad",                                                                                  activity: "Parenting Time Off",                          sap: "Parental Time Off / Permiso por maternidad",                                                  accountIdOverride: null },
          { concept: "Día libre por ser jurado y/o ½ día por votar en elecciones",                                             activity: "Paid Time Not Worked",                        sap: "Civic Duty / Deber cívico",                                                                   accountIdOverride: null },
          { concept: "Licencia Médica sin incapacidad / Chequeo Médico",                                                       activity: "Paid Time Not Worked",                        sap: "Additional Time Off Paid / Libre tiempo adicional retribuido",                                accountIdOverride: null },
          { concept: "Día no trabajado por festivo del país donde se presta servicio, con aprobación del Manager",             activity: "Paid Time Not Worked",                        sap: "Additional Time Off Paid / Libre tiempo adicional retribuido",                                accountIdOverride: null },
          { concept: "Vacaciones en Dinero",                                                                                    activity: "Código de proyecto (# de horas trabajadas)", sap: "Profile – Time – Pay Out Time / Perfil de personas – Sin título (tiempo) – Obtener pago de tiempo", accountIdOverride: "Código de proyecto" },
        ],
      },
    },
    {
      id: "3D",
      group: "Gestión Personal y Administrativa",
      title: "Solicitar mínimo 6 retroalimentaciones por semestre",
      pct: 50,
      target: "3 / 6 solicitadas este semestre",
      tools: [
        { label: "SuccessFactors", url: "https://w3.ibm.com/successfactors" },
        { label: "Your Career at IBM", url: "https://w3.ibm.com/careers/your-career-at-ibm" },
      ],
      suggestions: [
        "Faltan 3 solicitudes de feedback por enviar este semestre. Usa SuccessFactors para enviarlas.",
        "Incluye siempre al Manager y Team Leader entre los evaluadores.",
        "Solicita feedback al finalizar cada entregable o proyecto relevante.",
      ],
      hoursAlert: null,
      recommendedCourses: [],
    },
    {
      id: "3F",
      group: "Gestión Personal y Administrativa",
      title: "Atender 100% de solicitudes de retroalimentación recibidas",
      pct: 100,
      target: "2 / 2 atendidas",
      tools: [{ label: "SuccessFactors", url: "https://w3.ibm.com/successfactors" }],
      suggestions: ["Sin solicitudes pendientes de responder. ¡Excelente!"],
      hoursAlert: null,
      recommendedCourses: [],
    },
    {
      id: "3G",
      group: "Gestión Personal y Administrativa",
      title: "Documentar objetivos y Reflections en tiempo y forma",
      pct: 50,
      target: "S1: ✓ · S2: Pendiente",
      tools: [{ label: "SuccessFactors", url: "https://w3.ibm.com/successfactors" }],
      suggestions: [
        "Reflection S2 pendiente. Programa la redacción 2 semanas antes del cierre de año.",
      ],
      hoursAlert: null,
      recommendedCourses: [],
    },
  ];
}

export function getDemoProfile() {
  return {
    userId:         process.env.USER_ID            ?? "03045693",
    name:           process.env.USER_NAME          ?? "Sandra Milena Mojica Duarte",
    email:          process.env.USER_EMAIL         ?? "smojica@ibm.com",
    band:           process.env.USER_BAND          ?? "4",
    role:           process.env.USER_ROLE          ?? "Analista Contable",
    profession:     process.env.USER_PROFESSION    ?? "Contadora Pública",
    practice:       process.env.USER_PRACTICE      ?? "Consulting",
    specialization: process.env.USER_SPECIALIZATION ?? "R2R/P2P/O2C",
    source:         "demo",
  };
}
