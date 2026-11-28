import { formatDate } from "../lib/reportFormat";
import { cn } from "../lib/utils";
import ViagemService from "../services/ViagemService";
import TripStatusBadge from "./TripStatusBadge";

const COLUMNS = [
  { title: "Saída", className: "text-center" },
  { title: "Trecho", className: "text-left" },
  { title: "Ônibus", className: "text-left" },
  { title: "Motoristas", className: "text-left" },
  { title: "Situação", className: "text-center" },
];

function groupByDay(linhas) {
  const days = [];
  for (const linha of linhas) {
    let day = days[days.length - 1];
    if (day?.dia !== linha.dia) {
      day = { dia: linha.dia, diaSemana: linha.diaSemana, viagens: [] };
      days.push(day);
    }
    if (linha.viagemId != null) day.viagens.push(linha);
  }
  return days;
}

function tripCount(total) {
  if (total === 0) return "Sem viagem";
  return total === 1 ? "1 viagem" : `${total} viagens`;
}

export default function WeeklySchedule({ linhas }) {
  const days = groupByDay(linhas);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {COLUMNS.map((column) => (
              <th
                key={column.title}
                scope="col"
                className={cn(
                  "px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  column.className,
                )}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        {days.map((day) => (
          <tbody key={day.dia} className="border-b last:border-b-0">
            <tr className="bg-muted/30">
              <th colSpan={COLUMNS.length} scope="colgroup" className="px-5 py-2.5 text-left font-normal">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-semibold text-foreground">
                    {day.diaSemana} <span className="font-normal text-muted-foreground">· {formatDate(day.dia)}</span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      day.viagens.length === 0 ? "bg-muted font-medium text-muted-foreground" : "text-muted-foreground",
                    )}
                  >
                    {tripCount(day.viagens.length)}
                  </span>
                </div>
              </th>
            </tr>
            {day.viagens.map((viagem) => (
              <tr key={viagem.viagemId} className="border-t transition-colors hover:bg-muted/40">
                <td className="whitespace-nowrap px-5 py-3.5 text-center font-semibold tabular-nums text-foreground">
                  {viagem.saida}
                </td>
                <td className="px-5 py-3.5 text-foreground">{viagem.trecho}</td>
                <td className="whitespace-nowrap px-5 py-3.5 font-medium text-foreground">{viagem.onibus}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{viagem.motoristas ?? "—"}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-center">
                  <TripStatusBadge status={ViagemService.getStatusValue(viagem.situacao)} label={viagem.situacao} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
