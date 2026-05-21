import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function EventoCanchaLibre() {

  const { id } = useParams();

  const savedEvent = JSON.parse(
    localStorage.getItem(`canchaLibre-${id}`)
  );

  if (!savedEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] font-['Inter',sans-serif]">
        <p className="text-[#0f172a] text-lg font-medium">
          Evento no encontrado
        </p>
      </div>
    );
  }

  const [players, setPlayers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleRegister = (e) => {
    e.preventDefault();

    if (players.length >= Number(savedEvent.spots)) return;

    const newPlayer = {
      id: Date.now(),
      ...form,
    };

    setPlayers([...players, newPlayer]);

    setForm({
      name: "",
      lastName: "",
      email: "",
      phone: "",
    });
  };

  const spotsLeft = Number(savedEvent.spots) - players.length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8fbff] to-[#eef5ff] font-['Inter',sans-serif] px-5 sm:px-8 py-8">

      <section className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md border border-[#e3ecf7] rounded-2xl shadow-sm p-4 sm:p-6">

        <h1 className="text-xl sm:text-2xl font-semibold text-[#0f172a]">
          Anotarse a cancha libre
        </h1>

        <p className="text-sm text-[#64748b] mt-1 mb-5">
          Completá tus datos para reservar tu cupo.
        </p>

        <div className="rounded-2xl bg-[#eef6ff] border border-[#b8d7ff] p-4 mb-5">

          <h2 className="font-semibold text-[#0f172a]">
            {savedEvent.title}
          </h2>

          <p className="text-sm text-[#64748b] mt-1">
            {savedEvent.court} · {savedEvent.date} · {savedEvent.time}
          </p>

          <p className="text-sm font-semibold text-[#315b96] mt-2">
            Cupos: {players.length}/{savedEvent.spots} · Quedan {spotsLeft}
          </p>

          <p className="text-sm font-semibold text-[#315b96] mt-1">
            ${savedEvent.price} por persona
          </p>

        </div>

        <form onSubmit={handleRegister} className="grid gap-3">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Nombre"
              required
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
            />

            <input
              value={form.lastName}
              onChange={(e) =>
                setForm({ ...form, lastName: e.target.value })
              }
              placeholder="Apellido"
              required
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
            />

          </div>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            placeholder="Mail"
            required
            className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
          />

          <input
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            placeholder="Número de teléfono"
            required
            className="px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f8fe8]"
          />

          <button
            disabled={players.length >= Number(savedEvent.spots)}
            className={`w-full px-7 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${
              players.length >= Number(savedEvent.spots)
                ? "bg-[#cbd5e1] text-white cursor-not-allowed"
                : "bg-[#315b96] text-white hover:bg-[#254979]"
            }`}
          >
            {players.length >= Number(savedEvent.spots)
              ? "Cupos completos"
              : "Anotarme"}
          </button>

        </form>

      </section>

    </div>
  );
}