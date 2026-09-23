export function getApiUrl(): string {
  // If running in browser and NOT on localhost/127.0.0.1
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    // If VITE_API_URL is set and points to an actual remote URL (not localhost), use it
    if (
      import.meta.env.VITE_API_URL &&
      !import.meta.env.VITE_API_URL.includes('localhost') &&
      !import.meta.env.VITE_API_URL.includes('127.0.0.1')
    ) {
      return import.meta.env.VITE_API_URL
    }

    return 'https://uithings-backend.vercel.app/api'
  }

  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
}

export const API_URL = getApiUrl()
