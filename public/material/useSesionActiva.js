// src/hooks/useSesionActiva.js
// Hook principal de tiempo real — escucha todo lo que pasa en una sesión activa

import { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase';
import {
  doc, collection, onSnapshot, query,
  orderBy, serverTimestamp, updateDoc
} from 'firebase/firestore';

/**
 * useSesionActiva
 * ----------------
 * Conecta en tiempo real a una sesión de Firestore.
 * Lo usan tanto el facilitador como los jugadores.
 *
 * @param {string} sesionId - ID del documento en /sesiones
 * @returns {object} { sesion, jugadores, respuestas, loading, error }
 */
export function useSesionActiva(sesionId) {
  const [sesion, setSesion]         = useState(null);
  const [jugadores, setJugadores]   = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!sesionId) return;

    const unsubs = [];

    // ── 1. Sesión principal ─────────────────────────────────
    const sesionRef = doc(db, 'sesiones', sesionId);
    unsubs.push(
      onSnapshot(sesionRef, (snap) => {
        if (snap.exists()) {
          setSesion({ id: snap.id, ...snap.data() });
        } else {
          setError('Sesión no encontrada');
        }
        setLoading(false);
      }, (err) => {
        console.error('Error sesión:', err);
        setError(err.message);
        setLoading(false);
      })
    );

    // ── 2. Jugadores conectados ─────────────────────────────
    const jugadoresRef = collection(db, 'sesiones', sesionId, 'jugadores');
    unsubs.push(
      onSnapshot(
        query(jugadoresRef, orderBy('conectadoEn', 'asc')),
        (snap) => {
          setJugadores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      )
    );

    // ── 3. Respuestas en tiempo real ────────────────────────
    const respuestasRef = collection(db, 'sesiones', sesionId, 'respuestas');
    unsubs.push(
      onSnapshot(respuestasRef, (snap) => {
        const map = {};
        snap.docs.forEach(d => { map[d.id] = d.data(); });
        setRespuestas(map);
      })
    );

    return () => unsubs.forEach(u => u());
  }, [sesionId]);

  return { sesion, jugadores, respuestas, loading, error };
}

/**
 * useJugadoresConectados
 * -----------------------
 * Versión simplificada — solo lista de jugadores activos.
 * Útil para el lobby del facilitador.
 */
export function useJugadoresConectados(sesionId) {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!sesionId) return;
    const ref = collection(db, 'sesiones', sesionId, 'jugadores');
    const unsub = onSnapshot(
      query(ref, orderBy('conectadoEn', 'asc')),
      (snap) => {
        setJugadores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    return () => unsub();
  }, [sesionId]);

  return { jugadores, loading };
}

/**
 * useRespuestasBloque
 * --------------------
 * Respuestas de un bloque específico de todos los jugadores.
 * Calcula estadísticas automáticamente.
 *
 * @param {string} sesionId
 * @param {string} bloqueId - ej: 'semaforo', 'rrr', 'checkout'
 */
export function useRespuestasBloque(sesionId, bloqueId) {
  const [respuestas, setRespuestas] = useState([]);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!sesionId || !bloqueId) return;
    const ref = collection(db, 'sesiones', sesionId, 'respuestas');
    const unsub = onSnapshot(ref, (snap) => {
      const filtered = snap.docs
        .filter(d => d.id.endsWith(`_${bloqueId}`))
        .map(d => ({ jugadorId: d.id.replace(`_${bloqueId}`, ''), ...d.data() }));

      setRespuestas(filtered);
      setStats(calcularStats(filtered, bloqueId));
      setLoading(false);
    });
    return () => unsub();
  }, [sesionId, bloqueId]);

  return { respuestas, stats, loading };
}

// ── Helpers de estadísticas ─────────────────────────────────────
function calcularStats(respuestas, bloqueId) {
  if (bloqueId === 'semaforo') {
    // Conteo de reacciones por situación
    const porSit = {};
    respuestas.forEach(r => {
      Object.entries(r).forEach(([key, val]) => {
        if (key.startsWith('sit')) {
          if (!porSit[key]) porSit[key] = {};
          porSit[key][val] = (porSit[key][val] || 0) + 1;
        }
      });
    });
    return { porSit, total: respuestas.length };
  }

  if (bloqueId === 'checkout') {
    // Frecuencia de palabras para nube
    const freq = {};
    respuestas.forEach(r => {
      ['palabra1', 'palabra2', 'palabra3'].forEach(k => {
        if (r[k]) {
          const word = r[k].toUpperCase().trim();
          freq[word] = (freq[word] || 0) + 1;
        }
      });
    });
    return { freq, total: respuestas.length };
  }

  if (bloqueId === 'mapa') {
    // Agregar todos los trazos
    const allTrazos = respuestas.flatMap(r => r.trazos || []);
    return { trazos: allTrazos, total: respuestas.length };
  }

  return { total: respuestas.length };
}
