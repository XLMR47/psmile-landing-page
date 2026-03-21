import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Target, Check, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';

// ─── 25 ítems con clave de corrección ─────────────────────────────────────────
// positivo: true = V suma punto | negativo: false = F suma punto
const ITEMS = [
    { texto: "Me siento con buena velocidad en los movimientos.",                                                                          positivo: true  }, // 1
    { texto: "Estoy un poco flojo en cuanto a la fuerza de mis desplazamientos.",                                                          positivo: false }, // 2
    { texto: "Mi capacidad de resistencia para trabajar con un ritmo alto es buena.",                                                      positivo: true  }, // 3
    { texto: "Durante las acciones en entrenamientos y en partidos tengo buena coordinación en los movimientos.",                          positivo: true  }, // 4
    { texto: "He notado que me falta fuerza en el final de los partidos.",                                                                 positivo: false }, // 5
    { texto: "Cuando tengo el balón, mis movimientos son certeros y de buena calidad técnica.",                                            positivo: true  }, // 6
    { texto: "Cuando trabajo a ritmos altos, estoy presentando problemas en mis movimientos técnicos.",                                    positivo: false }, // 7
    { texto: "Considero que mi desplazamiento es bueno.",                                                                                  positivo: true  }, // 8
    { texto: "Estoy bien preparado técnicamente para trabajar ante cualquier contrario, en cualquier distancia, y bajo disímiles condiciones atmosféricas.", positivo: true  }, // 9
    { texto: "Mis problemas en la técnica afectan la lucidez de mis movimientos dentro de la cancha.",                                    positivo: false }, // 10
    { texto: "Me caracterizo por tener buena capacidad para elaborar el plan táctico.",                                                    positivo: true  }, // 11
    { texto: "Tengo dificultades para llevar a cabo el plan táctico al final del partido.",                                                positivo: false }, // 12
    { texto: "Tengo buen repertorio de planes para salir con éxito ante mis oponentes.",                                                   positivo: true  }, // 13
    { texto: "Con frecuencia me estoy equivocando tácticamente en las acciones.",                                                          positivo: false }, // 14
    { texto: "Estoy seguro de poder aplicar una táctica correcta ante mis contrarios.",                                                    positivo: true  }, // 15
    { texto: "Estoy convencido de que podré cumplir el objetivo y las tareas que tengo para la próxima competencia.",                      positivo: true  }, // 16
    { texto: "Cuando surgen dificultades antes o durante los partidos se altera mi estado psíquico y la calidad de mi actuación.",         positivo: false }, // 17
    { texto: "Generalmente puedo resolver los problemas que se presentan dentro y fuera de la cancha sin recurrir a mi entrenador.",       positivo: true  }, // 18
    { texto: "He notado que me falta empuje y decisión en algunos momentos dentro del partido.",                                           positivo: false }, // 19
    { texto: "En los últimos tiempos he cumplido mi preparación deportiva con buena asistencia, puntualidad y disposición.",               positivo: true  }, // 20
    { texto: "La confianza en mis fuerzas, para ganar esta competencia, se ha visto reducida por problemas que he tenido.",                positivo: false }, // 21
    { texto: "Mi estado psicológico actual se encuentra muy bien y mejor que en otros momentos de mi carrera.",                            positivo: true  }, // 22
    { texto: "Siento que me ha faltado la voluntad necesaria para entrenar con deseos en estos días.",                                     positivo: false }, // 23
    { texto: "En estos días puedo controlarme bien en lo que hago sin necesidad de que me supervisen.",                                    positivo: true  }, // 24
    { texto: "El estado psicológico negativo en que me encuentro puede contribuir a que mi actuación esté por debajo de mis posibilidades.", positivo: false }, // 25
];

// ─── 5 dimensiones (índice 0-based) ──────────────────────────────────────────
const DIMENSIONES = [
    { id: 'fisica',      label: 'Preparación física',       items: [0,1,2,4,7],   color: '#F97316', descripcion: 'Velocidad, fuerza, resistencia y desplazamiento.' },
    { id: 'tecnica',     label: 'Preparación técnica',      items: [3,5,6,8,9],   color: '#38BDF8', descripcion: 'Calidad técnica del movimiento con y sin balón.' },
    { id: 'tactica',     label: 'Preparación táctica',      items: [10,11,12,13,14], color: '#A855F7', descripcion: 'Elaboración y ejecución del plan táctico.' },
    { id: 'volitiva',    label: 'Preparación volitiva',     items: [17,18,19,22,23], color: '#39FF14', descripcion: 'Voluntad, decisión, autonomía y autocontrol.' },
    { id: 'psicologica', label: 'Preparación psicológica',  items: [15,16,20,21,24], color: '#0070F3', descripcion: 'Estado psíquico, confianza y convicción competitiva.' },
];

function etiqueta(pts, max) {
    const pct = pts / max;
    if (pct >= 0.9) return { label: 'Óptima',    color: '#39FF14' };
    if (pct >= 0.7) return { label: 'Buena',     color: '#22C55E' };
    if (pct >= 0.5) return { label: 'Regular',   color: '#EAB308' };
    if (pct >= 0.3) return { label: 'Baja',      color: '#F97316' };
    return               { label: 'Deficiente', color: '#EF4444' };
}

const ITEMS_POR_PAGINA = 5;
const TOTAL_PAGINAS = Math.ceil(ITEMS.length / ITEMS_POR_PAGINA);

export default function NivelPreparacionTest() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const targetJugadorId = searchParams.get('jugadorId') || currentUser?.uid;

    const [respuestas, setRespuestas] = useState({});
    const [pagina, setPagina] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Contexto del test (torneo)
    const [torneo, setTorneo] = useState('');
    const [mostrarContexto, setMostrarContexto] = useState(true);

    useEffect(() => {
        const g = localStorage.getItem('nsp_respuestas');
        if (g) setRespuestas(JSON.parse(g));
    }, []);

    useEffect(() => {
        localStorage.setItem('nsp_respuestas', JSON.stringify(respuestas));
    }, [respuestas]);

    const responder = (idx, valor) => setRespuestas(prev => ({ ...prev, [idx]: valor }));

    const inicio = pagina * ITEMS_POR_PAGINA;
    const fin = Math.min(inicio + ITEMS_POR_PAGINA, ITEMS.length);
    const itemsPagina = ITEMS.slice(inicio, fin);
    const todasRespondidas = itemsPagina.every((_, i) => respuestas[inicio + i] !== undefined);
    const progreso = (Object.keys(respuestas).length / ITEMS.length) * 100;

    // Dimensión actual (qué dimensión cubre esta página)
    const dimActual = DIMENSIONES.find(d =>
        d.items.some(i => i >= inicio && i < fin)
    );

    function calcularPuntajes() {
        return DIMENSIONES.map(dim => {
            const pts = dim.items.filter(i => {
                const item = ITEMS[i];
                const resp = respuestas[i];
                return item.positivo ? resp === true : resp === false;
            }).length;
            return { ...dim, puntaje: pts, max: 5, etiqueta: etiqueta(pts, 5) };
        });
    }

    const finalizar = async () => {
        if (Object.keys(respuestas).length < ITEMS.length) {
            alert('Por favor responde todos los ítems antes de finalizar.');
            return;
        }

        const puntajes = calcularPuntajes();
        const total = puntajes.reduce((s, d) => s + d.puntaje, 0);
        setResultado({ puntajes, total });

        setIsSaving(true);
        try {
            const puntajesMap = {};
            puntajes.forEach(d => { puntajesMap[d.id] = d.puntaje; });

            const debilidades = puntajes.filter(d => d.puntaje <= 2).map(d => d.label).join(', ');
            const fortalezas  = puntajes.filter(d => d.puntaje >= 4).map(d => d.label).join(', ');

            await addDoc(collection(db, 'evaluaciones_psicometricas'), {
                jugadorId: targetJugadorId || 'desconocido',
                nombreJugador: targetJugadorId !== currentUser?.uid ? 'Evaluación Admin' : (currentUser?.displayName || currentUser?.email || ''),
                evaluador: 'self',
                fecha: new Date().toISOString().split('T')[0],
                contexto: { torneo },
                instrumento: {
                    id: 'nivel_preparacion',
                    nombre: 'Cuestionario Nivel Subjetivo de Preparación',
                    tipo: 'digital',
                },
                dimension: 'COGNITIVO',
                puntajes: puntajesMap,
                puntajeTotal: total,
                nivel: etiqueta(total, 25).label,
                interpretacion: `Nivel global de preparación: ${total}/25 — ${etiqueta(total, 25).label}. Fortalezas: ${fortalezas || 'ninguna destacada'}. Áreas de mejora: ${debilidades || 'ninguna crítica'}.`,
                recomendacion: debilidades ? `Trabajar especialmente en: ${debilidades}.` : 'Mantener el nivel actual de preparación.',
                respuestasRaw: respuestas,
                timestamp: serverTimestamp(),
            });

            // Status update for assigned tests
            const asignadoId = searchParams.get('asignadoId');
            if (asignadoId) {
                try {
                    await updateDoc(doc(db, 'tests_asignados', asignadoId), {
                        estado: 'completado',
                        completadoEn: serverTimestamp()
                    });
                } catch (err) {
                    console.error("Error updating test status:", err);
                }
            }

            localStorage.removeItem('nsp_respuestas');
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Vista de resultado ────────────────────────────────────────────────────
    if (resultado) {
        const { puntajes, total } = resultado;
        const etTotal = etiqueta(total, 25);

        return (
            <div className="min-h-screen bg-[#0A0F1E] text-white">
                <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                            <Target className="text-[#0070F3]" size={18} /> PSMILE <span className="text-[#0070F3]">NSP</span>
                        </span>
                    </div>
                </header>

                <main className="container mx-auto px-4 md:px-8 py-10 max-w-2xl pb-24">

                    {/* Score global */}
                    <div className="text-center mb-10">
                        <div className="w-28 h-28 rounded-full border-4 flex items-center justify-center mx-auto mb-6"
                            style={{ borderColor: etTotal.color }}>
                            <div>
                                <p className="text-4xl font-black" style={{ color: etTotal.color }}>{total}</p>
                                <p className="text-[10px] text-[#4B5563] font-black uppercase">de 25</p>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                            Nivel de preparación
                        </h1>
                        <p className="text-xl font-black" style={{ color: etTotal.color }}>{etTotal.label}</p>
                        {torneo && <p className="text-sm text-[#4B5563] mt-2">{torneo}</p>}
                    </div>

                    {/* Radar por dimensión */}
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 mb-6">
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-6">Perfil por área</p>
                        <div className="space-y-5">
                            {puntajes.map(dim => (
                                <div key={dim.id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold text-white">{dim.label}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black" style={{ color: dim.etiqueta.color }}>
                                                {dim.etiqueta.label}
                                            </span>
                                            <span className="text-lg font-black" style={{ color: dim.color }}>
                                                {dim.puntaje}<span className="text-[#4B5563] text-xs font-normal">/5</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${(dim.puntaje / 5) * 100}%`, backgroundColor: dim.color }} />
                                    </div>
                                    <p className="text-[11px] text-[#4B5563] mt-1">{dim.descripcion}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alertas de áreas críticas */}
                    {puntajes.some(d => d.puntaje <= 2) && (
                        <div className="bg-[#111827] border border-red-500/20 rounded-3xl p-6 mb-6">
                            <p className="text-[10px] font-black tracking-widest text-red-400 uppercase mb-4">Áreas de intervención prioritaria</p>
                            <div className="space-y-3">
                                {puntajes.filter(d => d.puntaje <= 2).map(dim => (
                                    <div key={dim.id} className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{dim.label}</p>
                                            <p className="text-xs text-[#6B7280]">{dim.descripcion}</p>
                                        </div>
                                        <span className="ml-auto text-xs font-black text-red-400">{dim.puntaje}/5</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/portal/dashboard')}
                        className="w-full py-4 bg-[#0070F3]/10 hover:bg-[#0070F3]/20 border border-[#0070F3]/30 text-[#0070F3] rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3"
                    >
                        <Check size={16} /> Volver al Dashboard
                    </button>
                </main>

                {showSuccess && (
                    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-[#0070F3] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex items-center gap-4">
                            <Check size={20} strokeWidth={4} /> ¡Guardado en PSMILE Cloud!
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Vista del test ────────────────────────────────────────────────────────

    // Pantalla inicial con contexto
    if (mostrarContexto) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0070F3]/30 to-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center mx-auto mb-6">
                            <Target className="text-[#0070F3] w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Nivel de preparación</h1>
                        <p className="text-sm text-[#6B7280]">Cuestionario de autopercepción deportiva · 25 ítems</p>
                    </div>

                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6">
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-4">Torneo / competencia (opcional)</p>
                        <input
                            type="text"
                            value={torneo}
                            onChange={e => setTorneo(e.target.value)}
                            placeholder="Ej: Apertura 2026 — Fecha 3"
                            className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#0070F3] text-sm"
                        />
                    </div>

                    <div className="bg-[#0070F3]/5 border border-[#0070F3]/20 rounded-3xl p-5">
                        <p className="text-sm text-[#93C5FD] leading-relaxed font-medium">
                            Lee detenidamente cada proposición y responde <strong className="text-white">Verdadero</strong> o <strong className="text-white">Falso</strong> según cómo te encuentras <strong className="text-white">hoy</strong>. Sé sincero — no hay respuestas buenas ni malas.
                        </p>
                    </div>

                    <button
                        onClick={() => setMostrarContexto(false)}
                        className="w-full py-4 bg-[#0070F3] hover:bg-[#0060D0] text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0070F3]/30"
                    >
                        Comenzar <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white">

            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate('/portal/dashboard')} className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Salir
                    </button>
                    <div className="flex items-center gap-2">
                        <Target className="text-[#0070F3]" size={18} />
                        <span className="text-xs font-black text-white uppercase">PSMILE <span className="text-[#0070F3]">NSP</span></span>
                    </div>
                    <span className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest">
                        {Object.keys(respuestas).length}/{ITEMS.length}
                    </span>
                </div>
                <div className="h-1 bg-white/5">
                    <div className="h-full bg-[#0070F3] transition-all duration-300" style={{ width: `${progreso}%` }} />
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-8 py-10 max-w-2xl pb-32">

                {/* Etiqueta dimensión activa */}
                {dimActual && (
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dimActual.color }} />
                        <p className="text-xs font-black uppercase tracking-widest" style={{ color: dimActual.color }}>
                            {dimActual.label}
                        </p>
                        <div className="h-px flex-1 opacity-20" style={{ backgroundColor: dimActual.color }} />
                    </div>
                )}

                {/* Indicador de página */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black tracking-widest text-[#4B5563] uppercase">
                        Ítems {inicio + 1}–{fin} de {ITEMS.length}
                    </p>
                    <div className="flex gap-1">
                        {Array.from({ length: TOTAL_PAGINAS }).map((_, i) => (
                            <div key={i} className="h-1.5 rounded-full transition-all"
                                style={{ width: i === pagina ? '20px' : '6px', backgroundColor: i <= pagina ? '#0070F3' : '#1F2937' }} />
                        ))}
                    </div>
                </div>

                {/* Ítems */}
                <div className="space-y-4">
                    {itemsPagina.map((item, i) => {
                        const idx = inicio + i;
                        const resp = respuestas[idx];
                        return (
                            <div key={idx} className={`bg-[#111827] border rounded-3xl p-6 transition-all ${resp !== undefined ? 'border-[#0070F3]/20' : 'border-white/5 hover:border-white/10'}`}>
                                <div className="flex items-start gap-4 mb-5">
                                    <span className="w-7 h-7 rounded-xl bg-white/5 text-[#4B5563] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm text-white leading-relaxed font-medium">{item.texto}</p>
                                </div>
                                <div className="flex gap-3 pl-11">
                                    <button
                                        onClick={() => responder(idx, true)}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${resp === true ? 'bg-[#0070F3]/20 border-[#0070F3]/60 text-blue-300 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white hover:bg-white/10'}`}
                                    >
                                        Verdadero
                                    </button>
                                    <button
                                        onClick={() => responder(idx, false)}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${resp === false ? 'bg-red-500/20 border-red-500/60 text-red-300 shadow-lg shadow-red-500/10' : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white hover:bg-white/10'}`}
                                    >
                                        Falso
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Footer navegación */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#0A0F1E]/95 backdrop-blur-xl border-t border-white/5 p-4">
                <div className="container mx-auto max-w-2xl flex gap-4">
                    {pagina > 0 && (
                        <button onClick={() => { setPagina(p => p - 1); window.scrollTo(0, 0); }}
                            className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 text-[#6B7280]">
                            <ArrowLeft size={14} /> Anterior
                        </button>
                    )}
                    {pagina < TOTAL_PAGINAS - 1 ? (
                        <button
                            onClick={() => {
                                if (!todasRespondidas) { alert('Responde todos los ítems de esta sección antes de continuar.'); return; }
                                setPagina(p => p + 1); window.scrollTo(0, 0);
                            }}
                            disabled={!todasRespondidas}
                            className="flex-1 py-4 bg-[#0070F3]/10 hover:bg-[#0070F3]/20 border border-[#0070F3]/30 disabled:opacity-40 disabled:cursor-not-allowed text-[#0070F3] rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                        >
                            Siguiente <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={finalizar}
                            disabled={isSaving || Object.keys(respuestas).length < ITEMS.length}
                            className="flex-1 py-4 bg-[#0070F3] hover:bg-[#0060D0] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0070F3]/30"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Ver mi resultado
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
