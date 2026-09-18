import { useCallback, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { authFetch } from "../utils/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

export function useArena() {
  const [arena, setArena] = useState(null);
  const [arenaId, setArenaId] = useState(null);
  const [loadingArena, setLoadingArena] = useState(true);
  const [savingArena, setSavingArena] = useState(false);
  const [errorArena, setErrorArena] = useState(null);

  const fetchArena = useCallback(async () => {
    try {
      setLoadingArena(true);
      setErrorArena(null);

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setErrorArena("Usuario no autenticado");
        return;
      }

      const res = await authFetch(`${API_URL}/my-arena/${user.uid}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo arena");
      }

      setArena(data);
      setArenaId(data.id);
    } catch (error) {
      console.error("Error obteniendo arena:", error);
      setErrorArena(error.message);
    } finally {
      setLoadingArena(false);
    }
  }, []);

  useEffect(() => {
    fetchArena();
  }, [fetchArena]);

  const updateArena = async (payload) => {
    if (!arenaId) {
      return { success: false, error: "No se encontró la arena" };
    }

    try {
      setSavingArena(true);
      setErrorArena(null);

      const res = await authFetch(`${API_URL}/arena/${arenaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error actualizando arena");
      }

      await fetchArena();

      return { success: true };
    } catch (error) {
      setErrorArena(error.message);
      return { success: false, error: error.message };
    } finally {
      setSavingArena(false);
    }
  };

  return {
    arena,
    arenaId,
    loadingArena,
    savingArena,
    errorArena,
    fetchArena,
    updateArena,
  };
}