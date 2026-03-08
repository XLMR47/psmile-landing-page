import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LeadForm() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        nivel: '',
        objetivo: '',
        contacto: ''
    });

    const handleNext = (e) => {
        e.preventDefault();
        if (step < 3) setStep(step + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("https://formspree.io/f/xkoqnkqk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre_jugador_padre: formData.nombre,
                    categoria_edad: formData.nivel,
                    mayor_obstaculo_mental: formData.objetivo,
                    email_o_whatsapp: formData.contacto,
                    origen: "Formulario Principal de Evaluación (LeadForm)"
                })
            });

            if (response.ok) {
                setStep(4);
            } else {
                console.error("Error al enviar el formulario a Formspree");
                setStep(4); // Fallback para no arruinar UX
            }
        } catch (error) {
            console.error("Error de conexión", error);
            setStep(4); // Fallback
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="diagnostico" className="py-24 bg-[#080808] relative overflow-hidden flex justify-center">

            {/* Background Silhouette */}
            <div className="absolute inset-0 z-0 flex items-end justify-center pointer-events-none opacity-20 mix-blend-screen">
                <img
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2720&auto=format&fit=crop"
                    alt="Athlete Silhouette"
                    className="h-[120%] object-cover object-top grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent h-full w-full"></div>
            </div>

            <div className="container relative mx-auto px-6 lg:px-12 max-w-4xl z-10 w-full">
                <div className="bg-[#141414]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden group">
                    {/* Decorative Color Accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0070F3]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#00D1FF]/20 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00D1FF]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#0070F3]/15 transition-all duration-700"></div>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                            Asegura el cupo para tu hijo
                        </h2>
                        <p className="text-[#9CA3AF] text-sm md:text-base">
                            Inicia su transformación mental hacia el fútbol profesional.
                        </p>
                    </div>

                    {/* Progress Indicator (Cyan Gradient Effect) */}
                    {step < 4 && (
                        <div className="flex gap-4 mb-16 max-w-md mx-auto relative z-10">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r from-[#0070F3] to-[#00D1FF] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,209,255,0.4)] ${s <= step ? 'w-full' : 'w-0'}`}></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 4 ? (
                        <div className="text-center py-12 animate-fade-in relative z-10">
                            <div className="inline-flex justify-center items-center w-24 h-24 bg-gradient-to-br from-[#0070F3] to-[#00D1FF] rounded-full mb-8 shadow-xl shadow-[#0070F3]/20">
                                <CheckCircle2 size={48} className="text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Solicitud de Cupo Recibida</h3>
                            <p className="text-[#9CA3AF] text-lg max-w-md mx-auto leading-relaxed">Analizaremos el caso de tu hijo. Te contactaremos en menos de 12 horas para coordinar el diagnóstico inicial.</p>
                        </div>
                    ) : (
                        <form onSubmit={step === 3 ? handleSubmit : handleNext} className="max-w-xl mx-auto space-y-6">

                            {/* Step 1 */}
                            <div className={`transition-all duration-500 ${step === 1 ? 'block opacity-100 transform translate-x-0' : 'hidden opacity-0 transform -translate-x-8'}`}>
                                <div className="space-y-6">
                                    <div className="group/input">
                                        <label className="block text-[11px] font-black text-[#9CA3AF] tracking-[0.2em] uppercase mb-3 px-1 group-focus-within/input:text-[#00D1FF] transition-colors">Nombre del Jugador / Padre / Madre</label>
                                        <input type="text" required={step === 1} value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-[#0F0F0F]/80 border border-white/5 rounded-xl px-5 py-4 text-white placeholder-white/20 outline-none focus:border-[#00D1FF]/50 focus:ring-1 focus:ring-[#00D1FF]/20 transition-all text-sm lg:text-base" placeholder="Ej. Juan Pérez" />
                                    </div>
                                    <div className="group/input">
                                        <label className="block text-[11px] font-black text-[#9CA3AF] tracking-[0.2em] uppercase mb-3 px-1 group-focus-within/input:text-[#00D1FF] transition-colors">Categoría (Edad)</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Sub-13 / Sub-15', 'Sub-16 / Sub-18', 'Sub-20 / Pro', 'Cadete Formación'].map(lvl => (
                                                <button type="button" key={lvl} onClick={() => setFormData({ ...formData, nivel: lvl })} className={`px-5 py-4 rounded-xl border text-sm font-black transition-all duration-300 tracking-wide uppercase ${formData.nivel === lvl ? 'bg-gradient-to-r from-[#0070F3] to-[#00D1FF] text-white border-transparent scale-[1.03] shadow-lg shadow-[#0070F3]/20' : 'bg-[#0F0F0F]/80 border-white/5 text-[#9CA3AF] hover:bg-white/5 hover:border-white/10'}`}>{lvl}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className={`transition-all duration-500 ${step === 2 ? 'block opacity-100 transform translate-x-0' : 'hidden opacity-0 transform translate-x-8'}`}>
                                <div className="space-y-4">
                                    <label className="block text-[11px] font-black text-[#9CA3AF] tracking-[0.2em] uppercase mb-4 px-1">¿Cuál es el mayor obstáculo hoy?</label>
                                    {['Nervios y ansiedad antes de los partidos', 'Falta de confianza tras cometer un error', 'Dificultad para mantener el foco 90 min', 'Presión de las pruebas o seleccionadores', 'Gestión emocional y frustración'].map(obj => (
                                        <label key={obj} className={`block relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group/label ${formData.objetivo === obj ? 'bg-gradient-to-r from-[#0070F3]/20 to-[#00D1FF]/10 border-[#00D1FF] text-white scale-[1.02] shadow-lg shadow-[#0070F3]/10' : 'border-white/5 bg-[#0F0F0F]/80 text-[#9CA3AF] hover:bg-white/5 hover:border-white/10'}`}>
                                            <input type="radio" required={step === 2} name="objetivo" value={obj} checked={formData.objetivo === obj} onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })} className="absolute opacity-0" />
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.objetivo === obj ? 'border-[#00D1FF] bg-[#00D1FF]' : 'border-white/20 group-hover/label:border-white/40'}`}>
                                                    {formData.objetivo === obj && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <span className="font-bold text-sm lg:text-base tracking-wide">{obj}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className={`transition-all duration-500 ${step === 3 ? 'block opacity-100 transform translate-x-0' : 'hidden opacity-0 transform translate-x-8'}`}>
                                <div className="group/input">
                                    <label className="block text-[11px] font-black text-[#9CA3AF] tracking-[0.2em] uppercase mb-3 px-1 group-focus-within/input:text-[#00D1FF] transition-colors">WhatsApp / Email de contacto</label>
                                    <input type="text" required={step === 3} value={formData.contacto} onChange={e => setFormData({ ...formData, contacto: e.target.value })} className="w-full bg-[#0F0F0F]/80 border border-white/5 rounded-xl px-5 py-4 text-white placeholder-white/20 outline-none focus:border-[#00D1FF]/50 focus:ring-1 focus:ring-[#00D1FF]/20 transition-all text-sm lg:text-base" placeholder="+56 9 1234 5678 o email@ejemplo.com" />
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5 relative z-20">
                                {step > 1 && step < 4 ? <button type="button" onClick={() => setStep(step - 1)} className="text-[11px] font-black text-[#6B7280] hover:text-white transition-colors uppercase tracking-[0.2em]">Volver</button> : <div></div>}

                                <button
                                    type="submit"
                                    disabled={
                                        (step === 1 && (!formData.nombre || !formData.nivel)) ||
                                        (step === 2 && !formData.objetivo) ||
                                        (step === 3 && !formData.contacto) ||
                                        isSubmitting
                                    }
                                    className="bg-gradient-to-r from-[#0070F3] to-[#00D1FF] hover:from-[#0056B3] hover:to-[#00A3FF] text-white font-black px-10 py-4 rounded-xl text-sm lg:text-base flex items-center gap-3 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#0070F3]/20 uppercase tracking-widest group/btn"
                                >
                                    {step === 3
                                        ? (isSubmitting ? 'Enviando Solicitud...' : 'Asegurar cupo para mi hijo')
                                        : 'Siguiente Paso'
                                    }
                                    {step < 3 && <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />}
                                    {step === 3 && !isSubmitting && <CheckCircle2 size={18} />}
                                </button>
                            </div>

                        </form>
                    )}

                </div>
            </div>
        </section>
    );
}
