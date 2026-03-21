// src/components/PlayerSesiones.jsx
// Carpeta de sesiones de un jugador — ruta: /portal/jugador/:id/sesiones

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Brain, ArrowLeft, CheckCircle2, Clock, Lock, PlayCircle, ChevronRight, AlertCircle, ArrowRight, FlaskConical } from 'lucide-react';

// Catálogo de sesiones disponibles — agrega aquí las futuras
const SESIONES_CATALOGO = [
  {
    id: 'sesion-01-autorregulacion',
    numero: '01',
    titulo: 'Las Emociones también Juegan',
    descripcion: 'Identificar disparadores y construir la Rutina RRR personal',
    ruta: 'ruta-4-control-emocional',
    duracion: '60 min',
    color: '#c0392b',
  },
  // Próximamente:
  // { id: 'sesion-02-comunicacion', numero: '02', titulo: 'Comunicación en la Cancha', ... },
];

export default function PlayerSesiones() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jugador, setJugador] = useState(null);
  const [sesionesCompletadas, setSesionesCompletadas] = useState({});
  const [pendingTests, setPendingTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Datos del jugador
        const jugadorSnap = await getDoc(doc(db, 'jugadores', id));
        if (!jugadorSnap.exists()) { navigate('/portal'); return; }
        setJugador({ id: jugadorSnap.id, ...jugadorSnap.data() });

        // Sesiones completadas del jugador
        const sesionesSnap = await getDocs(
          query(collection(db, 'jugadores', id, 'sesiones'), orderBy('completadoEn', 'desc'))
        );
        const completadas = {};
        sesionesSnap.docs.forEach(d => {
          completadas[d.data().sesionId] = d.data();
        });
        setSesionesCompletadas(completadas);

        // Tests pendientes
        const pendingSnap = await getDocs(
          query(
            collection(db, 'tests_asignados'),
            where('jugadorId', '==', id),
            where('estado', '==', 'pendiente')
          )
        );
        setPendingTests(pendingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#0070F3]/30 border-t-[#0070F3] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/portal/dashboard')}
              className="bg-[#111827] border border-white/5 text-[#6B7280] hover:text-white p-2 rounded-xl transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="w-10 h-10 bg-[#0070F3]/10 border border-[#0070F3]/30 rounded-xl flex items-center justify-center">
              <Brain className="text-[#0070F3]" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight">
                PSMILE <span className="text-[#0070F3]">INTELLIGENCE</span>
              </h1>
              <p className="text-[10px] text-[#6B7280] tracking-widest uppercase">Carpeta del Jugador</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-8 max-w-3xl">
        {/* Perfil del jugador */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 mb-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#0070F3]/10 border border-[#0070F3]/20 flex items-center justify-center text-2xl font-black text-[#0070F3]">
            {jugador?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{jugador?.nombre}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#6B7280] bg-[#1F2937] px-2 py-1 rounded-full">
                {jugador?.categoria}
              </span>
              <span className="text-[10px] text-[#6B7280]">
                {Object.keys(sesionesCompletadas).length} sesión(es) completada(s)
              </span>
            </div>
          </div>
        </div>

        {/* Evaluaciones Pendientes */}
        {pendingTests.length > 0 && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-[#F59E0B]" size={18} />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Evaluaciones Pendientes</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {pendingTests.map(test => (
                <button
                  key={test.id}
                  onClick={() => navigate(`/portal/${test.testId}?jugadorId=${id}&asignadoId=${test.id}`)}
                  className="group relative bg-[#111827] border border-[#F59E0B]/30 hover:border-[#F59E0B] rounded-2xl p-5 text-left transition-all hover:scale-[1.01] shadow-xl shadow-orange-500/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl border border-[#F59E0B]/20 flex items-center justify-center shrink-0">
                      <FlaskConical className="text-[#F59E0B]" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase">
                        Test Pendiente: {test.testId.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest mt-0.5">
                        Asignado recientemente
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#F59E0B] text-[10px] font-black uppercase tracking-widest pr-2">
                    Comenzar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Título sección */}
        <div className="flex items-center gap-2 mb-4">
          <PlayCircle size={16} className="text-[#0070F3]" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Sesiones Disponibles</h3>
        </div>

        {/* Lista de sesiones */}
        <div className="flex flex-col gap-3">
          {SESIONES_CATALOGO.map((sesion) => {
            const completada = sesionesCompletadas[sesion.id];
            const fechaCompletada = completada?.completadoEn?.toDate?.()?.toLocaleDateString('es-CL');

            return (
              <div
                key={sesion.id}
                className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group"
              >
                <div className="flex items-stretch">
                  {/* Color bar */}
                  <div className="w-1.5 flex-shrink-0" style={{ background: sesion.color }} />

                    <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        {/* Número */}
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-base sm:text-lg flex-shrink-0"
                          style={{ background: `${sesion.color}20`, color: sesion.color }}
                        >
                          {sesion.numero}
                        </div>
                        {/* Info (dentro de un bloque para movil) */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-bold text-white truncate">{sesion.titulo}</h4>
                            {completada && (
                              <CheckCircle2 size={14} className="text-[#39FF14] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280] truncate">{sesion.descripcion}</p>
                        </div>
                      </div>

                      {/* Metadatos y Acción */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1 gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] text-[#4B5563] flex items-center gap-1">
                            <Clock size={10} /> {sesion.duracion}
                          </span>
                          <span className="text-[10px] text-[#4B5563] uppercase tracking-wider hidden xs:inline">
                            {sesion.ruta.replace(/-/g, ' ')}
                          </span>
                        </div>

                        <button
                          onClick={() => navigate(`/portal/jugador/${id}/sesion/${sesion.id}`)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0"
                          style={
                            completada
                              ? { background: 'rgba(57,255,20,0.08)', color: '#39FF14', border: '1px solid rgba(57,255,20,0.2)' }
                              : { background: `${sesion.color}20`, color: sesion.color, border: `1px solid ${sesion.color}40` }
                          }
                        >
                          {completada ? 'Ver' : 'Iniciar'}
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                {/* Respuestas guardadas (si completada) */}
                {completada && (
                  <div className="mx-5 mb-4 bg-[#0A0F1E] rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold mb-2">
                      Resumen de respuestas guardadas
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {completada.checkin && (
                        <div className="bg-[#111827] rounded-lg p-2">
                          <p className="text-[9px] text-[#4B5563] uppercase tracking-wider">Check-in</p>
                          <p className="text-sm font-bold text-white">{completada.checkin}/10</p>
                        </div>
                      )}
                      {completada.disparadorTop && (
                        <div className="bg-[#111827] rounded-lg p-2">
                          <p className="text-[9px] text-[#4B5563] uppercase tracking-wider">Disparador principal</p>
                          <p className="text-xs font-bold text-[#e05244] truncate">{completada.disparadorTop}</p>
                        </div>
                      )}
                      {completada.palabraAncla && (
                        <div className="bg-[#111827] rounded-lg p-2">
                          <p className="text-[9px] text-[#4B5563] uppercase tracking-wider">Palabra ancla</p>
                          <p className="text-xs font-bold text-[#2eb8a0]">{completada.palabraAncla}</p>
                        </div>
                      )}
                      {completada.compromiso && (
                        <div className="bg-[#111827] rounded-lg p-2 col-span-2">
                          <p className="text-[9px] text-[#4B5563] uppercase tracking-wider">Compromiso</p>
                          <p className="text-xs text-[#a8becc] line-clamp-2">{completada.compromiso}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Próximas sesiones — bloqueadas */}
          {[
            { numero: '02', titulo: 'Comunicación en la Cancha', descripcion: 'Próximamente' },
            { numero: '03', titulo: 'Mindfulness aplicado al fútbol', descripcion: 'Próximamente' },
          ].map(s => (
            <div key={s.numero} className="bg-[#0D1117] border border-white/3 rounded-2xl p-5 flex items-center gap-4 opacity-40">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Lock size={16} className="text-[#4B5563]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#4B5563]">Sesión {s.numero} · {s.titulo}</h4>
                <p className="text-xs text-[#374151]">{s.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
