import { CalendarDays, Route, TrendingDown, TrendingUp } from "lucide-react";
import MetricCard from "./MetricCard";

export default function FleetUsageSummary({
  totalTrips,
  averageDaysDriven,
  mostUsed,
  leastUsed,
  loading,
  error,
}) {
  return (
    <section
      aria-label="Resumo do período"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MetricCard
        title="Viagens no período"
        value={error ? "—" : totalTrips}
        icon={Route}
        loading={loading}
      />
      <MetricCard
        title="Média de dias rodados por ônibus"
        value={error ? "—" : averageDaysDriven.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
        icon={CalendarDays}
        loading={loading}
      />
      <MetricCard
        title="Ônibus mais utilizado"
        value={error ? "—" : mostUsed ? mostUsed.prefix : "Sem dados"}
        icon={TrendingUp}
        loading={loading}
      />
      <MetricCard
        title="Ônibus menos utilizado"
        value={error ? "—" : leastUsed ? leastUsed.prefix : "Sem dados"}
        icon={TrendingDown}
        loading={loading}
      />
    </section>
  );
}