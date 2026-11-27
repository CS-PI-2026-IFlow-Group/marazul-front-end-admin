import {
  BusFront,
  ClipboardList,
  MapPinned,
  Pencil,
  Receipt,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import FormFooter from "../../components/FormFooter";
import FormSection from "../../components/FormSection";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import PageHeader from "../../components/PageHeader";
import TripPassengers from "../../components/TripPassengers";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { usePageTitle } from "../../hooks/usePageTitle";
import ClienteService from "../../services/ClienteService";
import FrotaService from "../../services/FrotaService";
import FuncionarioService from "../../services/FuncionarioService";
import LocalidadeService from "../../services/LocalidadeService";
import ViagemService from "../../services/ViagemService";
import {
  formatMoneyInput,
  formatCurrency,
  moneyInputFromValue,
  parseMoneyInput,
  toCents,
} from "../../lib/moneyMasks";

const TIME_FIELDS = [
  ["plannedDepartureOrigin", "Saída prevista da origem", "Informe a saída prevista da origem."],
  ["plannedArrivalDestination", "Chegada prevista ao destino", "Informe a chegada prevista ao destino."],
  ["plannedDepartureDestination", "Saída prevista do destino", "Informe a saída prevista do destino."],
  ["plannedArrivalOrigin", "Chegada prevista à origem", "Informe a chegada prevista à origem."],
];

const INITIAL_FORM = {
  originStateId: "",
  originStateAcronym: "",
  originCityId: "",
  destinationStateId: "",
  destinationStateAcronym: "",
  destinationCityId: "",
  plannedDepartureOrigin: "",
  plannedArrivalDestination: "",
  plannedDepartureDestination: "",
  plannedArrivalOrigin: "",
  vehicleId: "",
  driverIds: [],
  clientId: "",
  minimumPassengers: "",
  passengerCount: 0,
  estimatedPassengerAmount: "",
  estimatedTotalValue: "",
  estimatedIndividualValue: "",
  expenses: [],
  notes: "",
  passengers: [],
  responsiblePassengerId: null,
};

function currentDateTimeLocal() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function validateForm(form, capacity = null) {
  const errors = {};
  const requiredFields = [
    ["originStateId", "Selecione o estado de origem."],
    ["originCityId", "Selecione a cidade de origem."],
    ["destinationStateId", "Selecione o estado de destino."],
    ["destinationCityId", "Selecione a cidade de destino."],
    ["vehicleId", "Selecione um ônibus."],
  ];

  requiredFields.forEach(([field, message]) => {
    if (!form[field]) errors[field] = message;
  });
  if (!form.driverIds.length) errors.driverIds = "Selecione ao menos um motorista.";

  TIME_FIELDS.forEach(([field, , requiredMessage]) => {
    if (!form[field]) errors[field] = requiredMessage;
  });

  if (form.originCityId && form.destinationCityId && form.originCityId === form.destinationCityId) {
    errors.destinationCityId = "A cidade de destino deve ser diferente da origem.";
  }

  TIME_FIELDS.slice(1).forEach(([field], index) => {
    const previousField = TIME_FIELDS[index][0];
    if (form[field] && form[previousField] && form[field] <= form[previousField]) {
      errors[field] = "O horário deve ser posterior ao horário anterior.";
    }
  });

  if (form.plannedDepartureOrigin && form.plannedDepartureOrigin < currentDateTimeLocal()) {
    errors.plannedDepartureOrigin = "A saída prevista da origem não pode estar no passado.";
  }

  if (form.minimumPassengers) {
    const minimumPassengers = Number(form.minimumPassengers);
    if (!Number.isInteger(minimumPassengers) || minimumPassengers <= 0) {
      errors.minimumPassengers = "Informe um número inteiro maior que zero.";
    }
  }

  if (form.estimatedTotalValue) {
    const value = parseMoneyInput(form.estimatedTotalValue);
    if (value === null || value < 0) errors.estimatedTotalValue = "O valor estimado total não pode ser negativo.";
    else if (value > 99999999.99) errors.estimatedTotalValue = "O valor excede o limite permitido.";
  }
  if (form.estimatedIndividualValue) {
    const value = parseMoneyInput(form.estimatedIndividualValue);
    if (value === null || value < 0) errors.estimatedIndividualValue = "O valor estimado por passageiro não pode ser negativo.";
    else if (value > 99999999.99) errors.estimatedIndividualValue = "O valor excede o limite permitido.";
  }

  if (capacity !== null && form.passengers.length > capacity) {
    errors.passengers = `O ônibus selecionado tem ${capacity} assentos, menos que os ${form.passengers.length} passageiros incluídos.`;
  }

  return errors;
}

function CadastroViagemForm({ isEdicao = false }) {
  usePageTitle(isEdicao ? "Edição de Viagem" : "Agendamento de Viagem");
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(INITIAL_FORM);
  const [states, setStates] = useState([]);
  const [originCities, setOriginCities] = useState({ stateId: "", items: [] });
  const [destinationCities, setDestinationCities] = useState({ stateId: "", items: [] });
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [customTotal, setCustomTotal] = useState(false);
  const [customIndividual, setCustomIndividual] = useState(false);
  const [isLoadingTrip, setIsLoadingTrip] = useState(isEdicao);
  const [loadError, setLoadError] = useState("");

  const passengerCount = form.passengers.length > 0
    ? form.passengers.length
    : (Number(form.minimumPassengers) > 0 ? Number(form.minimumPassengers) : 0);
  const totalExpense = expenseTotal(form.expenses);

  const resolvedOriginStateId = form.originStateId || String(states.find((state) => state.acronym === form.originStateAcronym)?.id ?? "");
  const resolvedDestinationStateId = form.destinationStateId || String(states.find((state) => state.acronym === form.destinationStateAcronym)?.id ?? "");

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      LocalidadeService.getEstados(),
      FrotaService.getAll(),
      FuncionarioService.getAll(),
      ClienteService.getAll(),
    ]).then((results) => {
      if (!active) return;
      const [statesResult, vehiclesResult, driversResult, clientsResult] = results;
      const getValue = (result) => (result.status === "fulfilled" ? result.value : []);
      setStates(getValue(statesResult));
      setVehicles(getValue(vehiclesResult).filter((vehicle) => vehicle.status === "ACTIVE"));
      setDrivers(
        getValue(driversResult).filter(
          (employee) => employee.status === "ACTIVE" && employee.position === "DRIVER",
        ),
      );
      setClients(getValue(clientsResult));
      if (results.some((result) => result.status === "rejected")) {
        toast.error("Não foi possível carregar todas as opções do cadastro.");
      }
      setIsLoadingOptions(false);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!resolvedOriginStateId) return () => { active = false; };
    LocalidadeService.getCidades(resolvedOriginStateId)
      .then((items) => {
        if (active) setOriginCities({ stateId: String(resolvedOriginStateId), items });
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar as cidades de origem.");
      });
    return () => {
      active = false;
    };
  }, [resolvedOriginStateId]);

  useEffect(() => {
    let active = true;
    if (!resolvedDestinationStateId) return () => { active = false; };
    LocalidadeService.getCidades(resolvedDestinationStateId)
      .then((items) => {
        if (active) setDestinationCities({ stateId: String(resolvedDestinationStateId), items });
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar as cidades de destino.");
      });
    return () => {
      active = false;
    };
  }, [resolvedDestinationStateId]);

  useEffect(() => {
    if (!isEdicao || !id) return;
    let active = true;
    ViagemService.getById(id)
      .then((trip) => {
        if (!active) return;
        const expenses = (trip.expenses ?? []).map((expense) => ({ description: expense.description, amount: expense.amount }));
        const total = expenseTotal(expenses);
        const passengerCountLoaded = (trip.passengerCount ?? trip.passengers?.length ?? 0) > 0
          ? (trip.passengerCount ?? trip.passengers.length)
          : (trip.minimumPassengers ?? 0);
        const loadedEffectiveTotal = trip.estimatedTotalValue ?? total;
        const individual = passengerCountLoaded > 0
          ? Number(loadedEffectiveTotal) / passengerCountLoaded
          : 0;
        setCustomTotal(trip.estimatedTotalValue != null && toCents(trip.estimatedTotalValue) !== toCents(total));
        setCustomIndividual(
          (trip.estimatedIndividualValue ?? trip.estimatedPassengerAmount) != null
            && toCents(trip.estimatedIndividualValue ?? trip.estimatedPassengerAmount) !== toCents(individual)
        );
        setForm({
          ...INITIAL_FORM,
          originCityId: trip.originCityId == null ? "" : String(trip.originCityId),
          originStateAcronym: trip.originStateAcronym ?? "",
          destinationCityId: trip.destinationCityId == null ? "" : String(trip.destinationCityId),
          destinationStateAcronym: trip.destinationStateAcronym ?? "",
          plannedDepartureOrigin: trip.plannedDepartureOrigin?.slice(0, 16) ?? "",
          plannedArrivalDestination: trip.plannedArrivalDestination?.slice(0, 16) ?? "",
          plannedDepartureDestination: trip.plannedDepartureDestination?.slice(0, 16) ?? "",
          plannedArrivalOrigin: trip.plannedArrivalOrigin?.slice(0, 16) ?? "",
          vehicleId: trip.vehicleId == null ? "" : String(trip.vehicleId),
          driverIds: (trip.drivers ?? []).map((driver) => String(driver.id)),
          clientId: trip.clientId == null ? "" : String(trip.clientId),
          minimumPassengers: trip.minimumPassengers == null ? "" : String(trip.minimumPassengers),
          passengerCount: trip.passengerCount ?? trip.passengers?.length ?? 0,
          estimatedPassengerAmount: moneyInputFromValue(trip.estimatedPassengerAmount),
          estimatedTotalValue: moneyInputFromValue(trip.estimatedTotalValue),
          estimatedIndividualValue: moneyInputFromValue(trip.estimatedIndividualValue ?? trip.estimatedPassengerAmount),
          expenses,
          notes: trip.notes ?? "",
          passengers: (trip.passengers ?? []).map((passenger) => ({
            passengerId: Number(passenger.passengerId),
            name: passenger.name,
            cpf: passenger.cpf,
            amountDue: passenger.amountDue,
            amountPaid: passenger.amountPaid ?? 0,
          })),
          responsiblePassengerId: trip.responsiblePassengerId ?? null,
        });
        setLoadError("");
      })
      .catch(() => {
        if (active) setLoadError("Não foi possível carregar a viagem. Tente novamente.");
      })
      .finally(() => {
        if (active) setIsLoadingTrip(false);
      });
    return () => { active = false; };
  }, [id, isEdicao]);

  const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === form.vehicleId);
  const capacity = selectedVehicle?.seats ?? null;
  const validationErrors = hasSubmitted ? validateForm(form, capacity) : {};
  const stateOptions = states.map((state) => ({
    value: String(state.id),
    label: `${state.name} (${state.acronym})`,
  }));
  const originCityOptions = (originCities.stateId === String(resolvedOriginStateId) ? originCities.items : []).map((city) => ({
    value: String(city.id),
    label: city.name,
  }));
  const destinationCityOptions = (destinationCities.stateId === String(resolvedDestinationStateId) ? destinationCities.items : []).map((city) => ({
    value: String(city.id),
    label: city.name,
  }));
  const vehicleOptions = vehicles.map((vehicle) => ({
    value: String(vehicle.id),
    label: `${vehicle.prefix} | ${vehicle.licensePlate} | ${vehicle.seats} assentos`,
  }));
  const driverOptions = drivers.map((driver) => ({ value: String(driver.id), label: driver.name }));
  const clientOptions = [
    { value: "", label: "Nenhum cliente" },
    ...clients.map((client) => ({ value: String(client.id), label: client.name })),
  ];

  const handleInputChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
  };
  const handleSelectChange = (field) => (value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };
  const handlePassengersChange = ({ passengers, responsiblePassengerId }) => {
    setForm((previous) => ({ ...previous, passengers, responsiblePassengerId }));
  };
  const handleStateChange = (stateField, cityField) => (value) => {
    setForm((previous) => ({ ...previous, [stateField]: value, [cityField]: "" }));
  };

  const handleCustomTotal = (value) => {
    setCustomTotal(true);
    setForm((previous) => ({ ...previous, estimatedTotalValue: value }));
  };
  const handleCustomIndividual = (value) => {
    setCustomIndividual(true);
    setForm((previous) => ({ ...previous, estimatedIndividualValue: value }));
  };
  const handleResetTotal = () => {
    setCustomTotal(false);
  };
  const handleResetIndividual = () => {
    setCustomIndividual(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    const errors = validateForm(form);
    if (errors.passengers) toast.error(errors.passengers);
    if (Object.keys(errors).length || isSaving || (isEdicao && isLoadingTrip)) return;

    setIsSaving(true);
    try {
      const payload = {
        originCityId: form.originCityId,
        destinationCityId: form.destinationCityId,
        plannedDepartureOrigin: form.plannedDepartureOrigin,
        plannedArrivalDestination: form.plannedArrivalDestination,
        plannedDepartureDestination: form.plannedDepartureDestination,
        plannedArrivalOrigin: form.plannedArrivalOrigin,
        vehicleId: form.vehicleId,
        driverIds: form.driverIds,
        clientId: form.clientId,
        minimumPassengers: form.minimumPassengers,
        estimatedPassengerAmount: parseMoneyInput(effectiveForm.estimatedIndividualValue),
        estimatedTotalValue: parseMoneyInput(effectiveForm.estimatedTotalValue),
        estimatedIndividualValue: parseMoneyInput(effectiveForm.estimatedIndividualValue),
        expenses: form.expenses,
        passengers: form.passengers.map((passenger) => ({
          passengerId: Number(passenger.passengerId),
          amountDue: passenger.amountDue,
          amountPaid: passenger.amountPaid ?? 0,
        })),
        responsiblePassengerId: form.responsiblePassengerId,
        notes: form.notes,
      };
      if (isEdicao) {
        await ViagemService.update(id, payload);
        toast.success("Viagem atualizada com sucesso!");
      } else {
        await ViagemService.create(payload);
        toast.success("Viagem agendada com sucesso!");
      }
      navigate("/viagens");
    } catch (error) {
      const data = error.response?.data;
      if (error.response?.status === 409) {
        toast.error(data?.message || data?.erro || "Conflito na agenda do ônibus ou do motorista.");
      } else {
        toast.error("Não foi possível agendar a viagem.", {
          description: data?.message || data?.erro || "Ocorreu um problema ao salvar. Tente novamente.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const suggestedTotalValue = moneyInputFromValue(totalExpense);
  const effectiveTotalValue = customTotal
    ? parseMoneyInput(form.estimatedTotalValue)
    : totalExpense;
  const suggestedIndividualValue = moneyInputFromValue(
    passengerCount > 0 && effectiveTotalValue !== null
      ? effectiveTotalValue / passengerCount
      : 0
  );
  const effectiveForm = {
    ...form,
    estimatedTotalValue: customTotal ? form.estimatedTotalValue : suggestedTotalValue,
    estimatedIndividualValue: customIndividual ? form.estimatedIndividualValue : suggestedIndividualValue,
  };

  return (
    <div>
      <PageHeader title={isEdicao ? "Editar viagem" : "Agendar viagem"} />

      {isEdicao && isLoadingTrip ? (
        <Card className="p-6 text-sm text-muted-foreground">Carregando viagem...</Card>
      ) : isEdicao && loadError ? (
        <Card className="p-6 text-sm text-destructive">{loadError}</Card>
      ) : (
        <Card className="gap-0 py-0">
          <form id="form-viagem" noValidate onSubmit={handleSubmit}>
            <div className="divide-y">
              <FormSection
                icon={MapPinned}
                title="Trecho e horários"
                description="Origem, destino e horários previstos."
              >
                <GenericSelect
                  id="origin-state"
                  label="Estado de origem"
                  required
                  value={form.originStateId}
                  onChange={handleStateChange("originStateId", "originCityId")}
                  options={stateOptions}
                  placeholder="Selecione o estado"
                  hasError={Boolean(validationErrors.originStateId)}
                  errorMessage={validationErrors.originStateId}
                />
                <GenericSelect
                  id="origin-city"
                  label="Cidade de origem"
                  required
                  searchable
                  disabled={!resolvedOriginStateId}
                  value={form.originCityId}
                  onChange={handleSelectChange("originCityId")}
                  options={originCityOptions}
                  placeholder={resolvedOriginStateId ? "Selecione a cidade" : "Escolha primeiro o estado"}
                  hasError={Boolean(validationErrors.originCityId)}
                  errorMessage={validationErrors.originCityId}
                />
                <GenericSelect
                  id="destination-state"
                  label="Estado de destino"
                  required
                  value={form.destinationStateId}
                  onChange={handleStateChange("destinationStateId", "destinationCityId")}
                  options={stateOptions}
                  placeholder="Selecione o estado"
                  hasError={Boolean(validationErrors.destinationStateId)}
                  errorMessage={validationErrors.destinationStateId}
                />
                <GenericSelect
                  id="destination-city"
                  label="Cidade de destino"
                  required
                  searchable
                  disabled={!resolvedDestinationStateId}
                  value={form.destinationCityId}
                  onChange={handleSelectChange("destinationCityId")}
                  options={destinationCityOptions}
                  placeholder={resolvedDestinationStateId ? "Selecione a cidade" : "Escolha primeiro o estado"}
                  hasError={Boolean(validationErrors.destinationCityId)}
                  errorMessage={validationErrors.destinationCityId}
                />
                {TIME_FIELDS.map(([field, label]) => (
                  <GenericInput
                    key={field}
                    id={field}
                    label={label}
                    type="datetime-local"
                    required
                    min={currentDateTimeLocal().slice(0, 16)}
                    value={form[field]}
                    onChange={handleInputChange(field)}
                    hasError={Boolean(validationErrors[field])}
                    errorMessage={validationErrors[field]}
                  />
                ))}
              </FormSection>

              <FormSection
                icon={BusFront}
                title="Ônibus e motoristas"
                description="Recursos disponíveis para a viagem."
              >
                <GenericSelect
                  id="vehicle"
                  label="Ônibus"
                  required
                  searchable
                  disabled={isLoadingOptions}
                  value={form.vehicleId}
                  onChange={handleSelectChange("vehicleId")}
                  options={vehicleOptions}
                  placeholder="Prefixo | placa | assentos"
                  hasError={Boolean(validationErrors.vehicleId)}
                  errorMessage={validationErrors.vehicleId}
                />
                <GenericSelect
                  id="drivers"
                  label="Motoristas"
                  required
                  searchable
                  multiple
                  disabled={isLoadingOptions}
                  value={form.driverIds}
                  onChange={handleSelectChange("driverIds")}
                  options={driverOptions}
                  placeholder="Selecione um ou mais motoristas"
                  searchPlaceholder="Buscar motorista..."
                  hasError={Boolean(validationErrors.driverIds)}
                  errorMessage={validationErrors.driverIds}
                />
              </FormSection>

              <FormSection
                icon={ClipboardList}
                title="Informações complementares"
                description="Dados opcionais para a reserva."
              >
                <GenericSelect
                  id="client"
                  label="Cliente (opcional)"
                  searchable
                  disabled={isLoadingOptions}
                  value={form.clientId}
                  onChange={handleSelectChange("clientId")}
                  options={clientOptions}
                  placeholder="Selecione um cliente"
                />
                <GenericInput
                  id="minimum-passengers"
                  label="Mínimo de passageiros (opcional)"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={form.minimumPassengers}
                  onChange={handleInputChange("minimumPassengers")}
                  placeholder="Ex: 10"
                  hasError={Boolean(validationErrors.minimumPassengers)}
                  errorMessage={validationErrors.minimumPassengers}
                />
                <div className="md:col-span-2">
                  <GenericInput
                    id="notes"
                    label="Observação (opcional)"
                    value={form.notes}
                    onChange={handleInputChange("notes")}
                    placeholder="Informações adicionais sobre a viagem"
                    maxLength={2000}
                  />
                </div>
              </FormSection>

              <TripPassengers
                passengers={form.passengers}
                responsiblePassengerId={form.responsiblePassengerId}
                onChange={handlePassengersChange}
                capacity={capacity}
                suggestedAmount={parseMoneyInput(effectiveForm.estimatedIndividualValue)}
                minimumPassengers={Number(form.minimumPassengers) || null}
                disabled={isSaving}
              />

              <ExpensesAndValuesSection
                form={effectiveForm}
                setForm={setForm}
                totalExpense={totalExpense}
                passengerCount={passengerCount}
                customTotal={customTotal}
                customIndividual={customIndividual}
                onCustomTotal={handleCustomTotal}
                onCustomIndividual={handleCustomIndividual}
                onResetTotal={handleResetTotal}
                onResetIndividual={handleResetIndividual}
                validationErrors={validationErrors}
              />
            </div>
          </form>

          <FormFooter
            formId="form-viagem"
            onBack={() => navigate("/viagens")}
            isSaving={isSaving}
            saveLabel={isEdicao ? "Salvar alterações" : "Salvar viagem"}
          />
        </Card>
      )}
    </div>
  );
}

function ExpensesAndValuesSection({
  form,
  setForm,
  totalExpense,
  passengerCount,
  customTotal,
  customIndividual,
  onCustomTotal,
  onCustomIndividual,
  onResetTotal,
  onResetIndividual,
  validationErrors,
}) {
  const [draftDescription, setDraftDescription] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [expenseErrors, setExpenseErrors] = useState({});

  const resetDraft = () => {
    setDraftDescription("");
    setDraftAmount("");
    setEditingIndex(null);
    setExpenseErrors({});
  };

  const saveExpense = () => {
    const description = draftDescription.trim();
    const amount = parseMoneyInput(draftAmount);
    const errors = {};
    if (!description) errors.description = "Informe a descrição do gasto.";
    else if (description.length > 255) errors.description = "A descrição deve ter no máximo 255 caracteres.";
    if (amount === null) errors.amount = "Informe o valor do gasto.";
    else if (amount <= 0) errors.amount = "O valor do gasto deve ser maior que zero.";
    else if (amount > 99999999.99) errors.amount = "O valor excede o limite permitido.";
    setExpenseErrors(errors);
    if (Object.keys(errors).length) return;

    setForm((previous) => {
      const expenses = [...previous.expenses];
      if (editingIndex === null) expenses.push({ description, amount });
      else expenses[editingIndex] = { description, amount };
      return { ...previous, expenses };
    });
    resetDraft();
  };

  const editExpense = (index) => {
    const expense = form.expenses[index];
    setEditingIndex(index);
    setDraftDescription(expense.description);
    setDraftAmount(moneyInputFromValue(expense.amount));
    setExpenseErrors({});
  };

  const removeExpense = (index) => {
    const expense = form.expenses[index];
    if (!window.confirm(`Remover o gasto "${expense.description}"?`)) return;
    setForm((previous) => ({
      ...previous,
      expenses: previous.expenses.filter((_, expenseIndex) => expenseIndex !== index),
    }));
    if (editingIndex === index) resetDraft();
  };

  return (
    <FormSection icon={Receipt} title="Gastos" description="Despesas previstas para esta viagem.">
      <div className="sm:col-span-2">
        <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end">
          <GenericInput
            id="expense-description"
            label="Descrição"
            required
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            placeholder="Ex.: Pedágio"
            maxLength={255}
            hasError={Boolean(expenseErrors.description)}
            errorMessage={expenseErrors.description}
          />
          <GenericInput
            id="expense-amount"
            label="Valor"
            required
            inputMode="decimal"
            value={draftAmount}
            onChange={(event) => setDraftAmount(formatMoneyInput(event.target.value))}
            placeholder="R$ 0,00"
            hasError={Boolean(expenseErrors.amount)}
            errorMessage={expenseErrors.amount}
          />
          <div className="flex gap-2">
            <Button type="button" onClick={saveExpense}>{editingIndex === null ? "Adicionar" : "Salvar gasto"}</Button>
            {editingIndex !== null && <Button type="button" variant="outline" onClick={resetDraft}>Cancelar</Button>}
          </div>
        </div>

        {form.expenses.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum gasto registrado nesta viagem.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {form.expenses.map((expense, index) => (
                  <tr key={`${expense.description}-${index}`}>
                    <td className="px-4 py-3 text-foreground">{expense.description}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Alterar gasto ${expense.description}`} onClick={() => editExpense(index)}><Pencil /></Button>
                        <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" aria-label={`Remover gasto ${expense.description}`} onClick={() => removeExpense(index)}><Trash2 /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-muted/20">
                <tr>
                  <td className="px-4 py-3 font-semibold">Total dos gastos</td>
                  <td className="px-4 py-3 font-semibold tabular-nums" colSpan={2}>{formatCurrency(totalExpense)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="sm:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <GenericInput
              id="estimated-total"
              label="Valor estimado total (opcional)"
              inputMode="decimal"
              value={form.estimatedTotalValue}
              onChange={(event) => onCustomTotal(formatMoneyInput(event.target.value))}
              placeholder="R$ 0,00"
              hasError={Boolean(validationErrors.estimatedTotalValue)}
              errorMessage={validationErrors.estimatedTotalValue}
            />
            {customTotal && <Button type="button" variant="link" size="xs" onClick={onResetTotal} className="mt-1 px-0"><RotateCcw /> Usar valor calculado</Button>}
          </div>
          <div>
            <GenericInput
              id="estimated-individual"
              label="Valor estimado por passageiro (opcional)"
              inputMode="decimal"
              value={form.estimatedIndividualValue}
              onChange={(event) => onCustomIndividual(formatMoneyInput(event.target.value))}
              placeholder="R$ 0,00"
              hasError={Boolean(validationErrors.estimatedIndividualValue)}
              errorMessage={validationErrors.estimatedIndividualValue}
            />
            {customIndividual && <Button type="button" variant="link" size="xs" onClick={onResetIndividual} className="mt-1 px-0"><RotateCcw /> Usar valor calculado</Button>}
            <p className="mt-1 text-xs text-muted-foreground">Divisão por {passengerCount > 0 ? passengerCount : "mínimo"} passageiro(s).</p>
          </div>
        </div>
      </div>
    </FormSection>
  );
}

function expenseTotal(expenses) {
  return expenses.reduce((sum, expense) => sum + (toCents(expense.amount) ?? 0), 0) / 100;
}

export default function CadastroViagem({ isEdicao = false }) {
  return <CadastroViagemForm isEdicao={isEdicao} />;
}
