// ─────────────────────────────────────────────────────────────────
//  src/services/colombiaHolidays.js
//  Festivos colombianos (Ley 51/1983 – Ley Emiliani).
//
//  FIXED  : siempre en la fecha exacta (1 ene, 25 dic, etc.)
//  MOVED  : se trasladan al lunes siguiente si caen Martes–Domingo
//
//  Los festivos que dependen de Semana Santa se calculan a partir
//  del Domingo de Pascua (algoritmo gregoriano anónimo).
// ─────────────────────────────────────────────────────────────────

/** Domingo de Pascua para el año dado (algoritmo Gregoriano anónimo). */
function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day   = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Suma `days` días a una fecha y devuelve una nueva Date. */
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Traslada `date` al lunes siguiente si no cae en lunes (Ley Emiliani).
 * Si ya es lunes, devuelve la misma fecha.
 */
function nextMonday(date) {
  const dow = date.getDay(); // 0=Dom … 6=Sáb
  if (dow === 1) return date;
  const ahead = dow === 0 ? 1 : 8 - dow;
  return addDays(date, ahead);
}

/** Formatea una Date como "YYYY-MM-DD". */
function fmt(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/**
 * Devuelve los 18 festivos colombianos del año indicado.
 * Cada entrada: { date: "YYYY-MM-DD", name: string, moved: boolean }
 *
 * @param {number} year
 * @returns {Array<{date: string, name: string, moved: boolean}>}
 */
export function getColombiaHolidays(year) {
  const easter = easterSunday(year);

  const holidays = [
    // ── Fijos ────────────────────────────────────────────────────
    { date: fmt(new Date(year,  0,  1)), name: "Año Nuevo",                    moved: false },
    { date: fmt(new Date(year,  4,  1)), name: "Día del Trabajo",              moved: false },
    { date: fmt(new Date(year,  6, 20)), name: "Día de la Independencia",      moved: false },
    { date: fmt(new Date(year,  7,  7)), name: "Batalla de Boyacá",            moved: false },
    { date: fmt(new Date(year, 11,  8)), name: "Inmaculada Concepción",        moved: false },
    { date: fmt(new Date(year, 11, 25)), name: "Navidad",                      moved: false },

    // ── Trasladados al lunes siguiente (Ley Emiliani) ─────────────
    { date: fmt(nextMonday(new Date(year,  0,  6))), name: "Reyes Magos",                  moved: true },
    { date: fmt(nextMonday(new Date(year,  2, 19))), name: "San José",                     moved: true },
    { date: fmt(nextMonday(new Date(year,  5, 29))), name: "San Pedro y San Pablo",        moved: true },
    { date: fmt(nextMonday(new Date(year,  7, 15))), name: "Asunción de la Virgen",        moved: true },
    { date: fmt(nextMonday(new Date(year,  9, 12))), name: "Día de la Raza",               moved: true },
    { date: fmt(nextMonday(new Date(year, 10,  1))), name: "Todos los Santos",             moved: true },
    { date: fmt(nextMonday(new Date(year, 10, 11))), name: "Independencia de Cartagena",   moved: true },

    // ── Dependientes de Pascua ────────────────────────────────────
    { date: fmt(addDays(easter, -3)),              name: "Jueves Santo",          moved: false },
    { date: fmt(addDays(easter, -2)),              name: "Viernes Santo",         moved: false },
    { date: fmt(nextMonday(addDays(easter,  39))), name: "Ascensión del Señor",   moved: true  },
    { date: fmt(nextMonday(addDays(easter,  60))), name: "Corpus Christi",        moved: true  },
    { date: fmt(nextMonday(addDays(easter,  68))), name: "Sagrado Corazón",       moved: true  },
  ];

  holidays.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return holidays;
}
