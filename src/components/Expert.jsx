import { Award, BookOpen, Brain, ShieldCheck, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Expert() {
    const sectionRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.expert-img-block', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                },
                x: -50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });

            gsap.from('.expert-text-block', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                },
                x: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });

            gsap.from('.expert-cert', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 50%',
                },
                y: 10,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="experto" className="py-24 bg-[#0C0C0C] border-t border-white/5 relative overflow-hidden">
            {/* Elementos de fondo */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0070F3]/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Bloque Visual (Izquierda) */}
                    <div className="expert-img-block relative">
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/5] bg-[#1A1A1A] group">
                            {/* 
                              NOTA PARA EL USUARIO: 
                              Aquí deberías colocar la foto de la oficina (con el Profe Cruz) 
                              recomendada por tu asesor para transmitir trabajo real de campo.
                              Sustituye 'luis-oficina.jpg' por el nombre real de tu archivo en la carpeta public/images/
                            */}
                            <img
                                src="/images/luis-oficina.jpg"
                                alt="Luis Enrique Morales en sesión presencial"
                                className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent opacity-80"></div>
                        </div>

                        {/* Etiqueta Flotante */}
                        <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-[#1C1C1E] border border-[#0070F3]/30 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0070F3]/20 rounded-full flex items-center justify-center border border-[#0070F3]/30">
                                    <Award size={20} className="text-[#0070F3]" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Lic. Luis Enrique Morales</p>
                                    <p className="text-[#00D1FF] text-[10px] font-black uppercase tracking-widest">Psicólogo Deportivo</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloque de Texto y Credenciales (Derecha) */}
                    <div className="expert-text-block">
                        <span className="text-[10px] font-bold text-[#0070F3] tracking-[0.3em] uppercase block mb-4">Tu Mentor en el Camino al Éxito</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                            Ciencia y Pasión al servicio de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0070F3] to-[#00D1FF]">rendimiento</span>.
                        </h2>

                        <p className="text-[#9CA3AF] text-lg leading-relaxed mb-10">
                            "Soy <span className="text-white font-bold">Luis Enrique Morales</span>, Licenciado en Psicología especializado en el ámbito deportivo a través de Neurociencias y Psicología del Fútbol. Mi sistema integra las neurociencias aplicadas y el entrenamiento de élite para que cada joven talento domine la presión, optimice su rendimiento y encuentre su mejor versión competitiva."
                        </p>

                        {/* Galería de Credenciales */}
                        <div className="space-y-4 mb-10">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-[#00D1FF]" />
                                Acreditaciones Oficiales
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedImage('/images/Titulo%20profesional.jpeg')}
                                    className="sm:col-span-2 text-left bg-[#141414] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:border-[#0070F3]/50 transition-all cursor-pointer group"
                                >
                                    <BookOpen size={24} className="text-[#0070F3] shrink-0 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-white text-sm font-bold mb-1">Licenciado en Psicología</p>
                                        <p className="text-[#9CA3AF] text-xs">Título Profesional Universitario</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedImage('/images/Neurociencias.jpeg')}
                                    className="expert-cert text-left bg-[#141414] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:border-[#0070F3]/50 transition-all cursor-pointer group"
                                >
                                    <Brain size={24} className="text-[#0070F3] shrink-0 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-white text-sm font-bold mb-1">Neurociencias Aplicadas al Fútbol</p>
                                        <p className="text-[#9CA3AF] text-xs">Certificación - La Pizarra del DT</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedImage('/images/Psicologia%20deportiva.jpeg')}
                                    className="expert-cert text-left bg-[#141414] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:border-[#00D1FF]/50 transition-all cursor-pointer group"
                                >
                                    <Award size={24} className="text-[#00D1FF] shrink-0 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-white text-sm font-bold mb-1">Psicología Deportiva</p>
                                        <p className="text-[#9CA3AF] text-xs">Certificación en Alto Rendimiento</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedImage('/images/Mentalidad%20ganadora.jpeg')}
                                    className="expert-cert text-left bg-[#141414] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:border-[#00D1FF]/50 transition-all cursor-pointer group"
                                >
                                    <ShieldCheck size={24} className="text-[#00D1FF] shrink-0 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-white text-sm font-bold mb-1">Mentalidad Ganadora</p>
                                        <p className="text-[#9CA3AF] text-xs">Certificación en Alto Rendimiento</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedImage('/images/Tede.jpg')}
                                    className="expert-cert text-left bg-[#141414] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:border-[#0070F3]/50 transition-all cursor-pointer group"
                                >
                                    <Award size={24} className="text-[#0070F3] shrink-0 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-white text-sm font-bold mb-1">Psicología del Deporte</p>
                                        <p className="text-[#9CA3AF] text-xs">Curso de Especialización</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Botón */}
                        <a href="#planes" className="inline-flex bg-[#0070F3] hover:bg-[#0056B3] text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all transform hover:scale-105 shadow-lg shadow-[#0070F3]/20">
                            Quiero trabajar con Luis
                        </a>
                    </div>

                </div>
            </div>

            {/* Modal para visualizar los certificados grandes */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-zoom-out transition-all animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Certificado Ampliado"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()} // Para no cerrar si haces clic en la imagen
                    />
                </div>
            )}
        </section>
    );
}
