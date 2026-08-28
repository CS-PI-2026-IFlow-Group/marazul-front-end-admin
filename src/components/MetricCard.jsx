import { TriangleAlert } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Card de resumo do dashboard. Cobre os três estados da HU25:
 * carregando (skeleton), erro (ícone de alerta) e valor carregado.
 */
export default function MetricCard({ title, value, icon: Icon, loading, error }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="min-w-0 space-y-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        {loading && (
          <div
            role="status"
            aria-label={`Carregando ${title}`}
            className="h-10 w-24 animate-pulse rounded bg-slate-200"
          />
        )}

        {!loading && error && (
          <p className="text-sm font-medium text-[#e31e24]">
            Não foi possível carregar os dados
          </p>
        )}

        {!loading && !error && (
          <p className="text-4xl font-bold tabular-nums text-[#062A45]">
            {Number(value ?? 0).toLocaleString("pt-BR")}
          </p>
        )}
      </div>

      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-lg",
          error ? "bg-[#e31e24]/10" : "bg-[#062A45]/10",
        )}
      >
        {error ? (
          <TriangleAlert className="size-6 text-[#e31e24]" />
        ) : (
          <Icon className="size-6 text-[#062A45]" />
        )}
      </div>
    </div>
  );
}
