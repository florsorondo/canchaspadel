export const STATUS_LABELS = {
  pending: "Pendiente",
  deposit_paid: "Señado",
  paid: "Pagado",
  completed: "Finalizada",
  cancelled: "Cancelada",
  blocked: "Bloqueado",
};

export const STATUS_STYLES = {
  pending: "bg-[#EFEAE0] text-[#6D7580]",
  deposit_paid: "bg-[#CD9A50]/15 text-[#95672A]",
  paid: "bg-[#2f6f61]/15 text-[#2f6f61]",
  completed: "bg-[#06122B]/10 text-[#06122B]",
  cancelled: "bg-red-100 text-red-600",
  blocked: "bg-[#06122B] text-white",
};

// Estados que un admin puede asignar manualmente a una reserva real desde el
// selector de estado. "blocked" se crea solo desde el flujo de bloqueo de
// horarios / cancha libre, nunca a mano sobre una reserva de un cliente.
export const ASSIGNABLE_STATUSES = [
  "pending",
  "deposit_paid",
  "paid",
  "completed",
  "cancelled",
];

// Lo efectivamente cobrado de una reserva según su estado
export const montoCobrado = (booking) => {
  if (booking.status === "paid" || booking.status === "completed") {
    return booking.amount || 0;
  }
  if (booking.status === "deposit_paid") {
    return booking.deposit_amount || 0;
  }
  return 0;
};
