import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';
import { getUserConfig } from './portal/academyConfig';
import {
    ArrowLeft, Brain, Sparkles, Loader2, Check,
    ChevronDown, ChevronUp, Users, Search, Zap
} from 'lucide-react';

// ─── Llamada a Claude API ─────────────────────────────────────────────────────
async function llamarClaudeAPI(prompt) {
    try {
        const response = await fetch('/.netlify/functions/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4.5',
                prompt: prompt,
                max_tokens: 4000
            }),
        });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Error en comunicación con IA');
        }
        
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    } catch (err) {
        console.error("Error Claude API:", err);
        throw err;
    }
}

// ─── Construir el prompt clínico ──────────────────────────────────────────────
function construirPrompt(jugador, evalsEpsd, evalsPsico) {
    const epsdTexto = evalsEpsd.slice(0, 3).map(ev => {
        const ctx = ev.contexto || {};
        const metricas = ev.metricas || {};
        const curva = ev.curvaTemporal || {};
        const patrones = ev.patronesCurva || {};

        return `
EVALUACIÓN ePsD — ${ctx.fecha || ''} vs ${ctx.rival || ''} (${ctx.torneo || ''})
Posición: ${ev.posicion || ''} | Evaluador: ${ev.evaluador || ''}
Scores: Global=${metricas.score_global || 0} | Cognitivo=${metricas.score_cognitivo || 0} | Emocional=${metricas.score_emocional || 0} | Social=${metricas.score_social || 0}
Patrones de curva: ${JSON.stringify(patrones)}
Curva temporal: ${JSON.stringify(curva)}
`.trim();
    }).join('\n\n');

    const observacionesTexto = evalsEpsd.slice(0, 2).map(ev => {
        if (!ev._observaciones?.length) return '';
        return ev._observaciones.map(o =>
            `[${o.dominio} / ${o.subescala}] "${o.texto}"`
        ).join('\n');
    }).filter(Boolean).join('\n');

    const psicoTexto = evalsPsico.map(ev => {
        return `
${ev.instrumento?.nombre || ev.instrumento?.id || 'Test'} (${ev.fecha || ''})
Dimensión: ${ev.dimension || ''} | Nivel: ${ev.nivel || ''}
Interpretación: ${ev.interpretacion || ''}
${ev.recomendacion ? 'Recomendación: ' + ev.recomendacion : ''}
`.trim();
    }).join('\n\n');

    return `Eres un psicólogo deportivo especialista en fútbol. Analiza los datos de este jugador y genera un informe clínico estructurado en español.

JUGADOR: ${jugador.nombre} | ID Perfil: ${jugador.id} | Posición: ${jugador.posicion || 'No especificada'} | Categoría: ${jugador.categoria || 'No especificada'}
Configuración de Pesos (Relevancia PSMILE): ${JSON.stringify(evalsEpsd[0]?.configWeights || 'Estándar')}

=== EVALUACIONES ePsD EN VIVO ===
${epsdTexto || 'Sin datos ePsD disponibles'}

=== OBSERVACIONES CLÍNICAS ===
${observacionesTexto || 'Sin observaciones registradas'}

=== EVALUACIONES PSICOMÉTRICAS ===
${psicoTexto || 'Sin datos psicométricos disponibles'}

Genera un informe clínico con exactamente esta estructura JSON (sin texto extra, solo JSON):
{
  "perfil_global": "Una frase que describe el perfil psicodeportivo del jugador",
  "ready_score": número del 0 al 100 que indica preparación psicológica,
  "dimension_cognitiva": "2-3 oraciones sobre el funcionamiento cognitivo. Menciona patrones de curva y atención.",
  "dimension_emocional": "2-3 oraciones sobre el estado emocional. Incluye motivación y ansiedad si hay datos.",
  "dimension_conductual_social": "2-3 oraciones sobre comunicación, cohesión y liderazgo.",
  "cruce_epsd_psicometria": "2-3 oraciones cruzando lo observado en vivo con los resultados de tests. Busca convergencia o discrepancias.",
  "fortalezas": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "areas_intervencion": ["área 1", "área 2", "área 3"],
  "recomendaciones": [
    { "intervencion": "nombre de la intervención", "descripcion": "descripción breve", "prioridad": "alta|media|baja" },
    { "intervencion": "nombre", "descripcion": "descripción", "prioridad": "alta|media|baja" },
    { "intervencion": "nombre", "descripcion": "descripción", "prioridad": "alta|media|baja" }
  ]
}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AnalisisIA() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig?.role === 'admin';

    const jugadorIdParam = searchParams.get('jugadorId');

    const [jugadores, setJugadores] = useState([]);
    const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [analisis, setAnalisis] = useState(null);
    const [error, setError] = useState('');
    const [seccionAbierta, setSeccionAbierta] = useState(null);

    // Datos del jugador
    const [evalsEpsd, setEvalsEpsd] = useState([]);
    const [evalsPsico, setEvalsPsico] = useState([]);
    const [datosListos, setDatosListos] = useState(false);

    // Cargar lista de jugadores
    useEffect(() => {
        if (!isAdmin) return;
        const cargar = async () => {
            const snap = await getDocs(query(collection(db, 'jugadores')));
            const lista = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(p => !p.tipo || p.tipo === 'jugador')
                .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
            setJugadores(lista);

            if (jugadorIdParam) {
                const j = lista.find(p => p.id === jugadorIdParam);
                if (j) setJugadorSeleccionado(j);
            }
        };
        cargar();
    }, [isAdmin, jugadorIdParam]);

    // Cargar datos cuando se selecciona un jugador
    useEffect(() => {
        if (!jugadorSeleccionado) return;
        const cargar = async () => {
            setLoading(true);
            setAnalisis(null);
            setDatosListos(false);
            try {
                const jId = jugadorSeleccionado.id;

                // ePsD v2
                const snapEpsd = await getDocs(
                    query(collection(db, 'evaluaciones_epsd_v2'), where('jugadorId', '==', jId))
                );
                const epsdList = snapEpsd.docs.map(d => ({ id: d.id, ...d.data() }));

                // Cargar observaciones de cada evaluación ePsD
                for (const ev of epsdList) {
                    try {
                        const obsSnap = await getDocs(
                            collection(db, 'evaluaciones_epsd_v2', ev.id, 'observaciones')
                        );
                        ev._observaciones = obsSnap.docs.map(d => d.data());
                    } catch {
                        ev._observaciones = [];
                    }
                }

                // Ordenar por fecha descendente
                epsdList.sort((a, b) => {
                    const fa = a.timestamp?.toDate?.() || new Date(0);
                    const fb = b.timestamp?.toDate?.() || new Date(0);
                    return fb - fa;
                });

                // Psicometría — buscar por jugadorId (uid) y por el id del doc
                const snapPsico = await getDocs(
                    query(
                        collection(db, 'evaluaciones_psicometricas'),
                        where('jugadorId', '==', jId),
                        orderBy('timestamp', 'desc')
                    )
                );
                const psicoList = snapPsico.docs.map(d => ({ id: d.id, ...d.data() }));

                setEvalsEpsd(epsdList);
                setEvalsPsico(psicoList);
                setDatosListos(true);
            } catch (err) {
                console.error(err);
                setError('Error cargando datos: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [jugadorSeleccionado]);

    const generarAnalisis = async () => {
        if (!jugadorSeleccionado || !datosListos) return;
        setGenerando(true);
        setError('');
        setAnalisis(null);

        try {
            const prompt = construirPrompt(jugadorSeleccionado, evalsEpsd, evalsPsico);
            const respuesta = await llamarClaudeAPI(prompt);

            // Limpiar posibles markdown fences
            const limpio = respuesta.replace(/```json|```/g, '').trim();
            const datos = JSON.parse(limpio);
            setAnalisis(datos);

            // Guardar el análisis en la evaluación ePsD más reciente
            if (evalsEpsd.length > 0) {
                try {
                    await updateDoc(doc(db, 'evaluaciones_epsd_v2', evalsEpsd[0].id), {
                        aiAnalysis: datos,
                        aiAnalysisTimestamp: serverTimestamp(),
                    });
                } catch { /* no crítico */ }
            }
        } catch (err) {
            setError('Error generando análisis: ' + err.message);
        } finally {
            setGenerando(false);
        }
    };

    const jugadoresFiltrados = jugadores.filter(j =>
        j.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const prioridadColor = (p) =>
        p === 'alta' ? '#EF4444' : p === 'media' ? '#EAB308' : '#22C55E';

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/portal/dashboard')}
                        className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Volver
                    </button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-purple-400" size={18} />
                        <span className="text-xs font-black text-white uppercase">
                            PSMILE <span className="text-purple-400">Análisis IA</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-8 py-8 max-w-3xl pb-24">

                {/* Título */}
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 mb-8 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-purple-400/10 border border-purple-500/30 flex items-center justify-center">
                            <Brain className="text-purple-400 w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                                Análisis clínico cruzado
                            </h1>
                            <p className="text-[#6B7280] text-sm mt-0.5">
                                ePsD + Psicometría
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selector de jugador */}
                {isAdmin && (
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 mb-6 shadow-xl">
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-4">
                            Seleccionar jugador
                        </p>
                        <div className="relative mb-4">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                placeholder="Buscar jugador..."
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {jugadoresFiltrados.map(j => (
                                <button
                                    key={j.id}
                                    onClick={() => setJugadorSeleccionado(j)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                                        jugadorSeleccionado?.id === j.id
                                            ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                                            : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Users size={11} className="shrink-0" />
                                    <span className="truncate">{j.nombre}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Estado de datos */}
                {jugadorSeleccionado && (
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 mb-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-black text-white">{jugadorSeleccionado.nombre}</p>
                            <span className="text-[11px] text-[#4B5563] uppercase tracking-widest">
                                {jugadorSeleccionado.posicion} · {jugadorSeleccionado.categoria}
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex items-center gap-2 text-[#4B5563] text-xs">
                                <Loader2 size={14} className="animate-spin" />
                                Cargando datos...
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0A0F1E] rounded-2xl p-4 border border-white/5">
                                    <p className="text-2xl font-black text-[#39FF14]">{evalsEpsd.length}</p>
                                    <p className="text-[10px] text-[#4B5563] uppercase tracking-widest">Evaluaciones ePsD</p>
                                    {evalsEpsd.length > 0 && (
                                        <p className="text-[11px] text-[#6B7280] mt-1">
                                            Última: {evalsEpsd[0].contexto?.fecha || '—'}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-[#0A0F1E] rounded-2xl p-4 border border-white/5">
                                    <p className="text-2xl font-black text-purple-400">{evalsPsico.length}</p>
                                    <p className="text-[10px] text-[#4B5563] uppercase tracking-widest">Tests psicométricos</p>
                                    {evalsPsico.length > 0 && (
                                        <p className="text-[11px] text-[#6B7280] mt-1">
                                            {[...new Set(evalsPsico.map(e => e.instrumento?.id))].length} instrumentos distintos
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Botón generar */}
                        {datosListos && (evalsEpsd.length > 0 || evalsPsico.length > 0) && (
                            <button
                                onClick={generarAnalisis}
                                disabled={generando}
                                className="w-full mt-5 py-5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20"
                            >
                                {generando
                                    ? <><Loader2 size={18} className="animate-spin" /> Analizando con Claude...</>
                                    : <><Sparkles size={18} /> Generar análisis clínico cruzado</>
                                }
                            </button>
                        )}

                        {datosListos && evalsEpsd.length === 0 && evalsPsico.length === 0 && (
                            <p className="text-xs text-[#4B5563] text-center mt-4">
                                Este jugador no tiene datos suficientes para generar un análisis.
                            </p>
                        )}

                        {error && (
                            <p className="text-xs text-red-400 mt-4 bg-red-500/10 rounded-xl p-3">{error}</p>
                        )}
                    </div>
                )}

                {/* Resultado del análisis */}
                {analisis && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Ready Score + Perfil */}
                        <div
                            className="rounded-3xl p-8 border"
                            style={{ borderColor: 'rgba(168,85,247,0.3)', backgroundColor: 'rgba(168,85,247,0.08)' }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-purple-400 uppercase mb-2">
                                        Perfil psicodeportivo
                                    </p>
                                    <p className="text-lg font-bold text-white leading-relaxed">
                                        {analisis.perfil_global}
                                    </p>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <p className="text-5xl font-black text-purple-400">{analisis.ready_score}</p>
                                    <p className="text-[10px] text-[#4B5563] uppercase tracking-widest">Ready score</p>
                                </div>
                            </div>
                        </div>

                        {/* Dimensiones */}
                        {[
                            { key: 'dimension_cognitiva',       label: 'Dimensión cognitiva',       color: '#38BDF8' },
                            { key: 'dimension_emocional',       label: 'Dimensión emocional',       color: '#A855F7' },
                            { key: 'dimension_conductual_social',label: 'Dimensión conductual-social',color: '#39FF14' },
                            { key: 'cruce_epsd_psicometria',    label: 'Cruce ePsD × psicometría',  color: '#F97316' },
                        ].map(({ key, label, color }) => (
                            analisis[key] && (
                                <div
                                    key={key}
                                    className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setSeccionAbierta(seccionAbierta === key ? null : key)}
                                        className="w-full flex items-center justify-between p-5 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                            <p className="text-xs font-black uppercase tracking-widest" style={{ color }}>
                                                {label}
                                            </p>
                                        </div>
                                        {seccionAbierta === key
                                            ? <ChevronUp size={14} className="text-[#4B5563]" />
                                            : <ChevronDown size={14} className="text-[#4B5563]" />
                                        }
                                    </button>
                                    {seccionAbierta === key && (
                                        <div className="px-5 pb-5 border-t border-white/5">
                                            <p className="text-sm text-[#9CA3AF] leading-relaxed pt-4">{analisis[key]}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        ))}

                        {/* Fortalezas y Áreas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#111827] border border-[#39FF14]/20 rounded-3xl p-6">
                                <p className="text-[10px] font-black tracking-widest text-[#39FF14] uppercase mb-4">Fortalezas</p>
                                <div className="space-y-2">
                                    {(analisis.fortalezas || []).map((f, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <Check size={12} className="text-[#39FF14] mt-0.5 shrink-0" />
                                            <p className="text-xs text-[#9CA3AF]">{f}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-[#111827] border border-red-500/20 rounded-3xl p-6">
                                <p className="text-[10px] font-black tracking-widest text-red-400 uppercase mb-4">Áreas de intervención</p>
                                <div className="space-y-2">
                                    {(analisis.areas_intervencion || []).map((a, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <Zap size={12} className="text-red-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-[#9CA3AF]">{a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recomendaciones */}
                        {analisis.recomendaciones?.length > 0 && (
                            <div className="bg-[#111827] border border-white/5 rounded-3xl p-6">
                                <p className="text-[10px] font-black tracking-widest text-purple-400 uppercase mb-5">
                                    Plan de intervención
                                </p>
                                <div className="space-y-4">
                                    {analisis.recomendaciones.map((r, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-[#0A0F1E] rounded-2xl border border-white/5">
                                            <div
                                                className="w-1.5 rounded-full shrink-0"
                                                style={{ backgroundColor: prioridadColor(r.prioridad) }}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-black text-white">{r.intervencion}</p>
                                                    <span
                                                        className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg"
                                                        style={{
                                                            color: prioridadColor(r.prioridad),
                                                            backgroundColor: prioridadColor(r.prioridad) + '20',
                                                        }}
                                                    >
                                                        {r.prioridad}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#6B7280] leading-relaxed">{r.descripcion}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
