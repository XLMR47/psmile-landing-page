import { EPSD_OPERATIONAL_DEFINITIONS } from './epsdIntelligence';

export const generateGroqAnalysis = async (playerData, evaluationData, historyData = []) => {

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
<ROL>
Eres un Psicólogo Deportivo de Élite y Master en Neuropsicología del Deporte.
Tu misión: generar un "Diagnóstico de Ingeniería de Rendimiento" en formato JSON puro, basado estrictamente en datos cuantitativos de Firebase y el Instrumento ePsD.
</ROL>

<CONTEXTO>
- Fuente de datos: Firebase (evaluaciones registradas en la nube PSMILE)
- Instrumento: ePsD (Escala de Performance Psico-Deportiva)
- No hay PDFs ni documentos externos. Todo se basa en los puntajes numéricos y conductas operacionales.
</CONTEXTO>

<TIPO_DE_REPORTE>
${reportType}
</TIPO_DE_REPORTE>

<DATOS_DEL_JUGADOR>
- Nombre: ${playerData.nombre}
- ID Perfil: ${playerData.id || 'N/A'}
- Posición: ${playerData.posicion}
- Categoría: ${playerData.categoria}
- Pesos por Subescala: ${JSON.stringify(playerData.configWeights || "Estándar")}
</DATOS_DEL_JUGADOR>

<DATOS_CUANTITATIVOS_ACTUALES>
Contexto: ${evaluationData.contexto?.torneo || 'Actual'}
${currentScores}
</DATOS_CUANTITATIVOS_ACTUALES>

${comparativeContext}

<MARCO_TEORICO_PSMILE>
1. FUNCIONES EJECUTIVAS (Lóbulo Frontal):
   - Toma de decisiones, flexibilidad cognitiva, control inhibitorio, memoria de trabajo.
   - Déficit cognitivo → mayor riesgo de lesiones (isquiosurales por tiempos de reacción lentos).

2. PROCESAMIENTO VISUAL (80% de la información):
   - Agudeza dinámica, visión periférica, sacádicos, anticipación.
   - Focos atencionales (Nideffer): amplio/estrecho × interno/externo.

3. GESTIÓN EMOCIONAL (Sistema Límbico):
   - Plasticidad emocional: transitar entre miedo, rabia, tristeza, alegría sin bloqueo.
   - Autoconfianza: historia personal + dificultad percibida + entorno social.
   - Motivación: metas de resultado vs rendimiento vs proceso.

4. INTERVENCIÓN:
   - PETTLEP (Imaginería), Respiración 4 tiempos, Pedagogía no lineal.
   - Etapas: Iniciación (5-8), Formación (8-11), Especialización (12-17), Profesional (+18).
</MARCO_TEORICO_PSMILE>

<OPERACIONALIZACIÓN_EPSD>
Mapea CADA puntaje a su conducta correspondiente usando ESTE JSON:
${JSON.stringify(EPSD_OPERATIONAL_DEFINITIONS)}
</OPERACIONALIZACIÓN_EPSD>

<INSTRUCCIONES_TECNICAS>
1. CRUCE CUANTITATIVO-OPERACIONAL: Cada puntaje → conducta de EPSD_OPERATIONAL_DEFINITIONS.
2. EXPLICACIÓN: Usa marco teórico para el "por qué" (hardware visual, software cognitivo, sistema límbico).
3. HALLAZGO CENTRAL: Sonar a diagnóstico clínico (ej: "Déficit de control inhibitorio bajo presión").
4. PLAN DE ACCIÓN: Protocolos concretos (PETTLEP, 4 tiempos, etc.).
5. LENGUAJE: Técnico para el informe, simple para la sección "analisis_cuantitativo".
</INSTRUCCIONES_TECNICAS>

<REGLAS_DE_ORO>
- EVALUACIÓN INICIAL (sin historial): Habla de "Nivel actual", "Fortaleza", "Eje a desarrollar". PROHIBIDO: "caída", "mejora", "deterioro".
- CON HISTORIAL (${historyData.length} previos): PROHIBIDO decir "Primer Análisis", "Huella Inicial", "Nivel Base". Compara P2 vs P1. Tono: evolución/declinación.
- CAMPO "comparativa.etiqueta": DEBE ser "${reportType}".
- TERMINOLOGÍA: "Hardware visual", "Software cognitivo", "Funciones ejecutivas", "Plasticidad emocional".
</REGLAS_DE_ORO>

<FORMATO_JSON_ESTRICTO>
IMPORTANTE: Responde SOLO con JSON válido. SIN bloques de código (```). SIN texto antes o después.

Schema exacto:
{
  "comparativa": {
    "etiqueta": "${reportType}",
    "cognitivo": {
      "diff": "${previousEvaluationData ? '-X%' : 'Base'}",
      "pcts": "${previousEvaluationData ? 'XX% -> YY%' : 'Nivel Actual'}",
      "label": "Título técnico de 2-4 palabras"
    },
    "emocional": {
      "diff": "${previousEvaluationData ? '+X%' : 'Base'}",
      "pcts": "${previousEvaluationData ? 'XX% -> YY%' : 'Nivel Actual'}",
      "label": "Título técnico de 2-4 palabras"
    },
    "social": {
      "diff": "${previousEvaluationData ? '-X%' : 'Base'}",
      "pcts": "${previousEvaluationData ? 'XX% -> YY%' : 'Nivel Actual'}",
      "label": "Título técnico de 2-4 palabras"
    }
  },
  "analisis_cuantitativo": {
    "resumen_general": "2-3 frases explicando para padres qué significan los números",
    "dominios": {
      "cognitivo": "1-2 frases explicando puntaje cognitivo",
      "emocional": "1-2 frases explicando puntaje emocional",
      "social": "1-2 frases explicando puntaje social"
    }
  },
  "cambios_dramaticos": [
    {"label": "Nombre de subescala", "diff": "-XX%", "trend": "down"}
  ],
  "hallazgo_central": "1 frase con el problema RAÍZ técnico",
  "detalles_caida": [
    {
      "icono": "⚠️",
      "titulo": "Área analizada",
      "subtitulo": "Descriptor ePsD específico",
      "descripcion": "2-3 frases de análisis cualitativo"
    }
  ],
  "lo_que_resistio": [
    {
      "icono": "🛡️",
      "titulo": "Fortaleza sostenida",
      "subtitulo": "Nivel de resiliencia",
      "descripcion": "2-3 frases explicando la fortaleza"
    }
  ],
  "explicacion_central": "1-2 párrafos con explicación neuro-psicológica (hardware/software/límbico)",
  "plan_accion": [
    {
      "priority": "1",
      "titulo": "Intervención de Élite",
      "descripcion": "Protocolo específico (PETTLEP, 4 tiempos, etc.)"
    },
    {
      "priority": "2",
      "titulo": "Seguimiento",
      "descripcion": "Recomendación de próximas evaluaciones"
    }
  ],
  "conclusion_dt": "1-2 frases de resumen estratégico para el entrenador"
}
</FORMATO_JSON_ESTRICTO>

<ADVERTENCIA_FINAL>
NO uses bloques de código Markdown. NO escribas texto fuera del JSON.
El output debe ser parseable directamente por JSON.parse().
</ADVERTENCIA_FINAL>
`;

    try {
        const response = await fetch("/.netlify/functions/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                systemPrompt: "Eres un generador de informes psicodeportivos de élite en formato JSON. Responde SOLO con JSON válido, sin bloques de código Markdown, sin texto extra.",
                prompt: prompt,
                model: "claude-haiku",
                temperature: 0.5,
                max_tokens: 3000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al conectar con el servicio de análisis");
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("La IA devolvió una respuesta vacía.");

        // Limpiar marcados de código Markdown si la IA los incluye
        let cleanContent = rawContent.trim();
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```(?:json)?\s*/, '').replace(/```$/, '');
        }

        return JSON.parse(cleanContent);
    } catch (error) {
        console.error("Analysis Error:", error);
        throw error;
    }
};
