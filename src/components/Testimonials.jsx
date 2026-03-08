import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";

export default function Testimonials() {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState({ name: '', comment: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // En un entorno real aquí se enviaría a una base de datos o API.
    };

    const testimonials = [
        {
            id: 1,
            quote: "En los entrenamientos la rompía, pero en los partidos se apagaba al primer error. En un par de sesiones Luis le dio vuelta la cabeza. Ver a mi hijo disfrutar sin miedo desde la grada no tiene precio.",
            author: "Rodrigo P.",
            role: "Padre de jugador Sub-15",
        },
        {
            id: 2,
            quote: "Yo corría mucho pero me ganaba la ansiedad. El doc me enseñó a respirar y 'escanear' la cancha antes. Ahora juego mucho más tranquilo y tomo mejores decisiones bajo presión.",
            author: "Matías S.",
            role: "Volante Creativo (Sub-17)",
        },
        {
            id: 3,
            quote: "No sabíamos cómo hablarle después de perder; lo presionábamos sin querer. Las sesiones nos ayudaron a nosotros como papás. Ahora él juega suelto y feliz, y nosotros estamos tranquilos.",
            author: "Javiera, P.",
            role: "Madre de jugador Sub-13",
        }
    ];

    return (
        <section id="testimonios" className="py-24 bg-[#080808] relative overflow-hidden">
            {/* Background glow elements */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0070F3]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFFFFF]/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                        Testimonios de <span className="italic text-[#0070F3]">Élite</span>
                    </h2>
                    <p className="text-[#9CA3AF] text-base md:text-lg max-w-2xl mx-auto">
                        Resultados tangibles en la cancha y en la familia.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="backdrop-blur-md bg-[#141414]/80 border border-[#1C1C1E] hover:border-[#0070F3]/30 rounded-2xl p-8 transition-all duration-300 shadow-xl relative group">
                            {/* Subtle blue glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#0070F3]/0 to-[#0070F3]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" className="text-[#00D1FF]" />
                                ))}
                            </div>

                            <p className="text-[#D0CCC5] text-sm md:text-base leading-relaxed mb-8 italic">
                                "{testimonial.quote}"
                            </p>

                            <div className="mt-auto border-t border-white/5 pt-4">
                                <p className="font-bold text-white mb-0.5">{testimonial.author}</p>
                                <p className="text-[10px] text-[#0070F3] font-bold uppercase tracking-wider">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Formulario para agregar testimonio */}
                <div className="max-w-2xl mx-auto backdrop-blur-md bg-[#141414]/60 border border-white/10 rounded-3xl p-8 lg:p-12 mb-16 shadow-2xl relative overflow-hidden group">
                    {/* Decorative glows inside the form */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0070F3]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#00D1FF]/20 transition-all duration-700"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#00D1FF]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#0070F3]/15 transition-all duration-700"></div>

                    <h3 className="text-2xl font-bold text-white mb-8 text-center relative z-10">Cuéntanos tu experiencia con <span className="text-[#00D1FF]">PSMILE</span></h3>

                    {submitted ? (
                        <div className="text-center py-12 animate-fade-in relative z-10">
                            <div className="inline-flex justify-center items-center w-20 h-20 bg-gradient-to-br from-[#0070F3] to-[#00D1FF] rounded-full mb-6 shadow-lg shadow-[#0070F3]/20">
                                <CheckCircle2 size={40} className="text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">¡Gracias por tu testimonio!</h4>
                            <p className="text-[#9CA3AF] text-base">Tu experiencia ayuda a otros jugadores a alcanzar su máximo potencial.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            {/* Interactive Stars */}
                            <div className="flex flex-col items-center gap-4 mb-4">
                                <span className="text-[11px] font-black text-[#6B7280] tracking-[0.2em] uppercase">Calificación General</span>
                                <div className="flex gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform hover:scale-125 duration-200"
                                        >
                                            <Star
                                                size={32}
                                                fill="currentColor"
                                                className={`transition-all duration-300 ${(hoverRating || rating) >= star ? 'text-[#00D1FF] drop-shadow-[0_0_8px_rgba(0,209,255,0.5)]' : 'text-[#333]'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="group/input">
                                    <label className="block text-[11px] font-black text-[#9CA3AF] tracking-[0.2em] uppercase mb-3 px-1 group-focus-within/input:text-[#00D1FF] transition-colors">Nombre y Apellido (o Iniciales)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#0F0F0F]/80 border border-white/5 rounded-xl px-5 py-4 text-white placeholder-white/20 outline-none focus:border-[#00D1FF]/50 focus:ring-1 focus:ring-[#00D1FF]/20 transition-all text-sm lg:text-base"
                                        placeholder="Ej. Martín V. o Familia Díaz"
                                    />
                                </div>

                                <div className="group/input">
                                    <label className="block text-[11px] font-black text-[#9CA3AF] tracking-[0.2em] uppercase mb-3 px-1 group-focus-within/input:text-[#00D1FF] transition-colors">Tu Comentario</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={formData.comment}
                                        onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                        className="w-full bg-[#0F0F0F]/80 border border-white/5 rounded-xl px-5 py-4 text-white placeholder-white/20 outline-none focus:border-[#00D1FF]/50 focus:ring-1 focus:ring-[#00D1FF]/20 transition-all text-sm lg:text-base resize-none"
                                        placeholder="¿Cómo te ha ayudado el entrenamiento mental?"
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!formData.name || !formData.comment}
                                className="w-full bg-gradient-to-r from-[#0070F3] to-[#00D1FF] hover:from-[#0056B3] hover:to-[#00A3FF] text-white font-black px-8 py-5 rounded-xl text-base lg:text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#0070F3]/20 uppercase tracking-[0.15em] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group/btn"
                            >
                                <span className="flex items-center justify-center gap-3">
                                    Enviar Testimonio
                                    <CheckCircle2 size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </form>
                    )}
                </div>

                <div className="flex flex-col items-center justify-center">
                    <a href="#diagnostico" className="bg-[#141414] hover:bg-[#1C1C1E] border border-white/10 text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:border-[#0070F3]/50 shadow-lg shadow-black/50 mb-8 inline-block">
                        Quiero estos resultados para mi hijo
                    </a>

                    {/* Authority Banner */}
                    <div className="inline-block bg-[#1A1A1A] border border-white/5 rounded-lg px-6 py-3">
                        <p className="text-[10px] md:text-xs font-bold text-[#9CA3AF] text-center tracking-widest uppercase">
                            Metodología basada en instrumentos psicométricos estructurados (EPI, GRID, ePsD Lite) y Entrenamiento mental para el maximo rendimiento.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}
