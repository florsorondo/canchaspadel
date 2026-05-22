import React, { useState } from "react";

const currentDate = new Date();

const year = currentDate.getFullYear();
const month = currentDate.getMonth();

const monthName = currentDate.toLocaleString("es-AR", {
  month: "long",
});

const daysInMonth = new Date(year, month + 1, 0).getDate();

const blockedDays = [12, 18, 25];

const days = Array.from({ length: daysInMonth }, (_, i) => ({
  day: i + 1,
  disabled: blockedDays.includes(i + 1),
}));

const times = [
  { start: "08:00", end: "09:30" },
  { start: "09:30", end: "11:00" },
  { start: "11:00", end: "12:30" },
  { start: "12:30", end: "14:00", disabled: true },
  { start: "14:00", end: "15:30" },
  { start: "15:30", end: "17:00" },
  { start: "17:00", end: "18:30", disabled: true },
  { start: "18:30", end: "20:00" },
  { start: "20:00", end: "21:30" },
  { start: "21:30", end: "23:00" },
  { start: "22:00", end: "23:30" },
];

export default function Step2({ setStep }) {
  const [selectedDay, setSelectedDay] = useState(9);
  const [selectedTime, setSelectedTime] = useState(times[1]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f8fbff] to-[#eef5ff] font-['Inter',sans-serif] overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/10 blur-3xl rounded-full" />

      <div className="relative min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50 w-full px-5 sm:px-8 py-4 border-b border-[#e3ecf7] bg-white/75 backdrop-blur-md flex items-center gap-3">
          <button
            onClick={() => setStep(1)}
            className="w-9 h-9 rounded-lg border border-[#d7e3f3] bg-white text-[#315b96] hover:bg-[#eef5ff] transition"
          >
            ←
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#0f172a]">
              Fecha y horario
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b]">
              Los turnos son de 1 hora y 30 minutos
            </p>
          </div>
        </header>

        <main className="flex-1 w-full px-5 sm:px-8 py-6 sm:py-8">
          <section className="bg-white/80 backdrop-blur-md border border-[#e3ecf7] rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#0f172a] capitalize">
                {monthName} {year}
              </h2>
              <p className="text-sm text-[#64748b] mt-1">
                Elegí una fecha disponible.
              </p>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3">
              {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-[#94a3b8]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {days.map((item) => (
                <button
                  key={item.day}
                  disabled={item.disabled}
                  onClick={() => setSelectedDay(item.day)}
                  className={`h-14 sm:h-20 rounded-xl text-sm font-medium transition-all duration-300 ${
                    item.disabled
                      ? "bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed line-through"
                      : selectedDay === item.day
                      ? "bg-[#315b96] text-white shadow-md ring-2 ring-[#4f8fe8]/20 scale-[1.02]"
                      : "bg-[#f8fafc] text-[#0f172a] border border-[#e2e8f0] hover:border-[#9ec5f0] hover:shadow-md hover:-translate-y-1"
                  }`}
                >
                  {item.day}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-5 bg-white/80 backdrop-blur-md border border-[#e3ecf7] rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-[#0f172a] capitalize">
                Turnos — {selectedDay} de {monthName}
              </h2>
              <p className="text-sm text-[#64748b] mt-1">
                Cada turno dura 1:30 hs. Último turno hasta las 23:30.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {times.map((item) => (
                <button
                  key={`${item.start}-${item.end}`}
                  disabled={item.disabled}
                  onClick={() => setSelectedTime(item)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    item.disabled
                      ? "bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed line-through"
                      : selectedTime.start === item.start
                      ? "bg-[#315b96] text-white shadow-md ring-2 ring-[#4f8fe8]/20"
                      : "bg-white text-[#0f172a] border border-[#e2e8f0] hover:border-[#9ec5f0] hover:shadow-md hover:-translate-y-1"
                  }`}
                >
                  {item.start} - {item.end}
                </button>
              ))}
            </div>
          </section>
        </main>

        <footer className="w-full px-5 sm:px-8 py-4 border-t border-[#e3ecf7] bg-white/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-sm text-[#64748b] capitalize">
            {selectedDay} de {monthName} · {selectedTime.start} -{" "}
            {selectedTime.end}
          </p>

          <button
            onClick={() => setStep(3)}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#315b96] text-white text-sm font-semibold shadow-lg hover:bg-[#254979] hover:shadow-xl transition-all"
          >
            Siguiente →
          </button>
        </footer>
      </div>
    </div>
  );
}