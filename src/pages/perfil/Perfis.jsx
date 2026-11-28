import { Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ListCard from "../../components/ListCard";
import LoadingIndicator from "../../components/LoadingIndicator";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import RowActions from "../../components/RowActions";
import { Button } from "../../components/ui/button";
import PerfilService from "../../services/PerfilService";
import { usePageTitle } from "../../hooks/usePageTitle";

const ITEMS_PER_PAGE = 8;

function getPermissionCount(profile) {
  return Array.isArray(profile.permissions) ? profile.permissions.length : 0;
}

function ConfirmDeleteModal({ profile, isLoading, onConfirm, onCancel }) {
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Fechar confirmação"
        onClick={onCancel}
        disabled={isLoading}
        className="absolute inset-0 cursor-pointer bg-foreground/40 backdrop-blur-sm disabled:cursor-not-allowed"
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Fechar confirmação"
          className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="size-5" />
        </button>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="size-8" />
          </div>
          <div>
            <h2
              id="confirm-delete-title"
              className="font-display text-xl font-bold text-foreground"
            >
              Excluir perfil
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente excluir o perfil{" "}
              <span className="font-semibold text-foreground">
                {profile.name ?? profile.nome}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta ação não poderá ser desfeita.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 w-full flex-1 font-semibold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-11 w-full flex-1"
          >
            {isLoading ? (
              <LoadingIndicator variant="button" label="Excluindo..." />
            ) : (
              "Confirmar exclusão"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function Perfis() {
  usePageTitle("Perfis de Acesso");
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    PerfilService.getAll()
      .then((data) => {
        if (active) setProfiles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar a lista de perfis.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const filteredProfiles = useMemo(
    () =>
      profiles.filter((profile) =>
        String(profile.name ?? profile.nome ?? "")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch),
      ),
    [profiles, normalizedSearch],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE),
  );
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedProfiles = useMemo(() => {
    const startIndex = (displayedPage - 1) * ITEMS_PER_PAGE;
    return filteredProfiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProfiles, displayedPage]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  };

  const handleDelete = async () => {
    if (!profileToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await PerfilService.delete(profileToDelete.id);
      setProfiles((current) =>
        current.filter((profile) => profile.id !== profileToDelete.id),
      );
      const remainingProfiles = filteredProfiles.length - 1;
      const remainingPages = Math.max(
        1,
        Math.ceil(remainingProfiles / ITEMS_PER_PAGE),
      );
      setCurrentPage((page) => Math.min(page, remainingPages));
      toast.success("Perfil excluído com sucesso!");
    } catch (requestError) {
      const status = requestError.response?.status;
      const data = requestError.response?.data;

      if (status === 400) {
        toast.error(
          data?.message || data?.erro || "Não foi possível excluir este perfil.",
        );
      } else if (status === 404) {
        toast.warning("Perfil não encontrado", {
          description: "O perfil já foi removido. A listagem foi atualizada.",
        });
        handleRetry();
      } else {
        toast.error("Erro ao excluir perfil", {
          description: "Ocorreu um problema. Tente novamente.",
        });
      }
    } finally {
      setIsDeleting(false);
      setProfileToDelete(null);
    }
  };

  const columns = ["Nome do perfil", "Permissões", ""];
  const maxPermissionCount = Math.max(1, ...profiles.map(getPermissionCount));
  const showList = !isLoading && !error && filteredProfiles.length > 0;

  const renderActions = (profile, name, isSystemProfile) => (
    <RowActions>
      <button
        type="button"
        onClick={() => navigate(`/perfis/editar/${profile.id}`)}
        title="Editar perfil"
        aria-label={`Editar perfil ${name}`}
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setProfileToDelete(profile)}
        disabled={isSystemProfile}
        title={
          isSystemProfile
            ? "O perfil padrão não pode ser excluído"
            : "Excluir perfil"
        }
        aria-label={`Excluir perfil ${name}`}
      >
        <Trash2 className="size-4" />
      </button>
    </RowActions>
  );

  return (
    <div>
      <PageHeader
        title="Perfis de acesso"
        action={
          <Button type="button" onClick={() => navigate("/perfis/cadastro")}>
            <Plus /> Novo perfil
          </Button>
        }
      />

      <ListCard
        title="Listagem de perfis"
        count={!isLoading && !error ? filteredProfiles.length : undefined}
        search={
          !isLoading && !error && profiles.length > 0
            ? {
                id: "search-perfis",
                label: "Buscar perfis pelo nome",
                placeholder: "Buscar perfil...",
                value: searchTerm,
                onChange: (event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                },
              }
            : null
        }
      >
        {isLoading && <LoadingIndicator label="Carregando perfis..." />}

        {!isLoading && error && (
          <ErrorState message={error} onRetry={handleRetry} />
        )}

        {!isLoading && !error && profiles.length === 0 && (
          <EmptyState
            icon={ShieldCheck}
            title="Nenhum perfil cadastrado ainda"
            description="Cadastre o primeiro perfil de acesso para organizar as permissões."
            action={
              <Button
                type="button"
                onClick={() => navigate("/perfis/cadastro")}
              >
                <Plus /> Novo perfil
              </Button>
            }
          />
        )}

        {!isLoading &&
          !error &&
          profiles.length > 0 &&
          filteredProfiles.length === 0 && (
            <EmptyState
              title="Nenhum perfil encontrado"
              description="Tente ajustar ou limpar a busca."
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                >
                  Limpar busca
                </Button>
              }
            />
          )}

        {showList && (
          <>
            <DataTable head={columns} className="hidden md:block">
              {paginatedProfiles.map((profile) => {
                const name = profile.name ?? profile.nome ?? "Perfil sem nome";
                const permissionCount = getPermissionCount(profile);
                const isSystemProfile =
                  name.toLocaleLowerCase("pt-BR") === "administrador";

                return (
                  <tr key={profile.id}>
                    <td>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <ShieldCheck className="size-4 text-accent" />
                        <span className="font-medium text-foreground">
                          {name}
                        </span>
                        {isSystemProfile && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primary">
                            Padrão do sistema
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(permissionCount / maxPermissionCount) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {permissionCount}
                          </span>{" "}
                          {permissionCount === 1 ? "permissão" : "permissões"}
                        </span>
                      </div>
                    </td>
                    <td>{renderActions(profile, name, isSystemProfile)}</td>
                  </tr>
                );
              })}
            </DataTable>

            <div className="space-y-3 p-4 md:hidden">
              {paginatedProfiles.map((profile) => {
                const name = profile.name ?? profile.nome ?? "Perfil sem nome";
                const permissionCount = getPermissionCount(profile);
                const isSystemProfile =
                  name.toLocaleLowerCase("pt-BR") === "administrador";

                return (
                  <article key={profile.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <ShieldCheck className="size-4 text-accent" />
                      <h3 className="font-medium break-words text-foreground">
                        {name}
                      </h3>
                      {isSystemProfile && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Padrão do sistema
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {permissionCount}
                      </span>{" "}
                      {permissionCount === 1 ? "permissão" : "permissões"}
                    </p>
                    <div className="mt-3">
                      {renderActions(profile, name, isSystemProfile)}
                    </div>
                  </article>
                );
              })}
            </div>

            <Pagination
              currentPage={displayedPage}
              totalPages={totalPages}
              totalItems={filteredProfiles.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="perfil"
              itemNamePlural="perfis"
            />
          </>
        )}
      </ListCard>

      <ConfirmDeleteModal
        profile={profileToDelete}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setProfileToDelete(null);
        }}
      />
    </div>
  );
}
