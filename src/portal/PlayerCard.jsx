import { Brain, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlayerCard({ player, showAcademia, getAcademiaName }) {
    const navigate = useNavigate();
    const isStaff = player.tipo === 'staff';

    const goToDetail = () => {
        if (player.pin && !showAcademia) {
            const savedPin = sessionStorage.getItem(`pin_${player.id}`);
            if (savedPin !== player.pin) {
                const enteredPin = prompt('🔒 Perfil protegido. Introduce la contraseña para acceder:');
                if (enteredPin !== player.pin) {
                    if (enteredPin !== null) alert('Contraseña incorrecta.');
                    return;
                }
                sessionStorage.setItem(`pin_${player.id}`, enteredPin);
            }
        }
        navigate(`/portal/jugador/${player.id}`);
    };

    return (
        <div
            onClick={goToDetail}
            className={`bg-[#111827] border rounded-2xl overflow-hidden group transition-all duration-500 shadow-xl cursor-pointer ${
                isStaff
                    ? 'border-[#F59E0B]/10 hover:border-[#F59E0B]/30 hover:shadow-[#F59E0B]/5'
                    : 'border-white/5 hover:border-[#0070F3]/30 hover:shadow-[#0070F3]/5'
            }`}
        >
            {/* Image */}
            <div className="relative h-56 overflow-hidden bg-[#0A0F1E]">
                {player.photoURL ? (
                    <img
                        src={player.photoURL}
                        alt={player.nombre}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {isStaff ? (
                            <Shield size={64} className="text-[#F59E0B]/10" />
                        ) : (
                            <User size={64} className="text-white/10" />
                        )}
                    </div>
                )}
                {/* Badge */}
                <div className={`absolute top-3 right-3 backdrop-blur-sm text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full ${
                    isStaff
                        ? 'bg-[#F59E0B]/90 text-black'
                        : 'bg-[#0070F3]/90 text-white'
                }`}>
                    {isStaff ? (player.cargo || 'Staff') : (player.categoria || 'Sin categoría')}
                </div>
                {/* Academia Badge */}
                {showAcademia && player.academiaId && (
                    <div className="absolute top-3 left-3 bg-[#39FF14]/20 backdrop-blur-sm text-[#39FF14] text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-[#39FF14]/30">
                        {getAcademiaName ? getAcademiaName(player.academiaId) : player.academiaId}
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent"></div>
            </div>

            {/* Info */}
            <div className="p-5 -mt-4 relative z-10">
                <h3 className="text-lg font-black text-white mb-1 truncate">{player.nombre}</h3>
                <div className="flex items-center gap-2 text-[#6B7280] text-xs mb-4">
                    {isStaff ? (
                        <>
                            <Shield size={12} className="text-[#F59E0B]" />
                            <span className="tracking-wider uppercase font-bold">Equipo Técnico</span>
                        </>
                    ) : (
                        <>
                            <Brain size={12} className="text-[#0070F3]" />
                            <span className="tracking-wider uppercase font-bold">Perfil Psicodeportivo</span>
                        </>
                    )}
                </div>

                <button
                    onClick={goToDetail}
                    className={`w-full border font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all duration-300 ${
                        isStaff
                            ? 'bg-[#F59E0B]/10 hover:bg-[#F59E0B] border-[#F59E0B]/30 hover:border-[#F59E0B] text-[#F59E0B] hover:text-black'
                            : 'bg-[#0070F3]/10 hover:bg-[#0070F3] border-[#0070F3]/30 hover:border-[#0070F3] text-[#0070F3] hover:text-white'
                    }`}
                >
                    {isStaff ? 'Ver Documentos' : 'Ver Análisis de Élite'}
                </button>
            </div>
        </div>
    );
}
