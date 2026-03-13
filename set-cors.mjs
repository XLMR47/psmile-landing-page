import { Storage } from '@google-cloud/storage';

// Configuración del script
const bucketName = 'psmile2026.firebasestorage.app';
const origin = 'http://localhost:5173';

const storage = new Storage({
  projectId: 'psmile2026',
});

async function setCors() {
  console.log(`🚀 Iniciando configuración de CORS para el bucket: ${bucketName}...`);
  
  try {
    await storage.bucket(bucketName).setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
        origin: [origin],
        responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
      },
    ]);

    console.log('✅ Configuración de CORS actualizada exitosamente.');
    console.log(`🌐 Origen permitido: ${origin}`);
  } catch (error) {
    console.error('❌ Error al actualizar CORS:', error.message);
    console.log('\n--- AYUDA ---');
    console.log('1. Asegúrate de haber iniciado sesión con: gcloud auth application-default login');
    console.log('2. O usa la consola de Google Cloud si prefieres el método manual.');
  }
}

setCors();
