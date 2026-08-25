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

// Dados usados quando a API ainda não estiver disponível (HU24).
const MOCK_PROFILE = {
  id: 1,
  nome: "Administrador Marazul",
  email: "admin@marazul.com.br",
};

/**
 * Busca os dados do administrador logado (HU24 - GET /api/auth/me).
 * Enquanto o back-end não estiver pronto, retorna dados mockados.
 */
export async function getProfile() {
  try {
    const response = await api.get("/api/auth/me");
    return response.data;
  } catch {
    // Fallback mockado para permitir o desenvolvimento do front-end.
    return MOCK_PROFILE;
  }
}
