import { useState } from "react";
import { useArena } from "../../hooks/useArena";
import { useCoupons } from "../../hooks/useCoupons";
import { Modal, PrimaryButton, SecondaryButton } from "./shared";
import Loader from "../Loader";

const emptyForm = {
  code: "",
  type: "percentage",
  value: "",
  valid_from: "",
  valid_to: "",
};

const Cupones = () => {
  const { arenaId, loadingArena } = useArena();
  const { coupons, loading, saving, createCoupon, toggleCoupon } =
    useCoupons(arenaId);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(emptyForm);

  if (loadingArena || loading) {
    return <Loader />;
  }

  const handleCrear = async (e) => {
    e.preventDefault();

    if (!form.code.trim() || !form.value) {
      alert("Completá el código y el valor del cupón");
      return;
    }

    const result = await createCoupon(form);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setForm(emptyForm);
    setModalAbierto(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#06122B]">Cupones</h2>
          <p className="text-[#6D7580] text-sm mt-1">
            Códigos de descuento para aplicar al reservar online.
          </p>
        </div>

        <SecondaryButton onClick={() => setModalAbierto(true)} className="w-full md:w-auto">
          + Nuevo cupón
        </SecondaryButton>
      </div>

      <div className="flex flex-col gap-3">
        {coupons.length > 0 ? (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white border border-[#D6D0C8] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="font-black text-[#06122B] tracking-[0.08em]">
                  {coupon.code}
                </p>
                <p className="text-[#6D7580] text-sm mt-1">
                  {coupon.type === "percentage"
                    ? `${coupon.value}% de descuento`
                    : `$${Number(coupon.value || 0).toLocaleString()} de descuento`}
                  {coupon.valid_from || coupon.valid_to
                    ? ` · Vigencia ${coupon.valid_from || "—"} a ${
                        coupon.valid_to || "—"
                      }`
                    : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.12em] ${
                    coupon.active
                      ? "bg-[#2f6f61]/15 text-[#2f6f61]"
                      : "bg-[#EFEAE0] text-[#6D7580]"
                  }`}
                >
                  {coupon.active ? "Activo" : "Inactivo"}
                </span>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => toggleCoupon(coupon.id, !coupon.active)}
                  className={`w-14 h-7 rounded-full p-1 transition ${
                    coupon.active ? "bg-[#06122B]" : "bg-[#D6D0C8]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition ${
                      coupon.active ? "ml-auto" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[#6D7580]">Todavía no creaste ningún cupón.</p>
        )}
      </div>

      {modalAbierto && (
        <Modal onClose={() => setModalAbierto(false)}>
          <h2 className="text-2xl font-black text-[#06122B] mb-5">
            Nuevo cupón
          </h2>

          <form onSubmit={handleCrear} className="grid gap-3">
            <input
              className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3 uppercase tracking-[0.08em]"
              placeholder="CÓDIGO"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />

            <select
              className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto fijo ($)</option>
            </select>

            <input
              type="number"
              className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
              placeholder={form.type === "percentage" ? "Ej: 10" : "Ej: 2000"}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <label>
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
                  Desde (opcional)
                </p>
                <input
                  type="date"
                  className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
                  value={form.valid_from}
                  onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                />
              </label>

              <label>
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
                  Hasta (opcional)
                </p>
                <input
                  type="date"
                  className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
                  value={form.valid_to}
                  onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-3">
              <SecondaryButton type="button" onClick={() => setModalAbierto(false)}>
                Cancelar
              </SecondaryButton>

              <PrimaryButton disabled={saving}>
                {saving ? "Guardando..." : "Crear cupón"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Cupones;
