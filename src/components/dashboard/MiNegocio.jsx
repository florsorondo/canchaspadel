import { useState } from "react";
import { Input } from "./shared";

const MiNegocio = () => {
  const [foto, setFoto] = useState(null);

  const dias = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const pagos = [
    "Efectivo",
    "Transferencia",
    "Mercado Pago",
    "Tarjeta de débito",
    "Tarjeta de crédito",
  ];

  const [pagosActivos, setPagosActivos] = useState({
    Efectivo: true,
    Transferencia: true,
    "Mercado Pago": true,
    "Tarjeta de débito": true,
    "Tarjeta de crédito": false,
  });

  return (
    <div className="p-4 md:p-8">
      <label className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex items-center justify-center text-gray-400 mb-6 cursor-pointer overflow-hidden">
        {foto ? (
          <img
            src={foto}
            alt="Foto de portada"
            className="w-full h-full object-cover"
          />
        ) : (
          <span>
            Foto de portada · Hacé click para subir
          </span>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const archivo = e.target.files[0];

            if (archivo) {
              setFoto(URL.createObjectURL(archivo));
            }
          }}
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre del complejo"
          value="Arenas San Vicente"
        />

        <Input
          label="WhatsApp de contacto"
          value="+54 9 2214 xxxxxx"
        />

        <Input
          label="Dirección"
          value="Calle Falsa 123"
          full
        />

        <Input
          label="Apertura"
          value="07:00"
        />

        <Input
          label="Cierre"
          value="23:00"
        />

        <Input
          label="Descripción"
          value="El mejor complejo de pádel..."
          full
        />

        <Input
          label="Monto de seña"
          value="$2.000"
          full
        />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">
          Días abiertos
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dias.map((dia) => (
            <label
              key={dia}
              className="border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2 text-gray-600 font-semibold"
            >
              <input type="checkbox" defaultChecked />
              {dia}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">
          Medios de pago aceptados
        </h3>

        <div className="flex flex-col gap-3">
          {pagos.map((pago) => (
            <div
              key={pago}
              className="border border-gray-200 rounded-xl px-4 py-4 flex items-center justify-between"
            >
              <span className="text-gray-700 font-semibold">
                {pago}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPagosActivos({
                    ...pagosActivos,
                    [pago]: !pagosActivos[pago],
                  })
                }
                className={`w-14 h-7 rounded-full p-1 transition ${
                  pagosActivos[pago]
                    ? "bg-[#50a77f]"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition ${
                    pagosActivos[pago]
                      ? "ml-auto"
                      : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full mt-8 bg-[#2f765b] text-white rounded-xl py-4 font-semibold hover:bg-[#27664e]">
        ✓ Guardar cambios
      </button>
    </div>
  );
};

export default MiNegocio;