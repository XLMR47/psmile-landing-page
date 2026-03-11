import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Check, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function EpsdLite() {
    const navigate = useNavigate();
    
    const [jugador, setJugador] = useState({
        nombre: '',
        rival: '',
        torneo: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    const [dominioActivo, setDominioActivo] = useState('COGNITIVO');
    const [respuestas, setRespuestas] = useState({});
    const [guardadoAutomatico, setGuardadoAutomatico] = useState(false);

    // Cargar datos del localStorage al iniciar
    useEffect(() => {
        const datosGuardados = localStorage.getItem('epsd_evaluacion');
        if (datosGuardados) {
            try {
                const datos = JSON.parse(datosGuardados);
                setJugador(datos.jugador || jugador);
                setRespuestas(datos.respuestas || {});
            } catch (e) {
                console.error("Error parsing localstorage", e);
            }
        }
    }, []); // eslint-disable-line

    // Guardar automáticamente cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            guardarDatos();
            setGuardadoAutomatico(true);
            setTimeout(() => setGuardadoAutomatico(false), 2000);
        }, 30000);

        return () => clearInterval(interval);
    }, [jugador, respuestas]); // eslint-disable-line

    const guardarDatos = () => {
        localStorage.setItem('epsd_evaluacion', JSON.stringify({
            jugador,
            respuestas,
            ultimaActualizacion: new Date().toISOString()
        }));
    };

    const actualizarJugador = (campo, valor) => {
        setJugador(prev => ({ ...prev, [campo]: valor }));
    };

    const actualizarRespuesta = (dominio, subescala, conductaIndex, campo, valor) => {
        const key = `${dominio}-${subescala}-${conductaIndex}`;
        setRespuestas(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [campo]: valor
            }
        }));
    };

    const getRespuesta = (dominio, subescala, conductaIndex, campo) => {
        const key = `${dominio}-${subescala}-${conductaIndex}`;
        return respuestas[key]?.[campo] || (campo === 'frecuencia' ? 0 : campo === 'nivel' ? null : '');
    };

    const incrementarFrecuencia = (dominio, subescala, conductaIndex) => {
        const actual = getRespuesta(dominio, subescala, conductaIndex, 'frecuencia');
        actualizarRespuesta(dominio, subescala, conductaIndex, 'frecuencia', actual + 1);
    };

    const decrementarFrecuencia = (dominio, subescala, conductaIndex) => {
        const actual = getRespuesta(dominio, subescala, conductaIndex, 'frecuencia');
        if (actual > 0) {
            actualizarRespuesta(dominio, subescala, conductaIndex, 'frecuencia', actual - 1);
        }
    };

    const borrarTodo = () => {
        if (window.confirm('¿Estás seguro de que deseas borrar todos los datos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('epsd_evaluacion');
            setJugador({ nombre: '', rival: '', torneo: '', fecha: new Date().toISOString().split('T')[0] });
            setRespuestas({});
        }
    };

    const finalizarEvaluacion = () => {
        guardarDatos();
        alert('¡Evaluación finalizada y guardada exitosamente en el dispositivo local!');
        // En el futuro, aquí se podría enviar a Firebase si se asocia a un jugador específico
    };

    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white selection:bg-[#0070F3]/30">
            {/* Header de navegación superior (mismo estilo portal) */}
            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/portal/dashboard')} 
                        className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        Volver al Dashboard
                    </button>
                    <div className="flex items-center gap-2">
                        <Activity className="text-[#39FF14]" size={18} />
                        <span className="text-xs font-black text-white tracking-tight">PSMILE <span className="text-[#39FF14]">EPSD LITE</span></span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
                {/* Header Acciones */}
                <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 mb-8 flex items-center justify-between flex-wrap gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0070F3] to-[#39FF14] flex items-center justify-center shadow-lg shadow-[#0070F3]/20">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Evaluación ePsD en Vivo</h1>
                            <p className="text-[#6B7280] text-sm mt-1">Herramienta de registro offline para partidos y entrenamientos</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {guardadoAutomatico && (
                            <span className="text-xs text-[#39FF14] font-bold tracking-widest uppercase flex items-center gap-1.5 animate-pulse bg-[#39FF14]/10 px-3 py-1.5 rounded-full border border-[#39FF14]/30">
                                <Check size={14} /> Guardado
                            </span>
                        )}
                        <button 
                            onClick={borrarTodo}
                            className="px-4 py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-[#6B7280] transition-all flex items-center gap-2 text-sm font-bold border border-transparent hover:border-red-500/20"
                            title="Borrar todos los datos actuales"
                        >
                            <Trash2 size={16} /> Reiniciar
                        </button>
                        <button 
                            onClick={finalizarEvaluacion}
                            className="px-6 py-2.5 bg-[#0070F3] hover:bg-[#0060D0] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-[#0070F3]/20 flex items-center gap-2 transition-transform hover:scale-105"
                        >
                            <Save size={16} /> Guardar Evaluación
                        </button>
                    </div>
                </div>

                {/* Información del Jugador */}
                <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
                    <h2 className="text-[10px] font-bold text-[#0070F3] uppercase tracking-[0.2em] mb-6">
                        Datos del Contexto
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-xs font-bold tracking-wider text-[#6B7280] mb-2 uppercase">Jugador Observado</label>
                            <input
                                type="text"
                                value={jugador.nombre}
                                onChange={(e) => actualizarJugador('nombre', e.target.value)}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors"
                                placeholder="Ej: Carlos Ruiz"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold tracking-wider text-[#6B7280] mb-2 uppercase">Rival</label>
                            <input
                                type="text"
                                value={jugador.rival}
                                onChange={(e) => actualizarJugador('rival', e.target.value)}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors"
                                placeholder="Ej: CD Universitario"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold tracking-wider text-[#6B7280] mb-2 uppercase">Torneo / Amistoso</label>
                            <input
                                type="text"
                                value={jugador.torneo}
                                onChange={(e) => actualizarJugador('torneo', e.target.value)}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors"
                                placeholder="Ej: Liga Regional"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold tracking-wider text-[#6B7280] mb-2 uppercase">Fecha</label>
                            <input
                                type="date"
                                value={jugador.fecha}
                                onChange={(e) => actualizarJugador('fecha', e.target.value)}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#0070F3] transition-colors [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs de Dominios */}
                <div className="bg-[#111827] border border-white/5 rounded-t-2xl p-2 px-4 shadow-xl flex gap-2 overflow-x-auto">
                    {Object.keys(ESTRUCTURA_EPSD).map(dominio => (
                        <button
                            key={dominio}
                            onClick={() => setDominioActivo(dominio)}
                            className={`px-6 py-4 font-black uppercase tracking-widest text-xs whitespace-nowrap border-b-2 transition-all ${
                                dominioActivo === dominio 
                                    ? 'border-[#0070F3] text-white' 
                                    : 'border-transparent text-[#6B7280] hover:text-white/70'
                            }`}
                        >
                            {NOMBRES_DOMINIOS[dominio]}
                        </button>
                    ))}
                </div>

                {/* Conductas del dominio activo */}
                <div className="bg-[#111827]/50 border border-white/5 rounded-b-2xl p-6 md:p-8 shadow-xl min-h-[500px]">
                    <div className="space-y-10">
                        {Object.entries(ESTRUCTURA_EPSD[dominioActivo]).map(([subescala, conductas]) => (
                            <div key={subescala} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Título Subescala */}
                                <div className="mb-6 flex items-center gap-4">
                                    <h3 className="text-xl font-black text-white">{subescala}</h3>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                </div>

                                <div className="space-y-4">
                                    {conductas.map((conducta, idx) => (
                                        <div key={idx} className="bg-[#0A0F1E] border border-white/5 rounded-2xl p-6 hover:border-[#0070F3]/30 transition-colors group">
                                            <h4 className="text-base text-white/90 font-medium mb-6 leading-relaxed group-hover:text-white transition-colors">{conducta}</h4>

                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                                {/* Nivel de Dominio */}
                                                <div className="lg:col-span-7">
                                                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-3">
                                                        Nivel de Dominio Observado
                                                    </label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map(nivel => (
                                                            <button
                                                                key={nivel}
                                                                onClick={() => actualizarRespuesta(dominioActivo, subescala, idx, 'nivel', nivel)}
                                                                className={`flex-1 py-3 md:py-4 rounded-xl text-sm font-black transition-all ${
                                                                    getRespuesta(dominioActivo, subescala, idx, 'nivel') === nivel
                                                                        ? 'bg-[#0070F3] text-white shadow-lg shadow-[#0070F3]/20 scale-105 z-10'
                                                                        : 'bg-[#111827] text-[#6B7280] border border-white/5 hover:border-white/20 hover:text-white'
                                                                }`}
                                                            >
                                                                {nivel}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Frecuencia Contador */}
                                                <div className="lg:col-span-5">
                                                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-3 lg:text-center">
                                                        Frecuencia en Partido
                                                    </label>
                                                    <div className="flex items-center justify-start lg:justify-center gap-4">
                                                        <button
                                                            onClick={() => decrementarFrecuencia(dominioActivo, subescala, idx)}
                                                            className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#111827] border border-white/5 hover:border-white/20 flex items-center justify-center text-2xl font-black text-white/50 hover:text-white transition-all active:scale-95"
                                                        >
                                                            −
                                                        </button>
                                                        
                                                        <div className="w-16 h-12 md:w-20 md:h-14 bg-[#111827] rounded-xl flex items-center justify-center border-b-2 border-[#0070F3]">
                                                            <span className="text-2xl font-mono font-black text-[#0070F3]">
                                                                {getRespuesta(dominioActivo, subescala, idx, 'frecuencia')}
                                                            </span>
                                                        </div>

                                                        <button
                                                            onClick={() => incrementarFrecuencia(dominioActivo, subescala, idx)}
                                                            className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/30 hover:bg-[#0070F3] flex items-center justify-center text-2xl font-black text-[#0070F3] hover:text-white transition-all active:scale-95 shadow-lg shadow-[#0070F3]/10"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Observaciones textarea */}
                                            <div className="mt-6">
                                                <input
                                                    type="text"
                                                    value={getRespuesta(dominioActivo, subescala, idx, 'observaciones')}
                                                    onChange={(e) => actualizarRespuesta(dominioActivo, subescala, idx, 'observaciones', e.target.value)}
                                                    className="w-full bg-[#111827] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors"
                                                    placeholder="Notas cualitativas (ej. Reaccionó bien tras perder balón en minuto 15...)"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
