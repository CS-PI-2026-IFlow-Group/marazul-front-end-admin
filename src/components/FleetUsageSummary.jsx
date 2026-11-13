import { CalendarDays, TrendingDown, TrendingUp, Route } from "lucide-react";

function SummaryCard({ title, value, icon: Icon, loading }) {
  return (
    <article className="flex min-h-24 min-w-0 items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="min-w-0 space-y-2">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">{title}</p>
        {loading ? (
          <div
            role="status"
            aria-label={`Carregando ${title}`}
            className="h-7 w-24 animate-pulse rounded bg-slate-200"
          />
        ) : (
          <p className="truncate text-xl font-bold tabular-nums text-[#101828] sm:text-2xl">
            {value}
          </p>
        )}
      </div>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-slate-500">
        <Icon aria-hidden="true" className="size-4" />
      </span>
    </article>
  );
}

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
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <SummaryCard
        title="Viagens no período"
        value={error ? "—" : totalTrips.toLocaleString("pt-BR")}
        icon={Route}
        loading={loading}
      />
      <SummaryCard
        title="Média de dias rodados por ônibus"
        value={error ? "—" : averageDaysDriven.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
        icon={CalendarDays}
        loading={loading}
      />
      <SummaryCard
        title="Ônibus mais utilizado"
        value={error ? "—" : mostUsed ? mostUsed.prefix : "Sem dados"}
        icon={TrendingUp}
        loading={loading}
      />
      <SummaryCard
        title="Ônibus menos utilizado"
        value={error ? "—" : leastUsed ? leastUsed.prefix : "Sem dados"}
        icon={TrendingDown}
        loading={loading}
      />
    </section>
  );
}