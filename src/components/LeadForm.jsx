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
                <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">

                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                            Asegura el cupo para tu hijo
                        </h2>
                        <p className="text-[#9CA3AF] text-sm md:text-base">
                            Inicia su transformación mental hacia el fútbol profesional.
                        </p>
                    </div>

                    {/* Progress Indicator (Goal Gradient Effect) */}
                    {step < 4 && (
                        <div className="flex gap-2 mb-10">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full bg-[#39FF14] transition-all duration-500 ease-out" style={{ width: s <= step ? '100%' : '0%' }}></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 4 ? (
                        <div className="text-center py-10 animation-fade-in">
                            <div className="inline-flex justify-center items-center w-20 h-20 bg-[#39FF14]/10 rounded-full mb-6 border border-[#39FF14]/30">
                                <CheckCircle2 size={40} className="text-[#39FF14]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Solicitud de Cupo Recibida</h3>
                            <p className="text-[#9CA3AF] text-sm">Analizaremos el caso de tu hijo. Te contactaremos en menos de 12 horas para coordinar el diagnóstico.</p>
                        </div>
                    ) : (
                        <form onSubmit={step === 3 ? handleSubmit : handleNext} className="max-w-xl mx-auto space-y-6">

                            {/* Step 1 */}
                            <div className={`transition-all duration-500 ${step === 1 ? 'block opacity-100 transform translate-x-0' : 'hidden opacity-0 transform -translate-x-8'}`}>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-2">Nombre del Jugador / Padre / Madre</label>
                                        <input type="text" required={step === 1} value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#0070F3] transition-colors text-sm" placeholder="Ej. Juan Pérez" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-2">Categoría (Edad)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Sub-13 / Sub-15', 'Sub-16 / Sub-18', 'Sub-20 / Pro', 'Cadete Formación'].map(lvl => (
                                                <button type="button" key={lvl} onClick={() => setFormData({ ...formData, nivel: lvl })} className={`px-4 py-3 rounded-lg border text-sm font-bold transition-all duration-300 ${formData.nivel === lvl ? 'bg-[#39FF14]/10 text-white border-[#39FF14] scale-[1.02]' : 'bg-[#1A1A1A] border-white/10 text-[#9CA3AF] hover:bg-white/5 hover:border-white/20'}`}>{lvl}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className={`transition-all duration-500 ${step === 2 ? 'block opacity-100 transform translate-x-0' : 'hidden opacity-0 transform translate-x-8'}`}>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-2">¿Cuál es el mayor obstáculo hoy?</label>
                                    {['Nervios y ansiedad antes de los partidos', 'Falta de confianza tras cometer un error', 'Dificultad para mantener el foco 90 min', 'Presión de las pruebas o seleccionadores', 'Gestión emocional y frustración'].map(obj => (
                                        <label key={obj} className={`block relative p-4 rounded-xl border cursor-pointer transition-all duration-300 ${formData.objetivo === obj ? 'bg-[#39FF14]/10 border-[#39FF14] text-white scale-[1.02]' : 'border-white/10 bg-[#1A1A1A] text-[#9CA3AF] hover:bg-white/5 hover:border-white/20'}`}>
                                            <input type="radio" required={step === 2} name="objetivo" value={obj} checked={formData.objetivo === obj} onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })} className="absolute opacity-0" />
                                            <span className="font-bold text-sm tracking-wide">{obj}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className={`transition-all duration-500 ${step === 3 ? 'block opacity-100 transform translate-x-0' : 'hidden opacity-0 transform translate-x-8'}`}>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-2">WhatsApp / Email de contacto</label>
                                    <input type="text" required={step === 3} value={formData.contacto} onChange={e => setFormData({ ...formData, contacto: e.target.value })} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#39FF14] transition-colors text-sm" placeholder="+56 9 1234 5678 o email@ejemplo.com" />
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5 relative z-20">
                                {step > 1 && step < 4 ? <button type="button" onClick={() => setStep(step - 1)} className="text-sm font-bold text-[#9CA3AF] hover:text-white transition-colors">Volver</button> : <div></div>}

                                <button
                                    type="submit"
                                    disabled={
                                        (step === 1 && (!formData.nombre || !formData.nivel)) ||
                                        (step === 2 && !formData.objetivo) ||
                                        (step === 3 && !formData.contacto) ||
                                        isSubmitting
                                    }
                                    className="bg-[#39FF14] hover:bg-[#32e012] text-black font-black px-8 py-3 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider group"
                                >
                                    {step === 3
                                        ? (isSubmitting ? 'Enviando Solicitud...' : 'Asegurar cupo para mi hijo')
                                        : 'Siguiente Paso'
                                    }
                                    {step < 3 && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>

                        </form>
                    )}

                </div>
            </div>
        </section>
    );
}
