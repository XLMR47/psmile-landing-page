import { Handshake, ShieldCheck, Plus, X, Lock, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";

export default function Alliances() {
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ club: '', sede: '', contacto: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("https://formspree.io/f/xkoqnkqk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre_club: formData.club,
                    sede_ubicacion: formData.sede,
                    numero_contacto: formData.contacto,
                    correo_contacto: formData.email,
                    origen: "Alianzas - Solicitud de Asociación PSMILE"
                })
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                setSubmitted(true);
            }
        } catch {
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({ club: '', sede: '', contacto: '', email: '' });
        setSubmitted(false);
        setModalOpen(true);
    };

    const partners = [
        {
            name: "BeweFutbolElite",
            logo: "/images/Alianza Bewe.jpg",
            description: "Academia de formación de élite comprometida con el desarrollo integral de futbolistas jóvenes.",
            motto: "Valor y Gloria",
            instagram: "https://www.instagram.com/bewefutbolelite/",
        },
        {
            name: "NeuroSport Chile",
            logo: "https://scontent.cdninstagram.com/v/t51.2885-19/44884218_345707102882519_2446069589734326272_n.jpg?_nc_ht=scontent.cdninstagram.com&_nc_cat=103&_nc_ohc=placeholder&edm=APs17CUBAAAA&ccb=7-5&oh=placeholder&oe=placeholder&_nc_sid=placeholder", // Placeholder URL, se sugiere subir el logo a /public/images/
            description: "Centro de entrenamiento personalizado y academia de talentos líder en Neurociencia aplicada al deporte.",
            motto: "Neurociencia Aplicada",
            instagram: "https://www.instagram.com/neurosportchile/",
        },
    ];

    return (
        <section className="py-20 bg-[#080808] border-t border-white/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0070F3]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[#0070F3]/10 border border-[#0070F3]/20 rounded-full px-4 py-1.5 mb-4">
                        <Handshake size={14} className="text-[#0070F3]" />
                        <span className="text-[10px] font-bold text-[#0070F3] tracking-[0.3em] uppercase">Red de confianza</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                        Alianzas Estratégicas
                    </h2>
                    <p className="text-[#9CA3AF] text-base max-w-2xl mx-auto">
                        Colaboramos con instituciones y academias que comparten nuestra visión: formar atletas mentalmente completos.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                    {/* Partner Cards */}
                    {partners.map((partner, i) => (
                        <div
                            key={i}
                            className="bg-[#141414] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center max-w-sm w-full hover:border-[#0070F3]/40 transition-all duration-500 group hover:shadow-[0_0_30px_rgba(0,112,243,0.1)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0070F3] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-[#0070F3]/30 transition-colors mb-6 shadow-xl group-hover:scale-105 transition-transform duration-500">
                                <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover" />
                            </div>

                            <h3 className="text-white font-black text-xl mb-1 group-hover:text-[#0070F3] transition-colors">
                                {partner.name}
                            </h3>
                            {partner.motto && (
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#DFFF00] mb-3">
                                    "{partner.motto}"
                                </span>
                            )}
                            <p className="text-[#9CA3AF] text-sm leading-relaxed">{partner.description}</p>

                            <div className="mt-5 flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF]/5 border border-[#FFFFFF]/20 rounded-full">
                                <ShieldCheck size={12} className="text-[#FFFFFF]" />
                                <span className="text-[9px] uppercase tracking-widest font-bold text-[#FFFFFF]">Aliado Verificado</span>
                            </div>

                            {partner.instagram && (
                                <a
                                    href={partner.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:scale-105 transition-transform shadow-lg"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                    Seguir en Instagram
                                </a>
                            )}
                        </div>
                    ))}

                    {/* CTA Card: Únete a la Red */}
                    <div
                        onClick={handleOpenModal}
                        className="bg-[#141414] border-2 border-dashed border-[#0070F3]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center max-w-sm w-full hover:border-[#0070F3] transition-all duration-500 cursor-pointer group hover:shadow-[0_0_30px_rgba(0,112,243,0.15)] hover:bg-[#0070F3]/5 min-h-[380px]"
                    >
                        <div className="w-20 h-20 rounded-full bg-[#0070F3]/10 border-2 border-[#0070F3]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0070F3]/20 transition-all duration-300">
                            <Plus className="text-[#0070F3] group-hover:text-white transition-colors" size={36} />
                        </div>

                        <h3 className="text-white font-black text-xl mb-2 group-hover:text-[#0070F3] transition-colors">
                            ¿Eres una Academia?
                        </h3>
                        <p className="text-[#9CA3AF] text-sm leading-relaxed mb-4 max-w-[250px]">
                            Únete a nuestra red de confianza y lleva la psicología deportiva a tus jugadores.
                        </p>

                        <div className="px-5 py-2.5 bg-[#0070F3] text-white font-black text-xs uppercase tracking-widest rounded-lg group-hover:bg-[#0056B3] transition-all shadow-lg shadow-[#0070F3]/20 group-hover:scale-105">
                            Solicitar Alianza
                        </div>
                    </div>
                </div>

                {/* Bottom trust message */}
                <div className="mt-12 text-center">
                    <p className="text-[#9CA3AF]/60 text-xs italic max-w-md mx-auto">
                        PSMILE selecciona aliados que cumplen con estándares de excelencia en la formación deportiva y el bienestar del atleta.
                    </p>
                </div>
            </div>

            {/* Modal: Solicitar Alianza */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,112,243,0.1)]">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <div className="w-12 h-12 bg-[#0070F3]/10 rounded-xl flex items-center justify-center mb-4 border border-[#0070F3]/20">
                                {submitted ? <CheckCircle2 className="text-[#FFFFFF]" size={24} /> : <Handshake className="text-[#0070F3]" size={24} />}
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">
                                {submitted ? "¡Solicitud Enviada! 🤝" : "Solicitar Alianza"}
                            </h3>
                            <p className="text-[#9CA3AF] text-sm">
                                {submitted
                                    ? "Hemos recibido tu solicitud. Nos pondremos en contacto contigo para evaluar la alianza."
                                    : "Completa los datos de tu academia y nuestro equipo evaluará la posibilidad de una alianza estratégica."}
                            </p>
                        </div>

                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-1">Nombre del Club / Academia</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.club}
                                        onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#0070F3] outline-none transition-colors"
                                        placeholder="Ej. Academia FC Santiago"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-1">Ubicación / Sede</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.sede}
                                        onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#0070F3] outline-none transition-colors"
                                        placeholder="Ej. Las Condes, Santiago, Chile"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-1">Número de Contacto</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.contacto}
                                        onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#0070F3] outline-none transition-colors"
                                        placeholder="+56 9 1234 5678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-1">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#0070F3] outline-none transition-colors"
                                        placeholder="contacto@academia.cl"
                                    />
                                    <p className="text-[10px] text-[#9CA3AF] mt-2 flex items-center gap-1">
                                        <Lock size={10} /> Tus datos están 100% seguros y privados.
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#0070F3] hover:bg-[#0056B3] text-white font-black uppercase tracking-widest text-xs py-4 rounded-lg transition-transform hover:scale-[1.02] shadow-lg shadow-[#0070F3]/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                                >
                                    {isSubmitting ? "Enviando..." : "Enviar Solicitud de Alianza"}
                                    {!isSubmitting && <Send size={16} />}
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-full bg-[#FFFFFF] hover:bg-[#32E612] text-black font-black uppercase tracking-widest text-xs py-4 rounded-lg transition-transform hover:scale-[1.02] shadow-lg shadow-[#FFFFFF]/20 flex items-center justify-center gap-2"
                            >
                                Cerrar <CheckCircle2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
