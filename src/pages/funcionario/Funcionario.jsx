import { Ban, Loader2, Pencil, Plus, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import FuncionarioService from "../../services/FuncionarioService";

function AccessBadge({ isUser }) {
  const hasAccess = isUser === true;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        hasAccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          hasAccess ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {hasAccess ? "Acesso ao sistema" : "Operacional"}
    </span>
  );
}

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
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function ConfirmInactivateModal({
  colaborador,
  isLoading,
  onConfirm,
  onCancel,
}) {
  if (!colaborador) return null;

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
              Inativar Colaborador
            </h3>
            <p className="mt-3 text-base text-slate-600">
              Deseja realmente inativar o colaborador{" "}
              <span className="font-semibold text-[#062A45]">
                {colaborador.name}
              </span>
              ?
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

function ConfirmActivateModal({ colaborador, isLoading, onConfirm, onCancel }) {
  if (!colaborador) return null;

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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <RotateCcw className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#062A45]">
              Reativar Colaborador
            </h3>
            <p className="mt-3 text-base text-slate-600">
              Deseja realmente reativar o colaborador{" "}
              <span className="font-semibold text-[#062A45]">
                {colaborador.name}
              </span>
              ?
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
            className="flex-1 rounded-lg h-12 bg-emerald-600 text-sm text-white hover:bg-emerald-700 cursor-pointer font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reativando...
              </>
            ) : (
              "Confirmar Reativação"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Funcionarios() {
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmFuncionario, setConfirmFuncionario] = useState(null);
  const [confirmActivationFuncionario, setConfirmActivationFuncionario] =
    useState(null);
  const [isInactivating, setIsInactivating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const fetchFuncionarios = async () => {
    try {
      const response = await FuncionarioService.getAll();
      setFuncionarios(response);
    } catch (error) {
      toast.error("Erro ao carregar colaborador", {
        id: "erro-fetch-funcionarios",
        description:
          error.response?.data?.message ||
          "Não foi possível carregar os colaboradores. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      await fetchFuncionarios();
    };

    carregarDados();
  }, []);

  const funcionariosFiltrados = funcionarios.filter((func) =>
    (func.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleInativar = async () => {
    if (!confirmFuncionario) return;

    setIsInactivating(true);

    try {
      await FuncionarioService.inativar(confirmFuncionario.id);
      toast.success("Colaborador inativado com sucesso!");
      setIsLoading(true);
      await fetchFuncionarios();
    } catch (error) {
      toast.error("Erro ao inativar", {
        id: "erro-inativar",
        description:
          error.response?.data?.message ||
          "Ocorreu um problema ao tentar inativar o colaborador.",
      });
    } finally {
      setIsInactivating(false);
      setConfirmFuncionario(null);
    }
  };

  const handleAtivar = async () => {
    if (!confirmActivationFuncionario) return;

    setIsActivating(true);

    try {
      await FuncionarioService.ativar(confirmActivationFuncionario.id);
      toast.success("Colaborador reativado com sucesso!");
      setIsLoading(true);
      await fetchFuncionarios();
    } catch (error) {
      toast.error("Erro ao reativar", {
        id: "erro-ativar",
        description:
          error.response?.data?.message ||
          "Ocorreu um problema ao tentar reativar o colaborador.",
      });
    } finally {
      setIsActivating(false);
      setConfirmActivationFuncionario(null);
    }
  };

  const columns = [
    "Nome",
    "Telefone",
    "Função",
    "Acesso",
    "Status",
    "CNH",
    "Tipo de CNH",
    "Ações",
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062A45]">Colaboradores</h1>
        </div>
        <Button
          onClick={() => navigate("/funcionario/cadastro")}
          className="gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg h-11 px-6 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <Plus className="h-4 w-4" /> Novo Colaborador
        </Button>
      </div>

      <div className="relative flex flex-col min-h-[480px] rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#062A45]">
              Listagem de Colaboradores
            </h2>

            {!isLoading && (
              <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {funcionariosFiltrados.length}
              </span>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              className="w-full pl-9 h-9 bg-white border border-slate-200 text-xs shadow-none focus:border-[#062A45] focus:ring-1 focus:ring-[#062A45]/20 rounded-lg outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700">
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
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="size-6 animate-spin text-[#062A45]" />
                      <p>Carregando colaboradores...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && funcionariosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {searchTerm !== ""
                      ? "Nenhum colaborador encontrado com essa busca."
                      : "Nenhum colaborador cadastrado ainda."}
                  </td>
                </tr>
              )}
              {!isLoading &&
                funcionariosFiltrados.map((func, idx) => {
                  const isMotorista =
                    func.position === "DRIVER" ||
                    (func.position || "").toLowerCase() === "motorista";
                  const isInactive = func.status === "INACTIVE";

                  return (
                    <tr
                      key={func.id}
                      className={`transition-colors duration-150 hover:bg-blue-50/30 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-bold text-[#062A45]">
                          {func.name}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                        {func.cellphoneNumber}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                        {FuncionarioService.getLabel(
                          "positions",
                          func.position,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5">
                        <AccessBadge isUser={func.isUser} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5">
                        <StatusBadge status={func.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                        {isMotorista && func.cnhNumber ? func.cnhNumber : "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                        {isMotorista && func.cnhType ? func.cnhType : "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 pl-7 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              navigate(`/funcionario/editar/${func.id}`)
                            }
                            title="Editar"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45] cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              isInactive
                                ? setConfirmActivationFuncionario(func)
                                : setConfirmFuncionario(func)
                            }
                            title={isInactive ? "Reativar" : "Inativar"}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
                              isInactive
                                ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                : "text-red-500 hover:bg-red-50 hover:text-red-600"
                            }`}
                          >
                            {isInactive ? (
                              <RotateCcw className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmInactivateModal
        colaborador={confirmFuncionario}
        isLoading={isInactivating}
        onConfirm={handleInativar}
        onCancel={() => setConfirmFuncionario(null)}
      />
      <ConfirmActivateModal
        colaborador={confirmActivationFuncionario}
        isLoading={isActivating}
        onConfirm={handleAtivar}
        onCancel={() => setConfirmActivationFuncionario(null)}
      />
    </div>
  );
}
