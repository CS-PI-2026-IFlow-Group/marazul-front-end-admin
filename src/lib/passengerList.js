import { onlyDigits } from "./documentMasks.js";
import { formatPhone } from "./phoneMasks.js";

export function matchesPassenger(passenger, search) {
  const term = String(search ?? "").trim().toLocaleLowerCase("pt-BR");
  if (!term) return true;

  const nameMatches = String(passenger.name ?? "")
    .toLocaleLowerCase("pt-BR")
    .includes(term);
  const documentTerm = onlyDigits(term);
  const documentMatches = documentTerm.length > 0 &&
    onlyDigits(passenger.cpf).includes(documentTerm);

  return nameMatches || documentMatches;
}

export function formatPassengerPhone(value) {
  const digits = onlyDigits(value);
  if (!digits) return "—";
  if (digits.length === 11) {
    return formatPhone(digits);
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return digits;
}
