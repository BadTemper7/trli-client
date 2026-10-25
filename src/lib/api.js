import axios from 'axios'

// In local Vite development, always call the same-origin /api path.
// Vite proxies it to the configured Hostinger backend so the HTTP-only
// authentication cookie remains first-party to localhost during development.
// Production still uses VITE_API_BASE_URL when provided.
const baseURL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api')

export const api = axios.create({
  baseURL,
  withCredentials: true,
})
