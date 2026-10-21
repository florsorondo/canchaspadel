import { useState } from "react";
import { useArena } from "../../hooks/useArena";
import { useCourts } from "../../hooks/useCourts";
import { uploadCourtPhoto } from "../../utils/uploadCourtPhoto";
import { Modal, PrimaryButton, SecondaryButton } from "./shared";
import Loader from "../Loader";

const Canchas = () => {
  const { arena, arenaId, loadingArena } = useArena();

  const {
    courts,
    loadingCourts,
    errorCourts,
    createCourt,
    deleteCourt,
    updateCourt,
  } = useCourts(arenaId);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [canchaEditando, setCanchaEditando] = useState(null);
  const [canchaAEliminar, setCanchaAEliminar] = useState(null);

  const guardarCancha = async (canchaGuardada) => {
    const payload = {
      name: canchaGuardada.nombre,
      description: canchaGuardada.tipo,
      available_days: canchaGuardada.available_days,
      available_hours: canchaGuardada.horarios,
      price: canchaGuardada.precio,
      image_url: canchaGuardada.imageUrl,
    };

    const result = canchaEditando
      ? await updateCourt(canchaEditando.id, {
          ...payload,
          available: canchaGuardada.activa,
        })
      : await createCourt(payload);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setModalAbierto(false);
    setCanchaEditando(null);
  };

  const abrirEditar = (cancha) => {
    setCanchaEditando(cancha);
    setModalAbierto(true);
  };

  if (loadingArena || loadingCourts) {
    return <Loader />;
  }

  if (errorCourts) {
    return (
      <div className="p-8">
        <p className="text-red-500">{errorCourts}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#06122B]">Mis canchas</h2>
          <p className="text-[#6D7580] text-sm mt-1">
            Configurá precio, días y horarios de cada cancha.
          </p>
        </div>

        <SecondaryButton
          onClick={() => {
            setCanchaEditando(null);
            setModalAbierto(true);
          }}
          className="w-full md:w-auto"
        >
          + Agregar
        </SecondaryButton>
      </div>

      <div className="flex flex-col gap-4">
        {courts.length > 0 ? (
          courts.map((cancha) => (
            <CanchaCard
              key={cancha.id}
              cancha={cancha}
              onEditar={() => abrirEditar(cancha)}
              onEliminar={() => setCanchaAEliminar(cancha)}
            />
          ))
        ) : (
          <p className="text-[#6D7580]">Todavía no hay canchas cargadas.</p>
        )}
      </div>

      {modalAbierto && (
        <ModalCancha
          cancha={canchaEditando}
          arenaId={arenaId}
          diasGeneralesDelComplejo={arena?.days_open}
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
          onConfirm={async () => {
            const result = await deleteCourt(canchaAEliminar.id);

            if (!result.success) {
              alert(result.error);
              return;
            }

            setCanchaAEliminar(null);
          }}
        />
      )}
    </div>
  );
};

const CanchaCard = ({ cancha, onEditar, onEliminar }) => (
  <div className="bg-white border border-[#D6D0C8] rounded-lg overflow-hidden">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
      <div className="flex items-center gap-4">
        {cancha.image_url ? (
          <img
            src={cancha.image_url}
            alt={cancha.name}
            className="w-20 h-20 rounded-sm object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-sm bg-[#F5F1E9] border border-[#D6D0C8] flex items-center justify-center text-[#6D7580] text-xs font-semibold text-center flex-shrink-0">
            Sin foto
          </div>
        )}

        <div>
          <h3 className="text-xl font-black text-[#06122B]">{cancha.name}</h3>
          <p className="text-[#6D7580] font-medium">
            {cancha.description || "Sin descripción"}
          </p>
          <p className="text-[#CD9A50] font-bold mt-1">
            ${Number(cancha.price || 0).toLocaleString()} / hora
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            cancha.available
              ? "bg-[#2f6f61]/15 text-[#2f6f61]"
              : "bg-[#EFEAE0] text-[#6D7580]"
          }`}
        >
          {cancha.available ? "Activa" : "Pausada"}
        </span>

        <button
          onClick={onEliminar}
          className="border border-red-200 rounded-sm px-4 py-2 text-red-500 hover:bg-red-50 text-sm font-semibold"
        >
          Eliminar
        </button>

        <button
          onClick={onEditar}
          className="border border-[#D6D0C8] rounded-sm px-4 py-2 text-[#06122B] hover:bg-[#F5F1E9] text-sm font-semibold"
        >
          Editar
        </button>
      </div>
    </div>

    {cancha.available_hours?.length > 0 && (
      <div className="border-t border-[#D6D0C8] p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#6D7580] mb-3">
          Turnos ({cancha.available_hours.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {[...cancha.available_hours].sort().map((hora) => (
            <span
              key={hora}
              className="px-4 py-2 rounded-full border border-[#D6D0C8] bg-[#F5F1E9] text-[#06122B] font-semibold text-sm"
            >
              {hora}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const DURACIONES = [
  { value: 60, label: "1 hora" },
  { value: 90, label: "1 hora 30" },
  { value: 120, label: "2 horas" },
];

const generarTurnos = (desde, hasta, intervaloMin) => {
  if (!desde || !hasta) return [];

  const [hDesde, mDesde] = desde.split(":").map(Number);
  const [hHasta, mHasta] = hasta.split(":").map(Number);

  let minutos = hDesde * 60 + mDesde;
  const minutosFin = hHasta * 60 + mHasta;
  const turnos = [];

  while (minutos < minutosFin) {
    const h = String(Math.floor(minutos / 60)).padStart(2, "0");
    const m = String(minutos % 60).padStart(2, "0");
    turnos.push(`${h}:${m}`);
    minutos += intervaloMin;
  }

  return turnos;
};

const SectionTitle = ({ children }) => (
  <h3 className="text-[13px] uppercase tracking-[0.14em] font-bold text-[#06122B] mb-3">
    {children}
  </h3>
);

const DIAS_SEMANA_COMPLETA = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const ModalCancha = ({ cancha, arenaId, diasGeneralesDelComplejo, onClose, onSave }) => {
  const [nombre, setNombre] = useState(cancha?.name || "");
  const [tipo, setTipo] = useState(cancha?.description || "Techada");
  const [precio, setPrecio] = useState(cancha?.price || "");
  const [activa, setActiva] = useState(cancha?.available ?? true);
  const [horarios, setHorarios] = useState(
    [...(cancha?.available_hours || [])].sort()
  );
  const [desde, setDesde] = useState("08:00");
  const [hasta, setHasta] = useState("22:00");
  const [duracion, setDuracion] = useState(90);
  const [horarioManual, setHorarioManual] = useState("");
  const [imageUrl, setImageUrl] = useState(cancha?.image_url || "");
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const agregarHorarios = (nuevos) => {
    setHorarios((actuales) =>
      Array.from(new Set([...actuales, ...nuevos])).sort()
    );
  };

  const handleGenerarTurnos = () => {
    const nuevos = generarTurnos(desde, hasta, Number(duracion));

    if (nuevos.length === 0) {
      alert("Revisá el rango: \"Hasta\" tiene que ser más tarde que \"Desde\".");
      return;
    }

    agregarHorarios(nuevos);
  };

  const handleAgregarManual = () => {
    if (!horarioManual) return;
    agregarHorarios([horarioManual]);
    setHorarioManual("");
  };

  const handleQuitarHorario = (hora) => {
    setHorarios((actuales) => actuales.filter((h) => h !== hora));
  };

  const handleFotoChange = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    try {
      setSubiendoFoto(true);
      const url = await uploadCourtPhoto(arenaId, archivo);
      setImageUrl(url);
    } catch {
      alert("No se pudo subir la foto. Probá con otra imagen (JPG o PNG de hasta 5 MB).");
    } finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  };

  const diasSemana = DIAS_SEMANA_COMPLETA;

  const diasDefault = diasGeneralesDelComplejo?.length
    ? diasGeneralesDelComplejo
    : DIAS_SEMANA_COMPLETA;

  const mismosDiasDefault =
    JSON.stringify(cancha?.available_days || []) === JSON.stringify(diasDefault);

  const [diasHabituales, setDiasHabituales] = useState(
    cancha ? mismosDiasDefault : true
  );

  const [diasPersonalizados, setDiasPersonalizados] = useState(
    cancha?.available_days || []
  );

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-black text-[#06122B] mb-4">
        {cancha ? "Editar cancha" : "Agregar cancha"}
      </h2>

      <label className="border-2 border-dashed border-[#D6D0C8] rounded-sm h-32 flex items-center justify-center text-[#6D7580] mb-3 cursor-pointer overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Foto de la cancha"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm text-center px-4">
            {subiendoFoto ? "Subiendo..." : "Foto de la cancha · Hacé click para subir"}
          </span>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={subiendoFoto}
          onChange={handleFotoChange}
        />
      </label>

      <div className="mb-6">
        <SectionTitle>Datos generales</SectionTitle>

        <input
          className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3 mb-3"
          placeholder="Nombre de la cancha"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option>Techada</option>
            <option>Aire libre</option>
          </select>

          <input
            className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
            placeholder="Precio por turno"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 pt-5 border-t border-[#D6D0C8]">
        <SectionTitle>Días de atención</SectionTitle>

        <div className="flex items-center justify-between border border-[#D6D0C8] rounded-sm px-4 py-4">
          <div>
            <p className="font-semibold text-[#06122B] text-sm">Días habituales</p>
            <p className="text-sm text-[#6D7580]">
              Usar días generales del complejo
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDiasHabituales(!diasHabituales)}
            className={`w-14 h-7 rounded-full p-1 transition flex-shrink-0 ${
              diasHabituales ? "bg-[#06122B]" : "bg-[#D6D0C8]"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition ${
                diasHabituales ? "ml-auto" : ""
              }`}
            />
          </button>
        </div>

        {!diasHabituales && (
          <div className="mt-3">
            <p className="text-sm text-[#6D7580] mb-3">
              Elegí en qué días se puede reservar esta cancha:
            </p>

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
                    className={`px-4 py-2 rounded-full border transition font-semibold text-sm capitalize ${
                      activo
                        ? "bg-[#06122B] text-white border-[#06122B]"
                        : "bg-white text-[#6D7580] border-[#D6D0C8]"
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 pt-5 border-t border-[#D6D0C8]">
        <SectionTitle>Turnos disponibles</SectionTitle>
        <p className="text-sm text-[#6D7580] mb-4">
          Estos horarios se repiten todos los días de atención elegidos arriba.
          Generalos por rango o agregalos uno por uno.
        </p>

        <div className="bg-[#F5F1E9] border border-[#D6D0C8] rounded-sm p-4 mb-3">
          <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#06122B] mb-3">
            Generar por rango horario
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            <label>
              <p className="text-xs text-[#6D7580] mb-1">Desde</p>
              <input
                type="time"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="w-full border border-[#D6D0C8] bg-white rounded-sm px-3 py-2 text-sm"
              />
            </label>

            <label>
              <p className="text-xs text-[#6D7580] mb-1">Hasta</p>
              <input
                type="time"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="w-full border border-[#D6D0C8] bg-white rounded-sm px-3 py-2 text-sm"
              />
            </label>

            <label className="col-span-2 sm:col-span-1">
              <p className="text-xs text-[#6D7580] mb-1">Duración del turno</p>
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full border border-[#D6D0C8] bg-white rounded-sm px-3 py-2 text-sm"
              >
                {DURACIONES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleGenerarTurnos}
            className="w-full bg-[#06122B] text-white rounded-sm py-2.5 text-sm font-semibold hover:opacity-90 transition"
          >
            Generar turnos
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="time"
            value={horarioManual}
            onChange={(e) => setHorarioManual(e.target.value)}
            className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-2.5 text-sm"
          />

          <button
            type="button"
            onClick={handleAgregarManual}
            className="border border-[#06122B] text-[#06122B] rounded-sm px-5 text-sm font-semibold hover:bg-[#06122B] hover:text-white transition whitespace-nowrap"
          >
            Agregar
          </button>
        </div>

        <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-[#06122B] mb-2">
          Turnos cargados ({horarios.length})
        </p>

        {horarios.length === 0 ? (
          <p className="text-sm text-[#6D7580]">
            Todavía no cargaste ningún turno para esta cancha.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {horarios.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-[#2f6f61]/10 border border-[#2f6f61]/30 text-[#2f6f61] font-semibold text-sm"
              >
                {h}
                <button
                  type="button"
                  onClick={() => handleQuitarHorario(h)}
                  aria-label={`Quitar turno ${h}`}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[#2f6f61]/20 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5 pt-5 border-t border-[#D6D0C8]">
        <label className="flex items-center gap-2 text-[#06122B] font-semibold">
          <input
            type="checkbox"
            checked={activa}
            onChange={(e) => setActiva(e.target.checked)}
          />
          Cancha activa (visible para reservar)
        </label>
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-3">
        <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>

        <PrimaryButton
          disabled={subiendoFoto}
          onClick={() =>
            onSave({
              nombre,
              tipo,
              precio: Number(precio),
              activa,
              horarios,
              imageUrl,
              available_days: diasHabituales ? diasDefault : diasPersonalizados,
            })
          }
        >
          Guardar
        </PrimaryButton>
      </div>
    </Modal>
  );
};

const ModalConfirmarEliminar = ({ cancha, onClose, onConfirm }) => (
  <Modal onClose={onClose} maxWidth="max-w-sm">
    <h2 className="text-2xl font-black text-[#06122B] mb-3">Eliminar cancha</h2>

    <p className="text-[#6D7580] mb-6">
      ¿Seguro que querés eliminar{" "}
      <span className="font-semibold text-[#06122B]">{cancha.name}</span>?
    </p>

    <div className="flex justify-end gap-3">
      <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>

      <button
        onClick={onConfirm}
        className="bg-red-500 text-white rounded-sm px-5 py-3 font-semibold hover:opacity-90 transition"
      >
        Eliminar
      </button>
    </div>
  </Modal>
);

export default Canchas;
