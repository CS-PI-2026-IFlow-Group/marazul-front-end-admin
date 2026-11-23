export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function formatDateTime(isoDateTime) {
  if (!isoDateTime) return "—";
  const [date, time = ""] = isoDateTime.split("T");
  return `${formatDate(date)} ${time.slice(0, 5)}`.trim();
}

export function toApiDateTime(inputValue) {
  if (!inputValue) return null;
  return inputValue.slice(0, 16);
}
