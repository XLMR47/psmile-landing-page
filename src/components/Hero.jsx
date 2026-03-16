import React, { useEffect, useRef } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
    const heroRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Intro animations
            gsap.from('.hero-elem', {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out',
                delay: 0.1
            });
            gsap.from('.hero-bg', {
                scale: 1.05,
                opacity: 0,
                duration: 2,
                ease: 'power2.out'
            });

            // GSAP Marquee
            gsap.to('.animate-marquee', {
                xPercent: -50,
                repeat: -1,
                duration: 25,
                ease: "none"
            });
        }, heroRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={heroRef} className="flex flex-col">
            {/* Urgency Banner */}
            {/* Rolling Urgency & Info Banner */}
            <div className="hero-elem bg-[#E10600] text-white py-2.5 overflow-hidden z-[60] relative mt-20 md:mt-0 border-b border-black/10">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-12 px-6 shrink-0">
                            <p className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2">
                                <AlertCircle size={14} className="text-white animate-pulse" />
                                🚨 SOLO QUEDAN 5 DE LOS 15 CUPOS DISPONIBLES PARA EL PROGRAMA 2026
                            </p>
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full shrink-0"></span>
                            <p className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2">
                                <Zap size={14} className="text-[#FFFF00]" />
                                VISITA NUESTRA SECCIÓN DE RECURSOS GRATUITOS
                            </p>
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full shrink-0"></span>
                            <p className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2 text-white">
                                🤝 ALIANZA ESTRATÉGICA CON <span className="text-[#FFFFFF] underline decoration-white/30 underline-offset-4">BEWEFUTBOL</span>
                            </p>
                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full shrink-0"></span>
                        </div>
                    ))}
                </div>
            </div>

            <section className="relative min-h-[90vh] flex items-center pt-12 pb-20 overflow-hidden bg-[#0C0C0C]">

                {/* Background with Player Image fading into black */}
                <div className="absolute inset-0 z-0 flex justify-end">
                    <div className="w-full lg:w-3/4 h-full relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/80 to-transparent z-10 w-2/3"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-[#0C0C0C]/50 z-10 h-full"></div>
                        <img
                            src="https://phmtfuozhwspycbwrggd.supabase.co/storage/v1/object/sign/as/0316-ezgif.com-video-to-webp-converter.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85MzVlYzI5NC1lNGUyLTRiMjctOGU0Ny0yZWYyN2FhYjYxZTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcy8wMzE2LWV6Z2lmLmNvbS12aWRlby10by13ZWJwLWNvbnZlcnRlci53ZWJwIiwiaWF0IjoxNzczNjc4NzAwLCJleHAiOjE4MDUyMTQ3MDB9.MYvFQIbTXLs3zbOPIxIfwGW8XyPC3K6Gq-cKOrtu3x4"
                            alt="Futbolista joven concentrado"
                            className="hero-bg w-full h-full object-cover object-[center_top] opacity-50"
                        />
                    </div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-20">
                    <div className="max-w-3xl">

                        <div className="hero-elem inline-flex items-center rounded-full border border-[#FFFFFF]/30 bg-[#FFFFFF]/10 px-3 py-1 mb-6">
                            <span className="text-[10px] font-bold text-[#FFFFFF] tracking-[0.2em] uppercase">
                                ALTO RENDIMIENTO CHILE
                            </span>
                        </div>

                        <h1 className="hero-elem text-5xl md:text-7xl lg:text-[80px] font-black text-white leading-[1.05] tracking-tighter mb-6">
                            Psicología <br />
                            Deportiva de <br />
                            <span className="text-[#0070F3] italic font-serif tracking-normal pr-4">Élite</span>
                        </h1>

                        <p className="hero-elem text-[#F3F4F6] text-lg md:text-xl max-w-xl font-medium leading-relaxed mb-10">
                            Psicología deportiva aplicada para que tu hijo recupere la confianza, domine sus nervios y destaque en la cancha.
                        </p>

                        <div className="hero-elem flex flex-col sm:flex-row gap-4">
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
