export const getCourtNameById = (courts, courtId) => {
  if (!Array.isArray(courts) || !courtId) return "-";

  const court = courts.find((court) => court.id === courtId);

  return court?.name || "-";
};