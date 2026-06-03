// Central API base URL — reads from Vite environment variable at build time.
// In development: defaults to http://localhost:5000
// In production: set VITE_API_URL in your hosting provider's environment config.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
