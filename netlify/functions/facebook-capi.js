export const handler = async (event) => {
    // Solo permitir peticiones POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
        console.error("Faltan variables de entorno META_PIXEL_ID o META_ACCESS_TOKEN");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Configuracion incompleta en el servidor" }),
        };
    }

    try {
        const body = JSON.parse(event.body);
        
        // El cliente debe enviar el array de eventos en "data"
        const payload = {
            data: body.data || [],
            test_event_code: body.test_event_code // Útil para el administrador de eventos en tiempo real
        };

        const response = await fetch(`https://graph.facebook.com/v17.0/${pixelId}/events?access_token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        return {
            statusCode: response.ok ? 200 : response.status,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error("Error procesando Meta CAPI:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error interno procesando el evento" }),
        };
    }
};
