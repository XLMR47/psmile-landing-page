import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Brain } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/portal/dashboard');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Credenciales incorrectas. Verifica tu email y contraseña.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Demasiados intentos fallidos. Intenta de nuevo en unos minutos.');
            } else {
                setError('Error al iniciar sesión. Verifica tu conexión.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center relative overflow-hidden px-4">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0070F3]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="mx-auto w-16 h-16 bg-[#0070F3]/10 border border-[#0070F3]/30 rounded-2xl flex items-center justify-center mb-6">
                        <Brain className="text-[#0070F3]" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        Portal de Inteligencia <span className="text-[#0070F3]">Mental</span>
                    </h1>
                    <p className="text-[#6B7280] text-sm">
                        Acceso exclusivo para directores y staff técnico
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                                Correo de acceso
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors"
                                placeholder="director@academia.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-[#6B7280] tracking-[0.2em] uppercase mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 outline-none focus:border-[#0070F3] transition-colors pr-12"
                                    placeholder="••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0070F3] hover:bg-[#0060D0] text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-[#0070F3]/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:hover:scale-100"
                        >
                            {loading ? (
                                'Verificando acceso...'
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    Acceder al Portal
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] text-[#6B7280] tracking-widest uppercase flex items-center justify-center gap-2">
                            <ShieldCheck size={12} className="text-[#39FF14]" />
                            Conexión cifrada de extremo a extremo
                        </p>
                    </div>
                </div>

                {/* Back to Landing */}
                <div className="text-center mt-8">
                    <a href="/" className="text-xs text-[#6B7280] hover:text-white transition-colors tracking-wider uppercase">
                        ← Volver a psmilechile.com
                    </a>
                </div>
            </div>
        </div>
    );
}
