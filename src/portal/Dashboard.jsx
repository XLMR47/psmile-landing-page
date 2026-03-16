import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, deleteDoc, doc, where } from 'firebase/firestore';
import { Brain, LogOut, Plus, Users, Search, Trash2, ShieldCheck, Eye, Building2, Activity, BarChart, FlaskConical, Menu, X, Radio } from 'lucide-react';
import PlayerCard from './PlayerCard';
import AddPlayerModal from './AddPlayerModal';
import { getUserConfig, ACADEMIAS } from './academyConfig';

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig.role === 'admin';

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [filterAcademia, setFilterAcademia] = useState('Todas');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const categorias = ['Todas', 'Sub-13', 'Sub-15', 'Sub-17', 'Sub-20'];

    // Fetch players from Firestore (filtered by academy for DTs)
    const fetchPlayers = async () => {
        setLoading(true);
        try {
            let q;
            if (isAdmin) {
                // Admin: todos los jugadores
                q = query(collection(db, 'jugadores'));
            } else {
                // DT: filtrar por academia
                q = query(
                    collection(db, 'jugadores'),
                    where('academiaId', '==', userConfig.academiaId)
                );
            }
            const snapshot = await getDocs(q);
            let playerList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // Ordenar en memoria (descendente por fecha de creación)
            playerList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            
            setPlayers(playerList);
        } catch (err) {
            console.error('Error fetching players:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/portal');
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        }
    };

    const handleDeletePlayer = async () => {
        if (!deleteConfirm) return;
        try {
            await deleteDoc(doc(db, 'jugadores', deleteConfirm.id));
            setDeleteConfirm(null);
            await fetchPlayers();
        } catch (err) {
            console.error('Error al eliminar:', err);
            alert('Error al eliminar: ' + err.message);
        }
    };


    // Filtered players
    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'Todas' || p.categoria === filterCategory;
        const matchesAcademia = filterAcademia === 'Todas' || p.academiaId === filterAcademia;
        return matchesSearch && matchesCategory && matchesAcademia;
    });

    // Get academia name for display
    const getAcademiaName = (academiaId) => {
        const ac = ACADEMIAS.find(a => a.id === academiaId);
        return ac ? ac.nombre : academiaId || 'Sin academia';
    };

    return (
        <div className="min-h-screen bg-[#0A0F1E]">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0070F3]/10 border border-[#0070F3]/30 rounded-xl flex items-center justify-center">
                            <Brain className="text-[#0070F3]" size={20} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-white tracking-tight">PSMILE <span className="text-[#0070F3]">INTELLIGENCE</span></h1>
                            <p className="text-[10px] text-[#6B7280] tracking-widest uppercase">Portal de Inteligencia Mental</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {isAdmin && (
                            <div className="hidden lg:flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/portal/laboratorio')}
                                    className="flex items-center gap-2 bg-[#111827] hover:bg-[#8aebff]/10 border border-white/5 hover:border-[#8aebff]/30 text-[#6B7280] hover:text-[#8aebff] px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                                    title="Laboratorio Psicodeportivo de Alto Rendimiento"
                                >
                                    <FlaskConical size={14} />
                                    Laboratorio
                                </button>
                                <button
                                    onClick={() => navigate('/portal/epsd-lite')}
                                    className="flex items-center gap-2 bg-[#111827] hover:bg-[#39FF14]/10 border border-white/5 hover:border-[#39FF14]/30 text-[#6B7280] hover:text-[#39FF14] px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                                    title="Herramienta de Evaluación ePsD en Vivo"
                                >
                                    <Activity size={14} />
                                    ePsD Lite
                                </button>
                                <button
                                    onClick={() => navigate('/portal/epsd-historial')}
                                    className="flex items-center gap-2 bg-[#111827] hover:bg-[#0070F3]/10 border border-white/5 hover:border-[#0070F3]/30 text-[#6B7280] hover:text-[#0070F3] px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                                    title="Ver Historial de Resultados ePsD"
                                >
                                    <BarChart size={14} />
                                    Resultados ePsD
                                </button>
                                <button
                                    onClick={() => navigate('/portal/sesion/nueva')}
                                    className="flex items-center gap-2 bg-[#111827] hover:bg-[#ff2d2d]/10 border border-white/5 hover:border-[#ff2d2d]/30 text-[#6B7280] hover:text-[#ff6b6b] px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                                    title="Iniciar sesión grupal en tiempo real"
                                >
                                    <Radio size={14} />
                                    Sesión Live
                                </button>
                            </div>
                        )}
                        {!isAdmin && userConfig.academiaId === 'neurosport' && (
                            <div className="hidden lg:flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/portal/sesion/nueva')}
                                    className="flex items-center gap-2 bg-[#111827] hover:bg-[#ff2d2d]/10 border border-white/5 hover:border-[#ff2d2d]/30 text-[#6B7280] hover:text-[#ff6b6b] px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
                                    title="Iniciar sesión grupal en tiempo real"
                                >
                                    <Radio size={14} />
                                    Sesión Live
                                </button>
                            </div>
                        )}
                        <div className="hidden sm:flex items-center gap-2 bg-[#111827] border border-white/5 rounded-full px-4 py-2">
                            {isAdmin ? (
                                <ShieldCheck size={12} className="text-[#39FF14]" />
                            ) : (
                                <Eye size={12} className="text-[#0070F3]" />
                            )}
                            <span className="text-[10px] text-[#6B7280] font-bold tracking-widest uppercase truncate max-w-[80px]">
                                {currentUser?.email?.split('@')[0]}
                            </span>
                            <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${isAdmin ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-[#0070F3]/10 text-[#0070F3]'}`}>
                                {isAdmin ? 'ADMIN' : 'DT'}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex bg-[#111827] hover:bg-red-500/20 border border-white/5 hover:border-red-500/30 text-[#6B7280] hover:text-red-400 rounded-xl p-2.5 transition-all"
                            title="Cerrar sesión"
                        >
                            <LogOut size={16} />
                        </button>
                        
                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="lg:hidden bg-[#111827] border border-white/5 text-white p-2.5 rounded-xl"
                        >
                            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {showMobileMenu && (
                    <div className="lg:hidden bg-[#0A0F1E] border-b border-white/5 p-6 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-3 bg-[#111827] rounded-2xl border border-white/5 mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isAdmin ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-[#0070F3]/10 text-[#0070F3]'}`}>
                                        {isAdmin ? <ShieldCheck size={16} /> : <Eye size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest">{currentUser?.email?.split('@')[0]}</p>
                                        <p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-[0.2em]">{isAdmin ? 'Administrador' : 'Director Técnico'}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                    <LogOut size={18} />
                                </button>
                            </div>

                            {isAdmin && (
                                <>
                                    <button
                                        onClick={() => { navigate('/portal/laboratorio'); setShowMobileMenu(false); }}
                                        className="flex items-center gap-4 bg-[#111827] p-4 rounded-2xl border border-white/5 text-left"
                                    >
                                        <div className="p-2.5 bg-[#8aebff]/10 text-[#8aebff] rounded-xl border border-[#8aebff]/20">
                                            <FlaskConical size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">Laboratorio</p>
                                            <p className="text-[10px] text-[#6B7280]">Análisis Psicodeportivo Pro</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { navigate('/portal/epsd-lite'); setShowMobileMenu(false); }}
                                        className="flex items-center gap-4 bg-[#111827] p-4 rounded-2xl border border-white/5 text-left"
                                    >
                                        <div className="p-2.5 bg-[#39FF14]/10 text-[#39FF14] rounded-xl border border-[#39FF14]/20">
                                            <Activity size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">ePsD Lite</p>
                                            <p className="text-[10px] text-[#6B7280]">Evaluación en Vivo</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { navigate('/portal/epsd-historial'); setShowMobileMenu(false); }}
                                        className="flex items-center gap-4 bg-[#111827] p-4 rounded-2xl border border-white/5 text-left"
                                    >
                                        <div className="p-2.5 bg-[#0070F3]/10 text-[#0070F3] rounded-xl border border-[#0070F3]/20">
                                            <BarChart size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">Resultados ePsD</p>
                                            <p className="text-[10px] text-[#6B7280]">Historial y Analíticas</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { navigate('/portal/sesion/nueva'); setShowMobileMenu(false); }}
                                        className="flex items-center gap-4 bg-[#111827] p-4 rounded-2xl border border-white/5 text-left"
                                    >
                                        <div className="p-2.5 bg-[#ff2d2d]/10 text-[#ff6b6b] rounded-xl border border-[#ff2d2d]/20">
                                            <Radio size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">Sesión Live</p>
                                            <p className="text-[10px] text-[#6B7280]">Sesión grupal en vivo</p>
                                        </div>
                                    </button>
                                </>
                            )}
                            {!isAdmin && userConfig.academiaId === 'neurosport' && (
                                <button
                                    onClick={() => { navigate('/portal/sesion/nueva'); setShowMobileMenu(false); }}
                                    className="flex items-center gap-4 bg-[#111827] p-4 rounded-2xl border border-white/5 text-left"
                                >
                                    <div className="p-2.5 bg-[#ff2d2d]/10 text-[#ff6b6b] rounded-xl border border-[#ff2d2d]/20">
                                        <Radio size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">Sesión Live</p>
                                        <p className="text-[10px] text-[#6B7280]">Sesión grupal en vivo</p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 lg:px-12 py-8">
                {/* Title + Stats */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
                            {isAdmin ? (
                                <>Portal <span className="text-[#0070F3]">Multi-Academia</span></>
                            ) : (
                                <>{getAcademiaName(userConfig.academiaId)}</>
                            )}
                        </h2>
                        <p className="text-[#6B7280] text-sm flex items-center gap-2">
                            <Users size={14} />
                            {players.length} jugadores registrados
                            {!isAdmin && <span className="text-[#0070F3]">• {getAcademiaName(userConfig.academiaId)}</span>}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar jugador..."
                                className="w-full sm:w-52 bg-[#111827] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-[#4B5563] outline-none focus:border-[#0070F3] transition-colors"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-1 bg-[#111827] border border-white/5 rounded-xl p-1">
                            {categorias.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                                        filterCategory === cat
                                            ? 'bg-[#0070F3] text-white'
                                            : 'text-[#6B7280] hover:text-white'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Academia Filter (solo admin) */}
                {isAdmin && (
                    <div className="flex items-center gap-2 mb-8">
                        <Building2 size={14} className="text-[#6B7280]" />
                        <div className="flex gap-1 bg-[#111827] border border-white/5 rounded-xl p-1">
                            <button
                                onClick={() => setFilterAcademia('Todas')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                                    filterAcademia === 'Todas' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'text-[#6B7280] hover:text-white'
                                }`}
                            >
                                Todas
                            </button>
                            {ACADEMIAS.map(ac => (
                                <button
                                    key={ac.id}
                                    onClick={() => setFilterAcademia(ac.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                                        filterAcademia === ac.id ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'text-[#6B7280] hover:text-white'
                                    }`}
                                >
                                    {ac.nombre}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Players Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-2 border-[#0070F3]/30 border-t-[#0070F3] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[#6B7280] text-sm">Cargando perfiles de jugadores...</p>
                        </div>
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center max-w-md">
                            <Users size={48} className="text-white/5 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">
                                {players.length === 0 ? 'Sin jugadores registrados' : 'Sin resultados'}
                            </h3>
                            <p className="text-[#6B7280] text-sm mb-6">
                                {players.length === 0
                                    ? (isAdmin ? 'Presiona el botón (+) para añadir tu primer jugador.' : 'El administrador aún no ha registrado jugadores.')
                                    : 'Intenta con otro término de búsqueda o categoría.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlayers.map(player => (
                            <div key={player.id} className="relative group">
                                <PlayerCard player={player} showAcademia={isAdmin} getAcademiaName={getAcademiaName} />
                                {/* Delete button (solo admin) */}
                                {isAdmin && (
                                    <button
                                        onClick={() => setDeleteConfirm({ id: player.id, nombre: player.nombre })}
                                        className="absolute top-3 left-3 bg-red-500/20 border border-red-500/30 text-red-400 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                        title="Eliminar jugador"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Add Button (Admin o DT) */}
            {(isAdmin || userConfig.role === 'dt') && (
                <button
                    onClick={() => setShowAddModal(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-[#0070F3] hover:bg-[#0060D0] text-white rounded-2xl shadow-2xl shadow-[#0070F3]/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-30"
                    title="Añadir jugador"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            )}

            {/* Add Player Modal */}
            <AddPlayerModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onPlayerAdded={fetchPlayers}
            />


            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#111827] border border-red-500/20 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Trash2 className="text-red-400" size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">¿Eliminar jugador?</h3>
                        <p className="text-[#6B7280] text-sm mb-6">
                            Vas a eliminar a <span className="text-white font-bold">{deleteConfirm.nombre}</span> del sistema. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-[#1F2937] hover:bg-[#374151] text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeletePlayer}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors"
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
