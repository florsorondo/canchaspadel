import { useState } from "react";
import { useArena } from "../../hooks/useArena";
import { useCourts } from "../../hooks/useCourts";
import { useEvents } from "../../hooks/useEvents";
import { useCourtAvailability } from "../../hooks/useCourtAvailability";
import { getCourtNameById } from "../../utils/courts";
import { PrimaryButton } from "./shared";
import Loader from "../Loader";

const aMinutos = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

const aHora = (minutos) =>
  `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;

const EVENTO_VACIO = {
  title: "Cancha libre",
  court_id: "",
  date: "",
  time: "",
  end_time: "",
  spots: 8,
  price: "",
  deposit: "",
};

export default function CrearEvento() {
  const { arenaId, loadingArena } = useArena();
  const { courts, loadingCourts } = useCourts(arenaId);
  const { events, creating, createEvent, fetchRegistrations, cancelEvent } =
    useEvents(arenaId);

  const [event, setEvent] = useState(EVENTO_VACIO);

  const [eventoAbierto, setEventoAbierto] = useState(null);
  const [registrantes, setRegistrantes] = useState({});
  const [cargandoRegistrantes, setCargandoRegistrantes] = useState(false);

  const {
    hours: turnos,
    loading: cargandoTurnos,
    fetchAvailability,
  } = useCourtAvailability(event.court_id, event.date);

  const canchaElegida = courts.find((c) => c.id === event.court_id);
  const diasCancha = canchaElegida?.available_days?.join(", ");

  const turnosOrdenados = [...turnos].sort((a, b) => a.hour.localeCompare(b.hour));

  // Duración de un turno: la menor distancia entre dos turnos seguidos (60 min si hay uno solo)
  const duracionTurno = turnosOrdenados.reduce((min, turno, i) => {
    if (i === 0) return min;
    const diff = aMinutos(turno.hour) - aMinutos(turnosOrdenados[i - 1].hour);
    return diff > 0 ? Math.min(min, diff) : min;
  }, Infinity);
  const duracion = Number.isFinite(duracionTurno) ? duracionTurno : 60;

  const turnosEnRango = (desde, hasta) =>
    turnosOrdenados.filter((t) => t.hour >= desde && t.hour < hasta);

  // "Hasta": cualquier inicio de turno posterior, o el final del último turno
  const opcionesHasta = event.time
    ? [
        ...turnosOrdenados.map((t) => t.hour),
        turnosOrdenados.length
          ? aHora(aMinutos(turnosOrdenados[turnosOrdenados.length - 1].hour) + duracion)
          : null,
      ]
        .filter((hora) => hora && hora > event.time)
        .filter((hora, i, arr) => arr.indexOf(hora) === i)
        .map((hora) => ({
          hora,
          bloqueada: turnosEnRango(event.time, hora).some((t) => t.taken),
        }))
    : [];

  const turnosSeleccionados =
    event.time && event.end_time ? turnosEnRango(event.time, event.end_time) : [];

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!event.court_id) {
      alert("Elegí una cancha");
      return;
    }

    if (Number(event.deposit) > Number(event.price)) {
      alert("La seña no puede ser mayor al precio por persona");
      return;
    }

    if (!event.date || !event.time || !event.end_time) {
      alert("Elegí la fecha y el horario (desde y hasta)");
      return;
    }

    const result = await createEvent({
      ...event,
      times: turnosSeleccionados.map((t) => t.hour),
    });

    if (!result.success) {
      alert(result.error);
      fetchAvailability();
      return;
    }

    const link = `/cancha-libre/${result.event_id}`;

    alert(`Evento creado. Link generado: ${window.location.origin}${link}`);

    setEvent(EVENTO_VACIO);
  };

  const toggleRegistrantes = async (eventId) => {
    if (eventoAbierto === eventId) {
      setEventoAbierto(null);
      return;
    }

    setEventoAbierto(eventId);

    if (!registrantes[eventId]) {
      setCargandoRegistrantes(true);
      const result = await fetchRegistrations(eventId);
      setCargandoRegistrantes(false);

      if (result.success) {
        setRegistrantes((prev) => ({ ...prev, [eventId]: result.registrations }));
      }
    }
  };

  const handleCancelarEvento = async (eventId) => {
    if (!confirm("¿Cancelar este evento? Dejará de verse públicamente.")) return;

    const result = await cancelEvent(eventId);

    if (!result.success) {
      alert(result.error);
    }
  };

  if (loadingArena || loadingCourts) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F1E9] px-5 sm:px-8 py-8">
      <section className="max-w-2xl mx-auto bg-white border border-[#D6D0C8] rounded-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#06122B]">
          Crear cancha libre
        </h1>

        <p className="text-sm text-[#6D7580] mt-1 mb-5">
          Configurá el evento, la cancha, el horario y los cupos.
        </p>

        <form onSubmit={handleCreateEvent} className="grid gap-3">
          <input
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            placeholder="Título del evento"
            className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label>
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
              1. Cancha
            </p>
              <select
                value={event.court_id}
                onChange={(e) => setEvent({ ...event, court_id: e.target.value, time: "", end_time: "" })}
                className="w-full px-4 py-3 rounded-sm border border-[#D6D0C8] bg-white outline-none focus:border-[#06122B]"
              >
                <option value="">Elegí una cancha</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
              2. Fecha
            </p>
              <input
                type="date"
                value={event.date}
                onChange={(e) => setEvent({ ...event, date: e.target.value, time: "", end_time: "" })}
                className="w-full px-4 py-3 rounded-sm border border-[#D6D0C8] bg-white outline-none focus:border-[#06122B]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label>
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
                3. Desde
              </p>
              <select
                value={event.time}
                onChange={(e) => setEvent({ ...event, time: e.target.value, end_time: "" })}
                disabled={!event.court_id || !event.date || cargandoTurnos}
                className="w-full px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B] disabled:opacity-60"
              >
                <option value="">
                  {!event.court_id || !event.date
                    ? "Primero elegí cancha y fecha"
                    : cargandoTurnos
                      ? "Cargando turnos..."
                      : turnos.length === 0
                        ? "Sin turnos ese día"
                        : "Elegí un horario"}
                </option>
                {turnosOrdenados.map((turno) => (
                  <option key={turno.hour} value={turno.hour} disabled={turno.taken}>
                    {turno.hour}
                    {turno.taken ? " · ocupado" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
                4. Hasta
              </p>
              <select
                value={event.end_time}
                onChange={(e) => setEvent({ ...event, end_time: e.target.value })}
                disabled={!event.time}
                className="w-full px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B] disabled:opacity-60"
              >
                <option value="">{event.time ? "Elegí hasta qué hora" : "Elegí primero desde"}</option>
                {opcionesHasta.map(({ hora, bloqueada }) => (
                  <option key={hora} value={hora} disabled={bloqueada}>
                    {hora}
                    {bloqueada ? " · hay turnos ocupados" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {event.court_id && event.date && !cargandoTurnos && turnos.length === 0 && (
            <p className="text-sm text-red-500 font-medium">
              {canchaElegida?.name || "Esta cancha"} no tiene turnos ese día.
              {diasCancha ? ` Abre: ${diasCancha}.` : ""}
            </p>
          )}

          {turnosSeleccionados.length > 0 && (
            <p className="text-sm text-[#6D7580]">
              Se van a bloquear {turnosSeleccionados.length}{" "}
              {turnosSeleccionados.length === 1 ? "turno" : "turnos"}:{" "}
              <span className="font-semibold text-[#06122B]">
                {turnosSeleccionados.map((t) => t.hour).join(" · ")}
              </span>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="number"
              min="1"
              value={event.spots}
              onChange={(e) => setEvent({ ...event, spots: e.target.value })}
              placeholder="Cantidad de cupos"
              className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
            />

            <input
              type="number"
              value={event.price}
              onChange={(e) => setEvent({ ...event, price: e.target.value })}
              placeholder="Precio por persona"
              className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
            />

            <input
              type="number"
              min="0"
              value={event.deposit}
              onChange={(e) => setEvent({ ...event, deposit: e.target.value })}
              placeholder="Seña por persona"
              className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
            />
          </div>

          <p className="text-xs text-[#6D7580] -mt-1">
            Al anotarse, cada persona paga la seña con Mercado Pago. Si no ponés seña, paga el precio completo.
          </p>

          <PrimaryButton disabled={creating} className="w-full py-3">
            {creating ? "Creando..." : "Crear evento"}
          </PrimaryButton>
        </form>
      </section>

      {events.length > 0 && (
        <section className="max-w-2xl mx-auto mt-6">
          <h2 className="text-lg font-black text-[#06122B] mb-3">
            Eventos activos
          </h2>

          <div className="flex flex-col gap-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white border border-[#D6D0C8] rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => toggleRegistrantes(ev.id)}
                    className="text-left flex-1"
                  >
                    <p className="font-semibold text-[#06122B]">{ev.title}</p>
                    <p className="text-sm text-[#6D7580]">
                      {getCourtNameById(courts, ev.court_id)} · {ev.date} · {ev.time}{ev.end_time ? ` a ${ev.end_time}` : ""}
                    </p>
                    {Number(ev.deposit) > 0 && (
                      <p className="text-sm text-[#6D7580]">
                        Seña ${Number(ev.deposit).toLocaleString("es-AR")} · Precio ${Number(ev.price || 0).toLocaleString("es-AR")}
                      </p>
                    )}
                    <p className="text-xs text-[#CD9A50] font-semibold mt-1">
                      {eventoAbierto === ev.id ? "Ocultar anotados ▲" : "Ver anotados ▼"}
                    </p>
                  </button>

                  <button
                    onClick={() => handleCancelarEvento(ev.id)}
                    className="border border-red-200 rounded-sm px-3 py-2 text-red-500 hover:bg-red-50 text-xs font-semibold whitespace-nowrap"
                  >
                    Cancelar evento
                  </button>
                </div>

                {eventoAbierto === ev.id && (
                  <div className="mt-4 pt-4 border-t border-[#EFEAE0]">
                    {cargandoRegistrantes && !registrantes[ev.id] ? (
                      <p className="text-sm text-[#6D7580]">Cargando anotados...</p>
                    ) : registrantes[ev.id]?.some((r) => r.status !== "cancelled") ? (
                      <div className="flex flex-col gap-2">
                        {registrantes[ev.id].filter((r) => r.status !== "cancelled").map((r) => (
                          <div
                            key={r.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm border-b border-[#EFEAE0] last:border-none pb-2 last:pb-0"
                          >
                            <span className="font-semibold text-[#06122B]">
                              {r.name} {r.last_name}
                              <span
                                className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  r.status === "pending"
                                    ? "bg-[#EFEAE0] text-[#6D7580]"
                                    : "bg-[#2f6f61]/15 text-[#2f6f61]"
                                }`}
                              >
                                {r.status === "paid" ? "Seña pagada" : r.status === "pending" ? "Pago pendiente" : "Anotado"}
                              </span>
                            </span>
                            <span className="text-[#6D7580]">
                              {r.phone} · {r.email}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6D7580]">
                        Todavía no hay nadie anotado.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
