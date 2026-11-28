export const TRIP_STAGES = [
  "SCHEDULED",
  "CONFIRMED",
  "LEFT_ORIGIN",
  "ARRIVED_DESTINATION",
  "LEFT_DESTINATION",
  "ARRIVED_ORIGIN",
  "COMPLETED",
];

export const STAGE_TIMES = {
  LEFT_ORIGIN: { planned: "plannedDepartureOrigin", actual: "departureOrigin" },
  ARRIVED_DESTINATION: { planned: "plannedArrivalDestination", actual: "arrivalDestination" },
  LEFT_DESTINATION: { planned: "plannedDepartureDestination", actual: "departureDestination" },
  ARRIVED_ORIGIN: { planned: "plannedArrivalOrigin", actual: "arrivalOrigin" },
};

export const NEXT_STAGE_ACTIONS = {
  CONFIRMED: "Confirmar viagem",
  LEFT_ORIGIN: "Registrar saída da origem",
  ARRIVED_DESTINATION: "Registrar chegada ao destino",
  LEFT_DESTINATION: "Registrar saída do destino",
  ARRIVED_ORIGIN: "Registrar chegada à origem",
  COMPLETED: "Concluir viagem",
};

export function stageIndex(status) {
  return TRIP_STAGES.indexOf(status);
}

export function getNextStage(status) {
  const index = stageIndex(status);
  return index >= 0 && index < TRIP_STAGES.length - 1 ? TRIP_STAGES[index + 1] : null;
}

export function stageRecordsTime(stage) {
  return Boolean(STAGE_TIMES[stage]);
}

function toDate(isoDateTime) {
  if (!isoDateTime) return null;
  const date = new Date(isoDateTime);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function delayInMinutes(planned, actual) {
  const plannedDate = toDate(planned);
  const actualDate = toDate(actual);
  if (!plannedDate || !actualDate) return null;
  return Math.round((actualDate.getTime() - plannedDate.getTime()) / 60000);
}

export function formatDuration(minutes) {
  const total = Math.abs(minutes);
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const mins = total % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins || parts.length === 0) parts.push(`${mins}min`);
  return parts.join(" ");
}

export function toInputDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
