const admin = require('firebase-admin');

// Note: This requires a service account. Since I'm on the user's system, 
// I'll try to use the Firebase CLI or just inspect the code again.
// Alternatively, I can just improve the regex matching in the code to be more inclusive.

/*
Looking at the code:
if(k.includes('EMOCIONAL') || k.includes('Gestión') || k.includes('Autodiálogo') || k.includes('Autoconfianza'))

Maybe it's "GESTION" (no accent) or "EMOTIONAL" or "Autoconfianza" with different casing.
*/
