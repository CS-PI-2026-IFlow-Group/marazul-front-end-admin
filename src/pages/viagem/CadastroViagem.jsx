import {
  BusFront,
  ClipboardList,
  MapPinned,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormFooter from "../../components/FormFooter";
import FormSection from "../../components/FormSection";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import PageHeader from "../../components/PageHeader";
import { Card } from "../../components/ui/card";
import { usePageTitle } from "../../hooks/usePageTitle";
import ClienteService from "../../services/ClienteService";
import FrotaService from "../../services/FrotaService";
import FuncionarioService from "../../services/FuncionarioService";
import LocalidadeService from "../../services/LocalidadeService";
import ViagemService from "../../services/ViagemService";

const TIME_FIELDS = [
  ["plannedDepartureOrigin", "Saída prevista da origem", "Informe a saída prevista da origem."],
  ["plannedArrivalDestination", "Chegada prevista ao destino", "Informe a chegada prevista ao destino."],
  ["plannedDepartureDestination", "Saída prevista do destino", "Informe a saída prevista do destino."],
  ["plannedArrivalOrigin", "Chegada prevista à origem", "Informe a chegada prevista à origem."],
];

const INITIAL_FORM = {
  originStateId: "",
  originCityId: "",
  destinationStateId: "",
  destinationCityId: "",
  plannedDepartureOrigin: "",
  plannedArrivalDestination: "",
  plannedDepartureDestination: "",
  plannedArrivalOrigin: "",
  vehicleId: "",
  driverIds: [],
  clientId: "",
  minimumPassengers: "",
  notes: "",
};

function currentDateTimeLocal() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function validateForm(form) {
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

  return errors;
}

function CadastroViagemForm() {
  usePageTitle("Agendamento de Viagem");
  const navigate = useNavigate();
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
    if (!form.originStateId) return () => { active = false; };
    LocalidadeService.getCidades(form.originStateId)
      .then((items) => {
        if (active) setOriginCities({ stateId: form.originStateId, items });
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar as cidades de origem.");
      });
    return () => {
      active = false;
    };
  }, [form.originStateId]);

  useEffect(() => {
    let active = true;
    if (!form.destinationStateId) return () => { active = false; };
    LocalidadeService.getCidades(form.destinationStateId)
      .then((items) => {
        if (active) setDestinationCities({ stateId: form.destinationStateId, items });
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar as cidades de destino.");
      });
    return () => {
      active = false;
    };
  }, [form.destinationStateId]);

  const validationErrors = hasSubmitted ? validateForm(form) : {};
  const stateOptions = states.map((state) => ({
    value: String(state.id),
    label: `${state.name} (${state.acronym})`,
  }));
  const originCityOptions = (originCities.stateId === form.originStateId ? originCities.items : []).map((city) => ({
    value: String(city.id),
    label: city.name,
  }));
  const destinationCityOptions = (destinationCities.stateId === form.destinationStateId ? destinationCities.items : []).map((city) => ({
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
  const handleStateChange = (stateField, cityField) => (value) => {
    setForm((previous) => ({ ...previous, [stateField]: value, [cityField]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    const errors = validateForm(form);
    if (Object.keys(errors).length || isSaving) return;

    setIsSaving(true);
    try {
      await ViagemService.create({
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
        notes: form.notes,
      });
      toast.success("Viagem agendada com sucesso!");
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

  return (
    <div>
      <PageHeader title="Agendar viagem" />

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
                disabled={!form.originStateId}
                value={form.originCityId}
                onChange={handleSelectChange("originCityId")}
                options={originCityOptions}
                placeholder={form.originStateId ? "Selecione a cidade" : "Escolha primeiro o estado"}
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
                disabled={!form.destinationStateId}
                value={form.destinationCityId}
                onChange={handleSelectChange("destinationCityId")}
                options={destinationCityOptions}
                placeholder={form.destinationStateId ? "Selecione a cidade" : "Escolha primeiro o estado"}
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
          </div>
        </form>

        <FormFooter
          formId="form-viagem"
          onBack={() => navigate("/viagens")}
          isSaving={isSaving}
          saveLabel="Salvar viagem"
        />
      </Card>
    </div>
  );
}

function CadastroViagemEdicao() {
  usePageTitle("Edição de Viagem");
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Edição de viagem" />
      <Card className="gap-0 py-0">
        <FormFooter
          formId="form-viagem-edicao"
          onBack={() => navigate("/viagens")}
          showSave={false}
        />
      </Card>
    </div>
  );
}

export default function CadastroViagem({ isEdicao = false }) {
  return isEdicao ? <CadastroViagemEdicao /> : <CadastroViagemForm />;
}
