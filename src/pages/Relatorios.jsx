import { BarChart3, Calendar, CalendarDays, Download, FileSpreadsheet, FileText, RotateCcw, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import FleetUsageSummary from "../components/FleetUsageSummary";
import FleetUsageTable from "../components/FleetUsageTable";
import LoadingIndicator from "../components/LoadingIndicator";
import PageHeader from "../components/PageHeader";
import PeriodFilter from "../components/PeriodFilter";
import ReportFilters from "../components/ReportFilters";
import ReportTable from "../components/ReportTable";
import ReportTotals from "../components/ReportTotals";
import WeeklySchedule from "../components/WeeklySchedule";
import WeeklyScheduleSummary from "../components/WeeklyScheduleSummary";
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

function hasActiveFilters(filters) {
  return Object.values(filters).some((value) => value !== undefined && value !== null && value !== "");
}

function normalizeVehicles(payload, periodDays) {
  const rows = Array.isArray(payload)
    ? payload
    : payload?.linhas ?? payload?.veiculos ?? payload?.vehicles ?? payload?.resultados ?? [];

  return rows.map((row, index) => {
    const prefix = row.prefixo ?? row.prefix ?? row.vehiclePrefix ?? "Sem prefixo";
    const plate = row.placa ?? row.licensePlate ?? row.plate ?? "Sem placa";
    const trips = Number(row.viagens ?? row.viagensRealizadas ?? row.totalViagens ?? row.tripCount ?? row.trips ?? 0);
    const daysDriven = Number(row.diasRodados ?? row.daysDriven ?? row.distinctDaysDriven ?? 0);
    const daysStopped = Number(row.diasParados ?? row.daysStopped ?? Math.max(0, periodDays - daysDriven));
    const utilization = Number(
      row.aproveitamento ?? row.percentualAproveitamento ?? row.utilizationPercentage ??
        (periodDays > 0 ? (daysDriven / periodDays) * 100 : 0),
    );

    return {
      id: row.veiculoId ?? row.vehicleId ?? row.id ?? `${prefix}-${plate}-${index}`,
      prefix,
      plate,
      status: row.status ?? row.situacao ?? "ACTIVE",
      trips,
      daysDriven,
      daysStopped,
      utilization: Number.isFinite(utilization) ? utilization : 0,
    };
  });
}

function getPeriodDays(period) {
  const start = Date.parse(`${period.dataInicio}T00:00:00Z`);
  const end = Date.parse(`${period.dataFim}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}

function findTotal(totals, ...keys) {
  return totals?.find((item) => keys.includes(item.chave));
}

function totalValue(totals, ...keys) {
  return findTotal(totals, ...keys)?.valor;
}

function vehicleForTotal(value, sortedVehicles) {
  if (value == null || value === "") return null;
  const prefix = typeof value === "object" ? value.prefixo ?? value.prefix : String(value);
  return sortedVehicles.find((vehicle) => vehicle.prefix === prefix) ?? { prefix };
}

function getFleetStatus(status) {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized === "INACTIVE" || normalized === "INATIVO") {
    return { label: "Inativo", className: "bg-rose-50 text-rose-700 ring-rose-200" };
  }
  if (["UNDER_MAINTENANCE", "EM_MANUTENÇÃO", "EM MANUTENÇÃO"].includes(normalized)) {
    return { label: "Em manutenção", className: "bg-amber-50 text-amber-800 ring-amber-200" };
  }
  return { label: "Ativo", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
}

function formatPercent(value) {
  return new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(value / 100);
}

export default function Relatorios() {
  usePageTitle("Relatórios");

  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [reloadReports, setReloadReports] = useState(0);
  const [selected, setSelected] = useState(null);
  const [period, setPeriod] = useState(currentMonthPeriod);
  const [filters, setFilters] = useState({});
  const [result, setResult] = useState(null);
  const [resultError, setResultError] = useState("");
  const [reloadResult, setReloadResult] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [sortDirection, setSortDirection] = useState("desc");

  const activeReport = selected ?? reports[0] ?? null;
  const shouldQuery = canQuery(activeReport, period);
  const isLoadingResult = shouldQuery && result === null && resultError === "";
  const hasRows = !isLoadingResult && !resultError && result?.linhas.length > 0;
  const isFleetUsage = activeReport?.relatorio === "uso-frota";
  const isSchedule = activeReport?.relatorio === "agenda";
  const hasGenericView = !isFleetUsage && !isSchedule;
  const isFiltering = hasActiveFilters(filters);
  const isDefaultState = isSamePeriod(period, defaultPeriodFor(activeReport)) && !isFiltering;
  const fleetVehicles = isFleetUsage && result
    ? normalizeVehicles(result, getPeriodDays(period))
    : [];
  const sortedVehicles = [...fleetVehicles].sort((left, right) => {
    const difference = left.utilization - right.utilization;
    if (difference !== 0) return sortDirection === "desc" ? -difference : difference;
    return left.prefix.localeCompare(right.prefix, "pt-BR");
  });
  const totalTrips = Number(totalValue(result?.totais, "viagens") ?? fleetVehicles.reduce((sum, vehicle) => sum + vehicle.trips, 0));
  const averageDaysDriven = Number(totalValue(result?.totais, "mediaDiasRodados") ?? (
    fleetVehicles.length ? fleetVehicles.reduce((sum, vehicle) => sum + vehicle.daysDriven, 0) / fleetVehicles.length : 0
  ));
  const usageRank = [...fleetVehicles].sort((left, right) => right.utilization - left.utilization || left.prefix.localeCompare(right.prefix, "pt-BR"));
  const mostUsedTotal = findTotal(result?.totais, "maisUtilizado");
  const leastUsedTotal = findTotal(result?.totais, "menosUtilizado");
  const mostUsed = mostUsedTotal
    ? vehicleForTotal(mostUsedTotal.valor, usageRank)
    : totalTrips > 0 ? usageRank[0] : null;
  const leastUsed = leastUsedTotal
    ? vehicleForTotal(leastUsedTotal.valor, usageRank)
    : totalTrips > 0 ? usageRank[usageRank.length - 1] : null;

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
    RelatorioService.generate(activeReport.relatorio, activeReport.exigePeriodo ? period : {}, filters)
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
  }, [activeReport, period, filters, reloadResult, shouldQuery]);

  const resetResult = () => {
    setResult(null);
    setResultError("");
  };

  const handleSelect = (report) => {
    if (report.relatorio === activeReport?.relatorio) return;
    setSelected(report);
    setPeriod(defaultPeriodFor(report));
    setFilters({});
    resetResult();
  };

  const handlePeriodChange = (nextPeriod) => {
    setPeriod(nextPeriod);
    resetResult();
  };

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    resetResult();
  };

  const clearFilters = () => {
    setPeriod(defaultPeriodFor(activeReport));
    setFilters({});
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
      await RelatorioService.downloadPdf(result.relatorio, result.periodo ?? {}, filters);
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

      {hasRows && result.totais?.length > 0 && hasGenericView && <ReportTotals totais={result.totais} />}

      {hasRows && isSchedule && <WeeklyScheduleSummary totais={result.totais ?? []} />}

      {isFleetUsage && (
        <FleetUsageSummary
          totalTrips={totalTrips}
          averageDaysDriven={averageDaysDriven}
          mostUsed={mostUsed}
          leastUsed={leastUsed}
          loading={isLoadingResult}
          error={resultError}
        />
      )}

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
                    {hasRows && !isSchedule && (
                      <span className="text-xs text-muted-foreground">
                        {result.linhas.length} {result.linhas.length === 1 ? "registro" : "registros"} no período
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={clearFilters}
                      disabled={isDefaultState}
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
              {activeReport.filtros?.length > 0 && (
                <ReportFilters filtros={activeReport.filtros} value={filters} onChange={handleFiltersChange} />
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
                description={isFiltering ? "Tente escolher outro período ou limpar os filtros." : "Tente escolher outro período."}
              />
            )}

            {hasRows && isFleetUsage && (
              <div className="p-5">
                <FleetUsageTable
                  vehicles={sortedVehicles}
                  loading={isLoadingResult}
                  error={resultError}
                  noTrips={Boolean(result && totalTrips === 0)}
                  onRetry={retryResult}
                  sortDirection={sortDirection}
                  setSortDirection={setSortDirection}
                  getVehicleStatus={getFleetStatus}
                  formatPercent={formatPercent}
                />
              </div>
            )}
            {hasRows && isSchedule && <WeeklySchedule linhas={result.linhas} />}
            {hasRows && hasGenericView && <ReportTable colunas={result.colunas} linhas={result.linhas} />}

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
