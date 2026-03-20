import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FlaskConical, ChevronDown, ChevronUp, Brain, Zap, Target, Timer, FileText } from 'lucide-react';

// Mapa de colores e íconos por instrumento
const INST_CONFIG = {
    epi:               { color: '#A855F7', label: 'EPI',              icono: Brain      },
    motivacion:        { color: '#39FF14', label: 'Motivación',        icono: Zap        },
    nivel_preparacion: { color: '#0070F3', label: 'NSP',              icono: Target     },
    csai2:             { color: '#F97316', label: 'CSAI-2',            icono: FlaskConical },
    tabla_atencion:    { color: '#38BDF8', label: 'Atención',          icono: Timer      },
    tapping:           { color: '#39FF14', label: 'Tapping',           icono: FileText   },
    landolt:           { color: '#38BDF8', label: 'Landolt',           icono: FileText   },
    default:           { color: '#6B7280', label: 'Psicometría',       icono: FileText   },
};

function getConfig(id) {
    return INST_CONFIG[id] || INST_CONFIG.default;
}

function etiquetaColor(nivel) {
    const n = (nivel || '').toLowerCase();
    if (n.includes('alto') || n.includes('óptimo') || n.includes('excelente') || n.includes('muy bien') || n.includes('adecuado'))
        return '#39FF14';
    if (n.includes('medio') || n.includes('regular') || n.includes('moderado') || n.includes('bien'))
        return '#EAB308';
    if (n.includes('bajo') || n.includes('deficiente') || n.includes('mal') || n.includes('elevad') || n.includes('alterada'))
        return '#EF4444';
    return '#6B7280';
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PsicometriaSection({ jugadorId }) {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandido, setExpandido] = useState(null);

    useEffect(() => {
        if (!jugadorId) return;
        const cargar = async () => {
            setLoading(true);
            try {
                // Buscar por jugadorId (uid) o por el id del jugador en la colección jugadores
                const q = query(
                    collection(db, 'evaluaciones_psicometricas'),
                    where('jugadorId', '==', jugadorId),
                    orderBy('timestamp', 'desc')
                );
                const snap = await getDocs(q);
                setEvaluaciones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [jugadorId]);

    // Agrupar por instrumento — solo el más reciente de cada uno
    const porInstrumento = {};
    evaluaciones.forEach(ev => {
        const instId = ev.instrumento?.id || 'default';
        if (!porInstrumento[instId]) {
            porInstrumento[instId] = [];
        }
        porInstrumento[instId].push(ev);
    });

    if (loading) {
        return (
            <div className="bg-[#111827] border border-white/5 rounded-2xl p-8 text-center">
                <div className="w-6 h-6 border-2 border-[#0070F3]/30 border-t-[#0070F3] rounded-full animate-spin mx-auto" />
            </div>
        );
    }

    if (evaluaciones.length === 0) {
        return (
            <div className="bg-[#111827] border border-dashed border-white/10 rounded-2xl p-8 text-center">
                <FlaskConical size={32} className="text-white/5 mx-auto mb-3" />
                <p className="text-[#6B7280] text-sm">Sin evaluaciones psicométricas registradas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {Object.entries(porInstrumento).map(([instId, evals]) => {
                const cfg = getConfig(instId);
                const Icono = cfg.icono;
                const masReciente = evals[0];
                const abierto = expandido === instId;

                return (
                    <div
                        key={instId}
                        className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden transition-all"
                        style={abierto ? { borderColor: cfg.color + '30' } : {}}
                    >
                        {/* Cabecera clickeable */}
                        <button
                            onClick={() => setExpandido(abierto ? null : instId)}
                            className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/2 transition-all"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: cfg.color + '20', border: `1px solid ${cfg.color}40` }}
                            >
                                <Icono size={18} style={{ color: cfg.color }} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white">
                                    {masReciente.instrumento?.nombre || cfg.label}
                                </p>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <span
                                        className="text-[11px] font-black uppercase"
                                        style={{ color: etiquetaColor(masReciente.nivel) }}
                                    >
                                        {masReciente.nivel}
                                    </span>
                                    {masReciente.fecha && (
                                        <span className="text-[11px] text-[#4B5563]">{masReciente.fecha}</span>
                                    )}
                                    {evals.length > 1 && (
                                        <span className="text-[11px] text-[#4B5563]">
                                            · {evals.length} evaluaciones
                                        </span>
                                    )}
                                </div>
                            </div>

                            {abierto
                                ? <ChevronUp size={16} className="text-[#4B5563] shrink-0" />
                                : <ChevronDown size={16} className="text-[#4B5563] shrink-0" />
                            }
                        </button>

                        {/* Detalle expandido */}
                        {abierto && (
                            <div className="px-5 pb-5 border-t border-white/5">
                                {evals.map((ev, i) => (
                                    <div
                                        key={ev.id}
                                        className={`py-4 ${i < evals.length - 1 ? 'border-b border-white/5' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {i === 0 && (
                                                    <span className="text-[9px] bg-[#39FF14]/10 text-[#39FF14] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                                        Último
                                                    </span>
                                                )}
                                                <span className="text-xs text-[#4B5563]">{ev.fecha}</span>
                                                {ev.contexto?.rival && (
                                                    <span className="text-xs text-[#4B5563]">· {ev.contexto.rival}</span>
                                                )}
                                            </div>
                                            <span
                                                className="text-xs font-black uppercase"
                                                style={{ color: etiquetaColor(ev.nivel) }}
                                            >
                                                {ev.nivel}
                                            </span>
                                        </div>

                                        {/* Puntajes si existen */}
                                        {ev.puntajes && Object.keys(ev.puntajes).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {Object.entries(ev.puntajes).map(([k, v]) => {
                                                    if (typeof v !== 'number') return null;
                                                    return (
                                                        <div key={k} className="bg-[#0A0F1E] rounded-lg px-2.5 py-1.5 text-center">
                                                            <p className="text-xs font-black text-white">{v}</p>
                                                            <p className="text-[9px] text-[#4B5563] uppercase">{k.replace(/_/g, ' ')}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Interpretación */}
                                        {ev.interpretacion && (
                                            <p className="text-xs text-[#9CA3AF] leading-relaxed bg-[#0A0F1E] rounded-xl p-3">
                                                {ev.interpretacion}
                                            </p>
                                        )}

                                        {/* Recomendación */}
                                        {ev.recomendacion && (
                                            <div className="mt-2 flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cfg.color }} />
                                                <p className="text-xs text-[#6B7280] leading-relaxed">{ev.recomendacion}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
