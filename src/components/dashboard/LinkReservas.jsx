import { useState } from "react";
import { SecondaryButton } from "./shared";

const LinkReservas = ({ arenaId }) => {
  const [copiado, setCopiado] = useState(false);

  if (!arenaId) return null;

  const link = `${window.location.origin}/booking/${arenaId}`;
  const mensaje = `¡Reservá tu cancha en Distrito San Vicente! ${link}`;

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      prompt("Copiá el link:", link);
    }
  };

  return (
    <div className="bg-[#F5F1E9] border border-[#D6D0C8] rounded-lg p-4 sm:p-5 mb-6 flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-1">
          Link de reservas
        </p>
        <p className="text-[#6D7580] text-sm mb-2">
          Compartilo con tus clientes para que reserven directo.
        </p>
        <p className="font-mono text-sm text-[#06122B] bg-white border border-[#D6D0C8] rounded-sm px-3 py-2 truncate">
          {link}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <SecondaryButton onClick={handleCopiar} className="w-full sm:w-auto">
          {copiado ? "¡Copiado!" : "Copiar link"}
        </SecondaryButton>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#06122B] text-[#F5F1E9] font-extrabold uppercase tracking-[0.16em] text-[12px] rounded-sm px-6 py-3 hover:opacity-90 transition text-center w-full sm:w-auto"
        >
          Enviar por WhatsApp
        </a>
      </div>
    </div>
  );
};

export default LinkReservas;
