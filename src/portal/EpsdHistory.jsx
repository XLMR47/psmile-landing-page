import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteField, getDoc, deleteDoc } from 'firebase/firestore';
import { 
    Brain, ArrowLeft, Calendar, User, Activity, 
    ChevronRight, BarChart, MessageSquare, Info,
    Zap, Heart, Users as UsersIcon, Loader2, Sparkles, Trash2,
    AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus,
    BookOpen, Shield, Target
} from 'lucide-react';
import { getUserConfig } from './academyConfig';
import { EPSD_OPERATIONAL_DEFINITIONS } from './epsdIntelligence';
import EpsdEliteReport from './EpsdEliteReport';
import { generarDiagnosticoCompleto, compararEvaluaciones } from './epsdBaremos';

// ─── Radar Chart ──────────────────────────────────────────────────────────────
const SpiderChart = ({ data, color, size = 200 }) => {
    const padding = 40;
    const center = size / 2;
    const radius = size / 2 - padding;
    const levels = [0.2, 0.4, 0.6, 0.8, 1];
    const points = data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
        return {
            x: center + Math.cos(angle) * radius * (d.value / 100),
            y: center + Math.sin(angle) * radius * (d.value / 100),
            labelX: center + Math.cos(angle) * (radius + 20),
            labelY: center + Math.sin(angle) * (radius + 20),
        };
    });
    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
                {levels.map(l => (
                    <circle key={l} cx={center} cy={center} r={radius * l}
                        fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.1" />
                ))}
                {data.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                    return <line key={i} x1={center} y1={center}
                        x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius}
                        stroke="white" strokeWidth="0.5" opacity="0.1" />;
                })}
                <polygon points={polygonPoints} fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2"
                    className="animate-in fade-in duration-1000" />
                {data.map((d, i) => (
                    <text key={i} x={points[i].labelX} y={points[i].labelY} fill="#6B7280"
                        fontSize="8" fontWeight="bold" textAnchor="middle" className="uppercase tracking-tighter">
                        {d.label}
                    </text>
                ))}
            </svg>
        </div>
    );
};

// ─── Badge de nivel ───────────────────────────────────────────────────────────
const NivelBadge = ({ nivel, etiqueta, small = false }) => {
    const colors = {
        bajo:  { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  text: '#EF4444' },
        medio: { bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.4)',  text: '#EAB308' },
        alto:  { bg: 'rgba(57,255,20,0.15)',  border: 'rgba(57,255,20,0.4)',  text: '#39FF14' },
    };
    const c = colors[nivel] || colors.medio;
    return (
        <span style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
            className={`border rounded-full font-black uppercase tracking-widest ${small ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-3 py-1'}`}>
            {etiqueta}
        </span>
    );
};

// ─── Panel de diagnóstico de una subdimensión ─────────────────────────────────
// ─── Config de actores ────────────────────────────────────────────────────────
const ACTORES_CONFIG = {
    dt:        { label: 'DT',        emoji: '📋', color: '#0ea5e9', desc: 'Director Técnico' },
    jugador:   { label: 'Jugador',   emoji: '⚽', color: '#39FF14', desc: 'Jugador' },
    psicologo: { label: 'Psicólogo', emoji: '🧠', color: '#A855F7', desc: 'Psicólogo' },
    familia:   { label: 'Familia',   emoji: '👨‍👩‍👧', color: '#F97316', desc: 'Familia' },
};

// ─── Contenido de un actor ────────────────────────────────────────────────────
const ActorContent = ({ actor, data, color }) => {
    if (!data) return <p className="text-xs text-[#94a3b8] italic">Sin recomendaciones disponibles.</p>;

    const campos = {
        dt: [
            { key: 'entrenamiento', label: '🏋️ Entrenamiento' },
            { key: 'partido',       label: '⚽ Partido' },
            { key: 'comunicacion',  label: '💬 Comunicación' },
        ],
        jugador: [
            { key: 'ejercicios',   label: '🎯 Ejercicios' },
            { key: 'rutina',       label: '🔄 Rutina' },
            { key: 'autogestión',  label: '💡 Autogestión' },
        ],
        psicologo: [
            { key: 'evaluacionesComplementarias', label: '📊 Evaluaciones complementarias', isList: true },
            { key: 'tipoIntervencion',            label: '🏥 Tipo de intervención' },
            { key: 'tecnicas',                    label: '🛠️ Técnicas', isList: true },
            { key: 'frecuencia',                  label: '📅 Frecuencia' },
        ],
        familia: [
            { key: 'como_acompañar', label: '🤝 Cómo acompañar' },
            { key: 'que_evitar',     label: '⚠️ Qué evitar' },
            { key: 'entorno_apoyo',  label: '🏠 Entorno de apoyo' },
        ],
    };

    return (
        <div className="space-y-3">
            {(campos[actor] || []).map(({ key, label, isList }) => {
                const val = data[key];
                if (!val) return null;
                return (
                    <div key={key} className="rounded-xl p-3"
                        style={{ backgroundColor: color + '08', border: `1px solid ${color}20` }}>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1.5"
                            style={{ color }}>{label}</p>
                        {isList && Array.isArray(val) ? (
                            <ul className="space-y-1">
                                {val.map((item, i) => (
                                    <li key={i} className="text-xs text-[#cbd5e1] flex items-start gap-2">
                                        <span style={{ color }} className="shrink-0">▸</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-[#cbd5e1] leading-relaxed">{val}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ─── SubdimensionCard con tabs por actor ─────────────────────────────────────
const SubdimensionCard = ({ nombre, interp, delta }) => {
    const [open, setOpen]         = useState(false);
    const [tabActivo, setTabActivo] = useState('dt');
    if (!interp) return null;

    const actorActual = ACTORES_CONFIG[tabActivo];

    return (
        <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden transition-all"
            style={open ? { borderColor: interp.colorNivel + '50' } : {}}>

            {/* ── Cabecera ── */}
            <button onClick={() => setOpen(!open)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/3 transition-all">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-white">{nombre}</span>
                        {delta && (
                            <span className="text-[10px] font-black" style={{ color: delta.color }}>
                                {delta.emoji} {delta.diff > 0 ? '+' : ''}{delta.diff}pts
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${interp.indice}%`, backgroundColor: interp.colorNivel }} />
                        </div>
                        <span className="text-lg font-black orbitron shrink-0"
                            style={{ color: interp.colorNivel }}>{interp.indice}%</span>
                        <NivelBadge nivel={interp.nivel} etiqueta={interp.etiqueta} small />
                    </div>
                </div>
                <span className="text-[#94a3b8] text-xs ml-2">{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div className="border-t border-white/5 animate-in slide-in-from-top-2 duration-200">

                    {/* ── Sección clínica siempre visible ── */}
                    <div className="px-4 pt-4 space-y-3">
                        {/* Conductas */}
                        <div>
                            <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Conductas evaluadas</p>
                            {interp.conductas?.map((c, i) => (
                                <p key={i} className="text-xs text-[#cbd5e1] flex items-start gap-2 mb-1">
                                    <span style={{ color: interp.colorNivel }} className="shrink-0 mt-0.5">▸</span>{c}
                                </p>
                            ))}
                        </div>

                        {/* Observación + implicancia */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-xl p-3"
                                style={{ backgroundColor: interp.colorNivel + '10', border: `1px solid ${interp.colorNivel}25` }}>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1"
                                    style={{ color: interp.colorNivel }}>🔬 Observación · Nivel {interp.etiqueta}</p>
                                <p className="text-xs text-[#cbd5e1] leading-relaxed">{interp.descripcion}</p>
                            </div>
                            <div className="bg-[#0a0f1c] rounded-xl p-3 border border-[#1a2640]">
                                <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">⚽ Implicancia en partido</p>
                                <p className="text-xs text-[#94a3b8] leading-relaxed">{interp.implicancia}</p>
                            </div>
                        </div>

                        {/* Nota posición */}
                        {interp.notaPosicion && (
                            <div className="rounded-xl p-3 bg-amber-500/5 border border-amber-500/20">
                                <p className="text-xs text-amber-400 leading-relaxed">{interp.notaPosicion}</p>
                            </div>
                        )}
                    </div>

                    {/* ── Tabs de actores ── */}
                    {interp.actores ? (
                        <div className="px-4 pb-4 mt-4">
                            <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mb-3">
                                🎯 Recomendaciones por Actor
                            </p>

                            {/* Tab selector */}
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {Object.entries(ACTORES_CONFIG).map(([key, cfg]) => (
                                    <button key={key}
                                        onClick={() => setTabActivo(key)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border"
                                        style={tabActivo === key ? {
                                            backgroundColor: cfg.color + '20',
                                            borderColor: cfg.color + '60',
                                            color: cfg.color,
                                        } : {
                                            backgroundColor: 'transparent',
                                            borderColor: '#1a2640',
                                            color: '#4a6480',
                                        }}>
                                        <span>{cfg.emoji}</span>
                                        {cfg.label}
                                    </button>
                                ))}
                            </div>

                            {/* Contenido del tab activo */}
                            <div className="rounded-xl p-4 border"
                                style={{ backgroundColor: actorActual.color + '05', borderColor: actorActual.color + '20' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg">{actorActual.emoji}</span>
                                    <p className="text-xs font-black uppercase tracking-widest"
                                        style={{ color: actorActual.color }}>
                                        Para el {actorActual.desc}
                                    </p>
                                </div>
                                <ActorContent
                                    actor={tabActivo}
                                    data={interp.actores[tabActivo]}
                                    color={actorActual.color}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Fallback si no hay recomendaciones por actor */
                        <div className="px-4 pb-4 mt-3">
                            <div className="rounded-xl p-3 bg-cyber-blue/5 border border-cyber-blue/20">
                                <p className="text-[9px] font-black text-cyber-blue uppercase tracking-widest mb-1.5">
                                    🎯 Recomendación general
                                </p>
                                <p className="text-xs text-[#94a3b8] leading-relaxed">{interp.recomendacion}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function EpsdHistory() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const jugadorIdParam = searchParams.get('jugadorId');
    const { currentUser } = useAuth();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig.role === 'admin';
    const isSuperAdmin = isAdmin && userConfig.academiaId === null;

    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [selectedEval, setSelectedEval] = useState(null);

    // ── Nuevo estado para diagnóstico determinístico ──
    const [diagnostico, setDiagnostico] = useState(null);
    const [generandoDiag, setGenerandoDiag] = useState(false);
    const [deltaEvolucion, setDeltaEvolucion] = useState(null);

    // ── Estado legacy para reporte Elite (se mantiene compatible) ──
    const [analysisIA, setAnalysisIA] = useState(null);
    const [showEliteReport, setShowEliteReport] = useState(false);

    const [playerHistoricalAvg, setPlayerHistoricalAvg] = useState(null);
    const [realPlayerData, setRealPlayerData] = useState(null);

    useEffect(() => {
        if (!isSuperAdmin) { navigate('/portal/dashboard'); return; }

        const fetchEvaluaciones = async () => {
            setLoading(true);
            try {
                let q = jugadorIdParam && jugadorIdParam !== 'manual'
                    ? query(collection(db, 'evaluaciones_epsd'), where('jugadorId', '==', jugadorIdParam))
                    : query(collection(db, 'evaluaciones_epsd'));

                const snap = await getDocs(q);
                let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                list.sort((a, b) => {
                    const dA = a.timestamp?.toDate?.() ?? a.createdAt?.toDate?.() ?? new Date(0);
                    const dB = b.timestamp?.toDate?.() ?? b.createdAt?.toDate?.() ?? new Date(0);
                    return dB - dA;
                });
                setEvaluaciones(list);
                if (list.length > 0) {
                    calculateStats(list);
                    seleccionarEval(list[0], list);
                }
            } catch (err) {
                console.error('Error fetching evaluations:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchRealPlayer = async () => {
            if (jugadorIdParam && jugadorIdParam !== 'manual') {
                try {
                    const snap = await getDoc(doc(db, 'jugadores', jugadorIdParam));
                    if (snap.exists()) setRealPlayerData(snap.data());
                } catch (e) { console.error(e); }
            }
        };

        fetchEvaluaciones();
        fetchRealPlayer();
    }, [jugadorIdParam, isAdmin]);

    // ── Seleccionar una evaluación y generar diagnóstico automáticamente ──
    const seleccionarEval = (ev, lista = evaluaciones) => {
        setSelectedEval(ev);
        setAnalysisIA(ev.aiAnalysis || null);
        setDiagnostico(null);
        setDeltaEvolucion(null);

        // Si ya tiene diagnóstico guardado, cargarlo
        if (ev.diagnosticoBaremos) {
            setDiagnostico(ev.diagnosticoBaremos);
            return;
        }

        // Si no, generarlo automáticamente (es instantáneo, sin API)
        const analysis = calculateWeightedAnalysis(ev);
        const posicion = realPlayerData?.posicion || ev.contexto?.posicion || null;
        const categoria = realPlayerData?.categoria || ev.categoria || null;
        const diag = generarDiagnosticoCompleto(analysis, posicion, categoria);
        setDiagnostico(diag);

        // Calcular delta vs evaluación anterior del mismo jugador
        const playerEvals = lista.filter(e => e.jugadorId === ev.jugadorId);
        const idx = playerEvals.findIndex(e => e.id === ev.id);
        if (idx >= 0 && playerEvals[idx + 1]) {
            const prevAnalysis = calculateWeightedAnalysis(playerEvals[idx + 1]);
            const delta = compararEvaluaciones(analysis, prevAnalysis);
            setDeltaEvolucion(delta);
        }
    };

    // ── Guardar diagnóstico en Firestore (opcional, para cachearlo) ──
    const handleGuardarDiagnostico = async () => {
        if (!selectedEval || !diagnostico) return;
        setGenerandoDiag(true);
        try {
            await updateDoc(doc(db, 'evaluaciones_epsd', selectedEval.id), {
                diagnosticoBaremos: diagnostico,
                diagnosticoGeneradoEn: new Date(),
            });
            setEvaluaciones(prev => prev.map(ev =>
                ev.id === selectedEval.id ? { ...ev, diagnosticoBaremos: diagnostico } : ev
            ));
        } catch (err) {
            console.error(err);
        } finally {
            setGenerandoDiag(false);
        }
    };

    const handleDeleteEval = async (e, evalId) => {
        e.stopPropagation();
        if (!window.confirm('¿Borrar esta evaluación permanentemente?')) return;
        try {
            await deleteDoc(doc(db, 'evaluaciones_epsd', evalId));
            setEvaluaciones(prev => prev.filter(ev => ev.id !== evalId));
            if (selectedEval?.id === evalId) { setSelectedEval(null); setDiagnostico(null); }
        } catch (err) { alert('Error al borrar.'); }
    };

    const calculateStats = (list) => {
        if (list.length === 0) return;
        let sumC = 0, sumE = 0, sumS = 0;
        let subescalasSum = {};
        list.forEach(ev => {
            const r = calculateWeightedAnalysis(ev);
            sumC += r.dominios.COGNITIVO || 0;
            sumE += r.dominios.EMOCIONAL || 0;
            sumS += r.dominios.SOCIAL || 0;
            Object.entries(r.subescalas || {}).forEach(([k, v]) => {
                subescalasSum[k] = (subescalasSum[k] || 0) + parseFloat(v.indice);
            });
        });
        let historicoRadar = {};
        Object.entries(subescalasSum).forEach(([k, t]) => { historicoRadar[k] = t / list.length; });
        setPlayerHistoricalAvg(historicoRadar);
        setStats({
            total: list.length,
            promedioCognitivo: (sumC / list.length).toFixed(1),
            promedioEmocional: (sumE / list.length).toFixed(1),
            promedioSocial: (sumS / list.length).toFixed(1),
        });
    };

    const calculateWeightedAnalysis = (ev) => {
        if (!ev?.respuestas) return { dominios: { COGNITIVO: 0, EMOCIONAL: 0, SOCIAL: 0 }, subescalas: {} };
        const weights = ev.configWeights || {
            "Percepción del entorno": 15, "Toma de decisiones": 20, "Control atencional": 12,
            "Gestión emocional": 8, "Autodiálogo y enfoque mental": 10, "Autoconfianza y resiliencia": 10,
            "Comunicación emocional": 12, "Vínculo y cohesión": 7, "Liderazgo emocional": 6,
        };
        const structure = {
            "COGNITIVO": ["Percepción del entorno", "Toma de decisiones", "Control atencional"],
            "EMOCIONAL": ["Gestión emocional", "Autodiálogo y enfoque mental", "Autoconfianza y resiliencia"],
            "SOCIAL":    ["Comunicación emocional", "Vínculo y cohesión", "Liderazgo emocional"],
        };
        let results = { dominios: { COGNITIVO: 0, EMOCIONAL: 0, SOCIAL: 0 }, subescalas: {} };
        Object.entries(structure).forEach(([dominio, subs]) => {
            let totalDominio = 0, weightSum = 0;
            subs.forEach(sub => {
                const w = weights[sub] || 0;
                weightSum += w;
                const keys = Object.keys(ev.respuestas || {}).filter(k =>
                    k.toLowerCase().includes(sub.toLowerCase()) ||
                    (sub === "Percepción del entorno" && (k.includes("COGNITIVO-0") || k.includes("Percepción"))) ||
                    (sub === "Toma de decisiones" && (k.includes("COGNITIVO-1") || k.includes("Toma"))) ||
                    (sub === "Control atencional" && (k.includes("COGNITIVO-2") || k.includes("Atención"))) ||
                    (sub === "Gestión emocional" && (k.includes("EMOCIONAL-0") || k.includes("Gestión"))) ||
                    (sub === "Autodiálogo y enfoque mental" && (k.includes("EMOCIONAL-1") || k.includes("Autodiálogo"))) ||
                    (sub === "Autoconfianza y resiliencia" && (k.includes("EMOCIONAL-2") || k.includes("Autoconfianza"))) ||
                    (sub === "Comunicación emocional" && (k.includes("SOCIAL-0") || k.includes("Comunicación") || k.includes("Externa"))) ||
                    (sub === "Vínculo y cohesión" && (k.includes("SOCIAL-1") || k.includes("Vínculo") || k.includes("Socio-Afectivos"))) ||
                    (sub === "Liderazgo emocional" && (k.includes("SOCIAL-2") || k.includes("Liderazgo")))
                );
                let sumaAvg = 0, cont = 0;
                keys.forEach(k => {
                    const data = ev.respuestas[k];
                    if (!data) return;
                    let s = 0, c = 0;
                    ["0-25", "26-45", "45-70", "71-90"].forEach(int => {
                        if (data[int]?.nivel) { s += data[int].nivel; c++; }
                    });
                    if (c > 0) { sumaAvg += s / c; cont++; }
                });
                const promSub = cont > 0 ? sumaAvg / cont : 0;
                const indiceSub = Math.min(100, promSub * 20);
                results.subescalas[sub] = {
                    promedio: promSub.toFixed(2),
                    indice: indiceSub.toFixed(1),
                    ponderado: ((indiceSub * w) / 100).toFixed(2),
                };
                totalDominio += (indiceSub * w) / 100;
            });
            results.dominios[dominio] = Math.min(100, weightSum > 0 ? (totalDominio / weightSum) * 100 : 0);
        });
        const intervalos_labels = ["0-25", "26-45", "45-70", "71-90"];
        results.dataIntervalos = intervalos_labels.map(int => {
            let s = 0, c = 0;
            Object.values(ev.respuestas || {}).forEach(resp => {
                if (resp?.[int]?.nivel) { s += resp[int].nivel; c++; }
            });
            return c > 0 ? (s / c) * 20 : 0;
        });
        return results;
    };

    const currentAnalysis = selectedEval ? calculateWeightedAnalysis(selectedEval) : null;

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#0070F3] animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">Cargando Dashboards ePsD...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-cyber-dark text-white font-rajdhani">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 mt-8 px-4 md:px-8">
                <div className="cyber-glass-card p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-blue to-cyber-cyan flex items-center justify-center">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-cyan uppercase">
                                    DASHBOARD EPSD ELITE
                                </h1>
                                <p className="text-[#94a3b8] text-sm mt-1">Sistema de análisis táctico-psicológico</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/portal/dashboard')}
                            className="text-cyber-blue hover:text-cyber-cyan transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                            <ArrowLeft size={16} /> Volver
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">

                {/* ── Sidebar ────────────────────────────────────────────── */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Stats globales */}
                    {stats && (
                        <div className="cyber-glass-card p-5">
                            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-3">
                                Promedios históricos · {stats.total} partidos
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Cognitivo', val: stats.promedioCognitivo, color: '#0ea5e9' },
                                    { label: 'Emocional', val: stats.promedioEmocional, color: '#39FF14' },
                                    { label: 'Social',    val: stats.promedioSocial,    color: '#F97316' },
                                ].map(s => (
                                    <div key={s.label} className="bg-cyber-card rounded-xl p-3 text-center border border-cyber-border">
                                        <p className="text-xl font-black orbitron" style={{ color: s.color }}>{s.val}</p>
                                        <p className="text-[9px] text-[#94a3b8] uppercase tracking-widest font-bold">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lista de evaluaciones */}
                    <div className="cyber-glass-card p-6">
                        <h3 className="text-lg font-bold text-[#94a3b8] uppercase tracking-wider mb-4 flex justify-between items-center">
                            Historial Reciente
                            <span className="text-xs bg-cyber-blue/20 text-cyber-blue px-2 py-1 rounded-full">{evaluaciones.length} Registros</span>
                        </h3>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {evaluaciones.length === 0 ? (
                                <div className="p-8 bg-cyber-card rounded-xl border border-cyber-border text-center">
                                    <Activity size={32} className="text-gray-600 mx-auto mb-3" />
                                    <p className="text-[#94a3b8] text-xs">No hay evaluaciones registradas aún.</p>
                                </div>
                            ) : evaluaciones.map(ev => {
                                const tieneDiag = !!ev.diagnosticoBaremos;
                                return (
                                    <div key={ev.id}
                                        onClick={() => seleccionarEval(ev)}
                                        className={`p-4 bg-cyber-card rounded-xl border cursor-pointer hover:border-cyber-blue transition-all ${
                                            selectedEval?.id === ev.id
                                                ? 'border-cyber-blue shadow-[0_0_15px_rgba(14,165,233,0.3)] bg-cyber-blue/5'
                                                : 'border-cyber-border'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-white text-sm truncate">{ev.nombreJugador || 'Jugador Manual'}</div>
                                                <div className="text-xs text-[#94a3b8] mt-1">
                                                    📅 {ev.contexto?.fecha || 'Sin fecha'} · ⚽ {ev.contexto?.torneo || 'Entrenamiento'}
                                                </div>
                                                {tieneDiag && (
                                                    <span className="text-[9px] text-[#39FF14] font-black uppercase tracking-widest">
                                                        ✓ Diagnóstico guardado
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                <ChevronRight size={16} className="text-cyber-blue" />
                                                {isAdmin && (
                                                    <button onClick={(e) => handleDeleteEval(e, ev.id)}
                                                        className="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Main Content ────────────────────────────────────────── */}
                <div className="lg:col-span-8">
                    {selectedEval && currentAnalysis ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Player Info */}
                            <div className="cyber-glass-card p-8">
                                <div className="flex items-start gap-6 flex-wrap">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyber-blue/20 to-cyber-cyan/20 border-2 border-cyber-blue flex items-center justify-center shrink-0">
                                        <span className="text-3xl">👤</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-2xl font-bold mb-2 text-white">{selectedEval.nombreJugador || 'Jugador no definido'}</h2>
                                        <div className="flex flex-wrap gap-3 text-[#94a3b8] text-sm">
                                            <span>📅 {selectedEval.contexto?.fecha || '—'}</span>
                                            <span>⚽ {selectedEval.contexto?.torneo || '—'}</span>
                                            <span className="px-3 py-1 bg-cyber-blue/20 text-cyber-blue border border-cyber-blue rounded-full text-xs font-bold uppercase">
                                                vs {selectedEval.contexto?.rival || 'Rival'}
                                            </span>
                                            {realPlayerData?.posicion && (
                                                <span className="px-3 py-1 bg-white/5 text-[#94a3b8] border border-cyber-border rounded-full text-xs font-bold uppercase">
                                                    {realPlayerData.posicion}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Perfil general desde diagnóstico */}
                                    {diagnostico?.perfilGeneral && (
                                        <div className="text-center shrink-0">
                                            <div className="text-3xl mb-1">{diagnostico.perfilGeneral.emoji}</div>
                                            <div className="text-xs font-black uppercase tracking-widest"
                                                style={{ color: diagnostico.perfilGeneral.color }}>
                                                {diagnostico.perfilGeneral.label}
                                            </div>
                                            <div className="text-3xl font-black orbitron mt-1"
                                                style={{ color: diagnostico.perfilGeneral.color }}>
                                                {diagnostico.scorePreparacion}
                                                <span className="text-lg text-[#94a3b8]">/100</span>
                                            </div>
                                            <div className="text-[9px] text-[#94a3b8] uppercase tracking-widest">Score mental</div>
                                        </div>
                                    )}
                                </div>

                                {/* Descripción del perfil */}
                                {diagnostico?.perfilGeneral?.desc && (
                                    <div className="mt-4 p-3 rounded-xl text-xs text-[#94a3b8] leading-relaxed"
                                        style={{ backgroundColor: diagnostico.perfilGeneral.color + '0d', border: `1px solid ${diagnostico.perfilGeneral.color}25` }}>
                                        {diagnostico.perfilGeneral.desc}
                                    </div>
                                )}
                            </div>

                            {/* ── Alertas de riesgo ── */}
                            {diagnostico?.riesgos?.length > 0 && (
                                <div className="space-y-3">
                                    {diagnostico.riesgos.map((r, i) => (
                                        <div key={i} className="rounded-xl p-4 flex items-start gap-3"
                                            style={{ backgroundColor: r.color + '10', border: `1px solid ${r.color}30` }}>
                                            <AlertTriangle size={16} style={{ color: r.color }} className="shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-black" style={{ color: r.color }}>{r.label}</p>
                                                <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{r.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── Métricas de dominio ── */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { key: 'COGNITIVO', label: 'Cognitivo',  emoji: '🧠', cls: 'cyber-icon-cognitive' },
                                    { key: 'EMOCIONAL', label: 'Emocional',  emoji: '❤️', cls: 'cyber-icon-emotional' },
                                    { key: 'SOCIAL',    label: 'Conductual', emoji: '👥', cls: 'cyber-icon-conductual' },
                                ].map(d => (
                                    <div key={d.key} className="cyber-glass-card cyber-metric-card p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${d.cls}`}>{d.emoji}</div>
                                            <span className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider">→ Actual</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-white uppercase">{d.label}</h3>
                                        <div className="cyber-score-display orbitron mb-4">
                                            {currentAnalysis.dominios[d.key].toFixed(0)}
                                            <span className="text-2xl text-[#94a3b8]">/100</span>
                                        </div>
                                        <div className="cyber-progress-bar">
                                            <div className="cyber-progress-fill" style={{ width: `${currentAnalysis.dominios[d.key]}%` }} />
                                        </div>
                                        {/* Conteo de niveles por dominio */}
                                        {diagnostico && (() => {
                                            const domNombre = d.key;
                                            const sub = Object.values(diagnostico.interpretaciones || {})
                                                .filter(i => i.dominio === domNombre);
                                            const altos = sub.filter(i => i.nivel === 'alto').length;
                                            const bajos = sub.filter(i => i.nivel === 'bajo').length;
                                            return (
                                                <div className="flex gap-2 mt-3">
                                                    {altos > 0 && <span className="text-[9px] bg-[#39FF14]/10 text-[#39FF14] px-2 py-0.5 rounded-full font-black">{altos} Alto</span>}
                                                    {bajos > 0 && <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-black">{bajos} Bajo</span>}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>

                            {/* ── Evolución vs partido anterior ── */}
                            {deltaEvolucion && (
                                <div className="cyber-glass-card p-6">
                                    <h3 className="cyber-section-title orbitron text-white text-lg mb-4 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-cyber-cyan" /> Evolución vs Partido Anterior
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(deltaEvolucion.deltas).map(([nombre, d]) => (
                                            <div key={nombre} className="bg-cyber-card rounded-xl p-3 border border-cyber-border">
                                                <p className="text-[9px] text-[#94a3b8] uppercase font-black tracking-widest mb-1 truncate">{nombre}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-black" style={{ color: d.color }}>{d.emoji}</span>
                                                    <span className="text-sm font-black text-white">{d.actual}%</span>
                                                    <span className="text-[10px] font-black" style={{ color: d.color }}>
                                                        {d.diff > 0 ? '+' : ''}{d.diff}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex gap-4 flex-wrap">
                                        {deltaEvolucion.mejorDominio && (
                                            <div className="flex items-center gap-2 text-xs text-[#39FF14]">
                                                <TrendingUp size={12} /> Mayor mejora: <strong>{deltaEvolucion.mejorDominio.nombre}</strong> ({deltaEvolucion.mejorDominio.diff > 0 ? '+' : ''}{deltaEvolucion.mejorDominio.diff}pts)
                                            </div>
                                        )}
                                        {deltaEvolucion.peorDominio && deltaEvolucion.peorDominio.diff < -5 && (
                                            <div className="flex items-center gap-2 text-xs text-red-400">
                                                <TrendingDown size={12} /> Mayor caída: <strong>{deltaEvolucion.peorDominio.nombre}</strong> ({deltaEvolucion.peorDominio.diff}pts)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Radar + Subdimensiones ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Radar */}
                                <div className="cyber-glass-card p-8 flex flex-col items-center">
                                    <h3 className="cyber-section-title orbitron text-white text-xl self-start w-full mb-4">Equilibrio Psicológico</h3>
                                    <svg viewBox="0 0 300 300" className="w-full max-w-[300px] overflow-visible">
                                        {[0.2, 0.4, 0.6, 0.8, 1].map((l, i) => (
                                            <polygon key={l}
                                                points={Array.from({length: 5}).map((_, idx) => {
                                                    const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                                                    return `${150 + Math.cos(angle) * 100 * l},${150 + Math.sin(angle) * 100 * l}`;
                                                }).join(' ')}
                                                fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1" strokeDasharray={i === 4 ? "0" : "4,4"} />
                                        ))}
                                        {Array.from({length: 5}).map((_, i) => {
                                            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                                            return <line key={i} x1="150" y1="150" x2={150 + Math.cos(angle) * 100} y2={150 + Math.sin(angle) * 100} stroke="rgba(148,163,184,0.2)" strokeWidth="1" />;
                                        })}
                                        {playerHistoricalAvg && (
                                            <polygon
                                                points={["Control atencional","Gestión emocional","Autoconfianza y resiliencia","Liderazgo emocional","Comunicación emocional"].map((k, idx) => {
                                                    const val = (playerHistoricalAvg[k] || 50);
                                                    const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                                                    return `${150 + Math.cos(angle) * val},${150 + Math.sin(angle) * val}`;
                                                }).join(' ')}
                                                fill="transparent" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                                        )}
                                        <polygon
                                            points={["Control atencional","Gestión emocional","Autoconfianza y resiliencia","Liderazgo emocional","Comunicación emocional"].map((k, idx) => {
                                                const val = parseFloat(currentAnalysis.subescalas[k]?.indice || 0);
                                                const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                                                return `${150 + Math.cos(angle) * val},${150 + Math.sin(angle) * val}`;
                                            }).join(' ')}
                                            fill="rgba(14,165,233,0.2)" stroke="#0ea5e9" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(14,165,233,0.5))"
                                            className="animate-in fade-in duration-1000" />
                                        {["Control atencional","Gestión emocional","Autoconfianza y resiliencia","Liderazgo emocional","Comunicación emocional"].map((k, idx) => {
                                            const val = parseFloat(currentAnalysis.subescalas[k]?.indice || 0);
                                            const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                                            return <circle key={idx} cx={150 + Math.cos(angle) * val} cy={150 + Math.sin(angle) * val} r="4" fill="#0ea5e9" stroke="#fff" strokeWidth="1" />;
                                        })}
                                        {["Concentración","Control Emocional","Liderazgo","Resiliencia","Comunicación"].map((label, i) => {
                                            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                                            return <text key={i} x={150 + Math.cos(angle) * 125} y={150 + Math.sin(angle) * 125} fill="#f1f5f9" fontSize="10" fontWeight="600" textAnchor="middle" dominantBaseline="middle">{label}</text>;
                                        })}
                                    </svg>
                                    <div className="flex justify-center gap-4 mt-4">
                                        <div className="px-3 py-1 bg-cyber-blue/20 text-cyber-blue rounded-lg border border-cyber-blue text-[10px] font-bold tracking-widest flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-cyber-blue" /> ACTUAL
                                        </div>
                                        <div className="px-3 py-1 bg-cyber-border/50 text-[#94a3b8] rounded-lg border border-cyber-border text-[10px] font-bold tracking-widest flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full border border-[#94a3b8]" /> PROMEDIO
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen diagnóstico rápido */}
                                <div className="cyber-glass-card p-6">
                                    <h3 className="cyber-section-title orbitron text-white text-lg mb-4">Diagnóstico Rápido</h3>
                                    {diagnostico ? (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[9px] font-black text-[#39FF14] uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <CheckCircle size={10} /> Top Fortalezas
                                                </p>
                                                {diagnostico.fortalezas?.slice(0, 3).map((f, i) => (
                                                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                                        <span className="text-xs text-white font-medium">#{i+1} {f.nombre}</span>
                                                        <NivelBadge nivel={f.nivel} etiqueta={`${f.indice}%`} small />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-2">
                                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <Target size={10} /> Áreas a desarrollar
                                                </p>
                                                {diagnostico.areasDesarrollo?.slice(0, 3).map((a, i) => (
                                                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                                        <span className="text-xs text-white font-medium">#{i+1} {a.nombre}</span>
                                                        <NivelBadge nivel={a.nivel} etiqueta={`${a.indice}%`} small />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-2 flex gap-2 flex-wrap">
                                                {diagnostico.conteoNiveles && (
                                                    <>
                                                        <span className="text-[9px] bg-[#39FF14]/10 text-[#39FF14] px-2 py-1 rounded-full font-black">{diagnostico.conteoNiveles.alto} Alto</span>
                                                        <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full font-black">{diagnostico.conteoNiveles.medio} Medio</span>
                                                        <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-1 rounded-full font-black">{diagnostico.conteoNiveles.bajo} Bajo</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[#94a3b8] text-sm">Cargando diagnóstico...</p>
                                    )}
                                </div>
                            </div>

                            {/* ── Diagnóstico completo por subdimensión ── */}
                            <div className="cyber-glass-card p-8">
                                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                                    <h3 className="cyber-section-title orbitron text-white text-xl flex items-center gap-2">
                                        <BookOpen size={20} className="text-cyber-cyan" /> Diagnóstico por Subdimensión
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] text-[#94a3b8] uppercase tracking-widest">
                                            Basado en baremos ePsD · sin IA
                                        </span>
                                        {isAdmin && (
                                            <button onClick={handleGuardarDiagnostico} disabled={generandoDiag || !diagnostico}
                                                className="px-4 py-2 bg-cyber-blue/10 hover:bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-40">
                                                {generandoDiag ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                                                Guardar en Firestore
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {diagnostico ? (
                                    <div className="space-y-3">
                                        {/* Agrupado por dominio */}
                                        {['COGNITIVO', 'EMOCIONAL', 'SOCIAL'].map(dominio => {
                                            const subsDelDominio = Object.entries(diagnostico.interpretaciones || {})
                                                .filter(([, i]) => i.dominio === dominio);
                                            if (subsDelDominio.length === 0) return null;
                                            const dominioConfig = {
                                                COGNITIVO: { label: '🧠 Dominio Cognitivo',   color: '#0ea5e9' },
                                                EMOCIONAL: { label: '❤️ Dominio Emocional',   color: '#39FF14' },
                                                SOCIAL:    { label: '👥 Dominio Conductual',  color: '#F97316' },
                                            }[dominio];
                                            return (
                                                <div key={dominio}>
                                                    <div className="flex items-center gap-2 mb-2 mt-4">
                                                        <div className="h-px flex-1" style={{ backgroundColor: dominioConfig.color + '30' }} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest shrink-0"
                                                            style={{ color: dominioConfig.color }}>
                                                            {dominioConfig.label}
                                                        </span>
                                                        <div className="h-px flex-1" style={{ backgroundColor: dominioConfig.color + '30' }} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        {subsDelDominio.map(([nombre, interp]) => (
                                                            <SubdimensionCard
                                                                key={nombre}
                                                                nombre={nombre}
                                                                interp={interp}
                                                                delta={deltaEvolucion?.deltas?.[nombre]}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Loader2 className="animate-spin text-cyber-blue mx-auto mb-3" size={24} />
                                        <p className="text-[#94a3b8] text-sm">Generando diagnóstico...</p>
                                    </div>
                                )}
                            </div>

                            {/* ── Intervalos ── */}
                            <div className="cyber-glass-card p-8">
                                <h3 className="cyber-section-title orbitron text-white text-xl mb-8">Evolución por Intervalo de Partido</h3>
                                <div className="space-y-4">
                                    {currentAnalysis.dataIntervalos.map((val, i) => {
                                        const maxVal = Math.max(...currentAnalysis.dataIntervalos);
                                        const labels = ["0-25'", "26-45'", "45-70'", "71-90'"];
                                        const isMax = val === maxVal && val > 0;
                                        return (
                                            <div key={i} className="cyber-time-bar p-4 bg-cyber-dark rounded-xl border border-cyber-border">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 text-center shrink-0">
                                                        <div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Minutos</div>
                                                        <div className="text-2xl font-bold orbitron text-cyber-cyan">{labels[i]}</div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="h-10 bg-cyber-card rounded-lg overflow-hidden border border-cyber-border">
                                                            <div className="h-full bg-gradient-to-r from-cyber-blue to-cyber-cyan flex items-center justify-end pr-4 transition-all duration-1000"
                                                                style={{ width: `${val > 0 ? val : 0}%` }}>
                                                                {val > 0 && <span className="font-bold text-white orbitron text-lg">{val.toFixed(0)}%</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isMax && <span className="text-3xl">🔥</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Botón Reporte Elite (si tiene analysisIA guardado) ── */}
                            {analysisIA && (
                                <div className="cyber-glass-card p-6 text-center">
                                    <p className="text-[#94a3b8] text-sm mb-4">Este partido tiene un reporte Elite con análisis IA generado anteriormente.</p>
                                    <button onClick={() => setShowEliteReport(true)}
                                        className="cyber-btn-primary px-8 py-4 flex items-center gap-3 mx-auto">
                                        <span className="text-xl">📄</span>
                                        <span className="orbitron font-bold tracking-widest">ABRIR REPORTE ELITE</span>
                                    </button>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center cyber-glass-card border-dashed">
                            <Activity className="text-cyber-border mb-6" size={64} strokeWidth={1} />
                            <h3 className="text-xl font-bold text-white mb-2 orbitron tracking-wider">SELECCIONA UNA EVALUACIÓN</h3>
                            <p className="text-[#94a3b8]">Elige una sesión del historial para activar el dashboard analítico.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* ── Reporte Elite Modal ── */}
            {showEliteReport && selectedEval && (() => {
                const playerEvals = evaluaciones.filter(ev => ev.jugadorId === selectedEval.jugadorId);
                const idx = playerEvals.findIndex(ev => ev.id === selectedEval.id);
                const previousEval = idx >= 0 ? playerEvals[idx + 1] : null;
                return (
                    <EpsdEliteReport
                        playerData={{
                            nombre: realPlayerData?.nombre || selectedEval.nombreJugador || 'Jugador Manual',
                            posicion: realPlayerData?.posicion || selectedEval.contexto?.posicion || 'No especificada',
                            categoria: realPlayerData?.categoria || selectedEval.categoria || 'No especificada',
                        }}
                        evalData={selectedEval}
                        previousEval={previousEval}
                        historicalAvg={playerHistoricalAvg}
                        aiData={analysisIA}
                        onClose={() => setShowEliteReport(false)}
                    />
                );
            })()}
        </div>
    );
}
