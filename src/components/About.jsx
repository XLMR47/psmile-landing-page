import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.about-elem', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power2.out'
            });
            gsap.from('.about-img', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                },
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: 'power2.out'
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="about" className="py-24 bg-[#0C0C0C]">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left glowing image */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#0070F3]/20 blur-3xl rounded-full scale-90 opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
                        <div className="about-img relative rounded-lg overflow-hidden border border-white/5 bg-[#141414] aspect-square flex items-center justify-center p-8 z-10">
                            <img
                                src="/images/glowing_bulb.png"
                                alt="Psicología Deportiva Aplicada"
                                className="object-cover opacity-90 mix-blend-screen scale-[1.15]"
                            />
                        </div>
                    </div>

                    {/* Right Text Content */}
                    <div>
                        <h2 className="about-elem text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
                            Construimos la mentalidad que separa a un talento de un <span className="text-[#FFFFFF]">profesional</span>
                        </h2>

                        <p className="about-elem text-[#9CA3AF] text-lg leading-relaxed mb-12 max-w-xl">
                            El talento técnico sin control emocional se queda en la banca. En <span className="text-white font-black italic tracking-tight">PSMILE CHILE</span> transformamos la ansiedad y el miedo a fallar en una ventaja competitiva diferencial. Preparamos a la nueva generación de futbolistas chilenos para tolerar la presión, multiplicar su confianza y acelerar su llegada al élite.
                        </p>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="about-elem">
                                <div className="text-5xl font-black text-[#0070F3] mb-2 tracking-tighter">95%</div>
                                <div className="text-[10px] font-bold text-[#A1A1AA] tracking-[0.2em] uppercase">
                                    Mejora en Enfoque
                                </div>
                            </div>
                            <div className="about-elem">
                                <div className="text-5xl font-black text-[#FFFFFF] mb-2 tracking-tighter">15</div>
                                <div className="text-[10px] font-bold text-[#A1A1AA] tracking-[0.2em] uppercase">
                                    Cupos Totales 2026
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
