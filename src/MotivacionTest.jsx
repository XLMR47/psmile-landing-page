import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Zap, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';

// ─── 52 ítems (índice 0-based, ítem 26 del PDF es el nro 27) ─────────────────
const PREGUNTAS = [
    "A pesar del tiempo que estuvo alejado de las competencias, buscará sentirse el favorito para ganar.",
    "Procurará disfrutar del dominio técnico más que pensar en el resultado. El éxito se deriva de un buen trabajo.",
    "En este partido lo arriesgará todo, sin pensar en el tiempo que estuvo alejado ni en las consecuencias de un fracaso.",
    "Aunque se siente muy bien y es una competencia muy importante, considerará que estuvo alejado y será cauteloso, tratando más de evitar un fracaso que lograr un éxito arriesgado.",
    "Decide permanecer en el deporte para intentar la hazaña de pasar a la historia como el único que ha logrado hacer su mejor rendimiento después de una ausencia tan prolongada.",
    "Decide permanecer en el deporte y, aunque resulta posible intentar la hazaña de mejorar su rendimiento, cree que es mejor competir bien y no aspirar por el momento a nada extraordinario.",
    "No le preocupa la ejecución porque practica el deporte esencialmente por placer.",
    "Decide permanecer en el deporte pues lo beneficia en varios aspectos de su vida que son relevantes para él.",
    "Se afianzará en la fama que volverá a tener con una participación victoriosa.",
    "Buscará, sobre todo, rescatar su liderazgo técnico.",
    "Intentará demostrarles a sus detractores que estaban equivocados. Podrá vengarse de quienes dudaron de él.",
    "La repercusión que su éxito puede tener para su equipo será su mayor motivación.",
    "Ganar la competencia le reportará beneficios y mejoraría su nivel de vida personal y familiar.",
    "Buscará con su actuación en esa competencia el reconocimiento de todos.",
    "No se propone ganar esa competencia, no es el momento para ello.",
    "Lo que más aprecia de la ocasión es volver a sentirse en ambiente competitivo, disfrutar de lo que más le gusta de su deporte.",
    "Lo que más aprecia de la ocasión es la oportunidad de rescatar su popularidad y el nivel de vida de un gran jugador.",
    "Piensa en todas las necesidades que pudiera satisfacer al obtener una victoria.",
    "Persigue volver a ser quien era y gozar del respeto de los demás.",
    "Busca la satisfacción de sí mismo y el rescate de su autoestima con su retorno.",
    "Se propone ganar para mostrar su victoria a quienes lo creen sin posibilidades.",
    "Se inspira sobre todo en la significación social y patriótica de su actuación.",
    "Piensa que la posibilidad de una derrota está presente debido al tiempo que estuvo alejado, y no se propone una victoria inmediata.",
    "Prevalece en su mente la realización de movimientos técnicos limpios y elegantes.",
    "En el transcurso de la competencia se apoyará fuertemente en la seguridad de que los problemas quedaron atrás y buscará la victoria a toda costa.",
    "En su mente sólo existe la posibilidad de la victoria y su único objetivo es ganar el partido.",
    "Más que pensar en un resultado, su objetivo será lograr el mejor grado de perfección en sus ejecuciones.",
    "La convicción de que la victoria es el único resultado posible lo motiva. Nada lo alejará del objetivo de ganar.",
    "Será prudente y no pondrá en peligro su recuperación física. No es el momento oportuno para arriesgarlo todo por una victoria.",
    "Pretenderá lograr un resultado histórico como cierre de una etapa de esfuerzo máximo y perfeccionamiento en su especialidad.",
    "Considerará que es suficiente un buen resultado sin grandes pretensiones, que demuestre que aún se puede contar con él.",
    "Siente que el disfrute de competir y de hacer el mayor esfuerzo es lo que más lo motiva en esta oportunidad, sin pensar en otros beneficios.",
    "Lo estimula volver a competir y ganar, pues le permitirá mantener todos los beneficios de ser un campeón.",
    "Lo que representa un estímulo para él es el reconocimiento y la admiración de las personas que lo ven retornar a la competición.",
    "Lo más importante para él es volver a sentirse seguro de sí mismo y con dominio para lograr sus objetivos y metas.",
    "Las recompensas materiales que obtendría mediante un buen resultado constituyen la fuente que lo impulsa a competir bien.",
    "Hacer desaparecer toda duda y desconfianza en sus capacidades en los demás, constituye algo de mucha importancia.",
    "Contribuir con su resultado a una buena posición de su delegación en la lucha por países es su motor impulsor.",
    "El deportista persigue el éxito, sin atender de manera especial las acciones técnicas que deben conducirlo a él.",
    "Más que ganar, lo que desea al competir es sentirse capaz de lograr un alto grado de perfección en su actuación.",
    "Competirá sin escatimar esfuerzos ni energías en pos de la victoria. No contempla la posibilidad de perder.",
    "Durante la competencia piensa en la posibilidad de un fracaso y puede ser cauteloso al tomar decisiones.",
    "Es más importante para él buscar una maestría técnica por el momento.",
    "Teniendo en cuenta las lesiones anteriores, considera que debe esperar a futuras competencias para lograr un resultado exitoso.",
    "Disfrutar de la práctica deportiva y sentir nuevamente las emociones competitivas es suficiente para él.",
    "Su status deportivo le reporta satisfacciones extras que le interesa mantener, por lo que esta competencia será una oportunidad.",
    "El reconocimiento nacional e internacional que puede alcanzar con una victoria después de la prolongada ausencia será lo que más lo impulse.",
    "En su mente siempre está la idea de mantenerse como figura estelar y ser visto como referencia en el deporte.",
    "Mantener el estatus de vida que ha alcanzado con su exitosa carrera, es lo que lo estimula a recuperar su nivel deportivo.",
    "El orgullo de mantener una posición cimera dentro del ranking de su especialidad lo motiva de manera especial.",
    "Piensa sobre todo en la importancia de su victoria para sus compañeros de equipo, entrenadores y colectivo.",
];

// ─── 13 dimensiones motivacionales (ítems en índice 0-based) ─────────────────
const DIMENSIONES = [
    { id: 'logro',            label: 'Motivación de logro',              items: [4,13,30,43],  color: '#39FF14', descripcion: 'Búsqueda de excelencia y metas significativas.' },
    { id: 'no_logro',         label: 'No motivación de logro',           items: [5,14,31,44],  color: '#EF4444', descripcion: 'Preferencia por actividades sin grandes pretensiones.' },
    { id: 'intrinseca',       label: 'Motivación intrínseca',            items: [6,15,32,45],  color: '#A855F7', descripcion: 'Practica el deporte por placer y satisfacción personal.' },
    { id: 'extrinseca',       label: 'Motivación extrínseca',            items: [7,16,33,46],  color: '#F97316', descripcion: 'Motivado por recompensas y beneficios externos.' },
    { id: 'exp_exito',        label: 'Expectativa de éxito',             items: [0,22,26,39],  color: '#38BDF8', descripcion: 'Certeza subjetiva de que obtendrá el éxito.' },
    { id: 'exp_eficacia',     label: 'Expectativa de eficacia',          items: [1,23,27,40],  color: '#0070F3', descripcion: 'Confianza en el dominio técnico como vía al éxito.' },
    { id: 'aprox_exito',      label: 'Motivo por aproximarse al éxito',  items: [2,24,28,41],  color: '#22C55E', descripcion: 'Entrega total al objetivo sin contemplar el fracaso.' },
    { id: 'evit_fracaso',     label: 'Motivo por evitar el fracaso',     items: [3,25,29,42],  color: '#EAB308', descripcion: 'Conducta cautelosa dirigida a evitar el fracaso.' },
    { id: 'materiales',       label: 'Motivos materiales',               items: [12,17,36,49], color: '#F59E0B', descripcion: 'Motivado por beneficios económicos y materiales.' },
    { id: 'reconocimiento',   label: 'Motivos de reconocimiento',        items: [8,18,34,47],  color: '#EC4899', descripcion: 'Búsqueda de admiración y respeto.' },
    { id: 'autoafirm_dep',    label: 'Autoafirmación deportiva',         items: [9,19,37,48],  color: '#6366F1', descripcion: 'Mantener liderazgo y posición dentro del deporte.' },
    { id: 'autoafirm_pers',   label: 'Autoafirmación personológica',     items: [10,20,35,50], color: '#8B5CF6', descripcion: 'Usar la victoria para sostener la autoestima.' },
    { id: 'supraindividual',  label: 'Motivos supraindividuales',        items: [11,21,38,51], color: '#14B8A6', descripcion: 'Sentido de pertenencia colectiva y representatividad.' },
];

// Etiqueta por puntaje 0-4
function etiqueta(pts) {
    if (pts === 0) return { label: 'Nula',     color: '#4B5563' };
    if (pts === 1) return { label: 'Baja',     color: '#EF4444' };
    if (pts === 2) return { label: 'Media',    color: '#EAB308' };
    if (pts === 3) return { label: 'Alta',     color: '#22C55E' };
    return             { label: 'Muy alta',  color: '#39FF14' };
}

const PREGUNTAS_POR_PAGINA = 10;
const TOTAL_PAGINAS = Math.ceil(PREGUNTAS.length / PREGUNTAS_POR_PAGINA);

export default function MotivacionTest() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [respuestas, setRespuestas] = useState({});
    const [pagina, setPagina] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const g = localStorage.getItem('motivacion_respuestas');
        if (g) setRespuestas(JSON.parse(g));
    }, []);

    useEffect(() => {
        localStorage.setItem('motivacion_respuestas', JSON.stringify(respuestas));
    }, [respuestas]);

    const responder = (idx, valor) => setRespuestas(prev => ({ ...prev, [idx]: valor }));

    const inicio = pagina * PREGUNTAS_POR_PAGINA;
    const fin = Math.min(inicio + PREGUNTAS_POR_PAGINA, PREGUNTAS.length);
    const preguntasPagina = PREGUNTAS.slice(inicio, fin);
    const todasRespondidas = preguntasPagina.every((_, i) => respuestas[inicio + i] !== undefined);
    const progreso = (Object.keys(respuestas).length / PREGUNTAS.length) * 100;

    function calcularPuntajes() {
        return DIMENSIONES.map(dim => {
            const pts = dim.items.filter(i => respuestas[i] === true).length;
            return { ...dim, puntaje: pts, etiqueta: etiqueta(pts) };
        });
    }

    const finalizar = async () => {
        if (Object.keys(respuestas).length < PREGUNTAS.length) {
            alert('Por favor responde todas las preguntas antes de finalizar.');
            return;
        }

        const puntajes = calcularPuntajes();
        setResultado(puntajes);

        setIsSaving(true);
        try {
            // Construir interpretación resumida
            const fortalezas = puntajes.filter(d => d.puntaje >= 3).map(d => d.label).join(', ');
            const debilidades = puntajes.filter(d => d.puntaje <= 1).map(d => d.label).join(', ');

            const puntajesMap = {};
            puntajes.forEach(d => { puntajesMap[d.id] = d.puntaje; });

            await addDoc(collection(db, 'evaluaciones_psicometricas'), {
                jugadorId: currentUser?.uid || 'desconocido',
                nombreJugador: currentUser?.displayName || currentUser?.email || '',
                evaluador: 'self',
                fecha: new Date().toISOString().split('T')[0],
                instrumento: {
                    id: 'motivacion',
                    nombre: 'Cuestionario de Cualidades Motivacionales Deportivas (González, 2000)',
                    tipo: 'digital',
                },
                dimension: 'EMOCIONAL',
                puntajes: puntajesMap,
                nivel: puntajes.find(d => d.id === 'intrinseca')?.etiqueta.label || 'Sin datos',
                interpretacion: `Fortalezas motivacionales: ${fortalezas || 'Ninguna destacada'}. Áreas débiles: ${debilidades || 'Ninguna'}. Motivación intrínseca: ${puntajes.find(d=>d.id==='intrinseca')?.etiqueta.label}. Motivación de logro: ${puntajes.find(d=>d.id==='logro')?.etiqueta.label}.`,
                recomendacion: '',
                respuestasRaw: respuestas,
                timestamp: serverTimestamp(),
            });

            localStorage.removeItem('motivacion_respuestas');
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Vista de resultado ────────────────────────────────────────────────────
    if (resultado) {
        const topDim = [...resultado].sort((a, b) => b.puntaje - a.puntaje).slice(0, 3);

        return (
            <div className="min-h-screen bg-[#0A0F1E] text-white">
                <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <span className="text-xs font-black text-white tracking-tight uppercase flex items-center gap-2">
                            <Zap className="text-[#39FF14]" size={18} /> PSMILE <span className="text-[#39FF14]">MOTIVACIÓN</span>
                        </span>
                    </div>
                </header>

                <main className="container mx-auto px-4 md:px-8 py-10 max-w-2xl pb-24">

                    {/* Título */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#39FF14]/30 to-[#0070F3]/30 border border-[#39FF14]/30 flex items-center justify-center mx-auto mb-6">
                            <Zap className="text-[#39FF14] w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Tu perfil motivacional</h1>
                        <p className="text-[#6B7280] text-sm">Cuestionario de Cualidades Motivacionales Deportivas</p>
                    </div>

                    {/* Top 3 motivaciones */}
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 mb-6">
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-5">Motivaciones dominantes</p>
                        <div className="space-y-4">
                            {topDim.map((dim, i) => (
                                <div key={dim.id} className="flex items-center gap-4">
                                    <span className="w-7 h-7 rounded-xl text-[11px] font-black flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: dim.color + '20', color: dim.color }}>
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-white">{dim.label}</p>
                                            <span className="text-xs font-black" style={{ color: dim.etiqueta.color }}>
                                                {dim.etiqueta.label}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${(dim.puntaje / 4) * 100}%`, backgroundColor: dim.color }} />
                                        </div>
                                        <p className="text-[11px] text-[#4B5563] mt-1">{dim.descripcion}</p>
                                    </div>
                                    <span className="text-2xl font-black" style={{ color: dim.color }}>{dim.puntaje}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Todas las dimensiones */}
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 mb-6">
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-5">Perfil completo</p>
                        <div className="space-y-3">
                            {resultado.map(dim => (
                                <div key={dim.id} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dim.color }} />
                                    <p className="text-xs text-[#9CA3AF] flex-1">{dim.label}</p>
                                    <div className="flex gap-1">
                                        {[0,1,2,3,4].map(v => (
                                            <div key={v} className="w-5 h-5 rounded-md"
                                                style={{ backgroundColor: v < dim.puntaje ? dim.color : '#1F2937' }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-black w-16 text-right" style={{ color: dim.etiqueta.color }}>
                                        {dim.etiqueta.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/portal/dashboard')}
                        className="w-full py-4 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/30 text-[#39FF14] rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3"
                    >
                        <Check size={16} /> Volver al Dashboard
                    </button>
                </main>

                {showSuccess && (
                    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex items-center gap-4">
                            <Check size={20} strokeWidth={4} /> ¡Guardado en PSMILE Cloud!
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Vista del test ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white">

            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate('/portal/dashboard')} className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Salir
                    </button>
                    <div className="flex items-center gap-2">
                        <Zap className="text-[#39FF14]" size={18} />
                        <span className="text-xs font-black text-white uppercase">PSMILE <span className="text-[#39FF14]">Motivación</span></span>
                    </div>
                    <span className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest">
                        {Object.keys(respuestas).length}/{PREGUNTAS.length}
                    </span>
                </div>
                <div className="h-1 bg-white/5">
                    <div className="h-full bg-[#39FF14] transition-all duration-300" style={{ width: `${progreso}%` }} />
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-8 py-10 max-w-2xl pb-32">

                {/* Narración del escenario (solo página 0) */}
                {pagina === 0 && (
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-7 mb-8">
                        <p className="text-[10px] font-black tracking-widest text-[#39FF14] uppercase mb-4">Lee este escenario</p>
                        <p className="text-sm text-[#9CA3AF] leading-relaxed">
                            "Un futbolista de excelentes condiciones y prestigio enfrenta las consecuencias de una lesión que amenaza seriamente su destacada carrera deportiva. Durante más de un año se ve alejado de las competencias y, por lo complejo de su posición, muchos empiezan a dudar de su regreso exitoso.
                        </p>
                        <p className="text-sm text-[#9CA3AF] leading-relaxed mt-3">
                            Con enormes sacrificios y gran voluntad supera las limitaciones físicas y las barreras subjetivas. Poco a poco comienza a rescatar el dominio técnico y, por fin, ante un partido de gran importancia, <strong className="text-white">se siente en condiciones de reeditar sus mejores rendimientos."</strong>
                        </p>
                        <p className="text-xs text-[#4B5563] mt-4 font-medium">
                            Responde SI o NO a cada reacción imaginando que <strong className="text-[#6B7280]">eres tú</strong> ese deportista.
                        </p>
                    </div>
                )}

                {/* Indicador de página */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black tracking-widest text-[#4B5563] uppercase">
                        Ítems {inicio + 1}–{fin} de {PREGUNTAS.length}
                    </p>
                    <div className="flex gap-1">
                        {Array.from({ length: TOTAL_PAGINAS }).map((_, i) => (
                            <div key={i} className="h-1.5 rounded-full transition-all"
                                style={{ width: i === pagina ? '24px' : '6px', backgroundColor: i <= pagina ? '#39FF14' : '#1F2937' }}
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
                            <div key={idx} className={`bg-[#111827] border rounded-3xl p-6 transition-all ${resp !== undefined ? 'border-[#39FF14]/20' : 'border-white/5 hover:border-white/10'}`}>
                                <div className="flex items-start gap-4 mb-5">
                                    <span className="w-7 h-7 rounded-xl bg-white/5 text-[#4B5563] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm text-white leading-relaxed font-medium">{pregunta}</p>
                                </div>
                                <div className="flex gap-3 pl-11">
                                    <button
                                        onClick={() => responder(idx, true)}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${resp === true ? 'bg-[#39FF14]/20 border-[#39FF14]/60 text-[#39FF14] shadow-lg shadow-[#39FF14]/10' : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white hover:bg-white/10'}`}
                                    >
                                        Sí
                                    </button>
                                    <button
                                        onClick={() => responder(idx, false)}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${resp === false ? 'bg-[#0070F3]/20 border-[#0070F3]/60 text-blue-300 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white hover:bg-white/10'}`}
                                    >
                                        No
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
                        <button onClick={() => { setPagina(p => p - 1); window.scrollTo(0,0); }}
                            className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 text-[#6B7280]">
                            <ArrowLeft size={14} /> Anterior
                        </button>
                    )}
                    {pagina < TOTAL_PAGINAS - 1 ? (
                        <button
                            onClick={() => {
                                if (!todasRespondidas) { alert('Responde todas las preguntas de esta página antes de continuar.'); return; }
                                setPagina(p => p + 1); window.scrollTo(0,0);
                            }}
                            disabled={!todasRespondidas}
                            className="flex-1 py-4 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/30 disabled:opacity-40 disabled:cursor-not-allowed text-[#39FF14] rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                        >
                            Siguiente <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={finalizar}
                            disabled={isSaving || Object.keys(respuestas).length < PREGUNTAS.length}
                            className="flex-1 py-4 bg-[#39FF14] hover:bg-[#2de010] disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#39FF14]/30"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Ver mi perfil motivacional
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
