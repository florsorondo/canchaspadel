import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export function useCourtAvailability(courtId, date) {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailability = useCallback(async () => {
    if (!courtId || !date) {
      setHours([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_URL}/courts/${courtId}/availability?date=${date}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo disponibilidad");
      }

      setHours(data.hours || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courtId, date]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return { hours, loading, error, fetchAvailability };
}
