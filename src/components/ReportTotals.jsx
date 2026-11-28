import { formatReportValue, isNegativeMoney } from "../lib/reportFormat";
import { cn } from "../lib/utils";
import MetricCard from "./MetricCard";

export default function ReportTotals({ totais }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {totais.map((total) => (
        <MetricCard
          key={total.chave}
          title={total.titulo}
          value={formatReportValue(total.valor, total.formato)}
          valueClassName={cn(
            "break-words whitespace-normal",
            isNegativeMoney(total.valor, total.formato) && "text-destructive",
          )}
        />
      ))}
    </div>
  );
}
