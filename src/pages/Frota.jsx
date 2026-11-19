import {
  AlertCircle,
  Ban,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Pagination from "../components/Pagination";
import LoadingIndicator from "../components/LoadingIndicator";
import EmptyState from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import FrotaService from "../services/FrotaService";
import { usePageTitle } from "../hooks/usePageTitle";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Ativo",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  INACTIVE: {
    label: "Inativo",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    border: "border-red-200",
  },
  UNDER_MAINTENANCE: {
    label: "Em manutenção",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${config.dot} animate-pulse`}
      />
      {config.label}
    </span>
  );
}

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className="absolute top-0 left-0 h-full w-1 rounded-l-xl"
        style={{ backgroundColor: accent }}
      />

      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-3xl font-bold text-[#062A45]">{value}</p>
      </div>
    </div>
  );
}

function ConfirmModal({ vehicle, isLoading, onConfirm, onCancel }) {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-100 bg-white p-5 shadow-2xl sm:p-8">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Ban className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#062A45]">
              Inativar Veículo
            </h3>
            <p className="mt-3 text-base text-slate-600">
              Deseja realmente inativar o veículo{" "}
              <span className="font-semibold text-[#062A45]">
                {vehicle.prefix}
              </span>{" "}
              com placa{" "}
              <span className="font-semibold text-[#062A45]">
                {vehicle.licensePlate}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-slate-500">
              O veículo não será excluído da base, apenas seu status será
              alterado para inativo.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 w-full flex-1 cursor-pointer rounded-lg text-sm font-semibold md:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-12 w-full flex-1 cursor-pointer rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 md:w-auto"
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
    "Data Vistoria",
    "Ações",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062A45]">Frota</h1>
        </div>
        <Button
          onClick={() => navigate("/frota/cadastro")}
          className="h-11 w-full gap-2 rounded-lg bg-[#062A45] px-6 font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0a1f35] hover:shadow-md md:w-auto"
        >
          <Plus className="h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      {!isLoading && !error && vehicles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Veículos Ativos"
            value={stats.active}
            accent="#10b981"
          />
          <SummaryCard
            label="Em Manutenção"
            value={stats.maintenance}
            accent="#f59e0b"
          />
          <SummaryCard
            label="Taxa Operacional"
            value={`${stats.operationalRate}%`}
            accent="#3b82f6"
          />
        </div>
      )}

      <div className="relative flex flex-col min-h-[480px] rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 rounded-t-xl border-b border-slate-100 bg-slate-50/60 px-4 py-4 md:flex-row md:items-center md:justify-between sm:px-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#062A45]">
              Listagem de Veículos
            </h2>
            {!isLoading && !error && (
              <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {filteredVehicles.length}
              </span>
            )}
          </div>

          {!isLoading && !error && vehicles.length > 0 && (
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="search-frota"
                  placeholder="Buscar prefixo, placa ou modelo..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 h-9 bg-white border-slate-200 text-xs shadow-none focus-visible:border-[#062A45] focus-visible:ring-[#062A45]/20 rounded-lg"
                />
              </div>

              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setFilterOpen((prev) => !prev)}
                  title="Filtrar veículos"
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    activeFilterCount > 0
                      ? "border-[#062A45] bg-[#062A45]/5 text-[#062A45]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filtros</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#062A45] text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                      <span className="text-xs font-bold text-[#062A45] uppercase tracking-wider">
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
                          className="text-[11px] font-medium text-red-500 hover:underline cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Status
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { value: "ALL", label: "Todos" },
                            { value: "ACTIVE", label: "Ativo" },
                            {
                              value: "UNDER_MAINTENANCE",
                              label: "Em manutenção",
                            },
                            { value: "INACTIVE", label: "Inativo" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setStatusFilter(opt.value);
                                setCurrentPage(1);
                              }}
                              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                                statusFilter === opt.value
                                  ? "bg-[#062A45] text-white font-semibold shadow-xs"
                                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Marca
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setModelFilter("ALL");
                              setCurrentPage(1);
                            }}
                            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                              modelFilter === "ALL"
                                ? "bg-[#062A45] text-white font-semibold shadow-xs"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            Todas
                          </button>
                          {modelOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setModelFilter(opt.value);
                                setCurrentPage(1);
                              }}
                              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                                modelFilter === opt.value
                                  ? "bg-[#062A45] text-white font-semibold shadow-xs"
                                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isLoading && <LoadingIndicator label="Carregando veículos..." />}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <p className="mt-1 text-xs text-red-400">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchVehicles}
              className="mt-1 gap-2 rounded-lg cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !error && vehicles.length === 0 && <EmptyState icon={Truck} title={"Nenhum veículo cadastrado ainda"} description={"Cadastre o primeiro veículo para começar."} action={<Button onClick={() => navigate("/frota/cadastro")}><Plus className={"mr-2 size-4"}/>Cadastrar veículo</Button>} />}

        {!isLoading && !error && vehicles.length > 0 && filteredVehicles.length === 0 && <EmptyState title={"Nenhum veículo encontrado"} description={"Nenhum veículo corresponde aos filtros selecionados."} action={<Button variant={"outline"} onClick={clearFilters}><RotateCcw className={"mr-2 size-4"}/>Limpar filtros</Button>} />}

        {!isLoading && !error && filteredVehicles.length > 0 && (
          <div className="hidden flex-1 overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className={`py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 ${
                        col === "Ações" ? "px-5 pl-7" : "px-5"
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {paginatedVehicles.map((vehicle, idx) => (
                  <tr
                    key={vehicle.id}
                    className={`transition-colors duration-150 hover:bg-blue-50/30 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="font-bold text-[#062A45]">
                        {vehicle.prefix}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 tracking-wider uppercase">
                        {vehicle.licensePlate}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {FrotaService.getLabel("models", vehicle.model)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {vehicle.year}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      <span className="font-semibold text-[#062A45]">
                        {vehicle.seats}
                      </span>{" "}
                      <span className="text-slate-400">lugares</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <StatusBadge status={vehicle.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                      {formatDate(vehicle.inspectionDate)}
                    </td>
                    <td className="whitespace-nowrap px-5 pl-7 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/frota/editar/${vehicle.id}`)
                          }
                          title="Editar veículo"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45] cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setConfirmVehicle(vehicle)}
                          disabled={vehicle.status === "INACTIVE"}
                          title={
                            vehicle.status === "INACTIVE"
                              ? "Veículo já está inativo"
                              : "Inativar veículo"
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-500"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && filteredVehicles.length > 0 && <div className="space-y-3 p-4 md:hidden">{paginatedVehicles.map((vehicle) => <article key={vehicle.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold text-[#062A45]">{vehicle.prefix}</h3><p className="text-sm text-slate-600">{vehicle.licensePlate}</p></div><StatusBadge status={vehicle.status} /></div><dl className="mt-3 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-xs text-slate-500">Modelo</dt><dd>{FrotaService.getLabel("models", vehicle.model)}</dd></div><div><dt className="text-xs text-slate-500">Ano</dt><dd>{vehicle.year}</dd></div><div><dt className="text-xs text-slate-500">Capacidade</dt><dd>{vehicle.seats} lugares</dd></div><div><dt className="text-xs text-slate-500">Vistoria</dt><dd>{formatDate(vehicle.inspectionDate)}</dd></div></dl><div className="mt-3 flex items-center gap-1"><button type="button" title="Editar veículo" aria-label="Editar veículo" onClick={() => navigate("/frota/editar/" + vehicle.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45]"><Pencil className="h-4 w-4" /></button><button type="button" title="Inativar veículo" aria-label="Inativar veículo" disabled={vehicle.status === "INACTIVE"} onClick={() => setConfirmVehicle(vehicle)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"><Ban className="h-4 w-4" /></button></div></article>)}</div>}

        {!isLoading && !error && filteredVehicles.length > 0 && (
          <div className="mt-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVehicles.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="veículo"
            />
          </div>
        )}
      </div>

      <ConfirmModal
        vehicle={confirmVehicle}
        isLoading={isInactivating}
        onConfirm={handleInactivate}
        onCancel={() => setConfirmVehicle(null)}
      />
    </div>
  );
}
