import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.philo-text', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 60%',
                },
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power2.out'
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-32 bg-negro text-white relative overflow-hidden">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 text-center">
                <span className="philo-text inline-block mb-6 data-mono text-xs tracking-[0.2em] text-rojo-intensidad bg-rojo-intensidad/10 px-3 py-1 rounded-sm uppercase">Filosofía Competitiva</span>

                <h2 className="philo-text text-4xl md:text-6xl font-bold tracking-tighter leading-tight mb-8">
                    No somos coaching motivacional. <br />
                    <span className="drama-italic text-gris-cemento">Construimos sistemas de resiliencia.</span>
                </h2>

                <p className="philo-text text-xl md:text-2xl text-gris-cemento/80 max-w-3xl mx-auto leading-relaxed font-light">
                    A través de la Terapia Breve Centrada en Soluciones (TBCS), enfocamos el talento en sus fortalezas comprobables, trabajando exclusivamente en el presente para pavimentar y accionar el futuro deseado en la cancha.
                </p>
            </div>
        </section>
    );
}
