/**
 * Sistema de Tracking Duplicado (Pixel + Conversions API)
 */
export const trackEvent = async (eventName, customData = {}, userData = {}) => {
    // 1. Browser Tracking (Standard Pixel)
    if (window.fbq) {
        window.fbq('track', eventName, customData);
    }

    // 2. Server Tracking (Conversions API via Netlify Function)
    try {
        const payload = {
            data: [
                {
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: "website",
                    event_source_url: window.location.href,
                    client_user_agent: navigator.userAgent,
                    user_data: {
                        em: userData.email ? [userData.email] : [], // Meta recomienda Hasheado (SHA256)
                        ph: userData.phone ? [userData.phone] : [],
                        fbc: getCookie('_fbc'),
                        fbp: getCookie('_fbp'),
                    },
                    custom_data: customData,
                }
            ],
            // test_event_code: "TEST12345" // Descomentar para pruebas en tiempo real
        };

        await fetch("/.netlify/functions/facebook-capi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.error("Error en Tracking CAPI:", error);
    }
};

// Helper para cookies de Facebook
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
