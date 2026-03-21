// ═══════════════════════════════════════════════════════════════════════════
// epsdBaremos.js — Sistema de Interpretación Determinístico ePsD
// ═══════════════════════════════════════════════════════════════════════════
//
// Basado en: "Dimensiones del ePsD" (documento oficial)
// Las interpretaciones son directamente del instrumento, no generadas por IA.
//
// PUNTOS DE CORTE ACTUALES (provisorios — se refinan con datos acumulados):
//   Bajo:  0 – 39
//   Medio: 40 – 69
//   Alto:  70 – 100
//
// A medida que se acumulan evaluaciones en Firestore, la función
// `getCortesDesdeFirestore()` puede reemplazar los cutpoints estáticos
// con percentiles reales calculados desde los datos del sistema.
// ═══════════════════════════════════════════════════════════════════════════

// ─── 0. IMPORTAR RECOMENDACIONES ─────────────────────────────────────────
import { getRecomendaciones } from './epsdRecomendaciones';

// ─── 1. BAREMOS POR SUBDIMENSIÓN ──────────────────────────────────────────
// Cada subdimensión tiene:
//   - conductas[]: las conductas evaluadas (del documento)
//   - niveles: interpretación Bajo / Medio / Alto
//   - recomendaciones: qué hacer según el nivel
//   - relevanciaPositiva: qué posiciones se benefician especialmente de un nivel alto

export const BAREMOS_EPSD = {

    // ── DOMINIO COGNITIVO ──────────────────────────────────────────────────

    'Percepción del entorno': {
        dominio: 'COGNITIVO',
        color: '#0070F3',
        conductas: [
            'Escanea el campo antes de recibir, buscando información.',
            'Anticipa jugadas y reacciones del rival.',
        ],
        niveles: {
            bajo: {
                rango: [0, 39],
                etiqueta: 'Bajo',
                color: '#EF4444',
                descripcion: 'Rara vez observa antes de recibir. Llega tarde a las jugadas por falta de lectura anticipatoria del entorno. Poca comprensión de las intenciones rivales.',
                implicancia: 'Alta exposición a pérdidas de balón por falta de información. Dificultad para anticipar presiones o desmarques del rival.',
                recomendacion: 'Ejercicios de escaneo previo a la recepción. Drill de "mirar antes de recibir" con feedback visual. Trabajo en campo reducido que exija procesamiento rápido de información.',
            },
            medio: {
                rango: [40, 69],
                etiqueta: 'Medio',
                color: '#EAB308',
                descripcion: 'Escanea de forma intermitente. A veces recibe orientado, otras no. Anticipa en algunas situaciones pero con inconsistencia.',
                implicancia: 'Rendimiento variable según el contexto. Mejora con situaciones de baja presión, pero se ve comprometido en zonas de alta intensidad.',
                recomendacion: 'Trabajo en decisión bajo presión temporal. Ejercicios de anticipación con variantes tácticas para desarrollar automatismos.',
            },
            alto: {
                rango: [70, 100],
                etiqueta: 'Alto',
                color: '#39FF14',
                descripcion: 'Escanea sistemáticamente con movimientos de cabeza antes de recibir. Anticipa con frecuencia, se posiciona antes que el rival. Comprensión táctica avanzada.',
                implicancia: 'Capacidad de tomar decisiones con anticipación. Reduce errores por sorpresa. Asset estratégico en zonas de mediocampo y conducción.',
                recomendacion: 'Potenciar este recurso en roles de liderazgo táctico. Asignar responsabilidades de organización posicional.',
            },
        },
        posicionesClaveAlto: ['MC', 'MCO', 'MCD', 'LI', 'LD'],
    },

    'Toma de decisiones': {
        dominio: 'COGNITIVO',
        color: '#0070F3',
        conductas: [
            'Toma decisiones acordes al contexto y ritmo del juego.',
            'Corrige errores y ajusta decisiones posteriores de forma consciente.',
        ],
        niveles: {
            bajo: {
                rango: [0, 39],
                etiqueta: 'Bajo',
                color: '#EF4444',
                descripcion: 'Acciones erráticas o improvisadas que provocan pérdidas frecuentes. Rigidez cognitiva: repite errores sin ajuste ni aprendizaje durante el partido.',
                implicancia: 'El jugador actúa por reacción automática y no por procesamiento consciente. Alto costo táctico para el equipo.',
                recomendacion: 'Trabajo de análisis de video con el jugador sobre sus propias decisiones. Ejercicios de "pausa y decide" en entrenamiento. Reducir variables en situaciones de presión.',
            },
            medio: {
                rango: [40, 69],
                etiqueta: 'Medio',
                color: '#EAB308',
                descripcion: 'Generalmente elige opciones correctas con alguna lentitud o inconsistencia bajo presión. Reconoce errores y ajusta parcialmente.',
                implicancia: 'Decisiones aceptables en juego fluido. Se ralentiza bajo presión intensa. Aprendizaje en partido parcialmente funcional.',
                recomendacion: 'Entrenar la velocidad de procesamiento en contextos de presión creciente. Rutinas de autoevaluación post-acción.',
            },
            alto: {
                rango: [70, 100],
                etiqueta: 'Alto',
                color: '#39FF14',
                descripcion: 'Decide rápido y con precisión, coherente con la dinámica táctica. Aprende en tiempo real y convierte errores en mejora táctica inmediata.',
                implicancia: 'Jugador de alto valor táctico. Su capacidad de ajuste en partido reduce el impacto de los errores propios y optimiza las jugadas del equipo.',
                recomendacion: 'Darle rol de decisión táctica en situaciones de partido. Puede funcionar como referente en entrenamientos de toma de decisión.',
            },
        },
        posicionesClaveAlto: ['MC', 'MCO', 'DEL', 'PT'],
    },

    'Control atencional': {
        dominio: 'COGNITIVO',
        color: '#0070F3',
        conductas: [
            'Mantiene atención sostenida durante el juego.',
            'Se recupera rápidamente de distracciones o errores, reenfocando su atención.',
            'Mantiene precisión mental en momentos clave del partido.',
        ],
        niveles: {
            bajo: {
                rango: [0, 39],
                etiqueta: 'Bajo',
                color: '#EF4444',
                descripcion: 'Largos lapsos de desconexión. Pierde posicionamiento por despiste. Permanece distraído varios minutos tras errores. Colapso en presión con decisiones pobres.',
                implicancia: 'El jugador es vulnerable en los momentos de mayor exigencia. Susceptible a que un error puntual se encadene con varios posteriores.',
                recomendacion: 'Rutinas de anclaje atencional (palabra ancla, gesto físico). Trabajo con ePsD en el intervalo donde más baja su atención. Mindfulness aplicado al deporte.',
            },
            medio: {
                rango: [40, 69],
                etiqueta: 'Medio',
                color: '#EAB308',
                descripcion: 'Participación mayoritaria con breves bajones que no comprometen su rol. Se recompone tras 1-2 jugadas. Precisión irregular en situaciones críticas.',
                implicancia: 'Rendimiento estable en general, con ventanas de vulnerabilidad en contextos de alta presión o fatiga.',
                recomendacion: 'Identificar los intervalos del partido donde más baja la atención (usar datos ePsD por intervalo). Trabajo de refocalización en esos momentos específicos.',
            },
            alto: {
                rango: [70, 100],
                etiqueta: 'Alto',
                color: '#39FF14',
                descripcion: 'Atención plena y proactiva durante casi todo el partido. Recupera foco inmediatamente. Alta precisión y control en la mayoría de los momentos críticos.',
                implicancia: 'Jugador fiable en los momentos decisivos. Su consistencia atencional es una ventaja competitiva especialmente en los últimos minutos.',
                recomendacion: 'Capitalizar en situaciones de partido que exigen concentración sostenida (tiros libres, córners, presión final). Rol de referente del grupo.',
            },
        },
        posicionesClaveAlto: ['PT', 'DEF', 'MC', 'MCO'],
    },

    // ── DOMINIO EMOCIONAL ──────────────────────────────────────────────────

    'Gestión emocional': {
        dominio: 'EMOCIONAL',
        color: '#39FF14',
        conductas: [
            'Mantiene control emocional ante errores o decisiones arbitrales.',
            'Transforma emociones intensas en comportamientos útiles y funcionales.',
        ],
        niveles: {
            bajo: {
                rango: [0, 39],
                etiqueta: 'Bajo',
                color: '#EF4444',
                descripcion: 'Reacciones exageradas ante errores o arbitraje (ira prolongada, discusiones). La emoción domina la conducta con protestas o desorden. No canaliza hacia la acción.',
                implicancia: 'Riesgo de sanciones, contagio emocional negativo al equipo y pérdida de rendimiento en los minutos posteriores al detonante emocional.',
                recomendacion: 'Protocolo RRR (Reconocer-Resetear-Refocar). Trabajo individual de identificación de detonantes emocionales. Simulación de situaciones de alta presión en entrenamiento.',
            },
            medio: {
                rango: [40, 69],
                etiqueta: 'Medio',
                color: '#EAB308',
                descripcion: 'Molestia breve y localizada; se recompone en 1-2 jugadas. A veces canaliza la emoción en esfuerzo o presión, pero sin ajuste constante.',
                implicancia: 'Gestión emocional funcional en la mayoría de los contextos. Vulnerable en situaciones de acumulación de errores o marcadores adversos prolongados.',
                recomendacion: 'Consolidar las estrategias de regulación que ya usa. Trabajo en situaciones de estrés acumulado para desarrollar consistencia.',
            },
            alto: {
                rango: [70, 100],
                etiqueta: 'Alto',
                color: '#39FF14',
                descripcion: 'Mantiene calma, comunica asertivamente y vuelve rápido a la tarea. Convierte sistemáticamente la emoción en energía dirigida y eficaz para el equipo.',
                implicancia: 'Recurso de alto valor para el clima del equipo. Su regulación emocional es un modelo para el grupo y reduce el contagio negativo.',
                recomendacion: 'Potenciar su rol como referente emocional del equipo. Puede funcionar como modelo en situaciones críticas de partido.',
            },
        },
        posicionesClaveAlto: ['PT', 'DEF', 'MC'],
    },

    'Autodiálogo y enfoque mental': {
        dominio: 'EMOCIONAL',
        color: '#39FF14',
        conductas: [
            'Celebra acciones defensivas u ofensivas como refuerzo emocional positivo.',
            'Usa autoinstrucciones o gestos para reenfocar su mente tras errores o distracciones.',
            'Evita expresiones o autodiálogo negativo que afecten su desempeño.',
        ],
        niveles: {
            bajo: {
                rango: [0, 39],
                etiqueta: 'Bajo',
                color: '#EF4444',
                descripcion: 'No muestra refuerzo positivo tras acciones efectivas. Permanece distraído sin intentos de reenfocar. Autocrítica negativa visible (golpes, maldecir, frustración exagerada).',
                implicancia: 'El diálogo interno negativo actúa como segundo error tras el primero. Ciclo de frustración que reduce la disponibilidad mental para la siguiente acción.',
                recomendacion: 'Trabajo en reestructuración cognitiva. Identificar frases de corte y reemplazo. Diseñar una rutina personal de autoinstrucción positiva. Diario emocional post-partido.',
            },
            medio: {
                rango: [40, 69],
                etiqueta: 'Medio',
                color: '#EAB308',
                descripcion: 'Celebra algunas acciones exitosas con expresividad leve. Se recupera en segundos con gestos o respiración. Molestia ocasional sin afectar el rendimiento significativamente.',
                implicancia: 'Uso parcial e inconsistente de recursos de autogestión mental. Funciona bien en situaciones de baja carga emocional, pero se debilita bajo estrés acumulado.',
                recomendacion: 'Formalizar y automatizar las estrategias que ya usa. Práctica deliberada de celebración activa. Trabajo en rutinas de reenfoques visibles y consistentes.',
            },
            alto: {
                rango: [70, 100],
                etiqueta: 'Alto',
                color: '#39FF14',
                descripcion: 'Celebra con energía contagiando al equipo. Reacciona de inmediato con rutinas o auto-instrucciones efectivas y visibles. Sin evidencia de diálogo negativo, incluso tras errores repetidos.',
                implicancia: 'El jugador tiene un sistema interno de autorregulación consolidado. Su energía y actitud son activos para el clima del grupo.',
                recomendacion: 'Mantener y dar visibilidad a sus rutinas. Asignarle un rol de modelo para compañeros que trabajan la misma área.',
            },
        },
        posicionesClaveAlto: ['DEL', 'PT', 'MC'],
    },

    'Autoconfianza y resiliencia': {
        dominio: 'EMOCIONAL',
        color: '#39FF14',
        conductas: [
            'Mantiene seguridad y energía en contextos adversos.',
            'Persevera tras fallos, manteniendo una actitud estable y optimista.',
            'Se muestra disponible y asume responsabilidad en momentos críticos.',
        ],
        niveles: {
            bajo: {
                rango: [0, 39],
                etiqueta: 'Bajo',
                color: '#EF4444',
                descripcion: 'Pasividad o temor con marcador adverso. Evita participar. Se frustra y reduce esfuerzo. Evita roles de responsabilidad en acciones clave.',
                implicancia: 'El jugador se inhibe precisamente cuando el equipo más lo necesita. La adversidad lo vuelve menos disponible en lugar de más comprometido.',
                recomendacion: 'Trabajo en historial de logros y recursos personales. Exposición gradual a situaciones de responsabilidad controlada. Trabajo en diálogo interno ante la adversidad. Reducir el miedo al error.',
            },
            medio: {
                rango: [40, 69],
                etiqueta: 'Medio',
                color: '#EAB308',
                descripcion: 'Participa con menor iniciativa ante adversidad. Esfuerzo sostenido pero limitado. Se recompone parcialmente y continúa. Asume cuando se le solicita con leves signos de tensión.',
                implicancia: 'Confianza funcional en contextos estables. La adversidad genera inhibición parcial, no total. Potencial de desarrollo significativo con trabajo específico.',
                recomendacion: 'Trabajo en simulación de contextos adversos. Reforzar la narrativa de "yo puedo con esto" ante situaciones de presión. Trabajo en exposición progresiva.',
            },
            alto: {
                rango: [70, 100],
                etiqueta: 'Alto',
                color: '#39FF14',
                descripcion: 'Refuerza protagonismo en la adversidad con energía alta y positiva. Usa el error como motivación y aumenta concentración. Se ofrece activamente y ejerce liderazgo bajo presión.',
                implicancia: 'Jugador que mejora ante la dificultad. Valor estratégico en situaciones decisivas de partido y en la cultura del equipo.',
                recomendacion: 'Asignarle responsabilidades en momentos críticos (penaltis, tiros libres, situaciones de remontada). Reconocer públicamente su actitud para reforzar la cultura del equipo.',
            },
        },
        posicionesClaveAlto: ['PT', 'DEL', 'DEF'],
    },

    // ── DOMINIO SOCIAL ─────────────────────────────────────────────────────

    'Comunicación emocional': {
        dominio: 'SOCIAL',
        color: '#F97316',
        conductas: [
            'Se comunica de forma asertiva y respetuosa (gestos, voz o señas).',
            'Usa la comunicación para regular el ambiente emocional del equipo.',
        ],
        niveles: {
            bajo: {
                rango: [0, 39],
                etiqueta: 'Bajo',
                color: '#EF4444',
                descripcion: 'Mensajes hostiles o confusos con gestos descalificadores o tono agresivo. Aumenta la tensión con quejas o recriminaciones. No contribuye a regular el clima del equipo.',
                implicancia: 'El jugador es una fuente de tensión interpersonal activa. Sus comunicaciones deterioran el clima y pueden generar conflictos dentro del equipo.',
                recomendacion: 'Trabajo en comunicación asertiva y no violenta. Identificar sus patrones de comunicación bajo presión. Trabajo en regulación emocional previa a la comunicación.',
            },
            medio: {
                rango: [40, 69],
                etiqueta: 'Medio',
                color: '#EAB308',
                descripcion: 'Comunicación generalmente funcional con ocasionales tonos inadecuados. Ocasionalmente calma o anima con efecto limitado o intermitente.',
                implicancia: 'Comunicador funcional en situaciones estables. Su efectividad disminuye en momentos de alta tensión, que son justamente donde más importa.',
                recomendacion: 'Trabajo en comunicación bajo presión. Ejercicios de comunicación en situaciones simuladas de conflicto o adversidad.',
            },
            alto: {
                rango: [70, 100],
                etiqueta: 'Alto',
                color: '#39FF14',
                descripcion: 'Comunicación clara, constructiva y respetuosa que favorece el vínculo y la organización. Actúa activamente para calmar o motivar con impacto positivo visible en el clima.',
                implicancia: 'El jugador es un regulador emocional activo del grupo. Su comunicación tiene un efecto directo en la cohesión y el rendimiento colectivo.',
                recomendacion: 'Asignar roles de comunicación explícita en partido (capitanía, referente de zona). Reconocer públicamente su contribución al clima del equipo.',
            },
        },
        posicionesClaveAlto: ['MC', 'DEF', 'PT'],
    },

    'Vínculo y cohesión': {
        dominio: 'SOCIAL',
        color: '#F97316',
        conductas: [
            'Apoya y respalda emocionalmente a sus compañeros.',
            'Celebra y comparte logros colectivos con expresividad positiva.',
        ],
        niveles: {
            bajo: {
                rango: [0, 39],
                etiqueta: 'Bajo',
                color: '#EF4444',
                descripcion: 'Ignora o critica a compañeros tras errores. Aislamiento dentro del equipo. No celebra o lo hace de forma individualista, con nula conexión grupal.',
                implicancia: 'El jugador está desconectado emocionalmente del equipo. Esto afecta la cohesión general y puede generar tensiones interpersonales que se trasladan al juego.',
                recomendacion: 'Trabajo en dinámica de grupo y pertenencia. Asignación de tareas colaborativas que requieran apoyo mutuo. Trabajo en empatía y perspectiva del compañero.',
            },
            medio: {
                rango: [40, 69],
                etiqueta: 'Medio',
                color: '#EAB308',
                descripcion: 'Ofrece apoyo en algunas situaciones sin consistencia. Celebra de forma moderada con cierta conexión grupal.',
                implicancia: 'Vínculo funcional pero superficial. Su aporte a la cohesión es esporádico y dependiente del contexto emocional del partido.',
                recomendacion: 'Estimular la expresividad positiva consciente. Trabajo en reconocimiento del compañero. Actividades de equipo fuera del campo.',
            },
            alto: {
                rango: [70, 100],
                etiqueta: 'Alto',
                color: '#39FF14',
                descripcion: 'Apoyo inmediato y sincero tras errores de compañeros, reforzando pertenencia y cohesión. Celebra activamente con el grupo, reforzando el logro colectivo.',
                implicancia: 'El jugador es un agente de cohesión activo. Su presencia fortalece la red de apoyo emocional del equipo, especialmente en momentos de dificultad.',
                recomendacion: 'Potenciar su rol como referente social del grupo. Su modelo de celebración y apoyo puede ser explicitado como estándar del equipo.',
            },
        },
        posicionesClaveAlto: ['MC', 'DEF', 'PT'],
    },

    'Liderazgo emocional': {
        dominio: 'SOCIAL',
        color: '#F97316',
        conductas: [
            'Mantiene serenidad y transmite calma en momentos de presión o conflicto.',
            'Modela comportamientos de autocontrol, respeto y compromiso.',
        ],
        niveles: {
            bajo: {
                rango: [0, 39],
                etiqueta: 'Bajo',
                color: '#EF4444',
                descripcion: 'Se descompone o contagia nerviosismo, añadiendo inestabilidad al grupo. Ejemplifica conductas inapropiadas (protestas, falta de respeto, apatía).',
                implicancia: 'Efecto de liderazgo negativo activo: su conducta arrastra al grupo hacia estados emocionales contraproducentes en lugar de estabilizarlo.',
                recomendacion: 'Trabajo individual urgente en regulación emocional y en el impacto de su conducta sobre el grupo. Diferenciar el "yo como individuo" del "yo como modelo para el equipo".',
            },
            medio: {
                rango: [40, 69],
                etiqueta: 'Medio',
                color: '#EAB308',
                descripcion: 'Mantiene relativa calma con contención parcial del grupo. Cumple normas y muestra respeto en general.',
                implicancia: 'Liderazgo emocional neutro o levemente positivo. No genera daño pero tampoco capitaliza su potencial de influencia positiva sobre el grupo.',
                recomendacion: 'Trabajo en liderazgo consciente. Explorar con el jugador su rol como modelo. Ejercicios de liderazgo situacional en entrenamiento.',
            },
            alto: {
                rango: [70, 100],
                etiqueta: 'Alto',
                color: '#39FF14',
                descripcion: 'Serenidad ejemplar que lo convierte en ancla emocional en situaciones críticas. Modelo visible de autocontrol y compromiso que eleva el estándar del equipo.',
                implicancia: 'Líder emocional de alta influencia. Su presencia en el campo tiene un efecto regulador sobre el estado del equipo que trasciende sus propias acciones técnicas.',
                recomendacion: 'Asignar formalmente roles de liderazgo (capitanía, referente de vestuario). Usar su modelo como referencia explícita para el equipo.',
            },
        },
        posicionesClaveAlto: ['MC', 'DEF', 'PT', 'DEL'],
    },
};

// ─── 2. PUNTOS DE CORTE ───────────────────────────────────────────────────
// Provisorios hasta tener datos suficientes por categoría de edad.
// Se pueden sobreescribir con `getCortesDesdeCache()` una vez acumulados datos.

export const CORTES_DEFAULT = {
    bajo:  { min: 0,  max: 39 },
    medio: { min: 40, max: 69 },
    alto:  { min: 70, max: 100 },
};

// Cortes por categoría de edad (se van refinando con datos)
export const CORTES_POR_CATEGORIA = {
    'Sub-13': { bajo: [0, 35], medio: [36, 65], alto: [66, 100] },
    'Sub-15': { bajo: [0, 37], medio: [38, 67], alto: [68, 100] },
    'Sub-17': { bajo: [0, 39], medio: [40, 69], alto: [70, 100] },
    'Sub-20': { bajo: [0, 40], medio: [41, 71], alto: [72, 100] },
    'default':{ bajo: [0, 39], medio: [40, 69], alto: [70, 100] },
};

// ─── 3. FUNCIÓN PRINCIPAL DE INTERPRETACIÓN ───────────────────────────────

/**
 * Interpreta un puntaje de subdimensión según los baremos del instrumento.
 * 
 * @param {string} subescala - Nombre de la subdimensión
 * @param {number} indice    - Valor 0-100 calculado por el sistema ePsD
 * @param {string} posicion  - Posición del jugador (opcional, para contexto)
 * @param {string} categoria - Categoría de edad (opcional, ajusta cortes)
 * @returns {object} Interpretación completa
 */
export function interpretarSubescala(subescala, indice, posicion = null, categoria = null) {
    const baremo = BAREMOS_EPSD[subescala];
    if (!baremo) return null;

    const cortes = categoria && CORTES_POR_CATEGORIA[categoria]
        ? CORTES_POR_CATEGORIA[categoria]
        : CORTES_POR_CATEGORIA['default'];

    let nivel;
    if (indice <= cortes.bajo[1])       nivel = 'bajo';
    else if (indice <= cortes.medio[1]) nivel = 'medio';
    else                                nivel = 'alto';

    const interp = baremo.niveles[nivel];

    // Ajuste contextual por posición
    const esPositionClave = posicion && baremo.posicionesClaveAlto?.includes(posicion);
    let notaPosicion = null;
    if (esPositionClave && nivel === 'bajo') {
        notaPosicion = `⚠️ Para la posición ${posicion}, esta subdimensión es crítica. El nivel bajo tiene impacto directo en el rendimiento esperado.`;
    } else if (esPositionClave && nivel === 'alto') {
        notaPosicion = `✅ Esta fortaleza es un diferencial para la posición ${posicion}.`;
    }

    // Obtener recomendaciones por actor desde epsdRecomendaciones.js
    const recomendacionesActores = getRecomendaciones(subescala, nivel);

    return {
        subescala,
        dominio: baremo.dominio,
        color: baremo.color,
        indice: Math.round(indice),
        nivel,
        etiqueta: interp.etiqueta,
        colorNivel: interp.color,
        descripcion: interp.descripcion,
        implicancia: interp.implicancia,
        recomendacion: interp.recomendacion,
        conductas: baremo.conductas,
        notaPosicion,
        esPositionClave,
        // Recomendaciones por actor (de epsdRecomendaciones.js)
        actores: recomendacionesActores || null,
    };
}

// ─── 4. INTERPRETACIÓN COMPLETA DE UNA EVALUACIÓN ────────────────────────

/**
 * Genera el diagnóstico completo de una evaluación ePsD
 * sin usar IA — 100% determinístico basado en los baremos del instrumento.
 * 
 * @param {object} analisis  - Resultado de calculateWeightedAnalysis()
 * @param {string} posicion  - Posición del jugador
 * @param {string} categoria - Categoría de edad
 * @returns {object} Diagnóstico completo estructurado
 */
export function generarDiagnosticoCompleto(analisis, posicion = null, categoria = null) {
    if (!analisis?.subescalas) return null;

    // Interpretar cada subdimensión
    const interpretaciones = {};
    Object.entries(analisis.subescalas).forEach(([nombre, data]) => {
        const interp = interpretarSubescala(
            nombre,
            parseFloat(data.indice),
            posicion,
            categoria
        );
        if (interp) interpretaciones[nombre] = interp;
    });

    // Ordenar por puntaje
    const ordenadas = Object.entries(interpretaciones)
        .sort((a, b) => b[1].indice - a[1].indice);

    const fortalezas = ordenadas.slice(0, 3).map(([nombre, i]) => ({ nombre, ...i }));
    const areasDesarrollo = [...ordenadas].reverse().slice(0, 3).map(([nombre, i]) => ({ nombre, ...i }));

    // Conteo de niveles
    const conteoNiveles = { bajo: 0, medio: 0, alto: 0 };
    Object.values(interpretaciones).forEach(i => conteoNiveles[i.nivel]++);

    // Score global de preparación (0-100)
    const dominios = analisis.dominios || {};
    const scorePreparacion = Math.round(
        ((dominios.COGNITIVO || 0) * 0.35 +
         (dominios.EMOCIONAL || 0) * 0.40 +
         (dominios.SOCIAL    || 0) * 0.25)
    );

    // Perfil general
    const perfilGeneral = getPerfilGeneral(dominios);

    // Riesgos identificados
    const riesgos = detectarRiesgos(interpretaciones, analisis);

    return {
        interpretaciones,
        fortalezas,
        areasDesarrollo,
        conteoNiveles,
        scorePreparacion,
        perfilGeneral,
        riesgos,
        dominios,
        generadoEn: new Date().toISOString(),
        esIA: false, // Este diagnóstico es determinístico, no generado por IA
    };
}

// ─── 5. PERFIL GENERAL ────────────────────────────────────────────────────

function getPerfilGeneral(dominios) {
    const c = dominios.COGNITIVO || 0;
    const e = dominios.EMOCIONAL || 0;
    const s = dominios.SOCIAL    || 0;
    const prom = (c + e + s) / 3;

    if (prom >= 75) return { label: 'Rendimiento Óptimo',    color: '#39FF14', emoji: '🏆', desc: 'El jugador muestra un perfil psicológico de alto rendimiento en las tres dimensiones evaluadas.' };
    if (prom >= 60) return { label: 'Rendimiento Bueno',     color: '#22C55E', emoji: '✅', desc: 'Buen desempeño general con algunas áreas de mejora identificadas.' };
    if (prom >= 45) return { label: 'Rendimiento Regular',   color: '#EAB308', emoji: '⚡', desc: 'Rendimiento funcional con brechas que requieren trabajo psicológico específico.' };
    if (prom >= 30) return { label: 'Requiere Atención',     color: '#F97316', emoji: '⚠️', desc: 'Varias dimensiones muestran niveles que pueden comprometer el rendimiento en partido.' };
    return               { label: 'Intervención Prioritaria',color: '#EF4444', emoji: '🚨', desc: 'El perfil psicológico actual requiere intervención urgente antes del próximo partido.' };
}

// ─── 6. DETECCIÓN DE RIESGOS ─────────────────────────────────────────────

function detectarRiesgos(interpretaciones, analisis) {
    const riesgos = [];

    // Riesgo burnout: ansiedad alta + motivación baja (visto en Gestión + Autoconfianza)
    const gestion = interpretaciones['Gestión emocional'];
    const autoconf = interpretaciones['Autoconfianza y resiliencia'];
    if (gestion?.nivel === 'bajo' && autoconf?.nivel === 'bajo') {
        riesgos.push({
            tipo: 'burnout',
            nivel: 'alto',
            label: '⚠️ Riesgo de Agotamiento Emocional',
            desc: 'La combinación de baja gestión emocional y baja autoconfianza es un patrón asociado a agotamiento psicológico deportivo.',
            color: '#EF4444',
        });
    }

    // Riesgo conflicto: comunicación baja + liderazgo bajo
    const comunicacion = interpretaciones['Comunicación emocional'];
    const liderazgo = interpretaciones['Liderazgo emocional'];
    if (comunicacion?.nivel === 'bajo' && liderazgo?.nivel === 'bajo') {
        riesgos.push({
            tipo: 'conflicto',
            nivel: 'medio',
            label: '⚠️ Riesgo de Conflicto Interpersonal',
            desc: 'Bajo nivel de comunicación y liderazgo emocional puede generar tensiones con compañeros y cuerpo técnico.',
            color: '#F97316',
        });
    }

    // Riesgo desconexión cognitiva: atención baja + percepción baja
    const atencion = interpretaciones['Control atencional'];
    const percepcion = interpretaciones['Percepción del entorno'];
    if (atencion?.nivel === 'bajo' && percepcion?.nivel === 'bajo') {
        riesgos.push({
            tipo: 'cognitivo',
            nivel: 'medio',
            label: '⚠️ Bajo Rendimiento Cognitivo',
            desc: 'La combinación de baja atención y baja percepción del entorno sugiere dificultades para mantenerse en el partido táctica y mentalmente.',
            color: '#F97316',
        });
    }

    // Riesgo intervalo (si hay datos de intervalos)
    if (analisis?.dataIntervalos) {
        const intervalos = analisis.dataIntervalos;
        const minIdx = intervalos.indexOf(Math.min(...intervalos));
        const labels = ["0-25'", "26-45'", "45-70'", "71-90'"];
        if (Math.min(...intervalos) < 35 && Math.max(...intervalos) > 0) {
            riesgos.push({
                tipo: 'intervalo',
                nivel: 'info',
                label: `📉 Caída de rendimiento en ${labels[minIdx]}`,
                desc: `El intervalo de menor rendimiento es ${labels[minIdx]}. Revisar estrategia de activación o recuperación en ese momento del partido.`,
                color: '#38BDF8',
            });
        }
    }

    return riesgos;
}

// ─── 7. ACUMULADOR DE DATOS PARA REFINAMIENTO DE CORTES ──────────────────
// Esta función puede llamarse periódicamente para actualizar los cortes
// basándose en datos reales del sistema.

/**
 * Calcula estadísticas descriptivas de todas las evaluaciones
 * guardadas en Firestore para refinar los puntos de corte.
 * 
 * Uso: llamar desde un componente admin periódicamente
 * y guardar el resultado en Firestore como 'baremos_calculados/{categoria}'
 * 
 * @param {Array} evaluaciones - Array de evaluaciones de Firestore
 * @param {string} categoria   - Categoría de edad a analizar
 * @returns {object} Estadísticas y cortes recomendados por subdimensión
 */
export function calcularCortesDesdeData(evaluaciones, categoria = 'default') {
    if (!evaluaciones || evaluaciones.length < 10) {
        return { suficiente: false, n: evaluaciones?.length || 0 };
    }

    const stats = {};
    const subescalas = Object.keys(BAREMOS_EPSD);

    subescalas.forEach(sub => {
        const valores = [];
        evaluaciones.forEach(ev => {
            if (!ev.respuestas) return;
            // Calcular el índice de la subescala
            let suma = 0, count = 0;
            Object.values(ev.respuestas).forEach(resp => {
                if (!resp) return;
                ['0-25', '26-45', '45-70', '71-90'].forEach(int => {
                    if (resp[int]?.nivel) { suma += resp[int].nivel; count++; }
                });
            });
            if (count > 0) valores.push((suma / count) * 20);
        });

        if (valores.length < 5) return;

        valores.sort((a, b) => a - b);
        const n = valores.length;
        const p33 = valores[Math.floor(n * 0.33)];
        const p66 = valores[Math.floor(n * 0.66)];
        const media = valores.reduce((a, b) => a + b, 0) / n;

        stats[sub] = {
            n,
            media: Math.round(media),
            p33: Math.round(p33),
            p66: Math.round(p66),
            min: Math.round(valores[0]),
            max: Math.round(valores[n - 1]),
            corteSugerido: {
                bajo:  [0, Math.round(p33)],
                medio: [Math.round(p33) + 1, Math.round(p66)],
                alto:  [Math.round(p66) + 1, 100],
            },
        };
    });

    return {
        suficiente: true,
        n: evaluaciones.length,
        categoria,
        calculadoEn: new Date().toISOString(),
        stats,
    };
}

// ─── 8. HELPER: COMPARAR CON EVALUACIÓN ANTERIOR ─────────────────────────

/**
 * Genera un análisis de evolución entre dos evaluaciones
 * @param {object} actual   - analysisActual
 * @param {object} anterior - analysisPrevio
 * @returns {object} Delta por subdimensión
 */
export function compararEvaluaciones(actual, anterior) {
    if (!actual?.subescalas || !anterior?.subescalas) return null;

    const deltas = {};
    Object.entries(actual.subescalas).forEach(([nombre, data]) => {
        const indiceActual = parseFloat(data.indice);
        const indiceAnterior = parseFloat(anterior.subescalas[nombre]?.indice || 0);
        const diff = indiceActual - indiceAnterior;
        deltas[nombre] = {
            actual: Math.round(indiceActual),
            anterior: Math.round(indiceAnterior),
            diff: Math.round(diff),
            tendencia: diff > 5 ? 'sube' : diff < -5 ? 'baja' : 'estable',
            color: diff > 5 ? '#39FF14' : diff < -5 ? '#EF4444' : '#EAB308',
            emoji: diff > 5 ? '↑' : diff < -5 ? '↓' : '→',
        };
    });

    // Dominio con mayor mejora
    const mejorDominio = Object.entries(deltas).sort((a, b) => b[1].diff - a[1].diff)[0];
    const peorDominio = Object.entries(deltas).sort((a, b) => a[1].diff - b[1].diff)[0];

    return {
        deltas,
        mejorDominio: mejorDominio ? { nombre: mejorDominio[0], ...mejorDominio[1] } : null,
        peorDominio: peorDominio ? { nombre: peorDominio[0], ...peorDominio[1] } : null,
        tendenciaGlobal: Object.values(deltas).reduce((s, d) => s + d.diff, 0) / Object.keys(deltas).length,
    };
}
