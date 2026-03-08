import { Facebook, Instagram, Linkedin, Mail, Youtube } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#0A0A0A] pt-16 pb-8 border-t border-[#1C1C1E] rounded-t-[3rem] overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">

                    {/* Brand */}
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                            <div className="rounded-sm overflow-hidden w-7 h-7 flex items-center justify-center">
                                <img src="/images/Logo.png" alt="PSMILE Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-black tracking-tighter text-lg text-white">PSMILE PERFORMANCE</span>
                        </div>
                        <p className="text-[#9CA3AF] text-xs max-w-xs">
                            Desarrollando la mente de los futbolistas que transformarán Chile.
                        </p>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-full border border-white/5">
                        <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse shadow-[0_0_8px_#39FF14]"></span>
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase">High Performance System Online</span>
                    </div>

                    {/* Socials */}
                    <div className="flex gap-4 flex-wrap justify-center">
                        <a href="https://www.facebook.com/Apoyops.digital/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] transition-colors group">
                            <Facebook size={18} className="text-[#9CA3AF] group-hover:text-white" />
                        </a>
                        <a href="https://www.instagram.com/psmile_2025/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-[#E4405F] hover:border-[#E4405F] transition-colors group">
                            <Instagram size={18} className="text-[#9CA3AF] group-hover:text-white" />
                        </a>
                        <a href="https://www.youtube.com/@Psmile-Performance" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] transition-colors group">
                            <Youtube size={18} className="text-[#9CA3AF] group-hover:text-white" />
                        </a>
                        <a href="https://www.linkedin.com/in/luis-morales1704/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-colors group">
                            <Linkedin size={18} className="text-[#9CA3AF] group-hover:text-white" />
                        </a>
                        <a href="mailto:apoyopsicologicodigital@gmail.com" className="w-10 h-10 rounded-full bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-[#0070F3] hover:border-[#0070F3] transition-colors group">
                            <Mail size={18} className="text-[#9CA3AF] group-hover:text-white" />
                        </a>
                    </div>

                </div>

                <div className="text-center border-t border-white/5 pt-8">
                    <p className="text-[#9CA3AF] text-[10px] tracking-widest uppercase">
                        © {new Date().getFullYear()} PSMILE PERFORMANCE. TODOS LOS DERECHOS RESERVADOS. PRODUCIDO PARA EL ALTO RENDIMIENTO EN CHILE.
                    </p>
                </div>

            </div>
        </footer>
    );
}
