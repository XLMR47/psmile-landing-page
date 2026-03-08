import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
            <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">

                {/* Logo Area */}
                <div className={`flex items-center gap-2 transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`}>
                    <div className="rounded-sm overflow-hidden w-8 h-8 flex items-center justify-center">
                        <img src="/images/Logo.png" alt="PSMILE Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-black tracking-tighter text-xl text-white">PSMILE</span>
                </div>

                {/* Glass Capsule Nav */}
                <nav className="hidden lg:flex items-center bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 rounded-full px-8 py-2.5 gap-8 shadow-2xl">
                    <a href="#about" className="text-xs font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">Nosotros</a>
                    <a href="#metodologia" className="text-xs font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">Método</a>
                    <a href="#experto" className="text-xs font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">El Experto</a>
                    <a href="#testimonios" className="text-xs font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">Resultados</a>
                    <a href="#planes" className="text-xs font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">Planes</a>
                    <a href="#recursos" className="text-xs font-black text-[#0C0C0C] bg-[#FFFFFF] hover:bg-[#32E612] px-4 py-1.5 rounded-full uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_12px_rgba(57,255,20,0.4)] animate-pulse">🎁 Recursos</a>
                </nav>

                {/* Right Area: Status + CTA */}
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#32E612] rounded-full animate-pulse shadow-[0_0_8px_rgba(50,230,18,0.5)]"></span>
                        <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Mental State: Active</span>
                    </div>

                    <a href="#diagnostico" className="bg-[#0070F3] hover:bg-[#0056B3] text-white px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#0070F3]/20">
                        Asegurar Cupo
                    </a>
                </div>

            </div>
        </header>
    );
}
