import api from "../config/axiosConfig";

const TOKEN_KEY = "token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Busca os dados do administrador logado (GET /api/auth/me).
 * Falhas são propagadas para o componente chamador tratar.
 */
export async function getProfile() {
  const response = await api.get("/api/auth/me");
  return response.data;
}
