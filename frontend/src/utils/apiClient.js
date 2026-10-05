/**
 * apiClient — Wrapper global de fetch con manejo automático de autenticación.
 * 
 * - Inyecta automáticamente el token JWT en cada petición.
 * - Si el servidor responde con TOKEN_EXPIRED, cierra sesión y redirige al login.
 * - Centraliza la URL base de la API.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // Si el token expiró, cerrar sesión automáticamente
  if (response.status === 401) {
    try {
      const errorData = await response.clone().json();
      if (errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'TOKEN_INVALID') {
        localStorage.removeItem('token');
        // Disparar evento personalizado para que App.jsx reaccione
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
    } catch (e) {
      // Si no se puede parsear el JSON, igualmente cerramos sesión
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
  }

  return response;
}
