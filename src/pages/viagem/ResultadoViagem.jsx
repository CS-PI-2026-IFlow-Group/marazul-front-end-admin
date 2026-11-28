import { ArrowLeft, Download, Map, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import LoadingIndicator from "../../components/LoadingIndicator";
import PageHeader from "../../components/PageHeader";
import ReportTotals from "../../components/ReportTotals";
import TripStatusBadge from "../../components/TripStatusBadge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { usePageTitle } from "../../hooks/usePageTitle";
import { formatDateTime, formatReportValue } from "../../lib/reportFormat";
import RelatorioService from "../../services/RelatorioService";
import ViagemService from "../../services/ViagemService";

function errorMessage(error, fallback) {
  const data = error?.response?.data;
  return data?.message || data?.erro || fallback;
}

function money(value) {
  return formatReportValue(value, "MOEDA");
}

function totalsOf(result) {
  return [
    { chave: "cobrado", titulo: "Cobrado", formato: "MOEDA", valor: result.cobrado },
    { chave: "recebido", titulo: "Recebido", formato: "MOEDA", valor: result.recebido },
    { chave: "gastos", titulo: "Gastos", formato: "MOEDA", valor: result.gastos },
    { chave: "resultado", titulo: "Resultado", formato: "MOEDA", valor: result.resultado },
  ];
}

function Detail({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-sm break-words text-foreground">{children || "—"}</p>
    </div>
  );
}

export default function ResultadoViagem() {
  usePageTitle("Resultado da Viagem");
  const navigate = useNavigate();
  const { id } = useParams();

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    let active = true;
    RelatorioService.getTripResult(id)
      .then((data) => {
        if (!active) return;
        setResult(data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 404) {
          setNotFound(true);
          return;
        }
        setError(errorMessage(err, "Não foi possível carregar o resultado da viagem."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  const retry = () => {
    setIsLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await RelatorioService.downloadTripResultPdf(id);
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível baixar o PDF."));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const backButton = (
    <Button variant="outline" onClick={() => navigate(`/viagens/detalhes/${id}`)}>
      <ArrowLeft /> Voltar para a viagem
    </Button>
  );

  if (isLoading || notFound || error || !result) {
    return (
      <div>
        <PageHeader title="Resultado da viagem" action={backButton} />
        <Card className="gap-0 py-0">
          {isLoading && <LoadingIndicator label="Carregando resultado..." />}
          {!isLoading && notFound && (
            <EmptyState
              icon={Map}
              title="Viagem não encontrada"
              description="Ela pode ter sido removida ou o endereço está incorreto."
            />
          )}
          {!isLoading && !notFound && (error || !result) && (
            <ErrorState message={error || "Não foi possível carregar o resultado da viagem."} onRetry={retry} />
          )}
        </Card>
      </div>
    );
  }

  const expenses = Array.isArray(result.gastosDetalhados) ? result.gastosDetalhados : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resultado da viagem"
        action={
          <div className="flex flex-wrap gap-2">
            {backButton}
            <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
              {isDownloadingPdf ? (
                <LoadingIndicator variant="button" label="Baixando..." />
              ) : (
                <>
                  <Download /> Baixar PDF
                </>
              )}
            </Button>
          </div>
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center gap-3 border-b px-6 py-4">
          <Map className="size-4 shrink-0 text-accent" />
          <h2 className="min-w-0 text-lg font-semibold break-words text-foreground">{result.trecho}</h2>
          <TripStatusBadge status={ViagemService.getStatusValue(result.situacao)} label={result.situacao} />
        </div>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
          <Detail label="Viagem">{`Nº ${result.viagemId}`}</Detail>
          <Detail label="Saída">{formatDateTime(result.dataSaida)}</Detail>
          <Detail label="Cliente">{result.cliente}</Detail>
        </div>
      </Card>

      <ReportTotals totais={totalsOf(result)} />

      <Card className="gap-0 py-0">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <Receipt className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-sm font-semibold">Gastos da viagem</h2>
        </div>
        {expenses.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            Nenhum gasto lançado para esta viagem.
          </p>
        ) : (
          <DataTable head={["Descrição", "Valor"]}>
            {expenses.map((expense, index) => (
              <tr key={`${expense.descricao}-${index}`}>
                <td className="text-foreground">{expense.descricao}</td>
                <td className="whitespace-nowrap tabular-nums">{money(expense.valor)}</td>
              </tr>
            ))}
            <tr className="bg-muted/30 font-semibold">
              <td className="text-foreground">Soma dos gastos</td>
              <td className="whitespace-nowrap tabular-nums">{money(result.gastos)}</td>
            </tr>
          </DataTable>
        )}
        <p className="border-t px-6 py-3 text-xs text-muted-foreground">
          Emitido em {formatDateTime(result.emitidoEm)}
        </p>
      </Card>
    </div>
  );
}
