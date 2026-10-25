import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';

const fallback = {
  phone: '',
  email: '',
  office: '',
  operatingHours: '',
};

const SiteSettingsContext = createContext({ settings: fallback, loading: true });

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const requestRef = useRef(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!requestRef.current) {
      requestRef.current = api.get('/settings/company-contact')
        .then((response) => {
          setSettings({ ...fallback, ...(response.data?.data || {}) });
        })
        .catch(() => {
          setSettings(fallback);
        })
        .finally(() => {
          requestRef.current = null;
          setLoading(false);
        });
    }
  }, []);

  const value = useMemo(() => ({ settings, loading }), [settings, loading]);
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
