import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { Target, Activity, Zap, Brain, GraduationCap, Plus, Calendar, Check, ChevronDown, ChevronUp, Save, Loader2, Sparkles, Edit3 } from 'lucide-react';

const DIMENSIONES_SMART = [
    { id: 'fisica',      label: 'FÍSICA',      color: '#F97316', icon: Activity,      desc: 'Capacidades físicas, fuerza, resistencia y prevención.' },
    { id: 'rendimiento', label: 'RENDIMIENTO', color: '#39FF14', icon: Zap,           desc: 'Objetivos técnicos, tácticos y estadísticas en campo.' },
    { id: 'psicologica', label: 'PSICOLÓGICA', color: '#0070F3', icon: Brain,         desc: 'Gestión emocional, concentración y fortaleza mental.' },
    { id: 'educativa',   label: 'EDUCATIVA',   color: '#A855F7', icon: GraduationCap, desc: 'Formación académica, valores y conducta personal.' },
];

// ─── Mejora 1: SmartSection habilitado para el jugador ───────────────────────
// - isAdmin: puede definir metas y agregar seguimiento a cualquier jugador
// - canEdit: el jugador puede editar sus PROPIAS metas (cuando jugadorId === currentUser.uid)
export default function SmartSection({ jugadorId, isAdmin }) {
    const { currentUser } = useAuth();
    
    // El jugador puede editar si está viendo su propio perfil
    const canEdit = isAdmin || (currentUser?.uid === jugadorId);

    const [metas, setMetas] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandido, setExpandido] = useState(null);
    const [showNuevaMeta, setShowNuevaMeta] = useState(null);
    const [nuevaMetaTxt, setNuevaMetaTxt] = useState('');
    const [editandoMeta, setEditandoMeta] = useState(null); // dimId de meta en edición
    const [editMetaTxt, setEditMetaTxt] = useState('');
    const [showNuevoSeguimiento, setShowNuevoSeguimiento] = useState(null);
    const [nuevoSeguimiento, setNuevoSeguimiento] = useState({ progreso: 50, comentario: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!jugadorId) return;
        const cargarMetas = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'metas_smart'), where('jugadorId', '==', jugadorId));
                const snap = await getDocs(q);
                const data = {};
                snap.docs.forEach(d => {
                    const m = { id: d.id, ...d.data() };
                    data[m.dimension] = m;
                });
                setMetas(data);
            } catch (err) {
                console.error('Error al cargar metas SMART:', err);
            } finally {
                setLoading(false);
            }
        };
        cargarMetas();
    }, [jugadorId]);

    const handleCrearMeta = async (dimId) => {
        if (!nuevaMetaTxt.trim()) return;
        setIsSaving(true);
        try {
            const data = {
                jugadorId,
                dimension: dimId,
                meta: nuevaMetaTxt,
                creadaPor: currentUser?.uid,
                seguimiento: [],
                status: 'activa',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const docRef = await addDoc(collection(db, 'metas_smart'), data);
            setMetas(prev => ({ ...prev, [dimId]: { ...data, id: docRef.id } }));
            setNuevaMetaTxt('');
            setShowNuevaMeta(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditarMeta = async (dimId) => {
        const meta = metas[dimId];
        if (!meta || !editMetaTxt.trim()) return;
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'metas_smart', meta.id), {
                meta: editMetaTxt,
                updatedAt: serverTimestamp(),
            });
            setMetas(prev => ({ ...prev, [dimId]: { ...prev[dimId], meta: editMetaTxt } }));
            setEditandoMeta(null);
            setEditMetaTxt('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSeguimiento = async (dimId) => {
        const meta = metas[dimId];
        if (!meta) return;
        setIsSaving(true);
        try {
            const entry = {
                fecha: new Date().toISOString().split('T')[0],
                progreso: nuevoSeguimiento.progreso,
                comentario: nuevoSeguimiento.comentario,
                semana: (meta.seguimiento?.length || 0) + 1,
                registradoPor: currentUser?.uid,
            };
            await updateDoc(doc(db, 'metas_smart', meta.id), {
                seguimiento: arrayUnion(entry),
                updatedAt: serverTimestamp(),
            });
            setMetas(prev => {
                const updated = { ...prev[dimId] };
                updated.seguimiento = [...(updated.seguimiento || []), entry];
                return { ...prev, [dimId]: updated };
            });
            setNuevoSeguimiento({ progreso: 50, comentario: '' });
            setShowNuevoSeguimiento(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-12 text-center">
            <Loader2 className="animate-spin text-[#38BDF8] mx-auto mb-4" />
            <p className="text-[#6B7280] text-xs font-black uppercase tracking-widest">Sincronizando Metas SMART...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Aviso para el jugador si puede editar */}
            {!isAdmin && canEdit && (
                <div className="bg-[#38BDF8]/5 border border-[#38BDF8]/20 rounded-2xl px-5 py-3 flex items-center gap-3">
                    <Target size={14} className="text-[#38BDF8] shrink-0" />
                    <p className="text-[11px] text-[#38BDF8] font-bold">
                        Puedes definir tus propias metas y registrar tu avance semanal.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DIMENSIONES_SMART.map(dim => {
                    const meta = metas[dim.id];
                    const Icon = dim.icon;
                    const isOpen = expandido === dim.id;
                    const progresoActual = meta?.seguimiento?.length > 0
                        ? meta.seguimiento[meta.seguimiento.length - 1].progreso
                        : 0;

                    return (
                        <div
                            key={dim.id}
                            className={`bg-[#111827] border rounded-3xl overflow-hidden transition-all duration-500 ${isOpen ? 'ring-2 ring-white/10' : 'border-white/5 hover:border-white/10'}`}
                            style={isOpen ? { borderColor: dim.color + '40' } : {}}
                        >
                            {/* Card Header */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ backgroundColor: dim.color + '15', border: `1px solid ${dim.color}30` }}
                                    >
                                        <Icon size={24} style={{ color: dim.color }} />
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            <span className="text-[10px] font-black tracking-widest uppercase text-[#6B7280]">Progreso</span>
                                            <span className="text-sm font-black" style={{ color: dim.color }}>{progresoActual}%</span>
                                        </div>
                                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${progresoActual}%`, backgroundColor: dim.color }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: dim.color }}>{dim.label}</h4>
                                    {meta ? (
                                        // ── Meta definida: mostrar texto + botón editar ──
                                        <div className="flex items-start gap-2">
                                            <p className="text-sm text-white font-bold leading-relaxed line-clamp-2 min-h-[40px] flex-1">
                                                {meta.meta}
                                            </p>
                                            {canEdit && (
                                                <button
                                                    onClick={() => { setEditandoMeta(dim.id); setEditMetaTxt(meta.meta); }}
                                                    className="shrink-0 mt-0.5 p-1.5 rounded-lg text-[#4B5563] hover:text-white hover:bg-white/5 transition-all"
                                                    title="Editar meta"
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[#4B5563] italic min-h-[40px]">Sin meta definida aún.</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => setExpandido(isOpen ? null : dim.id)}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        {isOpen ? 'Cerrar detalles' : 'Ver seguimiento'}
                                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>

                                    {/* ── Mejora 1: canEdit en lugar de solo isAdmin ── */}
                                    {!meta && canEdit && (
                                        <button
                                            onClick={() => setShowNuevaMeta(dim.id)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#bbc9cd] flex items-center gap-2"
                                        >
                                            <Plus size={12} /> Definir SMART
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isOpen && (
                                <div className="px-6 pb-6 space-y-6 animate-in slide-in-from-top-2 duration-300 border-t border-white/5 mt-2 pt-6">
                                    {/* Gráfico de progreso */}
                                    <div className="bg-[#0A0F1E] rounded-2xl p-4">
                                        <p className="text-[9px] font-black text-[#4B5563] uppercase tracking-widest mb-4">Línea de tiempo · Semanas</p>
                                        <div className="flex items-end gap-2 h-20">
                                            {meta?.seguimiento?.length > 0 ? (
                                                meta.seguimiento.map((s, i) => (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                                        <div
                                                            className="w-full rounded-t-md transition-all duration-500"
                                                            style={{ height: `${s.progreso}%`, backgroundColor: dim.color, opacity: 0.6 + (i / meta.seguimiento.length) * 0.4 }}
                                                        />
                                                        <span className="text-[8px] font-black text-[#4B5563]">S{s.semana}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <p className="text-[10px] text-[#4B5563] italic text-center">Inicia el seguimiento semanal para visualizar tendencias</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Lista de avances */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Estado por Semana</h5>
                                            {/* ── Mejora 1: canEdit permite agregar seguimiento ── */}
                                            {canEdit && meta && (
                                                <button
                                                    onClick={() => setShowNuevoSeguimiento(dim.id)}
                                                    className="w-7 h-7 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center hover:bg-[#38BDF8]/20 transition-all"
                                                    title="Registrar avance"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                            {meta?.seguimiento?.slice().reverse().map((entry, idx) => (
                                                <div key={idx} className="bg-white/2 rounded-xl p-3 border border-white/5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[9px] font-black text-[#6B7280] uppercase">Semana {entry.semana} · {entry.fecha}</span>
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5" style={{ color: dim.color }}>{entry.progreso}%</span>
                                                    </div>
                                                    <p className="text-xs text-[#bbc9cd] leading-relaxed">{entry.comentario}</p>
                                                </div>
                                            ))}
                                            {(!meta?.seguimiento || meta.seguimiento.length === 0) && (
                                                <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl">
                                                    <Calendar size={24} className="text-white/5 mx-auto mb-2" />
                                                    <p className="text-[10px] text-[#4B5563] uppercase font-black">Esperando primer reporte</p>
                                                    {/* ── Mejora 1: llamado a acción para el jugador ── */}
                                                    {canEdit && meta && (
                                                        <button
                                                            onClick={() => setShowNuevoSeguimiento(dim.id)}
                                                            className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#38BDF8] flex items-center gap-1.5 mx-auto"
                                                        >
                                                            <Plus size={11} /> Registrar primer avance
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Modal: Definir nueva meta ── */}
                            {showNuevaMeta === dim.id && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                                    <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: dim.color + '15' }}>
                                                <Icon size={24} style={{ color: dim.color }} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Definir Meta SMART</h3>
                                                <p className="text-xs text-[#6B7280] uppercase font-black tracking-widest">{dim.label}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[11px] text-[#9CA3AF] leading-relaxed italic border-l-2 border-[#38BDF8] pl-3">
                                                Una meta SMART es Específica, Medible, Alcanzable, Relevante y con un Tiempo definido.
                                            </p>
                                            <textarea
                                                value={nuevaMetaTxt}
                                                onChange={e => setNuevaMetaTxt(e.target.value)}
                                                className="w-full h-32 bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 outline-none focus:border-[#38BDF8] transition-all resize-none"
                                                placeholder="Ej: Aumentar velocidad de desplazamiento en 0.5s en los test de 20m antes del final del trimestre..."
                                                autoFocus
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setShowNuevaMeta(null); setNuevaMetaTxt(''); }}
                                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleCrearMeta(dim.id)}
                                                disabled={isSaving || !nuevaMetaTxt.trim()}
                                                className="flex-1 py-4 bg-[#38BDF8] hover:bg-[#29ABE2] disabled:opacity-40 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                Guardar Meta
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Modal: Editar meta existente ── */}
                            {editandoMeta === dim.id && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                                    <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: dim.color + '15' }}>
                                                <Edit3 size={24} style={{ color: dim.color }} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Editar Meta</h3>
                                                <p className="text-xs text-[#6B7280] uppercase font-black tracking-widest">{dim.label}</p>
                                            </div>
                                        </div>

                                        <textarea
                                            value={editMetaTxt}
                                            onChange={e => setEditMetaTxt(e.target.value)}
                                            className="w-full h-32 bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 outline-none focus:border-[#38BDF8] transition-all resize-none"
                                            autoFocus
                                        />

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setEditandoMeta(null); setEditMetaTxt(''); }}
                                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleEditarMeta(dim.id)}
                                                disabled={isSaving || !editMetaTxt.trim()}
                                                className="flex-1 py-4 bg-[#38BDF8] hover:bg-[#29ABE2] disabled:opacity-40 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                Actualizar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Modal: Nuevo seguimiento ── */}
                            {showNuevoSeguimiento === dim.id && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                                    <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: dim.color + '15' }}>
                                                <Sparkles size={24} style={{ color: dim.color }} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Seguimiento Semanal</h3>
                                                <p className="text-xs text-[#6B7280] uppercase font-black tracking-widest">{dim.label}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className="text-[10px] font-black uppercase text-[#6B7280]">Estado de avance</label>
                                                    <span className="text-base font-black" style={{ color: dim.color }}>{nuevoSeguimiento.progreso}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="100" step="5"
                                                    value={nuevoSeguimiento.progreso}
                                                    onChange={e => setNuevoSeguimiento({ ...nuevoSeguimiento, progreso: parseInt(e.target.value) })}
                                                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#38BDF8]"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-[#6B7280]">Comentarios y hallazgos</label>
                                                <textarea
                                                    value={nuevoSeguimiento.comentario}
                                                    onChange={e => setNuevoSeguimiento({ ...nuevoSeguimiento, comentario: e.target.value })}
                                                    className="w-full h-24 bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 outline-none focus:border-[#38BDF8] transition-all resize-none"
                                                    placeholder="Detalla tu progreso, dificultades o ajustes realizados esta semana..."
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setShowNuevoSeguimiento(null); setNuevoSeguimiento({ progreso: 50, comentario: '' }); }}
                                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleAddSeguimiento(dim.id)}
                                                disabled={isSaving || !nuevoSeguimiento.comentario.trim()}
                                                className="flex-1 py-4 bg-[#39FF14] hover:bg-[#22C55E] disabled:opacity-40 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                Registrar Avance
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
