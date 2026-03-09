import { Brain, User } from 'lucide-react';

export default function PlayerCard({ player, onViewReport }) {
    return (
        <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden group hover:border-[#0070F3]/30 transition-all duration-500 shadow-xl hover:shadow-[#0070F3]/5">
            {/* Player Image */}
            <div className="relative h-56 overflow-hidden bg-[#0A0F1E]">
                {player.photoURL ? (
                    <img
                        src={player.photoURL}
                        alt={player.nombre}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User size={64} className="text-white/10" />
                    </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-3 right-3 bg-[#0070F3]/90 backdrop-blur-sm text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
                    {player.categoria || 'Sin categoría'}
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent"></div>
            </div>

            {/* Player Info */}
            <div className="p-5 -mt-4 relative z-10">
                <h3 className="text-lg font-black text-white mb-1 truncate">{player.nombre}</h3>
                <div className="flex items-center gap-2 text-[#6B7280] text-xs mb-4">
                    <Brain size={12} className="text-[#0070F3]" />
                    <span className="tracking-wider uppercase font-bold">Perfil Psicodeportivo</span>
                </div>

                <button
                    onClick={() => onViewReport(player)}
                    disabled={!player.reporteURL}
                    className="w-full bg-[#0070F3]/10 hover:bg-[#0070F3] border border-[#0070F3]/30 hover:border-[#0070F3] text-[#0070F3] hover:text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#0070F3]/10 disabled:hover:text-[#0070F3]"
                >
                    {player.reporteURL ? 'Ver Análisis de Élite' : 'Sin reporte cargado'}
                </button>
            </div>
        </div>
    );
}
