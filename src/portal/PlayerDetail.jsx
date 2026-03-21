import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, orderBy, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getUserConfig } from './academyConfig';
import { 
    ArrowLeft, ChevronRight, Activity, Calendar, Download, FileText, User, Plus, Edit2, 
    Check, X, Printer, Brain, BarChart, Zap, Heart, Shield, Upload, Clock, CheckCircle, 
    Circle, Loader, Trash2, Edit3, Save, FlaskConical, Sparkles, Target, Lock, AlertCircle, ArrowRight
} from 'lucide-react';
import EpsdEliteReport from './EpsdEliteReport';
import PsicometriaSection from '../PsicometriaSection';
import SmartSection from '../components/SmartSection';
import PinModal from './PinModal';

export default function PlayerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig.role === 'admin' || userConfig.role === 'dt';
    const isSuperAdmin = userConfig.role === 'admin' && userConfig.academiaId === null;

    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [selectedEpsd, setSelectedEpsd] = useState(null);
    const [pinAuthenticated, setPinAuthenticated] = useState(false);
    const [showEditPin, setShowEditPin] = useState(false);
    const [newPin, setNewPin] = useState('');

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

    // ePsD Evaluations for this player
    const [evalsEpsd, setEvalsEpsd] = useState([]);
    
    // Test assignment logic
    const [showAsignarTest, setShowAsignarTest] = useState(false);
    const [testSeleccionado, setTestSeleccionado] = useState('');
    const [pendingTests, setPendingTests] = useState([]);

    const TESTS_DISPONIBLES = [
        { id: 'epi', nombre: 'EPI — Personalidad' },
        { id: 'motivacion', nombre: 'Cualidades Motivacionales' },
        { id: 'csai2', nombre: 'CSAI-2 — Ansiedad' },
        { id: 'nivel_preparacion', nombre: 'Nivel de Preparación' },
        { id: 'tabla_atencion', nombre: 'Tabla de Atención' },
    ];

    const asignarTest = async () => {
        if (!testSeleccionado) return;
        try {
            await addDoc(collection(db, 'tests_asignados'), {
                jugadorId: id,
                testId: testSeleccionado,
                estado: 'pendiente',
                asignadoPor: currentUser?.email,
                timestamp: new Date().toISOString(), // Use simple ISO string if serverTimestamp is not imported identically
            });
            setShowAsignarTest(false);
            setTestSeleccionado('');
            await fetchPendingTests();
            alert('✅ Test asignado al jugador');
        } catch (err) {
            console.error('Error al asignar test:', err);
            alert('Error al asignar test');
        }
    };

    const tiposSesion = ['Evaluación', 'Intervención', 'Psicología 1:1', 'Seguimiento', 'Sesión grupal'];
    const cargos = ['Director Técnico', 'Asistente Técnico', 'Preparador Físico', 'Kinesiólogo', 'Coordinador'];
    const isStaff = player?.tipo === 'staff';
    const accentColor = isStaff ? '#F59E0B' : '#0070F3';

    // Fetch player data
    const fetchPlayer = async () => {
        try {
            const snap = await getDoc(doc(db, 'jugadores', id));
            if (snap.exists()) {
                const pData = snap.data();
                
                // AISLAMIENTO DE DATOS: Verificar si el admin tiene acceso a esta academia
                if (userConfig.academiaId !== null && pData.academiaId !== userConfig.academiaId) {
                    console.error("[SECURITY] Acceso denegado a academia externa");
                    navigate('/portal/dashboard');
                    return;
                }

                if (pData.pin && !isAdmin) {
                    const savedPin = sessionStorage.getItem(`pin_${id}`);
                    if (savedPin === pData.pin) {
                        setPinAuthenticated(true);
                    } else {
                        // El modal se encargará de pedirlo
                        setPinAuthenticated(false);
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

    const fetchEvalsEpsd = async () => {
        try {
            const q = query(
                collection(db, 'evaluaciones_epsd'), 
                where('jugadorId', '==', id)
            );
            const snap = await getDocs(q);
            let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            list.sort((a, b) => {
                const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0));
                const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0));
                return dateB - dateA;
            });
            
            setEvalsEpsd(list);
        } catch (err) {
            console.error('Error fetching ePsD evals:', err);
        }
    };

    const fetchPendingTests = async () => {
        try {
            const q = query(
                collection(db, 'tests_asignados'),
                where('jugadorId', '==', id),
                where('estado', '==', 'pendiente')
            );
            const snap = await getDocs(q);
            setPendingTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Error fetching pending tests:", err);
        }
    };

    useEffect(() => {
        fetchPlayer();
        fetchReportes();
        fetchSesiones();
        fetchEvalsEpsd();
        fetchPendingTests();
    }, [id]);

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

    const handleDeleteEpsd = async (e, evalId) => {
        e.stopPropagation();
        if (!window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) return;
        try {
            await deleteDoc(doc(db, 'evaluaciones_epsd', evalId));
            setEvalsEpsd(prev => prev.filter(ev => ev.id !== evalId));
        } catch (err) {
            console.error("Error deleting evaluation:", err);
            alert("Error al eliminar el reporte");
        }
    };

    const handleUpdatePin = async () => {
        try {
            setSaving(true);
            await updateDoc(doc(db, 'jugadores', id), {
                pin: newPin
            });
            sessionStorage.setItem(`pin_${id}`, newPin);
            setShowEditPin(false);
            setNewPin('');
            await fetchPlayer();
            alert('✅ Contraseña de privacidad actualizada');
        } catch (err) {
            console.error("Error updating pin:", err);
            alert("Error al actualizar la contraseña");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-[#0070F3]/30 border-t-[#0070F3] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
                <p className="text-[#6B7280]">Jugador no encontrado.</p>
            </div>
        );
    }

    if (!pinAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0A0F1E]">
                <PinModal
                    isOpen={true}
                    onClose={() => navigate('/portal/dashboard')}
                    onConfirm={(pin) => {
                        sessionStorage.setItem(`pin_${id}`, pin);
                        setPinAuthenticated(true);
                    }}
                    player={player}
                />
            </div>
        );
    }

    const today = new Date().toISOString().split('T')[0];
    const upcoming = sesiones.filter(s => !s.completada && s.fecha >= today);
    const completed = sesiones.filter(s => s.completada);
    const lastSession = sesiones.filter(s => s.tipo === 'Psicología 1:1' && s.completada).pop() || sesiones.filter(s => s.completada).pop();

    return (
        <div className="min-h-screen bg-[#0A0F1E]">
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
                <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden mb-8">
                    <div className="flex flex-col md:flex-row">
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
                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4 text-[#6B7280] text-xs">
                                        <div className="flex items-center gap-1.5">
                                            {isStaff ? <Shield size={12} className="text-[#F59E0B]" /> : <Brain size={12} className="text-[#0070F3]" />}
                                            <span>{reportes.length} {isStaff ? 'documentos' : 'reportes'}</span>
                                        </div>
                                        <span className="text-white/10 hidden sm:inline">•</span>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-[#0070F3]" />
                                            <span>{upcoming.length} sesiones programadas</span>
                                        </div>
                                        {lastSession && (
                                            <>
                                                <span className="text-white/10 hidden sm:inline">•</span>
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0070F3]/5 border border-[#0070F3]/10 rounded-md">
                                                    <span className="text-[10px] font-bold text-[#0070F3]">Psicología 1:1:</span>
                                                    <span className="text-white font-medium">{lastSession.fecha}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tests Pendientes - NEW SECTION */}
                {pendingTests.length > 0 && (
                    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="text-[#F59E0B]" size={18} />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Evaluaciones Pendientes</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingTests.map(test => (
                                <button
                                    key={test.id}
                                    onClick={() => navigate(`/portal/${test.testId}?jugadorId=${id}&asignadoId=${test.id}`)}
                                    className="group relative bg-gradient-to-br from-[#111827] to-[#0A0F1E] border border-[#F59E0B]/30 hover:border-[#F59E0B] rounded-[2rem] p-6 text-left transition-all hover:scale-[1.02] shadow-xl shadow-orange-500/5 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-[#F59E0B]/10 rounded-2xl border border-[#F59E0B]/20 flex items-center justify-center shrink-0">
                                            <FlaskConical className="text-[#F59E0B]" size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-white text-lg font-black uppercase tracking-tight">
                                                {TESTS_DISPONIBLES.find(t => t.id === test.testId)?.nombre || test.testId}
                                            </h4>
                                            <p className="text-[#6B7280] text-[10px] font-black uppercase tracking-widest mt-1">
                                                Acción requerida inmediata
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-black uppercase tracking-widest pr-4">
                                        Comenzar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* ePsD Elite Analysis Section - SOLO PARA SUPER-ADMIN PSMILE */}
                {!isStaff && isSuperAdmin && (
                    <div className="mt-6 mb-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                            <div className="flex items-center gap-4 mb-6 md:mb-0">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#39FF14]/20 to-[#0070F3]/20 flex items-center justify-center border border-[#39FF14]/30 shadow-[0_0_30px_rgba(57,255,20,0.15)] shrink-0">
                                    <Zap size={28} className="text-[#39FF14]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-widest uppercase tracking-tighter">Inteligencia ePsD Elite</h3>
                                    <p className="text-[10px] text-[#39FF14] uppercase tracking-[0.3em] font-black mt-1">Análisis de rendimiento en tiempo real</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/portal/epsd-historial?jugadorId=${id}`)}
                                className="flex items-center gap-3 text-xs font-black tracking-widest uppercase bg-[#0070F3] hover:bg-[#39FF14] hover:text-[#0A0F1E] text-white px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(0,112,243,0.3)] group"
                            >
                                VER PANEL ANALÍTICO COMPLETO <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {evalsEpsd.length === 0 ? (
                            <div className="bg-[#111827] border border-dashed border-white/10 rounded-[2rem] p-16 text-center">
                                <Activity size={60} className="text-white/5 mx-auto mb-6" />
                                <p className="text-[#6B7280] text-sm max-w-sm mx-auto">Este jugador aún no cuenta con evaluaciones registradas mediante el sistema ePsD Elite.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {evalsEpsd.slice(0, 2).map((ev) => (
                                    <div key={ev.id} className="relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#0A0F1E] border border-white/10 rounded-[2.5rem] p-8 hover:border-[#39FF14]/40 transition-all cursor-pointer group shadow-2xl" onClick={() => setSelectedEpsd(ev)}>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="px-4 py-2 bg-[#39FF14]/10 text-[#39FF14] text-[10px] font-black tracking-widest uppercase rounded-xl border border-[#39FF14]/20">
                                                    📅 {ev.contexto?.fecha}
                                                </div>
                                                {ev.aiAnalysis ? (
                                                    <div className="px-3 py-1 bg-[#39FF14]/20 text-[#39FF14] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#39FF14]/40 flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                                                        <Brain size={10} /> IA LISTA
                                                    </div>
                                                ) : (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] shadow-[0_0_15px_#39FF14] animate-pulse"></div>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <button 
                                                    onClick={(e) => handleDeleteEpsd(e, ev.id)}
                                                    className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="mb-8">
                                            <h4 className="text-white text-2xl font-black mb-2 group-hover:text-[#39FF14] transition-colors">{ev.contexto?.torneo}</h4>
                                            <p className="text-[#6B7280] text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                vs {ev.contexto?.rival}
                                            </p>
                                        </div>
                                        
                                        {(() => {
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
                                            
                                            let scores = { c: 0, e: 0, s: 0 };
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
                                                    
                                                    let sumaAvg = 0, cont = 0;
                                                    keys.forEach(k => {
                                                        const data = ev.respuestas[k];
                                                        if (!data) return;
                                                        let sN = 0, cN = 0;
                                                        ["0-25", "26-45", "45-70", "71-90"].forEach(int => {
                                                            const intData = data[int];
                                                            if (intData && typeof intData === 'object' && intData.nivel) { sN += intData.nivel; cN++; }
                                                        });
                                                        if (cN > 0) { sumaAvg += (sN / cN); cont++; }
                                                    });
                                                    
                                                    const promSub = cont > 0 ? (sumaAvg / cont) : 0;
                                                    const indiceSub = promSub * 20;
                                                    const ponderado = (indiceSub * w) / 100;
                                                    totalDominio += ponderado;
                                                });
                                                const res = weightSum > 0 ? Math.min(100, (totalDominio / weightSum) * 100).toFixed(0) : '0';
                                                if (dominio === "COGNITIVO") scores.c = res;
                                                if (dominio === "EMOCIONAL") scores.e = res;
                                                if (dominio === "SOCIAL") scores.s = res;
                                            });

                                            return (
                                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                                    <div className="bg-black/40 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-white/5 backdrop-blur-sm group-hover:border-[#0070F3]/30 transition-all text-center">
                                                        <span className="block text-[8px] font-black text-[#6B7280] tracking-widest uppercase mb-1">COGNITIVO</span>
                                                        <div className="flex items-baseline justify-center gap-1">
                                                            <span className="text-xl sm:text-3xl font-black text-white leading-none">{scores.c}</span>
                                                            <span className="text-[10px] font-bold text-[#6B7280]">/ 100%</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-black/40 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-white/5 backdrop-blur-sm group-hover:border-[#39FF14]/30 transition-all text-center">
                                                        <span className="block text-[8px] font-black text-[#6B7280] tracking-widest uppercase mb-1">EMOCIONAL</span>
                                                        <div className="flex items-baseline justify-center gap-1">
                                                            <span className="text-xl sm:text-3xl font-black text-white leading-none">{scores.e}</span>
                                                            <span className="text-[10px] font-bold text-[#6B7280]">/ 100%</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-black/40 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-white/5 backdrop-blur-sm group-hover:border-amber-500/30 transition-all text-center">
                                                        <span className="block text-[8px] font-black text-[#6B7280] tracking-widest uppercase mb-1">CONDUCTUAL</span>
                                                        <div className="flex items-baseline justify-center gap-1">
                                                            <span className="text-xl sm:text-3xl font-black text-white leading-none">{scores.s}</span>
                                                            <span className="text-[10px] font-bold text-[#6B7280]">/ 100%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14]"></div>
                                                <span className="text-[9px] font-black text-[#39FF14] tracking-widest uppercase"> {ev.aiAnalysis ? 'Análisis + IA OK' : 'Análisis Core OK'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[#6B7280] text-[9px] font-black tracking-widest uppercase">
                                                Visualizar Panel <ChevronRight size={12} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sección de Psicometría */}
                {!isStaff && (
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <FlaskConical size={18} className="text-purple-400" />
                                EVALUACIONES PSICOMÉTRICAS
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowAsignarTest(true)}
                                        className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-white hover:bg-purple-600 transition-colors border border-purple-500/30 px-6 py-3 rounded-2xl bg-purple-600/80"
                                    >
                                        <Plus size={12} /> Nueva Evaluación
                                    </button>
                                )}
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => navigate(`/portal/analisis-ia?jugadorId=${id}`)}
                                        className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-purple-400 hover:text-white transition-colors border border-purple-500/30 px-6 py-3 rounded-2xl bg-purple-500/5 hover:bg-purple-500/10"
                                    >
                                        <Sparkles size={12} /> Análisis IA cruzado
                                    </button>
                                )}
                            </div>
                        </div>
                        <PsicometriaSection jugadorId={id} />
                    </div>
                )}

                {/* Sección de Metas SMART */}
                {!isStaff && (
                    <div className="mb-12">
                         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <Target size={18} className="text-[#38BDF8]" />
                                OBJETIVOS SMART INTEGRADOS
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">Seguimiento Semanal</span>
                            </div>
                        </div>
                        <SmartSection jugadorId={id} isAdmin={isAdmin} />
                    </div>
                )}

                {/* Sección de Configuración de Privacidad */}
                <div className="mb-12">
                     <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <Lock size={18} className="text-[#F59E0B]" />
                            SEGURIDAD Y PRIVACIDAD
                        </h3>
                    </div>
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center shrink-0">
                                <Shield size={32} className="text-[#F59E0B]" />
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase tracking-tight">Protección de Perfil</h4>
                                <p className="text-[#6B7280] text-sm leading-relaxed max-w-sm">
                                    {player.pin 
                                        ? 'Tu perfil está actualmente protegido con una contraseña privada.' 
                                        : 'Tu perfil es público para cualquier usuario con acceso a la academia. Protégelo ahora.'}
                                </p>
                            </div>
                        </div>
                        
                        {showEditPin ? (
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto animate-in slide-in-from-right-4 duration-300">
                                <input 
                                    type="password"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    placeholder="Nueva clave"
                                    className="w-full sm:w-32 bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#F59E0B]"
                                />
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button 
                                        onClick={handleUpdatePin}
                                        disabled={saving || !newPin}
                                        className="flex-1 sm:flex-none px-6 py-3 bg-[#F59E0B] text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        Guardar
                                    </button>
                                    <button 
                                        onClick={() => { setShowEditPin(false); setNewPin(''); }}
                                        className="flex-1 sm:flex-none px-4 py-3 bg-white/5 text-[#6B7280] hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => { setShowEditPin(true); setNewPin(player.pin || ''); }}
                                className="w-full md:w-auto px-8 py-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-orange-500/5 flex items-center justify-center gap-2"
                            >
                                <Edit2 size={16} /> {player.pin ? 'Cambiar Contraseña' : 'Establecer Contraseña'}
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: Report History */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                <FileText size={18} className={`text-[#0070F3]`} />
                                {isStaff ? 'Documentos del Staff' : 'Historial de Reportes'}
                            </h3>
                            {isAdmin && (
                                <button onClick={() => setShowAddReport(!showAddReport)} className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#0070F3] hover:text-white transition-colors">
                                    <Plus size={14} /> Nuevo Reporte
                                </button>
                            )}
                        </div>

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

                        <div className="space-y-4">
                            {upcoming.length > 0 && (
                                <div>
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
                </div>
            </main>

                {/* Modal Asignar Test */}
                {showAsignarTest && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                        <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                    <FlaskConical className="text-purple-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Asignar Test</h3>
                                    <p className="text-xs text-[#6B7280] uppercase font-black tracking-widest">A habilitar para el jugador</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4 mb-8">
                                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                                    Selecciona el instrumento psicométrico que deseas que el jugador complete de forma digital.
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                    {TESTS_DISPONIBLES.map(test => (
                                        <button
                                            key={test.id}
                                            onClick={() => setTestSeleccionado(test.id)}
                                            className={`p-4 rounded-2xl border text-left transition-all ${
                                                testSeleccionado === test.id
                                                    ? 'bg-purple-500/20 border-purple-500 text-white'
                                                    : 'bg-[#0A0F1E] border-white/5 text-[#6B7280] hover:border-white/20'
                                            }`}
                                        >
                                            <p className="text-sm font-bold uppercase tracking-widest">{test.nombre}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { setShowAsignarTest(false); setTestSeleccionado(''); }}
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={asignarTest}
                                    disabled={!testSeleccionado}
                                    className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={14} /> Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Viewer Overlay */}
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

            {/* Elite Report Modal */}
            {selectedEpsd && (
                <EpsdEliteReport 
                    playerData={{
                        nombre: player?.nombre,
                        posicion: player?.posicion,
                        categoria: player?.categoria
                    }}
                    evalData={selectedEpsd}
                    aiData={selectedEpsd.aiAnalysis}
                    historicalAvg={null}
                    onClose={() => setSelectedEpsd(null)}
                />
            )}
        </div>
    );
}
