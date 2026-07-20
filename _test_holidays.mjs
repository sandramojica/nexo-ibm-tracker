import { getColombiaHolidays } from "./src/services/colombiaHolidays.js";
const h = getColombiaHolidays(2026);
console.log("Festivos Colombia 2026 — total:", h.length);
h.forEach(x => console.log(x.date, x.name, x.moved ? "(trasladado)" : ""));
