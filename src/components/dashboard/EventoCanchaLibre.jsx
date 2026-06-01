import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EventoCanchaLibre() {
  const { id } = useParams();

  const [evento, setEvento] = useState(null);
  const [persona, setPersona] = useState({
    nombre: "",
    telefono: "",
    email: "",
  });

  useEffect(() => {
    const eventoGuardado = JSON.parse(localStorage.getItem(`canchaLibre-${id}`));
    setEvento(eventoGuardado);
  }, [id]);

  const handleAnotarse = (e) => {
    e.preventDefault();

    const eventoActualizado = JSON.parse(
      localStorage.getItem(`canchaLibre-${id}`)
    );

    if (!eventoActualizado) {
      alert("No se encontró el evento");
      return;
    }

    const nuevoInscripto = {
      id: Date.now(),
      nombre: persona.nombre,
      telefono: persona.telefono,
      email: persona.email,
      estadoPago: "Pendiente",
    };

    eventoActualizado.registeredPlayers = [
      ...(eventoActualizado.registeredPlayers || []),
      nuevoInscripto,
    ];

    localStorage.setItem(
      `canchaLibre-${id}`,
      JSON.stringify(eventoActualizado)
    );

    setEvento(eventoActualizado);

    alert("Te anotaste correctamente");

    setPersona({
      nombre: "",
      telefono: "",
      email: "",
    });
  };

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff]">
        <p className="text-gray-500">Evento no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-[#e2e8f0] p-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {evento.title}
        </h1>

        <p className="text-[#64748b] mt-2">
          {evento.court}
        </p>

        <div className="mt-5 grid gap-2 text-sm text-[#334155]">
          <p>
            <strong>Fecha:</strong> {evento.date || "Sin fecha"}
          </p>
          <p>
            <strong>Horario:</strong> {evento.time || "Sin horario"}
          </p>
          <p>
            <strong>Precio:</strong> ${evento.price || "0"}
          </p>
          <p>
            <strong>Cupos:</strong>{" "}
            {(evento.registeredPlayers || []).length}/{evento.spots}
          </p>
        </div>

        {(evento.registeredPlayers || []).length >= Number(evento.spots) ? (
          <div className="mt-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-sm">
            Ya no quedan cupos disponibles.
          </div>
        ) : (
          <form onSubmit={handleAnotarse} className="grid gap-4 mt-6">
            <input
              value={persona.nombre}
              onChange={(e) =>
                setPersona({ ...persona, nombre: e.target.value })
              }
              placeholder="Nombre y apellido"
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
              required
            />

            <input
              value={persona.telefono}
              onChange={(e) =>
                setPersona({ ...persona, telefono: e.target.value })
              }
              placeholder="Teléfono"
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
              required
            />

            <input
              type="email"
              value={persona.email}
              onChange={(e) =>
                setPersona({ ...persona, email: e.target.value })
              }
              placeholder="Email"
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
              required
            />

            <button className="w-full py-3 rounded-xl bg-[#315b96] text-white font-semibold hover:bg-[#254979] transition-all">
              Anotarme
            </button>
          </form>
        )}
      </div>
    </div>
  );
}