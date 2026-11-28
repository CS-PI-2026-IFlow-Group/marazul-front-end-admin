import { TriangleAlert } from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

function formatMetricValue(value, suffix) {
  if (value == null) {
    return `${(0).toLocaleString("pt-BR")}${suffix}`;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? `${value.toLocaleString("pt-BR")}${suffix}` : "—";
  }
  if (typeof value === "string") {
    return `${value}${suffix}`;
  }
  return value;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  loading,
  error,
  suffix = "",
  className,
  valueClassName,
}) {
  return (
    <Card className={cn("flex-row items-center justify-between gap-4 p-5", className)}>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>

        {loading && (
          <div
            role="status"
            aria-label={`Carregando ${title}`}
            className="mt-1 h-9 w-20 animate-pulse rounded-lg bg-muted"
          />
        )}

        {!loading && error && (
          <p className="mt-1 text-sm font-medium text-destructive">
            Não foi possível carregar os dados
          </p>
        )}

        {!loading && !error && (
          <p
            className={cn(
              "mt-1 truncate font-display text-3xl font-bold tabular-nums",
              valueClassName,
            )}
          >
            {formatMetricValue(value, suffix)}
          </p>
        )}
      </div>

      {(error || Icon) && (
        <div
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl",
            error ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          )}
        >
          {error ? (
            <TriangleAlert aria-hidden="true" className="size-5" />
          ) : (
            <Icon aria-hidden="true" className="size-5" />
          )}
        </div>
      )}
    </Card>
  );
}
