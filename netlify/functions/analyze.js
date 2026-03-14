const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "GROQ_API_KEY no configurada en el servidor." }) 
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { prompt, model = "llama-3.3-70b-versatile", messages, systemPrompt } = body;

    // Construir los mensajes para Groq
    let finalMessages = [];
    if (systemPrompt) {
        finalMessages.push({ role: "system", content: systemPrompt });
    }
    if (messages) {
        finalMessages = [...finalMessages, ...messages];
    } else if (prompt) {
        finalMessages.push({ role: "user", content: prompt });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        temperature: body.temperature || 0.5,
        response_format: body.response_format || { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorData.error?.message || "Error en Groq API" })
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: data.choices[0].message.content
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
