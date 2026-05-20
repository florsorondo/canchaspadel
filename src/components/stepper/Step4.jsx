import React from "react";

export default function Step4({ setStep }) {
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
            ⌂
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#0f172a]">
              Reserva confirmada
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b]">
              Tu turno fue reservado correctamente
            </p>
          </div>
        </header>

        <main className="flex-1 w-full px-5 sm:px-8 py-8 flex items-center justify-center">
          <section className="w-full max-w-3xl bg-white/80 backdrop-blur-md border border-[#e3ecf7] rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[#e8f7f3] flex items-center justify-center mb-5">
                <div className="w-10 h-10 rounded-full border-2 border-[#2f6f61] flex items-center justify-center text-[#2f6f61] text-xl font-bold">
                  ✓
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-[#0f172a]">
                ¡Turno reservado!
              </h2>

              <p className="text-sm sm:text-base text-[#64748b] mt-2">
                Te mandamos la confirmación por WhatsApp
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] p-4 sm:p-5 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#64748b] font-medium">
                  Reserva Nº
                </span>
                <span className="text-sm sm:text-base text-[#0f172a] font-semibold text-right">
                  #0047
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#64748b] font-medium">
                  Cancha
                </span>
                <span className="text-sm sm:text-base text-[#0f172a] font-semibold text-right">
                  Central — Arenas SV
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#64748b] font-medium">
                  Fecha
                </span>
                <span className="text-sm sm:text-base text-[#0f172a] font-semibold text-right">
                  Sáb 9 de mayo 2026
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#64748b] font-medium">
                  Horario
                </span>
                <span className="text-sm sm:text-base text-[#0f172a] font-semibold text-right">
                  10:00 - 11:30 hs
                </span>
              </div>

              <div className="border-t border-[#e2e8f0] pt-3 flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#64748b] font-medium">
                  Estado pago
                </span>
                <span className="text-sm sm:text-base text-[#2f6f61] font-bold">
                  Pagado
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="w-full px-7 py-3 rounded-xl bg-[#315b96] text-white text-sm font-semibold shadow-lg hover:bg-[#254979] hover:shadow-xl transition-all">
                Compartir por WhatsApp
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full px-7 py-3 rounded-xl bg-white text-[#315b96] border border-[#d7e3f3] text-sm font-semibold hover:bg-[#eef5ff] transition-all"
              >
                Hacer otra reserva
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}