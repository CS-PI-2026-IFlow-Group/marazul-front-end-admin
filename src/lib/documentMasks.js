export function onlyDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function removeCpfMask(value) {
  return onlyDigits(value);
}

export function removeCnpjMask(value) {
  return onlyDigits(value);
}

export function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function formatCnpj(value) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\/\d{4})(\d)/, "$1-$2");
}

function hasRepeatedDigits(digits) {
  return /^(\d)\1+$/.test(digits);
}

export function isValidCpf(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || hasRepeatedDigits(digits)) return false;

  const calculateCheckDigit = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index++) {
      sum += Number(digits[index]) * (length + 1 - index);
    }
    const checkDigit = 11 - (sum % 11);
    return checkDigit >= 10 ? 0 : checkDigit;
  };

  return (
    calculateCheckDigit(9) === Number(digits[9]) &&
    calculateCheckDigit(10) === Number(digits[10])
  );
}

export function isValidCnpj(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || hasRepeatedDigits(digits)) return false;

  const calculateCheckDigit = (length) => {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let index = 0; index < length; index++) {
      sum += Number(digits[index]) * weights[index];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return (
    calculateCheckDigit(12) === Number(digits[12]) &&
    calculateCheckDigit(13) === Number(digits[13])
  );
}
