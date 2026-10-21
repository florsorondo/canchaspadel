import { useState } from "react";
import { useCourtAvailability } from "../../hooks/useCourtAvailability";

const DIAS_SEMANA_POR_INDICE = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

const toISODate = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export default function Step2({ booking, updateBooking, setStep }) {
  const court = booking.court;

  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString("es-AR", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [selectedDate, setSelectedDate] = useState(booking.date || null);
  const [selectedTime, setSelectedTime] = useState(booking.time || null);

  const { hours, loading: loadingHours } = useCourtAvailability(
    court?.id,
    selectedDate
  );

  // Ordenados y con los horarios de hoy que ya pasaron marcados como no disponibles
  const todayISO = toISODate(today.getFullYear(), today.getMonth(), today.getDate());
  const nowHHMM = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

  const visibleHours = [...hours]
    .sort((a, b) => a.hour.localeCompare(b.hour))
    .map((item) => ({
      ...item,
      unavailable: item.taken || (selectedDate === todayISO && item.hour <= nowHHMM),
    }));

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateISO = toISODate(year, month, day);
    const dateObj = new Date(year, month, day);
    const weekday = DIAS_SEMANA_POR_INDICE[dateObj.getDay()];
    const disabled =
      dateObj < startOfToday || !(court?.available_days || []).includes(weekday);

    return { day, dateISO, disabled };
  });

  // Casilleros vacíos para que el día 1 caiga en su columna (la semana empieza el lunes)
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;

  const handleSelectDay = (dateISO) => {
    setSelectedDate(dateISO);
    setSelectedTime(null);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) return;
    updateBooking({ date: selectedDate, time: selectedTime });
    setStep(3);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F1E9] text-[#06122B] overflow-hidden">
      <div className="relative min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50 w-full px-5 sm:px-8 py-4 border-b border-[#D6D0C8] bg-[#F5F1E9]/90 backdrop-blur-md flex items-center gap-3">
          <button
            onClick={() => setStep(1)}
            className="w-9 h-9 rounded-sm border border-[#D6D0C8] bg-white text-[#06122B] hover:border-[#06122B] transition"
          >
            ←
          </button>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#CD9A50] font-semibold">
              {court?.name}
            </p>
            <h1 className="text-lg sm:text-xl font-black">Fecha y horario</h1>
          </div>
        </header>

        <main className="flex-1 w-full px-5 sm:px-8 py-6 sm:py-8">
          <section className="bg-white border border-[#D6D0C8] rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMonthOffset((m) => Math.max(m - 1, 0))}
                disabled={monthOffset === 0}
                className="w-9 h-9 rounded-sm border border-[#D6D0C8] bg-white text-[#06122B] hover:border-[#06122B] transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ‹
              </button>

              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-black capitalize">
                  {monthName} {year}
                </h2>
                <p className="text-sm text-[#6D7580] font-serif italic mt-1">
                  Elegí una fecha disponible.
                </p>
              </div>

              <button
                onClick={() => setMonthOffset((m) => m + 1)}
                className="w-9 h-9 rounded-sm border border-[#D6D0C8] bg-white text-[#06122B] hover:border-[#06122B] transition"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3">
              {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold uppercase tracking-wide text-[#6D7580]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {Array.from({ length: leadingBlanks }, (_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {days.map((item) => (
                <button
                  key={item.day}
                  disabled={item.disabled}
                  onClick={() => handleSelectDay(item.dateISO)}
                  className={`h-14 sm:h-20 rounded-sm text-sm font-semibold transition-all duration-300 ${
                    item.disabled
                      ? "bg-[#F5F1E9] text-[#D6D0C8] cursor-not-allowed line-through"
                      : selectedDate === item.dateISO
                      ? "bg-[#06122B] text-white shadow-md scale-[1.02]"
                      : "bg-[#F5F1E9] text-[#06122B] border border-[#D6D0C8] hover:border-[#CD9A50] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  {item.day}
                </button>
              ))}
            </div>
          </section>

          {selectedDate && (
            <section className="mt-5 bg-white border border-[#D6D0C8] rounded-lg p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-black">Turnos disponibles</h2>
                <p className="text-sm text-[#6D7580] mt-1">
                  Elegí un horario para tu reserva.
                </p>
              </div>

              {loadingHours ? (
                <p className="text-[#6D7580]">Cargando horarios...</p>
              ) : hours.length === 0 ? (
                <p className="text-[#6D7580]">
                  Esta cancha no tiene turnos configurados para este día.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {visibleHours.map((item) => (
                    <button
                      key={item.hour}
                      disabled={item.unavailable}
                      onClick={() => setSelectedTime(item.hour)}
                      className={`py-3 rounded-sm text-sm font-semibold transition-all duration-300 ${
                        item.unavailable
                          ? "bg-[#F5F1E9] text-[#D6D0C8] cursor-not-allowed line-through"
                          : selectedTime === item.hour
                          ? "bg-[#06122B] text-white shadow-md"
                          : "bg-white text-[#06122B] border border-[#D6D0C8] hover:border-[#CD9A50] hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      {item.hour}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        <footer className="w-full px-5 sm:px-8 py-4 border-t border-[#D6D0C8] bg-[#F5F1E9]/90 backdrop-blur-md flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-sm text-[#6D7580]">
            {selectedDate && selectedTime
              ? `${selectedDate} · ${selectedTime}`
              : "Elegí día y horario"}
          </p>

          <button
            disabled={!selectedDate || !selectedTime}
            onClick={handleNext}
            className="w-full sm:w-auto px-7 py-3 rounded-sm bg-[#06122B] text-[#F5F1E9] text-[13px] font-extrabold uppercase tracking-[0.16em] hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </footer>
      </div>
    </div>
  );
}
