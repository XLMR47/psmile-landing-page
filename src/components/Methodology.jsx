import { Eye, TrendingUp, Maximize, Target, BookOpen, Smile } from "lucide-react";

const methodSteps = [
    {
        letter: 'P',
        title: 'Performance Awareness',
        desc: 'Identificamos las métricas exactas y los bloqueos mentales silenciosos que están frenando tu talento en la cancha.',
        icon: <Eye className="text-[#39FF14]" size={20} />
    },
    {
        letter: 'S',
        title: 'Self Regulation',
        desc: 'Técnicas tácticas para dominar la ansiedad. Aprende a entrar al campo con el ritmo cardíaco perfecto y la mente fría.',
        icon: <TrendingUp className="text-[#39FF14]" size={20} />
    },
    {
        letter: 'M',
        title: 'Mental Training',
        desc: 'Protocolos de élite: visualización constante, concentración inquebrantable y recuperación instantánea tras el error.',
        icon: <Maximize className="text-[#39FF14]" size={20} />
    },
    {
        letter: 'I',
        title: 'In-game Focus',
        desc: 'Entrenamiento en Scanning. Adquiere la visión de juego y la calma necesarias para decidir rápido y bien bajo presión extrema.',
        icon: <Target className="text-[#39FF14]" size={20} />
    },
    {
        letter: 'L',
        title: 'Learning Mindset',
        desc: 'Destruye el miedo a equivocarte. Convierte la frustración en un motor psicológico para jugar con mayor agresividad deportiva.',
        icon: <BookOpen className="text-[#39FF14]" size={20} />
    },
    {
        letter: 'E',
        title: 'Emotional Control',
        desc: 'Blindaje psicológico para sostener un alto nivel los 90 minutos completos, independientemente del marcador o del árbitro.',
        icon: <Smile className="text-[#39FF14]" size={20} />
    }
];

export default function Methodology() {
    return (
        <section id="metodologia" className="py-24 bg-[#0C0C0C] relative overflow-hidden">

            {/* Huge Background Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0">
                <span className="text-[25vw] font-black text-white/[0.02] tracking-tighter leading-none italic">
                    PSMILE
                </span>
            </div>

            <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                            Metodología <span className="italic text-[#0070F3]">PSMILE</span> <br />
                            <span className="text-[#39FF14] text-2xl md:text-3xl">Ciencia Aplicada al Fútbol</span>
                        </h2>
                        <p className="text-[#9CA3AF] text-lg font-medium leading-relaxed max-w-xl">
                            Un sistema paso a paso diseñado específicamente para que el futbolista joven domine su mente como herramienta táctica, transformando sus peores miedos y nervios en foco asesino y ventaja competitiva.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#39FF14]/10 blur-3xl rounded-full"></div>
                        <img
                            src="/images/radar.png"
                            alt="Perfil Psicológico de Alto Rendimiento"
                            className="relative z-10 w-full max-w-md mx-auto radar-glow rounded-3xl"
                        />
                        <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-[#1A1A1A] border border-white/10 p-4 rounded-xl shadow-2xl z-20">
                            <span className="text-[10px] font-bold text-[#39FF14] tracking-widest uppercase block mb-1">Métrica Real</span>
                            <span className="text-white font-black text-xl">Precisión Sci-Tech</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {methodSteps.map((step, i) => (
                        <div key={i} className="bg-[#1A1A1A] rounded-xl p-8 border border-white/5 relative overflow-hidden group hover:border-[#39FF14]/30 transition-all duration-500">

                            {/* Fake giant background letter */}
                            <div className="absolute right-4 bottom-[-10px] text-8xl font-black text-white/[0.03] select-none group-hover:text-[#39FF14]/[0.05] transition-colors leading-none">
                                {step.letter}
                            </div>

                            <div className="mb-6 relative z-10 w-10 h-10 bg-[#39FF14]/10 rounded-lg flex items-center justify-center">
                                {step.icon}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 relative z-10">{step.title}</h3>
                            <p className="text-sm text-[#9CA3AF] leading-relaxed relative z-10 pr-8 group-hover:text-white/80 transition-colors">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
