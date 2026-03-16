import { useState, useEffect } from 'react';
import { Menu, X, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-[#0C0C0C]/80 backdrop-blur-lg border-b border-white/5' : 'py-5'}`}>
            <div className="container mx-auto px-4 md:px-12 flex items-center justify-between">

                {/* Logo Area */}
                <div onClick={() => window.scrollTo(0, 0)} className={`flex items-center gap-2 transition-all duration-300 cursor-pointer ${scrolled ? 'scale-90' : 'scale-100'}`}>
                    <div className="rounded-sm overflow-hidden w-8 h-8 flex items-center justify-center">
                        <img src="/images/Logo.png" alt="PSMILE Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-black tracking-tighter text-xl text-white">PSMILE</span>
                </div>

                {/* Glass Capsule Nav (Desktop) */}
                <nav className="hidden lg:flex items-center bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 rounded-full px-8 py-2.5 gap-8 shadow-2xl">
                    <a href="#about" className="text-[10px] font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">Nosotros</a>
                    <a href="#metodologia" className="text-[10px] font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">Método</a>
                    <a href="#experto" className="text-[10px] font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">El Experto</a>
                    <a href="#testimonios" className="text-[10px] font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">Resultados</a>
                    <a href="#planes" className="text-[10px] font-bold text-[#F3F4F6] hover:text-[#0070F3] transition-colors uppercase tracking-widest">Planes</a>
                    <Link to="/biblioteca" className="text-[10px] font-black text-[#0C0C0C] bg-[#FFFFFF] hover:bg-[#32E612] px-4 py-1.5 rounded-full uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_12px_rgba(57,255,20,0.4)] animate-pulse">📚 Biblioteca</Link>
                    <Link to="/portal" className="text-[10px] font-bold text-[#9CA3AF] hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1.5 border-l border-white/10 pl-6">
                        <Lock size={12} />
                        Acceso Staff
                    </Link>
                </nav>

                {/* Right Area: Status + CTA (Desktop) + Mobile Toggle */}
                <div className="flex items-center gap-3 md:gap-6">
                    <div className="hidden md:flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#32E612] rounded-full animate-pulse shadow-[0_0_8px_rgba(50,230,18,0.5)]"></span>
                        <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Active</span>
                    </div>

                    <a href="#diagnostico" className="hidden sm:block bg-[#0070F3] hover:bg-[#0056B3] text-white px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#0070F3]/20">
                        Asegurar Cupo
                    </a>

                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[70px] bg-[#0C0C0C]/95 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top duration-300">
                    <nav className="flex flex-col items-center gap-8 py-12 px-6">
                        <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-[#F3F4F6] uppercase tracking-[0.2em]">Nosotros</a>
                        <a href="#metodologia" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-[#F3F4F6] uppercase tracking-[0.2em]">Método</a>
                        <a href="#experto" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-[#F3F4F6] uppercase tracking-[0.2em]">El Experto</a>
                        <a href="#testimonios" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-[#F3F4F6] uppercase tracking-[0.2em]">Resultados</a>
                        <a href="#planes" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-[#F3F4F6] uppercase tracking-[0.2em]">Planes</a>
                        <Link to="/biblioteca" onClick={() => setIsMenuOpen(false)} className="text-sm font-black text-[#0C0C0C] bg-[#FFFFFF] px-8 py-3 rounded-full uppercase tracking-widest">📚 Biblioteca</Link>
                        <Link to="/portal" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-2">
                            <Lock size={16} />
                            Acceso Staff
                        </Link>
                        <a href="#diagnostico" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-[#0070F3] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm mt-4">
                            Asegurar Cupo Ahora
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
}
