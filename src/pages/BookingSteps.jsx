import { useState } from "react";

import Step1 from "../components/stepper/Step1";
import Step2 from "../components/stepper/Step2";
import Step3 from "../components/stepper/Step3";
import Step4 from "../components/stepper/Step4";

export default function BookingSteps() {
  const [step, setStep] = useState(1);

  const handleStepper = () => {
    switch (step) {
      case 1:
        return <Step1 setStep={setStep} />;

      case 2:
        return <Step2 setStep={setStep} />;

      case 3:
        return <Step3 setStep={setStep} />;

      case 4:
        return <Step4 setStep={setStep} />;

      default:
        return <Step1 setStep={setStep} />;
    }
  };

  return (
    <div className="min-h-screen w-full">
      {handleStepper()}
    </div>
  );
  return (
  <div className="min-h-screen w-full bg-red-100">
    {handleStepper()}
  </div>
);
}