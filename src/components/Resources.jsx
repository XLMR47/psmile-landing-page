import { Download, Lock, FileText, Headphones, MonitorPlay, Users, X, CheckCircle2, Link as LinkIcon, LockKeyhole, Unlock } from "lucide-react";
import { useState, useEffect } from "react";
import TacticalBreathing from "./TacticalBreathing";

export default function Resources() {
    const [modalOpen, setModalOpen] = useState(false);
    const [allUnlocked, setAllUnlocked] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [justUnlocked, setJustUnlocked] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('psmile_resources_unlocked');
        if (stored === 'true') {
            setAllUnlocked(true);
        }
    }, []);

    const handleOpenUnlockModal = () => {
        if (allUnlocked) return; // Already unlocked, no need for modal
        setFormData({ name: '', email: '', whatsapp: '' });
        setJustUnlocked(false);
        setModalOpen(true);
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("https://formspree.io/f/xkoqnkqk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre: formData.name,
                    correo: formData.email,
                    whatsapp: formData.whatsapp,
                    recurso_solicitado: "Desbloqueo Global - Todos los Recursos Gratuitos",
                    origen: "Gated Content Modal - PSMILE Landing"
                })
            });

            if (response.ok) {
                localStorage.setItem('psmile_resources_unlocked', 'true');
                setAllUnlocked(true);
                setJustUnlocked(true);
            } else {
                console.error("Error al enviar a Formspree");
                localStorage.setItem('psmile_resources_unlocked', 'true');
                setAllUnlocked(true);
                setJustUnlocked(true);
            }
        } catch (error) {
            console.error("Error de red", error);
            localStorage.setItem('psmile_resources_unlocked', 'true');
            setAllUnlocked(true);
            setJustUnlocked(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Drive links map
    const driveLinks = {
        escaner: 'https://drive.google.com/file/d/1nks3pt_9wD8V3xWsvVETDQ4JSkT9lSoz/view?usp=sharing',
        anclaje: 'https://drive.google.com/file/d/1Ur3R8_A6D-7euW5hI_6vX2iwvIuo67Kt/view?usp=sharing',
        respiracion: 'https://drive.google.com/file/d/1yWRVMQWJQKrEPU7eK5RdOs-pjvZHAXtY/view?usp=sharing',
    };

    // Ebook card component for DRY
    const EbookCard = ({ title, subtitle, description, image, driveKey }) => (
        <div
            onClick={allUnlocked ? undefined : handleOpenUnlockModal}
            className={`flex items-center justify-between p-5 bg-[#141414] rounded-xl border transition-all group relative overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.05)] ${allUnlocked
                ? 'border-[#39FF14]/30 hover:border-[#39FF14]/60'
                : 'border-[#2563EB]/20 hover:border-[#2563EB]/80 cursor-pointer hover:shadow-[0_0_20px_rgba(37,99,235,0.15)]'
                }`}
        >
            <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl z-20 shadow-md animate-pulse">
                NUEVO
            </div>
            <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${allUnlocked ? 'from-[#39FF14]/0 to-[#39FF14]/5' : 'from-[#2563EB]/0 to-[#2563EB]/10'
                }`}></div>
            <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
                <div className={`w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-md overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg border ${allUnlocked ? 'bg-[#39FF14]/5 border-[#39FF14]/30' : 'bg-[#2563EB]/10 border-[#2563EB]/30'
                    }`}>
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="pr-4 sm:pr-0">
                    <h4 className={`text-white font-bold text-sm sm:text-base transition-colors leading-tight mb-1 ${allUnlocked ? 'group-hover:text-[#39FF14]' : 'group-hover:text-[#2563EB]'
                        }`}>
                        {title}<br className="hidden sm:block" />
                        <span className={`text-xs sm:text-sm text-gray-300 transition-colors font-medium ${allUnlocked ? 'group-hover:text-[#39FF14]/80' : 'group-hover:text-[#2563EB]/80'
                            }`}>{subtitle}</span>
                    </h4>
                    <p className="text-[#9CA3AF] text-xs sm:text-sm mt-1 max-w-[250px] sm:max-w-none">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 relative z-10 shrink-0 self-center">
                {allUnlocked ? (
                    <a
                        href={driveLinks[driveKey]}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#39FF14] text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[#32E612] transition-all hover:scale-105 shadow-lg shadow-[#39FF14]/10"
                    >
                        <Download size={14} /> Descargar
                    </a>
                ) : (
                    <>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#2563EB] group-hover:text-white transition-colors hidden sm:block">Desbloquear</span>
                        <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center group-hover:bg-[#2563EB] transition-all duration-300">
                            <LockKeyhole className="text-[#2563EB] group-hover:text-white transition-colors" size={18} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <section id="recursos" className="py-24 bg-[#0C0C0C] border-t border-white/5">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Free Resources Column */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-black text-white">Recursos Gratuitos</h2>
                                <div className="w-12 h-1 bg-[#0070F3] rounded-full"></div>
                            </div>
                            {!allUnlocked && (
                                <button
                                    onClick={handleOpenUnlockModal}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#0070F3]/10 border border-[#0070F3]/30 rounded-lg text-[#0070F3] hover:bg-[#0070F3] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    <Unlock size={14} /> Desbloquear Todo
                                </button>
                            )}
                            {allUnlocked && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg">
                                    <CheckCircle2 size={14} className="text-[#39FF14]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">Todo Desbloqueado</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <EbookCard
                                title="Ebook: El Escáner de Élite"
                                subtitle="(Saga Neuro-Fútbol Vol. 1)"
                                description="Domina la técnica de Xavi y De Bruyne con ciencia aplicada."
                                image="/images/imagenportada.jpg"
                                driveKey="escaner"
                            />

                            <EbookCard
                                title="Ebook: Anclaje de Confianza"
                                subtitle="(Saga Neuro-Fútbol Vol. 2)"
                                description="Construye una mentalidad a prueba de presión con anclajes mentales."
                                image="/images/Anclaje de confianza.png"
                                driveKey="anclaje"
                            />

                            <EbookCard
                                title="Ebook: Técnicas de Respiración"
                                subtitle="(Saga Neuro-Fútbol Vol. 3)"
                                description="Domina tu frecuencia cardíaca y entra en estado de flujo competitivo."
                                image="/images/Pulsasiones.png"
                                driveKey="respiracion"
                            />

                            {/* Video: Consciencia Plena */}
                            <div className="bg-[#141414] rounded-xl border border-[#39FF14]/20 hover:border-[#39FF14]/60 transition-all overflow-hidden group relative shadow-[0_0_15px_rgba(57,255,20,0.05)] hover:shadow-[0_0_20px_rgba(57,255,20,0.15)]">
                                <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl z-20 shadow-md">
                                    {allUnlocked ? 'DESBLOQUEADO' : 'GRATIS'}
                                </div>
                                <div className="aspect-video w-full relative">
                                    {allUnlocked ? (
                                        <iframe
                                            src="https://www.youtube.com/embed/a8Epq4ryL4s"
                                            title="Consciencia Plena - PSMILE"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full border-0"
                                        ></iframe>
                                    ) : (
                                        <div
                                            onClick={handleOpenUnlockModal}
                                            className="w-full h-full bg-[#0C0C0C] flex flex-col items-center justify-center cursor-pointer hover:bg-[#111] transition-colors"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-[#0070F3]/20 border-2 border-[#0070F3]/40 flex items-center justify-center mb-3 hover:scale-110 transition-transform">
                                                <LockKeyhole className="text-[#0070F3]" size={24} />
                                            </div>
                                            <p className="text-white font-bold text-sm">Desbloquea para ver el video</p>
                                            <p className="text-[#9CA3AF] text-xs mt-1">Ingresa tu email para acceder gratis</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-[#39FF14]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MonitorPlay className="text-[#39FF14]" size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm group-hover:text-[#39FF14] transition-colors">Consciencia Plena</h4>
                                            <p className="text-[#9CA3AF] text-xs">Video guiado de mindfulness deportivo</p>
                                        </div>
                                    </div>
                                    {allUnlocked && (
                                        <a
                                            href="https://youtu.be/a8Epq4ryL4s"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] uppercase tracking-widest font-bold text-[#39FF14] hover:text-white transition-colors"
                                        >
                                            Ver en YouTube →
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Widget - Tactical Breathing */}
                        <TacticalBreathing unlocked={allUnlocked} onRequestUnlock={handleOpenUnlockModal} />
                    </div>

                    {/* Premium Content Column */}
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-black text-white">Contenido Premium</h2>
                            <div className="w-12 h-1 bg-[#DFFF00] rounded-full"></div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-12 bg-[#141414] rounded-2xl border border-white/5 text-center min-h-[200px]">
                            <div className="w-14 h-14 bg-[#DFFF00]/10 rounded-full flex items-center justify-center mb-4 border border-[#DFFF00]/20">
                                <Lock className="text-[#DFFF00]" size={24} />
                            </div>
                            <h3 className="text-white font-black text-lg mb-2">Próximamente</h3>
                            <p className="text-[#9CA3AF] text-sm max-w-xs">
                                Estamos preparando contenido premium exclusivo para llevar tu rendimiento al siguiente nivel.
                            </p>
                            <div className="mt-4 px-4 py-1.5 bg-[#DFFF00]/10 border border-[#DFFF00]/20 rounded-full">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-[#DFFF00]">En desarrollo</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Gated Content Modal - Desbloqueo Global Único */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,112,243,0.1)]">
                        {/* Botón Cerrar */}
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <div className="w-12 h-12 bg-[#0070F3]/10 rounded-xl flex items-center justify-center mb-4 border border-[#0070F3]/20">
                                {justUnlocked ? <CheckCircle2 className="text-[#39FF14]" size={24} /> : <LockKeyhole className="text-[#0070F3]" size={24} />}
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">
                                {justUnlocked ? "¡Todo Desbloqueado! 🎉" : "Desbloquea Todos los Recursos"}
                            </h3>
                            <p className="text-[#9CA3AF] text-sm">
                                {justUnlocked
                                    ? "Ya tienes acceso a los 3 Ebooks, el Video de Consciencia Plena y el Marcapasos de Respiración Táctica. ¡A entrenar!"
                                    : "Ingresa tus datos una sola vez y accede de inmediato a todos los ebooks, videos y herramientas interactivas."}
                            </p>
                        </div>

                        {!justUnlocked ? (
                            <>
                                {/* Preview de lo que desbloquean */}
                                <div className="mb-6 bg-[#0C0C0C] rounded-xl p-4 border border-white/5 space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#A1A1AA] mb-3">Incluye acceso a:</p>
                                    {[
                                        '📘 Ebook: El Escáner de Élite (Vol. 1)',
                                        '📗 Ebook: Anclaje de Confianza (Vol. 2)',
                                        '📕 Ebook: Técnicas de Respiración (Vol. 3)',
                                        '🎬 Video: Consciencia Plena',
                                        '🫁 Marcapasos de Respiración Táctica',
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleUnlock} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-1">Tu Nombre</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#0070F3] outline-none transition-colors"
                                            placeholder="Ej. Carlos Martínez"
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
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-1">Número de WhatsApp</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#0070F3] outline-none transition-colors"
                                            placeholder="+56 9 1234 5678"
                                        />
                                        <p className="text-[10px] text-[#9CA3AF] mt-2 flex items-center gap-1">
                                            <Lock size={10} /> Tus datos están 100% seguros y privados.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#0070F3] hover:bg-[#0056B3] text-white font-black uppercase tracking-widest text-xs py-4 rounded-lg transition-transform hover:scale-[1.02] shadow-lg shadow-[#0070F3]/20 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                                    >
                                        {isSubmitting ? "Desbloqueando..." : "Desbloquear Todo Ahora"}
                                        {!isSubmitting && <Unlock size={16} />}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-[#1A1A1A] border border-[#39FF14]/30 rounded-xl p-4 text-center">
                                    <CheckCircle2 className="text-[#39FF14] mx-auto mb-2" size={32} />
                                    <p className="text-white font-bold text-sm mb-1">Acceso completo activado</p>
                                    <p className="text-[10px] text-[#9CA3AF]">Cierra esta ventana y explora los recursos sin límites.</p>
                                </div>

                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="w-full bg-[#39FF14] hover:bg-[#32E612] text-black font-black uppercase tracking-widest text-xs py-4 rounded-lg transition-transform hover:scale-[1.02] shadow-lg shadow-[#39FF14]/20 flex items-center justify-center gap-2"
                                >
                                    Explorar Recursos <CheckCircle2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
