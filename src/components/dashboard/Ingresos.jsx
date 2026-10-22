import { Card } from "./shared";
import { useArena } from "../../hooks/useArena";
import { useBookings } from "../../hooks/useBookings";
import { useCourts } from "../../hooks/useCourts";
import { getCourtNameById } from "../../utils/courts";
import {
  ASSIGNABLE_STATUSES,
  STATUS_LABELS,
  STATUS_STYLES,
  montoCobrado,
} from "../../utils/bookingStatus";
import Loader from "../Loader";
import { useRefunds } from "../../hooks/useRefunds";
import { formatearFecha, linkWhatsApp } from "../../utils/whatsapp";

const inicioDeSemana = (hoy) => {
  const dia = hoy.getDay();
  const diff = dia === 0 ? 6 : dia - 1;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
};

const toLocalDate = (isoDate) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const MovimientoRow = ({ booking, courts, changeStatus }) => {
  const estado = booking.status || "pending";

  return (
    <tr className="border-b border-[#EFEAE0] last:border-none text-[#06122B]">
      <td className="p-4 font-semibold">{booking.customer_name || "Sin nombre"}</td>
      <td>{getCourtNameById(courts, booking.court_id)}</td>
      <td>{booking.date || "-"}</td>
      <td className="font-semibold">{booking.time || "-"}</td>
      <td>{booking.payment_option === "deposit" ? "Seña" : "Total"}</td>

      <td>
        <div className="relative w-fit">
          <select
            value={estado}
            onChange={(e) => changeStatus(booking.id, e.target.value)}
            className={`appearance-none rounded-full px-3 py-1 pr-8 text-xs font-bold outline-none cursor-pointer transition-all ${
              STATUS_STYLES[estado] || STATUS_STYLES.pending
            }`}
          >
            {ASSIGNABLE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
            ▼
          </div>
        </div>
      </td>

      <td className="font-bold">${montoCobrado(booking).toLocaleString()}</td>
    </tr>
  );
};

const Devoluciones = ({ refunds, courts, saving, onMarcarDevuelto }) => {
  if (refunds.length === 0) return null;

  const total = refunds.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="border-2 border-red-200 rounded-lg overflow-hidden bg-white mb-8">
      <div className="p-5 border-b border-red-200 bg-red-50">
        <h2 className="text-2xl font-black text-red-600">
          Devoluciones pendientes ({refunds.length})
        </h2>
        <p className="text-sm text-[#06122B] mt-1">
          Hay ${total.toLocaleString()} para devolver. Para cada una: entrá a Mercado Pago →
          Actividad, buscá la operación por su número, tocá <b>Devolver dinero</b> y después
          marcala acá como devuelta.
        </p>
      </div>

      <div className="divide-y divide-[#EFEAE0]">
        {refunds.map((r) => {
          const whatsapp = linkWhatsApp(r.customer_phone);

          return (
            <div
              key={`${r.kind}-${r.id}`}
              className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="text-[#06122B]">
                <p className="font-black">
                  {r.customer_name || "Sin nombre"} · ${Number(r.amount || 0).toLocaleString()}
                </p>
                <p className="text-sm text-[#6D7580] mt-1">
                  {r.detail}
                  {r.date ? ` · ${getCourtNameById(courts, r.court_id)} · ${formatearFecha(r.date)} ${r.time} hs` : ""}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-semibold">Motivo:</span> {r.reason}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-semibold">Operación de Mercado Pago:</span>{" "}
                  {r.mp_payment_id ? `Nº ${r.mp_payment_id}` : "sin número (buscala por el nombre del cliente)"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-[#D6D0C8] rounded-sm px-4 py-2 text-sm font-semibold text-[#06122B] hover:border-[#06122B] transition"
                  >
                    Avisar por WhatsApp
                  </a>
                )}

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onMarcarDevuelto(r)}
                  className="bg-[#06122B] text-white rounded-sm px-4 py-2 text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
                >
                  Marcar como devuelto
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Ingresos = () => {
  const { arenaId, loadingArena } = useArena();
  const { bookings, loading: loadingBookings, changeStatus, fetchBookings } = useBookings(arenaId);
  const { courts, loadingCourts } = useCourts(arenaId);
  const { refunds, saving: savingRefund, markRefunded, fetchRefunds } = useRefunds(arenaId);

  const handleMarcarDevuelto = async (refund) => {
    if (!confirm(`¿Ya le devolviste $${Number(refund.amount || 0).toLocaleString()} a ${refund.customer_name}?`)) {
      return;
    }

    const result = await markRefunded(refund);

    if (!result.success) {
      alert(result.error);
      return;
    }

    fetchBookings();
  };

  const cambiarEstado = async (bookingId, status) => {
    const result = await changeStatus(bookingId, status);

    if (!result.success) {
      alert(result.error);
      return;
    }

    // Cancelar una reserva pagada puede generar una devolución
    fetchRefunds();
  };

  if (loadingArena || loadingBookings || loadingCourts) {
    return <Loader />;
  }

  const hoy = new Date();
  const hoyISO = hoy.toLocaleDateString("en-CA");
  const inicioSemana = inicioDeSemana(hoy);

  const cobrados = bookings.filter(
    (b) => b.status === "paid" || b.status === "deposit_paid" || b.status === "completed"
  );

  const ingresosHoy = cobrados
    .filter((b) => b.date === hoyISO)
    .reduce((total, b) => total + montoCobrado(b), 0);

  const ingresosSemana = cobrados
    .filter((b) => b.date && toLocalDate(b.date) >= inicioSemana)
    .reduce((total, b) => total + montoCobrado(b), 0);

  const ingresosMes = cobrados
    .filter(
      (b) =>
        b.date &&
        toLocalDate(b.date).getMonth() === hoy.getMonth() &&
        toLocalDate(b.date).getFullYear() === hoy.getFullYear()
    )
    .reduce((total, b) => total + montoCobrado(b), 0);

  const pagosPendientes = bookings.filter(
    (b) => b.status === "pending" || b.status === "deposit_paid"
  ).length;

  const movimientos = bookings
    .filter((b) => b.status !== "blocked")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div className="p-4 md:p-8">
      <Devoluciones
        refunds={refunds}
        courts={courts}
        saving={savingRefund}
        onMarcarDevuelto={handleMarcarDevuelto}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Card title="Cobrado hoy" value={`${ingresosHoy.toLocaleString()}`} subtitle="por reservas" />
        <Card title="Cobrado esta semana" value={`${ingresosSemana.toLocaleString()}`} subtitle="por reservas" />
        <Card title="Cobrado este mes" value={`${ingresosMes.toLocaleString()}`} subtitle="por reservas" />
        <Card title="Pagos pendientes" value={pagosPendientes} subtitle="por cobrar" />
      </div>

      <div className="border border-[#D6D0C8] rounded-lg overflow-hidden bg-white">
        <div className="p-5 border-b border-[#D6D0C8]">
          <h2 className="text-2xl font-black text-[#06122B]">Cobros por reserva</h2>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="text-[#6D7580] text-xs uppercase tracking-[0.1em] border-b border-[#D6D0C8]">
                <th className="p-4">Cliente</th>
                <th>Cancha</th>
                <th>Día</th>
                <th>Horario</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Monto</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.length > 0 ? (
                movimientos.map((booking) => (
                  <MovimientoRow
                    key={booking.id}
                    booking={booking}
                    courts={courts}
                    changeStatus={cambiarEstado}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#6D7580]">
                    No hay movimientos todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ingresos;
