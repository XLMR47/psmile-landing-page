// Servicio de Análisis de Laboratorio Psmile
// Basado 100% en datos directos de Firebase del perfil del jugador.


/**
 * Psmile Clinical Lab Analysis Service
 * ROLE: Senior Neuro-Performance Specialist & Sports Psychologist (Psmile Intelligence)
 */
export async function generateLabMasterAnalysis(payload) {
    const { jugador, evidencia_seleccionada, config } = payload;
    const modelId = config.model || "claude-sonnet";

    // 1. ACUMULADOR DE TEXTO DE DOCUMENTOS
    // Usamos un array para recolectar el contenido y luego unirlo (join)
    const documentosExtraidos = await Promise.all(evidencia_seleccionada.map(async (ev, index) => {
        let contenido = JSON.stringify(ev.data || ev, null, 2);
        return `=== DOCUMENTO ${index + 1}: ${ev.titulo} (${ev.tipo}) ===\n${contenido}\n`;
    }));

    // Unimos todos los documentos con separadores claros
    const contextoDocumentos = documentosExtraidos.join("\n------------------------------------------------\n\n");
    const systemPrompt = `
ROLE: Senior Neuro-Performance Specialist & Sports Psychologist.
MISSION: Generar un Perfil Integral del Futbolista cruzando datos de campo (ePsD), psicometría digital, autoreporte y metas SMART.

MARCO TEÓRICO COMPACTO:
1. COGNITIVA: Funciones Ejecutivas (memoria de trabajo, flexibilidad, inhibición) y Velocidad de Procesamiento (élite < 200ms). Atención selectiva y focos de Nideffer.
2. EMOCIONAL: Marcadores Somáticos y Plasticidad (Miedo, Rabia, Tristeza, Alegría). Gestión de Autoconfianza y orientación a metas (Proceso vs Resultado).
3. CONDUCTUAL-SOCIAL: Estructura Socioafectiva (Seirulo), Efecto Pigmalión y Etapas Evolutivas (Iniciación, Formación, Especialización, Profesional).

PROTOCOLO:
- Cruza las 4 fuentes (ePsD, Psicometría, Autoreporte, SMART).
- Detecta BAJA CONGRUENCIA si hay divergencia entre campo y tests/metas.
- Basa hallazgos solo en evidencia JSON. Responde solo en JSON válido.

JSON OUTPUT FORMAT:
{
  "readyScore": number(0-10),
  "resumen_clinico": "narrativa integradora (max 3 oraciones)",
  "matriz_convergente": {
    "cognitiva": { "epsd": "txt", "psicometria": "txt", "autoreporte": "txt", "convergencia": "alta|media|baja|no_aplica", "interpretacion": "txt" },
    "emocional": { "epsd": "txt", "psicometria": "txt", "autoreporte": "txt", "convergencia": "alta|media|baja|no_aplica", "interpretacion": "txt" },
    "conductual": { "epsd": "txt", "psicometria": "txt", "autoreporte": "txt", "convergencia": "alta|media|baja|no_aplica", "interpretacion": "txt" }
  },
  "validacion_epsd": { "areas_validadas": [], "areas_divergentes": [], "hipotesis_divergencia": "txt", "conclusion_validez": "txt" },
  "congruencia_jugador": { "nivel": "alta|media|baja|no_aplica", "descripcion": "txt", "implicacion_clinica": "txt" },
  "perfil_motivacional": "resultado|rendimiento|proceso|no_determinado",
  "etapa_evolutiva": "iniciación|formación|especialización|profesional|no_especificada",
  "hallazgos": [ { "titulo": "txt", "descripcion": "txt", "impacto": "positivo|neutro|critico", "dimension": "cognitiva|emocional|conductual", "fuentes_que_lo_respaldan": [] } ],
  "sugerencias": [ { "intervencion": "txt", "dimension": "cognitiva|emocional|conductual", "prioridad": "inmediata|corto_plazo|largo_plazo", "fundamento": "txt" } ]
}
`;
    const userPrompt = `
SOLICITUD DE ANÁLISIS MAESTRO UNIFICADO:
Atleta: ${jugador.nombre} | Categoría: ${jugador.categoria} | Posición: ${jugador.posicion}

CESTA DE DATOS EXTRAÍDA (${evidencia_seleccionada.length} fuentes):
${contextoDocumentos}

Genera la "Síntesis Maestra" basada en la correlación de estos documentos bajo el prisma científico de Psmile. Responde estrictamente en formato JSON.
`;

    try {
        const response = await fetch("/.netlify/functions/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: modelId,
                systemPrompt: systemPrompt,
                userPrompt: userPrompt,
                temperature: 0.2,
                response_format: { type: "json_object" },
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error en el servicio de análisis");
        }

        const data = await response.json();
        // Extraer el contenido del primer choice y parsearlo como JSON
        let rawContent = data.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("La IA devolvió una respuesta vacía.");

        // Eliminar markdown fences que Claude a veces agrega
        rawContent = rawContent
            .replace(/```json\n?/gi, '')
            .replace(/```\n?/gi, '')
            .trim();

        return JSON.parse(rawContent);

    } catch (error) {
        console.error("Lab Service Error:", error);
        throw error;
    }
}
