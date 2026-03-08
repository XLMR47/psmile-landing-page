import { useEffect, useRef } from 'react';
import { Activity, ClipboardList, Target } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const modules = [
    {
        id: '01',
        title: 'Evaluación Psicométrica',
        description: 'Diagnóstico Psicodeportológico basado en datos. Mediciones exactas cognitivas, emocionales y atencionales.',
        icon: <Activity className="text-rojo-intensidad" size={32} />
    },
    {
        id: '02',
        title: 'Intervención TBCS',
        description: 'Terapia Breve Centrada en Soluciones. Diseño de planes mentales individualizados según demanda del jugador o club.',
        icon: <ClipboardList className="text-rojo-intensidad" size={32} />
    },
    {
        id: '03',
        title: 'Seguimiento en Competencia',
        description: 'Monitoreo en tiempo real. Análisis del comportamiento bajo presión para feedback objetivo y ajuste del plan.',
        icon: <Target className="text-rojo-intensidad" size={32} />
    }
];

export default function PerformanceModules() {
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.module-card', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="metodologia" className="py-24 bg-arena text-negro border-t border-black/10 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Módulos de <span className="drama-italic text-rojo-intensidad">Performance.</span>
                        </h2>
                        <p className="text-lg text-gris-cemento font-medium">
                            Estructura clínica de 3 fases diseñada para medir, intervenir y potenciar el rendimiento cognitivo bajo alta presión competitiva.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modules.map((mod) => (
                        <div key={mod.id} className="module-card group bg-white border border-black/5 rounded-[2rem] p-8 hover:shadow-xl hover:border-black/10 transition-all duration-300">
                            <div className="flex justify-between items-start mb-12">
                                <div className="p-4 bg-arena rounded-full group-hover:bg-rojo-intensidad/10 transition-colors">
                                    {mod.icon}
                                </div>
                                <span className="data-mono text-xs font-bold text-gris-cemento">{mod.id}</span>
                            </div>

                            <h3 className="text-2xl font-bold mb-3">{mod.title}</h3>
                            <p className="text-gris-cemento leading-relaxed">{mod.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
