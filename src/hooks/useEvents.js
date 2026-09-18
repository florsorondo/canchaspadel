import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

export function useEvents(arenaId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!arenaId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/arena/${arenaId}/events`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo eventos");
      }

      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [arenaId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async ({ court_id, title, date, time, spots, price }) => {
    if (!arenaId) {
      return { success: false, error: "No se encontró la arena" };
    }

    try {
      setCreating(true);
      setError(null);

      const res = await authFetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arena_id: arenaId,
          court_id,
          title,
          date,
          time,
          spots,
          price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error creando evento");
      }

      await fetchEvents();

      return { success: true, event_id: data.event_id };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  };

  const fetchRegistrations = async (eventId) => {
    try {
      const res = await authFetch(`${API_URL}/events/${eventId}/registrations`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo anotados");
      }

      return { success: true, registrations: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const cancelEvent = async (eventId) => {
    try {
      const res = await authFetch(`${API_URL}/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error cancelando evento");
      }

      await fetchEvents();

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    events,
    loading,
    creating,
    error,
    fetchEvents,
    createEvent,
    fetchRegistrations,
    cancelEvent,
  };
}
