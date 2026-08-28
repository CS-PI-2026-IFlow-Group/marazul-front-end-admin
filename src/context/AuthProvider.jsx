import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProfile } from "../lib/auth";
import { AuthContext } from "./AuthContext";

/**
 * Busca o perfil do administrador (GET /api/auth/me) uma única vez ao entrar
 * na área autenticada e compartilha o resultado com toda a árvore, para que
 * cabeçalho e páginas não repitam a mesma requisição.
 */
export default function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    getProfile()
      .then((data) => {
        if (!active) return;

        setProfile(data);
        setLoading(false);
      })
      .catch((error) => {
        if (!active) return;

        setLoading(false);

        // Token expirado ou sessão inválida (401) já é tratado pelo interceptor
        // do axios, que limpa o token e redireciona. Duplicar aqui causaria
        // navegação dupla.
        if (error.response?.status === 401) return;

        // API indisponível ou erro inesperado: o painel continua utilizável e
        // o usuário fica sabendo que o perfil não carregou.
        setFailed(true);
        toast.error("Não foi possível carregar seu perfil", {
          description:
            "Verifique sua conexão com o servidor e recarregue a página.",
        });
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Permite que a tela peça uma nova tentativa depois de uma falha de rede.
  const reload = () => {
    setLoading(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, failed, reload }}>
      {children}
    </AuthContext.Provider>
  );
}
