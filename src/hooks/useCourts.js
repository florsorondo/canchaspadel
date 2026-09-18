import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

export function useCourts(arenaId) {
  const [courts, setCourts] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [creatingCourt, setCreatingCourt] = useState(false);
  const [errorCourts, setErrorCourts] = useState(null);

  const fetchCourts = useCallback(async () => {
    if (!arenaId) return;

    try {
      setLoadingCourts(true);
      setErrorCourts(null);

      const url = `${API_URL}/arena/${arenaId}/courts`;
      console.log("URL COURTS:", url);

      const res = await fetch(url);

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.log("Respuesta no JSON:", text);
        throw new Error("La API no devolvió JSON. Revisá VITE_API_BASE.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo canchas");
      }

      setCourts(data);
    } catch (error) {
      console.error("Error obteniendo canchas:", error);
      setErrorCourts(error.message);
    } finally {
      setLoadingCourts(false);
    }
  }, [arenaId]);

  const createCourt = async ({
    name,
    description = "",
    available_days,
    available_hours,
    price = 0,
    image_url = "",
  }) => {
    if (!arenaId) {
      return {
        success: false,
        error: "No se encontró la arena",
      };
    }

    try {
      setCreatingCourt(true);
      setErrorCourts(null);

      const res = await authFetch(`${API_URL}/courts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          arena_id: arenaId,
          name,
          description,
          available_days,
          available_hours,
          price,
          image_url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error creando cancha");
      }

      await fetchCourts();

      return {
        success: true,
        court_id: data.court_id,
      };
    } catch (error) {
      console.error("Error creando cancha:", error);
      setErrorCourts(error.message);

      return {
        success: false,
        error: error.message,
      };
    } finally {
      setCreatingCourt(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const updateCourt = async (courtId, courtData) => {
  try {
    setCreatingCourt(true);
    setErrorCourts(null);

    const res = await authFetch(`${API_URL}/courts/${courtId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courtData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error actualizando cancha");
    }

    await fetchCourts();

    return { success: true };
  } catch (error) {
    setErrorCourts(error.message);
    return { success: false, error: error.message };
  } finally {
    setCreatingCourt(false);
  }
};

const deleteCourt = async (courtId) => {
  try {
    setCreatingCourt(true);
    setErrorCourts(null);

    const res = await authFetch(`${API_URL}/courts/${courtId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error eliminando cancha");
    }

    await fetchCourts();

    return { success: true };
  } catch (error) {
    setErrorCourts(error.message);
    return { success: false, error: error.message };
  } finally {
    setCreatingCourt(false);
  }
};
  return {
    courts,
    loadingCourts,
    creatingCourt,
    errorCourts,
    fetchCourts,
    createCourt,
    updateCourt,
    deleteCourt
  };
}