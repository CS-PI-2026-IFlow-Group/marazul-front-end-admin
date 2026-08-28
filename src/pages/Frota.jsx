import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Ban,
  Loader2,
  Truck,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import Pagination from "../components/Pagination";
import FrotaService from "../services/FrotaService";

// ─── Mapeamento de status ───────────────────────────────────────────
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

// ─── Formatar data ISO → dd/MM/yyyy ─────────────────────────────────
function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

// ─── Card de resumo ─────────────────────────────────────────────────
function SummaryCard({ label, value, accent }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Faixa lateral colorida */}
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

// ─── Modal de confirmação ───────────────────────────────────────────
function ConfirmModal({ vehicle, isLoading, onConfirm, onCancel }) {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl mx-4 border border-slate-100">
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

        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg h-12 text-sm cursor-pointer font-semibold"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg h-12 bg-red-600 text-sm text-white hover:bg-red-700 cursor-pointer font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inativando...
              </>
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

// ─── Componente principal ───────────────────────────────────────────
export default function Frota() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
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

  // Fecha o popover de filtros ao clicar fora
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

  // ─── Buscar dados da API ──────────────────────────────────────────
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
    fetchVehicles();
  }, []);

  // ─── Métricas dos cards ───────────────────────────────────────────
  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter((v) => v.status === "ACTIVE").length;
    const maintenance = vehicles.filter((v) => v.status === "UNDER_MAINTENANCE").length;
    const operationalRate = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, maintenance, operationalRate };
  }, [vehicles]);

  // ─── Filtragem combinada (busca + status + modelo) ────────────────
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

  // Reseta para a página 1 ao alterar qualquer filtro ou busca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, modelFilter]);

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE) || 1;

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVehicles, currentPage]);

  const activeFilterCount =
    (statusFilter !== "ALL" ? 1 : 0) + (modelFilter !== "ALL" ? 1 : 0);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) || activeFilterCount > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setModelFilter("ALL");
    setCurrentPage(1);
  };

  // ─── Inativação ───────────────────────────────────────────────────
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

  // ─── Colunas ──────────────────────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#062A45] pb-1 border-b-[3.5px] border-[#e31e24] inline-block">
            Frota
          </h1>
        </div>
        <Button
          onClick={() => navigate("/frota/cadastro")}
          className="gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg h-11 px-6 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <Plus className="h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      {/* ── Cards de resumo ─────────────────────────────────────────── */}
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

      {/* ── Card principal (busca + tabela) ─────────────────────────── */}
      <div className="relative flex flex-col min-h-[480px] rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Barra superior com título, busca e botão de filtro */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between rounded-t-xl">
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
            <div className="flex items-center gap-2">
              {/* Campo de Busca */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="search-frota"
                  placeholder="Buscar prefixo, placa ou modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-white border-slate-200 text-xs shadow-none focus-visible:border-[#062A45] focus-visible:ring-[#062A45]/20 rounded-lg"
                />
              </div>

              {/* Botão de Filtros com Ícone */}
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

                {/* Popover flutuante de filtros */}
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
                          }}
                          className="text-[11px] font-medium text-red-500 hover:underline cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      {/* Status */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Status
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { value: "ALL", label: "Todos" },
                            { value: "ACTIVE", label: "Ativo" },
                            { value: "UNDER_MAINTENANCE", label: "Em manutenção" },
                            { value: "INACTIVE", label: "Inativo" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setStatusFilter(opt.value)}
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

                      {/* Marca */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Marca
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { value: "ALL", label: "Todas" },
                            { value: "MARCOPOLO", label: "Marcopolo" },
                            { value: "COMIL", label: "Comil" },
                            { value: "BUSSCAR", label: "Busscar" },
                            { value: "IRIZAR_BRASIL", label: "Irizar" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setModelFilter(opt.value)}
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

        {/* ── Loading ─────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-slate-100" />
              <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-[#062A45]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Carregando veículos...
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Buscando dados da frota
              </p>
            </div>
          </div>
        )}

        {/* ── Erro ────────────────────────────────────────────────── */}
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

        {/* ── Lista vazia ─────────────────────────────────────────── */}
        {!isLoading && !error && vehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Truck className="h-8 w-8 text-slate-300" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-sm font-semibold text-slate-700">
                Nenhum veículo cadastrado ainda
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Cadastre o primeiro veículo para começar a gerenciar sua frota.
              </p>
            </div>
            <Button
              onClick={() => navigate("/frota/cadastro")}
              className="mt-1 gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg"
            >
              <Plus className="h-4 w-4" /> Cadastrar Veículo
            </Button>
          </div>
        )}

        {/* ── Busca / Filtro sem resultado ───────────────────────── */}
        {!isLoading &&
          !error &&
          vehicles.length > 0 &&
          filteredVehicles.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
              <Search className="h-10 w-10 text-slate-200" />
              <div className="text-center">
                <p className="text-base font-semibold text-[#062A45]">
                  Não há nada a ser exibido
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {hasActiveFilters
                    ? "Nenhum veículo corresponde aos filtros selecionados."
                    : "Nenhum resultado encontrado."}
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2 gap-1.5 text-xs rounded-lg cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Limpar filtros
                </Button>
              )}
            </div>
          )}

        {/* ── Tabela ──────────────────────────────────────────────── */}
        {!isLoading && !error && filteredVehicles.length > 0 && (
          <div className="flex-1 overflow-x-auto">
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

        {/* Paginação fixada na base do card */}
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

      {/* Modal de confirmação */}
      <ConfirmModal
        vehicle={confirmVehicle}
        isLoading={isInactivating}
        onConfirm={handleInactivate}
        onCancel={() => setConfirmVehicle(null)}
      />
    </div>
  );
}
