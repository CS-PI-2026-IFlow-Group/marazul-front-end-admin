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

export function isValidCpf(value) {
  const digits = onlyDigits(value);
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  for (let length = 9; length <= 10; length += 1) {
    const sum = digits.slice(0, length).split("").reduce(
      (total, digit, index) => total + Number(digit) * (length + 1 - index),
      0,
    );
    const checkDigit = (sum * 10) % 11;
    if (Number(digits[length]) !== (checkDigit === 10 ? 0 : checkDigit)) {
      return false;
    }
  }

  return true;
}

export function formatCnpj(value) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\/\d{4})(\d)/, "$1-$2");
}
