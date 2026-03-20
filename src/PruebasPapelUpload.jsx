import { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, Calculator, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getUserConfig } from './academyConfig';

// ─── Interpretación Landolt (S = bits/seg) ────────────────────────────────────
function interpretarLandolt(S) {
    if (S >= 1.24) return { label: 'Perfecto / Muy bien', color: '#39FF14' };
    if (S >= 1.02) return { label: 'Bien',                color: '#22C55E' };
    if (S >= 0.84) return { label: 'Regular',             color: '#EAB308' };
    return              { label: 'No satisfactorio',   color: '#EF4444' };
}

function interpretarIA(ia) {
    if (ia >= 90) return { label: 'Excelente',  color: '#39FF14' };
    if (ia >= 80) return { label: 'Muy bien',   color: '#22C55E' };
    if (ia >= 70) return { label: 'Bien',       color: '#38BDF8' };
    if (ia >= 60) return { label: 'Regular',    color: '#EAB308' };
    return             { label: 'Deficiente',  color: '#EF4444' };
}

// ─── Interpretación Tapping ───────────────────────────────────────────────────
// Baremos aproximados para fútbol (golpes en 10 seg)
function interpretarTapping(golpes) {
    if (golpes >= 55) return { label: 'Muy alto',  color: '#39FF14' };
    if (golpes >= 48) return { label: 'Alto',      color: '#22C55E' };
    if (golpes >= 40) return { label: 'Normal',    color: '#38BDF8' };
    if (golpes >= 32) return { label: 'Bajo',      color: '#EAB308' };
    return                  { label: 'Muy bajo',  color: '#EF4444' };
}

// ─── Minuto vacío para Landolt ────────────────────────────────────────────────
const minutoVacio = () => ({ N: '', n: '' });

export default function PruebasPapelUpload() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const userConfig = getUserConfig(currentUser?.email);
    const isAdmin = userConfig?.role === 'admin';

    const [listaJugadores, setListaJugadores] = useState([]);
    const [jugadorId, setJugadorId] = useState(searchParams.get('jugadorId') || '');
    const [jugadorManual, setJugadorManual] = useState({ nombre: '' });
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [contexto, setContexto] = useState({ torneo: '', rival: '' });

    const [testActivo, setTestActivo] = useState('tapping'); // 'tapping' | 'landolt'
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // ── Estado Tapping ────────────────────────────────────────────────────────
    const [tapping, setTapping] = useState({
        c1: '', c2: '', c3: '', c4: '',
        sexo: 'Masculino',
        observacion: '',
    });

    // ── Estado Landolt ────────────────────────────────────────────────────────
    // Hasta 5 minutos, N = anillos contados, n = errores
    const [landolt, setLandolt] = useState({
        minutos: [minutoVacio(), minutoVacio(), minutoVacio(), minutoVacio(), minutoVacio()],
        tipoAnillo: '6', // figura evaluada (del 1 al 8)
        observacion: '',
    });

    // ── Calculos Landolt en tiempo real ───────────────────────────────────────
    const calcLandolt = () => {
        const T = 60; // cada intervalo es 1 minuto = 60 seg
        const resultados = landolt.minutos.map((m, i) => {
            const N = parseFloat(m.N) || 0;
            const n = parseFloat(m.n) || 0;
            if (N === 0) return null;
            const S = (0.5436 * N - 2.807 * n) / T;
            return { minuto: i + 1, N, n, S: parseFloat(S.toFixed(4)), interp: interpretarLandolt(S) };
        }).filter(Boolean);

        if (resultados.length === 0) return null;

        const Ntotal = resultados.reduce((s, r) => s + r.N, 0);
        const ntotal = resultados.reduce((s, r) => s + r.n, 0);
        const Ttotal = resultados.length * 60;
        const Stotal = (0.5436 * Ntotal - 2.807 * ntotal) / Ttotal;

        // Índice de atención (IA) — requiere CA y CT
        // CA = anillos tachados correctamente = N - n (aproximación)
        const CA = resultados.reduce((s, r) => s + (r.N - r.n), 0);
        // CT = total de anillos del tipo evaluado hasta la última marca
        // Sin la tabla de CT por tipo de anillo usamos CA como aproximación del IA
        // Si el psicólogo ingresa CT manualmente, se calcula exacto

        return {
            porMinuto: resultados,
            Stotal: parseFloat(Stotal.toFixed(4)),
            interpTotal: interpretarLandolt(Stotal),
            CA,
            Ntotal,
            ntotal,
        };
    };

    const resLandolt = calcLandolt();

    // ── Detectar curva Landolt ────────────────────────────────────────────────
    const curvaLandolt = (resultados) => {
        if (!resultados || resultados.length < 2) return null;
        const vals = resultados.map(r => r.S);
        const diff = vals[vals.length - 1] - vals[0];
        if (diff >= 0.1)  return { label: 'Ascenso progresivo', color: '#39FF14' };
        if (diff <= -0.1) return { label: 'Caída bajo fatiga',  color: '#EF4444' };
        return                  { label: 'Estable',             color: '#38BDF8' };
    };

    // ── Cargar jugadores ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!isAdmin || !currentUser) return;
        const fetch = async () => {
            const snapshot = await getDocs(query(collection(db, 'jugadores')));
            let list = snapshot.docs.map(d => ({ id: d.id, nombre: d.data().nombre || '', tipo: d.data().tipo }));
            list = list.filter(p => !p.tipo || p.tipo === 'jugador');
            list.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setListaJugadores(list);
        };
        fetch().catch(console.error);
    }, [isAdmin, currentUser]);

    // ── Guardar ───────────────────────────────────────────────────────────────
    const guardar = async () => {
        if (!jugadorId || (jugadorId === 'manual' && !jugadorManual.nombre)) {
            alert('Selecciona o ingresa un jugador.');
            return;
        }

        setIsSaving(true);
        try {
            let nombreFinal = jugadorId === 'manual'
                ? jugadorManual.nombre
                : listaJugadores.find(p => p.id === jugadorId)?.nombre || 'Desconocido';

            const baseDoc = {
                jugadorId,
                nombreJugador: nombreFinal,
                evaluador: currentUser?.email,
                fecha,
                contexto,
                timestamp: serverTimestamp(),
            };

            if (testActivo === 'tapping') {
                const c1 = parseFloat(tapping.c1) || 0;
                const c2 = parseFloat(tapping.c2) || 0;
                const c3 = parseFloat(tapping.c3) || null;
                const c4 = parseFloat(tapping.c4) || null;
                const umbral = tapping.sexo === 'Femenino' ? 35 : 40;

                const difExcit  = c2 - c1;
                const difMem    = c3 !== null ? Math.abs(c3 - c1) : null;
                const difInhib  = c4 !== null ? Math.abs(c4 - c1 / 2) : null;
                const excitOk   = difExcit > umbral;
                const memOk     = difMem !== null ? difMem <= 5 : null;
                const inhibOk   = difInhib !== null ? difInhib <= 3 : null;

                const nivelGeneral = [excitOk, memOk, inhibOk].filter(v => v === true).length;
                const labels = ['Bajo rendimiento neuromotor', 'Rendimiento parcial', 'Rendimiento adecuado', 'Óptimo'];

                await addDoc(collection(db, 'evaluaciones_psicometricas'), {
                    ...baseDoc,
                    instrumento: { id: 'tapping', nombre: 'Tapping Test — 4 cuadrantes', tipo: 'papel' },
                    dimension: 'COGNITIVO',
                    puntajes: { c1, c2, c3, c4, sexo: tapping.sexo },
                    nivel: labels[nivelGeneral],
                    interpretacion: [
                        `C1 (vel. normal): ${c1} | C2 (explosividad): ${c2} | C3 (memoria): ${c3 ?? '—'} | C4 (inhibición): ${c4 ?? '—'}.`,
                        `Potencial excitación SNC: C2−C1=${difExcit} (umbral >${umbral}) → ${excitOk ? 'Adecuado' : 'Bajo'}.`,
                        difMem !== null ? `Memoria motriz: |C3−C1|=${difMem} (umbral ≤5) → ${memOk ? 'Buena' : 'Alterada'}.` : '',
                        difInhib !== null ? `Inhibición: |C4−C1/2|=${difInhib?.toFixed(1)} (umbral ≤3) → ${inhibOk ? 'Buena' : 'Alterada'}.` : '',
                        tapping.observacion || '',
                    ].filter(Boolean).join(' '),
                    recomendacion: tapping.observacion || '',
                });

            } else {
                if (!resLandolt) { alert('Ingresa al menos los datos del minuto 1.'); setIsSaving(false); return; }
                const curva = curvaLandolt(resLandolt.porMinuto);

                const interpretacionMinutos = resLandolt.porMinuto
                    .map(r => `Min${r.minuto}: N=${r.N} n=${r.n} S=${r.S} (${r.interp.label})`)
                    .join(' | ');

                await addDoc(collection(db, 'evaluaciones_psicometricas'), {
                    ...baseDoc,
                    instrumento: { id: 'landolt', nombre: 'Anillos de Landolt', tipo: 'papel', tipoAnillo: landolt.tipoAnillo },
                    dimension: 'COGNITIVO',
                    puntajes: {
                        por_minuto: resLandolt.porMinuto.map(r => ({ minuto: r.minuto, N: r.N, n: r.n, S: r.S })),
                        S_total: resLandolt.Stotal,
                        N_total: resLandolt.Ntotal,
                        n_total: resLandolt.ntotal,
                        CA: resLandolt.CA,
                    },
                    nivel: resLandolt.interpTotal.label,
                    curva: curva?.label || 'Insuficiente data',
                    interpretacion: `${interpretacionMinutos} | S_total: ${resLandolt.Stotal} → ${resLandolt.interpTotal.label}. Curva: ${curva?.label || 'N/A'}.${landolt.observacion ? ' ' + landolt.observacion : ''}`,
                    recomendacion: landolt.observacion || '',
                });
            }

            setShowSuccess(true);
            setTimeout(() => { setShowSuccess(false); navigate('/portal/dashboard'); }, 2500);
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white selection:bg-purple-500/30">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate('/portal/dashboard')}
                        className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Volver
                    </button>
                    <div className="flex items-center gap-2">
                        <FileText className="text-[#38BDF8]" size={18} />
                        <span className="text-xs font-black text-white uppercase">
                            PSMILE <span className="text-[#38BDF8]">Pruebas en Papel</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-8 py-8 max-w-2xl pb-24">

                {/* Datos del jugador */}
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 mb-6 shadow-xl">
                    <p className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-6">Datos del jugador</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">Jugador</label>
                            <select value={jugadorId} onChange={e => setJugadorId(e.target.value)}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#38BDF8] text-sm mb-3">
                                <option value="">— Selección —</option>
                                <option value="manual">Ingreso manual (+)</option>
                                {listaJugadores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                            {jugadorId === 'manual' && (
                                <input type="text" value={jugadorManual.nombre}
                                    onChange={e => setJugadorManual({ nombre: e.target.value })}
                                    placeholder="Nombre completo..."
                                    className="w-full bg-[#38BDF8]/5 border border-[#38BDF8]/30 rounded-2xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#38BDF8] text-sm" />
                            )}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">Fecha</label>
                            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#38BDF8] [color-scheme:dark]" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">Torneo</label>
                            <input type="text" value={contexto.torneo} onChange={e => setContexto(p => ({ ...p, torneo: e.target.value }))}
                                placeholder="Ej: Apertura 2026..."
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#38BDF8]" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">Instancia</label>
                            <input type="text" value={contexto.rival} onChange={e => setContexto(p => ({ ...p, rival: e.target.value }))}
                                placeholder="Ej: Previo a partido vs..."
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#38BDF8]" />
                        </div>
                    </div>
                </div>

                {/* Selector de test */}
                <div className="flex gap-3 mb-6">
                    {[
                        { id: 'tapping', label: 'Tapping Test', color: '#39FF14' },
                        { id: 'landolt', label: 'Anillos de Landolt', color: '#38BDF8' },
                    ].map(t => (
                        <button key={t.id} onClick={() => setTestActivo(t.id)}
                            style={testActivo === t.id ? { borderColor: t.color + '60', backgroundColor: t.color + '15', color: t.color } : {}}
                            className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                testActivo === t.id ? 'border-current' : 'border-white/10 text-[#6B7280] hover:text-white hover:bg-white/5'
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── TAPPING ──────────────────────────────────────────────── */}
                {testActivo === 'tapping' && (
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-[#39FF14]" />
                            <p className="text-xs font-black uppercase tracking-widest text-[#39FF14]">Tapping Test — 4 cuadrantes</p>
                        </div>

                        {/* Sexo — necesario para interpretar C2-C1 */}
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">Sexo biológico</label>
                            <div className="flex gap-3">
                                {['Masculino', 'Femenino'].map(s => (
                                    <button key={s}
                                        onClick={() => setTapping(p => ({ ...p, sexo: s }))}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                            tapping.sexo === s
                                                ? 'bg-[#39FF14]/20 border-[#39FF14]/60 text-[#39FF14]'
                                                : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white'
                                        }`}>{s}</button>
                                ))}
                            </div>
                        </div>

                        {/* 4 cuadrantes */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: 'c1', label: 'C1 — Velocidad normal',      color: '#38BDF8', desc: 'Línea base del SNC'            },
                                { key: 'c2', label: 'C2 — Explosividad máxima',   color: '#39FF14', desc: 'Potencial de excitación'        },
                                { key: 'c3', label: 'C3 — Memoria de trabajo',    color: '#A855F7', desc: 'Repite sin ver el papel'        },
                                { key: 'c4', label: 'C4 — Sistema inhibitorio',   color: '#F97316', desc: 'Lo más lento posible'           },
                            ].map(({ key, label, color, desc }) => (
                                <div key={key} className="bg-[#0A0F1E] rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{label}</p>
                                    </div>
                                    <p className="text-[10px] text-[#4B5563] mb-3">{desc}</p>
                                    <input
                                        type="number" min="0" max="200"
                                        value={tapping[key] || ''}
                                        onChange={e => setTapping(p => ({ ...p, [key]: e.target.value }))}
                                        placeholder="Golpes"
                                        className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-3 text-2xl font-black text-white outline-none text-center"
                                        style={{ borderColor: tapping[key] ? color + '40' : undefined }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Interpretación automática */}
                        {(tapping.c1 && tapping.c2) && (() => {
                            const c1 = parseFloat(tapping.c1) || 0;
                            const c2 = parseFloat(tapping.c2) || 0;
                            const c3 = parseFloat(tapping.c3) || null;
                            const c4 = parseFloat(tapping.c4) || null;
                            const umbral = tapping.sexo === 'Femenino' ? 35 : 40;
                            const difExcit = c2 - c1;
                            const difMem   = c3 !== null ? Math.abs(c3 - c1) : null;
                            const difInhib = c4 !== null ? Math.abs(c4 - (c1 / 2)) : null;

                            const excitOk  = difExcit > umbral;
                            const memOk    = difMem !== null ? difMem <= 5 : null;
                            const inhibOk  = difInhib !== null ? difInhib <= 3 : null;

                            return (
                                <div className="bg-[#0A0F1E] rounded-2xl p-5 border border-[#39FF14]/20 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calculator size={14} className="text-[#39FF14]" />
                                        <p className="text-[10px] font-black tracking-widest text-[#39FF14] uppercase">Interpretación calculada</p>
                                    </div>

                                    {/* C2 - C1: Potencial de excitación */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-white">Potencial de excitación del SNC</p>
                                            <p className="text-[11px] text-[#4B5563]">C2 − C1 = {difExcit} pts (umbral: &gt;{umbral})</p>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase ${excitOk ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-red-500/20 text-red-400'}`}>
                                            {excitOk ? 'Adecuado' : 'Bajo'}
                                        </span>
                                    </div>

                                    {/* C3 vs C1: Memoria motriz */}
                                    {memOk !== null && (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-white">Memoria motriz de trabajo</p>
                                                <p className="text-[11px] text-[#4B5563]">|C3 − C1| = {difMem} pts (umbral: ≤5)</p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase ${memOk ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-red-500/20 text-red-400'}`}>
                                                {memOk ? 'Buena' : 'Alterada'}
                                            </span>
                                        </div>
                                    )}

                                    {/* C4 vs C1/2: Inhibición */}
                                    {inhibOk !== null && (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-white">Capacidad de inhibición</p>
                                                <p className="text-[11px] text-[#4B5563]">|C4 − C1/2| = {difInhib?.toFixed(1)} pts (umbral: ≤3)</p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase ${inhibOk ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-red-500/20 text-red-400'}`}>
                                                {inhibOk ? 'Buena' : 'Alterada'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">
                                Observación clínica
                            </label>
                            <textarea
                                value={tapping.observacion || ''}
                                onChange={e => setTapping(p => ({ ...p, observacion: e.target.value }))}
                                placeholder="Dimensión cognitiva: El jugador muestra..."
                                rows={3}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 outline-none focus:border-[#39FF14] resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                )}

                {/* ── LANDOLT ──────────────────────────────────────────────── */}
                {testActivo === 'landolt' && (
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                            <p className="text-xs font-black uppercase tracking-widest text-[#38BDF8]">Anillos de Landolt</p>
                            <p className="text-xs text-[#4B5563]">— fórmula: S = (0.5436·N − 2.807·n) / T</p>
                        </div>

                        {/* Tipo de anillo */}
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">
                                Figura evaluada (apertura del anillo)
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {['1','2','3','4','5','6','7','8'].map(n => (
                                    <button key={n} onClick={() => setLandolt(p => ({ ...p, tipoAnillo: n }))}
                                        className={`w-10 h-10 rounded-xl text-sm font-black transition-all border ${
                                            landolt.tipoAnillo === n
                                                ? 'bg-[#38BDF8]/20 border-[#38BDF8]/60 text-[#38BDF8]'
                                                : 'bg-white/5 border-white/5 text-[#6B7280] hover:text-white'
                                        }`}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Minutos */}
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-4">
                                Datos por minuto (N = anillos contados · n = errores)
                            </label>
                            <div className="space-y-3">
                                {landolt.minutos.map((m, i) => {
                                    const N = parseFloat(m.N) || 0;
                                    const n = parseFloat(m.n) || 0;
                                    const S = N > 0 ? (0.5436 * N - 2.807 * n) / 60 : null;
                                    const interp = S !== null ? interpretarLandolt(S) : null;

                                    return (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="w-16 text-xs font-black text-[#4B5563] uppercase shrink-0">
                                                Min {i + 1}
                                            </span>
                                            <div className="flex gap-2 flex-1">
                                                <div className="flex-1">
                                                    <input
                                                        type="number" min="0" placeholder="N"
                                                        value={m.N}
                                                        onChange={e => setLandolt(p => {
                                                            const mins = [...p.minutos];
                                                            mins[i] = { ...mins[i], N: e.target.value };
                                                            return { ...p, minutos: mins };
                                                        })}
                                                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#38BDF8] text-center text-sm font-black"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="number" min="0" placeholder="n"
                                                        value={m.n}
                                                        onChange={e => setLandolt(p => {
                                                            const mins = [...p.minutos];
                                                            mins[i] = { ...mins[i], n: e.target.value };
                                                            return { ...p, minutos: mins };
                                                        })}
                                                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500/50 text-center text-sm font-black"
                                                    />
                                                </div>
                                            </div>
                                            {/* S calculado en tiempo real */}
                                            <div className="w-28 text-right shrink-0">
                                                {S !== null ? (
                                                    <>
                                                        <p className="text-sm font-black" style={{ color: interp.color }}>
                                                            S={S.toFixed(3)}
                                                        </p>
                                                        <p className="text-[10px]" style={{ color: interp.color }}>{interp.label}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-[11px] text-[#1F2937]">—</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Resumen total calculado */}
                        {resLandolt && (
                            <div className="bg-[#0A0F1E] rounded-2xl p-5 border border-[#38BDF8]/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calculator size={14} className="text-[#38BDF8]" />
                                    <p className="text-[10px] font-black tracking-widest text-[#38BDF8] uppercase">Resultado calculado</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                                    <div>
                                        <p className="text-2xl font-black text-white">{resLandolt.Ntotal}</p>
                                        <p className="text-[10px] text-[#4B5563] uppercase">N total</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-red-400">{resLandolt.ntotal}</p>
                                        <p className="text-[10px] text-[#4B5563] uppercase">n total</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black" style={{ color: resLandolt.interpTotal.color }}>
                                            {resLandolt.Stotal}
                                        </p>
                                        <p className="text-[10px] text-[#4B5563] uppercase">S total</p>
                                    </div>
                                    <div>
                                        <p className="text-base font-black" style={{ color: resLandolt.interpTotal.color }}>
                                            {resLandolt.interpTotal.label}
                                        </p>
                                        <p className="text-[10px] text-[#4B5563] uppercase">Evaluación</p>
                                    </div>
                                </div>

                                {/* Curva */}
                                {(() => {
                                    const curva = curvaLandolt(resLandolt.porMinuto);
                                    return curva && (
                                        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: curva.color }} />
                                            <p className="text-xs font-black" style={{ color: curva.color }}>
                                                Curva: {curva.label}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-[#6B7280] uppercase mb-3">
                                Observación clínica
                            </label>
                            <textarea
                                value={landolt.observacion}
                                onChange={e => setLandolt(p => ({ ...p, observacion: e.target.value }))}
                                placeholder="Dimensión cognitiva: El jugador muestra..."
                                rows={3}
                                className="w-full bg-[#0A0F1E] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 outline-none focus:border-[#38BDF8] resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                )}

                {/* Botón guardar */}
                <button
                    onClick={guardar}
                    disabled={isSaving}
                    className="w-full mt-6 py-5 bg-[#38BDF8] hover:bg-[#29ABE2] disabled:opacity-50 text-black rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#38BDF8]/20"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Guardar resultado
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
