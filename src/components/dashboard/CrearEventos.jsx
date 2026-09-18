import { useState } from "react";
import { useArena } from "../../hooks/useArena";
import { useCourts } from "../../hooks/useCourts";
import { useEvents } from "../../hooks/useEvents";
import { getCourtNameById } from "../../utils/courts";
import { PrimaryButton } from "./shared";
import Loader from "../Loader";

export default function CrearEvento() {
  const { arenaId, loadingArena } = useArena();
  const { courts, loadingCourts } = useCourts(arenaId);
  const { events, creating, createEvent, fetchRegistrations, cancelEvent } =
    useEvents(arenaId);

  const [event, setEvent] = useState({
    title: "Cancha libre",
    court_id: "",
    date: "",
    time: "",
    spots: 8,
    price: "",
  });

  const [eventoAbierto, setEventoAbierto] = useState(null);
  const [registrantes, setRegistrantes] = useState({});
  const [cargandoRegistrantes, setCargandoRegistrantes] = useState(false);

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!event.court_id) {
      alert("Elegí una cancha");
      return;
    }

    const result = await createEvent(event);

    if (!result.success) {
      alert(result.error);
      return;
    }

    const link = `/cancha-libre/${result.event_id}`;

    alert(`Evento creado. Link generado: ${window.location.origin}${link}`);

    setEvent({ title: "Cancha libre", court_id: "", date: "", time: "", spots: 8, price: "" });
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

          <select
            value={event.court_id}
            onChange={(e) => setEvent({ ...event, court_id: e.target.value })}
            className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
          >
            <option value="">Elegí una cancha</option>
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={event.date}
              onChange={(e) => setEvent({ ...event, date: e.target.value })}
              className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
            />

            <input
              type="time"
              value={event.time}
              onChange={(e) => setEvent({ ...event, time: e.target.value })}
              className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

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
                      {getCourtNameById(courts, ev.court_id)} · {ev.date} · {ev.time}
                    </p>
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
                    ) : registrantes[ev.id]?.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {registrantes[ev.id].map((r) => (
                          <div
                            key={r.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm border-b border-[#EFEAE0] last:border-none pb-2 last:pb-0"
                          >
                            <span className="font-semibold text-[#06122B]">
                              {r.name} {r.last_name}
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
