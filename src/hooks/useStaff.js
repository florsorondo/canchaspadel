import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

export function useStaff(arenaId) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchStaff = useCallback(async () => {
    if (!arenaId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(`${API_URL}/arena/${arenaId}/staff`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error obteniendo el equipo");
      }

      setStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [arenaId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const createStaff = async ({ name, email, password }) => {
    try {
      setSaving(true);
      setError(null);

      const res = await authFetch(`${API_URL}/arena/${arenaId}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error creando el empleado");
      }

      await fetchStaff();

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const deleteStaff = async (staffId) => {
    try {
      setSaving(true);
      setError(null);

      const res = await authFetch(`${API_URL}/arena/${arenaId}/staff/${staffId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error eliminando el empleado");
      }

      await fetchStaff();

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  return { staff, loading, saving, error, fetchStaff, createStaff, deleteStaff };
}
