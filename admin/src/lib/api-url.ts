export function getApiUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Fallback if environment variable is missing in production deployment
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://uithings-backend.vercel.app/api'
  }

  return 'http://localhost:5000/api'
}

export const API_URL = getApiUrl()
