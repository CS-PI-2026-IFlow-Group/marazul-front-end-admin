const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const MONEY_FORMAT = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PERCENT_FORMAT = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  useGrouping: false,
});

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

export function toReportNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

export function isNegativeMoney(value, formato) {
  if (formato !== "MOEDA") {
    return false;
  }
  const number = toReportNumber(value);
  return number !== null && number < 0 && MONEY_FORMAT.format(-number) !== "0,00";
}

function formatMoney(value) {
  const number = toReportNumber(value);
  if (number === null) {
    return formatDefault(value);
  }
  const amount = MONEY_FORMAT.format(Math.abs(number));
  return isNegativeMoney(number, "MOEDA") ? `-R$ ${amount}` : `R$ ${amount}`;
}

function formatPercent(value) {
  const number = toReportNumber(value);
  return number === null ? formatDefault(value) : `${PERCENT_FORMAT.format(number)}%`;
}

function formatDefault(value) {
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString("pt-BR")
      : value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }
  if (typeof value === "string" && ISO_DATE_TIME.test(value)) {
    return formatDateTime(value);
  }
  if (typeof value === "string" && ISO_DATE.test(value)) {
    return formatDate(value);
  }
  return String(value);
}

export function formatReportValue(value, formato) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (Array.isArray(value)) {
    return value.length > 0
      ? value.map((item) => formatReportValue(item, formato)).join(", ")
      : "—";
  }

  switch (formato) {
    case "MOEDA":
      return formatMoney(value);
    case "PERCENTUAL":
      return formatPercent(value);
    case "DATA":
      return typeof value === "string" && ISO_DATE_PREFIX.test(value)
        ? formatDate(value)
        : formatDefault(value);
    case "DATA_HORA":
      return typeof value === "string" && ISO_DATE_TIME.test(value)
        ? formatDateTime(value)
        : formatDefault(value);
    default:
      return formatDefault(value);
  }
}
