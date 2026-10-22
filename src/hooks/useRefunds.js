import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

// Devoluciones pendientes del complejo (solo las ve el dueño)
export function useRefunds(arenaId, enabled = true) {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchRefunds = useCallback(async () => {
    if (!arenaId || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(`${API_URL}/arena/${arenaId}/refunds`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo devoluciones");
      }

      setRefunds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [arenaId, enabled]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const markRefunded = async (refund) => {
    try {
      setSaving(true);

      const res = await authFetch(
        `${API_URL}/arena/${arenaId}/refunds/${refund.kind}/${refund.id}/done`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error registrando la devolución");
      }

      await fetchRefunds();

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  return { refunds, loading, saving, error, fetchRefunds, markRefunded };
}
