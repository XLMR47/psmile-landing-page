import { useState } from 'react';
import { X, Link as LinkIcon, Plus, Loader, User } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddPlayerModal({ isOpen, onClose, onPlayerAdded }) {
    const [formData, setFormData] = useState({
        nombre: '',
        categoria: 'Sub-15',
        photoURL: '',
        reporteURL: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categorias = ['Sub-13', 'Sub-15', 'Sub-17', 'Sub-20'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre) return;
        setLoading(true);
        setError('');

        try {
            const playerData = {
                nombre: formData.nombre,
                categoria: formData.categoria,
                photoURL: formData.photoURL || '',
                reporteURL: formData.reporteURL || '',
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'jugadores'), playerData);

            // Reset form
            setFormData({ nombre: '', categoria: 'Sub-15', photoURL: '', reporteURL: '' });

            if (onPlayerAdded) onPlayerAdded();
            onClose();
        } catch (err) {
            console.error('Error al guardar jugador:', err);
            setError('Error al guardar. Verifica tu conexión e inténtalo de nuevo.');
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
                        <h3 className="text-xl font-black text-white">Añadir Jugador</h3>
                        <p className="text-[#6B7280] text-xs mt-1">Registro en el Sistema de Inteligencia Mental</p>
                    </div>
                    <button onClick={onClose} className="text-[#6B7280] hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">{error}</div>
                    )}

                    {/* Nombre */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors"
                            placeholder="Nombre y apellido del jugador"
                        />
                    </div>

                    {/* Categoría */}
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
                                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${formData.categoria === cat
                                        ? 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3] scale-[1.02]'
                                        : 'bg-[#0A0F1E] border-white/10 text-[#6B7280] hover:border-white/20'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Foto URL */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                            Foto del Jugador (URL)
                        </label>
                        <div className="flex gap-3 items-start">
                            <div className="w-16 h-16 bg-[#0A0F1E] border border-white/10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                                {formData.photoURL ? (
                                    <img src={formData.photoURL} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                ) : (
                                    <User size={24} className="text-white/10" />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="url"
                                    value={formData.photoURL}
                                    onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors"
                                    placeholder="https://drive.google.com/... o URL de imagen"
                                />
                                <p className="text-[10px] text-[#4B5563] mt-1.5">Pega un enlace de Google Drive, Instagram o cualquier URL de imagen</p>
                            </div>
                        </div>
                    </div>

                    {/* Reporte URL */}
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                            Reporte de Análisis ePsD
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" size={16} />
                            <input
                                type="text"
                                value={formData.reporteURL}
                                onChange={(e) => setFormData({ ...formData, reporteURL: e.target.value })}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors"
                                placeholder="/reportes/emmanuel-martinez.html"
                            />
                        </div>
                        <p className="text-[10px] text-[#4B5563] mt-1.5">Coloca el HTML en <span className="text-[#0070F3]">public/reportes/</span> y escribe <span className="text-white/40">/reportes/nombre.html</span></p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !formData.nombre}
                        className="w-full bg-[#0070F3] hover:bg-[#0060D0] text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-[#0070F3]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <>
                                <Loader size={16} className="animate-spin" />
                                Guardando en base de datos...
                            </>
                        ) : (
                            <>
                                <Plus size={16} />
                                Registrar Jugador
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
