import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Check, Activity, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getUserConfig } from './academyConfig';

// Datos completos del instrumento ePsD
const ESTRUCTURA_EPSD = {
    "COGNITIVO": {
        "Percepción del entorno": [
            "Escanea el campo antes de recibir, buscando información.",
            "Anticipa jugadas y reacciones del rival."
        ],
        "Toma de decisiones": [
            "Toma decisiones acordes al contexto y ritmo del juego.",
            "Corrige errores y ajusta decisiones posteriores de forma consciente."
        ],
        "Control atencional": [
            "Mantiene atención sostenida durante el juego.",
            "Se recupera rápidamente de distracciones o errores, reenfocando su atención.",
            "Mantiene precisión mental en momentos clave del partido."
        ]
    },
    "EMOCIONAL": {
        "Gestión emocional": [
            "Mantiene control emocional ante errores o decisiones arbitrales.",
            "Transforma emociones intensas en comportamientos útiles y funcionales."
        ],
        "Autodiálogo y enfoque mental": [
            "Celebra acciones defensivas u ofensivas como refuerzo emocional positivo.",
            "Usa autoinstrucciones o gestos para reenfocar su mente tras errores o distracciones.",
            "Evita expresiones o autodiálogo negativo que afecten su desempeño."
        ],
        "Autoconfianza y resiliencia": [
            "Mantiene seguridad y energía en contextos adversos.",
            "Persevera tras fallos, manteniendo una actitud estable y optimista.",
            "Se muestra disponible y asume responsabilidad en momentos críticos."
        ]
    },
    "CONDUCTUAL-SOCIAL": {
        "Comunicación emocional": [
            "Se comunica de forma asertiva y respetuosa (gestos, voz o señas).",
            "Usa la comunicación para regular el ambiente emocional del equipo."
        ],
        "Vínculo y cohesión": [
            "Apoya y respalda emocionalmente a sus compañeros.",
            "Celebra y comparte logros colectivos con expresividad positiva."
        ],
        "Liderazgo emocional": [
            "Mantiene serenidad y transmite calma en momentos de presión o conflicto.",
            "Modela comportamientos de autocontrol, respeto y compromiso."
        ]
    }
};

const NOMBRES_DOMINIOS = {
    "COGNITIVO": "Cognitivo",
    "EMOCIONAL": "Emocional",
    "CONDUCTUAL-SOCIAL": "Conductual-Social"
};

const INTERVALOS = ["0-25", "26-45", "45-70", "71-90"];
const POSICIONES = ["ARQ", "DEF", "MC", "DL"];

const DEFAULT_WEIGHT_CONFIG = {
    "ARQ": {
        "Percepción del entorno": 10, "Toma de decisiones": 10, "Control atencional": 20,
        "Gestión emocional": 15, "Autodiálogo y enfoque mental": 10, "Autoconfianza y resiliencia": 15,
        "Comunicación emocional": 12, "Vínculo y cohesión": 3, "Liderazgo emocional": 5
    },
    "DEF": {
        "Percepción del entorno": 18, "Toma de decisiones": 12, "Control atencional": 15,
        "Gestión emocional": 8, "Autodiálogo y enfoque mental": 10, "Autoconfianza y resiliencia": 12,
        "Comunicación emocional": 15, "Vínculo y cohesión": 5, "Liderazgo emocional": 5
    },
    "MC": {
        "Percepción del entorno": 22, "Toma de decisiones": 20, "Control atencional": 10,
        "Gestión emocional": 8, "Autodiálogo y enfoque mental": 10, "Autoconfianza y resiliencia": 10,
        "Comunicación emocional": 8, "Vínculo y cohesión": 7, "Liderazgo emocional": 5
    },
    "DL": {
        "Percepción del entorno": 12, "Toma de decisiones": 18, "Control atencional": 10,
        "Gestión emocional": 10, "Autodiálogo y enfoque mental": 15, "Autoconfianza y resiliencia": 20,
        "Comunicación emocional": 5, "Vínculo y cohesión": 5, "Liderazgo emocional": 5
    }
};

export default function EpsdLite() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig?.role === 'admin';
    const isSuperAdmin = isAdmin && userConfig.academiaId === null;

    const [jugadorId, setJugadorId] = useState('');
    const [jugadorManual, setJugadorManual] = useState({
        nombre: '',
        rival: '',
        torneo: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    const [listaJugadores, setListaJugadores] = useState([]);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
    const [dominioActivo, setDominioActivo] = useState('COGNITIVO');
    const [respuestas, setRespuestas] = useState({});
    const [guardadoAutomatico, setGuardadoAutomatico] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [posicionSeleccionada, setPosicionSeleccionada] = useState('MC');
    const [configWeights, setConfigWeights] = useState(DEFAULT_WEIGHT_CONFIG);
    const [editConfig, setEditConfig] = useState(false);

    useEffect(() => {
        if (!isSuperAdmin) {
            navigate('/portal/dashboard');
            return;
        }
        if (!currentUser) return;
        const fetchPlayers = async () => {
            setIsLoadingPlayers(true);
            try {
                const q = query(collection(db, 'jugadores'));
                const snapshot = await getDocs(q);
                let pList = snapshot.docs.map(d => ({ 
                    id: d.id, 
                    nombre: d.data().nombre || 'Sin nombre', 
                    academia: d.data().academiaId || 'Sin academia',
                    tipo: d.data().tipo
                }));
                pList = pList.filter(p => !p.tipo || p.tipo === 'jugador');
                pList.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
                setListaJugadores(pList);
            } catch (err) {
                console.error("Error fetching players:", err);
            } finally {
                setIsLoadingPlayers(false);
            }
        };
        fetchPlayers();

        const datosGuardados = localStorage.getItem('epsd_evaluacion');
        if (datosGuardados) {
            try {
                const datos = JSON.parse(datosGuardados);
                if (datos.jugadorId) setJugadorId(datos.jugadorId);
                if (datos.jugadorManual) setJugadorManual(datos.jugadorManual);
                setRespuestas(datos.respuestas || {});
            } catch (e) { console.error(e); }
        }
    }, [isAdmin, currentUser]);

    useEffect(() => {
        const interval = setInterval(() => {
            localStorage.setItem('epsd_evaluacion', JSON.stringify({
                jugadorId, jugadorManual, respuestas, ultimaActualizacion: new Date().toISOString()
            }));
            setGuardadoAutomatico(true);
            setTimeout(() => setGuardadoAutomatico(false), 2000);
        }, 30000);
        return () => clearInterval(interval);
    }, [jugadorId, jugadorManual, respuestas]);

    const actualizarRespuestaIntervalo = (dominio, subescala, conductaIndex, intervalo, campo, valor) => {
        const key = `${dominio}-${subescala}-${conductaIndex}`;
        setRespuestas(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [intervalo]: {
                    ...(prev[key]?.[intervalo] || { frecuencia: 0, nivel: null }),
                    [campo]: valor
                }
            }
        }));
    };

    const actualizarObservacion = (dominio, subescala, conductaIndex, valor) => {
        const key = `${dominio}-${subescala}-${conductaIndex}`;
        setRespuestas(prev => ({ ...prev, [key]: { ...prev[key], observaciones: valor } }));
    };

    const getRespuestaIntervalo = (dominio, subescala, conductaIndex, intervalo, campo) => {
        const key = `${dominio}-${subescala}-${conductaIndex}`;
        const data = respuestas[key]?.[intervalo];
        if (campo === 'frecuencia') return data?.frecuencia || 0;
        if (campo === 'nivel') return data?.nivel || null;
        return null;
    };

    const getObservacion = (dominio, subescala, conductaIndex) => {
        const key = `${dominio}-${subescala}-${conductaIndex}`;
        return respuestas[key]?.observaciones || '';
    };

    const calcularTotales = (dominio, subescala, conductaIndex) => {
        const key = `${dominio}-${subescala}-${conductaIndex}`;
        const data = respuestas[key] || {};
        let totalFrecuencia = 0, sumaNiveles = 0, contNiveles = 0;
        INTERVALOS.forEach(int => {
            if (data[int]) {
                totalFrecuencia += data[int].frecuencia || 0;
                if (data[int].nivel) { sumaNiveles += data[int].nivel; contNiveles++; }
            }
        });
        return { totalFrecuencia, promedioNivel: contNiveles > 0 ? (sumaNiveles / contNiveles).toFixed(1) : '-' };
    };

    const borrarTodo = () => {
        localStorage.removeItem('epsd_evaluacion');
        setJugadorId('');
        setJugadorManual({ nombre: '', rival: '', torneo: '', fecha: new Date().toISOString().split('T')[0] });
        setRespuestas({});
        setShowConfirmReset(false);
    };

    const finalizarEvaluacion = async () => {
        if (!jugadorId || (jugadorId === 'manual' && !jugadorManual.nombre)) {
            alert('Por favor completa los datos del jugador.');
            return;
        }

        setIsSaving(true);
        try {
            let nombreFinal = '', academiaFinal = 'Manual / Externo';
            if (jugadorId === 'manual') {
                nombreFinal = jugadorManual.nombre;
            } else {
                const player = listaJugadores.find(p => p.id === jugadorId);
                nombreFinal = player?.nombre || 'Desconocido';
                academiaFinal = player?.academia || 'Sin academia';
            }

            const dataToSave = {
                jugadorId,
                nombreJugador: nombreFinal,
                academiaId: academiaFinal,
                evaluador: currentUser?.email,
                posicion: posicionSeleccionada,
                configWeights: configWeights[posicionSeleccionada],
                contexto: jugadorManual,
                respuestas,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, 'evaluaciones_epsd'), dataToSave);
            setShowSuccess(true);
            localStorage.removeItem('epsd_evaluacion'); 
            setTimeout(() => {
                setShowSuccess(false);
                navigate('/portal/dashboard');
            }, 3000);
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white selection:bg-[#0070F3]/30">
            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate('/portal/dashboard')} className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Volver
                    </button>
                    <div className="flex items-center gap-2">
                        <Activity className="text-[#39FF14]" size={18} />
                        <span className="text-xs font-black text-white tracking-tight uppercase">PSMILE <span className="text-[#39FF14]">EPSD ELITE</span></span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl pb-24">
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 mb-8 flex items-center justify-between flex-wrap gap-6 shadow-2xl">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0070F3] to-[#39FF14] flex items-center justify-center shadow-xl shadow-[#0070F3]/20">
                            <Activity className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Evaluación en Vivo</h1>
                            <p className="text-[#6B7280] text-sm mt-0.5 font-medium">Registro psicoperformático por intervalos</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {guardadoAutomatico && <span className="text-[10px] text-[#39FF14] font-black tracking-widest uppercase animate-pulse bg-[#39FF14]/10 px-3 py-1.5 rounded-full border border-[#39FF14]/20">Sincronizando...</span>}
                        <button onClick={() => setShowConfirmReset(true)} className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-2xl text-[#6B7280] transition-all border border-transparent hover:border-red-500/20"><Trash2 size={20} /></button>
                        <button onClick={finalizarEvaluacion} disabled={isSaving} className="px-8 py-3.5 bg-[#0070F3] hover:bg-[#0060D0] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-[#0070F3]/30 flex items-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50">
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Finalizar Análisis
                        </button>
                    </div>
                </div>

                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 mb-8 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] mb-3 uppercase">Jugador</label>
                            <select value={jugadorId} onChange={(e) => setJugadorId(e.target.value)} className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#0070F3] transition-all mb-3 text-sm">
                                <option value="">--- Selección ---</option>
                                <option value="manual">Ingreso Manual (+)</option>
                                {listaJugadores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                            {jugadorId === 'manual' && <input type="text" value={jugadorManual.nombre} onChange={(e) => setJugadorManual(prev => ({...prev, nombre: e.target.value}))} className="w-full bg-[#0070F3]/5 border border-[#0070F3]/30 rounded-2xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#0070F3] text-sm" placeholder="Nombre completo..." />}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] mb-3 uppercase">Posición / Config</label>
                            <div className="flex gap-2">
                                <select value={posicionSeleccionada} onChange={(e) => setPosicionSeleccionada(e.target.value)} className="flex-1 bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#0070F3] text-sm">
                                    {POSICIONES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <button onClick={() => setEditConfig(!editConfig)} className={`p-3 rounded-2xl transition-all border ${editConfig ? 'bg-[#39FF14]/10 border-[#39FF14]/40 text-[#39FF14]' : 'bg-white/5 border-white/10 text-white/40'}`}>🛠️</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] mb-3 uppercase">Escenario (Rival / Torneo)</label>
                            <div className="space-y-3">
                                <input type="text" value={jugadorManual.rival} onChange={(e) => setJugadorManual(prev => ({...prev, rival: e.target.value}))} className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#0070F3]" placeholder="Ej: vs CD Universitario" />
                                <input type="text" value={jugadorManual.torneo} onChange={(e) => setJugadorManual(prev => ({...prev, torneo: e.target.value}))} className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#0070F3]" placeholder="Ej: Apertura - Semifinal" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] mb-3 uppercase">Fecha de Sesión</label>
                            <input type="date" value={jugadorManual.fecha} onChange={(e) => setJugadorManual(prev => ({...prev, fecha: e.target.value}))} className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#0070F3] [color-scheme:dark]" />
                        </div>
                    </div>

                    {editConfig && (
                        <div className="mt-8 p-8 bg-[#0070F3]/5 border border-[#0070F3]/20 rounded-3xl animate-in zoom-in-95">
                            <h3 className="text-xs font-black tracking-widest uppercase text-white mb-6">Ajuste de Pesos por Subescala ({posicionSeleccionada})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {Object.keys(configWeights[posicionSeleccionada]).map(sub => (
                                    <div key={sub} className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <label className="block text-[9px] text-[#6B7280] uppercase mb-2 truncate">{sub}</label>
                                        <input type="number" value={configWeights[posicionSeleccionada][sub]} onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            setConfigWeights(prev => ({ ...prev, [posicionSeleccionada]: { ...prev[posicionSeleccionada], [sub]: val } }));
                                        }} className="w-full bg-transparent border-b border-white/20 text-sm py-1 outline-none focus:border-[#0070F3]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="flex bg-[#0A0F1E] border-b border-white/5 p-2 gap-2 overflow-x-auto">
                        {Object.keys(ESTRUCTURA_EPSD).map(dominio => (
                            <button key={dominio} onClick={() => setDominioActivo(dominio)} className={`px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl ${dominioActivo === dominio ? 'bg-[#0070F3] text-white shadow-lg shadow-[#0070F3]/20' : 'text-[#6B7280] hover:text-white hover:bg-white/5'}`}>{NOMBRES_DOMINIOS[dominio]}</button>
                        ))}
                    </div>

                    <div className="p-8">
                        <div className="space-y-12">
                            {Object.entries(ESTRUCTURA_EPSD[dominioActivo]).map(([subescala, conductas]) => (
                                <div key={subescala}>
                                    <div className="flex items-center gap-4 mb-8">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{subescala}</h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        {conductas.map((conducta, idx) => {
                                            const { totalFrecuencia, promedioNivel } = calcularTotales(dominioActivo, subescala, idx);
                                            return (
                                                <div key={idx} className="bg-[#0A0F1E]/50 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
                                                    <h4 className="text-base text-white font-bold mb-6 leading-relaxed flex items-start gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#0070F3]/20 text-[#0070F3] text-[10px] flex items-center justify-center shrink-0 mt-1">{idx+1}</span>
                                                        {conducta}
                                                    </h4>
                                                    <div className="overflow-x-auto bg-[#0A0F1E] rounded-2xl border border-white/5 mb-6">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-[#4B5563]">
                                                                    <th className="p-4 text-left">Periodo</th>
                                                                    <th className="p-4 text-center">Frecuencia</th>
                                                                    <th className="p-4 text-center">Nivel (1-5)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {INTERVALOS.map(int => (
                                                                    <tr key={int}>
                                                                        <td className="p-4"><span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-[#0070F3]">{int}'</span></td>
                                                                        <td className="p-4">
                                                                            <div className="flex items-center justify-center gap-4">
                                                                                <button onClick={() => {
                                                                                    const c = getRespuestaIntervalo(dominioActivo, subescala, idx, int, 'frecuencia');
                                                                                    if (c > 0) actualizarRespuestaIntervalo(dominioActivo, subescala, idx, int, 'frecuencia', c - 1);
                                                                                }} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-white/40">−</button>
                                                                                <span className="w-6 text-center font-black text-lg">{getRespuestaIntervalo(dominioActivo, subescala, idx, int, 'frecuencia')}</span>
                                                                                <button onClick={() => {
                                                                                    const c = getRespuestaIntervalo(dominioActivo, subescala, idx, int, 'frecuencia');
                                                                                    actualizarRespuestaIntervalo(dominioActivo, subescala, idx, int, 'frecuencia', c + 1);
                                                                                }} className="w-8 h-8 rounded-xl bg-[#0070F3]/20 text-[#0070F3] hover:bg-[#0070F3] hover:text-white flex items-center justify-center transition-all shadow-lg shadow-[#0070F3]/10">+</button>
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-4">
                                                                            <div className="flex items-center justify-center gap-1.5">
                                                                                {[1,2,3,4,5].map(v => (
                                                                                    <button key={v} onClick={() => actualizarRespuestaIntervalo(dominioActivo, subescala, idx, int, 'nivel', v)} className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${getRespuestaIntervalo(dominioActivo, subescala, idx, int, 'nivel') === v ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20' : 'bg-white/5 text-[#4B5563] hover:text-white'}`}>{v}</button>
                                                                                ))}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6">
                                                        <input type="text" value={getObservacion(dominioActivo, subescala, idx)} onChange={(e) => actualizarObservacion(dominioActivo, subescala, idx, e.target.value)} className="flex-1 bg-[#0A0F1E] border border-white/5 rounded-2xl px-5 py-3 text-xs text-white placeholder-white/10 outline-none focus:border-[#0070F3]" placeholder="Anotaciones de contexto psicológico..." />
                                                        <div className="flex gap-4">
                                                            <div className="text-right">
                                                                <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-[0.2em] mb-1">Freq Total</p>
                                                                <p className="text-[#39FF14] font-black text-lg">{totalFrecuencia}</p>
                                                            </div>
                                                            <div className="text-right border-l border-white/5 pl-4">
                                                                <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-[0.2em] mb-1">Prom. Nivel</p>
                                                                <p className="text-[#0070F3] font-black text-lg">{promedioNivel}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {showConfirmReset && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-[#111827] border border-red-500/20 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner"><Trash2 className="text-red-400" size={40} /></div>
                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">¿Limpiar Sesión?</h3>
                        <p className="text-[#6B7280] text-sm mb-10 leading-relaxed font-medium">Esta acción eliminará todos los registros actuales de este dispositivo. No se podrá revertir.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowConfirmReset(false)} className="flex-1 px-6 py-4 bg-[#1F2937] hover:bg-[#374151] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Cancelar</button>
                            <button onClick={borrarTodo} className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-red-500/20">Reiniciar</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-[#39FF14]/40 flex items-center gap-4">
                        <Check size={20} strokeWidth={4} /> ¡Sincronizado con PSMILE Cloud!
                    </div>
                </div>
            )}
        </div>
    );
}
