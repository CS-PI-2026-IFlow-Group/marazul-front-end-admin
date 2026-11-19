import { AlertCircle, BarChart3, FileText, Loader2, RefreshCw, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import PeriodFilter from "../components/PeriodFilter";
import ReportTable from "../components/ReportTable";
import { Button } from "../components/ui/button";
import { usePageTitle } from "../hooks/usePageTitle";
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

function LoadingState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-[#062A45]" />
      <p className="text-sm font-medium text-slate-700">{message}</p>
    </div>
  );
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

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-8 w-8 text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{message}</p>
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
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [resultError, setResultError] = useState("");
  const [reloadResult, setReloadResult] = useState(0);

  const shouldQuery = canQuery(selected, period);

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
    RelatorioService.generate(selected.relatorio, selected.exigePeriodo ? period : {})
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
      })
      .finally(() => {
        if (active) setIsLoadingResult(false);
      });
    return () => { active = false; };
  }, [selected, period, reloadResult, shouldQuery]);

  const startQuery = (report, nextPeriod) => {
    setResult(null);
    setResultError("");
    setIsLoadingResult(canQuery(report, nextPeriod));
  };

  const handleSelect = (report) => {
    if (report.relatorio === selected?.relatorio) return;
    setSelected(report);
    startQuery(report, period);
  };

  const handlePeriodChange = (nextPeriod) => {
    setPeriod(nextPeriod);
    startQuery(selected, nextPeriod);
  };

  const retryReports = () => {
    setIsLoadingReports(true);
    setReportsError("");
    setReloadReports((value) => value + 1);
  };

  const retryResult = () => {
    startQuery(selected, period);
    setReloadResult((value) => value + 1);
  };

  return (
    <div className="space-y-6 font-sans">
      <h1 className="text-2xl font-bold text-[#062A45]">Relatórios</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-4 rounded-t-xl">
          <h2 className="text-base font-semibold text-[#062A45]">Relatórios disponíveis</h2>
          {!isLoadingReports && !reportsError && (
            <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">{reports.length}</span>
          )}
        </div>

        {isLoadingReports && <LoadingState message="Carregando relatórios..." />}

        {!isLoadingReports && reportsError && <ErrorState message={reportsError} onRetry={retryReports} />}

        {!isLoadingReports && !reportsError && reports.length === 0 && (
          <EmptyState icon={BarChart3} message="Nenhum relatório disponível ainda" />
        )}

        {!isLoadingReports && !reportsError && reports.length > 0 && (
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => {
              const isSelected = report.relatorio === selected?.relatorio;
              return (
                <button
                  key={report.relatorio}
                  type="button"
                  onClick={() => handleSelect(report)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "border-[#062A45] bg-[#062A45] text-white"
                      : "border-slate-200 bg-white text-[#062A45] hover:border-[#062A45]/40 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  {report.titulo}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-slate-100 bg-slate-50/60 px-5 py-4 rounded-t-xl">
            <div>
              <h2 className="text-base font-semibold text-[#062A45]">{selected.titulo}</h2>
              {result && (
                <p className="mt-1 text-xs text-slate-500">
                  {result.periodo && `Período de ${formatDate(result.periodo.dataInicio)} a ${formatDate(result.periodo.dataFim)} · `}
                  Emitido em {formatDateTime(result.emitidoEm)}
                </p>
              )}
            </div>
            {selected.exigePeriodo && <PeriodFilter value={period} onChange={handlePeriodChange} />}
          </div>

          {isLoadingResult && <LoadingState message="Gerando relatório..." />}

          {!isLoadingResult && resultError && <ErrorState message={resultError} onRetry={retryResult} />}

          {!isLoadingResult && !resultError && result && result.linhas.length === 0 && (
            <EmptyState icon={SearchX} message="Nenhum dado encontrado no período" />
          )}

          {!isLoadingResult && !resultError && result && result.linhas.length > 0 && (
            <ReportTable colunas={result.colunas} linhas={result.linhas} totais={result.totais} />
          )}
        </div>
      )}
    </div>
  );
}
