import { useEffect, useState } from "react";
import { Bus, RefreshCw, Users } from "lucide-react";
import MetricCard from "../components/MetricCard";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import dashboardService from "../services/DashboardService";

export default function Dashboard() {
  const {
    profile,
    loading: profileLoading,
    failed: profileFailed,
    reload: reloadProfile,
  } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    dashboardService
      .getMetrics({ signal: controller.signal })
      .then((data) => {
        if (!active) return;

        setMetrics(data);
        setLoading(false);
      })
      .catch((error) => {
        // Requisição cancelada porque a tela foi desmontada: nada a atualizar.
        if (!active) return;

        setLoading(false);

        // Token expirado (401) já é tratado pelo interceptor do axios.
        if (error.response?.status === 401) return;

        setFailed(true);
      });

    // Cancela a requisição em voo se o usuário sair da tela antes da resposta.
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const handleRetry = () => {
    if (profileFailed) reloadProfile();

    setLoading(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  };

  const firstName = profile?.nome?.trim().split(/\s+/)[0];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="flex flex-wrap items-center gap-x-2 text-2xl font-bold text-[#062A45] sm:text-3xl">
          {profileLoading ? (
            <>
              Olá,
              <span
                role="status"
                aria-label="Carregando nome do administrador"
                className="inline-block h-7 w-40 animate-pulse rounded bg-slate-200"
              />
            </>
          ) : (
            <span>{firstName ? `Olá, ${firstName}` : "Olá!"}</span>
          )}
        </h1>
        <p className="text-slate-600">
          Resumo da operação da Marazul em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <MetricCard
          title="Total de ônibus"
          value={metrics?.totalVehicles}
          icon={Bus}
          loading={loading}
          error={failed}
        />
        <MetricCard
          title="Funcionários ativos"
          value={metrics?.activeEmployees}
          icon={Users}
          loading={loading}
          error={failed}
        />
      </div>

      {failed && (
        <Button
          onClick={handleRetry}
          className="gap-2 bg-[#062A45] font-bold text-white hover:bg-[#0f172a]"
        >
          <RefreshCw className="size-4" /> Tentar novamente
        </Button>
      )}
    </div>
  );
}
