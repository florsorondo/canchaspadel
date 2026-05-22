import React, { useState } from "react";

const paymentMethods = [
  {
    id: "deposit",
    icon: "MP",
    title: "Señar con Mercado Pago",
    description: "Pagás una seña ahora y el resto el día del turno.",
    detail: "Seña: $2.000 · Saldo en el club: $6.000",
  },
  {
    id: "full",
    icon: "MP",
    title: "Pagar total con Mercado Pago",
    description: "Pagás el total ahora y tu reserva queda saldada.",
    detail: "$8.000 · Confirmación inmediata",
  },
];

export default function Step3({ setStep }) {
  const [selectedPayment, setSelectedPayment] = useState("full");

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f8fbff] to-[#eef5ff] font-['Inter',sans-serif] overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/10 blur-3xl rounded-full" />

      <div className="relative min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50 w-full px-5 sm:px-8 py-4 border-b border-[#e3ecf7] bg-white/75 backdrop-blur-md flex items-center gap-3">
          <button
            onClick={() => setStep(2)}
            className="w-9 h-9 rounded-lg border border-[#d7e3f3] bg-white text-[#315b96] hover:bg-[#eef5ff] transition"
          >
            ←
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#0f172a]">
              Método de pago
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b]">
              Confirmá tu reserva con Mercado Pago
            </p>
          </div>
        </header>

        <main className="flex-1 w-full px-5 sm:px-8 py-6 sm:py-8">
          <section className="bg-white/80 backdrop-blur-md border border-[#e3ecf7] rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#0f172a]">
                Resumen de reserva
              </h2>
              <p className="text-sm text-[#64748b] mt-1">
                Revisá los datos antes de elegir el pago.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] p-4 sm:p-5 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#64748b] font-medium">
                  Cancha
                </span>
                <span className="text-sm sm:text-base text-[#0f172a] font-semibold text-right">
                  Cancha 1 — Central
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#64748b] font-medium">
                  Fecha
                </span>
                <span className="text-sm sm:text-base text-[#0f172a] font-semibold text-right">
                  Sáb 9 de mayo
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
                <span className="text-base text-[#0f172a] font-semibold">
                  Total
                </span>
                <span className="text-lg text-[#315b96] font-bold">
                  $8.000
                </span>
              </div>
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-[#0f172a]">
                ¿Cómo querés confirmar tu reserva?
              </h2>
              <p className="text-sm text-[#64748b] mt-1">
                La reserva se confirma pagando con Mercado Pago.
              </p>
            </div>

            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full rounded-2xl border p-4 text-left flex items-center gap-4 transition-all duration-300 ${
                    selectedPayment === method.id
                      ? "bg-[#eef6ff] border-[#4f8fe8] shadow-md ring-2 ring-[#4f8fe8]/20"
                      : "bg-white border-[#e2e8f0] shadow-sm hover:border-[#9ec5f0] hover:shadow-md hover:-translate-y-1"
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#e8f2ff] flex items-center justify-center text-[#315b96] font-bold flex-shrink-0">
                    {method.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0f172a]">
                      {method.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#64748b] mt-1">
                      {method.description}
                    </p>

                    <p className="text-sm sm:text-base font-semibold text-[#315b96] mt-2">
                      {method.detail}
                    </p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      selectedPayment === method.id
                        ? "border-[#5b8def] bg-[#5b8def]"
                        : "border-[#cbd5e1] bg-white"
                    }`}
                  >
                    {selectedPayment === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-white border border-[#e2e8f0] p-4 text-sm text-[#64748b]">
              Si elegís señar, el saldo restante se puede abonar en el club con
              Mercado Pago, efectivo o tarjeta.
            </div>
          </section>
        </main>

        <footer className="w-full px-5 sm:px-8 py-4 border-t border-[#e3ecf7] bg-white/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-sm text-[#64748b]">
            Opción seleccionada:{" "}
            <span className="font-semibold text-[#315b96]">
              {selectedPayment === "full"
                ? "Pago total con Mercado Pago"
                : "Seña con Mercado Pago"}
            </span>
          </p>

          <button
            onClick={() => setStep(4)}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#315b96] text-white text-sm font-semibold shadow-lg hover:bg-[#254979] hover:shadow-xl transition-all"
          >
            Siguiente →
          </button>
        </footer>
      </div>
    </div>
  );
}