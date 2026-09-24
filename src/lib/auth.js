import api from "../config/axiosConfig";

const TOKEN_KEY = "token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

// Nome do perfil padrão criado pelo back-end (DataInitializer.ADMIN_PROFILE_NAME).
const ADMIN_PROFILE_NAME = "Administrador";

/**
 * Lê o nome do perfil de acesso do claim "profile" do JWT.
 * Serve apenas para exibir/ocultar itens da interface: a autorização real
 * continua sendo feita pelo back-end, que valida a assinatura do token.
 */
export function getTokenProfile() {
  const token = getToken();
  if (!token) return null;

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return payload.profile ?? null;
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getTokenProfile() === ADMIN_PROFILE_NAME;
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
