import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import {
    Brain, Zap, Target, FlaskConical, Timer,
    CheckCircle, Clock, ArrowRight, ArrowLeft, FileText
} from 'lucide-react';

// ─── Catálogo de tests disponibles ───────────────────────────────────────────
const TESTS = [
    {
        id: 'epi',
        nombre: 'EPI — Inventario de Personalidad',
        descripcion: 'Neuroticismo, extroversión y temperamento deportivo.',
        ruta: '/portal/epi',
        icono: Brain,
        color: '#A855F7',
        tiempo: '8-10 min',
        items: '57 ítems',
        dimension: 'Emocional',
    },
    {
        id: 'motivacion',
        nombre: 'Cualidades Motivacionales',
        descripcion: '13 dimensiones motivacionales del deportista.',
        ruta: '/portal/motivacion',
        icono: Zap,
        color: '#39FF14',
        tiempo: '10-12 min',
        items: '52 ítems',
        dimension: 'Emocional',
    },
    {
        id: 'nivel_preparacion',
        nombre: 'Nivel Subjetivo de Preparación',
        descripcion: 'Autopercepción de preparación física, técnica, táctica, volitiva y psicológica.',
        ruta: '/portal/nivel-preparacion',
        icono: Target,
        color: '#0070F3',
        tiempo: '5-7 min',
        items: '25 ítems',
        dimension: 'Cognitivo',
    },
    {
        id: 'csai2',
        nombre: 'CSAI-2 — Ansiedad Competitiva',
        descripcion: 'Ansiedad cognitiva, somática y autoconfianza precompetitiva.',
        ruta: '/portal/csai2',
        icono: FlaskConical,
        color: '#F97316',
        tiempo: '6-8 min',
        items: '27 ítems',
        dimension: 'Emocional',
        nota: 'Aplicar 30 min antes del partido',
    },
    {
        id: 'tabla_atencion',
        nombre: 'Tabla de Atención y Concentración',
        descripcion: 'Velocidad de búsqueda visual y curva de concentración en 3 minutos.',
        ruta: '/portal/tabla-atencion',
        icono: Timer,
        color: '#38BDF8',
        tiempo: '3 min exactos',
        items: '38 números',
        dimension: 'Cognitivo',
        nota: 'Grilla aleatoria en cada sesión',
    },
];

function etiquetaDimension(dim) {
    const mapa = {
        'Emocional':  { color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
        'Cognitivo':  { color: '#38BDF8', bg: 'rgba(56,189,248,0.1)' },
    };
    return mapa[dim] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
}

export default function TestsHub() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [completados, setCompletados] = useState({}); // { instrumento_id: { fecha, nivel } }
    const [loading, setLoading] = useState(true);

    // Cargar resultados previos del jugador
    useEffect(() => {
        if (!currentUser) return;
        const cargar = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'evaluaciones_psicometricas'),
                    where('jugadorId', '==', currentUser.uid),
                    orderBy('timestamp', 'desc')
                );
                const snap = await getDocs(q);
                const mapa = {};
                snap.docs.forEach(d => {
                    const data = d.data();
                    const instId = data.instrumento?.id;
                    if (instId && !mapa[instId]) {
                        // Solo guardamos el más reciente (ya está ordenado desc)
                        mapa[instId] = {
                            fecha: data.fecha || '',
                            nivel: data.nivel || '',
                            timestamp: data.timestamp,
                        };
                    }
                });
                setCompletados(mapa);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [currentUser]);

    const completadosCount = Object.keys(completados).length;
    const totalTests = TESTS.length;

    return (
        <div className="min-h-screen bg-[#0A0F1E] text-white">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/portal/dashboard')}
                        className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Volver
                    </button>
                    <div className="flex items-center gap-2">
                        <Brain className="text-[#0070F3]" size={18} />
                        <span className="text-xs font-black text-white uppercase">
                            PSMILE <span className="text-[#0070F3]">Tests</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-8 py-10 max-w-3xl">

                {/* Título + progreso */}
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 mb-8 shadow-xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
                                Batería psicométrica
                            </h1>
                            <p className="text-[#6B7280] text-sm">
                                Completa los tests para construir tu perfil psicodeportivo.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-black text-[#0070F3]">
                                {completadosCount}<span className="text-xl text-[#4B5563]">/{totalTests}</span>
                            </p>
                            <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-black">Completados</p>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#0070F3] rounded-full transition-all duration-700"
                            style={{ width: `${(completadosCount / totalTests) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Lista de tests */}
                <div className="space-y-4">
                    {TESTS.map(test => {
                        const completado = completados[test.id];
                        const Icono = test.icono;
                        const dim = etiquetaDimension(test.dimension);

                        return (
                            <div
                                key={test.id}
                                className={`bg-[#111827] border rounded-3xl p-6 transition-all hover:border-opacity-60 ${
                                    completado ? 'border-white/5' : 'border-white/5 hover:border-white/15'
                                }`}
                            >
                                <div className="flex items-start gap-5">

                                    {/* Ícono */}
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: test.color + '20', border: `1px solid ${test.color}40` }}
                                    >
                                        <Icono size={22} style={{ color: test.color }} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div>
                                                <h3 className="text-sm font-black text-white mb-1">{test.nombre}</h3>
                                                <p className="text-xs text-[#6B7280] leading-relaxed">{test.descripcion}</p>
                                            </div>
                                            {completado && (
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <CheckCircle size={14} className="text-[#39FF14]" />
                                                    <span className="text-[11px] font-black text-[#39FF14] uppercase">Completado</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Meta info */}
                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                            <span className="flex items-center gap-1 text-[11px] text-[#4B5563]">
                                                <Clock size={11} /> {test.tiempo}
                                            </span>
                                            <span className="text-[11px] text-[#4B5563]">{test.items}</span>
                                            <span
                                                className="text-[11px] font-black uppercase px-2 py-0.5 rounded-lg"
                                                style={{ color: dim.color, backgroundColor: dim.bg }}
                                            >
                                                {test.dimension}
                                            </span>
                                            {test.nota && (
                                                <span className="text-[11px] text-[#F97316] font-medium">⚡ {test.nota}</span>
                                            )}
                                        </div>

                                        {/* Resultado previo */}
                                        {completado && (
                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="bg-white/5 rounded-xl px-3 py-1.5 flex items-center gap-2">
                                                    <FileText size={11} className="text-[#4B5563]" />
                                                    <span className="text-[11px] text-[#9CA3AF]">
                                                        Último: <span className="text-white font-bold">{completado.nivel}</span>
                                                        {completado.fecha && (
                                                            <span className="text-[#4B5563] ml-2">· {completado.fecha}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Botón */}
                                        <div className="mt-4">
                                            <button
                                                onClick={() => navigate(test.ruta)}
                                                style={{
                                                    backgroundColor: completado ? 'rgba(255,255,255,0.05)' : test.color + '20',
                                                    borderColor: completado ? 'rgba(255,255,255,0.1)' : test.color + '60',
                                                    color: completado ? '#6B7280' : test.color,
                                                }}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border hover:opacity-80"
                                            >
                                                {completado ? 'Repetir test' : 'Comenzar test'}
                                                <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tests de papel — acceso para el psicólogo */}
                <div className="mt-8 bg-[#111827] border border-dashed border-white/10 rounded-3xl p-6">
                    <p className="text-[10px] font-black tracking-widest text-[#4B5563] uppercase mb-3">
                        Pruebas en papel (acceso psicólogo)
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate('/portal/pruebas-papel')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-[#6B7280] hover:text-white hover:border-white/20 transition-all"
                        >
                            <FileText size={13} /> Tapping + Landolt
                        </button>
                        <button
                            onClick={() => navigate('/portal/psicometria')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-[#6B7280] hover:text-white hover:border-white/20 transition-all"
                        >
                            <FileText size={13} /> Otros instrumentos
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
