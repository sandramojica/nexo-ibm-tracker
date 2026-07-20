# Plan: Personalización del Tracker para el Perfil de Sandra

## Perfil del Usuario

| Campo | Valor |
|---|---|
| **Nombre** | Sandra Milena Mojica Duarte |
| **ID IBM** | 03045693 |
| **Cargo IBM** | Especialista en Entrega de Procesos / Analista Contable |
| **Banda** | 4 |
| **Profesión** | Contadora Pública |
| **Práctica** | Consulting – Finanzas / Procesos (R2R, P2P, O2C) |

---

## Visión General

El tracker actualmente tiene la lógica base construida pero le faltan tres capacidades
clave para Sandra:

1. **Perfil enriquecido**: el sistema no conoce su banda, cargo ni profesión → no puede
   personalizar sugerencias.
2. **Sugerencias de cursos en Your Learning**: el motor sugiere genéricamente "toma cursos",
   pero no recomienda cursos específicos según el rol de Analista Contable banda 4.
3. **Alerta de horas**: el motor usa `getTimesheetCompliance()` pero **no cruza** los datos de
   `My Hours Plan` (horas planeadas vs. reales) con `Time` para alertar exceso/déficit.

Este plan corrige las tres brechas de forma incremental.

---

## Sub-Tarea 1 — Enriquecer el perfil con datos de Sandra

**Intent**
Guardar el perfil laboral de Sandra (banda, cargo, profesión, práctica) en el sistema para
que todos los motores de sugerencias lo usen. Mientras no haya conexión real a SF, el perfil
se lee del `.env` como fallback seguro.

**Expected Outcomes**
- `GET /api/profile` devuelve:
  ```json
  {
    "userId": "03045693",
    "name": "Sandra Milena Mojica Duarte",
    "email": "...",
    "band": "4",
    "role": "Analista Contable",
    "profession": "Contadora Pública",
    "practice": "Consulting",
    "specialization": "R2R/P2P/O2C"
  }
  ```
- Si SF está disponible, los datos vienen de `getSFProfile()`.
- Si no hay conexión SF, los datos vienen de variables en `.env`.

**Todo List**
- [ ] Agregar al `.env.example` las variables: `USER_BAND`, `USER_ROLE`, `USER_PROFESSION`,
      `USER_PRACTICE`, `USER_SPECIALIZATION`
- [ ] Agregar en `.env` los valores reales de Sandra:
      `USER_BAND=4`, `USER_ROLE=Analista Contable`, `USER_PROFESSION=Contadora Pública`,
      `USER_PRACTICE=Consulting`, `USER_SPECIALIZATION=R2R/P2P/O2C`
- [ ] Actualizar `src/routes/profile.js` para intentar `getSFProfile()` y hacer merge con
      los valores del `.env` como fallback
- [ ] Exponer el perfil enriquecido en la respuesta del endpoint

**Relevant Context**
- `src/services/successFactors.js` → `getSFProfile()` devuelve `{ userId, name, email, band, manager, department }`
- `src/routes/profile.js` → stub actual que devuelve datos del JWT

**Status**: [ ] pending

---

## Sub-Tarea 2 — Sugerencias de cursos personalizados en Your Learning

**Intent**
Crear un catálogo de cursos recomendados para Analista Contable banda 4 (práctica R2R/P2P/O2C)
e integrarlos en las sugerencias de los objetivos 2D, 2E y 2G del motor de objetivos.

**Expected Outcomes**
- Los objetivos 2D (Entry), 2E (Foundation) y 2G (40 horas) incluyen sugerencias con
  **nombres específicos de cursos** y enlaces directos a Your Learning para el rol de Sandra.
- Los cursos sugeridos corresponden al learning path de Analista Contable banda 4 en las
  prácticas R2R (Record to Report), P2P (Purchase to Pay) y O2C (Order to Cash).
- Ejemplo de sugerencia generada:
  > "Para avanzar al nivel Entry en R2R, toma 'Financial Closing & Reporting Fundamentals'
  > en Your Learning → [enlace directo]"

**Todo List**
- [ ] Crear `src/services/courseRecommender.js` con un catálogo de cursos para banda 4 /
      práctica Consulting / especialización R2R-P2P-O2C
- [ ] El catálogo incluye: nombre del curso, URL en Your Learning, nivel (Entry/Foundation),
      práctica (R2R/P2P/O2C), horas estimadas
- [ ] Actualizar `buildObjectivesDashboard()` en `objectivesEngine.js` para aceptar el
      perfil del usuario y pasar la práctica/banda al motor de sugerencias
- [ ] Actualizar los builders de sugerencias `2D`, `2E` y `2G` para llamar a
      `courseRecommender.getCoursesFor(band, practice, level)` e incluir los cursos en el
      resultado
- [ ] Actualizar `src/routes/objectives.js` para leer el perfil y pasarlo al motor

**Relevant Context**
- `src/services/objectivesEngine.js` → `buildObjectivesDashboard(bearerToken, userId)`
  necesita recibir también `userProfile`
- Objetivos afectados: `2D` (entry.pct), `2E` (foundation.pct), `2G` (hoursCompleted/40)
- Cursos clave para banda 4 Consulting / R2R: Financial Closing, GL Reconciliation,
  Statutory Reporting
- Cursos clave P2P: Invoice Processing, Accounts Payable Fundamentals
- Cursos clave O2C: Order Management, Cash Application, Collections

**Status**: [ ] pending

---

## Sub-Tarea 3 — Alerta de exceso/déficit de horas (My Hours Plan vs. Time)

**Intent**
Cruzar los datos de `getHoursPlan()` (horas planeadas del mes) con `getTimesheetCompliance()`
(horas registradas en Time) y generar alertas claras cuando Sandra tenga exceso de horas
planeadas o semanas sin registrar.

**Expected Outcomes**
- El objetivo `3B` incluye una alerta específica según el escenario:
  - ✅ **Normal**: horas registradas ≈ horas planeadas (±10%)
  - ⚠️ **Déficit**: horas registradas < horas planeadas → "Tienes X horas sin registrar esta semana"
  - 🔴 **Exceso**: horas registradas > horas planeadas → "Llevas X horas sobre tu plan mensual.
    Revisa con tu manager si hay horas que reubicar."
  - 🔔 **Semana actual**: si no ha enviado el timesheet de esta semana → alerta prioritaria
- Se agrega un nuevo campo `hoursAlert` en la respuesta del objetivo `3B` con nivel
  (`OK`, `WARNING`, `CRITICAL`) y mensaje.

**Todo List**
- [ ] Actualizar `buildObjectivesDashboard()` para llamar también a `getHoursPlan()` en el
      `Promise.allSettled` paralelo (ya existe la función, solo falta usarla)
- [ ] Crear función `buildHoursAlertSuggestions(ts, hoursPlan)` en `objectivesEngine.js`
      que cruce ambos resultados y produzca el nivel de alerta y mensaje
- [ ] Actualizar el objetivo `3B` para incluir `hoursAlert` en su respuesta
- [ ] Agregar un campo `alert` de nivel `OK | WARNING | CRITICAL` al schema del objetivo

**Relevant Context**
- `src/services/timeRecording.js`:
  - `getTimesheetCompliance()` → `{ totalWeeks, submittedWeeks, compliancePct, currentWeekSubmitted }`
  - `getHoursPlan()` → `{ planned, actual, utilizationPct }` ← **ya existe pero NO se llama**
    en `buildObjectivesDashboard()`
- Objetivo afectado: `3B` (Registro de horas en Time semanalmente)
- La lógica de exceso: `actual > planned * 1.10` → WARNING; `actual > planned * 1.25` → CRITICAL

**Status**: [ ] pending

---

## Sub-Tarea 4 — Conectar la ruta `/api/objectives` con el motor real

**Intent**
La ruta `/api/objectives` es actualmente un stub vacío. Conectarla con `buildObjectivesDashboard()`
para que devuelva el dashboard real (o datos demo si `DEMO=true`).

**Expected Outcomes**
- `GET /api/objectives` devuelve el array completo de 11 objetivos con `pct`, `target`,
  `tools`, `suggestions` y `hoursAlert` (en 3B).
- En modo `DEMO=true` devuelve datos simulados del perfil de Sandra sin necesidad de VPN.
- En modo real usa el Bearer token del JWT y llama a las APIs de IBM.

**Todo List**
- [ ] Crear `src/services/demoData.js` con datos de ejemplo que simulen el estado de Sandra
      (porcentajes realistas, cursos sugeridos, alertas de horas)
- [ ] Agregar `DEMO=false` al `.env.example` y en el `.env` de Sandra poner `DEMO=true`
      para la primera prueba
- [ ] Actualizar `src/routes/objectives.js` para:
  - Si `DEMO=true` → devolver `demoData`
  - Si no → llamar `buildObjectivesDashboard(token, userId, profile)`
- [ ] Agregar `jose` a las dependencias si no está (necesario para `authMiddleware`)

**Relevant Context**
- `src/middleware/auth.js` → `req.user = { id, email, name, band }`
- `src/services/objectivesEngine.js` → `buildObjectivesDashboard(bearerToken, userId)`
- `package.json` → dependencias actuales

**Status**: [ ] pending

---

## Sub-Tarea 5 — Instalar Node.js y probar en la máquina de Sandra

**Intent**
Guiar a Sandra paso a paso para instalar Node.js en Windows y ejecutar el servidor por
primera vez, sin conocimientos técnicos previos.

**Expected Outcomes**
- El servidor arranca y Sandra ve en consola:
  `IBM Objectives Tracker running at http://127.0.0.1:3000`
- Abre `http://127.0.0.1:3000/health` en Chrome y ve `{"status":"ok"}`
- Abre `http://127.0.0.1:3000/api/objectives` (con DEMO=true) y ve sus 11 objetivos
  con sugerencias de cursos y alerta de horas

**Pasos detallados (para Sandra)**

### Paso 1: Instalar Node.js
1. Abre Chrome y ve a 👉 https://nodejs.org/en/download
2. Haz clic en **"Windows Installer (.msi) 64-bit"** (el botón verde grande)
3. Descarga el archivo y ábrelo → haz clic en "Siguiente" en todo → "Instalar"
4. Cuando termine, **reinicia la computadora**

### Paso 2: Abrir la terminal en la carpeta del proyecto
1. Abre el **Explorador de Archivos** (la carpeta amarilla de la barra de tareas)
2. Navega hasta:
   `C:\Users\SandraMilenaMojicaDu\.bob\playground\ibm-objectives-tracker`
3. Haz clic en la **barra de dirección** (donde dice la ruta)
4. Escribe `powershell` y presiona **Enter**
5. Se abre una ventana negra (PowerShell) ya en la carpeta correcta ✓

### Paso 3: Instalar las dependencias del proyecto
En la ventana negra escribe exactamente:
```
npm install
```
Presiona Enter y espera ~1 minuto. Verás muchos textos → eso es normal.

### Paso 4: Crear el archivo de configuración
En la misma ventana escribe:
```
Copy-Item .env.example .env
```

### Paso 5: Arrancar el servidor
```
npm run dev
```
Deberías ver: `IBM Objectives Tracker running at http://127.0.0.1:3000`

### Paso 6: Probar en el navegador
Abre Chrome y ve a: `http://127.0.0.1:3000/health`
Deberías ver: `{"status":"ok","ts":"2025-..."}`

**Status**: [ ] pending

---

## Resumen de Archivos a Crear/Modificar

| Archivo | Acción | Sub-Tarea |
|---|---|---|
| `src/routes/profile.js` | Modificar — leer SF + fallback a env | 1 |
| `.env.example` | Modificar — agregar variables de perfil y DEMO | 1, 4 |
| `src/services/courseRecommender.js` | **Crear nuevo** — catálogo de cursos banda 4 | 2 |
| `src/services/objectivesEngine.js` | Modificar — usar perfil + courseRecommender + hoursAlert | 2, 3 |
| `src/routes/objectives.js` | Modificar — conectar con motor real + demo | 4 |
| `src/services/demoData.js` | **Crear nuevo** — datos simulados del perfil de Sandra | 4 |
