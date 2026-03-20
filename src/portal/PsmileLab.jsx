import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteField, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
    Brain, Search, Bell, Settings, HelpCircle, 
    LayoutDashboard, Users, Inbox, FileText, 
    Grid, Filter, SortDesc, Check, FileDown, 
    Share2, FlaskConical, LineChart, Sparkles, 
    Zap, ChevronDown, History, Loader2, Info, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserConfig } from './academyConfig';
import { generateLabMasterAnalysis } from './psmileLabService';

export default function PsmileLab() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig.role === 'admin';

    console.log("[LAB_DEBUG] User:", currentUser?.email, "Role:", userConfig.role, "Academia:", userConfig.academiaId);

    // State
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [allReports, setAllReports] = useState([]);
    const [selectedReports, setSelectedReports] = useState([]);
    const [loadingPlayers, setLoadingPlayers] = useState(true);
    const [loadingEvals, setLoadingEvals] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [generatingMaster, setGeneratingMaster] = useState(false);
    const [masterAnalysis, setMasterAnalysis] = useState(null);
    const [aiConfig, setAiConfig] = useState({
        model: 'claude-sonnet-4.5',
        marcoTeorico: true,
        dimensions: ['Estabilidad Cognitiva', 'Fatiga Neuromuscular']
    });

    // Mobile UI State
    const [showSidebar, setShowSidebar] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    // Fetch initial player list
    useEffect(() => {
        const fetchPlayers = async () => {
            setLoadingPlayers(true);
            try {
                let q;
                if (isAdmin) {
                    q = query(collection(db, 'jugadores'));
                } else {
                    q = query(
                        collection(db, 'jugadores'),
                        where('academiaId', '==', userConfig.academiaId)
                    );
                }
                const snapshot = await getDocs(q);
                let list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                
                // Ordenar en memoria por fecha de creación (createdAt desc)
                list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
                
                setPlayers(list);
            } catch (err) {
                console.error("Error fetching players:", err);
            } finally {
                setLoadingPlayers(false);
            }
        };
        fetchPlayers();
    }, [userConfig.academiaId, isAdmin]);

    // Fetch evaluations and history when player is selected
    useEffect(() => {
        if (!selectedPlayer) return;
        const fetchAllData = async () => {
            setLoadingEvals(true);
            try {
                // Fetch ePsD Elite
                const qEpsd = query(
                    collection(db, 'evaluaciones_epsd'),
                    where('jugadorId', '==', selectedPlayer.id)
                );
                
                // Fetch Historial de Reportes (External)
                let snapHistorial = { docs: [] };
                try {
                    const qHistorial = query(
                        collection(db, 'jugadores', selectedPlayer.id, 'reportes'),
                        orderBy('createdAt', 'desc')
                    );
                    snapHistorial = await getDocs(qHistorial);
                } catch (hErr) {
                    console.error("Error fetching report history (permissions?):", hErr);
                }

                const snapEpsd = await getDocs(qEpsd);

                const epsdData = snapEpsd.docs.map(d => ({ 
                    id: d.id, 
                    ...d.data(), 
                    source: 'epsd',
                    displayTitle: 'Evaluación ePsD Elite',
                    date: d.data().timestamp?.toDate ? d.data().timestamp.toDate() : new Date(0)
                }));

                const historialData = snapHistorial.docs.map(d => ({ 
                    id: d.id, 
                    ...d.data(), 
                    source: 'external',
                    displayTitle: d.data().titulo || 'Reporte Externo',
                    date: d.data().createdAt ? new Date(d.data().createdAt) : new Date(0)
                }));

                const merged = [...epsdData, ...historialData].sort((a, b) => b.date - a.date);
                
                setAllReports(merged);
                setSelectedReports([]); 
                setMasterAnalysis(null);
                // Cerrar sidebar en móvil tras seleccionar
                setShowSidebar(false);
            } catch (err) {
                console.error("Error fetching all reports:", err);
            } finally {
                setLoadingEvals(false);
            }
        };
        fetchAllData();
    }, [selectedPlayer]);

    const toggleReportSelection = (id) => {
        setSelectedReports(prev => 
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleExecuteMasterAnalysis = async () => {
        console.log("DEBUG: Inició handleExecuteMasterAnalysis");
        if (!selectedPlayer) {
            alert("Por favor selecciona un jugador primero.");
            return;
        }
        if (selectedReports.length === 0) {
            alert("Selecciona al menos un informe para cruzar datos.");
            return;
        }
        
        setGeneratingMaster(true);
        try {
            console.log("DEBUG: Filtrando reportes...");
            const selectedData = allReports.filter(rep => selectedReports.includes(rep.id));
            console.log("DEBUG: Reportes filtrados:", selectedData.length);
            
            // Unify payload with clear source differentiation for IA
            const payload = {
                jugador: {
                    nombre: selectedPlayer.nombre || "Jugador sin nombre",
                    categoria: selectedPlayer.categoria || "N/A",
                    posicion: selectedPlayer.posicion || "N/A"
                },
                evidencia_seleccionada: selectedData.map(rep => {
                    const base = {
                        fecha: rep.date instanceof Date ? rep.date.toLocaleDateString() : 'Fecha desconocida',
                        tipo: rep.source === 'epsd' ? 'ePsD Elite' : 'Reporte Externo/Psicometría',
                        titulo: rep.displayTitle
                    };

                    if (rep.source === 'epsd') {
                        return {
                            ...base,
                            data_epsd: {
                                contexto: rep.contexto,
                                respuestas: rep.respuestas,
                                intervalos: rep.dataIntervalos || null,
                                aiOriginal: rep.aiAnalysis || null
                            }
                        };
                    } else {
                        return {
                            ...base,
                            data_externa: {
                                titulo_original: rep.titulo,
                                observaciones: rep.observaciones || "No especificadas",
                                externalUrl: rep.reporteURL || null
                            }
                        };
                    }
                }),
                config: aiConfig
            };

            console.log("DEBUG: Llamando a generateLabMasterAnalysis con payload:", payload);
            const result = await generateLabMasterAnalysis(payload);
            console.log("DEBUG: Resultado recibido de la IA:", result);
            setMasterAnalysis(result);
            // Cerrar config en móvil tras analizar
            setShowConfig(false);

        } catch (err) {
            console.error("DEBUG: Master Analysis failed:", err);
            alert("Error en el análisis maestro: " + err.message);
        } finally {
            setGeneratingMaster(false);
            console.log("DEBUG: Finalizó handleExecuteMasterAnalysis");
        }
    };

    const handlePublishToDashboard = async () => {
        if (!masterAnalysis || !selectedPlayer) return;
        
        try {
            const reportData = {
                jugadorId: selectedPlayer.id,
                nombreJugador: selectedPlayer.nombre,
                readyScore: masterAnalysis.readyScore,
                resumen: masterAnalysis.resumen,
                indicadores: masterAnalysis.indicadores,
                sugerencias: masterAnalysis.sugerencias,
                modelUsed: aiConfig.model,
                timestamp: serverTimestamp(),
                tipoMeta: 'master_report',
                status: 'published'
            };
            
            await addDoc(collection(db, 'master_reports'), reportData);
            alert("¡Informe Maestro publicado con éxito en el Dashboard!");
        } catch (err) {
            console.error("Error publishing report:", err);
            alert("Error al publicar el informe.");
        }
    };

    const filteredPlayersList = players.filter(p => p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="bg-[#0d1322] text-[#dde2f8] font-sans selection:bg-[#8aebff]/30 min-h-screen flex relative overflow-hidden">
            {/* Sidebar nav logic adapted from code.html */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-[#151b2b] flex flex-col border-r border-[#3c494c]/15 z-[60] transition-transform duration-300 transform lg:static lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8aebff] to-[#22d3ee] flex items-center justify-center text-[#00363e] shadow-[0_0_15px_rgba(138,235,255,0.3)]">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm tracking-tight leading-tight">Laboratorio Psicodeportivo</h1>
                            <p className="text-[10px] text-[#bbc9cd] uppercase tracking-widest">High Performance Unit</p>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        <div onClick={() => navigate('/portal/dashboard')} className="flex items-center gap-3 px-4 py-3 text-[#bbc9cd] hover:bg-[#191f2f] rounded-md transition-colors cursor-pointer group">
                            <LayoutDashboard size={18} className="group-hover:text-[#8aebff]" />
                            <span className="font-medium text-sm">Dashboard</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 bg-[#2f3445] text-[#8aebff] rounded-md transition-colors cursor-pointer border-l-2 border-[#8aebff]">
                            <Inbox size={18} />
                            <span className="font-medium text-sm">Laboratorio de Datos</span>
                        </div>
                        <div onClick={() => navigate('/portal/epsd-historial')} className="flex items-center gap-3 px-4 py-3 text-[#bbc9cd] hover:bg-[#191f2f] rounded-md transition-colors cursor-pointer group">
                            <History size={18} className="group-hover:text-[#8aebff]" />
                            <span className="font-medium text-sm">Historial Maestro</span>
                        </div>
                        <div className="pt-4 pb-2">
                             <h3 className="text-[10px] font-bold text-[#bbc9cd] uppercase tracking-widest px-4">Intervención</h3>
                        </div>
                        <div onClick={() => navigate('/portal/charla-autorregulacion')} className="flex items-center gap-3 px-4 py-3 text-[#bbc9cd] hover:bg-[#191f2f] rounded-md transition-colors cursor-pointer group border border-dashed border-[#8aebff]/20 mx-2">
                            <FileText size={18} className="text-[#8aebff]" />
                            <span className="font-medium text-sm text-[#8aebff]">Slide Deck: Autorregulación</span>
                        </div>
                    </nav>
                </div>

                {/* Player Search & List */}
                <div className="mt-4 px-6 flex-1 flex flex-col overflow-hidden">
                    <h3 className="text-[10px] font-bold text-[#bbc9cd] uppercase tracking-widest mb-4">Directorio de Atletas</h3>
                    <div className="relative mb-4">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbc9cd]" />
                        <input 
                            className="w-full bg-[#2f3445] border-none rounded-md py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-[#8aebff] transition-all outline-none" 
                            placeholder="Buscar atleta..." 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-4 pr-1">
                        {loadingPlayers ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#8aebff]" /></div>
                        ) : filteredPlayersList.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => setSelectedPlayer(p)}
                                className={`p-2 flex items-center gap-3 rounded-md border transition-all cursor-pointer ${selectedPlayer?.id === p.id ? 'border-[#8aebff]/50 bg-[#191f2f]' : 'bg-[#080e1d]/50 border-transparent hover:border-[#8aebff]/20 hover:bg-[#191f2f]'}`}
                            >
                                <div className="w-10 h-10 rounded-sm bg-[#2f3445] flex items-center justify-center text-lg shrink-0">
                                    {p.nombre?.[0] || '👤'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-semibold truncate">{p.nombre}</p>
                                    <p className="text-[10px] text-[#4edea3]">{p.categoria}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0d1322] overflow-hidden">
                <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-[#0d1322]/80 backdrop-blur-md border-b border-[#3c494c]/10 z-40">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowSidebar(true)}
                            className="lg:hidden p-2 text-[#8aebff] hover:bg-[#8aebff]/10 rounded-lg transition-colors"
                        >
                            <Grid size={20} />
                        </button>
                        <h2 className="font-medium text-sm lg:text-lg text-[#dde2f8] truncate">Repositorio</h2>
                        <div className="hidden sm:block h-4 w-[1px] bg-[#3c494c]/30"></div>
                        <p className="hidden sm:block text-xs text-[#bbc9cd]">
                            Atleta: <span className="text-[#4edea3] font-bold">{selectedPlayer?.nombre || '--'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4 text-[#bbc9cd]">
                        <button 
                            onClick={() => setShowConfig(true)}
                            className="lg:hidden p-2 text-[#8aebff] hover:bg-[#8aebff]/10 rounded-lg transition-colors"
                            title="Configuración de IA"
                        >
                            <Settings size={20} />
                        </button>
                        <Bell size={18} className="hidden sm:block cursor-pointer hover:text-[#8aebff]" />
                        <HelpCircle size={18} className="hidden sm:block cursor-pointer hover:text-[#8aebff]" />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* Repository Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {loadingEvals ? (
                            <div className="col-span-full py-20 flex flex-col items-center gap-3">
                                <Loader2 className="animate-spin text-[#8aebff]" size={32} />
                                <p className="text-sm italic">Recopilando evidencia clínica...</p>
                            </div>
                        ) : !selectedPlayer ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-[#3c494c]/20 rounded-xl">
                                <Users size={40} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm text-[#bbc9cd]">Selecciona un jugador para explorar su repositorio.</p>
                            </div>
                        ) : allReports.length === 0 ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-[#3c494c]/20 rounded-xl">
                                <Inbox size={40} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm text-[#bbc9cd]">Este jugador no tiene registros en el repositorio aún.</p>
                            </div>
                        ) : allReports.map(rep => (
                            <div 
                                key={rep.id} 
                                onClick={() => toggleReportSelection(rep.id)}
                                className={`group relative p-5 rounded-md border transition-all cursor-pointer ${selectedReports.includes(rep.id) ? 'bg-[#191f2f] border-[#8aebff]/50' : 'bg-[#151b2b] border-transparent hover:border-[#8aebff]/30 hover:bg-[#2f3445]'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-all ${selectedReports.includes(rep.id) ? 'border-[#8aebff] bg-[#8aebff]/10' : 'border-[#3c494c]/30 group-hover:border-[#8aebff]/50'}`}>
                                        {selectedReports.includes(rep.id) && <Check size={12} className="text-[#8aebff]" />}
                                    </div>
                                    <span className="text-[10px] font-bold text-[#bbc9cd] uppercase">
                                        {rep.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <h4 className={`font-bold mb-1 ${rep.source === 'epsd' ? 'text-[#8aebff]' : 'text-[#4edea3]'}`}>
                                        {rep.displayTitle}
                                    </h4>
                                    <p className="text-[10px] text-[#bbc9cd] uppercase tracking-wider">
                                        {rep.source === 'epsd' ? '🔥 ePsD Elite' : '📄 Psicometría / Notas'}
                                    </p>
                                </div>
                                <div className="space-y-2 pt-4 border-t border-[#3c494c]/10">
                                    <div className="flex justify-between text-[10px] uppercase">
                                        <span className="text-[#bbc9cd]">Fuente</span>
                                        <span className={`font-bold ${rep.source === 'epsd' ? 'text-[#8aebff]' : 'text-[#4edea3]'}`}>
                                            {rep.source === 'epsd' ? 'EPSD' : 'EXTERNO'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Analysis Workspace */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[#3c494c]/10 pb-4">
                            <h3 className="font-bold text-xl tracking-tight">Eje de Procesamiento Clínico</h3>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-3 py-1.5 border border-[#3c494c]/30 text-[#bbc9cd] rounded-md hover:bg-[#2f3445] transition-all text-xs">
                                    <FileDown size={14} /> Exportar PDF
                                </button>
                                <button 
                                    onClick={handlePublishToDashboard}
                                    disabled={!masterAnalysis}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-[#3c494c]/30 text-[#bbc9cd] rounded-md hover:bg-[#2f3445] transition-all text-xs disabled:opacity-30"
                                >
                                    <Share2 size={14} /> Publicar en Dashboard
                                </button>
                            </div>
                        </div>

                        {!masterAnalysis ? (
                            <div className="bg-[#151b2b]/40 rounded-xl p-20 border border-dashed border-[#3c494c]/20 flex flex-col items-center gap-4">
                                <Sparkles size={48} className="opacity-10" />
                                <div className="text-center">
                                    <p className="text-[#bbc9cd] text-sm italic">Selecciona los informes y ejecuta el "Análisis Maestro" para iniciar el procesamiento cruzado.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#151b2b]/60 rounded-xl p-8 border border-[#3c494c]/10 backdrop-blur-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <FlaskConical size={200} />
                                </div>
                                <div className="max-w-5xl mx-auto space-y-10 relative z-10">
                                    {/* Encabezado Profesional */}
                                    <div className="flex justify-between items-start border-b border-[#3c494c]/20 pb-8">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="px-2 py-1 bg-[#4edea3]/10 text-[#4edea3] text-[10px] font-bold uppercase border border-[#4edea3]/20 rounded-sm">Protocolo Multifactorial</span>
                                                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-sm border ${masterAnalysis.congruencia_jugador?.nivel === 'alta' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                    Congruencia: {masterAnalysis.congruencia_jugador?.nivel === "N/A" || masterAnalysis.congruencia_jugador?.nivel === "no_aplica" || !masterAnalysis.congruencia_jugador 
                                                        ? "Requiere autoreporte del jugador" 
                                                        : masterAnalysis.congruencia_jugador.nivel}
                                                </span>
                                            </div>
                                            <h2 className="text-3xl font-bold tracking-tight">Síntesis Maestra de Perfil Integral</h2>
                                            <p className="text-[#bbc9cd] mt-2 text-sm">
                                                Atleta: <span className="text-white font-semibold">{selectedPlayer?.nombre}</span> | Etapa: <span className="text-[#8aebff] uppercase font-bold">{masterAnalysis.etapa_evolutiva || 'No especificada'}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-5xl font-bold text-[#8aebff]">{masterAnalysis.readyScore}</p>
                                            <p className="text-[10px] font-bold text-[#bbc9cd] uppercase mt-1 tracking-[0.2em]">Ready Score</p>
                                        </div>
                                    </div>

                                    {/* Resumen Clínico */}
                                    <div className="bg-[#111827] p-6 rounded-xl border border-[#8aebff]/10">
                                        <h4 className="text-[10px] font-bold text-[#8aebff] uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Brain size={14} /> Resumen Clínico Integrador
                                        </h4>
                                        <p className="text-sm text-[#dde2f8] leading-relaxed italic">
                                            "{masterAnalysis.resumen_clinico || "Resumen no disponible con los datos actuales"}"
                                        </p>
                                        <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase">
                                            <span className="text-[#bbc9cd]">Perfil Motivado a: <span className="text-[#4edea3]">{masterAnalysis.perfil_motivacional || "No determinado"}</span></span>
                                        </div>
                                    </div>

                                    {/* Matriz de Convergencia */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#bbc9cd] mb-6">Matriz de Convergencia Científica</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {Object.entries(masterAnalysis.matriz_convergente || {}).map(([dim, data]) => (
                                                <div key={dim} className="p-4 bg-[#191f2f] rounded-xl border border-[#3c494c]/20 hover:border-[#8aebff]/30 transition-all group">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h5 className="font-bold text-sm text-[#8aebff] capitalize">{dim}</h5>
                                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${data.convergencia === 'alta' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                            {data.convergencia}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-3 text-[10px]">
                                                        <div>
                                                            <p className="text-[#bbc9cd] mb-1 font-bold">ePsD:</p>
                                                            <p className="text-white/80 italic">"{data.epsd}"</p>
                                                        </div>
                                                        {data.psicometria && (
                                                            <div>
                                                                <p className="text-[#bbc9cd] mb-1 font-bold">Psicometría:</p>
                                                                <p className="text-white/80 italic">"{data.psicometria}"</p>
                                                            </div>
                                                        )}
                                                        <div className="pt-2 border-t border-[#3c494c]/20">
                                                            <p className="text-[#8aebff] font-bold">Interpretación:</p>
                                                            <p className="text-[#bbc9cd]">{data.interpretacion}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Validación ePsD y Congruencia */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-5 bg-[#111827] rounded-xl border border-[#3c494c]/20">
                                            <h5 className="text-[10px] font-bold text-[#4edea3] uppercase tracking-widest mb-4">Validación ePsD vs Psicometría</h5>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[9px] text-[#bbc9cd] uppercase font-bold mb-1">Áreas Validadas:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {masterAnalysis.validacion_epsd?.areas_validadas?.map(a => (
                                                            <span key={a} className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[9px] rounded-full">{a}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-[#bbc9cd] uppercase font-bold mb-1">Conclusión de Validez:</p>
                                                    <p className="text-xs text-[#bbc9cd]">{masterAnalysis.validacion_epsd?.conclusion_validez || "Se requiere psicometría para validar el ePsD"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-[#111827] rounded-xl border border-[#3c494c]/20">
                                            <h5 className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-widest mb-4">Análisis de Congruencia Cognitiva</h5>
                                            <p className="text-xs text-[#bbc9cd] mb-2">{masterAnalysis.congruencia_jugador?.descripcion}</p>
                                            <div className="mt-4 pt-4 border-t border-[#3c494c]/10">
                                                <p className="text-[9px] text-[#8aebff] uppercase font-bold mb-1">Implicación Clínica:</p>
                                                <p className="text-xs italic text-[#bbc9cd]">{masterAnalysis.congruencia_jugador?.implicacion_clinica}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hallazgos y Sugerencias */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-[#3c494c]/10">
                                        <div className="space-y-6">
                                            <h4 className="font-bold text-lg flex items-center gap-2">
                                                <LineChart className="text-[#4edea3]" /> Hallazgos Clínicos
                                            </h4>
                                            <div className="space-y-4">
                                                {masterAnalysis.hallazgos?.map((h, i) => (
                                                    <div key={i} className="p-4 bg-[#191f2f] rounded-lg border border-[#3c494c]/20">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-bold text-[#8aebff]">{h.titulo}</span>
                                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${h.impacto === 'critico' ? 'bg-red-500/20 text-red-400' : h.impacto === 'positivo' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                                {h.impacto}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[#bbc9cd] mb-2">{h.descripcion}</p>
                                                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#3c494c]/10">
                                                            <span className="text-[9px] text-[#4edea3] font-bold uppercase">{h.dimension}</span>
                                                            <div className="flex gap-1">
                                                                {h.fuentes_que_lo_respaldan?.map(f => (
                                                                    <span key={f} className="text-[8px] bg-[#3c494c]/30 text-[#bbc9cd] px-1 rounded">{f}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="font-bold text-lg flex items-center gap-2">
                                                <Sparkles className="text-[#8aebff]" /> Plan de Intervención S.D.C.
                                            </h4>
                                            <div className="space-y-4">
                                                {masterAnalysis.sugerencias?.map((s, i) => (
                                                    <div key={i} className="p-4 bg-[#111827] rounded-lg border-l-4 border-[#8aebff]">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-sm font-bold text-[#dde2f8]">{s.intervencion}</p>
                                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${s.prioridad === 'inmediata' ? 'bg-red-500/20 text-red-400' : 'bg-[#8aebff]/10 text-[#8aebff]'}`}>
                                                                {s.prioridad}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-[#bbc9cd] italic mb-2">Fundamento: {s.fundamento || "Basado en observación ePsD"}</p>
                                                        <span className="text-[9px] text-[#4edea3] font-bold uppercase">{s.dimension}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer Orchestrator */}
                <footer className="h-auto lg:h-20 p-4 lg:px-8 flex flex-col lg:flex-row items-center justify-between border-t border-[#3c494c]/15 bg-[#151b2b]/60 backdrop-blur-md z-50 gap-4">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="bg-[#8aebff]/10 border border-[#8aebff]/20 px-3 lg:px-4 py-2 rounded-md flex-1 lg:flex-none">
                            <p className="text-[10px] lg:text-xs font-bold text-[#8aebff] tracking-wide">
                                <span className="text-sm lg:text-lg mr-2 italic">{selectedReports.length}</span> 
                                Informes en cesta
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <button 
                            disabled={selectedReports.length === 0 || generatingMaster}
                            onClick={handleExecuteMasterAnalysis}
                            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#8aebff] to-[#22d3ee] disabled:opacity-50 disabled:grayscale text-[#00363e] px-8 py-3 rounded-md font-bold text-sm shadow-[0_0_20px_rgba(138,235,255,0.4)] hover:scale-[1.02] transition-all"
                        >
                            {generatingMaster ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                            {generatingMaster ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS MAESTRO'}
                        </button>
                    </div>
                </footer>
            </main>

            {/* Right Config Aside */}
            <aside className={`fixed inset-y-0 right-0 w-80 bg-[#151b2b] border-l border-[#3c494c]/15 p-6 flex flex-col gap-8 z-[60] transition-transform duration-300 transform lg:static lg:translate-x-0 ${showConfig ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between lg:block">
                    <h3 className="font-bold text-base mb-6 lg:mb-6 flex items-center gap-2">
                        <Sparkles className="text-[#8aebff]" /> Configuración
                    </h3>
                    <button onClick={() => setShowConfig(false)} className="lg:hidden p-2 text-[#bbc9cd]"><X size={20} /></button>
                </div>
                <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#bbc9cd]">Nivel de Razonamiento</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-[#2f3445] border border-[#3c494c]/20 rounded-md py-3 px-4 text-xs appearance-none focus:ring-1 focus:ring-[#8aebff] outline-none"
                                    value={aiConfig.model}
                                    onChange={(e) => setAiConfig({...aiConfig, model: e.target.value})}
                                >
                                    <option value="claude-sonnet-4.5">Claude 4.5 Sonnet (Master Detail)</option>
                                    <option value="claude-haiku">Claude Haiku (Speed Optimization)</option>
                                    <option value="llama-3.3-70b-versatile">DeepSeek-R1 / Llama 70B</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#bbc9cd]" />
                            </div>
                        </div>

                        <div className="p-4 bg-[#191f2f] rounded-md border border-[#3c494c]/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold">Capa Teórica Psmile</span>
                                <div 
                                    onClick={() => setAiConfig({...aiConfig, marcoTeorico: !aiConfig.marcoTeorico})}
                                    className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${aiConfig.marcoTeorico ? 'bg-[#4edea3]' : 'bg-[#3c494c]'}`}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${aiConfig.marcoTeorico ? 'right-0.5' : 'left-0.5'}`}></div>
                                </div>
                            </div>
                    <p className="text-[10px] text-[#bbc9cd] leading-normal italic">Implementa marcos teóricos de neurociencia aplicada al deporte.</p>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[#3c494c]/15">
                    <button 
                        disabled={selectedReports.length === 0 || generatingMaster}
                        onClick={handleExecuteMasterAnalysis}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-[#8aebff] to-[#22d3ee] disabled:opacity-50 text-[#00363e] py-4 rounded-md font-bold shadow-[0_0_30px_rgba(138,235,255,0.25)] hover:shadow-[0_0_40px_rgba(138,235,255,0.4)] transition-all"
                    >
                        <Zap size={20} /> ANALIZAR CESTA
                    </button>
                    <p className="text-[9px] text-center text-[#bbc9cd] font-bold uppercase mt-4">Laboratorio de Alta Performance</p>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {(showSidebar || showConfig) && (
                <div 
                    onClick={() => { setShowSidebar(false); setShowConfig(false); }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
                ></div>
            )}
        </div>
    );
}
