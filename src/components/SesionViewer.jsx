// src/components/SesionViewer.jsx
// Renderiza la sesión interactiva y guarda respuestas en Firestore en tiempo real
// Ruta: /portal/jugador/:id/sesion/:sesionId

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc, getDoc, setDoc, serverTimestamp, collection
} from 'firebase/firestore';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

// ─── TIMER HOOK ────────────────────────────────────────────────────────────────
function useSessionTimer() {
  const [secs, setSecs] = useState(3600);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  const toggle = () => {
    if (running) { clearInterval(ref.current); setRunning(false); }
    else {
      setRunning(true);
      ref.current = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    }
  };
  useEffect(() => () => clearInterval(ref.current), []);

  const fmt = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  return { fmt, running, toggle, secs };
}

// ─── BREATH TIMER ─────────────────────────────────────────────────────────────
function BreathTimer() {
  const CIRC = 2 * Math.PI * 55;
  const phases = [
    { n: 'INHALA', d: 4, c: '#4fa8c9' },
    { n: 'PAUSA',  d: 2, c: '#e8a020' },
    { n: 'EXHALA', d: 4, c: '#2eb8a0' },
  ];
  const [ph, setPh] = useState(0);
  const [cnt, setCnt] = useState(0);
  const [cyc, setCyc] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  const tick = () => {
    setCnt(prev => {
      const next = prev + 1;
      if (next >= phases[ph].d) {
        setPh(p => {
          const np = (p + 1) % 3;
          if (np === 0) setCyc(c => c + 1);
          return np;
        });
        return 0;
      }
      return next;
    });
  };

  const toggle = () => {
    if (running) { clearInterval(ref.current); setRunning(false); }
    else { setRunning(true); ref.current = setInterval(tick, 1000); }
  };
  const reset = () => {
    clearInterval(ref.current); setRunning(false);
    setPh(0); setCnt(0); setCyc(0);
  };
  useEffect(() => () => clearInterval(ref.current), []);

  const offset = CIRC * (1 - cnt / phases[ph].d);
  const done = cyc >= 3;

  return (
    <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 13, padding: 22, textAlign: 'center', margin: '12px 0' }}>
      <p style={{ fontFamily: 'Lora, serif', fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>
        Inhala 4 · Pausa 2 · Exhala 4
      </p>
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 14px' }}>
        <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 140 140">
          <circle fill="none" stroke="var(--border)" strokeWidth={8} cx={70} cy={70} r={55} />
          <circle fill="none" stroke={phases[ph].c} strokeWidth={8} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s' }}
            cx={70} cy={70} r={55} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {phases[ph].d - cnt}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginTop: 2 }}>
            {phases[ph].n}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
        <button onClick={toggle} disabled={done}
          style={{ background: 'var(--gold)', color: 'var(--ink)', border: 'none', borderRadius: 100, padding: '8px 22px', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: done ? 0.5 : 1 }}>
          {running ? '⏸ Pausar' : '▶ Practicar'}
        </button>
        <button onClick={reset}
          style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 100, padding: '8px 14px', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          ↺
        </button>
      </div>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: done ? 'var(--teal)' : 'var(--muted)', marginTop: 10 }}>
        {done ? '✓ ¡Bien hecho!' : `${cyc} / 3 ciclos`}
      </p>
    </div>
  );
}

// ─── HELPER COMPONENTS (Moved outside to prevent focus loss) ─────────────────
const SitCard = ({ sitId, emoji, text, sitRatings, rateSit, S }) => (
  <div style={{ background: '#162231', border: `1px solid ${sitRatings[sitId] ? 'rgba(46,184,160,0.28)' : '#1e2d3d'}`, borderRadius: 11, padding: 16, marginBottom: 8 }}>
    <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.5, marginBottom: 12 }}>{emoji} {text}</p>
    <div style={{ display: 'flex', gap: 5 }}>
      {[1, 2, 3, 4, 5].map(v => (
        <div key={v} style={S.sitDot(v, sitRatings[sitId] === v)} onClick={() => rateSit(sitId, v)}>{v}</div>
      ))}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6b8099', marginTop: 6 }}>
      <span>Casi nada</span><span>Muchísimo</span>
    </div>
  </div>
);

const RRRStep = ({ letter, bg, title, desc, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', borderRadius: 11, overflow: 'hidden', border: '1px solid #1e2d3d', marginBottom: 8 }}>
    <div style={{ background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff' }}>{letter}</div>
    <div style={{ padding: '13px 13px 13px 4px', background: '#162231' }}>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{title}</p>
      <p style={{ fontSize: 12, color: '#6b8099', fontStyle: 'italic', marginBottom: 9 }}>{desc}</p>
      {children}
    </div>
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SesionViewer() {
  const { id: jugadorId, sesionId } = useParams();
  const navigate = useNavigate();
  const timer = useSessionTimer();

  const [jugador, setJugador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBlock, setActiveBlock] = useState(1);
  const [unlockedBlocks, setUnlockedBlocks] = useState([1]);
  const [completedBlocks, setCompletedBlocks] = useState([]);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  // Respuestas del jugador
  const [checkinVal, setCheckinVal] = useState(null);
  const [sitRatings, setSitRatings] = useState({});
  const [termInsight, setTermInsight] = useState(null);
  const [videoRef1, setVideoRef1] = useState('PPHrQnyHDR4');
  const [videoInput1, setVideoInput1] = useState('');
  const [videoLoaded1, setVideoLoaded1] = useState(true);
  const [videoReflection, setVideoReflection] = useState('');
  const [disps, setDisps] = useState([
    { situacion: '', emocion: '', pensamiento: '', conducta: '' },
    { situacion: '', emocion: '', pensamiento: '', conducta: '' },
    { situacion: '', emocion: '', pensamiento: '', conducta: '' },
  ]);
  const [dispInsights, setDispInsights] = useState([false, false, false]);
  const [rrrReconocer, setRrrReconocer] = useState('');
  const [rrrReseteo, setRrrReseteo] = useState('');
  const [palabraAncla, setPalabraAncla] = useState('');
  const [compromiso, setCompromiso] = useState('');

  useEffect(() => {
    const fetchJugador = async () => {
      const snap = await getDoc(doc(db, 'jugadores', jugadorId));
      if (snap.exists()) setJugador({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetchJugador();
  }, [jugadorId]);

  // ── GUARDAR BLOQUE EN FIRESTORE ──────────────────────────────────────────────
  const saveBlock = async (blockNum, data) => {
    try {
      const ref = doc(collection(db, 'jugadores', jugadorId, 'sesiones'), sesionId);
      await setDoc(ref, {
        sesionId,
        jugadorId,
        [`bloque_${blockNum}`]: { ...data, guardadoEn: new Date().toISOString() },
        ultimoBloque: blockNum,
        actualizadoEn: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Error guardando bloque:', err);
    }
  };

  // ── GUARDAR SESIÓN COMPLETA ──────────────────────────────────────────────────
  const saveComplete = async () => {
    setSaving(true);
    try {
      const sitVals = Object.values(sitRatings);
      const sitLabels = {
        sit1: 'que te reten por un error', sit2: 'las decisiones del árbitro',
        sit3: 'provocaciones de rivales', sit4: 'fallar una oportunidad',
        sit5: 'no entrar a jugar',
      };
      const maxVal = Math.max(...sitVals);
      const topEntry = Object.entries(sitRatings).find(([, v]) => v === maxVal);
      const disparadorTop = topEntry ? sitLabels[topEntry[0]] : '';

      const ref = doc(collection(db, 'jugadores', jugadorId, 'sesiones'), sesionId);
      await setDoc(ref, {
        sesionId,
        jugadorId,
        completada: true,
        completadoEn: serverTimestamp(),
        // Campos de resumen para mostrar en la carpeta del jugador
        checkin: checkinVal,
        disparadorTop,
        palabraAncla,
        compromiso,
        // Detalle completo
        bloque_1_checkin: checkinVal,
        bloque_2_termometro: sitRatings,
        bloque_3_video: { reflection: videoReflection },
        bloque_4_disparadores: disps,
        bloque_5_rrr: { reconocer: rrrReconocer, reseteo: rrrReseteo, palabraAncla },
        bloque_6_compromiso: compromiso,
      }, { merge: true });

      setFinished(true);
    } catch (err) {
      console.error('Error guardando sesión:', err);
      alert('Error al guardar. Revisa tu conexión.');
    } finally {
      setSaving(false);
    }
  };

  // ── AVANZAR BLOQUE ───────────────────────────────────────────────────────────
  const advance = async (current, next) => {
    // Guardar datos del bloque actual
    const blockData = {
      1: { checkin: checkinVal },
      2: { sitRatings },
      3: { videoReflection },
      4: { disps },
      5: { rrrReconocer, rrrReseteo, palabraAncla },
    };
    if (blockData[current]) await saveBlock(current, blockData[current]);

    setCompletedBlocks(prev => [...new Set([...prev, current])]);
    setUnlockedBlocks(prev => [...new Set([...prev, next])]);
    setActiveBlock(next);
    setTimeout(() => {
      document.getElementById(`block${next}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
  };

  // ── TERMÓMETRO ───────────────────────────────────────────────────────────────
  const rateSit = (sitId, val) => {
    const updated = { ...sitRatings, [sitId]: val };
    setSitRatings(updated);
    if (Object.keys(updated).length === 5) {
      const labels = {
        sit1: 'que te reten por un error', sit2: 'decisiones del árbitro',
        sit3: 'provocaciones de rivales', sit4: 'fallar una oportunidad',
        sit5: 'no entrar a jugar',
      };
      const vals = Object.values(updated);
      const max = Math.max(...vals);
      const mk = Object.entries(updated).find(([, v]) => v === max)?.[0];
      const avg = (vals.reduce((a, b) => a + b, 0) / 5).toFixed(1);
      setTermInsight(`Lo que más te afecta: ${labels[mk]} (${max}/5) · Promedio: ${avg}/5`);
    }
  };

  // ── DISPARADORES ─────────────────────────────────────────────────────────────
  const updateDisp = (idx, field, value) => {
    const updated = disps.map((d, i) => i === idx ? { ...d, [field]: value } : d);
    setDisps(updated);
    const filled = Object.values(updated[idx]).filter(v => typeof v === 'string' && v.trim().length > 2).length;
    if (filled >= 4) {
      setDispInsights(prev => prev.map((v, i) => i === idx ? true : v));
    }
  };

  // ── VIDEO LOADER ─────────────────────────────────────────────────────────────
  const loadVideo = () => {
    const m = videoInput1.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (m) { setVideoRef1(m[1]); setVideoLoaded1(true); }
    else alert('URL de YouTube no reconocida.');
  };

  // ── PROGRESO ─────────────────────────────────────────────────────────────────
  const progress = (completedBlocks.length / 6) * 100;

  // ── ESTILOS BASE (los mismos de tu sesión HTML) ───────────────────────────────
  const S = {
    page: { minHeight: '100vh', background: '#0c1720', color: '#fff', fontFamily: 'Lora, serif' },
    header: { background: '#162030', borderBottom: '1px solid #1e2d3d', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 90 },
    badge: { background: '#c0392b', color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    progressBar: { position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: '#1e2d3d', zIndex: 100 },
    blocks: { maxWidth: 720, margin: '0 auto', padding: '32px 16px 90px' },
    block: (unlocked, completed) => ({
      marginBottom: 8, borderRadius: 16,
      border: `1px solid ${completed ? 'rgba(46,184,160,0.3)' : '#1e2d3d'}`,
      background: '#111c27', overflow: 'hidden',
      transition: 'opacity 0.35s ease, border-color 0.3s',
      opacity: unlocked ? 1 : 0.28, pointerEvents: unlocked ? 'all' : 'none',
    }),
    blockHead: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' },
    blockBody: (open) => ({ display: open ? 'block' : 'none', padding: '0 20px 24px' }),
    ctxPill: { display: 'inline-flex', alignItems: 'center', gap: 7, background: '#162030', border: '1px solid #1e2d3d', borderRadius: 100, padding: '6px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099', marginBottom: 20 },
    scaleBtn: (selected) => ({
      width: 52, height: 52, borderRadius: '50%', border: `2px solid ${selected ? '#c0392b' : '#1e2d3d'}`,
      background: selected ? '#c0392b' : '#162231', fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700,
      color: selected ? '#fff' : '#6b8099', cursor: 'pointer', transition: 'all 0.18s',
      transform: selected ? 'scale(1.14)' : 'scale(1)',
      boxShadow: selected ? '0 0 18px rgba(192,57,43,0.4)' : 'none',
    }),
    sitDot: (val, active) => {
      const colors = { 1: '#27ae60', 2: '#8bc34a', 3: '#ffc107', 4: '#ff7043', 5: '#e53935' };
      return {
        flex: 1, height: 38, borderRadius: 7, cursor: 'pointer',
        border: `1.5px solid ${active ? colors[val] : '#1e2d3d'}`,
        background: active ? `${colors[val]}22` : '#111c27',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700,
        color: active ? colors[val] : '#6b8099', transition: 'all 0.18s',
      };
    },
    fieldInput: { width: '100%', background: '#0c1720', border: '1px solid #1e2d3d', borderRadius: 7, color: '#fff', fontFamily: 'Lora, serif', fontSize: 14, padding: '9px 11px', outline: 'none', marginBottom: 10 },
    advanceBtn: (finish) => ({
      background: finish ? '#2eb8a0' : '#c0392b', color: '#fff', border: 'none', borderRadius: 10,
      padding: '10px 24px', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
    }),
  };


  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '2px solid rgba(0,112,243,0.3)', borderTopColor: '#0070F3', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={S.page}>
      {/* CSS variables */}
      <style>{`
        :root { --ink:#0c1720;--ink2:#162030;--card:#111c27;--card2:#162231;--red:#c0392b;--red2:#e05244;--gold:#e8a020;--teal:#2eb8a0;--white:#fff;--muted:#6b8099;--border:#1e2d3d; }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Lora:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #6b8099; }
        textarea::placeholder { color: #6b8099; }
        input:focus { border-color: #c0392b !important; }
        textarea:focus { border-color: #c0392b !important; }
      `}</style>

      {/* Progress bar */}
      <div style={S.progressBar}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#c0392b,#e8a020)', width: `${progress}%`, transition: 'width 0.6s ease' }} />
      </div>

      {/* Header */}
      <div style={S.header}>
        <button onClick={() => navigate(`/portal/jugador/${jugadorId}/sesiones`)}
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', color: '#6b8099', borderRadius: 10, padding: '6px 10px', cursor: 'pointer' }}>
          <ArrowLeft size={16} />
        </button>
        <div style={S.badge}>⚽</div>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#e05244', marginBottom: 2 }}>
            Psicología Deportiva · PSMILE
          </p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>Las Emociones también Juegan</p>
          {jugador && <p style={{ fontSize: 12, fontStyle: 'italic', color: '#6b8099', marginTop: 2 }}>{jugador.nombre} · {jugador.categoria}</p>}
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 600, color: timer.secs <= 600 ? '#e05244' : '#e8a020' }}>
            {timer.fmt}
          </div>
          <button onClick={timer.toggle}
            style={{ background: 'rgba(232,160,32,0.12)', border: '1px solid #e8a020', color: '#e8a020', padding: '4px 12px', borderRadius: 100, fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
            {timer.running ? '⏸ Pausar' : '▶ Iniciar'}
          </button>
        </div>
      </div>

      {/* ── FINISHED SCREEN ─────────────────────────────────────── */}
      {finished ? (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 16px 80px', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 8 }}>¡Lo lograste!</h2>
          <p style={{ fontFamily: 'Lora, serif', fontSize: 15, fontStyle: 'italic', color: '#6b8099', marginBottom: 28, lineHeight: 1.6 }}>
            Ya tienes tu propio botón de reset.<br />La diferencia está en usarlo cuando más lo necesitas.
          </p>
          <div style={{ background: '#111c27', border: '1px solid #1e2d3d', borderRadius: 13, padding: 22, textAlign: 'left', maxWidth: 520, margin: '0 auto 24px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#e8a020', marginBottom: 14 }}>📋 Para esta semana</p>
            {[
              'Anota 3 momentos en los que sentiste que ibas a explotar — qué pasó, qué hiciste y cómo te fue.',
              'Practica la respiración en psmilechile.com — 5 min antes del entrenamiento.',
              'En el próximo partido, ejecuta tu Rutina RRR la primera vez que algo te moleste.',
              'Cuéntale a un compañero de qué trata la Rutina RRR.',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 12 }}>
                <CheckCircle2 size={16} style={{ color: '#2eb8a0', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.55 }}>{t}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate(`/portal/jugador/${jugadorId}/sesiones`)}
            style={{ background: '#0070F3', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            ← Volver a la carpeta
          </button>
        </div>
      ) : (

      /* ── BLOCKS ─────────────────────────────────────────────── */
      <div style={S.blocks}>

        {/* BLOQUE 1 — CHECK-IN */}
        <div id="block1" style={S.block(unlockedBlocks.includes(1), completedBlocks.includes(1))}>
          <div style={S.blockHead} onClick={() => setActiveBlock(activeBlock === 1 ? null : 1)}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099', width: 22, textAlign: 'center' }}>01</span>
            <span style={{ fontSize: 20 }}>🎯</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>¿Cómo llegaste hoy?</p>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: '#6b8099', marginTop: 2 }}>Punto de partida</p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099' }}>10 min</span>
            <span style={{ color: '#6b8099', fontSize: 14, transition: 'transform 0.3s', transform: activeBlock === 1 ? 'rotate(180deg)' : 'none' }}>▾</span>
          </div>
          <div style={S.blockBody(activeBlock === 1)}>
            <div style={S.ctxPill}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c0392b', flexShrink: 0 }} />Sin filtro — lo primero que sientas</div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.35, marginBottom: 10 }}>Del 1 al 10<br />¿Cómo estás mentalmente hoy?</p>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 13, color: '#6b8099', fontStyle: 'italic', textAlign: 'center', marginBottom: 24 }}>1 = con la cabeza en otro lado · 10 = enfocado y listo</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} style={S.scaleBtn(checkinVal === n)} onClick={() => setCheckinVal(n)}>{n}</button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6b8099', padding: '0 2px', maxWidth: 480, margin: '0 auto' }}>
              <span>Con la cabeza en otro lado</span><span>Enfocado y listo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22, paddingTop: 16, borderTop: '1px solid #1e2d3d' }}>
              <button style={S.advanceBtn(false)} onClick={() => advance(1, 2)}>Siguiente →</button>
            </div>
          </div>
        </div>

        {/* BLOQUE 2 — TERMÓMETRO */}
        <div id="block2" style={S.block(unlockedBlocks.includes(2), completedBlocks.includes(2))}>
          <div style={S.blockHead} onClick={() => unlockedBlocks.includes(2) && setActiveBlock(activeBlock === 2 ? null : 2)}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099', width: 22, textAlign: 'center' }}>02</span>
            <span style={{ fontSize: 20 }}>🌡️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>El Termómetro del Jugador</p>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: '#6b8099', marginTop: 2 }}>¿Qué cosas te hacen perder la cabeza en la cancha?</p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099' }}>10 min</span>
            <span style={{ color: '#6b8099', fontSize: 14, transform: activeBlock === 2 ? 'rotate(180deg)' : 'none' }}>▾</span>
          </div>
          <div style={S.blockBody(activeBlock === 2)}>
            <div style={S.ctxPill}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c0392b', flexShrink: 0 }} />1 = casi nada · 5 = me saca muchísimo</div>
            <SitCard sitId="sit1" emoji="😤" text="Cometes un error y tus compañeros o el profe te retan al tiro" sitRatings={sitRatings} rateSit={rateSit} S={S} />
            <SitCard sitId="sit2" emoji="🟨" text="El árbitro te cobra algo que sientes que fue injusto" sitRatings={sitRatings} rateSit={rateSit} S={S} />
            <SitCard sitId="sit3" emoji="🗣️" text="Un rival te provoca o se burla de ti durante el partido" sitRatings={sitRatings} rateSit={rateSit} S={S} />
            <SitCard sitId="sit4" emoji="🥅" text="Fallas una oportunidad clara de gol o un penal importante" sitRatings={sitRatings} rateSit={rateSit} S={S} />
            <SitCard sitId="sit5" emoji="📋" text="El profe te saca del partido o no te pone a jugar" sitRatings={sitRatings} rateSit={rateSit} S={S} />
            {termInsight && (
              <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 9, padding: '12px 14px', marginTop: 12, fontFamily: 'Lora, serif', fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                🔍 {termInsight}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22, paddingTop: 16, borderTop: '1px solid #1e2d3d' }}>
              <button style={S.advanceBtn(false)} onClick={() => advance(2, 3)}>Siguiente →</button>
            </div>
          </div>
        </div>

        {/* BLOQUE 3 — VIDEO */}
        <div id="block3" style={S.block(unlockedBlocks.includes(3), completedBlocks.includes(3))}>
          <div style={S.blockHead} onClick={() => unlockedBlocks.includes(3) && setActiveBlock(activeBlock === 3 ? null : 3)}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099', width: 22, textAlign: 'center' }}>03</span>
            <span style={{ fontSize: 20 }}>▶️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>Reaccionar vs. Controlar</p>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: '#6b8099', marginTop: 2 }}>¿Qué le pasa al equipo cuando un jugador explota?</p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099' }}>10 min</span>
            <span style={{ color: '#6b8099', fontSize: 14, transform: activeBlock === 3 ? 'rotate(180deg)' : 'none' }}>▾</span>
          </div>
          <div style={S.blockBody(activeBlock === 3)}>
            <div style={S.ctxPill}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c0392b', flexShrink: 0 }} />Mira qué le pasa al jugador y al equipo después</div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#6b8099', marginBottom: 8 }}>Video — Lo que pasa cuando perdemos el control</p>
            <div style={{ position: 'relative', background: '#0c1720', borderRadius: 11, overflow: 'hidden', aspectRatio: '16/9', marginBottom: 10, border: '1px solid #1e2d3d' }}>
              {videoLoaded1 ? (
                <iframe src={`https://www.youtube.com/embed/${videoRef1}?rel=0`} allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
                  onClick={() => document.getElementById('videoInputArea').style.display = 'flex'}>
                  <div style={{ width: 58, height: 58, background: 'rgba(192,57,43,0.16)', border: '2px solid #c0392b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>▶</div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6b8099' }}>Toca para cargar el video</p>
                </div>
              )}
            </div>
            <div style={{ background: '#162231', border: '1px solid #1e2d3d', borderRadius: 10, padding: 14, marginTop: 4 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>¿Alguna vez te pasó algo así? ¿Cómo te fue después?</p>
              <textarea style={{ ...S.fieldInput, minHeight: 60, lineHeight: 1.6, resize: 'none', marginBottom: 0 }} value={videoReflection} onChange={e => setVideoReflection(e.target.value)} placeholder="Siendo honesto..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22, paddingTop: 16, borderTop: '1px solid #1e2d3d' }}>
              <button style={S.advanceBtn(false)} onClick={() => advance(3, 4)}>Siguiente →</button>
            </div>
          </div>
        </div>

        {/* BLOQUE 4 — DISPARADORES */}
        <div id="block4" style={S.block(unlockedBlocks.includes(4), completedBlocks.includes(4))}>
          <div style={S.blockHead} onClick={() => unlockedBlocks.includes(4) && setActiveBlock(activeBlock === 4 ? null : 4)}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099', width: 22, textAlign: 'center' }}>04</span>
            <span style={{ fontSize: 20 }}>🗺️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>Mis Disparadores</p>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: '#6b8099', marginTop: 2 }}>¿Qué te saca y qué haces después?</p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099' }}>15 min</span>
            <span style={{ color: '#6b8099', fontSize: 14, transform: activeBlock === 4 ? 'rotate(180deg)' : 'none' }}>▾</span>
          </div>
          <div style={S.blockBody(activeBlock === 4)}>
            <div style={S.ctxPill}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c0392b', flexShrink: 0 }} />Qué pasó → qué sentiste → qué pensaste → qué hiciste</div>
            {disps.map((d, i) => (
              <div key={i} style={{ background: '#162231', border: '1px solid #1e2d3d', borderRadius: 11, padding: 18, marginBottom: 8 }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#e05244', marginBottom: 12 }}>⚡ Situación {String(i + 1).padStart(2, '0')}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6b8099', marginBottom: 5 }}>¿Qué pasó en la cancha?</p>
                <input style={S.fieldInput} value={d.situacion} onChange={e => updateDisp(i, 'situacion', e.target.value)} placeholder={i === 0 ? 'Ej: El árbitro me cobró algo injusto' : ''} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6b8099', marginBottom: 5 }}>¿Qué sentiste?</p>
                    <input style={S.fieldInput} value={d.emocion} onChange={e => updateDisp(i, 'emocion', e.target.value)} placeholder={i === 0 ? 'Ej: Rabia, vergüenza...' : ''} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6b8099', marginBottom: 5 }}>¿Qué pensaste?</p>
                    <input style={S.fieldInput} value={d.pensamiento} onChange={e => updateDisp(i, 'pensamiento', e.target.value)} placeholder={i === 0 ? "Ej: 'Esto es injusto'" : ''} />
                  </div>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6b8099', marginBottom: 5 }}>¿Qué hiciste después?</p>
                <input style={S.fieldInput} value={d.conducta} onChange={e => updateDisp(i, 'conducta', e.target.value)} placeholder={i === 0 ? 'Ej: Reclamé, me bloqueé...' : ''} />
                {dispInsights[i] && (
                  <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 9, padding: '10px 14px', fontFamily: 'Lora, serif', fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                    🔍 ¡Bien! Reconocer el ciclo es el primer paso para poder cambiarlo.
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22, paddingTop: 16, borderTop: '1px solid #1e2d3d' }}>
              <button style={S.advanceBtn(false)} onClick={() => advance(4, 5)}>Siguiente →</button>
            </div>
          </div>
        </div>

        {/* BLOQUE 5 — RUTINA RRR */}
        <div id="block5" style={S.block(unlockedBlocks.includes(5), completedBlocks.includes(5))}>
          <div style={S.blockHead} onClick={() => unlockedBlocks.includes(5) && setActiveBlock(activeBlock === 5 ? null : 5)}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099', width: 22, textAlign: 'center' }}>05</span>
            <span style={{ fontSize: 20 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>Mi Rutina RRR</p>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: '#6b8099', marginTop: 2 }}>Tu botón de reset personal</p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099' }}>15 min</span>
            <span style={{ color: '#6b8099', fontSize: 14, transform: activeBlock === 5 ? 'rotate(180deg)' : 'none' }}>▾</span>
          </div>
          <div style={S.blockBody(activeBlock === 5)}>
            <div style={S.ctxPill}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c0392b', flexShrink: 0 }} />Reconocer · Resetear · Reenfocarse — 3 segundos en la cancha</div>
            <RRRStep letter="R" bg="#c0392b" title="RECONOZCO" desc="Noto la señal en mi cuerpo antes de explotar">
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6b8099', marginBottom: 5 }}>¿Dónde lo sientes primero?</p>
              <input style={S.fieldInput} value={rrrReconocer} onChange={e => setRrrReconocer(e.target.value)} placeholder="Ej: Me aprieta el pecho, me tiemblan las manos..." />
            </RRRStep>
            <RRRStep letter="R" bg="#e8a020" title="RESETEO" desc='Un gesto físico tuyo que dice "para, vuelve"'>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6b8099', marginBottom: 5 }}>¿Cuál es tu gesto de reset?</p>
              <input style={S.fieldInput} value={rrrReseteo} onChange={e => setRrrReseteo(e.target.value)} placeholder="Ej: Me ajusto la camiseta, doy un paso atrás..." />
            </RRRStep>
            <RRRStep letter="R" bg="#2eb8a0" title="REENFOCO" desc="Respiración 4-2-4 + tu palabra de vuelta al juego">
              <BreathTimer />
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6b8099', marginBottom: 5, marginTop: 12 }}>Tu palabra de vuelta al juego</p>
              <input style={S.fieldInput} value={palabraAncla} onChange={e => setPalabraAncla(e.target.value)} placeholder="Ej: 'Ya' · 'Siguiente' · 'Enfócate' · 'Tú puedes'" />
              <div style={{ textAlign: 'center' }}>
                <a href="https://psmilechile.com" target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(46,184,160,0.1)', border: '1px solid rgba(46,184,160,0.3)', color: '#2eb8a0', padding: '8px 16px', borderRadius: 100, fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, textDecoration: 'none', marginTop: 12 }}>
                  🫁 Entrenador de pulsaciones — psmilechile.com
                </a>
              </div>
            </RRRStep>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22, paddingTop: 16, borderTop: '1px solid #1e2d3d' }}>
              <button style={S.advanceBtn(false)} onClick={() => advance(5, 6)}>Ir al cierre →</button>
            </div>
          </div>
        </div>

        {/* BLOQUE 6 — COMPROMISO */}
        <div id="block6" style={S.block(unlockedBlocks.includes(6), completedBlocks.includes(6))}>
          <div style={S.blockHead} onClick={() => unlockedBlocks.includes(6) && setActiveBlock(activeBlock === 6 ? null : 6)}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099', width: 22, textAlign: 'center' }}>06</span>
            <span style={{ fontSize: 20 }}>🏁</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>Mi Compromiso</p>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: '#6b8099', marginTop: 2 }}>¿Qué vas a hacer diferente en la cancha?</p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b8099' }}>10 min</span>
            <span style={{ color: '#6b8099', fontSize: 14, transform: activeBlock === 6 ? 'rotate(180deg)' : 'none' }}>▾</span>
          </div>
          <div style={S.blockBody(activeBlock === 6)}>
            <div style={S.ctxPill}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c0392b', flexShrink: 0 }} />Una sola cosa, concreta y tuya</div>
            <div style={{ background: 'linear-gradient(135deg,rgba(192,57,43,0.12),rgba(232,160,32,0.12))', border: '1px solid rgba(232,160,32,0.22)', borderRadius: 13, padding: 20 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#e8a020', marginBottom: 8 }}>Lo que me llevo hoy</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>La próxima vez que sienta que voy a explotar, voy a...</p>
              <textarea style={{ width: '100%', background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 8, color: '#fff', fontFamily: 'Lora, serif', fontSize: 14, padding: 11, resize: 'none', outline: 'none', minHeight: 70, lineHeight: 1.6 }}
                value={compromiso} onChange={e => setCompromiso(e.target.value)} placeholder="Escríbelo en tus palabras..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22, paddingTop: 16, borderTop: '1px solid #1e2d3d' }}>
              <button style={{ ...S.advanceBtn(true), opacity: saving ? 0.7 : 1 }} onClick={saveComplete} disabled={saving}>
                {saving ? '⏳ Guardando...' : '✓ Terminar y guardar'}
              </button>
            </div>
          </div>
        </div>

      </div>
      )}
    </div>
  );
}
