import { TriangleAlert } from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

const tones = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
};

export default function MetricCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
  loading,
  error,
  suffix = "",
}) {
  return (
    <Card className="flex-row items-center justify-between gap-4 p-5">
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
          <p className="mt-1 truncate font-display text-3xl font-bold tabular-nums">
            {Number(value ?? 0).toLocaleString("pt-BR")}
            {suffix}
          </p>
        )}
      </div>

      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-xl",
          error ? "bg-destructive/10 text-destructive" : tones[tone],
        )}
      >
        {error ? <TriangleAlert className="size-5" /> : <Icon className="size-5" />}
      </div>
    </Card>
  );
}
