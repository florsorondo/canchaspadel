import { useMemo, useState } from "react";
import { useArena } from "../../hooks/useArena";
import { useBookings } from "../../hooks/useBookings";
import { montoCobrado } from "../../utils/bookingStatus";
import { Card } from "./shared";
import Loader from "../Loader";
import { formatearFecha, linkWhatsApp, soloDigitos } from "../../utils/whatsapp";

// Una reserva cuenta si el cliente realmente la hizo: se excluyen bloqueos,
// canceladas y reservas online que nunca se pagaron.
const cuentaComoVisita = (b) => {
  if (b.status === "blocked" || b.status === "cancelled") return false;
  if (b.status === "pending" && b.source === "online") return false;
  return true;
};

// Mismo cliente = mismo teléfono; si no hay teléfono, mismo email; si no, mismo nombre
const claveCliente = (b) =>
  soloDigitos(b.customer_phone) ||
  (b.customer_email || "").trim().toLowerCase() ||
  (b.customer_name || "").trim().toLowerCase();

const Clientes = () => {
  const { arenaId, loadingArena } = useArena();
  const { bookings, loading, error } = useBookings(arenaId);
  const [busqueda, setBusqueda] = useState("");

  const clientes = useMemo(() => {
    const porCliente = new Map();

    bookings.filter(cuentaComoVisita).forEach((b) => {
      const clave = claveCliente(b);
      if (!clave) return;

      const cliente = porCliente.get(clave) || {
        clave,
        nombre: b.customer_name,
        telefono: b.customer_phone,
        email: b.customer_email,
        reservas: 0,
        cobrado: 0,
        ultima: b.date,
      };

      cliente.reservas += 1;
      cliente.cobrado += montoCobrado(b);

      // Datos de contacto de la reserva más reciente
      if (b.date >= cliente.ultima) {
        cliente.ultima = b.date;
        cliente.nombre = b.customer_name || cliente.nombre;
        cliente.telefono = b.customer_phone || cliente.telefono;
        cliente.email = b.customer_email || cliente.email;
      }

      porCliente.set(clave, cliente);
    });

    return [...porCliente.values()].sort(
      (a, b) => b.reservas - a.reservas || b.ultima.localeCompare(a.ultima)
    );
  }, [bookings]);

  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.nombre || "").toLowerCase().includes(q) ||
      (c.telefono || "").toLowerCase().includes(q)
    );
  });

  if (loadingArena || loading) {
    return <Loader />;
  }

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  const frecuentes = clientes.filter((c) => c.reservas >= 2).length;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#06122B]">Clientes</h2>
        <p className="text-[#6D7580] text-sm mt-1">
          Quiénes reservan más seguido, armado con el historial de reservas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card title="Clientes" value={clientes.length} subtitle="con al menos una reserva" />
        <Card title="Frecuentes" value={frecuentes} subtitle="reservaron 2 veces o más" />
        <Card
          title="Más fiel"
          value={clientes[0]?.nombre || "—"}
          subtitle={clientes[0] ? `${clientes[0].reservas} reservas` : ""}
        />
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o teléfono"
        className="w-full sm:max-w-xs border border-[#D6D0C8] bg-white rounded-sm px-4 py-2.5 text-sm outline-none focus:border-[#06122B] mb-6"
      />

      <div className="overflow-x-auto border border-[#D6D0C8] rounded-lg bg-white">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="text-[#6D7580] text-xs uppercase tracking-[0.1em] border-b border-[#D6D0C8]">
              <th className="py-3 px-4">#</th>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Reservas</th>
              <th>Última reserva</th>
              <th>Pagado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente, index) => {
                const whatsapp = linkWhatsApp(cliente.telefono);

                return (
                  <tr
                    key={cliente.clave}
                    className="border-b border-[#EFEAE0] last:border-0 text-sm text-[#06122B]"
                  >
                    <td className="py-3 px-4 text-[#6D7580]">{index + 1}</td>
                    <td className="font-semibold">{cliente.nombre || "—"}</td>
                    <td className="text-[#6D7580]">
                      {cliente.telefono || cliente.email || "—"}
                    </td>
                    <td>
                      <span className="font-black">{cliente.reservas}</span>
                    </td>
                    <td>{formatearFecha(cliente.ultima)}</td>
                    <td className="font-bold">${cliente.cobrado.toLocaleString()}</td>
                    <td className="pr-4 text-right">
                      {whatsapp && (
                        <a
                          href={whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold uppercase tracking-[0.1em] text-[#2f6f61] hover:underline"
                        >
                          WhatsApp
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-[#6D7580]">
                  {clientes.length === 0
                    ? "Todavía no hay reservas de clientes."
                    : "No hay clientes que coincidan con la búsqueda."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clientes;
