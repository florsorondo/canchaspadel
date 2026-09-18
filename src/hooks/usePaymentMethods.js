import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

export function usePaymentMethods(arenaId) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentMethods = useCallback(async () => {
    if (!arenaId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/arena/${arenaId}/payment-methods?all=true`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo medios de pago");
      }

      setPaymentMethods(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [arenaId]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const createPaymentMethod = async ({ name, type, alias = "", requires_deposit = false }) => {
    if (!arenaId) {
      return { success: false, error: "No se encontró la arena" };
    }

    try {
      setSaving(true);
      setError(null);

      const res = await authFetch(`${API_URL}/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arena_id: arenaId, name, type, alias, requires_deposit }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error creando medio de pago");
      }

      await fetchPaymentMethods();

      return { success: true, payment_method_id: data.payment_method_id };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const togglePaymentMethod = async (paymentMethodId, available) => {
    try {
      setSaving(true);
      setError(null);

      const res = await authFetch(`${API_URL}/payment-methods/${paymentMethodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error actualizando medio de pago");
      }

      await fetchPaymentMethods();

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  return {
    paymentMethods,
    loading,
    saving,
    error,
    fetchPaymentMethods,
    createPaymentMethod,
    togglePaymentMethod,
  };
}
