import { io } from 'socket.io-client'

// Local development connects through the Vite same-origin websocket proxy.
// Production can point directly to the deployed API with VITE_SOCKET_URL.
// If production API is on another hostname, use that host for Socket.IO too.
// The /api suffix is HTTP-only; Socket.IO uses /socket.io on the same origin.
const socketUrl = import.meta.env.DEV ? undefined : (
  import.meta.env.VITE_SOCKET_URL ||
  (/^https?:\/\//i.test(import.meta.env.VITE_API_BASE_URL || '')
    ? new URL(import.meta.env.VITE_API_BASE_URL).origin : undefined)
)

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  tryAllTransports: true,
  reconnection: true,
})
