import React, { useEffect, useState } from "react";
import VerInscriptos from "./VerInscriptos";

export default function CrearEvento() {
  const [event, setEvent] = useState({
    title: "Cancha libre",
    court: "Cancha 1",
    date: "",
    time: "",
    spots: 8,
    price: "",
  });

  const [eventosCreados, setEventosCreados] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const cargarEventos = () => {
    const eventos = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key.startsWith("canchaLibre-")) {
        eventos.push(JSON.parse(localStorage.getItem(key)));
      }
    }

    setEventosCreados(eventos);
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const handleCreateEvent = (e) => {
    e.preventDefault();

    const newEvent = {
      id: Date.now(),
      ...event,
      registeredPlayers: [],
    };

    localStorage.setItem(`canchaLibre-${newEvent.id}`, JSON.stringify(newEvent));
    cargarEventos();

    const link = `${window.location.origin}/cancha-libre/${newEvent.id}`;
    navigator.clipboard.writeText(link);

    alert(`Evento creado. Link copiado: ${link}`);
  };

  const verInscriptos = (eventoId) => {
    const eventoActualizado = JSON.parse(
      localStorage.getItem(`canchaLibre-${eventoId}`)
    );

    setEventoSeleccionado({
      nombre: eventoActualizado.title,
      dia: eventoActualizado.date,
      horario: eventoActualizado.time,
      anotados: eventoActualizado.registeredPlayers || [],
    });
  };

 
  const borrarEvento = (eventoId) => {
  const confirmar = window.confirm(
    "¿Seguro que querés borrar este evento?"
  );

  if (!confirmar) return;

  localStorage.removeItem(`canchaLibre-${eventoId}`);
  cargarEventos();
  setEventoSeleccionado(null);
};

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8fbff] to-[#eef5ff] px-5 sm:px-8 py-8">
      <section className="max-w-3xl mx-auto bg-white border border-[#dbe7f6] rounded-3xl shadow-sm p-6 sm:p-8">
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">
            Crear evento
          </h1>
          <p className="text-sm text-[#64748b] mt-2">
            Configurá una cancha libre, torneo, clase o actividad especial.
          </p>
        </div>

        <form onSubmit={handleCreateEvent} className="grid gap-5">
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2">
              Título del evento
            </label>
            <input
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              placeholder="Ej: Cancha libre viernes"
              className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3] outline-none focus:border-[#4f8fe8] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2">
              Cancha
            </label>
            <select
              value={event.court}
              onChange={(e) => setEvent({ ...event, court: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3] outline-none focus:border-[#4f8fe8] bg-white"
            >
              <option>Cancha 1</option>
              <option>Cancha 2</option>
              <option>Cancha 3</option>
              <option>Cancha 4</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={event.date}
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3] outline-none focus:border-[#4f8fe8] bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-2">
                Horario
              </label>
              <input
                type="time"
                value={event.time}
                onChange={(e) => setEvent({ ...event, time: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3] outline-none focus:border-[#4f8fe8] bg-white"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-2">
                Cupos
              </label>
              <input
                type="number"
                min="1"
                value={event.spots}
                onChange={(e) => setEvent({ ...event, spots: e.target.value })}
                placeholder="Ej: 8"
                className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3] outline-none focus:border-[#4f8fe8] bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#334155] mb-2">
                Precio por persona
              </label>
              <input
                type="number"
                value={event.price}
                onChange={(e) => setEvent({ ...event, price: e.target.value })}
                placeholder="Ej: 5000"
                className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3] outline-none focus:border-[#4f8fe8] bg-white"
              />
            </div>
          </div>

          <button className="mt-2 w-full py-4 rounded-2xl bg-[#315b96] text-white font-semibold hover:bg-[#254979] transition-all shadow-md">
            Crear evento
          </button>
        </form>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">
            Eventos creados
          </h2>

          {eventosCreados.length === 0 ? (
            <p className="text-sm text-[#64748b]">
              Todavía no creaste eventos.
            </p>
          ) : (
            <div className="grid gap-4">
              {eventosCreados.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-[#f8fbff] border border-[#dbe7f6] rounded-3xl p-5"
                >
                  <h3 className="text-lg font-bold text-[#0f172a]">
                    {evento.title}
                  </h3>

                  <p className="text-sm text-[#64748b] mt-1">
                    {evento.court}
                  </p>

                  <p className="text-sm text-[#334155] mt-3">
                    {evento.date || "Sin fecha"} ·{" "}
                    {evento.time || "Sin horario"}
                  </p>

                  <p className="text-sm text-[#334155] mt-1">
                    Inscriptos: {(evento.registeredPlayers || []).length}/
                    {evento.spots}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => verInscriptos(evento.id)}
                    className="w-full py-3 rounded-2xl bg-[#4f8fe8] text-white font-semibold hover:bg-[#3d7ed8] transition-all"
                  >
                    Ver inscriptos
                  </button>

                  <button
                   type="button"
                   onClick={() => borrarEvento(evento.id)}
                   className="w-full py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                  >
                   Borrar evento
                  </button>
                  </div>
                </div>
              ))}
            </div>
          )}

         {eventoSeleccionado && (
           <div className="mt-6">
             <VerInscriptos
               evento={eventoSeleccionado}
               onClose={() => setEventoSeleccionado(null)}
              />
           </div>
         )}
         
        </div>
      </section>
    </div>
  );
}