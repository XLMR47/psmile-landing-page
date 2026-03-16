// src/components/sesiones/SesionLobby.jsx
// Dos modos:
//   - mode="facilitador" → crea la sesión y ve jugadores conectarse
//   - mode="jugador"     → entra con código + nombre

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserConfig, ACADEMIAS } from '../../portal/academyConfig';
import { Brain, Users, Play, Wifi, ChevronRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  crearSesion,
  unirseASesion,
  iniciarSesion,
  cancelarSesion,
  recuperarSesionJugador,
  limpiarSesionJugador,
  CHARLAS,
} from '../../utils/sesionHelpers';
import { useJugadoresConectados } from '../../hooks/useSesionActiva';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// ════════════════════════════════════════════════════════════════
// LOBBY DEL FACILITADOR
// ════════════════════════════════════════════════════════════════
export function LobbyFacilitador() {
  const { currentUser } = useAuth();
  const navigate        = useNavigate();
  const userConfig      = getUserConfig(currentUser?.email);

  const [paso, setPaso]         = useState('elegir');  // elegir | sala
  const [charlaId, setCharlaId] = useState(CHARLAS[0].id);
  const [sesionId, setSesionId] = useState(null);
  const [codigo, setCodigo]     = useState('');
  const [creando, setCreando]   = useState(false);
  const [error, setError]       = useState('');

  const { jugadores } = useJugadoresConectados(sesionId);

  const getAcademiaName = (id) => ACADEMIAS.find(a => a.id === id)?.nombre || id;

  // ── Crear sesión ─────────────────────────────────────────────
  const handleCrear = async () => {
    setCreando(true); setError('');
    try {
      const { sesionId: sid, codigo: cod } = await crearSesion({
        facilitadorId:  currentUser.uid,
        academiaId:     userConfig.academiaId,
        charlaId,
        prefijoCodigo:  userConfig.academiaId?.toUpperCase().slice(0, 5) || 'NEURO',
      });
      setSesionId(sid);
      setCodigo(cod);
      setPaso('sala');
    } catch (err) {
      setError('Error al crear la sesión: ' + err.message);
    } finally {
      setCreando(false);
    }
  };

  // ── Iniciar sesión ───────────────────────────────────────────
  const handleIniciar = async () => {
    if (jugadores.length === 0) {
      setError('Espera que se conecte al menos un jugador');
      return;
    }
    await iniciarSesion(sesionId);
    navigate(`/portal/facilitador/${sesionId}`);
  };

  // ── Cancelar ─────────────────────────────────────────────────
  const handleCancelar = async () => {
    if (sesionId) await cancelarSesion(sesionId);
    setPaso('elegir');
    setSesionId(null);
    setCodigo('');
  };

  const charlaActiva = CHARLAS.find(c => c.id === charlaId);

  // ── PASO 1: Elegir charla ─────────────────────────────────────
  if (paso === 'elegir') {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#0070F3]/10 border border-[#0070F3]/30 rounded-xl flex items-center justify-center">
              <Brain className="text-[#0070F3]" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight">
                PSMILE <span className="text-[#0070F3]">INTELLIGENCE</span>
              </h1>
              <p className="text-[10px] text-[#6B7280] tracking-widest uppercase">Nueva Sesión</p>
            </div>
          </div>

          {/* Academia */}
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0070F3]/10 rounded-lg flex items-center justify-center">
              <Users size={14} className="text-[#0070F3]" />
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280] uppercase tracking-widest">Academia</p>
              <p className="text-sm font-bold text-white">{getAcademiaName(userConfig.academiaId)}</p>
            </div>
          </div>

          {/* Elegir charla */}
          <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mb-3">
            Selecciona la charla
          </p>
          <div className="flex flex-col gap-3 mb-6">
            {CHARLAS.map(charla => (
              <button
                key={charla.id}
                onClick={() => setCharlaId(charla.id)}
                className={`w-full text-left bg-[#111827] border rounded-2xl p-4 transition-all ${
                  charlaId === charla.id
                    ? 'border-[#0070F3] bg-[#0070F3]/5'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{charla.titulo}</p>
                    <p className="text-xs text-[#6B7280]">{charla.descripcion}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-[#4B5563] bg-[#1F2937] px-2 py-0.5 rounded-full">
                        {charla.duracion}
                      </span>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-[#4B5563] bg-[#1F2937] px-2 py-0.5 rounded-full">
                        {charla.bloques.length} bloques
                      </span>
                    </div>
                  </div>
                  {charlaId === charla.id && (
                    <CheckCircle2 size={18} className="text-[#0070F3] flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            onClick={handleCrear}
            disabled={creando}
            className="w-full bg-[#0070F3] hover:bg-[#0060D0] disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {creando
              ? <><Loader2 size={16} className="animate-spin" /> Creando sala...</>
              : <><Play size={16} /> Crear sala</>
            }
          </button>
        </div>
      </div>
    );
  }

  // ── PASO 2: Sala de espera ────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Código grande */}
        <div className="bg-[#111827] border border-[#0070F3]/30 rounded-3xl p-8 mb-4 text-center">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mb-3">
            Código de sala
          </p>
          <div className="font-black text-white mb-2" style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(48px, 12vw, 80px)',
            letterSpacing: '8px',
            background: 'linear-gradient(135deg, #0070F3, #00b4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {codigo}
          </div>
          <p className="text-sm text-[#6B7280]">
            Los jugadores entran en{' '}
            <span className="text-white font-bold">psmilechile.com/sala</span>
          </p>
        </div>

        {/* Jugadores conectados */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi size={14} className="text-[#39FF14]" />
              <span className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">
                Jugadores conectados
              </span>
            </div>
            <span className="text-lg font-black text-white">{jugadores.length}</span>
          </div>

          {/* Lista de jugadores */}
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {jugadores.length === 0 ? (
              <p className="text-xs text-[#4B5563] italic w-full text-center py-2">
                Esperando que se conecten los jugadores...
              </p>
            ) : (
              jugadores.map((j, i) => (
                <div
                  key={j.id}
                  className="flex items-center gap-1.5 bg-[#1F2937] border border-white/5 rounded-full px-3 py-1"
                  style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                  <span className="text-xs font-bold text-white">{j.nombre}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charla seleccionada */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-3 mb-4 flex items-center gap-3">
          <div className="text-2xl">{charlaActiva?.bloques[0]?.icono || '⚽'}</div>
          <div>
            <p className="text-xs font-bold text-white">{charlaActiva?.titulo}</p>
            <p className="text-[10px] text-[#6B7280]">{charlaActiva?.bloques.length} bloques · {charlaActiva?.duracion}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCancelar}
            className="flex-1 bg-[#1F2937] hover:bg-[#374151] text-[#6B7280] hover:text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleIniciar}
            className="flex-[2] bg-[#39FF14] hover:bg-[#2DE010] text-black font-black text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Play size={16} />
            Iniciar ({jugadores.length})
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// LOBBY DEL JUGADOR
// Ruta pública: /sala  o  /sala/:codigo
// ════════════════════════════════════════════════════════════════
export function LobbyJugador() {
  const navigate = useNavigate();

  const [codigo, setCodigo]     = useState('');
  const [nombre, setNombre]     = useState('');
  const [estado, setEstado]     = useState('form');  // form | espera | activa
  const [sesionId, setSesionId] = useState(null);
  const [jugadorId, setJugadorId] = useState(null);
  const [error, setError]       = useState('');
  const [entrando, setEntrando] = useState(false);
  const [sesionInfo, setSesionInfo] = useState(null);

  // Recuperar sesión guardada si recargó
  useEffect(() => {
    const saved = recuperarSesionJugador();
    if (saved) {
      setSesionId(saved.sesionId);
      setJugadorId(saved.jugadorId);
      setNombre(saved.nombre);
      setCodigo(saved.codigo);
      setEstado('espera');
    }
  }, []);

  // Escuchar cambios de la sesión — navegar cuando el facilitador inicie
  useEffect(() => {
    if (!sesionId) return;
    const unsub = onSnapshot(doc(db, 'sesiones', sesionId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setSesionInfo(data);
      if (data.estado === 'activa') {
        navigate(`/sala/${sesionId}/jugador/${jugadorId}`);
      }
      if (data.estado === 'cancelada') {
        limpiarSesionJugador();
        setEstado('form');
        setError('El facilitador canceló la sesión');
      }
    });
    return () => unsub();
  }, [sesionId, jugadorId, navigate]);

  const handleEntrar = async () => {
    if (!codigo.trim() || !nombre.trim()) {
      setError('Ingresa el código y tu nombre'); return;
    }
    setEntrando(true); setError('');
    try {
      const result = await unirseASesion(codigo, nombre);
      if (result.error) { setError(result.error); return; }
      setSesionId(result.sesionId);
      setJugadorId(result.jugadorId);
      setEstado('espera');
    } catch (err) {
      setError('Error al conectarse: ' + err.message);
    } finally {
      setEntrando(false);
    }
  };

  // ── FORMULARIO DE ENTRADA ─────────────────────────────────────
  if (estado === 'form') {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0070F3]/10 border border-[#0070F3]/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Brain className="text-[#0070F3]" size={28} />
            </div>
            <h1 className="text-xl font-black text-white">PSMILE</h1>
            <p className="text-xs text-[#6B7280] mt-1">Entra a la sesión</p>
          </div>

          {/* Código */}
          <div className="mb-4">
            <label className="block text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mb-2">
              Código de sala
            </label>
            <input
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleEntrar()}
              placeholder="NEURO-47"
              maxLength={10}
              className="w-full bg-[#111827] border border-white/10 focus:border-[#0070F3] rounded-2xl px-4 py-4 text-white text-center text-3xl font-black tracking-[0.2em] uppercase outline-none transition-colors placeholder-[#374151]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", minHeight: '64px' }}
            />
          </div>

          {/* Nombre */}
          <div className="mb-6">
            <label className="block text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEntrar()}
              placeholder="Ej: Juan Pérez"
              maxLength={30}
              className="w-full bg-[#111827] border border-white/10 focus:border-[#0070F3] rounded-xl px-5 py-4 text-white text-base outline-none transition-colors placeholder-[#4B5563]"
              style={{ minHeight: '56px' }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            onClick={handleEntrar}
            disabled={entrando || !codigo.trim() || !nombre.trim()}
            className="w-full bg-[#0070F3] hover:bg-[#0060D0] disabled:opacity-40 text-white font-black text-base uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-3"
            style={{ minHeight: '60px' }}
          >
            {entrando
              ? <><Loader2 size={20} className="animate-spin" /> Conectando...</>
              : <>Entrar <ChevronRight size={20} /></>
            }
          </button>
        </div>
      </div>
    );
  }

  // ── SALA DE ESPERA (jugador) ──────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">

        {/* Animación de espera */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-[#0070F3]/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-[#0070F3]/40 animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="absolute inset-4 rounded-full bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center">
            <Wifi size={24} className="text-[#0070F3]" />
          </div>
        </div>

        <h2 className="text-xl font-black text-white mb-2">¡Conectado!</h2>
        <p className="text-sm text-[#6B7280] mb-1">
          Hola, <span className="text-white font-bold">{nombre}</span>
        </p>
        <p className="text-sm text-[#6B7280] mb-6">
          Esperando que el facilitador inicie la sesión...
        </p>

        {/* Código */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 mb-4 inline-block">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mb-1">Sala</p>
          <p className="text-2xl font-black text-[#0070F3] tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {codigo || sesionInfo?.codigo}
          </p>
        </div>

        <p className="text-xs text-[#4B5563] italic">
          No cierres esta pantalla
        </p>

        <button
          onClick={() => { limpiarSesionJugador(); setEstado('form'); }}
          className="mt-6 text-[10px] text-[#374151] hover:text-[#6B7280] uppercase tracking-wider transition-colors"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
