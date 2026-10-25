import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { socket } from "../lib/socket";

const AuthContext = createContext(null);
const SESSION_HINT_KEY = "trl-client-session";

export function AuthProvider({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(null);
  const checkedSession = useRef(false);

  const refresh = useCallback(async ({ force = false } = {}) => {
    if (inFlight.current && !force) return inFlight.current;

    inFlight.current = api
      .get("/auth/me")
      .then((response) => {
        const nextUser = response.data?.data?.user || null;
        setUser(nextUser);
        if (nextUser) localStorage.setItem(SESSION_HINT_KEY, "1");
        return nextUser;
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          setUser(null);
          localStorage.removeItem(SESSION_HINT_KEY);
          return null;
        }
        throw error;
      })
      .finally(() => {
        inFlight.current = null;
      });

    return inFlight.current;
  }, []);

  useEffect(() => {
    if (checkedSession.current) return;

    const isPortalRoute = location.pathname.startsWith("/portal");
    const isAuthSensitivePublicRoute = ["/", "/login", "/register"].includes(location.pathname);
    const hasSessionHint = localStorage.getItem(SESSION_HINT_KEY) === "1";

    // Portal and auth-sensitive public routes must verify the HTTP-only session
    // so redirects remain correct after a browser refresh. Other public pages
    // avoid creating an unnecessary /auth/me request for clearly anonymous users.
    if (!isPortalRoute && !isAuthSensitivePublicRoute && !hasSessionHint) {
      checkedSession.current = true;
      setLoading(false);
      return;
    }

    checkedSession.current = true;
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [location.pathname, refresh]);

  useEffect(() => {
    if (user && !socket.connected) socket.connect();
    if (!user && socket.connected) socket.disconnect();
  }, [user]);

  const login = async (values) => {
    const response = await api.post("/auth/login", values);
    const nextUser = response.data.data.user;
    setUser(nextUser);
    localStorage.setItem(SESSION_HINT_KEY, "1");
    checkedSession.current = true;
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      socket.disconnect();
      localStorage.removeItem(SESSION_HINT_KEY);
      setUser(null);
      checkedSession.current = true;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
