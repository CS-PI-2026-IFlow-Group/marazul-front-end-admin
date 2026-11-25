import { useEffect, useState } from "react";
import { ArrowLeft, Download, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingIndicator from "../components/LoadingIndicator";
import PageHeader from "../components/PageHeader";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDate, formatDateTime, formatReportValue, isNegativeMoney, toReportNumber } from "../lib/reportFormat";
import ResumoMensalService from "../services/ResumoMensalService";

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month) {
  const [year, number] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(new Date(year, number - 1, 1));
}

function errorMessage(error, fallback) {
  const data = error?.response?.data;
  return data?.message || data?.erro || fallback;
}

function formatVariation(value, format) {
  const number = toReportNumber(value);
  if (number === null) return formatReportValue(value, format);
  const formatted = formatReportValue(number, format);
  return number > 0 ? `+${formatted}` : formatted;
}

function MonthlyIndicatorCard({ indicator }) {
  const value = formatReportValue(indicator.valor, indicator.formato);
  const previousValue = formatReportValue(indicator.valorAnterior, indicator.formato);
  const variation = formatVariation(indicator.variacao, indicator.formato);
  const percentage = indicator.variacaoPercentual == null
    ? "—"
    : formatReportValue(indicator.variacaoPercentual, "PERCENTUAL");
  const isResult = indicator.chave === "resultado";
  const isNegative = isResult && isNegativeMoney(indicator.valor, indicator.formato);
  const variationNegative = isResult && isNegativeMoney(indicator.variacao, indicator.formato);

  return (
    <Card className="min-w-0 gap-3 p-5">
      <h2 className="text-sm font-medium text-muted-foreground">{indicator.titulo}</h2>
      <p className={`break-words font-display text-2xl font-bold tabular-nums sm:text-3xl ${isNegative ? "text-destructive" : "text-foreground"}`}>
        {value}
      </p>
      <div className="space-y-1 border-t pt-3 text-xs text-muted-foreground">
        <p>Mês anterior: <span className="font-medium text-foreground">{previousValue}</span></p>
        <p>
          Variação: <span className={`font-medium ${variationNegative ? "text-destructive" : "text-foreground"}`}>
            {variation}
          </span>
        </p>
        <p>
          Variação percentual: <span className="font-medium text-foreground">{percentage}</span>
        </p>
      </div>
    </Card>
  );
}

function TopClientCard({ client }) {
  return (
    <li className="min-w-0">
      <Card className="h-full flex-row items-center gap-3 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-label={`Posição ${client.posicao}`}>
          {client.posicao}
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words font-medium text-foreground">{client.cliente}</p>
          <p className="text-sm text-muted-foreground">
            {client.viagens} {client.viagens === 1 ? "viagem" : "viagens"} concluídas
          </p>
        </div>
      </Card>
    </li>
  );
}

export default function ResumoMensal() {
  usePageTitle("Resumo financeiro mensal");

  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [queriedMonth, setQueriedMonth] = useState(currentMonthValue);
  const [reloadKey, setReloadKey] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthError, setMonthError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    ResumoMensalService.getResumo(queriedMonth, { signal: controller.signal })
      .then((data) => {
        if (active) {
          setSummary(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (!active || requestError.response?.status === 401) return;
        setSummary(null);
        setError(errorMessage(requestError, "Não foi possível carregar o resumo mensal."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [queriedMonth, reloadKey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)) {
      setMonthError("Escolha um mês válido para consultar.");
      return;
    }

    setMonthError("");
    setLoading(true);
    setError("");
    setSummary(null);
    setQueriedMonth(selectedMonth);
    setReloadKey((key) => key + 1);
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setSummary(null);
    setReloadKey((key) => key + 1);
  };

  const handlePdfDownload = async () => {
    setDownloadingPdf(true);
    try {
      await ResumoMensalService.downloadPdf(queriedMonth);
    } catch (downloadError) {
      toast.error(errorMessage(downloadError, "Não foi possível baixar o PDF."));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const hasIndicators = Array.isArray(summary?.indicadores);
  const topClients = Array.isArray(summary?.principaisClientes) ? summary.principaisClientes : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumo financeiro mensal"
        action={(
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/relatorios"><ArrowLeft aria-hidden="true" /> Relatórios</Link>
            </Button>
            {summary && (
              <Button onClick={handlePdfDownload} disabled={downloadingPdf} className="w-full sm:w-auto">
                {downloadingPdf ? (
                  <LoadingIndicator variant="button" label="Gerando PDF..." />
                ) : (
                  <><Download aria-hidden="true" /> Exportar PDF</>
                )}
              </Button>
            )}
          </div>
        )}
      />

      <Card className="gap-4 p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full space-y-2 sm:max-w-xs">
            <Label htmlFor="summary-month">Mês do resumo</Label>
            <Input
              id="summary-month"
              type="month"
              required
              value={selectedMonth}
              aria-invalid={Boolean(monthError)}
              aria-describedby={monthError ? "summary-month-error" : undefined}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setMonthError("");
              }}
            />
            {monthError && <p id="summary-month-error" className="text-sm font-medium text-destructive" role="alert">{monthError}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? <LoadingIndicator variant="button" label="Consultando..." /> : "Consultar mês"}
          </Button>
        </form>
      </Card>

      {loading && <Card><LoadingIndicator label="Carregando resumo mensal..." /></Card>}
      {!loading && error && <Card><ErrorState message={error} onRetry={handleRetry} /></Card>}

      {!loading && !error && summary && (
        <>
          <section aria-labelledby="summary-period-heading" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 id="summary-period-heading" className="text-lg font-semibold capitalize text-foreground">
                  {monthLabel(summary.mes)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Período consultado: {formatDate(summary.periodo.dataInicio)} a {formatDate(summary.periodo.dataFim)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Emitido em {formatDateTime(summary.emitidoEm)}
              </p>
            </div>

            {hasIndicators && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {summary.indicadores.map((indicator) => (
                  <MonthlyIndicatorCard key={indicator.chave} indicator={indicator} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="top-clients-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Users aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 id="top-clients-heading" className="text-lg font-semibold text-foreground">Principais clientes</h2>
                <p className="text-sm text-muted-foreground">Até cinco clientes com mais viagens concluídas no mês</p>
              </div>
            </div>
            {topClients.length > 0 ? (
              <ol className="grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
                {topClients.map((client) => (
                  <TopClientCard key={client.clienteId ?? `${client.posicao}-${client.cliente}`} client={client} />
                ))}
              </ol>
            ) : (
              <Card className="p-5">
                <EmptyState
                  icon={Users}
                  title="Nenhum cliente com viagens concluídas"
                  description={`Não houve viagens concluídas em ${monthLabel(summary.mes)}.`}
                  className="py-8"
                />
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
