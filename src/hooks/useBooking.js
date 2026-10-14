import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const TERMINAL_STATUSES = ["paid", "deposit_paid", "completed", "cancelled"];
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

export function useBooking(bookingId) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState(null);

  const startedAtRef = useRef(Date.now());

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return null;
    }

    try {
      setError(null);

      const res = await fetch(`${API_URL}/bookings/${bookingId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo la reserva");
      }

      setBooking(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) return;

    startedAtRef.current = Date.now();
    setTimedOut(false);

    let cancelled = false;
    let intervalId = null;

    const tick = async () => {
      const data = await fetchBooking();

      if (cancelled) return;

      if (data && TERMINAL_STATUSES.includes(data.status)) {
        clearInterval(intervalId);
        return;
      }

      if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
        clearInterval(intervalId);
        setTimedOut(true);
      }
    };

    tick();
    intervalId = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [bookingId, fetchBooking]);

  const cancelBooking = async () => {
    if (!bookingId) return { success: false, error: "Reserva no encontrada" };

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "No se pudo cancelar la reserva");
      }

      await fetchBooking();

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { booking, loading, error, timedOut, fetchBooking, cancelBooking };
}
