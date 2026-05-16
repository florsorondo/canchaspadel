import { Card } from "./shared";

const MovimientoRow = ({ movimiento }) => {
  const styles = {
    Pagado: "bg-green-100 text-green-700",
    Seña: "bg-orange-100 text-orange-700",
    Pendiente: "bg-gray-100 text-gray-500",
  };

  return (
    <tr className="border-b last:border-none text-gray-800">
      <td className="p-4 font-semibold">{movimiento.cliente}</td>
      <td>{movimiento.cancha}</td>
      <td>{movimiento.fecha}</td>
      <td className="font-semibold">{movimiento.horario}</td>
      <td>{movimiento.metodo}</td>

      <td>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${styles[movimiento.estado]}`}
        >
          {movimiento.estado}
        </span>
      </td>

      <td className="font-bold">
        ${movimiento.monto.toLocaleString()}
      </td>
    </tr>
  );
};

const Ingresos = () => {
  const movimientos = [
    {
      id: 1,
      cliente: "Martín López",
      cancha: "Central",
      fecha: "Lunes",
      horario: "08:00 - 09:00",
      metodo: "Mercado Pago",
      estado: "Pagado",
      monto: 8000,
    },
    {
      id: 2,
      cliente: "Luisa Pérez",
      cancha: "Sur",
      fecha: "Martes",
      horario: "09:00 - 10:00",
      metodo: "Transferencia",
      estado: "Seña",
      monto: 2000,
    },
    {
      id: 3,
      cliente: "Ana García",
      cancha: "Central",
      fecha: "Jueves",
      horario: "11:00 - 12:00",
      metodo: "Efectivo",
      estado: "Pendiente",
      monto: 0,
    },
  ];

  const ingresosHoy = movimientos
    .filter((m) => m.estado === "Pagado" || m.estado === "Seña")
    .reduce((total, m) => total + m.monto, 0);

  const senasPendientes = movimientos.filter(
    (m) => m.estado === "Pendiente"
  ).length;

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Card
          title="Ingresos hoy"
          value={`$${ingresosHoy.toLocaleString()}`}
          subtitle="confirmados"
        />

        <Card
          title="Ingresos semana"
          value="$312.000"
          subtitle="+18%"
        />

        <Card
          title="Ingresos mes"
          value="$1.240.000"
          subtitle="total"
        />

        <Card
          title="Pagos pendientes"
          value={senasPendientes}
          subtitle="por cobrar"
        />
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-2xl font-bold">
            Movimientos
          </h2>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b">
                <th className="p-4">Cliente</th>
                <th>Cancha</th>
                <th>Día</th>
                <th>Horario</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Monto</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.map((m) => (
                <MovimientoRow
                  key={m.id}
                  movimiento={m}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ingresos;