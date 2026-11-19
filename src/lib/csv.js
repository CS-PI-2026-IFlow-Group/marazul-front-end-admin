import { formatReportValue } from "./reportFormat";

const SEPARATOR = ";";
const UTF8_BOM = "﻿";
const FORMULA_START = /^[=+\-@]/;

function cellText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", { useGrouping: false, maximumFractionDigits: 2 });
  }
  const text = formatReportValue(value);
  if (text === "—") {
    return "";
  }
  return typeof value === "string" && FORMULA_START.test(text) ? `'${text}` : text;
}

function escapeCell(text) {
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvLine(cells) {
  return cells.map((cell) => escapeCell(cellText(cell))).join(SEPARATOR);
}

export function reportToCsv({ colunas, linhas, totais }) {
  const lines = [csvLine(colunas.map((coluna) => coluna.titulo))];
  linhas.forEach((linha) => lines.push(csvLine(colunas.map((coluna) => linha[coluna.chave]))));

  if (totais?.length > 0) {
    lines.push("");
    totais.forEach((total) => lines.push(csvLine([total.titulo, total.valor])));
  }

  return UTF8_BOM + lines.join("\r\n");
}

export function reportFileName(result, extension) {
  const period = result.periodo ? `-${result.periodo.dataInicio}-a-${result.periodo.dataFim}` : "";
  return `relatorio-${result.relatorio}${period}.${extension}`;
}
