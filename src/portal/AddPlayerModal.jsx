import { useState } from 'react';
import { X, Upload, Plus, Loader, User, FileText, Users, Shield } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { getUserConfig, ACADEMIAS } from './academyConfig';

export default function AddPlayerModal({ isOpen, onClose, onPlayerAdded }) {
    const { currentUser } = useAuth();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig.role === 'admin';

    const [tipo, setTipo] = useState('jugador'); // 'jugador' o 'staff'
    const [formData, setFormData] = useState({
        nombre: '',
        categoria: 'Sub-15',
        cargo: 'Director Técnico',
        academiaId: isAdmin ? '' : userConfig.academiaId,
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [reportFile, setReportFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categorias = ['Sub-13', 'Sub-15', 'Sub-17', 'Sub-20'];
    const cargos = ['Director Técnico', 'Asistente Técnico', 'Preparador Físico', 'Kinesiólogo', 'Coordinador'];

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleReportChange = (e) => {
        const file = e.target.files[0];
        if (file) setReportFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre) return;
        if (isAdmin && !formData.academiaId) {
            setError('Selecciona una academia.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            let photoURL = '';
            let reporteURL = '';

            // Upload foto
            if (photoFile) {
                const timestamp = Date.now();
                const photoRef = ref(storage, `jugadores/fotos/${formData.academiaId}/${timestamp}_${photoFile.name}`);
                const snap = await uploadBytes(photoRef, photoFile);
                photoURL = await getDownloadURL(snap.ref);
            }

            // Upload reporte
            if (reportFile) {
                const timestamp = Date.now();
                const folder = tipo === 'staff' ? 'staff' : 'reportes';
                const reportRef = ref(storage, `jugadores/${folder}/${formData.academiaId}/${timestamp}_${reportFile.name}`);
                const snap = await uploadBytes(reportRef, reportFile);
                reporteURL = await getDownloadURL(snap.ref);
            }

            const playerData = {
                nombre: formData.nombre,
                tipo, // 'jugador' o 'staff'
                academiaId: formData.academiaId,
                photoURL,
                reporteURL,
                createdAt: new Date().toISOString()
            };

            // Campos específicos por tipo
            if (tipo === 'jugador') {
                playerData.categoria = formData.categoria;
            } else {
                playerData.cargo = formData.cargo;
            }

            const playerDoc = await addDoc(collection(db, 'jugadores'), playerData);

            // Si se subió un reporte, agregarlo al historial
            if (reporteURL) {
                await addDoc(collection(db, 'jugadores', playerDoc.id, 'reportes'), {
                    titulo: tipo === 'staff' ? `Informe ${formData.cargo}` : 'Evaluación Inicial',
                    reporteURL,
                    fecha: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }),
                    createdAt: new Date().toISOString()
                });
            }

            // Reset
            setFormData({ nombre: '', categoria: 'Sub-15', cargo: 'Director Técnico', academiaId: isAdmin ? '' : userConfig.academiaId });
            setTipo('jugador');
            setPhotoFile(null);
            setPhotoPreview(null);
            setReportFile(null);

            if (onPlayerAdded) onPlayerAdded();
            onClose();
        } catch (err) {
            console.error('Error al guardar:', err);
            setError('Error al guardar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg relative shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-[#111827] border-b border-white/5 p-6 flex items-center justify-between rounded-t-2xl z-10">
                    <div>
                        <h3 className="text-xl font-black text-white">
                            {tipo === 'staff' ? 'Añadir Staff' : 'Añadir Jugador'}
                        </h3>
                        <p className="text-[#6B7280] text-xs mt-1">Registro en el Sistema de Inteligencia Mental</p>
                    </div>
                    <button onClick={onClose} className="text-[#6B7280] hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">{error}</div>
                    )}

                    {/* Tipo: Jugador o Staff */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                            Tipo de Perfil
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setTipo('jugador')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                    tipo === 'jugador'
                                        ? 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3] scale-[1.02]'
                                        : 'bg-[#0A0F1E] border-white/10 text-[#6B7280] hover:border-white/20'
                                }`}
                            >
                                <Users size={14} /> Jugador
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipo('staff')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                    tipo === 'staff'
                                        ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B] scale-[1.02]'
                                        : 'bg-[#0A0F1E] border-white/10 text-[#6B7280] hover:border-white/20'
                                }`}
                            >
                                <Shield size={14} /> Staff / DT
                            </button>
                        </div>
                    </div>

                    {/* Academia (solo admin) */}
                    {isAdmin && (
                        <div>
                            <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                                Academia
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {ACADEMIAS.map((ac) => (
                                    <button
                                        key={ac.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, academiaId: ac.id })}
                                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                            formData.academiaId === ac.id
                                                ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14] scale-[1.02]'
                                                : 'bg-[#0A0F1E] border-white/10 text-[#6B7280] hover:border-white/20'
                                        }`}
                                    >
                                        {ac.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nombre */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                            {tipo === 'staff' ? 'Nombre del DT / Staff' : 'Nombre Completo'}
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors"
                            placeholder={tipo === 'staff' ? 'Nombre del entrenador' : 'Nombre y apellido del jugador'}
                        />
                    </div>

                    {/* Categoría (solo jugador) o Cargo (solo staff) */}
                    {tipo === 'jugador' ? (
                        <div>
                            <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                                Categoría
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {categorias.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, categoria: cat })}
                                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                            formData.categoria === cat
                                                ? 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3] scale-[1.02]'
                                                : 'bg-[#0A0F1E] border-white/10 text-[#6B7280] hover:border-white/20'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                                Cargo
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {cargos.map((cargo) => (
                                    <button
                                        key={cargo}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, cargo })}
                                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                            formData.cargo === cargo
                                                ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B] scale-[1.02]'
                                                : 'bg-[#0A0F1E] border-white/10 text-[#6B7280] hover:border-white/20'
                                        }`}
                                    >
                                        {cargo}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Foto */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                            {tipo === 'staff' ? 'Foto del DT' : 'Foto del Jugador'}
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-36 bg-[#0A0F1E] border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#0070F3]/50 transition-colors overflow-hidden group">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center">
                                    <Upload size={22} className="mx-auto text-[#6B7280] group-hover:text-[#0070F3] transition-colors mb-2" />
                                    <p className="text-xs text-[#6B7280]">Seleccionar imagen</p>
                                    <p className="text-[10px] text-[#4B5563] mt-1">JPG, PNG — Máx 5MB</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                    </div>

                    {/* Upload Reporte/Documento */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                            {tipo === 'staff' ? 'Documento / Informe' : 'Reporte de Análisis ePsD'}
                        </label>
                        <label className="flex items-center justify-center gap-3 w-full bg-[#0A0F1E] border border-dashed border-white/10 rounded-xl px-4 py-3.5 cursor-pointer hover:border-[#0070F3]/50 transition-colors group">
                            <FileText size={16} className="text-[#6B7280] group-hover:text-[#0070F3] transition-colors" />
                            <span className="text-xs text-[#6B7280] group-hover:text-white transition-colors truncate">
                                {reportFile ? `📄 ${reportFile.name}` : (tipo === 'staff' ? 'Subir documento (HTML, PDF)' : 'Subir archivo HTML de ePsD')}
                            </span>
                            <input type="file" accept=".html,.htm,.pdf" className="hidden" onChange={handleReportChange} />
                        </label>
                        <p className="text-[10px] text-[#4B5563] mt-1.5">El archivo se almacenará de forma segura en Firebase Storage</p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !formData.nombre}
                        className={`w-full font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 ${
                            tipo === 'staff'
                                ? 'bg-[#F59E0B] hover:bg-[#D97706] text-black shadow-[#F59E0B]/20'
                                : 'bg-[#0070F3] hover:bg-[#0060D0] text-white shadow-[#0070F3]/20'
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader size={16} className="animate-spin" />
                                Subiendo archivos y guardando...
                            </>
                        ) : (
                            <>
                                <Plus size={16} />
                                {tipo === 'staff' ? 'Registrar Staff' : 'Registrar Jugador'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
