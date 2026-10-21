import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export function useEvent(eventId) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/events/${eventId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo evento");
      }

      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const register = async ({ name, last_name, email, phone }) => {
    try {
      setRegistering(true);
      setError(null);

      const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, last_name, email, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error registrando jugador");
      }

      // Si hay seña, el backend devuelve el link de pago de Mercado Pago
      if (data.init_point) {
        return { success: true, initPoint: data.init_point };
      }

      await fetchEvent();

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setRegistering(false);
    }
  };

  return {
    event,
    spotsLeft: event?.spots_left ?? 0,
    loading,
    registering,
    error,
    fetchEvent,
    register,
  };
}
