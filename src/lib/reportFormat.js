const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export const ALIGNMENT_CLASS = {
  LEFT: "text-left",
  CENTER: "text-center",
  RIGHT: "text-right",
};

export function formatDate(isoDate) {
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export function formatDateTime(isoDateTime) {
  return `${formatDate(isoDateTime)} ${isoDateTime.slice(11, 16)}`;
}

export function formatReportValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString("pt-BR")
      : value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map(formatReportValue).join(", ") : "—";
  }
  if (typeof value === "string" && ISO_DATE_TIME.test(value)) {
    return formatDateTime(value);
  }
  if (typeof value === "string" && ISO_DATE.test(value)) {
    return formatDate(value);
  }
  return String(value);
}
