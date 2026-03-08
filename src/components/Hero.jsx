import React from 'react';
import { Zap, AlertCircle } from 'lucide-react';

export default function Hero() {
    return (
        <div className="flex flex-col">
            {/* Urgency Banner */}
            <div className="bg-[#E10600] text-white py-2 px-4 text-center z-[60] relative mt-20 md:mt-0">
                <p className="text-xs md:text-sm font-black tracking-wider uppercase flex items-center justify-center gap-2">
                    <AlertCircle size={16} className="animate-pulse" />
                    🚨 SOLO QUEDAN 8 DE LOS 50 CUPOS DISPONIBLES para el Programa Piloto 2026
                </p>
            </div>

            <section className="relative min-h-[90vh] flex items-center pt-12 pb-20 overflow-hidden bg-[#0C0C0C]">

                {/* Background with Player Image fading into black */}
                <div className="absolute inset-0 z-0 flex justify-end">
                    <div className="w-full lg:w-3/4 h-full relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/80 to-transparent z-10 w-2/3"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-[#0C0C0C]/50 z-10 h-full"></div>
                        <img
                            src="/images/hero_tunnel.png"
                            alt="Futbolista joven concentrado"
                            className="w-full h-full object-cover object-[center_top] opacity-40 mix-blend-luminosity grayscale contrast-125"
                        />
                    </div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-20">
                    <div className="max-w-3xl">

                        <div className="inline-flex items-center rounded-full border border-[#39FF14]/30 bg-[#39FF14]/10 px-3 py-1 mb-6">
                            <span className="text-[10px] font-bold text-[#39FF14] tracking-[0.2em] uppercase">
                                ALTO RENDIMIENTO CHILE
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black text-white leading-[1.05] tracking-tighter mb-6">
                            Entrena tu mente <br />
                            como un <br />
                            <span className="text-[#0070F3] italic font-serif tracking-normal pr-4">profesional</span>
                        </h1>

                        <p className="text-[#F3F4F6] text-lg md:text-xl max-w-xl font-medium leading-relaxed mb-10">
                            Psicología deportiva aplicada para que tu hijo recupere la confianza, domine sus nervios y destaque en la cancha.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#diagnostico" className="bg-[#0070F3] hover:bg-[#0056B3] text-white px-8 py-4 rounded-md font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-[#0070F3]/30">
                                Asegurar cupo para mi hijo
                                <Zap size={18} className="fill-current" />
                            </a>
                            <a href="#metodologia" className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-8 py-4 rounded-md font-bold text-sm sm:text-base flex items-center justify-center transition-colors">
                                Conocer la metodología científica
                            </a>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
