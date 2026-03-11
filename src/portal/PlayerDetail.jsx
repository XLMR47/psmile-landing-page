import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getUserConfig } from './academyConfig';
import {
    Brain, ArrowLeft, Edit3, Save, X, Upload, FileText, Plus,
    Calendar, Clock, CheckCircle, Circle, User, Loader, Trash2, Shield
} from 'lucide-react';

export default function PlayerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig.role === 'admin';

    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [pinAuthenticated, setPinAuthenticated] = useState(false);

    // Reports
    const [reportes, setReportes] = useState([]);
    const [showAddReport, setShowAddReport] = useState(false);
    const [newReportFile, setNewReportFile] = useState(null);
    const [newReportTitle, setNewReportTitle] = useState('');
    const [uploadingReport, setUploadingReport] = useState(false);

    // Sessions
    const [sesiones, setSesiones] = useState([]);
    const [showAddSession, setShowAddSession] = useState(false);
    const [newSession, setNewSession] = useState({ fecha: '', hora: '', tipo: 'Evaluación', notas: '' });
    const [savingSession, setSavingSession] = useState(false);

    // Report viewer
    const [viewingReport, setViewingReport] = useState(null);

    // New photo upload
    const [newPhotoFile, setNewPhotoFile] = useState(null);
    const [newPhotoPreview, setNewPhotoPreview] = useState(null);

    const tiposSesion = ['Evaluación', 'Intervención', 'Seguimiento', 'Sesión grupal'];
    const cargos = ['Director Técnico', 'Asistente Técnico', 'Preparador Físico', 'Kinesiólogo', 'Coordinador'];
    const isStaff = player?.tipo === 'staff';
    const accentColor = isStaff ? '#F59E0B' : '#0070F3';

    // Fetch player data
    const fetchPlayer = async () => {
        try {
            const snap = await getDoc(doc(db, 'jugadores', id));
            if (snap.exists()) {
                const pData = snap.data();
                
                if (pData.pin && !isAdmin) {
                    const savedPin = sessionStorage.getItem(`pin_${id}`);
                    if (savedPin === pData.pin) {
                        setPinAuthenticated(true);
                    } else {
                        const enteredPin = prompt('🔒 Perfil protegido. Introduce la contraseña para acceder:');
                        if (enteredPin === pData.pin) {
                            sessionStorage.setItem(`pin_${id}`, enteredPin);
                            setPinAuthenticated(true);
                        } else {
                            if (enteredPin !== null) alert('Contraseña incorrecta.');
                            navigate('/portal/dashboard');
                            return;
                        }
                    }
                } else {
                    setPinAuthenticated(true);
                }

                setPlayer({ id: snap.id, ...pData });
                setEditData(pData);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch reports
    const fetchReportes = async () => {
        try {
            const q = query(collection(db, 'jugadores', id, 'reportes'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setReportes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error('Error fetching reportes:', err);
        }
    };

    // Fetch sessions
    const fetchSesiones = async () => {
        try {
            const q = query(collection(db, 'jugadores', id, 'sesiones'), orderBy('fecha', 'asc'));
            const snap = await getDocs(q);
            setSesiones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error('Error fetching sesiones:', err);
        }
    };

    useEffect(() => {
        fetchPlayer();
        fetchReportes();
        fetchSesiones();
    }, [id]);

    // Save edited player data
    const handleSave = async () => {
        setSaving(true);
        try {
            let photoURL = player.photoURL;

            if (newPhotoFile) {
                const timestamp = Date.now();
                const photoRef = ref(storage, `jugadores/fotos/${player.academiaId}/${timestamp}_${newPhotoFile.name}`);
                const snap = await uploadBytes(photoRef, newPhotoFile);
                photoURL = await getDownloadURL(snap.ref);
            }

            const updateData = {
                nombre: editData.nombre,
                photoURL
            };
            if (isStaff) {
                updateData.cargo = editData.cargo;
                updateData.pin = editData.pin || '';
            } else {
                updateData.categoria = editData.categoria;
            }
            await updateDoc(doc(db, 'jugadores', id), updateData);

            setEditing(false);
            setNewPhotoFile(null);
            setNewPhotoPreview(null);
            await fetchPlayer();
        } catch (err) {
            console.error('Error saving:', err);
            alert('Error al guardar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Add new report
    const handleAddReport = async () => {
        if (!newReportFile || !newReportTitle) return;
        setUploadingReport(true);
        try {
            const timestamp = Date.now();
            const reportRef = ref(storage, `jugadores/reportes/${player.academiaId}/${timestamp}_${newReportFile.name}`);
            const snap = await uploadBytes(reportRef, newReportFile);
            const url = await getDownloadURL(snap.ref);

            await addDoc(collection(db, 'jugadores', id, 'reportes'), {
                titulo: newReportTitle,
                reporteURL: url,
                fecha: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }),
                createdAt: new Date().toISOString()
            });

            // Also update the main player reporteURL to the latest
            await updateDoc(doc(db, 'jugadores', id), { reporteURL: url });

            setNewReportFile(null);
            setNewReportTitle('');
            setShowAddReport(false);
            await fetchReportes();
            await fetchPlayer();
        } catch (err) {
            console.error('Error uploading report:', err);
            alert('Error al subir reporte: ' + err.message);
        } finally {
            setUploadingReport(false);
        }
    };

    // Add session
    const handleAddSession = async () => {
        if (!newSession.fecha || !newSession.hora) return;
        setSavingSession(true);
        try {
            await addDoc(collection(db, 'jugadores', id, 'sesiones'), {
                ...newSession,
                completada: false,
                createdAt: new Date().toISOString()
            });
            setNewSession({ fecha: '', hora: '', tipo: 'Evaluación', notas: '' });
            setShowAddSession(false);
            await fetchSesiones();
        } catch (err) {
            console.error('Error adding session:', err);
            alert('Error: ' + err.message);
        } finally {
            setSavingSession(false);
        }
    };

    // Toggle session completed
    const toggleSession = async (sesion) => {
        if (!isAdmin) return;
        try {
            await updateDoc(doc(db, 'jugadores', id, 'sesiones', sesion.id), {
                completada: !sesion.completada
            });
            await fetchSesiones();
        } catch (err) {
            console.error('Error:', err);
        }
    };

    // Delete session
    const deleteSession = async (sesionId) => {
        if (!isAdmin) return;
        try {
            await deleteDoc(doc(db, 'jugadores', id, 'sesiones', sesionId));
            await fetchSesiones();
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setNewPhotoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-[#0070F3]/30 border-t-[#0070F3] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!player || !pinAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
                <p className="text-[#6B7280]">Jugador no encontrado o acceso denegado.</p>
            </div>
        );
    }

    // Separate upcoming vs past sessions
    const today = new Date().toISOString().split('T')[0];
    const upcoming = sesiones.filter(s => !s.completada && s.fecha >= today);
    const completed = sesiones.filter(s => s.completada);

    return (
        <div className="min-h-screen bg-[#0A0F1E]">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
                    <button onClick={() => navigate('/portal/dashboard')} className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-sm">
                        <ArrowLeft size={16} />
                        Volver al Dashboard
                    </button>
                    <div className="flex items-center gap-2">
                        <Brain className="text-[#0070F3]" size={18} />
                        <span className="text-xs font-black text-white tracking-tight">PSMILE <span className="text-[#0070F3]">INTELLIGENCE</span></span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 lg:px-12 py-8 max-w-5xl">
                {/* Player Header */}
                <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden mb-8">
                    <div className="flex flex-col md:flex-row">
                        {/* Photo */}
                        <div className="relative w-full md:w-56 h-56 bg-[#0A0F1E] shrink-0">
                            {editing ? (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                                    {newPhotoPreview || player.photoURL ? (
                                        <img src={newPhotoPreview || player.photoURL} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center">
                                            <Upload size={24} className="mx-auto text-[#6B7280] mb-2" />
                                            <p className="text-xs text-[#6B7280]">Cambiar foto</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            ) : player.photoURL ? (
                                <img src={player.photoURL} alt={player.nombre} className="w-full h-full object-cover object-top" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    {isStaff ? <Shield size={64} className="text-[#F59E0B]/10" /> : <User size={64} className="text-white/10" />}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-6">
                            {editing ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editData.nombre || ''}
                                        onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-[#0070F3]"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {isStaff ? cargos.map(cargo => (
                                            <button
                                                key={cargo}
                                                type="button"
                                                onClick={() => setEditData({ ...editData, cargo })}
                                                className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                                                    editData.cargo === cargo
                                                        ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]'
                                                        : 'bg-[#0A0F1E] border-white/10 text-[#6B7280]'
                                                }`}
                                            >
                                                {cargo}
                                            </button>
                                        )) : ['Sub-13', 'Sub-15', 'Sub-17', 'Sub-20'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setEditData({ ...editData, categoria: cat })}
                                                className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                                                    editData.categoria === cat
                                                        ? 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]'
                                                        : 'bg-[#0A0F1E] border-white/10 text-[#6B7280]'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                        {isStaff && (
                                            <div className="mt-4">
                                                <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">PIN de Acceso</label>
                                                <input
                                                    type="text"
                                                    value={editData.pin || ''}
                                                    onChange={(e) => setEditData({ ...editData, pin: e.target.value })}
                                                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#F59E0B]"
                                                    placeholder="Sin contraseña"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#0070F3] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-[#0060D0] transition-colors disabled:opacity-50">
                                            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                                            {saving ? 'Guardando...' : 'Guardar'}
                                        </button>
                                        <button onClick={() => { setEditing(false); setNewPhotoFile(null); setNewPhotoPreview(null); }} className="text-xs text-[#6B7280] hover:text-white px-4 py-2.5 rounded-xl border border-white/10 transition-colors">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h2 className="text-2xl font-black text-white">{player.nombre}</h2>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${isStaff ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]/30'}`}>
                                                    {isStaff ? (player.cargo || 'Staff') : player.categoria}
                                                </span>
                                                {player.academiaId && (
                                                    <span className="bg-[#39FF14]/10 text-[#39FF14] text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-[#39FF14]/30">
                                                        {player.academiaId}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-[#6B7280] hover:text-[#0070F3] text-xs transition-colors border border-white/10 rounded-xl px-3 py-2">
                                                <Edit3 size={14} /> Editar
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 text-[#6B7280] text-xs">
                                        {isStaff ? <Shield size={12} className="text-[#F59E0B]" /> : <Brain size={12} className="text-[#0070F3]" />}
                                        <span>{reportes.length} {isStaff ? 'documentos' : 'reportes'}</span>
                                        <span className="text-white/10">•</span>
                                        <Calendar size={12} className="text-[#0070F3]" />
                                        <span>{upcoming.length} sesiones programadas</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: Report History */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                <FileText size={18} className={`text-[${accentColor}]`} />
                                {isStaff ? 'Documentos del Staff' : 'Historial de Reportes'}
                            </h3>
                            {isAdmin && (
                                <button onClick={() => setShowAddReport(!showAddReport)} className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#0070F3] hover:text-white transition-colors">
                                    <Plus size={14} /> Nuevo Reporte
                                </button>
                            )}
                        </div>

                        {/* Add Report Form */}
                        {showAddReport && (
                            <div className="bg-[#111827] border border-[#0070F3]/20 rounded-xl p-5 mb-4 space-y-4">
                                <input
                                    type="text"
                                    value={newReportTitle}
                                    onChange={(e) => setNewReportTitle(e.target.value)}
                                    placeholder="Título del reporte (ej: Evaluación Marzo 2026)"
                                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-[#0070F3]"
                                />
                                <label className="flex items-center justify-center gap-3 w-full bg-[#0A0F1E] border border-dashed border-white/10 rounded-xl px-4 py-3.5 cursor-pointer hover:border-[#0070F3]/50 transition-colors group">
                                    <Upload size={16} className="text-[#6B7280] group-hover:text-[#0070F3]" />
                                    <span className="text-xs text-[#6B7280] group-hover:text-white truncate">
                                        {newReportFile ? `📄 ${newReportFile.name}` : 'Seleccionar archivo HTML'}
                                    </span>
                                    <input type="file" accept=".html,.htm,.pdf" className="hidden" onChange={(e) => setNewReportFile(e.target.files[0])} />
                                </label>
                                <div className="flex gap-2">
                                    <button onClick={handleAddReport} disabled={uploadingReport || !newReportFile || !newReportTitle} className="flex-1 bg-[#0070F3] text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                        {uploadingReport ? <><Loader size={14} className="animate-spin" /> Subiendo...</> : <><Upload size={14} /> Subir Reporte</>}
                                    </button>
                                    <button onClick={() => setShowAddReport(false)} className="px-4 text-[#6B7280] hover:text-white text-xs border border-white/10 rounded-xl">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Report Timeline */}
                        {reportes.length === 0 ? (
                            <div className="bg-[#111827] border border-white/5 rounded-xl p-8 text-center">
                                <FileText size={32} className="text-white/5 mx-auto mb-3" />
                                <p className="text-[#6B7280] text-sm">Sin reportes cargados aún</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reportes.map((rep, idx) => (
                                    <div key={rep.id} className="bg-[#111827] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-[#0070F3]/20 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${idx === 0 ? 'bg-[#0070F3]/10 border border-[#0070F3]/30' : 'bg-white/5 border border-white/5'}`}>
                                                <FileText size={16} className={idx === 0 ? 'text-[#0070F3]' : 'text-[#6B7280]'} />
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-bold flex items-center gap-2">
                                                    {rep.titulo}
                                                    {idx === 0 && <span className="text-[9px] bg-[#39FF14]/10 text-[#39FF14] px-2 py-0.5 rounded-full font-black tracking-widest">ÚLTIMO</span>}
                                                </p>
                                                <p className="text-[#6B7280] text-[11px]">{rep.fecha}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setViewingReport(rep)}
                                            className="text-xs text-[#0070F3] hover:text-white font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-[#0070F3]/20 hover:bg-[#0070F3] transition-all opacity-70 group-hover:opacity-100"
                                        >
                                            Ver
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Sessions */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                <Calendar size={18} className="text-[#0070F3]" />
                                Sesiones
                            </h3>
                            {isAdmin && (
                                <button onClick={() => setShowAddSession(!showAddSession)} className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#0070F3] hover:text-white transition-colors">
                                    <Plus size={14} />
                                </button>
                            )}
                        </div>

                        {/* Add Session Form */}
                        {showAddSession && (
                            <div className="bg-[#111827] border border-[#0070F3]/20 rounded-xl p-4 mb-4 space-y-3">
                                <input type="date" value={newSession.fecha} onChange={(e) => setNewSession({ ...newSession, fecha: e.target.value })} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#0070F3] [color-scheme:dark]" />
                                <input type="time" value={newSession.hora} onChange={(e) => setNewSession({ ...newSession, hora: e.target.value })} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#0070F3] [color-scheme:dark]" />
                                <div className="grid grid-cols-2 gap-1.5">
                                    {tiposSesion.map(tipo => (
                                        <button key={tipo} type="button" onClick={() => setNewSession({ ...newSession, tipo })}
                                            className={`px-2 py-2 rounded-lg text-[10px] font-bold border transition-all ${newSession.tipo === tipo ? 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]' : 'bg-[#0A0F1E] border-white/10 text-[#6B7280]'}`}>
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                                <input type="text" value={newSession.notas} onChange={(e) => setNewSession({ ...newSession, notas: e.target.value })} placeholder="Notas (opcional)" className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-[#0070F3]" />
                                <button onClick={handleAddSession} disabled={savingSession || !newSession.fecha || !newSession.hora} className="w-full bg-[#0070F3] text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl disabled:opacity-50">
                                    {savingSession ? 'Guardando...' : 'Agendar Sesión'}
                                </button>
                            </div>
                        )}

                        {/* Upcoming Sessions */}
                        {upcoming.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] text-[#6B7280] font-bold tracking-widest uppercase mb-2">Próximas</p>
                                <div className="space-y-2">
                                    {upcoming.map(s => (
                                        <div key={s.id} className="bg-[#111827] border border-white/5 rounded-xl p-3 flex items-center gap-3 group">
                                            {isAdmin && (
                                                <button onClick={() => toggleSession(s)} className="shrink-0">
                                                    <Circle size={18} className="text-[#0070F3]" />
                                                </button>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-bold">{s.tipo}</p>
                                                <p className="text-[#6B7280] text-[10px] flex items-center gap-1.5">
                                                    <Calendar size={10} /> {s.fecha}
                                                    <Clock size={10} className="ml-1" /> {s.hora}
                                                </p>
                                                {s.notas && <p className="text-[#4B5563] text-[10px] mt-1 truncate">{s.notas}</p>}
                                            </div>
                                            {isAdmin && (
                                                <button onClick={() => deleteSession(s.id)} className="text-[#4B5563] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Sessions */}
                        {completed.length > 0 && (
                            <div>
                                <p className="text-[10px] text-[#6B7280] font-bold tracking-widest uppercase mb-2">Completadas</p>
                                <div className="space-y-2">
                                    {completed.map(s => (
                                        <div key={s.id} className="bg-[#111827]/50 border border-white/5 rounded-xl p-3 flex items-center gap-3 opacity-60">
                                            {isAdmin && (
                                                <button onClick={() => toggleSession(s)} className="shrink-0">
                                                    <CheckCircle size={18} className="text-[#39FF14]" />
                                                </button>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-bold line-through">{s.tipo}</p>
                                                <p className="text-[#6B7280] text-[10px]">{s.fecha} • {s.hora}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {sesiones.length === 0 && !showAddSession && (
                            <div className="bg-[#111827] border border-white/5 rounded-xl p-6 text-center">
                                <Calendar size={28} className="text-white/5 mx-auto mb-2" />
                                <p className="text-[#6B7280] text-xs">Sin sesiones programadas</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Report Viewer Modal */}
            {viewingReport && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div>
                                <h3 className="text-white font-bold">{viewingReport.titulo}</h3>
                                <p className="text-[10px] text-[#0070F3] uppercase tracking-widest font-bold">{player.nombre} — {viewingReport.fecha}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={viewingReport.reporteURL} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6B7280] hover:text-white transition-colors px-3 py-1.5 border border-white/10 rounded-lg">
                                    Abrir en nueva pestaña
                                </a>
                                <button onClick={() => setViewingReport(null)} className="text-[#6B7280] hover:text-white transition-colors p-1.5">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <iframe src={viewingReport.reporteURL} className="flex-1 w-full rounded-b-2xl" title={viewingReport.titulo} />
                    </div>
                </div>
            )}
        </div>
    );
}
