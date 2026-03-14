import * as pdfjsLib from 'pdfjs-dist';
import { getStorage, ref, getBytes } from 'firebase/storage';

// Configurar el worker de PDF.js (usamos un CDN para no engrosar el bundle local)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Función para extraer texto de un PDF a partir de su URL
 */
async function extractTextFromPDF(url) {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }
        return fullText.trim();
    } catch (error) {
        console.error("Error extrayendo texto del PDF:", url, error);
        return "[Error al extraer texto de este documento]";
    }
}

async function extractTextFromHTML(url) {
    try {
        const storage = getStorage();
        const decodedUrl = decodeURIComponent(url);
        const pathMatch = decodedUrl.match(/o\/(.+?)\?/);
        
        console.log("🔍 URL decodificada:", decodedUrl);
        console.log("🔍 Path extraído:", pathMatch?.[1]);
        
        if (!pathMatch) throw new Error("No se pudo extraer el path de Firebase");
        
        const filePath = pathMatch[1];
        const storageRef = ref(storage, filePath);
        
        console.log("🔍 Intentando getBytes...");
        const bytes = await getBytes(storageRef);
        console.log("✅ getBytes OK, tamaño:", bytes.byteLength);
        
        const html = new TextDecoder().decode(bytes);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body.innerText || doc.body.textContent || html;
        
    } catch (error) {
        console.error("❌ Error exacto:", error.code, error.message);
        return "[Error al extraer texto de este documento]";
    }
}

/**
 * Psmile Clinical Lab Analysis Service
 * ROLE: Senior Neuro-Performance Specialist & Sports Psychologist (Psmile Intelligence)
 */
export async function generateLabMasterAnalysis(payload) {
    const { jugador, evidencia_seleccionada, config } = payload;
    const modelId = config.model || "llama-3.3-70b-versatile";

    // 1. ACUMULADOR DE TEXTO DE DOCUMENTOS
    // Usamos un array para recolectar el contenido y luego unirlo (join)
    const documentosExtraidos = await Promise.all(evidencia_seleccionada.map(async (ev, index) => {
        let contenido = "";
        
        if (ev.tipo === 'epsd_evaluacion') {
            contenido = JSON.stringify(ev.data_epsd, null, 2);
        } else if (ev.data_externa?.externalUrl) {
            const url = ev.data_externa.externalUrl;
            if (url.toLowerCase().includes('.pdf')) {
                contenido = await extractTextFromPDF(url);
            } else {
                contenido = await extractTextFromHTML(url);
            }
        } else {
            contenido = JSON.stringify(ev.data_externa || ev, null, 2);
        }

        // Formato solicitado: === DOCUMENTO X: [Nombre] ===
        return `=== DOCUMENTO ${index + 1}: ${ev.titulo} ===\n${contenido}\n`;
    }));

    // Unimos todos los documentos con separadores claros
    const contextoDocumentos = documentosExtraidos.join("\n------------------------------------------------\n\n");

    const systemPrompt = `
ROLE: Senior Neuro-Performance Specialist & Sports Psychologist (Psmile Intelligence)
MISSION:
Realizar diagnósticos psicodeportológicos de élite basados en Sistemas Dinámicos Complejos y Pedagogía No Lineal. Tu objetivo es generar un Perfil Integral del Futbolista unificando las dimensiones Cognitiva, Emocional y Conductual-Social.

MARCO TEÓRICO DETALLADO PARA DIAGNÓSTICO PSICODEPORTOLÓGICO: PERFIL INTEGRAL DEL FUTBOLISTA
Para estructurar un diagnóstico psicodeportológico profundo y preciso, es indispensable abandonar la visión fragmentada del deportista y adoptar un enfoque basado en sistemas dinámicos complejos y pedagogía no lineal. El jugador debe ser evaluado como una unidad funcional donde convergen tres dimensiones inseparables: la cognitiva, la emocional y la conductual-social.

A continuación, se expone el marco teórico argumentativo, respaldado por datos empíricos y neurocientíficos, para sustentar la evaluación y elaboración del perfil del jugador.

--------------------------------------------------------------------------------
1. DIMENSIÓN COGNITIVA: El Cerebro como Órgano Efector y Decisional
El fútbol moderno es un deporte de habilidades abiertas (acíclico) que exige respuestas en entornos de altísima incertidumbre y presión temporal. La dimensión cognitiva evalúa cómo el jugador procesa la información para actuar.
Funciones Frontales y Ejecutivas (FE): El lóbulo frontal alberga los procesos cognitivos superiores (memoria de trabajo, flexibilidad cognitiva, control inhibitorio, velocidad de procesamiento) que determinan el éxito en el campo.
Predicción de éxito deportivo: Investigaciones demuestran que los futbolistas de élite poseen medidas muy superiores en Funciones Ejecutivas en comparación con jugadores de divisiones inferiores o la población general. Los jugadores con altas FE marcan más goles, brindan más asistencias y logran mayor éxito.
Velocidad de procesamiento: El fútbol actual exige respuestas sumamente rápidas; la toma de decisión del futbolista moderno se ha reducido en 1.085 segundos respecto a los jugadores de hace 30 años. Mientras una persona sedentaria procesa información visual y acciona en unos 400 milisegundos, un deportista lo hace en 250 ms, y un atleta de élite alcanza tiempos de respuesta de hasta 150 milisegundos.
Prevención de lesiones: La evaluación cognitiva es vital a nivel médico. Los jugadores con déficits cognitivos, específicamente en tiempos de reacción y memoria de trabajo, tienen un riesgo significativamente mayor de sufrir lesiones musculoesqueléticas (sobre todo en los isquiosurales), al no poder iniciar o frenar una carrera con la eficiencia neuro-motriz necesaria.
Procesamiento Perceptivo-Visual y Atención: El 80% (o entre 70-85%) de la información del entorno ingresa por el sistema visual, viajando al lóbulo occipital y luego a las áreas motoras para ejecutar un plan de acción.
El perfil debe medir la atención y concentración a través del modelo de los focos atencionales de Robert Nideffer (amplitud y dirección). Se evalúa si el jugador puede cambiar fluidamente de un foco amplio externo (leer los desmarques, rivales y el contexto táctico general) a un foco estrecho interno (gestión de la respiración o tensión muscular antes de cobrar un tiro libre o penal).
Los jugadores más habilidosos no tienen necesariamente mejor vista, sino un "software cognitivo" superior: saben dónde mirar, ignoran distractores (inhibición) y anticipan las trayectorias antes de que ocurra el estímulo.

--------------------------------------------------------------------------------
2. DIMENSIÓN EMOCIONAL: Neurobiología, Plasticidad y Autoconfianza
El dualismo cuerpo-mente está obsoleto; el cuerpo genera el sustrato de la conducta. Las emociones no son simples estados anímicos, sino respuestas biológicas de adaptación que alteran la fisiología y la tensión muscular.
Sistema Límbico y Marcadores Somáticos: La toma de decisiones bajo presión está intrínsecamente ligada al estado afectivo y al funcionamiento de la Corteza Orbitofrontal (COF) y la Amígdala. Según el modelo de Damasio, el cerebro utiliza "marcadores somáticos" para vincular experiencias pasadas (positivas o negativas) con estados fisiológicos, guiando instintivamente las decisiones futuras del futbolista.
Plasticidad Emocional: El alto rendimiento exige que el jugador pueda transitar por las cuatro emociones básicas sin quedar bloqueado (plasticidad conductual). El diagnóstico debe identificar cómo el jugador utiliza estas emociones:
Miedo: Es un recurso funcional que le permite al jugador analizar el entorno, prever riesgos (como posibles lesiones) y realizar un levantamiento rápido de las mejores opciones.
Rabia: Permite al jugador activar sinergias musculares y orientar sus recursos de energía para cumplir sus metas y ganar duelos.
Tristeza y Alegría: La tristeza conecta al jugador con lo que es significativo (ej. procesar una derrota), mientras que la alegría proporciona fluidez, relajación y cohesión. Si un jugador carece de esta plasticidad (ej. se queda "pegado" en la rabia o el miedo prolongado), su rendimiento y coordinación neuromuscular caen drásticamente.
Gestión de la Autoconfianza y Motivación: La motivación da la dirección e intensidad a las acciones. El perfil debe mapear si el jugador construye su autoconfianza desde: Su historia personal (recorrido, entorno), la dificultad de la tarea (retos complejos), o lo que se dice de él (prensa, redes sociales, familia).
Se diagnostica si el jugador se orienta a metas de resultado (ser titular, ser campeón: generan ilusión, pero no dependen 100% de él), metas de rendimiento (autoconocimiento y comparativa de estadísticas propias), o metas de proceso (dependen totalmente de su esfuerzo).

--------------------------------------------------------------------------------
3. DIMENSIÓN CONDUCTUAL - SOCIAL: Complejidad, Contexto y Etapas Vitales
El futbolista no compite en el vacío; es un ser biopsicosocial. Las dinámicas relacionales y el ambiente del club moldean la arquitectura de su sistema nervioso ("los entornos determinan un tipo de arquitectura por las perturbaciones que generan").
Estructura Socioafectiva: Siguiendo a Paco Seirulo, el entrenamiento y el éxito del jugador dependen de su estructura socioafectiva. Cada acción de juego está impregnada de un valor afectivo basado en cómo el jugador coopera, compite, acepta o rechaza a sus compañeros. El perfil conductual debe evaluar el nivel de empatía, el sentido de pertenencia y si "el talento personal está al servicio del grupo".
Efecto Pigmalión (Profecía Autocumplida): Un aspecto conductual crucial a evaluar es cómo la interacción con el cuerpo técnico afecta al jugador. Si un entrenador tiene un juicio previo negativo de un jugador, le ofrecerá peor comunicación, tareas menos exigentes y atención menos personal. Esta expectativa aumenta la probabilidad de que el jugador efectivamente fracase (y viceversa, si el juicio es positivo).
Desarrollo Acorde a la Etapa Evolutiva: El diagnóstico y las exigencias de intervención deben segmentarse según la etapa biopsicosocial del jugador:
Iniciación (5-8 años): Enfoque conductual en el disfrute, fluidez y apego al deporte. Se caracteriza por el egocentrismo y atención reducida.
Formación (8-11 años): Aumento de la empatía y la concentración. Es el momento ideal para introducir el entrenamiento mental de forma formal y conceptos de trabajo en equipo.
Especialización (12-17 años): Búsqueda de identidad propia, valores personales y cohesión de equipo. El jugador se prepara para el salto profesional.
Profesional (+18 años): El perfil debe ahondar fuertemente en el manejo de la presión externa, la interacción con la prensa, el manejo económico, la vida familiar y el profundo conocimiento de sí mismo.

CONCLUSIÓN PARA EL PERFIL PSICODEPORTOLÓGICO:
Con esta extensión teórica, el perfil psicodeportológico de un jugador queda sustentado en:
Su "Software" Cognitivo: Cuántos milisegundos tarda en procesar el 80% de la información visual del campo y su capacidad ejecutiva para frenar impulsos y tomar decisiones tácticas.
Su Motor Emocional: Qué nivel de plasticidad tiene su cuerpo para no quedar atrapado en el miedo o la rabia, y si su motivación recae en procesos internos controlables o en la validación externa.
Su Ecosistema Conductual: Cómo sus vínculos socioafectivos, la influencia del entrenador (profecía autocumplida) y su madurez biológica y social impactan su capacidad de cooperar bajo máxima presión dentro del campo.

ANALYSIS PROTOCOL:
1. Data Unification: Cruza obligatoriamente los datos de Intervalos (ePsD) con Reportes de Historial (PDF/HTML).
2. Pattern Recognition: Identifica causas neurofisiológicas de fatiga o bloqueo basándote en el Marco Teórico.
3. Pronóstico: Determinar el "Ready Score" basándote en la integración de las 3 dimensiones.

FORMATO DE SALIDA (JSON REQUERIDO):
{
  "readyScore": number (0-10),
  "resumen": string,
  "hallazgos": [{ "titulo": string, "descripcion": string, "impacto": "positivo" | "neutro" | "critico" }],
  "indicadores": { "foco": number, "resiliencia": number, "carga": number },
  "kpis_especificos": { "eficiencia_ms": string, "plasticidad_conductual": string, "congruencia_pct": string },
  "sugerencias": string[] 
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
                prompt: userPrompt,
                temperature: 0.2,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error en el servicio de análisis");
        }

        const content = await response.text();
        return JSON.parse(content);
        
    } catch (error) {
        console.error("Lab Service Error:", error);
        throw error;
    }
}
