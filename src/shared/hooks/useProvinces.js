import { useState, useEffect } from 'react';

const PROVINCES_API = import.meta.env.VITE_PROVINCES_API_URL;

export const formatProvinceName = (name) => {
  return name
    .replace(/^Tỉnh\s+/i, '')
    .replace(/^Thành phố\s+/i, '')
    .replace(/^Thị xã\s+/i, '')
    .trim();
};

export const useProvinces = () => {
  const [provinces, setProvinces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetch(`${PROVINCES_API}/p/`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        const formatted = Array.isArray(data)
          ? data.map((p) => ({ ...p, name: formatProvinceName(p.name) }))
          : [];
        setProvinces(formatted);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
        setProvinces([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { provinces, isLoading, error };
};
