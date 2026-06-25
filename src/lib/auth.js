import axios from "axios";

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
  const token = getToken();

  try {
    const response = await axios.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch {
    // Fallback mockado para permitir o desenvolvimento do front-end.
    return MOCK_PROFILE;
  }
}
