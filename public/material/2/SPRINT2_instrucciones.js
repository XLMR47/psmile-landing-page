// ─────────────────────────────────────────────────────────────────────────────
// SPRINT 2 — INSTRUCCIONES DE INTEGRACIÓN
// ─────────────────────────────────────────────────────────────────────────────


// ══════════════════════════════════════════════════════════════════════════════
// 1. ARCHIVOS A COPIAR
// ══════════════════════════════════════════════════════════════════════════════

/*
  src/
  └── components/
      └── sesiones/
          ├── FacilitadorPanel.jsx   ← copiar el archivo entregado
          └── JugadorView.jsx        ← copiar el archivo entregado
*/


// ══════════════════════════════════════════════════════════════════════════════
// 2. RUTAS YA DECLARADAS EN SPRINT 1 — confirmar que estén activas
// ══════════════════════════════════════════════════════════════════════════════

// Estas rutas ya estaban en las instrucciones del Sprint 1.
// Verificar que FacilitadorPanel y JugadorView apunten a los archivos nuevos:

import FacilitadorPanel from './components/sesiones/FacilitadorPanel';
import JugadorView      from './components/sesiones/JugadorView';

<Route path="/portal/facilitador/:sesionId"           element={<FacilitadorPanel />} />
<Route path="/sala/:sesionId/jugador/:jugadorId"       element={<JugadorView />} />


// ══════════════════════════════════════════════════════════════════════════════
// 3. IMPORTANTE — eliminar imports de archivos que aún no existen
//    FacilitadorPanel importa sub-paneles que están EMBEBIDOS en el mismo
//    archivo. Pero tiene estos imports al tope que debes eliminar o comentar
//    hasta que decidas separarlos:
// ══════════════════════════════════════════════════════════════════════════════

// ELIMINA o COMENTA estas líneas en FacilitadorPanel.jsx:
//
// import PanelCheckin   from './bloques/PanelCheckin';
// import PanelSemaforo  from './bloques/PanelSemaforo';
// import PanelMapa      from './bloques/PanelMapa';
// import PanelImpostor  from './bloques/PanelImpostor';
// import PanelRRR       from './bloques/PanelRRR';
// import PanelCheckout  from './bloques/PanelCheckout';
//
// Y en el PANEL_MAP, referencia directamente las funciones internas:
//
// const PANEL_MAP = {
//   checkin:  PanelCheckin,     // estas funciones están definidas al final del mismo archivo
//   semaforo: PanelSemaforo,
//   mapa:     PanelMapa,
//   impostor: PanelImpostor,
//   rrr:      PanelRRR,
//   kahoot:   null,
//   checkout: PanelCheckout,
// };
//
// Ya están todas definidas como funciones dentro de FacilitadorPanel.jsx —
// solo elimina los imports externos de arriba y funciona.


// ══════════════════════════════════════════════════════════════════════════════
// 4. FLUJO COMPLETO DE UNA SESIÓN — referencia
// ══════════════════════════════════════════════════════════════════════════════

/*
1. Facilitador entra a /portal/sesion/nueva
   → Elige charla → crea sesión → obtiene código (ej: NEURO-47)

2. Jugadores entran a /sala
   → Ingresan código + nombre → quedan en sala de espera

3. Facilitador ve los jugadores conectarse en tiempo real
   → Cuando está listo, presiona "Iniciar"
   → Todos los celulares cambian automáticamente al Bloque 1

4. Durante la sesión:
   FACILITADOR (proyector)          JUGADORES (celular)
   ─────────────────────────────    ──────────────────────────
   Ve la diapositiva del bloque  →  Ven la actividad del bloque
   Ve respuestas en tiempo real  →  Completan la actividad
   Presiona "Revelar"            →  Ven mensaje "resultados visibles"
   Presiona "Siguiente bloque"   →  Celulares cambian al bloque siguiente

5. Al terminar:
   → Facilitador presiona "Finalizar"
   → Todos los celulares muestran pantalla de fin
   → Datos guardados en Firestore bajo /sesiones/{id}/respuestas
*/


// ══════════════════════════════════════════════════════════════════════════════
// 5. DATOS QUE SE GUARDAN POR JUGADOR (referencia)
// ══════════════════════════════════════════════════════════════════════════════

/*
/sesiones/{sesionId}/respuestas/

  {jugadorId}_checkin    → { valor: 7 }
  {jugadorId}_semaforo   → { sit1: 'exploto', sit2: 'congele', ... }
  {jugadorId}_mapa       → { trazos: [{x, y, color}, ...] }
  {jugadorId}_impostor   → { votoImpostores: [0, 3] }
  {jugadorId}_rrr        → { reconocer: '...', resetear: '...', palabraAncla: 'Ya' }
  {jugadorId}_checkout   → { palabra1: 'DIRECTO', palabra2: '...', palabra3: '...' }
*/


// ══════════════════════════════════════════════════════════════════════════════
// 6. QUÉ VEN EN CADA PANTALLA
// ══════════════════════════════════════════════════════════════════════════════

/*
FACILITADOR (FacilitadorPanel.jsx)
  ├── Columna izquierda: Diapositiva del bloque actual (SlideView)
  │     └── Cambia automáticamente al presionar "Siguiente"
  └── Columna derecha: Panel de datos live
        ├── Checkin  → distribución de valores 1-10, promedio
        ├── Semáforo → barras animadas de reacciones por situación
        ├── Mapa     → silueta colectiva con todos los trazos
        ├── Impostor → barras de votos por jugador
        ├── RRR      → palabras ancla del grupo
        ├── Kahoot   → pantalla informativa
        └── Checkout → nube de palabras en tiempo real

JUGADOR (JugadorView.jsx)
  ├── Cambia de bloque automáticamente cuando el facilitador avanza
  ├── Checkin  → escala 1-10
  ├── Semáforo → 6 situaciones con 4 botones de reacción
  ├── Mapa     → canvas táctil con silueta pintable
  ├── Impostor → 5 botones de votación
  ├── RRR      → 3 campos + timer de respiración integrado
  ├── Kahoot   → pantalla de espera con instrucciones
  └── Checkout → 3 campos grandes con preview en tiempo real
*/


// ══════════════════════════════════════════════════════════════════════════════
// 7. LO QUE VIENE EN SPRINT 3 (futuro)
// ══════════════════════════════════════════════════════════════════════════════

/*
  Resumen exportable de sesión (PDF o vista web)
  ├── Estadísticas completas de la sesión
  ├── Mapa corporal colectivo en alta resolución
  ├── Palabras ancla del grupo
  └── Exportar a la ficha de cada jugador en /jugadores/{id}/sesiones

  Historial de sesiones por academia
  └── /portal/sesiones → listado con fecha, jugadores, resumen

  Mejoras UX
  ├── Sonido al avanzar bloque (feedback para jugadores)
  ├── Countdown visual cuando el facilitador va a avanzar
  └── Modo oscuro/claro configurable
*/
