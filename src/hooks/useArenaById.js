import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export function useArenaById(arenaId) {
  const [arena, setArena] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArena = useCallback(async () => {
    if (!arenaId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/arena/${arenaId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo arena");
      }

      setArena(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [arenaId]);

  useEffect(() => {
    fetchArena();
  }, [fetchArena]);

  return { arena, loading, error, fetchArena };
}
