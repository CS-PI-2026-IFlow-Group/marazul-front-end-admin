import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Clock,
  FileText,
  Map,
  Receipt,
  Route,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import FormSection from "../../components/FormSection";
import LoadingIndicator from "../../components/LoadingIndicator";
import PageHeader from "../../components/PageHeader";
import TripStatusBadge from "../../components/TripStatusBadge";
import TripTimeline from "../../components/TripTimeline";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { formatDateTime } from "../../lib/dateTime";
import { formatCpf } from "../../lib/documentMasks";
import { formatCurrency, toCents } from "../../lib/moneyMasks";
import { hasPermission } from "../../lib/permissions";
import {
  NEXT_STAGE_ACTIONS,
  getNextStage,
  stageRecordsTime,
  toInputDateTime,
} from "../../lib/tripStages";
import ViagemService from "../../services/ViagemService";

function errorMessage(error, fallback) {
  const data = error?.response?.data;
  return data?.message || data?.erro || fallback;
}

function formatPlace(city, stateAcronym) {
  if (city && stateAcronym) return `${city}/${stateAcronym}`;
  return city || stateAcronym || "—";
}

function formatRoute(trip) {
  return `${formatPlace(trip.originCity, trip.originStateAcronym)} → ${formatPlace(
    trip.destinationCity,
    trip.destinationStateAcronym,
  )}`;
}

function Detail({ label, children, className }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm break-words text-foreground">{children || "—"}</div>
    </div>
  );
}

function AdvanceStageModal({ trip, nextStage, onClose, onAdvanced }) {
  const recordsTime = stageRecordsTime(nextStage);
  const actionLabel = NEXT_STAGE_ACTIONS[nextStage];
  const stageLabel = ViagemService.getStatusLabel(nextStage);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(() => toInputDateTime());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const canSubmit = !isSubmitting && (!useCustomTime || Boolean(customTime));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const updated = await ViagemService.alterarSituacao(
        trip.id,
        nextStage,
        recordsTime && useCustomTime ? customTime : null,
      );
      onAdvanced(updated, stageLabel);
    } catch (error) {
      setSubmitError(errorMessage(error, "Não foi possível registrar a etapa."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={isSubmitting ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registrar-etapa-titulo"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Fechar"
          className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="size-5" />
        </button>

        <h3 id="registrar-etapa-titulo" className="pr-8 font-display text-xl font-bold text-foreground">
          {actionLabel}
        </h3>
        <p className="mt-3 text-base text-muted-foreground">
          A viagem passará para{" "}
          <span className="font-semibold text-foreground">{stageLabel}</span>.
        </p>

        {recordsTime && (
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                {useCustomTime
                  ? "O horário informado abaixo será gravado como horário realizado."
                  : "O horário atual será gravado como horário realizado desta etapa."}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="informar-horario"
                checked={useCustomTime}
                onCheckedChange={(checked) => setUseCustomTime(checked === true)}
                disabled={isSubmitting}
              />
              <Label htmlFor="informar-horario" className="cursor-pointer">
                Informar outro horário
              </Label>
            </div>
            {useCustomTime && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="horario-realizado" className="tracking-wide uppercase">
                  Horário realizado
                </Label>
                <Input
                  id="horario-realizado"
                  type="datetime-local"
                  value={customTime}
                  max={toInputDateTime()}
                  onChange={(event) => setCustomTime(event.target.value)}
                  disabled={isSubmitting}
                  className="h-10"
                />
              </div>
            )}
          </div>
        )}

        {submitError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {submitError}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 w-full flex-1 font-semibold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-11 w-full flex-1"
          >
            {isSubmitting ? (
              <LoadingIndicator variant="button" label="Registrando..." />
            ) : (
              "Confirmar registro"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DetalhesViagem() {
  usePageTitle("Detalhes da Viagem");
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();
  const canViewReports = hasPermission(profile, "relatorios:view");

  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    let active = true;
    ViagemService.getById(id)
      .then((data) => {
        if (!active) return;
        setTrip(data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 404) {
          setNotFound(true);
          return;
        }
        setError(errorMessage(err, "Não foi possível carregar a viagem."));
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

  const handleAdvanced = (updated, stageLabel) => {
    setTrip(updated);
    setIsAdvancing(false);
    toast.success(`Etapa "${stageLabel}" registrada com sucesso!`);
  };

  const backButton = (
    <Button variant="outline" onClick={() => navigate("/viagens")}>
      <ArrowLeft /> Voltar
    </Button>
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Detalhes da viagem" action={backButton} />
        <Card className="gap-0 py-0">
          <LoadingIndicator label="Carregando viagem..." />
        </Card>
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <PageHeader title="Detalhes da viagem" action={backButton} />
        <Card className="gap-0 py-0">
          <EmptyState
            icon={Map}
            title="Viagem não encontrada"
            description="Ela pode ter sido removida ou o endereço está incorreto."
          />
        </Card>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div>
        <PageHeader title="Detalhes da viagem" action={backButton} />
        <Card className="gap-0 py-0">
          <ErrorState message={error || "Viagem não encontrada."} onRetry={retry} />
        </Card>
      </div>
    );
  }

  const nextStage = getNextStage(trip.status);
  const passengers = Array.isArray(trip.passengers) ? trip.passengers : [];
  const expenses = Array.isArray(trip.expenses) ? trip.expenses : [];
  const drivers = Array.isArray(trip.drivers) ? trip.drivers : [];
  const passengerCount = passengers.length;
  const totalDueCents = passengers.reduce(
    (sum, passenger) => sum + (toCents(passenger.amountDue) ?? 0),
    0,
  );
  const individualValue = trip.estimatedIndividualValue ?? trip.estimatedPassengerAmount;

  return (
    <div>
      <PageHeader title="Detalhes da viagem" action={backButton} />

      <Card className="mb-6 gap-0 py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <Map className="size-4 shrink-0 text-accent" />
            <h2 className="text-lg font-semibold break-words text-foreground">
              {formatRoute(trip)}
            </h2>
            <TripStatusBadge
              status={trip.status}
              label={ViagemService.getStatusLabel(trip.status)}
            />
          </div>
          {nextStage && (
            <Button onClick={() => setIsAdvancing(true)} disabled={isAdvancing}>
              {NEXT_STAGE_ACTIONS[nextStage]} <ArrowRight />
            </Button>
          )}
          {trip.status === "COMPLETED" && canViewReports && (
            <Button onClick={() => navigate(`/relatorios/resultado-viagens/${trip.id}`)}>
              <Calculator /> Resultado da viagem
            </Button>
          )}
        </div>
        <div className="p-6">
          <TripTimeline trip={trip} />
        </div>
      </Card>

      <Card className="gap-0 py-0">
        <div className="divide-y">
          <FormSection icon={Route} title="Dados da viagem">
            <Detail label="Trecho" className="sm:col-span-2">
              {formatRoute(trip)}
            </Detail>
            <Detail label="Ônibus">
              {trip.vehiclePrefix &&
                [
                  trip.vehiclePrefix,
                  trip.vehicleLicensePlate,
                  trip.vehicleSeats ? `${trip.vehicleSeats} assentos` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
            </Detail>
            <Detail label="Motoristas">
              {drivers.map((driver) => driver.name).join(", ")}
            </Detail>
            <Detail label="Cliente">{trip.clientName}</Detail>
            <Detail label="Saída prevista">{formatDateTime(trip.plannedDepartureOrigin)}</Detail>
          </FormSection>

          <FormSection
            icon={Users}
            title="Passageiros"
            description={
              trip.vehicleSeats
                ? `${passengerCount} de ${trip.vehicleSeats} assentos`
                : `${passengerCount} ${passengerCount === 1 ? "passageiro" : "passageiros"}`
            }
          >
            {passengers.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground sm:col-span-2">
                Nenhum passageiro incluído nesta viagem.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border sm:col-span-2">
                <DataTable head={["Nome", "CPF", "Valor devido", "Valor pago", "Em aberto"]}>
                  {passengers.map((passenger) => {
                    const dueCents = toCents(passenger.amountDue);
                    const openCents =
                      dueCents === null ? null : dueCents - (toCents(passenger.amountPaid) ?? 0);
                    return (
                      <tr key={passenger.passengerId}>
                        <td>
                          <span className="inline-flex items-center gap-2 whitespace-nowrap">
                            <span className="font-medium text-foreground">{passenger.name}</span>
                            {Number(trip.responsiblePassengerId) ===
                              Number(passenger.passengerId) && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                Responsável
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-muted-foreground">
                          {formatCpf(passenger.cpf)}
                        </td>
                        <td className="whitespace-nowrap tabular-nums">
                          {formatCurrency(passenger.amountDue)}
                        </td>
                        <td className="whitespace-nowrap tabular-nums">
                          {formatCurrency(passenger.amountPaid ?? 0)}
                        </td>
                        <td className="whitespace-nowrap font-semibold tabular-nums">
                          {openCents === null ? "—" : formatCurrency(openCents / 100)}
                        </td>
                      </tr>
                    );
                  })}
                </DataTable>
              </div>
            )}
            <Detail label="Total devido">{formatCurrency(totalDueCents / 100)}</Detail>
            <Detail label="Responsável pelo grupo">{trip.responsiblePassengerName}</Detail>
          </FormSection>

          <FormSection icon={Receipt} title="Gastos">
            {expenses.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground sm:col-span-2">
                Nenhum gasto registrado nesta viagem.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border sm:col-span-2">
                <DataTable head={["Descrição", "Valor"]}>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="text-foreground">{expense.description}</td>
                      <td className="whitespace-nowrap tabular-nums">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            )}
            {expenses.length > 0 && (
              <Detail label="Soma dos gastos" className="sm:col-span-2">
                {formatCurrency(trip.totalExpenses ?? expenses.reduce((sum, expense) => sum + (toCents(expense.amount) ?? 0), 0) / 100)}
              </Detail>
            )}
          </FormSection>

          <FormSection icon={Wallet} title="Valores">
            <Detail label="Valor estimado total">
              {formatCurrency(trip.estimatedTotalValue)}
            </Detail>
            <Detail label="Valor estimado por passageiro">
              {formatCurrency(individualValue)}
            </Detail>
            <Detail label="Mínimo de passageiros">{trip.minimumPassengers}</Detail>
            <Detail label="Total de gastos">{formatCurrency(trip.totalExpenses ?? 0)}</Detail>
            <Detail label="Total recebido">{formatCurrency(trip.totalReceived ?? 0)}</Detail>
            <Detail label="Total em aberto">{formatCurrency(trip.totalOpen ?? 0)}</Detail>
          </FormSection>

          <FormSection icon={FileText} title="Observação">
            <Detail label="Observação" className="sm:col-span-2">
              {trip.notes && <span className="whitespace-pre-line">{trip.notes}</span>}
            </Detail>
          </FormSection>
        </div>
      </Card>

      {isAdvancing && nextStage && (
        <AdvanceStageModal
          trip={trip}
          nextStage={nextStage}
          onClose={() => setIsAdvancing(false)}
          onAdvanced={handleAdvanced}
        />
      )}
    </div>
  );
}
