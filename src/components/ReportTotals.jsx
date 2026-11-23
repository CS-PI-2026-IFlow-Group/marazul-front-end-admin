import { formatReportValue } from "../lib/reportFormat";
import { Card } from "./ui/card";

export default function ReportTotals({ totais }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {totais.map((total) => (
        <Card key={total.chave} className="gap-1 p-5">
          <p className="text-sm text-muted-foreground">{total.titulo}</p>
          <p className="break-words font-display text-3xl font-bold tabular-nums">
            {formatReportValue(total.valor)}
          </p>
        </Card>
      ))}
    </div>
  );
}
