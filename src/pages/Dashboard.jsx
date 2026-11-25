import { useEffect, useState } from "react";
import { Bus, Contact, RefreshCw, UserRound, Users } from "lucide-react";
import MetricCard from "../components/MetricCard";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import dashboardService from "../services/DashboardService";
import { usePageTitle } from "../hooks/usePageTitle";

export default function Dashboard() {
  usePageTitle("Dashboard");
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

  const isUnavailable = (value) => failed || (!loading && value == null);

  const cards = [
    {
      title: "Total de ônibus",
      value: metrics?.totalVehicles,
      icon: Bus,
      tone: "primary",
    },
    {
      title: "Colaboradores ativos",
      value: metrics?.activeEmployees,
      icon: Users,
      tone: "success",
    },
    {
      title: "Clientes cadastrados",
      value: metrics?.totalClients,
      icon: Contact,
      tone: "accent",
    },
    {
      title: "Passageiros cadastrados",
      value: metrics?.totalPassengers,
      icon: UserRound,
      tone: "primary",
    },
  ];

  const hasUnavailable = cards.some((card) => isUnavailable(card.value));

  return (
    <div>
      <div className="mb-8">
        <h1 className="flex flex-wrap items-center gap-x-2 text-3xl font-bold md:text-4xl">
          {profileLoading ? (
            <>
              Olá,
              <span
                role="status"
                aria-label="Carregando nome do administrador"
                className="inline-block h-8 w-40 animate-pulse rounded-lg bg-muted"
              />
            </>
          ) : (
            <span>{firstName ? `Olá, ${firstName}` : "Olá!"}</span>
          )}
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Resumo da operação da Marazul em tempo real.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            loading={loading}
            error={isUnavailable(card.value)}
          />
        ))}
      </div>

      {hasUnavailable && (
        <Button onClick={handleRetry} className="mt-6">
          <RefreshCw /> Tentar novamente
        </Button>
      )}
    </div>
  );
}
