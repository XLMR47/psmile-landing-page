// src/utils/sesionHelpers.js
// Funciones para crear sesiones, generar códigos y unirse a una sala

import { db } from '../firebase';
import {
  collection, doc, setDoc, getDoc, getDocs,
  query, where, updateDoc, serverTimestamp, deleteDoc
} from 'firebase/firestore';

// ── CATÁLOGO DE CHARLAS ──────────────────────────────────────────
export const CHARLAS = [
  {
    id: 'emociones-tambien-juegan',
    titulo: 'Las Emociones También Juegan',
    descripcion: 'Gestión emocional para futbolistas',
    duracion: '60-75 min',
    bloques: [
      { id: 'checkin',   nombre: 'Check-in',             icono: '🎯', minutos: 3  },
      { id: 'semaforo',  nombre: 'Semáforo Físico',       icono: '🚦', minutos: 5  },
      { id: 'mapa',      nombre: 'Mapa del Jugador',      icono: '🗺️', minutos: 17 },
      { id: 'impostor',  nombre: 'El Impostor Emocional', icono: '🃏', minutos: 10 },
      { id: 'rrr',       nombre: 'Rutina RRR',            icono: '⚡', minutos: 15 },
      { id: 'kahoot',    nombre: 'Kahoot Relámpago',      icono: '🎮', minutos: 5  },
      { id: 'checkout',  nombre: 'Check-out 3 Palabras',  icono: '🏁', minutos: 3  },
    ],
  },
  // Agregar futuras charlas aquí
];

// ── GENERAR CÓDIGO DE SALA ───────────────────────────────────────
/**
 * Genera un código legible tipo "NEURO-47"
 * Verifica que no exista ya en Firestore
 */
export async function generarCodigoSala(prefijo = 'NEURO') {
  const maxIntentos = 10;
  for (let i = 0; i < maxIntentos; i++) {
    const num = Math.floor(10 + Math.random() * 90); // 10-99
    const codigo = `${prefijo}-${num}`;
    const snap = await getDocs(
      query(collection(db, 'sesiones'), where('codigo', '==', codigo), where('estado', 'in', ['lobby', 'activa']))
    );
    if (snap.empty) return codigo;
  }
  // Fallback con timestamp si hay colisiones
  return `${prefijo}-${Date.now().toString().slice(-4)}`;
}

// ── CREAR SESIÓN ─────────────────────────────────────────────────
/**
 * Crea una nueva sesión y retorna el sesionId
 *
 * @param {object} params
 * @param {string} params.facilitadorId  - UID del facilitador
 * @param {string} params.academiaId     - ID de la academia
 * @param {string} params.charlaId       - ID de la charla del catálogo
 * @param {string} params.prefijoCodigo  - ej: 'NEURO', 'PSM', etc.
 */
export async function crearSesion({ facilitadorId, academiaId, charlaId, prefijoCodigo = 'NEURO' }) {
  const codigo   = await generarCodigoSala(prefijoCodigo);
  const sesionId = doc(collection(db, 'sesiones')).id;
  const charla   = CHARLAS.find(c => c.id === charlaId);

  if (!charla) throw new Error(`Charla "${charlaId}" no encontrada en el catálogo`);

  await setDoc(doc(db, 'sesiones', sesionId), {
    codigo,
    facilitadorId,
    academiaId,
    charlaId,
    estado: 'lobby',              // lobby | activa | completada | cancelada
    bloqueActual: 0,              // 0 = lobby, 1-N = bloques de la charla
    bloqueTotal: charla.bloques.length,
    mostrarResultados: false,     // el facilitador controla cuándo revelar
    creadaEn: serverTimestamp(),
    actualizadaEn: serverTimestamp(),
    configuracion: {
      charla: charlaId,
      nombreCharla: charla.titulo,
      bloques: charla.bloques,
    },
  });

  return { sesionId, codigo };
}

// ── UNIRSE A SESIÓN (jugador) ────────────────────────────────────
/**
 * El jugador entra con un código de sala y su nombre.
 * Retorna el sesionId si el código es válido.
 *
 * @param {string} codigo  - ej: "NEURO-47"
 * @param {string} nombre  - nombre del jugador
 * @returns {object} { sesionId, jugadorId, error? }
 */
export async function unirseASesion(codigo, nombre) {
  if (!codigo.trim() || !nombre.trim()) {
    return { error: 'Ingresa el código y tu nombre' };
  }

  // Buscar sesión activa con ese código
  const snap = await getDocs(
    query(
      collection(db, 'sesiones'),
      where('codigo', '==', codigo.toUpperCase().trim()),
      where('estado', 'in', ['lobby', 'activa'])
    )
  );

  if (snap.empty) {
    return { error: 'Código inválido o la sesión ya terminó' };
  }

  const sesionDoc = snap.docs[0];
  const sesionId  = sesionDoc.id;
  const jugadorId = `jugador_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // Registrar jugador en subcolección
  await setDoc(doc(db, 'sesiones', sesionId, 'jugadores', jugadorId), {
    nombre:       nombre.trim(),
    activo:       true,
    conectadoEn:  serverTimestamp(),
    ultimaActiv:  serverTimestamp(),
  });

  // Guardar en localStorage para persistir si recarga el celular
  localStorage.setItem('psmile_jugador', JSON.stringify({ sesionId, jugadorId, nombre: nombre.trim(), codigo }));

  return { sesionId, jugadorId };
}

// ── RECUPERAR SESIÓN GUARDADA (jugador) ──────────────────────────
/**
 * Si el jugador recargó la página, intenta reconectarlo
 */
export function recuperarSesionJugador() {
  try {
    const saved = localStorage.getItem('psmile_jugador');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function limpiarSesionJugador() {
  localStorage.removeItem('psmile_jugador');
}

// ── GUARDAR RESPUESTA (jugador) ──────────────────────────────────
/**
 * Guarda o actualiza las respuestas de un jugador para un bloque
 *
 * @param {string} sesionId
 * @param {string} jugadorId
 * @param {string} bloqueId  - ej: 'semaforo', 'rrr', 'checkout'
 * @param {object} datos     - las respuestas del bloque
 */
export async function guardarRespuesta(sesionId, jugadorId, bloqueId, datos) {
  const ref = doc(db, 'sesiones', sesionId, 'respuestas', `${jugadorId}_${bloqueId}`);
  await setDoc(ref, {
    jugadorId,
    bloqueId,
    ...datos,
    guardadoEn: serverTimestamp(),
  }, { merge: true });

  // Actualizar última actividad del jugador
  await updateDoc(doc(db, 'sesiones', sesionId, 'jugadores', jugadorId), {
    ultimaActiv: serverTimestamp(),
    ultimoBloque: bloqueId,
  });
}

// ── AVANZAR BLOQUE (facilitador) ─────────────────────────────────
/**
 * El facilitador avanza al siguiente bloque.
 * Todos los jugadores conectados reciben el cambio en tiempo real.
 */
export async function avanzarBloque(sesionId, bloqueActual, bloqueTotal) {
  const siguiente = bloqueActual + 1;
  const esUltimo  = siguiente > bloqueTotal;

  await updateDoc(doc(db, 'sesiones', sesionId), {
    bloqueActual:     siguiente,
    estado:           esUltimo ? 'completada' : 'activa',
    mostrarResultados: false, // resetear al avanzar
    actualizadaEn:    serverTimestamp(),
  });
}

// ── REVELAR RESULTADOS (facilitador) ────────────────────────────
export async function toggleMostrarResultados(sesionId, estado) {
  await updateDoc(doc(db, 'sesiones', sesionId), {
    mostrarResultados: estado,
    actualizadaEn: serverTimestamp(),
  });
}

// ── INICIAR SESIÓN desde lobby ───────────────────────────────────
export async function iniciarSesion(sesionId) {
  await updateDoc(doc(db, 'sesiones', sesionId), {
    estado:        'activa',
    bloqueActual:  1,
    iniciadaEn:    serverTimestamp(),
    actualizadaEn: serverTimestamp(),
  });
}

// ── CANCELAR SESIÓN ──────────────────────────────────────────────
export async function cancelarSesion(sesionId) {
  await updateDoc(doc(db, 'sesiones', sesionId), {
    estado:        'cancelada',
    actualizadaEn: serverTimestamp(),
  });
}

// ── OBTENER HISTORIAL DE SESIONES ───────────────────────────────
/**
 * Retorna las últimas sesiones de una academia
 */
export async function getSesionesAcademia(academiaId, limite = 20) {
  const snap = await getDocs(
    query(
      collection(db, 'sesiones'),
      where('academiaId', '==', academiaId),
      where('estado', 'in', ['activa', 'completada', 'cancelada'])
    )
  );
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.creadaEn?.seconds || 0) - (a.creadaEn?.seconds || 0))
    .slice(0, limite);
}
