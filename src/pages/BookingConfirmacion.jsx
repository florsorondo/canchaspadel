import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useBooking } from "../hooks/useBooking";
import { useArenaById } from "../hooks/useArenaById";
import { useCourts } from "../hooks/useCourts";
import { getCourtNameById } from "../utils/courts";
import { linkWhatsApp, mensajeReserva } from "../utils/whatsapp";
import Loader from "../components/Loader";

const ESTADO_INFO = {
  paid: {
    titulo: "¡Turno reservado!",
    detalle: "Tu pago fue aprobado y la reserva quedó confirmada.",
    color: "text-[#2f6f61]",
    label: "Pagado",
  },
  deposit_paid: {
    titulo: "¡Turno reservado!",
    detalle: "Tu seña fue aprobada. El saldo se abona en el club.",
    color: "text-[#2f6f61]",
    label: "Señado",
  },
  refund_pending: {
    titulo: "El turno ya estaba ocupado",
    detalle: "Tu pago llegó cuando otra persona ya había tomado el horario. El club te va a devolver el dinero; escribile por WhatsApp si tenés dudas.",
    color: "text-red-500",
    label: "Pago a devolver",
  },
  cancelled_refund: {
    titulo: "Reserva cancelada",
    detalle: "La reserva fue cancelada. El club te va a devolver lo que pagaste por Mercado Pago.",
    color: "text-red-500",
    label: "Cancelada",
  },
  cancelled: {
    titulo: "El pago no se pudo confirmar",
    detalle: "La reserva fue cancelada. Podés intentar de nuevo.",
    color: "text-red-500",
    label: "Cancelado",
  },
};

const puedeCancelarse = (booking) => {
  if (!booking) return false;
  if (!["pending", "deposit_paid", "paid"].includes(booking.status)) return false;
  if (!booking.date) return true;
  // Fecha local: con toISOString (UTC), después de las 21 hs ya era "mañana"
  return booking.date >= new Date().toLocaleDateString("en-CA");
};

export default function BookingConfirmacion() {
  const { arenaId } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  const { booking, loading, timedOut, cancelBooking } = useBooking(bookingId);
  const { arena } = useArenaById(arenaId);
  const { courts } = useCourts(arenaId);
  const [cancelando, setCancelando] = useState(false);

  // El cliente le manda los datos al club: los dos quedan con la reserva en el chat
  const whatsappClub =
    booking &&
    arena?.phone &&
    booking.status !== "cancelled" &&
    linkWhatsApp(
      arena.phone,
      mensajeReserva({
        booking,
        courtName: getCourtNameById(courts, booking.court_id),
        arenaName: arena.name,
        paraElClub: true,
      })
    );

  // Cancelada con pago a devolver: se muestra aparte para no decirle que el pago falló
  const estadoMostrado = () => {
    if (booking?.cancel_reason === "paid_after_slot_taken") return "refund_pending";
    if (booking?.status === "cancelled" && (booking.refund_pending || booking.refunded_at)) {
      return "cancelled_refund";
    }
    return booking?.status;
  };
  const status = estadoMostrado();
  const isTerminal = status && ESTADO_INFO[status];
  const isPending = !isTerminal && !timedOut;

  const handleCancelar = async () => {
    if (!confirm("¿Seguro que querés cancelar esta reserva?")) return;

    setCancelando(true);
    const result = await cancelBooking();
    setCancelando(false);

    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F1E9] text-[#06122B] overflow-hidden">
      <div className="relative min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50 w-full px-5 sm:px-8 py-4 border-b border-[#D6D0C8] bg-[#F5F1E9]/90 backdrop-blur-md flex items-center gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#CD9A50] font-semibold">
              Distrito San Vicente
            </p>
            <h1 className="text-lg sm:text-xl font-black">Estado de tu reserva</h1>
          </div>
        </header>

        <main className="flex-1 w-full px-5 sm:px-8 py-8 flex items-center justify-center">
          <section className="w-full max-w-3xl bg-white border border-[#D6D0C8] rounded-lg shadow-sm p-6 sm:p-8">
            {loading && !booking ? (
              <Loader />
            ) : isPending ? (
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-[#F5F1E9] flex items-center justify-center mb-5 animate-pulse">
                  <div className="w-10 h-10 rounded-full border-2 border-[#06122B] flex items-center justify-center text-[#06122B] text-xl font-bold">
                    ⏳
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black">
                  Confirmando tu pago...
                </h2>

                <p className="text-sm sm:text-base text-[#6D7580] mt-2">
                  Esto puede tardar unos segundos.
                </p>
              </div>
            ) : timedOut ? (
              <div className="flex flex-col items-center text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-black">
                  Todavía estamos esperando la confirmación
                </h2>

                <p className="text-sm sm:text-base text-[#6D7580] mt-2">
                  Si ya pagaste, tu reserva se va a confirmar en breve. Mandale
                  los datos al club por WhatsApp y te confirman el turno.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-[#F5F1E9] flex items-center justify-center mb-5">
                  <div
                    className={`w-10 h-10 rounded-full border-2 border-current flex items-center justify-center text-xl font-bold ${ESTADO_INFO[status].color}`}
                  >
                    {status === "cancelled" ? "✕" : "✓"}
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black">
                  {ESTADO_INFO[status].titulo}
                </h2>

                <p className="text-sm sm:text-base text-[#6D7580] mt-2">
                  {ESTADO_INFO[status].detalle}
                </p>
              </div>
            )}

            {booking && (
              <div className="rounded-lg bg-[#F5F1E9] border border-[#D6D0C8] p-4 sm:p-5 space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-sm sm:text-base text-[#6D7580] font-medium">
                    Reserva Nº
                  </span>
                  <span className="text-sm sm:text-base text-[#06122B] font-semibold text-right">
                    #{booking.ref_id}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm sm:text-base text-[#6D7580] font-medium">
                    Fecha
                  </span>
                  <span className="text-sm sm:text-base text-[#06122B] font-semibold text-right">
                    {booking.date}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm sm:text-base text-[#6D7580] font-medium">
                    Horario
                  </span>
                  <span className="text-sm sm:text-base text-[#06122B] font-semibold text-right">
                    {booking.time} hs
                  </span>
                </div>

                <div className="border-t border-[#D6D0C8] pt-3 flex justify-between gap-4">
                  <span className="text-sm sm:text-base text-[#6D7580] font-medium">
                    Estado
                  </span>
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      ESTADO_INFO[status]?.color || "text-[#06122B]"
                    }`}
                  >
                    {ESTADO_INFO[status]?.label || "Pendiente"}
                  </span>
                </div>
              </div>
            )}

            {whatsappClub && (
              <a
                href={whatsappClub}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block w-full text-center px-7 py-3 rounded-sm bg-[#25D366] text-white text-sm font-bold uppercase tracking-[0.1em] hover:opacity-90 transition-all"
              >
                Enviar mi reserva al club por WhatsApp
              </a>
            )}

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to={`/booking/${arenaId}`}
                className="w-full text-center px-7 py-3 rounded-sm bg-white text-[#06122B] border border-[#D6D0C8] text-sm font-bold uppercase tracking-[0.1em] hover:border-[#06122B] transition-all"
              >
                Hacer otra reserva
              </Link>

              {puedeCancelarse(booking) && (
                <button
                  onClick={handleCancelar}
                  disabled={cancelando}
                  className="w-full text-center px-7 py-3 rounded-sm bg-white text-red-500 border border-red-200 text-sm font-bold uppercase tracking-[0.1em] hover:bg-red-50 transition-all disabled:opacity-60"
                >
                  {cancelando ? "Cancelando..." : "Cancelar reserva"}
                </button>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
