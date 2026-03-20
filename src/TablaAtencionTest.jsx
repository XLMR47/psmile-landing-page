import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Timer, Check, Loader2, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';

// ─── 4 grillas (números 1-38 en distinto orden) ───────────────────────────────
// Extraídas de las imágenes originales — cada grilla es un array de 38 números
// dispuestos en orden de lectura (fila por fila, 6 columnas x 7 filas = 42 celdas,
// null = celda vacía)
const GRILLAS = [
    // Grilla A
    [  7, 14,  3, 24, 32,  9,
       2, 19, 22, 28, 12, 11,
      36, 27, 38,  5, 17, 34,
      26, 30,  1, 29, 21, 35,
      10, 37, 20, 15, 16,  8,
      23, 33, 25, 13, 31,  4,
       6, 18, null, null, null, null ],
    // Grilla B
    [  9, 15, 22, 25, 17, 28,
      30,  7,  1, 34, 21, 13,
      37, 33,  4, 35, 12, 32,
      19,  5,  6, 27, 18, 20,
      29, 23, 10, 16,  2, 31,
      36, 24, 11, 38,  8, 26,
      14,  3, null, null, null, null ],
    // Grilla C
    [ 30, 24, 17, 14, 22, 11,
       9, 32, 38,  5, 18, 26,
       2,  6, 35,  4, 27,  7,
      20, 34, 33, 12, 21, 19,
      16, 29, 23, 10, 37,  8,
       3, 15, 28,  1, 31, 13,
      25, 36, null, null, null, null ],
    // Grilla D
    [ 32, 25, 36, 15,  7, 30,
      37, 20, 17, 11, 27, 28,
       3, 12,  1, 34, 22,  5,
      13,  9, 38, 10, 18,  4,
      29,  2, 19, 24, 23, 16,
      31,  6, 14, 26,  8, 35,
      33, 21, null, null, null, null ],
];

const COLS = 6;
const DURACION_TOTAL = 180; // 3 minutos en segundos
const CORTES = [60, 120]; // marcadores al minuto 1 y 2

function etiquetarCurva(m1, m2, m3) {
    const vals = [m1, m2, m3].filter(v => v > 0);
    if (vals.length < 2) return { label: 'Insuficiente data', color: '#6B7280' };
    const trend12 = m2 - m1;
    const trend23 = m3 - m2;
    if (trend12 >= 0 && trend23 >= 0) return { label: 'Ascenso progresivo', color: '#39FF14', desc: 'La concentración se elevó a lo largo del test.' };
    if (trend12 <= 0 && trend23 <= 0) return { label: 'Caída bajo fatiga', color: '#EF4444', desc: 'La concentración decreció con el tiempo.' };
    if (trend12 > 0 && trend23 < 0)   return { label: 'Pico y caída', color: '#EAB308', desc: 'Concentración alta al inicio, decayó al final.' };
    if (trend12 < 0 && trend23 > 0)   return { label: 'Recuperación', color: '#38BDF8', desc: 'Bajó en el minuto 2 pero se recuperó al final.' };
    return { label: 'Estable', color: '#A855F7', desc: 'Concentración sostenida durante el test.' };
}

export default function TablaAtencionTest() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Estado general
    const [fase, setFase] = useState('intro'); // intro | test | resultado
    const [grillIdx] = useState(() => Math.floor(Math.random() * GRILLAS.length));
    const grilla = GRILLAS[grillIdx];

    // Estado del test
    const [siguiente, setSiguiente] = useState(1);
    const [encontrados, setEncontrados] = useState(new Set());
    const [errorFlash, setErrorFlash] = useState(null); // índice de celda con error
    const [tiempoRestante, setTiempoRestante] = useState(DURACION_TOTAL);
    const [corriendo, setCorriendo] = useState(false);
    const [marcadores, setMarcadores] = useState({ m1: 0, m2: 0, m3: 0 });
    const marcadoresRef = useRef({ m1: 0, m2: 0, m3: 0 });
    const siguienteRef = useRef(1);

    // Resultado
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Timer
    const intervalRef = useRef(null);

    const terminarTest = useCallback((finalSiguiente) => {
        clearInterval(intervalRef.current);
        setCorriendo(false);
        const m3 = (finalSiguiente || siguienteRef.current) - 1 - marcadoresRef.current.m2;
        const marcadoresFinal = { ...marcadoresRef.current, m3: Math.max(0, m3) };
        setMarcadores(marcadoresFinal);
        setFase('resultado');
    }, []);

    useEffect(() => {
        if (!corriendo) return;

        intervalRef.current = setInterval(() => {
            setTiempoRestante(prev => {
                const nuevo = prev - 1;

                // Corte al minuto 1
                if (nuevo === DURACION_TOTAL - 60) {
                    const m1 = siguienteRef.current - 1;
                    marcadoresRef.current = { ...marcadoresRef.current, m1 };
                    setMarcadores(p => ({ ...p, m1 }));
                }
                // Corte al minuto 2
                if (nuevo === DURACION_TOTAL - 120) {
                    const m2 = (siguienteRef.current - 1) - marcadoresRef.current.m1;
                    marcadoresRef.current = { ...marcadoresRef.current, m2 };
                    setMarcadores(p => ({ ...p, m2 }));
                }

                if (nuevo <= 0) {
                    terminarTest();
                    return 0;
                }
                return nuevo;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [corriendo, terminarTest]);

    const iniciar = () => {
        setFase('test');
        setCorriendo(true);
    };

    const handleCeldaClick = (numero, idxCelda) => {
        if (!corriendo || numero === null) return;

        if (numero === siguiente) {
            // Correcto
            const nuevosEncontrados = new Set(encontrados);
            nuevosEncontrados.add(numero);
            setEncontrados(nuevosEncontrados);
            const nuevoSig = siguiente + 1;
            setSiguiente(nuevoSig);
            siguienteRef.current = nuevoSig;

            // Si encontró todos los números — test completado antes de tiempo
            if (nuevoSig > 38) {
                terminarTest(nuevoSig);
            }
        } else {
            // Error — flash rojo
            setErrorFlash(idxCelda);
            setTimeout(() => setErrorFlash(null), 400);
        }
    };

    const guardarResultado = async (marcadoresFinal) => {
        setIsSaving(true);
        try {
            const { m1, m2, m3 } = marcadoresFinal;
            const total = m1 + m2 + m3;
            const curva = etiquetarCurva(m1, m2, m3);

            await addDoc(collection(db, 'evaluaciones_psicometricas'), {
                jugadorId: currentUser?.uid || 'desconocido',
                nombreJugador: currentUser?.displayName || currentUser?.email || '',
                evaluador: 'self',
                fecha: new Date().toISOString().split('T')[0],
                instrumento: {
                    id: 'tabla_atencion',
                    nombre: 'Tabla de Atención y Concentración',
                    tipo: 'digital',
                    grilla: grillIdx + 1,
                },
                dimension: 'COGNITIVO',
                puntajes: { minuto1: m1, minuto2: m2, minuto3: m3, total },
                nivel: curva.label,
                interpretacion: `Concentración en minuto 1: ${m1} números. Minuto 2: ${m2}. Minuto 3: ${m3}. Total: ${total}/38. Patrón: ${curva.label} — ${curva.desc || ''}`,
                recomendacion: '',
                timestamp: serverTimestamp(),
            });
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Formatear tiempo ─────────────────────────────────────────────────────
    const formatTiempo = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const tiempoUsado = DURACION_TOTAL - tiempoRestante;
    const minutoActual = tiempoUsado < 60 ? 1 : tiempoUsado < 120 ? 2 : 3;

    // ── INTRO ────────────────────────────────────────────────────────────────
    if (fase === 'intro') {
        return (
            <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#38BDF8]/30 to-[#0070F3]/10 border border-[#38BDF8]/30 flex items-center justify-center mx-auto mb-6">
                            <Brain className="text-[#38BDF8] w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Tabla de Atención</h1>
                        <p className="text-sm text-[#6B7280]">Test de concentración · 3 minutos</p>
                    </div>

                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-black flex items-center justify-center shrink-0">1</span>
                            <p className="text-sm text-[#9CA3AF]">Verás una grilla con números del <strong className="text-white">1 al 38</strong> mezclados.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-black flex items-center justify-center shrink-0">2</span>
                            <p className="text-sm text-[#9CA3AF]">Toca los números <strong className="text-white">en orden: 1, 2, 3...</strong> lo más rápido posible.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] text-xs font-black flex items-center justify-center shrink-0">3</span>
                            <p className="text-sm text-[#9CA3AF]">Tienes <strong className="text-white">3 minutos</strong>. Tu concentración se mide minuto a minuto.</p>
                        </div>
                    </div>

                    <div className="bg-[#38BDF8]/5 border border-[#38BDF8]/20 rounded-2xl p-4">
                        <p className="text-xs text-[#7DD3FC] text-center font-medium">
                            Grilla seleccionada aleatoriamente — tabla {grillIdx + 1} de 4
                        </p>
                    </div>

                    <button
                        onClick={iniciar}
                        className="w-full py-5 bg-[#38BDF8] hover:bg-[#29ABE2] text-black rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#38BDF8]/20"
                    >
                        <Timer size={18} /> Comenzar test
                    </button>
                </div>
            </div>
        );
    }

    // ── RESULTADO ────────────────────────────────────────────────────────────
    if (fase === 'resultado') {
        const { m1, m2, m3 } = marcadores;
        const total = m1 + m2 + m3;
        const curva = etiquetarCurva(m1, m2, m3);
        const maxVal = Math.max(m1, m2, m3, 1);

        return (
            <div className="min-h-screen bg-[#0A0F1E] text-white">
                <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                            <Brain className="text-[#38BDF8]" size={18} /> PSMILE <span className="text-[#38BDF8]">ATENCIÓN</span>
                        </span>
                    </div>
                </header>

                <main className="container mx-auto px-4 md:px-8 py-10 max-w-lg pb-24 space-y-6">

                    {/* Score total */}
                    <div className="text-center">
                        <div className="w-28 h-28 rounded-full border-4 flex items-center justify-center mx-auto mb-4"
                            style={{ borderColor: curva.color }}>
                            <div>
                                <p className="text-4xl font-black" style={{ color: curva.color }}>{total}</p>
                                <p className="text-[10px] text-[#4B5563] font-black uppercase">de 38</p>
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Resultado</h1>
                        <p className="text-lg font-black" style={{ color: curva.color }}>{curva.label}</p>
                        {curva.desc && <p className="text-sm text-[#6B7280] mt-1">{curva.desc}</p>}
                    </div>

                    {/* Curva de concentración */}
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6">
                        <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-6">Curva de concentración</p>
                        <div className="flex items-end gap-4 h-32">
                            {[
                                { label: 'Min 1', val: m1, color: '#38BDF8' },
                                { label: 'Min 2', val: m2, color: '#A855F7' },
                                { label: 'Min 3', val: m3, color: '#39FF14' },
                            ].map(({ label, val, color }) => (
                                <div key={label} className="flex-1 flex flex-col items-center gap-2">
                                    <p className="text-xl font-black" style={{ color }}>{val}</p>
                                    <div className="w-full rounded-xl overflow-hidden bg-white/5" style={{ height: '80px' }}>
                                        <div className="w-full rounded-xl transition-all duration-700"
                                            style={{
                                                height: `${(val / maxVal) * 100}%`,
                                                backgroundColor: color,
                                                marginTop: `${100 - (val / maxVal) * 100}%`,
                                            }} />
                                    </div>
                                    <p className="text-[11px] text-[#4B5563] font-black uppercase">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Interpretación */}
                        <div className="mt-6 pt-5 border-t border-white/5">
                            {m1 === m2 && m2 === m3 && (
                                <p className="text-xs text-[#6B7280]">Rendimiento uniforme durante los 3 minutos.</p>
                            )}
                            {m2 > m1 && m3 > m2 && (
                                <p className="text-xs text-[#6B7280]">Velocidad en aumento — el jugador se fue calentando con el test.</p>
                            )}
                            {m2 < m1 && m3 < m2 && (
                                <p className="text-xs text-[#6B7280]">Velocidad decreciente — posible fatiga atencional progresiva.</p>
                            )}
                            {m2 > m1 && m3 < m2 && (
                                <p className="text-xs text-[#6B7280]">Pico de rendimiento en el minuto 2, caída al final.</p>
                            )}
                        </div>
                    </div>

                    {/* Botones */}
                    <button
                        onClick={() => guardarResultado(marcadores)}
                        disabled={isSaving}
                        className="w-full py-4 bg-[#38BDF8] hover:bg-[#29ABE2] disabled:opacity-50 text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#38BDF8]/20"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Guardar y volver
                    </button>

                    <button
                        onClick={() => navigate('/portal/dashboard')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-[#6B7280] rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                    >
                        Volver sin guardar
                    </button>
                </main>

                {showSuccess && (
                    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-[#38BDF8] text-black px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex items-center gap-4">
                            <Check size={20} strokeWidth={4} /> ¡Guardado en PSMILE Cloud!
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── TEST ─────────────────────────────────────────────────────────────────
    const tiempoPct = (tiempoRestante / DURACION_TOTAL) * 100;
    const timerColor = tiempoRestante > 60 ? '#38BDF8' : tiempoRestante > 30 ? '#EAB308' : '#EF4444';

    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white flex flex-col">

            {/* Header con timer */}
            <header className="sticky top-0 z-40 bg-[#0A0F1E]/95 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

                    {/* Marcadores por minuto */}
                    <div className="flex gap-3">
                        {[
                            { label: 'M1', val: marcadores.m1, active: minutoActual === 1, color: '#38BDF8' },
                            { label: 'M2', val: marcadores.m2, active: minutoActual === 2, color: '#A855F7' },
                            { label: 'M3', val: marcadores.m3, active: minutoActual === 3, color: '#39FF14' },
                        ].map(({ label, val, active, color }) => (
                            <div key={label} className={`px-3 py-1.5 rounded-xl border transition-all ${active ? 'border-current bg-current/10' : 'border-white/5 opacity-40'}`}
                                style={{ borderColor: active ? color : undefined, backgroundColor: active ? color + '15' : undefined }}>
                                <p className="text-[9px] font-black uppercase" style={{ color: active ? color : '#6B7280' }}>{label}</p>
                                <p className="text-base font-black" style={{ color: active ? color : '#6B7280' }}>
                                    {active ? siguiente - 1 - (label === 'M2' ? marcadores.m1 : label === 'M3' ? marcadores.m1 + marcadores.m2 : 0) : val}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Timer central */}
                    <div className="text-center">
                        <p className="text-2xl font-black tabular-nums" style={{ color: timerColor }}>
                            {formatTiempo(tiempoRestante)}
                        </p>
                        <p className="text-[9px] text-[#4B5563] font-black uppercase">Tiempo restante</p>
                    </div>

                    {/* Total encontrados */}
                    <div className="text-right">
                        <p className="text-[9px] text-[#6B7280] font-black uppercase">Llegó al</p>
                        <p className="text-3xl font-black text-white">{siguiente > 1 ? siguiente - 1 : '—'}</p>
                    </div>
                </div>

                {/* Barra de tiempo */}
                <div className="h-1 bg-white/5">
                    <div className="h-full transition-all duration-1000" style={{ width: `${tiempoPct}%`, backgroundColor: timerColor }} />
                </div>
            </header>

            {/* Grilla */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div
                    className="grid gap-2 w-full max-w-sm mx-auto"
                    style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
                >
                    {grilla.map((numero, idx) => {
                        if (numero === null) return <div key={idx} />;

                        const encontrado = encontrados.has(numero);
                        const esError = errorFlash === idx;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleCeldaClick(numero, idx)}
                                disabled={encontrado}
                                className={`
                                    aspect-square rounded-2xl font-black text-base
                                    flex items-center justify-center
                                    transition-all duration-150 select-none
                                    ${encontrado
                                        ? 'bg-[#39FF14]/20 border border-[#39FF14]/40 text-[#39FF14] scale-95 cursor-default'
                                        : esError
                                        ? 'bg-red-500/30 border border-red-500/60 text-red-300 scale-95'
                                        : 'bg-[#111827] border border-white/5 text-white hover:bg-white/5 active:scale-95'
                                    }
                                `}
                                style={esError ? { animation: 'shake 0.3s ease' } : {}}
                            >
                                {encontrado ? '✓' : numero}
                            </button>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
            `}</style>
        </div>
    );
}
