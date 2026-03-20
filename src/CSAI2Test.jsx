import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Zap, Check, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';

// ─── 27 ítems CSAI-2 (Martens et al., 1990) ──────────────────────────────────
// subescala: C = ansiedad cognitiva, S = ansiedad somática, SC = autoconfianza
// inverso: true = ítem redactado positivamente (se invierte para la subescala de ansiedad)
const ITEMS = [
    { texto: "Estoy preocupado/a por esta competencia.",                                               sub: 'C',  inverso: false },
    { texto: "Me siento nervioso/a.",                                                                  sub: 'S',  inverso: false },
    { texto: "Me siento tranquilo/a.",                                                                 sub: 'SC', inverso: false },
    { texto: "Tengo dudas sobre mí mismo/a.",                                                          sub: 'C',  inverso: false },
    { texto: "Me siento inquieto/a.",                                                                  sub: 'S',  inverso: false },
    { texto: "Me siento cómodo/a.",                                                                    sub: 'SC', inverso: false },
    { texto: "Me preocupa no rendir tan bien como podría en esta competencia.",                         sub: 'C',  inverso: false },
    { texto: "Siento mi cuerpo tenso.",                                                                sub: 'S',  inverso: false },
    { texto: "Me siento seguro/a de mí mismo/a.",                                                      sub: 'SC', inverso: false },
    { texto: "Me preocupa perder.",                                                                    sub: 'C',  inverso: false },
    { texto: "Siento tensión en el estómago.",                                                         sub: 'S',  inverso: false },
    { texto: "Me siento confiado/a.",                                                                  sub: 'SC', inverso: false },
    { texto: "Me preocupa bloquearme bajo presión.",                                                   sub: 'C',  inverso: false },
    { texto: "Mi cuerpo está relajado.",                                                               sub: 'S',  inverso: true  },
    { texto: "Estoy seguro/a de que puedo afrontar el desafío.",                                       sub: 'SC', inverso: false },
    { texto: "Me preocupa rendir mal.",                                                                sub: 'C',  inverso: false },
    { texto: "Siento que el corazón se me acelera.",                                                   sub: 'S',  inverso: false },
    { texto: "Estoy seguro/a de que rendiré bien.",                                                    sub: 'SC', inverso: false },
    { texto: "Me preocupa no alcanzar mi objetivo.",                                                   sub: 'C',  inverso: false },
    { texto: "Siento que el estómago se me hunde.",                                                    sub: 'S',  inverso: false },
    { texto: "Me siento mentalmente relajado/a.",                                                      sub: 'SC', inverso: false },
    { texto: "Me preocupa que los demás se decepcionen con mi actuación.",                             sub: 'C',  inverso: false },
    { texto: "Tengo las manos húmedas.",                                                               sub: 'S',  inverso: false },
    { texto: "Tengo confianza porque me imagino mentalmente alcanzando mi objetivo.",                  sub: 'SC', inverso: false },
    { texto: "Me preocupa no poder concentrarme.",                                                     sub: 'C',  inverso: false },
    { texto: "Siento mi cuerpo en tensión.",                                                           sub: 'S',  inverso: false },
    { texto: "Confío en poder rendir bien bajo presión.",                                              sub: 'SC', inverso: false },
];

const OPCIONES = [
    { valor: 1, label: 'Nada' },
    { valor: 2, label: 'Algo' },
    { valor: 3, label: 'Bastante' },
    { valor: 4, label: 'Mucho' },
];

// ─── Interpretación por subescala ─────────────────────────────────────────────
// Cada subescala va de 9 a 36 pts
function interpretarSubescala(pts, tipo) {
    if (tipo === 'SC') {
        // Autoconfianza — mayor es mejor
        if (pts >= 30) return { label: 'Muy alta',  color: '#39FF14' };
        if (pts >= 24) return { label: 'Alta',      color: '#22C55E' };
        if (pts >= 18) return { label: 'Moderada',  color: '#EAB308' };
        if (pts >= 12) return { label: 'Baja',      color: '#F97316' };
        return             { label: 'Muy baja',  color: '#EF4444' };
    } else {
        // Ansiedad — menor es mejor
        if (pts <= 12) return { label: 'Muy baja',  color: '#39FF14' };
        if (pts <= 18) return { label: 'Baja',      color: '#22C55E' };
        if (pts <= 24) return { label: 'Moderada',  color: '#EAB308' };
        if (pts <= 30) return { label: 'Alta',      color: '#F97316' };
        return             { label: 'Muy alta',  color: '#EF4444' };
    }
}

function interpretarPerfil(C, S, SC) {
    if (SC >= 24 && C <= 18 && S <= 18)
        return { label: 'Óptimo para competir', color: '#39FF14', desc: 'Alta confianza y ansiedad controlada. Estado ideal precompetitivo.' };
    if (SC >= 24 && (C > 18 || S > 18))
        return { label: 'Confiado con activación', color: '#38BDF8', desc: 'Buena confianza pero con activación física o cognitiva elevada. Canalizable.' };
    if (SC < 18 && C > 24)
        return { label: 'Ansiedad cognitiva dominante', color: '#F97316', desc: 'Pensamientos negativos y baja confianza. Requiere trabajo en diálogo interno.' };
    if (SC < 18 && S > 24)
        return { label: 'Ansiedad somática dominante', color: '#F97316', desc: 'Síntomas físicos marcados y baja confianza. Trabajo en relajación y respiración.' };
    if (C > 24 && S > 24)
        return { label: 'Ansiedad elevada', color: '#EF4444', desc: 'Ansiedad cognitiva y somática altas. Intervención prioritaria antes de competir.' };
    return { label: 'Estado mixto', color: '#EAB308', desc: 'Perfil con aspectos a trabajar. Revisar en conjunto con el jugador.' };
}

const ITEMS_POR_PAGINA = 9;
const TOTAL_PAGINAS = Math.ceil(ITEMS.length / ITEMS_POR_PAGINA);

const PAGINA_LABELS = [
    { label: 'Pensamientos', color: '#F97316', sub: 'C' },
    { label: 'Sensaciones físicas', color: '#A855F7', sub: 'S' },
    { label: 'Confianza', color: '#39FF14', sub: 'SC' },
];

export default function CSAI2Test() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const targetJugadorId = searchParams.get('jugadorId') || currentUser?.uid;

    const [respuestas, setRespuestas] = useState({});
    const [pagina, setPagina] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [contexto, setContexto] = useState({ rival: '', torneo: '' });
    const [mostrarContexto, setMostrarContexto] = useState(true);

    useEffect(() => {
        const g = localStorage.getItem('csai2_respuestas');
        if (g) setRespuestas(JSON.parse(g));
    }, []);

    useEffect(() => {
        localStorage.setItem('csai2_respuestas', JSON.stringify(respuestas));
    }, [respuestas]);

    const responder = (idx, valor) => setRespuestas(prev => ({ ...prev, [idx]: valor }));

    const inicio = pagina * ITEMS_POR_PAGINA;
    const fin = Math.min(inicio + ITEMS_POR_PAGINA, ITEMS.length);
    const itemsPagina = ITEMS.slice(inicio, fin);
    const todasRespondidas = itemsPagina.every((_, i) => respuestas[inicio + i] !== undefined);
    const progreso = (Object.keys(respuestas).length / ITEMS.length) * 100;
    const dimActual = PAGINA_LABELS[pagina];

    function calcularPuntajes() {
        let C = 0, S = 0, SC = 0;
        ITEMS.forEach((item, i) => {
            const val = respuestas[i] || 0;
            // Ítems inversos en subescala somática (ítem 14, índice 13)
            const puntos = item.inverso ? (5 - val) : val;
            if (item.sub === 'C')  C  += puntos;
            if (item.sub === 'S')  S  += puntos;
            if (item.sub === 'SC') SC += puntos;
        });
        return { C, S, SC };
    }

    const finalizar = async () => {
        if (Object.keys(respuestas).length < ITEMS.length) {
            alert('Por favor responde todos los ítems antes de finalizar.');
            return;
        }

        const { C, S, SC } = calcularPuntajes();
        const perfil = interpretarPerfil(C, S, SC);
        setResultado({ C, S, SC, perfil });

        setIsSaving(true);
        try {
            await addDoc(collection(db, 'evaluaciones_psicometricas'), {
                jugadorId: targetJugadorId || 'desconocido',
                nombreJugador: targetJugadorId !== currentUser?.uid ? 'Evaluación Admin' : (currentUser?.displayName || currentUser?.email || ''),
                evaluador: 'self',
                fecha: new Date().toISOString().split('T')[0],
                contexto,
                instrumento: {
                    id: 'csai2',
                    nombre: 'CSAI-2 — Inventario de Ansiedad Competitiva Estado (Martens et al., 1990)',
                    tipo: 'digital',
                },
                dimension: 'EMOCIONAL',
                puntajes: { ansiedad_cognitiva: C, ansiedad_somatica: S, autoconfianza: SC },
                nivel: perfil.label,
                interpretacion: `Ansiedad cognitiva: ${interpretarSubescala(C,'C').label} (${C}/36). Ansiedad somática: ${interpretarSubescala(S,'S').label} (${S}/36). Autoconfianza: ${interpretarSubescala(SC,'SC').label} (${SC}/36). Perfil: ${perfil.label} — ${perfil.desc}`,
                recomendacion: perfil.desc,
                respuestasRaw: respuestas,
                timestamp: serverTimestamp(),
            });
            localStorage.removeItem('csai2_respuestas');
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // ── INTRO ────────────────────────────────────────────────────────────────
    if (mostrarContexto) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500/30 to-red-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
                            <Zap className="text-orange-400 w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">CSAI-2</h1>
                        <p className="text-sm text-[#6B7280]">Inventario de ansiedad competitiva · 27 ítems</p>
                    </div>

                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-5">
                        <p className="text-sm text-orange-200 leading-relaxed font-medium">
                            Responde pensando en <strong className="text-white">cómo te sientes ahora mismo</strong>, antes de esta competencia. No hay respuestas buenas ni malas — sé sincero/a.
                        </p>
                    </div>

                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 space-y-4">
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-2">Contexto (opcional)</p>
                        <input
                            type="text"
                            value={contexto.rival}
                            onChange={e => setContexto(p => ({ ...p, rival: e.target.value }))}
                            placeholder="Rival / partido..."
                            className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-orange-500"
                        />
                        <input
                            type="text"
                            value={contexto.torneo}
                            onChange={e => setContexto(p => ({ ...p, torneo: e.target.value }))}
                            placeholder="Torneo / instancia..."
                            className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-orange-500"
                        />
                    </div>

                    <button
                        onClick={() => setMostrarContexto(false)}
                        className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20"
                    >
                        <Zap size={18} /> Comenzar
                    </button>
                </div>
            </div>
        );
    }

    // ── RESULTADO ────────────────────────────────────────────────────────────
    if (resultado) {
        const { C, S, SC, perfil } = resultado;
        const interpC  = interpretarSubescala(C,  'C');
        const interpS  = interpretarSubescala(S,  'S');
        const interpSC = interpretarSubescala(SC, 'SC');

        return (
            <div className="min-h-screen bg-[#0A0F1E] text-white">
                <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                    <div className="container mx-auto px-6 py-4">
                        <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                            <Zap className="text-orange-400" size={18} /> PSMILE <span className="text-orange-400">CSAI-2</span>
                        </span>
                    </div>
                </header>

                <main className="container mx-auto px-4 md:px-8 py-10 max-w-lg pb-24 space-y-6">

                    {/* Perfil general */}
                    <div className="rounded-3xl p-8 text-center border"
                        style={{ borderColor: perfil.color + '40', backgroundColor: perfil.color + '10' }}>
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">Estado precompetitivo</p>
                        <p className="text-2xl font-black uppercase tracking-tight mb-3" style={{ color: perfil.color }}>
                            {perfil.label}
                        </p>
                        <p className="text-sm text-[#9CA3AF] leading-relaxed">{perfil.desc}</p>
                        {contexto.rival && (
                            <p className="text-xs text-[#4B5563] mt-3">{contexto.rival} {contexto.torneo && `· ${contexto.torneo}`}</p>
                        )}
                    </div>

                    {/* Tres subescalas */}
                    {[
                        { label: 'Ansiedad cognitiva', sub: 'C', pts: C, interp: interpC,
                          desc: 'Pensamientos negativos, preocupaciones y dudas antes de competir.' },
                        { label: 'Ansiedad somática', sub: 'S', pts: S, interp: interpS,
                          desc: 'Síntomas físicos: tensión muscular, ritmo cardíaco, manos húmedas.' },
                        { label: 'Autoconfianza', sub: 'SC', pts: SC, interp: interpSC,
                          desc: 'Certeza de poder rendir bien y afrontar el desafío.' },
                    ].map(({ label, pts, interp, desc }) => (
                        <div key={label} className="bg-[#111827] border border-white/5 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase">{label}</p>
                                    <p className="text-xl font-black mt-1" style={{ color: interp.color }}>{interp.label}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black" style={{ color: interp.color }}>{pts}</p>
                                    <p className="text-[10px] text-[#4B5563]">de 36</p>
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                                <div className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${((pts - 9) / 27) * 100}%`, backgroundColor: interp.color }} />
                            </div>
                            <p className="text-xs text-[#6B7280] leading-relaxed">{desc}</p>
                        </div>
                    ))}

                    {/* Nota clínica */}
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-5">
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">Nota para el psicólogo</p>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">
                            Este resultado se cruzará con la evaluación ePsD del partido. Si la ansiedad cognitiva fue alta, revisar Autodiálogo y Control atencional. Si la somática fue alta, revisar Gestión emocional y Autoconfianza en vivo.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/portal/dashboard')}
                        className="w-full py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3"
                    >
                        <Check size={16} /> Volver al Dashboard
                    </button>
                </main>

                {showSuccess && (
                    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex items-center gap-4">
                            <Check size={20} strokeWidth={4} /> ¡Guardado en PSMILE Cloud!
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── TEST ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white">

            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate('/portal/dashboard')}
                        className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Salir
                    </button>
                    <div className="flex items-center gap-2">
                        <Zap className="text-orange-400" size={18} />
                        <span className="text-xs font-black text-white uppercase">
                            PSMILE <span className="text-orange-400">CSAI-2</span>
                        </span>
                    </div>
                    <span className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest">
                        {Object.keys(respuestas).length}/{ITEMS.length}
                    </span>
                </div>
                <div className="h-1 bg-white/5">
                    <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progreso}%` }} />
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-8 py-10 max-w-2xl pb-32">

                {/* Etiqueta de subescala */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dimActual.color }} />
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: dimActual.color }}>
                        {dimActual.label}
                    </p>
                    <div className="h-px flex-1 opacity-20" style={{ backgroundColor: dimActual.color }} />
                    <div className="flex gap-1">
                        {PAGINA_LABELS.map((p, i) => (
                            <div key={i} className="h-1.5 rounded-full transition-all"
                                style={{ width: i === pagina ? '24px' : '8px', backgroundColor: i <= pagina ? p.color : '#1F2937' }} />
                        ))}
                    </div>
                </div>

                {/* Instrucción de escala */}
                <div className="flex gap-2 mb-8 overflow-x-auto">
                    {OPCIONES.map(op => (
                        <div key={op.valor} className="flex-1 text-center py-2 bg-[#111827] border border-white/5 rounded-xl">
                            <p className="text-base font-black text-white">{op.valor}</p>
                            <p className="text-[10px] text-[#4B5563] font-medium">{op.label}</p>
                        </div>
                    ))}
                </div>

                {/* Ítems */}
                <div className="space-y-4">
                    {itemsPagina.map((item, i) => {
                        const idx = inicio + i;
                        const resp = respuestas[idx];
                        return (
                            <div key={idx}
                                className={`bg-[#111827] border rounded-3xl p-6 transition-all ${resp !== undefined ? 'border-orange-500/20' : 'border-white/5 hover:border-white/10'}`}>
                                <div className="flex items-start gap-4 mb-5">
                                    <span className="w-7 h-7 rounded-xl bg-white/5 text-[#4B5563] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm text-white leading-relaxed font-medium">{item.texto}</p>
                                </div>
                                <div className="flex gap-2 pl-11">
                                    {OPCIONES.map(op => (
                                        <button
                                            key={op.valor}
                                            onClick={() => responder(idx, op.valor)}
                                            className={`flex-1 py-3 rounded-2xl text-sm font-black transition-all border ${
                                                resp === op.valor
                                                    ? 'border-orange-500/60 text-orange-300 shadow-lg shadow-orange-500/10'
                                                    : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white hover:bg-white/10'
                                            }`}
                                            style={resp === op.valor ? { backgroundColor: 'rgba(249,115,22,0.2)' } : {}}
                                        >
                                            {op.valor}
                                        </button>
                                    ))}
                                </div>
                                {resp !== undefined && (
                                    <p className="text-[11px] text-[#4B5563] pl-11 mt-2">
                                        {OPCIONES.find(o => o.valor === resp)?.label}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
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
                                if (!todasRespondidas) { alert('Responde todos los ítems antes de continuar.'); return; }
                                setPagina(p => p + 1); window.scrollTo(0, 0);
                            }}
                            disabled={!todasRespondidas}
                            className="flex-1 py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-orange-400 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                        >
                            Siguiente <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={finalizar}
                            disabled={isSaving || Object.keys(respuestas).length < ITEMS.length}
                            className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30"
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
