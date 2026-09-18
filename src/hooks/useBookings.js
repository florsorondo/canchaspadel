import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../utils/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

export function useBookings(arenaId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!arenaId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(`${API_URL}/arena/${arenaId}/bookings`);
    
      if (!res.ok) {
        throw new Error("Error obteniendo reservas");
      }
      
      const data = await res.json();
      setBookings(data);
    } catch (err) {
        
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [arenaId]);

  const createBooking = async (bookingData) => {
    try {
      setCreating(true);
      setError(null);

      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error creando reserva");
      }

      await fetchBookings();

      return {
        success: true,
        booking: data,
      };
    } catch (err) {
      setError(err.message);

      return {
        success: false,
        error: err.message,
      };
    } finally {
      setCreating(false);
    }
  };

const changeStatus = async (bookingId, status) => {
  try {
    setCreating(true);
    setError(null);

    const res = await authFetch(`${API_URL}/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error actualizando estado");
    }

    await fetchBookings();

    return {
      success: true,
    };

  } catch (err) {
    console.error("Error cambiando estado:", err);

    setError(err.message);

    return {
      success: false,
      error: err.message,
    };
  } finally {
    setCreating(false);
  }
};

  const createManualBooking = async (arenaIdParam, bookingData) => {
    try {
      setCreating(true);
      setError(null);

      const res = await authFetch(
        `${API_URL}/arena/${arenaIdParam}/bookings/manual`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error creando reserva");
      }

      await fetchBookings();

      return { success: true, booking_id: data.booking_id, ref_id: data.ref_id };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  };

  const blockHours = async (arenaIdParam, blockData) => {
    try {
      setCreating(true);
      setError(null);

      const res = await authFetch(`${API_URL}/arena/${arenaIdParam}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error bloqueando horarios");
      }

      await fetchBookings();

      return { success: true, created: data.created, skipped: data.skipped };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      setCreating(true);
      setError(null);

      const res = await authFetch(`${API_URL}/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error eliminando reserva");
      }

      await fetchBookings();

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    creating,
    error,
    fetchBookings,
    createBooking,
    changeStatus,
    createManualBooking,
    blockHours,
    deleteBooking,
  };
}