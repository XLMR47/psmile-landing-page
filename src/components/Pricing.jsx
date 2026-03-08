import { useState } from "react";
import { CheckCircle2, Star, ChevronDown, ChevronUp, ShieldCheck, Microscope, Users, Zap, Eye, Trophy, Target } from "lucide-react";

export default function Pricing() {
    const [expandedPlan, setExpandedPlan] = useState(null);

    const togglePlan = (planId) => {
        setExpandedPlan(expandedPlan === planId ? null : planId);
    };

    return (
        <section id="planes" className="py-24 bg-[#0C0C0C]">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Planes de <span className="italic text-[#39FF14]">Entrenamiento Mental</span>
                    </h2>
                    <p className="text-[#9CA3AF] text-base font-medium max-w-2xl mx-auto">
                        Elige la mejor opción en Chile para deportistas en formación y familias que buscan resultados reales.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                    {/* Plan 1: Diagnóstico de Élite */}
                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300 shadow-xl overflow-hidden self-start">
                        <h3 className="text-xl font-bold text-white mb-2">Diagnóstico de Élite</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-4xl font-black text-white">$12.990</span>
                        </div>
                        <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-8">Valor Real: $50.000</p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Sesión Motivo de Consulta</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Sesión TBCS "Futuro Deseado"</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Evaluación PSMILE (EPI, Motivación, GRID)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6] font-bold text-[#39FF14]">1 Sesión Personalizada de Regalo</span>
                            </li>
                        </ul>

                        <div className="space-y-4">
                            <a
                                href={`https://wa.me/56951435062?text=${encodeURIComponent("Hola Luis! 👋 Me interesa el [Diagnóstico de Élite] para mi hijo. ¿Cómo podemos agendar la primera sesión?")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center py-3 rounded-lg border border-[#39FF14]/30 text-[#39FF14] font-bold text-sm hover:bg-[#39FF14]/10 transition-colors uppercase tracking-wider text-center"
                            >
                                Iniciar Diagnóstico
                            </a>

                            <button
                                onClick={() => togglePlan(1)}
                                className="w-full flex items-center justify-center gap-2 text-[11px] font-bold text-[#9CA3AF] hover:text-white transition-colors py-2 uppercase tracking-widest"
                            >
                                {expandedPlan === 1 ? 'Ocultar detalles' : 'Ver detalle del programa'}
                                {expandedPlan === 1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        </div>

                        {/* Expandable Section */}
                        <div className={`transition-all duration-500 ease-in-out ${expandedPlan === 1 ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="flex gap-4">
                                    <Microscope size={20} className="text-[#0070F3] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Radiografía Mental Científica</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">No es una charla; es un análisis de personalidad, motivación y atención con instrumentos psicométricos estructurados.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Users size={20} className="text-[#0070F3] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Claridad para la Familia</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">Sesión de feedback donde explicamos a los padres el perfil mental de su hijo en lenguaje sencillo.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Target size={20} className="text-[#0070F3] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Enfoque TBCS</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">Entrevista centrada en soluciones para definir el "futuro deseado" del jugador.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-[#E10600] rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Solo quedan 8 cupos</span>
                        </div>
                    </div>

                    {/* Plan 2: Performance & Mental Skills (POPULAR) */}
                    <div className="bg-[#1C1C1E] border border-[#0070F3] rounded-2xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-[#0070F3]/20 self-start">
                        <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0070F3] text-white text-[11px] font-black tracking-widest uppercase px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg shadow-[#0070F3]/40">
                            🔥 POPULAR
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Performance & Mental Skills</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-black text-white">$39.990</span>
                        </div>
                        <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-8">Valor Real: $80.000</p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#0070F3] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Todo lo del Diagnóstico</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#0070F3] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Observación ePsD Lite en cancha</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#0070F3] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Entrenamiento en Scanning (visión de juego)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#0070F3] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Control de Pulsaciones y Resiliencia Inmediata</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star size={18} className="text-[#0070F3] shrink-0 mt-0.5" />
                                <span className="text-sm font-bold text-[#F3F4F6]">2 Sesiones de Intervención Personalizada / mes</span>
                            </li>
                        </ul>

                        <div className="space-y-4">
                            <a
                                href={`https://wa.me/56951435062?text=${encodeURIComponent("Hola Luis! 👋 Quiero asegurar un cupo en el programa [Performance & Mental Skills] para mi hijo. Vengo de la web oficial.")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center py-3 rounded-lg bg-[#0070F3] hover:bg-[#0056B3] text-white font-black text-sm transition-all transform hover:scale-[1.02] shadow-lg shadow-[#0070F3]/30 uppercase tracking-wider text-center"
                            >
                                Asegurar cupo para mi hijo
                            </a>

                            <button
                                onClick={() => togglePlan(2)}
                                className="w-full flex items-center justify-center gap-2 text-[11px] font-bold text-[#9CA3AF] hover:text-white transition-colors py-2 uppercase tracking-widest"
                            >
                                {expandedPlan === 2 ? 'Ocultar detalles' : 'Ver detalle del programa'}
                                {expandedPlan === 2 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        </div>

                        {/* Expandable Section */}
                        <div className={`transition-all duration-500 ease-in-out ${expandedPlan === 2 ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="flex gap-4">
                                    <Eye size={20} className="text-[#39FF14] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Análisis en Acción (ePsD Lite)</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">Observación profesional en un partido real para detectar visión de juego, liderazgo y resiliencia inmediata en vivo.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Zap size={20} className="text-[#39FF14] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Entrenamiento de Campo (Scanning)</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">Técnicas de élite para mejorar la visión periférica y la toma de decisiones bajo presión extrema.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <ShieldCheck size={20} className="text-[#39FF14] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Foco Blindado</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">Protocolos de respiración y recuperación tras el error para mantener el rendimiento al 100% los 90 minutos.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Target size={20} className="text-[#39FF14] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Intervención Personalizada (2 sesiones / mes)</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">Basándonos en lo detectado en el Diagnóstico y la observación en cancha, diseñamos un plan de intervención a medida. Cada mes realizamos 2 sesiones individuales donde trabajamos directamente las áreas que más impactan el rendimiento del jugador: confianza, control de ansiedad, foco o toma de decisiones bajo presión.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-[#E10600] rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-white/60 tracking-[0.2em] uppercase">Solo quedan 8 cupos</span>
                        </div>
                    </div>

                    {/* Plan 3: Élite 360 */}
                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300 shadow-xl overflow-hidden self-start">
                        <h3 className="text-xl font-bold text-white mb-2">Élite 360</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-4xl font-black text-white">$99.990</span>
                        </div>
                        <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-8">Valor Real: $150.000</p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Todo lo de Performance</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Psicoeducación para Padres (crianza deportiva)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">4 sesiones intensivas mensuales</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6] font-bold text-[#39FF14]">20% OFF en renovaciones</span>
                            </li>
                        </ul>

                        <div className="space-y-4">
                            <a
                                href={`https://wa.me/56951435062?text=${encodeURIComponent("Hola Luis! 👋 Me interesa el programa [Élite 360] y me gustaría postular para trabajar contigo. ¿Qué pasos siguen?")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center py-3 rounded-lg border border-white/20 text-white font-bold text-sm hover:bg-white/5 transition-colors uppercase tracking-wider text-center"
                            >
                                Postular al Programa
                            </a>

                            <button
                                onClick={() => togglePlan(3)}
                                className="w-full flex items-center justify-center gap-2 text-[11px] font-bold text-[#9CA3AF] hover:text-white transition-colors py-2 uppercase tracking-widest"
                            >
                                {expandedPlan === 3 ? 'Ocultar detalles' : 'Ver detalle del programa'}
                                {expandedPlan === 3 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        </div>

                        {/* Expandable Section */}
                        <div className={`transition-all duration-500 ease-in-out ${expandedPlan === 3 ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="flex gap-4">
                                    <Users size={20} className="text-[#0070F3] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Escuela para Padres de Atletas</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">Psicoeducación integral sobre estilos de crianza que potencian la motivación sin generar presión tóxica.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Zap size={20} className="text-[#0070F3] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Acompañamiento VIP</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">4 sesiones intensivas mensuales de entrenamiento mental profundo y seguimiento 1 a 1.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Trophy size={20} className="text-[#0070F3] shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Garantía Pro</h4>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed">Sesión de seguimiento gratuita y descuento permanente en renovaciones para asegurar el éxito a largo plazo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-[#E10600] rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Solo quedan 8 cupos</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
