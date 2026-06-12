// Central API base URL — reads from Vite environment variable at build time.
// In development: dynamically resolves to local IP if accessed via LAN, else localhost:5000
// In production: set VITE_API_URL in your hosting provider's environment config.

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessed via local network IP (e.g. 192.168.x.x), use that IP with port 5000
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `https://${hostname}:5001`;
    }
  }
  
  return 'http://localhost:5001';
};

const API_BASE_URL = getBaseUrl();

export default API_BASE_URL;
