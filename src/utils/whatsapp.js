export const soloDigitos = (texto) => String(texto || "").replace(/\D/g, "");

// wa.me necesita el número internacional: 54 9 + código de área + número.
// Sin teléfono abre WhatsApp para elegir a quién mandarlo.
export const linkWhatsApp = (telefono, mensaje) => {
  let numero = soloDigitos(telefono);
  if (numero.length === 10) numero = `549${numero}`;

  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";

  if (!numero) return mensaje ? `https://wa.me/${texto}` : null;
  return `https://wa.me/${numero}${texto}`;
};

export const formatearFecha = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const ESTADO_TEXTO = {
  paid: "Pagada",
  deposit_paid: "Señada (el saldo se abona en el club)",
  pending: "Pendiente de pago",
};

// Mensaje con los datos de la reserva, para el cliente o para el club
export const mensajeReserva = ({ booking, courtName, arenaName, paraElClub }) => {
  const lineas = [
    paraElClub
      ? `Hola! Hice una reserva en ${arenaName || "el club"}:`
      : `Hola ${booking.customer_name || ""}! Te confirmamos tu reserva en ${arenaName || "el club"}:`,
    "",
    `Reserva Nº ${booking.ref_id}`,
    courtName ? `Cancha: ${courtName}` : null,
    `Fecha: ${formatearFecha(booking.date)}`,
    `Horario: ${booking.time} hs`,
    ESTADO_TEXTO[booking.status] ? `Estado: ${ESTADO_TEXTO[booking.status]}` : null,
    paraElClub && booking.customer_name ? `A nombre de: ${booking.customer_name}` : null,
    "",
    paraElClub ? "Gracias!" : "¡Te esperamos!",
  ];

  return lineas.filter((l) => l !== null).join("\n");
};
