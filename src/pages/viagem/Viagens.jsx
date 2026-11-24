import { Ban, Eye, Map, Pencil, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../../components/Badge";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import GenericSelect from "../../components/GenericSelect";
import ListCard from "../../components/ListCard";
import LoadingIndicator from "../../components/LoadingIndicator";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import RowActions from "../../components/RowActions";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { usePageTitle } from "../../hooks/usePageTitle";
import { formatDateTime } from "../../lib/dateTime";
import ViagemService, { FALLBACK_STATUSES } from "../../services/ViagemService";

const ITEMS_PER_PAGE = 8;

const ALL_STATUSES = "ALL";

const NOT_STARTED_STATUSES = ["SCHEDULED", "CONFIRMED"];

const EMPTY_FILTERS = {
  status: ALL_STATUSES,
  dataInicio: "",
  dataFim: "",
};

const STATUS_TONES = {
  SCHEDULED: { tone: "neutral" },
  CONFIRMED: { tone: "success" },
  LEFT_ORIGIN: { tone: "warning" },
  ARRIVED_DESTINATION: { tone: "warning" },
  LEFT_DESTINATION: { tone: "warning" },
  ARRIVED_ORIGIN: { tone: "warning" },
  COMPLETED: { tone: "neutral", className: "bg-primary/10 text-primary" },
};

function StatusBadge({ status, label }) {
  const config = STATUS_TONES[status] || STATUS_TONES.SCHEDULED;
  return (
    <Badge tone={config.tone} className={config.className}>
      {label}
    </Badge>
  );
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
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

function hasStarted(trip) {
  return !NOT_STARTED_STATUSES.includes(trip.status);
}

function TripActions({ trip, onEdit }) {
  const started = hasStarted(trip);

  return (
    <RowActions>
      <button
        type="button"
        disabled
        title="Disponível em breve"
        aria-label="Detalhes da viagem"
      >
        <Eye className="size-4" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={started}
        title={
          started
            ? "Viagem que já saiu da origem não pode ser alterada"
            : "Editar"
        }
        aria-label="Editar viagem"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        disabled
        title={
          started
            ? "Viagem que já saiu da origem não pode ser cancelada"
            : "Disponível em breve"
        }
        aria-label="Cancelar viagem"
      >
        <Ban className="size-4" />
      </button>
    </RowActions>
  );
}

export default function Viagens() {
  usePageTitle("Viagens");
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [statuses, setStatuses] = useState(FALLBACK_STATUSES);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    ViagemService.getEnums().then((data) => {
      if (active) setStatuses(data.statuses);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    ViagemService.getAll({
      status: filters.status === ALL_STATUSES ? "" : filters.status,
      dataInicio: filters.dataInicio,
      dataFim: filters.dataFim,
    })
      .then((data) => {
        if (active) setTrips(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setError("Não foi possível carregar a lista de viagens.");
        setTrips([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, retryCount]);

  const reload = () => {
    setIsLoading(true);
    setError(null);
  };

  const fetchTrips = () => {
    reload();
    setRetryCount((count) => count + 1);
  };

  const updateFilter = (field, value) => {
    reload();
    setCurrentPage(1);
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const hasApiFilters =
    filters.status !== ALL_STATUSES ||
    filters.dataInicio !== "" ||
    filters.dataFim !== "";
  const isFiltering = hasApiFilters || searchTerm.trim() !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (hasApiFilters) {
      reload();
      setFilters(EMPTY_FILTERS);
    }
  };

  const statusLabels = useMemo(
    () =>
      Object.fromEntries(statuses.map((status) => [status.value, status.label])),
    [statuses],
  );

  const statusOptions = useMemo(
    () => [{ value: ALL_STATUSES, label: "Todas" }, ...statuses],
    [statuses],
  );

  const filteredTrips = useMemo(() => {
    const term = normalizeText(searchTerm);
    if (!term) return trips;

    return trips.filter((trip) =>
      [trip.originCity, trip.destinationCity, trip.vehiclePrefix].some(
        (value) => normalizeText(value).includes(term),
      ),
    );
  }, [trips, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrips.length / ITEMS_PER_PAGE),
  );
  const displayedPage = Math.min(currentPage, totalPages);

  const paginatedTrips = useMemo(() => {
    const startIndex = (displayedPage - 1) * ITEMS_PER_PAGE;
    return filteredTrips.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTrips, displayedPage]);

  const columns = [
    "Trecho",
    "Saída prevista",
    "Ônibus",
    "Passageiros",
    "Situação",
    "",
  ];

  return (
    <div>
      <PageHeader
        title="Viagens"
        action={
          <Button onClick={() => navigate("/viagens/cadastro")}>
            <Plus /> Nova Viagem
          </Button>
        }
      />

      <ListCard
        title="Viagens"
        count={!isLoading && !error ? filteredTrips.length : undefined}
        search={{
          id: "search-viagens",
          label: "Buscar viagem por cidade de origem, cidade de destino ou prefixo do ônibus",
          placeholder: "Buscar cidade ou prefixo...",
          value: searchTerm,
          onChange: (e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          },
        }}
      >
        <div className="grid grid-cols-1 gap-3 border-b px-6 py-4 sm:grid-cols-3">
          <GenericSelect
            id="filtro-situacao"
            label="Situação"
            value={filters.status}
            onChange={(value) => updateFilter("status", value)}
            options={statusOptions}
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filtro-data-inicio" className="tracking-wide uppercase">
              Data inicial
            </Label>
            <Input
              id="filtro-data-inicio"
              type="date"
              value={filters.dataInicio}
              max={filters.dataFim || undefined}
              onChange={(e) => updateFilter("dataInicio", e.target.value)}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filtro-data-fim" className="tracking-wide uppercase">
              Data final
            </Label>
            <Input
              id="filtro-data-fim"
              type="date"
              value={filters.dataFim}
              min={filters.dataInicio || undefined}
              onChange={(e) => updateFilter("dataFim", e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {isLoading && <LoadingIndicator label="Carregando viagens..." />}

        {!isLoading && error && <ErrorState message={error} onRetry={fetchTrips} />}

        {!isLoading && !error && filteredTrips.length === 0 && (
          <EmptyState
            icon={isFiltering ? undefined : Map}
            title={
              isFiltering
                ? "Nenhuma viagem encontrada"
                : "Nenhuma viagem cadastrada ainda"
            }
            description={
              isFiltering
                ? "Nenhuma viagem corresponde aos filtros selecionados."
                : "Agende a primeira viagem."
            }
            action={
              isFiltering ? (
                <Button variant="outline" onClick={clearFilters}>
                  <RotateCcw /> Limpar filtros
                </Button>
              ) : (
                <Button onClick={() => navigate("/viagens/cadastro")}>
                  <Plus /> Nova Viagem
                </Button>
              )
            }
          />
        )}

        {!isLoading && !error && filteredTrips.length > 0 && (
          <>
            <DataTable head={columns} className="hidden md:block">
              {paginatedTrips.map((trip) => (
                <tr key={trip.id}>
                  <td className="whitespace-nowrap font-semibold text-foreground">
                    {formatRoute(trip)}
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(trip.plannedDepartureOrigin)}
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="font-semibold text-foreground">
                      {trip.vehiclePrefix || "—"}
                    </span>
                    {trip.vehicleLicensePlate && (
                      <span className="ml-2 rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {trip.vehicleLicensePlate}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {trip.passengerCount ?? 0}
                  </td>
                  <td className="whitespace-nowrap">
                    <StatusBadge
                      status={trip.status}
                      label={statusLabels[trip.status] || trip.status}
                    />
                  </td>
                  <td>
                    <TripActions
                      trip={trip}
                      onEdit={() => navigate(`/viagens/editar/${trip.id}`)}
                    />
                  </td>
                </tr>
              ))}
            </DataTable>

            <div className="space-y-3 p-4 md:hidden">
              {paginatedTrips.map((trip) => (
                <article key={trip.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 font-semibold break-words text-foreground">
                      {formatRoute(trip)}
                    </h3>
                    <StatusBadge
                      status={trip.status}
                      label={statusLabels[trip.status] || trip.status}
                    />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Saída prevista</dt>
                      <dd>{formatDateTime(trip.plannedDepartureOrigin)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Passageiros</dt>
                      <dd>{trip.passengerCount ?? 0}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">Ônibus</dt>
                      <dd>
                        {trip.vehiclePrefix || "—"}
                        {trip.vehicleLicensePlate && ` · ${trip.vehicleLicensePlate}`}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3">
                    <TripActions
                      trip={trip}
                      onEdit={() => navigate(`/viagens/editar/${trip.id}`)}
                    />
                  </div>
                </article>
              ))}
            </div>

            <Pagination
              currentPage={displayedPage}
              totalPages={totalPages}
              totalItems={filteredTrips.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="viagem"
              itemNamePlural="viagens"
            />
          </>
        )}
      </ListCard>
    </div>
  );
}
