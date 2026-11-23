let denial = null;
const listeners = new Set();

export function getAccessDenied() {
  return denial;
}

export function subscribeAccessDenied(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyAccessDenied(message, pathname) {
  if (listeners.size === 0) return false;

  denial = { message: message || "", pathname };
  listeners.forEach((listener) => listener());
  return true;
}

export function clearAccessDenied() {
  if (!denial) return;

  denial = null;
  listeners.forEach((listener) => listener());
}
