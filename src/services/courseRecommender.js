// ─────────────────────────────────────────────────────────────────
//  src/services/courseRecommender.js
//  Returns recommended Your Learning courses based on the employee's
//  band, practice, specialization, language and personal interests.
//  Curated for: Analista Contable · Banda 4 · R2R / P2P / O2C
//  Language: Spanish native, English learning
//  Interests: english, soft-skills, communication, programming,
//             automation, badges
// ─────────────────────────────────────────────────────────────────

/**
 * Full course catalog.
 * Each entry: { name, nameEs, url, hours, level, practice, lang,
 *               hasBadge, interests[] }
 *  - lang:      "es" | "en" | "both"
 *  - hasBadge:  true if completing earns a Credly badge
 *  - interests: tags used to match personal preferences
 */
const CATALOG = {

  // ── R2R – Record to Report ──────────────────────────────────────
  "R2R:ENTRY": [
    {
      name:    "Financial Closing & Reporting Fundamentals",
      nameEs:  "Fundamentos de Cierre Financiero y Reportes",
      url:     "https://yourlearning.ibm.com/activity/ILC-FINCLOSE101",
      hours:   4, lang: "en", hasBadge: false,
      interests: [],
    },
    {
      name:    "General Ledger Reconciliation Basics",
      nameEs:  "Conciliación de Libro Mayor – Nivel Básico",
      url:     "https://yourlearning.ibm.com/activity/ILC-GLREC101",
      hours:   3, lang: "en", hasBadge: false,
      interests: [],
    },
    {
      name:    "Journal Entry Processing in SAP",
      nameEs:  "Procesamiento de Asientos Contables en SAP",
      url:     "https://yourlearning.ibm.com/activity/ILC-SAP-JE101",
      hours:   2, lang: "both", hasBadge: false,
      interests: ["programming"],
    },
  ],
  "R2R:FOUNDATION": [
    {
      name:    "Statutory Reporting & Compliance",
      nameEs:  "Reportes Estatutarios y Cumplimiento Normativo",
      url:     "https://yourlearning.ibm.com/activity/ILC-STATREP201",
      hours:   5, lang: "en", hasBadge: true,
      interests: ["badges"],
    },
    {
      name:    "Intercompany Accounting & Eliminations",
      nameEs:  "Contabilidad Intercompañías y Eliminaciones",
      url:     "https://yourlearning.ibm.com/activity/ILC-INTCO201",
      hours:   4, lang: "en", hasBadge: false,
      interests: [],
    },
    {
      name:    "Fixed Assets Accounting – IFRS / US GAAP",
      nameEs:  "Contabilidad de Activos Fijos – IFRS / US GAAP",
      url:     "https://yourlearning.ibm.com/activity/ILC-FA-IFRS201",
      hours:   3, lang: "en", hasBadge: false,
      interests: [],
    },
  ],

  // ── P2P – Purchase to Pay ───────────────────────────────────────
  "P2P:ENTRY": [
    {
      name:    "Accounts Payable Fundamentals",
      nameEs:  "Fundamentos de Cuentas por Pagar",
      url:     "https://yourlearning.ibm.com/activity/ILC-AP101",
      hours:   3, lang: "both", hasBadge: false,
      interests: [],
    },
    {
      name:    "Invoice Processing & 3-Way Match",
      nameEs:  "Procesamiento de Facturas y Verificación en 3 Vías",
      url:     "https://yourlearning.ibm.com/activity/ILC-INV101",
      hours:   2, lang: "en", hasBadge: false,
      interests: [],
    },
    {
      name:    "Vendor Master Data Management",
      nameEs:  "Gestión de Datos Maestros de Proveedores",
      url:     "https://yourlearning.ibm.com/activity/ILC-VMD101",
      hours:   2, lang: "en", hasBadge: false,
      interests: [],
    },
  ],
  "P2P:FOUNDATION": [
    {
      name:    "Purchase Order Management & Compliance",
      nameEs:  "Gestión de Órdenes de Compra y Cumplimiento",
      url:     "https://yourlearning.ibm.com/activity/ILC-PO201",
      hours:   4, lang: "en", hasBadge: true,
      interests: ["badges"],
    },
    {
      name:    "Expense Management & Travel Policy",
      nameEs:  "Gestión de Gastos y Política de Viajes",
      url:     "https://yourlearning.ibm.com/activity/ILC-EXPMGMT201",
      hours:   3, lang: "both", hasBadge: false,
      interests: [],
    },
  ],

  // ── O2C – Order to Cash ─────────────────────────────────────────
  "O2C:ENTRY": [
    {
      name:    "Order Management Essentials",
      nameEs:  "Fundamentos de Gestión de Pedidos",
      url:     "https://yourlearning.ibm.com/activity/ILC-OM101",
      hours:   3, lang: "en", hasBadge: false,
      interests: [],
    },
    {
      name:    "Cash Application & Remittance Processing",
      nameEs:  "Aplicación de Pagos y Procesamiento de Remesas",
      url:     "https://yourlearning.ibm.com/activity/ILC-CASHAPP101",
      hours:   2, lang: "en", hasBadge: false,
      interests: [],
    },
    {
      name:    "Credit & Collections Fundamentals",
      nameEs:  "Fundamentos de Crédito y Cobros",
      url:     "https://yourlearning.ibm.com/activity/ILC-COLL101",
      hours:   2, lang: "en", hasBadge: false,
      interests: [],
    },
  ],
  "O2C:FOUNDATION": [
    {
      name:    "Revenue Recognition – IFRS 15 / ASC 606",
      nameEs:  "Reconocimiento de Ingresos – IFRS 15 / ASC 606",
      url:     "https://yourlearning.ibm.com/activity/ILC-REVREC201",
      hours:   4, lang: "en", hasBadge: true,
      interests: ["badges"],
    },
    {
      name:    "Dispute & Deduction Management",
      nameEs:  "Gestión de Disputas y Deducciones",
      url:     "https://yourlearning.ibm.com/activity/ILC-DISP201",
      hours:   3, lang: "en", hasBadge: false,
      interests: [],
    },
  ],

  // ── Inglés ──────────────────────────────────────────────────────
  "INTERESTS:english": [
    {
      name:    "Business English for Finance Professionals",
      nameEs:  "Inglés de Negocios para Profesionales de Finanzas",
      url:     "https://yourlearning.ibm.com/activity/ILC-BIZEN101",
      hours:   6, lang: "en", hasBadge: true,
      interests: ["english", "badges", "communication"],
    },
    {
      name:    "English Communication in the Workplace",
      nameEs:  "Comunicación en Inglés en el Trabajo",
      url:     "https://yourlearning.ibm.com/activity/ILC-ENGWORK101",
      hours:   4, lang: "en", hasBadge: false,
      interests: ["english", "communication"],
    },
    {
      name:    "English for Presentations & Meetings",
      nameEs:  "Inglés para Presentaciones y Reuniones",
      url:     "https://yourlearning.ibm.com/activity/ILC-ENGPRES101",
      hours:   3, lang: "en", hasBadge: true,
      interests: ["english", "communication", "badges"],
    },
  ],

  // ── Habilidades blandas ─────────────────────────────────────────
  "INTERESTS:soft-skills": [
    {
      name:    "IBM Growth Behaviours",
      nameEs:  "IBM Growth Behaviours (Comportamientos de Crecimiento)",
      url:     "https://yourlearning.ibm.com/credential/CREDLY-06dd24c7-5946-4ac3-b4aa-fd6c902e0ca6",
      hours:   2, lang: "both", hasBadge: true,
      interests: ["soft-skills", "badges"],
    },
    {
      name:    "Agile Explorer",
      nameEs:  "Agile Explorer – Metodologías Ágiles",
      url:     "https://yourlearning.ibm.com/activity/ILC-AGILE-EXPL",
      hours:   3, lang: "both", hasBadge: true,
      interests: ["soft-skills", "badges", "programming"],
    },
    {
      name:    "Leading with Empathy",
      nameEs:  "Liderar con Empatía",
      url:     "https://yourlearning.ibm.com/activity/ILC-EMPATHY101",
      hours:   2, lang: "both", hasBadge: false,
      interests: ["soft-skills"],
    },
    {
      name:    "Think. Write. Communicate. – IBM Writing Skills",
      nameEs:  "Pensar. Escribir. Comunicar. – Habilidades de Escritura IBM",
      url:     "https://yourlearning.ibm.com/activity/ILC-WRITE101",
      hours:   2, lang: "both", hasBadge: false,
      interests: ["soft-skills", "communication"],
    },
  ],

  // ── Comunicación ────────────────────────────────────────────────
  "INTERESTS:communication": [
    {
      name:    "Communicating with Impact – Banda 4",
      nameEs:  "Comunicar con Impacto – Banda 4",
      url:     "https://yourlearning.ibm.com/activity/ILC-COMM-B4",
      hours:   2, lang: "both", hasBadge: false,
      interests: ["communication", "soft-skills"],
    },
    {
      name:    "Storytelling for Business",
      nameEs:  "Storytelling para los Negocios",
      url:     "https://yourlearning.ibm.com/activity/ILC-STORY101",
      hours:   3, lang: "both", hasBadge: true,
      interests: ["communication", "badges"],
    },
    {
      name:    "Presentation Skills for Finance Teams",
      nameEs:  "Habilidades de Presentación para Equipos de Finanzas",
      url:     "https://yourlearning.ibm.com/activity/ILC-PRES-FIN",
      hours:   2, lang: "both", hasBadge: false,
      interests: ["communication"],
    },
  ],

  // ── Programación ────────────────────────────────────────────────
  "INTERESTS:programming": [
    {
      name:    "Python for Data Analysis – Finance Focus",
      nameEs:  "Python para Análisis de Datos – Enfoque Financiero",
      url:     "https://yourlearning.ibm.com/activity/ILC-PY-FIN101",
      hours:   8, lang: "en", hasBadge: true,
      interests: ["programming", "badges", "automation"],
    },
    {
      name:    "Excel Advanced – Power Query & Macros",
      nameEs:  "Excel Avanzado – Power Query y Macros",
      url:     "https://yourlearning.ibm.com/activity/ILC-EXCEL-ADV",
      hours:   4, lang: "both", hasBadge: false,
      interests: ["programming", "automation"],
    },
    {
      name:    "SQL Fundamentals for Business Analysts",
      nameEs:  "Fundamentos de SQL para Analistas de Negocio",
      url:     "https://yourlearning.ibm.com/activity/ILC-SQL101",
      hours:   5, lang: "en", hasBadge: true,
      interests: ["programming", "badges"],
    },
  ],

  // ── Automatización ──────────────────────────────────────────────
  "INTERESTS:automation": [
    {
      name:    "IBM RPA – Robotic Process Automation Essentials",
      nameEs:  "IBM RPA – Fundamentos de Automatización de Procesos",
      url:     "https://yourlearning.ibm.com/activity/ILC-RPA101",
      hours:   6, lang: "both", hasBadge: true,
      interests: ["automation", "badges", "programming"],
    },
    {
      name:    "Process Automation with IBM Business Automation Workflow",
      nameEs:  "Automatización con IBM Business Automation Workflow",
      url:     "https://yourlearning.ibm.com/activity/ILC-BAW101",
      hours:   5, lang: "en", hasBadge: true,
      interests: ["automation", "badges"],
    },
    {
      name:    "AI-Powered Finance: Automating Accounting Tasks",
      nameEs:  "Finanzas con IA: Automatización de Tareas Contables",
      url:     "https://yourlearning.ibm.com/activity/ILC-AI-FIN101",
      hours:   4, lang: "both", hasBadge: true,
      interests: ["automation", "badges", "programming"],
    },
  ],

  // ── Banda 4 general ─────────────────────────────────────────────
  "GENERAL:BAND4": [
    {
      name:    "IBM Growth Behaviours",
      nameEs:  "IBM Growth Behaviours",
      url:     "https://yourlearning.ibm.com/credential/CREDLY-06dd24c7-5946-4ac3-b4aa-fd6c902e0ca6",
      hours:   2, lang: "both", hasBadge: true,
      interests: ["soft-skills", "badges"],
    },
    {
      name:    "Excel & Data Analysis for Finance Professionals",
      nameEs:  "Excel y Análisis de Datos para Profesionales de Finanzas",
      url:     "https://yourlearning.ibm.com/activity/ILC-EXCEL-FIN",
      hours:   3, lang: "both", hasBadge: false,
      interests: ["programming"],
    },
    {
      name:    "Communicating with Impact – Banda 4",
      nameEs:  "Comunicar con Impacto – Banda 4",
      url:     "https://yourlearning.ibm.com/activity/ILC-COMM-B4",
      hours:   2, lang: "both", hasBadge: false,
      interests: ["communication", "soft-skills"],
    },
  ],
};

/**
 * Returns recommended courses for a given practice, level, band and
 * personal preferences.
 *
 * @param {string}   specialization  e.g. "R2R/P2P/O2C"
 * @param {"ENTRY"|"FOUNDATION"} level
 * @param {string|number} band       e.g. "4"
 * @param {object}   prefs           { lang: "es"|"en"|"both", interests: string[] }
 * @returns {Array<{name, nameEs, url, hours, hasBadge, lang, interests}>}
 */
export function getCoursesFor(
  specialization = "",
  level          = "ENTRY",
  band           = "4",
  prefs          = {}
) {
  const lang      = prefs.lang      ?? process.env.USER_LEARNING_LANG ?? "both";
  const interests = prefs.interests ??
    (process.env.USER_INTERESTS ?? "").split(",").map(s => s.trim()).filter(Boolean);

  const practices = specialization
    .toUpperCase()
    .split(/[\/,\s]+/)
    .filter(Boolean);

  const results = [];

  // 1. Practice-specific courses for the requested level
  for (const practice of practices) {
    const key = `${practice}:${level.toUpperCase()}`;
    if (CATALOG[key]) results.push(...CATALOG[key]);
  }

  // 2. Interest-based courses
  for (const interest of interests) {
    const key = `INTERESTS:${interest}`;
    if (CATALOG[key]) results.push(...CATALOG[key]);
  }

  // 3. General band-4 courses
  if (String(band) === "4") {
    results.push(...CATALOG["GENERAL:BAND4"]);
  }

  // 4. Deduplicate by URL
  const seen = new Set();
  let unique = results.filter(c => {
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });

  // 5. Sort: preferred language first, then badge courses, then by hours asc
  unique.sort((a, b) => {
    const aLang = a.lang === lang || a.lang === "both" ? 0 : 1;
    const bLang = b.lang === lang || b.lang === "both" ? 0 : 1;
    if (aLang !== bLang) return aLang - bLang;
    if (a.hasBadge !== b.hasBadge) return a.hasBadge ? -1 : 1;
    return a.hours - b.hours;
  });

  // 6. Use Spanish name if native language is Spanish
  const nativeLang = process.env.USER_NATIVE_LANG ?? "es";
  if (nativeLang === "es") {
    unique = unique.map(c => ({ ...c, displayName: c.nameEs || c.name }));
  } else {
    unique = unique.map(c => ({ ...c, displayName: c.name }));
  }

  return unique;
}

/**
 * Returns only interest-based courses (no practice filtering).
 * Used for the personal development section of the dashboard.
 */
export function getInterestCourses(prefs = {}) {
  return getCoursesFor("", "ENTRY", "4", prefs);
}
