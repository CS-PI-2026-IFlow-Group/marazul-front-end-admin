import { formatReportValue } from "../lib/reportFormat";

export default function ReportTotals({ totais }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {totais.map((total) => (
        <div key={total.chave} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{total.titulo}</p>
          <p className="mt-2 break-words text-2xl font-bold text-[#062A45]">{formatReportValue(total.valor)}</p>
        </div>
      ))}
    </div>
  );
}
