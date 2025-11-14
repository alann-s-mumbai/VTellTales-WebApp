// API Configuration
// In production, use relative URLs so requests go through Nginx proxy
// In development, Vite proxy handles the routing
export const API_BASE_URL = import.meta.env.DEV ? '' : ''

// Helper function to build API URLs
export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}
