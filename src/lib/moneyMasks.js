import { onlyDigits } from "./documentMasks.js";

const MAX_DIGITS = 10;

const MONEY_FORMAT = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function toCents(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) : null;
}

export function formatCurrency(value) {
  const cents = toCents(value);
  if (cents === null) return "—";
  const amount = MONEY_FORMAT.format(Math.abs(cents) / 100);
  return cents < 0 ? `-R$ ${amount}` : `R$ ${amount}`;
}

export function formatMoneyInput(raw) {
  const digits = onlyDigits(raw).replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITS);
  if (!digits) return "";
  return `R$ ${MONEY_FORMAT.format(Number(digits) / 100)}`;
}

export function moneyInputFromValue(value) {
  const cents = toCents(value);
  return cents === null ? "" : `R$ ${MONEY_FORMAT.format(cents / 100)}`;
}

export function parseMoneyInput(masked) {
  const digits = onlyDigits(masked);
  return digits ? Number(digits) / 100 : null;
}
