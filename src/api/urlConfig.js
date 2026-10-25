/** Normalize API and Socket.IO origins without duplicating the /api path. */
export function resolveApiOrigin(apiUrl, legacyApiUrl, fallbackOrigin = '') {
  const value = String(apiUrl || legacyApiUrl || fallbackOrigin).trim().replace(/\/+$/, '');
  return value.replace(/\/api$/i, '');
}

export function resolveSocketOrigin(socketUrl, apiOrigin) {
  return String(socketUrl || apiOrigin).trim().replace(/\/+$/, '').replace(/\/api$/i, '');
}
