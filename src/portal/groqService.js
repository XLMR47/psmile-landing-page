import { EPSD_OPERATIONAL_DEFINITIONS } from './epsdIntelligence';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const generateGroqAnalysis = async (playerData, evaluationData, historyData = []) => {
    if (!GROQ_API_KEY) {
        throw new Error("API Key de Groq no configurada.");
    }

    const currentScores = Object.entries(evaluationData.subescalas)
        .map(([name, data]) => `- ${name}: ${data.indice}/100`)
        .join('\n');

    let reportType = 'EVALUACIÓN INICIAL (ESTADO ACTUAL)';
    let comparativeContext = "";
    
    if (historyData && historyData.length > 0) {
        const historyCount = historyData.length;
        reportType = historyCount > 1 ? 'DIAGNÓSTICO LONGITUDINAL Y EVOLUTIVO' : 'ANÁLISIS COMPARATIVO (P1 vs P2)';
        
        const historySummary = historyData.map((h, i) => {
            const scores = Object.entries(h.analisis.subescalas)
                .map(([name, data]) => `${name}: ${data.indice}%`)
                .join(', ');
            return `PUNTO ${i + 1} (${h.fecha} - ${h.torneo}): ${scores}`;
        }).join('\n');

        comparativeContext = `
        HISTORIAL DE EVALUACIONES ANTERIORES (${historyCount} registros):
        ${historySummary}
        
        INSTRUCCIÓN DE ANÁLISIS ${historyCount > 1 ? 'LONGITUDINAL' : 'COMPARATIVO'}:
        ${historyCount > 1 
            ? 'Analiza la trayectoria completa. Identifica si el jugador está progresando, se ha estancado o si tiene recaídas sistemáticas en contextos específicos. No uses frases como "Primer Análisis".' 
            : 'Compara P1 vs P2 detalladamente. Explica qué cambió y por qué.'}
        `;
    }

    const previousEvaluationData = historyData.length > 0 ? historyData[0].analisis : null;

    const prompt = `
        Eres un Psicólogo Deportivo de Élite y Master en Neuropsicología del Deporte. 
        Tu misión es realizar un "Diagnóstico de Ingeniería de Rendimiento" basado estrictamente en el Instrumento ePsD y en el Marco Teórico PSMILE.

        TIPO DE REPORTE: ${reportType}

        DATOS DEL JUGADOR:
        - Nombre: ${playerData.nombre} | Posición: ${playerData.posicion} | Categoría: ${playerData.categoria}

        DATOS CUANTITATIVOS ACTUALES (P2):
        Torneo/Contexto: ${evaluationData.contexto?.torneo || 'Actual'}
        ${currentScores}

        ${comparativeContext}

        MARCO TEÓRICO PSICO-DEPORTOLÓGICO PSMILE (VERBATIM):
        1. Perfil Neurocognitivo y Funciones Ejecutivas:
        El rendimiento deportivo no depende exclusivamente de las habilidades físicas o técnicas, sino de cómo el cerebro procesa la información en contextos complejos y cambiantes. Las funciones frontales y ejecutivas (FE) son los procesos cognitivos superiores alojados en el lóbulo frontal e incluyen capacidades determinantes como:
        - Toma de decisiones y resolución de problemas: Implica una fase perceptiva (observación del entorno) y se ve influenciada por la experiencia, el procesamiento de la información y los estados afectivos.
        - Flexibilidad cognitiva, control inhibitorio y memoria de trabajo: Son predictores de éxito deportivo. Los jugadores con mayores niveles de FE tienen un mayor margen de éxito, marcan más goles y dan más asistencias.
        - Prevención de lesiones: Un déficit cognitivo (como bajos niveles de memoria de trabajo y control inhibitorio) aumenta el riesgo de lesiones musculoesqueléticas, especialmente en los isquiosurales, debido a una menor eficiencia en los tiempos de reacción para iniciar o frenar una carrera.
        Además, intervienen otras áreas cerebrales críticas como el lóbulo parietal (movimiento y orientación), el lóbulo occipital (visión), el cerebelo (coordinación motora) y la amígdala (control de emociones).

        2. Procesamiento Perceptivo-Visual y Atención:
        Aproximadamente el 80% de la información que recibe un futbolista ingresa por la vía visual. El diagnóstico debe evaluar el mecanismo perceptivo, que es la base para la ejecución de respuestas motrices.
        - Habilidades visuales: Se debe evaluar la agudeza visual estática y dinámica, la visión periférica, los movimientos oculares (sacádicos) y la anticipación visual (capacidad de leer intenciones antes del estímulo).
        - Atención y Concentración: La atención es la forma de percibir estímulos, y la concentración es la capacidad de mantenerla. El diagnóstico puede basarse en la teoría de los focos atencionales de Nideffer, que evalúa dos dimensiones: dirección (interna/externa) y amplitud (amplia/estrecha). Por ejemplo, un foco amplio externo evalúa el entorno (compañeros, rivales), mientras que un foco estrecho interno se usa para concentrarse antes de un tiro libre.
        Para evaluar estas capacidades se pueden utilizar medidas fisiológicas (tasa cardíaca, EEG), el Test de Estilo Atencional e Interpersonal (TAIS), y herramientas tecnológicas como el Neurotracker 3D-MOT, que mejora el seguimiento de múltiples objetos, la visión periférica y la toma de decisiones.

        3. Gestión Emocional, Motivación y Autoconfianza:
        El cuerpo y la mente no están separados; la neurobiología demuestra que el sistema límbico es responsable del comportamiento y la toma de decisiones. En el deporte, las emociones son respuestas biológicas de adaptación.
        - Emociones básicas: El miedo permite analizar el entorno y evaluar opciones; la rabia orienta los recursos hacia los objetivos; la tristeza conecta al deportista con lo significativo, y la alegría promueve la fluidez. El diagnóstico debe identificar si el jugador posee plasticidad emocional, es decir, la capacidad de transitar entre estas emociones sin quedar bloqueado en una de ellas.
        - Marcadores somáticos: Las experiencias pasadas se marcan en el cuerpo, relacionando conductas con estados fisiológico-afectivos que guían las decisiones futuras.
        - Autoconfianza: Se construye a partir de la historia personal del jugador, la dificultad percibida de la tarea y el entorno social (lo que dicen el entrenador, la familia o la prensa).
        - Motivación y Metas: La motivación da dirección e intensidad a las acciones. El diagnóstico debe evaluar si el deportista se enfoca en metas de resultado (que no dependen 100% de él), metas de rendimiento (autoconocimiento), o metas de proceso (que dependen totalmente de su esfuerzo).

        4. Metodologías de Intervención y Entrenamiento Mental:
        La información recopilada sustentará un plan de intervención basado en:
        - Pedagogía no lineal y complejidad: El fútbol no es mecanicista. Se debe entrenar exponiendo al jugador a la incertidumbre y complejidad del contexto, obligándolo a autoorganizarse y potenciar su percepción.
        - Técnicas de entrenamiento mental: La intervención debe incluir técnicas de respiración (ej. respiración en 4 tiempos), meditación y técnicas cognitivo-conductuales (técnicas de corte, redirección de foco).
        - Imaginería (Visualización): Uso del modelo PETTLEP (Físico, Envtorno, Tarea, Tiempo, Aprendizaje, Emociones, Perspectiva) para simular escenarios que mejoren la confianza, la táctica y faciliten la recuperación de lesiones.
        - Desarrollo según la etapa vital: El abordaje debe adaptarse a la etapa del jugador: Iniciación (5-8 años, enfoque en fluidez y juego), Formación (8-11 años, inicio del entrenamiento mental), Especialización (12-17 años, identidad y cohesión) o Profesional (+18 años, manejo de presión y autoconocimiento).

        Conclusión para el Diagnóstico: Este informe demuestra que el futbolista debe ser evaluado como un sistema complejo y multidimensional. El diagnóstico psicodeportológico no debe limitarse a cuestionarios de personalidad, sino que debe integrar una evaluación de su hardware visual y software cognitivo, su plasticidad corporal frente a las emociones, y sus capacidades ejecutivas frontales, para así diseñar intervenciones que optimicen directamente sus tiempos de reacción, precisión en la cancha y bienestar general.

        OPERACIONALIZACIÓN ePsD (MAPEADOR DE CONDUCTAS):
        Utiliza este JSON para mapear los puntajes numéricos a conductas específicas obligatoriamente:
        ${JSON.stringify(EPSD_OPERATIONAL_DEFINITIONS)}

        INSTRUCCIONES DE ANÁLISIS TÉCNICO:
        1. Cruce Cuantitativo-Operacional: Mapea cada puntaje usando EPSD_OPERATIONAL_DEFINITIONS.
        2. Análisis Profundo: Usa el MARCO TEÓRICO PSMILE detallado anteriormente para explicar el "Por qué".
        3. Hallazgo Central: Debe sonar a diagnóstico clínico de élite (ej: "Disfunción en el control inhibitorio bajo presión competitiva").
        4. Plan de Acción: Incluye protocolos como PETTLEP o Respiración 4 tiempos.
        5. ANÁLISIS CUANTITATIVO (NUEVO): Genera una sección que explique los resultados numéricos actuales en un lenguaje sencillo y motivador para el público general/padres, sin perder la precisión.

        REGLAS DE ORO:
        - SI ES EVALUACIÓN INICIAL: No hables de "caídas", "mejoras" o "deterioro". Habla de "Nivel actual", "Fortaleza" o "Eje a desarrollar".
        - SI HAY HISTORIAL (${historyData.length} previos): ESTÁ PROHIBIDO decir "Primer Análisis", "Huella Inicial" o "Nivel Base". Debes comparar el estado actual (P2) con los hitos previos detectados en el historial. El tono debe ser de evolución/declinación.
        - CRÍTICO: Si detectas historial, el campo "etiqueta" en "comparativa" DEBE ser "${reportType}".
        - Usa terminología como "Hardware visual", "Software cognitivo" y "Funciones ejecutivas".

        FORMATO DE RESPUESTA (JSON ESTRICTO):
        {
          "comparativa": {
            "etiqueta": "${reportType}",
            "cognitivo": {"diff": "${previousEvaluationData ? '-X%' : 'Base'}", "pcts": "${previousEvaluationData ? '80% -> 60%' : 'Nivel Actual'}", "label": "Título técnico"},
            "emocional": {"diff": "${previousEvaluationData ? '+X%' : 'Base'}", "pcts": "${previousEvaluationData ? '70% -> 75%' : 'Nivel Actual'}", "label": "Título técnico"},
            "social": {"diff": "${previousEvaluationData ? '-X%' : 'Base'}", "pcts": "${previousEvaluationData ? '90% -> 50%' : 'Nivel Actual'}", "label": "Título técnico"}
          },
          "analisis_cuantitativo": {
            "resumen_general": "Explicación para padres/público general sobre qué significan los números obtenidos.",
            "dominios": {
               "cognitivo": "Explicación simple del puntaje cognitivo.",
               "emocional": "Explicación simple del puntaje emocional.",
               "social": "Explicación simple del puntaje conductual."
            }
          },
          "cambios_dramaticos": [
            {"label": "Subescala específica", "diff": "-50%", "trend": "down"}
          ],
          "hallazgo_central": "Sintesis técnica profunda del problema RAÍZ detectado.",
          "detalles_caida": [
            {
              "icono": "⚠️", 
              "titulo": "Área Analizada", 
              "subtitulo": "Descriptor ePsD", 
              "descripcion": "Análisis cualitativo basado en el JSON + Marco Teórico."
            }
          ],
          "lo_que_resistio": [
             {"icono": "🛡️", "titulo": "Fortaleza Sostenida", "subtitulo": "Nivel de resiliencia", "descripcion": "Explicación técnica de la fortaleza."}
          ],
          "explicacion_central": "Explicación neuro-psicológica detallada (Hardware/Software/Sistema Límbico).",
          "plan_accion": [
            {"priority": "1", "titulo": "Intervención de Élite", "descripcion": "Metodología específica (ej: PETTLEP, 4 tiempos)."},
            {"priority": "2", "titulo": "Seguimiento", "descripcion": "Recomendar evaluaciones futuras."}
          ],
          "conclusion_dt": "Resumen estratégico para el DT sobre la complejidad del jugador."
        }
    `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Eres un generador de informes psicodeportivos de élite en formato JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Error al conectar con Groq");
        }

        const result = await response.json();
        return JSON.parse(result.choices[0].message.content);
    } catch (error) {
        console.error("Groq API Error:", error);
        throw error;
    }
};
