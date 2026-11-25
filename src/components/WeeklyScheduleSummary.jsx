import { BusFront, CircleParking, Route } from "lucide-react";
import MetricCard from "./MetricCard";
import { Card } from "./ui/card";

function findTotal(totais, chave) {
  return totais.find((total) => total.chave === chave);
}

export default function WeeklyScheduleSummary({ totais }) {
  const trips = findTotal(totais, "viagens");
  const buses = findTotal(totais, "onibusEnvolvidos");
  const idle = findTotal(totais, "onibusSemViagem");
  const idleBuses = Array.isArray(idle?.valor) ? idle.valor : [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard title={trips?.titulo ?? "Viagens"} value={trips?.valor} icon={Route} />
      <MetricCard title={buses?.titulo ?? "Ônibus envolvidos"} value={buses?.valor} icon={BusFront} tone="accent" />
      <Card className="flex-row items-start justify-between gap-4 p-5 sm:col-span-2">
        <div className="min-w-0 space-y-2">
          <p className="text-sm text-muted-foreground">{idle?.titulo ?? "Ônibus sem viagem"}</p>
          {idleBuses.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Prefixos dos ônibus sem viagem">
              {idleBuses.map((prefix) => (
                <li key={prefix} className="rounded-md border bg-muted/50 px-2.5 py-1 text-sm font-semibold tabular-nums">
                  {prefix}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-medium text-foreground">Nenhum ônibus ativo sem viagem no período.</p>
          )}
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
          <CircleParking className="size-5" />
        </div>
      </Card>
    </div>
  );
}
