import { resolveApiOrigin, resolveSocketOrigin } from './urlConfig';

// VITE_API_URL may be either https://host/api or https://host.
// All callers already provide paths beginning with /api.
export const API_ORIGIN = resolveApiOrigin(
  import.meta.env.VITE_API_URL,
  import.meta.env.VITE_API_BASE_URL,
  window.location.origin,
);

// Socket.IO connects to the origin, not /api.
export const SOCKET_ORIGIN = resolveSocketOrigin(
  import.meta.env.VITE_SOCKET_URL,
  API_ORIGIN,
);
