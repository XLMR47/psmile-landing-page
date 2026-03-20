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

    let apiUrl, headers, payload;
    const isClaude = model.toLowerCase().includes("claude") || model.toLowerCase().includes("sonnet") || model.toLowerCase().includes("haiku");

    if (isClaude) {
      let finalModel = "claude-3-5-sonnet-20241022"; // Default
      
      if (model.includes("haiku")) {
        finalModel = "claude-3-5-haiku-20241022";
      } else if (model.includes("sonnet") && (model.includes("4.5") || model.includes("4") || model.includes("3.7"))) {
        finalModel = "claude-3-7-sonnet-20250219"; 
      }

      apiUrl = "https://api.anthropic.com/v1/messages";
      headers = {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      };
      payload = {
        model: finalModel,
        max_tokens: body.max_tokens || 4000,
        system: systemPrompt,
        messages: [{ 
            role: "user", 
            content: (userPrompt || prompt) + "\n\nIMPORTANT: Respond with raw JSON only. No markdown fences. Just the JSON object."
        }]
      };
    } else {
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      if (!GROQ_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: "GROQ_API_KEY no configurada" }) };
      }
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
      headers = {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      };
      payload = {
        model: model || "llama-3.3-70b-versatile",
        messages: systemPrompt ? [{role:"system", content:systemPrompt}, {role:"user", content:userPrompt||prompt}] : [{role:"user", content:userPrompt||prompt}],
        temperature: temperature !== undefined ? temperature : 0.2,
        max_tokens: body.max_tokens || 4000,
        response_format: response_format || { type: "json_object" }
      };
    }

    const aiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return {
        statusCode: aiResponse.status,
        body: JSON.stringify({ error: data.error?.message || data.error || "Error en AI API" })
      };
    }

    let content;
    if (isClaude) {
      content = data.content?.[0]?.text;
    } else {
      content = data.choices?.[0]?.message?.content;
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choices: [{ message: { content } }] })
    };

  } catch (error) {
    console.error("Error en analyze function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
