import { Ban, Pencil, Plus, RotateCcw, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../../components/Badge";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ListCard from "../../components/ListCard";
import LoadingIndicator from "../../components/LoadingIndicator";
import PageHeader from "../../components/PageHeader";
import RowActions from "../../components/RowActions";
import { Button } from "../../components/ui/button";
import FuncionarioService from "../../services/FuncionarioService";
import { usePageTitle } from "../../hooks/usePageTitle";

function AccessBadge({ isUser }) {
  const hasAccess = isUser === true;

  return (
    <Badge tone={hasAccess ? "success" : "neutral"}>
      {hasAccess ? "Acesso ao sistema" : "Operacional"}
    </Badge>
  );
}

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Ativo",
    tone: "success",
  },
  INACTIVE: {
    label: "Inativo",
    tone: "danger",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;

  return <Badge tone={config.tone}>{config.label}</Badge>;
}

function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ConfirmStatusModal({
  colaborador,
  isLoading,
  onConfirm,
  onCancel,
  icon: Icon,
  iconClassName,
  title,
  message,
  confirmLabel,
  loadingLabel,
  confirmVariant,
  confirmClassName,
}) {
  if (!colaborador) return null;

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
          <div
            className={`flex size-16 items-center justify-center rounded-2xl ${iconClassName}`}
          >
            <Icon className="size-8" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              {title}
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              {message}{" "}
              <span className="font-semibold text-foreground">
                {colaborador.name}
              </span>
              ?
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
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-11 w-full flex-1 ${confirmClassName ?? ""}`}
          >
            {isLoading ? (
              <LoadingIndicator variant="button" label={loadingLabel} />
            ) : (
              confirmLabel
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
    "",
  ];

  const isSearching = funcionarios.length > 0 && searchTerm.trim() !== "";

  const renderActions = (func) => {
    const isInactive = func.status === "INACTIVE";

    return (
      <RowActions>
        <button
          type="button"
          onClick={() => navigate(`/funcionario/editar/${func.id}`)}
          title="Editar"
          aria-label={`Editar colaborador ${func.name}`}
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            isInactive
              ? setConfirmActivationFuncionario(func)
              : setConfirmFuncionario(func)
          }
          title={isInactive ? "Reativar" : "Inativar"}
          aria-label={`${isInactive ? "Reativar" : "Inativar"} colaborador ${func.name}`}
        >
          {isInactive ? (
            <RotateCcw className="size-4" />
          ) : (
            <Ban className="size-4" />
          )}
        </button>
      </RowActions>
    );
  };

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        action={
          <Button onClick={() => navigate("/funcionario/cadastro")}>
            <Plus /> Novo colaborador
          </Button>
        }
      />

      <ListCard
        title="Colaboradores"
        count={!isLoading && !error ? funcionariosFiltrados.length : undefined}
        search={{
          id: "search-funcionarios",
          label: "Buscar colaborador pelo nome",
          placeholder: "Buscar colaborador...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
        }}
      >
        {isLoading && <LoadingIndicator label="Carregando colaboradores..." />}

        {!isLoading && error && <ErrorState message={error} onRetry={retry} />}

        {!isLoading && !error && funcionariosFiltrados.length === 0 && (
          <EmptyState
            icon={isSearching ? undefined : Users}
            title={
              isSearching
                ? "Nenhum colaborador encontrado"
                : "Nenhum colaborador cadastrado ainda."
            }
            description={
              isSearching
                ? "Tente ajustar ou limpar a busca."
                : "Cadastre o primeiro colaborador para começar a gerenciar a equipe."
            }
            action={
              isSearching ? (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Limpar busca
                </Button>
              ) : (
                <Button onClick={() => navigate("/funcionario/cadastro")}>
                  <Plus /> Novo colaborador
                </Button>
              )
            }
          />
        )}

        {!isLoading && !error && funcionariosFiltrados.length > 0 && (
          <>
            <DataTable head={columns} className="hidden md:block">
              {funcionariosFiltrados.map((func) => {
                const isMotorista =
                  func.position === "DRIVER" ||
                  (func.position || "").toLowerCase() === "motorista";

                return (
                  <tr key={func.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {getInitials(func.name)}
                        </div>
                        <span className="font-semibold text-foreground">
                          {func.name}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap text-muted-foreground">
                      {func.cellphoneNumber || "—"}
                    </td>

                    <td>
                      {FuncionarioService.getLabel("positions", func.position)}
                    </td>

                    <td className="whitespace-nowrap">
                      <AccessBadge isUser={func.isUser} />
                    </td>

                    <td className="whitespace-nowrap">
                      <StatusBadge status={func.status} />
                    </td>

                    <td className="text-muted-foreground">
                      {isMotorista && func.cnhNumber ? func.cnhNumber : "—"}
                    </td>

                    <td className="text-muted-foreground">
                      {isMotorista && func.cnhType ? func.cnhType : "—"}
                    </td>

                    <td>{renderActions(func)}</td>
                  </tr>
                );
              })}
            </DataTable>

            <div className="space-y-3 p-4 md:hidden">
              {funcionariosFiltrados.map((func) => {
                const isMotorista =
                  func.position === "DRIVER" ||
                  (func.position || "").toLowerCase() === "motorista";

                return (
                  <article key={func.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {getInitials(func.name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold break-words text-foreground">
                            {func.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {func.cellphoneNumber || "—"}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={func.status} />
                    </div>
                    <p className="mt-3 text-sm text-foreground">
                      {FuncionarioService.getLabel("positions", func.position)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <AccessBadge isUser={func.isUser} />
                      {isMotorista && func.cnhNumber && (
                        <span className="text-xs text-muted-foreground">
                          CNH {func.cnhNumber} · {func.cnhType}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">{renderActions(func)}</div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </ListCard>

      <ConfirmStatusModal
        colaborador={confirmFuncionario}
        isLoading={isInactivating}
        onConfirm={handleInativar}
        onCancel={() => setConfirmFuncionario(null)}
        icon={Ban}
        iconClassName="bg-destructive/10 text-destructive"
        title="Inativar Colaborador"
        message="Deseja realmente inativar o colaborador"
        confirmLabel="Confirmar Inativação"
        loadingLabel="Inativando..."
        confirmVariant="destructive"
      />
      <ConfirmStatusModal
        colaborador={confirmActivationFuncionario}
        isLoading={isActivating}
        onConfirm={handleAtivar}
        onCancel={() => setConfirmActivationFuncionario(null)}
        icon={RotateCcw}
        iconClassName="bg-success/12 text-success"
        title="Reativar Colaborador"
        message="Deseja realmente reativar o colaborador"
        confirmLabel="Confirmar Reativação"
        loadingLabel="Reativando..."
        confirmClassName="bg-success text-primary-foreground hover:bg-success/90"
      />
    </div>
  );
}
