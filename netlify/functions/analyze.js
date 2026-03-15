// netlify/functions/analyze.js
// Netlify Function to proxy Groq API calls and fetch HTML content without CORS issues.

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { systemPrompt, userPrompt, prompt, model, fetchUrl, temperature, response_format } = body;

    // --- CASE 1: Fetch HTML Content (CORS Proxy) ---
    if (body.fetchUrl) {
      try {
        const response = await fetch(body.fetchUrl);
        let html = await response.text();
        
        html = html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ htmlContent: html })
        };
      } catch (e) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Error al leer documento remoto: " + e.message })
        };
      }
    }

    // --- CASE 2: AI Analysis ---
    let apiUrl, headers, payload;

    if (model?.startsWith("claude")) {
      apiUrl = "https://api.anthropic.com/v1/messages";
      headers = {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      };
      payload = {
        model: "claude-sonnet-4-20250514",
        max_tokens: body.max_tokens || 4000,
        system: systemPrompt,
        messages: [{ 
            role: "user", 
            content: (userPrompt || prompt) + "\n\nIMPORTANT: Respond with raw JSON only. No markdown, no ```json fences, no explanation. Just the JSON object."
        }]
      };
    } else {
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      if (!GROQ_API_KEY) {
        return { 
          statusCode: 500, 
          body: JSON.stringify({ error: "GROQ_API_KEY no configurada en el servidor." }) 
        };
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
        max_tokens: body.max_tokens,
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
    if (model?.startsWith("claude")) {
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
