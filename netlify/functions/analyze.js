// netlify/functions/analyze.js
// Proxy para APIs de IA (Anthropic y Groq) optimizado para datos directos de Firebase.

const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { systemPrompt, userPrompt, prompt, model, temperature, response_format } = body;

    if (!model) {
      return { statusCode: 400, body: JSON.stringify({ error: "El modelo es requerido" }) };
    }

    let clientResponse;
    const isClaude = model.toLowerCase().includes("claude") || model.toLowerCase().includes("sonnet") || model.toLowerCase().includes("haiku");

    if (isClaude) {
      if (!process.env.ANTHROPIC_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY no configurada" }) };
      }

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Mapeo de modelos estable (Contexto 2026)
      let finalModel = "claude-3-5-sonnet-20241022"; // Modelo Maestro (Sonnet 3.5 v2)
      
      // Mapeo dinámico según solicitud
      if (model.includes("haiku")) {
        // Claude 4.5 Haiku: Máxima velocidad y eficiencia (Rel. Oct 2025)
        finalModel = "claude-haiku-4-5-20251001";
      } else if (model.includes("haiku-original")) {
        finalModel = "claude-3-haiku-20240307";
      } else if (model.includes("3.7") || model.includes("latest")) {
        finalModel = "claude-3-7-sonnet-20250219";
      }

      const msg = await anthropic.messages.create({
        model: finalModel,
        max_tokens: body.max_tokens || 4000,
        system: systemPrompt,
        messages: [{ 
            role: "user", 
            content: (userPrompt || prompt) + "\n\nIMPORTANT: Respond with raw JSON only. No markdown fences. Just the JSON object."
        }],
        temperature: temperature || 0.2
      });

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          choices: [{ 
            message: { content: msg.content[0].text } 
          }],
          model_used: finalModel
        })
      };

    } else {
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      if (!GROQ_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: "GROQ_API_KEY no configurada" }) };
      }
      const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
      const groqResponse = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "llama-3.3-70b-versatile",
          messages: systemPrompt ? [{role:"system", content:systemPrompt}, {role:"user", content:userPrompt||prompt}] : [{role:"user", content:userPrompt||prompt}],
          temperature: temperature !== undefined ? temperature : 0.2,
          max_tokens: body.max_tokens || 4000,
          response_format: response_format || { type: "json_object" }
        })
      });

      const groqData = await groqResponse.json();

      if (!groqResponse.ok) {
        return {
          statusCode: groqResponse.status,
          body: JSON.stringify({ error: groqData.error?.message || groqData.error || "Error en Groq API" })
        };
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choices: [{ message: { content: groqData.choices?.[0]?.message?.content } }] })
      };
    }

  } catch (error) {
    console.error("Error en analyze function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
