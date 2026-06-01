import { useEffect } from "react";
import { X } from "lucide-react";

export default function VerInscriptos({ evento, onClose }) {
  if (!evento) return null;

  const anotados = evento.anotados || [];
  useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === "Escape") onClose();
  };

  window.addEventListener("keydown", handleEsc);

  return () => window.removeEventListener("keydown", handleEsc);
}, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      <aside className="absolute right-0 top-0 h-full w-full sm:w-[430px] bg-white shadow-2xl p-6 overflow-y-auto animate-slide-in">
        <div className="flex items-start justify-between gap-4 border-b border-[#e2e8f0] pb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">
              Inscriptos
            </h2>
            <p className="text-sm text-[#64748b] mt-1">
              {evento.nombre} · {evento.dia || "Sin fecha"} ·{" "}
              {evento.horario || "Sin horario"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#475569] flex items-center justify-center hover:bg-[#e2e8f0]"
          >
            <X size={22} />
          </button>
        </div>

        {anotados.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-[#f8fbff] border border-[#dbe7f6] p-6 text-center">
            <p className="font-semibold text-[#0f172a]">
              Todavía no hay inscriptos
            </p>
            <p className="text-sm text-[#64748b] mt-2">
              Cuando alguien se anote desde el link, va a aparecer acá.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {anotados.map((persona, index) => (
              <div
                key={persona.id || index}
                className="rounded-3xl border border-[#e2e8f0] p-4 bg-white"
              >
                <h3 className="font-bold text-[#0f172a]">
                  {persona.nombre || "Sin nombre"}
                </h3>

                <p className="text-sm text-[#64748b] mt-1">
                  Tel: {persona.telefono || "Sin teléfono"}
                </p>

                <p className="text-sm text-[#64748b]">
                  Email: {persona.email || "Sin email"}
                </p>

                <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                  {persona.estadoPago || "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}