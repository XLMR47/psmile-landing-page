import { useState, useEffect } from 'react';
import { Play, Square, Activity, ShieldCheck, ChevronRight, LockKeyhole } from 'lucide-react';

export default function TacticalBreathing({ unlocked = false, onRequestUnlock }) {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('ESPERA'); // ESPERA, INHALA, MANTÉN, EXHALA
    const [timeLeft, setTimeLeft] = useState(4);
    const [cycleCount, setCycleCount] = useState(0);

    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev > 1) return prev - 1;

                    // Transition to next phase
                    if (phase === 'INHALA' || phase === 'ESPERA') {
                        setPhase('MANTÉN');
                        return 2;
                    } else if (phase === 'MANTÉN') {
                        setPhase('EXHALA');
                        return 4;
                    } else if (phase === 'EXHALA') {
                        setCycleCount(c => {
                            const newCount = c + 1;
                            if (newCount >= 8) {
                                setIsActive(false);
                            }
                            return newCount;
                        });
                        setPhase('INHALA');
                        return 4;
                    }
                    return prev;
                });
            }, 1000);
        } else {
            clearInterval(interval);
            setPhase('ESPERA');
            setTimeLeft(4);
        }

        return () => clearInterval(interval);
    }, [isActive, phase]);

    const toggleTraining = () => {
        if (!isActive) {
            setPhase('INHALA');
            setTimeLeft(4);
            setCycleCount(0);
        }
        setIsActive(!isActive);
    };

    // Determine circle styles based on phase
    let circleClass = 'w-32 h-32 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out border-4 shadow-2xl relative z-10 ';
    let textClass = 'text-white font-black text-2xl tracking-widest z-20 relative transition-colors duration-500 ';

    if (phase === 'ESPERA') {
        circleClass += 'bg-[#0A192F] border-[#1E3A8A] scale-100 duration-500'; // Midnight
        textClass += 'text-[#9CA3AF]';
    } else if (phase === 'INHALA') {
        circleClass += 'bg-[#0070F3] border-[#00E5FF] scale-150 shadow-[0_0_40px_rgba(0,229,255,0.4)]'; // Electric Blue expanding
        textClass += 'text-white drop-shadow-md';
    } else if (phase === 'MANTÉN') {
        circleClass += 'bg-[#0070F3] border-[#00E5FF] scale-150 animate-pulse shadow-[0_0_60px_rgba(0,229,255,0.6)] duration-500'; // Static but pulsing
        textClass += 'text-white drop-shadow-md';
    } else if (phase === 'EXHALA') {
        circleClass += 'bg-[#0A192F] border-[#1E3A8A] scale-100 shadow-[0_0_10px_rgba(30,58,138,0.2)] duration-[4000ms]'; // Contracting to Midnight
        textClass += 'text-[#9CA3AF]';
    }

    return (
        <div className="bg-[#141414] border border-[#0070F3]/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,112,243,0.05)] text-white mt-8 relative">
            {/* Etiqueta Superior */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#00E5FF] to-[#0070F3] text-black text-[9px] font-black tracking-widest uppercase px-4 py-1.5 rounded-bl-xl z-20 shadow-[0_0_15px_rgba(0,229,255,0.4)] animate-pulse">
                Entrenador de Pulsaciones en Vivo (Beta)
            </div>

            <div className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">

                    {/* Columna Izquierda: Información */}
                    <div className="md:w-1/2 space-y-4">
                        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00E5FF]">
                            Marcapasos de Respiración Táctica PSMILE
                        </h3>
                        <p className="text-[#9CA3AF] text-sm leading-relaxed">
                            Usa esta herramienta antes de tus partidos para hackear tu sistema nervioso y entrar en la zona de máximo enfoque. Ciclo optimizado 4-2-4.
                        </p>

                        <div className="bg-[#1A1A1A] border-l-2 border-[#0070F3] p-3 rounded-r-lg">
                            <p className="text-xs text-blue-200 italic font-medium flex items-start gap-2">
                                <Activity size={16} className="text-[#00E5FF] shrink-0 mt-0.5" />
                                "El 90% de los errores en los últimos 10 minutos ocurren por pulsaciones elevadas. Entrena tu calma ahora".
                            </p>
                        </div>

                        {/* Credenciales / Coherencia Visual */}
                        <div className="pt-2 flex items-center gap-3">
                            <ShieldCheck size={18} className="text-[#FFFFFF]" />
                            <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold">
                                Respaldado por Ciencia Aplicada
                            </div>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <div className="w-16 h-12 rounded overflow-hidden border border-white/10 relative group">
                                <img src="/images/Neurociencias.jpeg" alt="Certificado Neurociencias La Pizarra del DT" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="w-16 h-12 rounded overflow-hidden border border-white/10 relative group">
                                <img src="/images/Titulo profesional.jpeg" alt="Título Profesional de Psicología" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>

                    </div>

                    {/* Columna Derecha: Interfaz Interactiva */}
                    <div className="md:w-1/2 flex flex-col items-center justify-center p-6 bg-[#0C0C0C] rounded-xl border border-white/5 w-full relative overflow-hidden h-[300px]">
                        {/* Lock Overlay when not unlocked */}
                        {!unlocked && (
                            <div
                                onClick={onRequestUnlock}
                                className="absolute inset-0 z-40 bg-[#0C0C0C]/80 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:bg-[#0C0C0C]/70 transition-colors"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#0070F3]/20 border-2 border-[#0070F3]/40 flex items-center justify-center mb-3 hover:scale-110 transition-transform">
                                    <LockKeyhole className="text-[#0070F3]" size={24} />
                                </div>
                                <p className="text-white font-bold text-sm">Desbloquea para entrenar</p>
                                <p className="text-[#9CA3AF] text-xs mt-1">Ingresa tu email para acceder gratis</p>
                            </div>
                        )}

                        {/* Círculos decorativos de fondo */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                            <div className="w-48 h-48 rounded-full border border-white/10 absolute"></div>
                            <div className="w-64 h-64 rounded-full border border-white/5 absolute"></div>
                        </div>

                        <div className={circleClass}>
                            <div className="flex flex-col items-center justify-center">
                                <span className={textClass}>
                                    {phase === 'ESPERA' ? '4-2-4' : phase}
                                </span>
                                <span className="text-4xl font-black mt-1 text-white opacity-90 relative z-20">
                                    {phase === 'ESPERA' ? '--' : timeLeft}
                                </span>
                                {isActive && (
                                    <span className="text-[10px] text-white/50 uppercase tracking-widest mt-2 z-20 font-bold">Ciclos: {cycleCount}</span>
                                )}
                            </div>
                        </div>

                        <div className="absolute bottom-6 z-30">
                            <button
                                onClick={unlocked ? toggleTraining : onRequestUnlock}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-lg ${isActive
                                    ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444]/20'
                                    : 'bg-[#00E5FF] text-black border border-[#00E5FF] hover:bg-[#00BCCC] shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                                    }`}
                            >
                                {isActive ? (
                                    <><Square size={14} fill="currentColor" /> Detener</>
                                ) : (
                                    <><Play size={14} fill="currentColor" /> Iniciar Entrenamiento</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sección de CTA y Prueba Social (Estrategia de Conversión) */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-white font-bold text-sm md:text-base">
                            ¿Sientes la diferencia?
                        </h4>
                        <p className="text-[#9CA3AF] text-xs md:text-sm mt-1 max-w-md">
                            Imagina lo que podemos lograr con un plan 100% personalizado.
                        </p>
                        {/* TODO: Reactivar cuando haya clientes reales
                        <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#141414] flex items-center justify-center">
                                        <div className="w-4 h-4 bg-gray-500 rounded-full opacity-50"></div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-[#A1A1AA] font-bold">
                                Súmate a los <span className="text-[#FFFFFF]">50 atletas</span> en formación que están liderando el futuro del fútbol en Chile.
                            </p>
                        </div>
                        */}
                    </div>

                    <a
                        href="#"
                        className="group relative inline-flex items-center justify-center px-6 py-3.5 font-black text-xs uppercase tracking-widest text-[#141414] bg-[#FFFFFF] rounded-lg overflow-hidden transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(57,255,20,0.15)] hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] shrink-0 w-full md:w-auto"
                    >
                        <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                        <span className="relative flex items-center gap-2">
                            AGENDAR MI DIAGNÓSTICO POR $12.990
                            <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
}
