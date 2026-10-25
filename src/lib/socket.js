import { io } from 'socket.io-client'

// Local development connects through the Vite same-origin websocket proxy.
// Production can point directly to the deployed API with VITE_SOCKET_URL.
const socketUrl = import.meta.env.DEV
  ? undefined
  : (import.meta.env.VITE_SOCKET_URL || undefined)

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket'],
})
