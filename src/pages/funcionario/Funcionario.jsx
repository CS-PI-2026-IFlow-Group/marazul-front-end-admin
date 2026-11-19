import { Ban, Pencil, Plus, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingIndicator from "../../components/LoadingIndicator";
import EmptyState from "../../components/EmptyState";
import { Button } from "../../components/ui/button";
import FuncionarioService from "../../services/FuncionarioService";
import { usePageTitle } from "../../hooks/usePageTitle";

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

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 w-full flex-1 rounded-lg text-sm cursor-pointer font-semibold md:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-12 w-full flex-1 bg-red-600 text-sm text-white hover:bg-red-700 cursor-pointer font-semibold md:w-auto"
          >
            {isLoading ? (
              <>
                <LoadingIndicator variant="button" label="Inativando..." />
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

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 w-full flex-1 rounded-lg text-sm cursor-pointer font-semibold md:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-12 w-full flex-1 bg-emerald-600 text-sm text-white hover:bg-emerald-700 cursor-pointer font-semibold md:w-auto"
          >
            {isLoading ? (
              <>
                <LoadingIndicator variant="button" label="Reativando..." />
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
  usePageTitle("Colaboradores");
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmFuncionario, setConfirmFuncionario] = useState(null);
  const [confirmActivationFuncionario, setConfirmActivationFuncionario] =
    useState(null);
  const [isInactivating, setIsInactivating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const fetchFuncionarios = async () => {
    setError(null);
    try {
      const response = await FuncionarioService.getAll();
      setFuncionarios(response);
    } catch (error) {
      setError("Não foi possível carregar a lista de colaboradores.");
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

  const retry = () => {
    setIsLoading(true);
    fetchFuncionarios();
  };

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062A45]">Colaboradores</h1>
        </div>
        <Button
          onClick={() => navigate("/funcionario/cadastro")}
          className="h-11 w-full gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg px-6 shadow-sm transition-all duration-200 hover:shadow-md md:w-auto"
        >
          <Plus className="h-4 w-4" /> Novo Colaborador
        </Button>
      </div>

      <div className="relative flex flex-col min-h-[480px] rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-4 md:flex-row md:items-center md:justify-between rounded-t-xl sm:px-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#062A45]">
              Listagem de Colaboradores
            </h2>

            {!isLoading && !error && (
              <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {funcionariosFiltrados.length}
              </span>
            )}
          </div>

          <div className="relative w-full md:w-64">
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

        <div className={error ? "hidden" : "hidden overflow-x-auto md:block"}>
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
                      <LoadingIndicator label="Carregando colaboradores..." className="py-6" />
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
                    <EmptyState
                      className="py-6"
                      title={funcionarios.length > 0 && searchTerm.trim() ? "Nenhum colaborador encontrado" : "Nenhum colaborador cadastrado ainda"}
                      description={funcionarios.length > 0 && searchTerm.trim() ? "Tente ajustar ou limpar a busca." : "Cadastre o primeiro colaborador."}
                      action={funcionarios.length > 0 && searchTerm.trim() ? <Button variant="outline" onClick={() => setSearchTerm("")}>Limpar busca</Button> : <Button onClick={() => navigate("/funcionario/cadastro")}>Cadastrar colaborador</Button>}
                    />
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
        {!isLoading && error && <div className="hidden flex-col items-center gap-3 py-10 text-center md:flex" role="alert"><p className="text-sm text-red-700">{error}</p><Button variant="outline" onClick={retry}>Tentar novamente</Button></div>}
        <div className="space-y-3 p-4 md:hidden">{isLoading && <LoadingIndicator label="Carregando colaboradores..."/>}{!isLoading && error && <div className="py-8 text-center" role="alert"><p className="mb-3 text-sm text-red-700">{error}</p><Button variant="outline" onClick={retry}>Tentar novamente</Button></div>}{!isLoading && !error && funcionariosFiltrados.length === 0 && <EmptyState title={funcionarios.length > 0 && searchTerm.trim() ? "Nenhum colaborador encontrado" : "Nenhum colaborador cadastrado ainda"} description={funcionarios.length > 0 && searchTerm.trim() ? "Tente ajustar ou limpar a busca." : "Cadastre o primeiro colaborador."} action={funcionarios.length > 0 && searchTerm.trim() ? <Button variant="outline" onClick={() => setSearchTerm("")}>Limpar busca</Button> : <Button onClick={() => navigate("/funcionario/cadastro")}>Cadastrar colaborador</Button>} />}{!isLoading && !error && funcionariosFiltrados.map((func) => { const isDriver = func.position === "DRIVER" || (func.position || "").toLowerCase() === "motorista"; const inactive = func.status === "INACTIVE"; return <article key={func.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="break-words font-bold text-[#062A45]">{func.name}</h3><p className="text-sm text-slate-600">{func.cellphoneNumber}</p></div><StatusBadge status={func.status}/></div><p className="mt-2 text-sm">{FuncionarioService.getLabel("positions", func.position)}</p><div className="mt-2 flex flex-wrap gap-2"><AccessBadge isUser={func.isUser}/>{isDriver && func.cnhNumber && <span className="text-xs text-slate-600">CNH {func.cnhNumber} · {func.cnhType}</span>}</div><div className="mt-3 flex items-center gap-1"><button type="button" title="Editar colaborador" aria-label="Editar colaborador" onClick={() => navigate("/funcionario/editar/" + func.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45]"><Pencil className="h-4 w-4" /></button><button type="button" title={inactive ? "Reativar colaborador" : "Inativar colaborador"} aria-label={inactive ? "Reativar colaborador" : "Inativar colaborador"} onClick={() => inactive ? setConfirmActivationFuncionario(func) : setConfirmFuncionario(func)} className={inactive ? "inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700" : "inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600"}>{inactive ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}</button></div></article>; })}</div>
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
