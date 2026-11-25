import { BarChart3, Calendar, CalendarDays, Download, FileSpreadsheet, FileText, RotateCcw, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingIndicator from "../components/LoadingIndicator";
import PageHeader from "../components/PageHeader";
import PeriodFilter from "../components/PeriodFilter";
import ReportTable from "../components/ReportTable";
import ReportTotals from "../components/ReportTotals";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { usePageTitle } from "../hooks/usePageTitle";
import { reportFileName, reportToCsv } from "../lib/csv";
import { saveFile } from "../lib/download";
import { currentMonthPeriod, defaultPeriodFor, isValidPeriod } from "../lib/period";
import { formatDate, formatDateTime } from "../lib/reportFormat";
import { cn } from "../lib/utils";
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
          const list = Array.isArray(data) ? data : [];
          setReports(list);
          setPeriod(defaultPeriodFor(list[0]));
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
    setPeriod(defaultPeriodFor(report));
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
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/relatorios/resumo-mensal"><CalendarDays aria-hidden="true" /> Resumo mensal</Link>
            </Button>
            {hasRows && (
              <>
              <Button variant="outline" onClick={handleExportCsv}>
                <FileSpreadsheet /> Exportar CSV
              </Button>
              <Button onClick={handleExportPdf} disabled={isDownloadingPdf}>
                {isDownloadingPdf ? (
                  <LoadingIndicator variant="button" label="Baixando..." />
                ) : (
                  <>
                    <Download /> Baixar PDF
                  </>
                )}
              </Button>
              </>
            )}
          </div>
        }
      />

      {hasRows && result.totais?.length > 0 && <ReportTotals totais={result.totais} />}

      <Card className="gap-0 py-0">
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
            <div className="space-y-4 border-b px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="size-4 text-muted-foreground" aria-hidden="true" /> Período e filtros
                </h2>
                {activeReport.exigePeriodo && (
                  <div className="flex items-center gap-3">
                    {hasRows && (
                      <span className="text-xs text-muted-foreground">
                        {result.linhas.length} {result.linhas.length === 1 ? "registro" : "registros"} no período
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handlePeriodChange(defaultPeriodFor(activeReport))}
                      disabled={isSamePeriod(period, defaultPeriodFor(activeReport))}
                      className="text-muted-foreground"
                    >
                      <RotateCcw /> Limpar filtros
                    </Button>
                  </div>
                )}
              </div>
              {activeReport.exigePeriodo ? (
                <PeriodFilter value={period} onChange={handlePeriodChange} />
              ) : (
                <p className="text-sm text-muted-foreground">Este relatório não depende de período.</p>
              )}
            </div>

            <div role="tablist" aria-label="Relatórios disponíveis" className="flex gap-1 overflow-x-auto border-b px-5">
              {reports.map((report) => {
                const isActive = report.relatorio === activeReport.relatorio;
                return (
                  <button
                    key={report.relatorio}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelect(report)}
                    className={cn(
                      "flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <FileText className="size-4" aria-hidden="true" />
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
              <p className="border-t px-5 py-3 text-xs text-muted-foreground">
                {result.periodo && `Período de ${formatDate(result.periodo.dataInicio)} a ${formatDate(result.periodo.dataFim)} · `}
                Emitido em {formatDateTime(result.emitidoEm)}
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
