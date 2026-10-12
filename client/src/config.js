// Central configuration for API endpoint and WebSocket connectivity
// On localhost: empty string uses Vite dev proxy
// On Vercel: can be set via VITE_API_URL environment variable to point to Render backend
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
