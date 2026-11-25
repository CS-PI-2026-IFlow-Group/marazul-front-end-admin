import {
  Ban,
  Bus,
  Gauge,
  Pencil,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../components/Badge";
import DataTable from "../components/DataTable";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import ListCard from "../components/ListCard";
import LoadingIndicator from "../components/LoadingIndicator";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import RowActions from "../components/RowActions";
import { Button } from "../components/ui/button";
import FrotaService from "../services/FrotaService";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDate } from "../lib/dateTime";
import { cn } from "../lib/utils";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Ativo",
    tone: "success",
  },
  INACTIVE: {
    label: "Inativo",
    tone: "danger",
  },
  UNDER_MAINTENANCE: {
    label: "Em manutenção",
    tone: "warning",
  },
};

const STATUS_FILTERS = [
  { value: "ALL", label: "Todos" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "UNDER_MAINTENANCE", label: "Em manutenção" },
  { value: "INACTIVE", label: "Inativo" },
];

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

function FilterOption({ isSelected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
        isSelected
          ? "bg-primary font-semibold text-primary-foreground shadow-xs"
          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ConfirmModal({ vehicle, isLoading, onConfirm, onCancel }) {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar"
          className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Ban className="size-8" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Inativar Veículo
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente inativar o veículo{" "}
              <span className="font-semibold text-foreground">
                {vehicle.prefix}
              </span>{" "}
              com placa{" "}
              <span className="font-semibold text-foreground">
                {vehicle.licensePlate}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              O veículo não será excluído da base, apenas seu status será
              alterado para inativo.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 w-full flex-1 font-semibold"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-11 w-full flex-1"
          >
            {isLoading ? (
              <LoadingIndicator variant="button" label="Inativando..." />
            ) : (
              "Confirmar Inativação"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 8;

export default function Frota() {
  usePageTitle("Frota");
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modelFilter, setModelFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [confirmVehicle, setConfirmVehicle] = useState(null);
  const [isInactivating, setIsInactivating] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await FrotaService.getAll();
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setError("Não foi possível carregar a lista de veículos.");
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FrotaService.getAll()
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Não foi possível carregar a lista de veículos.");
        setVehicles([]);
      })
      .finally(() => setIsLoading(false));
    FrotaService.getEnums().then((data) => {
      if (data?.models) {
        setModelOptions(data.models);
      }
    });
  }, []);

  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter((v) => v.status === "ACTIVE").length;
    const maintenance = vehicles.filter(
      (v) => v.status === "UNDER_MAINTENANCE",
    ).length;
    const operationalRate = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, maintenance, operationalRate };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const term = searchTerm.toLowerCase().trim();
      const modelLabel = FrotaService.getLabel("models", v.model).toLowerCase();
      const matchesSearch =
        !term ||
        v.prefix?.toLowerCase().includes(term) ||
        v.licensePlate?.toLowerCase().includes(term) ||
        modelLabel.includes(term);

      const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
      const matchesModel = modelFilter === "ALL" || v.model === modelFilter;

      return matchesSearch && matchesStatus && matchesModel;
    });
  }, [vehicles, searchTerm, statusFilter, modelFilter]);

  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE) || 1;

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVehicles, currentPage]);

  const activeFilterCount =
    (statusFilter !== "ALL" ? 1 : 0) + (modelFilter !== "ALL" ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setModelFilter("ALL");
    setCurrentPage(1);
  };

  const handleInactivate = async () => {
    if (!confirmVehicle) return;
    setIsInactivating(true);

    try {
      const updated = await FrotaService.inactivate(confirmVehicle.id);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === confirmVehicle.id
            ? { ...v, status: updated?.status || "INACTIVE" }
            : v,
        ),
      );
      toast.success("Veículo inativado com sucesso!", {
        description: `${confirmVehicle.prefix} (${confirmVehicle.licensePlate}) foi inativado.`,
      });
    } catch {
      toast.error("Erro ao inativar veículo", {
        description: "Ocorreu um problema. Tente novamente.",
      });
    } finally {
      setIsInactivating(false);
      setConfirmVehicle(null);
    }
  };

  const columns = [
    "Prefixo",
    "Placa",
    "Modelo",
    "Ano",
    "Capacidade",
    "Status",
    "Vistoria",
    "",
  ];

  const showList = !isLoading && !error && filteredVehicles.length > 0;

  const renderActions = (vehicle) => (
    <RowActions>
      <button
        type="button"
        onClick={() => navigate(`/frota/editar/${vehicle.id}`)}
        title="Editar veículo"
        aria-label={`Editar veículo ${vehicle.prefix}`}
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmVehicle(vehicle)}
        disabled={vehicle.status === "INACTIVE"}
        title={
          vehicle.status === "INACTIVE"
            ? "Veículo já está inativo"
            : "Inativar veículo"
        }
        aria-label={`Inativar veículo ${vehicle.prefix}`}
      >
        <Ban className="size-4" />
      </button>
    </RowActions>
  );

  const filterToolbar = (
    <div className="relative" ref={filterRef}>
      <button
        type="button"
        onClick={() => setFilterOpen((prev) => !prev)}
        title="Filtrar veículos"
        aria-expanded={filterOpen}
        className={cn(
          "inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all duration-150",
          activeFilterCount > 0
            ? "border-primary bg-primary/5 text-primary"
            : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        <span>Filtros</span>
        {activeFilterCount > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </button>

      {filterOpen && (
        <div className="absolute top-11 left-0 z-50 w-72 animate-in sm:right-0 sm:left-auto rounded-xl border bg-card p-4 text-card-foreground shadow-xl duration-100 fade-in zoom-in-95">
          <div className="mb-3 flex items-center justify-between border-b pb-2.5">
            <span className="text-xs font-bold tracking-wider text-foreground uppercase">
              Filtrar Frota
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setModelFilter("ALL");
                  setCurrentPage(1);
                }}
                className="cursor-pointer text-[11px] font-medium text-destructive hover:underline"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Status
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {STATUS_FILTERS.map((opt) => (
                  <FilterOption
                    key={opt.value}
                    isSelected={statusFilter === opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setCurrentPage(1);
                    }}
                  >
                    {opt.label}
                  </FilterOption>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Marca
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <FilterOption
                  isSelected={modelFilter === "ALL"}
                  onClick={() => {
                    setModelFilter("ALL");
                    setCurrentPage(1);
                  }}
                >
                  Todas
                </FilterOption>
                {modelOptions.map((opt) => (
                  <FilterOption
                    key={opt.value}
                    isSelected={modelFilter === opt.value}
                    onClick={() => {
                      setModelFilter(opt.value);
                      setCurrentPage(1);
                    }}
                  >
                    {opt.label}
                  </FilterOption>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const hasVehicles = !isLoading && !error && vehicles.length > 0;

  return (
    <div>
      <PageHeader
        title="Frota"
        action={
          <Button onClick={() => navigate("/frota/cadastro")}>
            <Plus /> Novo veículo
          </Button>
        }
      />

      {hasVehicles && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <MetricCard
            title="Veículos ativos"
            value={stats.active}
            icon={Bus}
            tone="success"
          />
          <MetricCard
            title="Em manutenção"
            value={stats.maintenance}
            icon={Wrench}
            tone="warning"
          />
          <MetricCard
            title="Taxa operacional"
            value={stats.operationalRate}
            suffix="%"
            icon={Gauge}
          />
        </div>
      )}

      <ListCard
        title="Veículos"
        count={!isLoading && !error ? filteredVehicles.length : undefined}
        search={
          hasVehicles
            ? {
                id: "search-frota",
                label: "Buscar por prefixo, placa ou modelo",
                placeholder: "Buscar prefixo, placa ou modelo…",
                value: searchTerm,
                onChange: (e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                },
              }
            : null
        }
        toolbar={hasVehicles ? filterToolbar : null}
        className="overflow-visible"
      >
        {isLoading && <LoadingIndicator label="Carregando veículos..." />}

        {!isLoading && error && (
          <ErrorState message={error} onRetry={fetchVehicles} />
        )}

        {!isLoading && !error && vehicles.length === 0 && (
          <EmptyState
            icon={Bus}
            title="Nenhum veículo cadastrado ainda"
            description="Cadastre o primeiro veículo para começar a gerenciar sua frota."
            action={
              <Button onClick={() => navigate("/frota/cadastro")}>
                <Plus /> Cadastrar veículo
              </Button>
            }
          />
        )}

        {!isLoading &&
          !error &&
          vehicles.length > 0 &&
          filteredVehicles.length === 0 && (
            <EmptyState
              title="Nenhum veículo encontrado"
              description="Nenhum veículo corresponde aos filtros selecionados."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  <RotateCcw /> Limpar filtros
                </Button>
              }
            />
          )}

        {showList && (
          <>
            <DataTable head={columns} className="hidden md:block">
              {paginatedVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="font-semibold whitespace-nowrap text-foreground">
                    {vehicle.prefix}
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="rounded-md border bg-muted px-2 py-1 font-mono text-xs text-foreground uppercase">
                      {vehicle.licensePlate}
                    </span>
                  </td>
                  <td>{FrotaService.getLabel("models", vehicle.model)}</td>
                  <td className="text-muted-foreground">{vehicle.year}</td>
                  <td className="whitespace-nowrap">
                    <span className="font-bold">{vehicle.seats}</span>{" "}
                    <span className="text-muted-foreground">lugares</span>
                  </td>
                  <td className="whitespace-nowrap">
                    <StatusBadge status={vehicle.status} />
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {formatDate(vehicle.inspectionDate)}
                  </td>
                  <td>{renderActions(vehicle)}</td>
                </tr>
              ))}
            </DataTable>

            <div className="space-y-3 p-4 md:hidden">
              {paginatedVehicles.map((vehicle) => (
                <article key={vehicle.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-foreground">
                        {vehicle.prefix}
                      </h3>
                      <span className="inline-block rounded-md border bg-muted px-2 py-1 font-mono text-xs text-foreground uppercase">
                        {vehicle.licensePlate}
                      </span>
                    </div>
                    <StatusBadge status={vehicle.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Modelo</dt>
                      <dd>{FrotaService.getLabel("models", vehicle.model)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Ano</dt>
                      <dd>{vehicle.year}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Capacidade
                      </dt>
                      <dd>{vehicle.seats} lugares</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Vistoria
                      </dt>
                      <dd>{formatDate(vehicle.inspectionDate)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3">{renderActions(vehicle)}</div>
                </article>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVehicles.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="veículo"
            />
          </>
        )}
      </ListCard>

      <ConfirmModal
        vehicle={confirmVehicle}
        isLoading={isInactivating}
        onConfirm={handleInactivate}
        onCancel={() => setConfirmVehicle(null)}
      />
    </div>
  );
}
