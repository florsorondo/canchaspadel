import { useState } from "react";

const CANCHAS_INICIAL = [
  {
    id: 1,
    nombre: "Cancha 1 — Central",
    tipo: "Techada",
    precio: 8000,
    activa: true,
    horarios: ["08:00", "09:00", "10:00"],
  },
  {
    id: 2,
    nombre: "Cancha 2 — Sur",
    tipo: "Aire libre",
    precio: 6500,
    activa: true,
    horarios: ["09:00", "10:00"],
  },
];

const Canchas = () => {
  const [canchas, setCanchas] = useState(CANCHAS_INICIAL);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [canchaEditando, setCanchaEditando] = useState(null);
  const [canchaAEliminar, setCanchaAEliminar] = useState(null);

  const guardarCancha = (canchaGuardada) => {
    if (canchaEditando) {
      setCanchas(
        canchas.map((c) =>
          c.id === canchaEditando.id ? { ...canchaGuardada, id: c.id } : c
        )
      );
    } else {
      setCanchas([...canchas, { ...canchaGuardada, id: Date.now() }]);
    }

    setModalAbierto(false);
    setCanchaEditando(null);
  };

  const abrirEditar = (cancha) => {
    setCanchaEditando(cancha);
    setModalAbierto(true);
  };

  const eliminarCancha = (id) => {
    setCanchas(canchas.filter((cancha) => cancha.id !== id));
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold">Mis canchas</h2>

        <button
            onClick={() => {
                setCanchaEditando(null);
                setModalAbierto(true);
            }}
            className="border border-[#d7e3f3] bg-white text-[#315b96] rounded-xl px-6 py-3 font-semibold hover:bg-[#eef5ff] transition-all w-full md:w-auto"
            >
            + Agregar
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {canchas.map((cancha) => (
          <CanchaCard
            key={cancha.id}
            cancha={cancha}
            onEditar={() => abrirEditar(cancha)}
            onEliminar={() => setCanchaAEliminar(cancha)}
          />
        ))}
      </div>

      {modalAbierto && (
        <ModalCancha
          cancha={canchaEditando}
          onClose={() => {
            setModalAbierto(false);
            setCanchaEditando(null);
          }}
          onSave={guardarCancha}
        />
      )}

      {canchaAEliminar && (
        <ModalConfirmarEliminar
          cancha={canchaAEliminar}
          onClose={() => setCanchaAEliminar(null)}
          onConfirm={() => {
            eliminarCancha(canchaAEliminar.id);
            setCanchaAEliminar(null);
          }}
        />
      )}
    </div>
  );
};

const CanchaCard = ({ cancha, onEditar, onEliminar }) => (
  <div className="bg-white/80 backdrop-blur-md border border-[#e3ecf7] rounded-2xl shadow-sm overflow-hidden">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
      <div>
        <h3 className="text-xl font-bold">{cancha.nombre}</h3>
        <p className="text-[#64748b] font-semibold">
          {cancha.tipo} · ${cancha.precio}/hr
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            cancha.activa
              ? "bg-[#e8f2ff] text-[#315b96]"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {cancha.activa ? "Activa" : "Pausada"}
        </span>

        <button
          onClick={onEliminar}
          className="border border-red-200 rounded-xl px-4 py-2 text-red-500 hover:bg-red-50"
        >
          Eliminar
        </button>

        <button
          onClick={onEditar}
          className="border border-gray-200 rounded-xl px-4 py-2 text-gray-500 hover:bg-gray-50"
        >
          Editar
        </button>
      </div>
    </div>

    {cancha.horarios.length > 0 && (
      <div className="border-t p-5 flex flex-wrap gap-3">
        {cancha.horarios.map((hora) => (
          <button
            key={hora}
            className="px-4 py-2 rounded-full border border-[#cfe0f5] bg-[#eef5ff] text-[#315b96] font-semibold"
          >
            {hora}
          </button>
        ))}
      </div>
    )}
  </div>
);

const ModalCancha = ({ cancha, onClose, onSave }) => {
  const [nombre, setNombre] = useState(cancha?.nombre || "");
  const [tipo, setTipo] = useState(cancha?.tipo || "Techada");
  const [precio, setPrecio] = useState(cancha?.precio || "");
  const [activa, setActiva] = useState(cancha?.activa ?? true);
  const [horario, setHorario] = useState("");
  const [horarios, setHorarios] = useState(cancha?.horarios || []);
  const [diasHabituales, setDiasHabituales] = useState(true);
  const [diasPersonalizados, setDiasPersonalizados] = useState([]);

  const diasSemana = ["LU", "MA", "MI", "JUE", "VIE", "SAB", "DOM"];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-md border border-[#e3ecf7] rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {cancha ? "Editar cancha" : "Agregar cancha"}
        </h2>

        <input
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
          placeholder="Nombre de la cancha"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <select
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option>Techada</option>
          <option>Aire libre</option>
        </select>

        <input
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
          placeholder="Precio por hora"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <div className="mb-5">
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-4">
            <div>
              <h3 className="font-semibold text-gray-800">Días habituales</h3>
              <p className="text-sm text-gray-400">
                Usar días generales del complejo
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDiasHabituales(!diasHabituales)}
              className={`w-14 h-7 rounded-full p-1 transition ${
                diasHabituales ? "bg-[#315b96]" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition ${
                  diasHabituales ? "ml-auto" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {!diasHabituales && (
          <div className="mb-5">
            <h3 className="font-semibold mb-3">
              Personalizar días de cancha
            </h3>

            <div className="flex flex-wrap gap-2">
              {diasSemana.map((dia) => {
                const activo = diasPersonalizados.includes(dia);

                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => {
                      if (activo) {
                        setDiasPersonalizados(
                          diasPersonalizados.filter((d) => d !== dia)
                        );
                      } else {
                        setDiasPersonalizados([...diasPersonalizados, dia]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full border transition font-semibold ${
                      activo
                        ? "bg-[#315b96] text-white border-[#315b96]"
                        : "bg-white text-gray-500 border-gray-300"
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
              placeholder="Horario ej: 08:00"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            />

            <button
              type="button"
              onClick={() => {
                if (horario.trim() === "") return;
                setHorarios([...horarios, horario]);
                setHorario("");
              }}
              className="bg-[#315b96] text-white rounded-xl px-4 font-semibold hover:bg-[#254979] transition-all"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {horarios.map((h) => (
              <span
                key={h}
                className="px-3 py-1 rounded-full bg-green-50 border border-green-300 text-green-800 font-semibold"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 mb-5 text-gray-600 font-semibold">
          <input
            type="checkbox"
            checked={activa}
            onChange={(e) => setActiva(e.target.checked)}
          />
          Cancha activa
        </label>

        <div className="flex flex-col md:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-gray-300 rounded-xl px-5 py-3 font-semibold text-gray-500"
          >
            Cancelar
          </button>

          <button
            onClick={() =>
              onSave({
                nombre,
                tipo,
                precio: Number(precio),
                activa,
                horarios,
              })
            }
            className="bg-[#315b96] text-white rounded-xl px-5 py-3 font-semibold hover:bg-[#254979] transition-all"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
const ModalConfirmarEliminar = ({ cancha, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-3">
          Eliminar cancha
        </h2>
  
        <p className="text-gray-500 mb-6">
          ¿Seguro que querés eliminar{" "}
          <span className="font-semibold text-black">
            {cancha.nombre}
          </span>
          ?
        </p>
  
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-gray-300 rounded-xl px-5 py-3 font-semibold text-gray-500"
          >
            Cancelar
          </button>
  
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white rounded-xl px-5 py-3 font-semibold"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
  
export default Canchas;