// Central configuration for API endpoint and WebSocket connectivity
// Automatically connects to the live Render cloud backend on Vercel deployments
export const RENDER_CLOUD_URL = 'https://on-road-emergency-support-system.onrender.com';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? RENDER_CLOUD_URL 
    : '')
).replace(/\/+$/, '');
