import { useEffect, useState } from "react";

const Campo = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-[#334155] mb-2">
      {label}
    </label>
    {children}
  </div>
);

const abonoInicial = {
  cliente: "",
  telefono: "",
  cancha: "Cancha 1",
  diaSemana: "lunes",
  horaInicio: "19:00",
  horaFin: "20:30",
  mes: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  precioMensual: "",
  estadoPago: "Pendiente",
  vencimientoPago: "",
  observaciones: "",
};

export default function Abonos() {
  const [abono, setAbono] = useState(abonoInicial);
  const [abonos, setAbonos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  

  const cargarAbonos = () => {
    const guardados = JSON.parse(localStorage.getItem("abonos")) || [];
    setAbonos(guardados);
  };

  useEffect(() => {
    cargarAbonos();
  }, []);

  const estaVencido = (item) => {
    if (item.estadoPago === "Pagado") return false;
    if (!item.vencimientoPago) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const vencimiento = new Date(item.vencimientoPago);
    vencimiento.setHours(0, 0, 0, 0);

    return vencimiento < hoy;
  };

  const ordenarPorVencimiento = (lista) => {
    return [...lista].sort((a, b) => {
      if (!a.vencimientoPago) return 1;
      if (!b.vencimientoPago) return -1;
      return new Date(a.vencimientoPago) - new Date(b.vencimientoPago);
    });
  };

  const generarReservasDelMes = (abonoCreado) => {
    const diasSemana = {
      domingo: 0,
      lunes: 1,
      martes: 2,
      miercoles: 3,
      jueves: 4,
      viernes: 5,
      sabado: 6,
    };

    const reservas = [];
    const year = Number(abonoCreado.year);
    const month = Number(abonoCreado.mes);
    const diaBuscado = diasSemana[abonoCreado.diaSemana];

    const fecha = new Date(year, month - 1, 1);

    while (fecha.getMonth() === month - 1) {
      if (fecha.getDay() === diaBuscado) {
        reservas.push({
          id: Date.now() + reservas.length,
          abonoId: abonoCreado.id,
          cliente: abonoCreado.cliente,
          telefono: abonoCreado.telefono,
          cancha: abonoCreado.cancha,
          fecha: fecha.toISOString().split("T")[0],
          horaInicio: abonoCreado.horaInicio,
          horaFin: abonoCreado.horaFin,
          tipo: "abono",
          estadoPago: abonoCreado.estadoPago,
          precio: abonoCreado.precioMensual,
        });
      }

      fecha.setDate(fecha.getDate() + 1);
    }

    return reservas;
  };

  const guardarAbono = (e) => {
    e.preventDefault();

    if (!abono.cliente || !abono.telefono || !abono.precioMensual) {
      alert("Completá cliente, teléfono y precio mensual.");
      return;
    }

    const abonosActuales = JSON.parse(localStorage.getItem("abonos")) || [];
    const reservasActuales = JSON.parse(localStorage.getItem("reservas")) || [];

    if (editandoId) {
      const abonoEditado = {
        ...abono,
        id: editandoId,
        activo: true,
      };

      const abonosActualizados = abonosActuales.map((item) =>
        item.id === editandoId ? abonoEditado : item
      );

      const reservasSinEseAbono = reservasActuales.filter(
        (reserva) => reserva.abonoId !== editandoId
      );

      const reservasNuevas = generarReservasDelMes(abonoEditado);

      localStorage.setItem("abonos", JSON.stringify(abonosActualizados));
      localStorage.setItem(
        "reservas",
        JSON.stringify([...reservasSinEseAbono, ...reservasNuevas])
      );

      alert("Abono actualizado correctamente.");
    } else {
      const nuevoAbono = {
        id: Date.now(),
        ...abono,
        activo: true,
        fechaCreacion: new Date().toISOString(),
      };

      const nuevasReservas = generarReservasDelMes(nuevoAbono);

      localStorage.setItem(
        "abonos",
        JSON.stringify([...abonosActuales, nuevoAbono])
      );

      localStorage.setItem(
        "reservas",
        JSON.stringify([...reservasActuales, ...nuevasReservas])
      );

      alert("Abono creado y reservas cargadas correctamente.");
    }

    setAbono(abonoInicial);
    setEditandoId(null);
    cargarAbonos();
  };

  const editarAbono = (item) => {
    setAbono({
      cliente: item.cliente || "",
      telefono: item.telefono || "",
      cancha: item.cancha || "Cancha 1",
      diaSemana: item.diaSemana || "lunes",
      horaInicio: item.horaInicio || "19:00",
      horaFin: item.horaFin || "20:30",
      mes: item.mes || new Date().getMonth() + 1,
      year: item.year || new Date().getFullYear(),
      precioMensual: item.precioMensual || "",
      estadoPago: item.estadoPago || "Pendiente",
      vencimientoPago: item.vencimientoPago || "",
      observaciones: item.observaciones || "",
    });

    setEditandoId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setAbono(abonoInicial);
    setEditandoId(null);
  };

  const cancelarAbono = (id) => {
    const confirmar = window.confirm(
      "¿Seguro que querés cancelar este abono? También se eliminarán sus reservas."
    );

    if (!confirmar) return;

    const abonosActuales = JSON.parse(localStorage.getItem("abonos")) || [];
    const reservasActuales = JSON.parse(localStorage.getItem("reservas")) || [];

    const abonosFiltrados = abonosActuales.filter((item) => item.id !== id);
    const reservasFiltradas = reservasActuales.filter(
      (reserva) => reserva.abonoId !== id
    );

    localStorage.setItem("abonos", JSON.stringify(abonosFiltrados));
    localStorage.setItem("reservas", JSON.stringify(reservasFiltradas));

    cargarAbonos();
  };

  const renovarAbono = (abonoRenovar) => {
    const nuevoMes =
      Number(abonoRenovar.mes) === 12 ? 1 : Number(abonoRenovar.mes) + 1;

    const nuevoYear =
      Number(abonoRenovar.mes) === 12
        ? Number(abonoRenovar.year) + 1
        : Number(abonoRenovar.year);

    const abonoRenovado = {
      ...abonoRenovar,
      id: Date.now(),
      mes: nuevoMes,
      year: nuevoYear,
      estadoPago: "Pendiente",
      fechaCreacion: new Date().toISOString(),
    };

    const abonosActuales = JSON.parse(localStorage.getItem("abonos")) || [];
    const reservasActuales = JSON.parse(localStorage.getItem("reservas")) || [];

    const nuevasReservas = generarReservasDelMes(abonoRenovado);

    localStorage.setItem(
      "abonos",
      JSON.stringify([...abonosActuales, abonoRenovado])
    );

    localStorage.setItem(
      "reservas",
      JSON.stringify([...reservasActuales, ...nuevasReservas])
    );

    cargarAbonos();

    alert("Abono renovado para el mes siguiente.");
  };

  const cambiarEstadoPago = (id) => {
    const abonosActuales = JSON.parse(localStorage.getItem("abonos")) || [];

    const abonosActualizados = abonosActuales.map((item) =>
      item.id === id
        ? {
            ...item,
            estadoPago: item.estadoPago === "Pagado" ? "Pendiente" : "Pagado",
          }
        : item
    );

    localStorage.setItem("abonos", JSON.stringify(abonosActualizados));
    cargarAbonos();
  };

  const abonosPendientes = ordenarPorVencimiento(
    abonos.filter((item) => item.estadoPago !== "Pagado")
  );

  const abonosPagados = ordenarPorVencimiento(
    abonos.filter((item) => item.estadoPago === "Pagado")
  );

  const TarjetaAbono = ({ item }) => (
    <div className="relative z-10 rounded-3xl border border-[#dbe7f6] bg-[#f8fbff] p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#0f172a]">{item.cliente}</h3>

          <p className="text-sm text-[#64748b]">{item.telefono}</p>

          <p className="text-sm text-[#334155] mt-2">
            {item.cancha} · {item.diaSemana} · {item.horaInicio} a{" "}
            {item.horaFin}
          </p>

          <p className="text-sm text-[#334155]">
            Mes {item.mes}/{item.year} · $
            {Number(item.precioMensual).toLocaleString("es-AR")}
          </p>

          {item.vencimientoPago && (
            <p className="text-sm text-[#64748b] mt-1">
              Vence: {item.vencimientoPago}
            </p>
          )}

          {item.estadoPago !== "Pagado" && (
            <p className="text-sm text-red-600 font-semibold mt-2">
              Debe: ${Number(item.precioMensual).toLocaleString("es-AR")}
            </p>
          )}
        </div>

        <span
          className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${
            item.estadoPago === "Pagado"
              ? "bg-green-100 text-green-700"
              : estaVencido(item)
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {item.estadoPago === "Pagado"
            ? "Pagado"
            : estaVencido(item)
            ? "Vencido"
            : "Pendiente"}
        </span>
      </div>

      {item.observaciones && (
        <p className="text-sm text-[#64748b] mt-3">{item.observaciones}</p>
      )}

      <div className="grid sm:grid-cols-4 gap-3 mt-4">
        <button
          type="button"
          onClick={() => editarAbono(item)}
          className="py-3 rounded-2xl bg-slate-600 text-white font-semibold hover:bg-slate-700"
        >
          Editar
        </button>

        <button
          type="button"
          onClick={() => renovarAbono(item)}
          className="py-3 rounded-2xl bg-[#4f8fe8] text-white font-semibold hover:bg-[#3d7ed8]"
        >
          Renovar
        </button>

        <button
          type="button"
          onClick={() => cambiarEstadoPago(item.id)}
          className={`py-3 rounded-2xl text-white font-semibold ${
            item.estadoPago === "Pagado"
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {item.estadoPago === "Pagado" ? "Marcar pendiente" : "Marcar pagado"}
        </button>

        <button
          type="button"
          onClick={() => cancelarAbono(item.id)}
          className="py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8fbff] to-[#eef5ff] px-5 sm:px-8 py-8">
      <section className="max-w-5xl mx-auto bg-white border border-[#dbe7f6] rounded-3xl shadow-sm p-6 sm:p-8">
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">
            Abonos mensuales
          </h1>
          <p className="text-sm text-[#64748b] mt-2">
            Cargá reservas fijas mensuales, controlá pagos y renovaciones.
          </p>
        </div>

        <form onSubmit={guardarAbono} className="grid gap-5">
          <div className="rounded-3xl border border-[#dbe7f6] bg-[#f8fbff] p-5">
            <h2 className="text-lg font-bold text-[#0f172a] mb-4">
              {editandoId ? "Editar abono" : "Crear nuevo abono"}
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Campo label="Nombre del cliente">
                <input
                  value={abono.cliente}
                  onChange={(e) =>
                    setAbono({ ...abono, cliente: e.target.value })
                  }
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3] outline-none"
                />
              </Campo>

              <Campo label="Teléfono">
                <input
                  value={abono.telefono}
                  onChange={(e) =>
                    setAbono({ ...abono, telefono: e.target.value })
                  }
                  placeholder="Ej: 1123456789"
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3] outline-none"
                />
              </Campo>
            </div>

            <div className="grid sm:grid-cols-4 gap-4 mt-4">
              <Campo label="Cancha">
                <select
                  value={abono.cancha}
                  onChange={(e) =>
                    setAbono({ ...abono, cancha: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3]"
                >
                  <option>Cancha 1</option>
                  <option>Cancha 2</option>
                  <option>Cancha 3</option>
                  <option>Cancha 4</option>
                </select>
              </Campo>

              <Campo label="Día fijo">
                <select
                  value={abono.diaSemana}
                  onChange={(e) =>
                    setAbono({ ...abono, diaSemana: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3]"
                >
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miercoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                  <option value="sabado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>
              </Campo>

              <Campo label="Hora inicio">
                <input
                  type="time"
                  value={abono.horaInicio}
                  onChange={(e) =>
                    setAbono({ ...abono, horaInicio: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3]"
                />
              </Campo>

              <Campo label="Hora fin">
                <input
                  type="time"
                  value={abono.horaFin}
                  onChange={(e) =>
                    setAbono({ ...abono, horaFin: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3]"
                />
              </Campo>
            </div>

            <div className="grid sm:grid-cols-4 gap-4 mt-4">
              <Campo label="Mes">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={abono.mes}
                  onChange={(e) => setAbono({ ...abono, mes: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3]"
                />
              </Campo>

              <Campo label="Año">
                <input
                  type="number"
                  value={abono.year}
                  onChange={(e) => setAbono({ ...abono, year: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3]"
                />
              </Campo>

              <Campo label="Precio mensual">
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={abono.precioMensual}
                  onChange={(e) =>
                    setAbono({ ...abono, precioMensual: e.target.value })
                  }
                  placeholder="Ej: 80000"
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3]"
                />
              </Campo>

              <Campo label="Estado de pago">
                <select
                  value={abono.estadoPago}
                  onChange={(e) =>
                    setAbono({ ...abono, estadoPago: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3]"
                >
                  <option>Pendiente</option>
                  <option>Pagado</option>
                </select>
              </Campo>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Campo label="Vencimiento de pago">
                <input
                  type="date"
                  value={abono.vencimientoPago}
                  onChange={(e) =>
                    setAbono({ ...abono, vencimientoPago: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3]"
                />
              </Campo>

              <Campo label="Observaciones">
                <textarea
                  value={abono.observaciones}
                  onChange={(e) =>
                    setAbono({ ...abono, observaciones: e.target.value })
                  }
                  placeholder="Ej: paga por transferencia"
                  className="w-full px-4 py-3 rounded-2xl border border-[#d7e3f3] outline-none min-h-[48px]"
                />
              </Campo>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              <button className="w-full py-4 rounded-2xl bg-[#315b96] text-white font-semibold hover:bg-[#254979] transition-all shadow-md">
                {editandoId ? "Guardar cambios" : "Crear abono mensual"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="w-full py-4 rounded-2xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-all"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-10 grid gap-8">
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">
              Abonos pendientes
            </h2>

            {abonosPendientes.length === 0 ? (
              <p className="text-sm text-[#64748b]">
                No hay abonos pendientes.
              </p>
            ) : (
              <div className="grid gap-4">
                {abonosPendientes.map((item) => (
                  <TarjetaAbono key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">
              Abonos pagados
            </h2>

            {abonosPagados.length === 0 ? (
              <p className="text-sm text-[#64748b]">No hay abonos pagados.</p>
            ) : (
              <div className="grid gap-4">
                {abonosPagados.map((item) => (
                  <TarjetaAbono key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}