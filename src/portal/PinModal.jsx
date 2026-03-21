import { useState } from 'react';
import { X, Lock, Loader2, ShieldAlert } from 'lucide-react';

export default function PinModal({ isOpen, onClose, onConfirm, player }) {
    const [enteredPin, setEnteredPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!enteredPin) return;

        setLoading(true);
        // Pequeño delay artificial para feedback premium
        await new Promise(r => setTimeout(r, 600));

        if (enteredPin === player.pin) {
            onConfirm(enteredPin);
            setEnteredPin('');
            setLoading(false);
        } else {
            setError('La contraseña es incorrecta. Inténtalo de nuevo.');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-sm relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header decorativo */}
                <div className="h-24 bg-gradient-to-br from-[#0070F3]/20 via-[#0A0F1E] to-transparent relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#0A0F1E] border border-white/10 flex items-center justify-center shadow-2xl">
                            <Lock className="text-[#0070F3]" size={32} />
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-4">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                            Perfil Protegido
                        </h3>
                        <p className="text-[#6B7280] text-xs leading-relaxed max-w-[200px] mx-auto">
                            Introduce la contraseña del perfil de <span className="text-white font-bold">{player.nombre}</span> para acceder.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                autoFocus
                                type="password"
                                value={enteredPin}
                                onChange={(e) => setEnteredPin(e.target.value)}
                                className={`w-full bg-[#0A0F1E] border rounded-2xl px-6 py-4 text-center text-2xl font-black tracking-[0.5em] text-white outline-none transition-all ${
                                    error ? 'border-red-500/50 focus:border-red-500 animate-shake' : 'border-white/10 focus:border-[#0070F3]'
                                }`}
                                placeholder="••••"
                            />
                            {error && (
                                <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center mt-3 animate-in fade-in duration-300 flex items-center justify-center gap-1.5">
                                    <ShieldAlert size={12} /> {error}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading || !enteredPin}
                                className="w-full py-4 bg-[#0070F3] hover:bg-[#0060D0] text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0070F3]/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Desbloquear Perfil'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-3 bg-transparent text-[#6B7280] hover:text-white transition-colors font-bold text-[10px] uppercase tracking-[0.2em]"
                            >
                                Cancelar y Volver
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
