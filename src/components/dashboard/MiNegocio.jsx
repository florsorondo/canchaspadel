import { useEffect, useState } from "react";
import { Input, PrimaryButton } from "./shared";
import { useArena } from "../../hooks/useArena";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";
import Loader from "../Loader";

const DIAS = [
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

const PAGOS_PREDETERMINADOS = [
  { name: "Efectivo", type: "efectivo" },
  { name: "Transferencia", type: "transferencia" },
  { name: "Mercado Pago", type: "mercado_pago" },
  { name: "Tarjeta de débito", type: "tarjeta_debito" },
  { name: "Tarjeta de crédito", type: "tarjeta_credito" },
];

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  opening_time: "",
  closing_time: "",
  description: "",
  deposit_amount: "",
  days_open: [],
};

const MiNegocio = () => {
  const { arena, arenaId, loadingArena, savingArena, updateArena } = useArena();

  const {
    paymentMethods,
    loading: loadingPagos,
    saving: savingPago,
    createPaymentMethod,
    togglePaymentMethod,
  } = usePaymentMethods(arenaId);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!arena) return;

    setForm({
      name: arena.name || "",
      phone: arena.phone || "",
      address: arena.address || "",
      opening_time: arena.opening_time || "",
      closing_time: arena.closing_time || "",
      description: arena.description || "",
      deposit_amount: arena.deposit_amount || "",
      days_open: arena.days_open || [],
    });
  }, [arena]);

  const setField = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const toggleDia = (dia) => {
    setForm({
      ...form,
      days_open: form.days_open.includes(dia)
        ? form.days_open.filter((d) => d !== dia)
        : [...form.days_open, dia],
    });
  };

  const handleGuardar = async () => {
    if (!Number(form.deposit_amount) || Number(form.deposit_amount) <= 0) {
      alert(
        "La seña es obligatoria para poder reservar online: ingresá un monto mayor a $0."
      );
      return;
    }

    const result = await updateArena({
      ...form,
      deposit_amount: Number(form.deposit_amount) || 0,
    });

    if (!result.success) {
      alert(result.error);
      return;
    }

    alert("Cambios guardados");
  };

  const handleTogglePago = async (pagoPredeterminado) => {
    const existente = paymentMethods.find(
      (p) => p.name === pagoPredeterminado.name
    );

    const result = existente
      ? await togglePaymentMethod(existente.id, !existente.available)
      : await createPaymentMethod({
          name: pagoPredeterminado.name,
          type: pagoPredeterminado.type,
        });

    if (!result.success) {
      alert(result.error);
    }
  };

  if (loadingArena) {
    return <Loader />;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre del complejo" value={form.name} onChange={setField("name")} />

        <Input
          label="WhatsApp de contacto"
          value={form.phone}
          onChange={setField("phone")}
        />

        <Input
          label="Dirección"
          value={form.address}
          onChange={setField("address")}
          full
        />

        <Input
          label="Apertura"
          value={form.opening_time}
          onChange={setField("opening_time")}
        />

        <Input
          label="Cierre"
          value={form.closing_time}
          onChange={setField("closing_time")}
        />

        <Input
          label="Descripción"
          value={form.description}
          onChange={setField("description")}
          full
        />

        <div className="col-span-2">
          <Input
            label="Monto de seña"
            value={form.deposit_amount}
            onChange={setField("deposit_amount")}
            type="number"
            required
            full
          />
          <p className="text-xs text-[#6D7580] mt-2">
            La seña se cobra siempre online (débito/crédito vía Mercado Pago) para
            confirmar la reserva; el saldo se paga en el club. Es obligatoria.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black text-[#06122B] mb-4">Días abiertos</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DIAS.map((dia) => (
            <label
              key={dia.value}
              className="border border-[#D6D0C8] rounded-sm px-4 py-3 flex items-center gap-2 text-[#06122B] font-semibold"
            >
              <input
                type="checkbox"
                checked={form.days_open.includes(dia.value)}
                onChange={() => toggleDia(dia.value)}
              />
              {dia.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black text-[#06122B] mb-1">
          Medios de pago aceptados
        </h3>
        <p className="text-[#6D7580] text-sm mb-4">
          Se muestran al cliente como opciones para pagar el saldo en el club.
        </p>

        <div className="flex flex-col gap-3">
          {loadingPagos ? (
            <p className="text-[#6D7580]">Cargando...</p>
          ) : (
            PAGOS_PREDETERMINADOS.map((pago) => {
              const existente = paymentMethods.find((p) => p.name === pago.name);
              const activo = existente ? existente.available : false;

              return (
                <div
                  key={pago.name}
                  className="border border-[#D6D0C8] rounded-sm px-4 py-4 flex items-center justify-between"
                >
                  <span className="text-[#06122B] font-semibold">{pago.name}</span>

                  <button
                    type="button"
                    disabled={savingPago}
                    onClick={() => handleTogglePago(pago)}
                    className={`w-14 h-7 rounded-full p-1 transition ${
                      activo ? "bg-[#06122B]" : "bg-[#D6D0C8]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition ${
                        activo ? "ml-auto" : ""
                      }`}
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <PrimaryButton
        onClick={handleGuardar}
        disabled={savingArena}
        className="w-full mt-8 py-4 text-[13px]"
      >
        {savingArena ? "Guardando..." : "✓ Guardar cambios"}
      </PrimaryButton>
    </div>
  );
};

export default MiNegocio;
