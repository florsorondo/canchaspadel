import { useMemo, useState } from "react";
import { useArena } from "../../hooks/useArena";
import { useBookings } from "../../hooks/useBookings";
import { getCourtNameById } from "../../utils/courts";
import { useCourts } from "../../hooks/useCourts";
import { Modal, PrimaryButton, SecondaryButton } from "./shared";
import { ASSIGNABLE_STATUSES, STATUS_LABELS, STATUS_STYLES } from "../../utils/bookingStatus";
import Loader from "../Loader";
import LinkReservas from "./LinkReservas";
import { linkWhatsApp, mensajeReserva } from "../../utils/whatsapp";

const PAGOS_MANUAL = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta_debito", label: "Tarjeta de débito" },
  { value: "tarjeta_credito", label: "Tarjeta de crédito" },
  { value: "mercado_pago", label: "Mercado Pago" },
];

// Fecha local (no UTC: después de las 21 hs en Argentina UTC ya es el día siguiente)
const hoyISO = () => new Date().toLocaleDateString("en-CA");

const Reservas = () => {
  const { arenaId, loadingArena } = useArena();

  const {
    bookings,
    loading,
    error,
    fetchBookings,
    changeStatus,
    createManualBooking,
    blockHours,
    deleteBooking,
  } = useBookings(arenaId);

  const { courts, loadingCourts } = useCourts(arenaId);

  const [filtro, setFiltro] = useState("hoy");
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [detalle, setDetalle] = useState(null);
  const [modalNueva, setModalNueva] = useState(false);
  const [modalBloqueo, setModalBloqueo] = useState(false);

  const bookingsFiltrados = useMemo(() => {
    const hoy = hoyISO();

    return bookings
      .filter((b) => {
        if (filtro === "hoy") return b.date === hoy;
        if (filtro === "proximas") return b.date > hoy;
        return b.date < hoy;
      })
      .filter((b) => (estadoFiltro === "todos" ? true : b.status === estadoFiltro))
      .filter((b) => {
        if (!busqueda.trim()) return true;
        const q = busqueda.trim().toLowerCase();
        return (
          (b.customer_name || "").toLowerCase().includes(q) ||
          (b.customer_phone || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  }, [bookings, filtro, estadoFiltro, busqueda]);

  if (loadingArena || loading || loadingCourts) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-500">{error}</p>
        <SecondaryButton onClick={fetchBookings} className="mt-4">
          Reintentar
        </SecondaryButton>
      </div>
    );
  }

  const cambiarEstado = async (bookingId, status) => {
    const result = await changeStatus(bookingId, status);

    if (!result.success) {
      alert(result.error);
    }
  };

  const handleQuitarBloqueo = async (bookingId) => {
    if (!confirm("¿Liberar este horario para que se pueda volver a reservar?")) return;

    const result = await deleteBooking(bookingId);

    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#06122B]">Reservas</h2>
          <p className="text-[#6D7580] text-sm mt-1">
            Gestioná las reservas online, cargá turnos manuales y bloqueá horarios.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <SecondaryButton onClick={() => setModalBloqueo(true)} className="w-full sm:w-auto">
            Bloquear horarios
          </SecondaryButton>

          <SecondaryButton onClick={() => setModalNueva(true)} className="w-full sm:w-auto">
            + Nueva reserva
          </SecondaryButton>
        </div>
      </div>

      <LinkReservas arenaId={arenaId} />

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: "hoy", label: "Hoy" },
          { value: "proximas", label: "Próximas" },
          { value: "historial", label: "Historial" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.1em] border transition ${
              filtro === f.value
                ? "bg-[#06122B] text-white border-[#06122B]"
                : "bg-white text-[#6D7580] border-[#D6D0C8] hover:border-[#06122B]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o teléfono"
          className="w-full sm:max-w-xs border border-[#D6D0C8] bg-white rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[#06122B]"
        />

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="border border-[#D6D0C8] bg-white rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[#06122B]"
        >
          <option value="todos">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border border-[#D6D0C8] rounded-lg bg-white">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="text-[#6D7580] text-xs uppercase tracking-[0.1em] border-b border-[#D6D0C8]">
              <th className="py-3 px-4">#</th>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Cancha</th>
              <th>Día</th>
              <th>Horario</th>
              <th>Pago</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {bookingsFiltrados.length > 0 ? (
              bookingsFiltrados.map((booking, index) => (
                <ReservaRow
                  key={booking.id}
                  reserva={booking}
                  index={index}
                  courts={courts}
                  changeStatus={cambiarEstado}
                  onVerDetalle={() => setDetalle(booking)}
                  onQuitarBloqueo={() => handleQuitarBloqueo(booking.id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-[#6D7580]">
                  No hay reservas para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detalle && (
        <BookingDetailModal
          reserva={bookings.find((b) => b.id === detalle.id) || detalle}
          courts={courts}
          changeStatus={cambiarEstado}
          onEliminar={async () => {
            const result = await deleteBooking(detalle.id);

            if (!result.success) {
              alert(result.error);
              return;
            }

            setDetalle(null);
          }}
          onClose={() => setDetalle(null)}
        />
      )}

      {modalNueva && (
        <ModalNuevaReserva
          arenaId={arenaId}
          courts={courts}
          createManualBooking={createManualBooking}
          onClose={() => setModalNueva(false)}
        />
      )}

      {modalBloqueo && (
        <ModalBloquearHorarios
          arenaId={arenaId}
          courts={courts}
          blockHours={blockHours}
          onClose={() => setModalBloqueo(false)}
        />
      )}
    </div>
  );
};

const ReservaRow = ({ reserva, index, courts, changeStatus, onVerDetalle, onQuitarBloqueo }) => {
  const estado = reserva.status || "pending";
  const cancha = getCourtNameById(courts, reserva.court_id);
  const bloqueada = estado === "blocked";

  return (
    <tr className="border-b border-[#EFEAE0] text-[#06122B]">
      <td className="py-5 px-4 font-bold text-[#6D7580]">
        #{reserva.ref_id || reserva.id || index + 1}
      </td>

      <td className="font-semibold">
        {bloqueada ? reserva.reason || "Horario bloqueado" : reserva.customer_name || "Sin nombre"}
        {reserva.refund_pending && (
          <span className="block mt-1 w-fit rounded-full bg-red-100 text-red-600 px-2 py-0.5 text-[10px] font-bold uppercase">
            Devolver pago
          </span>
        )}
      </td>

      <td>{bloqueada ? "—" : reserva.customer_phone || reserva.customer_email || "-"}</td>

      <td>{cancha || reserva.court_id || "-"}</td>

      <td>{reserva.date || "-"}</td>

      <td className="font-semibold">{reserva.time || "-"}</td>

      <td>
        {bloqueada ? (
          <span
            className={`inline-block rounded-full px-4 py-2 text-xs font-bold ${STATUS_STYLES.blocked}`}
          >
            {STATUS_LABELS.blocked}
          </span>
        ) : (
          <div className="relative w-fit">
            <select
              value={estado}
              onChange={(e) => changeStatus(reserva.id, e.target.value)}
              className={`appearance-none rounded-full px-4 py-2 pr-10 text-xs font-bold outline-none cursor-pointer transition-all ${
                STATUS_STYLES[estado] || STATUS_STYLES.pending
              }`}
            >
              {ASSIGNABLE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">
              ▼
            </div>
          </div>
        )}
      </td>

      <td>
        {bloqueada ? (
          <button
            onClick={onQuitarBloqueo}
            className="border border-red-200 rounded-sm px-4 py-2 text-red-500 hover:bg-red-50 text-xs font-semibold whitespace-nowrap"
          >
            Quitar bloqueo
          </button>
        ) : (
          <button
            onClick={onVerDetalle}
            className="border border-[#D6D0C8] rounded-sm px-4 py-2 text-[#6D7580] hover:border-[#06122B] hover:text-[#06122B] transition"
          >
            ⋮
          </button>
        )}
      </td>
    </tr>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-[#EFEAE0] last:border-none">
    <span className="text-[#6D7580] text-sm">{label}</span>
    <span className="text-[#06122B] text-sm font-semibold text-right">{value}</span>
  </div>
);

const BookingDetailModal = ({ reserva, courts, changeStatus, onEliminar, onClose }) => {
  const { arena } = useArena();
  const estado = reserva.status || "pending";
  const whatsapp =
    reserva.customer_phone &&
    linkWhatsApp(
      reserva.customer_phone,
      mensajeReserva({
        booking: reserva,
        courtName: getCourtNameById(courts, reserva.court_id),
        arenaName: arena?.name,
      })
    );

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black text-[#06122B]">
          Reserva #{reserva.ref_id}
        </h2>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.1em] ${
            STATUS_STYLES[estado] || STATUS_STYLES.pending
          }`}
        >
          {STATUS_LABELS[estado] || estado}
        </span>
      </div>

      {reserva.refund_pending && (
        <p className="mb-4 rounded-sm bg-red-50 border border-red-200 text-red-600 text-sm p-3">
          Hay que devolverle ${Number(reserva.refund_amount || 0).toLocaleString()} al cliente
          ({reserva.refund_reason || "pago a devolver"}). El dueño lo gestiona desde Cobros →
          Devoluciones pendientes.
        </p>
      )}

      <div className="bg-white border border-[#D6D0C8] rounded-lg p-4">
        <DetailRow label="Cliente" value={reserva.customer_name || "-"} />
        <DetailRow label="Teléfono" value={reserva.customer_phone || "-"} />
        <DetailRow label="Email" value={reserva.customer_email || "-"} />
        <DetailRow label="Cancha" value={getCourtNameById(courts, reserva.court_id)} />
        <DetailRow label="Fecha" value={reserva.date || "-"} />
        <DetailRow label="Horario" value={`${reserva.time || "-"} hs`} />
        <DetailRow
          label="Monto"
          value={`$${Number(reserva.amount || 0).toLocaleString()}`}
        />
        {reserva.deposit_amount > 0 && (
          <DetailRow
            label="Seña"
            value={`$${Number(reserva.deposit_amount).toLocaleString()}`}
          />
        )}
        {reserva.coupon_code && (
          <DetailRow label="Cupón" value={reserva.coupon_code} />
        )}
        <DetailRow
          label="Origen"
          value={reserva.source === "manual" ? "Carga manual" : "Reserva online"}
        />
      </div>

      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block w-full text-center px-6 py-3 rounded-sm bg-[#25D366] text-white text-[12px] font-extrabold uppercase tracking-[0.14em] hover:opacity-90 transition"
        >
          Enviar confirmación por WhatsApp
        </a>
      )}

      <div className="mt-5">
        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
          Cambiar estado
        </p>

        <select
          value={estado}
          onChange={(e) => changeStatus(reserva.id, e.target.value)}
          className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
        >
          {ASSIGNABLE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onEliminar}
          className="text-red-500 text-sm font-semibold hover:underline"
        >
          Eliminar reserva
        </button>

        <SecondaryButton onClick={onClose}>Cerrar</SecondaryButton>
      </div>
    </Modal>
  );
};

const ModalNuevaReserva = ({ arenaId, courts, createManualBooking, onClose }) => {
  const [courtId, setCourtId] = useState(courts[0]?.id || "");
  const [date, setDate] = useState(hoyISO());
  const [time, setTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [markPaid, setMarkPaid] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const cancha = courts.find((c) => c.id === courtId);
  const horarios = [...(cancha?.available_hours || [])].sort();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courtId || !date || !time || !customerName.trim()) {
      setError("Completá cancha, fecha, horario y nombre del cliente");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createManualBooking(arenaId, {
      court_id: courtId,
      date,
      time,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      payment_method: paymentMethod,
      mark_paid: markPaid,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-black text-[#06122B] mb-5">Nueva reserva</h2>

      <form onSubmit={handleSubmit} className="grid gap-3">
        <select
          value={courtId}
          onChange={(e) => {
            setCourtId(e.target.value);
            setTime("");
          }}
          className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
        >
          <option value="">Elegí una cancha</option>
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
          />

          {horarios.length > 0 ? (
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
            >
              <option value="">Horario</option>
              {horarios.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
            />
          )}
        </div>

        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nombre y apellido"
          className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
        />

        <input
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Teléfono"
          className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
        />

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
        >
          {PAGOS_MANUAL.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-[#06122B] font-semibold text-sm">
          <input
            type="checkbox"
            checked={markPaid}
            onChange={(e) => setMarkPaid(e.target.checked)}
          />
          Marcar como pagada ahora
        </label>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <div className="flex justify-end gap-3 mt-3">
          <SecondaryButton type="button" onClick={onClose}>
            Cancelar
          </SecondaryButton>

          <PrimaryButton disabled={submitting}>
            {submitting ? "Guardando..." : "Cargar reserva"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
};

const ModalBloquearHorarios = ({ arenaId, courts, blockHours, onClose }) => {
  const [courtId, setCourtId] = useState(courts[0]?.id || "");
  const [date, setDate] = useState(hoyISO());
  const [selectedHours, setSelectedHours] = useState([]);
  const [reason, setReason] = useState("Torneo");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const cancha = courts.find((c) => c.id === courtId);
  const horarios = [...(cancha?.available_hours || [])].sort();

  const toggleHora = (hora) => {
    setSelectedHours((prev) =>
      prev.includes(hora) ? prev.filter((h) => h !== hora) : [...prev, hora]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courtId || !date || selectedHours.length === 0) {
      setError("Elegí cancha, fecha y al menos un horario");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await blockHours(arenaId, {
      court_id: courtId,
      date,
      times: selectedHours,
      reason: reason.trim(),
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.skipped?.length > 0) {
      alert(
        `Se bloquearon ${result.created.length} horarios. Estos ya estaban ocupados y no se tocaron: ${result.skipped.join(", ")}`
      );
    }

    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-black text-[#06122B] mb-2">Bloquear horarios</h2>
      <p className="text-sm text-[#6D7580] mb-5">
        Los horarios bloqueados dejan de estar disponibles para reservar online.
        Usalo para torneos, mantenimiento o cualquier evento propio.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-3">
        <select
          value={courtId}
          onChange={(e) => {
            setCourtId(e.target.value);
            setSelectedHours([]);
          }}
          className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
        >
          <option value="">Elegí una cancha</option>
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
        />

        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo (ej: Torneo de verano)"
          className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
        />

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
            Horarios a bloquear
          </p>

          {horarios.length === 0 ? (
            <p className="text-sm text-[#6D7580]">
              Esta cancha no tiene horarios configurados.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {horarios.map((h) => {
                const activo = selectedHours.includes(h);

                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleHora(h)}
                    className={`px-4 py-2 rounded-full border font-semibold text-sm transition ${
                      activo
                        ? "bg-[#06122B] text-white border-[#06122B]"
                        : "bg-white text-[#6D7580] border-[#D6D0C8] hover:border-[#06122B]"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <div className="flex justify-end gap-3 mt-3">
          <SecondaryButton type="button" onClick={onClose}>
            Cancelar
          </SecondaryButton>

          <PrimaryButton disabled={submitting}>
            {submitting ? "Bloqueando..." : "Bloquear horarios"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
};

export default Reservas;
