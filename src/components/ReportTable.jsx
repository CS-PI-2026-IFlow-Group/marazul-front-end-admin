import { ALIGNMENT_CLASS, formatReportValue } from "../lib/reportFormat";

function alignmentOf(coluna) {
  return ALIGNMENT_CLASS[coluna.alinhamento] ?? ALIGNMENT_CLASS.LEFT;
}

export default function ReportTable({ colunas, linhas }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {colunas.map((coluna) => (
              <th
                key={coluna.chave}
                className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${alignmentOf(coluna)}`}
              >
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {linhas.map((linha, index) => (
            <tr key={index} className="transition-colors hover:bg-muted/40">
              {colunas.map((coluna) => (
                <td
                  key={coluna.chave}
                  className={`whitespace-nowrap px-5 py-3.5 tabular-nums text-foreground ${alignmentOf(coluna)}`}
                >
                  {formatReportValue(linha[coluna.chave])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
