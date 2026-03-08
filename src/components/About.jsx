export default function About() {
    return (
        <section id="about" className="py-24 bg-[#0C0C0C]">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left glowing image */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#0070F3]/20 blur-3xl rounded-full scale-90 opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
                        <div className="relative rounded-lg overflow-hidden border border-white/5 bg-[#141414] aspect-square flex items-center justify-center p-8 z-10">
                            <img
                                src="/images/glowing_bulb.png"
                                alt="Psicología Deportiva Aplicada"
                                className="object-cover opacity-90 mix-blend-screen scale-[1.15]"
                            />
                        </div>
                    </div>

                    {/* Right Text Content */}
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
                            Construimos la mentalidad que separa a un talento de un <span className="text-[#39FF14]">profesional</span>
                        </h2>

                        <p className="text-[#9CA3AF] text-lg leading-relaxed mb-12 max-w-xl">
                            El talento técnico sin control emocional se queda en la banca. En <span className="text-white font-black italic tracking-tight">PSMILE CHILE</span> transformamos la ansiedad y el miedo a fallar en una ventaja competitiva diferencial. Preparamos a la nueva generación de futbolistas chilenos para tolerar la presión, multiplicar su confianza y acelerar su llegada al élite.
                        </p>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-5xl font-black text-[#0070F3] mb-2 tracking-tighter">95%</div>
                                <div className="text-[10px] font-bold text-[#A1A1AA] tracking-[0.2em] uppercase">
                                    Mejora en Enfoque
                                </div>
                            </div>
                            <div>
                                <div className="text-5xl font-black text-[#39FF14] mb-2 tracking-tighter">50</div>
                                <div className="text-[10px] font-bold text-[#A1A1AA] tracking-[0.2em] uppercase">
                                    Cupos Piloto 2026
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
