import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteField, getDoc, deleteDoc } from 'firebase/firestore';
import { 
    Brain, ArrowLeft, Calendar, User, Activity, 
    ChevronRight, BarChart, MessageSquare, Info,
    Zap, Heart, Users as UsersIcon, Loader2, Sparkles, Trash2
} from 'lucide-react';
import { getUserConfig } from './academyConfig';
import { generateGroqAnalysis } from './groqService';
import { EPSD_OPERATIONAL_DEFINITIONS } from './epsdIntelligence';
import EpsdEliteReport from './EpsdEliteReport';

// Componente Radar Chart Minimalista
const SpiderChart = ({ data, color, size = 200 }) => {
    const padding = 40;
    const center = size / 2;
    const radius = size / 2 - padding;
    
    // Generar puntos para el fondo (pentágono/hexágono)
    const levels = [0.2, 0.4, 0.6, 0.8, 1];
    const points = data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
        return {
            x: center + Math.cos(angle) * radius * (d.value / 100),
            y: center + Math.sin(angle) * radius * (d.value / 100),
            labelX: center + Math.cos(angle) * (radius + 20),
            labelY: center + Math.sin(angle) * (radius + 20),
            angle
        };
    });

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Círculos de fondo */}
                {levels.map(l => (
                    <circle 
                        key={l}
                        cx={center} cy={center} 
                        r={radius * l} 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="0.5" 
                        strokeDasharray="2,2" 
                        opacity="0.1" 
                    />
                ))}
                
                {/* Ejes */}
                {data.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                    return (
                        <line 
                            key={i}
                            x1={center} y1={center}
                            x2={center + Math.cos(angle) * radius}
                            y2={center + Math.sin(angle) * radius}
                            stroke="white" strokeWidth="0.5" opacity="0.1"
                        />
                    );
                })}

                {/* Polígono de Datos */}
                <polygon 
                    points={polygonPoints}
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                    strokeWidth="2"
                    className="animate-in fade-in duration-1000"
                />

                {/* Etiquetas */}
                {data.map((d, i) => (
                    <text 
                        key={i}
                        x={points[i].labelX}
                        y={points[i].labelY}
                        fill="#6B7280"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="uppercase tracking-tighter"
                    >
                        {d.label}
                    </text>
                ))}
            </svg>
        </div>
    );
};

export default function EpsdHistory() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const jugadorIdParam = searchParams.get('jugadorId');
    const { currentUser } = useAuth();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig.role === 'admin';

    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [selectedEval, setSelectedEval] = useState(null);
    const [analysisIA, setAnalysisIA] = useState(null);
    const [generatingIA, setGeneratingIA] = useState(false);
    const [confirmingRetry, setConfirmingRetry] = useState(false);
    const [playerHistoricalAvg, setPlayerHistoricalAvg] = useState(null);
    const [realPlayerData, setRealPlayerData] = useState(null);
    const [showEliteReport, setShowEliteReport] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/portal/dashboard');
            return;
        }

        const fetchEvaluaciones = async () => {
            setLoading(true);
            try {
                let q = query(collection(db, 'evaluaciones_epsd'));
                
                if (jugadorIdParam && jugadorIdParam !== 'manual') {
                    q = query(
                        collection(db, 'evaluaciones_epsd'), 
                        where('jugadorId', '==', jugadorIdParam)
                    );
                }

                const snap = await getDocs(q);
                let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Ordenado robusto en el cliente (maneja timestamp vs createdAt)
                list.sort((a, b) => {
                    const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0));
                    const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0));
                    return dateB - dateA;
                });

                setEvaluaciones(list);

                if (list.length > 0) {
                    calculateStats(list);
                    const firstEval = list[0];
                    setSelectedEval(firstEval); // Seleccionar la más reciente por defecto
                    setAnalysisIA(firstEval.aiAnalysis || null);
                }
            } catch (err) {
                console.error("Error fetching evaluations:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchRealPlayer = async () => {
            if (jugadorIdParam && jugadorIdParam !== 'manual') {
                try {
                    const snap = await getDoc(doc(db, 'jugadores', jugadorIdParam));
                    if (snap.exists()) setRealPlayerData(snap.data());
                } catch (e) { console.error("Error fetching real player:", e); }
            }
        };

        fetchEvaluaciones();
        fetchRealPlayer();
    }, [jugadorIdParam, isAdmin]);

    const handleDeleteEval = async (e, evalId) => {
        e.stopPropagation();
        if(!window.confirm('¿Estás seguro de querer borrar esta evaluación permanentemente?')) return;
        try {
            await deleteDoc(doc(db, 'evaluaciones_epsd', evalId));
            setEvaluaciones(prev => prev.filter(ev => ev.id !== evalId));
            if (selectedEval?.id === evalId) {
                setSelectedEval(null);
                setAnalysisIA(null);
            }
        } catch (err) {
            console.error(err);
            alert("Error al borrar.");
        }
    };

    const calculateStats = (list) => {
        if (list.length === 0) return;
        
        let sumC = 0, sumE = 0, sumS = 0;
        let subescalasSum = {};
        
        list.forEach(ev => {
            const results = calculateWeightedAnalysis(ev);
            // Promedios dominios globales
            sumC += results.dominios.COGNITIVO || 0;
            sumE += results.dominios.EMOCIONAL || 0;
            sumS += results.dominios.SOCIAL || 0;

            // Acumular subescalas para el radar histórico
            if (results.subescalas) {
                Object.entries(results.subescalas).forEach(([key, val]) => {
                    if (!subescalasSum[key]) subescalasSum[key] = 0;
                    subescalasSum[key] += parseFloat(val.indice); // indice ya está en escala 0-100
                });
            }
        });

        // Calcular promedios de subescalas históricas de este jugador
        let historicoRadar = {};
        Object.entries(subescalasSum).forEach(([key, total]) => {
            historicoRadar[key] = total / list.length;
        });
        setPlayerHistoricalAvg(historicoRadar);

        setStats({
            total: list.length,
            promedioCognitivo: (sumC / list.length).toFixed(1),
            promedioEmocional: (sumE / list.length).toFixed(1),
            promedioSocial: (sumS / list.length).toFixed(1)
        });
    };

    const calculateWeightedAnalysis = (ev) => {
        if (!ev || !ev.respuestas) return { dominios: { COGNITIVO: 0, EMOCIONAL: 0, SOCIAL: 0 }, subescalas: [] };

        const weights = ev.configWeights || {
            "Percepción del entorno": 15, "Toma de decisiones": 20, "Control atencional": 12,
            "Gestión emocional": 8, "Autodiálogo y enfoque mental": 10, "Autoconfianza y resiliencia": 10,
            "Comunicación emocional": 12, "Vínculo y cohesión": 7, "Liderazgo emocional": 6
        };

        const structure = {
            "COGNITIVO": ["Percepción del entorno", "Toma de decisiones", "Control atencional"],
            "EMOCIONAL": ["Gestión emocional", "Autodiálogo y enfoque mental", "Autoconfianza y resiliencia"],
            "SOCIAL": ["Comunicación emocional", "Vínculo y cohesión", "Liderazgo emocional"]
        };

        let results = { dominios: { COGNITIVO: 0, EMOCIONAL: 0, SOCIAL: 0 }, subescalas: {} };

        Object.entries(structure).forEach(([dominio, subs]) => {
            let totalDominio = 0;
            let weightSum = 0;
            subs.forEach(sub => {
                const w = (weights[sub] || 0);
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

                let sumaAvg = 0;
                let cont = 0;

                keys.forEach(k => {
                    const data = ev.respuestas[k];
                    if (!data) return;
                    let sumaNivelesRep = 0;
                    let contNivelesRep = 0;
                    
                    ["0-25", "26-45", "45-70", "71-90"].forEach(int => {
                        const intData = data[int];
                        if (intData && typeof intData === 'object' && intData.nivel) {
                            sumaNivelesRep += intData.nivel;
                            contNivelesRep++;
                        }
                    });

                    if (contNivelesRep > 0) {
                        sumaAvg += (sumaNivelesRep / contNivelesRep);
                        cont++;
                    }
                });

                const promSub = cont > 0 ? (sumaAvg / cont) : 0;
                const indiceSub = promSub * 20; // 0-100
                const ponderado = (indiceSub * w) / 100;
                
                results.subescalas[sub] = {
                    promedio: promSub.toFixed(2),
                    indice: Math.min(100, indiceSub).toFixed(1),
                    ponderado: ponderado.toFixed(2)
                };
                totalDominio += ponderado;
            });
            
            const rawFinal = weightSum > 0 ? (totalDominio / weightSum) * 100 : 0;
            results.dominios[dominio] = Math.min(100, rawFinal);
        });

        // Calcular intervalos para el gráfico de barras
        // Calcular intervalos para el gráfico de barras (REAL)
        const intervalos_labels = ["0-25", "26-45", "45-70", "71-90"];
        const dataIntervalos = intervalos_labels.map(int => {
            let suma = 0, count = 0;
            if (ev.respuestas) {
                Object.values(ev.respuestas).forEach(resp => {
                    if (resp && resp[int] && typeof resp[int] === 'object' && resp[int].nivel) {
                        suma += resp[int].nivel;
                        count++;
                    }
                });
            }
            return count > 0 ? (suma / count) * 20 : 0; 
        });

        return { ...results, dataIntervalos };
    };

    const handleGenerarIA = async () => {
        if (!selectedEval || !currentAnalysis) return;
        
        console.log("DEBUG: Iniciando generación de IA para:", selectedEval.id);
        
        // FILTRAR ESTRICTAMENTE POR JUGADOR para encontrar su historial real
        const playerEvaluations = evaluaciones.filter(ev => 
            ev.jugadorId === selectedEval.jugadorId
        );
        
        console.log(`DEBUG: Reportes totales del jugador ${selectedEval.jugadorId}:`, playerEvaluations.length);
        
        const currentIndex = playerEvaluations.findIndex(ev => ev.id === selectedEval.id);
        const historyData = playerEvaluations.slice(currentIndex + 1).map(ev => ({
            fecha: ev.timestamp?.toDate ? ev.timestamp.toDate().toLocaleDateString() : 
                  (ev.createdAt?.toDate ? ev.createdAt.toDate().toLocaleDateString() : 'Desconocida'),
            torneo: ev.contexto?.torneo || 'Previo',
            analisis: calculateWeightedAnalysis(ev)
        }));

        console.log("DEBUG: Historial encontrado para IA:", historyData.length);

        const playerData = {
            nombre: realPlayerData?.nombre || selectedEval.nombreJugador || 'Jugador Manual',
            posicion: realPlayerData?.posicion || selectedEval.posicion || selectedEval.contexto?.posicion || 'No especificada',
            categoria: realPlayerData?.categoria || selectedEval.categoria || selectedEval.contexto?.categoria || 'No especificada'
        };

        setGeneratingIA(true);
        try {
            const analysis = await generateGroqAnalysis(playerData, currentAnalysis, historyData);
            
            // Save analysis to Firestore
            const evalRef = doc(db, 'evaluaciones_epsd', selectedEval.id);
            await updateDoc(evalRef, {
                aiAnalysis: analysis,
                ultimaEdicionIA: new Date()
            });

            setAnalysisIA(analysis);
            
            // Update local state list to include the new AI analysis
            setEvaluaciones(prev => prev.map(ev => 
                ev.id === selectedEval.id ? { ...ev, aiAnalysis: analysis } : ev
            ));
            
        } catch (error) {
            console.error("AI Generation failed:", error);
            alert("Error al generar el análisis: " + error.message);
        } finally {
            setGeneratingIA(false);
        }
    };

    const currentAnalysis = selectedEval ? calculateWeightedAnalysis(selectedEval) : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#0070F3] animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">Cargando Dashboards ePsD...</p>
                </div>
            </div>
        );
    }

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
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/portal/dashboard')} className="text-cyber-blue hover:text-cyber-cyan transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                                <ArrowLeft size={16} /> Volver
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="cyber-glass-card p-6">
                        <h3 className="text-lg font-bold text-[#94a3b8] uppercase tracking-wider mb-4 flex justify-between items-center">
                            Historial Reciente
                            <span className="text-xs bg-cyber-blue/20 text-cyber-blue px-2 py-1 rounded-full">{evaluaciones.length} Registros</span>
                        </h3>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {evaluaciones.length === 0 ? (
                                <div className="p-8 bg-cyber-card rounded-xl border border-cyber-border text-center">
                                    <Activity size={32} className="text-gray-600 mx-auto mb-3" />
                                    <p className="text-[#94a3b8] text-xs">No hay evaluaciones registradas aún.</p>
                                </div>
                            ) : (
                                evaluaciones.map(ev => (
                                    <div 
                                        key={ev.id}
                                        onClick={() => {
                                            setSelectedEval(ev);
                                            setAnalysisIA(ev.aiAnalysis || null);
                                        }}
                                        className={`p-4 bg-cyber-card rounded-xl border cursor-pointer hover:border-cyber-blue transition-all ${
                                            selectedEval?.id === ev.id ? 'border-cyber-blue shadow-[0_0_15px_rgba(14,165,233,0.3)] bg-cyber-blue/5' : 'border-cyber-border'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-white text-lg truncate w-[200px]">{ev.nombreJugador || 'Jugador Manual'}</div>
                                                <div className="text-xs text-[#94a3b8] flex items-center gap-1 mt-1">
                                                    📅 {ev.contexto?.fecha || 'Sin fecha'} • ⚽ {ev.contexto?.torneo || 'Entrenamiento'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-cyber-blue"><ChevronRight size={18} /></div>
                                                {isAdmin && (
                                                    <button 
                                                        onClick={(e) => handleDeleteEval(e, ev.id)}
                                                        className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8">
                    {selectedEval && currentAnalysis ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Player Info Card */}
                            <div className="cyber-glass-card p-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyber-blue/20 to-cyber-cyan/20 border-2 border-cyber-blue flex items-center justify-center shrink-0">
                                        <span className="text-4xl">👤</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-bold mb-2 text-white">{selectedEval.nombreJugador || 'Jugador no definido'}</h2>
                                        <div className="flex flex-wrap gap-4 text-[#94a3b8] text-sm">
                                            <span className="flex items-center gap-2">
                                                <span>📅</span> {selectedEval.contexto?.fecha || 'Desconocida'}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span>⚽</span> {selectedEval.contexto?.torneo || '2023/24'}
                                            </span>
                                            <span className="px-3 py-1 bg-cyber-blue/20 text-cyber-blue border border-cyber-blue rounded-full text-xs font-bold uppercase tracking-wider">
                                                {selectedEval.contexto?.rival || 'Rival Indefinido'}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="cyber-btn-primary flex items-center gap-2 px-6 py-3">
                                        <span>📄</span> DESCARGAR PDF
                                    </button>
                                </div>
                            </div>

                            {/* Metrics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Cognitivo */}
                                <div className="cyber-glass-card cyber-metric-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl cyber-icon-cognitive">
                                            🧠
                                        </div>
                                        <span className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider">→ Actual</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white">COGNITIVO</h3>
                                    <div className="cyber-score-display orbitron mb-4">
                                        {currentAnalysis.dominios.COGNITIVO.toFixed(0)}<span className="text-2xl text-[#94a3b8]">/100</span>
                                    </div>
                                    <div className="cyber-progress-bar">
                                        <div className="cyber-progress-fill" style={{ width: `${currentAnalysis.dominios.COGNITIVO}%` }}></div>
                                    </div>
                                </div>
                                {/* Emocional */}
                                <div className="cyber-glass-card cyber-metric-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl cyber-icon-emotional">
                                            ❤️
                                        </div>
                                        <span className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider">→ Actual</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white">EMOCIONAL</h3>
                                    <div className="cyber-score-display orbitron mb-4">
                                        {currentAnalysis.dominios.EMOCIONAL.toFixed(0)}<span className="text-2xl text-[#94a3b8]">/100</span>
                                    </div>
                                    <div className="cyber-progress-bar">
                                        <div className="cyber-progress-fill" style={{ width: `${currentAnalysis.dominios.EMOCIONAL}%` }}></div>
                                    </div>
                                </div>
                                {/* Conductual */}
                                <div className="cyber-glass-card cyber-metric-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl cyber-icon-conductual">
                                            👥
                                        </div>
                                        <span className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider">→ Actual</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white">CONDUCTUAL</h3>
                                    <div className="cyber-score-display orbitron mb-4">
                                        {currentAnalysis.dominios.SOCIAL.toFixed(0)}<span className="text-2xl text-[#94a3b8]">/100</span>
                                    </div>
                                    <div className="cyber-progress-bar">
                                        <div className="cyber-progress-fill" style={{ width: `${currentAnalysis.dominios.SOCIAL}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Radar */}
                                <div className="cyber-glass-card p-8 flex flex-col items-center">
                                    <h3 className="cyber-section-title orbitron text-white text-xl self-start w-full">Equilibrio Psicológico</h3>
                                    <div className="relative flex-1 flex items-center justify-center w-full max-w-[320px] my-6">
                                        {/* Customized Radar SVG for Neon Theme */}
                                        <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                                            {/* Grid */}
                                            {[0.2, 0.4, 0.6, 0.8, 1].map((l, i) => (
                                                <polygon 
                                                    key={`level-${l}`}
                                                    points={(() => {
                                                        const sides = 5;
                                                        return Array.from({length: sides}).map((_, idx) => {
                                                            const angle = (Math.PI * 2 * idx) / sides - Math.PI / 2;
                                                            return `${150 + Math.cos(angle) * (100 * l)},${150 + Math.sin(angle) * (100 * l)}`;
                                                        }).join(' ');
                                                    })()}
                                                    fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" strokeDasharray={i === 4 ? "0" : "4,4"}
                                                />
                                            ))}
                                            {/* Axes */}
                                            {Array.from({length: 5}).map((_, i) => {
                                                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                                                return <line key={`axis-${i}`} x1="150" y1="150" x2={150 + Math.cos(angle) * 100} y2={150 + Math.sin(angle) * 100} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />;
                                            })}

                                            {/* Historical Layer */}
                                            {playerHistoricalAvg && (
                                                <polygon 
                                                    points={[
                                                        playerHistoricalAvg["Control atencional"] || 50,
                                                        playerHistoricalAvg["Gestión emocional"] || 50,
                                                        playerHistoricalAvg["Autoconfianza y resiliencia"] || 50,
                                                        playerHistoricalAvg["Liderazgo emocional"] || 50,
                                                        playerHistoricalAvg["Comunicación emocional"] || 50
                                                    ].map((val, idx) => {
                                                        const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                                                        return `${150 + Math.cos(angle) * (val)},${150 + Math.sin(angle) * (val)}`;
                                                    }).join(' ')}
                                                    fill="transparent" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4"
                                                />
                                            )}

                                            {/* Current Layer (Neon Blue) */}
                                            <polygon 
                                                points={[
                                                    parseFloat(currentAnalysis.subescalas["Control atencional"]?.indice || 0),
                                                    parseFloat(currentAnalysis.subescalas["Gestión emocional"]?.indice || 0),
                                                    parseFloat(currentAnalysis.subescalas["Autoconfianza y resiliencia"]?.indice || 0),
                                                    parseFloat(currentAnalysis.subescalas["Liderazgo emocional"]?.indice || 0),
                                                    parseFloat(currentAnalysis.subescalas["Comunicación emocional"]?.indice || 0)
                                                ].map((val, idx) => {
                                                    const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                                                    return `${150 + Math.cos(angle) * (val)},${150 + Math.sin(angle) * (val)}`;
                                                }).join(' ')}
                                                fill="rgba(14, 165, 233, 0.2)" stroke="#0ea5e9" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(14,165,233,0.5))"
                                                className="animate-in fade-in duration-1000"
                                            />
                                            
                                            {/* Points */}
                                            {[
                                                parseFloat(currentAnalysis.subescalas["Control atencional"]?.indice || 0),
                                                parseFloat(currentAnalysis.subescalas["Gestión emocional"]?.indice || 0),
                                                parseFloat(currentAnalysis.subescalas["Autoconfianza y resiliencia"]?.indice || 0),
                                                parseFloat(currentAnalysis.subescalas["Liderazgo emocional"]?.indice || 0),
                                                parseFloat(currentAnalysis.subescalas["Comunicación emocional"]?.indice || 0)
                                            ].map((val, idx) => {
                                                const angle = (Math.PI * 2 * idx) / 5 - Math.PI / 2;
                                                return <circle key={`pt-${idx}`} cx={150 + Math.cos(angle) * val} cy={150 + Math.sin(angle) * val} r="4" fill="#0ea5e9" stroke="#fff" strokeWidth="1" />;
                                            })}

                                            {/* Labels */}
                                            {[
                                                { label: "Concentración", angle: 0 },
                                                { label: "Control Emocional", angle: 1 },
                                                { label: "Liderazgo", angle: 2 },
                                                { label: "Resiliencia", angle: 3 },
                                                { label: "Comunicación", angle: 4 }
                                            ].map((d, i) => {
                                                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                                                const x = 150 + Math.cos(angle) * 125;
                                                const y = 150 + Math.sin(angle) * 125;
                                                return <text key={`lbl-${i}`} x={x} y={y} fill="#f1f5f9" fontSize="11" fontWeight="600" textAnchor="middle" dominantBaseline="middle" className="rajdhani">{d.label}</text>;
                                            })}
                                        </svg>
                                    </div>
                                    <div className="flex justify-center gap-4 mt-2">
                                        <div className="px-4 py-1.5 bg-cyber-blue/20 text-cyber-blue rounded-lg border border-cyber-blue text-xs font-bold tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-cyber-blue shadow-[0_0_5px_#0ea5e9]"></div> ACTUAL
                                        </div>
                                        <div className="px-4 py-1.5 bg-cyber-border/50 text-[#94a3b8] rounded-lg border border-cyber-border text-xs font-bold tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full border border-[#94a3b8]"></div> PROMEDIO
                                        </div>
                                    </div>
                                </div>

                                {/* Subdimensions List */}
                                <div className="cyber-glass-card p-8">
                                    <h3 className="cyber-section-title orbitron text-white text-xl mb-6">Análisis por Subdimensiones</h3>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {Object.entries(currentAnalysis.subescalas)
                                            .sort((a,b) => parseFloat(b[1].indice) - parseFloat(a[1].indice))
                                            .map(([nombre, data], idx) => (
                                            <div key={idx} className="p-4 bg-cyber-card/50 border border-cyber-border rounded-xl hover:border-cyber-blue hover:bg-cyber-card/80 transition-all">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-semibold text-sm text-white">{nombre}</div>
                                                    <div className="text-xl font-bold text-cyber-cyan orbitron">{parseFloat(data.indice).toFixed(0)}%</div>
                                                </div>
                                                <div className="cyber-progress-bar">
                                                    <div className="cyber-progress-fill" style={{ width: `${parseFloat(data.indice).toFixed(0)}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Top 3 & Bottom 3 */}
                            <div className="cyber-glass-card p-8">
                                <h3 className="cyber-section-title orbitron text-white text-xl mb-8">Comportamientos Específicos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Fortalezas */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-lg bg-cyber-green/20 flex items-center justify-center border border-cyber-green/30">
                                                <span className="text-xl">🏆</span>
                                            </div>
                                            <h4 className="text-xl font-bold text-cyber-green">Top Fortalezas</h4>
                                        </div>
                                        <div className="space-y-4">
                                            {(() => {
                                                const sorted = Object.entries(currentAnalysis.subescalas)
                                                    .sort((a,b) => parseFloat(b[1].indice) - parseFloat(a[1].indice))
                                                    .slice(0, 3);
                                                return sorted.map(([nombre, data], idx) => (
                                                    <div key={idx} className="cyber-top-item p-4 rounded-xl border border-cyber-green/20">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-bold text-lg text-white">#{idx + 1}</span>
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyber-green/20 text-cyber-green border border-cyber-green">{parseFloat(data.indice).toFixed(0)}%</span>
                                                        </div>
                                                        <div className="font-semibold text-white">{nombre}</div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                    {/* Mejoras */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-lg bg-cyber-red/20 flex items-center justify-center border border-cyber-red/30">
                                                <span className="text-xl">🎯</span>
                                            </div>
                                            <h4 className="text-xl font-bold text-cyber-red">Áreas a Mejorar</h4>
                                        </div>
                                        <div className="space-y-4">
                                            {(() => {
                                                const sorted = Object.entries(currentAnalysis.subescalas)
                                                    .sort((a,b) => parseFloat(a[1].indice) - parseFloat(b[1].indice))
                                                    .slice(0, 3);
                                                return sorted.map(([nombre, data], idx) => (
                                                    <div key={idx} className="cyber-improve-item p-4 rounded-xl border border-cyber-red/20">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-bold text-lg text-white">#{idx + 1}</span>
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyber-red/20 text-cyber-red border border-cyber-red">{parseFloat(data.indice).toFixed(0)}%</span>
                                                        </div>
                                                        <div className="font-semibold text-white">{nombre}</div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Analysis */}
                            <div className="cyber-glass-card cyber-ai-section p-8">
                                <div className="flex items-center justify-between mb-8 z-10 relative">
                                    <h3 className="cyber-section-title orbitron text-white text-2xl">
                                        <span className="text-3xl">🤖</span> ANÁLISIS DE IA
                                    </h3>
                                    <span className="text-xs px-4 py-2 bg-cyber-blue/20 text-cyber-blue rounded-full font-bold tracking-widest uppercase border border-cyber-blue/50 shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                                        Powered by ePsD-AI
                                    </span>
                                </div>

                                {!analysisIA ? (
                                    <div className="text-center z-10 relative py-8">
                                        <div className="bg-cyber-card/50 rounded-xl p-6 mb-8 border border-cyber-blue/30 inline-block">
                                            <p className="text-[#94a3b8] text-lg">
                                                Genera un diagnóstico táctico-psicológico basado en los <span className="text-cyber-blue font-bold">{Object.keys(selectedEval.respuestas || {}).length} descriptores</span> registrados en esta sesión.
                                            </p>
                                        </div>
                                        <button 
                                            onClick={handleGenerarIA}
                                            disabled={generatingIA}
                                            className="cyber-btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto"
                                        >
                                            {generatingIA ? <Loader2 className="animate-spin" size={24} /> : <span className="text-2xl">✨</span>}
                                            <span className="orbitron tracking-wider">GENERAR DIAGNÓSTICO MÚLTIPLE</span>
                                        </button>
                                        <p className="text-[#94a3b8] text-xs mt-6 opacity-70">
                                            * El análisis se generará utilizando los indicadores específicos del instrumento ePsD
                                        </p>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in z-10 relative text-center py-8">
                                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-cyber-green/20 border border-cyber-green/50 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                            <span className="text-5xl">✨</span>
                                        </div>
                                        <h4 className="text-3xl font-bold text-white mb-2 orbitron">Análisis Generado con Éxito</h4>
                                        <p className="text-[#94a3b8] mb-10 max-w-lg mx-auto text-lg">
                                            La Inteligencia Artificial ha procesado los datos cognitivos, emocionales y sociales del jugador, estructurando un informe clínico-deportivo de alto nivel.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto w-full">
                                            <button 
                                                onClick={() => setShowEliteReport(true)}
                                                className="cyber-btn-primary text-xl px-12 py-5 flex items-center justify-center gap-4 flex-1 bg-gradient-to-r from-cyber-blue to-cyber-cyan hover:from-cyber-cyan hover:to-cyber-blue shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                                            >
                                                <span className="text-3xl">📄</span>
                                                <span className="orbitron font-bold tracking-widest">ABRIR REPORTE</span>
                                            </button>
                                            {!confirmingRetry ? (
                                                <button 
                                                    onClick={() => setConfirmingRetry(true)}
                                                    className="px-8 py-5 border-2 border-white/20 rounded-2xl hover:bg-white/10 hover:border-red-500/50 active:scale-95 transition-all flex items-center justify-center gap-3 group min-w-[180px] bg-cyber-card/30"
                                                    title="Borrar y generar otro nuevo automáticamente"
                                                >
                                                    <Trash2 size={24} className="text-[#94a3b8] group-hover:text-red-400" />
                                                    <span className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest group-hover:text-white">REINTENTAR</span>
                                                </button>
                                            ) : (
                                                <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                const evalRef = doc(db, 'evaluaciones_epsd', selectedEval.id);
                                                                await updateDoc(evalRef, { aiAnalysis: deleteField() });
                                                                
                                                                setAnalysisIA(null);
                                                                setSelectedEval(prev => ({...prev, aiAnalysis: null}));
                                                                setEvaluaciones(prev => prev.map(ev => 
                                                                    ev.id === selectedEval.id ? { ...ev, aiAnalysis: null } : ev
                                                                ));

                                                                setConfirmingRetry(false);
                                                                // Disparar regeneración automática
                                                                setTimeout(() => handleGenerarIA(), 150);
                                                            } catch(e) {
                                                                console.error("Error al reintentar:", e);
                                                                setConfirmingRetry(false);
                                                            }
                                                        }}
                                                        className="px-6 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold orbitron text-xs tracking-tighter transition-all flex items-center gap-2"
                                                    >
                                                        SÍ, REGENERAR
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfirmingRetry(false)}
                                                        className="px-6 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold orbitron text-xs tracking-tighter transition-all"
                                                    >
                                                        CANCELAR
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Intervalos */}
                            <div className="cyber-glass-card p-8">
                                <h3 className="cyber-section-title orbitron text-white text-xl mb-8">Evolución de Rendimiento por Intervalo</h3>
                                <div className="space-y-4">
                                    {currentAnalysis.dataIntervalos.map((val, i) => {
                                        const maxPuntuacion = Math.max(...currentAnalysis.dataIntervalos);
                                        const isMax = val === maxPuntuacion && val > 0;
                                        const labels = ["0-25'", "26-45'", "45-70'", "71-90'"];
                                        
                                        return (
                                            <div key={i} className="cyber-time-bar p-4 bg-cyber-dark rounded-xl border border-cyber-border">
                                                <div className="flex items-center justify-between relative z-10 w-full">
                                                    <div className="flex items-center gap-6 flex-1">
                                                        <div className="w-24 text-center shrink-0">
                                                            <div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Minutos</div>
                                                            <div className="text-2xl font-bold orbitron text-cyber-cyan">{labels[i]}</div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="h-10 bg-cyber-card rounded-lg overflow-hidden relative border border-cyber-border">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-cyber-blue to-cyber-cyan flex items-center justify-end pr-4 transition-all duration-1000"
                                                                    style={{ width: `${val > 0 ? val : 0}%` }}
                                                                >
                                                                    {val > 0 && (
                                                                        <span className="font-bold text-white orbitron text-lg drop-shadow pr-2">
                                                                            {val.toFixed(0)}%
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isMax && (
                                                        <div className="ml-6 shrink-0">
                                                            <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">🔥</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
            
            {showEliteReport && (() => {
                // FILTRAR POR JUGADOR para encontrar la previa real en el visor
                const playerEvaluations = evaluaciones.filter(ev => 
                    ev.jugadorId === selectedEval?.jugadorId
                );
                const currentIndex = playerEvaluations.findIndex(ev => ev.id === selectedEval?.id);
                const previousEval = currentIndex !== -1 ? playerEvaluations[currentIndex + 1] : null;

                console.log("DEBUG: Visualizando Reporte Elite");
                console.log("DEBUG: Player ID:", selectedEval?.jugadorId);
                console.log("DEBUG: Index en historial filtrado:", currentIndex);
                console.log("DEBUG: ¿Existe previa?:", !!previousEval);

                return (
                    <EpsdEliteReport 
                        playerData={{
                            nombre: realPlayerData?.nombre || selectedEval.nombreJugador || 'Jugador Manual',
                            posicion: realPlayerData?.posicion || selectedEval.posicion || selectedEval.contexto?.posicion || 'No especificada',
                            categoria: realPlayerData?.categoria || selectedEval.categoria || selectedEval.contexto?.categoria || 'No especificada'
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
