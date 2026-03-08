import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const phases = [
    {
        id: '01',
        title: 'Diagnóstico Estructural',
        desc: 'Instrumentos psicométricos y observación de campo para establecer la línea base cognitiva y emocional real del atleta.'
    },
    {
        id: '02',
        title: 'Estrategia TBCS',
        desc: 'Diseño del plan mental. Identificación de excepciones y recursos existentes para cocrear soluciones rápidas y sostenibles.'
    },
    {
        id: '03',
        title: 'Simulación de Presión',
        desc: 'Entrenamiento bajo variables de estrés competitivo simulado para inducir consolidación de las habilidades psicológicas.'
    },
    {
        id: '04',
        title: 'Transferencia Competitiva',
        desc: 'Evaluación de KPI psicodeportivos en competencia oficial para asegurar la transferencia biológica y conductual.'
    }
];

export default function Protocol() {
    const containerRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Pinning the section
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top top',
                end: '+=400%',
                pin: true,
            });

            // Animating cards stacking up
            gsap.utils.toArray('.protocol-card').forEach((card, i) => {
                if (i === 0) return; // First card is already visible

                gsap.fromTo(card,
                    { y: '100%', scale: 0.9, opacity: 0 },
                    {
                        y: `${i * 20}px`, // Stack offset
                        scale: 1,
                        opacity: 1,
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: `top+=${i * 100}% top`,
                            end: `top+=${(i + 1) * 100}% top`,
                            scrub: 1,
                        }
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="h-screen w-full bg-negro flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                {/* Abstract wavy SVG for background vibe */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-gris-cemento/20 fill-none stroke-[0.2]">
                    <path d="M0 50 Q 25 25, 50 50 T 100 50" vectorEffect="non-scaling-stroke">
                        <animate attributeName="d" dur="10s" repeatCount="indefinite"
                            values="M0 50 Q 25 25, 50 50 T 100 50; M0 50 Q 25 75, 50 50 T 100 50; M0 50 Q 25 25, 50 50 T 100 50" />
                    </path>
                </svg>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center">
                <div className="text-center mb-12">
                    <span className="data-mono text-rojo-intensidad text-xs font-bold tracking-[0.2em] uppercase">El Sistema</span>
                    <h2 className="text-5xl font-bold text-white mt-2">Protocolo Técnico</h2>
                </div>

                <div className="relative w-full max-w-4xl mx-auto h-[50vh]">
                    {phases.map((phase, i) => (
                        <div
                            key={phase.id}
                            className="protocol-card absolute top-0 left-0 w-full bg-arena border border-black/20 rounded-[2rem] p-10 md:p-16 shadow-2xl flex flex-col md:flex-row gap-8 items-start md:items-center"
                            style={{ zIndex: i }}
                        >
                            <div className="text-6xl md:text-8xl font-black text-rojo-intensidad/10 data-mono leading-none">
                                {phase.id}
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-negro mb-4">{phase.title}</h3>
                                <p className="text-lg text-negro/70 font-medium leading-relaxed">
                                    {phase.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
