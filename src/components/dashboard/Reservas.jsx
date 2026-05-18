const Reservas = () => {
    const reservas = [
    {
      id: 44,
      cliente: "Martín López",
      contacto: "+54 9 11 2345-6789",
      cancha: "Central",
      dia: "Lunes",
      horario: "08:00 - 09:00",
      estado: "Pagado",
    },
  
    {
      id: 45,
      cliente: "Luisa Pérez",
      contacto: "+54 9 11 9876-5432",
      cancha: "Sur",
      dia: "Martes",
      horario: "09:00 - 10:00",
      estado: "Señado",
    },
  
    {
      id: 46,
      cliente: "Carlos Ríos",
      contacto: "+54 9 11 5555-1111",
      cancha: "Norte",
      dia: "Miércoles",
      horario: "10:00 - 11:00",
      estado: "Pagado",
    },
  
    {
      id: 47,
      cliente: "Ana García",
      contacto: "+54 9 11 7777-2222",
      cancha: "Central",
      dia: "Jueves",
      horario: "11:00 - 12:00",
      estado: "Pendiente",
    },
  ];

  return (
    <>

      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">Reservas de hoy</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b">
              <th className="py-3">#</th>
              <th>Cliente</th>
                <th>Contacto</th>
                <th>Cancha</th>
                <th>Día</th>
                <th>Horario</th>
                <th>Pago</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {reservas.map((r) => (
              <ReservaRow key={r.id} reserva={r} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const ReservaRow = ({ reserva }) => {
    const styles = {
      Pagado: "bg-green-100 text-green-700",
      Señado: "bg-orange-100 text-orange-700",
      Pendiente: "bg-gray-100 text-gray-500",
    };
  
    return (
      <tr className="border-b text-gray-800">
        <td className="py-5 font-bold text-gray-400">#{reserva.id}</td>
        <td className="font-semibold">{reserva.cliente}</td>
        <td>{reserva.contacto}</td>
        <td>{reserva.cancha}</td>
        <td>{reserva.dia}</td>
        <td className="font-semibold">{reserva.horario}</td>
        <td>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[reserva.estado]}`}>
            {reserva.estado}
          </span>
        </td>
        <td>
          <button className="border border-gray-100 rounded-xl px-4 py-2 text-gray-200">
            ⋮
          </button>
        </td>
      </tr>
    );
  };
  
export default Reservas;