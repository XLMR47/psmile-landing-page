import { useState, useEffect } from "react";
import { Download, Lock, MonitorPlay, CheckCircle2, LockKeyhole, Unlock, Brain, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TacticalBreathing from "../components/TacticalBreathing";
import WhatsAppButton from "../components/WhatsAppButton";

export default function Biblioteca() {
    const [modalOpen, setModalOpen] = useState(false);
    const [allUnlocked, setAllUnlocked] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [justUnlocked, setJustUnlocked] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        const stored = localStorage.getItem('psmile_resources_unlocked');
        if (stored === 'true') {
            setAllUnlocked(true);
        }
    }, []);

    const handleOpenUnlockModal = () => {
        if (allUnlocked) return;
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: formData.name,
                    correo: formData.email,
                    whatsapp: formData.whatsapp,
                    recurso_solicitado: "Desbloqueo Global - Biblioteca Pública",
                    origen: "Biblioteca View - PSMILE"
                })
            });
            if (response.ok) {
                localStorage.setItem('psmile_resources_unlocked', 'true');
                setAllUnlocked(true);
                setJustUnlocked(true);
            }
        } catch (error) {
            console.error("Error", error);
            // Backup unlock if network fails
            localStorage.setItem('psmile_resources_unlocked', 'true');
            setAllUnlocked(true);
            setJustUnlocked(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const driveLinks = {
        escaner: 'https://drive.google.com/file/d/1nks3pt_9wD8V3xWsvVETDQ4JSkT9lSoz/view?usp=sharing',
        anclaje: 'https://drive.google.com/file/d/1Ur3R8_A6D-7euW5hI_6vX2iwvIuo67Kt/view?usp=sharing',
        respiracion: 'https://drive.google.com/file/d/1yWRVMQWJQKrEPU7eK5RdOs-pjvZHAXtY/view?usp=sharing',
    };

    const EbookCard = ({ title, subtitle, description, image, driveKey }) => (
        <div
            onClick={allUnlocked ? undefined : handleOpenUnlockModal}
            className={`bg-[#141414] rounded-2xl border transition-all group relative overflow-hidden flex flex-col h-full ${allUnlocked
                ? 'border-white/10 hover:border-white/20'
                : 'border-[#0070F3]/20 hover:border-[#0070F3]/50 cursor-pointer shadow-[0_0_20px_rgba(0,112,243,0.05)]'
                }`}
        >
            <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-bl-xl z-20 ${allUnlocked ? 'bg-white/10 text-white/40' : 'bg-[#0070F3] text-white animate-pulse'}`}>
                {allUnlocked ? 'ADQUIRIDO' : 'GRATIS'}
            </div>
            
            <div className="aspect-[3/4] overflow-hidden bg-black relative">
                <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                {!allUnlocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-[#0070F3] flex items-center justify-center shadow-lg shadow-[#0070F3]/40">
                            <LockKeyhole className="text-white" size={20} />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                    <h4 className="text-white font-black text-lg leading-tight mb-1 group-hover:text-[#0070F3] transition-colors">{title}</h4>
                    <p className="text-[#0070F3] text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>
                </div>
                <p className="text-[#9CA3AF] text-sm mb-6 flex-1">{description}</p>
                
                {allUnlocked ? (
                    <a
                        href={driveLinks[driveKey]}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#32E612] transition-all"
                    >
                        <Download size={14} /> Descargar PDF
                    </a>
                ) : (
                    <button className="w-full px-6 py-3 bg-[#0070F3]/10 border border-[#0070F3]/30 text-[#0070F3] font-black text-xs uppercase tracking-widest rounded-xl group-hover:bg-[#0070F3] group-hover:text-white transition-all">
                        Desbloquear Acceso
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col overflow-x-hidden">

            <main className="flex-1 pt-32 pb-24 relative">
                {/* Background effects */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0070F3]/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#32E612]/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
                    
                    {/* Hero Section of the Library */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                        <div className="max-w-2xl">
                            <Link to="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#0070F3] transition-colors text-[10px] font-bold uppercase tracking-widest mb-6">
                                <ArrowLeft size={14} /> Volver a la web
                            </Link>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[#0070F3]/10 rounded-lg border border-[#0070F3]/20">
                                    <Brain className="text-[#0070F3]" size={24} />
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight italic">
                                    BIBLIOTECA <span className="text-[#0070F3]">PSMILE</span>
                                </h1>
                            </div>
                            <p className="text-[#9CA3AF] text-lg leading-relaxed">
                                Recursos exclusivos diseñados para futbolistas de élite que buscan dominar su mente tanto como el balón. Herramientas prácticas de neurociencia aplicada.
                            </p>
                        </div>

                        {!allUnlocked && (
                            <div className="bg-[#141414] border border-[#0070F3]/30 p-8 rounded-3xl text-center max-w-xs w-full shadow-2xl shadow-[#0070F3]/10">
                                <div className="w-16 h-16 bg-[#0070F3]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#0070F3]/20">
                                    <Unlock className="text-[#0070F3]" size={28} />
                                </div>
                                <h3 className="font-black text-xl mb-2">Pase de Acceso</h3>
                                <p className="text-[#9CA3AF] text-xs mb-6 px-4">Desbloquea todos los ebooks y herramientas con un solo registro.</p>
                                <button
                                    onClick={handleOpenUnlockModal}
                                    className="w-full bg-[#0070F3] hover:bg-[#0056B3] text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-[#0070F3]/20 transition-transform active:scale-95"
                                >
                                    Desbloquear gratis
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
                        <div className="lg:col-span-2 space-y-12">
                            {/* Ebooks Section */}
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-xl font-black uppercase tracking-widest text-white/40">Ebooks & Guías</h2>
                                    <div className="flex-1 h-px bg-white/5"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EbookCard
                                        title="El Escáner de Élite"
                                        subtitle="Neuro-Fútbol Vol. 1"
                                        description="Domina la técnica de Xavi y De Bruyne con ciencia aplicada. Aprende a escanear el campo antes de recibir."
                                        image="/images/imagenportada.jpg"
                                        driveKey="escaner"
                                    />
                                    <EbookCard
                                        title="Anclaje de Confianza"
                                        subtitle="Neuro-Fútbol Vol. 2"
                                        description="Construye una mentalidad a prueba de presión con anclajes mentales. Mantén la calma bajo máxima exigencia."
                                        image="/images/Anclaje de confianza.png"
                                        driveKey="anclaje"
                                    />
                                    <EbookCard
                                        title="Técnicas de Respiración"
                                        subtitle="Neuro-Fútbol Vol. 3"
                                        description="Domina tu frecuencia cardíaca y entra en estado de flujo competitivo de forma consciente."
                                        image="/images/Pulsasiones.png"
                                        driveKey="respiracion"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Tools */}
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-xl font-black uppercase tracking-widest text-white/40">Herramientas</h2>
                                    <div className="flex-1 h-px bg-white/5"></div>
                                </div>
                                
                                {/* Video Player */}
                                <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden group">
                                    <div className="aspect-video relative bg-black">
                                        {allUnlocked ? (
                                            <iframe
                                                src="https://www.youtube.com/embed/a8Epq4ryL4s"
                                                title="Consciencia Plena"
                                                className="w-full h-full border-0"
                                                allowFullScreen
                                            ></iframe>
                                        ) : (
                                            <div onClick={handleOpenUnlockModal} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group-hover:bg-white/5 transition-colors">
                                                <MonitorPlay className="text-[#6B7280] mb-2" size={40} />
                                                <p className="text-xs font-bold text-[#6B7280]">BLOQUEADO</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h4 className="font-bold mb-1">Video: Consciencia Plena</h4>
                                        <p className="text-[#9CA3AF] text-xs">Aprende a estar presente en cada jugada.</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Full-width Tactical Breathing Tool */}
                    <div className="mb-24">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-xl font-black uppercase tracking-widest text-white/40">Marcapasos de Respiración Táctica</h2>
                            <div className="flex-1 h-px bg-white/5"></div>
                        </div>
                        <div className="bg-[#141414] rounded-3xl border border-white/5 p-8 md:p-12 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0070F3]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#0070F3]/10 transition-colors"></div>
                            <TacticalBreathing unlocked={allUnlocked} onRequestUnlock={handleOpenUnlockModal} />
                        </div>
                    </div>

                    {/* Premium Teaser */}
                    <div className="bg-gradient-to-r from-[#141414] to-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 text-center md:text-left overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DFFF00]/5 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="flex-1">
                            <span className="text-[#DFFF00] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Próximamente</span>
                            <h2 className="text-3xl md:text-5xl font-black mb-6 italic uppercase tracking-tighter text-white">
                                PSMILE <span className="text-[#DFFF00]">PREMIUM</span>
                            </h2>
                            <p className="text-[#9CA3AF] text-lg max-w-xl">
                                Estamos desarrollando una plataforma avanzada de entrenamiento cognitivo y seguimiento de rendimiento. El siguiente nivel de la psicología deportiva está llegando.
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-[#DFFF00]/10 border border-[#DFFF00]/20 rounded-full flex items-center justify-center animate-pulse">
                                <Lock className="text-[#DFFF00]" size={40} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <WhatsAppButton />

            {/* Gated Content Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
                    <div className="bg-[#0C0C0C] border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative">
                        <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 text-[#9CA3AF] hover:text-white transition-colors">
                            <Unlock size={20} />
                        </button>

                        <div className="mb-8">
                            <div className="w-12 h-12 bg-[#0070F3]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#0070F3]/20">
                                {justUnlocked ? <CheckCircle2 className="text-[#32E612]" size={32} /> : <LockKeyhole className="text-[#0070F3]" size={32} />}
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                                {justUnlocked ? "¡Acceso Total Concedido!" : "Desbloquea el Arsenal de Élite"}
                            </h3>
                            <p className="text-[#9CA3AF] text-sm leading-relaxed">
                                {justUnlocked
                                    ? "Ya puedes descargar todos los ebooks y utilizar las herramientas interactivas."
                                    : "Regístrate gratis para acceder a nuestra biblioteca de alto rendimiento."}
                            </p>
                        </div>

                        {!justUnlocked ? (
                            <form onSubmit={handleUnlock} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-2">Nombre Completo</label>
                                    <input
                                        type="text" required value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-white hover:border-white/20 focus:border-[#0070F3] outline-none transition-all placeholder:text-white/10"
                                        placeholder="Ej. Alexis Sánchez"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-2">Email de interés</label>
                                    <input
                                        type="email" required value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-white hover:border-white/20 focus:border-[#0070F3] outline-none transition-all placeholder:text-white/10"
                                        placeholder="jugador@elite.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-2">WhatsApp</label>
                                    <input
                                        type="tel" required value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-white hover:border-white/20 focus:border-[#0070F3] outline-none transition-all placeholder:text-white/10"
                                        placeholder="+56 9"
                                    />
                                </div>
                                <button
                                    type="submit" disabled={isSubmitting}
                                    className="w-full bg-[#0070F3] hover:bg-[#0056B3] text-white font-black py-5 rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#0070F3]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isSubmitting ? "CONECTANDO..." : "DESBLOQUEAR BIBLIOTECA"}
                                    {!isSubmitting && <Unlock size={16} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-full bg-white text-black font-black py-5 rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-white/10 hover:bg-[#32E612] transition-all"
                            >
                                EXPLORAR AHORA
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
