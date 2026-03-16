// src/components/sesiones/JugadorView.jsx
// Lo que ve el jugador en su celular durante la sesión.
// Cambia automáticamente cuando el facilitador avanza el bloque.
// Ruta: /sala/:sesionId/jugador/:jugadorId

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { guardarRespuesta, limpiarSesionJugador, CHARLAS } from '../../utils/sesionHelpers';
import { Wifi, CheckCircle2, Loader2 } from 'lucide-react';

// ── Colores y fuentes base (mismos que la charla HTML) ───────────
const S = {
  page:   { minHeight: '100vh', background: '#040608', color: '#fff', fontFamily: "'Barlow', sans-serif", overflowX: 'hidden' },
  card:   { background: '#0e1526', border: '1px solid #1a2640', borderRadius: 14, overflow: 'hidden' },
  kicker: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4a6480' },
  title:  { fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: '#fff', lineHeight: 1 },
  label:  { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4a6480', marginBottom: 8 },
  input:  { width: '100%', minHeight: '52px', background: '#040608', border: '1px solid #1a2640', borderRadius: 10, color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: '16px', padding: '14px', outline: 'none', marginBottom: 12 },
  btnRed: { width: '100%', minHeight: '52px', background: '#ff2d2d', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
};

// ── Bloque por ID ────────────────────────────────────────────────
const BLOQUES_CONFIG = {
  checkin:  { icono: '🎯', nombre: 'Check-in' },
  semaforo: { icono: '🚦', nombre: 'Semáforo Físico' },
  mapa:     { icono: '🗺️', nombre: 'Mapa del Jugador' },
  impostor: { icono: '🃏', nombre: 'El Impostor' },
  rrr:      { icono: '⚡', nombre: 'Rutina RRR' },
  kahoot:   { icono: '🎮', nombre: 'Kahoot' },
  checkout: { icono: '🏁', nombre: 'Check-out' },
};

// ════════════════════════════════════════════════════════════════
export default function JugadorView() {
  const { sesionId, jugadorId } = useParams();
  const [sesion,    setSesion]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [guardado,  setGuardado]  = useState({});  // {bloqueId: true}
  const [nombre,    setNombre]    = useState('');

  // Recuperar nombre del localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('psmile_jugador') || '{}');
      setNombre(saved.nombre || '');
    } catch {}
  }, []);

  // Escuchar cambios de la sesión en tiempo real
  useEffect(() => {
    if (!sesionId) return;
    const unsub = onSnapshot(doc(db, 'sesiones', sesionId), (snap) => {
      if (snap.exists()) setSesion({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [sesionId]);

  const marcarGuardado = (bloqueId) => {
    setGuardado(prev => ({ ...prev, [bloqueId]: true }));
  };

  const handleGuardar = async (bloqueId, datos) => {
    await guardarRespuesta(sesionId, jugadorId, bloqueId, datos);
    marcarGuardado(bloqueId);
  };

  if (loading) return <PantallaEspera mensaje="Conectando..." />;
  if (!sesion)  return <PantallaEspera mensaje="Sesión no encontrada" />;
  if (sesion.estado === 'completada') return <PantallaFin />;
  if (sesion.estado === 'cancelada')  return <PantallaEspera mensaje="La sesión fue cancelada" />;
  if (sesion.estado === 'lobby')      return <PantallaEspera mensaje="Esperando al facilitador..." pulsing />;

  const bloqueIdx = (sesion.bloqueActual || 1) - 1;
  // Buscar la charla por ID o usar la primera si no se encuentra (robusto para el MVP)
  const charla = CHARLAS.find(c => c.id === sesion.charlaId) || CHARLAS[0];
  const bloqueConfig = charla?.bloques?.[bloqueIdx];
  const bloqueId = bloqueConfig?.id || 'checkin';
  const yaGuardado = guardado[bloqueId] || false;

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,700;1,400&family=Barlow+Condensed:wght@500;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        input::placeholder,textarea::placeholder{color:#2a3a50}
        input:focus,textarea:focus{border-color:#ff2d2d !important}
        textarea{resize:none}
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(4,6,8,0.97)', borderBottom: '1px solid #1a2640', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 90 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', animation: 'pulse 2s infinite' }} />
          <span style={{ ...S.kicker }}>{sesion.codigo}</span>
        </div>
        <div style={{ marginLeft: 'auto', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#4a6480' }}>
          {bloqueConfig?.icono} {bloqueConfig?.nombre}
        </div>
        <div style={{ width: 1, height: 16, background: '#1a2640' }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: '#4a6480' }}>
          {sesion.bloqueActual}/{sesion.bloqueTotal}
        </span>
      </div>

      {/* Barra de progreso */}
      <div style={{ height: 3, background: '#1a2640' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#ff2d2d,#ffd700)', width: `${(sesion.bloqueActual / sesion.bloqueTotal) * 100}%`, transition: 'width 0.5s ease' }} />
      </div>

      {/* Contenido del bloque */}
      <div style={{ padding: '20px 16px 80px', maxWidth: 520, margin: '0 auto', animation: 'fadeUp 0.3s ease' }} key={bloqueId}>

        {yaGuardado ? (
          <PantallaGuardado bloqueId={bloqueId} bloqueConfig={bloqueConfig} mostrarResultados={sesion.mostrarResultados} />
        ) : (
          <>
            {bloqueId === 'checkin'  && <BloqueCheckin  sesionId={sesionId} jugadorId={jugadorId} nombre={nombre} onGuardar={handleGuardar} />}
            {bloqueId === 'semaforo' && <BloqueSemaforo sesionId={sesionId} jugadorId={jugadorId} onGuardar={handleGuardar} />}
            {bloqueId === 'mapa'     && <BloqueMapa     sesionId={sesionId} jugadorId={jugadorId} onGuardar={handleGuardar} />}
            {bloqueId === 'impostor' && <BloqueImpostor sesionId={sesionId} jugadorId={jugadorId} onGuardar={handleGuardar} />}
            {bloqueId === 'rrr'      && <BloqueRRR      sesionId={sesionId} jugadorId={jugadorId} onGuardar={handleGuardar} />}
            {bloqueId === 'kahoot'   && <BloqueKahoot   />}
            {bloqueId === 'checkout' && <BloqueCheckout sesionId={sesionId} jugadorId={jugadorId} onGuardar={handleGuardar} />}
          </>
        )}
      </div>
    </div>
  );
}

// La lista de charlas ahora se importa directamente de sesionHelpers.js
// para asegurar que los IDs de bloques coincidan entre facilitador y jugador.

// ════════════════════════════════════════════════════════════════
// BLOQUES INDIVIDUALES
// ════════════════════════════════════════════════════════════════

// ── Check-in ─────────────────────────────────────────────────────
function BloqueCheckin({ onGuardar }) {
  const [val, setVal] = useState(null);
  return (
    <div>
      <div style={S.kicker}>Bloque 01 · 3 min</div>
      <h2 style={{ ...S.title, fontSize: 40, marginBottom: 8, marginTop: 4 }}>¿Cómo llegaste hoy?</h2>
      <p style={{ fontSize: 13, color: '#4a6480', fontStyle: 'italic', marginBottom: 24 }}>1 = con la cabeza en otro lado · 10 = enfocado y listo</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} onClick={() => setVal(n)}
            style={{ minWidth: 44, minHeight: 44, borderRadius: 12, border: `2px solid ${val===n?'#ff2d2d':'#1a2640'}`, background: val===n ? '#ff2d2d' : '#0e1526', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: val===n ? '#fff' : '#4a6480', cursor: 'pointer', transition: 'all 0.18s', transform: val===n ? 'scale(1.1)' : 'scale(1)' }}>
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...S.kicker, marginBottom: 24 }}>
        <span>Con la cabeza en otro lado</span><span>Enfocado y listo</span>
      </div>
      <button onClick={() => val && onGuardar('checkin', { valor: val })} disabled={!val}
        style={{ ...S.btnRed, opacity: val ? 1 : 0.4 }}>
        Enviar →
      </button>
    </div>
  );
}

// ── Semáforo ──────────────────────────────────────────────────────
const SITSDATA = [
  { id:'sit1', emoji:'⚽', text:"Gol en contra en el minuto 89'" },
  { id:'sit2', emoji:'🟨', text:'El árbitro te cobra algo injusto' },
  { id:'sit3', emoji:'🥅', text:'Fallas un penal en el último minuto' },
  { id:'sit4', emoji:'🗣️', text:'El rival te provoca después de un gol' },
  { id:'sit5', emoji:'😤', text:'Tu profe te saca cuando estás bien' },
  { id:'sit6', emoji:'🔴', text:'Cometes un error grave que cuesta el partido' },
];
const REACTIONS = [
  { id:'exploto',  icon:'🤬', label:'Exploté',        color:'#ff2d2d', bg:'rgba(255,45,45,0.1)' },
  { id:'congele',  icon:'🥶', label:'Me congelé',      color:'#29b6f6', bg:'rgba(41,182,246,0.1)' },
  { id:'me-fui',   icon:'😶', label:'Me fui mental',   color:'#ffd700', bg:'rgba(255,215,0,0.1)' },
  { id:'respire',  icon:'😤', label:'Respiré y seguí', color:'#00e676', bg:'rgba(0,230,118,0.1)' },
];

function BloqueSemaforo({ onGuardar }) {
  const [idx, setIdx]       = useState(0);
  const [reacciones, setR]  = useState({});
  const sit = SITSDATA[idx];
  const done = Object.keys(reacciones).length === SITSDATA.length;

  return (
    <div>
      <div style={S.kicker}>Bloque 02 · Semáforo Físico</div>
      <div style={{ ...S.kicker, color: '#ff2d2d', marginTop: 4, marginBottom: 16 }}>
        Situación {idx+1} / {SITSDATA.length}
      </div>

      {/* Situación */}
      <div style={{ ...S.card, padding: '24px 16px', textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>{sit.emoji}</div>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(18px,5vw,28px)', letterSpacing: 1, color: '#fff', lineHeight: 1.2 }}>{sit.text}</p>
      </div>

      {/* Reacciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
        {REACTIONS.map(r => (
          <button key={r.id} onClick={() => setR(prev => ({ ...prev, [sit.id]: r.id }))}
            style={{ padding: '16px 10px', minHeight: 70, borderRadius: 12, border: `2px solid ${reacciones[sit.id]===r.id ? r.color : '#1a2640'}`, background: reacciones[sit.id]===r.id ? r.bg : '#0e1526', cursor: 'pointer', transition: 'all 0.18s', textAlign: 'center', transform: reacciones[sit.id]===r.id ? 'scale(1.04)' : 'scale(1)', flex: '1 1 45%' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: reacciones[sit.id]===r.id ? r.color : '#4a6480' }}>{r.label}</div>
          </button>
        ))}
      </div>

      {/* Navegación */}
      <div style={{ display: 'flex', gap: 8 }}>
        {idx > 0 && (
          <button onClick={() => setIdx(i => i-1)}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #1a2640', background: '#0e1526', color: '#4a6480', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1, cursor: 'pointer' }}>
            ← Anterior
          </button>
        )}
        {idx < SITSDATA.length - 1 ? (
          <button onClick={() => reacciones[sit.id] && setIdx(i => i+1)}
            disabled={!reacciones[sit.id]}
            style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: reacciones[sit.id] ? '#ff2d2d' : '#1a2640', color: reacciones[sit.id] ? '#fff' : '#4a6480', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1, cursor: reacciones[sit.id] ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
            Siguiente →
          </button>
        ) : (
          <button onClick={() => done && onGuardar('semaforo', reacciones)}
            disabled={!done}
            style={{ flex: 2, ...S.btnRed, opacity: done ? 1 : 0.4 }}>
            Enviar todo →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Mapa corporal ─────────────────────────────────────────────────
const COLORES_MAPA = [
  { id:'red',    hex:'#ff2d2d', label:'Enojo / Rabia' },
  { id:'yellow', hex:'#ffd700', label:'Nervios' },
  { id:'blue',   hex:'#29b6f6', label:'Desánimo' },
  { id:'green',  hex:'#00e676', label:'Confianza' },
];

function BloqueMapa({ onGuardar }) {
  const [colorActivo, setColor] = useState('#ff2d2d');
  const [trazos, setTrazos]     = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef(null);

  const getPos = (canvas, e) => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width, sy = canvas.height / r.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0e1526';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Silueta
    ctx.strokeStyle = 'rgba(90,112,128,0.5)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(26,36,64,0.7)';
    ctx.beginPath(); ctx.arc(120,40,28,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(78,82);ctx.lineTo(162,82);ctx.lineTo(155,200);ctx.lineTo(85,200);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath(); ctx.moveTo(78,82);ctx.lineTo(54,88);ctx.lineTo(44,170);ctx.lineTo(60,172);ctx.lineTo(68,102);ctx.lineTo(88,98);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath(); ctx.moveTo(162,82);ctx.lineTo(186,88);ctx.lineTo(196,170);ctx.lineTo(180,172);ctx.lineTo(172,102);ctx.lineTo(152,98);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath(); ctx.moveTo(85,200);ctx.lineTo(100,200);ctx.lineTo(104,310);ctx.lineTo(96,340);ctx.lineTo(80,340);ctx.lineTo(76,312);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath(); ctx.moveTo(140,200);ctx.lineTo(155,200);ctx.lineTo(164,312);ctx.lineTo(160,340);ctx.lineTo(144,340);ctx.lineTo(136,310);ctx.closePath();ctx.fill();ctx.stroke();

    // Redibujar trazos
    trazos.forEach(t => {
      ctx.beginPath(); ctx.arc(t.x, t.y, 7, 0, Math.PI*2);
      ctx.fillStyle = t.color + 'aa'; ctx.fill();
    });
  }, [trazos]);

  const addTrazo = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const p = getPos(canvas, e);
    setTrazos(prev => [...prev, { x: p.x, y: p.y, color: colorActivo }]);
  };

  return (
    <div>
      <div style={S.kicker}>Bloque 03 · Mapa Corporal</div>
      <h2 style={{ ...S.title, fontSize: 32, marginBottom: 4, marginTop: 4 }}>¿Dónde lo sientes?</h2>
      <p style={{ fontSize: 13, color: '#4a6480', fontStyle: 'italic', marginBottom: 14 }}>
        Elige un color y toca la silueta donde sientes esa emoción
      </p>

      {/* Colores */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {COLORES_MAPA.map(c => (
          <button key={c.id} onClick={() => setColor(c.hex)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `2px solid ${colorActivo===c.hex ? c.hex : '#1a2640'}`, background: `${c.hex}15`, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: colorActivo===c.hex ? c.hex : '#4a6480', transition: 'all 0.18s' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.hex, flexShrink: 0 }} />
            {c.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ ...S.card, overflow: 'hidden', marginBottom: 10, textAlign: 'center', padding: 8 }}>
        <canvas
          ref={canvasRef} width={240} height={380}
          style={{ touchAction: 'none', cursor: 'crosshair', maxWidth: '100%', borderRadius: 8 }}
          onMouseDown={e => { setIsDrawing(true); addTrazo(e); }}
          onMouseMove={e => isDrawing && addTrazo(e)}
          onMouseUp={() => setIsDrawing(false)}
          onTouchStart={e => { e.preventDefault(); addTrazo(e); }}
          onTouchMove={e => { e.preventDefault(); addTrazo(e); }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setTrazos([])}
          style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #1a2640', background: '#0e1526', color: '#4a6480', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          ↺ Borrar
        </button>
        <button onClick={() => setTrazos(p => p.slice(0,-3))}
          style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #1a2640', background: '#0e1526', color: '#4a6480', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          ← Deshacer
        </button>
      </div>

      <button onClick={() => trazos.length > 0 && onGuardar('mapa', { trazos })}
        disabled={trazos.length === 0}
        style={{ ...S.btnRed, opacity: trazos.length > 0 ? 1 : 0.4 }}>
        Enviar mapa →
      </button>
    </div>
  );
}

// ── Impostor ──────────────────────────────────────────────────────
function BloqueImpostor({ onGuardar }) {
  const [votos, setVotos] = useState([]);
  const toggleVoto = (i) => setVotos(prev => prev.includes(i) ? prev.filter(v=>v!==i) : [...prev, i]);

  return (
    <div>
      <div style={S.kicker}>Bloque 04 · El Impostor</div>
      <h2 style={{ ...S.title, fontSize: 36, marginBottom: 8, marginTop: 4 }}>¿Quiénes son<br/>los impostores?</h2>
      <p style={{ fontSize: 13, color: '#4a6480', fontStyle: 'italic', marginBottom: 20 }}>
        Escucha a todos. Vota quiénes crees que tienen la emoción falsa.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[0,1,2,3,4].map(i => (
          <button key={i} onClick={() => toggleVoto(i)}
            style={{ padding: '14px', borderRadius: 10, border: `2px solid ${votos.includes(i)?'#ffd700':'#1a2640'}`, background: votos.includes(i) ? 'rgba(255,215,0,0.1)' : '#0e1526', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, color: votos.includes(i) ? '#ffd700' : '#4a6480', cursor: 'pointer', transition: 'all 0.18s', transform: votos.includes(i) ? 'scale(1.04)' : 'scale(1)' }}>
            JUGADOR {i+1}
            {votos.includes(i) && <div style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, color: '#ffd700', marginTop: 4 }}>✓ IMPOSTOR</div>}
          </button>
        ))}
      </div>
      <button onClick={() => votos.length > 0 && onGuardar('impostor', { votoImpostores: votos })}
        disabled={votos.length === 0}
        style={{ ...S.btnRed, opacity: votos.length > 0 ? 1 : 0.4 }}>
        Votar ({votos.length} seleccionados) →
      </button>
    </div>
  );
}

// ── RRR ───────────────────────────────────────────────────────────
const BPHS = [{n:'INHALA',d:4,c:'#29b6f6'},{n:'PAUSA',d:2,c:'#ffd700'},{n:'EXHALA',d:4,c:'#00e676'}];

function BloqueRRR({ onGuardar }) {
  const [reconocer,    setReconocer]    = useState('');
  const [resetear,     setResetear]     = useState('');
  const [palabraAncla, setPalabraAncla] = useState('');
  const [bPh, setBPh]     = useState(0);
  const [bCnt, setBCnt]   = useState(0);
  const [bCyc, setBCyc]   = useState(0);
  const [bRun, setBRun]   = useState(false);
  const bRef = React.useRef(null);

  const toggleBreath = () => {
    if (bRun) { clearInterval(bRef.current); setBRun(false); return; }
    setBRun(true);
    bRef.current = setInterval(() => {
      setBCnt(prev => {
        const next = prev + 1;
        if (next >= BPHS[bPh].d) {
          setBPh(p => { const np=(p+1)%3; if(np===0) setBCyc(c=>c+1); return np; });
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const RStep = ({ letter, bg, tc, title, desc, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', borderRadius: 11, overflow: 'hidden', border: '1px solid #1a2640', marginBottom: 10 }}>
      <div style={{ background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: tc||'#fff' }}>{letter}</div>
      <div style={{ padding: '12px 12px 12px 4px', background: '#0e1526' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#4a6480', fontStyle: 'italic', marginBottom: 8 }}>{desc}</div>
        {children}
      </div>
    </div>
  );

  const listo = reconocer && resetear && palabraAncla;
  const phase = BPHS[bPh];
  const CIRC = 2 * Math.PI * 50;

  return (
    <div>
      <div style={S.kicker}>Bloque 05 · Rutina RRR</div>
      <h2 style={{ ...S.title, fontSize: 36, marginBottom: 4, marginTop: 4 }}>Tu botón<br/>de reset</h2>
      <p style={{ fontSize: 13, color: '#4a6480', fontStyle: 'italic', marginBottom: 18 }}>3 segundos que cambian el resultado</p>

      <RStep letter="R" bg="#ff2d2d" title="RECONOZCO" desc="La señal en tu cuerpo">
        <input style={S.input} value={reconocer} onChange={e=>setReconocer(e.target.value)} placeholder="Ej: tensión en el pecho..." />
      </RStep>

      <RStep letter="R" bg="#ffd700" tc="#000" title="RESETEO" desc="Tu gesto físico de corte">
        <input style={S.input} value={resetear} onChange={e=>setResetear(e.target.value)} placeholder="Ej: ajusto la camiseta..." />
      </RStep>

      <RStep letter="R" bg="#00e676" tc="#000" title="REENFOCO" desc="Respiración 4-2-4 + palabra ancla">
        {/* Timer de respiración */}
        <div style={{ background: '#040608', borderRadius: 10, padding: 16, textAlign: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Inhala 4 · Pausa 2 · Exhala 4</p>
          <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 12px' }}>
            <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 140 140">
              <circle fill="none" stroke="#1a2640" strokeWidth={7} cx={70} cy={70} r={50} />
              <circle fill="none" stroke={phase.c} strokeWidth={7} strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - bCnt / phase.d)}
                style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s' }}
                cx={70} cy={70} r={50} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', lineHeight: 1 }}>{phase.d - bCnt}</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: 2, color: '#4a6480', marginTop: 2 }}>{phase.n}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
            <button onClick={toggleBreath}
              style={{ background: '#ffd700', color: '#000', border: 'none', borderRadius: 100, padding: '7px 18px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: 1, cursor: 'pointer' }}>
              {bRun ? '⏸ PAUSAR' : '▶ PRACTICAR'}
            </button>
            <button onClick={() => { clearInterval(bRef.current); setBRun(false); setBPh(0); setBCnt(0); setBCyc(0); }}
              style={{ background: 'transparent', color: '#4a6480', border: '1px solid #1a2640', borderRadius: 100, padding: '7px 12px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
              ↺
            </button>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: bCyc >= 3 ? '#00e676' : '#4a6480', marginTop: 8 }}>
            {bCyc >= 3 ? '✓ ¡Completado!' : `${bCyc} / 3 ciclos`}
          </div>
        </div>
        <div style={S.label}>Tu palabra ancla</div>
        <input style={S.input} value={palabraAncla} onChange={e=>setPalabraAncla(e.target.value)} placeholder="Ej: Ya · Siguiente · Arriba" />
      </RStep>

      <button onClick={() => listo && onGuardar('rrr', { reconocer, resetear, palabraAncla })}
        disabled={!listo}
        style={{ ...S.btnRed, opacity: listo ? 1 : 0.4 }}>
        Guardar mi RRR →
      </button>
    </div>
  );
}

// ── Kahoot ────────────────────────────────────────────────────────
function BloqueKahoot() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🎮</div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 3, color: '#b44fff', marginBottom: 8 }}>KAHOOT!</h2>
      <p style={{ fontSize: 14, color: '#4a6480', fontStyle: 'italic', marginBottom: 24, lineHeight: 1.6 }}>
        El facilitador compartirá el link o código de Kahoot. Ábrelo en tu celular.
      </p>
      <div style={{ ...S.card, padding: '16px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e676', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#4a6480' }}>Esperando instrucciones del facilitador</span>
      </div>
    </div>
  );
}

// ── Check-out ─────────────────────────────────────────────────────
function BloqueCheckout({ onGuardar }) {
  const [palabras, setPalabras] = useState(['','','']);
  const update = (i, v) => setPalabras(prev => prev.map((p, idx) => idx===i ? v : p));
  const listo = palabras.every(p => p.trim().length > 0);
  const COLORS = ['#ff2d2d','#ffd700','#00e676'];

  return (
    <div>
      <div style={S.kicker}>Bloque 07 · Check-out</div>
      <h2 style={{ ...S.title, fontSize: 36, marginBottom: 8, marginTop: 4 }}>¿Con qué palabras<br/>te vas hoy?</h2>
      <div style={{ ...S.card, padding: '12px 14px', marginBottom: 20 }}>
        <div style={{ ...S.kicker, marginBottom: 6 }}>Ejemplo del facilitador</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['DIRECTO','CON HERRAMIENTAS','LISTO'].map((w,i) => (
            <span key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, padding: '3px 12px', borderRadius: 6, background: `${COLORS[i]}15`, border: `1px solid ${COLORS[i]}33`, color: COLORS[i] }}>{w}</span>
          ))}
        </div>
      </div>

      {[0,1,2].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: COLORS[i], width: 28, flexShrink: 0 }}>{i+1}</span>
          <input
            value={palabras[i]}
            onChange={e => update(i, e.target.value)}
            placeholder={['Primera palabra...','Segunda palabra...','Tercera palabra...'][i]}
            style={{ ...S.input, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', borderColor: palabras[i] ? COLORS[i]+'44' : '#1a2640', marginBottom: 0 }}
          />
        </div>
      ))}

      {listo && (
        <div style={{ ...S.card, padding: '14px', textAlign: 'center', margin: '14px 0', animation: 'fadeUp 0.3s ease' }}>
          <div style={{ ...S.kicker, marginBottom: 8 }}>Me voy...</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {palabras.map((p,i) => p && (
              <span key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, padding: '4px 14px', borderRadius: 8, background: `${COLORS[i]}15`, border: `1px solid ${COLORS[i]}33`, color: COLORS[i] }}>
                {p.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => listo && onGuardar('checkout', { palabra1: palabras[0], palabra2: palabras[1], palabra3: palabras[2] })}
        disabled={!listo}
        style={{ ...S.btnRed, background: '#00e676', color: '#000', opacity: listo ? 1 : 0.4 }}>
        Compartir →
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PANTALLAS DE ESTADO
// ════════════════════════════════════════════════════════════════
function PantallaGuardado({ bloqueId, bloqueConfig, mostrarResultados }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 40 }}>
      <CheckCircle2 size={52} color="#00e676" style={{ marginBottom: 16 }} />
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 2, color: '#fff', marginBottom: 8 }}>
        ¡Listo!
      </h2>
      <p style={{ fontSize: 14, color: '#4a6480', fontStyle: 'italic', marginBottom: 24, lineHeight: 1.6 }}>
        Tu respuesta fue guardada.<br />
        Espera al facilitador para continuar.
      </p>
      {mostrarResultados && (
        <div style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 12, padding: '14px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#00e676' }}>
          👁️ El facilitador está mostrando los resultados
        </div>
      )}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0070F3', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4a6480' }}>
          Esperando siguiente bloque...
        </span>
      </div>
    </div>
  );
}

function PantallaEspera({ mensaje, pulsing }) {
  return (
    <div style={{ minHeight: '100vh', background: '#040608', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {pulsing && (
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(0,112,243,0.2)', animation: 'pulse 2s infinite' }} />
          <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '2px solid rgba(0,112,243,0.3)', animation: 'pulse 2s infinite', animationDelay: '0.3s' }} />
          <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', background: 'rgba(0,112,243,0.1)', border: '1px solid rgba(0,112,243,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wifi size={18} color="#0070F3" />
          </div>
        </div>
      )}
      {!pulsing && <Loader2 size={32} color="#4a6480" className="animate-spin" />}
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4a6480' }}>{mensaje}</p>
    </div>
  );
}

function PantallaFin() {
  return (
    <div style={{ minHeight: '100vh', background: '#040608', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24, textAlign: 'center' }}>
      <style>{`@keyframes bounce{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ fontSize: 64, animation: 'bounce 0.5s ease' }}>🏆</div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 3, background: 'linear-gradient(135deg,#ffd700,#ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        ¡Sesión completada!
      </h2>
      <p style={{ fontSize: 15, color: '#4a6480', fontStyle: 'italic', lineHeight: 1.7, maxWidth: 300, animation: 'fadeUp 0.4s ease 0.2s both' }}>
        Ya tienes tu herramienta personal.<br />La próxima vez que la presión llegue — ya sabes qué hacer.
      </p>
      <button onClick={() => { limpiarSesionJugador(); window.location.href = '/'; }}
        style={{ marginTop: 16, background: '#0e1526', border: '1px solid #1a2640', color: '#4a6480', borderRadius: 10, padding: '10px 22px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>
        Salir
      </button>
    </div>
  );
}
