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

    // --- CASE 2: Groq AI Analysis ---
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "GROQ_API_KEY no configurada en el servidor de Netlify." }) 
      };
    }

    // Support both 'userPrompt' and 'prompt' for backward compatibility
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    if (userPrompt || prompt) messages.push({ role: "user", content: userPrompt || prompt });

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: messages,
        temperature: temperature !== undefined ? temperature : 0.2,
        response_format: response_format || { type: "json_object" }
      })
    });

    const data = await groqResponse.json();
    
    if (!groqResponse.ok) {
        return {
            statusCode: groqResponse.status,
            body: JSON.stringify({ error: data.error?.message || "Error en Groq API" })
        };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
