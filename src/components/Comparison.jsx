import { XCircle, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";

export default function Comparison() {
    const comparisonPoints = [
        {
            topic: "El Enfoque",
            traditional: 'Charlas motivacionales (“Échale ganas”, “Tú puedes”). El efecto desaparece con el primer error.',
            psmile: 'Protocolos de neurociencia aplicada. Se entrena la resiliencia inmediata in-game para no depender de la motivación.',
        },
        {
            topic: "La Herramienta",
            traditional: 'Basado en la experiencia del "coach", opiniones y consejos genéricos sin respaldo empírico.',
            psmile: 'Basado en psicometría estructurada (ePsD Lite) y datos concretos del jugador (Entrenamiento mental para el maximo rendimiento).',
        },
        {
            topic: "La Instrucción",
            traditional: '“Tienes que concentrarte más”, “No te pongas nervioso”. (Dice QUÉ hacer, pero no CÓMO hacerlo).',
            psmile: 'Entrenamiento táctico mental: Scanning periférico, control de pulsaciones y anclajes respiratorios de recuperación.',
        },
        {
            topic: "El Resultado",
            traditional: 'Dependencia del estado de ánimo. El jugador es brillante cuando va ganando, pero se esconde cuando va perdiendo.',
            psmile: 'Autonomía emocional. El jugador rinde al 100% los 90 minutos, neutralizando la presión del resultado o del público.',
        }
    ];

    return (
        <section className="py-24 bg-[#080808] relative border-t border-white/5 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-[#E10600]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-[#FFFFFF]/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-bold text-[#0070F3] tracking-[0.3em] uppercase block mb-4">El valor de lo científico</span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                        La diferencia entre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E10600] to-orange-500">motivar</span> y <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#0070F3]">entrenar tu mente</span>
                    </h2>
                    <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
                        Muchos te dicen "échale ganas". Nosotros medimos, estructuramos y blindamos la psicología del jugador con métodos clínicos aplicados al deporte.
                    </p>
                </div>

                {/* Desktop/Tablet Table View */}
                <div className="hidden lg:block">
                    <div className="grid grid-cols-12 gap-6 items-center mb-8">
                        <div className="col-span-2"></div>
                        <div className="col-span-5 bg-[#141414] border border-[#E10600]/20 rounded-t-2xl p-6 text-center shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E10600] to-orange-500"></div>
                            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                                <AlertTriangle className="text-[#E10600]" size={20} />
                                Coaching Tradicional
                            </h3>
                            <p className="text-[10px] text-[#A1A1AA] mt-2 uppercase tracking-wider">Simples opiniones y motivación</p>
                        </div>
                        <div className="col-span-5 bg-[#1A1A1A] border border-[#FFFFFF]/30 rounded-t-2xl p-6 text-center shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFFFFF] to-[#0070F3]"></div>
                            <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
                                <TrendingUp className="text-[#FFFFFF]" size={20} />
                                Sistema PSMILE
                            </h3>
                            <p className="text-[10px] text-[#FFFFFF] mt-2 uppercase tracking-wider">Psicología Clínica y Deportiva Estructurada</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {comparisonPoints.map((point, i) => (
                            <div key={i} className="grid grid-cols-12 gap-6 items-stretch">
                                <div className="col-span-2 flex items-center justify-start">
                                    <span className="text-sm font-bold text-white/50 uppercase tracking-widest">{point.topic}</span>
                                </div>
                                <div className="col-span-5 bg-[#141414]/50 border border-white/5 rounded-xl p-6 flex items-start gap-4 hover:bg-[#141414] transition-colors">
                                    <XCircle className="text-[#E10600] shrink-0 mt-0.5" size={20} />
                                    <p className="text-[#9CA3AF] text-sm leading-relaxed">{point.traditional}</p>
                                </div>
                                <div className="col-span-5 bg-[#1A1A1A] border border-[#FFFFFF]/20 rounded-xl p-6 flex items-start gap-4 hover:border-[#FFFFFF]/50 transition-colors shadow-lg">
                                    <CheckCircle2 className="text-[#FFFFFF] shrink-0 mt-0.5" size={20} />
                                    <p className="text-white text-sm font-medium leading-relaxed">{point.psmile}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile View (Stacked Cards) */}
                <div className="block lg:hidden space-y-12">
                    {comparisonPoints.map((point, i) => (
                        <div key={i} className="space-y-4">
                            <h4 className="text-center text-sm font-bold text-white/50 uppercase tracking-widest border-b border-white/5 pb-2">
                                {point.topic}
                            </h4>

                            <div className="bg-[#141414] border border-[#E10600]/20 rounded-xl p-5 relative">
                                <span className="absolute -top-3 left-4 bg-[#080808] text-[10px] font-black text-[#E10600] px-2 py-1 uppercase tracking-wider border border-[#E10600]/20 rounded-md">
                                    Coaching
                                </span>
                                <div className="flex gap-3 mt-2">
                                    <XCircle className="text-[#E10600] shrink-0" size={18} />
                                    <p className="text-[#9CA3AF] text-sm leading-relaxed">{point.traditional}</p>
                                </div>
                            </div>

                            <div className="bg-[#1A1A1A] border border-[#FFFFFF]/30 rounded-xl p-5 relative shadow-lg">
                                <span className="absolute -top-3 right-4 bg-[#080808] text-[10px] font-black text-[#FFFFFF] px-2 py-1 uppercase tracking-wider border border-[#FFFFFF]/30 rounded-md">
                                    Método PSMILE
                                </span>
                                <div className="flex gap-3 mt-2">
                                    <CheckCircle2 className="text-[#FFFFFF] shrink-0" size={18} />
                                    <p className="text-white font-medium text-sm leading-relaxed">{point.psmile}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="max-w-4xl mx-auto">
                        {/* Imagen */}
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            <img
                                src="/images/Analisis de jugador.jpg"
                                alt="Análisis Visual Comparativo - Sistema PSMILE"
                                className="w-full h-auto object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
                            />
                        </div>

                        {/* Recuadro de Tipografía Resumen */}
                        <div className="bg-[#141414] border border-white/10 rounded-xl p-6 -mt-4 relative z-10 mx-4 sm:mx-12 shadow-lg">
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#0070F3] mb-2">La ciencia detrás del rendimiento</p>
                            <h4 className="text-white font-black text-lg md:text-xl mb-2">
                                La diferencia se mide, no se adivina.
                            </h4>
                            <p className="text-[#9CA3AF] text-sm max-w-xl mx-auto">
                                Mientras otros motivan con frases, nosotros evaluamos con psicometría estructurada y entrenamos con protocolos de neurociencia aplicada.
                            </p>
                        </div>

                        <a href="#planes" className="inline-block mt-6 px-8 py-4 bg-[#0070F3] hover:bg-[#0056B3] text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-[0_0_40px_rgba(0,112,243,0.5)] transition-transform hover:scale-105">
                            Elegir Psicología de Élite
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
