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

// ─── FIX Error 1: Tipo de personalidad EPI ────────────────────────────────────
// Ejes: N (Neuroticismo 0–24) y E (Extroversión 0–24), umbral = 12
function tipoTemperamento(N, E) {
    const nAlto = N >= 12;
    const eAlto = E >= 12;
    if (nAlto && eAlto)  return { tipo: 'Colérico',    color: '#EF4444', emoji: '🔥', desc: 'Activo, impulsivo, optimista, variable.' };
    if (nAlto && !eAlto) return { tipo: 'Melancólico', color: '#A855F7', emoji: '🌧️', desc: 'Ansioso, rígido, pesimista, reservado.' };
    if (!nAlto && eAlto) return { tipo: 'Sanguíneo',   color: '#39FF14', emoji: '⚡', desc: 'Sociable, despreocupado, vivaz, líder.' };
    return                      { tipo: 'Flemático',   color: '#38BDF8', emoji: '❄️', desc: 'Tranquilo, confiable, controlado, pacífico.' };
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

                // ── FIX Error 1: calcular temperamento para EPI ──
                let temperamento = null;
                if (instId === 'epi' && masReciente?.puntajes) {
                    const N = typeof masReciente.puntajes.N === 'number' ? masReciente.puntajes.N
                            : typeof masReciente.puntajes.neuroticismo === 'number' ? masReciente.puntajes.neuroticismo
                            : null;
                    const E = typeof masReciente.puntajes.E === 'number' ? masReciente.puntajes.E
                            : typeof masReciente.puntajes.extroversion === 'number' ? masReciente.puntajes.extroversion
                            : null;
                    if (N !== null && E !== null) {
                        temperamento = tipoTemperamento(N, E);
                    }
                }

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
                                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                    <span
                                        className="text-[11px] font-black uppercase"
                                        style={{ color: etiquetaColor(masReciente.nivel) }}
                                    >
                                        {masReciente.nivel}
                                    </span>

                                    {/* ── FIX Error 1: mostrar temperamento en cabecera ── */}
                                    {temperamento && (
                                        <span
                                            className="text-[11px] font-black uppercase px-2 py-0.5 rounded-lg"
                                            style={{ color: temperamento.color, backgroundColor: temperamento.color + '15', border: `1px solid ${temperamento.color}30` }}
                                        >
                                            {temperamento.emoji} {temperamento.tipo}
                                        </span>
                                    )}

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
                                {evals.map((ev, i) => {

                                    // ── FIX Error 1: temperamento por evaluación individual ──
                                    let evTemperamento = null;
                                    if (instId === 'epi' && ev?.puntajes) {
                                        const N = typeof ev.puntajes.N === 'number' ? ev.puntajes.N
                                                : typeof ev.puntajes.neuroticismo === 'number' ? ev.puntajes.neuroticismo
                                                : null;
                                        const E = typeof ev.puntajes.E === 'number' ? ev.puntajes.E
                                                : typeof ev.puntajes.extroversion === 'number' ? ev.puntajes.extroversion
                                                : null;
                                        if (N !== null && E !== null) evTemperamento = tipoTemperamento(N, E);
                                    }

                                    // ── FIX Error 2: no mostrar recomendacion si es igual a interpretacion ──
                                    const mostrarRecomendacion = ev.recomendacion
                                        && ev.recomendacion.trim() !== ''
                                        && ev.recomendacion.trim() !== ev.interpretacion?.trim();

                                    return (
                                        <div
                                            key={ev.id}
                                            className={`py-4 ${i < evals.length - 1 ? 'border-b border-white/5' : ''}`}
                                        >
                                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
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
                                                <div className="flex items-center gap-2">
                                                    {/* ── FIX Error 1: temperamento en cada evaluación ── */}
                                                    {evTemperamento && (
                                                        <span
                                                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg"
                                                            style={{ color: evTemperamento.color, backgroundColor: evTemperamento.color + '15' }}
                                                        >
                                                            {evTemperamento.emoji} {evTemperamento.tipo}
                                                        </span>
                                                    )}
                                                    <span
                                                        className="text-xs font-black uppercase"
                                                        style={{ color: etiquetaColor(ev.nivel) }}
                                                    >
                                                        {ev.nivel}
                                                    </span>
                                                </div>
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

                                            {/* ── FIX Error 1: card de temperamento EPI con descripción ── */}
                                            {evTemperamento && (
                                                <div
                                                    className="mb-3 rounded-xl p-3 flex items-center gap-3"
                                                    style={{ backgroundColor: evTemperamento.color + '10', border: `1px solid ${evTemperamento.color}25` }}
                                                >
                                                    <span className="text-2xl">{evTemperamento.emoji}</span>
                                                    <div>
                                                        <p className="text-xs font-black uppercase" style={{ color: evTemperamento.color }}>
                                                            Temperamento: {evTemperamento.tipo}
                                                        </p>
                                                        <p className="text-[11px] text-[#9CA3AF]">{evTemperamento.desc}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Interpretación */}
                                            {ev.interpretacion && (
                                                <p className="text-xs text-[#9CA3AF] leading-relaxed bg-[#0A0F1E] rounded-xl p-3">
                                                    {ev.interpretacion}
                                                </p>
                                            )}

                                            {/* ── FIX Error 2: solo mostrar recomendacion si es diferente a interpretacion ── */}
                                            {mostrarRecomendacion && (
                                                <div className="mt-2 flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cfg.color }} />
                                                    <p className="text-xs text-[#6B7280] leading-relaxed">{ev.recomendacion}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
