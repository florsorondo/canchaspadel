import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Step3({ arena, arenaId, booking, updateBooking, setStep }) {
  const { court, date, time } = booking;

  const [customerName, setCustomerName] = useState(booking.customerName || "");
  const [customerEmail, setCustomerEmail] = useState(booking.customerEmail || "");
  const [customerPhone, setCustomerPhone] = useState(booking.customerPhone || "");

  const price = Number(court?.price || 0);
  const depositAmountConfigured = Number(arena?.deposit_amount || 0);
  const hasDeposit = depositAmountConfigured > 0;

  const [paymentOption, setPaymentOption] = useState(
    booking.paymentOption || (hasDeposit ? "deposit" : "full")
  );

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!arenaId) return;

    fetch(`${API_URL}/arena/${arenaId}/payment-methods`)
      .then((res) => res.json())
      .then((data) => setPaymentMethods(Array.isArray(data) ? data : []))
      .catch(() => setPaymentMethods([]));
  }, [arenaId]);

  const effectivePrice = coupon ? coupon.discounted_amount : price;
  const depositAmount = Math.min(depositAmountConfigured, effectivePrice);

  // Solo se ofrece señar si la seña es menor al precio; si no, señar sería pagar el total
  const puedeSenar = hasDeposit && depositAmountConfigured < effectivePrice;
  const opcionPago = puedeSenar ? paymentOption : "full";

  const handleAplicarCupon = async () => {
    if (!couponInput.trim()) return;

    try {
      setApplyingCoupon(true);
      setCouponError(null);

      const res = await fetch(`${API_URL}/arena/${arenaId}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), court_id: court.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        throw new Error(data.message || "Cupón inválido");
      }

      setCoupon(data);
    } catch (err) {
      setCoupon(null);
      setCouponError(err.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleConfirmar = async () => {
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError("Completá tus datos de contacto");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      updateBooking({ customerName, customerEmail, customerPhone, paymentOption: opcionPago });

      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arena_id: arenaId,
          court_id: court.id,
          date,
          time,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_phone: customerPhone.trim(),
          payment_option: opcionPago,
          coupon_code: coupon ? coupon.code : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.coupon_error) {
          setCoupon(null);
          setCouponError(data.message);
          throw new Error(`${data.message}. Quitá el cupón o probá con otro.`);
        }

        throw new Error(data.message || "No se pudo crear la reserva");
      }

      if (!data.init_point) {
        throw new Error("No se pudo iniciar el pago");
      }

      window.location.href = data.init_point;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F1E9] text-[#06122B] overflow-hidden">
      <div className="relative min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50 w-full px-5 sm:px-8 py-4 border-b border-[#D6D0C8] bg-[#F5F1E9]/90 backdrop-blur-md flex items-center gap-3">
          <button
            onClick={() => setStep(2)}
            className="w-9 h-9 rounded-sm border border-[#D6D0C8] bg-white text-[#06122B] hover:border-[#06122B] transition"
          >
            ←
          </button>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#CD9A50] font-semibold">
              Último paso
            </p>
            <h1 className="text-lg sm:text-xl font-black">Tus datos y el pago</h1>
          </div>
        </header>

        <main className="flex-1 w-full px-5 sm:px-8 py-6 sm:py-8">
          <section className="bg-white border border-[#D6D0C8] rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-black mb-5">Resumen de reserva</h2>

            <div className="rounded-lg bg-[#F5F1E9] border border-[#D6D0C8] p-4 sm:p-5 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#6D7580] font-medium">Cancha</span>
                <span className="text-sm sm:text-base text-[#06122B] font-semibold text-right">
                  {court?.name}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#6D7580] font-medium">Fecha</span>
                <span className="text-sm sm:text-base text-[#06122B] font-semibold text-right">
                  {date}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm sm:text-base text-[#6D7580] font-medium">Horario</span>
                <span className="text-sm sm:text-base text-[#06122B] font-semibold text-right">
                  {time} hs
                </span>
              </div>

              <div className="border-t border-[#D6D0C8] pt-3 flex justify-between gap-4 items-center">
                <span className="text-base text-[#06122B] font-semibold">Precio total</span>
                <span className="text-right">
                  {coupon && (
                    <span className="block text-sm text-[#6D7580] line-through">
                      ${price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-lg text-[#CD9A50] font-bold">
                    ${effectivePrice.toLocaleString()}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
                Cupón de descuento
              </p>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCoupon(null);
                    setCouponError(null);
                  }}
                  placeholder="Código"
                  className="flex-1 px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B] uppercase tracking-[0.08em]"
                />
                <button
                  type="button"
                  onClick={handleAplicarCupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="px-5 rounded-sm border border-[#06122B] text-[#06122B] font-bold text-sm hover:bg-[#06122B] hover:text-white transition disabled:opacity-40"
                >
                  {applyingCoupon ? "..." : "Aplicar"}
                </button>
              </div>

              {coupon && (
                <p className="text-sm text-[#2f6f61] font-semibold mt-2">
                  Cupón {coupon.code} aplicado ✓
                </p>
              )}

              {couponError && (
                <p className="text-sm text-red-500 font-medium mt-2">{couponError}</p>
              )}
            </div>
          </section>

          <section className="mt-5 bg-white border border-[#D6D0C8] rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-black mb-4">Tus datos de contacto</h2>

            <div className="grid gap-3">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre y apellido"
                className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
              />

              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email"
                className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
              />

              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Teléfono"
                className="px-4 py-3 rounded-sm border border-[#D6D0C8] outline-none focus:border-[#06122B]"
              />
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-black">
                ¿Cómo querés confirmar tu reserva?
              </h2>
              <p className="text-sm text-[#6D7580] mt-1">
                La seña se paga online con débito o crédito vía Mercado Pago.
              </p>
            </div>

            <div className="grid gap-3">
              {puedeSenar && (
                <button
                  onClick={() => setPaymentOption("deposit")}
                  className={`w-full rounded-lg border p-4 text-left flex items-center gap-4 transition-all duration-300 ${
                    opcionPago === "deposit"
                      ? "bg-white border-[#06122B] shadow-md ring-1 ring-[#06122B]"
                      : "bg-white border-[#D6D0C8] hover:border-[#CD9A50] hover:shadow-md"
                  }`}
                >
                  <div className="w-11 h-11 rounded-sm bg-[#F5F1E9] flex items-center justify-center text-[#06122B] font-bold flex-shrink-0">
                    MP
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-[#06122B]">
                        Señar con Mercado Pago
                      </h3>
                      <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#CD9A50] bg-[#CD9A50]/10 px-2 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6D7580] mt-1">
                      Pagás la seña ahora y el resto en el club.
                    </p>
                    <p className="text-sm sm:text-base font-bold text-[#CD9A50] mt-2">
                      Seña: ${depositAmount.toLocaleString()} · Saldo en el club: $
                      {Math.max(effectivePrice - depositAmount, 0).toLocaleString()}
                    </p>
                  </div>
                </button>
              )}

              <button
                onClick={() => setPaymentOption("full")}
                className={`w-full rounded-lg border p-4 text-left flex items-center gap-4 transition-all duration-300 ${
                  opcionPago === "full"
                    ? "bg-white border-[#06122B] shadow-md ring-1 ring-[#06122B]"
                    : "bg-white border-[#D6D0C8] hover:border-[#CD9A50] hover:shadow-md"
                }`}
              >
                <div className="w-11 h-11 rounded-sm bg-[#F5F1E9] flex items-center justify-center text-[#06122B] font-bold flex-shrink-0">
                  MP
                </div>

                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#06122B]">
                    Pagar total con Mercado Pago
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6D7580] mt-1">
                    Pagás el total ahora y tu reserva queda saldada.
                  </p>
                  <p className="text-sm sm:text-base font-bold text-[#CD9A50] mt-2">
                    ${effectivePrice.toLocaleString()} · Confirmación inmediata
                  </p>
                </div>
              </button>
            </div>

            {paymentMethods.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
                  Medios aceptados en el club para el saldo
                </p>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((pm) => (
                    <span
                      key={pm.id}
                      className="px-3 py-1.5 rounded-full border border-[#D6D0C8] bg-white text-[#06122B] text-xs font-semibold"
                    >
                      {pm.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
            )}
          </section>
        </main>

        <footer className="w-full px-5 sm:px-8 py-4 border-t border-[#D6D0C8] bg-[#F5F1E9]/90 backdrop-blur-md flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-sm text-[#6D7580]">
            Opción seleccionada:{" "}
            <span className="font-semibold text-[#06122B]">
              {opcionPago === "full" ? "Pago total" : "Seña"} con Mercado Pago
            </span>
          </p>

          <button
            onClick={handleConfirmar}
            disabled={submitting}
            className="w-full sm:w-auto px-7 py-3 rounded-sm bg-[#06122B] text-[#F5F1E9] text-[13px] font-extrabold uppercase tracking-[0.16em] hover:opacity-90 transition disabled:opacity-60"
          >
            {submitting ? "Redirigiendo a Mercado Pago..." : "Confirmar y pagar"}
          </button>
        </footer>
      </div>
    </div>
  );
}
