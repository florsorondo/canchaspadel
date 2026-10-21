import { useState } from "react";
import { useArena } from "../../hooks/useArena";
import { useStaff } from "../../hooks/useStaff";
import { Modal, PrimaryButton, SecondaryButton } from "./shared";
import Loader from "../Loader";

const emptyForm = { name: "", email: "", password: "" };

const Equipo = () => {
  const { arenaId, loadingArena } = useArena();
  const { staff, loading, saving, error, createStaff, deleteStaff } = useStaff(arenaId);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);

  if (loadingArena || (loading && staff.length === 0)) {
    return <Loader />;
  }

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormError("Completá nombre, email y contraseña");
      return;
    }

    if (form.password.length < 6) {
      setFormError("La contraseña tiene que tener al menos 6 caracteres");
      return;
    }

    const result = await createStaff(form);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    cerrarModal();
  };

  const handleEliminar = async (empleado) => {
    if (!confirm(`¿Dar de baja a ${empleado.name}? Ya no va a poder iniciar sesión.`)) return;

    const result = await deleteStaff(empleado.id);

    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#06122B]">Equipo</h2>
          <p className="text-[#6D7580] text-sm mt-1">
            Los empleados pueden usar todo el panel menos Cobros y Equipo.
          </p>
        </div>

        <SecondaryButton onClick={() => setModalAbierto(true)} className="w-full md:w-auto">
          + Nuevo empleado
        </SecondaryButton>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex flex-col gap-3">
        {staff.length > 0 ? (
          staff.map((empleado) => (
            <div
              key={empleado.id}
              className="bg-white border border-[#D6D0C8] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="font-black text-[#06122B]">{empleado.name}</p>
                <p className="text-[#6D7580] text-sm mt-1">{empleado.email}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.12em] bg-[#EFEAE0] text-[#6D7580]">
                  Empleado
                </span>

                <SecondaryButton
                  type="button"
                  disabled={saving}
                  onClick={() => handleEliminar(empleado)}
                >
                  Dar de baja
                </SecondaryButton>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[#6D7580]">Todavía no agregaste empleados.</p>
        )}
      </div>

      {modalAbierto && (
        <Modal onClose={cerrarModal}>
          <h2 className="text-2xl font-black text-[#06122B] mb-2">Nuevo empleado</h2>
          <p className="text-sm text-[#6D7580] mb-5">
            Pasale el email y la contraseña para que inicie sesión en el panel.
          </p>

          <form onSubmit={handleCrear} className="grid gap-3">
            <input
              className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="email"
              className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              type="text"
              className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {formError && <p className="text-sm text-red-500 font-medium">{formError}</p>}

            <div className="flex justify-end gap-3 mt-3">
              <SecondaryButton type="button" onClick={cerrarModal}>
                Cancelar
              </SecondaryButton>

              <PrimaryButton disabled={saving}>
                {saving ? "Creando..." : "Crear empleado"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Equipo;
