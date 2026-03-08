import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

const premiumModules = [
    {
        title: 'Dashboard de Progreso Cognitivo',
        status: 'Locked',
        desc: 'Visualiza tus métricas de atención, control de impulsos y resiliencia en tiempo real.'
    },
    {
        title: 'Simulaciones Tácticas AR',
        status: 'Locked',
        desc: 'Batería de escenarios deportivos inmersivos para la toma de decisiones.'
    },
    {
        title: 'Chat 1:1 Directorio Clínico',
        status: 'Available',
        desc: 'Línea directa para ajustes rápidos previo a competiciones oficiales.'
    }
];

export default function PremiumHub() {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <section id="hub" className="py-24 bg-[#0A0A0A] text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex flex-col md:flex-row gap-12 items-center">

                    <div className="md:w-1/3">
                        <div className="inline-flex items-center gap-2 border border-rojo-intensidad/50 bg-rojo-intensidad/10 text-rojo-intensidad px-3 py-1 rounded-full text-xs font-bold data-mono uppercase tracking-widest mb-6">
                            <ShieldAlert size={14} />
                            Restricted Access
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
                            Mental Performance <br /> <span className="drama-italic text-gris-cemento">Hub.</span>
                        </h2>
                        <p className="text-gris-cemento mb-8">
                            La infraestructura digital reservada para atletas y clubes en nuestros programas activos. Todo tu perfil psicodeportivo, datos y recursos avanzados en un solo sistema.
                        </p>
                        <a href="#diagnostico" className="btn-activation inline-block bg-white text-black px-6 py-3 rounded-full font-bold text-sm">
                            Solicitar Acceso
                        </a>
                    </div>

                    <div className="md:w-2/3 grid gap-4 w-full">
                        {premiumModules.map((mod, i) => (
                            <div
                                key={i}
                                className={`relative overflow-hidden rounded-[1.5rem] border ${mod.status === 'Locked' ? 'border-white/10 bg-white/5' : 'border-green-500/30 bg-green-500/10'} p-6 transition-all duration-300`}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`text-xl font-bold ${mod.status === 'Locked' ? 'text-white/80' : 'text-green-500'}`}>{mod.title}</h3>
                                    <div className="p-2 bg-black/40 rounded-full backdrop-blur-sm">
                                        {mod.status === 'Locked' ? (
                                            <Lock size={16} className={`text-gris-cemento transition-transform duration-300 ${hoveredIndex === i ? 'scale-110' : ''}`} />
                                        ) : (
                                            <Unlock size={16} className="text-green-500" />
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gris-cemento/60 max-w-sm">{mod.desc}</p>

                                {mod.status === 'Locked' && hoveredIndex === i && (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                        <span className="data-mono text-xs tracking-widest text-rojo-intensidad font-bold border border-rojo-intensidad/30 px-4 py-2 rounded-md bg-rojo-intensidad/10">REQUIERE ENROLAMIENTO PREVIO</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
