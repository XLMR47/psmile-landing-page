// ================================================================
// CONFIGURACIÓN DE ACADEMIAS Y ROLES
// ================================================================
// Para agregar una nueva academia:
// 1. Crea el usuario en Firebase Auth (correo + contraseña)
// 2. Agrega una línea aquí con su email y academiaId
// ================================================================

export const ACADEMY_CONFIG = {
    // Super Admin (ve TODOS los jugadores de TODAS las academias)
    'psmile@psmile.cl': {
        role: 'admin',
        academiaId: null, // null = ve todo
        academiaName: 'PSMILE Administración',
    },

    // DT de Academia Bewe
    'bewe@psmile.cl': {
        role: 'admin',
        academiaId: 'bewe',
        academiaName: 'Academia Bewe',
    },

    // DT de Neurosport
    'neurosport@psmile.cl': {
        role: 'admin',
        academiaId: 'neurosport',
        academiaName: 'Neurosport',
    },
};

// Lista de academias disponibles para el formulario del admin
export const ACADEMIAS = [
    { id: 'bewe', nombre: 'Academia Bewe' },
    { id: 'neurosport', nombre: 'Neurosport' },
];

// Helper: obtener config del usuario actual
export function getUserConfig(email) {
    return ACADEMY_CONFIG[email] || { role: 'viewer', academiaId: null, academiaName: 'Sin academia' };
}
