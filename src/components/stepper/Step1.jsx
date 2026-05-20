import React, { useState } from "react";
import CANCHA1 from "../../assets/cancha1.png";
import CANCHA2 from "../../assets/cancha2.png";
import CANCHA3 from "../../assets/cancha3.png";
import CANCHA4 from "../../assets/cancha4.png";
import DIBUJOAZUL from "../../assets/dibujoazul.png";

const courts = [
  {
    id: 1,
    name: "Cancha 1",
    description: "Techada · Iluminada · Césped sintético",
    price: "$8.000",
    tag: "Disponible",
    image: CANCHA1,
  },
  {
    id: 2,
    name: "Cancha 2",
    description: "Al aire libre · Moqueta",
    price: "$6.500",
    tag: "Al aire libre",
    image: CANCHA2,
  },
  {
    id: 3,
    name: "Cancha 3",
    description: "Techada · Cristal panorámico",
    price: "$9.000",
    tag: "Premium",
    image: CANCHA3,
  },
  {
    id: 4,
    name: "Cancha 4",
    description: "Techada · Premium · Iluminada",
    price: "$9.500",
    tag: "Más elegida",
    image: CANCHA4,
  },
];

export default function Step1({ setStep }) {
  const [selectedCourt, setSelectedCourt] = useState(1);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f8fbff] to-[#eef5ff] font-['Inter',sans-serif] overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/10 blur-3xl rounded-full" />

      <div className="relative min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50 w-full px-5 sm:px-8 py-4 border-b border-[#e3ecf7] bg-white/75 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg border border-[#d7e3f3] bg-white text-[#315b96] hover:bg-[#eef5ff] transition">
              ←
            </button>

            <img
              src={DIBUJOAZUL}
              alt="Logo Distrito"
              className="w-10 h-10 object-contain"
            />

            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-[#0f172a] leading-tight">
                Distrito San Vicente
              </h1>
              <p className="text-xs sm:text-sm text-[#64748b]">
                Nueva reserva
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full px-5 sm:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0f172a]">
              Seleccioná una cancha
            </h2>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Elegí una opción para continuar.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {courts.map((court) => (
              <button
                key={court.id}
                onClick={() => setSelectedCourt(court.id)}
                className={`w-full rounded-2xl border p-3 text-left flex gap-3 items-center transition-all duration-300 ${
                  selectedCourt === court.id
                    ? "bg-[#eef6ff] border-[#4f8fe8] shadow-md ring-2 ring-[#4f8fe8]/20 scale-[1.01]"
                    : "bg-white border-[#e2e8f0] shadow-sm hover:border-[#9ec5f0] hover:shadow-md hover:-translate-y-1"
                }`}
              >
                <div className="relative w-28 h-24 rounded-xl overflow-hidden bg-[#edf2f7] flex-shrink-0">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0f172a]">
                      {court.name}
                    </h3>

                    <span className="px-2 py-1 rounded-full bg-[#e8f2ff] text-[#315b96] text-xs font-medium">
                      {court.tag}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#64748b] mt-1">
                    {court.description}
                  </p>

                  <p className="text-sm sm:text-base font-semibold text-[#315b96] mt-2">
                    {court.price}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition ${
                    selectedCourt === court.id
                      ? "border-[#5b8def] bg-[#5b8def]"
                      : "border-[#cbd5e1] bg-white"
                  }`}
                >
                  {selectedCourt === court.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </main>

        <footer className="w-full px-5 sm:px-8 py-4 border-t border-[#e3ecf7] bg-white/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-sm text-[#64748b]">1 cancha seleccionada</p>

          <button 
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#315b96] text-white text-sm font-semibold shadow-lg hover:bg-[#254979] hover:shadow-xl transition-all"
            onClick={() => setStep(2)}

          >
            Siguiente →
          </button>
        </footer>
      </div>
    </div>
  );
}