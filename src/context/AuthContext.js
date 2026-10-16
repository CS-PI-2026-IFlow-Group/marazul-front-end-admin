import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

/**
 * Dados do administrador logado, buscados uma única vez pelo AuthProvider.
 * Retorna { profile, loading, failed, reload }.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um <AuthProvider>.");
  }

  return context;
}
