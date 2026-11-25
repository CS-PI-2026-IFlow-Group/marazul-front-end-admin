export function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function currentMonthPeriod(today = new Date()) {
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { dataInicio: toInputDate(firstDay), dataFim: toInputDate(lastDay) };
}

export function currentWeekPeriod(today = new Date()) {
  const daysSinceMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  return { dataInicio: toInputDate(monday), dataFim: toInputDate(sunday) };
}

export function defaultPeriodFor(report, today = new Date()) {
  return report?.periodoPadrao === "SEMANA" ? currentWeekPeriod(today) : currentMonthPeriod(today);
}

export function isValidPeriod({ dataInicio, dataFim }) {
  return Boolean(dataInicio && dataFim && dataInicio <= dataFim);
}
