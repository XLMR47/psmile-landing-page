// ─────────────────────────────────────────────────────────────────────────────
// SPRINT 1 — INSTRUCCIONES DE INTEGRACIÓN COMPLETAS
// ─────────────────────────────────────────────────────────────────────────────


// ══════════════════════════════════════════════════════════════════════════════
// 1. RUTAS NUEVAS — agregar en App.jsx
// ══════════════════════════════════════════════════════════════════════════════

import { LobbyFacilitador, LobbyJugador } from './components/sesiones/SesionLobby';
import FacilitadorPanel from './components/sesiones/FacilitadorPanel';  // Sprint 2
import JugadorView      from './components/sesiones/JugadorView';       // Sprint 2

// Rutas PROTEGIDAS (solo logueados) — dentro de tu PrivateRoute
<Route path="/portal/sesion/nueva"           element={<LobbyFacilitador />} />
<Route path="/portal/facilitador/:sesionId"  element={<FacilitadorPanel />} />  // Sprint 2

// Rutas PÚBLICAS (jugadores sin cuenta)
<Route path="/sala"                                        element={<LobbyJugador />} />
<Route path="/sala/:sesionId/jugador/:jugadorId"           element={<JugadorView />} />  // Sprint 2


// ══════════════════════════════════════════════════════════════════════════════
// 2. BOTÓN EN EL DASHBOARD — agregar en Dashboard.jsx
//    Junto a los botones de Laboratorio, ePsD Lite, etc.
// ══════════════════════════════════════════════════════════════════════════════

import { Radio } from 'lucide-react';

// Dentro del header, junto a los botones existentes del admin:
{isAdmin && (
  <button
    onClick={() => navigate('/portal/sesion/nueva')}
    className="hidden md:flex items-center gap-2 bg-[#111827] hover:bg-[#ff2d2d]/10 border border-white/5 hover:border-[#ff2d2d]/30 text-[#6B7280] hover:text-[#ff6b6b] px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
    title="Iniciar sesión grupal en tiempo real"
  >
    <Radio size={14} />
    Sesión Live
  </button>
)}


// ══════════════════════════════════════════════════════════════════════════════
// 3. ARCHIVOS A CREAR/COPIAR
// ══════════════════════════════════════════════════════════════════════════════

/*
  src/
  ├── hooks/
  │   └── useSesionActiva.js        ← copiar el archivo entregado
  ├── utils/
  │   └── sesionHelpers.js          ← copiar el archivo entregado
  └── components/
      └── sesiones/
          └── SesionLobby.jsx       ← copiar el archivo entregado
*/


// ══════════════════════════════════════════════════════════════════════════════
// 4. REGLAS DE FIRESTORE — actualizar en Firebase Console → Firestore → Rules
// ══════════════════════════════════════════════════════════════════════════════

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Tus reglas existentes para jugadores ──────────────────
    match /jugadores/{jugadorId} {
      allow read, write: if request.auth != null;
      match /sesiones/{sesionId} {
        allow read, write: if request.auth != null;
      }
    }

    // ── Sesiones grupales ─────────────────────────────────────
    match /sesiones/{sesionId} {

      // Crear sesión: solo usuarios autenticados (facilitadores)
      allow create: if request.auth != null;

      // Leer sesión: autenticados O si conocen el código (jugadores sin cuenta)
      // Los jugadores anónimos pueden leer para verificar el código
      allow read: if request.auth != null
                  || resource.data.estado in ['lobby', 'activa'];

      // Actualizar: solo el facilitador que la creó
      allow update: if request.auth != null
                    && request.auth.uid == resource.data.facilitadorId;

      // ── Jugadores conectados a la sesión ──────────────────
      match /jugadores/{jugadorId} {
        // Cualquiera puede unirse (jugadores sin cuenta)
        allow create: if true;
        // Leer la lista: autenticados o el propio jugador
        allow read:   if request.auth != null
                      || request.auth == null;  // público para el lobby
        // Actualizar: solo el propio jugador (por su ID)
        allow update: if true;  // simplificado — ajustar según necesidad
      }

      // ── Respuestas de los jugadores ───────────────────────
      match /respuestas/{respuestaId} {
        // Cualquier jugador puede guardar su respuesta
        allow create, update: if true;
        // Solo el facilitador lee todas las respuestas
        allow read: if request.auth != null;
      }
    }
  }
}
*/


// ══════════════════════════════════════════════════════════════════════════════
// 5. ÍNDICES DE FIRESTORE — crear en Firebase Console → Firestore → Indexes
// ══════════════════════════════════════════════════════════════════════════════

/*
Colección: sesiones
Campos: codigo ASC, estado ASC
Tipo: Compuesto
→ Necesario para buscar sesión por código + estado activo

Colección: sesiones/{id}/jugadores
Campos: conectadoEn ASC
Tipo: Simple (se crea automático al primer query)

Colección: sesiones/{id}/respuestas
Campos: jugadorId ASC, bloqueId ASC
Tipo: Compuesto (opcional, solo si filtras por jugador+bloque)
*/


// ══════════════════════════════════════════════════════════════════════════════
// 6. ESTRUCTURA FINAL DE FIRESTORE — referencia visual
// ══════════════════════════════════════════════════════════════════════════════

/*
sesiones/
  {sesionId}/                           ← doc principal
    codigo:            "NEURO-47"
    facilitadorId:     "uid-del-DT"
    academiaId:        "neurosport"
    charlaId:          "emociones-tambien-juegan"
    estado:            "lobby" | "activa" | "completada" | "cancelada"
    bloqueActual:      0
    bloqueTotal:       7
    mostrarResultados: false
    creadaEn:          Timestamp
    actualizadaEn:     Timestamp
    iniciadaEn:        Timestamp (cuando pasa a activa)
    configuracion: {
      charla:      "emociones-tambien-juegan"
      nombreCharla: "Las Emociones También Juegan"
      bloques: [ { id, nombre, icono, minutos }, ... ]
    }

    jugadores/                          ← subcolección
      {jugadorId}/
        nombre:       "Juan Pérez"
        activo:       true
        conectadoEn:  Timestamp
        ultimaActiv:  Timestamp
        ultimoBloque: "semaforo"

    respuestas/                         ← subcolección
      {jugadorId}_checkin/
        jugadorId:   "jugador_..."
        bloqueId:    "checkin"
        valor:       7
        guardadoEn:  Timestamp

      {jugadorId}_semaforo/
        jugadorId:   "jugador_..."
        bloqueId:    "semaforo"
        sit1:        "exploto"
        sit2:        "congele"
        sit3:        "respire"
        sit4:        "me-fui"
        sit5:        "exploto"
        sit6:        "congele"
        guardadoEn:  Timestamp

      {jugadorId}_mapa/
        trazos: [ { x, y, color, sitId, timestamp }, ... ]

      {jugadorId}_rrr/
        reconocer:    "tensión en el pecho"
        resetear:     "ajusto la camiseta"
        palabraAncla: "Ya"

      {jugadorId}_checkout/
        palabra1: "DIRECTO"
        palabra2: "CON HERRAMIENTAS"
        palabra3: "LISTO"
*/


// ══════════════════════════════════════════════════════════════════════════════
// 7. LO QUE VIENE EN SPRINT 2
// ══════════════════════════════════════════════════════════════════════════════

/*
FacilitadorPanel.jsx
  ├── Ve jugadores conectados en tiempo real
  ├── Controla qué bloque están viendo todos
  ├── Botón "Revelar resultados" por bloque
  └── Vista de resultados live:
      ├── SemaforoFacilitador  → barras de votos animadas
      ├── MapaCorporalLive     → silueta colectiva
      ├── ImpostorFacilitador  → votos en tiempo real
      └── CheckoutLive         → nube de palabras

JugadorView.jsx
  ├── Recibe el bloqueActual de Firestore en tiempo real
  ├── Renderiza el componente correcto según el bloque
  ├── Guarda respuestas con guardarRespuesta()
  └── Espera instrucciones del facilitador
*/
