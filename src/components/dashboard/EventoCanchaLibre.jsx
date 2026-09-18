import { useState } from "react";
import { useParams } from "react-router-dom";
import { useEvent } from "../../hooks/useEvent";
import Loader from "../Loader";

export default function EventoCanchaLibre() {
  const { id } = useParams();
  const { event, spotsLeft, loading, registering, error, register } = useEvent(id);

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [registrado, setRegistrado] = useState(false);

  if (loading) {
    return <Loader />;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E9] text-[#06122B]">
        <p className="text-lg font-medium">Evento no encontrado</p>
      </div>
    );
  }

  const handleRegister = async (e) => {
    e.preventDefault();

    if (spotsLeft <= 0) return;

    const result = await register({
      name: form.name,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
    });

    if (!result.success) {
      alert(result.error);
      return;
    }

    setRegistrado(true);
    setForm({ name: "", lastName: "", email: "", phone: "" });
  };

  const sinCupos = spotsLeft <= 0;

  return (
    <div className="min-h-screen w-full bg-[#F5F1E9] text-[#06122B] px-5 sm:px-8 py-8">
      <section className="max-w-2xl mx-auto bg-white border border-[#D6D0C8] rounded-lg p-4 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#CD9A50] font-semibold mb-1">
          Cancha libre
        </p>
        <h1 className="text-xl sm:text-2xl font-black">Anotarse a cancha libre</h1>

        <p className="text-sm text-[#6D7580] mt-1 mb-5">
          Completá tus datos para reservar tu cupo.
        </p>

        <div className="rounded-lg bg-[#F5F1E9] border border-[#D6D0C8] p-4 mb-5">
          <h2 className="font-bold text-[#06122B]">{event.title}</h2>

          <p className="text-sm text-[#6D7580] mt-1">
            {event.date} · {event.time}
          </p>

          <p className="text-sm font-bold text-[#CD9A50] mt-2">
            Quedan {spotsLeft} de {event.spots} cupos
          </p>

          <p className="text-sm font-bold text-[#CD9A50] mt-1">
            ${event.price} por persona
          </p>
        </div>

        {registrado ? (
          <div className="rounded-lg bg-[#2f6f61]/10 border border-[#2f6f61]/30 p-4 text-[#2f6f61] font-semibold">
            ¡Listo! Quedaste anotado.
          </div>
        ) : (
          <form onSubmit={handleRegister} className="grid gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre"
                required
                className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
              />

              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Apellido"
                required
                className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
              />
            </div>

            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Mail"
              required
              className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
            />

            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Número de teléfono"
              required
              className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
            />

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <button
              disabled={sinCupos || registering}
              className={`w-full px-7 py-3 rounded-sm text-[13px] font-extrabold uppercase tracking-[0.16em] transition-all ${
                sinCupos
                  ? "bg-[#D6D0C8] text-white cursor-not-allowed"
                  : "bg-[#06122B] text-[#F5F1E9] hover:opacity-90"
              }`}
            >
              {sinCupos ? "Cupos completos" : registering ? "Anotando..." : "Anotarme"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
