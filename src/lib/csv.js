import { formatReportValue, toReportNumber } from "./reportFormat";

const SEPARATOR = ";";
const UTF8_BOM = "﻿";
const FORMULA_START = /^[=+\-@]/;

const NUMERIC_EXPORT = {
  MOEDA: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  PERCENTUAL: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
};

function cellText(value, formato) {
  if (value === null || value === undefined) {
    return "";
  }
  const numericExport = NUMERIC_EXPORT[formato];
  const number = numericExport ? toReportNumber(value) : null;
  if (number !== null) {
    return number.toLocaleString("pt-BR", { useGrouping: false, ...numericExport });
  }
  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", { useGrouping: false, maximumFractionDigits: 2 });
  }
  const text = formatReportValue(value, formato);
  if (text === "—") {
    return "";
  }
  return typeof value === "string" && FORMULA_START.test(text) ? `'${text}` : text;
}

function escapeCell(text) {
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvLine(cells) {
  return cells.map(({ value, formato }) => escapeCell(cellText(value, formato))).join(SEPARATOR);
}

export function reportToCsv({ colunas, linhas, totais }) {
  const lines = [csvLine(colunas.map((coluna) => ({ value: coluna.titulo })))];
  linhas.forEach((linha) =>
    lines.push(
      csvLine(colunas.map((coluna) => ({ value: linha[coluna.chave], formato: coluna.formato }))),
    ),
  );

  if (totais?.length > 0) {
    lines.push("");
    totais.forEach((total) =>
      lines.push(csvLine([{ value: total.titulo }, { value: total.valor, formato: total.formato }])),
    );
  }

  return UTF8_BOM + lines.join("\r\n");
}

export function reportFileName(result, extension) {
  const period = result.periodo ? `-${result.periodo.dataInicio}-a-${result.periodo.dataFim}` : "";
  return `relatorio-${result.relatorio}${period}.${extension}`;
}
