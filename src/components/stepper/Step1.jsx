import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DIBUJOAZUL from "../../assets/DIBUJOAZUL.png";
import { useCourts } from "../../hooks/useCourts";
import { useEvents } from "../../hooks/useEvents";
import Loader from "../Loader";

export default function Step1({ arena, arenaId, booking, updateBooking, setStep }) {
  const { courts, loadingCourts } = useCourts(arenaId);
  const { events } = useEvents(arenaId);
  const navigate = useNavigate();
  const [selectedCourtId, setSelectedCourtId] = useState(booking.court?.id || null);

  if (loadingCourts) {
    return <Loader />;
  }

  const courtsDisponibles = courts.filter((court) => court.available);

  const handleNext = () => {
    const court = courtsDisponibles.find((c) => c.id === selectedCourtId);
    if (!court) return;

    updateBooking({ court, date: null, time: null });
    setStep(2);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F1E9] text-[#06122B] overflow-hidden">
      <div className="relative min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50 w-full px-5 sm:px-8 py-4 border-b border-[#D6D0C8] bg-[#F5F1E9]/90 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 rounded-sm border border-[#D6D0C8] bg-white text-[#06122B] hover:border-[#06122B] transition"
            >
              ←
            </button>

            <img src={DIBUJOAZUL} alt="Logo" className="w-10 h-10 object-contain" />

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#CD9A50] font-semibold">
                {arena.name}
              </p>
              <h1 className="text-lg sm:text-xl font-black leading-tight">
                Nueva reserva
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full px-5 sm:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Seleccioná una cancha
            </h2>
            <p className="text-sm sm:text-base text-[#6D7580] font-serif italic mt-1">
              Elegí una opción para continuar.
            </p>
          </div>

          {courtsDisponibles.length === 0 ? (
            <p className="text-[#6D7580]">
              Todavía no hay canchas disponibles para reservar.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {courtsDisponibles.map((court) => (
                <button
                  key={court.id}
                  onClick={() => setSelectedCourtId(court.id)}
                  className={`w-full rounded-lg border p-4 text-left flex gap-3 items-center transition-all duration-300 ${
                    selectedCourtId === court.id
                      ? "bg-white border-[#06122B] shadow-md ring-1 ring-[#06122B]"
                      : "bg-white border-[#D6D0C8] hover:border-[#CD9A50] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  {court.image_url ? (
                    <img
                      src={court.image_url}
                      alt={court.name}
                      className="w-16 h-16 rounded-sm object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-sm bg-[#F5F1E9] flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[#06122B]">
                      {court.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#6D7580] mt-1">
                      {court.description || "Sin descripción"}
                    </p>

                    <p className="text-sm sm:text-base font-bold text-[#CD9A50] mt-2">
                      ${Number(court.price || 0).toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition ${
                      selectedCourtId === court.id
                        ? "border-[#06122B] bg-[#06122B]"
                        : "border-[#D6D0C8] bg-white"
                    }`}
                  >
                    {selectedCourtId === court.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg sm:text-xl font-black text-[#06122B] mb-1">
                ¿Preferís sumarte a una cancha libre?
              </h2>
              <p className="text-sm text-[#6D7580] mb-4">
                Anotate a un evento abierto sin reservar toda la cancha.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.map((ev) => (
                  <Link
                    key={ev.id}
                    to={`/cancha-libre/${ev.id}`}
                    className="block rounded-lg border border-[#D6D0C8] bg-white p-4 hover:border-[#CD9A50] hover:shadow-md transition"
                  >
                    <h3 className="font-bold text-[#06122B]">{ev.title}</h3>
                    <p className="text-sm text-[#6D7580] mt-1">
                      {ev.date} · {ev.time}
                    </p>
                    <p className="text-sm font-bold text-[#CD9A50] mt-2">
                      ${Number(ev.price || 0).toLocaleString()} por persona
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="w-full px-5 sm:px-8 py-4 border-t border-[#D6D0C8] bg-[#F5F1E9]/90 backdrop-blur-md flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-sm text-[#6D7580]">
            {selectedCourtId ? "1 cancha seleccionada" : "Elegí una cancha"}
          </p>

          <button
            disabled={!selectedCourtId}
            className="w-full sm:w-auto px-7 py-3 rounded-sm bg-[#06122B] text-[#F5F1E9] text-[13px] font-extrabold uppercase tracking-[0.16em] hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleNext}
          >
            Siguiente →
          </button>
        </footer>
      </div>
    </div>
  );
}
