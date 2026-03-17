import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Star, ChevronDown, ChevronUp, ShieldCheck, Microscope, Users, Zap, Eye, Trophy, Target } from "lucide-react";
import { trackEvent } from "../utils/tracking";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Pricing() {
    const sectionRef = useRef(null);
    const [expandedPlan, setExpandedPlan] = useState(null);

    const togglePlan = (planId) => {
        setExpandedPlan(expandedPlan === planId ? null : planId);
    };

    useEffect(() => {
        // Import Hotmart Widget Script & Styles
        const importHotmart = () => {
            if (!document.querySelector('script[src*="hotmart.com/checkout/widget.min.js"]')) {
                const script = document.createElement('script');
                script.src = 'https://static.hotmart.com/checkout/widget.min.js';
                script.async = true;
                document.head.appendChild(script);
            }
            if (!document.querySelector('link[href*="hotmart.com/css/hotmart-fb.min.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
                document.head.appendChild(link);
            }
        };
        importHotmart();

        let ctx = gsap.context(() => {
            gsap.from('.price-header', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="planes" className="relative py-24 bg-[#0C0C0C] overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D1FF]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00D1FF]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">

                <div className="price-header text-center mb-12 md:mb-20">
                    <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-[#00D1FF]/20 bg-[#00D1FF]/5">
                        <span className="text-[10px] font-black tracking-[0.3em] text-[#00D1FF] uppercase">Inversión en tu Futuro</span>
                    </div>
                    <h2 className="text-3xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Planes de <span className="italic text-[#00D1FF] drop-shadow-[0_0_15px_rgba(0,209,255,0.3)]">Entrenamiento Mental</span>
                    </h2>
                    <p className="text-[#9CA3AF] text-sm md:text-lg font-medium max-w-2xl mx-auto px-4 md:px-0 leading-relaxed">
                        Elige la mejor opción en Chile para deportistas en formación y familias que buscan resultados reales con metodología científica.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">

                    {/* Plan 1: Diagnóstico de Élite */}
                    <div className="price-card flex flex-col backdrop-blur-md bg-[#141414]/80 border border-white/5 rounded-3xl p-8 hover:border-[#00D1FF]/30 transition-all duration-500 shadow-2xl relative group">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#00D1FF] transition-colors">Diagnóstico de Élite</h3>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-4xl font-black text-white">$12.990</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                <span className="text-[10px] text-[#9CA3AF] font-bold line-through">$50.000</span>
                                <span className="text-[10px] text-[#00D1FF] font-black uppercase tracking-tighter">74% OFF</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-grow">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Sesión Motivo de Consulta</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Entrevista de Futuro Deseado</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Evaluación PSMILE (EPI, GRID)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star size={18} fill="#00D1FF" className="text-[#00D1FF] shrink-0 mt-0.5 animate-pulse" />
                                <span className="text-sm font-bold text-[#00D1FF]">1 Sesión de Regalo Incluida</span>
                            </li>
                        </ul>

                        <div className="space-y-4 mt-auto">
                            <a
                                href="https://pay.hotmart.com/F104947989L?checkoutMode=2&off=abjvr85a"
                                onClick={() => trackEvent('Purchase', { value: 12990, currency: 'CLP', content_name: 'Diagnóstico de Élite' })}
                                className="hotmart-fb hotmart__button-checkout w-full inline-flex items-center justify-center py-4 rounded-xl bg-white text-black font-black text-sm hover:bg-[#00D1FF] transition-all transform hover:scale-[1.02] uppercase tracking-wider text-center"
                            >
                                AGENDAR DIAGNÓSTICO
                            </a>

                            <button
                                onClick={() => togglePlan(1)}
                                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-[#4B5563] hover:text-[#00D1FF] transition-colors py-2 uppercase tracking-widest"
                            >
                                {expandedPlan === 1 ? 'Ocultar detalles' : 'Ver detalle del programa'}
                                {expandedPlan === 1 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                        </div>

                        {/* Expandable Section */}
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedPlan === 1 ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-5 pt-6 border-t border-white/5">
                                <div className="flex gap-4">
                                    <Microscope size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-tight">Radiografía Mental</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Análisis de personalidad y atención con instrumentos científicos.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Users size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-tight">Feedback para Padres</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Sesión explicativa sobre el perfil de su hijo en lenguaje claro.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Target size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-tight">Entrenamiento de máximo rendimiento</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Definición de metas y futuro deseado del jugador.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan 2: Performance & Mental Skills (POPULAR) */}
                    <div className="price-card flex flex-col bg-gradient-to-b from-[#1C1C1E] to-[#0C0C0C] border-2 border-[#00D1FF] rounded-3xl p-8 relative transform md:-translate-y-6 shadow-[0_20px_50px_rgba(0,209,255,0.15)] z-20 overflow-visible group">
                        <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00D1FF] text-black text-[10px] font-black tracking-[.25em] uppercase px-6 py-2 rounded-full whitespace-nowrap shadow-[0_0_20px_rgba(0,209,255,0.4)]">
                            RECOMENDADO
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#00D1FF] transition-colors">Performance & Mental Skills</h3>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-5xl font-black text-white">$35.000</span>
                                <span className="text-sm font-bold text-[#4B5563]">/mes</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-[#00D1FF]/10 border border-[#00D1FF]/20">
                                <span className="text-[10px] text-[#9CA3AF] font-bold line-through">$80.000</span>
                                <span className="text-[10px] text-[#00D1FF] font-black uppercase tracking-tighter">AHORRA 56%</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-grow">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6] font-medium">Todo lo del Diagnóstico</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6] font-medium">Observación ePsD en cancha</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6] font-medium">Entrenamiento en Scanning</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6] font-medium">Control de Pulsaciones</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star size={18} fill="#00D1FF" className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm font-black text-white">2 Sesiones Individuales / mes</span>
                            </li>
                        </ul>

                        <div className="space-y-4 mt-auto">
                            <a
                                href="https://pay.hotmart.com/F104947989L?checkoutMode=2&off=u5r4nosm"
                                onClick={() => trackEvent('Purchase', { value: 35000, currency: 'CLP', content_name: 'Performance & Mental Skills' })}
                                className="relative w-full inline-flex items-center justify-center py-4 rounded-xl bg-gradient-to-r from-[#00D1FF] to-[#00A3FF] hover:from-[#00E0FF] hover:to-[#00D1FF] text-black font-black text-sm transition-all transform hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,209,255,0.4)] uppercase tracking-wider text-center hotmart-fb hotmart__button-checkout group/btn overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    RESERVAR MI CUPO (QUEDAN 5)
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none"></span>
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </span>
                            </a>

                            <button
                                onClick={() => togglePlan(2)}
                                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-[#4B5563] hover:text-[#00D1FF] transition-colors py-2 uppercase tracking-widest"
                            >
                                {expandedPlan === 2 ? 'Ocultar detalles' : 'Ver detalle del programa'}
                                {expandedPlan === 2 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                        </div>

                        {/* Expandable Section */}
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedPlan === 2 ? 'max-h-[600px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-5 pt-6 border-t border-white/5">
                                <div className="flex gap-4">
                                    <Eye size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase">Análisis en Acción</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Observación profesional en partido real para detectar visión y resiliencia.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Zap size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase">Entrenamiento de Scanning</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Técnicas de élite para mejorar visión periférica y toma de decisiones.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <ShieldCheck size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase">Foco Blindado</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Protocolos de recuperación tras el error para rendir los 90 minutos.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Target size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase">Mentoria Individual</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Diseñamos un plan de optimización a medida con 2 sesiones directas al mes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan 3: Élite 360 */}
                    <div className="price-card flex flex-col backdrop-blur-md bg-[#141414]/80 border border-white/5 rounded-3xl p-8 hover:border-[#00D1FF]/30 transition-all duration-500 shadow-2xl relative group">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#00D1FF] transition-colors">Élite 360</h3>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-4xl font-black text-white">$75.000</span>
                                <span className="text-sm font-bold text-[#4B5563]">/mes</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                <span className="text-[10px] text-[#9CA3AF] font-bold line-through">$150.000</span>
                                <span className="text-[10px] text-[#00D1FF] font-black uppercase tracking-tighter">AHORRA 50%</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-grow">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Todo lo de Performance</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">Psicoeducación para Padres</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm text-[#F3F4F6]">4 Sesiones Mensuales</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Trophy size={18} className="text-[#00D1FF] shrink-0 mt-0.5" />
                                <span className="text-sm font-bold text-[#00D1FF]">20% OFF Permanent Renewal</span>
                            </li>
                        </ul>

                        <div className="space-y-4 mt-auto">
                            <a
                                href="https://pay.hotmart.com/F104947989L?checkoutMode=2&off=b0cszwye"
                                onClick={() => trackEvent('Purchase', { value: 75000, currency: 'CLP', content_name: 'Élite 360' })}
                                className="hotmart-fb hotmart__button-checkout w-full inline-flex items-center justify-center py-4 rounded-xl border-2 border-[#00D1FF]/50 bg-[#00D1FF]/5 text-white font-black text-sm hover:bg-[#00D1FF] hover:text-black hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all transform hover:scale-[1.02] uppercase tracking-wider text-center group/elite relative overflow-hidden"
                            >
                                <span className="relative z-10">POSTULAR A ÉLITE 360</span>
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/elite:animate-[shimmer_2s_infinite] pointer-events-none"></span>
                            </a>

                            <button
                                onClick={() => togglePlan(3)}
                                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-[#4B5563] hover:text-[#00D1FF] transition-colors py-2 uppercase tracking-widest"
                            >
                                {expandedPlan === 3 ? 'Ocultar detalles' : 'Ver detalle del programa'}
                                {expandedPlan === 3 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                        </div>

                        {/* Expandable Section */}
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedPlan === 3 ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-5 pt-6 border-t border-white/5">
                                <div className="flex gap-4">
                                    <Users size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase">Escuela de Padres</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Crianza que potencia la motivación sin generar presión tóxica.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Zap size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase">Acompañamiento VIP</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Entrenamiento mental profundo con seguimiento 1 a 1 semanal.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Target size={18} className="text-[#00D1FF] shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase">Garantía Pro</h4>
                                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Sesión de seguimiento incluida para asegurar éxito a largo plazo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-16 text-center">
                    <p className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase">
                        Planes exclusivos para Chile · Solo pagos vía Hotmart para Garantía de Satisfacción
                    </p>
                </div>
            </div>
        </section>
    );
}
