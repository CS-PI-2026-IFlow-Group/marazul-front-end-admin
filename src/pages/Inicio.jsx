import { LockKeyhole, RefreshCw, UserX } from "lucide-react";
import { Navigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingIndicator from "../components/LoadingIndicator";
import { Button } from "../components/ui/button";
import { getFirstAllowedPath } from "../config/navigation";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";

export default function Inicio() {
  usePageTitle("Início");
  const { profile, loading, failed, reload } = useAuth();

  if (failed) {
    return (
      <div className="flex min-h-[480px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <EmptyState
          icon={UserX}
          title="Não foi possível carregar seu perfil"
          description="Verifique sua conexão com o servidor e tente novamente."
          action={
            <Button variant="outline" onClick={reload} className="gap-2 rounded-lg">
              <RefreshCw className="size-4" /> Tentar novamente
            </Button>
          }
        />
      </div>
    );
  }

  if (loading || !profile) return <LoadingIndicator />;

  const firstAllowedPath = getFirstAllowedPath(profile);

  if (firstAllowedPath) return <Navigate to={firstAllowedPath} replace />;

  return (
    <div className="flex min-h-[480px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <EmptyState
        icon={LockKeyhole}
        title="Nenhum módulo liberado"
        description="Seu perfil ainda não tem permissão para acessar nenhum módulo do painel. Fale com um administrador para liberar o acesso."
      />
    </div>
  );
}
