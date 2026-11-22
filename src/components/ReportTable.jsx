import { ALIGNMENT_CLASS, formatReportValue } from "../lib/reportFormat";

function alignmentOf(coluna) {
  return ALIGNMENT_CLASS[coluna.alinhamento] ?? ALIGNMENT_CLASS.LEFT;
}

export default function ReportTable({ colunas, linhas }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/40">
            {colunas.map((coluna) => (
              <th
                key={coluna.chave}
                className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 ${alignmentOf(coluna)}`}
              >
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {linhas.map((linha, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
              {colunas.map((coluna) => (
                <td key={coluna.chave} className={`whitespace-nowrap px-5 py-3.5 text-slate-600 ${alignmentOf(coluna)}`}>
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
