export default function MissionVision() {
    return (
        <section className="py-16 bg-[#0C0C0C]">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Misión Card */}
                    <div className="bg-gradient-to-b from-[#1C1C1E] to-[#121212] rounded-2xl p-10 border border-white/5 relative overflow-hidden group hover:border-[#39FF14]/20 transition-all duration-500">
                        <div className="mb-6">
                            <span className="text-[10px] font-bold text-[#39FF14] tracking-[0.3em] uppercase block mb-4">Nuestra Meta 2026</span>
                            <h3 className="text-3xl font-black text-white mb-4">Misión</h3>
                            <p className="text-[#9CA3AF] text-base leading-relaxed">
                                Transformar la carrera de <span className="text-white font-bold">50 jóvenes futbolistas en Chile</span> en 24 meses, dominando su ansiedad pre-competitiva y fortaleciendo su confianza con ciencia aplicada.
                            </p>
                        </div>
                        <div className="absolute -bottom-6 -right-6 text-9xl font-black text-[#39FF14]/5 italic">50</div>
                    </div>

                    {/* Visión Card */}
                    <div className="bg-gradient-to-b from-[#1C1C1E] to-[#121212] rounded-2xl p-10 border border-white/5 relative overflow-hidden group hover:border-[#0070F3]/20 transition-all duration-500">
                        <div className="mb-6">
                            <span className="text-[10px] font-bold text-[#0070F3] tracking-[0.3em] uppercase block mb-4">Proyección Futura</span>
                            <h3 className="text-3xl font-black text-white mb-4">Visión</h3>
                            <p className="text-[#9CA3AF] text-base leading-relaxed">
                                Ser la mejor opción en Chile para deportistas en formación y familias que buscan entrenamiento mental de <span className="text-white font-bold">alto nivel para 2027</span>.
                            </p>
                        </div>
                        <div className="absolute -bottom-6 -right-6 text-9xl font-black text-[#0070F3]/5 italic">2027</div>
                    </div>

                </div>
            </div>
        </section>
    );
}
