import { useState } from "react";
import { useParams } from "react-router-dom";

import Step1 from "../components/stepper/Step1";
import Step2 from "../components/stepper/Step2";
import Step3 from "../components/stepper/Step3";
import Loader from "../components/Loader";
import { useArenaById } from "../hooks/useArenaById";

const emptyBooking = {
  court: null,
  date: null,
  time: null,
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  paymentOption: "full",
};

export default function BookingSteps() {
  const { arenaId } = useParams();
  const { arena, loading: loadingArena, error: errorArena } = useArenaById(arenaId);

  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(emptyBooking);

  const updateBooking = (patch) =>
    setBooking((prev) => ({ ...prev, ...patch }));

  if (loadingArena) {
    return <Loader />;
  }

  if (errorArena || !arena) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] font-['Inter',sans-serif]">
        <p className="text-[#0f172a] text-lg font-medium">
          Complejo no encontrado
        </p>
      </div>
    );
  }

  const stepProps = { arena, arenaId, booking, updateBooking, setStep };

  switch (step) {
    case 1:
      return <Step1 {...stepProps} />;
    case 2:
      return <Step2 {...stepProps} />;
    case 3:
      return <Step3 {...stepProps} />;
    default:
      return <Step1 {...stepProps} />;
  }
}
