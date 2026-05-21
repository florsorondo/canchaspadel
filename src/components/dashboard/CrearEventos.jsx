import React, { useState } from "react";

export default function CrearEvento() {
  const [event, setEvent] = useState({
    title: "Cancha libre",
    court: "Cancha 1",
    date: "",
    time: "",
    spots: 8,
    price: "",
  });

  const handleCreateEvent = (e) => {
  e.preventDefault();

  const newEvent = {
    id: Date.now(),
    ...event,
    registeredPlayers: [],
  };

  localStorage.setItem(
    `canchaLibre-${newEvent.id}`,
    JSON.stringify(newEvent)
  );

  const link = `/cancha-libre/${newEvent.id}`;

  alert(
    `Evento creado. Link generado: ${window.location.origin}${link}`
  );
};

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8fbff] to-[#eef5ff] font-['Inter',sans-serif] px-5 sm:px-8 py-8">
      <section className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md border border-[#e3ecf7] rounded-2xl shadow-sm p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#0f172a]">
          Crear cancha libre
        </h1>

        <p className="text-sm text-[#64748b] mt-1 mb-5">
          Configurá el evento, la cancha, el horario y los cupos.
        </p>

        <form onSubmit={handleCreateEvent} className="grid gap-4">
          <input
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            placeholder="Título del evento"
            className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
          />

          <select
            value={event.court}
            onChange={(e) => setEvent({ ...event, court: e.target.value })}
            className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
          >
            <option>Cancha 1</option>
            <option>Cancha 2</option>
            <option>Cancha 3</option>
            <option>Cancha 4</option>
          </select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={event.date}
              onChange={(e) => setEvent({ ...event, date: e.target.value })}
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
            />

            <input
              type="time"
              value={event.time}
              onChange={(e) => setEvent({ ...event, time: e.target.value })}
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              min="1"
              value={event.spots}
              onChange={(e) => setEvent({ ...event, spots: e.target.value })}
              placeholder="Cantidad de cupos"
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
            />

            <input
              type="number"
              value={event.price}
              onChange={(e) => setEvent({ ...event, price: e.target.value })}
              placeholder="Precio por persona"
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
            />
          </div>

          <button className="w-full px-7 py-3 rounded-xl bg-[#315b96] text-white text-sm font-semibold shadow-lg hover:bg-[#254979] transition-all">
            Crear evento
          </button>
        </form>
      </section>
    </div>
  );
}