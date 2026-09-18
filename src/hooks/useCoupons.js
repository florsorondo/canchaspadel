import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

export function useCoupons(arenaId) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoupons = useCallback(async () => {
    if (!arenaId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(`${API_URL}/arena/${arenaId}/coupons?all=true`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo cupones");
      }

      setCoupons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [arenaId]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const createCoupon = async ({ code, type, value, valid_from, valid_to }) => {
    if (!arenaId) {
      return { success: false, error: "No se encontró la arena" };
    }

    try {
      setSaving(true);
      setError(null);

      const res = await authFetch(`${API_URL}/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arena_id: arenaId,
          code,
          type,
          value,
          valid_from: valid_from || null,
          valid_to: valid_to || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error creando cupón");
      }

      await fetchCoupons();

      return { success: true, coupon_id: data.coupon_id };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (couponId, active) => {
    try {
      setSaving(true);
      setError(null);

      const res = await authFetch(`${API_URL}/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error actualizando cupón");
      }

      await fetchCoupons();

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  return {
    coupons,
    loading,
    saving,
    error,
    fetchCoupons,
    createCoupon,
    toggleCoupon,
  };
}
