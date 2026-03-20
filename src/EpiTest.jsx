import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Brain, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';

// ─── 57 preguntas del EPI Forma B ────────────────────────────────────────────
const PREGUNTAS = [
    "¿Le agradan a usted las bromas entre amigos?",
    "¿Se siente unas veces rebosante de energía y decaído otras?",
    "¿Se queda usted apartado o aislado de los demás en las fiestas o reuniones?",
    "¿Necesita a menudo amistades comprensivas que lo animen?",
    "¿Le agradan las tareas en que debe trabajar aislado?",
    "¿Habla algunas veces sobre cosas que desconoce completamente?",
    "¿Se preocupa a menudo por las cosas que no debería haber hecho o dicho?",
    "¿Le gusta mucho salir?",
    "¿Se preocupa usted durante mucho tiempo después de haber sufrido una experiencia desagradable?",
    "¿Es usted activo y emprendedor?",
    "¿Se despierta varias veces en la noche?",
    "¿Ha hecho alguna vez algo de lo que tenga que avergonzarse?",
    "¿Se siente molesto cuando no se viste como los demás?",
    "¿Piensa usted con frecuencia en su pasado?",
    "¿Se detiene muy a menudo a meditar sus pensamientos y sentimientos?",
    "Cuando está disgustado, ¿necesita algún amigo para contárselo?",
    "Generalmente, ¿puede usted soltarse y divertirse mucho en una fiesta alegre?",
    "Si al hacer una compra le despacharan de más por equivocación, ¿lo devolvería aunque supiera que nadie podría descubrirlo?",
    "¿Se siente usted a menudo cansado e indiferente sin ninguna razón para ello?",
    "¿Acostumbra usted a decir la primera cosa que se le ocurre?",
    "¿Se siente de pronto tímido cuando desea hablar a una persona atractiva que le es desconocida?",
    "¿Prefiere usted planear las cosas mejor que hacerlas?",
    "¿Siente palpitaciones o latidos en el corazón?",
    "¿Son todos sus hábitos buenos y deseables?",
    "Cuando se ve envuelto en una discusión, ¿prefiere llevarla hasta el final antes que permanecer callado?",
    "¿Se considera usted una persona nerviosa?",
    "¿Le gusta a menudo conversar con personas que no conoce y que encuentra casualmente?",
    "¿Ocurre con frecuencia que usted toma sus decisiones demasiado tarde?",
    "¿Se siente seguro de sí cuando tiene que hablar en público?",
    "¿Chismea algunas veces?",
    "¿Ha perdido usted a menudo horas de sueño, a causa de sus preocupaciones?",
    "¿Es usted vivaracho?",
    "¿Está usted con frecuencia en la luna?",
    "Cuando hace nuevas amistades, ¿es normalmente usted quien da el primer paso o el primero que invita?",
    "¿Se siente molesto o preocupado con frecuencia por sentimientos de culpabilidad?",
    "¿Es usted una persona que nunca está de mal humor?",
    "¿Se llamaría a sí mismo una persona afortunada?",
    "¿Se preocupa por cosas terribles que pudieran sucederle?",
    "¿Prefiere quedarse en casa a asistir a una fiesta o reunión aburrida?",
    "¿Se mete usted en líos con frecuencia por hacer las cosas sin pensar?",
    "¿Su osadía lo llevaría a hacer casi cualquier cosa?",
    "¿Ha llegado tarde a una cita o al trabajo?",
    "¿Es usted una persona irritable?",
    "¿Por lo general hace y dice las cosas rápidamente, sin detenerse a pensar?",
    "¿Se siente usted algunas veces triste y otras alegre, sin motivo aparente?",
    "¿Le gusta a usted hacer bromas a otras personas?",
    "¿Cuándo se despierta por las mañanas se siente agotado?",
    "¿Ha sentido usted en alguna ocasión deseos de no asistir al trabajo?",
    "¿Se sentiría mal si no estuviera rodeado de otras personas la mayor parte del tiempo?",
    "¿Le cuesta trabajo conciliar el sueño por la noche?",
    "¿Le gusta trabajar solo?",
    "¿Le dan ataques de temblores o estremecimientos?",
    "¿Le agrada mucho bullicio y agitación a su alrededor?",
    "¿Se siente usted algunas veces enfadado?",
    "¿Realiza sin deseos la mayor parte de las cosas que hace diariamente?",
    "¿Prefiere tener pocos amigos, pero selectos?",
    "¿Tiene usted vértigos?",
];

// ─── Clave de corrección ──────────────────────────────────────────────────────
// N: +1 si SI en estas preguntas (índice 0-based)
const N_SI = [1,3,6,8,10,13,15,18,20,22,25,27,30,32,34,37,39,42,44,46,49,51,54,56];

// E: +1 si SI en estas, +1 si NO en las otras
const E_SI = [0,7,9,16,19,24,26,28,31,33,36,40,43,45,48,52];
const E_NO = [2,4,12,14,21,38,50,55];

// L: +1 si SI en estas, +1 si NO en la 54 (índice 53)
const L_SI = [5,11,17,23,29,35,41,47];
const L_NO = [53];

// ─── Interpretación por rangos ────────────────────────────────────────────────
function interpretarN(n) {
    if (n <= 6)  return { label: 'Muy estable', color: '#39FF14', descripcion: 'Alta estabilidad emocional. Responde con calma ante la presión.' };
    if (n <= 12) return { label: 'Estable', color: '#22C55E', descripcion: 'Buena regulación emocional con leves fluctuaciones.' };
    if (n <= 18) return { label: 'Leve inestabilidad', color: '#EAB308', descripcion: 'Tendencia a preocuparse. Puede afectar rendimiento bajo presión.' };
    if (n <= 22) return { label: 'Inestable', color: '#F97316', descripcion: 'Ansiedad y tensión marcadas. Requiere trabajo en regulación emocional.' };
    return { label: 'Muy inestable', color: '#EF4444', descripcion: 'Alta labilidad emocional. Intervención prioritaria en gestión emocional.' };
}

function interpretarE(e) {
    if (e <= 6)  return { label: 'Muy introvertido', color: '#818CF8', descripcion: 'Preferencia marcada por el trabajo individual y la reflexión.' };
    if (e <= 12) return { label: 'Introvertido', color: '#A78BFA', descripcion: 'Reservado, prefiere entornos tranquilos y relaciones selectas.' };
    if (e <= 18) return { label: 'Ambivertido', color: '#6B7280', descripcion: 'Equilibrio entre lo social y lo individual. Adaptable.' };
    if (e <= 22) return { label: 'Extrovertido', color: '#38BDF8', descripcion: 'Sociable, activo y orientado al grupo. Buen liderazgo social.' };
    return { label: 'Muy extrovertido', color: '#0070F3', descripcion: 'Alta impulsividad social. Energía grupal elevada pero puede dispersarse.' };
}

function determinarTemperamento(n, e) {
    const estable = n <= 12;
    const extrovertido = e >= 13;
    if (estable && extrovertido)    return { tipo: 'Sanguíneo', color: '#38BDF8', descripcion: 'Sociable, expresivo, vivaz, adaptable y animado.' };
    if (estable && !extrovertido)   return { tipo: 'Flemático', color: '#39FF14', descripcion: 'Calmado, controlado, ecuánime, leal e imperturbable.' };
    if (!estable && extrovertido)   return { tipo: 'Colérico', color: '#F97316', descripcion: 'Activo, impulsivo, excitable, agresivo y optimista.' };
    return { tipo: 'Melancólico', color: '#A78BFA', descripcion: 'Ansioso, reservado, pesimista, rígido y sensible.' };
}

// ─── Componente principal ─────────────────────────────────────────────────────
const PREGUNTAS_POR_PAGINA = 10;
const TOTAL_PAGINAS = Math.ceil(PREGUNTAS.length / PREGUNTAS_POR_PAGINA);

export default function EpiTest() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [respuestas, setRespuestas] = useState({}); // { 0: true/false, ... }
    const [pagina, setPagina] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Guardar progreso en localStorage
    useEffect(() => {
        const guardado = localStorage.getItem('epi_respuestas');
        if (guardado) setRespuestas(JSON.parse(guardado));
    }, []);

    useEffect(() => {
        localStorage.setItem('epi_respuestas', JSON.stringify(respuestas));
    }, [respuestas]);

    const responder = (idx, valor) => {
        setRespuestas(prev => ({ ...prev, [idx]: valor }));
    };

    // Preguntas de la página actual
    const inicio = pagina * PREGUNTAS_POR_PAGINA;
    const fin = Math.min(inicio + PREGUNTAS_POR_PAGINA, PREGUNTAS.length);
    const preguntasPagina = PREGUNTAS.slice(inicio, fin);

    const todasRespondidas = preguntasPagina.every((_, i) => respuestas[inicio + i] !== undefined);
    const progreso = (Object.keys(respuestas).length / PREGUNTAS.length) * 100;

    // Calcular puntajes
    function calcularPuntajes() {
        let N = 0, E = 0, L = 0;
        N_SI.forEach(i => { if (respuestas[i] === true) N++; });
        E_SI.forEach(i => { if (respuestas[i] === true) E++; });
        E_NO.forEach(i => { if (respuestas[i] === false) E++; });
        L_SI.forEach(i => { if (respuestas[i] === true) L++; });
        L_NO.forEach(i => { if (respuestas[i] === false) L++; });
        return { N, E, L };
    }

    const finalizar = async () => {
        if (Object.keys(respuestas).length < PREGUNTAS.length) {
            alert('Por favor responde todas las preguntas antes de finalizar.');
            return;
        }

        const { N, E, L } = calcularPuntajes();
        const interpN = interpretarN(N);
        const interpE = interpretarE(E);
        const temperamento = determinarTemperamento(N, E);
        const confiable = L <= 5;

        const res = { N, E, L, interpN, interpE, temperamento, confiable };
        setResultado(res);

        // Guardar en Firebase
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'evaluaciones_psicometricas'), {
                jugadorId: currentUser?.uid || 'desconocido',
                nombreJugador: currentUser?.displayName || currentUser?.email || '',
                evaluador: 'self', // el propio jugador
                fecha: new Date().toISOString().split('T')[0],
                instrumento: { id: 'epi', nombre: 'EPI - Inventario de Personalidad de Eysenck', tipo: 'digital' },
                dimension: 'EMOCIONAL',
                puntajes: { N, E, L },
                nivel: interpN.label,
                interpretacion: `Neuroticismo: ${interpN.label} (${N}/24) — ${interpN.descripcion} | Extroversión: ${interpE.label} (${E}/24) — ${interpE.descripcion}`,
                recomendacion: temperamento.descripcion,
                temperamento: temperamento.tipo,
                confiable,
                respuestasRaw: respuestas,
                timestamp: serverTimestamp(),
            });
            localStorage.removeItem('epi_respuestas');
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Vista de resultado ────────────────────────────────────────────────────
    if (resultado) {
        const { N, E, L, interpN, interpE, temperamento, confiable } = resultado;
        return (
            <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center p-6">
                <div className="max-w-xl w-full space-y-6">

                    {/* Header resultado */}
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
                            <Brain className="text-white w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                            Tu perfil EPI
                        </h1>
                        <p className="text-[#6B7280] text-sm">Inventario de Personalidad de Eysenck · Forma B</p>
                    </div>

                    {/* Alerta confiabilidad */}
                    {!confiable && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-start gap-3">
                            <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-yellow-300 text-xs font-medium leading-relaxed">
                                La escala de distorsión (L={L}) supera el umbral de 5. Los resultados pueden no ser confiables — es posible que hayas respondido de manera socialmente deseable.
                            </p>
                        </div>
                    )}

                    {/* Temperamento */}
                    <div
                        className="rounded-3xl p-8 text-center border"
                        style={{ borderColor: temperamento.color + '40', backgroundColor: temperamento.color + '10' }}
                    >
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">Temperamento</p>
                        <p className="text-4xl font-black uppercase tracking-tight mb-3" style={{ color: temperamento.color }}>
                            {temperamento.tipo}
                        </p>
                        <p className="text-sm text-[#9CA3AF] leading-relaxed">{temperamento.descripcion}</p>
                    </div>

                    {/* Neuroticismo */}
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase">Neuroticismo (N)</p>
                                <p className="text-2xl font-black mt-1" style={{ color: interpN.color }}>{interpN.label}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black" style={{ color: interpN.color }}>{N}</p>
                                <p className="text-[10px] text-[#4B5563]">de 24</p>
                            </div>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${(N / 24) * 100}%`, backgroundColor: interpN.color }}
                            />
                        </div>
                        <p className="text-xs text-[#6B7280] leading-relaxed">{interpN.descripcion}</p>
                    </div>

                    {/* Extroversión */}
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase">Extroversión (E)</p>
                                <p className="text-2xl font-black mt-1" style={{ color: interpE.color }}>{interpE.label}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black" style={{ color: interpE.color }}>{E}</p>
                                <p className="text-[10px] text-[#4B5563]">de 24</p>
                            </div>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${(E / 24) * 100}%`, backgroundColor: interpE.color }}
                            />
                        </div>
                        <p className="text-xs text-[#6B7280] leading-relaxed">{interpE.descripcion}</p>
                    </div>

                    {/* Botón volver */}
                    <button
                        onClick={() => navigate('/portal/dashboard')}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3"
                    >
                        <Check size={16} /> Volver al Dashboard
                    </button>
                </div>

                {showSuccess && (
                    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-purple-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-purple-500/40 flex items-center gap-4">
                            <Check size={20} strokeWidth={4} /> ¡Resultados guardados en PSMILE Cloud!
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Vista del test ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/portal/dashboard')}
                        className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Salir
                    </button>
                    <div className="flex items-center gap-2">
                        <Brain className="text-purple-400" size={18} />
                        <span className="text-xs font-black text-white tracking-tight uppercase">
                            EPI <span className="text-purple-400">Eysenck</span>
                        </span>
                    </div>
                    <span className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest">
                        {Object.keys(respuestas).length}/{PREGUNTAS.length}
                    </span>
                </div>

                {/* Barra de progreso */}
                <div className="h-1 bg-white/5">
                    <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${progreso}%` }}
                    />
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-8 py-10 max-w-2xl pb-32">

                {/* Instrucciones (solo página 0) */}
                {pagina === 0 && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-3xl p-6 mb-8">
                        <p className="text-sm text-purple-300 leading-relaxed font-medium">
                            Responde <strong>SI</strong> o <strong>NO</strong> según cómo eres habitualmente. No hay respuestas correctas o incorrectas. Confía en tu primera reacción — no pienses demasiado cada pregunta.
                        </p>
                    </div>
                )}

                {/* Indicador de página */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black tracking-widest text-[#4B5563] uppercase">
                        Preguntas {inicio + 1}–{fin} de {PREGUNTAS.length}
                    </p>
                    <div className="flex gap-1">
                        {Array.from({ length: TOTAL_PAGINAS }).map((_, i) => (
                            <div
                                key={i}
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                    width: i === pagina ? '24px' : '6px',
                                    backgroundColor: i < pagina ? '#A855F7' : i === pagina ? '#A855F7' : '#1F2937'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Preguntas */}
                <div className="space-y-4">
                    {preguntasPagina.map((pregunta, i) => {
                        const idx = inicio + i;
                        const resp = respuestas[idx];
                        return (
                            <div
                                key={idx}
                                className={`bg-[#111827] border rounded-3xl p-6 transition-all ${
                                    resp !== undefined ? 'border-purple-500/20' : 'border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-start gap-4 mb-5">
                                    <span className="w-7 h-7 rounded-xl bg-white/5 text-[#4B5563] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm text-white leading-relaxed font-medium">{pregunta}</p>
                                </div>

                                <div className="flex gap-3 pl-11">
                                    <button
                                        onClick={() => responder(idx, true)}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                            resp === true
                                                ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-lg shadow-purple-500/10'
                                                : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        Sí
                                    </button>
                                    <button
                                        onClick={() => responder(idx, false)}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                            resp === false
                                                ? 'bg-[#0070F3]/20 border-[#0070F3]/60 text-blue-300 shadow-lg shadow-blue-500/10'
                                                : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Footer de navegación */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#0A0F1E]/95 backdrop-blur-xl border-t border-white/5 p-4">
                <div className="container mx-auto max-w-2xl flex gap-4">
                    {pagina > 0 && (
                        <button
                            onClick={() => { setPagina(p => p - 1); window.scrollTo(0, 0); }}
                            className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 text-[#6B7280]"
                        >
                            <ArrowLeft size={14} /> Anterior
                        </button>
                    )}

                    {pagina < TOTAL_PAGINAS - 1 ? (
                        <button
                            onClick={() => {
                                if (!todasRespondidas) {
                                    alert('Por favor responde todas las preguntas de esta página antes de continuar.');
                                    return;
                                }
                                setPagina(p => p + 1);
                                window.scrollTo(0, 0);
                            }}
                            disabled={!todasRespondidas}
                            className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20"
                        >
                            Siguiente <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={finalizar}
                            disabled={isSaving || Object.keys(respuestas).length < PREGUNTAS.length}
                            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Ver mis resultados
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
