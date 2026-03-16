// src/components/sesiones/FacilitadorPanel.jsx
// Panel del facilitador — diapositivas + datos en tiempo real sincronizados
// Ruta: /portal/facilitador/:sesionId

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Users, Eye, EyeOff,
  Wifi, WifiOff, StopCircle, BarChart2, Brain
} from 'lucide-react';
import { useSesionActiva, useRespuestasBloque } from '../../hooks/useSesionActiva';
import {
  avanzarBloque, toggleMostrarResultados,
  cancelarSesion, CHARLAS
} from '../../utils/sesionHelpers';

// ── Contenido de diapositivas por bloque ────────────────────────
const SLIDES = [
  // Bloque 1 — Check-in
  {
    kicker: 'Inicio · 3 min',
    title: '¿Cómo llega\nel grupo hoy?',
    body: 'Cada jugador dice su nombre y del 1 al 10 cómo llega mentalmente.',
    accent: '#0070F3',
    icon: '🎯',
    bullets: null,
  },
  // Bloque 2 — Semáforo
  {
    kicker: 'Activación · 5 min',
    title: 'El Semáforo\nFísico',
    body: 'El cuerpo reacciona antes que el pensamiento.',
    accent: '#ff2d2d',
    icon: '🚦',
    bullets: [
      'Nombra la situación — los jugadores reaccionan con el cuerpo',
      'Observa quién se congela, quién exagera',
      '"Lo que acaban de hacer — eso es la emoción hablando antes que el pensamiento"',
    ],
  },
  // Bloque 3 — Mapa + Ciclo
  {
    kicker: 'Desarrollo · 17 min',
    title: 'El Ciclo que\nControla tu Juego',
    body: null,
    accent: '#29b6f6',
    icon: '🗺️',
    ciclo: true,
    bullets: [
      '"El error más común es intentar controlar la situación"',
      'Lo que podemos controlar: el paso entre emoción y acción',
      'Ahí vive el rendimiento',
    ],
  },
  // Bloque 4 — Impostor
  {
    kicker: 'Grupal · 10 min',
    title: 'El Impostor\nEmocional',
    body: '3 jugadores reciben la emoción real. 2 reciben el IMPOSTOR.',
    accent: '#ce93d8',
    icon: '🃏',
    bullets: [
      'Grupos de 5 jugadores',
      'Todos describen cómo se siente la emoción en el cuerpo',
      'El grupo vota quiénes son los impostores',
    ],
  },
  // Bloque 5 — RRR
  {
    kicker: 'Individual · 15 min',
    title: 'La Rutina\nRRR',
    body: 'Tu botón de reset personal — 3 segundos en la cancha.',
    accent: '#ffd700',
    icon: '⚡',
    rrr: true,
  },
  // Bloque 6 — Kahoot
  {
    kicker: 'Cierre · 5 min',
    title: 'Kahoot\nRelámpago',
    body: '5 preguntas sobre los contenidos de hoy.',
    accent: '#b44fff',
    icon: '🎮',
    bullets: [
      'Los jugadores abren Kahoot en sus celulares',
      'Formato competitivo y lúdico',
      'Cierre con reconocimiento al ganador',
    ],
  },
  // Bloque 7 — Check-out
  {
    kicker: 'Cierre · 3 min',
    title: '3 Palabras\ncon las que te vas',
    body: 'Cada jugador cierra diciendo tres palabras.',
    accent: '#00e676',
    icon: '🏁',
    bullets: [
      'El facilitador arranca modelando',
      '"Yo salgo: Directo. Con herramientas. Listo."',
      'Cada jugador comparte las suyas',
    ],
  },
];

const PANEL_MAP = {
  checkin:  PanelCheckin,
  semaforo: PanelSemaforo,
  mapa:     PanelMapa,
  impostor: PanelImpostor,
  rrr:      PanelRRR,
  kahoot:   null,
  checkout: PanelCheckout,
};

// ════════════════════════════════════════════════════════════════
export default function FacilitadorPanel() {
  const { sesionId } = useParams();
  const navigate     = useNavigate();
  const { sesion, jugadores, respuestas, loading } = useSesionActiva(sesionId);
  const [confirmStop, setConfirmStop] = useState(false);

  if (loading) return <LoadingScreen />;
  if (!sesion)  return <ErrorScreen msg="Sesión no encontrada" />;

  const charla       = CHARLAS.find(c => c.id === sesion.charlaId);
  const bloqueIdx    = (sesion.bloqueActual || 1) - 1; 
  
  // Safety checks
  const slide        = SLIDES[bloqueIdx] || SLIDES[0] || { accent: '#0070F3', title: 'Cargando...' };
  const bloqueConfig = charla?.bloques?.[bloqueIdx];
  const bloqueId     = bloqueConfig?.id || 'checkin';
  const PanelComp    = PANEL_MAP[bloqueId] || null;

  const totalBloques   = sesion.bloqueTotal || 7;
  const esUltimo       = sesion.bloqueActual >= totalBloques;
  const esPrimero      = sesion.bloqueActual <= 1;
  const respondieron   = Object.keys(respuestas).filter(k => k.endsWith(`_${bloqueId}`)).length;

  const handleAvanzar = async () => {
    if (esUltimo) {
      await avanzarBloque(sesionId, sesion.bloqueActual, totalBloques);
      setShowResumen(true);
    } else {
      avanzarBloque(sesionId, sesion.bloqueActual, totalBloques);
    }
  };
  const handleRevelar = () => toggleMostrarResultados(sesionId, !sesion.mostrarResultados);
  const [showResumen, setShowResumen] = useState(false);

  const handleStop = async () => {
    await cancelarSesion(sesionId);
    setShowResumen(true);
    setConfirmStop(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#040608', color: '#fff', fontFamily: "'Barlow', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div style={{ background: 'rgba(4,6,8,0.97)', borderBottom: '1px solid #1a2640', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 90, backdropFilter: 'blur(16px)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'rgba(0,112,243,0.1)', border: '1px solid rgba(0,112,243,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={16} color="#0070F3" />
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#dce8f5' }}>
            Panel Facilitador
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: '#1a2640' }} />

        {/* Código de sala */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wifi size={12} color="#00e676" />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3, color: '#00e676' }}>
            {sesion.codigo}
          </span>
        </div>

        {/* Jugadores */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,112,243,0.08)', border: '1px solid rgba(0,112,243,0.2)', borderRadius: 100, padding: '4px 12px' }}>
          <Users size={12} color="#0070F3" />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: '#0070F3' }}>
            {jugadores.length} jugadores
          </span>
        </div>

        {/* Bloque actual */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4a6480' }}>
          BLOQUE {sesion.bloqueActual} / {totalBloques}
        </div>

        {/* Barra de progreso */}
        <div style={{ flex: 1, height: 4, background: '#1a2640', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${slide.accent}, #ffd700)`, width: `${(sesion.bloqueActual / totalBloques) * 100}%`, transition: 'width 0.5s ease', borderRadius: 100 }} />
        </div>

        {/* Respondieron */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: respondieron === jugadores.length && jugadores.length > 0 ? '#00e676' : '#4a6480' }}>
          {respondieron}/{jugadores.length} ✓
        </div>

        {/* Stop */}
        <button onClick={() => setConfirmStop(true)}
          style={{ background: 'rgba(255,45,45,0.1)', border: '1px solid rgba(255,45,45,0.2)', color: '#ff6b6b', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
          <StopCircle size={13} /> TERMINAR
        </button>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 420px', minHeight: 0 }}>

        {/* ── COLUMNA IZQUIERDA: DIAPOSITIVA ─────────────────── */}
        <div style={{ borderRight: '1px solid #1a2640', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SlideView slide={slide} bloqueNum={sesion.bloqueActual} />
        </div>

        {/* ── COLUMNA DERECHA: DATOS LIVE ────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header panel live */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2640', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={14} color="#ffd700" />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#ffd700' }}>
              En vivo
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#00e676', textTransform: 'uppercase' }}>Live</span>
            </div>
          </div>

          {/* Panel de resultados */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {PanelComp ? (
              <PanelComp
                sesionId={sesionId}
                jugadores={jugadores}
                respuestas={respuestas}
                bloqueId={bloqueId}
                mostrarResultados={sesion.mostrarResultados}
              />
            ) : (
              <PanelGenerico bloqueId={bloqueId} jugadores={jugadores} respondieron={respondieron} />
            )}

            {/* Link de Kahoot si estamos en ese bloque */}
            {bloqueId === 'kahoot' && (
              <div style={{ marginTop: 20 }}>
                <KahootControl sesionId={sesionId} sesion={sesion} />
              </div>
            )}
          </div>

          {/* Controles */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1a2640', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Revelar resultados */}
            {PanelComp && (
              <button onClick={handleRevelar}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${sesion.mostrarResultados ? 'rgba(0,230,118,0.3)' : 'rgba(255,215,0,0.3)'}`, background: sesion.mostrarResultados ? 'rgba(0,230,118,0.1)' : 'rgba(255,215,0,0.08)', color: sesion.mostrarResultados ? '#00e676' : '#ffd700', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.2s' }}>
                {sesion.mostrarResultados
                  ? <><EyeOff size={14} /> Ocultar resultados</>
                  : <><Eye size={14} /> Proyectar resultados</>
                }
              </button>
            )}

            {/* Navegación bloques */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
              <button
                onClick={() => avanzarBloque(sesionId, sesion.bloqueActual - 2, totalBloques)}
                disabled={esPrimero}
                style={{ padding: '10px', borderRadius: 10, border: '1px solid #1a2640', background: esPrimero ? 'transparent' : '#0e1526', color: esPrimero ? '#1a2640' : '#4a6480', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1, cursor: esPrimero ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s' }}>
                <ChevronLeft size={16} /> ATRÁS
              </button>
              <button
                onClick={handleAvanzar}
                style={{ padding: '10px', borderRadius: 10, border: 'none', background: esUltimo ? '#00e676' : slide.accent, color: esUltimo ? '#000' : '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s', boxShadow: `0 4px 20px ${slide.accent}44` }}>
                {esUltimo ? '✓ FINALIZAR' : <>SIGUIENTE <ChevronRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANTALLA RESUMEN ─────────────────────────────────── */}
      {showResumen && (
        <div style={{ position: 'fixed', inset: 0, background: '#040608', zIndex: 300, overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 3, background: 'linear-gradient(135deg,#ffd700,#ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>
                Sesión Completada
              </h2>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: '#4a6480', fontStyle: 'italic' }}>
                {sesion?.codigo} · {jugadores.length} jugadores · {charla?.titulo}
              </p>
            </div>

            {/* Stats rápidas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Jugadores', value: jugadores.length, color: '#0070F3' },
                { label: 'Bloques', value: totalBloques, color: '#ffd700' },
                { label: 'Respuestas', value: Object.keys(respuestas).length, color: '#00e676' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0e1526', border: `1px solid ${s.color}22`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4a6480', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Palabras ancla del grupo */}
            {(() => {
              const rrrR = Object.values(respuestas).filter(r => r.palabraAncla);
              const palabras = rrrR.map(r => r.palabraAncla).filter(Boolean);
              const COLORS = ['#ff2d2d','#ffd700','#00e676','#29b6f6','#ce93d8','#ffa726'];
              return palabras.length > 0 ? (
                <div style={{ background: '#0e1526', border: '1px solid #1a2640', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#ffd700', marginBottom: 12 }}>
                    Palabras ancla del grupo
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {palabras.map((p, i) => (
                      <span key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, padding: '4px 14px', borderRadius: 8, background: `${COLORS[i%COLORS.length]}15`, border: `1px solid ${COLORS[i%COLORS.length]}33`, color: COLORS[i%COLORS.length] }}>
                        {p.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Checkout palabras */}
            {(() => {
              const checkR = Object.values(respuestas).filter(r => r.palabra1);
              const allP = checkR.flatMap(r => [r.palabra1, r.palabra2, r.palabra3].filter(Boolean));
              const freq = {};
              allP.forEach(p => { const w = p.toUpperCase().trim(); freq[w] = (freq[w]||0)+1; });
              const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,15);
              const COLORS = ['#ff2d2d','#ffd700','#00e676','#29b6f6','#ce93d8','#ffa726'];
              return sorted.length > 0 ? (
                <div style={{ background: '#0e1526', border: '1px solid #1a2640', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#00e676', marginBottom: 12 }}>
                    El grupo se fue...
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    {sorted.map(([word, count], i) => {
                      const size = Math.max(14, Math.min(32, 14 + count * 4));
                      return (
                        <span key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: size, letterSpacing: 2, color: COLORS[i%COLORS.length], opacity: 0.7 + (count / (sorted[0][1]||1)) * 0.3 }}>
                          {word}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => navigate('/portal')}
                style={{ flex: 1, padding: '14px', borderRadius: 12, background: '#0e1526', border: '1px solid #1a2640', color: '#4a6480', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>
                ← Volver al portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMAR STOP ────────────────────────────── */}
      {confirmStop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#0e1526', border: '1px solid rgba(255,45,45,0.2)', borderRadius: 20, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: '#fff', marginBottom: 8 }}>¿Terminar sesión?</h3>
            <p style={{ fontSize: 13, color: '#4a6480', lineHeight: 1.6, marginBottom: 22 }}>
              Se desconectarán todos los jugadores. Las respuestas guardadas se conservan.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmStop(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#131d30', border: '1px solid #1a2640', color: '#4a6480', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleStop}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#ff2d2d', border: 'none', color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1, cursor: 'pointer' }}>
                Sí, terminar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,700;0,900;1,400&family=Barlow+Condensed:wght@500;700;800;900&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#0a0f1c} ::-webkit-scrollbar-thumb{background:#1a2640;border-radius:100px}
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SLIDE VIEW — diapositiva del bloque actual
// ════════════════════════════════════════════════════════════════
function SlideView({ slide, bloqueNum }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 48px', background: `radial-gradient(ellipse at 20% 20%, ${slide.accent}0a 0%, transparent 60%), #040608`, position: 'relative', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>

      {/* Número de bloque fondo */}
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 300, color: `${slide.accent}08`, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
        {String(bloqueNum).padStart(2, '0')}
      </div>

      {/* Barra de acento */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: slide.accent }} />

      {/* Kicker */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: slide.accent, marginBottom: 16 }}>
        {slide.icon} &nbsp; {slide.kicker}
      </div>

      {/* Título */}
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px, 6vw, 80px)', lineHeight: 0.9, letterSpacing: 2, color: '#fff', marginBottom: 24, whiteSpace: 'pre-line' }}>
        {slide.title}
      </h1>

      {/* Cuerpo */}
      {slide.body && (
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 17, fontStyle: 'italic', color: 'rgba(220,232,245,0.65)', lineHeight: 1.65, marginBottom: 28, maxWidth: 520 }}>
          {slide.body}
        </p>
      )}

      {/* Ciclo emocional */}
      {slide.ciclo && <CicloSlide accent={slide.accent} />}

      {/* RRR */}
      {slide.rrr && <RRRSlide />}

      {/* Bullets */}
      {slide.bullets && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: slide.ciclo || slide.rrr ? 20 : 0 }}>
          {slide.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accent, flexShrink: 0, marginTop: 7 }} />
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 15, color: 'rgba(220,232,245,0.75)', lineHeight: 1.55, fontStyle: b.startsWith('"') ? 'italic' : 'normal' }}>
                {b}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Brand */}
      <div style={{ position: 'absolute', bottom: 20, left: 48, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#1a2640' }}>
        PSMILE · Psicología Deportiva
      </div>
    </div>
  );
}

function CicloSlide({ accent }) {
  const items = [
    { label: 'SITUACIÓN', ex: 'Árbitro injusto', bg: '#1a2640', c: '#4a6480' },
    { label: 'EMOCIÓN',   ex: 'Rabia, bronca',  bg: '#2a1a1a', c: '#ff6b6b' },
    { label: 'PENSAMIENTO', ex: '"Nos roban"',  bg: '#2a2a0a', c: '#ffd700' },
    { label: 'ACCIÓN',    ex: 'Reclamo, falta', bg: '#0a2a0a', c: '#00e676' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16, flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #1a2640', minWidth: 100 }}>
            <div style={{ padding: '8px 12px', background: item.bg, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: item.c, textAlign: 'center' }}>{item.label}</div>
            <div style={{ padding: '10px 12px', background: '#0e1526', fontStyle: 'italic', fontSize: 13, color: '#fff', textAlign: 'center' }}>{item.ex}</div>
          </div>
          {i < 3 && <div style={{ color: '#ffd700', padding: '0 8px', fontSize: 16, flexShrink: 0 }}>▶</div>}
        </div>
      ))}
    </div>
  );
}

function RRRSlide() {
  const steps = [
    { r: 'R', name: 'RECONOCER',  desc: 'La señal en el cuerpo',     bg: '#ff2d2d' },
    { r: 'R', name: 'RESETEAR',   desc: 'El gesto físico de corte',  bg: '#ffd700', tc: '#000' },
    { r: 'R', name: 'REFOCAR',    desc: 'Respiración 4-2-4 + ancla', bg: '#00e676', tc: '#000' },
  ];
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2640' }}>
          <div style={{ background: s.bg, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: s.tc || '#fff', lineHeight: 1 }}>{s.r}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: s.tc ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)', marginTop: 2 }}>{s.name}</div>
          </div>
          <div style={{ background: '#0e1526', padding: '12px', fontStyle: 'italic', fontSize: 13, color: 'rgba(220,232,245,0.6)', textAlign: 'center', lineHeight: 1.4 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PANEL GENÉRICO — para bloques sin panel especializado (Kahoot)
// ════════════════════════════════════════════════════════════════
function PanelGenerico({ bloqueId, jugadores, respondieron }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 48 }}>🎮</div>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4a6480' }}>
        Actividad sin datos en tiempo real
      </p>
      <p style={{ fontSize: 13, color: '#2a3a50', fontStyle: 'italic' }}>
        Los jugadores ingresan al Kahoot desde sus celulares
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PANELES DE RESULTADOS LIVE (uno por bloque)
// ════════════════════════════════════════════════════════════════

// Panel Checkin ──────────────────────────────────────────────────
function PanelCheckin({ sesionId, jugadores, respuestas, bloqueId }) {
  const vals = Object.entries(respuestas)
    .filter(([k]) => k.endsWith('_checkin'))
    .map(([, v]) => v.valor || 0)
    .filter(Boolean);
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatCard label="Promedio grupal" value={avg} color="#0070F3" sub={`${vals.length}/${jugadores.length} respondieron`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[10,9,8,7,6,5,4,3,2,1].map(n => {
          const count = vals.filter(v => v === n).length;
          const pct = vals.length ? (count / vals.length) * 100 : 0;
          return count > 0 ? (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#dce8f5', width: 16, textAlign: 'right', flexShrink: 0 }}>{n}</span>
              <div style={{ flex: 1, height: 22, background: '#131d30', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: `linear-gradient(90deg, #0070F3, #00b4ff)`, width: `${pct}%`, transition: 'width 0.5s ease', borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  {pct > 20 && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: '#fff' }}>{count}</span>}
                </div>
              </div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: '#4a6480', width: 24, flexShrink: 0 }}>{count}</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

// Panel Semáforo ─────────────────────────────────────────────────
function PanelSemaforo({ sesionId, jugadores, respuestas, bloqueId, mostrarResultados }) {
  const REACTIONS = [
    { id: 'exploto',  label: 'Exploté',       icon: '🤬', color: '#ff2d2d' },
    { id: 'congele',  label: 'Me congelé',     icon: '🥶', color: '#29b6f6' },
    { id: 'me-fui',   label: 'Me fui mental',  icon: '😶', color: '#ffd700' },
    { id: 'respire',  label: 'Respiré y seguí',icon: '😤', color: '#00e676' },
  ];
  const SITS = ['sit1','sit2','sit3','sit4','sit5','sit6'];
  const SITSLAB = ['Gol 89\'','Árbitro injusto','Penal fallado','Rival provoca','Te sacan','Error grave'];
  const [sitActiva, setSitActiva] = useState(0);

  const sitRespuestas = Object.values(respuestas)
    .filter(r => r.bloqueId === 'semaforo' || Object.keys(r).some(k => k.startsWith('sit')));

  const counts = {};
  REACTIONS.forEach(r => { counts[r.id] = 0; });
  sitRespuestas.forEach(r => {
    const val = r[SITS[sitActiva]];
    if (val && counts[val] !== undefined) counts[val]++;
  });
  const total = Object.values(counts).reduce((a,b) => a+b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Selector de situación */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {SITSLAB.map((lab, i) => (
          <button key={i} onClick={() => setSitActiva(i)}
            style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${sitActiva === i ? '#ff2d2d' : '#1a2640'}`, background: sitActiva === i ? 'rgba(255,45,45,0.12)' : 'transparent', color: sitActiva === i ? '#ff6b6b' : '#4a6480', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s' }}>
            {lab}
          </button>
        ))}
      </div>

      {/* Barras de reacción */}
      {REACTIONS.map(r => {
        const c = counts[r.id] || 0;
        const pct = total > 0 ? (c / total) * 100 : 0;
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: r.color }}>{r.label}</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: '#4a6480' }}>{c} ({Math.round(pct)}%)</span>
              </div>
              <div style={{ height: 18, background: '#131d30', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: r.color, width: `${pct}%`, transition: 'width 0.6s ease', borderRadius: 5, opacity: 0.8 }} />
              </div>
            </div>
          </div>
        );
      })}

      <StatCard label="Respondieron" value={`${sitRespuestas.length}/${jugadores.length}`} color="#ffd700" />
    </div>
  );
}

// Panel Mapa ─────────────────────────────────────────────────────
function PanelMapa({ sesionId, jugadores, respuestas, bloqueId }) {
  const canvasRef = useRef(null);
  const mapaRespuestas = Object.values(respuestas).filter(r => r.bloqueId === 'mapa' || r.trazos);
  const totalTrazos = mapaRespuestas.reduce((acc, r) => acc + (r.trazos?.length || 0), 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0e1526';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawSilhouetteMini(ctx, canvas.width, canvas.height);

    mapaRespuestas.forEach(r => {
      if (!r.trazos?.length) return;
      r.trazos.forEach(t => {
        ctx.beginPath();
        ctx.arc(t.x * (canvas.width / 240), t.y * (canvas.height / 380), 5, 0, Math.PI * 2);
        ctx.fillStyle = (t.color || '#ff2d2d') + '44';
        ctx.fill();
      });
    });
  }, [mapaRespuestas]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatCard label="Jugadores mapearon" value={`${mapaRespuestas.length}/${jugadores.length}`} color="#29b6f6" sub={`${totalTrazos} trazos totales`} />
      <div style={{ background: '#131d30', border: '1px solid #1a2640', borderRadius: 10, overflow: 'hidden', textAlign: 'center', padding: 8 }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4a6480', marginBottom: 8 }}>Mapa colectivo</p>
        <canvas ref={canvasRef} width={180} height={360} style={{ borderRadius: 8, maxWidth: '100%' }} />
      </div>
    </div>
  );
}

function drawSilhouetteMini(ctx, w, h) {
  // Canvas jugador es 240x380, facilitador usa 180x360 — escalar proporcionalmente
  const sx = w / 240, sy = h / 380;
  ctx.save();
  ctx.strokeStyle = 'rgba(90,112,128,0.4)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(26,36,64,0.6)';
  // Cabeza
  ctx.beginPath(); ctx.arc(120*sx, 40*sy, 28*sx, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Cuello
  ctx.beginPath(); ctx.rect(108*sx,66*sy,24*sx,16*sy); ctx.fill(); ctx.stroke();
  // Torso
  ctx.beginPath(); ctx.moveTo(78*sx,82*sy);ctx.lineTo(162*sx,82*sy);ctx.lineTo(158*sx,202*sy);ctx.lineTo(82*sx,202*sy);ctx.closePath();ctx.fill();ctx.stroke();
  // Brazo izquierdo
  ctx.beginPath(); ctx.moveTo(78*sx,82*sy);ctx.lineTo(52*sx,90*sy);ctx.lineTo(40*sx,172*sy);ctx.lineTo(58*sx,174*sy);ctx.lineTo(66*sx,104*sy);ctx.lineTo(88*sx,98*sy);ctx.closePath();ctx.fill();ctx.stroke();
  // Brazo derecho
  ctx.beginPath(); ctx.moveTo(162*sx,82*sy);ctx.lineTo(188*sx,90*sy);ctx.lineTo(200*sx,172*sy);ctx.lineTo(182*sx,174*sy);ctx.lineTo(174*sx,104*sy);ctx.lineTo(152*sx,98*sy);ctx.closePath();ctx.fill();ctx.stroke();
  // Pierna izquierda
  ctx.beginPath(); ctx.moveTo(82*sx,202*sy);ctx.lineTo(118*sx,202*sy);ctx.lineTo(116*sx,300*sy);ctx.lineTo(108*sx,350*sy);ctx.lineTo(88*sx,350*sy);ctx.lineTo(82*sx,340*sy);ctx.lineTo(88*sx,300*sy);ctx.closePath();ctx.fill();ctx.stroke();
  // Pierna derecha
  ctx.beginPath(); ctx.moveTo(122*sx,202*sy);ctx.lineTo(158*sx,202*sy);ctx.lineTo(152*sx,300*sy);ctx.lineTo(158*sx,340*sy);ctx.lineTo(138*sx,350*sy);ctx.lineTo(130*sx,350*sy);ctx.lineTo(124*sx,300*sy);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.restore();
}

// Panel Impostor ─────────────────────────────────────────────────
function PanelImpostor({ sesionId, jugadores, respuestas, bloqueId, mostrarResultados }) {
  const votos = Object.values(respuestas).filter(r => r.bloqueId === 'impostor' || r.votoImpostores);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatCard label="Votaron" value={`${votos.length}/${jugadores.length}`} color="#ce93d8" />
      {votos.length > 0 && (
        <div style={{ background: '#131d30', border: '1px solid #1a2640', borderRadius: 10, padding: 14 }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#ce93d8', marginBottom: 10 }}>Votos recibidos</p>
          {[0,1,2,3,4].map(i => {
            const c = votos.filter(v => v.votoImpostores?.includes(i)).length;
            return c > 0 ? (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: '#4a6480', width: 64 }}>Jugador {i+1}</span>
                <div style={{ flex: 1, height: 16, background: '#0e1526', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#ce93d8', width: `${(c/votos.length)*100}%`, transition: 'width 0.5s ease', borderRadius: 4, opacity: 0.7 }} />
                </div>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#4a6480', width: 20 }}>{c}</span>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// Panel RRR ──────────────────────────────────────────────────────
function PanelRRR({ sesionId, jugadores, respuestas, bloqueId }) {
  const rrrRespuestas = Object.values(respuestas).filter(r => r.bloqueId === 'rrr' || r.palabraAncla);
  const palabras = rrrRespuestas.map(r => r.palabraAncla).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatCard label="Completaron RRR" value={`${rrrRespuestas.length}/${jugadores.length}`} color="#ffd700" />
      {palabras.length > 0 && (
        <div style={{ background: '#131d30', border: '1px solid #1a2640', borderRadius: 10, padding: 14 }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#ffd700', marginBottom: 10 }}>Palabras ancla del grupo</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {palabras.map((p, i) => (
              <span key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: '#ffd700', animation: 'fadeIn 0.3s ease' }}>
                {p.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Panel Checkout ─────────────────────────────────────────────────
function PanelCheckout({ sesionId, jugadores, respuestas, bloqueId }) {
  const checkoutRespuestas = Object.values(respuestas).filter(r => r.bloqueId === 'checkout' || r.palabra1);
  const allPalabras = checkoutRespuestas.flatMap(r => [r.palabra1, r.palabra2, r.palabra3].filter(Boolean));
  const freq = {};
  allPalabras.forEach(p => { const w = p.toUpperCase().trim(); freq[w] = (freq[w] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 20);

  const COLORS = ['#ff2d2d','#ffd700','#00e676','#29b6f6','#ce93d8','#ffa726'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatCard label="Check-out completado" value={`${checkoutRespuestas.length}/${jugadores.length}`} color="#00e676" />
      {sorted.length > 0 && (
        <div style={{ background: '#131d30', border: '1px solid #1a2640', borderRadius: 10, padding: 14 }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#00e676', marginBottom: 12 }}>
            Nube de palabras del grupo
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {sorted.map(([word, count], i) => {
              const size = Math.max(12, Math.min(28, 12 + count * 4));
              return (
                <span key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: size, letterSpacing: 2, color: COLORS[i % COLORS.length], opacity: 0.7 + (count / (sorted[0][1] || 1)) * 0.3, animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente auxiliar ──────────────────────────────────────────
function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background: '#131d30', border: `1px solid ${color}22`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: '#4a6480', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4a6480' }}>{label}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// KAHOOT CONTROL — facilitador ingresa el link
// ════════════════════════════════════════════════════════════════
function KahootControl({ sesionId, sesion }) {
  const [url, setUrl] = useState(sesion?.kahootUrl || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!url.trim()) return;
    const { updateDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../../firebase');
    await updateDoc(doc(db, 'sesiones', sesionId), { kahootUrl: url.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#b44fff', marginBottom: 2 }}>
        Link de Kahoot
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={url}
          onChange={e => { setUrl(e.target.value); setSaved(false); }}
          placeholder="https://kahoot.it/challenge/..."
          style={{ flex: 1, background: '#0a0f1c', border: '1px solid #1a2640', borderRadius: 8, color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: 12, padding: '8px 10px', outline: 'none' }}
        />
        <button onClick={handleSave} disabled={!url.trim()}
          style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: saved ? '#00e676' : '#b44fff', color: saved ? '#000' : '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: 1, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
          {saved ? '✓' : 'Enviar'}
        </button>
      </div>
      {sesion?.kahootUrl && (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: '#00e676', letterSpacing: 1 }}>
          ✓ Link activo — los jugadores pueden abrirlo
        </div>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#040608', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '2px solid rgba(0,112,243,0.2)', borderTopColor: '#0070F3', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ErrorScreen({ msg }) {
  return (
    <div style={{ minHeight: '100vh', background: '#040608', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b6b', fontFamily: "'Barlow', sans-serif" }}>
      {msg}
    </div>
  );
}
