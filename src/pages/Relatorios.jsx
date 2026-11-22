import { AlertCircle, BarChart3, Calendar, Download, FileSpreadsheet, FileText, RefreshCw, RotateCcw, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EmptyState from "../components/EmptyState";
import LoadingIndicator from "../components/LoadingIndicator";
import PeriodFilter from "../components/PeriodFilter";
import ReportTable from "../components/ReportTable";
import ReportTotals from "../components/ReportTotals";
import { Button } from "../components/ui/button";
import { usePageTitle } from "../hooks/usePageTitle";
import { reportFileName, reportToCsv } from "../lib/csv";
import { saveFile } from "../lib/download";
import { currentMonthPeriod, isValidPeriod } from "../lib/period";
import { formatDate, formatDateTime } from "../lib/reportFormat";
import RelatorioService from "../services/RelatorioService";

function errorMessage(error, fallback) {
  const data = error?.response?.data;
  return data?.message || data?.erro || fallback;
}

function canQuery(report, period) {
  return Boolean(report) && (!report.exigePeriodo || isValidPeriod(period));
}

function isSamePeriod(first, second) {
  return first.dataInicio === second.dataInicio && first.dataFim === second.dataFim;
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4" role="alert">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <p className="max-w-sm text-center text-sm font-semibold text-red-700">{message}</p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="gap-2 rounded-lg cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs"
      >
        <RefreshCw className="h-4 w-4" /> Tentar novamente
      </Button>
    </div>
  );
}

export default function Relatorios() {
  usePageTitle("Relatórios");

  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [reloadReports, setReloadReports] = useState(0);
  const [selected, setSelected] = useState(null);
  const [period, setPeriod] = useState(currentMonthPeriod);
  const [result, setResult] = useState(null);
  const [resultError, setResultError] = useState("");
  const [reloadResult, setReloadResult] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const activeReport = selected ?? reports[0] ?? null;
  const shouldQuery = canQuery(activeReport, period);
  const isLoadingResult = shouldQuery && result === null && resultError === "";
  const hasRows = !isLoadingResult && !resultError && result?.linhas.length > 0;

  useEffect(() => {
    let active = true;
    RelatorioService.getAll()
      .then((data) => {
        if (active) {
          setReports(Array.isArray(data) ? data : []);
          setReportsError("");
        }
      })
      .catch((error) => {
        if (active) setReportsError(errorMessage(error, "Não foi possível carregar os relatórios."));
      })
      .finally(() => {
        if (active) setIsLoadingReports(false);
      });
    return () => { active = false; };
  }, [reloadReports]);

  useEffect(() => {
    if (!shouldQuery) return undefined;
    let active = true;
    RelatorioService.generate(activeReport.relatorio, activeReport.exigePeriodo ? period : {})
      .then((data) => {
        if (active) {
          setResult(data);
          setResultError("");
        }
      })
      .catch((error) => {
        if (active) {
          setResult(null);
          setResultError(errorMessage(error, "Não foi possível gerar o relatório."));
        }
      });
    return () => { active = false; };
  }, [activeReport, period, reloadResult, shouldQuery]);

  const resetResult = () => {
    setResult(null);
    setResultError("");
  };

  const handleSelect = (report) => {
    if (report.relatorio === activeReport?.relatorio) return;
    setSelected(report);
    resetResult();
  };

  const handlePeriodChange = (nextPeriod) => {
    setPeriod(nextPeriod);
    resetResult();
  };

  const retryReports = () => {
    setIsLoadingReports(true);
    setReportsError("");
    setReloadReports((value) => value + 1);
  };

  const retryResult = () => {
    resetResult();
    setReloadResult((value) => value + 1);
  };

  const handleExportCsv = () => {
    const csv = reportToCsv(result);
    saveFile(new Blob([csv], { type: "text/csv;charset=utf-8" }), reportFileName(result, "csv"));
  };

  const handleExportPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await RelatorioService.downloadPdf(result.relatorio, result.periodo ?? {});
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível baixar o PDF."));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062A45]">Relatórios</h1>
          <p className="mt-1 text-sm text-slate-500">Resultados e desempenho da operação.</p>
        </div>
        {hasRows && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCsv}
              className="gap-2 rounded-lg cursor-pointer border-slate-200 text-[#062A45] font-semibold text-xs"
            >
              <FileSpreadsheet className="h-4 w-4" /> Exportar CSV
            </Button>
            <Button
              onClick={handleExportPdf}
              disabled={isDownloadingPdf}
              className="gap-2 rounded-lg cursor-pointer bg-[#062A45] hover:bg-[#0a1f35] text-white font-semibold text-xs"
            >
              {isDownloadingPdf ? (
                <LoadingIndicator variant="button" label="Baixando..." />
              ) : (
                <>
                  <Download className="h-4 w-4" /> Baixar PDF
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {hasRows && result.totais?.length > 0 && <ReportTotals totais={result.totais} />}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoadingReports && <LoadingIndicator label="Carregando relatórios..." />}

        {!isLoadingReports && reportsError && <ErrorState message={reportsError} onRetry={retryReports} />}

        {!isLoadingReports && !reportsError && reports.length === 0 && (
          <EmptyState
            icon={BarChart3}
            title="Nenhum relatório disponível ainda"
            description="Os relatórios aparecem aqui assim que forem disponibilizados no sistema."
          />
        )}

        {!isLoadingReports && !reportsError && activeReport && (
          <>
            <div className="space-y-4 border-b border-slate-100 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-[#062A45]">
                  <Calendar className="h-4 w-4" /> Período e filtros
                </h2>
                {activeReport.exigePeriodo && (
                  <div className="flex items-center gap-4">
                    {hasRows && (
                      <span className="text-xs text-slate-500">
                        {result.linhas.length} {result.linhas.length === 1 ? "registro" : "registros"} no período
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePeriodChange(currentMonthPeriod())}
                      disabled={isSamePeriod(period, currentMonthPeriod())}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-[#062A45] cursor-pointer disabled:cursor-default disabled:opacity-40"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Limpar filtros
                    </button>
                  </div>
                )}
              </div>
              {activeReport.exigePeriodo ? (
                <PeriodFilter value={period} onChange={handlePeriodChange} />
              ) : (
                <p className="text-sm text-slate-500">Este relatório não depende de período.</p>
              )}
            </div>

            <div role="tablist" aria-label="Relatórios disponíveis" className="flex gap-1 overflow-x-auto border-b border-slate-100 px-5">
              {reports.map((report) => {
                const isActive = report.relatorio === activeReport.relatorio;
                return (
                  <button
                    key={report.relatorio}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelect(report)}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "border-[#062A45] text-[#062A45]"
                        : "border-transparent text-slate-500 hover:text-[#062A45]"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    {report.titulo}
                  </button>
                );
              })}
            </div>

            {isLoadingResult && <LoadingIndicator label="Gerando relatório..." />}

            {!isLoadingResult && resultError && <ErrorState message={resultError} onRetry={retryResult} />}

            {!isLoadingResult && !resultError && result && result.linhas.length === 0 && (
              <EmptyState
                icon={SearchX}
                title="Nenhum dado encontrado no período"
                description="Tente escolher outro período."
              />
            )}

            {hasRows && <ReportTable colunas={result.colunas} linhas={result.linhas} />}

            {!isLoadingResult && !resultError && result && (
              <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
                {result.periodo && `Período de ${formatDate(result.periodo.dataInicio)} a ${formatDate(result.periodo.dataFim)} · `}
                Emitido em {formatDateTime(result.emitidoEm)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
